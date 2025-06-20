import { useState, useEffect, useCallback, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useDebounce } from '../../../../../lib/hooks';
import { useRouter } from 'next/router';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { LoadingOverlay } from '../../../../../components/ui/loading';
import { useToast } from '../../../../../lib/hooks';
import { api } from '../../../../../lib/api';
import StreamPlayer from '../../../../../components/live-stream/stream-player';
import ProductShowcase from '../../../../../components/live-stream/product-showcase';
import StreamChat from '../../../../../components/live-stream/stream-chat';
import StreamReactions from '../../../../../components/live-stream/stream-reactions';
import StreamAnalytics from '../../../../../components/live-stream/stream-analytics';
import StreamAlerts from '../../../../../components/live-stream/stream-alerts';
import StreamSettings from '../../../../../components/live-stream/stream-settings';
import StreamModeration from '../../../../../components/live-stream/stream-moderation';
import ModerationLogs from '../../../../../components/live-stream/moderation-logs';
import ModerationTrends from '../../../../../components/live-stream/moderation-trends';
import ConfirmModal from '../../../../../components/live-stream/confirm-modal';

const TABS = [
  { id: 'stream', label: 'Stream', icon: 'fa-video' },
  { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
  { id: 'moderation', label: 'Moderation', icon: 'fa-shield-alt' },
  { id: 'settings', label: 'Settings', icon: 'fa-cog' }
];

const STATS_POLL_INTERVAL = 5000;

export default function StartLiveStreamPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const toast = useToast();

  // Stream state
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState(null);
  
  // User management state
  const [newBanUserId, setNewBanUserId] = useState('');
  const [timeoutDuration, setTimeoutDuration] = useState('5');
  const [timedOutUsers, setTimedOutUsers] = useState(new Map()); // userId -> timeout end time
  const [warnedUsers, setWarnedUsers] = useState(new Map()); // userId -> warning count
  const [moderationHistory, setModerationHistory] = useState([]); // Array of moderation actions
  const [moderationUndoStack, setModerationUndoStack] = useState([]); // For undo
  const [moderationRedoStack, setModerationRedoStack] = useState([]); // For redo
  const [userNotes, setUserNotes] = useState(new Map()); // userId -> notes
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionFilter, setActionFilter] = useState('all'); // all, warnings, bans, timeouts, notes
  const [userFilter, setUserFilter] = useState(''); // Filter by user ID
  const [timeFilter, setTimeFilter] = useState('all'); // all, hour, day
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set()); // For bulk actions
  // Template management state
  // Template version history
  const [templateHistory, setTemplateHistory] = useState(new Map());
  
  // Template suggestions state
  const [suggestedTemplate, setSuggestedTemplate] = useState(null);
  
  // Approval workflow states
  const [pendingTemplates, setPendingTemplates] = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  
  const [noteTemplates, setNoteTemplates] = useState([
    { 
      id: 'warning', 
      label: 'Warning', 
      text: 'User received a warning for inappropriate behavior.', 
      category: 'Warnings', 
      useCount: 0, 
      lastUsed: null,
      effectiveness: {
        successCount: 0,
        totalCount: 0,
        lastOutcome: null
      },
      archived: false,
      version: 1,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'approved',
      approvedBy: 'system',
      approvedAt: new Date().toISOString(),
      reviewNotes: ''
    },
    { 
      id: 'spam', 
      label: 'Spam', 
      text: 'User was warned for spamming messages.', 
      category: 'Warnings', 
      useCount: 0, 
      lastUsed: null,
      effectiveness: {
        successCount: 0,
        totalCount: 0,
        lastOutcome: null
      },
      archived: false
    },
    { 
      id: 'harassment', 
      label: 'Harassment', 
      text: 'User was warned for harassing other users.', 
      category: 'Warnings', 
      useCount: 0, 
      lastUsed: null,
      effectiveness: {
        successCount: 0,
        totalCount: 0,
        lastOutcome: null
      },
      archived: false
    },
    { 
      id: 'advertising', 
      label: 'Advertising', 
      text: 'User was warned for unauthorized advertising.', 
      category: 'Spam', 
      useCount: 0, 
      lastUsed: null,
      effectiveness: {
        successCount: 0,
        totalCount: 0,
        lastOutcome: null
      },
      archived: false
    },
    { 
      id: 'language', 
      label: 'Language', 
      text: 'User was warned for using inappropriate language.', 
      category: 'Content', 
      useCount: 0, 
      lastUsed: null,
      effectiveness: {
        successCount: 0,
        totalCount: 0,
        lastOutcome: null
      },
      archived: false
    }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ label: '', text: '', category: 'Warnings' });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionConfirm, setBulkActionConfirm] = useState({ show: false, type: null });
  const [userActivity, setUserActivity] = useState(new Map()); // userId -> { lastMessage, messageCount, joinTime }
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('stream');
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState(null);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Moderation state
  const [messageQueue, setMessageQueue] = useState([]);
  const [autoModEnabled, setAutoModEnabled] = useState(true);
  const [moderationKeywords, setModerationKeywords] = useState([]);
  const [bannedUsers, setBannedUsers] = useState(new Set());
  const [showModerationPanel, setShowModerationPanel] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      const hasEmoji = /\p{Extended_Pictographic}/u.test(chatMessage);
      const needsModeration = await debouncedMessageCheck(chatMessage);
      
      if (needsModeration) {
        setMessageQueue(prev => [...prev, {
          message: chatMessage,
          timestamp: new Date().toISOString(),
          hasEmoji
        }]);
        toast.addToast('Message queued for moderation', 'info');
        setStreamStats(prev => ({
          ...prev,
          moderatedMessages: prev.moderatedMessages + 1
        }));
      } else {
        await api.post(`/live-streams/${id}/chat`, {
          message: chatMessage,
          timestamp: new Date().toISOString(),
          hasEmoji
        });

        if (hasEmoji) {
          setStreamStats(prev => ({
            ...prev,
            emojiCount: prev.emojiCount + 1
          }));
        }
      }
      
      setChatMessage('');
      setShowEmojis(false);
      setIsTyping(false);
    } catch (err) {
      toast.addToast('Failed to send message', 'error');
    }
  };

  const handleMessageReaction = async (messageId, reaction) => {
    try {
      await api.post(`/live-streams/${id}/chat/${messageId}/reactions`, {
        reaction,
        timestamp: new Date().toISOString()
      });
      
      setStreamStats(prev => ({
        ...prev,
        reactionCount: prev.reactionCount + 1
      }));
    } catch (err) {
      toast.addToast('Failed to add reaction', 'error');
    }
  };

  const addModerationAction = (action) => {
    const newAction = {
      ...action,
      timestamp: new Date().toISOString(),
      previousState: {
        warnedUsers: new Map(warnedUsers),
        bannedUsers: new Set(bannedUsers),
        timedOutUsers: new Map(timedOutUsers),
        userNotes: new Map(userNotes)
      }
    };

    setModerationHistory(prev => [newAction, ...prev.slice(0, 99)]); // Keep last 100 actions
    setModerationUndoStack(prev => [newAction, ...prev]);
    setModerationRedoStack([]); // Clear redo stack on new action
  };

  const undoModerationAction = () => {
    const actionToUndo = moderationUndoStack[0];
    if (!actionToUndo) return;

    // Save current state for redo
    const redoAction = {
      ...actionToUndo,
      previousState: {
        warnedUsers: new Map(warnedUsers),
        bannedUsers: new Set(bannedUsers),
        timedOutUsers: new Map(timedOutUsers),
        userNotes: new Map(userNotes)
      }
    };

    // Restore previous state
    setWarnedUsers(actionToUndo.previousState.warnedUsers);
    setBannedUsers(actionToUndo.previousState.bannedUsers);
    setTimedOutUsers(actionToUndo.previousState.timedOutUsers);
    setUserNotes(actionToUndo.previousState.userNotes);

    // Update stacks
    setModerationUndoStack(prev => prev.slice(1));
    setModerationRedoStack(prev => [redoAction, ...prev]);

    toast.addToast(`Undid ${actionToUndo.type} action`, 'info');
  };

  const redoModerationAction = () => {
    const actionToRedo = moderationRedoStack[0];
    if (!actionToRedo) return;

    // Save current state for undo
    const undoAction = {
      ...actionToRedo,
      previousState: {
        warnedUsers: new Map(warnedUsers),
        bannedUsers: new Set(bannedUsers),
        timedOutUsers: new Map(timedOutUsers),
        userNotes: new Map(userNotes)
      }
    };

    // Restore redo state
    setWarnedUsers(actionToRedo.previousState.warnedUsers);
    setBannedUsers(actionToRedo.previousState.bannedUsers);
    setTimedOutUsers(actionToRedo.previousState.timedOutUsers);
    setUserNotes(actionToRedo.previousState.userNotes);

    // Update stacks
    setModerationRedoStack(prev => prev.slice(1));
    setModerationUndoStack(prev => [undoAction, ...prev]);

    toast.addToast(`Redid ${actionToRedo.type} action`, 'info');
  };

  // Add keyboard shortcuts for undo/redo and templates
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Undo/Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redoModerationAction();
        } else {
          undoModerationAction();
        }
        return;
      }

      // Template shortcuts (number keys 1-5)
      if (selectedUser && showNotesModal && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const templateIndex = parseInt(e.key) - 1;
        const template = noteTemplates[templateIndex];
        if (template) {
          const newNotes = new Map(userNotes);
          const currentNote = newNotes.get(selectedUser) || '';
          const newNote = currentNote 
            ? `${currentNote}\n\n${template.text}`
            : template.text;
          newNotes.set(selectedUser, newNote);
          setUserNotes(newNotes);
          addModerationAction({
            type: 'note',
            userId: selectedUser,
            note: template.text,
            template: template.id
          });
          toast.addToast(`Added "${template.label}" template (${e.key})`, 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    warnedUsers, 
    bannedUsers, 
    timedOutUsers, 
    userNotes, 
    moderationUndoStack, 
    moderationRedoStack,
    selectedUser,
    showNotesModal
  ]);

  const handleWarnUser = async (userId) => {
    if (!userId.trim()) return;

    try {
      await api.post(`/live-streams/${id}/warnings`, { userId });
      
      setWarnedUsers(prev => {
        const newMap = new Map(prev);
        const currentWarnings = (prev.get(userId) || 0) + 1;
        newMap.set(userId, currentWarnings);
        return newMap;
      });

      addModerationAction({
        type: 'warning',
        userId,
        warningCount: warnedUsers.get(userId) + 1 || 1
      });

      setNewBanUserId('');
      toast.addToast('User warned successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to warn user', 'error');
    }
  };

  const handleBanUser = async (userId) => {
    if (!userId.trim()) return;
    
    try {
      await api.post(`/live-streams/${id}/bans`, { userId });
      setBannedUsers(prev => new Set([...prev, userId]));
      setStreamStats(prev => ({
        ...prev,
        bannedUsers: prev.bannedUsers + 1
      }));
      setNewBanUserId('');
      addModerationAction({
        type: 'ban',
        userId
      });
      
      toast.addToast('User banned successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to ban user', 'error');
    }
  };

  const handleTimeoutUser = async (userId) => {
    if (!userId.trim()) return;
    
    const duration = parseInt(timeoutDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      toast.addToast('Invalid timeout duration', 'error');
      return;
    }

    try {
      const endTime = Date.now() + (duration * 60 * 1000);
      await api.post(`/live-streams/${id}/timeouts`, { 
        userId,
        duration: duration * 60 // Convert to seconds
      });
      
      setTimedOutUsers(prev => new Map(prev).set(userId, endTime));
      setNewBanUserId('');
      addModerationAction({
        type: 'timeout',
        userId,
        duration
      });
      
      toast.addToast(`User timed out for ${duration} minutes`, 'success');
    } catch (err) {
      toast.addToast('Failed to timeout user', 'error');
    }
  };

  // Cleanup expired timeouts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTimedOutUsers(prev => {
        const updated = new Map(prev);
        for (const [userId, endTime] of updated) {
          if (endTime <= now) {
            updated.delete(userId);
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleModerateMessage = async (messageId, action) => {
    try {
      await api.post(`/live-streams/${id}/chat/${messageId}/moderate`, { action });
      setMessageQueue(prev => prev.filter(msg => msg.id !== messageId));
      toast.addToast(`Message ${action === 'approve' ? 'approved' : 'rejected'}`, 'success');
    } catch (err) {
      toast.addToast('Failed to moderate message', 'error');
    }
  };

  const handleTyping = (e) => {
    setChatMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      api.post(`/live-streams/${id}/typing`, { isTyping: true });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      api.post(`/live-streams/${id}/typing`, { isTyping: false });
    }, 1000);
  };
  
  const [streamStats, setStreamStats] = useState({
    duration: '00:00:00',
    maxViewers: 0,
    chatMessages: 0,
    emojiCount: 0,
    reactionCount: 0,
    productViews: 0,
    moderatedMessages: 0,
    bannedUsers: 0
  });

  // Debounced message check
  const debouncedMessageCheck = useDebounce((message) => {
    if (!autoModEnabled) return false;
    return moderationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, 300);

  // Effects
  useEffect(() => {
    fetchStreamData();
    const statsInterval = setInterval(updateStreamStats, STATS_POLL_INTERVAL);
    
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1': setActiveTab('stream'); break;
          case '2': setActiveTab('analytics'); break;
          case '3': setActiveTab('moderation'); break;
          case '4': setActiveTab('settings'); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(statsInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [id]);

  // Save active tab to localStorage
  // Touch gesture handling
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) < swipeThreshold) return;
      
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      if (diff > 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(TABS[currentIndex - 1].id);
      } else if (diff < 0 && currentIndex < TABS.length - 1) {
        // Swipe left - next tab
        setActiveTab(TABS[currentIndex + 1].id);
      }
    };

    const element = document.getElementById('stream-content');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [activeTab]);

  // Tab persistence
  useEffect(() => {
    localStorage.setItem(`stream-${id}-tab`, activeTab);
  }, [activeTab, id]);

  useEffect(() => {
    const savedTab = localStorage.getItem(`stream-${id}-tab`);
    if (savedTab) setActiveTab(savedTab);
  }, [id]);

  const fetchStreamData = async () => {
    try {
      const response = await api.get(`/live-streams/${id}`);
      const streamData = response.data;

      if (streamData.status === 'ended') {
        toast.addToast('This stream has already ended', 'error');
        router.push('/dashboard/live-stream');
        return;
      }

      setStream(streamData);
      setIsLive(streamData.status === 'live');
      setViewerCount(streamData.viewer_count || 0);
    } catch (err) {
      toast.addToast('Failed to load stream data', 'error');
      router.push('/dashboard/live-stream');
    } finally {
      setLoading(false);
    }
  };

  const updateStreamStats = async () => {
    if (!isLive) return;

    try {
      const response = await api.get(`/live-streams/${id}/stats`);
      setStreamStats(response.data);
      setViewerCount(response.data.current_viewers || 0);
    } catch (err) {
      console.error('Failed to update stream stats:', err);
    }
  };

  const handleStartStream = async () => {
    try {
      setLoading(true);
      await api.put(`/live-streams/${id}/start`);
      setIsLive(true);
      toast.addToast('Stream started successfully', 'success');
    } catch (err) {
      toast.addToast('Failed to start stream', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    try {
      setIsEnding(true);
      await api.put(`/live-streams/${id}/end`);
      
      // Save final stats
      await api.post(`/live-streams/${id}/stats/final`, streamStats);
      
      toast.addToast('Stream ended successfully', 'success');
      router.push(`/dashboard/live-stream/summary/${id}`);
    } catch (err) {
      toast.addToast('Failed to end stream', 'error');
      setIsEnding(false);
      setIsEndModalOpen(false);
    }
  };

  const handleProductHighlight = async (product) => {
    try {
      setHighlightedProduct(product);
      await api.put(`/live-streams/${id}/highlight-product`, {
        product_id: product.id,
        timestamp: new Date().toISOString()
      });
      
      setStreamStats(prev => ({
        ...prev,
        productViews: prev.productViews + 1
      }));
      
      toast.addToast('Product highlighted successfully', 'success');
    } catch (err) {
      setHighlightedProduct(null);
      toast.addToast('Failed to highlight product', 'error');
    }
  };

  const handleNewMessage = useCallback((message) => {
    setStreamStats(prev => ({
      ...prev,
      chatMessages: prev.chatMessages + 1
    }));

    // Track user activity
    setUserActivity(prev => {
      const newActivity = new Map(prev);
      const currentActivity = newActivity.get(message.userId) || {
        messageCount: 0,
        joinTime: new Date().toISOString(),
        lastMessage: null
      };

      newActivity.set(message.userId, {
        ...currentActivity,
        messageCount: currentActivity.messageCount + 1,
        lastMessage: message.timestamp
      });

      return newActivity;
    });
  }, []);

  // Clean up inactive users (no messages in last 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      setUserActivity(prev => {
        const newActivity = new Map(prev);
        for (const [userId, activity] of newActivity) {
          if (activity.lastMessage && activity.lastMessage < fiveMinutesAgo) {
            newActivity.delete(userId);
          }
        }
        return newActivity;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const renderStreamTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="lg:col-span-3 space-y-4 lg:space-y-6">
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-base lg:text-lg font-medium text-gray-900">{stream.title}</h1>
                <p className="text-xs lg:text-sm text-gray-500">{stream.description}</p>
              </div>
              {!isLive ? (
                <Button onClick={handleStartStream} className="bg-red-600 hover:bg-red-700">
                  <i className="fas fa-broadcast-tower mr-2"></i>
                  Go Live
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setIsEndModalOpen(true)}
                  disabled={isEnding}
                >
                  {isEnding ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Ending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-stop-circle mr-2"></i>
                      End Stream
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="aspect-video">
            <StreamPlayer streamId={id} isHost={true} />
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <div className="text-center">
              <p className="text-xs lg:text-sm font-medium text-gray-500">Duration</p>
              <p className="mt-1 text-xl lg:text-2xl font-semibold text-gray-900">
                {streamStats.duration}
              </p>
            </div>
          </Card>
          <Card className="p-3 lg:p-4">
            <div className="text-center">
              <p className="text-xs lg:text-sm font-medium text-gray-500">Viewers</p>
              <p className="mt-1 text-xl lg:text-2xl font-semibold text-gray-900">
                {viewerCount}
                <span className="text-xs lg:text-sm text-gray-500 ml-1">
                  (Peak: {streamStats.maxViewers})
                </span>
              </p>
            </div>
          </Card>
          <Card className="p-3 lg:p-4">
            <div className="text-center">
              <p className="text-xs lg:text-sm font-medium text-gray-500">Chat Messages</p>
              <p className="mt-1 text-xl lg:text-2xl font-semibold text-gray-900">
                {streamStats.chatMessages}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <div className="relative h-[300px] lg:h-[400px]">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-white rounded-t-lg">
              <StreamChat
                streamId={id}
                isHost={true}
                isChatEnabled={stream.settings?.chat_enabled}
                onMessageReceived={handleNewMessage}
              />
            </div>
            <div className="p-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 flex-shrink-0"
                  onClick={() => setShowEmojis(prev => !prev)}
                >
                  <i className="fas fa-smile"></i>
                </Button>
                <div className="relative flex-1 group">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isTyping ? 'Typing...' : bannedUsers.has(stream.user_id) ? 'You are banned from chat' : 'Type a message...'}
                      className="w-full h-8 px-3 text-sm bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={chatMessage}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={bannedUsers.has(stream.user_id)}
                    />
                    {autoModEnabled && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        Auto-mod enabled
                      </span>
                    )}
                  </div>
                  {showEmojis && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setChatMessage(prev => prev + emojiData.emoji);
                          setShowEmojis(false);
                        }}
                        width={280}
                        height={400}
                      />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 flex-shrink-0"
                  onClick={handleSendMessage}
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <StreamReactions
          streamId={id}
          isHost={true}
          isEnabled={stream.settings?.reactions_enabled}
        />

        <StreamAlerts streamId={id} isHost={true} />

        {stream.settings?.product_showcase_enabled && (
          <ProductShowcase
            streamId={id}
            onProductSelect={handleProductHighlight}
            highlightedProduct={highlightedProduct}
          />
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (tabError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-circle text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-500 mb-4">{tabError}</p>
          <Button onClick={() => setTabError(null)}>Try Again</Button>
        </div>
      );
    }

    if (tabLoading) {
      return (
        <div className="p-6 text-center">
          <LoadingOverlay />
        </div>
      );
    }

    switch (activeTab) {
      case 'stream':
        return renderStreamTab();
      case 'analytics':
        return (
          <div className="space-y-6">
            <StreamAnalytics streamId={id} isHost={true} />
          </div>
        );
      case 'moderation':
        return (
          <div className="space-y-6">
            {/* Moderation Overview */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium">Moderation Overview</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={undoModerationAction}
                        disabled={moderationUndoStack.length === 0}
                        title="Undo (Ctrl+Z)"
                        className="text-gray-600 hover:text-gray-700 disabled:opacity-50"
                      >
                        <i className="fas fa-undo"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={redoModerationAction}
                        disabled={moderationRedoStack.length === 0}
                        title="Redo (Ctrl+Shift+Z)"
                        className="text-gray-600 hover:text-gray-700 disabled:opacity-50"
                      >
                        <i className="fas fa-redo"></i>
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="automod"
                        checked={autoModEnabled}
                        onChange={(e) => setAutoModEnabled(e.target.checked)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <label htmlFor="automod" className="ml-2 text-sm text-gray-700">
                        Auto-moderation
                      </label>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Messages Moderated</p>
                  <p className="mt-1 text-2xl font-semibold">{streamStats.moderatedMessages}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Users Banned</p>
                  <p className="mt-1 text-2xl font-semibold">{streamStats.bannedUsers}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Messages in Queue</p>
                  <p className="mt-1 text-2xl font-semibold">{messageQueue.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Keywords Blocked</p>
                  <p className="mt-1 text-2xl font-semibold">{moderationKeywords.length}</p>
                </div>
              </div>

              {/* Message Queue */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Message Queue</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {messageQueue.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm text-gray-900 truncate">{msg.message}</p>
                        <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleModerateMessage(msg.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <i className="fas fa-check"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleModerateMessage(msg.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {messageQueue.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-check-circle text-2xl mb-2"></i>
                      <p>No messages in queue</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action History */}
              <div className="mb-6">
                <div className="space-y-4">
                  {/* Action Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(() => {
                      const filteredActions = moderationHistory.filter(action => {
                        if (actionFilter !== 'all' && !action.type.includes(actionFilter.slice(0, -1))) {
                          return false;
                        }
                        if (userFilter && !action.userId.includes(userFilter)) {
                          return false;
                        }
                        if (timeFilter !== 'all') {
                          const actionTime = new Date(action.timestamp).getTime();
                          const now = Date.now();
                          const hourInMs = 60 * 60 * 1000;
                          const dayInMs = 24 * hourInMs;
                          if (timeFilter === 'hour' && (now - actionTime) > hourInMs) {
                            return false;
                          }
                          if (timeFilter === 'day' && (now - actionTime) > dayInMs) {
                            return false;
                          }
                        }
                        return true;
                      });

                      const stats = {
                        warnings: filteredActions.filter(a => a.type === 'warning').length,
                        bans: filteredActions.filter(a => a.type === 'ban').length,
                        timeouts: filteredActions.filter(a => a.type === 'timeout').length,
                        notes: filteredActions.filter(a => a.type === 'note').length
                      };

                      const uniqueUsers = new Set(filteredActions.map(a => a.userId)).size;

                      return (
                        <>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Total Actions</p>
                            <p className="mt-1 text-2xl font-semibold">{filteredActions.length}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Unique Users</p>
                            <p className="mt-1 text-2xl font-semibold">{uniqueUsers}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Most Common</p>
                            <p className="mt-1 text-2xl font-semibold">
                              {Object.entries(stats)
                                .sort(([,a], [,b]) => b - a)[0]?.[0]
                                .replace(/^./, c => c.toUpperCase()) || 'None'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Action Rate</p>
                            <p className="mt-1 text-2xl font-semibold">
                              {timeFilter === 'hour' 
                                ? `${Math.round(filteredActions.length / 60)} /min`
                                : timeFilter === 'day'
                                ? `${Math.round(filteredActions.length / 24)} /hr`
                                : 'N/A'}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Recent Actions</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Get filtered actions
                        const filteredActions = moderationHistory.filter(action => {
                          if (actionFilter !== 'all' && !action.type.includes(actionFilter.slice(0, -1))) {
                            return false;
                          }
                          if (userFilter && !action.userId.includes(userFilter)) {
                            return false;
                          }
                          if (timeFilter !== 'all') {
                            const actionTime = new Date(action.timestamp).getTime();
                            const now = Date.now();
                            const hourInMs = 60 * 60 * 1000;
                            const dayInMs = 24 * hourInMs;
                            if (timeFilter === 'hour' && (now - actionTime) > hourInMs) {
                              return false;
                            }
                            if (timeFilter === 'day' && (now - actionTime) > dayInMs) {
                              return false;
                            }
                          }
                          return true;
                        });

                        // Format actions for CSV
                        const csvContent = [
                          ['Timestamp', 'Action Type', 'User ID', 'Details'].join(','),
                          ...filteredActions.map(action => [
                            new Date(action.timestamp).toLocaleString(),
                            action.type,
                            action.userId,
                            action.type === 'warning' ? `Warning #${action.warningCount}` :
                            action.type === 'timeout' ? `${action.duration}m timeout` :
                            action.type === 'note' ? `Note: ${action.note}` : ''
                          ].join(','))
                        ].join('\n');

                        // Create and trigger download
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('hidden', '');
                        a.setAttribute('href', url);
                        a.setAttribute('download', `moderation-actions-${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }}
                      className="text-gray-600 hover:text-gray-700"
                      title="Export filtered actions"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Export
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Actions</option>
                      <option value="warnings">Warnings</option>
                      <option value="bans">Bans</option>
                      <option value="timeouts">Timeouts</option>
                      <option value="notes">Notes</option>
                    </select>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Time</option>
                      <option value="hour">Past Hour</option>
                      <option value="day">Past 24h</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Filter by User ID"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                  {moderationHistory
                    .filter(action => {
                      // Filter by action type
                      if (actionFilter !== 'all' && !action.type.includes(actionFilter.slice(0, -1))) {
                        return false;
                      }
                      
                      // Filter by user ID
                      if (userFilter && !action.userId.includes(userFilter)) {
                        return false;
                      }
                      
                      // Filter by time
                      if (timeFilter !== 'all') {
                        const actionTime = new Date(action.timestamp).getTime();
                        const now = Date.now();
                        const hourInMs = 60 * 60 * 1000;
                        const dayInMs = 24 * hourInMs;
                        
                        if (timeFilter === 'hour' && (now - actionTime) > hourInMs) {
                          return false;
                        }
                        if (timeFilter === 'day' && (now - actionTime) > dayInMs) {
                          return false;
                        }
                      }
                      
                      return true;
                    })
                    .map((action, index) => (
                    <div key={index} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">
                          {action.type === 'warning' && (
                            <span className="text-yellow-600">
                              <i className="fas fa-exclamation-triangle mr-1"></i>
                              Warning #{action.warningCount}
                            </span>
                          )}
                          {action.type === 'timeout' && (
                            <span className="text-orange-600">
                              <i className="fas fa-clock mr-1"></i>
                              {action.duration}m timeout
                            </span>
                          )}
                          {action.type === 'ban' && (
                            <span className="text-red-600">
                              <i className="fas fa-ban mr-1"></i>
                              Ban
                            </span>
                          )}
                          {action.type === 'note' && (
                            <span className="text-blue-600">
                              <i className="fas fa-sticky-note mr-1"></i>
                              Note updated
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">User {action.userId}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {moderationHistory.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                      No recent actions
                    </div>
                  )}
                </div>
              </div>

              {/* User Activity */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Active Users</h3>
                  {Array.from(userActivity).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className={showBulkActions ? 'bg-gray-100' : ''}
                    >
                      <i className="fas fa-users-cog mr-2"></i>
                      Bulk Actions
                    </Button>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg">
                  {showBulkActions && (
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === Array.from(userActivity).length && selectedUsers.size > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(new Set(Array.from(userActivity).map(([userId]) => userId)));
                              } else {
                                setSelectedUsers(new Set());
                              }
                            }}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedUsers.size > 0 ? (
                              `${selectedUsers.size} user${selectedUsers.size !== 1 ? 's' : ''} selected`
                            ) : (
                              'Select all users'
                            )}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {selectedUsers.size > 0 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkActionConfirm({ show: true, type: 'warn' })}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                Warn All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkActionConfirm({ show: true, type: 'timeout' })}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <i className="fas fa-clock mr-1"></i>
                                Timeout All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkActionConfirm({ show: true, type: 'ban' })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-ban mr-1"></i>
                                Ban All
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUsers(new Set())}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="max-h-[280px] overflow-y-auto">
                    {Array.from(userActivity).length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {Array.from(userActivity).map(([userId, activity]) => (
                          <div key={userId} className="flex items-center p-3">
                            {showBulkActions && (
                              <div className="mr-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.has(userId)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedUsers);
                                    if (e.target.checked) {
                                      newSelected.add(userId);
                                    } else {
                                      newSelected.delete(userId);
                                    }
                                    setSelectedUsers(newSelected);
                                  }}
                                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  User {userId}
                                  {warnedUsers.has(userId) && (
                                    <span className="ml-2 text-yellow-600">
                                      <i className="fas fa-exclamation-triangle"></i>
                                      {warnedUsers.get(userId)}
                                    </span>
                                  )}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {activity.messageCount} messages
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>
                                  <i className="fas fa-clock mr-1"></i>
                                  Joined {new Date(activity.joinTime).toLocaleTimeString()}
                                </span>
                                {activity.lastMessage && (
                                  <span>
                                    <i className="fas fa-comment mr-1"></i>
                                    Last active {new Date(activity.lastMessage).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(userId);
                                  setShowNotesModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title={userNotes.get(userId) || 'Add notes'}
                              >
                                <i className="fas fa-sticky-note"></i>
                                {userNotes.has(userId) && (
                                  <span className="ml-1">
                                    <i className="fas fa-circle text-xs"></i>
                                  </span>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWarnUser(userId)}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <i className="fas fa-exclamation-triangle"></i>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBanUser(userId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-ban"></i>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-users text-2xl mb-2"></i>
                        <p>No active users</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Moderation Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Blocked Keywords</h3>
                  <div className="space-y-3">
                    <textarea
                      value={moderationKeywords.join('\n')}
                      onChange={(e) => setModerationKeywords(e.target.value.split('\n').filter(Boolean))}
                      className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Enter keywords to block (one per line)"
                    />
                    <p className="text-xs text-gray-500">
                      Messages containing these keywords will be automatically queued for moderation
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Banned Users</h3>
                  <div className="border border-gray-200 rounded-lg">
                    <div className="max-h-[280px] overflow-y-auto">
                      {Array.from(bannedUsers).length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {Array.from(bannedUsers).map(userId => (
                            <div key={userId} className="flex items-center justify-between p-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">User {userId}</p>
                                <p className="text-xs text-gray-500">Banned from chat</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newBannedUsers = new Set(bannedUsers);
                                  newBannedUsers.delete(userId);
                                  setBannedUsers(newBannedUsers);
                                  setStreamStats(prev => ({
                                    ...prev,
                                    bannedUsers: prev.bannedUsers - 1
                                  }));
                                  toast.addToast('User unbanned successfully', 'success');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-user-slash mr-1"></i>
                                Unban
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-user-shield text-2xl mb-2"></i>
                          <p>No banned users</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter user ID"
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500"
                          value={newBanUserId}
                          onChange={(e) => setNewBanUserId(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleBanUser(newBanUserId)}
                        />
                          <div className="flex gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWarnUser(newBanUserId)}
                                disabled={!newBanUserId.trim()}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                Warn
                                {warnedUsers.has(newBanUserId) && (
                                  <span className="ml-1">
                                    ({warnedUsers.get(newBanUserId)})
                                  </span>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBanUser(newBanUserId)}
                                disabled={!newBanUserId.trim()}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-ban mr-1"></i>
                                Ban
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(newBanUserId);
                                  setShowNotesModal(true);
                                }}
                                disabled={!newBanUserId.trim()}
                                className="text-blue-600 hover:text-blue-700"
                                title={userNotes.get(newBanUserId) || 'Add notes'}
                              >
                                <i className="fas fa-sticky-note"></i>
                                {userNotes.has(newBanUserId) && (
                                  <span className="ml-1">
                                    <i className="fas fa-circle text-xs"></i>
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={timeoutDuration}
                          onChange={(e) => setTimeoutDuration(e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="1">1 min</option>
                          <option value="5">5 mins</option>
                          <option value="10">10 mins</option>
                          <option value="30">30 mins</option>
                          <option value="60">1 hour</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeoutUser(newBanUserId)}
                          disabled={!newBanUserId.trim()}
                        >
                          Timeout
                        </Button>
                      </div>
                      {timedOutUsers.size > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Timed out users:</p>
                          <div className="space-y-1">
                            {Array.from(timedOutUsers).map(([userId, endTime]) => (
                              <div key={userId} className="flex items-center justify-between text-xs">
                                <span>User {userId}</span>
                                <span className="text-gray-500">
                                  {Math.ceil((endTime - Date.now()) / 60000)}m remaining
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Moderation Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <StreamModeration streamId={id} isHost={true} />
              <ModerationLogs streamId={id} isHost={true} />
            </div>
            <ModerationTrends streamId={id} isHost={true} />
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-3xl mx-auto">
            <StreamSettings
              streamId={id}
              onUpdate={(settings) => setStream(prev => ({ ...prev, settings }))}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!stream) return null;

  return (
    <div id="stream-content" className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
        >
          {TABS.map(tab => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {renderTabContent()}

      {/* Modals */}
      <>
        {/* Bulk Action Confirmation Modal */}
        {bulkActionConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setBulkActionConfirm({ show: false, type: null })} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {bulkActionConfirm.type === 'warn' ? 'Warn Selected Users' :
                     bulkActionConfirm.type === 'timeout' ? 'Timeout Selected Users' :
                     bulkActionConfirm.type === 'ban' ? 'Ban Selected Users' : ''}
                  </h3>
                  <button 
                    onClick={() => setBulkActionConfirm({ show: false, type: null })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <p className="text-gray-600">
                  Are you sure you want to {bulkActionConfirm.type} {selectedUsers.size} selected user{selectedUsers.size !== 1 ? 's' : ''}? 
                  {bulkActionConfirm.type === 'ban' && ' This action cannot be undone.'}
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBulkActionConfirm({ show: false, type: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={bulkActionConfirm.type === 'ban' ? 'destructive' : 'default'}
                    onClick={() => {
                      const action = {
                        warn: handleWarnUser,
                        timeout: handleTimeoutUser,
                        ban: handleBanUser
                      }[bulkActionConfirm.type];

                      Array.from(selectedUsers).forEach(userId => action(userId));
                      setSelectedUsers(new Set());
                      setBulkActionConfirm({ show: false, type: null });
                      toast.addToast(`${selectedUsers.size} user${selectedUsers.size !== 1 ? 's' : ''} ${bulkActionConfirm.type}ed successfully`, 'success');
                    }}
                  >
                    Confirm {bulkActionConfirm.type === 'warn' ? 'Warning' :
                            bulkActionConfirm.type === 'timeout' ? 'Timeout' :
                            bulkActionConfirm.type === 'ban' ? 'Ban' : ''}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={isEndModalOpen}
          onClose={() => !isEnding && setIsEndModalOpen(false)}
          onConfirm={handleEndStream}
          title="End Live Stream"
          message="Are you sure you want to end this live stream? This action cannot be undone."
          confirmText="End Stream"
          confirmVariant="danger"
          isLoading={isEnding}
        />

        {/* User Notes Modal */}
        <div className={`fixed inset-0 z-50 ${showNotesModal ? 'flex' : 'hidden'} items-center justify-center`}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNotesModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full m-4 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Notes</h3>
                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-500">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes by user ID or content..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 pl-9"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>

              <div className="space-y-3 mb-3">
                {selectedUser && (
                  <div className="flex flex-wrap gap-2">
                    {noteTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newNotes = new Map(userNotes);
                          const currentNote = newNotes.get(selectedUser) || '';
                          const newNote = currentNote 
                            ? `${currentNote}\n\n${template.text}`
                            : template.text;
                          newNotes.set(selectedUser, newNote);
                          setUserNotes(newNotes);
                          addModerationAction({
                            type: 'note',
                            userId: selectedUser,
                            note: template.text,
                            template: template.id
                          });
                          toast.addToast('Note template added', 'success');
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        {template.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {Array.from(userNotes)
                  .filter(([userId, note]) => {
                    const searchLower = noteSearch.toLowerCase();
                    return (
                      userId.toLowerCase().includes(searchLower) ||
                      note.toLowerCase().includes(searchLower)
                    );
                  })
                  .map(([userId, note]) => (
                    <div 
                      key={userId} 
                      className={`p-3 hover:bg-gray-50 ${userId === selectedUser ? 'bg-gray-50' : ''}`}
                      onClick={() => setSelectedUser(userId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          User {userId}
                          {warnedUsers.has(userId) && (
                            <span className="ml-2 text-yellow-600">
                              <i className="fas fa-exclamation-triangle"></i>
                              {warnedUsers.get(userId)}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWarnUser(userId);
                            }}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBanUser(userId);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="fas fa-ban"></i>
                          </Button>
                        </div>
                      </div>
                      <textarea
                        value={note}
                        onChange={(e) => {
                          const newNotes = new Map(userNotes);
                          newNotes.set(userId, e.target.value);
                          setUserNotes(newNotes);
                        }}
                        placeholder="Add notes about this user..."
                        className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                {Array.from(userNotes).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-sticky-note text-2xl mb-2"></i>
                    <p>No notes added yet</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    addModerationAction({
                      type: 'note',
                      userId: selectedUser,
                      note: userNotes.get(selectedUser)
                    });
                    setShowNotesModal(false);
                    toast.addToast('Notes saved successfully', 'success');
                  }}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Template Manager Modal */}
        {showTemplateManager && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowTemplateManager(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Manage Note Templates</h3>
                  <button onClick={() => setShowTemplateManager(false)} className="text-gray-400 hover:text-gray-500">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Add New Template */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium">Add New Template</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Template Label"
                      value={newTemplate.label}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                    />
                    <textarea
                      placeholder="Template Text"
                      value={newTemplate.text}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                    />
                    <Button
                      onClick={() => {
                        if (!newTemplate.label || !newTemplate.text) return;
                        const id = newTemplate.label.toLowerCase().replace(/\s+/g, '-');
                        setNoteTemplates(prev => [...prev, { ...newTemplate, id }]);
                        setNewTemplate({ label: '', text: '' });
                        toast.addToast('Template added successfully', 'success');
                      }}
                      disabled={!newTemplate.label || !newTemplate.text}
                    >
                      Add Template
                    </Button>
                  </div>
                </div>

                {/* Existing Templates */}
                <div className="space-y-3">
                  {/* Import/Export Controls */}
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium">Template Management</h3>
                        <p className="text-xs text-gray-500 mt-1">Import, export, and manage your templates</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const exportData = {
                              templates: noteTemplates,
                              metadata: {
                                exportedAt: new Date().toISOString(),
                                version: '1.0',
                                categories: Array.from(new Set(noteTemplates.map(t => t.category))),
                                stats: {
                                  totalTemplates: noteTemplates.length,
                                  totalUses: noteTemplates.reduce((sum, t) => sum + t.useCount, 0),
                                  avgEffectiveness: Math.round(noteTemplates.reduce((sum, t) => 
                                    sum + (t.effectiveness.successCount / (t.effectiveness.totalCount || 1)), 0
                                  ) / noteTemplates.length * 100)
                                }
                              }
                            };
                            
                            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `templates-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            toast.addToast('Templates exported successfully', 'success');
                          }}
                        >
                          <i className="fas fa-file-export mr-1"></i>
                          Export
                        </Button>
                        <label className="relative">
                          <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  if (!event.target?.result || typeof event.target.result !== 'string') {
                                    throw new Error('Failed to read file');
                                  }
                                  const importData = JSON.parse(event.target.result);
                                  
                                  // Validate import data
                                  if (!importData.templates || !Array.isArray(importData.templates)) {
                                    throw new Error('Invalid template data');
                                  }

                                  // Merge with existing templates
                                  const newTemplates = importData.templates.map(t => ({
                                    ...t,
                                    id: `${t.id}-imported-${Date.now()}`,
                                    imported: true,
                                    importedAt: new Date().toISOString()
                                  }));

                                  setNoteTemplates(prev => [...prev, ...newTemplates]);
                                  toast.addToast(
                                    `Imported ${newTemplates.length} templates successfully`,
                                    'success'
                                  );
                                } catch (error) {
                                  toast.addToast(
                                    'Failed to import templates. Please check the file format.',
                                    'error'
                                  );
                                }
                              };
                              reader.readAsText(file);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector('input[type="file"]');
                              input?.click();
                            }}
                          >
                            <i className="fas fa-file-import mr-1"></i>
                            Import
                          </Button>
                        </label>
                      </div>
                    </div>

                    {/* Import Stats */}
                    {noteTemplates.some(t => t.imported) && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Imported Templates</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              {noteTemplates.filter(t => t.imported).length}
                            </p>
                            <p className="text-xs text-gray-500">Total imported</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {new Set(noteTemplates.filter(t => t.imported).map(t => t.category)).size}
                            </p>
                            <p className="text-xs text-gray-500">Categories</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {noteTemplates.filter(t => t.imported && t.useCount > 0).length}
                            </p>
                            <p className="text-xs text-gray-500">In use</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Approval Queue */}
                    {pendingTemplates.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                              Pending Approval ({pendingTemplates.length})
                            </h3>
                            <p className="text-xs text-yellow-600 mt-1">
                              Templates awaiting review before being added to the system
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Approve all pending templates?')) {
                                  const now = new Date().toISOString();
                                  setNoteTemplates(prev => [
                                    ...prev,
                                    ...pendingTemplates.map(t => ({
                                      ...t,
                                      status: 'approved',
                                      approvedBy: 'moderator',
                                      approvedAt: now
                                    }))
                                  ]);
                                  setPendingTemplates([]);
                                  toast.addToast(`Approved ${pendingTemplates.length} templates`, 'success');
                                }
                              }}
                            >
                              <i className="fas fa-check-double mr-1"></i>
                              Approve All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Clear all pending templates? This cannot be undone.')) {
                                  setPendingTemplates([]);
                                  toast.addToast('Cleared pending templates', 'success');
                                }
                              }}
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Clear All
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {pendingTemplates.map(template => (
                            <div 
                              key={template.id} 
                              className="flex items-start justify-between p-3 bg-white rounded border border-yellow-100"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{template.label}</p>
                                <p className="text-xs text-gray-600">{template.text}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{template.category}</span>
                                  <span>•</span>
                                  <span>Created {new Date(template.created).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => {
                                    // Find previous version if it exists
                                    const previousVersion = noteTemplates.find(t => 
                                      t.id === template.id.split('-v')[0]
                                    );

                                    if (previousVersion) {
                                      // Show version comparison modal
                                      toast.addToast(
                                        <div className="space-y-4">
                                          <h3 className="font-medium">Version Comparison</h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Previous Version</h4>
                                              <div className="p-3 bg-gray-50 rounded text-sm">
                                                <p className="font-medium">{previousVersion.label}</p>
                                                <p className="text-gray-600 mt-1">{previousVersion.text}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                  Last modified: {new Date(previousVersion.modified).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">New Version</h4>
                                              <div className="p-3 bg-yellow-50 rounded text-sm">
                                                <p className="font-medium">{template.label}</p>
                                                <p className="text-gray-600 mt-1">{template.text}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                  Created: {new Date(template.created).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>,
                                        'info',
                                        10000
                                      );
                                    }
                                  }}
                                >
                                  <i className="fas fa-code-compare"></i>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => {
                                    const notes = prompt('Add review notes (optional):');
                                    const templateId = template.id.includes('-v') 
                                      ? template.id 
                                      : `${template.id}-v${template.version + 1}`;
                                    
                                    setNoteTemplates(prev => [...prev, {
                                      ...template,
                                      id: templateId,
                                      status: 'approved',
                                      approvedBy: 'moderator',
                                      approvedAt: new Date().toISOString(),
                                      reviewNotes: notes || '',
                                      version: template.version + 1
                                    }]);
                                    setPendingTemplates(prev => 
                                      prev.filter(t => t.id !== template.id)
                                    );
                                    toast.addToast(`Approved template "${template.label}"`, 'success');
                                  }}
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) {
                                      setPendingTemplates(prev => 
                                        prev.filter(t => t.id !== template.id)
                                      );
                                      setApprovalQueue(prev => [...prev, {
                                        ...template,
                                        status: 'rejected',
                                        rejectedBy: 'moderator',
                                        rejectedAt: new Date().toISOString(),
                                        rejectionReason: reason,
                                        version: template.version
                                      }]);
                                      toast.addToast(`Rejected template "${template.label}"`, 'error');
                                    }
                                  }}
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Template Goals */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium">Template Goals</h3>
                          <p className="text-xs text-gray-500 mt-1">Track template effectiveness and set targets</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const target = prompt('Set effectiveness target (%):', '80');
                            if (target && !isNaN(target) && target > 0 && target <= 100) {
                              setNoteTemplates(prev => prev.map(t => ({
                                ...t,
                                effectiveness: {
                                  ...t.effectiveness,
                                  target: parseInt(target) / 100
                                }
                              })));
                              toast.addToast(`Set effectiveness target to ${target}%`, 'success');
                            }
                          }}
                        >
                          <i className="fas fa-bullseye mr-1"></i>
                          Set Target
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {Array.from(new Set(noteTemplates.map(t => t.category))).map(category => {
                          const templates = noteTemplates.filter(t => t.category === category);
                          const avgEffectiveness = templates.reduce((sum, t) => 
                            sum + (t.effectiveness.successCount / (t.effectiveness.totalCount || 1)), 0
                          ) / templates.length;
                          const target = templates[0]?.effectiveness?.target || 0.8;

                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{category}</span>
                                <span className={`${
                                  avgEffectiveness >= target ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {Math.round(avgEffectiveness * 100)}% / {Math.round(target * 100)}%
                                </span>
                              </div>
                              <div className="relative h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`absolute h-2 rounded-full ${
                                    avgEffectiveness >= target ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}
                                  style={{width: `${(avgEffectiveness / target) * 100}%`}}
                                />
                                <div 
                                  className="absolute h-4 w-px bg-gray-400 top-1/2 transform -translate-y-1/2"
                                  style={{left: `${target * 100}%`}}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Template List Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Existing Templates</h4>
                      <div className="flex items-center gap-2">
                        <label className="relative">
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    if (!event.target?.result) {
                                      toast.addToast('Failed to read file', 'error');
                                      return;
                                    }
                                    const imported = JSON.parse(event.target.result.toString());
                                    if (Array.isArray(imported) && imported.every(template => 
                                      template.id && template.label && template.text && template.category
                                    )) {
                                      // Merge with existing templates, preserving usage stats
                                      const merged = imported.map(newTemplate => {
                                        const existing = noteTemplates.find(t => t.id === newTemplate.id);
                                        return {
                                          ...newTemplate,
                                          useCount: existing?.useCount || 0,
                                          lastUsed: existing?.lastUsed || null
                                        };
                                      });
                                      setNoteTemplates(merged);
                                      toast.addToast(`Imported ${merged.length} templates`, 'success');
                                    } else {
                                      toast.addToast('Invalid template format', 'error');
                                    }
                                  } catch (err) {
                                    toast.addToast('Failed to parse template file', 'error');
                                  }
                                };
                                reader.readAsText(file);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <i className="fas fa-upload mr-1"></i>
                            Import
                          </Button>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const jsonStr = JSON.stringify(noteTemplates, null, 2);
                            const blob = new Blob([jsonStr], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'note-templates.json';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <i className="fas fa-download mr-1"></i>
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={noteSearch}
                          onChange={(e) => setNoteSearch(e.target.value)}
                          className="w-full px-3 py-1 pl-8 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="All">All Categories</option>
                        {Array.from(new Set(noteTemplates.map(t => t.category))).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select
                        onChange={(e) => {
                          const sorted = [...noteTemplates].sort((a, b) => {
                            switch(e.target.value) {
                              case 'most-used':
                                return b.useCount - a.useCount;
                              case 'recently-used':
                                return (b.lastUsed ? new Date(b.lastUsed) : 0) - 
                                       (a.lastUsed ? new Date(a.lastUsed) : 0);
                              case 'alphabetical':
                                return a.label.localeCompare(b.label);
                              default:
                                return 0;
                            }
                          });
                          setNoteTemplates(sorted);
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="default">Sort by...</option>
                        <option value="most-used">Most Used</option>
                        <option value="recently-used">Recently Used</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                    </div>
                  </div>
                  {/* Category Management */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Category Management</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const category = prompt('Enter new category name:');
                          if (category && category.trim()) {
                            // Add new category to existing templates
                            toast.addToast(`Category "${category.trim()}" created`, 'success');
                          }
                        }}
                      >
                        <i className="fas fa-plus mr-1"></i>
                        New Category
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(new Set(noteTemplates.map(t => t.category))).map(category => (
                        <div 
                          key={category}
                          className="p-2 bg-white rounded border border-gray-200 flex items-center justify-between"
                        >
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                const newName = prompt(`Rename category "${category}":`);
                                if (newName && newName.trim()) {
                                  setNoteTemplates(prev => prev.map(t => 
                                    t.category === category
                                      ? { ...t, category: newName.trim() }
                                      : t
                                  ));
                                  if (selectedCategory === category) {
                                    setSelectedCategory(newName.trim());
                                  }
                                  toast.addToast(`Category renamed to "${newName.trim()}"`, 'success');
                                }
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm(`Delete category "${category}"? Templates will be moved to "Uncategorized".`)) {
                                  setNoteTemplates(prev => prev.map(t => 
                                    t.category === category
                                      ? { ...t, category: 'Uncategorized' }
                                      : t
                                  ));
                                  if (selectedCategory === category) {
                                    setSelectedCategory('All');
                                  }
                                  toast.addToast(`Category "${category}" deleted`, 'success');
                                }
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Templates List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {/* Bulk Actions */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const selectedTemplates = noteTemplates.filter(t => 
                              (selectedCategory === 'All' || t.category === selectedCategory) &&
                              (!noteSearch || 
                                t.label.toLowerCase().includes(noteSearch.toLowerCase()) ||
                                t.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                                t.category.toLowerCase().includes(noteSearch.toLowerCase())
                              )
                            );
                            
                            const newCategory = prompt('Move selected templates to category:');
                            if (newCategory && newCategory.trim()) {
                              setNoteTemplates(prev => prev.map(t => 
                                selectedTemplates.some(st => st.id === t.id)
                                  ? { ...t, category: newCategory.trim() }
                                  : t
                              ));
                              toast.addToast(
                                `Moved ${selectedTemplates.length} template${selectedTemplates.length !== 1 ? 's' : ''} to "${newCategory.trim()}"`,
                                'success'
                              );
                            }
                          }}
                        >
                          <i className="fas fa-folder-open mr-1"></i>
                          Move to Category
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const selectedTemplates = noteTemplates.filter(t => 
                              (selectedCategory === 'All' || t.category === selectedCategory) &&
                              (!noteSearch || 
                                t.label.toLowerCase().includes(noteSearch.toLowerCase()) ||
                                t.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                                t.category.toLowerCase().includes(noteSearch.toLowerCase())
                              )
                            );
                            
                            if (confirm(`Archive ${selectedTemplates.length} template${selectedTemplates.length !== 1 ? 's' : ''}?`)) {
                              setNoteTemplates(prev => prev.map(t => 
                                selectedTemplates.some(st => st.id === t.id)
                                  ? { ...t, archived: true }
                                  : t
                              ));
                              toast.addToast(
                                `Archived ${selectedTemplates.length} template${selectedTemplates.length !== 1 ? 's' : ''}`,
                                'success'
                              );
                            }
                          }}
                        >
                          <i className="fas fa-archive mr-1"></i>
                          Archive Selected
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {noteTemplates.filter(t => 
                          (selectedCategory === 'All' || t.category === selectedCategory) &&
                          (!noteSearch || 
                            t.label.toLowerCase().includes(noteSearch.toLowerCase()) ||
                            t.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                            t.category.toLowerCase().includes(noteSearch.toLowerCase())
                          )
                        ).length} templates selected
                      </div>
                    </div>

                    {/* Template Performance Overview */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Template Performance</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const goal = prompt('Set effectiveness goal (%):', '80');
                            if (goal && !isNaN(goal) && goal > 0 && goal <= 100) {
                              setNoteTemplates(prev => prev.map(t => ({
                                ...t,
                                effectivenessGoal: parseInt(goal)
                              })));
                              toast.addToast(`Set effectiveness goal to ${goal}%`, 'success');
                            }
                          }}
                        >
                          <i className="fas fa-bullseye mr-1"></i>
                          Set Goals
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Total Uses</p>
                          <p className="text-2xl font-semibold mt-1">
                            {noteTemplates.reduce((sum, t) => sum + t.useCount, 0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Across {noteTemplates.length} templates
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Average Effectiveness</p>
                          <p className="text-2xl font-semibold mt-1">
                            {Math.round(noteTemplates.reduce((sum, t) => 
                              sum + (t.effectiveness.successCount / (t.effectiveness.totalCount || 1)), 0
                            ) / noteTemplates.length * 100)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Target: {noteTemplates[0]?.effectivenessGoal || 80}%
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Meeting Goals</p>
                          <p className="text-2xl font-semibold mt-1">
                            {noteTemplates.filter(t => 
                              (t.effectiveness.successCount / (t.effectiveness.totalCount || 1)) * 100 >= 
                              (t.effectivenessGoal || 80)
                            ).length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Templates above target
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Needs Improvement</p>
                          <p className="text-2xl font-semibold mt-1 text-yellow-600">
                            {noteTemplates.filter(t => 
                              t.effectiveness.totalCount > 0 &&
                              (t.effectiveness.successCount / t.effectiveness.totalCount) * 100 < 
                              (t.effectivenessGoal || 80)
                            ).length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Below target effectiveness
                          </p>
                        </div>
                      </div>

                      {/* Performance Alerts */}
                      {noteTemplates.some(t => 
                        t.effectiveness.totalCount > 0 &&
                        (t.effectiveness.successCount / t.effectiveness.totalCount) * 100 < 
                        (t.effectivenessGoal || 80)
                      ) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-800 mb-2">
                            Templates Needing Attention
                          </h4>
                          <div className="space-y-2">
                            {noteTemplates
                              .filter(t => 
                                t.effectiveness.totalCount > 0 &&
                                (t.effectiveness.successCount / t.effectiveness.totalCount) * 100 < 
                                (t.effectivenessGoal || 80)
                              )
                              .map(template => (
                                <div key={template.id} className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{template.label}</p>
                                    <p className="text-xs text-gray-600">
                                      {Math.round((template.effectiveness.successCount / template.effectiveness.totalCount) * 100)}% effective
                                      (Target: {template.effectivenessGoal || 80}%)
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => setEditingTemplate(template)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Effectiveness Trends */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium">Template Performance Trends</h4>
                          <select
                            className="px-2 py-1 text-sm border border-gray-200 rounded"
                            onChange={(e) => {
                              // Update time range for trends
                              const days = parseInt(e.target.value);
                              const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                              
                              // Filter and sort templates by recent performance
                              const trendingTemplates = noteTemplates
                                .filter(t => t.lastUsed && new Date(t.lastUsed) > cutoff)
                                .sort((a, b) => 
                                  (b.effectiveness.successCount / b.effectiveness.totalCount) -
                                  (a.effectiveness.successCount / a.effectiveness.totalCount)
                                );
                            }}
                          >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          {/* Top Performers */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Top Performing Templates</h5>
                            <div className="space-y-2">
                              {noteTemplates
                                .filter(t => t.effectiveness.totalCount > 0)
                                .sort((a, b) => 
                                  (b.effectiveness.successCount / b.effectiveness.totalCount) -
                                  (a.effectiveness.successCount / a.effectiveness.totalCount)
                                )
                                .slice(0, 3)
                                .map(template => (
                                  <div key={template.id} className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{template.category}</span>
                                        <span>•</span>
                                        <span>{template.useCount} uses</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">
                                        {Math.round((template.effectiveness.successCount / template.effectiveness.totalCount) * 100)}%
                                      </p>
                                      <p className="text-xs text-gray-500">effectiveness</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Recent Activity */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Recent Activity</h5>
                            <div className="space-y-2">
                              {noteTemplates
                                .filter(t => t.lastUsed)
                                .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
                                .slice(0, 3)
                                .map(template => (
                                  <div key={template.id} className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <p className="text-xs text-gray-500">
                                        Last used {new Date(template.lastUsed).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{template.useCount}</p>
                                      <p className="text-xs text-gray-500">total uses</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Template Analytics Dashboard */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium">Usage Analytics</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Template performance metrics and trends
                            </p>
                          </div>
                          <select
                            className="px-2 py-1 text-sm border border-gray-200 rounded"
                            onChange={(e) => {
                              // Update time range for analytics
                              const days = parseInt(e.target.value);
                              const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                              
                              // Filter templates by date range
                              const activeTemplates = noteTemplates.filter(t => 
                                t.lastUsed && new Date(t.lastUsed) > cutoff
                              );
                            }}
                          >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last quarter</option>
                            <option value="365">Last year</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          {/* Usage Metrics */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-semibold">
                                  {noteTemplates.reduce((sum, t) => sum + t.useCount, 0)}
                                </p>
                                <p className="text-xs text-gray-600">Total Uses</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-semibold">
                                  {noteTemplates.filter(t => t.lastUsed).length}
                                </p>
                                <p className="text-xs text-gray-600">Active Templates</p>
                              </div>
                            </div>

                            {/* Usage Distribution */}
                            <div>
                              <h5 className="text-xs font-medium text-gray-600 mb-2">Usage Distribution</h5>
                              <div className="space-y-2">
                                {Array.from(new Set(noteTemplates.map(t => t.category)))
                                  .map(category => {
                                    const templates = noteTemplates.filter(t => t.category === category);
                                    const totalUses = templates.reduce((sum, t) => sum + t.useCount, 0);
                                    const percentage = Math.round(
                                      (totalUses / noteTemplates.reduce((sum, t) => sum + t.useCount, 0)) * 100
                                    );

                                    return (
                                      <div key={category} className="flex items-center gap-2">
                                        <div className="w-24 text-xs">{category}</div>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gray-600"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                        <div className="w-12 text-xs text-right">{percentage}%</div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>

                          {/* Effectiveness Metrics */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-semibold">
                                  {Math.round(noteTemplates.reduce((sum, t) => 
                                    sum + (t.effectiveness.successCount / (t.effectiveness.totalCount || 1)), 0
                                  ) / noteTemplates.length * 100)}%
                                </p>
                                <p className="text-xs text-gray-600">Avg. Effectiveness</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-semibold">
                                  {noteTemplates.filter(t => 
                                    t.effectiveness.totalCount > 0 &&
                                    (t.effectiveness.successCount / t.effectiveness.totalCount) >= 0.8
                                  ).length}
                                </p>
                                <p className="text-xs text-gray-600">High Performers</p>
                              </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                              <h5 className="text-xs font-medium text-gray-600 mb-2">Recent Activity</h5>
                              <div className="space-y-2">
                                {noteTemplates
                                  .filter(t => t.lastUsed)
                                  .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
                                  .slice(0, 4)
                                  .map(template => (
                                    <div 
                                      key={template.id}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <div>
                                        <p className="text-sm font-medium">{template.label}</p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(template.lastUsed).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium">
                                          {Math.round((template.effectiveness.successCount / 
                                            template.effectiveness.totalCount) * 100)}%
                                        </p>
                                        <p className="text-xs text-gray-500">effective</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* A/B Testing Dashboard */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium">A/B Testing</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Compare and optimize template variations
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const selectedTemplate = noteTemplates.find(t => t.useCount > 5);
                              if (!selectedTemplate) {
                                toast.addToast('No eligible templates for testing', 'error');
                                return;
                              }

                              const variant = {
                                ...selectedTemplate,
                                id: `${selectedTemplate.id}-variant-${Date.now()}`,
                                label: `${selectedTemplate.label} (Variant)`,
                                isTestVariant: true,
                                originalId: selectedTemplate.id,
                                effectiveness: {
                                  successCount: 0,
                                  totalCount: 0,
                                  lastOutcome: null
                                }
                              };

                              setNoteTemplates(prev => [...prev, variant]);
                              toast.addToast('Created test variant', 'success');
                            }}
                          >
                            <i className="fas fa-flask mr-1"></i>
                            New Test
                          </Button>
                        </div>

                        {/* Active Tests */}
                        {noteTemplates.some(t => t.isTestVariant) && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {noteTemplates
                                .filter(t => t.isTestVariant)
                                .map(variant => {
                                  const original = noteTemplates.find(t => t.id === variant.originalId);
                                  if (!original) return null;

                                  const variantEffectiveness = Math.round(
                                    (variant.effectiveness.successCount / (variant.effectiveness.totalCount || 1)) * 100
                                  );
                                  const originalEffectiveness = Math.round(
                                    (original.effectiveness.successCount / (original.effectiveness.totalCount || 1)) * 100
                                  );
                                  const improvement = variantEffectiveness - originalEffectiveness;

                                  return (
                                    <div key={variant.id} className="p-4 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-medium">{variant.label}</h5>
                                        <span className={`text-xs font-medium ${
                                          improvement > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {improvement > 0 ? '+' : ''}{improvement}% vs original
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <span>Uses</span>
                                          <span>{variant.useCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span>Effectiveness</span>
                                          <span>{variantEffectiveness}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full transition-all ${
                                              improvement > 0 ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${variantEffectiveness}%` }}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-2 mt-3">
                                        {improvement > 5 && variant.useCount > 10 && (
                                          <Button
                                            variant="outline"
                                            size="xs"
                                            className="text-green-600"
                                            onClick={() => {
                                              if (confirm('Apply this variant as the new template?')) {
                                                setNoteTemplates(prev => prev.map(t => 
                                                  t.id === original.id ? {
                                                    ...variant,
                                                    id: original.id,
                                                    label: original.label,
                                                    isTestVariant: false,
                                                    originalId: null
                                                  } : t
                                                ).filter(t => t.id !== variant.id));
                                                toast.addToast('Applied successful variant', 'success');
                                              }
                                            }}
                                          >
                                            <i className="fas fa-check mr-1"></i>
                                            Apply
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          className="text-red-600"
                                          onClick={() => {
                                            if (confirm('End this test?')) {
                                              setNoteTemplates(prev => 
                                                prev.filter(t => t.id !== variant.id)
                                              );
                                              toast.addToast('Test ended', 'success');
                                            }
                                          }}
                                        >
                                          <i className="fas fa-times"></i>
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Performance Forecasting */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium">Performance Forecasting</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              AI-powered effectiveness predictions
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Calculate forecasts for all templates
                              const updatedTemplates = noteTemplates.map(template => {
                                if (template.effectiveness.history?.length < 3) return template;

                                const history = template.effectiveness.history;
                                const trend = history.slice(-3).reduce((acc, curr, idx, arr) => {
                                  if (idx === 0) return 0;
                                  return acc + (curr - arr[idx - 1]);
                                }, 0) / 2;

                                const currentEffectiveness = template.effectiveness.successCount / 
                                  template.effectiveness.totalCount;
                                
                                const forecast = Math.min(1, Math.max(0, currentEffectiveness + trend));
                                
                                return {
                                  ...template,
                                  forecast: {
                                    effectiveness: forecast,
                                    trend,
                                    confidence: Math.min(1, template.useCount / 100),
                                    lastUpdated: new Date().toISOString()
                                  }
                                };
                              });

                              setNoteTemplates(updatedTemplates);
                              toast.addToast('Updated performance forecasts', 'success');
                            }}
                          >
                            <i className="fas fa-chart-line mr-1"></i>
                            Update Forecasts
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {/* Trending Templates */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">
                              Trending Templates
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              {noteTemplates
                                .filter(t => t.forecast && t.forecast.trend > 0)
                                .sort((a, b) => b.forecast.trend - a.forecast.trend)
                                .slice(0, 4)
                                .map(template => (
                                  <div 
                                    key={template.id}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <span className="text-xs text-green-600">
                                        +{Math.round(template.forecast.trend * 100)}%
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>Current</span>
                                        <span>
                                          {Math.round((template.effectiveness.successCount / 
                                            template.effectiveness.totalCount) * 100)}%
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>Forecast</span>
                                        <span className="font-medium">
                                          {Math.round(template.forecast.effectiveness * 100)}%
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-green-500 transition-all"
                                          style={{ width: `${template.forecast.effectiveness * 100}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {Math.round(template.forecast.confidence * 100)}% confidence
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Optimization Opportunities */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">
                              Optimization Opportunities
                            </h5>
                            <div className="space-y-2">
                              {noteTemplates
                                .filter(t => 
                                  t.forecast && 
                                  t.forecast.trend < 0 && 
                                  t.useCount > 5
                                )
                                .slice(0, 3)
                                .map(template => (
                                  <div 
                                    key={template.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <p className="text-xs text-red-600">
                                        Declining effectiveness ({Math.round(template.forecast.trend * 100)}%)
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="xs"
                                      onClick={() => setEditingTemplate(template)}
                                    >
                                      Optimize
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Template Archive */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium">Template Archive</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Manage inactive and historical templates
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Auto-archive based on rules
                                const threshold = new Date();
                                threshold.setDate(threshold.getDate() - 90); // 90 days inactive

                                const updatedTemplates = noteTemplates.map(template => {
                                  if (
                                    !template.archived &&
                                    template.lastUsed &&
                                    new Date(template.lastUsed) < threshold &&
                                    template.useCount < 5
                                  ) {
                                    return {
                                      ...template,
                                      archived: true,
                                      archivedAt: new Date().toISOString(),
                                      archiveReason: 'Inactive template'
                                    };
                                  }
                                  return template;
                                });

                                const newlyArchived = updatedTemplates.filter(
                                  (t, i) => t.archived && !noteTemplates[i].archived
                                ).length;

                                setNoteTemplates(updatedTemplates);
                                if (newlyArchived > 0) {
                                  toast.addToast(
                                    `Archived ${newlyArchived} inactive templates`,
                                    'success'
                                  );
                                }
                              }}
                            >
                              <i className="fas fa-archive mr-1"></i>
                              Auto-Archive
                            </Button>
                            <select
                              className="px-2 py-1 text-sm border border-gray-200 rounded"
                              onChange={(e) => setArchiveView(e.target.value)}
                            >
                              <option value="recent">Recently Archived</option>
                              <option value="category">By Category</option>
                              <option value="effectiveness">By Effectiveness</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Archive Stats */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-semibold">
                                {noteTemplates.filter(t => t.archived).length}
                              </p>
                              <p className="text-xs text-gray-600">Total Archived</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-semibold">
                                {noteTemplates.filter(t => 
                                  t.archived && 
                                  new Date(t.archivedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                ).length}
                              </p>
                              <p className="text-xs text-gray-600">Last 30 Days</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-semibold">
                                {new Set(noteTemplates.filter(t => t.archived).map(t => t.category)).size}
                              </p>
                              <p className="text-xs text-gray-600">Categories</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-2xl font-semibold">
                                {noteTemplates.filter(t => 
                                  t.archived && 
                                  t.effectiveness.successCount / t.effectiveness.totalCount > 0.8
                                ).length}
                              </p>
                              <p className="text-xs text-gray-600">High Performers</p>
                            </div>
                          </div>

                          {/* Archived Templates */}
                          <div className="space-y-2">
                            {noteTemplates
                              .filter(t => t.archived)
                              .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt))
                              .slice(0, 5)
                              .map(template => (
                                <div 
                                  key={template.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <span className="text-xs text-gray-500">
                                        {template.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Archived {new Date(template.archivedAt).toLocaleDateString()} - {template.archiveReason}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => {
                                        setNoteTemplates(prev => prev.map(t => 
                                          t.id === template.id ? {
                                            ...t,
                                            archived: false,
                                            archivedAt: null,
                                            archiveReason: null,
                                            restoredAt: new Date().toISOString()
                                          } : t
                                        ));
                                        toast.addToast(`Restored "${template.label}"`, 'success');
                                      }}
                                    >
                                      <i className="fas fa-undo"></i>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      className="text-red-600"
                                      onClick={() => {
                                        if (confirm('Permanently delete this template?')) {
                                          setNoteTemplates(prev => 
                                            prev.filter(t => t.id !== template.id)
                                          );
                                          toast.addToast(`Deleted "${template.label}"`, 'success');
                                        }
                                      }}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Smart Template Suggestions */}
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium">Smart Suggestions</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              AI-powered recommendations based on performance patterns
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Refresh suggestions
                              const suggestions = noteTemplates
                                .filter(t => t.effectiveness.totalCount > 5)
                                .sort((a, b) => {
                                  const aScore = (a.effectiveness.successCount / a.effectiveness.totalCount) * 
                                               Math.min(1, a.useCount / 10);
                                  const bScore = (b.effectiveness.successCount / b.effectiveness.totalCount) * 
                                               Math.min(1, b.useCount / 10);
                                  return bScore - aScore;
                                })
                                .slice(0, 3);
                              
                              setSuggestedTemplate(suggestions[0]);
                              toast.addToast('Suggestions refreshed', 'success');
                            }}
                          >
                            <i className="fas fa-sync-alt mr-1"></i>
                            Refresh
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {/* Category-based Suggestions */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">By Category</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {Array.from(new Set(noteTemplates.map(t => t.category)))
                                .slice(0, 4)
                                .map(category => {
                                  const templates = noteTemplates.filter(t => t.category === category);
                                  const bestTemplate = templates.reduce((best, t) => {
                                    const score = (t.effectiveness.successCount / t.effectiveness.totalCount) * 
                                                Math.min(1, t.useCount / 10);
                                    return score > best.score ? { template: t, score } : best;
                                  }, { score: 0 }).template;

                                  return bestTemplate ? (
                                    <div 
                                      key={category}
                                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                      <p className="text-sm font-medium mb-1">{category}</p>
                                      <p className="text-xs text-gray-600 mb-2">
                                        Best performing: {bestTemplate.label}
                                      </p>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                          {Math.round((bestTemplate.effectiveness.successCount / 
                                            bestTemplate.effectiveness.totalCount) * 100)}% effective
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          onClick={() => setEditingTemplate(bestTemplate)}
                                        >
                                          Use
                                        </Button>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                            </div>
                          </div>

                          {/* Situational Suggestions */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Situational Templates</h5>
                            <div className="space-y-2">
                              {noteTemplates
                                .filter(t => t.effectiveness.totalCount > 3)
                                .sort((a, b) => b.useCount - a.useCount)
                                .slice(0, 3)
                                .map(template => (
                                  <div 
                                    key={template.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{template.label}</p>
                                      <p className="text-xs text-gray-500">
                                        Used {template.useCount} times with {Math.round((template.effectiveness.successCount / 
                                          template.effectiveness.totalCount) * 100)}% success
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => setEditingTemplate(template)}
                                    >
                                      <i className="fas fa-arrow-right"></i>
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {noteTemplates
                      .filter(template => selectedCategory === 'All' || template.category === selectedCategory)
                      .map((template, index) => (
                      <div key={template.id} className="p-3 bg-gray-50 rounded-lg">
                        {editingTemplate?.id === template.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingTemplate.label}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, label: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                            />
                            <textarea
                              value={editingTemplate.text}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, text: e.target.value }))}
                              className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingTemplate(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  setNoteTemplates(prev => 
                                    prev.map(t => t.id === template.id ? editingTemplate : t)
                                  );
                                  setEditingTemplate(null);
                                  toast.addToast('Template updated successfully', 'success');
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium">{template.label}</h5>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingTemplate(template)}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setNoteTemplates(prev => prev.filter(t => t.id !== template.id));
                                    toast.addToast('Template deleted successfully', 'success');
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{template.text}</p>
                            <div className="text-xs text-gray-400">
                              Shortcut: Press {index + 1} to apply
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

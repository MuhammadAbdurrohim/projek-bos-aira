import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/router';
import { NAV_ITEMS } from '@/lib/constants';
import { ToastProvider } from '@/components/ui/toast';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-white border-r border-gray-200 w-64`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <i className="ri-store-2-line text-2xl text-gray-900"></i>
              <span className="text-xl font-semibold text-gray-900">Airastore</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname.startsWith(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} text-xl`}></i>
                  <span>{item.title}</span>
                </a>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
            <div className="px-4 py-4">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-900"
                  title="Sign out"
                >
                  <i className="ri-logout-box-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`${sidebarOpen ? 'lg:ml-64' : ''}`}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center flex-1">
                  <button
                    onClick={toggleSidebar}
                    className="text-gray-500 hover:text-gray-900 focus:outline-none"
                  >
                    <i className={`ri-${sidebarOpen ? 'menu-fold-line' : 'menu-unfold-line'} text-xl`}></i>
                  </button>
                  
                  {/* Breadcrumb - can be added here */}
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <button className="text-gray-500 hover:text-gray-900">
                    <i className="ri-notification-3-line text-xl"></i>
                  </button>

                  {/* Settings */}
                  <a 
                    href="/dashboard/pengaturan"
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <i className="ri-settings-3-line text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
      </div>
    </ToastProvider>
  );
}

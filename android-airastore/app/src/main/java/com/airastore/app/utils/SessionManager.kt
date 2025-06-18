package com.airastore.app.utils

import android.content.Context
import android.content.SharedPreferences
import com.airastore.app.AiraStoreApp.Companion.PREF_DARK_MODE
import com.airastore.app.AiraStoreApp.Companion.PREF_FCM_TOKEN
import com.airastore.app.AiraStoreApp.Companion.PREF_FIRST_TIME
import com.airastore.app.AiraStoreApp.Companion.PREF_NAME
import com.airastore.app.AiraStoreApp.Companion.PREF_NOTIFICATION
import com.airastore.app.AiraStoreApp.Companion.PREF_USER_ID
import com.airastore.app.AiraStoreApp.Companion.PREF_USER_TOKEN
import com.airastore.app.models.User
import com.google.gson.Gson

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    private val editor: SharedPreferences.Editor = prefs.edit()
    private val gson = Gson()

    /**
     * Save user session data
     */
    fun saveUser(user: User) {
        editor.putString(PREF_USER_ID, user.id)
        editor.putString("user_data", gson.toJson(user))
        editor.apply()
    }

    /**
     * Get logged in user data
     */
    fun getUser(): User? {
        val userData = prefs.getString("user_data", null)
        return if (userData != null) {
            gson.fromJson(userData, User::class.java)
        } else {
            null
        }
    }

    /**
     * Save authentication token
     */
    fun saveAuthToken(token: String) {
        editor.putString(PREF_USER_TOKEN, token)
        editor.apply()
    }

    /**
     * Get authentication token
     */
    fun getAuthToken(): String? {
        return prefs.getString(PREF_USER_TOKEN, null)
    }

    /**
     * Save FCM token
     */
    fun saveFCMToken(token: String) {
        editor.putString(PREF_FCM_TOKEN, token)
        editor.apply()
    }

    /**
     * Get FCM token
     */
    fun getFCMToken(): String? {
        return prefs.getString(PREF_FCM_TOKEN, null)
    }

    /**
     * Check if user is logged in
     */
    fun isLoggedIn(): Boolean {
        return getAuthToken() != null && getUser() != null
    }

    /**
     * Clear session data
     */
    fun clearSession() {
        editor.remove(PREF_USER_TOKEN)
        editor.remove(PREF_USER_ID)
        editor.remove("user_data")
        editor.apply()
    }

    /**
     * Check if it's first time launch
     */
    fun isFirstTimeLaunch(): Boolean {
        return prefs.getBoolean(PREF_FIRST_TIME, true)
    }

    /**
     * Set first time launch to false
     */
    fun setFirstTimeLaunch(isFirstTime: Boolean) {
        editor.putBoolean(PREF_FIRST_TIME, isFirstTime)
        editor.apply()
    }

    /**
     * Get/Set dark mode preference
     */
    var isDarkMode: Boolean
        get() = prefs.getBoolean(PREF_DARK_MODE, false)
        set(value) {
            editor.putBoolean(PREF_DARK_MODE, value)
            editor.apply()
        }

    /**
     * Get/Set notification preference
     */
    var isNotificationEnabled: Boolean
        get() = prefs.getBoolean(PREF_NOTIFICATION, true)
        set(value) {
            editor.putBoolean(PREF_NOTIFICATION, value)
            editor.apply()
        }

    /**
     * Save cart items count
     */
    fun saveCartCount(count: Int) {
        editor.putInt("cart_count", count)
        editor.apply()
    }

    /**
     * Get cart items count
     */
    fun getCartCount(): Int {
        return prefs.getInt("cart_count", 0)
    }

    /**
     * Save last sync timestamp
     */
    fun saveLastSyncTime(timestamp: Long) {
        editor.putLong("last_sync", timestamp)
        editor.apply()
    }

    /**
     * Get last sync timestamp
     */
    fun getLastSyncTime(): Long {
        return prefs.getLong("last_sync", 0)
    }

    /**
     * Save search history
     */
    fun saveSearchHistory(searches: Set<String>) {
        editor.putStringSet("search_history", searches)
        editor.apply()
    }

    /**
     * Get search history
     */
    fun getSearchHistory(): Set<String> {
        return prefs.getStringSet("search_history", setOf()) ?: setOf()
    }

    /**
     * Clear search history
     */
    fun clearSearchHistory() {
        editor.remove("search_history")
        editor.apply()
    }
}

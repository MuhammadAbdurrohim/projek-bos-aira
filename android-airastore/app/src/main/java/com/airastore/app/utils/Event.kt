package com.airastore.app.utils

/**
 * Used as a wrapper for data that is exposed via a LiveData that represents an event.
 * This is used to prevent multiple observers from handling the same event multiple times.
 */
open class Event<out T>(private val content: T) {

    var hasBeenHandled = false
        private set // Allow external read but not write

    /**
     * Returns the content and prevents its use again.
     */
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) {
            null
        } else {
            hasBeenHandled = true
            content
        }
    }

    /**
     * Returns the content, even if it's already been handled.
     */
    fun peekContent(): T = content

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Event<*>

        if (content != other.content) return false
        if (hasBeenHandled != other.hasBeenHandled) return false

        return true
    }

    override fun hashCode(): Int {
        var result = content?.hashCode() ?: 0
        result = 31 * result + hasBeenHandled.hashCode()
        return result
    }

    override fun toString(): String {
        return "Event(content=$content, hasBeenHandled=$hasBeenHandled)"
    }
}

/**
 * An [Event] subclass that specifically wraps resource states.
 */
class ResourceEvent<T>(content: Resource<T>) : Event<Resource<T>>(content)

/**
 * A generic class that holds a value with its loading status.
 */
sealed class Resource<out T> {
    data class Success<out T>(val data: T) : Resource<T>()
    data class Error(val exception: Exception) : Resource<Nothing>()
    object Loading : Resource<Nothing>()

    override fun toString(): String {
        return when (this) {
            is Success<*> -> "Success[data=$data]"
            is Error -> "Error[exception=$exception]"
            Loading -> "Loading"
        }
    }
}

/**
 * Extension function to create a [ResourceEvent] from a [Resource].
 */
fun <T> Resource<T>.toEvent(): ResourceEvent<T> = ResourceEvent(this)

/**
 * Extension function to create a [Resource.Success] with the given data.
 */
fun <T> T.toSuccess(): Resource<T> = Resource.Success(this)

/**
 * Extension function to create a [Resource.Error] with the given exception.
 */
fun Exception.toError(): Resource<Nothing> = Resource.Error(this)

/**
 * Extension function to create an [Event] with the given content.
 */
fun <T> T.toEvent(): Event<T> = Event(this)

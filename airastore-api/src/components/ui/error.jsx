export default function ErrorMessage({ message }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <i className="ri-error-warning-line text-red-400 text-xl"></i>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center">
        <i className="ri-error-warning-line text-red-400 text-4xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong!</h3>
        <p className="text-sm text-gray-500 mb-4">{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
        >
          <i className="ri-refresh-line mr-2"></i>
          Try again
        </button>
      </div>
    </div>
  );
}

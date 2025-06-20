export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <i className="ri-store-2-line text-3xl text-gray-900"></i>
            <span className="text-2xl font-bold text-gray-900">Airastore</span>
          </div>
        </div>

        {/* Auth Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Airastore. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Language Selector */}
      <div className="fixed bottom-4 right-4">
        <select
          className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
          defaultValue="en"
        >
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
      </div>
    </div>
  );
}

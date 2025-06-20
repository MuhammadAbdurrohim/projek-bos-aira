import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Airastore Admin',
  description: 'Admin dashboard for Airastore e-commerce platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Remixicon */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </ToastProvider>

        <style jsx global>{`
          :root {
            --font-inter: 'Inter', sans-serif;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: var(--font-inter);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Custom scrollbar styles */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Dialog styles */
          dialog {
            max-width: 100%;
            max-height: 100vh;
            border: none;
            padding: 0;
            margin: auto;
          }

          dialog::backdrop {
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
        `}</style>
      </body>
    </html>
  );
}

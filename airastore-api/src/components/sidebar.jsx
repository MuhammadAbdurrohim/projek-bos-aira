import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'grid-2' },
    { name: 'Products', href: '/dashboard/produk', icon: 'box' },
    { name: 'Categories', href: '/dashboard/kategori', icon: 'list' },
    { name: 'Orders', href: '/dashboard/pesanan', icon: 'shopping-cart' },
    { name: 'Users', href: '/dashboard/pengguna', icon: 'users' },
    { name: 'Settings', href: '/dashboard/pengaturan', icon: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <span className="text-xl font-bold text-white">Airastore Admin</span>
        </div>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <i className={`ri-${item.icon}-line mr-3 flex-shrink-0 h-6 w-6`}></i>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <i className="ri-logout-box-line mr-3 h-6 w-6"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

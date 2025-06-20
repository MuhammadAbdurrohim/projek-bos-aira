import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 1) return 'Dashboard';
    
    const titles = {
      'produk': 'Products',
      'kategori': 'Categories',
      'pesanan': 'Orders',
      'pengguna': 'Users',
      'pengaturan': 'Settings'
    };

    return titles[path[1]] || 'Dashboard';
  };

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getPageTitle()}
        </h1>
        
        {user && (
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              Welcome, {user.name}
            </span>
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

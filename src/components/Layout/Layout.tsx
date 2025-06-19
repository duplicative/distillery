import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/appStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
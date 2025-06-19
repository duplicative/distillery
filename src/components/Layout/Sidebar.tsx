import React from 'react';
import { Rss, Download, Edit, Archive, Plus, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TabType } from '../../types';
import { Button } from '../ui/Button';

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: 'rss', label: 'RSS Reader', icon: Rss },
  { id: 'fetch', label: 'Fetch URL', icon: Download },
  { id: 'editor', label: 'Notes Editor', icon: Edit },
  { id: 'store', label: 'Knowledge Store', icon: Archive },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarCollapsed } = useAppStore();

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Rss className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ReadLater
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your knowledge hub
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full justify-center"
        >
          Quick Add
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon 
                size={20} 
                className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'} 
              />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
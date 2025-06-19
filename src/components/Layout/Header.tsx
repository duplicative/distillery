import React from 'react';
import { Sun, Moon, Monitor, Menu, X, Settings } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    sidebarCollapsed, 
    toggleSidebar,
    activeTab 
  } = useAppStore();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'rss': return 'RSS Reader';
      case 'fetch': return 'URL to Markdown';
      case 'editor': return 'Notes Editor';
      case 'store': return 'Knowledge Store';
      default: return 'RSS Reader';
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={sidebarCollapsed ? Menu : X}
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getTabTitle(activeTab)}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ThemeIcon}
            onClick={cycleTheme}
            title={`Current theme: ${theme}. Click to cycle.`}
          >
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Settings}
            title="Settings"
          >
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
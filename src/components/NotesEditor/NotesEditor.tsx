import React, { useState } from 'react';
import { Edit, FileText, Save, Palette } from 'lucide-react';
import { Button } from '../ui/Button';

export const NotesEditor: React.FC = () => {
  const [hasContent, setHasContent] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notes Editor
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={Palette}>
              Highlight
            </Button>
            <Button variant="ghost" size="sm" icon={FileText}>
              Export
            </Button>
            <Button variant="primary" size="sm" icon={Save}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Edit size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Notes Editor</p>
            <p className="text-sm">Coming Soon - WYSIWYG editor with highlighting and annotations</p>
          </div>
        </div>

        {/* Notes Panel */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            Notes & Highlights
          </h3>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-sm">No notes yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};
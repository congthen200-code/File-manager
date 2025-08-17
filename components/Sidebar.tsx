import React from 'react';
import { TagIcon, FolderIcon } from './icons';

interface SidebarProps {
  tags: string[];
  frequentTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  fileCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ tags, frequentTags, selectedTag, onSelectTag, fileCount }) => {
  return (
    <aside className="w-64 bg-surface text-text-secondary p-6 flex-shrink-0 border-r border-border-color flex flex-col">
      <div className="flex items-center mb-8">
        <FolderIcon className="w-8 h-8 text-primary" />
        <h2 className="text-xl font-bold ml-3 text-text-primary">Quản Lý Tệp</h2>
      </div>
      <nav className="flex flex-col space-y-2 flex-grow overflow-hidden">
        <h3 className="px-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Điều Hướng</h3>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onSelectTag(null); }}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedTag === null
              ? 'bg-primary/20 text-primary'
              : 'hover:bg-gray-700 hover:text-text-primary'
          }`}
        >
          Tất Cả Tệp
          <span className="ml-auto inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-600 text-gray-200">{fileCount}</span>
        </a>

        {frequentTags.length > 0 && (
          <>
            <h3 className="px-3 pt-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Thẻ Thường Dùng</h3>
            <div className="px-3 py-2 flex flex-wrap gap-2">
              {frequentTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-primary text-white'
                      : 'bg-primary/20 text-primary hover:bg-primary/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}
        
        <h3 className="px-3 pt-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Tất Cả Thẻ</h3>
        <div className="overflow-y-auto">
        {tags.map(tag => (
          <a
            key={tag}
            href="#"
            onClick={(e) => { e.preventDefault(); onSelectTag(tag); }}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTag === tag
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-gray-700 hover:text-text-primary'
            }`}
          >
            <TagIcon className="w-4 h-4 mr-3" />
            <span className="truncate">{tag}</span>
          </a>
        ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import { TagIcon, FolderIcon, PlusIcon, UploadIcon, DownloadIcon } from './icons';

interface SidebarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  fileCount: number;
  onAddNew: () => void;
  onImport: () => void;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    tags, 
    selectedTag, 
    onSelectTag, 
    fileCount,
    onAddNew,
    onImport,
    onExport
}) => {
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

        <div className="pt-2 grid grid-cols-3 gap-2">
            <button
                onClick={onAddNew}
                className="flex items-center justify-center bg-primary hover:bg-indigo-500 text-white font-bold py-2.5 px-3 rounded-lg transition-colors duration-300"
                title="Thêm Mới"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
             <button
                onClick={onImport}
                className="flex items-center justify-center bg-secondary hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-lg transition-colors duration-300"
                title="Nhập từ Excel"
              >
              <UploadIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onExport}
                className="flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2.5 px-3 rounded-lg transition-colors duration-300"
                title="Xuất ra Excel"
              >
              <DownloadIcon className="w-5 h-5" />
            </button>
        </div>

        <h3 className="px-3 pt-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Thẻ</h3>
        
        <div className="overflow-y-auto border-t border-border-color mt-2 pt-2">
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
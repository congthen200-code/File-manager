import React, { useState } from 'react';
import { type FileEntry } from '../types';
import { EditIcon, TrashIcon, ClipboardIcon, CheckIcon } from './icons';

interface FileCardProps {
  file: FileEntry;
  onEdit: (file: FileEntry) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onEdit, onDelete, onTagClick }) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleCopy = (text: string, type: 'path' | 'password') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'path') {
        setCopiedPath(true);
        setTimeout(() => setCopiedPath(false), 2000);
    } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 duration-300 border border-border-color flex flex-col">
      <img
        src={file.imageUrl || `https://picsum.photos/seed/${file.id}/300/300`}
        alt={file.name}
        className="w-full aspect-square object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/300/300'; }}
      />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-text-primary truncate mb-2" title={file.name}>{file.name}</h3>
        
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {file.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-primary/40 transition-colors"
              >
                {tag}
              </button>
            ))}
            {file.tags.length > 3 && (
              <span className="bg-gray-600 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                +{file.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex justify-between items-center border-t border-border-color">
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => handleCopy(file.path, 'path')} 
                className={`flex items-center text-xs font-semibold py-1 px-2.5 rounded-md transition-all duration-300 ${copiedPath ? 'bg-secondary text-white' : 'bg-primary/20 text-primary hover:bg-primary/40'}`}
                title={file.path}
            >
                {copiedPath ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                <span className="ml-1.5">{copiedPath ? 'Đã chép' : 'Đường dẫn'}</span>
            </button>

            {file.password && (
                <button 
                    onClick={() => handleCopy(file.password || '', 'password')} 
                    className={`flex items-center text-xs font-semibold py-1 px-2.5 rounded-md transition-all duration-300 ${copiedPassword ? 'bg-secondary text-white' : 'bg-gray-600 text-text-secondary hover:bg-gray-500'}`}
                    title="Sao chép mật khẩu"
                >
                    {copiedPassword ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                    <span className="ml-1.5">{copiedPassword ? 'Đã chép' : 'Mật khẩu'}</span>
                </button>
            )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button onClick={() => onEdit(file)} className="text-blue-400 hover:text-blue-300 p-1 rounded-full transition" title="Chỉnh sửa">
            <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(file.id)} className="text-red-400 hover:text-red-300 p-1 rounded-full transition" title="Xoá">
            <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
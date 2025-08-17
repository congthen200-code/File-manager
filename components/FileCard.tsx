import React, { useState } from 'react';
import { type FileEntry } from '../types';
import { EditIcon, TrashIcon, ClipboardIcon, CheckIcon } from './icons';

interface FileCardProps {
  file: FileEntry;
  onEdit: (file: FileEntry) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  size: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large';
}

const FileCard: React.FC<FileCardProps> = ({ file, onEdit, onDelete, onTagClick, size }) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleCopy = (text: string, type: 'path' | 'password') => {
    if (!text) {
      if (type === 'path') {
        alert("Đường dẫn tệp hiện đang trống.\n\nMẹo: Để lấy đường dẫn tệp trên Windows, bạn có thể giữ phím Shift, sau đó chuột phải vào tệp và chọn 'Copy as path'.");
      }
      return;
    }
    navigator.clipboard.writeText(text);
    if (type === 'path') {
        setCopiedPath(true);
        setTimeout(() => setCopiedPath(false), 2000);
    } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
    }
  };
  
  const sizeStyles = {
    xxsmall: {
      padding: 'p-1.5',
      title: 'text-xs',
      description: 'hidden',
      tagsContainer: 'hidden',
      actions: 'p-1.5',
      actionButtonText: 'hidden',
      buttonPadding: 'p-1.5',
      iconSize: 'w-4 h-4',
    },
    xsmall: {
      padding: 'p-2',
      title: 'text-sm',
      description: 'block mt-0.5 text-xs text-text-secondary line-clamp-1',
      tagsContainer: 'hidden',
      actions: 'p-2',
      actionButtonText: 'hidden',
      buttonPadding: 'p-1.5',
      iconSize: 'w-4 h-4',
    },
    small: {
      padding: 'p-3',
      title: 'text-base',
      description: 'block mt-1 text-xs text-text-secondary line-clamp-1',
      tagsContainer: 'mt-1.5',
      actions: 'px-3 py-2',
      actionButtonText: 'ml-1.5',
      buttonPadding: 'py-1 px-2',
      iconSize: 'w-5 h-5',
    },
    medium: {
      padding: 'p-4',
      title: 'text-lg',
      description: 'block mt-1 text-sm text-text-secondary line-clamp-2',
      tagsContainer: 'mt-2',
      actions: 'px-4 py-3',
      actionButtonText: 'ml-1.5',
      buttonPadding: 'py-1 px-2.5',
      iconSize: 'w-5 h-5',
    },
    large: {
      padding: 'p-5',
      title: 'text-xl',
      description: 'block mt-2 text-sm text-text-secondary line-clamp-2',
      tagsContainer: 'mt-2',
      actions: 'px-5 py-4',
      actionButtonText: 'ml-1.5',
      buttonPadding: 'py-1.5 px-3',
      iconSize: 'w-5 h-5',
    }
  };

  const styles = sizeStyles[size];
  const showTags = size !== 'xxsmall' && size !== 'xsmall';

  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 duration-300 border border-border-color flex flex-col">
      <img
        src={file.imageUrl || `https://picsum.photos/seed/${file.id}/300/300`}
        alt={file.name}
        className="w-full aspect-square object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/300/300'; }}
      />
      <div className={`${styles.padding} flex-grow flex flex-col`}>
        <h3 className={`${styles.title} font-bold text-text-primary truncate mb-1`} title={file.name}>{file.name}</h3>
        
        {file.description && (
             <p className={styles.description} title={file.description}>{file.description}</p>
        )}
        
        {showTags && file.tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${styles.tagsContainer}`}>
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
      <div className={`${styles.actions} flex items-center gap-2 border-t border-border-color`}>
          <button 
              onClick={() => handleCopy(file.path, 'path')} 
              className={`flex items-center justify-center text-xs font-semibold rounded-md transition-all duration-300 ${styles.buttonPadding} ${copiedPath ? 'bg-secondary text-white' : 'bg-primary/20 text-primary hover:bg-primary/40'}`}
              title={file.path || "Hướng dẫn lấy đường dẫn"}
          >
              {copiedPath ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
              <span className={styles.actionButtonText}>{copiedPath ? 'Đã chép' : 'Đường dẫn'}</span>
          </button>

          {file.password && (
              <button 
                  onClick={() => handleCopy(file.password || '', 'password')} 
                  className={`flex items-center justify-center text-xs font-semibold rounded-md transition-all duration-300 ${styles.buttonPadding} ${copiedPassword ? 'bg-secondary text-white' : 'bg-gray-600 text-text-secondary hover:bg-gray-500'}`}
                  title="Sao chép mật khẩu"
              >
                  {copiedPassword ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                  <span className={styles.actionButtonText}>{copiedPassword ? 'Đã chép' : 'Mật khẩu'}</span>
              </button>
          )}
        <div className="flex-grow"></div>
        <button onClick={() => onEdit(file)} className={`text-blue-400 hover:text-blue-300 rounded-full transition ${styles.buttonPadding}`} title="Chỉnh sửa">
          <EditIcon className={styles.iconSize} />
        </button>
        <button onClick={() => onDelete(file.id)} className={`text-red-400 hover:text-red-300 rounded-full transition ${styles.buttonPadding}`} title="Xoá">
          <TrashIcon className={styles.iconSize} />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
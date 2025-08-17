import React from 'react';
import { type FileEntry } from '../types';
import FileCard from './FileCard';

interface FileListProps {
  files: FileEntry[];
  onEdit: (file: FileEntry) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  cardSize: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large';
}

const FileList: React.FC<FileListProps> = ({ files, onEdit, onDelete, onTagClick, cardSize }) => {
  const gridClasses = {
    xxsmall: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2',
    xsmall: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3',
    small: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
    medium: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8',
  };

  return (
    <div className={`grid ${gridClasses[cardSize]}`}>
      {files.map(file => (
        <FileCard key={file.id} file={file} onEdit={onEdit} onDelete={onDelete} onTagClick={onTagClick} size={cardSize} />
      ))}
    </div>
  );
};

export default FileList;
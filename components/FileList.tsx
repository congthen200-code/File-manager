
import React from 'react';
import { type FileEntry } from '../types';
import FileCard from './FileCard';

interface FileListProps {
  files: FileEntry[];
  onEdit: (file: FileEntry) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onEdit, onDelete, onTagClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map(file => (
        <FileCard key={file.id} file={file} onEdit={onEdit} onDelete={onDelete} onTagClick={onTagClick} />
      ))}
    </div>
  );
};

export default FileList;
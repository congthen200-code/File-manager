import React, { useState } from 'react';
import { XIcon } from './icons';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center w-full bg-background border border-border-color rounded-md p-2">
      {tags.map(tag => (
        <span key={tag} className="flex items-center bg-primary/20 text-primary text-sm font-medium mr-2 mb-1 px-2 py-1 rounded-full">
          {tag}
          <button onClick={() => removeTag(tag)} className="ml-2 text-primary hover:text-indigo-300">
             <XIcon className="w-3 h-3"/>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Thêm thẻ..."
        className="bg-transparent flex-grow text-text-primary focus:outline-none p-1"
      />
    </div>
  );
};

export default TagInput;
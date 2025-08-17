import React, { useState, useEffect } from 'react';
import { type FileEntry } from '../types';
import TagInput from './TagInput';

interface FileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: FileEntry) => void;
  file: FileEntry | null;
}

const FileFormModal: React.FC<FileFormModalProps> = ({ isOpen, onClose, onSave, file }) => {
  const [formData, setFormData] = useState<Omit<FileEntry, 'id'>>({
    name: '',
    path: '',
    description: '',
    installationNotes: '',
    imageUrl: '',
    password: '',
    tags: [],
  });

  useEffect(() => {
    if (file) {
      setFormData(file);
    } else {
      setFormData({
        name: '', path: '', description: '', installationNotes: '', imageUrl: '', password: '', tags: []
      });
    }
  }, [file, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.path) {
      alert('Tên tệp và Đường dẫn tệp là bắt buộc.');
      return;
    }
    onSave({ ...formData, id: file?.id || Date.now().toString() });
  };
  
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        onClick={onClose}
    >
      <div 
        className="bg-surface rounded-lg shadow-xl w-full max-w-2xl p-8 m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-text-primary mb-6">{file ? 'Chỉnh Sửa Mục Tệp' : 'Thêm Mục Tệp Mới'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Tên Tệp *</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="path" className="block text-sm font-medium text-text-secondary mb-1">Đường Dẫn Tệp *</label>
                <input type="text" name="path" id="path" value={formData.path} onChange={handleChange} required className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Mô Tả</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="installationNotes" className="block text-sm font-medium text-text-secondary mb-1">Ghi Chú Cài Đặt</label>
                <textarea name="installationNotes" id="installationNotes" value={formData.installationNotes} onChange={handleChange} rows={3} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
             <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Mật Khẩu (nếu có)</label>
                <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary mb-1">URL Hình Ảnh</label>
                <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">Thẻ</label>
                <TagInput tags={formData.tags} onTagsChange={handleTagsChange} />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition">Hủy</button>
            <button type="submit" className="py-2 px-4 bg-primary hover:bg-indigo-500 text-white font-bold rounded-md transition">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileFormModal;
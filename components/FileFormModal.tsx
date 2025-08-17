import React, { useState, useEffect, useRef } from 'react';
import { type FileEntry } from '../types';
import TagInput from './TagInput';
import { EyeIcon, EyeOffIcon, SparklesIcon, ImageIcon, FolderOpenIcon } from './icons';
import { generateTagsWithAI, generateDescriptionWithAI } from '../lib/gemini';

interface FileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: FileEntry) => void;
  file: FileEntry | null;
}

// Helper function to resize image and convert to base64 Data URL
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Không thể đọc tệp."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Không thể lấy context của canvas.'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG for better compression, which is crucial for fitting into an Excel cell.
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};


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
  const [showPassword, setShowPassword] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
        if (file) {
            // Create a deep copy to avoid mutating the original state directly
            setFormData({ ...file, tags: [...(file.tags || [])] });
        } else {
            setFormData({
                name: '', path: '', description: '', installationNotes: '', imageUrl: '', password: '', tags: []
            });
        }
        setShowPassword(false); // Reset password visibility
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

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    const contentToAnalyze = `${formData.name}\n${formData.description}\n${formData.installationNotes}`;
    try {
        const suggestedTags = await generateTagsWithAI(contentToAnalyze);
        if (suggestedTags) {
            // Combine new tags with existing ones, removing duplicates
            const combinedTags = [...new Set([...formData.tags, ...suggestedTags])];
            handleTagsChange(combinedTags);
        }
    } catch (error) {
        console.error("AI tag suggestion failed:", error);
        alert("Không thể gợi ý thẻ vào lúc này. Vui lòng thử lại sau.");
    } finally {
        setIsSuggestingTags(false);
    }
  };

  const handleSuggestDescription = async () => {
    if (!formData.name) {
        alert("Vui lòng nhập Tên Tệp trước khi gợi ý mô tả.");
        return;
    }
    setIsSuggestingDescription(true);
    try {
        const suggestedDescription = await generateDescriptionWithAI(formData.name);
        if (suggestedDescription) {
            setFormData(prev => ({...prev, description: suggestedDescription}));
        } else {
             alert("AI không thể tạo mô tả cho tên tệp này. Vui lòng thử một tên khác hoặc viết mô tả thủ công.");
        }
    } catch (error) {
        console.error("AI description suggestion failed:", error);
        alert("Không thể gợi ý mô tả vào lúc này. Vui lòng thử lại sau.");
    } finally {
        setIsSuggestingDescription(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn một tệp hình ảnh.');
        return;
      }
      // Increased limit for the source file, as it will be resized.
      if (file.size > 10 * 1024 * 1024) { // 10MB size limit for source image
        alert('Kích thước hình ảnh gốc quá lớn. Vui lòng chọn ảnh dưới 10MB.');
        return;
      }
      try {
        // Resize image to ensure its base64 representation fits within Excel's cell character limit.
        // 200x200 @ 70% quality JPEG should be well under the ~32k character limit.
        const resizedImageBase64 = await resizeImage(file, 200, 200, 0.7);
        setFormData(prev => ({ ...prev, imageUrl: resizedImageBase64 }));
      } catch (error) {
          console.error("Lỗi khi thay đổi kích thước ảnh:", error);
          alert('Đã xảy ra lỗi khi xử lý hình ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handleBrowseClick = () => {
    alert("Vì lý do bảo mật, ứng dụng không thể tự động lấy đường dẫn đầy đủ của tệp.\n\nMẹo: Trên Windows, bạn có thể giữ phím Shift và chuột phải vào tệp, sau đó chọn 'Copy as path' để sao chép đường dẫn và dán vào đây.");
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
                <div className="relative flex items-center">
                    <input type="text" name="path" id="path" value={formData.path} onChange={handleChange} required className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary pr-10"/>
                    <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
                        title="Hướng dẫn lấy đường dẫn tệp"
                    >
                        <FolderOpenIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="md:col-span-2">
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Mô Tả</label>
                    <button
                        type="button"
                        onClick={handleSuggestDescription}
                        disabled={isSuggestingDescription || !formData.name}
                        className="flex items-center text-sm text-primary hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!formData.name ? "Nhập tên tệp để bật" : "Gợi ý mô tả bằng AI"}
                    >
                        <SparklesIcon className="w-4 h-4 mr-1"/>
                        {isSuggestingDescription ? 'Đang xử lý...' : 'Gợi ý AI'}
                    </button>
                </div>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="installationNotes" className="block text-sm font-medium text-text-secondary mb-1">Ghi Chú Cài Đặt</label>
                <textarea name="installationNotes" id="installationNotes" value={formData.installationNotes} onChange={handleChange} rows={3} className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
             <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Mật Khẩu (nếu có)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 pr-10 focus:ring-primary focus:border-primary"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
            </div>
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary">URL Hình Ảnh</label>
                     <label
                        htmlFor="image-upload-input"
                        className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        title="Tải ảnh lên từ máy tính"
                    >
                        <ImageIcon className="w-4 h-4 mr-1"/>
                        Tải Lên
                     </label>
                </div>
                <input
                    id="image-upload-input"
                    type="file"
                    onChange={handleImageFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Dán URL hoặc tải ảnh lên" className="w-full bg-background border border-border-color text-text-primary rounded-md p-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="md:col-span-2">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-text-secondary">Thẻ</label>
                    <button
                        type="button"
                        onClick={handleSuggestTags}
                        disabled={isSuggestingTags}
                        className="flex items-center text-sm text-primary hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        <SparklesIcon className="w-4 h-4 mr-1"/>
                        {isSuggestingTags ? 'Đang xử lý...' : 'Gợi ý thẻ'}
                    </button>
                </div>
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
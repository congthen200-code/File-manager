import React, { useState, useMemo, useCallback, useRef } from 'react';
import { type FileEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import FileFormModal from './components/FileFormModal';
import { PlusIcon, UploadIcon, DownloadIcon } from './components/icons';

declare var XLSX: any;

const App: React.FC = () => {
  const [files, setFiles] = useLocalStorage<FileEntry[]>('files', []);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    files.forEach(file => file.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [files]);

  const frequentTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    files.forEach(file => {
        file.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    return Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .slice(0, 5) // Get top 5
        .map(entry => entry[0]); // Get just the tag name
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const tagMatch = selectedTag ? file.tags.includes(selectedTag) : true;
      const searchMatch = searchTerm
        ? file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return tagMatch && searchMatch;
    });
  }, [files, selectedTag, searchTerm]);
  
  const handleSaveFile = useCallback((fileToSave: FileEntry) => {
    if (editingFile) {
      setFiles(files.map(f => f.id === fileToSave.id ? fileToSave : f));
    } else {
      setFiles([...files, { ...fileToSave, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingFile(null);
  }, [files, editingFile, setFiles]);

  const handleEditFile = useCallback((file: FileEntry) => {
    setEditingFile(file);
    setIsModalOpen(true);
  }, []);

  const handleDeleteFile = useCallback((id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
        setFiles(files.filter(f => f.id !== id));
    }
  }, [files, setFiles]);

  const openAddNewModal = useCallback(() => {
    setEditingFile(null);
    setIsModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (files.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const dataToExport = files.map(file => ({
      ...file,
      tags: file.tags.join(', ') // Convert tags array to a comma-separated string
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Files");
    XLSX.writeFile(workbook, "database.xlsx");
  }, [files]);
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const importedFiles: FileEntry[] = json.map((row, index) => ({
          id: row.id?.toString() || `${Date.now()}-${index}`,
          name: row.name || '',
          path: row.path || '',
          description: row.description || '',
          installationNotes: row.installationNotes || '',
          imageUrl: row.imageUrl || '',
          password: row.password || '',
          tags: typeof row.tags === 'string' && row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
        }));

        if (window.confirm('Bạn có chắc chắn muốn ghi đè tất cả dữ liệu hiện tại bằng nội dung từ tệp này không? Thao tác này không thể hoàn tác.')) {
          setFiles(importedFiles);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Đã xảy ra lỗi khi đọc tệp Excel. Vui lòng đảm bảo tệp có định dạng đúng.");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
  };


  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        tags={allTags}
        frequentTags={frequentTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        fileCount={files.length}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-3xl font-bold text-text-primary">Trình Quản Lý Tệp</h1>
            <p className="text-text-secondary mt-1">Quản lý siêu dữ liệu tệp cục bộ của bạn một cách dễ dàng.</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 md:w-72 bg-surface text-text-primary px-4 py-2 rounded-lg border border-border-color focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <button
                onClick={handleImportClick}
                className="flex items-center bg-secondary hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                title="Nhập từ Excel"
              >
              <UploadIcon className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Nhập</span>
            </button>
            <button
                onClick={handleExport}
                className="flex items-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                title="Xuất ra Excel"
              >
              <DownloadIcon className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Xuất</span>
            </button>
            <button
              onClick={openAddNewModal}
              className="flex items-center bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm Mới
            </button>
          </div>
        </header>
        
        {filteredFiles.length > 0 ? (
           <FileList files={filteredFiles} onEdit={handleEditFile} onDelete={handleDeleteFile} onTagClick={setSelectedTag} />
        ) : (
            <div className="text-center py-20">
                <p className="text-text-secondary text-lg">Không tìm thấy tệp nào. Thêm tệp mới để bắt đầu!</p>
            </div>
        )}
      </main>

      {isModalOpen && (
        <FileFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFile(null);
          }}
          onSave={handleSaveFile}
          file={editingFile}
        />
      )}
    </div>
  );
};

export default App;
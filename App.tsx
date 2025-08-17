import React, { useState, useMemo, useCallback, useRef } from 'react';
import { type FileEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import FileFormModal from './components/FileFormModal';
import { SettingsIcon } from './components/icons';

declare var XLSX: any;

type CardSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large';

const App: React.FC = () => {
  const [files, setFiles] = useLocalStorage<FileEntry[]>('files', []);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null);
  const [cardSize, setCardSize] = useLocalStorage<CardSize>('cardSize', 'medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);


  const allTags = useMemo(() => {
    const tags = new Set<string>();
    files.forEach(file => file.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
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

  const handleCardSizeChange = (size: CardSize) => {
    setCardSize(size);
    setIsSettingsOpen(false);
  };
  
  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        tags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        fileCount={files.length}
        onAddNew={openAddNewModal}
        onImport={handleImportClick}
        onExport={handleExport}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-end items-center mb-8 gap-4 flex-wrap">
           <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".xlsx, .xls"
            />
          <div className="flex items-center space-x-2 md:space-x-4">
             <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 md:w-72 bg-surface text-text-primary px-4 py-2 rounded-lg border border-border-color focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            <div className="relative" ref={settingsRef}>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center bg-gray-600 hover:bg-gray-500 text-white font-bold p-2.5 rounded-lg transition-colors duration-300"
                    title="Cài đặt hiển thị"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
                {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-surface rounded-md shadow-lg z-10 border border-border-color">
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-400 px-2 mb-1">Kích Thước Thẻ</p>
                            <button onClick={() => handleCardSizeChange('xxsmall')} className={`w-full text-left text-sm px-2 py-1.5 rounded ${cardSize === 'xxsmall' ? 'bg-primary text-white' : 'hover:bg-gray-600'} `}>Siêu nhỏ</button>
                            <button onClick={() => handleCardSizeChange('xsmall')} className={`w-full text-left text-sm px-2 py-1.5 rounded ${cardSize === 'xsmall' ? 'bg-primary text-white' : 'hover:bg-gray-600'} `}>Rất nhỏ</button>
                            <button onClick={() => handleCardSizeChange('small')} className={`w-full text-left text-sm px-2 py-1.5 rounded ${cardSize === 'small' ? 'bg-primary text-white' : 'hover:bg-gray-600'} `}>Nhỏ</button>
                            <button onClick={() => handleCardSizeChange('medium')} className={`w-full text-left text-sm px-2 py-1.5 rounded ${cardSize === 'medium' ? 'bg-primary text-white' : 'hover:bg-gray-600'} `}>Vừa</button>
                            <button onClick={() => handleCardSizeChange('large')} className={`w-full text-left text-sm px-2 py-1.5 rounded ${cardSize === 'large' ? 'bg-primary text-white' : 'hover:bg-gray-600'} `}>Lớn</button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>
        
        {filteredFiles.length > 0 ? (
           <FileList files={filteredFiles} onEdit={handleEditFile} onDelete={handleDeleteFile} onTagClick={setSelectedTag} cardSize={cardSize} />
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
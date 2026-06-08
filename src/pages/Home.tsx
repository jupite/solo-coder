import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Upload } from 'lucide-react';
import { useReaderStore } from '@/store/readerStore';

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setBookFile } = useReaderStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.name.toLowerCase().endsWith('.epub')) {
      setBookFile(file);
      navigate('/reader');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <BookOpen className="w-16 h-16 mx-auto text-stone-600 mb-4" />
          <h1 className="text-3xl font-serif text-stone-800 mb-2">EPUB 阅读器</h1>
          <p className="text-stone-500 font-serif">打开本地电子书，享受沉浸式阅读</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-stone-500 bg-stone-100 scale-105'
              : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50'
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto text-stone-400 mb-4" />
          <p className="text-lg font-serif text-stone-600 mb-2">
            点击或拖拽 EPUB 文件到此处
          </p>
          <p className="text-sm text-stone-400">支持 .epub 格式文件</p>

          <button
            type="button"
            className="mt-6 px-8 py-3 bg-stone-800 text-white rounded-lg font-medium
              hover:bg-stone-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            打开书籍
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".epub"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="mt-8 text-xs text-stone-400">
          所有数据均保存在本地浏览器中，您的隐私安全
        </p>
      </div>
    </div>
  );
}

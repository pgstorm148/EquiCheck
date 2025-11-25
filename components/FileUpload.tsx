import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  colorClass: string;
  onError: (message: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  file, 
  onFileSelect, 
  onRemove,
  colorClass,
  onError
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // 1. Check File Type
    if (file.type !== 'application/pdf') {
      onError(`Invalid file type: ${file.name}. Please upload a PDF document.`);
      return false;
    }

    // 2. Check File Size (20MB limit)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
      onError(`File is too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 20MB.`);
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onError(''); // Clear errors on success
        onFileSelect(droppedFile);
      }
    }
  }, [onFileSelect, onError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        onError(''); // Clear errors on success
        onFileSelect(selectedFile);
      } else {
        // Reset input so user can try again immediately
        e.target.value = '';
      }
    }
  };

  if (file) {
    return (
      <div className={`relative p-6 rounded-xl border-2 ${colorClass} bg-white shadow-sm transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={onRemove}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
        ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50 bg-white'}
      `}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center pointer-events-none">
        <div className="p-4 bg-indigo-50 rounded-full mb-4 text-indigo-600">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-500 mb-4">Drag & drop your PDF here</p>
        <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
          PDF up to 20MB
        </span>
      </div>
    </div>
  );
};
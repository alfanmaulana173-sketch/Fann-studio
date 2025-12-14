import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageFile | null;
  onImageChange: (image: ImageFile | null) => void;
  heightClass?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, heightClass = "h-64" }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onImageChange({
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          mimeType: file.type
        });
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file");
    };
    reader.readAsDataURL(file);
    
    // Reset value to allow re-uploading the same file if cleared externally
    event.target.value = '';
  }, [onImageChange]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onImageChange(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-medium text-emerald-900 ml-1">{label}</span>
      <div className={`relative w-full ${heightClass} rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-500 transition-colors bg-white/50 flex flex-col items-center justify-center cursor-pointer group overflow-hidden`}>
        
        {image ? (
          <>
            <img 
              src={image.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-sm z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-xs text-white truncate">{image.file.name}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center relative">
            <div className="p-4 bg-emerald-50 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors pointer-events-none">
              <Upload className="w-6 h-6 text-emerald-400 group-hover:text-emerald-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium pointer-events-none">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1 pointer-events-none">PNG, JPG up to 5MB</p>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
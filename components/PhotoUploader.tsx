import React, { useRef } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

interface PhotoUploaderProps {
  images: string[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ images, onUpload, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
    // CRITICAL FIX: Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const remainingSlots = 4 - images.length;

  return (
    <div className="w-full mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />
      
      {/* Grid of uploaded photos */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-[4/3] group rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <img 
              src={img} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-1 left-2 text-xs font-bold text-white drop-shadow-md">
              {index + 1}
            </div>
          </div>
        ))}
        
        {/* Placeholder slots */}
        {remainingSlots > 0 && Array.from({ length: remainingSlots }).map((_, i) => (
          <button
            key={`placeholder-${i}`}
            onClick={triggerUpload}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-brand-300 transition-colors"
          >
            <ImagePlus size={24} />
            <span className="text-xs mt-1">添加照片</span>
          </button>
        ))}
      </div>

      {images.length === 0 && (
         <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
           <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
           <p className="text-sm text-gray-500">上传 4 张照片开始制作</p>
           <button 
             onClick={triggerUpload}
             className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-full font-medium shadow-md active:scale-95 transition-transform"
           >
             选择照片
           </button>
         </div>
      )}
    </div>
  );
};
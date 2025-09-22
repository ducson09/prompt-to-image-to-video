import React, { useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageUpload: (base64: string) => void;
  onImageRemove: () => void;
  children?: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageUpload, onImageRemove, children }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
      <div
        className="aspect-square w-full rounded-md border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors flex items-center justify-center cursor-pointer relative group bg-cover bg-center"
        style={{ backgroundImage: image ? `url(${image})` : 'none' }}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        {!image && (
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-1 block text-sm">Tải ảnh lên</span>
          </div>
        )}
        {image && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageRemove();
            }}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Xóa ảnh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-sm text-center font-medium">{label}</div>
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
};

export default ImageUploader;
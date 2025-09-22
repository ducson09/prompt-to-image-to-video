import React, { useState } from 'react';
import { GeneratedImageResult } from '../types';
import GeneratedImage from './GeneratedImage';

interface ResultsPanelProps {
  images: GeneratedImageResult[];
  isLoading: boolean;
  error: string | null;
  onGenerateVideo: (imageId: number, prompt: string) => void;
}

const ImagePlaceholder: React.FC = () => (
  <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center animate-pulse">
    <svg className="w-12 h-12 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error, onGenerateVideo }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isLoading && images.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 h-96 rounded-lg border-2 border-dashed border-gray-700">
        <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-400">Kết quả sẽ xuất hiện ở đây</h3>
        <p className="mt-2 max-w-sm">Thiết lập các tùy chọn của bạn trong bảng điều khiển và nhấn "Tạo ảnh" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
          <strong className="font-bold">Tạo ảnh thất bại: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((result) => (
          (isLoading || !result.src) ? (
            <ImagePlaceholder key={result.id} />
          ) : (
            <GeneratedImage
              key={result.id}
              imageResult={result}
              onPreview={() => setPreviewImage(result.videoSrc || result.src)}
              onGenerateVideo={onGenerateVideo}
            />
          )
        ))}
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          {previewImage.startsWith('blob:') ? (
             <video 
              src={previewImage} 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
              controls autoPlay
            />
          ) : (
            <img 
              src={previewImage} 
              alt="Xem trước nội dung đã tạo" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          )}
          <button 
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setPreviewImage(null)}
            aria-label="Đóng xem trước"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;

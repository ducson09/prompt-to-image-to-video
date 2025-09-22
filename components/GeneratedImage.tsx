import React, { useState } from 'react';
import { DownloadIcon, EyeIcon, FilmIcon } from './Icons';
import { GeneratedImageResult } from '../types';

interface GeneratedImageProps {
  imageResult: GeneratedImageResult;
  onPreview: () => void;
  onGenerateVideo: (imageId: number, prompt: string) => void;
}

const VideoPromptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (prompt.trim()) {
            onSubmit(prompt);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4 text-purple-300">Tạo video từ ảnh</h3>
                <p className="text-sm text-gray-400 mb-4">Mô tả hành động hoặc chuyển động bạn muốn thêm vào ảnh này.</p>
                <textarea
                    className="w-full h-28 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
                    placeholder="VD: Cơn mưa nhẹ rơi, nhân vật mỉm cười"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    disabled={isLoading}
                />
                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-md">Hủy</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!prompt.trim() || isLoading}
                        className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const GeneratedImage: React.FC<GeneratedImageProps> = ({ imageResult, onPreview, onGenerateVideo }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { id, src, videoSrc, isGeneratingVideo, videoError } = imageResult;

    const handleDownload = (url: string, type: 'image' | 'video') => {
        const link = document.createElement('a');
        link.href = url;
        const extension = type === 'image' ? 'png' : 'mp4';
        link.download = `noi-dung-da-tao-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateVideoSubmit = (prompt: string) => {
        onGenerateVideo(id, prompt);
        setIsModalOpen(false);
    };
    
    const renderContent = () => {
        if (videoSrc) {
            return <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop muted />;
        }
        if (src) {
             return <img src={src} alt="Nhân vật đã tạo" className="w-full h-full object-cover" />;
        }
        return null;
    };

    return (
        <div className="aspect-square relative group bg-gray-900 rounded-lg overflow-hidden">
            {renderContent()}

            {isGeneratingVideo && (
                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 text-center">
                    <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold">Đang tạo video...</span>
                    <span className="text-sm text-gray-400 mt-1">Quá trình này có thể mất vài phút.</span>
                </div>
            )}
            
            {!isGeneratingVideo && src && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button
                        onClick={onPreview}
                        className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                        title="Xem trước"
                    >
                        <EyeIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => handleDownload(videoSrc || src!, videoSrc ? 'video' : 'image')}
                        className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                        title="Tải xuống"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                    {!videoSrc && (
                         <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                            title="Tạo video"
                        >
                            <FilmIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}

            {videoError && !isGeneratingVideo && (
                 <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-2 text-center text-xs text-red-200">
                    {videoError}
                </div>
            )}

            <VideoPromptModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleGenerateVideoSubmit}
                isLoading={isGeneratingVideo || false}
            />
        </div>
    );
};

export default GeneratedImage;

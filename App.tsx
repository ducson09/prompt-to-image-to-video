import React, { useState, useCallback } from 'react';
import { Character, GeneratedImageResult } from './types';
import { generateImage, generateVideo } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';

const initialCharacters: Character[] = [
  { id: 1, image: null, selected: true },
  { id: 2, image: null, selected: false },
  { id: 3, image: null, selected: false },
  { id: 4, image: null, selected: false },
];

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [useScene, setUseScene] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCharacterUpdate = useCallback((id: number, image: string | null, selected?: boolean) => {
    setCharacters(prev =>
      prev.map(char =>
        char.id === id
          ? { ...char, image: image !== undefined ? image : char.image, selected: selected !== undefined ? selected : char.selected }
          : char
      )
    );
  }, []);

  const handleSceneUpdate = useCallback((image: string | null) => {
    setSceneImage(image);
  }, []);

  const handleGenerate = async () => {
    const selectedCharacters = characters.filter(c => c.selected && c.image);
    if (!prompt) {
      setError('Vui lòng nhập câu lệnh để tạo ảnh.');
      return;
    }
    if (selectedCharacters.length === 0) {
      setError('Vui lòng tải lên và chọn ít nhất một nhân vật.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const imageCount = 2;
    setGeneratedImages(Array(imageCount).fill(null).map((_, i) => ({ id: i, src: null })));

    const imagePromises = Array(imageCount).fill(null).map(() => 
      generateImage(
        prompt, 
        selectedCharacters.map(c => c.image!), 
        useScene ? sceneImage : null
      )
    );

    const results = await Promise.allSettled(imagePromises);
    
    let firstError: string | null = null;
    const newImages: GeneratedImageResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { id: index, src: result.value };
      } else {
        console.error('Image generation failed:', result.reason);
        // Set error message from the first failure
        if (!firstError) {
            const reason = result.reason as Error;
            firstError = `Lỗi khi tạo ảnh ${index + 1}: ${reason.message || 'Đã xảy ra lỗi không xác định.'}`;
        }
        return { id: index, src: null };
      }
    });

    if(firstError) {
        setError(firstError);
    }
    setGeneratedImages(newImages);
    setIsLoading(false);
  };

  const handleGenerateVideo = async (imageId: number, videoPrompt: string) => {
    const imageToAnimate = generatedImages.find(img => img.id === imageId);
    if (!imageToAnimate || !imageToAnimate.src) {
        console.error("Source image not found for video generation.");
        return;
    }

    // Set loading state for the specific image
    setGeneratedImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, isGeneratingVideo: true, videoError: null } : img
    ));

    try {
        const videoUrl = await generateVideo(imageToAnimate.src, videoPrompt);
        setGeneratedImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, isGeneratingVideo: false, videoSrc: videoUrl } : img
        ));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        setGeneratedImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, isGeneratingVideo: false, videoError: `Tạo video thất bại: ${errorMessage}` } : img
        ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 fixed top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Tạo nhân vật AI nhất quán
        </h1>
      </header>
      <main className="flex flex-col md:flex-row pt-20">
        <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-gray-900/80 md:fixed md:h-full md:overflow-y-auto">
          <ControlPanel
            characters={characters}
            sceneImage={sceneImage}
            useScene={useScene}
            prompt={prompt}
            onCharacterUpdate={handleCharacterUpdate}
            onSceneUpdate={handleSceneUpdate}
            onUseSceneChange={setUseScene}
            onPromptChange={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4 md:ml-[33.3333%] lg:ml-[25%] p-6">
          <ResultsPanel
            images={generatedImages}
            isLoading={isLoading}
            error={error}
            onGenerateVideo={handleGenerateVideo}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
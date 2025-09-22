import React from 'react';
import { Character } from '../types';
import ImageUploader from './ImageUploader';
import { Checkbox } from './Checkbox';

interface ControlPanelProps {
  characters: Character[];
  sceneImage: string | null;
  useScene: boolean;
  prompt: string;
  onCharacterUpdate: (id: number, image: string | null, selected?: boolean) => void;
  onSceneUpdate: (image: string | null) => void;
  onUseSceneChange: (checked: boolean) => void;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const GenerateButton: React.FC<{ onClick: () => void; isLoading: boolean }> = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out flex items-center justify-center"
  >
    {isLoading ? (
       <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tạo...
      </>
    ) : (
      'Tạo ảnh'
    )}
  </button>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
  characters,
  sceneImage,
  useScene,
  prompt,
  onCharacterUpdate,
  onSceneUpdate,
  onUseSceneChange,
  onPromptChange,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Nhân vật tham chiếu</h2>
        <div className="grid grid-cols-2 gap-4">
          {characters.map(char => (
            <ImageUploader
              key={char.id}
              label={`Nhân vật ${char.id}`}
              image={char.image}
              onImageUpload={image => onCharacterUpdate(char.id, image)}
              onImageRemove={() => onCharacterUpdate(char.id, null)}
            >
              <Checkbox
                id={`char-check-${char.id}`}
                label="Sử dụng"
                checked={char.selected}
                onChange={e => onCharacterUpdate(char.id, undefined!, e.target.checked)}
                disabled={!char.image}
              />
            </ImageUploader>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Bối cảnh tham chiếu</h2>
        <div className="grid grid-cols-1 gap-4">
          <ImageUploader
            label="Bối cảnh"
            image={sceneImage}
            onImageUpload={onSceneUpdate}
            onImageRemove={() => onSceneUpdate(null)}
          >
            <Checkbox
              id="scene-check"
              label="Sử dụng bối cảnh này"
              checked={useScene}
              onChange={e => onUseSceneChange(e.target.checked)}
              disabled={!sceneImage}
            />
          </ImageUploader>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Câu lệnh (Prompt)</h2>
        <textarea
          className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
          placeholder="VD: Hai nhân vật đang nói chuyện trong quán cà phê, ánh sáng điện ảnh, độ phân giải 4K"
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
        />
        <div className="mt-4">
           <GenerateButton onClick={onGenerate} isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <GenerateButton onClick={onGenerate} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ControlPanel;
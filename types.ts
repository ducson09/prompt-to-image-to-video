export interface Character {
  id: number;
  image: string | null;
  selected: boolean;
}

export interface GeneratedImageResult {
  id: number;
  src: string | null;
  videoSrc?: string | null;
  isGeneratingVideo?: boolean;
  videoError?: string | null;
}

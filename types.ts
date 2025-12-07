export interface PhotoFrameConfig {
  borderColor: string;
  borderWidth: number; // in pixels relative to base width
  gap: number;
  textColor: string;
  fontFamily: string;
  caption: string;
  showDate: boolean;
  filter: 'none' | 'bw' | 'sepia' | 'vintage';
}

export interface GeneratedMood {
  caption: string;
  suggestedColor: string;
  mood: string;
}


export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  IMAGE_GEN = 'image_gen',
  LIVE = 'live'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: Array<{ title: string; uri: string }>;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export enum AppMode {
  OUTFIT_SWAP = 'OUTFIT_SWAP',
  VIDEO_GEN = 'VIDEO_GEN',
  PRODUCT_POSTER = 'PRODUCT_POSTER'
}

export enum PoseType {
  ORIGINAL = 'original',
  STANDING_FRONT = 'pose_standing_front',
  CONTRAPPOSTO = 'pose_contrapposto',
  WALKING = 'pose_walking',
  HAND_ON_HIP = 'pose_hand_on_hip',
  CROSSED_LEGS = 'pose_crossed_legs',
  SITTING_CASUAL = 'pose_sitting_casual',
  SHOULDER_TURN = 'pose_shoulder_turn',
  THREE_QUARTER = 'pose_three_quarter'
}

export enum AspectRatio {
  RATIO_1_1 = 'ratio_1_1',
  RATIO_4_5 = 'ratio_4_5',
  RATIO_9_16 = 'ratio_9_16',
  RATIO_16_9 = 'ratio_16_9',
  RATIO_3_2 = 'ratio_3_2'
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GenerationResult {
  type: 'image' | 'video';
  url: string;
  description?: string;
}

// Global declaration for the specific AI Studio window object
// We augment the AIStudio interface which is already declared on Window in the environment
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
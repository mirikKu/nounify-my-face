type CompressOptions = {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  onProgress?: (percentage: number) => any;
  useWebWorker?: boolean;
};

type ImageDataType = {
  image: string | null;
  image_orientation: number;
};

type ConstraintsType = {
  audio: boolean;
  video: boolean;
};

export type AvatarDataType = {
  step: 'choose' | 'camera' | 'color';
  stepButtons: 'camera' | 'capture' | 'confirm' | 'color';
  isRestricted: boolean;
  isPropmt: boolean;
  mediaStream: MediaStream | null;
  loading: boolean;
  cropped: boolean;
  compressOptions: CompressOptions;
  error: string | null;
  navigatorMedia: Promise<void> | null;
  avatarColor: string;
};

export type CameraDataType = {
  customStyle: Record<string, any>;
  cropperStyle: Record<string, any>;
  time: number;
  mediaStream: MediaStream | null;
  imageData: ImageDataType;
  constraints: ConstraintsType;
  loading: boolean;
  isCapturing: boolean;
  timer: number | null;
  error: string | null;
  fileName: string;
  zoom: number;
  zoomMin: number;
  zoomable: boolean;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
};

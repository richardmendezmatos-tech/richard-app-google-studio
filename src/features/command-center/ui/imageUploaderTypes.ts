/**
 * Tipos compartidos del ImageUploader.
 * Extraídos a su propio módulo para que ImageUploader y UploadingFileList
 * los importen sin crear una dependencia circular entre componentes.
 */

export interface UploadResult {
  url: string;
  webpUrl?: string;
  thumbnailUrl?: string;
  blurPlaceholder?: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
}

export interface UploadingFile {
  file: File;
  preview: string;
  status: 'pending' | 'optimizing' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  result?: UploadResult;
}

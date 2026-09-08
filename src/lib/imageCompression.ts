/**
 * Utility for client-side image compression and camera frame capture.
 * Resizes images to max 1280px maintaining aspect ratio and encodes to optimized WebP.
 * Reduces raw 4-8 MB camera photos down to 80-150 KB.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImageFile(
  file: File | Blob, 
  maxDimension = 1280, 
  quality = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      let dataUrl = canvas.toDataURL('image/webp', quality);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // Approximate compressed size from base64 length
      const compressedSize = Math.round((dataUrl.length * 3) / 4);

      resolve({
        dataUrl,
        originalSize,
        compressedSize,
        width,
        height
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

export function captureVideoFrame(
  video: HTMLVideoElement, 
  maxDimension = 1280, 
  quality = 0.82
): CompressionResult {
  let width = video.videoWidth || 1280;
  let height = video.videoHeight || 720;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context for video capture');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, 0, 0, width, height);

  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  const compressedSize = Math.round((dataUrl.length * 3) / 4);

  return {
    dataUrl,
    originalSize: width * height * 3, // approximate uncompressed bitmap
    compressedSize,
    width,
    height
  };
}

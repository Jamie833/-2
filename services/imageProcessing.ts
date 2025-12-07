import { PhotoFrameConfig } from '../types';

const STRIP_WIDTH = 1080; // High resolution for mobile screens
const PHOTO_RATIO = 3 / 4; // Standard photobooth landscape-ish crop ratio (width/height)

/**
 * Loads an image from a URL into an HTMLImageElement
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

/**
 * Draws the photo strip onto a canvas and returns the data URL
 */
export const generatePhotoStrip = async (
  imageUrls: string[],
  config: PhotoFrameConfig
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Calculate Dimensions
  const outerPadding = 60; // Side padding
  const innerGap = 30; // Gap between photos
  const contentWidth = STRIP_WIDTH - (outerPadding * 2);
  const photoHeight = contentWidth * PHOTO_RATIO; 
  
  // Header height for date, Footer height for caption
  const headerHeight = config.showDate ? 100 : 60;
  const footerHeight = config.caption ? 200 : 100;
  
  // Calculate total height: Top + (4 * Photo) + (3 * Gap) + Bottom
  const totalHeight = headerHeight + (4 * photoHeight) + (3 * innerGap) + footerHeight;

  canvas.width = STRIP_WIDTH;
  canvas.height = totalHeight;

  // 2. Draw Background
  ctx.fillStyle = config.borderColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Draw Date (Header)
  if (config.showDate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}.${month}.${day}`;
    
    ctx.fillStyle = config.textColor;
    ctx.font = `bold 32px ${config.fontFamily}, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, STRIP_WIDTH - outerPadding, 70);
  }

  // 4. Draw Images
  const loadedImages = await Promise.all(imageUrls.map(url => loadImage(url)));

  for (let i = 0; i < 4; i++) {
    const img = loadedImages[i];
    if (!img) continue;

    const yPos = headerHeight + i * (photoHeight + innerGap);
    
    // Draw white background for photo slot
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(outerPadding, yPos, contentWidth, photoHeight);

    // --- STRICT CROP LOGIC (Object-Fit: Cover) ---
    // Goal: Fill contentWidth x photoHeight without stretching.
    
    // 1. Determine destination dimensions (The slot on the strip)
    const destW = contentWidth;
    const destH = photoHeight;
    const destRatio = destW / destH;

    // 2. Determine source dimensions (The original image)
    const srcW = img.width;
    const srcH = img.height;
    const srcRatio = srcW / srcH;

    let sourceX, sourceY, sourceWidth, sourceHeight;

    // 3. Calculate cropping
    if (srcRatio > destRatio) {
      // Source is wider than destination (Landscape source, Portrait/Square dest)
      // Crop left and right sides
      sourceHeight = srcH;
      sourceWidth = srcH * destRatio;
      sourceX = (srcW - sourceWidth) / 2;
      sourceY = 0;
    } else {
      // Source is taller than destination (Portrait source, Landscape dest)
      // Crop top and bottom
      sourceWidth = srcW;
      sourceHeight = srcW / destRatio;
      sourceX = 0;
      sourceY = (srcH - sourceHeight) / 2;
    }

    // Apply Filter
    ctx.save();
    
    if (config.filter === 'bw') {
       ctx.filter = 'grayscale(100%)';
    } else if (config.filter === 'sepia') {
       ctx.filter = 'sepia(60%) contrast(1.2)';
    } else if (config.filter === 'vintage') {
       ctx.filter = 'sepia(30%) contrast(0.9) brightness(1.1)';
    }

    // 4. Draw using the calculated source coordinates to destination coordinates
    ctx.drawImage(
      img, 
      sourceX, sourceY, sourceWidth, sourceHeight, // Source crop
      outerPadding, yPos, destW, destH             // Destination on canvas
    );
    ctx.restore();
  }

  // 5. Draw Caption (Footer)
  if (config.caption) {
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    
    // Auto-scaling text
    let fontSize = 48;
    ctx.font = `italic ${fontSize}px ${config.fontFamily}, serif`;
    let textWidth = ctx.measureText(config.caption).width;
    
    while (textWidth > STRIP_WIDTH - 100 && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `italic ${fontSize}px ${config.fontFamily}, serif`;
        textWidth = ctx.measureText(config.caption).width;
    }

    // Position at the bottom area centered
    const textY = totalHeight - (footerHeight / 2) + (fontSize / 3);
    ctx.fillText(config.caption, STRIP_WIDTH / 2, textY);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};
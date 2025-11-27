// File: ./app/components/PostEditor/postEditorUtils.ts
import { Canvas, Textbox, Image as FabricImage } from 'fabric';

/**
 * Add image to canvas (with proper crossOrigin handling)
 */
export const addImage = (canvas: Canvas, url: string) => {
  FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
    .then((img) => {
      if (!img) return;

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Scale image to fit canvas
      const scaleX = canvasWidth / (img.width ?? canvasWidth);
      const scaleY = canvasHeight / (img.height ?? canvasHeight);
      img.scale(Math.min(scaleX, scaleY));

      // Center the image
      img.set({
        left: (canvasWidth - img.getScaledWidth()) / 2,
        top: (canvasHeight - img.getScaledHeight()) / 2,
      });

      canvas.add(img);
      canvas.renderAll();
    })
    .catch((err) => {
      console.error('Fabric image load error:', err);
      alert('Error loading template image. Use your domain or Firebase Storage URL.');
    });
};

/**
 * Add text to canvas
 */
export const addText = (canvas: Canvas, text: string = 'New Text') => {
  const textbox = new Textbox(text, {
    left: 100,
    top: 100,
    fontSize: 30,
    fill: '#000000',
    fontFamily: 'Arial',
  });

  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.renderAll();
};

/**
 * Save canvas state to history
 */
export const saveHistory = (canvas: Canvas, history: string[]): string[] => {
  const snapshot = JSON.stringify(canvas);
  return [...history, snapshot];
};

/**
 * Undo last action
 */
export const undoCanvas = (canvas: Canvas, history: string[]): string[] => {
  if (history.length === 0) return history;

  const lastState = history[history.length - 1];
  canvas.loadFromJSON(lastState, canvas.renderAll.bind(canvas));
  return history.slice(0, -1);
};

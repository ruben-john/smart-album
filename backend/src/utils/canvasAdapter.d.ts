/**
 * Type definitions for the custom canvas adapter
 */
declare module '../utils/canvasAdapter' {
  /**
   * Creates a canvas with the specified dimensions
   * With additional error handling and parameter validation
   */
  export function createCanvas(width: number, height: number): any;
  
  /**
   * Loads an image from a source
   * Handles different source formats with error handling
   */
  export function loadImage(src: string | Buffer): Promise<any>;
  
  /**
   * Canvas constructor
   */
  export const Canvas: any;
  
  /**
   * Image constructor
   */
  export const Image: any;
  
  /**
   * ImageData constructor
   */
  export const ImageData: any;
}
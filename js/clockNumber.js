
import { 
   DOT_HEIGHT,
   DOT_WIDTH, 
   MATRIX_HEIGHT, 
   MATRIX_WIDTH 
} from './constants.js'

import { renderDot, activateDot } from './dotPool.js'

/**
 * @callback drawPixels
 * @param {number[][]} px
 * @returns {void}
 */

/**
 * @typedef ClockNumber
 * @type {object}
 * @property {number} x 
 * @property {number} y 
 * @property {drawPixels} [drawPixels]
 */

let dot = { x: 0, y: 0 }

/*
 * Create a new ClockNumber object and
 * initialize its dot array based on the
 * passed in location parameters.
 */

/**
 * createNumber
 * @export
 * @param {number} x
 * @param {number} y
 * @returns {ClockNumber}
 */
export function createNumber(x, y) {

   // set location for this display
   const left = x
   const top = y

   /**
    * A 2 dimensional array of points
    * as a 4 x 7 matrix, that contains a mask
    * of values 0 or 1 to indicate active pixels
    * @type {number[][]}
    */
   let currentPixelMask

   /** A 2 dimensional array of point locations(dots) as a 4 x 7 matrix */
   const dotLocations = new Array(MATRIX_HEIGHT)
   for (let i = 0; i < MATRIX_HEIGHT; ++i) {
      dotLocations[i] = new Array(MATRIX_WIDTH)
   }

   // calculate/set each location of our dots
   for (let y = 0; y < MATRIX_HEIGHT; ++y) {
      for (let x = 0; x < MATRIX_WIDTH; ++x) {
         const xx = left + (x * DOT_WIDTH)
         const yy = top + (y * DOT_HEIGHT)
         dotLocations[y][x] = {
            x: xx,
            y: yy
         }
      }
   }

   /**
    * Draw the visual pixels(dots) for a given number,
    * based on a lookup in an array of pixel masks.
    * 
    * SEE: the PIXELS array in contants.ts.
    * If a value in the mask is set to 1, that position in
    * the display will have a visual dot displayed.
    * 
    * On a number change, any active dot that is not required
    * to be active in the new number, will be set free ...
    * That is, it will be 'activated' in the DotPool, becoming
    * an animated dot.
    */
   return {
      x: left,
      y: top,
      drawPixels: (newPixelMask) => {
         for (y = 0; y < MATRIX_HEIGHT; ++y) {
            for (x = 0; x < MATRIX_WIDTH; ++x) {
               dot = dotLocations[y][x]
               if (currentPixelMask != null) {
                  // if this dot is 'on', and it is not required for the new number
                  if ((currentPixelMask[y][x] !== 0) && (newPixelMask[y][x] === 0)) {
                     // activate it as a 'free' animated dot
                     activateDot(dot.x, dot.y)
                  }
               }
               // if this dot is an active member of this number mask
               if (newPixelMask[y][x] === 1) {
                  // render it to the canvas
                  renderDot(dot.x, dot.y)
               }
            }
         }
         // Set the current pixel mask to this new mask. Used to
         // evaluate pixels to be 'freed' during next update.
         currentPixelMask = newPixelMask
      }
   }
}

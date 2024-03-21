
// a few required clock-face constants
// these are used to define the shape of
// our 4 x 7 dot matrix, for the 7-segment 'LED' numbers
export const NUMBER_SPACING = 16
export const DOT_WIDTH = 16
export const DOT_HEIGHT = 16
export const MATRIX_WIDTH = 4;
export const MATRIX_HEIGHT = 7;

/**
 * A lookup array of 10 pixel masks(0-9).
 * Each mask(array) represents the pixels of
 * a 4 x 7 matrix of dots that are used to
 * display a 7 segment numeric display.
 * If a value in the mask is set to 1, that position
 * in this display will have a visual dot displayed.
 * A value of 0 will not be displayed.
 */
export const PIXELS = [
   // 'zero'
   [
       [1, 1, 1, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1]
   ],
   // 'one'
   [
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1]
   ],
   // 'two'
   [
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [1, 1, 1, 1],
       [1, 0, 0, 0],
       [1, 0, 0, 0],
       [1, 1, 1, 1]
   ],
   // 'three'
   [
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [1, 1, 1, 1]
   ],
   // 'four'
   [
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1]
   ],
   // 'five'
   [
       [1, 1, 1, 1],
       [1, 0, 0, 0],
       [1, 0, 0, 0],
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [1, 1, 1, 1]
   ],
   // 'six'
   [
       [1, 1, 1, 1],
       [1, 0, 0, 0],
       [1, 0, 0, 0],
       [1, 1, 1, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1]
   ],
   // 'seven'
   [
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1]
   ],
   // 'eight'
   [
       [1, 1, 1, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1]
   ],
   // 'nine'
   [
       [1, 1, 1, 1],
       [1, 0, 0, 1],
       [1, 0, 0, 1],
       [1, 1, 1, 1],
       [0, 0, 0, 1],
       [0, 0, 0, 1],
       [1, 1, 1, 1]
   ]
]

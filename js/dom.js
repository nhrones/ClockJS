/// <reference lib="dom" />
import { CTX } from './dotPool.js';
import { setAlpha } from "./clockFace.js";

// a utility to save a few keystrokes

/**
 *a utility to save a few keystrokes
 * @param {string} id
 * @returns {*}
 */
const $ = (id) => document.getElementById(id)

/**  
 * the applications canvas 2D context 
 * @type {CanvasRenderingContext2D}
 */
export let canvasCTX 

/** initialize the clocks canvas */
export function initCanvas() {
   
   /** @type {HTMLCanvasElement} */
   const canvas = $('canvas-content')
   canvasCTX = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'))
   const width = canvas.clientWidth
   const height = canvas.clientHeight
   canvas.width = width
   canvas.height = height
}


/**
 * initialize DOM elements
 */
export function initDOM() {

   
   /** @type {HTMLInputElement} */
   const gravitySlider = $('gravity')
   /** @type {HTMLInputElement} */
   const gravityValue = $('gravity-value') 
   /** @type {HTMLInputElement} */
   const bounceSlider = $('bounce')
   /** @type {HTMLAnchorElement} */
   const bounceValue = $('bounce-value')
   /** @type {HTMLInputElement} */
   const velocitySlider = $('velocity')
   /** @type {HTMLInputElement} */
   const velocityValue = $('velocity-value')
   /** @type {HTMLInputElement} */
   const trailsSlider = $('trails-slider')
   /** @type {HTMLInputElement} */
   const trailsValue = $('trails-value')
  
   // gravity
   gravitySlider.oninput = () => {
      gravityValue.innerHTML = `    Gravity: ${gravitySlider.value}%`;
      CTX.GravityY = (parseInt(gravitySlider.value) * 50) | 0
   }

   // coefficient of restitution (COR) -- bounce
   bounceSlider.oninput = () => {
      bounceValue.innerHTML = `    COR Restitution:   ${bounceSlider.value}%`;
      CTX.Restitution = parseInt(bounceSlider.value) * .01
   }

   // velocity
   velocitySlider.oninput = () => {
      velocityValue.innerHTML = `    Velocity:  ${velocitySlider.value}%`;
      CTX.MaxVelocity = (parseInt(velocitySlider.value) * 50) | 0
   }

   // partical trails -- 
   trailsSlider.oninput = () => {
      trailsValue.innerHTML = `    Partical-Trails:  ${trailsSlider.value}%`;
      setAlpha(parseInt(trailsSlider.value));
   }
}

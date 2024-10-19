import { canvasCTX } from './dom.js'
import { width, height } from './clockFace.js'

/** CTX configuration object */
export const CTX = {
   /** 
    * A false gravitational pull in the X direction    
    * (positive = right and negative = left)   
    * default = 0
    */
   GravityX: 0,

   /** 
    * A gravitational pull in the positive Y direction(down to floor)     
    * Have some fun! ... try a negative value
    * default = 1600
    */
   GravityY: 750,

   /**
    * The coefficient of restitution (COR) is the ratio     
    * of the final to initial relative velocity between     
    * two objects after they collide.    
    * 
    * This represents the amount of 'bounce' a dot will exibit.    
    * 1.0 = full rebound, and 0.5 will rebound only    
    * half as high as the distance fallen.    
    * default = 0.8
    */
   Restitution: 0.5,

   /** 
    * The Maximum Velocity that a dot may take when it recieves a random velocity.     
    * default = 2400
    */
   MaxVelocity: 750
}

/** 
 * The radius of dots   
 * default = 14px
 */
const Radius = 14

/**
 * Half the Radius. Used in the rendering calculation of arcs(circles).    
 * We pre-calculated this value to prevent the cost of calculations in loops.    
 */
const HalfRadius = Radius * 0.5

/**
 * Radius Squared is used in the calculation of distances between dots.    
 * We pre-calculated this value to prevent the cost of calculations in loops.    
 * default = 14 * 14
 */
const Radius_Sqrd = Radius * Radius

/** 
 * Our default dot color (blue)     
 */
const Color = '#44f'

// reusable values
let distanceX = 0
let distanceY = 0
let delta = 0
let thisDistanceSquared = 0
let velocityDiffX = 0
let velocityDiffY = 0
let actualDistance = 0
let ratioX = 0
let ratioY = 0
let impactSpeed = 0
let newDotAx = 0
let newDotAy = 0
let newDotBx = 0
let newDotBy = 0

/**
 * Rather than using a variable sized set of individual Dot objects,
 * we build several fixed size arrays that provide all required
 * attributes that represent a pool of dots.
 * 
 * The main benefit, is the elimination of most garbage collection
 * that building and destroying many dots at 60 frames per second
 * would produce.
 *
 * We simply activate or inactivate an index(dot), by setting the value    
 * of the posX array. A positive integer in the posX array indicates    
 * 'active', and a value of zero indicates an inactive index.    
 * Any index with an active posX value will be updated, tested for    
 * collisions, and rendered to the canvas.    
 *
 * New dot activations are always set at the lowest inactive posX-index.
 * We also maintain a 'tail pointer' to point to the highest active index.
 * This 'tail pointer' allows all 'loops' to only loop over elements presumed 
 * to be active.
 * These loops, from 0 to TailPointer, will also short circuit any index in
 * the loop that is inactive (has a posX value of zero).
 *
 * When a dot falls off the edge of the canvas, its posX is set inactive(zero).
 * If that dots index is equal to the tail-pointer value, we decrement
 * the TailPointer, effectively reducing the active pool size.
 *
 * Whenever a time-change(tick) causes the production of new 'animated' dots,
 * we simply find the first inactive index, and set it active by setting its
 * posX value to the x location of the 'time-dot' that is being set free.
 * If that first free-index is greater than the current tail, we set the tail-pointer
 * value to this new index, effectivly increasing the active pool size.
 *
 * This is a very efficient use of memory, and provides very efficient dot-animation
 * updates and collision-detection, as no new memory is required for each 'tick'.
 * This reduced presure on the garbage collector eliminates 'jank' that is common with
 * many forms of javascript animation where objects are created and destroyed per 'tick'.
 */

/** A 'fixed' maximum number of dots this pool will contain. */
const POOL_SIZE = 10000


// ===============================================================================
// 
//    Below is a set of fixed size arrays that make up all required 
//    properties needed to create a pool of reusable animated dots.
// 
//    These individual property arrays would replace the use of an  
//    array of objects: 
//   
//    const Dot = {
//       posX: number,
//       posY: number,   
//       lastX: number, 
//       lastY: number, 
//       velocityX: number, 
//       velocityY: number 
//    }


/**
 * An array of horizontal dot position values 
 * where zero indicates inactive
 * @type {number[]}
 */
const posX = Array(POOL_SIZE)

/** 
 * An array of vertical dot position values 
 * @type {number[]}
 */
const posY = Array(POOL_SIZE)

/** 
 * An array of last-known horizontal location values 
 * @type {number[]}
 */
const lastX = Array(POOL_SIZE) 

/** 
 * An array of last-known vertical location values 
 * @type {number[]}
 */
const lastY = Array(POOL_SIZE) 

/** 
 * An array of horizontal velocity values 
 * @type {number[]}
 */
const velocityX = Array(POOL_SIZE) 

/** 
 * An array of vertical velocity values 
 * @type {number[]}
 */
const velocityY = Array(POOL_SIZE)

// populate array set
for (let i = 0; i <  POOL_SIZE; i++) {
   posX[i] = 0;
   posY[i] = 0;
   lastX[i] = 0;
   lastY[i] = 0;
   velocityX[i] = 0;
   velocityY[i] = 0;
}                                                                               
// ==============   end of property arrrays    ==================================

/** Points to the highest index that is currently set active. */
let tailPointer = 0

/** The last 'tick' time (used for time-delta calculation). */
let lastTime = Date.now()

// ===================================================
//
//                exported functions
//
// ===================================================

/**
 * The main entry point for DotPool animations.
 * (called from the clockFace animation loop 'tick()').
 * 
 * tick() in clockFace is triggered by window.requestAnimationFrame().
 * We expect ~ 60 frames per second here.
 * @param {number} thisTime
 */
export function tickDots (thisTime) {
   delta = (thisTime - lastTime) / 1000
   lastTime = thisTime
   updateDotPositions(delta)
   testForCollisions(delta)
}

/**
 * Activates a dot-pool index, to create a new animated dot.
 * Whenever a time-number change causes one or more
 * dots to be 'freed' from the number display, we animated
 * them as if they exploded out of the number display.
 * We do this by activating the next available index,
 * setting its position to the position of the freed-dot,
 * and then assigning a random velocity to it.
 * If we have activated the array index pointed to by
 * tailPointer, we increment the tailPointer to maintain
 * our active pool size.
 * @param {number} x
 * @param {number} y
 */
export function activateDot(x, y) {
   // loop though the pool to find an unused index
   // a value of 'zero' for posX is used to indicate 'inactive'
   for (let idx = 0; idx < tailPointer + 2; idx++) {
      if (posX[idx] === 0) {
         // add values for this dots location (this makes it 'active')
         posX[idx] = x
         posY[idx] = y
         lastX[idx] = x
         lastY[idx] = y
         velocityX[idx] = randomVelocity()
         velocityY[idx] = randomVelocity()
         // if this is past the tail, make this the new tail
         if (idx > tailPointer) tailPointer = idx
         // we're all done, break out of this loop
         break;
      }
   }
}

/**
 * Here we draw a dot(circle) on the screen (canvas).    
 * This method is used to create our 'static'    
 * time-value 'numbers' and 'colons' on the screen.
 * These are rendered as simple circles.    
 *     
 * A similar method, DotPool.renderFreeDot, is used to    
 * render animated dots using lines instead of circles.    
 * This will help emulate 'particle-trails'. (SEE: renderFreeDot below)
 * @param {number} x
 * @param {number} y
 * @param {string} [color]
 */
export function renderDot(x, y, color) {
   canvasCTX.fillStyle = color || Color
   canvasCTX.beginPath()
   canvasCTX.arc(x, y, HalfRadius, 0, 2 * Math.PI, true)
   canvasCTX.closePath()
   canvasCTX.fill()
}

// ===================================================
//
//               internal functions
//
// ===================================================

/**
 * This method recalculates dot locations and velocities
 * based on a time-delta (time-change since last update).
 * 
 * This method also mutates velocity/restitution whenever
 * a wall or floor collision is detected.
 * @param {number} delta
 */
function updateDotPositions(delta) {
   // loop over all 'active' dots (all dots up to the tail pointer)
   for (let i = 0; i < tailPointer + 2; i++) {

      // if this dot is inactive, skip over it and go on to the next
      if (posX[i] === 0) { continue }

      // use gravity to calculate our new velocity and position
      velocityX[i] += CTX.GravityX * delta
      velocityY[i] += CTX.GravityY * delta
      posX[i] += velocityX[i] * delta
      posY[i] += velocityY[i] * delta

      // did we hit a wall?
      if ((posX[i] <= Radius) || (posX[i] >= (width))) {

         // has it rolled off either end on the floor?
         if (posY[i] >= height - 2) {
            posX[i] = 0 // zero will inactivate this dot

            // if this was the tail, decrement the tailPointer
            if (i === tailPointer) {
               tailPointer--
            }
            continue
            // it was'nt on the floor so ... bounce it off the wall
         } else {
            if (posX[i] <= Radius) { posX[i] = Radius }
            if (posX[i] >= (width)) { posX[i] = width }
            // bounce it off the wall (restitution represents bounciness)
            velocityX[i] *= -CTX.Restitution
         }
      }

      // did we hit the floor? If so, bounce it off the floor
      if (posY[i] >= height) {
         posY[i] = height
         // restitution represents bounciness
         velocityY[i] *= -CTX.Restitution
      }

      // did we hit the ceiling? If so, bounce it off the ceiling
      if (posY[i] <= Radius) {
         posY[i] = Radius
         // restitution represents bounciness
         velocityY[i] *= -CTX.Restitution
      }

      // draw this dot
      renderFreeDot(i)
   }
}

/**
 * This method tests for dots colliding with other dots.
 * When a collision is detected, we mutate the velocity values
 * of both of the colliding dots.
 * @param {number} delta
 */
function testForCollisions(delta) {

   // loop over all active dots in the pool
   for (let i = 0; i < tailPointer + 2; i++) {

      // is this dot active?
      if (posX[i] === 0) { continue }

      // test this active dot against all other active dots
      for (let j = 0; j < tailPointer + 2; j++) {
         if (i === j) { continue } // same dot, can't collide with self
         if (posX[j] === 0) { continue } // not an active dot
         distanceX = Math.abs(posX[i] - posX[j])
         distanceY = Math.abs(posY[i] - posY[j])

         // for efficiency, we use only the squared-distance
         // not the square-root of the squared-distance. square-root is very expensive
         thisDistanceSquared = distanceX ** 2 + distanceY ** 2

         // Are we about to collide?
         // here we compare the squared-distance to the squared-radius of a dot
         // again, we avoid expensive square-root calculations
         if (thisDistanceSquared < Radius_Sqrd) {

            // the distance apart is less than a dots radius ... is it about to get greater?
            // To see if dots are moving away from each other
            // we calculate a future position based on the last delta.
            if (newDistanceSquared(delta, i, j) > thisDistanceSquared) {
               // distance apart is increasing, so these dots are moving away from each other
               // just ignor and continue
               continue
            }
            
            // if we got here we've collided
            collideDots(i, j, distanceX, distanceY)
         }
      }
   }
}

/**
 * This method will calculate new velocity values
 * for both of the colliding dots.
 * @param {number} dotA
 * @param {number} dotB
 * @param {number} distanceX
 * @param {number} distanceY
 */
function collideDots(dotA, dotB, distanceX, distanceY) {

   // this gives us a distance value
   thisDistanceSquared = distanceX ** 2 + distanceY ** 2

   velocityDiffX = velocityX[dotA] - velocityX[dotB]
   velocityDiffY = velocityY[dotA] - velocityY[dotB]

   // get the actual absolute distance (hypotenuse)
   actualDistance = Math.sqrt(thisDistanceSquared)

   // now we can callculate each dots new velocities

   // convert the distances to ratios
   ratioX = distanceX / actualDistance
   ratioY = distanceY / actualDistance

   // apply the speed (based on the ratios) to the velocity vectors
   impactSpeed = (velocityDiffX * ratioX) + (velocityDiffY * ratioY)
   velocityX[dotA] -= ratioX * impactSpeed
   velocityY[dotA] -= ratioY * impactSpeed
   velocityX[dotB] += ratioX * impactSpeed
   velocityY[dotB] += ratioY * impactSpeed
}

/**
 * Calculates a 'future' distance between two dots,
 * based on the last-known time-delta for the animations.
 * This is used to determin if the two dots are
 * moving toward, or away, from one another.
 * @param {number} delta
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function newDistanceSquared(delta, a, b) {
   newDotAx = posX[a] + (velocityX[a] * delta)
   newDotAy = posY[a] + (velocityY[a] * delta)
   newDotBx = posX[b] + (velocityX[b] * delta)
   newDotBy = posY[b] + (velocityY[b] * delta)
   return (Math.abs(newDotAx - newDotBx) ** 2) + (Math.abs(newDotAy - newDotBy) ** 2)
}

/**
 * This method renders a track of an animated(free)
 * dot in the dot pool.
 * 
 * Rather than static circles, we actually draw short lines
 * that represent the distance traveled since the last update.
 * These lines are drawn with round ends to better represent
 * a moving dot(circle). These short lines are automatically 
 * faded to black over time, to simulate a particle with a 'com-trail'.
 * SEE: ClockFace.tick() to understand this phenomenon.
 * @param {number} i
 */
function renderFreeDot (i) {
   canvasCTX.beginPath()
   canvasCTX.fillStyle = Color
   canvasCTX.strokeStyle = Color
   canvasCTX.lineWidth = Radius
   canvasCTX.moveTo(lastX[i] - Radius, lastY[i] - Radius)
   canvasCTX.lineTo(posX[i] - Radius, posY[i] - Radius)
   canvasCTX.stroke()
   canvasCTX.closePath()
   canvasCTX.fill()
   lastX[i] = posX[i]
   lastY[i] = posY[i]
}

/** Returns a clamped random velocity value */
function randomVelocity  () {
  return (Math.random() - 0.4) * CTX.MaxVelocity;
}

const a = randomVelocity()

import { buildClockFace } from './clockFace.js'
import { initDOM }  from './dom.js'
     
// initialize all DOM references and event handlers.
initDOM()

// build -> render -> and animate our `dot-clock`
buildClockFace()

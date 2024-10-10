# Dot Clock

## Click the image to check the time!    

[![clock](./media/clock.png)](https://nhrones.github.io/Clock/)    

## About this app
This small app was built as a learning exercise for a grandson who was studing CS at UGA. That's why all code in the _/src/_ folder is **_heavily commented_**! 

## No Jank!
The interesting bits of this exercise was the use of a resource-pool to improve performance and reduce V8-GC.    
  - See: _/src/dotPool.ts_

## Unique partical effect
Below the clock are four slider controls. Try moving each slider to change the animation.    
The **_partical-trails_** slider is most interesting. It controls the RGBA alpha channel to gradually fade out trails. The higher the slider value, the less trail fade.   

## Run Online

/*
Starfield JS v0.2.0
Copyright 2018 Yaroslav de la Peña Smirnov
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

    * Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from this
    software without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/

// ix and iy are the x,y coordinates in 'space', posz is how
// far away from the screen the particle/star is
function Particle(ix, iy, posz){
    this.ix = ix;
    this.iy = iy;
    this.posz = posz;

    // getX and getY get the projected coordinates, that is the real x, y
    // coordinate on 'screen' rather than 'space'
    this.getX = function(cWidth){
        return this.ix / this.posz * cWidth/8 + cWidth/2;
    }

    this.getY = function(cHeight){
        return this.iy / this.posz * cHeight/8 + cHeight/2;
    }
}

function warpLaunch(options={}){
    /* >>> Some parameters <<< */
    var max_particles =
        options.hasOwnProperty('max_particles') ? options['max_particles'] : 500;
    var speed =
        options.hasOwnProperty('speed') ? options['speed'] : 50;
    var step =
        options.hasOwnProperty('step') ? options['step'] : 2;
    var interactive = options['interactive'];

    var canvas = document.getElementById("stars");
    if(!canvas){
        console.log("There is no '#stars' canvas to draw on! Aborting...");
        return;
    }
    var container = canvas.parentNode;
    var ctx = canvas.getContext("2d");

    // The canvas where we will prerender our star
    var starsprite = document.createElement("canvas");

    // This will be populated with all the 'particles' (i.e. stars)
    // on the canvas
    var particles = [];
    var last = null; // previous timestamp
    var requestedFrame;

    function randomRange(min, max){
        return Math.floor(Math.random() * (max - min - 1)) + min;
    }

    function randomInt(max){
        return Math.floor(Math.random() * max);
    }

    function resize(){
        // On window/viewport resize, get the new size of the container
        // and accordingly resize the canvas, then reinitialize
        canvas.height = parseInt(container.offsetHeight);
        canvas.width = parseInt(container.offsetWidth);
        try{ window.cancelAnimationFrame(requestedFrame); }
        catch(e) {}
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.save();
        initParticles();
    }

    // Prerender our star to an offscreen canvas to improve performance
    function prerender(){
        let sctx = starsprite.getContext("2d");
        sctx.imageSmoothingEnabled = false;
        sctx.webkitImageSmoothingEnabled = false;
        starsprite.width = 5;
        starsprite.height = 5;
        sctx.fillStyle = "rgb(255, 255, 255, 0.4)";
        sctx.fillRect(0, 2, 5, 1);
        sctx.fillRect(2, 0, 1, 5);
        sctx.fillStyle = "rgb(255, 255, 255, 0.5)";
        sctx.fillRect(1, 1, 3, 3);
    }

    function getRandomPos(n){
        let i = randomRange(-n, n);
        if (i == 0) return getRandomPos();
        return i;
    }

    function getNewParticle(){
        // Randomly assign them the needed parameters
        let ix = getRandomPos(canvas.width/3);
        let iy = getRandomPos(canvas.height/2);
        let posz = randomRange(0, 200);
        return new Particle(ix, iy, posz);
    }

    // Init all the stars, and place them randomly on screen
    function initParticles(){
        particles.length = 0;
        ctx.save();
        for (let i = 0; i < max_particles; ++i){
            let particle = getNewParticle();
            particles.push(particle);
            drawStar(particle);
        }
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    // Function to draw prerender star to the onscreen canvas
    function drawStar(particle){
        let scale = (1 - particle.posz/200) * 1.5 + 0.25;
        let p = scale/2;
        ctx.globalAlpha = p;
        ctx.translate(particle.getX(canvas.width), particle.getY(canvas.height));
        ctx.scale(scale, scale);
        ctx.drawImage(starsprite, 0, 0);
        ctx.restore();
        ctx.save();
    }

    function nextFrame(timestamp){
        if (!last) last = timestamp;
        let delta = timestamp - last;
        // If more than 250ms have passed since last frame, it is assumed
        // that the browser stopped calling back frames because the tab/page
        // was in the background, thus this frame is ignored, and the last
        // timestamp reset
        if (delta > 250){
            last = timestamp;
            requestedFrame = window.requestAnimationFrame(nextFrame);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Decrease the distance from the screen of the star based
        // based on the speed
        for(let i = 0; i < max_particles; i++){
            let particle = particles[i];
            particle.posz -= delta*speed/1000;
            if (particle.posz <= 0){
                particle = getNewParticle();
                particle.posz = 200;
                particles[i] = particle;
            }
            drawStar(particle);
        }
        last = timestamp;
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    function updateSpeed(e){
        let new_speed = e.deltaY > 0 ? speed - step : speed + step;
        if (new_speed > 250){
            speed = 250;
            return
        }
        if (new_speed <= 0){
            speed = 2;
            return;
        }
        speed = new_speed;
        console.log(speed);
    }

    prerender();
    resize();

    if (interactive){
        console.log("Interactivity is on, move the mouse wheel to control speed");
        document.addEventListener("wheel", updateSpeed);
    }

    window.addEventListener("resize", resize);
}

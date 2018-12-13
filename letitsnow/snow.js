/*
Let it snow JS v1.0.0
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

/*
###     Happy holidays 2018, and happy new 2019!     ###
###     Felices fiestas 2018, y feliz año 2019       ###
### С праздниками 2018 года, и с наступающим 2019-м! ###
*/

// A class for the particles/snowflakes
function Particle(posx, posy, scale, flakeType, tradiusx, tradiusz, tDuration, lastT){
    this.posx = posx;
    this.posy = posy;
    this.scale = scale;
    this.flakeType = flakeType;
    this.tradiusx = tradiusx;
    this.tradiusz = tradiusz;
    this.tDuration = tDuration;
    this.lastT = 0;
}

// Let it snow!
function letItSnow(options){
    /* >>> Some parameters <<< */
    // > max_particles: Number of snowflakes on screen
    // > base_speed: Base speed for snowflakes in pixels/second
    // It is multiplied by the size of the snowflake so that
    // snowflakes in the foreground fall faster than ones in
    // the background to give a parallax effect
    // > max_xspeed: Same as base_speed but for the x (horizontal) axis
    var max_particles =
        options.hasOwnProperty('max_particles') ? options['max_particles'] : 400;
    var base_speed =
        options.hasOwnProperty('base_speed') ? options['base_speed'] : 100;
    var max_xspeed =
        options.hasOwnProperty('max_xspeed') ? options['max_xspeed'] : 150;
    var max_tradius =
        options.hasOwnProperty('max_tradius') ? options['max_tradius'] : 10;
    var max_tduration =
        options.hasOwnProperty('max_tduration') ? options['max_tduration'] : 5000;
    var interactive = options['interactive'];


    // x and y size of the original snowflake in pixels
    const BASE_SIZE = 9;

    var canvas = document.getElementById("snow");
    if (!canvas){
        console.log("There is no '#snow' canvas to draw on! Aborting...");
        return;
    }
    var container = canvas.parentNode;
    var ctx = canvas.getContext("2d");
    ctx.save();
    var hor_speed = 0;

    // This will be populated with all the 'particles' (i.e. snowflakes)
    // on the canvas
    var particles = [];
    var last = null; // previous timestamp
    var requestedFrame;

    // The (quarter) paths for our different snowflakes
    var paths = [
        function(){
            let sfquarter = new Path2D();
            sfquarter.rect(1,1,1,1);
            sfquarter.rect(3,0,1,1);
            sfquarter.rect(3,2,1,1);
            sfquarter.rect(2,3,1,1);
            sfquarter.rect(0,3,1,1);
            sfquarter.rect(1,4,2,1);
            sfquarter.rect(4,4,1,1);
            return sfquarter;
        },
        function(){
            let sfquarter = new Path2D();
            sfquarter.rect(2,2,1,1);
            sfquarter.rect(0,2,1,1);
            sfquarter.rect(2,0,1,1);
            sfquarter.rect(1,3,1,1);
            sfquarter.rect(3,1,1,1);
            sfquarter.rect(0,4,5,1);
            return sfquarter;
        },
        function(){
            let sfquarter = new Path2D();
            sfquarter.rect(1,1,1,1);
            sfquarter.rect(3,0,1,1);
            sfquarter.rect(0,3,1,1);
            sfquarter.rect(2,3,1,1);
            sfquarter.rect(3,2,1,1);
            sfquarter.rect(1,4,3,1);
            return sfquarter;
        },
        function(){
            let sfquarter = new Path2D();
            sfquarter.rect(1,1,1,1);
            sfquarter.rect(2,2,1,1);
            sfquarter.rect(3,3,1,1);
            sfquarter.rect(3,0,1,1);
            sfquarter.rect(0,3,1,1);
            sfquarter.rect(1,4,3,1);
            return sfquarter;
        }
    ]
    // This array will be populated with the prerendered snowflakes
    // (i.e. the canvases)
    var snowflakeTypes = []

    function randomMulti(){
        return Math.floor(Math.random() * 11)/10 + 0.5;
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
        initParticles();
    }

    function updateHorSpeed(e){
        // Get the rectangle for our canvas
        let rect = canvas.getBoundingClientRect();
        // Determine the mouse's x position relative to our canvas
        let mx = e.clientX - rect.left;
        let half_rect = canvas.width/2;
        hor_speed = (mx-half_rect)/half_rect*max_xspeed;
    }


    function prerenderAll(){
        for (let i = 0; i < paths.length; i++){
            snowflakeTypes.push(document.createElement("canvas"));
            prerenderSnowflake(snowflakeTypes[i], paths[i]());
        }
    }

    function prerenderSnowflake(flakeCanvas, sfquarter){
        // Prerender the snowflake to optimize
        flakeCanvas.width = BASE_SIZE;
        flakeCanvas.height = BASE_SIZE;
        var flakeCtx = flakeCanvas.getContext("2d");
        flakeCtx.fillStyle = "#ffffff";
        flakeCtx.save()
        // Draw a path with one quarter of the flake
        flakeCtx.fill(sfquarter);
        // Translate to center rotate, return to origin and draw another quarter
        // Repeat 3 times
        flakeCtx.translate(BASE_SIZE/2, BASE_SIZE/2);
        flakeCtx.rotate((Math.PI/180) * 90);
        flakeCtx.translate(-BASE_SIZE/2, -BASE_SIZE/2);
        flakeCtx.fill(sfquarter);

        flakeCtx.translate(BASE_SIZE/2, BASE_SIZE/2);
        flakeCtx.rotate((Math.PI/180) * 90);
        flakeCtx.translate(-BASE_SIZE/2, -BASE_SIZE/2);
        flakeCtx.fill(sfquarter);

        flakeCtx.translate(BASE_SIZE/2, BASE_SIZE/2);
        flakeCtx.rotate((Math.PI/180) * 90);
        flakeCtx.translate(-BASE_SIZE/2, -BASE_SIZE/2);
        flakeCtx.fill(sfquarter);
        flakeCtx.restore()
        flakeCtx.save()
    }

    // Draw the snowflake on our main (visible) canvas
    function drawSnowflake(particle){
        let turbulenceZ = particle.tradiusz*Math.cos(particle.lastT);
        // Position correctly, and scale accordingly
        ctx.translate(particle.posx, particle.posy);
        ctx.scale(particle.scale+turbulenceZ, particle.scale+turbulenceZ);
        // Also, change the opacity based on its size
        // to give an effect of distance
        ctx.globalAlpha = particle.scale/1.7+turbulenceZ;
        preCanvas = snowflakeTypes[particle.flakeType];
        ctx.drawImage(preCanvas, 0, 0);
        ctx.restore();
        ctx.save();
    }

    function getNewParticle(){
        // Randomly assign them a position and size and draw them
        // on the canvas
        let posx = randomInt(canvas.width);
        let posy = randomInt(canvas.height);
        let size = randomMulti();
        let tradiusx = randomInt(max_tradius)/10;
        let tradiusz = randomInt(3)/10;
        let tDuration = randomInt(max_tduration);
        let lastT = randomInt(63)/10;
        // Also randomly choose a snowflake type
        let flakeType = randomInt(paths.length);
        return new Particle(posx,
            posy,
            size,
            flakeType,
            tradiusx,
            tradiusz,
            tDuration,
            lastT);
    }

    function initParticles(){
        particles.length = 0;
        ctx.save()
        for (let i = 0; i < max_particles; ++i){
            let particle = getNewParticle();
            particles.push(particle);
            drawSnowflake(particle);
        }
        // Request the first frame
        requestedFrame = window.requestAnimationFrame(nextFrame);
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
        // Clear the canvas before redrawing the snowflakes
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < max_particles; i++){
            let particle = particles[i];
            // Determine how much the snowflake should fall based on
            // how much time has passed since the last frame, our base speed
            // and how large is our snowflake
            let fall = delta*base_speed*particle.scale/1000;
            let wind = delta*hor_speed*particle.scale/1000;
            let nt = delta*2*Math.PI/max_tduration;
            particle.lastT += nt;
            if(particle.lastT > 2*Math.PI){
                particle.lastT = particle.lastT - 2*Math.PI;
            }
            let turbulenceX = particle.tradiusx*Math.cos(particle.lastT);
            let turbulenceZ = particle.tradiusz*Math.cos(particle.lastT);
            particle.posy += fall;
            particle.posx += wind+turbulenceX;
            // If the snowflake has fallen out of our canvas' bounds
            // redraw at the top
            if (particle.posy > canvas.height+BASE_SIZE*particle.scale){
                particle = getNewParticle();
                particles[i] = particle;
                particle.posy = -BASE_SIZE*(particle.scale+turbulenceZ);
            }
            // If it fell out of bounds horizontally, redraw at the left
            // or at the right edge of the canvas
            if(particle.posx > canvas.width+BASE_SIZE*particle.scale){
                particle.posx = -BASE_SIZE*(particle.scale+turbulenceZ);
            }
            if(particle.posx < -BASE_SIZE*particle.scale){
                particle.posx = canvas.width+BASE_SIZE*(particle.scale+turbulenceZ);
            }
            drawSnowflake(particle);
        }
        last = timestamp;
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    // This will resize and initialize the canvas
    prerenderAll();
    resize();

    function stop(){
        try{ window.cancelAnimationFrame(requestedFrame); }
        catch(e) {
            console.log("Couldn't stop");
            console.log(e);
        }
    }

    // Update horizontal speed based on how far the mouse is from
    // the middle of the canvas
    if(interactive){
        console.log("Interactivity is on");
        document.addEventListener("mousemove", updateHorSpeed);
    }

    //If the window is resized, resize the canvas accordingly
    window.addEventListener("resize", resize);
}

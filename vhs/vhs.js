/*
VHS Tracking JS v0.1.1
Copyright 2019 Yaroslav de la Peña Smirnov
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

function playVHS(options={}){
    /* >>> Parameters <<<
    There are just two customizable parameters
    The speed in pixels/s
    And a list of colors
    */
    var picture = options.hasOwnProperty('picture') ? options['picture'] : false;
    var bgcolor = options.hasOwnProperty('bgcolor') ? options['bgcolor'] : '#003afc';

    var osd_text = 'PAUSE';
    var speed = 500;

    var canvas = document.getElementById("vhs");
    if(!canvas){
        console.log("There is no #vhs canvas to draw on! Aborting...");
        return;
    }
    var container = canvas.parentNode;
    var ctx = canvas.getContext("2d");
    ctx.save();

    var image;
    if(picture){
        image = new Image();
        image.src = picture;
    }

    /* >>> State variables <<<
    last is the timestamp of the last rendered frame
    */
    var font_size = 36;
    var r = 0;
    var d = 1;
    var is_paused = true;
    var last_play = 0;
    var stnoise = randomRange(30, canvas.height-60);
    var last = null;

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
        font_size = canvas.height < 720 ? 36 : 48;
        try{ window.cancelAnimationFrame(requestedFrame); }
        catch(e) {}
        initVHS();
    }

    function initVHS(){
        drawBG();
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    function drawBG(){
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(picture){
            let yd = 0;
            if (!is_paused){
                //let xr = randomRange(-30, 30);
                //let xd = xr == 2 || xr == -2 ? xr : 0;
                let yr = randomRange(-30, 30);
                yd = yr == 1 || yr == -1 ? yr : 0;
            }
            ctx.drawImage(image, 0, yd, canvas.width, canvas.height);
        }
        ctx.restore();
        ctx.save();
    }

    function drawOSD(){
        ctx.font = font_size+'px "VCR OSD Mono", monospace';
        ctx.fillStyle = '#f32ae877';
        ctx.fillText(osd_text, 51, font_size+31);
        ctx.fillStyle = '#07f91177';
        ctx.fillText(osd_text, 49, font_size+29);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(osd_text, 50, font_size+30);
        ctx.restore();
        ctx.save();
    }

    function applyEffects(delta){
        let oldImg, newImg;
        oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
        newImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let column = 0;
        let line = 1;

        let noise = randomRange(0, 10);
        r += delta/(speed-noise*70)*d;

        if (r > 1){
            r = 1;
            d = -1;
        }
        if (r < 0){
            r = 0;
            d = 1;
        }

        let adv = Math.cos(r);

        let line_adv = Math.floor(adv)+noise;

        // VHS Tracking
        for (let i = canvas.width*4*(canvas.height-20+line); i < oldImg.data.length; i += 4){
            if (column < line_adv){
                newImg.data[i] = 0;
                newImg.data[i+1] = 0;
                newImg.data[i+2] = 0;
            }
            else{
                newImg.data[i] = oldImg.data[i-line_adv*4];
                newImg.data[i+1] = oldImg.data[i-line_adv*4+1];
                newImg.data[i+2] = oldImg.data[i-line_adv*4+2];
            }
            column++;
            if(column >= canvas.width){
                column = 0;
                line++;
                noise = randomRange(0, 15);
                line_adv = Math.floor(Math.pow(adv*3, line/10))+noise;
            }
        }

        // Playing noise
        if(!is_paused && randomRange(0, 32) == 1){
            column = 0;
            let t = randomRange(1, 5);
            for (let i = 0; i < t; i++){
                let maxl = Math.floor(canvas.height/(i+1)-30);
                line = randomRange(3, maxl);
                lineadv = randomRange(3, 30);
                let endl = canvas.width*4*(line+randomRange(0, 10));
                for(let j = canvas.width*4*line; j < endl; j++){
                    if (column < line_adv){
                        newImg.data[j] = 0;
                        newImg.data[j+1] = 0;
                        newImg.data[j+2] = 0;
                    }
                    else{
                        newImg.data[j] = oldImg.data[j-line_adv*4];
                        newImg.data[j+1] = oldImg.data[j-line_adv*4+1];
                        newImg.data[j+2] = oldImg.data[j-line_adv*4+2];
                    }
                    column++;
                }
                column = 0;
            }
        }

        // Paused noise

        // CRT filter
        column = 0;
        line = 0;

        for (let i = 0; i < oldImg.data.length; i+=4){
            if (line % 3 != 0){
                newImg.data[i] = newImg.data[i] + 10 > 255 ? 255 : newImg.data[i] + 10;
                newImg.data[i+1] = newImg.data[i+1] + 10 > 255 ? 255 : newImg.data[i+1] + 10;
                newImg.data[i+2] = newImg.data[i+2] + 15 > 255 ? 255 : newImg.data[i+2] + 15;
                //oldImg.data[i+2] = 255;
            }
            column++;
            if(column / canvas.width == 1){
                line++;
                column = 0;
            }
        }

        // VHS bottom tracking
        /*
        column = 0;
        let j = 0;
        for (let i = canvas.width*4*(canvas.height-1); i < oldImg.data.length; i += 4){
            oldImg.data[i] = oldImg.data[j];
            oldImg.data[i+1] = oldImg.data[j+1];
            oldImg.data[i+2] = oldImg.data[j+2];
            column++;
            j += 4;
        }
        */
        ctx.putImageData(newImg, 0, 0);
    }

    function nextFrame(timestamp){
        if(!last) last = timestamp;
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

        drawBG();
        applyEffects(delta);
        if (!is_paused && last_play <= 3000)
            last_play += delta;
        if (is_paused || last_play <= 3000)
            drawOSD();
        last = timestamp;
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keypress', function(e){
        if (e.code == 'KeyP'){
            is_paused = !is_paused;
            osd_text = osd_text == 'PAUSE' ? 'PLAY' : 'PAUSE';
            stnoise = randomRange(30, canvas.height-60);
            last_play = 0;
        }
    });
}


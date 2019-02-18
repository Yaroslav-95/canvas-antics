/*
VHS Tracking JS v0.3.0
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
    var video_src = options.hasOwnProperty('video') ? options['video'] : false;
    var bgcolor = options.hasOwnProperty('bgcolor') ? options['bgcolor'] : '#003afc';

    var osd_text = 'PLAY';
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

    var video;
    if(video_src){
        video = document.createElement('video');
        video.src = video_src;
        video.load();
    }

    /* >>> State variables <<<
    last is the timestamp of the last rendered frame
    */
    var font_size = 36;
    var r = 0;
    var d = 1;
    var is_paused = false;
    var last_play = 0;
    var stnoise = randomRange(30, canvas.height-60);
    var last = null;

    var startpn = new Array(2);

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
        startpn[0] = randomRange(80, 230);
        startpn[1] = randomRange(canvas.height-350, canvas.height-200);
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    function drawBG(){
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(picture || video_src){
            let yd = 0;
            let yr = is_paused ? randomRange(-10, 10) : randomRange(-30, 30);
            let yi = is_paused ? 2 : 1;
            yd = yr == yi || yr == -yi ? yr : 0;
            if (video_src){
                if(video.ended){
                    osd_text = 'STOP';
                    is_paused = true;
                }
                else
                    ctx.drawImage(video, 0, yd, canvas.width, canvas.height);
            }
            else
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

        let line_adv = Math.floor(adv);

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
                noise = randomRange(0, (line+2)/2);
                line_adv = Math.floor(Math.pow(adv*4, line/10))+noise;
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
                for(let j = canvas.width*4*line; j < endl; j+=4){
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
        if(is_paused){
            let noisel = true;
            for(let x = 0; x < 2; x++){
                let start = canvas.width*4*(startpn[x]+randomRange(0, 20));
                let end = start+canvas.width*4*randomRange(100, 120);
                column = 0;
                for (let i = start; i < end; i+=4){
                    if (column == 0){
                        noisel = !noisel;
                        column = noisel ? randomRange(3, Math.floor(canvas.width/2)) : randomRange(3, Math.floor(canvas.width/4));
                    }
                    if (noisel){
                        newImg.data[i] = 255;
                        newImg.data[i+1] = 255;
                        newImg.data[i+2] = 255;
                        newImg.data[i+3] = randomRange(160, 255);
                    }
                    column--;
                }
            }
        }

        // CRT filter
        column = 0;
        line = 0;

        for (let i = 0; i < oldImg.data.length; i+=4){
            if (line % 3 != 0){
                newImg.data[i] = newImg.data[i] + 10 > 255 ? 255 : newImg.data[i] + 10;
                newImg.data[i+1] = newImg.data[i+1] + 15 > 255 ? 255 : newImg.data[i+1] + 15;
                newImg.data[i+2] = newImg.data[i+2] + 15 > 255 ? 255 : newImg.data[i+2] + 15;
                //oldImg.data[i+2] = 255;
            }
            column++;
            if(column / canvas.width == 1){
                line++;
                column = 0;
            }
        }

        ctx.putImageData(newImg, 0, 0);
        newImg = null;
        oldImg = null;
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
        if (picture){
            applyEffects(delta);
        }
        else if(!video.ended){
            applyEffects(delta);
        }
        if (!is_paused && last_play <= 3000)
            last_play += delta;
        if (is_paused || last_play <= 3000)
            drawOSD();
        last = timestamp;
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    resize();
    video.play();
    window.addEventListener('resize', resize);
    window.addEventListener('keypress', function(e){
        if (e.code == 'KeyP'){
            is_paused = !is_paused;
            startpn[0] = randomRange(80, 230);
            startpn[1] = randomRange(canvas.height-350, canvas.height-200);
            osd_text = osd_text == 'PLAY' ? 'PAUSE' : 'PLAY';
            stnoise = randomRange(30, canvas.height-60);
            last_play = 0;
            if (!is_paused && video_src){
                video.play();
                return;
            }
            video.pause();
        }
    });
}


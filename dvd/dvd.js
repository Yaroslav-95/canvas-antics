/*
DVD Screensaver JS v1.0.2
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

function playDVD(options={}){
    /* >>> Parameters <<<
    There are just two customizable parameters
    The speed in pixels/s
    And a list of colors
    */
    var speed = options.hasOwnProperty('speed') ? options['speed'] : 200;
    var colors = [
        "#012fff",
        "#ff2190",
        "#ce21ff",
        "#ffec00",
        "#ff8702"
    ];
    try{
        if(options["colors"].length > 0){
            colors = option["colors"];
        }
    }
    catch(e){}

    var canvas = document.getElementById("dvd");
    if(!canvas){
        console.log("There is no #dvd canvas to draw on! Aborting...");
        return;
    }
    var container = canvas.parentNode;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = colors[0];
    ctx.save();

    /* >>> State variables <<<
    px, py are the current coordinates
    direction is an array with the direction for the x and y axis [x, y]
    either 1 or -1 for each axis
    boundx, boundy the boundaries for each axis
    last is the timestamp of the last rendered frame
    */
    var px = 0;
    var py = 0;
    var direction = [1, 1];
    var boundx;
    var boundy;
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
        boundx = canvas.width - 340;
        boundy = canvas.height - 154;
        try{ window.cancelAnimationFrame(requestedFrame); }
        catch(e) {}
        initDVD();
    }

    function bounce(){
        // Change the direction after reaching the boundaries of the canvas
        if(px === boundx)
            direction[0] = -1;
        else if(px == 0)
            direction[0] = 1;
        if(py === boundy)
            direction[1] = -1;
        else if(py == 0)
            direction[1] = 1;
        // Change the color randomly
        if (colors.length > 1){
            ctx.restore();
            ctx.fillStyle = colors[randomRange(0, colors.length+1)];
            ctx.save();
        }
    }

    function initDVD(){
        px = randomRange(0, boundx);
        py = randomRange(0, boundy);
        bounce();
        drawLogo();
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    function drawLogo(){
        ctx.translate(px, py);
        ctx.fill(logoPath);
        ctx.restore();
        ctx.save();
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
        px += delta*speed*direction[0]/1000;
        py += delta*speed*direction[1]/1000;

        // If px and/or py are out of bounds, equal them to the boundaries
        // and change direction and color
        px = px > boundx ? boundx : px;
        py = py > boundy ? boundy : py;
        px = px < 0 ? 0 : px;
        py = py < 0 ? 0 : py;
        if (px === boundx || py === boundy || px == 0 || py == 0)
            bounce();
        drawLogo();
        last = timestamp;
        requestedFrame = window.requestAnimationFrame(nextFrame);
    }

    resize();
    window.addEventListener("resize", resize);
}

// This is the path for the logo, it is just a 'd' SVG string
// You can easily 'export' the logo to SVG by copying the string to a
// 'path' tag's 'd' attribute inside an SVG document with size of 340x154px
var logoPath = new Path2D("m 146.99116,153.94326 c -13.35681,-0.18459 -32.78363,-1.02291 -47.688801,-2.05776 -23.466055,-1.62924 -45.981002,-4.3045 -61.468194,-7.30377 -16.583846,-3.21169 -27.470922,-6.6589 -33.5609749,-10.62651 -5.693411,-3.70924 -5.6977634,-7.9672 -0.01198,-11.76202 10.5083219,-7.01354 39.0416119,-13.02717 79.1049899,-16.67199 40.0625,-3.64479 86.24899,-4.40797 133.36086,-2.20366 33.33046,1.55949 66.69696,5.50962 86.87024,10.28429 13.95227,3.30226 22.21907,6.59355 26.21779,10.43827 3.34946,3.22042 2.45012,6.86903 -2.4725,10.03129 -6.75156,4.33726 -19.52662,8.11191 -39.16496,11.57207 -10.69135,1.88377 -33.26108,4.5728 -46.64763,5.55774 -1.05443,0.0777 -2.29458,0.18168 -2.75588,0.23107 -0.46133,0.0493 -1.70145,0.14903 -2.75588,0.22134 -17.59185,1.20452 -31.36196,1.85962 -45.65181,2.17178 -7.28597,0.15903 -34.95521,0.23457 -43.37525,0.11816 z M 91.619741,141.53968 c 0.246501,-0.54082 1.577888,-3.37792 2.958608,-6.30471 1.38073,-2.92681 3.97904,-8.43478 5.774001,-12.23994 1.79496,-3.80514 3.26356,-7.00941 3.26356,-7.12056 0,-0.11083 -1.63516,-0.17316 -3.633701,-0.13817 l -3.63368,0.0638 -2.77722,6.01554 c -1.527468,3.30855 -3.049673,6.63511 -3.382678,7.39234 l -0.605444,1.377 -1.532179,-3.22776 c -0.842697,-1.77531 -2.15561,-4.50538 -2.917591,-6.0669 -0.761982,-1.56146 -1.674777,-3.46156 -2.028438,-4.22242 l -0.643011,-1.38336 h -3.681731 c -2.024947,0 -3.679724,0.0783 -3.677275,0.17343 0.0025,0.0953 0.850914,1.89142 1.885494,3.99109 6.486321,13.16391 9.424026,19.08649 10.299835,20.76514 l 0.995888,1.90876 h 1.443692 1.44369 z m 157.142039,0.7355 c 5.188,-0.68578 9.41624,-3.42237 11.61856,-7.51972 1.08667,-2.02166 1.48805,-3.65101 1.47779,-5.99878 -0.0157,-3.45827 -1.32322,-6.38437 -4.0325,-9.02037 -3.03562,-2.95345 -6.70084,-4.31834 -11.53042,-4.29378 -5.76798,0.0293 -10.16571,2.08832 -13.18479,6.17306 -3.00985,4.0723 -3.16277,9.97784 -0.36495,14.0917 3.40779,5.0107 9.35311,7.44872 16.01631,6.56789 z m -5.54176,-5.90707 c -4.31219,-1.32401 -6.34954,-5.45601 -5.0004,-10.14124 0.3368,-1.16962 0.64619,-1.63772 1.85723,-2.80979 1.694,-1.63956 2.92156,-2.14614 5.67747,-2.34288 1.47527,-0.10495 2.16445,-0.032 3.57215,0.38095 1.48362,0.43506 1.94773,0.70798 3.10626,1.82651 1.70942,1.65036 2.25524,3.04538 2.23261,5.70636 -0.0291,3.41194 -1.46575,5.72662 -4.35299,7.01273 -1.71581,0.76435 -5.20994,0.94533 -7.09233,0.36736 z m -115.69781,-7.4379 -0.0617,-13.13008 -3.4149,-0.0641 -3.41491,-0.0641 v 13.19426 13.1942 h 3.4768 3.47679 z m 35.02189,12.88627 c 5.57848,-0.87386 9.43058,-3.73535 11.06507,-8.21959 0.60235,-1.65248 0.86633,-5.42998 0.50802,-7.26957 -0.86323,-4.43193 -3.79437,-7.81822 -8.19431,-9.46686 -2.58572,-0.96883 -4.72073,-1.17598 -12.11927,-1.17598 h -6.57281 v 13.18791 13.18787 l 6.8897,-7.7e-4 c 3.78935,-7.7e-4 7.57996,-0.10995 8.4236,-0.24194 z m -8.36368,-12.8492 V 120.733 l 3.65452,0.0787 c 3.35842,0.0722 3.76137,0.12786 4.97258,0.68589 1.77565,0.81808 3.22494,2.27495 3.85741,3.87758 0.70863,1.79564 0.73168,5.18857 0.0468,6.88027 -1.42191,3.51196 -4.28497,4.93327 -9.95511,4.94215 l -2.57615,0.003 z m 58.95194,10.66365 v -2.42939 h -6.59014 -6.59018 v -3.12343 -3.12346 h 6.11087 6.11089 v -2.42935 -2.42934 h -6.11089 -6.11087 v -2.65695 -2.65689 l 6.41044,-0.0618 6.41044,-0.0618 0.0678,-2.48719 0.0678,-2.4872 h -9.95321 -9.95323 v 13.18795 13.18788 h 10.06495 10.06494 z m -55.99848,-37.63689 c -0.56514,-1.55315 -6.6479,-19.745362 -10.68201,-30.500635 -1.21711,-3.244903 -3.21419,-8.606818 -4.43794,-11.915368 -1.22378,-3.308552 -3.45791,-9.295163 -4.96476,-13.303554 -1.50687,-4.008448 -3.37737,-9.023954 -4.15674,-11.14554 v 0 c 0.1132,7.753794 -3.31132,15.478553 -7.05209,22.6287 -5.54096,10.59092 -14.16891,18.382289 -26.839111,24.236589 -9.254071,4.275859 -18.82133,6.915187 -32.010932,7.770321 -2.151756,0.139639 -20.122931,0.238112 -34.993323,0.238112 H 6.6093311 c 1.297449,-5.682097 2.499861,-11.390991 3.7229069,-17.005458 1.118101,-5.128453 2.349359,-10.868483 3.35183,-15.385899 1.002489,-4.517416 2.511699,-11.441092 3.353804,-15.385899 L 20.48539,27.82989 53.85656,27.92857 c 0,0 -1.203012,4.227488 -3.233756,13.371059 -1.18701,5.344567 -2.844658,12.944946 -3.683672,16.889781 -0.985729,5.086667 -2.138478,8.970379 -2.138478,8.970379 0.530336,0.347072 4.114758,0.275286 12.231781,0.267442 2.452576,-0.188444 4.351334,0.303934 10.093479,-1.082626 C 79.162694,63.776677 92.49974,54.640038 94.568569,43.052685 95.804409,27.517105 84.495569,23.666641 75.394993,21.337477 70.737164,20.434953 67.083172,20.664318 60.55474,20.636227 48.147006,20.582837 21.613907,20.991433 21.728877,20.60714 L 25.776134,1.9673101 26.169546,0.11634112 99.793939,0.05817112 153.64452,1.1189665e-6 171.86475,55.139193 c 15.90414,-16.81515 41.9698,-52.0728379 41.9698,-52.0728379 3.06637,-3.17516498 3.06637,-2.92540698 3.06637,-2.92540698 l 37.8987,-0.139251 c 22.87335,7.08e-4 37.83276,0.09054 39.93089,0.240169 18.93018,1.35096698 31.95022,7.23033778 39.68635,17.92100088 2.65097,3.663453 4.29404,7.800689 5.01207,12.62051 0.38653,2.594514 0.82857,9.168986 0.38658,12.084423 -2.08144,13.730651 -9.48751,24.14318 -20.88122,32.432894 -10.11263,7.35762 -22.67257,11.906626 -37.98327,13.756908 -6.99046,0.844756 -10.58984,0.937387 -36.57474,0.941064 l -22.68487,-0.24689 11.90128,-62.598027 32.28588,0.210248 -7.72673,39.483857 c 0,0.346577 13.62833,0.447274 16.79807,0.0707 3.72122,-0.442298 9.37453,-1.436308 14.32105,-3.701324 7.85521,-3.441626 16.01089,-8.597671 16.90708,-19.037053 0.72188,-8.408859 -8.53627,-20.060355 -17.72945,-22.01817 -4.65557,-0.964397 -11.12815,-1.1399 -28.62191,-1.39721 l -25.07841,-0.0062 -3.75735,4.178366 -63.53836,77.338047 z");

console.log("app.js is running");
import { PitchShifter } from "/shifter.js";
console.log("Finished importing PitchShifter to app.js");
// Finds the tempo knob in index.ejs and names it "knob"
const knob = document.querySelector(".knob");
console.log("Tempo knob is active");
// Finds the play button in index.ejs and names it "play"
const play = document.querySelector(".playButton");
console.log("Play button is active");
// Finds the next trial button in index.ejs and names it "next"
const next = document.querySelector(".nextButton");
console.log("Next Button is active");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
const changeRate = 0.2;                       // The rate at which the tempo knob changes tempo
let trueTempo;                                // True tempo of the audio file in ms
let tempo = 100;                              // Tempo of the audio file as a percentage
let margin = 10;                              // Percentage of variability of the starting tempo
let shifter;                                  // Becomes the PitchShifter variable
let tracker;                                  // Used for interval beat tracking

let audioPaths = [];                          // Array of paths to all audio files to be used in this experiment

// Variables for knob math
let prevX = 0;
let prevY = 0;
let deltaT = 0;

let beat = 1;        // Beat tracking variable for data gathering
let playing = false; // boolean indicating whether audio is playing, false by default

// Prepares the paths to the audio files
// takes an int (n) representing the total number of files to be included in the experiment
// takes an int (groups) representing the number of groups of files to be chosen from
// takes an int array (ar) representing the files in each group to be chosen from
// takes a string (context) representing if files should be context (true) or no-context (false)
prepAudioPaths(1, 1, [75, 100, 150], 'context');
// Prepares the audio file for the experiment. 
let audioSrc = audioPaths.pop();
// let audioSrc = "../Audio/1_context_75.wav";
fetch(audioSrc);

// Functions for decoding and preparing audio

function fetch(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () { onSuccess(request) };
    request.send();
}

function onSuccess(request) {
    var audioData = request.response;
    audioCtx.decodeAudioData(audioData, onBuffer, onDecodeBufferError);
}

function onBuffer(buffer) {
    shifter = new PitchShifter(audioCtx, buffer, 1024);
    // TODO: Move shifter tempo and pitch determinations into a helper function
    let n = Math.floor(Math.random() * 2) + 1;
    console.log(n);
    switch (n) {
        case 1:
            tempo += (Math.random() * margin);
        case 2:
            tempo -= (Math.random() * margin);
    }
    shifter.tempo = tempo/100;
    shifter.pitch = 1;
    shifter.on('play', (detail) => {
        playing = true;
    });
  }
  
  function onDecodeBufferError(e) {
    console.log('Error decoding buffer: ' + e.message);
    console.log(e);
  }

// Functions for reacting to tempo knob input
// Called every frame of movement from the mouse while a click is held down on the tempo knob
function tempoKnob(e) {
    const knobW = knob.clientWidth * 3.5;
    const knobH = knob.clientHeight * 1.5;
    // const knobW = knob.getBoundingClientRect().x;
    // const knobH = knob.getBoundingClientRect().y / 2;
    // console.log("knobW: " + knobW);
    // console.log("knobH: " + knobH);

    // mouse coordinates
    const currX = e.clientX - knob.offsetLeft;
    const currY = e.clientY - knob.offsetTop;

    // console.log("currX: " + currX);
    // console.log("currY: " + currY);
    // console.log("prevX: " + prevX);
    // console.log("prevY: " + prevY);

    const deltaX = knobW - currX;
    const deltaY = knobH - currY;
    // console.log(deltaX);
    // console.log(deltaY);

    // mouse coordinates in radians and degrees
    const rad = Math.atan2(deltaY, deltaX);
    var deg = rad * (180 / Math.PI);

    // Should probably make this a switch statement
    if (currY < knobH && currX > knobW) { 
        // console.log("Top Right");
        if (prevX <= currX && prevY <= currY) {
            // console.log("Increasing");
            tempo += changeRate;
            deltaT += changeRate;
        } else if (prevX >= currX && prevY >= currY) {
            // console.log("Decreasing");
            tempo -= changeRate;
            deltaT -= changeRate;
        }
    } else if (currY > knobH && currX > knobW) {
        // console.log("Bottom Right");
        if (prevX >= currX ** prevY >= prevY) {
            // console.log("Increasing");
            tempo += changeRate;
            deltaT += changeRate;
        } else if (prevX <= currX && prevY <= currY) {
            // console.log("Decreasing");
            tempo -= changeRate;
            deltaT -= changeRate;
        }
    } else if (currY < knobH && currX < knobW) {
        // console.log("Top Left");
        if (prevX <= currX && prevY >= currY) {
            // console.log("Increasing");
            tempo += changeRate;
            deltaT += changeRate;
        } else if (prevX >= currX && prevY <= currY) {
            // console.log("Decreasing");
            tempo -= changeRate;
            deltaT -= changeRate;
        }
    } else if (currY > knobH && currX < knobW) {
        // console.log("Bottom Left");
        if (prevX >= currX && prevY >= currY) {
            // console.log("Increasing");
            tempo += changeRate;
            deltaT += changeRate;
        } else if (prevX <= currX && prevY <= currY) {
            // console.log("Decreasing");
            tempo -= changeRate;
            deltaT -= changeRate;
        }
    }

    prevX = currX;
    prevY = currY;
    if (tempo > 0) {
        changeTempo(tempo);
    } else {
        tempo = 1;
    }
    console.log(tempo);

    clearInterval(tracker);
    tracker = setInterval(beatTrack, tempo - deltaT);
    return deg;
}

function rotate(e) {
    const result = Math.floor(tempoKnob(e) - 90);
    const movement = "rotate(${result}deg)"
    knob.style.transform = movement;
}

function startRotation() {
    window.addEventListener("mousemove", rotate);
    knob.style.setProperty('border', '3px solid #fff');
    knob.style.setProperty('border-radius', '200px');
    window.addEventListener("mouseup", endRotation);
}

function endRotation() {
    window.removeEventListener("mousemove", rotate);
    knob.style.setProperty('border', 'initial');
}

play.addEventListener("click", startTest);

next.addEventListener("click", nextAudio);

// Triggers when the play button is pressed
function startTest() {
    knob.addEventListener("mousedown", startRotation);
    shifter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    audioCtx.resume().then(() => {
        playing = true;
        this.setAttribute('disabled', 'disabled');
    });
    tracker = setInterval(beatTrack, trueTempo);
    shifter.connect(gainNode); // connect it to a GainNode to control the volume
    gainNode.connect(audioCtx.destination); // attach the GainNode to the 'destination' to begin playback
}

function nextAudio() {
    audioSrc = shifter.disconnect();
    knob.removeEventListener("mousedown", startRotation);
    playing = false;
    tempo = 100;
    // TODO: Save recorded data here
    if (audioPaths.length == 0) {
        // The experiment is done, maybe send a message to the user?
    } else {
        audioSrc = audioPaths.pop();
        fetch(audioSrc);
    }
}

// helper function to change the tempo of the audio
// takes an int representing the new tempo of the audio as a percentage
function changeTempo(t) { 
    // console.log(t/100);
    shifter.tempo = t/100;
    shifter.pitch = 1;     // ensures the pitch stays the same after changing tempo
}

// helper function to log how many beats the audio has been playing
function beatTrack() {
    //console.log("Beat #: " + beat);
    if (beat == 8) {
        beat = 0;
    }
    beat++;
    if (shifter.percentagePlayed == 100) {
        shifter.percentagePlayed = 0;
    }
}

// helper function to prep the paths of all audio files which will be used in this experiment
// takes an int (n) representing the total number of files to be included in the experiment
// takes an int (groups) representing the number of groups of files to be chosen from
// takes an int array (ar) representing the files in each group to be chosen from
// takes a string (context) representing if files should be context or nocontext
function prepAudioPaths(n, groups, ar, context) {
    // TODO: Throw error if n is larger than i
    var path = './Audio/';
    var group;
    var nums = [];
    for (var i = 0; i < n; i++) {
        group = prepAudioGroup(groups, nums);
        nums.push(group);
        audioPaths.push(path + group + '_' + context + '_' + '75' + '.wav');
    }
    trueTempo = 800;
    console.log(audioPaths);
    // TODO: Finalize naming policy and alter this function accordingly to access files other than those tagged with '75'.
}

// NOTE: AN ERROR OCCURS BETWEEN THE NUMBER BEING GENERATED AND THE TRANSITION TO A STRING.

// helper function to generate a random number from 1 to n which is not in the nums array
// takes the number of groups to choose from in the experiment (n) and the groups previously chosen (nums)
function prepAudioGroup(n, nums) {
    var num = Math.floor(Math.random() * n) + 1;
    if (inArray(num, nums)) {
        prepAudioGroup(n, nums);
    } else {
        console.log(num);
        return num;
    }
}

// helper function to check if an element already exists in an array
function inArray(el, ar) {
    for(var i = 0 ; i < ar.length; i++) {
        if(ar[i] == el) {
            return true;
        }
    }
    return false;
}
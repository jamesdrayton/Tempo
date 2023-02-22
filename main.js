
// NOTE: PACKAGE.JSON DOES NOT CURRENTLY RECOGNIZE MAIN.JS AS HAVING A TYPE: "type": "module", this is fine
// Run with "node/nodemon main" in /Tempo_Determination/App

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 3000;          // the port the server is created on
let audioSrc;               // the path to the audio file
let playing = false;        // whether the audio is playing upon loading the page
let tempo = 800;            // the starting tempo of the currently running audio file
let beat = 1;
let shifter;
let audioPaths;

console.log("Server starting");
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine', 'ejs');
app.listen(port);
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    console.log("Rendering page");
    res.render('index');
    console.log("Page rendered");
});

// Respond to the client's request for app.js by sending the file
app.get('/app.js', (req, res) => {
    res.sendFile('app.js', { root: __dirname });
    console.log("app.js provided to client");
});

// Respond to the client's request for shifter.js by sending the file
app.get('/shifter.js', (req, res) => {
    res.sendFile('shifter.js', { root: __dirname });
    console.log("shifter.js provided to client");
});

app.post('/', (req, res) => {
    console.log("Play button loaded");
});

app.get('/tempo', (req, res) => {
    // tempo knob has been turned
    console.log("Tempo knob in use");
});

// This receives a request from the client when the button is pressed
app.post('/audio', (req, res) => {
    // start playing audio
    console.log("Start playing audio");
});
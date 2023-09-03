let video = null;
let detector = null;
let detections = [];
let videoVisibility = true;
let detecting = true;
let activateAll = false;


speechSynthesis.addEventListener("voiceschanged", () => {
  const voices = speechSynthesis.getVoices()
  console.log(voices);
})


let allObjects = "person'bicycle'car'motorcycle'airplane'bus'train'truck'boat'traffic light'fire hydrant'stop sign'parking meter'bench'bird'cat'dog'horse'sheep'cow'elephant'bear'zebra'giraffe'backpack'umbrella'handbag'tie'suitcase'frisbee'skis'snowboard'sports ball'kite'baseball bat'baseball glove'skateboard'surfboard'tennis racket'bottle'wine glass'cup'fork'knife'spoon'bowl'banana'apple'sandwich'orange'broccoli'carrot'hot dog'pizza'donut'cake'chair'couch'potted plant'bed'dining table'toilet'tv'laptop'mouse'remote'keyboard'cell phone'microwave'oven'toaster'sink'refrigerator'book'clock'vase'scissors'teddy bear'hair drier'toothbrush".split("'");
let searchingObjects = [];
let foundObjects = [];


console.log(allObjects);

function preload() {
  detector = ml5.objectDetector('cocossd');
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("videoBox");
  canvas.mousePressed(startScreenShare);

  video = createVideo();
  video.hide();

  video.elt.addEventListener('loadeddata', function() {
    if (video.elt.readyState >= 2) {
      document.body.style.cursor = 'default';
      detect();
    }
  });
}

function startScreenShare() {
  if ('getDisplayMedia' in navigator.mediaDevices) {
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(screenStream => {
        video.elt.srcObject = screenStream;
        video.elt.play();
      })
      .catch(error => {
        console.error("Error starting screen share:", error);
      });
  }
}

function draw() {
  if (!video || !detecting) return;
  image(video, 0, 0, width, height);
  if(activateAll){
    for (let i = 0; i < detections.length; i++) {

          let detection = detections[i];
          let adjustedX = detection.x * (width / video.width); // Adjust x-coordinate
          let adjustedY = detection.y * (height / video.height); // Adjust y-coordinate
          let adjustedWidth = detection.width * (width / video.width); // Adjust width
          let adjustedHeight = detection.height * (height / video.height); // Adjust height
          detection.x = adjustedX;
          detection.y = adjustedY;
          detection.width = adjustedWidth;
          detection.height = adjustedHeight;

          stroke('green');
          strokeWeight(4);
          fill('rgba(0,128,0,0.25)');
          rect(detection.x, detection.y, detection.width, detection.height);

          stroke("black");
          textSize(25);
          fill('white');
          text(detection.label, detection.x + 10, detection.y + 14);
    }
  }
  else{
    for (let i = 0; i < detections.length; i++) {

      for(let j = 0; j < searchingObjects.length; j++){
        if(detections[i].label == searchingObjects[j]){
          foundObjects[j] = true;
          let detection = detections[i];
          let adjustedX = detection.x * (width / video.width); // Adjust x-coordinate
          let adjustedY = detection.y * (height / video.height); // Adjust y-coordinate
          let adjustedWidth = detection.width * (width / video.width); // Adjust width
          let adjustedHeight = detection.height * (height / video.height); // Adjust height
          detection.x = adjustedX;
          detection.y = adjustedY;
          detection.width = adjustedWidth;
          detection.height = adjustedHeight;

          stroke('green');
          strokeWeight(4);
          fill('rgba(0,128,0,0.25)');
          rect(detection.x, detection.y, detection.width, detection.height);

          stroke("black");
          textSize(25);
          fill('white');
          text(detection.label, detection.x + 10, detection.y + 14);

          
          
          break;
        }
        else{
          console.log(detections[i].label);
        }
      }


    }
    textSize(20)
    rect(0, 0, 150, searchingObjects.length*50);
    for(let i = 0; i < searchingObjects.length; i++){
      if(foundObjects[i]){
        stroke("green");
      }
      else{
        stroke("black");
      }
      text(searchingObjects[i], 10, 25+i*45);
    }
  }
}

function onDetected(error, results) {
  if (error) {
    console.error(error);
  }
  detections = results;
  if (detecting) {
    detect();
  }
}

function detect() {
  detector.detect(video, onDetected);
}

window.SpeechRecognition = window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
    let arrayOfTranscript = transcript.toLowerCase().split(" ");
    for(let i = 0; i < arrayOfTranscript.length; i++){
      if(arrayOfTranscript[i] == 'clear'){        
        searchingObjects = [];
        foundObjects = [];
      }
      else if(arrayOfTranscript[i] == 'activate'){
        activateAll = true;
      }
      else if(arrayOfTranscript[i] == 'regular'){
        activateAll = false;
      }
      console.log(arrayOfTranscript[i]);
      if(allObjects.includes(arrayOfTranscript[i])){
        if(!searchingObjects.includes(arrayOfTranscript[i])){


          let utterance = new SpeechSynthesisUtterance('I will help find your ' + arrayOfTranscript[i]);
          utterance.rate = 1;

          window.speechSynthesis.speak(utterance);
          
          utterance.onend = function () {
              console.log("Speech synthesis completed.");
          };
          
          searchingObjects.push(arrayOfTranscript[i]);
          foundObjects.push(false);
        }
      }
      else if(i == arrayOfTranscript.length-2 && allObjects.includes(arrayOfTranscript[i] + " " + arrayOfTranscript[i+1])){
        if(!searchingObjects.includes(arrayOfTranscript[i] + " " + arrayOfTranscript[i+1])){
          let utterance = new SpeechSynthesisUtterance('I will help locate your ' + arrayOfTranscript[i] + " " + arrayOfTranscript[i+1]);
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
          
          utterance.onend = function () {
              console.log("Speech synthesis completed.");
          };
          searchingObjects.push(arrayOfTranscript[i] + " " + arrayOfTranscript[i+1]);
          foundObjects.push(false);
        }
      }
    }

    for(let i = 0; i < searchingObjects.length; i++){
      console.log(searchingObjects);
    }
});

let talking = true;


recognition.start();

recognition.addEventListener('end', e => {
  recognition.start();

});
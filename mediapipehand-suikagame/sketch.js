// mediapipe-hand-landmarker-02
//
// # references
//
// * MediaPipe HandLandmarker Task for web
//   source: @mediapipe-preview on codepen
//   https://codepen.io/mediapipe-preview/pen/gOKBGPN
// * Mediapipe HandLandmarker Webcam
//   source: emnullfuenf on p5.js web editor
//   https://editor.p5js.org/emnullfuenf/sketches/dk5EivjNa



import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let capture;
let handLandmarker;
let hands;
let runningMode = "IMAGE";//tom


function setup() {
  let cv=createCanvas(320, 240);
  cv.position(900, 0);

  capture = createCapture(VIDEO, { flipped: true });
  capture.hide();
}

function draw() {
  background(0);

  
  image(capture, 0, 0, width, height);

  if (handLandmarker) {
    // JS->Unity:ClearCanvas
    if (_unityInstance != null) {
      _unityInstance.SendMessage('Plane', 'ClearCanvas');
      _unityInstance.SendMessage('Plane1', 'ClearCanvas');
    }

    hands = handLandmarker.detect(capture.canvas);
    
    if (hands) {
      if (hands.landmarks.length > 0) {
        //console.log(hands.handednesses[0][0].displayName);//T
        drawHandLandmarks();
      }
    }
  }
}

function drawHandLandmarks() {
  stroke(255);
  fill(255);

  for (let i = 0; i < hands.landmarks.length; i++) {
    let landmarks = hands.landmarks[i];
    //console.log(hands.landmarks);//Tom これをUnityへ送る
    //console.log(landmarks);//Tom これをUnityへ送る
    // JS->Unity:DrawHandsLandmark
    //if (_unityInstance != null) {
      //if (n == 0) {
      if((hands.handednesses[i][0].displayName)=="Right"){
        //console.log(results.multiHandedness[0].label + " " + n);
        console.log(hands.handednesses[i][0].displayName);
        //console.log(landmarks);//Tom これをUnityへ送る
        _unityInstance.SendMessage('Plane', 'DrawHandsLandmark', String(JSON.stringify(landmarks)));
        n = 1;
      } else if ((hands.handednesses[i][0].displayName)=="Left")  {
        console.log(hands.handednesses[i][0].displayName);
        //console.log(landmarks);//Tom これをUnityへ送る
        _unityInstance.SendMessage('Plane1', 'DrawHandsLandmark', String(JSON.stringify(landmarks)));
        n = 0;
      }
    //}//if

    for (let j = 0; j < landmarks.length; j++) {
      let landmark = landmarks[j];

      ellipse(landmark.x * width, landmark.y * height, 10)
    }//for
  }//for
}//f

function keyPressed() {
  // save 5 seconds
  if (key === 's') {
    saveGif("mediapipe-hand-landmarker-02", 5);
  }
}

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 2,
  });
};
createHandLandmarker();

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

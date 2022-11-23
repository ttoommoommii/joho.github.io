let classifier;
let video;
let label = "";
let label2 = "";

let resultsP;//

let img;//画像データ
//let height=480;
let h;

let ww;
let hh;




function setup() {
    //createCanvas(640, 480);
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.hide();
    // Initialize the Image Classifier method with MobileNet and the video as the second argument
    classifier = ml5.imageClassifier('MobileNet', video, modelReady); 
    //resultsP = createP('Loading model and video...');
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function preload() {
  img = loadImage('img/img2.png');
}

function draw() {
    if(windowHeight>video.height) h=video.height;
    else h=windowHeight;
    if(windowWidth < windowHeight){
        ww=windowWidth;hh=windowHeight;
    }else{
        ww=windowHeight;hh=windowWidth;
    }

    //video.resize(0.1,0.1);
    //scale(ww/video.width,ww/video.width);
    image(video, 0, 0 , ww,ww/video.width*video.height);
    scale(ww/video.width,ww/video.width);
    fill(0);
    textSize(20);
    strokeWeight(3);
    stroke(20, 181, 255);
    text("カメラ映像から推測したよ、" + label2,80,h - 40)
    textSize(20);
    text(label, 110, h - 10);
    image(img, 0, h - 69, 70, 70);
}

function modelReady() {
    console.log('Model Ready');
    classifyVideo();
  }
  
  // Get a prediction for the current video frame
  function classifyVideo() {
    classifier.classify(gotResult);
  }
  
  // When we get a result
  function gotResult(err, results) {
    // The results are in an array ordered by confidence.
    if (err) {
        console.error(err);
    } else {
    //resultsP.html('信頼度：' + nf(results[0].confidence, 0, 2));
    label2='信頼度：' + nf(results[0].confidence, 0, 2);
    label=results[0].label;
    classifyVideo();
    }
  }
let classifier;
let video;
let label = "";

let constraints=0;    //カメラ変更
let img;//画像データ


function setup() {

    if (!constraints) {
        //constraints = { video: true, audio: false };
        constraints = {video: {facingMode: 'environment'}, audio: false }; //'user'          
    }
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();

    classifier = ml5.imageClassifier("MobileNet", video, modelLoaded);

    //ボタンの追加
    CamChangeButton1=createButton("CamChange[背面]");
    CamChangeButton1.mousePressed(CamChangeBak);
    CamChangeButton1.size(200,30);
    CamChangeButton1.position(width/2 - 210, height);
    
    CamChangeButton2=createButton("CamChange[顔面]");
    CamChangeButton2.mousePressed(CamChangeFront);
    CamChangeButton2.size(200,30);
    CamChangeButton2.position(width/2 + 10, height);
    //img = loadImage('img.jpg'); // Load the image
    
}
function preload() {
  img = loadImage('img/img2.png');
}
function CamChangeBak(){
    //if (!constraints) {
        //constraints = { video: true, audio: true };
        constraints = {
           video: {
            // スマホのバックカメラを使用
            facingMode: 'user'//'environment' //'user'BAK
        }, audio: false };          
    //}
    //createCanvas(640, 480);
    
    video = createCapture(VIDEO);
    video.hide();

    classifier = ml5.imageClassifier("MobileNet", video, modelLoaded);
}
function CamChangeFront(){
     //if (!constraints) {
        //constraints = { video: true, audio: true };
        constraints = {
           video: {
            // スマホのバックカメラを使用
            facingMode: 'environment'//'environment' //'user'BAK
        }, audio: false };          
    //}
    //createCanvas(640, 480);
   
    video = createCapture(VIDEO);
    video.hide();

    classifier = ml5.imageClassifier("MobileNet", video, modelLoaded);
}


function draw() {
    image(video, 0, 0);
    fill(0);
    textSize(30);
    strokeWeight(3);
    stroke(20, 181, 255);
    text("カメラ映像から推測すると！！",80,height - 40)
    textSize(25);
    text(label, 110, height - 10);
    image(img, 0, height - 69, 70, 70);
}

function modelLoaded() {
    console.log("Model Loaded!");
    classifier.predict(gotResults);
}

function gotResults(err, results) {
    if (err) {
        console.error(err);
    } else {
        console.log(results);
        label = results[0].className;
        classifier.predict(gotResults);
    }
}
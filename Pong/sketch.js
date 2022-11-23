// 
let xBall = Math.floor(Math.random() * 300) + 50;
let yBall = 50;
const diameter = 100;

let vxBall = 10;
let vyBall = 10;

let xPaddle;
let yPaddle;
const paddleWidth = 200;
const paddleHeight = 10;

let video;
let classifier;

let action = "neutral";

let constraints=0;    //
let label = ""; //メッセージの表示
let img;//画像データ
let txt;
let txt2;

function setup() {
    if (!constraints) {//
        //constraints = { video: true, audio: false };
        constraints = {video: {facingMode: 'environment'}, audio: false }; //'user'          
    }

    createCanvas(640, 480);
 
    xPaddle = width / 2;
    yPaddle = height - 100;

    const featureExtractor = ml5.featureExtractor("MobileNet", modelLoaded);
    //featureExtractor.numClasses = 3;

    //noCanvas();//
    video = createCapture(VIDEO);
    video.hide();

    //classifier = featureExtractor.classification(video, videoReady);
    const options = { numLabels: 3 };
    classifier = featureExtractor.classification(video, options);

    //
    txt = createDiv('*');
    txt.position(20, 550);
    txt.remove();
    txt2 = createDiv('*');
    txt2.position(300, 550);
    txt2.remove();
    //
    leftButton = createButton("<-左");
    leftButton.mousePressed(function() {
        classifier.addImage("left");
        console.log("Added left image.");
        label="[左へ移動]の画像を追加";
    });
    leftButton.size(50,30);
    leftButton.position(350, height);

    neutralButton = createButton("停止");
    neutralButton.mousePressed(function() {
        classifier.addImage("neutral");
        console.log("Added neutral image.");
        label="[停止状態]の画像を追加";
    });
    neutralButton.size(50,30);
    neutralButton.position(400, height);

    rightButton = createButton("右->");
    rightButton.mousePressed(function() {
        classifier.addImage("right");
        console.log("Added right image.");
        label="[右へ移動]の画像を追加";
    });
    rightButton.size(50,30);
    rightButton.position(450, height);

    trainButton = createButton("学習開始");
    trainButton.mousePressed(function() {
        label="画像を学習しています";
        classifier.train((loss) => {
            if (loss == null) {
                console.log("Training is complete!!");
                label="画像を学習しました";
                classifier.classify(gotResults);
            } else {
                console.log(loss);
                txt.remove();
                txt = createDiv('学習==>loss:'+loss);
                txt.position(20, 550);
            }
        });
    });
    trainButton.size(130,30);
    trainButton.position(500, height);
    
    loadButton = createFileInput("ModelFileの読込");
    //loadButton.mousePressed(function() {
    loadButton.changed(function(){
        classifier.load(loadButton.elt.files, function() {
            label="学習Modelの読込完了";
        });
        console.log("ModelFile_Load");
        //label="学習Modelの読込中";
    });
    loadButton.size(300,30);
    loadButton.position(10, height+40);

    predictButton = createButton("認識開始");
    predictButton.mousePressed(function() {
        classify();
        console.log("classify");
        //label="認識開始";
    });
    predictButton.size(100,30);
    predictButton.position(320, height+40);

    saveButton = createButton("ModelFileの保存");
    saveButton.mousePressed(function() {
        classifier.save();
        console.log("ModelFile_Save");
        label="学習Modelを保存";
    });
    saveButton.size(150,30);
    saveButton.position(450, height+40);

    //
    CamChangeButton1=createButton("CamChange[背面]");
    CamChangeButton1.mousePressed(CamChangeBak);
    CamChangeButton1.size(150,30);
    CamChangeButton1.position(10, height);
    
    CamChangeButton2=createButton("CamChange[顔面]");
    CamChangeButton2.mousePressed(CamChangeFront);
    CamChangeButton2.size(150,30);
    CamChangeButton2.position(170, height);

    txt3 = createDiv('０、[<] [>] kye でパッドが動きます ');
    txt3.position(20, 600);
    txt4 = createDiv('１、[<-左]・[停止]・[右->]のボタンを5回程度押してポーズを記憶する');
    txt4.position(20, 620);
    txt5 = createDiv('２、[学習開始]ボタンを押して学習させます。ポーズに合わせてパッドが動く!!');
    txt5.position(20, 640);
}

function CamChangeBak(){
    //if (!constraints) {
        //constraints = { video: true, audio: true };
        constraints = {
           video: {
            facingMode: 'user'//'environment' //'user'BAK
        }, audio: false };          
    //}
    //createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
}
function CamChangeFront(){
    //if (!constraints) {
        //constraints = { video: true, audio: true };
        constraints = {
           video: {
            facingMode: 'environment'//'environment' //'user'BAK
        }, audio: false };          
    //}
    //createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
}
function preload() {
    img = loadImage('img/kousyou2.png');
}
function draw() {

    //
    push();
    translate(width, 0);
    scale(-1.0, 1.0);
    image(video, 0, 0, width, height);
    pop();

    //
    fill(255, 0, 255);
    noStroke();
    //ellipse(xBall, yBall, diameter, diameter);
    image(img, xBall-50, yBall-50, diameter, diameter);

    xBall += vxBall;
    yBall += vyBall;

    if (xBall < diameter / 2 || xBall > width - diameter / 2) {
        vxBall *= -1;
    }

    if (yBall < diameter / 2 || yBall > height - diameter / 2) {
        vyBall *= -1;
    }

    //
    fill(0, 200, 200);
    noStroke();
    rect(xPaddle, yPaddle, paddleWidth, paddleHeight);
    xPaddle = constrain(xPaddle, 0, width - paddleWidth);

    if ((xBall > xPaddle && xBall < xPaddle + paddleWidth) && (yBall + (diameter / 2) >=yPaddle)) {
        vxBall *= -1;
        vyBall *= -1;
    }

    //パッドを動かす
    if (action === "left") {
        xPaddle -= 10;
        label="左";
    } else if (action === "right") {
        xPaddle += 10;
        label="右";
    }
    //メッセージの表示
    textSize(40);
    strokeWeight(3);
    stroke(255, 255, 255);
    fill(0, 0, 0);
    text(label, 110, height - 10);
}

function keyPressed() { //キーボードでパッドを動かす
    if (keyCode === LEFT_ARROW) {
        xPaddle -= 50;
    } else if (keyCode === RIGHT_ARROW) {
        xPaddle += 50;
    }
}

function modelLoaded() {
    console.log("Model Loaded!");
    //
    
    classifier.load('./model/model.json', function() {
        txt.remove();
        txt = createDiv('--->  カスタムモデル読込完了');
        txt.position(20, 550);
    });
}

function videoReady() {
    console.log("The video is ready!");
    txt.remove();
    txt = createDiv('--->  Video読込完了');
    txt.position(20, 550);
}
// Classify the current frame.
function classify() {
    classifier.classify(gotResults);
}
function gotResults(err, results) {
    if (err) {
        console.error(err);
    }
    if (results && results[0]) {
        //action = results;
        action=results[0].label;
        let action2 = results[0].confidence.toFixed(2) * 100 + '%';
        console.log(results);
        classify();
        //classifier.classify(gotResults);
        txt2.remove();
        txt2 = createDiv(action + ' ==> 信頼度' + action2 );
        //txt2 = createDiv(action);
        
        txt2.position(300, 550);
    }
}

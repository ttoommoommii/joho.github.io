// 各変数の初期化
let video;
let poseNet;
let poses = [];

let leftShoulderX = 0;
let leftShoulderY = 0;

let rightShoulderX = 0;
let rightShoulderY = 0;
let leftElbowX = 0;
let leftElbowY = 0;

let rightElbowX = 0;
let rightElbowY = 0;

let leftWristX = 0;
let leftWristY = 0;

let rightWristX = 0;
let rightWristY = 0;

let leftHipX = 0;
let leftHipY = 0;

let rightHipX = 0;
let rightHipY = 0;

let noseX = 0;
let noseY = 0;

let lefteyeX = 0;
let lefteyeY = 0;
let righteyeX = 0;
let righteyeY = 0;


let soundS;
let soundE;

let img;
let img2;
let img3;
let imgF=0;
let img_LedRed;
let img_LedX=10;
let img_LedY=200;
let img_On;
let img_Off;
let img_OnX=100;
let img_OnY=100;
let img_OffX=540;
let img_OffY=100;
let img_LedF=0;
let img_LedWhite;

let t=0.5;　//ポイントの移動割合0.25だと差の1/4移動


let previousRightHandY = 0;

let debug = false;
let swf = false;
let mon = false;

//
var serial;          // variable to hold an instance of the serialport library
var portName = 'COM3';//'/dev/cu.usbserial-DN01DW79';  // fill in your serial port name here
var inData;   // variable to hold the input data from Arduino
var outData = 0;  // variable to hold the output data to Arduino
let menu;//

// 音声や画像ファイルの読み込み
function preload() {
        soundS = loadSound("img/s.mp3");
        soundE = loadSound("img/e.mp3");
        img = loadImage("img/saru1.png");
        img2 = loadImage("img/banana.png");
        img3 = loadImage("img/apple.png");
        img_LedRed=loadImage("img/led_red.png");
        img_LedWhite=loadImage("img/led_white.png");
        img_On=loadImage("img/button_off.png");
        img_Off=loadImage("img/button_on.png")
}

// ページを開いたときに一度だけ実行する処理
function setup() {
        createCanvas(640, 480);
        video = createCapture(VIDEO);
        video.hide();
        let poseNet = ml5.poseNet(video, modelLoaded);
        poseNet.on('pose', gotPoses);
        angleMode(DEGREES);

        posTitle = createP('[骨格を予測することができます。ジェスチャーでOn/Offも!!]');
        checkbox2 = createCheckbox('骨格表示', false);
        checkbox2.changed(toggleDebug);
        posiP = createP('');
        checkbox3 = createCheckbox('コスプレ', false);
        checkbox3.changed(toggleMon);
        checkbox1 = createCheckbox('スイッチ', false);
        checkbox1.changed(toggleSw);

        //set up communication port
        serial = new p5.SerialPort();       // make a new instance of the serialport library
        serial.list();//リストから選択するよ
        serial.on('list', printList);  // set a callback function for the serialport list event
        serial.on('connected', serverConnected); // callback for connecting to the server
        serial.on('open', portOpen);        // callback for the port opening
        serial.on('data', serialEvent);     // callback for when new data arrives
        serial.on('error', serialError);    // callback for errors
        serial.on('close', portClose);      // callback for the port closing
        //serial.list();                      // list the serial ports
        serial.open(portName);              // open a serial port
        
}

// 定期的に繰り返し実行される処理
function draw() {
        let arm_ratio = 1.8;
        let leftHandX = leftElbowX + (leftWristX - leftElbowX) * arm_ratio;
        let leftHandY = leftElbowY + (leftWristY - leftElbowY) * arm_ratio;

        let rightHandX = rightElbowX + (rightWristX - rightElbowX) * arm_ratio;
        let rightHandY = rightElbowY + (rightWristY - rightElbowY) * arm_ratio;
        
        //push(); //ここから反転
        translate(width,0);
        scale(-1.0,1.0);
        image(video, 0, 0);
        //pop();
        
        if(swf){
                push();
                translate(width,0);
                scale(-1.0, 1.0);   //左右反転
                imageMode(CENTER);
                image(img_On,img_OnX,img_OnY,100,100);
                image(img_Off,img_OffX,img_OffY,100,100);
                pop();
        
                if(img_LedF==0 && rightHandX<img_OnX+20 && rightHandX>img_OnX-20 && rightHandY<img_OnY){
                        img_LedF=1;
                        soundS.play();
                        outData = 255 + "\r\n";
                        serial.write(outData);
                        print('outData->%d',outData);        
                }
                if(img_LedF==1 && leftHandX<img_OffX+20 && leftHandX>img_OffX-20 && leftHandY<img_OffY){
                        img_LedF=0;
                        soundE.play();
                        outData = 0 + "\r\n";
                        serial.write(outData);
                        print('outData->%d',outData); 
                }
                if(img_LedF==0){
                        image(img_LedWhite,img_LedX,img_LedY,80,120);
                }else{
                        image(img_LedRed,img_LedX,img_LedY,80,120);
                }
        }//sw

        if(mon==true && imgF===1){
                let w = dist(righteyeX,righteyeY,lefteyeX,lefteyeY);
                push();
                imageMode(CENTER);
                image(img , noseX , noseY-1.0*w/2 , w*5 , w*4.5);
                image(img2 , rightHandX , rightHandY , w*3 , w*3);
                image(img3 , leftHandX , leftHandY , w*3 , w*3);
                pop();
        //ellipse(noseX, noseY, 10, 10);
        }

        // デバッグ用
        if (debug) {

                // キーポイントやスケルトンの表示
                drawKeypoints();
                drawSkeleton();
                // 右手、左手の予測位置に青丸を表示し、青い線で手首をつなげる
                strokeWeight(4);
                stroke(0, 0, 255);
                line(leftWristX, leftWristY, leftHandX, leftHandY);
                line(rightWristX, rightWristY, rightHandX, rightHandY);
                fill(0, 0, 255);
                noStroke();
                ellipse(leftHandX, leftHandY, 10, 10);
                ellipse(rightHandX, rightHandY, 10, 10);
                posiP.html('　ハンドポジション LX:' + int(leftHandX) + ' LY:' + int(leftHandY) + ' RX:' + int(rightHandX) + ' RY:' + int(rightHandY));
        }else{
                posiP.html('');
        }
        

       
        
}

// PoseNetモデルの読み込みが完了したときに呼ばれるコールバック関数
function modelLoaded() {
        console.log('Model Loaded!');
}

// ポーズが変わるたびに呼ばれるコールバック関数
function gotPoses(results) {
        poses = results;
        if (poses.length > 0) {
                imgF=1;

                let newLeftShoulderX = poses[0].pose.leftShoulder.x;
                let newLeftShoulderY = poses[0].pose.leftShoulder.y;

                let newRightShoulderX = poses[0].pose.rightShoulder.x;
                let newRightShoulderY = poses[0].pose.rightShoulder.y;

                let newLeftElbowX = poses[0].pose.leftElbow.x;
                let newLeftElbowY = poses[0].pose.leftElbow.y;

                let newRightElbowX = poses[0].pose.rightElbow.x;
                let newRightElbowY = poses[0].pose.rightElbow.y;

                let newLeftWristX = poses[0].pose.leftWrist.x;
                let newLeftWristY = poses[0].pose.leftWrist.y;

                let newRightWristX = poses[0].pose.rightWrist.x;
                let newRightWristY = poses[0].pose.rightWrist.y;

                //let newLeftHipX = poses[0].pose.leftHip.x;
                //let newLeftHipY = poses[0].pose.leftHip.y;

                //let newRightHipX = poses[0].pose.rightHip.x;
                //let newRightHipY = poses[0].pose.rightHip.y;
                //
                let newNoseX = poses[0].pose.nose.x;
                let newNoseY = poses[0].pose.nose.y;
                let newLeftEyeX = poses[0].pose.leftEye.x;
                let newLeftEyeY = poses[0].pose.leftEye.y;
                let newRigthEyeX = poses[0].pose.rightEye.x;
                let newRigthEyeY = poses[0].pose.rightEye.y;

                leftShoulderX = lerp(leftShoulderX, newLeftShoulderX, t);
                leftShoulderY = lerp(leftShoulderY, newLeftShoulderY, t);

                rightShoulderX = lerp(rightShoulderX, newRightShoulderX, t);
                rightShoulderY = lerp(rightShoulderY, newRightShoulderY, t);

                leftElbowX = lerp(leftElbowX, newLeftElbowX, t);
                leftElbowY = lerp(leftElbowY, newLeftElbowY, t);

                rightElbowX = lerp(rightElbowX, newRightElbowX, t);
                rightElbowY = lerp(rightElbowY, newRightElbowY, t);

                leftWristX = lerp(leftWristX, newLeftWristX, t);
                leftWristY = lerp(leftWristY, newLeftWristY, t);

                rightWristX = lerp(rightWristX, newRightWristX, t);
                rightWristY = lerp(rightWristY, newRightWristY, t);

                //leftHipX = lerp(leftHipX, newLeftHipX, t);
                //leftHipY = lerp(leftHipY, newLeftHipY, t);

                //rightHipX = lerp(rightHipX, newRightHipX, t);
                //rightHipY = lerp(rightHipY, newRightHipY, t);
                //
                noseX = lerp(noseX, newNoseX, t);
                noseY = lerp(noseY, newNoseY, t);
                lefteyeX = lerp(lefteyeX, newLeftEyeX, t);
                lefteyeY = lerp(lefteyeY, newLeftEyeY, t);
                righteyeX = lerp(righteyeX, newRigthEyeX , t);
                righteyeY = lerp(righteyeY, newRigthEyeY, t);
        }
        else{
                imgF=0;
        }
}

// デバッグモードON/OFFの切り替え
function toggleDebug() {
        if (this.checked()) {
                debug = true;
        } else {
                debug = false;
        }
}
function toggleSw() {
        if (this.checked()) {
                swf = true;
        } else {
                swf = false;
        }
}
function toggleMon() {
        if (this.checked()) {
                mon = true;
        } else {
                mon = false;
        }
}

// Following functions print the serial communication status to the console for debugging purposes
/*function printList(portList) {
        // portList is an array of serial port names
        for (var i = 0; i < portList.length; i++) {
        // Display the list the console:
        print(i + " " + portList[i]);
        }
} */
function serverConnected() {
        print('connected to server.');
}      
function portOpen() {
        print('the serial port opened.')
}       
function serialEvent() {
        inData = Number(serial.read());
}       
function serialError(err) {
        print('Something went wrong with the serial port. ' + err);
}       
function portClose() {
        print('The serial port closed.');
}
// Got the list of ports
function printList(serialList) {
        menu = createSelect();
        let title = createElement('option', 'Port選択:');
        menu.child(title);
        menu.position(550, 500);
        menu.changed(openPort);
        for (let i = 0; i < serialList.length; i++) {
          let thisOption = createElement('option', serialList[i]);
          thisOption.value = serialList[i];
          menu.child(thisOption);
          print(i + " " + serialList[i]);
        }
}
function openPort() {
        portName = menu.elt.value;
        serial.open(portName);
}
       
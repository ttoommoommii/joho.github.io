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


let sound_gandam1;
let sound_gandam2;
let sound_gandam3;
let sound_gandam4;
let sound_gandam_bgm1;
let sound_gandam_bgm2;
let sound_gandam_bgm3;
let sound_gandam_yunikon;
let sound_gandam_fannneru;

let img;
let img2;
let img3;
let img_LedRed;
let img_LedX = 10;
let img_LedY = 200;
let img_On;
let img_Off;
let img_OnX = 100;
let img_OnY = 100;
let img_OffX = 540;
let img_OffY = 100;
let img_LedF = 0;
let img_LedWhite;

let w; //目の間隔

let t = 0.5;　//ポイントの移動割合0.25だと差の1/4移動

let camp_w = 640;//640;
let camp_h = 480;//480;


//let previousRightHandY = 0;

let debug = false;
let swf = false;
let mon = true;
let sound_f = false;
let sound_bgm = true;

// 音声や画像ファイルの読み込み
function preload() {
        soundFormats('ogg', 'mp3');
        sound_gandam1 = loadSound("img/gandam1.mp3");
        sound_gandam2 = loadSound("img/gandam2.mp3");
        sound_gandam3 = loadSound("img/gandam3.mp3");
        sound_gandam4 = loadSound("img/gandam4.mp3");
        sound_gandam_bgm1 = loadSound("img/Gundam_bgm1.mp3");
        sound_gandam_bgm2 = loadSound("img/Gundam_bgm2.mp3");
        sound_gandam_bgm3 = loadSound("img/Gundam_bgm3.mp3");
        sound_gandam_yunikon = loadSound("img/Gundam_bgm2.mp3");//yunikon.mp3");
        sound_gandam_fannneru = loadSound("img/gandam_fanneru.mp3");

        img = loadImage("img/gandam_face.png");
        img2 = loadImage("img/gandam_ceald.png");//("img/banana.png");
        img3 = loadImage("img/gandam_saveru.png");//("img/apple.png");
        img_LedRed = loadImage("img/led_red.png");
        img_LedWhite = loadImage("img/led_white.png");
        img_On = loadImage("img/button_off.png");
        img_Off = loadImage("img/button_on.png")
}
//COM
let port;

async function onStartButtonClick() {
        try {
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 57600 }); //115200
                console.log("接続");
        } catch (e) {
                console.log("Error");
        }
}

async function writeText(text) {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(text));
        console.log("テキスト書き込み: " + text);
        writer.releaseLock();
}
async function writeText2(text) {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(text));
        console.log("テキスト書き込み: " + text);
        //writer.releaseLock();
        await sleep(3000);
        await writer.write(encoder.encode('#M0'));
        console.log("テキスト書き込み: #M0");
        await sleep(2000);
        await writer.write(encoder.encode('#X'));
        console.log("テキスト書き込み: #X");
        writer.releaseLock();
        await sleep(10000);
}
//sleep関数
const sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));
//-COM

// ページを開いたときに一度だけ実行する処理
function setup() {
        createCanvas(camp_w, camp_h);
        //createCanvas(1280, 960);
        video = createCapture(VIDEO);
        video.hide();
        let poseNet = ml5.poseNet(video, modelLoaded);
        poseNet.on('pose', gotPoses);
        angleMode(DEGREES);
        posTitle = createP('＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋＋');
        posTitle = createP('');
        posTitle = createP('[骨格を予測します。スイッチOn/Offも!!]');
        checkbox2 = createCheckbox('←➀骨格表示', false);
        checkbox2.changed(toggleDebug);
        checkbox3 = createCheckbox('←➁コスプレ', true);
        checkbox3.changed(toggleMon);

        //checkbox1 = createCheckbox('←➂スイッチ', false);
        //checkbox1.changed(toggleSw);
        posiP = createP('');    //デバックチェックを押した時に座標が表示される場所

        comButton = createButton("接続");
        comButton.mousePressed(function () {
                onStartButtonClick();
                console.log("comButton");
        });
        comButton.size(100, 30);
        comButton.position(670, windowHeight + 60);

        OnButton = createButton("サーボOFF");
        OnButton.mousePressed(function () {
                writeText2('#M0');
                console.log("サーボOFF");
        });
        OnButton.size(100, 30);
        OnButton.position(670, windowHeight +90);

        OffButton = createButton("BGM mute");
        OffButton.mousePressed(function () {
                sound_gandam_yunikon.pause();
                sound_bgm = false;
                console.log("sound mute");
        });
        OffButton.size(100, 30);
        OffButton.position(670, windowHeight +120);

        sOffButton = createButton("BGM play");
        sOffButton.mousePressed(function () {
                sound_gandam_yunikon.loop();
                sound_bgm = true;
                console.log("sound loop");
        });
        sOffButton.size(100, 30);
        sOffButton.position(670, windowHeight + 150);

        //com

        //p5.play　

        rapiro_l = createSprite(camp_w - 150, 80);
        rapiro_l.addImage(loadImage('img/rapiro_l.png'));
        rapiro_l.scale = 0.1;
        rapiro_r = createSprite(150, 80);
        rapiro_r.addImage(loadImage('img/rapiro_r.png'));
        rapiro_r.scale = 0.1;
        rapiro_c = createSprite(camp_w / 2, 50);
        rapiro_c.addImage(loadImage('img/rapiro_c.png'));
        rapiro_c.scale = 0.15;
        gandamu_raifuru = createSprite(camp_w - 50, camp_h / 2);
        gandamu_raifuru.addImage(loadImage('img/gandam_raifuru.png'));
        gandamu_raifuru.scale = 0.3;
        rapiro_fig = createSprite(50, camp_h / 2);
        rapiro_fig.addImage(loadImage('img/rapiro_fig.png'));
        rapiro_fig.scale = 0.3;


        //compact way to add an image
        circle = createSprite(camp_w, camp_h);
        circle.addImage(loadImage('assets/plain_circle.png'));
        circle.scale = 0.1;
        circle2 = createSprite(camp_w, camp_h);
        circle2.addImage(loadImage('assets/plain_circle2.png'));
        circle2.scale = 0.1;

        sound_gandam_yunikon.setVolume(0.1);
        //sound_gandam_yunikon.play();
        sound_gandam_yunikon.loop();


}

// 定期的に繰り返し実行される処理
function draw() {
        //scale(0.5, 0.5);

        let arm_ratio = 1.5;//1.8;    //手の位置
        let leftHandX = leftElbowX + (leftWristX - leftElbowX) * arm_ratio;
        let leftHandY = leftElbowY + (leftWristY - leftElbowY) * arm_ratio;

        let rightHandX = rightElbowX + (rightWristX - rightElbowX) * arm_ratio;
        let rightHandY = rightElbowY + (rightWristY - rightElbowY) * arm_ratio;

        //push(); //ここから反転
        translate(width, 0);
        scale(-1.0, 1.0);
        image(video, 0, 0, video.width, video.height);

        //background(0);
        //image(video, mouseX, mouseY, 160, 120);
        //pop();

        w = dist(righteyeX, righteyeY, lefteyeX, lefteyeY);//目の間隔を測る
        /*if (swf) {
                push();
                translate(width, 0);
                scale(-1.0, 1.0);   //左右反転
                imageMode(CENTER);
                image(img_On, img_OnX, img_OnY, 100, 100);
                image(img_Off, img_OffX, img_OffY, 100, 100);
                pop();

                if (img_LedF == 0 && rightHandX < img_OnX + 20 && rightHandX > img_OnX - 20 && rightHandY < img_OnY) {
                        img_LedF = 1;
                        soundS.play();
                        writeText('401\n');
                }
                if (img_LedF == 1 && leftHandX < img_OffX + 20 && leftHandX > img_OffX - 20 && leftHandY < img_OffY) {
                        img_LedF = 0;
                        soundE.play();
                        writeText('400\n');
                }
                if (img_LedF == 0) {
                        image(img_LedWhite, img_LedX, img_LedY, 80, 120);
                } else {
                        image(img_LedRed, img_LedX, img_LedY, 80, 120);
                }
        }//sw*/

        if (mon == true) {
                //w = dist(righteyeX,righteyeY,lefteyeX,lefteyeY);
                push();
                imageMode(CENTER);
                //image(img , noseX , noseY-1.8*w/2 , w*5 , w*4.5);
                image(img, noseX, noseY - 2.5 * w / 2, w * 4.0, w * 4.0);
                image(img2, rightHandX, rightHandY, w * 2, w * 2);
                image(img3, leftHandX, leftHandY, w * 2, w * 3);
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
                posiP.html('　ハンドポジション LX:' + int(leftHandX) + ' LY:' + int(leftHandY) + ' RX:' + int(rightHandX) + ' RY:' + int(rightHandY) + ' w:' + int(w));
        } else {
                posiP.html('');
        }

        //scale(0.1,0.1);

        //p5.play//////////////////////////////////////////////////////////////
        push();
        translate(width, 0);
        scale(-1.0, 1.0);   //左右反転
        //circle.position.x = mouseX;
        //circle.position.y = mouseY;
        circle.position.x = camp_w - leftHandX; //座標だけ左右反転 w=640キャンパスサイズ
        circle.position.y = leftHandY;
        circle2.position.x = camp_w - rightHandX; //座標だけ左右反転 w=640キャンパスサイズ
        circle2.position.y = rightHandY;

        if (!sound_f && rapiro_r.overlap(circle)) {
                sound_f = true;
                //sound_gandam_yunikon.pause();
                sound_gandam1.setVolume(1);
                sound_gandam1.play();
                writeText2('#M6');
        }
        else if (!sound_f && rapiro_l.overlap(circle2)　|| rapiro_l.overlap(circle)) {
                sound_f = true;
                //sound_gandam_yunikon.pause();
                sound_gandam4.setVolume(1);
                sound_gandam4.play();
                writeText2('#M8');
        }
        else if (!sound_f && rapiro_c.overlap(circle2)) {
                sound_f = true;
                //sound_gandam_yunikon.pause();
                sound_gandam2.setVolume(1);
                sound_gandam2.play();
                writeText2('#M5');
        }
        else if (!sound_f && gandamu_raifuru.overlap(circle2)) {
                sound_f = true;
                //sound_gandam_yunikon.pause();
                sound_gandam3.setVolume(1);
                sound_gandam3.play();
                writeText2('#M9');
        }
        else if (!sound_f && rapiro_fig.overlap(circle)) {
                sound_f = true;
                var s = createSprite(rapiro_fig.position.x + 50, rapiro_fig.position.y, 30, 30);
                s.addImage(loadImage('img/gandam_fan.png'));
                s.scale = 0.05;
                s.velocity.x = random(0, 20);
                s.velocity.y = random(-5, 5);
                s.life = 300;//set a self destruction timer (life)
                if (!sound_gandam_fannneru.isPlaying()) {
                        sound_gandam_fannneru.play();
                }
        }
        if (!sound_gandam1.isPlaying() && !sound_gandam2.isPlaying() && !sound_gandam4.isPlaying()) {
                if (!sound_gandam_yunikon.isPlaying() && sound_bgm) {
                        sound_gandam_yunikon.loop();
                }
                sound_f = false;
        }

        textSize(25);
        textAlign(CENTER, CENTER);
        let info = '手を動かし、剣やシールドでロボットたちをタッチ';
        fill(255,255,255);
        text(info, 310, camp_h - 20); 

        //draw the sprites////////////////////////////////////////
        drawSprites();
        pop();

       
        //p5.play
}

/////////////////////////////////////////////////////////////////

// PoseNetモデルの読み込みが完了したときに呼ばれるコールバック関数
function modelLoaded() {
        console.log('Model Loaded!');
}

// ポーズが変わるたびに呼ばれるコールバック関数
function gotPoses(results) {
        poses = results;
        if (poses.length > 0) {
                imgF = 1;

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
                righteyeX = lerp(righteyeX, newRigthEyeX, t);
                righteyeY = lerp(righteyeY, newRigthEyeY, t);
        }
        else {
                imgF = 0;
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

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
let sound_kira;
let sound_horror;
let sound_logo;
let sound_pui;

let img;
let img2;
let img3;
let imgF = 0;
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
let mon = false;

// 音声や画像ファイルの読み込み
function preload() {
        soundS = loadSound("img/s.mp3");
        soundE = loadSound("img/e.mp3");
        sound_kira = loadSound("img/shine_kirakira_02.mp3");
        sound_horror = loadSound("img/horror_4.mp3");
        sound_logo = loadSound("img/sound_logo.mp3");
        sound_pui = loadSound("img/pui.mp3");
        img = loadImage("img/kiti3.png");
        img2 = loadImage("img/Lhand.png");//("img/banana.png");
        img3 = loadImage("img/Rhand.png");//("img/apple.png");
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
                await port.open({ baudRate: 115200 });
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

        posTitle = createP('[骨格を予測します。スイッチOn/Offも!!]');
        checkbox2 = createCheckbox('←➀骨格表示', false);
        checkbox2.changed(toggleDebug);
        checkbox3 = createCheckbox('←➁コスプレ', false);
        checkbox3.changed(toggleMon);
        checkbox1 = createCheckbox('←➂スイッチ', false);
        checkbox1.changed(toggleSw);
        posiP = createP('');    //デバックチェックを押した時に座標が表示される場所

        comButton = createButton("接続");
        comButton.mousePressed(function () {
                onStartButtonClick();
                console.log("comButton");
        });
        comButton.size(50, 30);
        comButton.position(670, windowHeight + 60);
        //comButton.position(video.width*www-250, video.height+500);


        OnButton = createButton("On");
        OnButton.mousePressed(function () {
                writeText('401\n');
                console.log("On");
        });
        OnButton.size(50, 30);
        OnButton.position(670, windowHeight + 90);
        //OnButton.position(video.width*www-150, video.height+500);


        OffButton = createButton("Off");
        OffButton.mousePressed(function () {
                writeText('400\n');
                console.log("Off");
        });
        OffButton.size(50, 30);
        OffButton.position(670, windowHeight + 120);
        //OffButton.position(video.width*www-150, video.height+540);
        //com

        //p5.play　漂う雲
        cloud = createSprite(400, 200);
        cloud.addAnimation('normal', 'assets/cloud_breathing0001.png', 'assets/cloud_breathing0009.png');
        cloud.velocity.x = 3;

        circle = createSprite(400, 200);
        //compact way to add an image
        circle.addImage(loadImage('assets/plain_circle.png'));
        circle.scale = 0.1;
        circle2 = createSprite(400, 200);
        circle2.addImage(loadImage('assets/plain_circle2.png'));
        circle2.scale = 0.1;

        //横移動するお化け　create a sprite and add the 3 animations
        ghost = createSprite(400, 150, 50, 100);
        //label, first frame, last frame
        //the addAnimation method returns the added animation
        //that can be store in a temporary variable to change parameters
        var myAnimation = ghost.addAnimation('floating', 'assets/ghost_standing0001.png', 'assets/ghost_standing0007.png');
        //offX and offY is the distance of animation from the center of the sprite
        //in this case since the animations have different heights i want to adjust
        //the vertical offset to make the transition between floating and moving look better
        myAnimation.offY = 18;
        ghost.addAnimation('moving', 'assets/ghost_walk0001.png', 'assets/ghost_walk0004.png');
        ghost.addAnimation('spinning', 'assets/ghost_spin0001.png', 'assets/ghost_spin0003.png');

        //create the sprites ふらふら
        //ghost2 = createSprite(600, 200, 50, 100);
        //ghost2.addAnimation('floating', 'assets/ghost_standing0001.png', 'assets/ghost_standing0007.png');

        ghost2 = createSprite(400, 200, 50, 100);
        ghost2.addAnimation('floating', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png');
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
        if (swf) {
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
        }//sw

        if (mon == true && imgF === 1) {
                //w = dist(righteyeX,righteyeY,lefteyeX,lefteyeY);
                push();
                imageMode(CENTER);
                //image(img , noseX , noseY-1.8*w/2 , w*5 , w*4.5);
                image(img, noseX, noseY - 2.1 * w / 2, w * 4.0, w * 6.0);
                image(img2, rightHandX, rightHandY, w * 4.5, w * 4.5);
                image(img3, leftHandX, leftHandY, w * 4.5, w * 4.5);
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

        //p5.play//漂う雲//////////////////////////////////////////////////////////////
        push();
        translate(width, 0);
        scale(-1.0, 1.0);   //左右反転
        //circle.position.x = mouseX;
        //circle.position.y = mouseY;
        circle.position.x = camp_w - leftHandX; //座標だけ左右反転 w=640キャンパスサイズ
        circle.position.y = leftHandY;
        circle2.position.x = camp_w - rightHandX; //座標だけ左右反転 w=640キャンパスサイズ
        circle2.position.y = rightHandY;
        //sprites' visibility can be turned on an off
        //and invisible sprite is still updating normally
        if (mouseIsPressed)
                cloud.visible = false;
        else
                cloud.visible = true;

        if (cloud.position.x > width) {
                //cloud.position.x = 0;
                cloud.velocity.x = -1;
        }
        if (cloud.position.x < 0) {
                //cloud.position.x = width;
                cloud.velocity.x = 1;
        }
        if (cloud.position.y > height / 4) {
                //cloud.position.y = height/4;
                cloud.velocity.y = -1;
        }
        if (cloud.position.y < 0) {
                //cloud.position.y = height;
                cloud.velocity.y = 1;
        }

        //  if(mouseY > cloud.position.y-10 && mouseY < cloud.position.y+10 && mouseX > cloud.position.x-10 && mouseX < cloud.position.x+10){
        if (cloud.overlap(circle)) {
                //mousePressed();
                //var s = createSprite(mouseX, mouseY, 30, 30);
                //var s = createSprite(circle.position.x, circle.position.y, 50, 100);
                //s.addAnimation('floating', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png');
                //var s2 = createSprite(circle.position.x, circle.position.y, 50, 100);
                //s2.addAnimation('floating', 'assets/ghost_standing0001.png', 'assets/ghost_standing0007.png');

                //s.velocity.x = random(-5, 5);
                //s.velocity.y = random(-5, 5);
                //s2.velocity.x = random(-5, 5);
                //s2.velocity.y = random(-5, 5);
                var splat = createSprite(circle.position.x, circle.position.y);
                splat.addAnimation('normal', 'assets/asterisk_explode0001.png', 'assets/asterisk_explode0011.png');
                splat.velocity.x = random(-3, 3);
                splat.velocity.y = random(-3, 3);
                splat.life = 100;//set a self destruction timer (life)

                cloud.velocity.x = random(-3, 3);
                cloud.velocity.y = random(-3, 3);

                if (!sound_pui.isPlaying()) {
                        sound_horror.stop();
                        sound_kira.stop();
                        sound_logo.stop();
                        sound_pui.play();
                }

                //if(!sound_kira.isPlaying()) sound_kira.play();

        }
        if (cloud.overlap(circle2)) {
                //mousePressed();
                //var s = createSprite(mouseX, mouseY, 30, 30);
                var s = createSprite(circle2.position.x, circle2.position.y, 30, 30);
                s.velocity.x = random(-3, 3);
                s.velocity.y = random(-3, 3);
                s.life = 100;//set a self destruction timer (life)
                cloud.velocity.x = random(-3, 3);
                cloud.velocity.y = random(-3, 3);

                if (!sound_kira.isPlaying()) {
                        sound_horror.stop();
                        sound_logo.stop();
                        sound_pui.stop();
                        sound_kira.play();
                }
        }


        //お化けif mouse is to the left
        ghost.position.y = rightShoulderY - 30;
        //ghost.position.x = w-rightShoulderX; //x軸が反転しているのでwから引く

        if (rightShoulderX > camp_w - ghost.position.x + 10) {
                ghost.changeAnimation('moving');
                //flip horizontally
                ghost.mirrorX(-1);
                //negative x velocity: move left
                ghost.velocity.x = -2;
        }
        else if (rightShoulderX < camp_w - ghost.position.x - 10) { //+ 10) {
                ghost.changeAnimation('moving');
                //unflip
                ghost.mirrorX(1);
                ghost.velocity.x = 2;
        }
        else {
                //if close to the mouse, don't move
                ghost.changeAnimation('floating');
                ghost.velocity.x = 0;
        }

        if (ghost.overlap(circle) || ghost.overlap(circle2)) {//mouseIsPressed) {
                //the rotation is not part of the spinning animation
                ghost.rotation -= 10;
                ghost.changeAnimation('spinning');
                if (!sound_horror.isPlaying()) {
                        sound_kira.stop();
                        sound_logo.stop();
                        sound_pui.stop();
                        sound_horror.play();
                }
        }
        else
                ghost.rotation = 0;

        ghost.scale = (0.8 + int(w / 10)) / 5;//目の間隔でサイズを変える

        //up and down keys to change the scale
        //note that scaling the image quality deteriorates
        //and scaling to a negative value flips the image
        if (keyIsDown(UP_ARROW))
                ghost.scale += 0.05;
        if (keyIsDown(DOWN_ARROW))
                ghost.scale -= 0.05;

        //お化けゆらゆら　or by applying a force toward a point
        //force (acceleration), pointx, pointy
        ghost2.attractionPoint(0.4, camp_w - leftShoulderX - 100, leftShoulderY - 40);
        //since the force keeps incrementing the speed you can
        //set a limit to it with maxSpeed
        ghost2.maxSpeed = 5;
        ghost2.scale = (0.8 + int(w / 10)) / 5;//目の間隔でサイズを変える

        if (ghost2.overlap(circle) || ghost2.overlap(circle2)) {//mouseIsPressed) {
                var splat2 = createSprite(circle.position.x, circle.position.y);
                splat2.addAnimation('normal', 'assets/asterisk_stretching0000.png', 'assets/asterisk_stretching0008.png');
                splat2.velocity.x = random(-3, 3);
                splat2.velocity.y = random(-3, 3);
                splat2.life = 100;//set a self destruction timer (life)
                if (!sound_logo.isPlaying()) {
                        sound_horror.stop();
                        sound_kira.stop();
                        sound_pui.stop();
                        sound_logo.play();
                }

        }

        //draw the sprites////////////////////////////////////////
        drawSprites();
        pop();
        //p5.play
}

//every mouse press
function mousePressed() {

        //create a sprite
        var splat = createSprite(mouseX, mouseY);
        splat.addAnimation('normal', 'assets/asterisk_explode0001.png', 'assets/asterisk_explode0011.png');

        //set a self destruction timer (life)
        splat.life = 10;
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

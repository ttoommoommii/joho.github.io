const isFlipped = true;

let keypointsHand = [];

const videoElement = document.getElementsByClassName("input_video")[0];
videoElement.style.display = "none";

function onHandsResults(results) {
    keypointsHand = results.multiHandLandmarks;
    
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
});

hands.setOptions({
    selfieMode: isFlipped,
    maxNumHands: 2, // 今回、簡単化のため検出数の最大1つまでに制限
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});
hands.onResults(onHandsResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});
camera.start();

let videoImage;
function setup() {
    const canvas = createCanvas(640, 480); //(window.innerWidth,window.innerHeight);//(500, 400);
    videoImage = createGraphics(640, 480);
}

let img_tths;
// setup()より先に呼び出される
function preload() {
    img_tths = loadImage('tths.png');
}

function draw() {
    clear();
    background("rgba(100, 100, 255, 0.2)");

    videoImage.drawingContext.drawImage(
        videoElement,
        0,
        0,
        videoImage.width,
        videoImage.height
    );

    push();
    if (isFlipped) {
        translate(width, 0);
        scale(-1, 1);
    }
    displayWidth = width;
    displayHeight = (width * videoImage.height) / videoImage.width;
    image(videoImage, 0, 0, displayWidth, displayHeight);
    pop();

    

    if (keypointsHand.length > 0) {
        console.log(keypointsHand); // 結果を得る

        for (i = 0; i < keypointsHand.length; i++) {
            for (j = 0; j <= 20; j++) {//T
                const indexTip = keypointsHand[i][j];
                console.log(indexTip);
                if (j % 4 == 0 && j!=0) {
                    push()
                    //scale(0.1, 0.1);
                    imageMode(CENTER);
                    image(img_tths, indexTip.x * displayWidth, indexTip.y * displayHeight-20
                        ,img_tths.width * 0.05,img_tths.height * 0.05);
                    pop();
                }
                else {
                    //let c = color('white');
                    //fill(c);
                    ellipse(indexTip.x * displayWidth, indexTip.y * displayHeight, 5);
                }
                //line(keypointsHand[i][j].x * displayWidth, keypointsHand[i][j].y * displayHeight, 0, 0);
            }
        }//T
        //const indexTip = keypointsHand[0][i];
        //console.log(indexTip);
        //ellipse(indexTip.x * displayWidth, indexTip.y * displayHeight, 10);
    }
   
}
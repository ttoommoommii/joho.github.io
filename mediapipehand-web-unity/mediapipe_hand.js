// MediaPipe Hands Instance
    let hands = null;
    hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });


    function mediapipeHandsStars() {


      const video = document.getElementById('input');
      const canvas = document.getElementById('output');
      const ctx = canvas.getContext('2d');

      //関連ファイルの読み込み
      /*
      const config = {
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      };
      const hands = new Hands(config);
      */

      //カメラからの映像をhands.jsで使えるようにする
      const camera = new Camera(video, {
        onFrame: async () => {
          // Remove Loading Icon
          var loadingElement = document.getElementById("loading");
          if (loadingElement != null) {
            loadingElement.remove();
          }
          await hands.send({ image: video });
        },
        width: 320,
        height: 180
      });

      hands.setOptions({
        maxNumHands: 2,              //検出する手の最大数
        modelComplexity: 1,          //ランドマーク検出精度(0か1)
        minDetectionConfidence: 0.5, //手を検出するための信頼値(0.0~1.0)
        minTrackingConfidence: 0.5   //ランドマーク追跡の信頼度(0.0~1.0)
      });



      //形状認識した結果の取得
      hands.onResults(results => {
        // JS->Unity:ClearCanvas
        if (_unityInstance != null) {
          _unityInstance.SendMessage('Plane', 'ClearCanvas');
          _unityInstance.SendMessage('Plane1', 'ClearCanvas');

        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        //console.log(results.multiHandLandmarks[0]);


        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach(marks => {
            // 緑色の線で骨組みを可視化
            drawConnectors(ctx, marks, HAND_CONNECTIONS, { color: '#0f0' });
            // 赤色でランドマークを可視化
            drawLandmarks(ctx, marks, { color: '#f00' });

            if (results.multiHandLandmarks.length == 1 && results.multiHandedness[0].label=="Left") {
              n=0;
              console.log(results.multiHandedness[0].label+ " "+results.multiHandedness[0].index+ " " + n);
            }
            else if (results.multiHandLandmarks.length == 1 && results.multiHandedness[0].label=="Right") {
              n=1;
              console.log(results.multiHandedness[0].label+ " "+results.multiHandedness[0].index+ " " + n);
            }
            //if (results.multiHandLandmarks.length == 2) {
              //n=1;
            //  console.log(results.multiHandedness[0].label+  " "+results.multiHandedness[0].index + " "+ results.multiHandedness[1].label + " "+results.multiHandedness[0].index+ " " + n);
            //}
            

            

            // JS->Unity:DrawHandsLandmark
            if (_unityInstance != null) {
              if (n == 0) {
                //console.log(results.multiHandedness[0].label + " " + n);
                _unityInstance.SendMessage('Plane', 'DrawHandsLandmark', String(JSON.stringify(marks)));
                n = 1;
              } else if (n == 1)  {
                //console.log(results.multiHandedness[0].label);
                _unityInstance.SendMessage('Plane1', 'DrawHandsLandmark', String(JSON.stringify(marks)));
                n = 0;
              }
              //_unityInstance.SendMessage('Plane', 'T', String(JSON.stringify(marks)));
            }//if

          });//forEach
        }//if(results.multiHandLandmarks)
      });//onResults

      camera.start();

    }//形状認識した結果の取得

    // MediaPipe Hands Process End/////////////////////////////////////////////////

    // MediaPipe Setting Callback Start////////////////////////////////////////////
    const maxNumHandsOptionElement = document.getElementById('maxNumHandsOption');
    const maxNumHandsValueElement = document.getElementById('maxNumHandsValue');
    const setMaxNumHandsValue = (val) => {
      maxNumHandsValueElement.innerText = val;

      if (hands != null) {
        hands.setOptions({
          maxNumHands: parseFloat(val)
        });
      }
    }
    const maxNumHandsValueChange = (e) => {
      setMaxNumHandsValue(e.target.value);
    }

    const minDetectionConfidenceOptionElement = document.getElementById('minDetectionConfidenceOption');
    const minDetectionConfidenceValueElement = document.getElementById('minDetectionConfidenceValue');
    const setMinDetectionConfidenceValue = (val) => {
      minDetectionConfidenceValueElement.innerText = val;

      if (hands != null) {
        hands.setOptions({
          minDetectionConfidence: parseFloat(val)
        });
      }
    }
    const maxMinDetectionConfidenceChange = (e) => {
      setMinDetectionConfidenceValue(e.target.value);
    }

    const minTrackingConfidenceOptionElement = document.getElementById('minTrackingConfidenceOption');
    const minTrackingConfidenceValueElement = document.getElementById('minTrackingConfidenceValue');
    const setMinTrackingConfidenceValue = (val) => {
      minTrackingConfidenceValueElement.innerText = val;

      if (hands != null) {
        hands.setOptions({
          minTrackingConfidence: parseFloat(val)
        });
      }
    }
    const maxMinTrackingConfidenceChange = (e) => {
      setMinTrackingConfidenceValue(e.target.value);
    }



    window.onload = () => {

      maxNumHandsOptionElement.addEventListener('input', maxNumHandsValueChange);
      setMaxNumHandsValue(maxNumHandsOptionElement.value);

      minDetectionConfidenceOptionElement.addEventListener('input', maxMinDetectionConfidenceChange);
      setMinDetectionConfidenceValue(minDetectionConfidenceOptionElement.value);

      minTrackingConfidenceOptionElement.addEventListener('input', maxMinTrackingConfidenceChange);
      setMinTrackingConfidenceValue(minTrackingConfidenceOptionElement.value);

    }

    // MediaPipe Setting Callback End/


    //tom
    let _unityInstance = null;//Tom

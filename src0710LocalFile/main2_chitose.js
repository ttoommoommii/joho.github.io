// PixiJS
const {
	Application,
	live2d: { Live2DModel }
} = PIXI;

// Kalidokit
const {
	Face,
	Vector: { lerp },
	Utils: { clamp }
} = Kalidokit;

// 1, Live2Dモデルへのパスを指定する

//const modelUrl = "./shizuku/shizuku.model3.json";//main2
//const modelUrl = "./simple/simple.model3.json";//main2
//const modelUrl = "./tororo/tororo.model3.json";//main2
//const modelUrl = "./hijiki/hijiki.model3.json";//main2
//const modelUrl = "./tsumiki/tsumiki.model3.json";//main2
//const modelUrl = "./unitychan/unitychan.model3.json";//main2
const modelUrl = "./chitose/chitose.model3.json";//main2
//const modelUrl = "./Epsilon/Epsilon.model3.json";//main2
//const modelUrl = "./haru2/haru.model3.json";//main2
//const modelUrl = "./wanko/wanko_touch.model3.json";//main2
//const modelUrl = "./izumi/izumi_illust.model3.json";//main2
//const modelUrl = "./hibiki/hibiki.model3.json";//main2

const videoElement = document.getElementById("my-video");
const guideCanvas = document.getElementById("my-guides");

let currentModel, facemesh;
let model_height;

// メインの処理開始
(async function main() {

	// 2, PixiJSを準備する
	const app = new PIXI.Application({
		view: document.getElementById("my-live2d"),
		autoStart: true,
		backgroundAlpha: 0,
		backgroundColor: 0xffffff,
		resizeTo: window
	});

	// 3, Live2Dモデルをロードする
	currentModel = await Live2DModel.from(modelUrl, { autoInteract: false });
	//currentModel.scale.set(0.2);    //set(0.4);
	model_height = currentModel.height;   //元サイズを保存
	currentModel.scale.set((window.innerHeight - 50) / model_height);
	currentModel.interactive = true;
	currentModel.anchor.set(0.5, 0);    //0.5);
	//currentModel.position.set(window.innerWidth * 0.5, window.innerHeight * 0.8);
	currentModel.position.set(window.innerWidth * 0.5, 0);


	// 4, Live2Dモデルをドラッグ可能にする
	currentModel.on("pointerdown", e => {
		currentModel.offsetX = e.data.global.x - currentModel.position.x;
		currentModel.offsetY = e.data.global.y - currentModel.position.y;
		currentModel.dragging = true;
	});
	currentModel.on("pointerup", e => {
		currentModel.dragging = false;
	});
	currentModel.on("pointermove", e => {
		if (currentModel.dragging) {
			currentModel.position.set(
				e.data.global.x - currentModel.offsetX,
				e.data.global.y - currentModel.offsetY
			);
		}
	});

	// 5, Live2Dモデルを拡大/縮小可能に(マウスホイール)
	document.querySelector("#my-live2d").addEventListener("wheel", e => {
		e.preventDefault();
		currentModel.scale.set(
			clamp(currentModel.scale.x + event.deltaY * -0.001, -0.5, 10)
		);
	});

	// 6, Live2Dモデルを配置する
	app.stage.addChild(currentModel);

	// 7, フェイスメッシュの読み込みと設定をする
	facemesh = new FaceMesh({
		locateFile: file => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
		}
	});
	facemesh.setOptions({
		maxNumFaces: 1,
		refineLandmarks: true,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5
	});
	facemesh.onResults(onResults);

	// 8, Webカメラを開始する
	startCamera();
	//カメラ映像を消去
	document.getElementById('my-video').style.visibility = 'hidden'
	document.getElementById('my-guides').style.visibility = 'hidden'
	document.getElementById('my-live2d').style.visibility = 'hidden'

})();

//window サイズが変更されたら発生するイベント
window.addEventListener('DOMContentLoaded', function () {
	window.addEventListener('resize', function () {
		//console.log("Width:" + window.innerWidth);
		//console.log("Height:" + window.innerHeight);
		currentModel.scale.set((window.innerHeight - 50) / model_height);
		currentModel.position.set(window.innerWidth * 0.5, 0);
		switch3.checked=false;
	});
});

const switch4 = document.getElementById("switch4");
switch4.addEventListener("click", function (e) {	/* zoom　switch3が押された時の*/
	if (switch4.checked) {
		currentModel.scale.set((window.innerHeight - 50) / model_height * 3);
		currentModel.position.set(window.innerWidth * 0.5, -100);
	} else {
		currentModel.scale.set((window.innerHeight - 50) / model_height);
		currentModel.position.set(window.innerWidth * 0.5, 0);
	}
});

const onResults = results => {
	let element = document.getElementById('switch');
	let element1 = document.getElementById('switch1');
	let element2 = document.getElementById('switch2');
	let element3 = document.getElementById('switch3');
	//console.log(element.checked);
	if (element.checked) {	//カメラ映像の表示
		document.getElementById('my-video').style.visibility = 'visible'
	}
	else {
		document.getElementById('my-video').style.visibility = 'hidden'
	}
	if (element1.checked) {	//メッシュの表示
		drawResults(results.multiFaceLandmarks[0]);
		document.getElementById('my-guides').style.visibility = 'visible'
	}
	else {
		document.getElementById('my-guides').style.visibility = 'hidden'
	}
	if (element2.checked) {	//
		if (element3.checked) {
			animateLive2DModel(results.multiFaceLandmarks[0]);
		}
		document.getElementById('my-live2d').style.visibility = 'visible'
	}
	else {
		document.getElementById('my-live2d').style.visibility = 'hidden'
	}

};

// フェイスメッシュの描画
const drawResults = points => {
	if (!guideCanvas || !videoElement || !points) return;
	guideCanvas.width = videoElement.videoWidth;
	guideCanvas.height = videoElement.videoHeight;
	let canvasCtx = guideCanvas.getContext("2d");
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
	drawConnectors(canvasCtx, points, FACEMESH_TESSELATION, {
		color: "#C0C0C070",
		lineWidth: 1
	});
	if (points && points.length === 478) {
		drawLandmarks(canvasCtx, [points[468], points[468 + 5]], {
			color: "#ffe603",
			lineWidth: 2
		});
	}
};

// Live2Dモデルとランドマークを連動させる
const animateLive2DModel = points => {
	if (!currentModel || !points) return;
	let riggedFace = Face.solve(points, {
		runtime: "mediapipe",
		video: videoElement
	});
	rigFace(riggedFace, 0.5);
};

const rigFace = (result, lerpAmount = 0.7) => {
	if (!currentModel || !result) return;
	const updateFn = currentModel.internalModel.motionManager.update;
	const coreModel = currentModel.internalModel.coreModel;

	currentModel.internalModel.motionManager.update = (...args) => {
		currentModel.internalModel.eyeBlink = undefined;

		coreModel.setParameterValueById(
			"PARAM_EYE_BALL_X",
			lerp(
				result.pupil.x,
				coreModel.getParameterValueById("PARAM_EYE_BALL_X"),
				lerpAmount
			)
		);
		coreModel.setParameterValueById(
			"PARAM_EYE_BALL_Y",
			lerp(
				result.pupil.y,
				coreModel.getParameterValueById("PARAM_EYE_BALL_Y"),
				lerpAmount
			)
		);

		coreModel.setParameterValueById(
			"PARAM_ANGLE_X",
			lerp(
				result.head.degrees.y,
				coreModel.getParameterValueById("PARAM_ANGLE_X"),
				lerpAmount
			)
		);
		coreModel.setParameterValueById(
			"PARAM_ANGLE_Y",
			lerp(
				result.head.degrees.x,
				coreModel.getParameterValueById("PARAM_ANGLE_Y"),
				lerpAmount
			)
		);
		coreModel.setParameterValueById(
			"PARAM_ANGLE_Y",
			lerp(
				result.head.degrees.z,
				coreModel.getParameterValueById("PARAM_ANGLE_Z"),
				lerpAmount
			)
		);

		const dampener = 0.3;
		coreModel.setParameterValueById(
			"PARAM_BODY_X",
			lerp(
				result.head.degrees.y * dampener,
				coreModel.getParameterValueById("PARAM_BODY_X"),
				lerpAmount
			)
		);
		coreModel.setParameterValueById(
			"PARAM_BODY_Y",
			lerp(
				result.head.degrees.x * dampener,
				coreModel.getParameterValueById("PARAM_BODY_Y"),
				lerpAmount
			)
		);
		coreModel.setParameterValueById(
			"PARAM_BODY_Z",
			lerp(
				result.head.degrees.z * dampener,
				coreModel.getParameterValueById("PARAM_BODY_Z"),
				lerpAmount
			)
		);

		let stabilizedEyes = Kalidokit.Face.stabilizeBlink(
			{
				l: lerp(
					result.eye.l,
					coreModel.getParameterValueById("PARAM_EYE_L_OPEN"),
					0.2 //0.7
				),
				r: lerp(
					result.eye.r,
					coreModel.getParameterValueById("PARAM_EYE_R_OPEN"),
					0.2 //0.7
				)
			},
			result.head.y
		);

		coreModel.setParameterValueById("PARAM_EYE_L_OPEN", stabilizedEyes.l);
		coreModel.setParameterValueById("PARAM_EYE_R_OPEN", stabilizedEyes.r);
		coreModel.setParameterValueById(
			"PARAM_MOUTH_OPEN_Y",
			lerp(result.mouth.y, coreModel.getParameterValueById("PARAM_MOUTH_OPEN_Y"), 0)   //0.3
		);
		coreModel.setParameterValueById(
			"PARAM_MOUTH_FORM",
			5.3 + lerp(result.mouth.x, coreModel.getParameterValueById("PARAM_MOUTH_FORM"), 0)
		);
	};
};

// Webカメラ
const startCamera = () => {
	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await facemesh.send({ image: videoElement });
		},
		//width: 640, height: 480
		width: 320, height: 240
	});
	camera.start();
};
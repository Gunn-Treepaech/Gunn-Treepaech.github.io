// script.js
let result = [];
let bestPredictionIndex = 0;
let bestClassPrediction;
let videoElement;
const URL = "https://teachablemachine.withgoogle.com/models/V_2rnQ1r_/";
let model, webcam, labelContainer, maxPredictions;

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

async function setupModelAndWebcam() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

if (isMobileDevice()) {
  window.onload = async function () {
    openMobileCamera();
  };
} else {
  window.onload = async function () {
    await setupModelAndWebcam();
  };
}

async function openMobileCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoElement = document.createElement("video");
    videoElement.srcObject = stream;
    videoElement.play();
    document.getElementById("webcam-container").appendChild(videoElement);
  } catch (error) {
    console.error("Error accessing mobile camera:", error);
  }
}

async function loop() {
  webcam.update();
  window.requestAnimationFrame(loop);
}

// สร้างฟังก์ชันเพื่อลบผลลัพธ์เก่าออก
function clearResults() {
  result = [];
  for (let i = 0; i < 4; i++) {
    labelContainer.childNodes[i].innerHTML = ""; // ลบข้อความที่แสดงผลออก
  }
}

async function captureImage() {
  let prediction;
  if (isMobileDevice()) {
    const canvasElement = document.createElement("canvas");
    canvasElement.width = 200;
    canvasElement.height = 200;
    canvasElement
      .getContext("2d")
      .drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    prediction = await model.predict(canvasElement);
    alert(prediction);
  } else {
    prediction = await model.predict(webcam.canvas);
  }

  clearResults();
  // หาค่าความน่าจะเป็นสูงสุดและเก็บดัชนีของมัน
  let maxProbability = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > maxProbability) {
      maxProbability = prediction[i].probability;
      bestPredictionIndex = i;
    }
  }

  // แสดงผลลัพธ์ที่มีความน่าจะเป็นสูงสุดเท่านั้น
  bestClassPrediction =
    prediction[bestPredictionIndex].className +
    ": " +
    prediction[bestPredictionIndex].probability.toFixed(2);
  labelContainer.childNodes[bestPredictionIndex].innerHTML =
    bestClassPrediction;

  // เก็บผลลัพธ์ทั้งหมดไว้ในตัวแปร global result
  result = prediction;
  console.log(bestClassPrediction);
  console.log(result);

  // เช็คเงื่อนไขและแสดง GIF ตามเงื่อนไขที่คุณต้องการ
  if (bestClassPrediction.includes("general waste")) {
    document.getElementById("gif-display").src =
      "/AI/images/cherry-blossoms-6383_256.gif";
  } else if (bestClassPrediction.includes("Hazardous waste")) {
    document.getElementById("gif-display").src =
      "/AI/images/halloween-7291_256.gif";
  } else if (bestClassPrediction.includes("recycled waste")) {
    document.getElementById("gif-display").src = "/AI/images/sun-6751_256.gif";
  } else if (bestClassPrediction.includes("solid waste")) {
    document.getElementById("gif-display").src = "/AI/images/rose-6870_256.gif";
  }
}

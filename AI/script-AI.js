// script.js
let result = [];
let bestPredictionIndex = 0;
let bestClassPrediction;
let isUploading = false;
const URL = "https://teachablemachine.withgoogle.com/models/V_2rnQ1r_/";
let model, webcam, labelContainer, maxPredictions;

window.onload = async function () {
  await setupModelAndWebcam();

  // เพิ่ม Event Listener สำหรับปุ่มอัพโหลดภาพ
  const uploadButton = document.getElementById("upload-button");
  uploadButton.addEventListener("change", handleUpload);

  // เพิ่ม Event Listener สำหรับปุ่มกลับไปใช้กล้องเว็บแคม
  const backToWebcamButton = document.getElementById("back-to-webcam-button");
  backToWebcamButton.addEventListener("click", switchToWebcam);
};

async function setupModelAndWebcam() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
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
  document.getElementById("gif-display").src = "";
}

async function handleUpload(event) {
  const file = event.target.files[0];

  if (file) {
    isUploading = true;
    // สร้าง FileReader เพื่ออ่านข้อมูลจากไฟล์ภาพ
    const reader = new FileReader();

    // เมื่ออ่านเสร็จสิ้น
    reader.onload = async function () {
      // แสดงภาพที่อัพโหลด
      const imageElement = document.createElement("img");
      imageElement.src = reader.result;
      document.getElementById("webcam-container").innerHTML = ""; // เคลียร์ webcam container
      document.getElementById("webcam-container").appendChild(imageElement);

      // เรียกใช้งานฟังก์ชัน captureImage เพื่อทำการ prediction บนภาพที่อัพโหลด
      await captureImage();
    };

    // อ่านไฟล์ภาพ
    reader.readAsDataURL(file);
  }
}

async function switchToWebcam() {
  clearResults();
  // ตรวจสอบสถานะการอัพโหลด
  if (isUploading) {
    // ถ้ากำลังอัพโหลด ให้ล้างการอัพโหลด
    document.getElementById("upload-button").value = ""; // ล้างค่า input file
    isUploading = false;
  }
  
  // ปิดการแสดงภาพที่อัพโหลด
  document.getElementById("webcam-container").innerHTML = "";
  
  // เรียกใช้งานกล้องเว็บแคมอีกครั้ง
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  document.getElementById("webcam-container").appendChild(webcam.canvas);
}


async function captureImage() {
  let prediction = await model.predict(webcam.canvas);
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

// script.js
let result = [];
let bestPredictionIndex = 0;
let bestClassPrediction;
const URL = "https://teachablemachine.withgoogle.com/models/4Uz5-dAGK/";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";
let model, webcam, labelContainer, maxPredictions;

window.onload = async function () {
  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  const backToWebcamButton = document.getElementById("Clear-Results");
  backToWebcamButton.addEventListener("click", clearResults);
};

// เมื่อคลิกที่ปุ่ม "Clear Results"
document.getElementById("Clear-Results").addEventListener("click", function () {
  // เลื่อนไปที่ส่วนบนสุดของหน้าเว็บ
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// เมื่อคลิกที่ปุ่มอัปโหลด
document.getElementById("uploadButton").addEventListener("click", function () {
  // เมื่อคลิกที่อินพุตไฟล์
  document.getElementById("imageUpload").click();
});

// เมื่อมีการเลือกไฟล์
document.getElementById("imageUpload").addEventListener("change", function () {
  const fileInput = document.getElementById("imageUpload");
  const uploadButton = document.getElementById("uploadButton");
});

// เมื่อคลิกที่ปุ่ม "Predict with Webcam"
document
  .getElementById("capture-button")
  .addEventListener("click", function () {
    // เลื่อนไปยังส่วน "Result"
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  });

// เมื่อคลิกที่ปุ่ม "Upload Image"
document.getElementById("uploadButton").addEventListener("click", function () {
  // เลื่อนไปยังส่วน "Result"
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
});

async function setupModel() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

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
  document.getElementById("gif-display").src = "/AI/images/load.gif";
}

async function captureImage() {
  await predictImages(webcam.canvas);
}

async function predictImages(image) {
  // ลบผลลัพธ์เดิมที่แสดงใน labelContainer
  if (labelContainer) {
    clearResults();
  }
  //document.getElementById("gif-display").src = "/AI/images/load.gif";
  await setupModel();
  let prediction = await model.predict(image, false);

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
  const gifDisplay = document.getElementById("gif-display");
  if (bestClassPrediction.includes("general_waste")) {
    gifDisplay.src = "/AI/images/greenBin.gif";
    gifDisplay.style.display = "block"; // แสดงกรอบ
  } else if (bestClassPrediction.includes("Hazardous_waste")) {
    gifDisplay.src = "/AI/images/redBin.gif";
    gifDisplay.style.display = "block"; // แสดงกรอบ
  } else if (bestClassPrediction.includes("recycled_waste")) {
    gifDisplay.src = "/AI/images/yellowBin.gif";
    gifDisplay.style.display = "block"; // แสดงกรอบ
  } else if (bestClassPrediction.includes("solid_waste")) {
    gifDisplay.src = "/AI/images/blueBin.gif";
    gifDisplay.style.display = "block"; // แสดงกรอบ
  } else {
    gifDisplay.style.display = "none"; // ซ่อนกรอบถ้าไม่มีภาพ GIF ที่ตรงเงื่อนไข
  }
}

function readURL(input) {
  if (input.files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      $("#imagePreview").attr("src", e.target.result);
      // $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
      $("#imagePreview").hide();
      $("#imagePreview").fadeIn(650);
    };
    reader.readAsDataURL(input.files[0]);
    let image = document.getElementById("imagePreview");
    predictImages(image);
  }
}
$("#imageUpload").change(function () {
  readURL(this);
});

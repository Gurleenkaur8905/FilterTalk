"use client";

import vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

let worker = null;
let animationFrameId = null;
const preloadImage = (src) => {
  if (typeof window !== "undefined") {
    const img = new Image();
    img.src = src;
    return img;
  }
  return null;
};


const sunglasses = preloadImage("/Images/sunglasses.png");
const eyeImage = preloadImage("/Images/eye1.png");
const beardImage = preloadImage("/Images/beard.png");
const HatImage = preloadImage("/Images/hat.png");
const neckImage = preloadImage("/Images/neck.png");


// Helper to apply filter based on landmarks
const applyFilter = (ctx, landmarks, filter) => {
  if (!landmarks || landmarks.length === 0) {
    console.warn("No face landmarks detected. Skipping filter application.");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  

    // **Clear the canvas if the filter is "none"**
    if (filter === "None") {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    
      return;
    }
    
  
  // console.log(`Applying filter: ${filter} with ${landmarks.length} landmarks`);
  const [leftEye, rightEye, nose] = [landmarks[33], landmarks[263], landmarks[1]];
  if (!leftEye || !rightEye || !nose) {
    console.warn("Missing key landmarks for applying filter.");
    return;
  }

  try {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear before applying new filter
    switch (filter) {
      case "Sunglasses":
        applySunglassesFilter(ctx, leftEye, rightEye);
        break;
      case "Eyes":
        applyEyeFilter(ctx, leftEye, rightEye);
        break;
      case "Beard":
        applyBeardFilter(ctx, nose);
        break;
      case "FullFace":
        applyFullFaceFilter(ctx, landmarks);
        break;
      case "Hat":
        applyHatFilter(ctx, landmarks);
        break;
      case "Scarf":
        applyNeckFilter(ctx, nose);
        break;
      default:
        console.log(`Filter '${filter}' is not recognized.`);
        break;
    }
  } catch (error) {
    console.error("Error applying filter:", error);
  }
};

// Apply sunglasses filter
const applySunglassesFilter = (ctx, leftEye, rightEye) => {
  const width = Math.abs(rightEye.x - leftEye.x) * ctx.canvas.width * 2;
  const height = width * 0.5;

  // Log the calculated position to place the sunglasses
  const sunglassesX = (leftEye.x - 0.57 * (rightEye.x - leftEye.x)) * ctx.canvas.width;
  const sunglassesY = (leftEye.y - 0.25) * ctx.canvas.height;
  // console.log(`Sunglasses Position: x = ${sunglassesX}, y = ${sunglassesY}`);

  ctx.drawImage(sunglasses, sunglassesX, sunglassesY, width, height
  );
};

// Apply eye filter
const applyEyeFilter = (ctx, leftEye, rightEye) => {
  const width = Math.abs(rightEye.x - leftEye.x) * ctx.canvas.width * 1.5;
  const height = width * 0.5;

  // Log the calculated position to place the eye filter
  const eyeFilterX = (leftEye.x - 0.3 * (rightEye.x - leftEye.x)) * ctx.canvas.width;
  const eyeFilterY = (leftEye.y - 0.19) * ctx.canvas.height;
  // console.log(`Eye Filter Position: x = ${eyeFilterX}, y = ${eyeFilterY}`);

  ctx.drawImage(eyeImage, eyeFilterX, eyeFilterY, width, height);
};

const applyBeardFilter = (ctx, nose) => {
  const width = ctx.canvas.width * 0.4;
  const height = width * 0.6;

  const beardX = (nose.x - 0.2) * ctx.canvas.width;
  const beardY = (nose.y + (-0.01)) * ctx.canvas.height;

  if (beardImage) {
    ctx.drawImage(beardImage, beardX, beardY, width, height);
  }
};

const applyHatFilter = (ctx, landmarks) => {
  const topOfHead = landmarks[10];
  const chin = landmarks[152];

  // Calculate dimensions and position
  const headHeight = Math.abs(chin.y - topOfHead.y) * ctx.canvas.height;
  const width = headHeight * 1.5; // Maintain aspect ratio (adjust as needed)
  const height = headHeight;

  const headX = (topOfHead.x - 0.1) * ctx.canvas.width; // Adjust for alignment
  const headY = (topOfHead.y - 0.38) * ctx.canvas.height;

  // Check if image exists and draw it
  if (HatImage) {

    ctx.drawImage(HatImage, headX, headY, width, height);
  } else {
    console.warn("Hat image could not be loaded.");
  }
};


const applyNeckFilter = (ctx, nose) => {
  const width = ctx.canvas.width * 0.3;
  const height = width * 0.5;

  const neckX = (nose.x - 0.15) * ctx.canvas.width;
  const neckY = (nose.y + 0.2) * ctx.canvas.height;

  if (neckImage) {
    ctx.drawImage(neckImage, neckX, neckY, width, height);
  }
};

// ✅ Load Face Detection Worker (No faceLandmarker in Main Thread)
const loadFaceDetectionModel = async () => {
  if (worker) return worker;

  worker = new Worker(new URL("./faceWorker.js", import.meta.url));

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      if (event.data.type === "MODEL_LOADED") {
        console.log("✅ Face detection model loaded via Web Worker!");
        resolve(worker);
      } else if (event.data.type === "ERROR") {
        console.error("Worker Error:", event.data.error);
        reject(event.data.error);
      }
    };

    worker.postMessage({ type: "LOAD_MODEL" });
  });
};


// Start webcam and detect faces
export const startWebcamAndDetect = async (videoElement, canvasElement, activeFilter) => {

  if (!videoElement || !canvasElement) {
    console.error("Missing required elements or model.");
    return;
  }
 
  let canvasCtx;
  console.log("Starting video stream and prediction... where activeFilter is ", activeFilter);

  canvasCtx = canvasElement.getContext("2d");
  const constraints = { video: true, audio: true };

  // ✅ Load worker
  worker = await loadFaceDetectionModel();
  console.log("worker in facefilter helper file " , worker);

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
  } catch (error) {
    console.error("Error accessing webcam:", error);
  }

  // ✅ Handle worker messages (Receiving landmarks)
  worker.onmessage = (event) => {
    if (event.data.type === "DETECTED") {
      const { landmarks } = event.data;
      if (landmarks && landmarks.length > 0) {
        canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
        landmarks.forEach((faceLandmarks) => applyFilter(canvasCtx, faceLandmarks, activeFilter));
      }
    } else if (event.data.type === "ERROR") {
      console.error("Error from worker:", event.data.error);
    }
  };
  if (activeFilter === "None") {
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  
    return;
  }

  videoElement.onloadeddata = () => {
    console.log(`Active filter: ${activeFilter}`);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId); // Stop any previous detection loops
    }
       sendFramesToWorker(videoElement);
  };


 // Create a new canvas for combining video and overlay
 const newCanvas = document.createElement("canvas");
 const newCanvasCtx = newCanvas.getContext("2d");

 // Set dimensions of the new canvas to match the original canvas
 newCanvas.width = canvasElement.width;
 newCanvas.height = canvasElement.height;

 // Render function to combine video and overlay
 function render() {
   // Draw the original video on the new canvas
   newCanvasCtx.drawImage(videoElement, 0, 0, newCanvas.width, newCanvas.height);
   // Draw the overlay canvas (filters, drawings, etc.)
   newCanvasCtx.drawImage(canvasElement, 0, 0, newCanvas.width, newCanvas.height);
   requestAnimationFrame(render);
 }

 // Start the rendering loop
 render();

 // Capture the combined video stream from the canvas
 const combinedStream = newCanvas.captureStream();

 // Handle audio track
 const originalStream = videoElement.srcObject;
 const audioTrack = originalStream?.getAudioTracks()[0];

 let finalStream;
 if (audioTrack && !combinedStream.getAudioTracks().length) {
   // Add audio track to the combined stream
   finalStream = new MediaStream([...combinedStream.getVideoTracks(), audioTrack]);
 } else {
   finalStream = combinedStream;
 }

 return finalStream;

};

let lastFrameTime = 0;
const frameRate = 30; // Target frame rate (in FPS)

const sendFramesToWorker = (video, canvas) => {
  const sendFrame = async () => {
    if (!video || !worker) return;
    const now = performance.now();

    // ✅ Check if enough time has passed to send the next frame based on the frameRate
    if (now - lastFrameTime >= 1000 / frameRate) {
      lastFrameTime = now;

      // Wait for creating an ImageBitmap from the video frame
      try {
        // Create ImageBitmap from the video frame
        const imageBitmap = await createImageBitmap(video);

        // Send ImageBitmap to the worker along with the timestamp
        worker.postMessage({
          type: "DETECT",
          imageBitmap: imageBitmap,
          timestamp: now,
        });

      } catch (error) {
        console.error("Error creating ImageBitmap:", error);
      }
    }

    // Continue the frame capture loop with the optimized frame rate
    animationFrameId = requestAnimationFrame(sendFrame);
  };

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  sendFrame();
};

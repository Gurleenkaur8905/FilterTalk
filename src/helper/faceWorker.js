import vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

let faceLandmarker = null;

// Load Face Detection Model
const DetectionModel = async () => {
  if (faceLandmarker) return;
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      runningMode: "VIDEO", // Ensure we are using VIDEO mode
      numFaces: 1,
    });

    postMessage({ type: "MODEL_LOADED" });
  } catch (error) {
    postMessage({ type: "ERROR", error: error.message });
  }
};

// Handle Messages from Main Thread
onmessage = async (event) => {
  if (event.data.type === "LOAD_MODEL") {
    await DetectionModel();
  } else if (event.data.type === "DETECT" && faceLandmarker) {
    const { imageBitmap, timestamp } = event.data;

    try {
      // Create an OffscreenCanvas from the ImageBitmap
      const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const offscreenCtx = offscreenCanvas.getContext("2d");

      // Draw the ImageBitmap onto the OffscreenCanvas
      offscreenCtx.drawImage(imageBitmap, 0, 0);

      // Use detectForVideo method to process the frame
      const results = await faceLandmarker.detectForVideo(offscreenCanvas, timestamp);

      postMessage({ type: "DETECTED", landmarks: results.faceLandmarks });
    } catch (error) {
      postMessage({ type: "ERROR", error: error.message });
    }
  }
};

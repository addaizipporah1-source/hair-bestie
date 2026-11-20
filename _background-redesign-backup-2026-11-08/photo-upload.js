
// ========================================
// 1. CONNECT JAVASCRIPT TO THE HTML
// ========================================

const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const photoMessage = document.getElementById("photoMessage");
const photoAnalysis = document.getElementById("photoAnalysis");
const analysisResults = document.getElementById("analysisResults");
const photoChecks = document.getElementById("photoChecks");

const startCamera = document.getElementById("startCamera");
const cameraArea = document.getElementById("cameraArea");
const cameraPreview = document.getElementById("cameraPreview");
const captureSelfie = document.getElementById("captureSelfie");
const cancelCamera = document.getElementById("cancelCamera");
const cameraCanvas = document.getElementById("cameraCanvas");

const retakePhoto = document.getElementById("retakePhoto");
const confirmPhoto = document.getElementById("confirmPhoto");
const continueToHair = document.getElementById("continueToHair");

const checks = document.querySelectorAll(".photoCheck");


// ========================================
// 2. STORE APP DATA
// ========================================

let selectedPhotoFile = null;
let currentPhotoURL = null;
let cameraStream = null;
let faceDetector = null;
let analysisPassed = false;


// ========================================
// 3. LOAD THE FACE DETECTOR
// ========================================

async function loadFaceDetector() {

    if (faceDetector) {
        return faceDetector;
    }

    photoMessage.textContent =
        "Preparing our photo checker... ✨";

    const vision = await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs"
    );

    const fileset =
        await vision.FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

    faceDetector =
        await vision.FaceDetector.createFromOptions(
            fileset,
            {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
                },
                runningMode: "IMAGE",
                minDetectionConfidence: 0.6
            }
        );

    return faceDetector;
}


// ========================================
// 4. RESET THE PHOTO PROCESS
// ========================================

function resetChecks() {

    analysisPassed = false;
    selectedPhotoFile = null;

    checks.forEach(function (check) {
        check.checked = false;
    });

    confirmPhoto.disabled = true;
    confirmPhoto.textContent = "My Photo Is Ready 💛";

    continueToHair.hidden = true;
    retakePhoto.hidden = true;
    photoChecks.hidden = true;
    photoAnalysis.hidden = true;

    photoPreview.style.display = "none";
    photoPreview.removeAttribute("src");

    if (currentPhotoURL) {
        URL.revokeObjectURL(currentPhotoURL);
        currentPhotoURL = null;
    }
}


// ========================================
// 5. STOP THE CAMERA
// ========================================

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    cameraPreview.srcObject = null;
    cameraArea.hidden = true;
}


// ========================================
// 6. CHECK PHOTO BRIGHTNESS
// ========================================

function checkBrightness(image) {

    const canvas = document.createElement("canvas");

    canvas.width = 100;
    canvas.height = 100;

    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0, 100, 100);

    const pixels = context.getImageData(
        0, 0, 100, 100
    ).data;

    let totalBrightness = 0;

    for (let i = 0; i < pixels.length; i += 4) {

        const brightness =
            (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

        totalBrightness += brightness;
    }

    const averageBrightness =
        totalBrightness / (pixels.length / 4);

    return averageBrightness >= 35;
}


// ========================================
// 7. DISPLAY ANALYSIS RESULTS
// ========================================

function showResult(message, passed) {

    const item = document.createElement("li");

    item.textContent =
        (passed ? "✓ " : "✕ ") + message;

    analysisResults.appendChild(item);
}


// ========================================
// 8. AUTOMATIC PHOTO ANALYSIS
// ========================================

async function analysePhoto(image) {

    photoAnalysis.hidden = false;
    analysisResults.innerHTML = "";

    photoMessage.textContent =
        "Checking your photo... 💛";

    retakePhoto.hidden = false;

    analysisPassed = false;

    try {

        const detector = await loadFaceDetector();

        // Prepare a correctly sized image for detection.
        const imageWidth =
            image.naturalWidth || image.videoWidth || image.width;

        const imageHeight =
            image.naturalHeight || image.videoHeight || image.height;

        if (!imageWidth || !imageHeight) {
            throw new Error("The photo has invalid dimensions.");
        }

        const scale = Math.min(
            1,
            1280 / Math.max(imageWidth, imageHeight)
        );

        const detectionCanvas = document.createElement("canvas");

        detectionCanvas.width = Math.round(imageWidth * scale);
        detectionCanvas.height = Math.round(imageHeight * scale);

        const context = detectionCanvas.getContext("2d");

        context.drawImage(
            image,
            0,
            0,
            detectionCanvas.width,
            detectionCanvas.height
        );

        // Detect faces from the prepared canvas.
        console.log("Starting face detection...");

const result = detector.detect(detectionCanvas);

console.log("FACE DETECTION RESULT:", result);

        const faces = result.detections || [];

        let passed = true;

        if (faces.length === 1) {

            showResult("One face detected.", true);

            const box = faces[0].boundingBox;
// Check whether the face is large enough for hairstyle try-on.
const faceWidthRatio = box.width / detectionCanvas.width;
const faceHeightRatio = box.height / detectionCanvas.height;

if (faceWidthRatio < 0.18 || faceHeightRatio < 0.18) {

    showResult(
        "Your face is too small in this photo. Please move closer to the camera.",
        false
    );

    passed = false;

} else {

    showResult(
        "Your face is clearly visible and large enough.",
        true
    );
}
            if (box) {

                const centerX =
                    (box.originX + box.width / 2) /
                    detectionCanvas.width;

                const centerY =
                    (box.originY + box.height / 2) /
                    detectionCanvas.height;

                if (
                    centerX >= 0.20 &&
                    centerX <= 0.80 &&
                    centerY >= 0.15 &&
                    centerY <= 0.85
                ) {
                    showResult("Your face is reasonably centred.", true);
                } else {
                    showResult(
                        "Please position your face closer to the centre.",
                        false
                    );

                    passed = false;
                }

            } else {

                showResult(
                    "We could not check your face position.",
                    false
                );

                passed = false;
            }

        } else if (faces.length === 0) {

            showResult(
                "We could not detect a face. Try a clearer, front-facing photo.",
                false
            );

            passed = false;

        } else {

            showResult(
                "More than one face was detected. Please use a photo with only you.",
                false
            );

            passed = false;
        }

        if (checkBrightness(image)) {

            showResult("The photo has usable lighting.", true);

        } else {

            showResult(
                "The photo appears too dark. Try taking it in brighter lighting.",
                false
            );

            passed = false;
        }

        if (passed) {

            analysisPassed = true;

            photoChecks.hidden = false;

            photoMessage.textContent =
                "Your photo looks ready for the next step! ✨";

        } else {

            analysisPassed = false;

            photoChecks.hidden = true;

            photoMessage.textContent =
                "Let's improve your photo before continuing. 💛";
        }

    } catch (error) {

        console.error("Photo analysis error:", error);

        analysisPassed = false;
        photoChecks.hidden = true;

        photoMessage.textContent =
            "We couldn't complete the automatic photo check. Check your internet connection and try again.";

        showResult(
            "Automatic checking could not be completed.",
            false
        );
    }
}


// ========================================
// 9. DISPLAY A SELECTED PHOTO
// ========================================

function displayPhoto(file) {
console.log("DISPLAY PHOTO FUNCTION STARTED");
console.log("FILE RECEIVED:", file);
    if (!file) return;

    resetChecks();

    stopCamera();

    if (!file.type.startsWith("image/")) {

        photoMessage.textContent =
            "Please choose an image file.";

        return;
    }

    if (file.size > 10 * 1024 * 1024) {

        photoMessage.textContent =
            "This photo is too large. Please choose one under 10 MB.";

        return;
    }

    const temporaryURL = URL.createObjectURL(file);

    photoMessage.textContent =
        "Preparing your photo... ✨";

    photoPreview.onload = async function () {
console.log("PHOTO PREVIEW LOADED");
console.log("IMAGE WIDTH:", photoPreview.naturalWidth);
console.log("IMAGE HEIGHT:", photoPreview.naturalHeight);
        if (
            photoPreview.naturalWidth < 400 ||
            photoPreview.naturalHeight < 400
        ) {

            URL.revokeObjectURL(temporaryURL);

            photoPreview.style.display = "none";

            photoMessage.textContent =
                "This photo is too small. Please choose a higher-quality image.";

            return;
        }

        selectedPhotoFile = file;
        currentPhotoURL = temporaryURL;

        photoPreview.style.display = "block";

        await analysePhoto(photoPreview);
    };

    photoPreview.onerror = function () {

        URL.revokeObjectURL(temporaryURL);

        photoMessage.textContent =
            "We couldn't open this photo. Please choose another one.";
    };

    photoPreview.src = temporaryURL;
}


// 10. HANDLE PHOTO UPLOAD

photoInput.addEventListener("change", function () {

    console.log("UPLOAD EVENT FIRED");

    const file = photoInput.files[0];

    console.log("SELECTED FILE:", file);

    if (!file) {
        console.log("NO FILE SELECTED");
        return;
    }

    photoMessage.textContent = "Photo received! Preparing... ✨";

    displayPhoto(file);

});




// ========================================
// 11. OPEN THE CAMERA
// ========================================

startCamera.addEventListener("click", async function () {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        photoMessage.textContent =
            "Camera access is unavailable. Please use Upload a Photo instead.";

        return;
    }

    try {

        stopCamera();

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });

        cameraPreview.srcObject = cameraStream;

        cameraArea.hidden = false;

        await cameraPreview.play();

        photoMessage.textContent =
            "Position your face in the camera and take your selfie. ✨";

    } catch (error) {

        console.error("Camera error:", error);

        photoMessage.textContent =
            "We couldn't open your camera. Check your browser camera permission or upload a photo instead.";
    }
});


// ========================================
// 12. CAPTURE A SELFIE
// ========================================

captureSelfie.addEventListener("click", function () {

    if (
        !cameraStream ||
        !cameraPreview.videoWidth ||
        !cameraPreview.videoHeight
    ) {

        photoMessage.textContent =
            "Please wait for your camera image to appear.";

        return;
    }

    cameraCanvas.width = cameraPreview.videoWidth;
    cameraCanvas.height = cameraPreview.videoHeight;

    const context = cameraCanvas.getContext("2d");

    context.translate(cameraCanvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
        cameraPreview,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
    );

    cameraCanvas.toBlob(function (blob) {

        if (!blob) {

            photoMessage.textContent =
                "We couldn't capture your selfie. Please try again.";

            return;
        }

        const selfieFile = new File(
            [blob],
            "my-selfie.jpg",
            { type: "image/jpeg" }
        );

        stopCamera();

        displayPhoto(selfieFile);

    }, "image/jpeg", 0.90);
});


// ========================================
// 13. CANCEL AND RETAKE
// ========================================

cancelCamera.addEventListener("click", function () {

    stopCamera();

    photoMessage.textContent =
        "Camera closed. You can upload a photo or open the camera again.";
});

retakePhoto.addEventListener("click", function () {

    resetChecks();

    photoMessage.textContent =
        "Choose another photo or take a new selfie. ✨";

});


// ========================================
// 14. CHECK USER GUIDELINES
// ========================================

function updateConfirmButton() {

    const allChecked =
        Array.from(checks).every(function (check) {
            return check.checked;
        });

    confirmPhoto.disabled =
        !(analysisPassed && allChecked);
}

checks.forEach(function (check) {

    check.addEventListener("change", updateConfirmButton);

});


// ========================================
// 15. CONFIRM THE PHOTO
// ========================================

confirmPhoto.addEventListener("click", function () {

    const allChecked =
        Array.from(checks).every(function (check) {
            return check.checked;
        });

    if (!selectedPhotoFile || !analysisPassed || !allChecked) {
        return;
    }

    photoMessage.textContent =
        "Wonderful! Your photo has been confirmed. 💛";

    confirmPhoto.textContent =
        "Photo Confirmed ✓";

    continueToHair.hidden = false;
});


// ========================================
// 16. COMPRESS AND SAVE THE PHOTO
// ========================================

async function savePhotoForGallery(file) {

    const imageBitmap = await createImageBitmap(file);

    const maxDimension = 1400;

    const scale = Math.min(
        1,
        maxDimension /
        Math.max(imageBitmap.width, imageBitmap.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.round(imageBitmap.width * scale);
    canvas.height = Math.round(imageBitmap.height * scale);

    const context = canvas.getContext("2d");

    context.drawImage(
        imageBitmap,
        0,
        0,
        canvas.width,
        canvas.height
    );

    imageBitmap.close();

    const compressedPhoto =
        canvas.toDataURL("image/jpeg", 0.85);

    sessionStorage.setItem(
        "hairstyleUserPhoto",
        compressedPhoto
    );
}


// ========================================
// 17. CONTINUE TO HAIRSTYLES
// ========================================

continueToHair.addEventListener("click", async function () {

    if (!selectedPhotoFile || !analysisPassed) {

        photoMessage.textContent =
            "Please complete the photo checks first.";

        return;
    }

    try {

        continueToHair.disabled = true;

        continueToHair.textContent =
            "Preparing your photo... ✨";

        await savePhotoForGallery(selectedPhotoFile);

        window.location.href = "hairstyles.html";

    } catch (error) {

        console.error("Photo saving failed:", error);

        photoMessage.textContent =
            "We couldn't prepare your photo. Please try again.";

        continueToHair.disabled = false;

        continueToHair.textContent =
            "Continue to Hairstyles ✨";
    }
});


// ========================================
// 18. CLEAN UP WHEN LEAVING THE PAGE
// ========================================

window.addEventListener("beforeunload", function () {

    stopCamera();

    if (currentPhotoURL) {
        URL.revokeObjectURL(currentPhotoURL);
    }

});

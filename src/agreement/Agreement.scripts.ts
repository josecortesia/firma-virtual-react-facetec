import { Config } from "../../Config";
import { compressVideo, uploadBiometricValidation } from "../services";

let mediaRecorder: MediaRecorder;
const recordedChunks: string[] = [];

const recordingTimeout: number = 60000;
const startButton: HTMLButtonElement = document.getElementById(
  "fv-start-recording",
) as HTMLButtonElement;
const stopButton: HTMLButtonElement = document.getElementById(
  "fv-stop-recording",
) as HTMLButtonElement;
const deleteButton: HTMLButtonElement = document.getElementById(
  "fv-delete-recording",
) as HTMLButtonElement;
const confirmButton: HTMLButtonElement = document.getElementById(
  "fv-confirm-recording",
) as HTMLButtonElement;
const recordingTimeLeft: HTMLHeadingElement = document.getElementById(
  "fv-recording-timer",
) as HTMLHeadingElement;
const constraints = {
  video: {
    width: { ideal: 640 },
  },
  audio: true,
};
const modalError: HTMLElement = document.getElementById(
  "fv-modal-error",
) as HTMLDivElement;
const modalErrorButton: HTMLElement = document.getElementById(
  "fv-modal-error-button",
) as HTMLButtonElement;
const videoElement: HTMLVideoElement = document.getElementById(
  "fv-video-player",
) as HTMLVideoElement;

let stream;
let interval;
let videoStatement;

if (deleteButton && !recordedChunks.length) deleteButton.disabled = true;
if (stopButton) stopButton.disabled = true;
if (confirmButton) confirmButton.disabled = true;

const blobToBase64 = blob => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

modalErrorButton &&
  modalErrorButton.addEventListener("click", () => {
    if (modalError) {
      modalError.style.visibility = "hidden";
    }
  });

const startVideo = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.play();
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    videoElement && (await startVideo());
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
});

startButton &&
  startButton.addEventListener("click", async () => {
    recordedChunks.length = 0;
    if (recordingTimeLeft) {
      recordingTimeLeft.textContent = (recordingTimeout / 1000).toString();
    }
    startButton.disabled = true;
    stopButton.disabled = false;

    interval = setInterval(() => {
      const currentTime = parseInt(recordingTimeLeft.textContent as string);
      if (currentTime > 0) {
        recordingTimeLeft.textContent = (currentTime - 1).toString();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.muted = true;
      videoElement.srcObject = stream;
      videoElement.play();
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      mediaRecorder.start(100);

      setTimeout(() => {
        clearInterval(interval);
        mediaRecorder &&
          mediaRecorder.state !== "inactive" &&
          mediaRecorder.stop();
      }, recordingTimeout);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const toBase64: string = (await blobToBase64(blob)) as string;
        const final = toBase64.split("data:video/webm;base64,")[1];

        videoStatement = final;
        confirmButton.disabled = false;

        const url = URL.createObjectURL(blob);
        videoElement.srcObject = null;
        videoElement.src = url;
        videoElement.muted = false;
        stopButton.disabled = true;
      };
    } catch (error) {
      clearInterval(interval);
      console.error(error);
    }
  });

stopButton &&
  stopButton.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      clearInterval(interval);
      mediaRecorder.stop();
      stopButton.disabled = true;

      if (recordedChunks.length > 0) {
        deleteButton.disabled = false;
      } else {
        deleteButton.disabled = true;
      }
    }
  });

deleteButton &&
  deleteButton.addEventListener("click", async () => {
    recordedChunks.length = 0;
    videoElement.src = "";
    startButton.disabled = false;
    stopButton.disabled = true;
    deleteButton.disabled = true;
    recordingTimeLeft.textContent = (recordingTimeout / 1000).toString();
    stream && stream.getTracks().forEach(track => track.stop());

    try {
      videoElement && (await startVideo());
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  });

confirmButton && confirmButton.addEventListener("click", async () => {
  const loader: HTMLDivElement = document.getElementById("fv-loader-curtain",) as HTMLDivElement;
  loader.style.visibility = "visible";

  try {
    const result = await compressVideo(videoStatement);
    if (result?.ok) {
      const response = await result.json();
      if (response.data.status === "finished") {
        const fileUrl = response.data.tasks.find(
          (t) => t.name === "agreement_export",
        );
        const mp4 = await fetch(fileUrl.result.files[0].url);

        if (mp4.ok) {
          const blob = await mp4.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const base64String = base64 ? base64.split("data:video/mp4;base64,")[1] : "";
            const contractData: string = localStorage.getItem("contractData") as string;
            const biometrics: string = localStorage.getItem("biometrics") as string;
            const parsedBiometrics = JSON.parse(biometrics);

            const biometryData = {
              status: parsedBiometrics.latestIDScanResult.status,
              session_id: parsedBiometrics.latestIDScanResult.sessionId,
              is_done: parsedBiometrics.latestIDScanResult.isCompletelyDone,
              scan_id: parsedBiometrics.latestIDScanResult.idScan,
              back_image: parsedBiometrics.latestIDScanResult.backImages[0],
              front_image: parsedBiometrics.latestIDScanResult.frontImages[0],
            }

            const documentData = JSON.parse(contractData);
            const identificationData = JSON.parse(localStorage.getItem('documentData')!);

            const ip = await fetch(Config.ipBaseURL ?? "");
            const ipData = await ip.json();

            const data = {
              files: {
                biometry: biometryData,
                video: base64String,
                data: identificationData
              },
              document_id: parseInt(documentData.documentId),
              signer_id: parseInt(documentData.signerId),
              ip_address: ipData.ip,
            }

            const result = await uploadBiometricValidation(data);

            if (result?.ok) {
              loader.style.visibility = "hidden";
              window.location.href = "../signature";
            } else {
              console.error(result);
              loader.style.visibility = "hidden";
              if (modalError) modalError.style.visibility = "visible";
            }
          }
        }
      }
    }
  } catch (err: any) {
    loader.style.visibility = "hidden";
    throw new Error(err);
  }
});

import { Config } from "../../Config";

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

startButton &&
  startButton.addEventListener("click", async () => {
    recordedChunks.length = 0;
    if (recordingTimeLeft) {
      recordingTimeLeft.textContent = (recordingTimeout / 1000).toString();
    }
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
      const videoElement: HTMLVideoElement = document.getElementById(
        "fv-video-player",
      ) as HTMLVideoElement;
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
        startButton.disabled = false;
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
      startButton.disabled = false;
      stopButton.disabled = true;

      if (recordedChunks.length > 0) {
        deleteButton.disabled = false;
      } else {
        deleteButton.disabled = true;
      }
    }
  });

deleteButton &&
  deleteButton.addEventListener("click", () => {
    recordedChunks.length = 0;
    const videoElement: HTMLVideoElement = document.getElementById(
      "fv-video-player",
    ) as HTMLVideoElement;
    videoElement.srcObject = null;
    videoElement.src = "";
    startButton.disabled = false;
    stopButton.disabled = true;
    deleteButton.disabled = true;
    recordingTimeLeft.textContent = (recordingTimeout / 1000).toString();
    stream && stream.getTracks().forEach(track => track.stop());
  });

confirmButton &&
  confirmButton.addEventListener("click", async () => {
    const loader: HTMLDivElement = document.getElementById(
      "fv-loader-curtain",
    ) as HTMLDivElement;
    const flashToken = localStorage.getItem("flashUserToken");
    const contractData: string = localStorage.getItem("contractData") as string;
    const biometrics: string = localStorage.getItem("biometrics") as string;
    const filterBiometrics = {
      status: JSON.parse(biometrics).latestIDScanResult.status,
      sessionId: JSON.parse(biometrics).latestIDScanResult.sessionId,
      isCompletelyDone:
        JSON.parse(biometrics).latestIDScanResult.isCompletelyDone,
      idScan: JSON.parse(biometrics).latestIDScanResult.idScan,
    };
    const parsedContractData = JSON.parse(contractData);

    loader.style.visibility = "visible";

    try {
      const result = await fetch(`${Config.fvBaseURL}/uploadFiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${flashToken}`,
        },
        body: JSON.stringify({
          file: {
            contractData: parsedContractData,
            biometrics: {
              latestIDScanResult: filterBiometrics,
            },
            videoDeclaration: videoStatement,
          },
          contractID: parsedContractData.contractId,
          signerID: parsedContractData.signerId,
        } as any),
      });

      if (result.ok) {
        loader.style.visibility = "hidden";
        window.location.href = "../signature";
      } else {
        console.error(result);
        loader.style.visibility = "hidden";
        if (modalError) modalError.style.visibility = "visible";
      }
    } catch (err: any) {
      loader.style.visibility = "hidden";
      throw new Error(err);
    }
  });

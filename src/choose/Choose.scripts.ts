import { Config } from "../../Config";
import { uploadBiometricValidation } from "../services";

const videoOptionButton: HTMLButtonElement = document.getElementById(
  "fv-record-video",
) as HTMLButtonElement;

const signOptionButton: HTMLButtonElement = document.getElementById(
  "fv-sign-document",
) as HTMLButtonElement;

const modalError: HTMLElement = document.getElementById(
  "fv-modal-error",
) as HTMLDivElement;


videoOptionButton && videoOptionButton.addEventListener('click', () => {
  const contractData: string = localStorage.getItem("contractData") as string;
  const biometrics: string = localStorage.getItem("biometrics") as string;

  if(!contractData && !biometrics) return;

  window.location.href = "../agreement";
})

signOptionButton && signOptionButton.addEventListener('click', async () => {
  const loader: HTMLDivElement = document.getElementById(
    "fv-loader-curtain",
  ) as HTMLDivElement;
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

  const ip = await fetch(Config.ipBaseURL ?? "");
  const ipData = await ip.json();

  const data = {
    files: {
      biometry: biometryData
    },
    document_id: parseInt(documentData.documentId),
    signer_id: parseInt(documentData.signerId),
    ip_address: ipData.ip,
  }
  
  loader.style.visibility = "visible";
  const response = await uploadBiometricValidation(data);

  if (response?.ok) {
    loader.style.visibility = "hidden";
    window.location.href = "../src/signature";
  } else {
    console.error(response);
    loader.style.visibility = "hidden";
    if (modalError) modalError.style.visibility = "visible";
  }
})
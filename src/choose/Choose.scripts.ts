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
  console.log('Video button clicked!')
  const contractData: string = localStorage.getItem("contractData") as string;
  const biometrics: string = localStorage.getItem("biometrics") as string;

  if(!contractData && !biometrics) return;

  window.location.href = "./../agreement";

})

signOptionButton && signOptionButton.addEventListener('click', async () => {

  const loader: HTMLDivElement = document.getElementById(
    "fv-loader-curtain",
  ) as HTMLDivElement;
  console.log('Signature button clicked!')
  const contractData: string = localStorage.getItem("contractData") as string;
  const biometrics: string = localStorage.getItem("biometrics") as string;

  const biometryData = {
    status: JSON.parse(biometrics).latestIDScanResult.status,
    session_id: JSON.parse(biometrics).latestIDScanResult.sessionId,
    is_completed: JSON.parse(biometrics).latestIDScanResult.isCompletelyDone,
    scan_id: JSON.parse(biometrics).latestIDScanResult.idScan,
    back_image: JSON.parse(biometrics).latestIDScanResult.backImages[0],
    front_image: JSON.parse(biometrics).latestIDScanResult.frontImages[0],
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
    window.location.href = "../signature";
  } else {
    console.error(response);
    loader.style.visibility = "hidden";
    if (modalError) modalError.style.visibility = "visible";
  }
})
import { Config } from "../../Config";

const loader: HTMLDivElement = document.getElementById(
  "fv-loader-curtain",
) as HTMLDivElement;

const downloadContract: HTMLDivElement = document.getElementById(
  "fv-download-contract",
) as HTMLDivElement;

const confirmButton: HTMLButtonElement = document.getElementById(
  "fv-sign-contract",
) as HTMLButtonElement;

const cancelButton: HTMLButtonElement = document.getElementById(
  "fv-cancel-sign",
) as HTMLButtonElement;

const modalError: HTMLElement = document.getElementById(
  "fv-modal-error",
) as HTMLDivElement;

const modalCancelVerification: HTMLElement = document.getElementById(
  "fv-modal-cancel-verification",
) as HTMLDivElement;

const flashToken = localStorage.getItem("flashUserToken");
const contractData: string = localStorage.getItem("contractData") as string;
const parsedContractData = JSON.parse(contractData);

if (confirmButton) confirmButton.disabled = true;

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

downloadContract &&
  downloadContract.addEventListener("click", async () => {
    loader.style.visibility = "visible";

    try {
      const result = await fetch(
        `${Config.fvBaseURL}/download/${parsedContractData.contractId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${flashToken}`,
          },
        },
      );

      const response = await result.json();

      const pdfToBlob = base64ToBlob(response.file, "application/pdf");

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(pdfToBlob);
      downloadLink.download = `contrato_${parsedContractData.contractId}.pdf`;

      // firefox
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      loader.style.visibility = "hidden";
      confirmButton.disabled = false;
    } catch (err: any) {
      loader.style.visibility = "hidden";
      throw new Error(err);
    }
  });

confirmButton &&
  confirmButton.addEventListener("click", async () => {
    loader.style.visibility = "visible";
    cancelButton.disabled = true;

    try {
      const result = await fetch(
        `${Config.fvBaseURL}/sign/${parsedContractData.contractId}/${parsedContractData.signerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${flashToken}`,
          },
        },
      );

      const response = await result.json();

      if (result.ok) {
        loader.style.visibility = "hidden";
        window.location.href = "../success";
      } else {
        console.error(response);
        loader.style.visibility = "hidden";
        if (modalError) modalError.style.visibility = "visible";
      }
    } catch (err: any) {
      loader.style.visibility = "hidden";
      throw new Error(err);
    }
  });

cancelButton &&
  cancelButton.addEventListener("click", () => {
    modalCancelVerification.style.visibility = "visible";
    const okButton = document.getElementById("fv-modal-ok-cancel-button");
    const noButton = document.getElementById("fv-modal-no-cancel-button");

    noButton?.addEventListener(
      "click",
      () => (modalCancelVerification.style.visibility = "hidden"),
    );

    okButton?.addEventListener("click", () => {
      localStorage.removeItem("biometrics");
      localStorage.removeItem("contractData");
      localStorage.removeItem("flashUserToken");
      window.location.href = "/";
    });
  });

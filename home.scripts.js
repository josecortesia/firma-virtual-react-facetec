if (localStorage.getItem('require_video')) {
  localStorage.removeItem('require_video');
}

const params = new URLSearchParams(window.location.search);
const signatureCode = params.get("signature_code");
const documentUuid = params.get("document_uuid");
const documentId = params.get("document_id");
const signerId = params.get("signer_id");
const step = params.get("step");
const requireVideo = params.get("require_video");
const loader = document.querySelector("#fv-loader");
const error = document.querySelector("#fv-no-params-message");

if(step && step !== 'null' && step !== '') {
  localStorage.setItem('step', step);
}

if(requireVideo && requireVideo !== 'null' && requireVideo !== '') {
  localStorage.setItem('require_video', requireVideo);
}

if (signatureCode && documentUuid) {
  localStorage.setItem(
    "contractData",
    JSON.stringify({ signatureCode, documentUuid, documentId, signerId }),
  );
  setTimeout(() => {
    loader.style.display = "none";
    if (step === 'Signature') {
      window.location.href = "./src/signature";
    } else {
      window.location.href = "./src";
    }
  }, 2000);
} else {
  setTimeout(() => {
    loader.style.display = "none";
    error.style.display = "flex";
  }, 2000);
}
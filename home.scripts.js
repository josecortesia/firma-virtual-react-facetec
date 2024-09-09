const params = new URLSearchParams(window.location.search);
const signatureCode = params.get("signature_code");
const documentUuid = params.get("document_uuid");
const documentId = params.get("document_id");
const signerId = params.get("signer_id");
const loader = document.querySelector("#fv-loader");
const error = document.querySelector("#fv-no-params-message");

if (signatureCode && documentUuid) {
  localStorage.setItem(
    "contractData",
    JSON.stringify({ signatureCode, documentUuid, documentId, signerId }),
  );
  setTimeout(() => {
    loader.style.display = "none";
    window.location.href = "./src";
  }, 2000);
} else {
  setTimeout(() => {
    loader.style.display = "none";
    error.style.display = "flex";
  }, 2000);
}
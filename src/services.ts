import { Config } from "../Config";


interface BiometryResult {
  status: boolean;
  session_id: string;
  is_completed: boolean;
  scan_id: string;
  front_image: string;
  back_image: string;
}

interface BiometryMediaFiles {
  biometry: BiometryResult;
  video?: string;
}

interface BiometricValidation {
  document_id: number;
  signer_id: number;
  ip_address?: string;
  files: BiometryMediaFiles;
}

// const signDocument = async () => {

// }

// const compressVideo = async () => {

// }

export const uploadBiometricValidation = async (data: BiometricValidation) => {
  const token = localStorage.getItem("flashUserToken");
  try {
    const response = await fetch(`${Config.fvBaseURL}/files/uploadBiometryFiles`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (e) {
    console.error(e);
    return;
  }
}
import { Config } from "../Config";


interface BiometryResult {
  status: boolean;
  session_id: string;
  is_done: boolean;
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

interface SignatureData {
  document_id: number;
  id: number;
  data?: any;
}

export const signDocument = async (data: SignatureData) => {
  const token = localStorage.getItem("flashUserToken");
  try {
    const response = await fetch(`${Config.fvBaseURL}/signatures/signDocument`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      }
    );
    return response;
  } catch (err) {
    console.error(err);
    return;
  }
}

export const downloadDocument = async (fileName: string) => {
  const token = localStorage.getItem("flashUserToken");
  try {
    const response = await fetch(`${Config.fvBaseURL}/files/download/${fileName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (err) {
    console.error(err);
    return;
  }
}

export const compressVideo = async (video) => {
  const BASE_URL = process.env.CLOUD_CONVERT_BASE_URL ?? "";
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOUD_CONVERT_API_KEY}`,
      },
      body: JSON.stringify({
        tasks: {
          agreement_import: {
            operation: "import/base64",
            file: video,
            filename: "agreement.mp4",
          },
          agreement_convert: {
            operation: "convert",
            input_format: "webm",
            output_format: "mp4",
            engine: "ffmpeg",
            input: ["agreement_import"],
            video_codec: "x264",
            crf: 23,
            preset: "medium",
            fit: "scale",
            subtitles_mode: "none",
            audio_codec: "aac",
            audio_bitrate: 128,
          },
          agreement_export: {
            operation: "export/url",
            input: ["agreement_convert"],
            inline: false,
            archive_multiple_files: false,
          },
        },
        tag: "jobbuilder",
      }),
    });
    return response;
  } catch (err) {
    console.error(err);
    return;
  }
}

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
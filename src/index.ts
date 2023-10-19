import {FaceTecSDK} from "../core-sdk/FaceTecSDK.js/FaceTecSDK"
import type { FaceTecSessionResult, FaceTecFaceScanResultCallback, FaceTecFaceScanProcessor } from "../core-sdk/FaceTecSDK.js/FaceTecPublicApi"
import { Config } from "../AppConfig"
import { LivenessCheckProcessor } from "../processors/LivenessCheckProcessor"
import { OnComplete } from "../sampleAppControllerReference/SampleAppControllerReference";

export class App {
  public init = (): void => {
    FaceTecSDK.setResourceDirectory("../core-sdk/FaceTecSDK.js/resources")
    FaceTecSDK.setImagesDirectory("../core-sdk/FaceTec_images")
    FaceTecSDK.initializeInDevelopmentMode(Config.DeviceKeyIdentifier, 
      Config.PublicFaceScanEncryptionKey,
      function(initializationSuccessful: boolean) {
        console.log("Initialization Result: ", initializationSuccessful)
      })
  }

  public onLivenessCheckPressed = (): void => {
    this.getSessionToken((sessionToken?: string): void => {
      const livenessCheckProcessor = new LivenessCheckProcessor(sessionToken as string, this)
    })
  }

  public onComplete: OnComplete = (sessionResult, idScanResult, latestNetworkResponseStatus) => {
    console.log({sessionResult, idScanResult, latestNetworkResponseStatus})
  };

  private getSessionToken = async (sessionTokenCallback: (sessionToken: string) => void): Promise<void> => {
    try {
        const response = await fetch(`${Config.BaseURL}/session-token`, {
            method: 'GET',
            headers: {
                "X-Device-key": Config.DeviceKeyIdentifier,
                "X-User-Agent": FaceTecSDK.createFaceTecAPIUserAgentString("")
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const sessionToken = data.sessionToken;
        sessionTokenCallback(sessionToken);
    } catch (error) {
        console.error("Failed to fetch session token:", error);
    }
  }
}

window.onload = (): void => {
  const appInstance = new App()
  appInstance.init()
  window.FaceTecAppController = appInstance
}

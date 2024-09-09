import "./css/style.css";
import "./agreement/Agreement.scripts";
import "./signature/Signature.scripts";
import { Config } from "../Config";
import { FaceTecSDK } from "../core-sdk/FaceTecSDK.js/FaceTecSDK";
import { LivenessCheckProcessor } from "./processors/LivenessCheckProcessor";
import { EnrollmentProcessor } from "./processors/EnrollmentProcessor";
import { AuthenticateProcessor } from "./processors/AuthenticateProcessor";
import { SampleAppUtilities } from "./utilities/SampleAppUtilities";
import { PhotoIDMatchProcessor } from "./processors/PhotoIDMatchProcessor";
import { PhotoIDScanProcessor } from "./processors/PhotoIDScanProcessor";
import { ThemeHelpers } from "./utilities/ThemeHelpers";
import {
  FaceTecSessionResult,
  FaceTecIDScanResult,
} from "../core-sdk/FaceTecSDK.js/FaceTecPublicApi";
import { AdditionalScreens } from "./utilities/AdditionalScreens";
import {
  ClearLatestEnrollmentIdentifier,
  GetLatestEnrollmentIdentifier,
  OnComplete,
} from "./sampleAppControllerReference/SampleAppControllerReference";
import { DeveloperStatusMessages } from "./utilities/DeveloperStatusMessages";
import { LoginFlashUser } from "./utilities/CreateFlashUser";
// import { VerifySignature } from "./utilities/VerifySignature";

export const App = ((): any => {
  let flashUserResult = "";
  let latestEnrollmentIdentifier = "";
  let latestProcessor:
    | LivenessCheckProcessor
    | EnrollmentProcessor
    | AuthenticateProcessor
    | PhotoIDMatchProcessor
    | PhotoIDScanProcessor;
  let latestSessionResult: FaceTecSessionResult | null = null;
  let latestIDScanResult: FaceTecIDScanResult | null = null;
  let localizedLanguage = require('../core-sdk-optional/FaceTecStrings.es.js');

  window.onload = async (): Promise<void> => {
    const checkboxTermsConditions = document.getElementById(
      "fv-terms-and-conditions",
    ) as HTMLInputElement;

      const flashUser = await LoginFlashUser(Config.email!, Config.password!);
      flashUserResult = flashUser.uuid;
      // console.log(JSON.parse(localStorage.getItem('contractData')!))

    // if (flashUser.data) {
    //   // TODO: verify if contract was signed
    //   const signature = await VerifySignature();
    //   console.log(signature);
    // }

    SampleAppUtilities.formatUIForDevice();
    FaceTecSDK.setResourceDirectory("../../core-sdk/FaceTecSDK.js/resources");
    FaceTecSDK.setImagesDirectory("../../core-sdk/FaceTec_images");
    ThemeHelpers.setAppTheme(ThemeHelpers.getCurrentTheme());

    Config.initializeFromAutogeneratedConfig(
      FaceTecSDK,
      function (initializedSuccessfully: boolean) {
        if (initializedSuccessfully) {
          checkboxTermsConditions.disabled = false;
          checkboxTermsConditions?.addEventListener("change", () => {
            if (checkboxTermsConditions.checked) {
              SampleAppUtilities.enableControlButtons();
              SampleAppUtilities.setVocalGuidanceSoundFiles();
              SampleAppUtilities.setVocalGuidanceMode();
              SampleAppUtilities.setOCRLocalization();
              FaceTecSDK.configureLocalization(localizedLanguage)

              AdditionalScreens.setServerUpgradeStyling(
                document.getElementById("controls")!,
                exitAdditionalScreen,
              );
            } else {
              SampleAppUtilities.disableControlButtons();
            }
          });
        }

        DeveloperStatusMessages.logInitializeResult();
      },
    );

    SampleAppUtilities.fadeInMainUIContainer();
  };

  function initializeResultObjects(): void {
    latestSessionResult = null;
    latestIDScanResult = null;
  }

  function onLivenessCheckPressed(): void {
    initializeResultObjects();
    SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

    getSessionToken((sessionToken?: string): void => {
      latestProcessor = new LivenessCheckProcessor(sessionToken as string, App);
    });
  }

  function onEnrollUserPressed(): void {
    initializeResultObjects();
    SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

    getSessionToken((sessionToken?: string) => {
      latestEnrollmentIdentifier =
        "browser_sample_app_" + SampleAppUtilities.generateUUId();
      latestProcessor = new EnrollmentProcessor(sessionToken as string, App);
    });
  }

  function onAuthenticateUserPressed(): void {
    initializeResultObjects();

    if (latestEnrollmentIdentifier.length === 0) {
      DeveloperStatusMessages.logAndDisplayMessage(
        "Please enroll first before trying authentication.",
      );
    } else {
      SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

      getSessionToken((sessionToken?: string): void => {
        latestProcessor = new AuthenticateProcessor(
          sessionToken as string,
          App,
        );
      });
    }
  }

  function onPhotoIDMatchPressed(): void {
    initializeResultObjects();
    SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

    getSessionToken((sessionToken?: string): void => {
      latestEnrollmentIdentifier =
        "browser_sample_app_" + SampleAppUtilities.generateUUId();
      latestProcessor = new PhotoIDMatchProcessor(sessionToken as string, App);
    });
  }

  function onPhotoIDScanPressed(): void {
    initializeResultObjects();
    SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

    getSessionToken(function (sessionToken?: string) {
      latestProcessor = new PhotoIDScanProcessor(sessionToken as string, App);
    });
  }

  // Show the final result with the Session Review Screen.
  let onComplete: OnComplete;

  onComplete = (
    sessionResult: FaceTecSessionResult | null,
    idScanResult: FaceTecIDScanResult | null,
    latestNetworkResponseStatus: number,
  ): void => {
    latestSessionResult = sessionResult;
    latestIDScanResult = idScanResult;

    if (latestProcessor.isSuccess()) {
      localStorage.setItem(
        "biometrics",
        JSON.stringify({ latestIDScanResult, flashUserResult }),
      );

      window.location.href = "./agreement";
      DeveloperStatusMessages.displayMessage("See logs for details");
    } else {
      DeveloperStatusMessages.logScanOncompleteResult(
        sessionResult,
        idScanResult,
      );

      if (
        isNetworkResponseServerIsOffline(latestNetworkResponseStatus) === true
      ) {
        showAdditionalScreensServerIsDown();
        return;
      }
    }

    SampleAppUtilities.showMainUI();
  };

  function isNetworkResponseServerIsOffline(
    networkResponseStatus: number,
  ): boolean {
    return networkResponseStatus >= 500;
  }

  function onDesignShowcasePressed(): void {
    ThemeHelpers.showNewTheme();
  }

  function onVocalGuidanceSettingsButtonPressed(): void {
    SampleAppUtilities.setVocalGuidanceMode();
  }

  function onViewAuditTrailPressed(): void {
    SampleAppUtilities.showAuditTrailImages(
      latestSessionResult,
      latestIDScanResult,
    );
  }

  let sessionTokenErrorHasBeenHandled = false;

  function onSessionTokenError(xhrStatus: number | undefined): void {
    if (sessionTokenErrorHasBeenHandled === false) {
      sessionTokenErrorHasBeenHandled = true;

      if (
        xhrStatus !== undefined &&
        isNetworkResponseServerIsOffline(xhrStatus)
      ) {
        showAdditionalScreensServerIsDown();
      } else {
        onServerSessionTokenError();
      }
    }
  }

  function getSessionToken(
    sessionTokenCallback: (sessionToken: string) => void,
  ): void {
    sessionTokenErrorHasBeenHandled = false;

    try {
      const XHR = new XMLHttpRequest();
      XHR.open("GET", Config.BaseURL + "/session-token");
      XHR.setRequestHeader(
        "X-Device-Key",
        Config.DeviceKeyIdentifier as string,
      );
      XHR.setRequestHeader(
        "X-User-Agent",
        FaceTecSDK.createFaceTecAPIUserAgentString(""),
      );

      XHR.onreadystatechange = function (): void {
        if (this.readyState === XMLHttpRequest.DONE) {
          let sessionToken = "";

          try {
            sessionToken = JSON.parse(this.responseText).sessionToken;

            if (typeof sessionToken !== "string") {
              onSessionTokenError(XHR.status);
              return;
            }
          } catch {
            XHR.abort();
            onSessionTokenError(XHR.status);
            return;
          }

          SampleAppUtilities.hideLoadingSessionToken();
          sessionTokenCallback(sessionToken);
        }
      };

      window.setTimeout(() => {
        if (XHR.readyState !== XMLHttpRequest.DONE) {
          if (sessionTokenErrorHasBeenHandled === false) {
            SampleAppUtilities.showLoadingSessionToken();
          }
        }
      }, 3000);

      XHR.onerror = function (): void {
        XHR.abort();
        onSessionTokenError(XHR.status);
      };

      XHR.send();
    } catch (e) {
      onSessionTokenError(undefined);
    }
  }

  function showAdditionalScreensServerIsDown(): void {
    AdditionalScreens.showServerUpGradeView();
  }

  function onServerSessionTokenError(): void {
    SampleAppUtilities.handleErrorGettingServerSessionToken();
  }

  const getLatestEnrollmentIdentifier: GetLatestEnrollmentIdentifier =
    (): string => {
      return latestEnrollmentIdentifier;
    };

  const clearLatestEnrollmentIdentifier: ClearLatestEnrollmentIdentifier =
    () => {
      latestEnrollmentIdentifier = "";
    };

  function exitAdditionalScreen(): void {
    AdditionalScreens.exitAdditionalScreen(SampleAppUtilities.showMainUI);
  }

  return {
    onLivenessCheckPressed,
    onEnrollUserPressed,
    onAuthenticateUserPressed,
    onPhotoIDMatchPressed,
    onPhotoIDScanPressed,
    onDesignShowcasePressed,
    onComplete,
    getLatestEnrollmentIdentifier,
    clearLatestEnrollmentIdentifier,
    onVocalGuidanceSettingsButtonPressed,
    onViewAuditTrailPressed,
    latestSessionResult,
    latestIDScanResult,
  };
})();

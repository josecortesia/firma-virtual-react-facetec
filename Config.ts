export var Config = (function () {
  
  var ProductionKey = {
    domains: "",
    expiryDate: process.env.EXPIRYDATE,
    key: process.env.KEY,
  };

  const getData = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/getInitString/web`);
      const json = await response.json();
      const data = json.data.licenseText;
      ProductionKey = {
        domains: "",
        expiryDate: data.expiryDate,
        key: data.key,
      };
    }
    catch(err) {
      console.log(err)
      return undefined;
    }
  }

  getData();
  
  var DeviceKeyIdentifier = process.env.DEVICE_KEY_IDENTIFIER;
  var BaseURL = process.env.BASE_URL;
  var fvBaseURL = process.env.FV_BASE_URL;
  var ipBaseURL = process.env.IP_BASE_URL;
  var email = process.env.SUPPORT_USER_EMAIL;
  var password = process.env.SUPPORT_USER_PASSWORD;

  var PublicFaceScanEncryptionKey =
    process.env.PUBLIC_ENCRYPTION_KEY?.split("?*/").join("\n") ?? "";

  const initializeFromAutogeneratedConfig = (
    FaceTecSDK: any,
    callback: (arg0: any) => void,
  ) => {
    FaceTecSDK.initializeInProductionMode(
      ProductionKey,
      DeviceKeyIdentifier,
      PublicFaceScanEncryptionKey,
      function (initializedSuccessfully) {
        callback(initializedSuccessfully);
      },
    );
    // FaceTecSDK.initializeInDevelopmentMode(
    //   DeviceKeyIdentifier,
    //   PublicFaceScanEncryptionKey,
    //   function (initializedSuccessfully) {
    //     callback(initializedSuccessfully);
    //   },
    // );
  };

  function retrieveConfigurationWizardCustomization(FaceTecSDK: {
    FaceTecCancelButtonLocation: { TopRight: any };
    FaceTecSecurityWatermarkImage: { FaceTec: any };
    FaceTecCustomization: new () => any;
  }) {
    var sdkImageDirectory = "../../core-sdk/FaceTec_images/";

    var outerBackgroundColor = "#ffffff";
    var frameColor = "#ffffff";
    var borderColor = "#ffffff";
    var ovalColor = "#e8e8e8";
    var dualSpinnerColor = "#a3e8ff";
    var textColor = "#000000";
    var buttonAndFeedbackBarColor = "#50bafb";
    var buttonAndFeedbackBarTextColor = "#ffffff";
    var buttonColorHighlight = "#479ce1";
    var buttonColorDisabled = "#cbd7e1";

    let frameCornerRadius = "10px";

    var cancelButtonImage = sdkImageDirectory + "FaceTec_cancel.png";
    var cancelButtonLocation = FaceTecSDK.FaceTecCancelButtonLocation.TopRight;

    var yourAppLogoImage = sdkImageDirectory + "FaceTec_your_app_logo.png";
    var securityWatermarkImage =
      FaceTecSDK.FaceTecSecurityWatermarkImage.FaceTec;

    var defaultCustomization = new FaceTecSDK.FaceTecCustomization();

    defaultCustomization.frameCustomization.borderCornerRadius =
      frameCornerRadius;
    defaultCustomization.frameCustomization.backgroundColor = frameColor;
    defaultCustomization.frameCustomization.borderColor = borderColor;

    defaultCustomization.overlayCustomization.brandingImage = yourAppLogoImage;
    defaultCustomization.overlayCustomization.backgroundColor =
      outerBackgroundColor;

    defaultCustomization.guidanceCustomization.backgroundColors = frameColor;
    defaultCustomization.guidanceCustomization.foregroundColor = textColor;
    defaultCustomization.guidanceCustomization.buttonBackgroundNormalColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.guidanceCustomization.buttonBackgroundDisabledColor =
      buttonColorDisabled;
    defaultCustomization.guidanceCustomization.buttonBackgroundHighlightColor =
      buttonColorHighlight;
    defaultCustomization.guidanceCustomization.buttonTextNormalColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.guidanceCustomization.buttonTextDisabledColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.guidanceCustomization.buttonTextHighlightColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.guidanceCustomization.retryScreenImageBorderColor =
      borderColor;
    defaultCustomization.guidanceCustomization.retryScreenOvalStrokeColor =
      borderColor;

    defaultCustomization.ovalCustomization.strokeColor = ovalColor;
    defaultCustomization.ovalCustomization.progressColor1 = dualSpinnerColor;
    defaultCustomization.ovalCustomization.progressColor2 = dualSpinnerColor;

    defaultCustomization.feedbackCustomization.backgroundColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.feedbackCustomization.textColor =
      buttonAndFeedbackBarTextColor;

    defaultCustomization.cancelButtonCustomization.customImage =
      cancelButtonImage;
    defaultCustomization.cancelButtonCustomization.location =
      cancelButtonLocation;

    defaultCustomization.securityWatermarkCustomization.setSecurityWatermarkImage(
      securityWatermarkImage,
    );

    defaultCustomization.resultScreenCustomization.backgroundColors =
      frameColor;
    defaultCustomization.resultScreenCustomization.foregroundColor = textColor;
    defaultCustomization.resultScreenCustomization.activityIndicatorColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.resultScreenCustomization.resultAnimationBackgroundColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.resultScreenCustomization.resultAnimationForegroundColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.resultScreenCustomization.uploadProgressFillColor =
      buttonAndFeedbackBarColor;

    defaultCustomization.idScanCustomization.selectionScreenBackgroundColors =
      frameColor;
    defaultCustomization.idScanCustomization.selectionScreenForegroundColor =
      textColor;
    defaultCustomization.idScanCustomization.reviewScreenBackgroundColors =
      frameColor;
    defaultCustomization.idScanCustomization.reviewScreenForegroundColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.idScanCustomization.reviewScreenTextBackgroundColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.idScanCustomization.captureScreenForegroundColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.idScanCustomization.captureScreenTextBackgroundColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.idScanCustomization.buttonBackgroundNormalColor =
      buttonAndFeedbackBarColor;
    defaultCustomization.idScanCustomization.buttonBackgroundDisabledColor =
      buttonColorDisabled;
    defaultCustomization.idScanCustomization.buttonBackgroundHighlightColor =
      buttonColorHighlight;
    defaultCustomization.idScanCustomization.buttonTextNormalColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.idScanCustomization.buttonTextDisabledColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.idScanCustomization.buttonTextHighlightColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.idScanCustomization.captureScreenBackgroundColor =
      frameColor;
    defaultCustomization.idScanCustomization.captureFrameStrokeColor =
      borderColor;

    defaultCustomization.initialLoadingAnimationCustomization.backgroundColor =
      buttonAndFeedbackBarTextColor;
    defaultCustomization.initialLoadingAnimationCustomization.foregroundColor =
      buttonAndFeedbackBarColor;

    return defaultCustomization;
  }

  function retrieveLowLightConfigurationWizardCustomization(FaceTecSDK: {
    FaceTecCancelButtonLocation: { TopRight: any };
    FaceTecSecurityWatermarkImage: { FaceTec: any };
    FaceTecCustomization: new () => any;
  }) {
    var defaultCustomization =
      retrieveConfigurationWizardCustomization(FaceTecSDK);
    currentLowLightCustomization = defaultCustomization;
    return defaultCustomization;
  }

  function retrieveDynamicDimmingConfigurationWizardCustomization(FaceTecSDK: {
    FaceTecCancelButtonLocation: { TopRight: any };
    FaceTecSecurityWatermarkImage: { FaceTec: any };
    FaceTecCustomization: new () => any;
  }) {
    var textColor = "#ffffff";

    var dynamicDimmingCustomization =
      retrieveConfigurationWizardCustomization(FaceTecSDK);

    dynamicDimmingCustomization.guidanceCustomization.foregroundColor =
      textColor;

    dynamicDimmingCustomization.resultScreenCustomization.foregroundColor =
      textColor;

    dynamicDimmingCustomization.idScanCustomization.selectionScreenForegroundColor =
      textColor;

    return dynamicDimmingCustomization;
  }

  var currentCustomization: any;
  var currentLowLightCustomization: any;
  var currentDynamicDimmingCustomization: any;
  var wasSDKConfiguredWithConfigWizard = true;

  var minMatchLevel: number = 5;
  var maxIntentsMatch: number = 3;
  var maxIntentsWithoutTemplate: number = 3;
  var maxIntentsSpoofDetection: number = 3;

  return {
    wasSDKConfiguredWithConfigWizard,
    DeviceKeyIdentifier,
    BaseURL,
    fvBaseURL,
    ipBaseURL,
    PublicFaceScanEncryptionKey,
    initializeFromAutogeneratedConfig,
    currentCustomization,
    currentLowLightCustomization,
    currentDynamicDimmingCustomization,
    retrieveConfigurationWizardCustomization,
    retrieveLowLightConfigurationWizardCustomization,
    retrieveDynamicDimmingConfigurationWizardCustomization,
    minMatchLevel,
    maxIntentsMatch,
    maxIntentsWithoutTemplate,
    maxIntentsSpoofDetection,
    email,
    password
  };
})();

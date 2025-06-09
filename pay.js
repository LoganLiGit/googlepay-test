class paySDK {
  constructor() {
    /** googlePay Start============================================================================================================*/
    // document.write(
    //   '<script async src="https://pay.google.com/gp/p/js/pay.js"  onload="sdk.googlePay.onGooglePayLoaded()"></script>'
    // );
    const googlePayScript = document.createElement("script");
    googlePayScript.setAttribute("type", "text/javascript");
    googlePayScript.setAttribute(
      "src",
      "https://pay.google.com/gp/p/js/pay.js"
    );
    googlePayScript.setAttribute("async", true);
    googlePayScript.setAttribute("onload", "sdk.googlePay.onGooglePayLoaded()");
    document.getElementsByTagName("head")[0].appendChild(googlePayScript);

    this.googlePay = {};
    this.googlePay.onGooglePayLoaded = function () {
      const paymentsClient = this.getGooglePaymentsClient();
      if (!paymentsClient) {
        return;
      }
      return paymentsClient
        .isReadyToPay(this.getGoogleIsReadyToPayRequest())
        .then((response) => {
          if (response.result) {
            // return response.result;
            this.addGooglePayButton();
          }
        })
        .catch((err) => {
          // show error in developer console for debugging
          console.error(err);
        });
    };
    /** 取得使用者googlePay資訊 */
    this.googlePay.getGooglePaymentsClient = function () {
      if (this.paymentsClient === null) {
        this.paymentsClient = new google.payments.api.PaymentsClient({
          environment: this.environment,
          merchantInfo: this.merchantInfo,
          paymentDataCallbacks: {
            onPaymentAuthorized: this.onPaymentAuthorized,
          },
        });
      }
      return this.paymentsClient;
    };
    /** 準備付款請求 */
    this.googlePay.getGoogleIsReadyToPayRequest = function () {
      return Object.assign({}, this.baseRequest, {
        allowedPaymentMethods: [this.baseCardPaymentMethod],
      });
    };
    /** 添加googlePay按鈕 */
    this.googlePay.addGooglePayButton = function () {
      const paymentsClient = this.getGooglePaymentsClient();
      // const button = paymentsClient.createButton({
      //   onClick: this.onGooglePaymentButtonClicked,
      // });
      const button = paymentsClient.createButton({
        ...this.googlePayButtonOptions,
        onClick: this.onGooglePaymentButtonClicked,
      });
      document.getElementById(this.googlePayButtonID).appendChild(button);
    };
    /** 點擊 Google 付款按鈕 */
    this.googlePay.onGooglePaymentButtonClicked = function () {
      const paymentDataRequest = sdk.googlePay.getGooglePaymentDataRequest();
      paymentDataRequest.transactionInfo =
        sdk.googlePay.getGoogleTransactionInfo();

      const paymentsClient = sdk.googlePay.getGooglePaymentsClient();
      paymentsClient.loadPaymentData(paymentDataRequest);
    };
    /** 取得Google交易訊息 */
    this.googlePay.getGoogleTransactionInfo = function () {
      return this.transactionInfo;
    };
    /** 付款授權 */
    this.googlePay.onPaymentAuthorized = (paymentData) => {
      return new Promise((resolve, reject) => {
        // handle the response

        sdk.googlePay
          .processPayment(paymentData)
          .then(() => {
            resolve({ transactionState: "SUCCESS" });
          })
          .catch(() => {
            resolve({
              transactionState: "ERROR",
              error: {
                intent: "PAYMENT_AUTHORIZATION",
                message:
                  "Insufficient funds, try again. Next attempt should work.",
                reason: "PAYMENT_DATA_INVALID",
              },
            });
          });
      });
    };
    /** 付款資料請求 */
    this.googlePay.getGooglePaymentDataRequest = function () {
      const paymentDataRequest = Object.assign({}, this.baseRequest);
      paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethod];
      paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();
      paymentDataRequest.merchantInfo = {
        // @todo a merchant ID is available for a production environment after approval by Google
        // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
        merchantId: this.merchantInfo.merchantId,
        merchantName: this.merchantInfo.merchantName,
      };

      paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

      return paymentDataRequest;
    };
    /** 流程付款 */
    this.googlePay.processPayment = (paymentData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // @todo pass payment token to your gateway to process payment
          const paymentToken =
            paymentData.paymentMethodData.tokenizationData.token;
          // if (this.attempts++ % 2 == 0) {
          //   reject(
          //     new Error("Every other attempt fails, next one should succeed")
          //   );
          // } else {
          //   resolve(this.callback(paymentToken));resolve(this.callback(paymentToken));
          // }
          resolve(sdk.googlePay.callback(paymentToken));
        }, 500);
      });
    };

    /** =========================================googlePay End=================================================================*/
    /** applePay  Start*/
    // document.write(
    //   '<script async  crossorigin src="https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js"></script>'
    // );
    const applePayScript = document.createElement("script");
    applePayScript.setAttribute("type", "text/javascript");
    applePayScript.setAttribute(
      "src",
      "https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js"
    );
    applePayScript.setAttribute("async", true);
    document.getElementsByTagName("head")[0].appendChild(applePayScript);

    /** 檢查apple pAy 可不可用 */
    if (window.ApplePaySession) {
      if (!ApplePaySession.canMakePayments()) {
        console.warn("User Can Not Use Apple Pay");
      }
    } else {
      console.warn("Please open on a supported applePay browser");
    }
    this.applePay = {};
  }
  /** googlePay Start ================================================================================================================*/
  /** 設定googlePay參數 */
  setGooglePay = function (googlePayParams) {
    const {
      googlePayButtonID,
      // 開發環境或者產品環境   TEST || PRODUCTION,
      environment,
      // 允許的卡片驗證方法
      allowedCardAuthMethods,
      // 允許的卡片
      allowedCardNetworks,
      // 通道
      parameters,
      // 商家
      merchantInfo,
      // 付款資訊
      transactionInfo,
      googlePayButtonOptions,
    } = googlePayParams;

    const baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
    };

    const baseCardPaymentMethod = {
      type: "CARD",
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
      },
    };
    const tokenizationSpecification = {
      type: "PAYMENT_GATEWAY",
      parameters: parameters,
    };

    this.googlePay.googlePayButtonID = googlePayButtonID;
    this.googlePay.environment = environment;
    this.googlePay.baseRequest = baseRequest;
    this.googlePay.allowedCardAuthMethods = allowedCardAuthMethods;
    this.googlePay.allowedCardNetworks = allowedCardNetworks;
    this.googlePay.merchantInfo = merchantInfo;
    this.googlePay.transactionInfo = transactionInfo;
    this.googlePay.googlePayButtonOptions = googlePayButtonOptions;
    this.googlePay.tokenizationSpecification = tokenizationSpecification;
    this.googlePay.baseCardPaymentMethod = baseCardPaymentMethod;

    this.googlePay.cardPaymentMethod = Object.assign(
      {},
      this.googlePay.baseCardPaymentMethod,
      {
        tokenizationSpecification: this.googlePay.tokenizationSpecification,
      }
    );
    this.googlePay.paymentsClient = null;
    this.googlePay.attempts = 0;
    this.googlePay.paymentToken = null;
  };
  /** 設定取得token的function */
  setGoogleCallback = function (callback) {
    this.googlePay.callback = callback;
  };
  /** googlePay End ==============================================================================================================*/
  
}

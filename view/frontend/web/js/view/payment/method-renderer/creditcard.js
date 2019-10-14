/**
 * @author      Webjump Core Team <dev@webjump.com>
 * @copyright   2016 Webjump (http://www.webjump.com.br)
 * @license     http://www.webjump.com.br  Copyright
 *
 * @link        http://www.webjump.com.br
 */
/*browser:true*/
/*global define*/
define(
    [
        'Magento_Checkout/js/view/payment/default',
        'mage/translate',
        'Webjump_BraspagPagador/js/view/payment/method-renderer/creditcard/silentorderpost',
        'Webjump_BraspagPagador/js/view/payment/method-renderer/creditcard/silentauthtoken',
        'jquery',
        'Magento_Checkout/js/action/place-order',
        'Magento_Checkout/js/model/full-screen-loader',
        'Magento_Checkout/js/model/payment/additional-validators',
        'Webjump_BraspagPagador/js/action/redirect-after-placeorder',
        'Webjump_BraspagPagador/js/action/installments',
        'Magento_Checkout/js/action/redirect-on-success',
        'Magento_Checkout/js/model/quote',
        'ko',
        'Magento_Checkout/js/model/error-processor',
        'mage/validation',
        'mage/url',
        'Webjump_BraspagPagador/js/model/authentication3ds20',
        'Webjump_BraspagPagador/js/view/payment/auth3ds20/bpmpi-renderer'
    ],
    function (
        Component,
        $t,
        sopt,
        soptToken,
        $,
        placeOrderAction,
        fullScreenLoader,
        additionalValidators,
        RedirectAfterPlaceOrder,
        installments,
        redirectOnSuccessAction,
        quote,
        ko,
        errorProcessor,
        mageValidation,
        mageUrl,
        authentication3ds20,
        bpmpiRenderer
    ) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'Webjump_BraspagPagador/payment/creditcard',
                creditCardInstallments: '',
                creditCardsavecard: 0,
                creditCardExpDate: '',
                creditCardSoptPaymentToken: '',
                allInstallments: ko.observableArray([]),
                bpmpiInitControl: 0,
                bpmpiAuthFailureType: ko.observable(),
                bpmpiAuthCavv: ko.observable(),
                bpmpiAuthXid: ko.observable(),
                bpmpiAuthEci: ko.observable(),
                bpmpiAuthVersion: ko.observable(),
                bpmpiAuthReferenceId: ko.observable()
            },

            initialize: function () {
                this._super();
                this.getCcInstallments();
                this.bpmpiPlaceOrderInit();
            },

            maskCvv: function (data, event) {
                var maxlength = 3;

                if (
                    this.creditCardType() === 'Cielo-Amex' ||
                    this.creditCardType() === 'Cielo30-Amex' ||
                    this.creditCardType() === 'CieloSitef-Amex'
                ){
                    maxlength = 4;
                }

                if (event.target.value.length >= maxlength) {
                    return false;
                }

                return true;
            },

            validateForm: function (form) {
                return $(form).validation() && $(form).validation('isValid');
            },

            initObservable: function () {
                this._super()
                    .observe([
                        'creditCardType',
                        'creditCardNumber',
                        'creditCardOwner',
                        'creditCardExpYear',
                        'creditCardExpMonth',
                        'creditCardExpDate',
                        'creditCardVerificationNumber',
                        'creditCardInstallments',
                        'creditCardsavecard',
                        'creditCardSoptPaymentToken'
                    ]);

                return this;
            },

            getCode: function() {
                return 'braspag_pagador_creditcard';
            },

            isActive: function() {
                return true;
            },

            getData: function () {

                var data = {
                    'method': this.item.method,
                    'additional_data': {
                        'cc_cid': this.creditCardVerificationNumber (),
                        'cc_type': this.creditCardType(),
                        'cc_exp_year': this.creditCardExpYear(),
                        'cc_exp_month': this.creditCardExpMonth(),
                        'cc_number': this.creditCardNumber(),
                        'cc_owner': this.creditCardOwner(),
                        'cc_installments': this.creditCardInstallments(),
                        'cc_savecard': this.creditCardsavecard() ? 1 : 0,
                        'cc_soptpaymenttoken': this.creditCardSoptPaymentToken(),
                        'authentication_failure_type': this.bpmpiAuthFailureType(),
                        'authentication_cavv': this.bpmpiAuthCavv(),
                        'authentication_xid': this.bpmpiAuthXid(),
                        'authentication_eci': this.bpmpiAuthEci(),
                        'authentication_version': this.bpmpiAuthVersion(),
                        'authentication_reference_id': this.bpmpiAuthReferenceId()
                    }
                };

                if (sopt.isActive(this.getCode()) && this.isSoptActive()) {
                    data = {
                        'method': this.item.method,
                        'additional_data': {
                            'cc_cid': this.creditCardVerificationNumber (),
                            'cc_type': this.creditCardType(),
                            'cc_owner': this.creditCardOwner(),
                            'cc_installments': this.creditCardInstallments(),
                            'cc_savecard': this.creditCardsavecard() ? 1 : 0,
                            'cc_soptpaymenttoken': this.creditCardSoptPaymentToken()
                        }
                    };
                }

                return data;
            },

            isInstallmentsActive: function () {
                return window.checkoutConfig.payment.ccform.installments.active[this.getCode()];
            },

            getCcInstallments: function() {
                var self = this;

                fullScreenLoader.startLoader();
                $.when(
                    installments()
                ).done(function (transport) {
                    self.allInstallments.removeAll();

                    _.map(transport, function (value, key) {
                        self.allInstallments.push({
                            'value': value.id,
                            'installments': value.label
                        });
                    });

                }).always(function () {
                    fullScreenLoader.stopLoader();
                });
            },

            getCcInstallmentsValues: function() {
                return _.map(this.getCcInstallments(), function (value, key) {
                    return {
                        'value': key,
                        'installments': value
                    };
                });
            },

            isSaveCardActive: function() {
                return (window.isCustomerLoggedIn && window.checkoutConfig.payment.ccform.savecard.active[this.getCode()]);
            },

            getSaveCardHelpHtml: function () {
                return '<span>' + $t('Add To Braspag JustClick') + '</span>';
            },

            updateCreditCardSoptPaymentToken: function () {
                var self = this;

                fullScreenLoader.startLoader();

                $.when(
                    soptToken()
                ).done(function (transport) {

                    var options = {
                        holderName: self.creditCardOwner(),
                        rawNumber: self.creditCardNumber(),
                        expiration: self.creditCardExpDate(),
                        securityCode: self.creditCardVerificationNumber(),
                        code: self.getCode(),
                        authToken: transport,
                        successCallBack: function () {
                            fullScreenLoader.stopLoader();
                        },
                        failCallBack: function () {
                            fullScreenLoader.stopLoader();
                        }
                    };

                    self.creditCardSoptPaymentToken(sopt.getPaymentToken(options));

                    for (var i = 0; i < 5; i++){
                        if(!self.creditCardSoptPaymentToken()){
                            return self.updateCreditCardSoptPaymentToken();
                        } else {
                            break;
                        }
                    }

                    $.when(
                        placeOrderAction(self.getData(), self.messageContainer)
                    )
                        .fail(
                            function () {
                                self.isPlaceOrderActionAllowed(true);
                            }
                        ).done(
                        function (orderId) {

                            self.afterPlaceOrder();

                            fullScreenLoader.startLoader();
                            $.when(
                                RedirectAfterPlaceOrder(orderId)
                            ).done(
                                function (url) {
                                    if (url.length) {
                                        window.location.replace(url);
                                        return true;
                                    }

                                    if (self.redirectAfterPlaceOrder) {
                                        redirectOnSuccessAction.execute();
                                    }
                                }
                            ).fail(
                                function (response) {
                                    errorProcessor.process(response, messageContainer);
                                }
                            ).always(function () {
                                fullScreenLoader.stopLoader();
                            });
                        }
                    );
                });
            },

            updateCreditCardExpData: function () {
                this.creditCardExpDate(this.pad(this.creditCardExpMonth(), 2) + '/' + this.creditCardExpYear());
            },

            pad: function(num, size) {
                var s = "00" + num;
                return s.substr(s.length-size);
            },

            getPlaceOrderDeferredObject: function () {
                var self = this;
                if (sopt.isActive(this.getCode()) && this.isSoptActive()) {
                    this.updateCreditCardExpData();
                    this.updateCreditCardSoptPaymentToken();
                } else {
                    $.when(
                        placeOrderAction(this.getData(), this.messageContainer)
                    )
                        .fail(
                            function () {
                                self.isPlaceOrderActionAllowed(true);
                            }
                        ).done(
                        function (orderId) {
                            self.afterPlaceOrder();

                            fullScreenLoader.startLoader();
                            $.when(
                                RedirectAfterPlaceOrder(orderId)
                            ).done(
                                function (url) {
                                    if (url.length) {
                                        window.location.replace(url);
                                        return true;
                                    }

                                    if (self.redirectAfterPlaceOrder) {
                                        redirectOnSuccessAction.execute();
                                    }
                                }
                            ).fail(
                                function (response) {
                                    errorProcessor.process(response, messageContainer);
                                }
                            ).always(function () {
                                fullScreenLoader.stopLoader();
                            });
                        }
                    );
                }
            },

            isSoptActive: function () {
                return true;
            },

            isBpmpiEnabled: function() {
                return window.checkoutConfig.payment.ccform.bpmpi_authentication.active;
            },

            isBpmpiMasterCardNotifyOnlyEnabled: function() {
                return window.checkoutConfig.payment.ccform.bpmpi_authentication.mastercard_notify_only;
            },

            bpmpiPlaceOrderInit: function() {
                var self = this;

                if (self.isBpmpiEnabled()) {
                    if (self.bpmpiInitControl >= 1) {
                        return false;
                    }
                    self.bpmpiInitControl = 1;

                    $('.bpmpi_auth_failure_type').change(function () {

                        if (!$("#" + self.item.method).is(':checked')) {
                            return false;
                        }

                        self.bpmpiAuthFailureType($('.bpmpi_auth_failure_type').val());
                        self.bpmpiAuthCavv($('.bpmpi_auth_cavv').val());
                        self.bpmpiAuthXid($('.bpmpi_auth_xid').val());
                        self.bpmpiAuthEci($('.bpmpi_auth_eci').val());
                        self.bpmpiAuthVersion($('.bpmpi_auth_version').val());
                        self.bpmpiAuthReferenceId($('.bpmpi_auth_reference_id').val());

                        self.getPlaceOrderDeferredObject();
                        fullScreenLoader.stopLoader();

                        return false;
                    });
                }

                return false;
            },

            bpmpiPopulateCreditcardData: function() {

                bpmpiRenderer.renderBpmpiData('bpmpi_paymentmethod', '', 'Credit');
                bpmpiRenderer.renderBpmpiData('bpmpi_auth', false, this.isCieloProviderAvailable());
                bpmpiRenderer.renderBpmpiData('bpmpi_cardnumber', false, this.creditCardNumber());
                bpmpiRenderer.renderBpmpiData('bpmpi_billto_contactname', false, this.creditCardOwner());
                bpmpiRenderer.renderBpmpiData('bpmpi_cardexpirationmonth', false, this.creditCardExpMonth());
                bpmpiRenderer.renderBpmpiData('bpmpi_cardexpirationyear', false, this.creditCardExpYear());
                bpmpiRenderer.renderBpmpiData('bpmpi_installments', false, this.creditCardInstallments());
                bpmpiRenderer.renderBpmpiData('bpmpi_auth_notifyonly', false, this.isBpmpiMasterCardNotifyOnlyEnabled());

                return true;
            },

            bpmpiPopulateAdditionalData: function() {

                bpmpiRenderer.renderBpmpiData('bpmpi_mdd1', false, window.checkoutConfig.payment.ccform.bpmpi_authentication.mdd1);
                bpmpiRenderer.renderBpmpiData('bpmpi_mdd2', false, window.checkoutConfig.payment.ccform.bpmpi_authentication.mdd2);
                bpmpiRenderer.renderBpmpiData('bpmpi_mdd3', false, window.checkoutConfig.payment.ccform.bpmpi_authentication.mdd3);
                bpmpiRenderer.renderBpmpiData('bpmpi_mdd4', false, window.checkoutConfig.payment.ccform.bpmpi_authentication.mdd4);
                bpmpiRenderer.renderBpmpiData('bpmpi_mdd5', false, window.checkoutConfig.payment.ccform.bpmpi_authentication.mdd5);

                return true;
            },

            isCieloProviderAvailable: function() {

                if (this.creditCardType().indexOf("Cielo") >= 0
                  || window.checkoutConfig.payment.braspag.isTestEnvironment == '1'
                ) {
                    return true;
                }

                return false;
            },

            placeOrder: function (data, event) {

                var self = this;

                if (!this.validateForm('#'+ this.getCode() + '-form')) {
                    return;
                }

                if (event) {
                    event.preventDefault();
                }

                if (! (this.validate() && additionalValidators.validate())) {
                    return false;
                }

                this.isPlaceOrderActionAllowed(false);

                fullScreenLoader.startLoader();

                if (!self.isBpmpiEnabled()) {
                    self.getPlaceOrderDeferredObject();
                    fullScreenLoader.stopLoader();
                    return true;
                }

                self.bpmpiPopulateCreditcardData();
                self.bpmpiPopulateAdditionalData();

                authentication3ds20.bpmpiAuthenticate()
                    .then(function (data){
                        return false;
                    }).catch(function(){
                        fullScreenLoader.stopLoader();
                        return false;
                    });

                return true;
            },

            /**
             * Get list of available credit card types
             * @returns {Object}
             */
            getCcAvailableTypes: function () {
                return window.checkoutConfig.payment.ccform.availableTypes[this.getCode()];
            },

            /**
             * Get payment icons
             * @param {String} type
             * @returns {Boolean}
             */
            getIcons: function (type) {
                return window.checkoutConfig.payment.ccform.icons.hasOwnProperty(type) ?
                    window.checkoutConfig.payment.ccform.icons[type]
                    : false;
            },

            /**
             * Get list of months
             * @returns {Object}
             */
            getCcMonths: function () {
                return window.checkoutConfig.payment.ccform.months[this.getCode()];
            },

            /**
             * Get list of years
             * @returns {Object}
             */
            getCcYears: function () {
                return window.checkoutConfig.payment.ccform.years[this.getCode()];
            },

            /**
             * Check if current payment has verification
             * @returns {Boolean}
             */
            hasVerification: function () {
                return window.checkoutConfig.payment.ccform.hasVerification[this.getCode()];
            },

            /**
             * @deprecated
             * @returns {Boolean}
             */
            hasSsCardType: function () {
                return window.checkoutConfig.payment.ccform.hasSsCardType[this.getCode()];
            },

            /**
             * Get image url for CVV
             * @returns {String}
             */
            getCvvImageUrl: function () {
                return window.checkoutConfig.payment.ccform.cvvImageUrl[this.getCode()];
            },

            /**
             * Get image for CVV
             * @returns {String}
             */
            getCvvImageHtml: function () {
                return '<img src="' + this.getCvvImageUrl() +
                    '" alt="' + $t('Card Verification Number Visual Reference') +
                    '" title="' + $t('Card Verification Number Visual Reference') +
                    '" />';
            },

            /**
             * @deprecated
             * @returns {Object}
             */
            getSsStartYears: function () {
                return window.checkoutConfig.payment.ccform.ssStartYears[this.getCode()];
            },

            /**
             * Get list of available credit card types values
             * @returns {Object}
             */
            getCcAvailableTypesValues: function () {
                return _.map(this.getCcAvailableTypes(), function (value, key) {
                    return {
                        'value': key,
                        'type': value
                    };
                });
            },

            /**
             * Get list of available month values
             * @returns {Object}
             */
            getCcMonthsValues: function () {
                return _.map(this.getCcMonths(), function (value, key) {
                    return {
                        'value': key,
                        'month': value
                    };
                });
            },

            /**
             * Get list of available year values
             * @returns {Object}
             */
            getCcYearsValues: function () {
                return _.map(this.getCcYears(), function (value, key) {
                    return {
                        'value': key,
                        'year': value
                    };
                });
            },

            /**
             * @deprecated
             * @returns {Object}
             */
            getSsStartYearsValues: function () {
                return _.map(this.getSsStartYears(), function (value, key) {
                    return {
                        'value': key,
                        'year': value
                    };
                });
            },

            /**
             * Is legend available to display
             * @returns {Boolean}
             */
            isShowLegend: function () {
                return false;
            },

            /**
             * Get available credit card type by code
             * @param {String} code
             * @returns {String}
             */
            getCcTypeTitleByCode: function (code) {
                var title = '',
                    keyValue = 'value',
                    keyType = 'type';

                _.each(this.getCcAvailableTypesValues(), function (value) {
                    if (value[keyValue] === code) {
                        title = value[keyType];
                    }
                });

                return title;
            },

            /**
             * Prepare credit card number to output
             * @param {String} number
             * @returns {String}
             */
            formatDisplayCcNumber: function (number) {
                return 'xxxx-' + number.substr(-4);
            },

            /**
             * Get credit card details
             * @returns {Array}
             */
            getInfo: function () {
                return [
                    {
                        'name': 'Credit Card Type', value: this.getCcTypeTitleByCode(this.creditCardType())
                    },
                    {
                        'name': 'Credit Card Number', value: this.formatDisplayCcNumber(this.creditCardNumber())
                    }
                ];
            }
        });
    }
);

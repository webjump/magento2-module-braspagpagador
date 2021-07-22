/**
 * @author      Webjump Core Team <dev@webjump.com>
 * @copyright   2020 Webjump (http://www.webjump.com.br)
 * @license     http://www.webjump.com.br  Copyright
 *
 * @link        http://www.webjump.com.br
 */
/*browser:true*/
/*global define*/
define(
	[
		"jquery"
	],
	function(
		$
	) {
	'use strict';

	var defaultFormat = /(\d{1,4})/g;
	var cards = [
		{
			type: 'naranja-nevada',
			typeName: 'Naranja e Nevada',
			patterns: [5895],
			regex_include: '^(589562)',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'elo',
			typeName: 'Elo',
			patterns: [6363,4389,5041,4514,6362,5067,4576,4011],
			regex_include: '^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^504175|^627780|^63(6297|6368|6369)|(65003[5-9]|65004[0-9]|65005[01])|(65040[5-9]|6504[1-3][0-9])|(65048[5-9]|65049[0-9]|6505[0-2][0-9]|65053[0-8])|(65054[1-9]|6505[5-8][0-9]|65059[0-8])|(65070[0-9]|65071[0-8])|(65072[0-7])|(65090[1-9]|6509[1-6][0-9]|65097[0-8])|(65165[2-9]|6516[67][0-9])|(65500[0-9]|65501[0-9])|(65502[1-9]|6550[34][0-9]|65505[0-8])|^(506699|5067[0-6][0-9]|50677[0-8])|^(509[0-8][0-9]{2}|5099[0-8][0-9]|50999[0-9])|^65003[1-3]|^(65003[5-9]|65004\\d|65005[0-1])|^(65040[5-9]|6504[1-3]\\d)|^(65048[5-9]|65049\\d|6505[0-2]\\d|65053[0-8])|^(65054[1-9]|6505[5-8]\\d|65059[0-8])|^(65070\\d|65071[0-8])|^65072[0-7]|^(65090[1-9]|65091\\d|650920)|^(65165[2-9]|6516[6-7]\\d)|^(65500\\d|65501\\d)|^(65502[1-9]|6550[3-4]\\d|65505[0-8])',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'carnet',
			typeName: 'Carnet',
			patterns: [2869,5022,5061,5062,5064,5887,6046,6063,6275,6363,6393,6394,6395],
			format: defaultFormat,
			regex_include: '^(286900|502275|506(199|2(0[1-6]|1[2-578]|2[289]|3[67]|4[579]|5[01345789]|6[1-79]|7[02-9]|8[0-7]|9[234679])|3(0[0-9]|1[1-479]|2[0239]|3[02-79]|4[0-49]|5[0-79]|6[014-79]|7[0-4679]|8[023467]|9[1234689])|4(0[0-8]|1[0-7]|2[0-46789]|3[0-9]|4[0-69]|5[0-79]|6[0-38]))|588772|604622|606333|627535|636(318|379)|639(388|484|559))',
			regex_exclude: '',
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'cabal',
			typeName: 'Cabal',
			patterns: [6042,6043,6271,6035,5896],
			regex_include: '^((627170)|(589657)|(603522)|(604((20[1-9])|(2[1-9][0-9])|(3[0-9]{2})|(400))))',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		},{
			type: 'visa',
			typeName: 'Visa',
			patterns: [4],
			regex_include: '^(4)',
			regex_exclude: '^((451416)|(438935)|(40117[8-9])|(45763[1-2])|(457393)|(431274)|(402934))',
			format: defaultFormat,
			length: [13, 16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'maestro',
			typeName: 'Master',
			patterns: [5018, 502, 503, 506, 56, 58, 639, 6220, 67],
			regex_include: '',
			regex_exclude: '',
			format: defaultFormat,
			length: [12, 13, 14, 15, 16, 17, 18, 19],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'mastercard',
			typeName: 'Master',
			patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
			regex_include: '^(5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$',
			regex_exclude: '^(514256|514586|526461|511309|514285|501059|557909|501082|589633|501060|501051|501016|589657|553839|525855|553777|553771|551792|528733|549180|528745|517562|511849|557648|546367|501070|601782|508143|501085|501074|501073|501071|501068|501066|589671|589633|588729|501089|501083|501082|501081|501080|501075|501067|501062|501061|501060|501058|501057|501056|501055|501054|501053|501051|501049|501047|501045|501043|501041|501040|501039|501038|501029|501028|501027|501026|501025|501024|501023|501021|501020|501018|501016|501015|589657|589562|501105|557039|542702|544764|550073|528824|522135|522137|562397|566694|566783|568382|569322|504363)',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'amex',
			typeName: 'Amex',
			patterns: [34, 37],
			regex_include: '^((34)|(37))',
			regex_exclude: '',
			format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
			length: [15],
			cvcLength: [3, 4],
			luhn: true
		}, {
			type: 'dinersclub',
			typeName: 'Diners',
			patterns: [30, 36, 38, 39],
			regex_include: '^(36)',
			regex_exclude: '',
			format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
			length: [14],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'discover',
			typeName: 'Discover',
			patterns: [6011,622,64,65],
			regex_include: '',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'jcb',
			typeName: 'Jcb',
			patterns: [35],
			regex_include: '',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'hiper',
			typeName: 'Hiper',
			patterns: [63],
			regex_include: '',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'hipercard',
			typeName: 'Hipercard',
			patterns: [38,60,6062,6370,6375,6376],
			regex_include: '^((606282)|(637095)|(637568)|(637599)|(637609)|(637612))',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}, {
			type: 'aura',
			typeName: 'Aura',
			patterns: [50],
			regex_include: '',
			regex_exclude: '',
			format: defaultFormat,
			length: [16],
			cvcLength: [3],
			luhn: true
		}
	];

	return {
		init: function() {
			this.registerCreditCardType();
		},
		cardFromNumber : function(num) {
			var card, p, pattern, _i, _j, _len, _len1, _ref;

			num = (num + '').replace(/\D/g, '');
			for (_i = 0, _len = cards.length; _i < _len; _i++) {
				card = cards[_i];

				let cardTypeFound = false;
				if (card.regex_include != '') {
					let regexIncludePattern = new RegExp(card.regex_include);

					if (regexIncludePattern.test(num)) {
						cardTypeFound = true;
					}
				}

				if (cardTypeFound) {

					if (card.regex_exclude == '') {
						return card;
					}

					let regexExcludePattern = new RegExp(card.regex_exclude);

					if (!regexExcludePattern.test(num)) {
						return card;
					}
				}

				_ref = card.patterns;
				for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
					pattern = _ref[_j];
					p = pattern + '';
					if (num.substr(0, p.length) === p) {
						return card;
					}
				}
			}
		},
		registerCreditCardType: function() {
			let self = this;

			$('body').on('keyup', '.braspag-card input[name ="payment[cc_number]"]', function(e) {

				e.preventDefault();
				let cardNumber = $(this).val();
				let card = self.cardFromNumber(cardNumber);

				if (card != undefined) {
					$('.creditcard-type').val("Braspag-"+card.typeName);
				}
			});

			$('body').on('keyup', '.braspag-debitcard input[name ="payment[cc_number]"]', function(e) {
				e.preventDefault();
				let cardNumber = $(this).val();
				let card = self.cardFromNumber(cardNumber);

				if (card != undefined) {
					$('.debitcard-type').val("Braspag-"+card.typeName);
				}
			});
		},

		forceRegisterCreditCardType: function(creditCardNumber, creditCardType) {

			let card = this.cardFromNumber(creditCardNumber);

			if (card === undefined) {
				$('input[name="payment[cc_number]').val('');
			}

			creditCardType.val("Braspag-"+card.typeName);
		},

		forceRegisterDebitCardType: function(debitCardNumber, debitCardType) {

			let card = this.cardFromNumber(debitCardNumber);

			if (card === undefined) {
				$('input[name="payment[cc_number]').val('');
			}

			debitCardType.val("Braspag-"+card.typeName);
		}
	};
} );

import update from 'immutability-helper';
import moment from 'moment';

export default class FormValidator {

    /**
     * Performs all validations on a field object, and adds errors if any.
     * @param {object} field - The field object to validate. Example: { value: '', touched: false, validations: { required: 'This field is required.' } }
     * @param {bool} checkTouched - Whether to check if the field has already been touched or not.
     * @return {object} The field object with validation errors added if any.
     */
    static getValidatedField(field, checkTouched = true) {

        let result, msg, re, { value } = field, isEnabled = false, isMessage = false;

        if (field !== undefined && field.validations && (!checkTouched || field.touched)) {

            for (let prop of Object.keys(field.validations)) {

                msg = field.validations[prop];
                isEnabled = msg === true || typeof msg === 'string' || typeof msg === 'function';
                isMessage = typeof msg === 'string';
                if (isEnabled) {
                    switch (prop) {
                        case 'required':
                            if (!value || value.length === 0) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'email':
                            re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                            if (value && !re.test(value)) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'password':
                            re = /^[0-9a-zA-Z]{8,}$/;

                            if (value && !re.test(value)) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'int':
                            if (value && value.length > 0 && (isNaN(value)
                                    || parseInt(Number(value)) !== +value
                                    || isNaN(parseInt(value, 10)))) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'nonZero':
                            if (parseFloat(value) == 0) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'bankAccount':
                            if (!/^[\sa-zA-Z0-9]+$/.test(value)) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'bic':
                            if (!/^[a-zA-Z0-9]{4}[a-zA-Z]{2}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/.test(value)) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'iban':
                            if (!/^[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[0-9]{14}$/.test(value)) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'mobile':
                            value = value.replace(" ", "");
                            if (value !== '') {
                                if (value.length !== 10) {
                                    result = { type: 'error' };
                                } else {
                                    let prefix = value.substr(0, 3);
                                    let phone = value.substr(4, 7);

                                    let nPrefix = parseInt(prefix);
                                    if (isNaN(nPrefix) || nPrefix < 83 || nPrefix > 89) {
                                        result = { type: 'error' };
                                    } else {
                                        let nPhone = parseInt(phone);
                                        if (isNaN(nPhone)) {
                                            result = { type: 'error' };
                                        }
                                    }
                                }
                            }
                            break;
                        case 'over18':
                            var m = moment(value, 'DD/MM/YYYY', true);
                            if (!m.isValid() || !m.isSameOrBefore(moment(new Date()).subtract(18, 'years'))) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'max11chars':
                            if (value && value.length > 11) {
                                result = { type: 'error' };
                            }
                            break;
                        case 'max7chars':
                            if (value && value.length > 7) {
                                result = { type: 'error' };
                            }
                            break;
                        default: 
                            if (typeof msg === "function") { // Is a custom validation function
                                var customFuncResult = msg(value);
                                if (customFuncResult === false || typeof customFuncResult === "string") {
                                    result = { type: 'error' };

                                    if (typeof customFuncResult === "string") {
                                        msg = customFuncResult;
                                        isMessage = true;
                                    }
                                }
                            } else {
                                console.error(`Validation '${prop}' not recognized.`);
                            }
                            break;
                    }
                    if (result) break;
                }
            }
        }

        let validatedField = field;
        if (result) {
            if (isMessage) {
                result.message = msg;
            }

            validatedField = update(field, {
                touched: { $set: true },
                error: { $set: result.type },
                errorMsg: { $set: result.message ? result.message : undefined }
            });
        } else {
            validatedField = update(field, {
                error: { $set: undefined },
                errorMsg: { $set: undefined }
            });
        }

        return validatedField;
    }
}
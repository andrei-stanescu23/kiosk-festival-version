'use strict'
const axios = require('axios')
/* eslint-disable */
const apiUrl = 'https://ironbank.network/proxy/kbit/'

export default {

    async verifyCode(user, code, amount) {
        let message = '';

        return await axios.post(apiUrl + 'wallet/transactionrequest/code/verify', {
            code: code,
            user: user,
            amount: amount
        }).then(response => {
            return response.data
        }).catch(error => {
            switch (error.response.data.meta.status) {
                case 409:
                    message = "Invalid Amount";
                    break;
                case 400:
                    message = "Invalid Code";
                    break;
                case 404:
                    message = "Invalid code or user";
                    break;
                default:
                    message = "Invalid QR code"
            }
            return { api_error: message }
        })
    },
    async consume(user, code, amount) {
        let message = '';

        return await axios.post(apiUrl + 'wallet/transactionrequest/code/consume', {
            code: code,
            user: user,
            amount: amount
        }).then(response => {
            return response.data
        }).catch(error => {
            switch (error.response.data.meta.status) {
                case 403:
                    message = "Code already used";
                    break;
                case 404:
                    message = "Invalid code or user";
                    break;
                default:
                    message = "Invalid request"
            }
            return { api_error: message }
        })
    },
    async deposit(user, amount) {
        let message = '';

        return await axios.post(apiUrl + 'wallet/action/deposit/atm', {
            user: user,
            amount: amount
        }).then(response => {
            return response.data
        }).catch(error => {
            switch (error.response.data.meta.status) {
                case 403:
                    message = "Code already used";
                    break;
                case 404:
                    message = "Invalid code or user";
                    break;
                default:
                    message = error.response.data.meta.status
            }
            return { api_error: message }
        })
    },

}
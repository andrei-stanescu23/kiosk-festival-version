'use strict'
const axios = require('axios');
/* eslint-disable */
const apiUrl = 'https://ironbank.network/proxy/kmerchant/'
const crypto = require('crypto')

export default {

    async getApiKey(email, atmUUID, password, location) {
        return await axios.post(apiUrl + 'atm/sync', {
            atmId: atmUUID,
            email: email,
            pass: crypto.createHash('sha256').update(password).digest("hex"),
            changepass: "false",
        }).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        });
    },

    async qrClaim(apiKey, atmId, userId, amount) {
        return await axios.post(apiUrl + 'atm/qrClaim', {
            apiKey: apiKey,
            atmId: atmId,
            userId: userId,
            amount: amount,
        }).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        });
    }
}
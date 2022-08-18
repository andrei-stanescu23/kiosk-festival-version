import axios from 'axios'

const apiUrl = 'http://localhost:3000/ict';

navigator.sayswho = (function () {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();
/* eslint-disable */

export default {

    async hardwareId() {
        return await axios.get(`${apiUrl}/hardware/id`, { timeout: 2000 })
            .then(response => {
                return response.data
            }).catch(error => {
                let browser = navigator.sayswho + Math.random;

                return { uniqueId: browser.replace(" ", "+") };
            })
    },

    async changeAutoSshPort(port) {
        return await axios.get(`${apiUrl}/change/phonehome/${port}`, { timeout: 1000 })
            .then(response => {
                return response.data
            }).catch(error => {
                return { error: error };
            })
    }
}
import axios from 'axios'


export default {

    async getIpInfo() {
        return await axios.get('https://ipinfo.io/json?token=868f0034b72144')
            .then(response => {
                return response.data
            })
    }
}
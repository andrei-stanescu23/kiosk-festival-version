import axios from 'axios'
/* eslint-disable */
import ict from "@/services/ict";
import api from "@/services/api";
const crypto = require("crypto");

const apiUrl = process.ENV == "development" ? 'https://ironbank.network/' : 'https://ironbank.network/'
/* eslint-disable */


export default {

    async fetchATMconfig(token, user) {
        const config = {
            timeout: 1000 * 10,
            headers: { Authorization: `Bearer ${token}` }
        };
        return await axios.get(apiUrl + 'configs?user=' + user, config).then(response => {
            return response.data
        }).catch(error => {
            if ( typeof error.response !== "undefined" )
                return { error: error.response.data }

            return { error: true };
        });
    },

    async reAuthAccount(strapi_uuid){

        let uuid = null;
        /* Get unique raspberry ID */
        uuid = await ict.hardwareId(); //{uniqueId: "57ee90a7491edceb757d2385b693f691" }//

        let remoteConfig = null;

        /* If raspberry uuid exists */
        if (uuid && uuid.hasOwnProperty("uniqueId")) {
          let { uniqueId } = uuid;

          /* Hash the uuid to create the password */
          let password = crypto
            .createHash("sha256")
            .update(uniqueId)
            .digest("hex");
    
            /* Re-authenticate with Strapi via user and pass */
            let auth = await this.authAccount(uniqueId, password)

            /* Extract fresh jwt */
            const { jwt } = auth;

             /* If jwt is defined */
            if ( typeof jwt !== "undefined"){
                
                /* Set new jwt in localStorage */
                localStorage.setItem("token", jwt);

                try{
                    /* Re-fetch ATM Config from Strapi */
                    remoteConfig = await this.fetchATMconfigByUuid(jwt, strapi_uuid);
                }
                catch(e){
                    console.log(e);
                }
            }
        }
        return remoteConfig

    },

    async fetchATMconfigByUuid(token, user) {

        const config = {
            timeout: 1000 * 10,
            headers: { Authorization: `Bearer ${token}` }
        };
        return await axios.get(apiUrl + 'configs?uuid=' + user, config).then(async (response) => {
            return response.data
            
            
        }).catch( async (error) => {

            // try {
            //     const uuid = await ict.hardwareId();
            //     console.log("Before if")

            //     if (uuid && uuid.hasOwnProperty("uniqueId")) {
            //         let { uniqueId } = uuid;
    
            //         let password = crypto
            //             .createHash("sha256")
            //             .update(uniqueId)
            //             .digest("hex");
            //         let auth = await this.authAccount(user, password)
    
            //         const { jwt, user } = auth;
    
            //         console.log("Changed jwt")
            //         console.log(token);
            //         console.log(jwt);

            //         localStorage.setItem("token", jwt);
            //     }
            // }
            // catch(e){
            //     //todo
            // }
           
            if ( typeof error.response !== "undefined" )
                return { error: error.response.data }

            return { error: true };
        });
    },

    async fetchApiKey(id) {
        return await axios.get(apiUrl + 'configs/' + id).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        });
    },

    async registerAccount(user, email, password) {
        return await axios.post(apiUrl + 'auth/local/register', {
            username: email,
            email: user + "@ironbank.network",
            password: password
        }).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        });
    },

    async registerDevice(u, boeSN, sn) {

        return await axios.post(apiUrl + 'configs', {
            user: u.id,
            boeSN: boeSN,
            sn: sn
        }).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        });
    },

    async authAccount(user, password) {
        return await axios.post(apiUrl + 'auth/local', {
            identifier: user + "@ironbank.network",
            password: password,
        }).then(response => {
            return response.data
        }).catch(error => {
            return { error: error.response.data }
        }); 
    },

    async reportConfig(sn, phonehome, softwareVersion, configError) {


        const config = {
            timeout: 1000 * 10,
        };
        // return await axios.post("http://localhost:1337/updateDevice", {
        return await axios.post("https://api.aeolus.ro/updateDevice", {
            sn: sn,
            phonehome: phonehome,
            timestamp : new Date(),
            softwareVersion : softwareVersion,
            configError: configError
        }, {
            headers: {"Access-Control-Allow-Origin": "*"}
          }
          ).then(response => {
            return response.data
        }).catch(error => {
            if ( typeof error.response !== "undefined" )
                return { error: error.response.data }

            return { error: true };
        });    
    },
}
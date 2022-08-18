<template>
	<v-container v-if="loading">
		<div class="text-xs-center">
			<v-progress-circular
				indeterminate
				:size="150"
				:width="8"
				color="green"
			></v-progress-circular>
		</div>
	</v-container>

	<v-container v-else fluid class="text-xs-center" grid-list-xl>
		<v-flex xs12 class="text-xs-center p-0">
			<div class="zici-cai-video">
				<video
					ref="videoRef"
					src=""
					id="video-container"
					width="960"
					loop
					autoplay="true"
					muted="muted"
				></video>
			</div>
		</v-flex>
		<v-flex xs12 class="text-xs-center ">
			<h1 class="display-3 text-xs-center mt-5 " style="color:#FFC91C">
				Out of battery?
				<br />
				Rent a power bank
			</h1>

			<v-flex
				xs12
				class="mt-5 text-xs-center d-flex mx-auto  height-content"
			>
				<p
					class="d-flex justify-center align-center widht-equal flex-column"
					style="color:white"
				>
					Only<span style="color:#FFC91C">
						0.2 EUR/h
					</span>
				</p>
				<vue-qrcode
					v-if="boeSn"
					:widht="fit - content"
					:value="boeSn"
				/>
				<p
					class="d-flex justify-center align-center widht-equal"
					style="color:white"
				>
					First
					<span style="color:#FFC91C">5 min FREE</span>
				</p>
			</v-flex>
			<h3 xs12 md6 class="text-xs-center" style="color:white">
				We invite you to rent a Bank of Energy power bank. You can
				charge any electronic device wherever you want.
				<br />
				You can return the power bank at any Bank of Energy station.
			</h3>
		</v-flex>
	</v-container>
</template>

<script>
import api from "@/services/api"
import ict from "@/services/ict"

import VueQrcode from "vue-qrcode"

export default {
	components: {
		VueQrcode,
	},
	data() {
		return {
			loading: false,
			error: false,
			errorMessage: null,
			destroyed: true,
			videoUrl: null,
			boeSn: null,
			timer: null,
		}
	},
	async mounted() {
		this.loading = true

		/* Set software version */
		let softwareVersion = "v2.1.0"

		/* Try to retrieve elements stored in localStorage */
		const jwt = localStorage.getItem("token")
		const uuid = localStorage.getItem("config_uuid")
		const localUrl = localStorage.getItem("rentboxURL")

		/* Get ATM Config from Strapi using jwt and uuid */
		const remoteConfig = await api.fetchATMconfigByUuid(jwt, uuid)

		/* If ATM Config has been retrieved successfully */
		if (!remoteConfig.error) {
			/* Extract Serial Number and SSH Port */
			const { sn, phonehome } = remoteConfig[0]

			/* Set rentboxURL in localStorage */
			const rentboxURL = `https://s.bankofbats.com/sw/app/rentbox/show.html?deviceId=${sn}`
			localStorage.setItem("rentboxURL", rentboxURL)

			/* Every 5 minutes - app will send heartbeat to Statistics Server */
			this.timer = setInterval(async () => {
				await api.reportConfig(sn, phonehome, softwareVersion, "ok")
			}, 300000)

			/* Init heartbeat to Statistics Server */
			try {
				await api.reportConfig(sn, phonehome, softwareVersion, "ok")
			} catch (e) {
				//todo
			}

			/* If the SSH port received from Strapi exists, set it */
			if (phonehome != null) {
				try {
					await ict.changeAutoSshPort(phonehome)
				} catch (e) {
					//todo
				}
			}

			this.boeSn = rentboxURL
		} else {
			/* If ATM Config has NOT been retrieved successfully */
			/* Retrieved cached localURL for QR generation */
			this.boeSn = localUrl
			this.loading = false

			/* Init the remote configuration */
			let remoteConfig = null

			/* Attempt to re-authenticate with Strapi */
			try {
				remoteConfig = await api.reAuthAccount(uuid)
			} catch (e) {
				this.loading = false
			}

			/* If the re-auth is successful and remoteConfig is correct */
			if (remoteConfig !== null && !remoteConfig.error) {
				/* Retrieve Serial Number and SSH port */
				const { sn, phonehome } = remoteConfig[0]

				/* Every 5 minutes - app will send heartbeat to Statistics Server */
				this.timer = setInterval(async () => {
					await api.reportConfig(sn, phonehome, softwareVersion, "ok")
				}, 300000)

				/* Init heartbeat to Statistics Server */
				try {
					await api.reportConfig(sn, phonehome, softwareVersion, "ok")
				} catch (e) {
					//todo
				}
			} else {
				/* If re-auth is unsuccessful again */
				try {
					/* Set Serial Number based on cache */
					let sn = localUrl.split("deviceId=")[1]

					/* Report ERROR to Statistics Server every 5 minutes */
					this.timer = setInterval(async () => {
						await api.reportConfig(
							sn,
							0,
							softwareVersion,
							"config_error"
						)
					}, 300000)

					/* Init heartbeat ERROR to Statistics Server */
					try {
						await api.reportConfig(
							sn,
							0,
							softwareVersion,
							"config_error"
						)
					} catch (e) {
						//todo
					}
				} catch (e) {
					//todo
				}
			}

			// if ( localUrl === null ){
			//     const rentboxURL = `https://s.bankofbats.com/sw/app/rentbox/show.html?deviceId=${sn}`;
			//     localStorage.setItem("rentboxURL", rentboxURL);
			// }
		}

		/* POST in Strapi - verific la ce asset trebuie sa dau play */

		/* Verific daca am asset-ul downloadat local */

		/* Daca nu, downloadez din strapi de pe ruta /uploads/blabla */

		/* Daca da, dau play la video */

		this.loading = false
		this.$refs.videoRef.src = await require("@/assets/boe_motogp.mp4")
		this.$refs.videoRef.play()
	},
	methods: {},
}
</script>

<style lang="stylus" scoped>
.theme--dark.application {overflow:hidden;}
  a {
    text-decoration: none;
  }

span{
  font-weight: 900;
}
  .v-progress-circular {
    margin: 1rem;
  }
.widht-equal{
  width:310px;
  color:#000;
  font-size:3.5rem;
  margin-top:auto;
  margin-bottom auto;
  flex-direction:column;

  }
  h1{
    font-family: proxima-nova, sans-serif !important;
    font-weight: 900;
    font-style: normal;
  }

.container{padding: 0 !important}
  h3{
    font-family: proxima-nova, sans-serif !important;
    font-weight: 400;
    font-style: normal;
    padding:0 3rem;
    font-size: 1.7rem;
    width: 75%;
    margin: 3rem auto;
  }
  .zici-cai-video{
    margin-top:-70px
  }
  #video-container{
    width:100%;
  overflow :hidden;
}
</style>

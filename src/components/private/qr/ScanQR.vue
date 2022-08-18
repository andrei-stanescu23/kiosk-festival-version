<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap>
      <v-flex xs12>
        <v-alert v-if="error" :value="true" class="mb-4" type="error">{{ error }}</v-alert>
        <qrcode-stream @decode="onDecode" :track="paintBlueDots" @init="onInit">
          <div class="text-xs-center" v-if="loading">
            <v-progress-circular indeterminate :size="150" :width="8" color="green"></v-progress-circular>
          </div>
        </qrcode-stream>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
/* eslint-disable */

import { QrcodeStream } from "vue-qrcode-reader";

export default {
  name: "ScanQR",
  components: { QrcodeStream },

  data() {
    return {
      result: "",
      error: "",
      loading: false,
      destroyed: false
    };
  },
  methods: {
    paintBlueDots(location, ctx) {
      const {
        topLeftFinderPattern,
        topRightFinderPattern,
        bottomLeftFinderPattern
      } = location;

      const pointArray = [
        topLeftFinderPattern,
        topRightFinderPattern,
        bottomLeftFinderPattern
      ];

      ctx.fillStyle = "#f46036";

      pointArray.forEach(({ x, y }) => {
        ctx.fillRect(x - 5, y - 5, 10, 10);
      });
    },

    onDecode(result) {
      this.result = result;
      this.$emit("qrScan", result);
    },

    async onInit(promise) {
      this.loading = true;
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: Stream API is not supported in this browser";
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
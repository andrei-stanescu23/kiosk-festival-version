<template>
  <v-container v-if="loading">
    <div class="text-xs-center">
      <v-progress-circular indeterminate :size="150" :width="8" color="green"></v-progress-circular>
    </div>
  </v-container>

  <v-container v-else grid-list-xl fluid>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-layout row wrap>
        <v-flex xs12>
          <h1 class="display-2 mt-2 primary--text">QR code Value: {{ amount }} BUNV</h1>
          <v-alert
            :value="error"
            class="mb-2 mt-2 elevation-20"
            type="info"
          >{{ error }}, please contact KaratBit to help generate a valid QR Code</v-alert>
        </v-flex>
        <v-layout row wrap>
          <v-flex xs12>
            <p class="headline pa-3">
              You are purchasing:
              <span class="primary--text">{{ this.cards[0].title }}</span> for the amount of
              <span class="primary--text">{{ amount }} BUNV</span>. If you agree with this transaction please check 'I agree with terms and conditions of the transactions' and hit the 'Next Step' button.
            </p>
          </v-flex>

          <v-checkbox
            class="ml-3"
            v-model="checkbox"
            value="false"
            label="I agree with terms and conditions of the transactions."
            data-vv-name="checkbox"
            type="checkbox"
            :rules="[v => !!v || 'You must agree to continue!']"
            required
          ></v-checkbox>
        </v-layout>
      </v-layout>
    </v-form>
    <v-footer fixed bottom class="mb-4" style="background-color:transparent">
      <v-layout row wrap>
        <v-flex xs6 class="pl-4">
          <router-link :to="{name: 'Dashboard' }">
            <v-btn large color="info">
              <v-icon left dark>arrow_back</v-icon>Go back
            </v-btn>
          </router-link>
        </v-flex>
        <v-flex xs6 class="text-xs-right pr-4">
          <v-btn large :disabled="!valid" @click="validate" color="success">
            Next Step
            <v-icon right dark>arrow_forward</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-container>
</template>

<script>
/* eslint-disable */
import api from "@/services/api";
import kbit from "@/services/kbit";

import ScanQR from "@/components/private/qr/ScanQR";
import Packages from "@/components/private/partials/Packages";

export default {
  name: "FiatKashGold",
  components: { ScanQR, Packages },
  data() {
    return {
      loading: true,
      cards: [],
      valid: false,
      selected: null,
      error: false,
      nameRules: [
        v => !!v || "Username is required",
        v => (v && v.length >= 5) || "Username must be at least 5 characters"
      ],
      checkbox: false,
      dialog: false,
      username: null,
      amount: null,
      code: null
    };
  },
  async mounted() {
    let cards = await api.getBundles();

    this.loading = false;
    const { qrCode } = this.$route.params;
    if (!qrCode) {
      this.$router.push({ name: "Dashboard" });
    } else {
      const amount = qrCode.amount / 100000;
      this.username = qrCode.user;
      this.amount = amount;
      this.cards = cards.filter(item => item.quantity == amount);
      this.code = qrCode.code;
      this.qrCode = qrCode;
    }
  },
  methods: {
    async validate() {
      if (this.$refs.form.validate()) {
        if (this.username && this.amount && this.code && this.checkbox) {
          const verifyCode = await kbit.verifyCode(
            this.username,
            this.code,
            this.amount * 100000
          );

          if (verifyCode.hasOwnProperty("api_error")) {
            this.error = verifyCode.api_error;
            return false;
          } else {
            this.$router.push({
              name: "QRCashOut",
              params: {
                username: this.username,
                code: this.code,
                amount: this.amount,
                option: this.cards[0]
              }
            });
          }
        }
        this.error = "You have to agree to terms in order to continue";
        return false;
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
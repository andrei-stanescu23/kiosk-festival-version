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
          <h1 class="display-2 mb-3 mt-2 primary--text">{{ step }}</h1>
          <v-alert
            :value="error"
            class="mb-2 elevation-20"
            type="info"
          >Before you continue please make sure you have your KaratBit username, the ATM does not give spare</v-alert>
        </v-flex>
        <v-flex v-for="item in cards" :key="item.id" xs2>
          <v-card
            v-on:click="onSelect(item.id)"
            v-ripple
            v-bind:class="{ 'cards': selected != item.id, 'activeCards':  selected == item.id, 'elevation-24': selected != item.id}"
            class="mb-2"
          >
            <v-layout align-end fill-height pa-4 white--text>
              <h1 class="font-weight-bold display-1 primary--text">{{ item.title }}</h1>
            </v-layout>
            <v-card-title>
              <v-flex xs6 class="subheading pa-0">{{ item.description }}</v-flex>
              <v-flex xs6 class="subheading text-xs-right pa-0">Price: {{ item.price }} USD</v-flex>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-layout row wrap v-if="selected">
          <v-flex xs12>
            <v-divider class="elevation-5 primary mb-2 ma-2"></v-divider>
          </v-flex>
          <v-flex xs6>
            <h2 class="display-1 primary--text mb-3 ml-3">KaratBit Account Username</h2>
            <v-card class="cards ml-3 elevation-24 pa-3">
              <v-text-field
                class="mb-2 mt-3"
                v-model="qrScanResult"
                :rules="nameRules"
                hint="Username to to credit your account with the remaining funds"
                label="Username"
                box
                append-icon="select_all"
                @click:append="scan"
              ></v-text-field>
              <p
                class="mt-5 subheading"
              >NOTE: The ATM does not return spare change, if you do not not have the right amount you must have a valid Karatbit account where your remanding amount will be deposited as BUNV (Bonus Unival)</p>
            </v-card>
          </v-flex>
          <v-flex xs6>
            <h2 class="display-1 primary--text mb-3">Help</h2>
            <v-card class="cards elevation-24 mr-3 pa-3">
              <v-layout row wrap align-start>
                <v-flex xs6>
                  <v-img
                    class="white--text"
                    width="380px"
                    :src="require('@/assets/karatbit-animation.gif')"
                  ></v-img>
                </v-flex>
                <v-flex xs6>
                  <p>You can access your KaratBit Account from your phone and go to the top right corner, click on your username and a QR code will pop up.</p>
                  <p>Click on 'Scan Icon' on the left and your username, scan the QR code from KaratBit and it will be automatically filled.</p>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-divider class="elevation-5 primary ma-2"></v-divider>
          </v-flex>
          <v-flex xs6>
            <v-checkbox
              class="ml-3"
              v-model="checkbox"
              value="false"
              label="I agree with terms and conditions of the transactions"
              data-vv-name="checkbox"
              type="checkbox"
              :rules="[v => !!v || 'You must agree to continue!']"
              required
            ></v-checkbox>
          </v-flex>
          <v-flex xs6 class="text-xs-right pr-4">
            <v-btn large :disabled="!valid" @click="validate" class="success mr-3">Next Step</v-btn>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-form>
  </v-container>
</template>

<script>
/* eslint-disable */
import api from "@/services/api";
import ScanQR from "@/components/private/qr/ScanQR";

export default {
  name: "FiatKashGold",
  components: { ScanQR },
  data() {
    return {
      loading: true,
      cards: [],
      valid: false,
      selected: null,
      error: false,
      step: "Chose an amount",
      op: {},
      nameRules: [
        v => !!v || "Username is required",
        v => (v && v.length >= 5) || "Username must be at least 5 characters"
      ],
      checkbox: false,
      dialog: false,
      qrScan: null,
      qrScanResult: null
    };
  },
  async mounted() {
    this.cards = await api.getBundles();
    this.loading = false;
  },
  methods: {
    onSelect(i) {
      this.selected = i;
      this.op = this.cards.filter(item => item.id == i);
      this.step = `Buying: ${this.op[0].title}`;
    },
    scan() {
      this.dialog = true;
    },
    submit(value) {
      // TO DO verify username is correct
      this.qrScanResult = value;
      this.dialog = false;
    },

    async validate() {
      if (this.$refs.form.validate()) {
        if (this.qrScanResult && this.checkbox) {
          this.$router.push({ path: '/fiat/escrow', params: { qrScanResult: this.qrScanResult, bundle: this.op[0] }})
        }
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
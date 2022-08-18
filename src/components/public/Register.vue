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

  <v-container v-else fluid class="mt-3" grid-list-xl>
    <v-layout align-center justify-center row>
      <v-flex xs12 md10>
        <v-alert
          class="mt-3 mb-3"
          v-if="error"
          v-model="alert"
          dismissible
          type="error"
          >{{ error }}</v-alert
        >
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-center>
      <v-flex xs12 md8>
        <v-card
          v-on:click="onSelect(1)"
          v-ripple
          outlined
          v-bind:class="{
            cards: selected != 1,
            activeCards: selected == 1,
            'elevation-15': selected != 1,
          }"
        >
          <v-img
            max-height="400px"
            :src="require('@/assets/network.jpg')"
            aspect-ratio="1"
          ></v-img>
          <v-layout align-end fill-height pa-4>
            <h2
              class="font-weight-light primary--text"
              :class="{ 'display-2': $vuetify.breakpoint.mdAndUp }"
            >
              Inregistreaza ATM
            </h2>
          </v-layout>
          <v-card-title>
            <div class="subheading">
              Acest ATM nu a fost gasit in baza de date, pentru inregistrare
              apasa aici.
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn large color="background" v-bind:disabled="selected == 1"
              >Start</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout align-center justify-center row fill-height>
      <v-flex xs12 md6>
        <vue-touch-keyboard
          :options="options"
          v-if="visible"
          :layout="layout"
          :cancel="hide"
          :accept="accept"
          :input="input"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
/* eslint-disable */

export default {
  name: "Register",
  data() {
    return {
      wholeResponse: [],
      loading: false,
      valid: false,
      email: "",
      destroyed: false,
      input: null,
      hardwareId: null,
      selected: null,
      dialog: false,
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+/.test(v) || "E-mail must be valid",
      ],
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 8 || "Min 8 characters",
      ],
      rePassword: "",
      rePasswordRules: [
        (v) => !!v || "You must confirm your password",
        (v) => v == this.password || "Passwords must match",
      ],
      checkbox: false,
      show1: false,
      show2: false,
      error: false,
      alert: false,
      visible: false,
      layout: "normal",
      options: {
        useKbEvents: false,
      },
    };
  },
  async mounted() {
    this.valid = false;
  },
  methods: {
    deselect() {
      this.destroyed = true;
      this.selected = null;
      this.dialog = false;
    },
    onSelect(i) {
      this.destroyed = false;
      this.selected = i;
      this.$router.push({ name: "RegisterPassword" });
    },
    verifyQR(value) {
      this.loading = true;
      const string = JSON.parse(value);
      if (
        string &&
        string.hasOwnProperty("email") &&
        string.hasOwnProperty("cmd") &&
        string.cmd == "atmSync"
      ) {
        let goTo = this.selected;
        this.deselect();
        this.error = false;
        this.loading = false;
        this.$router.push({
          name: goTo == 1 ? "RegisterPassword" : "Login",
          params: { qrCode: string },
        });
      } else {
        this.deselect();
        this.loading = false;
        this.alert = true;
        this.error =
          "Invalid QR code, please make sure you log into your K-Merchant account and select the right QR";
      }
    },
    accept(text) {
      this.hide();
    },
    showKeyboard(e) {
      this.input = e.target;
      this.layout = e.target.dataset.layout;

      if (!this.visible) this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    next() {
      let inputs = document.querySelectorAll("input");
      let found = false;
      [].forEach.call(inputs, (item, i) => {
        if (!found && item == this.input && i < inputs.length - 1) {
          found = true;
          this.$nextTick(() => {
            inputs[i + 1].focus();
          });
        }
      });
      if (!found) {
        this.input.blur();
        this.hide();
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
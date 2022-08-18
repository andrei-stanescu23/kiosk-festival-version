<template>
  <v-container v-if="loading">
    <div class="text-xs-center">
      <v-progress-circular indeterminate :size="150" :width="8" color="green"></v-progress-circular>
    </div>
  </v-container>

  <v-container v-else fluid class="mt-3" grid-list-xl>
    <v-layout align-center justify-center row fill-height>
      <v-flex xs12 md4>
        <h1 class="display-2 primary--text text-xs-center mb-3">Log In</h1>
        <p class="text-xs-center">Submit your password to enter mentainance mode</p>
        <v-alert
          class="mt-3 mb-3"
          v-if="error"
          v-model="alert"
          dismissible
          type="error"
        >{{ error.message }}</v-alert>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card class="cards mb-2 pa-5 elevation-24">
            <v-text-field
              class="mb-2"
              v-model="password"
              :append-icon="show1 ? 'visibility' : 'visibility_off'"
              :rules="passwordRules"
              :type="show1 ? 'text' : 'password'"
              name="password"
              label="Password"
              @click:append="show1 = !show1"
              box
              @focus="show"
              :data-layout="layout"
            ></v-text-field>
          </v-card>
        </v-form>
        <v-btn :disabled="!valid" large color="success" @click="validate">Log In</v-btn>
      </v-flex>
    </v-layout>
    <v-layout align-center justify-center row fill-height>
      <v-flex xs12 md4>
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
import api from "@/services/api";

export default {
  data() {
    return {
      valid: false,
      password: "",
      passwordRules: [
        v => !!v || "Password is required",
        v => v.length >= 8 || "Min 8 characters"
      ],
      checkbox: false,
      show1: false,
      show2: false,
      error: false,
      alert: false,
      loading: false,
      input: null,
      visible: false,
      layout: "normal",
      options: {
        useKbEvents: false,
        preventClickEvent: false
      }
    };
  },
  mounted() {
    this.valid = false;
    const { qrCode } = this.$route.params;
    if (!qrCode) {
      this.$router.push({ name: "Dashboard" });
    } else {
      this.email = qrCode.email;
    }
  },
  methods: {
    accept() {
      this.hide();
    },

    show(e) {
      this.input = e.target;
      this.layout = e.target.dataset.layout;

      if (!this.visible) this.visible = true;
    },

    hide() {
      this.visible = false;
    },

    async validate() {
      this.hide();
      this.loading = true;
      if (this.$refs.form.validate()) {
        const auth = await api.authAccount(this.email, this.password);
        if (auth.error) {
          this.alert = true;
          this.error = auth.error;
          this.loading = false;
        } else {
          const { jwt, user } = auth;
          const config = await api.fetchATMconfig(jwt, user);
          if (config) {
            localStorage.setItem("token", jwt);
            localStorage.setItem("config_uuid", config[0].id);
            this.$router.push({ name: "Dashboard" });
            this.loading = false;
          } else {
            this.alert = true;
            this.error = {
              message: "Invalid CEM configuration, please register a new device"
            };
            this.loading = false;
          }
        }
      } else {
        this.alert = true;
        this.error = {
          message: "Please complete both fields to authenticate your device!"
        };
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
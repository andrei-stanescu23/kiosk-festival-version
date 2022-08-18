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
    <v-layout align-center justify-center row fill-height>
      <v-flex xs12 md8>
        <h1 class="display-1 text-xs-center black--text mb-3">
          Inregistrare ATM
        </h1>
        <p xs12 md6 class="text-xs-center">CryptoDATA >> Bank of Energy</p>
        <v-alert
          class="mt-3 mb-3"
          v-if="error"
          v-model="alert"
          dismissible
          type="error"
          >{{ error.message ? error.message : error }}</v-alert
        >
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-card class="cards mb-2 pa-5 elevation-15">
            <v-tooltip bottom max-width="700px">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  class="mb-2 password"
                  v-model="password"
                  :append-icon="show1 ? 'visibility' : 'visibility_off'"
                  :rules="passwordRules"
                  :type="show1 ? 'text' : 'password'"
                  name="password"
                  label="ATM Factory Serial Number"
                  hint="Serial Number de pe placuta stantat in fabrica, Exemplu: BOE0191"
                  counter
                  @click:append="show1 = !show1"
                  box
                  @focus="showKeyboard"
                  :data-layout="layout"
                ></v-text-field>
              </template>
              <span
                >Serial Number de pe placuta stantat in fabrica, Exemplu:
                BOE0191</span
              >
            </v-tooltip>
            <v-tooltip bottom max-width="700px">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-model="rePassword"
                  :append-icon="show2 ? 'visibility' : 'visibility_off'"
                  :rules="rePasswordRules"
                  :type="show2 ? 'text' : 'password'"
                  name="rePassword"
                  label="ATM Serial Number"
                  hint="Serial Number din reteaua Bank of Energy, Exemplu: 20000191"
                  counter
                  @click:append="show2 = !show2"
                  box
                  @focus="showKeyboard"
                  :data-layout="layout"
                ></v-text-field>
              </template>
              <span
                >Serial Number din reteaua Bank of Energy, Exemplu:
                20000191</span
              >
            </v-tooltip>
          </v-card>
          <v-btn
            :disabled="!valid"
            large
            color="success"
            @click="validate"
            class="elevation-15"
            >Submit</v-btn
          >
        </v-form>
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
import ict from "@/services/ict";
import api from "@/services/api";
const crypto = require("crypto");

export default {
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
      password: "",
      passwordRules: [
        (v) => !!v || "Este necesar introducerea acestui camp",
        (v) => v.length == 7 || "Acest camp trebuie sa aibe fix 7 caractere",
      ],
      rePassword: "",
      rePasswordRules: [
        (v) => !!v || "Este necesar introducerea acestui camp",
        (v) => v.length == 8 || "Acest camp trebuie sa aibe fix 8 cifre",
      ],
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
    async registerDevice(register) {
      const { user, jwt } = register;
      const config = await api.registerDevice(
        user,
        this.password,
        this.rePassword
      );
      if (config.error) {
        this.loading = false;
        this.alert = true;
        this.error = register.error;
      } else {
        localStorage.setItem("token", jwt);
        localStorage.setItem("config_uuid", config.uuid);
        this.$router.push({ name: "Dashboard" });
        this.loading = false;
      }
    },
    deselect() {
      this.destroyed = true;
      this.selected = null;
      this.dialog = false;
    },
    onSelect(i) {
      this.destroyed = false;
      this.selected = i;
      this.dialog = true;
    },
    async validate() {
      this.loading = true;
      if (this.visible) this.visible = false;
      if (this.$refs.form.validate()) {
        const uuid = await ict.hardwareId();
        if (uuid && uuid.hasOwnProperty("uniqueId")) {
          let { uniqueId } = uuid;

          let password = crypto
            .createHash("sha256")
            .update(uniqueId)
            .digest("hex");
          const register = await api.registerAccount(
            uniqueId,
            uniqueId,
            password
          );
          if (register.error) {
            const authOld = await api.authAccount(uniqueId, password);
            if (authOld.error) {
              this.loading = false;
              this.alert = true;
              this.error = authOld.error;
            } else {
              const { user, jwt } = authOld;
              const config = await api.fetchATMconfig(jwt, user.id);
              const { uuid } = config[0];

              localStorage.setItem("token", jwt);
              localStorage.setItem("config_uuid", uuid);
              this.$router.push({ name: "Dashboard" });
              this.loading = false;
            }
          } else {
            this.registerDevice(register);
          }
        } else {
          this.loading = false;
          this.alert = true;
          this.error = "Eroare conectare micro servicii.";
        }
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
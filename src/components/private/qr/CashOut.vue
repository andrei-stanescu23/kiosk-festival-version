<template>
  <v-container v-if="loading">
    <div class="text-xs-center">
      <v-progress-circular indeterminate :size="150" :width="8" color="green"></v-progress-circular>
    </div>
  </v-container>

  <v-container v-else fluid class="mt-5" grid-list-xl>
    <v-layout v-if="error" align-center justify-center row fill-height>
      <v-flex xs12>
        <v-alert
          :value="error"
          class="mb-2 elevation-5"
          type="error"
        >There is a problem releasing your KaratBars CashGold Items. Error: {{ errorMessage }}</v-alert>
      </v-flex>
    </v-layout>
    <v-layout v-if="!error" align-center justify-center row fill-height>
      <v-flex xs12>
        <h1
          class="font-weight-light display-3 primary--text mb-5 text-xs-center"
        >Thank you for your order!</h1>
      </v-flex>
    </v-layout>
    <v-layout v-if="!error" align-center justify-center row fill-height>
      <v-flex xs6>
        <v-card color="cards elevation-24">
          <v-card-title>
            <h4 class="font-weight-light headline primary--text">Transaction Summary</h4>
          </v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-tile class="pa-2">
              <v-list-tile-content class="font-weight-light subheading">Purchasing:</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ bundle.title }}</v-list-tile-content>
            </v-list-tile>
            <!--
            <v-list-tile class="pa-2">
              <v-list-tile-content class="font-weight-light subheading">Price:</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ bundle.price }} EUR</v-list-tile-content>
            </v-list-tile>
            -->
            <v-list-tile class="pa-2">
              <v-list-tile-content class="font-weight-light subheading">QR Code:</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ code }}</v-list-tile-content>
            </v-list-tile>
            <!--
            <v-list-tile class="pa-2">
              <v-list-tile-content class="font-weight-light subheading">QR Value:</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ amount }} BUNV</v-list-tile-content>
            </v-list-tile>
            -->
            <v-list-tile v-if="deposit" class="pa-2">
              <v-list-tile-content
                class="font-weight-light subheading"
              >BUNV deposit in your Karatbit account</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ deposit }} BUNV</v-list-tile-content>
            </v-list-tile>
            <v-list-tile class="pa-2">
              <v-list-tile-content class="font-weight-light subheading">Cash Out Method</v-list-tile-content>
              <v-list-tile-content class="align-end headline">{{ method }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="!error" align-center justify-center row fill-height>
      <v-flex xs6>
        <p
          class="font-weight-light text-xs-center"
        >Please make sure you take your KaratBars Item from the ATM tray. If you have any spare change your KaratBit Account will receive a BUNV deposit.</p>
      </v-flex>
    </v-layout>
    <v-footer fixed bottom class="mb-4" style="background-color:transparent">
      <v-layout row wrap>
        <v-flex xs6 class="pl-4">
          <router-link :to="{name: 'Dashboard' }">
            <v-btn large color="info">
              <v-icon left dark>arrow_back</v-icon>Go back
            </v-btn>
          </router-link>
        </v-flex>
        <v-flex xs6 class="text-xs-right"></v-flex>
      </v-layout>
    </v-footer>
  </v-container>
</template>

<script>
/* eslint-disable */
import api from "@/services/api.js";
import ict from "@/services/ict.js";
import kbit from "@/services/kbit.js";
import kmerchant from "@/services/kmerchant.js";

export default {
  data() {
    return {
      bundle: "",
      loading: true,
      username: null,
      code: null,
      amount: null,
      total: null,
      rest: null,
      method: null,
      deposit: false,
      error: false,
      errorMessage: null
    };
  },
  async mounted() {
    if (!this.$route.params.option) {
      this.$router.push({ name: "Dashboard" });
    } else {
      this.bundle = this.$route.params.option;
      this.username = this.$route.params.username;
      this.code = this.$route.params.code;
      this.amount = this.$route.params.amount;
      this.method = "KaratBars Cash Gold Items";
      this.deposit = this.amount - this.bundle.quantity;

      const machine = {
        released: null,
        error: true,
        errorMsg: null
      };

      let qty = this.bundle.quantity;

      window.WebSocket = window.WebSocket || window.MozWebSocket;
      var connection = new WebSocket("ws://localhost:8082/");

      async function sendPoll() {
        return sendCommands({ cmd: "poll" });
      }

      async function dispenseAmount(qty) {
        return sendCommands({ cmd: "dispense", params: qty });
      }

      async function wait(time) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, time);
        });
      }

      function sendCommands(data) {
        let json = JSON.stringify(data);
        connection.send(json);
      }

      connection.onopen = async function() {
        await sendPoll();
        await wait(200);
        if (machine.error == false) {
          await dispenseAmount(qty);
        }
      };

      connection.onerror = function(error) {
        machine.errorMsg = "'Dispenser H404'";
      };

      connection.onmessage = function(message) {
        let response = JSON.parse(message.data);
        if (response.cmd == "status" && response.reply == "ready") {
          machine.error = false;
        } else if (response.cmd == "status" && response.status == "error") {
          machine.errorMsg = response.reply;
        } else if (response.cmd == "dispense" && response.status == "nck") {
          machine.errorMsg = response.error;
        } else if (response.cmd == "dispense" && response.status == "ack") {
          machine.released = response.bills;
        }
      };

      await wait(qty * 800 + 200);

      if (machine.error == true) {
        this.error = true;
        this.errorMessage = machine.errorMsg;
        this.loading = false;
      } else {
        if (machine.released == this.bundle.quantity) {
          const uuid = localStorage.getItem("config_uuid");
          const token = localStorage.getItem("token");
          const config = await api.fetchApiKey(uuid, token);

          const apiKey = config.api_key;
          const atmId = config.local_uuid;

          const merchantConsume = await kmerchant.qrClaim(
            apiKey,
            atmId,
            this.username,
            this.amount
          );

          if (this.deposit > 0) {
            const deposit = await kbit.deposit(
              this.username,
              this.deposit * 100000
            );
            if (deposit.hasOwnProperty("api_errors")) {
              this.alert = true;
              this.error = deposit.api_error;
            } else {
              await kbit.consume(this.username, this.code, this.amount);
              this.loading = false;
            }
          } else {
            await kbit.consume(this.username, this.code, this.amount);
            this.loading = false;
          }
        } else {
          this.error = true;
          this.errorMessage = "'Dispenser E403'";
          this.loading = false;
        }
      }
    }
  }
};
</script>


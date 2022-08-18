<template>
  <v-layout row wrap>
    <v-flex v-for="item in cards" :key="item.id" xs3>
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
          <v-flex xs6 class="subheading pa-0">{{ (item.quantity*0.1).toFixed(1) }}g</v-flex>
          <v-flex xs6 class="subheading text-xs-right pa-0">Price: {{ item.price }} EUR</v-flex>
        </v-card-title>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import api from "@/services/api";
export default {
  name: "Packages",
  data() {
    return {
      loading: true,
      cards: []
    };
  },
  async mounted() {
    let cards = await api.getBundles();
    this.cards = cards;
    this.loading = false;
  }
};
</script>
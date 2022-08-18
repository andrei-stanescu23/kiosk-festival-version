<template>
  <v-app id="kiosk" dark>
    <v-content style = "background-color:black">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    /*
    menuItems: [
      { key: "home", icon: "home", title: "Dashboard", link: "/" }
    ],
    */
  }),
  props: {
    source: String,
  },
};


</script>

<style>
html {
  overflow-y: hidden;
  font-family: proxima-nova, sans-serif;
  font-weight: 400;
  font-style: normal;
}
a {
  text-decoration: none;
}
</style>
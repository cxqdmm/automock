<template>
  <div id="app">
    <List />
  </div>
</template>

<script>
import List from "./components/list.vue";
export default {
  name: "App",
  components: {
    List,
  },
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
}
#app {
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
.el-tooltip__popper {
  max-width: 400px;
}
</style>

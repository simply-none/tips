<template>
  <div class="home">
    <water></water>
    <w-c></w-c>
  </div>
</template>

<script>
import water from './water'
import WC from './wc'
export default {
  components: {
    water,
    WC
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-flow: column;
  justify-content: center;
  padding: 0 20%;
}
</style>

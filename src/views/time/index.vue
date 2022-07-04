<template>
  <div class="time" @click="stop">
    {{ this.datetime }}
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  props: {
    label: String
  },
  data () {
    return {
      timer: '',
      datetime: ''
    }
  },
  mounted () {
    this.setTime()
  },
  destroyed () {
    this.stop()
  },
  methods: {
    stop () {
      console.log(this.timer, 'timer')
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = ''
        this.$emit('get-time', this.datetime)
        return true
      }
      this.setTime()
    },
    setTime () {
      if (this.timer) {
        return false
      }
      this.timer = setInterval(() => {
        this.datetime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        console.log(this.datetime)
        console.log(dayjs(this.datetime).diff(dayjs(new Date('2021-09-09')), 'days'))
      }, 1000)
    }
  }
}
</script>

<style>

</style>

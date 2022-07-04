<template>
  <div class="wc" >
    <el-card @click.native="stop" :class="getClass">
      <div class="wc-diff">
        <div class="wc-diff-label">
          距离上次上厕所已过去：
        </div>
        <div class="wc-diff-time" :class="getClass">{{ this.diffTime }}</div>
        <div>分</div></div>
      <div class="wc-diff">
        {{ this.lastTime }}
      </div>
    </el-card>
    <div class="wc-time-total">
      <div v-for="time in times" :key="time.id">
        {{ time.time }}
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { db } from 'utils/db.js'
export default {
  data () {
    return {
      timer: '',
      times: [],
      currentTime: '',
      lastTime: '',
      diffTime: '0'
    }
  },
  computed: {
    getClass () {
      if (this.diffTime > 60) {
        return ['wc-diff-time--red']
      }
      if (this.diffTime > 90) {
        return ['wc-diff-time--yellow']
      }
      return ['wc-diff-time--normal']
    }
  },
  components: {
  },
  async created () {
    await this.getLastTime()

    this.setTime()
  },
  methods: {
    async stop () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = ''
        await this.getTime(this.currentTime)
        return true
      }
      this.times = []
      this.setTime()
    },
    setTime () {
      if (this.timer) {
        return false
      }
      this.timer = setInterval(() => {
        this.currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

        const diffTime = dayjs(new Date()).diff(dayjs(new Date(this.lastTime)), 'minutes')

        this.diffTime = diffTime
      }, 1000)
    },
    async delNone () {
      await db.wc.where('time').equals('').delete()
    },
    getLastTime () {
      db.wc.where('id').above(0).last(data => {
        if (!data || !data.time) {
          return false
        }
        this.lastTime = data.time
      })
    },
    async getTime (time) {
      if (time === '') {
        return false
      }
      await db.wc.add({
        time: time
      })

      const getData = await db.wc.where('id').above(0).reverse().toArray()
      this.times = getData

      this.getLastTime()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  margin: 2em;
}
.wc {
  padding: 1px 0;
  overflow: auto;

  &-diff {
    display: flex;
    flex-flow: row;
    /* justify-content: center; */
    align-items: flex-end;
    padding: 1em;
    &-label {
      color: #686868;
    }
    &-time {
      color: rgb(62, 62, 62);
      font-family: serif;
      font-size: 3em;
      &--yellow {
        background: yellow;
        color: #020202;
      }
      &--red {
        background: #e03232;
        color: white;
        /* @extend .scale; */
      }
    }
  }
  &-time-total {
    padding: 3px 2em 2em 2em;
    div+div {
      padding-top: 0.5em;
    }
  }
}

.scale {
  width: 100%;
  height: 100%;
  z-index: 0;
  animation: scale 1s infinite;
  -webkit-animation: scale .3s infinite;
}
/* 定义keyframe动画，命名为blink */
@keyframes scale{
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

@-webkit-keyframes scale{
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

</style>

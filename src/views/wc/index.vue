<template>
  <div class="water" >
    <el-card @click.native="stop" :class="getClass">
      <div class="water-diff">
        <div class="water-diff-label">
          距离上次上厕所已过去：
        </div>
        <template v-for="time in diffTimeStr">
          <div :key="time.id" class="water-diff-time" :class="getClass">{{ time.val }}</div>
          <div :key="time.id">{{ time.field }}</div>
        </template>
      </div>
      <div class="water-diff">
        {{ this.lastTime }}
      </div>
    </el-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { db } from 'utils/db.js'
export default {
  data () {
    return {
      t: '',
      timer: '',
      times: [],
      currentTime: '',
      lastTime: '',
      diffTime: 0,
      diffTimeStr: []
    }
  },
  computed: {
    getClass () {
      if (this.diffTime > 120 * 60) {
        return ['water-diff-time--red']
      }
      if (this.diffTime > 90 * 60) {
        return ['water-diff-time--yellow']
      }
      return ['water-diff-time--normal']
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
        return true
      }
      await this.getTime(this.currentTime)
      this.times = []
      this.setTime()
    },
    setTime () {
      if (this.timer) {
        return false
      }

      const timeStr = [
        {
          field: '日',
          digit: 24 * 60 * 60
        },
        {
          field: '时',
          digit: 60 * 60
        },
        {
          field: '分',
          digit: 60
        },
        {
          field: '秒',
          digit: 1
        }
      ]
      this.timer = setInterval(() => {
        this.currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

        const diffTime = dayjs(new Date()).diff(dayjs(new Date(this.lastTime)), 'seconds')
        this.diffTimeStr = []

        timeStr.reduce((prev, str) => {
          const k = {
            field: str.field,
            yu: prev.yu % str.digit,
            val: String(Math.floor(prev.yu / str.digit)).padStart(2, '0')
          }
          if (k.val > 0 || this.diffTimeStr.length > 0) {
            this.diffTimeStr.push(k)
          }
          return k
        }, { yu: diffTime })

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
.water {
  padding: 1px 0;
  overflow: auto;

  &-diff {
    display: flex;
    flex-flow: row wrap;
    /* justify-content: center; */
    align-items: flex-end;
    padding: 1em;
    &-time {
      color: rgb(62, 62, 62);
      font-family: serif;
      font-size: 3em;
      padding: 0 3px;
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
    &-wapper {
      display: flex;
      flex-flow: row nowrap;
      width: fit-content;
      align-items: flex-end;
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

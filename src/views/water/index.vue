<template>
  <div class="water">
    <el-card>
      <div>距离上次喝水：</div>
      <div>
        <v-time label="water" @get-time="getTime"></v-time>
      </div>
    </el-card>
    <div v-for="time in times" :key="time.id">
      {{ time.time }}
    </div>
  </div>
</template>

<script>
import { db } from 'utils/db.js'
import VTime from '../time'
export default {
  data () {
    return {
      times: []
    }
  },
  components: {
    VTime
  },
  methods: {
    async getTime (time) {
      const id = await db.water.add({
        time: time
      })

      const getData = await db.water.where('id').above(0).toArray()
      this.times = getData
      console.log(id, '添加到数据库的id', getData)
    }
  }
}
</script>

<style>

</style>

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'assets/scss/reset.scss'
import 'assets/scss/global.scss'

// 控制台出错解决方法： [Violation] Added non-passive event listener to a scroll-blocking 'mousewheel' event
import 'default-passive-events'

Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

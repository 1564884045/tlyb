import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Element from 'element-ui'
// import './styles/element-variables.scss'
import './theme/index.css'
import './styles' // 基本样式重置
import './utils/validate' // 校验
import './filter' // 过滤器
// iconfont
import './assets/iconfont/iconfont.css'
// 图片浏览组件
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

import axios from './utils/request' // 经过封装处理的axiosApi
import './permission' // 路由级别的权限控制

Vue.use(Element, { size: 'small' })
Vue.use(Viewer)
Viewer.setDefaults({
  Options: { zIndex: 999999999999999 }
})
Vue.config.productionTip = false
// 全局参数
Vue.prototype.$http = axios
Vue.prototype.$isTest = process.env.VUE_APP_TEST_ENV || false

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import store from './store'
import request from './utils/request'
import Cookies from 'js-cookie'

NProgress.configure({ showSpinner: false })

const whiteList = ['Login', 'Register', 'ForgetPassword', 'RegistrationSuccessful'] // 免登录白名单

router.beforeEach(async (to, from, next) => {
  // 取消之前页面的请求
  store.dispatch('handleRequestCancelToken', false)
  NProgress.start() // start progress bar
  if (Cookies.get('auth_token') != null) {
    // 没有用户相关数据，去获取
    if (store.getters.userInfo == null && whiteList.indexOf(to.name) === -1) {
      try {
        const res = await request.get('/v1/User/getCurrentUserInfo')
        store.dispatch('setInitInfo', res.data)
        // 动态路由加载的HOCK处理
        next({ path: to.path, query: to.query, replace: true })
      } catch (error) {
        sessionStorage.setItem('iTK_noAuth', '授权过期，请重新登录！')
        console.error(error)
        // 报错直接退出登录
        store.dispatch('logout')
        NProgress.done()
      }
      return
    }
    next()
  } else {
    // 没有登录
    if (whiteList.indexOf(to.name) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      if (to.path === '/404') {
        next()
      } else {
        // 否则全部重定向到登录页
        sessionStorage.getItem('iTK_noAuth') ? next('/login') : next(`/login?redirect=${to.path}`)
      }
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

import Vue from 'vue'
import Router from 'vue-router'

import executiveRoute from './modules/executive'
import educationalRoute from './modules/educational'
import marketingToolsRoute from './modules/marketingTools'
import salesManagementRoute from './modules/salesManagement'
import classServiceRoute from './modules/classService'
import infoServiceRoute from './modules/infoService'
import onlineStudyRoute from './modules/onlineStudy'
import statisticsRoute from './modules/statistics'
import padManagerRoute from './modules/padManager'
import sysService from './modules/sysService'
import miniWebsite from './modules/miniWebsite'

Vue.use(Router)

const Layout = () => import('@/views/layout')
/**
 * 静态路由
 */
export const constantRouterMap = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login')
  },
  {
    path: '/navigation',
    name: 'Navigation',
    component: () => import('@/views/Navigation')
  },
  {
    path: '/registrationSuccessful',
    name: 'RegistrationSuccessful',
    component: () => import('@/views/RegistrationSuccessful')
  },
  {
    path: '/forgetPassword',
    name: 'ForgetPassword',
    component: () => import('@/views/ForgetPassword'),
    meta: {
      title: '忘记密码-桃李云帮'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register'),
    meta: {
      title: '机构入驻-桃李云帮'
    }
  },
  // {
  //   path: '/guide',
  //   name: 'Guide',
  //   component: () => import('@/views/Guide')
  // },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard'),
        meta: {
          title: '工作台-桃李云帮'
        }
      },
      {
        path: '/basicInfo',
        name: 'BasicInfo',
        component: () => import('@/views/basicInfo'),
        meta: {
          title: '基础设置-桃李云帮'
        }
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import('@/views/404')
  }
]

/**
 * 需要动态添加的路由
 */
export const asyncRouterMap = [
  executiveRoute,
  educationalRoute,
  marketingToolsRoute,
  salesManagementRoute,
  classServiceRoute,
  onlineStudyRoute,
  infoServiceRoute,
  statisticsRoute,
  padManagerRoute,
  sysService,
  miniWebsite
]

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: constantRouterMap
})

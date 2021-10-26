// 行政管理
const Layout = () => import('@/views/layout')

export default {
  path: '/executive',
  name: 'Executive',
  component: Layout,
  meta: {
    title: '行政管理'
  },
  children: [
    {
      path: 'notificationRecord',
      name: 'NotificationRecord',
      component: () => import('@/views/executive/notificationRecord'),
      meta: {
        title: '通知记录-桃李云帮'
      }
    },
    {
      path: 'userSign',
      name: 'UserSign',
      component: () => import('@/views/executive/userSign'),
      meta: {
        title: '员工打卡-桃李云帮'
      }
    },
    {
      path: 'staff',
      name: 'Staff',
      component: () => import('@/views/executive/staff'),
      meta: {
        keepAlive: true,
        title: '员工管理-桃李云帮'
      }
    },
    {
      path: 'department',
      name: 'Department',
      component: () => import('@/views/executive/department'),
      meta: {
        keepAlive: true,
        title: '组织架构-桃李云帮'
      }
    },
    {
      path: 'duty',
      name: 'Duty',
      component: () => import('@/views/executive/duty'),
      meta: {
        keepAlive: true,
        title: '岗位管理-桃李云帮'
      }
    },
    {
      path: 'renewWarning',
      name: 'RenewWarning',
      component: () => import('@/views/classService/renewWarning'),
      meta: {
        title: '续费预警-桃李云帮'
      }
    }
    // {
    //   path: 'finance',
    //   name: 'Finance',
    //   component: () => import('@/views/executive/finance'),
    //   meta: {
    //     title: '财务管理'
    //   }
    // }
  ]
}

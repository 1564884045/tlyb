// 家校服务管理系统
const Layout = () => import('@/views/layout')

export default {
  path: '/classService',
  component: Layout,
  children: [
    {
      path: 'classRecord',
      name: 'ClassRecord',
      component: () => import('@/views/classService/classRecord'),
      meta: {
        title: '上课记录-桃李云帮'
      }
    },
    {
      path: 'preparation',
      name: 'Preparation',
      component: () => import('@/views/classService/preparation'),
      meta: {
        title: '老师备课-桃李云帮'
      }
    },
    {
      path: 'studentSign',
      name: 'StudentSign',
      component: () => import('@/views/classService/studentSign'),
      meta: {
        title: '学员签到-桃李云帮'
      }
    },
    {
      path: 'leaveRecord',
      name: 'LeaveRecord',
      component: () => import('@/views/classService/leaveRecord'),
      meta: {
        title: '学员请假-桃李云帮'
      }
    }
  ]
}

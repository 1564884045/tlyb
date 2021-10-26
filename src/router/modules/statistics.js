// 统计管理
const Layout = () => import('@/views/layout')

export default {
  path: '/statistics',
  component: Layout,
  children: [
    {
      path: 'courseTimeStatistics',
      name: 'CourseTimeStatistics',
      component: () => import('_v/statistics/CourseTimeStatistics'),
      meta: {
        keepAlive: true,
        title: '课时统计-桃李云帮'
      }
    },
    {
      path: 'orderStatistics',
      name: 'OrderStatistics',
      component: () => import('_v/statistics/OrderStatistics'),
      meta: {
        keepAlive: true,
        title: '订单分析-桃李云帮'
      }
    },
    {
      path: 'studentAnalyseStatistics',
      name: 'StudentAnalyseStatistics',
      component: () => import('_v/statistics/StudentAnalyseStatistics'),
      meta: {
        keepAlive: true,
        title: '学员分析-桃李云帮'
      }
    }
  ]
}

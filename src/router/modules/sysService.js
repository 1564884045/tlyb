// 系统反馈
const Layout = () => import('@/views/layout')

export default {
  path: '/sysService',
  component: Layout,
  children: [
    {
      path: 'advice',
      name: 'Advice',
      component: () => import('_v/sysService/Advice'),
      meta: {
        keepAlive: true,
        title: '意见反馈-桃李云帮'
      }
    }
  ]
}

// 基础设置
const Layout = () => import('@/views/layout')

export default {
  path: '/marketing',
  component: Layout,
  children: [
    {
      path: 'tools',
      name: 'MarketingTools',
      component: () => import('_v/marketingTools'),
      meta: {
        title: '招生帮-桃李云帮'
      }
    },
    {
      path: 'account',
      name: 'Account',
      component: () => import('_v/marketingTools/Account'),
      meta: {
        title: '收款账户-桃李云帮'
      }
    }
  ]
}

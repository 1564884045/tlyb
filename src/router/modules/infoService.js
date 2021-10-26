// 信息管理
const Layout = () => import('@/views/layout')

export default {
  path: '/infoService',
  component: Layout,
  children: [
    {
      path: 'banner',
      name: 'Banner',
      component: () => import('_v/infoService/Banner'),
      meta: {
        keepAlive: true,
        title: '轮播图管理-桃李云帮'
      }
    },
    {
      path: 'news',
      name: 'News',
      component: () => import('_v/infoService/News'),
      meta: {
        keepAlive: true,
        title: '新闻管理-桃李云帮'
      }
    }
  ]
}

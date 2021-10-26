// 平板管理
const Layout = () => import('@/views/layout')

export default {
  path: '/padManager',
  component: Layout,
  children: [
    {
      path: 'banner',
      name: 'Banner',
      component: () => import('@/views/padManager/banner'),
      meta: {
        keepAlive: true,
        title: '轮播图管理-桃李云帮'
      }
    },
    {
      path: 'organizationIntro',
      name: 'OrganizationIntro',
      component: () => import('@/views/padManager/organizationIntro'),
      meta: {
        title: '机构介绍-桃李云帮'
      }
    }
  ]
}

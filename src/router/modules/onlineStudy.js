// 在线学习
const Layout = () => import('@/views/layout')

export default {
  path: '/onlineStudy',
  component: Layout,
  children: [
    {
      path: 'video',
      name: 'VideoManager',
      component: () => import('_v/onlineStudy/videoManager'),
      meta: {
        title: '视频管理-桃李云帮'
      }
    },
    {
      path: 'live',
      name: 'LiveManager',
      component: () => import('_v/onlineStudy/liveManager'),
      meta: {
        title: '直播管理-桃李云帮'
      }
    }
  ]
}

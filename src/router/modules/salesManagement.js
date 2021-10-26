// 应用商城
const Layout = () => import('@/views/layout')

export default {
  path: '/sales',
  component: Layout,
  children: [
    {
      path: 'potential',
      name: 'PotentialCustomer',
      component: () => import('@/views/salesManagement/potentialCustomer'),
      meta: {
        keepAlive: true,
        title: '潜客管理-桃李云帮'
      }
    },
    {
      path: 'order',
      name: 'OrderManagement',
      component: () => import('@/views/salesManagement/orderManagement'),
      meta: {
        title: '订单管理-桃李云帮'
      }
    }
  ]
}

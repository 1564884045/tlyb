import Router, { asyncRouterMap } from '@/router'
import { treeToList } from '@/utils/tree'
import path from 'path'

const permission = {
  state: {
    localStorageSidebar: true,
    menuList: [],
    settingMenu: null, // 基础设置的特殊菜单
    permissionList: [] // 权限列表
  },
  getters: {
    localStorageSidebar: (state) => state.localStorageSidebar,
    menuList: (state) => state.menuList,
    settingMenu: (state) => state.settingMenu,
    permissionList: (state) => state.permissionList // 权限
  },
  mutations: {
    setlocalStorageSidebar(state, videoModule) {
      state.localStorageSidebar = videoModule
    },
    setMenuList(state, list) {
      state.menuList = list
    },
    setSettingMenu(state, menu) {
      state.settingMenu = menu
    },
    setPermissionList(state, list) {
      state.permissionList = list
    }
  },
  actions: {
    addUserMenus({ commit }, menus) {
      // 特殊处理Setting菜单
      const settingMenu = menus.find(o => o.sort === 100 || o.name === '基础设置')
      menus = menus.filter(o => o.sort !== 100 && o.name !== '基础设置')
      commit('setSettingMenu', settingMenu)
      commit('setMenuList', menus)

      // 扁平化菜单数据
      const menuList = treeToList(menus.concat([]))
      const addRoutes = []
      let tempPath = ''
      let tempList = []
      // 这里只做了两层的路由处理
      asyncRouterMap.forEach(item1 => {
        tempPath = item1.path || ''
        tempList = []
        if (item1.children) {
          item1.children.forEach(item2 => {
            // TODO isLeaf是写死的，应该按照权限判断
            if ((item2.meta && item2.meta.isLeaf) || menuList.find(o => o.url && path.join(tempPath, item2.path).toLowerCase() === o.url.toLowerCase())) {
              tempList.push(item2)
            }
          })
        }
        if (tempList.length > 0) {
          addRoutes.push(Object.assign({}, item1, {
            children: tempList
          }))
        }
      })
      // 添加授权路由页面
      Router.addRoutes(addRoutes)
      // Router.$addRoutes = (addRoutes) => {
      //   Router.matcher = new Router({
      //     mode: 'history'
      //   }).matcher
      //   Router.addRoutes(addRoutes)
      // }
    }
  }
}

export default permission
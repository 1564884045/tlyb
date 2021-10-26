import Cookies from 'js-cookie'
import request from '../../utils/request'
import { Branch } from '../../utils/storage'
import {
  MessageBox,
  Notification
} from 'element-ui'

const user = {
  state: {
    userInfo: null,
    organizationInfo: null,
    currentBranch: Branch.get(), // 当前校区,
    branchList: [], // 校区列表
    departmentList: [], // 部门列表
    showSetPwd: false, // 是否显示设置密码
    showIntroduction: false, // 是否显示更新说明
    showJoinVip: false, // 是否显示开通会员
    showTopUp: false // 系统充值
  },
  getters: {
    userInfo: (state) => state.userInfo,
    organizationInfo: (state) => state.organizationInfo, // 机构信息
    currentBranch: (state) => state.currentBranch, // 当前切换分校
    branchList: (state) => state.branchList, // 全部分校列表
    departmentList: (state) => state.departmentList,
    showSetPwd: (state) => state.showSetPwd,
    showIntroduction: (state) => state.showIntroduction,
    showJoinVip: (state) => state.showJoinVip,
    showTopUp: (state) => state.showTopUp
  },
  mutations: {
    setUserInfo(state, userInfo) {
      // User.set(userInfo)
      state.userInfo = userInfo
    },
    setOrganizationInfo(state, organizationInfo) {
      // Organization.set(organizationInfo)
      state.organizationInfo = organizationInfo
    },
    setCurrentBranch(state, info) {
      Branch.set(info)
      state.currentBranch = info
    },
    setDepartmentList(state, list) {
      state.departmentList = list
    },
    setBranchList(state, list) {
      state.branchList = list
    },
    toggleShowSetPwd(state, flag) {
      state.showSetPwd = flag
    },
    toggleShowIntroduction(state, flag) {
      state.showIntroduction = flag
    },
    toggleShowJoinVip(state, flag) {
      state.showJoinVip = flag
    },
    toggleShowTopUp(state, flag) {
      state.showTopUp = flag
    }
  },
  actions: {
    logout({ commit, dispatch }) {
      dispatch('handleRequestCancelToken', true)
      request.get('/v1/Logout')
      // 删除校区信息
      Branch.remove('')
      localStorage.removeItem('auth_time')
      localStorage.removeItem('we_chat_auth_code')
      localStorage.removeItem('we_chat_expires_in')
      commit('setUserInfo', null)
      // 删除Cookie
      Cookies.remove('auth_token')
      // Cookies.remove(document.cookie.split(';')[i].split('=')[0])
      // 删除设备权限数据
      sessionStorage.clear()
      // 重新实例化VUE路由器对象以避免bug
      window.location.reload()
    },
    setInitInfo({ getters, commit, dispatch }, loginInfo) {
      if (loginInfo == null) return

      // 保存登录菜单信息、权限信息
      if (loginInfo.userInfo.menus && loginInfo.userInfo.menus.length > 0) {
        dispatch('addUserMenus', loginInfo.userInfo.menus)
        console.log(loginInfo.userInfo.menus)
        commit('setPermissionList', loginInfo.userInfo.permissions)
        delete loginInfo.userInfo.menus
        delete loginInfo.userInfo.permissions
      } else {
        sessionStorage.setItem('iTK_noAuth', '您当前没有访问权限！')
        // 报错直接跳转登录
        dispatch('logout')
        return
      }
      // VIP 信息
      if (loginInfo.vipInfo != null) {
        loginInfo.userInfo.vipInfo = loginInfo.vipInfo
        if (loginInfo.vipInfo.renewStatus === 1) {
          setTimeout(() => {
            if (getters.userInfo == null) return
            const notifyInstance = Notification.warning({
              title: '会员续费提醒',
              message: '【桃李云帮】会员即将到期，请及时续费。',
              offset: 50,
              onClick: () => {
                commit('toggleShowJoinVip', true)
                notifyInstance.close()
              }
            })
          }, 2000)
        }
      }
      // 设置用户信息
      commit('setUserInfo', loginInfo.userInfo)
      // 设置机构信息
      if (loginInfo.organization) {
        // 处理省市区
        if (loginInfo.organization.province) {
          loginInfo.organization.province = loginInfo.organization.province.split(';')
        }
        commit('setOrganizationInfo', loginInfo.organization)
      }
      // 设置校区信息
      if (loginInfo.departmentDefault) {
        // 处理省市区
        if (loginInfo.departmentDefault.province) {
          loginInfo.departmentDefault.province = loginInfo.departmentDefault.province.split(';')
        }
        if (getters.currentBranch == null) commit('setCurrentBranch', loginInfo.departmentDefault)
      }
      // 未设置密码,并且不是 登录、注册、引导页
      if (loginInfo.isSetPassword === false) {
        setTimeout(() => {
          MessageBox.confirm('您还没有设置密码，验证登录一天只能用三次，请立即设置', '提示', {
            confirmButtonText: '立即设置',
            cancelButtonText: '暂不设置'
          }).then(() => {
            commit('toggleShowSetPwd', true)
          })
        }, 2800)
      }
      // 校验用户是否还在使用默认密码
      // if (loginInfo.isDefaultPassword === true) {
      //   setTimeout(() => {
      //     MessageBox.confirm('目前使用的还是默认密码，为了保证账号安全，请您立即更改', '提示', {
      //       confirmButtonText: '立即设置',
      //       cancelButtonText: '暂不设置'
      //     }).then(() => {
      //       commit('toggleShowSetPwd', true)
      //     })
      //   }, 2800)
      // }
    }
  }
}

export default user

import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus')
    },
    cancelToken: [] // 待取消的请求列表
  },
  getters: {
    sidebar: state => state.sidebar,
    cancelToken: state => state.cancelToken
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    pushCancelToken(state, token) {
      state.cancelToken.push(token)
    },
    setCancelToken(state, tokens) {
      state.cancelToken = tokens
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    // 执行取消请求
    handleRequestCancelToken({ getters, commit }, clearAll) {
      if (clearAll) {
        // 清除所有
        getters.cancelToken.forEach(item => {
          item.cancelToken && item.cancelToken()
        })
        commit('setCancelToken', [])
        return
      }
      commit('setCancelToken', getters.cancelToken.filter(item => {
        let flag = true
        // 没有被缓存，或者时间超过14S，就取消请求
        if (item.meta == null || !item.meta.keepAlive || (Date.now() - item.time > 14000)) {
          item.cancelToken && item.cancelToken()
          flag = false
        }
        // 过滤掉已经取消的，保留未处理的
        return flag
      }))
    }
  }
}

export default app

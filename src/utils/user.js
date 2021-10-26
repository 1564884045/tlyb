const SYSTEM_AUTH = 'systemAuthInfo' // 系购买系统版本信息

export const SystemAuthInfo = {
  get: function () {
    const phoneArea = localStorage.getItem(SYSTEM_AUTH)
    if (phoneArea) {
      return JSON.parse(phoneArea)
    }
    return {}
  },
  set: function (systemAuthInfoArr) {
    // 设置之前，先清空
    localStorage.setItem(SYSTEM_AUTH, JSON.stringify(systemAuthInfoArr))
  },
  clear: function() {
    localStorage.removeItem(SYSTEM_AUTH)
  }
}

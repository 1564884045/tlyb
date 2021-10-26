
const BRANCH_PREFIX = '_ITk_ORG_ADMIN_branch'
const IMPORT_PREFIX = '_ITk_ORG_ADMIN_import'
const PHONE_AREA_CODE = 'TLYBOND_PHONE_AREA_CODE'
const TLYBOND_PHONE_CURRENT_VALIDATE = 'TLYBOND_PHONE_CURRENT_VALIDATE'
const CHECK_PHONE_AREA_CODE = 'TLYBOND_CHECK_PHONE_AREA_CODE' // 记录用户上一次所选地区码

export const Branch = {
  get: function (key) {
    if (key == null) {
      let org = null
      for (let k in sessionStorage) {
        if (k.indexOf(BRANCH_PREFIX + '_') === 0) {
          if (org === null) {
            org = {}
          }
          org[k.split(BRANCH_PREFIX + '_')[1]] = sessionStorage.getItem(k)
        }
      }
      return org
    } else {
      return sessionStorage.getItem(BRANCH_PREFIX + '_' + key)
    }
  },
  set: function (org) {
    if (typeof org !== 'object') {
      console.error('local: Branch must is Object')
      return
    }
    // 设置之前，先清空
    this.remove()
    for (let key in org) {
      // 过滤为null参数
      if (org[key] != null) {
        sessionStorage.setItem(BRANCH_PREFIX + '_' + key, org[key])
      }
    }
  },
  setItem: function (key, value) {
    if (typeof key !== 'string') {
      console.error('local: Branch`s key must is String')
      return
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error('local: Branch`s value must is String or Number')
      return
    }
    sessionStorage.setItem(BRANCH_PREFIX + '_' + key, value)
  },
  remove: function() {
    const org = this.get()
    for (let key in org) {
      sessionStorage.removeItem(BRANCH_PREFIX + '_' + key)
    }
  },
  removeItem: function (key) {
    if (typeof key !== 'string') {
      console.error('local: Branch`s key must is String')
      return
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error('local: Branch`s value must is String or Number')
      return
    }
    sessionStorage.removeItem(BRANCH_PREFIX + '_' + key)
  }
}

export const ImortRecord = {
  get: function () {
    const record = sessionStorage.getItem(IMPORT_PREFIX)
    if (record) {
      return JSON.parse(record)
    }
    return []
  },
  set: function (recordList) {
    if (!(recordList instanceof Array)) {
      console.error('local: Import Record must is Object')
      return
    }
    // 设置之前，先清空
    sessionStorage.setItem(IMPORT_PREFIX, JSON.stringify(recordList))
  },
  clear: function() {
    sessionStorage.removeItem(IMPORT_PREFIX)
  },
  push: function(record) {
    let recordList = this.get()
    recordList.push(record)
    this.set(recordList)
  },
  isImported: function (filename, CreatedDate, ModifiedDate) {
    const recordList = this.get()
    for (let i = 0; i < recordList.length; i++) {
      const item = recordList[i]
      if (item.filename === filename &&
        item.CreatedDate === CreatedDate &&
        item.ModifiedDate === ModifiedDate) {
        return true
      }
    }
    return false
  }
}

export const PhoneAreaCode = {
  get: function () {
    const phoneArea = localStorage.getItem(PHONE_AREA_CODE)
    if (phoneArea) {
      return JSON.parse(phoneArea)
    }
    return []
  },
  set: function (phoneAreaCodeArr) {
    if (!(phoneAreaCodeArr instanceof Array)) {
      console.error('local: Import Record must is Array')
      return
    }
    // 设置之前，先清空
    localStorage.setItem(PHONE_AREA_CODE, JSON.stringify(phoneAreaCodeArr))
  },
  clear: function() {
    localStorage.removeItem(PHONE_AREA_CODE)
  },
  setCurrentValidate(validate) {
    if (validate) {
      localStorage.setItem(TLYBOND_PHONE_CURRENT_VALIDATE, validate)
    }
  },
  getCurrentValidate() {
    let currentValidate = localStorage.getItem(TLYBOND_PHONE_CURRENT_VALIDATE)
    if (!currentValidate) {
      return '/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[01235678]|18[0-9]|19[1589])\\d{8}$/'
    }
    return currentValidate
  },
  getCheck() {
    const checkCode = localStorage.getItem(CHECK_PHONE_AREA_CODE)
    if (checkCode) {
      return checkCode
    }
    return '+86'
  },
  setCheck(currentAreaCode) {
    localStorage.setItem(CHECK_PHONE_AREA_CODE, currentAreaCode)
  }
}

export const CodeName = {
  BRANCH_PREFIX,
  IMPORT_PREFIX,
  PHONE_AREA_CODE,
  TLYBOND_PHONE_CURRENT_VALIDATE,
  CHECK_PHONE_AREA_CODE
}

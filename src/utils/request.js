import axios from 'axios'
import { Message } from 'element-ui'
// import { User } from '../utils/storage'
import Cookie from 'js-cookie'
import store from '../store'
import router from '../router'

const OK = '000000'

function toType (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
// 参数过滤函数
function filterNull (o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}
/**
 * 同一网络请求时间限制
 * fix bug 目前尚存在的问题：如果强行频繁操作，由于cookie过期机制问题，还是会有少量的请求穿到接口里，
 * @param {String} url 请求的接口
 * @param {Number} time 两次请求之间的最短时间：毫秒
 */
function warn(url, time) {
  if (Cookie.get(url)) {
    Message.warning({
      center: true,
      message: '操作过于频繁，请稍后再操作！'
    })
    return false
  } else {
    Cookie.set(url, 1, {
      expires: new Date(new Date().getTime() + time)
    })
    return true
  }
}
/**
 * 通用的Api请求方式
 * @param {String} method GET、PUT、POST、DELETE
 * @param {String} url URL地址，域名等通用字段已配置
 * @param {Object} params 参数对象
 * @param {Object} config axios配置项
 */
function apiAxios (method, url, params, config) {
  // 过滤为空的参数
  if (params && (typeof params === 'object')) {
    params = filterNull(params)
  }
  switch (method) {
    case 'GET':
      if (!warn(url, 500)) {
        return new Promise((resolve, reject) => {
          reject({
            code: 429,
            message: '操作过于频繁，请稍后再操作！'
          })
        })
      }
      break
    case 'PUT':
      if (!warn(url, 4000)) {
        return new Promise((resolve, reject) => {
          reject({
            code: 429,
            message: '操作过于频繁，请稍后再操作！'
          })
        })
      }
      break
    case 'POST':
      if (!warn(url, 4000)) {
        return new Promise((resolve, reject) => {
          reject({
            code: 429,
            message: '操作过于频繁，请稍后再操作！'
          })
        })
      }
      break
    case 'DELETE':
      if (!warn(url, 2000)) {
        return new Promise((resolve, reject) => {
          reject({
            code: 429,
            message: '操作过于频繁，请稍后再操作！'
          })
        })
      }
      break
  }
  // 从获取Cookia中获取令牌
  const token = Cookie.get('auth_token')
  return new Promise((resolve, reject) => {
    const axiosParams = {
      method: method,
      url: url,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
      baseURL: process.env.VUE_APP_BASE_API,
      // withCredentials: true, // 跨域请求时是否需要使用凭证
      timeout: 15000,
      cancelToken: new axios.CancelToken(function executor(c) {
        // 存储请求的页面信息
        const route = router.currentRoute
        store.commit('pushCancelToken', {
          url: url,
          name: route.name,
          path: route.path,
          fullPath: route.fullPath,
          meta: route.meta,
          cancelToken: c,
          time: Date.now()
        })
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token
      },
      ...config
    }
    axios(axiosParams)
      .then(res => {
        if (res.data.code === OK) {
          resolve({
            data: res.data.data,
            total: res.data.total,
            message: res.data.message
          })
        } else {
          if (res.data.message) {
            Message.error({
              center: true,
              message: res.data.message
            })
          }
          reject({
            code: res.data.code,
            data: res.data.data,
            message: res.data.message
          })
          console.error('api error: ' + res.data.message)
        }
      })
      .catch(err => {
        if (axios.isCancel(err)) {
          reject({
            code: -10000,
            message: '主动取消了请求'
          })
          return
        }
        let errMsg = ''
        let errCode = -100
        if (err && err.response) {
          switch (err.response.status) {
            case 400:
              errCode = 400
              errMsg = '客户端请求的语法错误'
              break
            case 401:
              errCode = 401
              errMsg = '授权过期，请重新登录'
              sessionStorage.setItem('iTK_noAuth', '授权过期，请重新登录！')
              store.dispatch('logout')
              return
            case 403:
              errCode = 403
              errMsg = '拒绝访问'
              sessionStorage.setItem('iTK_noAuth', '没有授权，拒绝访问！')
              store.dispatch('logout')
              return
            case 404:
              errCode = 404
              errMsg = '您所请求的资源无法找到'
              break
            case 408:
              errCode = 408
              errMsg = '客户端发送的请求时间超时'
              break
            case 419:
              errCode = 419
              errMsg = '授权失效，请重新登录'
              break
            case 429:
              errCode = 429
              errMsg = '请求过于频繁，请稍后再操作！'
              break
            case 500:
              errCode = 500
              errMsg = '服务器错误'
              break
            case 501:
              errCode = 501
              errMsg = '服务未实现'
              break
            case 502:
              errCode = 502
              errMsg = '网络错误'
              break
            case 503:
              errCode = 503
              errMsg = '服务不可用'
              break
            case 504:
              errCode = 504
              errMsg = '网络超时'
              break
            case 505:
              errCode = 505
              errMsg = 'HTTP版本不受支持'
              break
            default:
              errMsg = '连接服务器失败，错误码：' + err.response.status
          }
        } else {
        // axios超时处理
          if (err.message.indexOf('timeout') > -1) {
            errMsg = '网络请求超时'
          } else {
            errMsg = '网络请求错误! 详细信息:' + err.message.substring(0, 155)
          }
          errCode = -101
        }
        if (errCode === 429) {
          Message.warning({
            center: true,
            message: errMsg
          })
        } else {
          Message.error({
            center: true,
            message: errMsg
          })
        }
        reject({
          code: errCode,
          message: errMsg
        })
        if (err) {
          console.error('api error: ' + errMsg)
        }
      })
  })
}

/**
 * 文件上传
 * @param {File} file Image File对象
 * @param {String} uploadUrl 上传地址
 * @param {Boolean} isImage 上传文件是否图片
 */
function uploadFile(file, uploadUrl, isImage = true, conf) {
  return new Promise((resolve, reject) => {
    let config = {
      processData: false, // *重要,确认为false
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      cancelToken: new axios.CancelToken(function executor(c) {
        // 存储请求的页面信息
        const route = router.currentRoute
        store.commit('pushCancelToken', {
          url: uploadUrl,
          name: route.name,
          path: route.path,
          fullPath: route.fullPath,
          meta: route.meta,
          cancelToken: c,
          time: Date.now()
        })
      }),
      timeout: 30000,
      ...conf
    }
    let param = new FormData()
    if (file.filename || file.name) {
      param.append('file', file)
    } else {
      param.append('file', file, 'image.png')
    }
    axios.post(uploadUrl, param, config)
      .then(res => {
        if (res.data.code === OK) {
          if (isImage) {
            let tempUrl = ''
            try {
              tempUrl = window.URL.createObjectURL(file)
            } catch {}
            resolve({
              tempUrl: tempUrl,
              src: res.data.data[0].downloadPath,
              url: res.data.data[0].downloadPath
            })
          } else {
            resolve(res.data.data[0])
          }
        } else {
          Message.error({
            center: true,
            message: '上传失败'
          })
          console.error('api error: ' + res.data.message)
          reject(res.data.message)
        }
      })
      .catch(e => {
        if (axios.isCancel(e)) {
          reject(e)
          return
        }
        Message.error({
          center: true,
          message: '上传失败'
        })
        if (e) {
          console.error('upload file error, HTTP CODE: ' + e.message)
        }
        reject(e)
      })
  })
}

/**
 * 下载文件-get方法
 * @param {String} downloadUrl 下载地址
 * @param {String} fileName 文件名
 */
function getDownloadFile(downloadUrl, fileName) {
  const token = Cookie.get('auth_token')
  return new Promise((resolve, reject) => {
    axios({
      url: downloadUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; application/octet-stream',
        'Authorization': token
      },
      cancelToken: new axios.CancelToken(function executor(c) {
        // 存储请求的页面信息
        const route = router.currentRoute
        store.commit('pushCancelToken', {
          url: downloadUrl,
          name: route.name,
          path: route.path,
          fullPath: route.fullPath,
          meta: route.meta,
          cancelToken: c,
          time: Date.now()
        })
      }),
      timeout: 30000,
      responseType: 'blob'
    }).then((res) => {
      const blob = new Blob([res.data])
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = fileName
      downloadElement.style.display = 'none'
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href) // 释放掉blob对象
      resolve({
        code: '000000',
        message: '下载成功'
      })
    }).catch(err => {
      if (axios.isCancel(err)) {
        reject({
          code: '-100000',
          message: '主动取消了请求'
        })
        return
      }
      reject(err)
    })
  })
}

/**
 * 下载文件-post方法
 * @param {String} downloadUrl 下载地址
 * @param {String} fileName 文件名
 */
function postDownloadFile(downloadUrl, fileName) {
  const token = Cookie.get('auth_token')
  return new Promise((resolve, reject) => {
    axios({
      url: downloadUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; application/octet-stream',
        'Authorization': token
      },
      cancelToken: new axios.CancelToken(function executor(c) {
        // 存储请求的页面信息
        const route = router.currentRoute
        store.commit('pushCancelToken', {
          url: downloadUrl,
          name: route.name,
          path: route.path,
          fullPath: route.fullPath,
          meta: route.meta,
          cancelToken: c,
          time: Date.now()
        })
      }),
      timeout: 30000,
      responseType: 'blob'
    }).then((res) => {
      const blob = new Blob([res.data])
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = fileName
      downloadElement.style.display = 'none'
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href) // 释放掉blob对象
      resolve({
        code: '000000',
        message: '下载成功'
      })
    }).catch(err => {
      if (axios.isCancel(err)) {
        reject({
          code: '-100000',
          message: '主动取消了请求'
        })
        return
      }
      reject(err)
    })
  })
}

export default {
  get: function (url, params, config) {
    return apiAxios('GET', url, params, config)
  },
  post: function (url, params, config) {
    return apiAxios('POST', url, params, config)
  },
  put: function (url, params, config) {
    return apiAxios('PUT', url, params, config)
  },
  delete: function (url, params, config) {
    return apiAxios('DELETE', url, params, config)
  },
  upload: function(file, isImage, config, uploadUrl = process.env.VUE_APP_UPLOAD_URL) {
    return uploadFile(file, uploadUrl, isImage, config)
  },
  getDownload(url, fileName) {
    return getDownloadFile(url, fileName)
  },
  postDownload(url, fileName) {
    return postDownloadFile(url, fileName)
  }
}

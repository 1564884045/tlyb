import * as qiniu from 'qiniu-js'
import path from 'path'
import { Message, Loading } from 'element-ui'
import request from './request'

let loadingRequest = null

function generateUUID() {
  var d = new Date().getTime()
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now() // use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

/**
 * 文件上传
 * @param {File} file 待上传的文件
 * @param {String} filename 文件名
 * @param {Number} timeout 文件上传超时时间
 */
export function uploadFile(file, filename, timeout = 45 * 1000) {
  return new Promise(async (resolve, reject) => {
    // 生成唯一的文件名
    if (!filename) filename = 'video.mp4'
    const nFilename = path.join(generateUUID() + path.extname(filename))
    let token = ''
    try {
      // 获取token
      const resToken = await request.get('/v1/Qiniu/getToken')
      token = resToken.data.token
    } catch (error) {
      reject(error)
      return
    }

    if (loadingRequest != null) {
      loadingRequest.close()
      loadingRequest = null
    }
    loadingRequest = Loading.service({
      lock: true,
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
      text: '上传中...'
    })
    // 文件监听
    let time = Date.now()
    const observer = {
      next(res) {
        // 超时时间处理
        if (Date.now() - time > timeout) {
          if (loadingRequest != null) {
            loadingRequest.close()
            loadingRequest = null
          }
          subscription.unsubscribe() // 取消上传
          reject('上传文件超时了')
        }
      },
      error(err) {
        if (loadingRequest != null) {
          loadingRequest.close()
          loadingRequest = null
        }
        Message.error('文件上传失败！')
        reject(err)
      },
      complete(res) {
        if (loadingRequest != null) {
          loadingRequest.close()
          loadingRequest = null
        }
        resolve(process.env.VUE_APP_QINIU_ATM_CDN + '/' + res.key)
      }
    }
    // 创建上传监听器
    const observable = qiniu.upload(file, nFilename, token, {
      fname: filename
    }, {
      useCdnDomain: true,
      region: process.env.VUE_APP_QINIU_ORGIN
    })
    // 开始上传
    const subscription = observable.subscribe(observer)
  })
}
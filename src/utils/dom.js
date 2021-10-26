/**
 * 添加事件监听
 * on(window, 'touchmove', () => {}) 事件源、事件名称、回调
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * 移除事件监听
 * off(window, 'touchmove', () => {}) 事件源、事件名称、回调
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * 是否拥有指定class
 * @param {*} el HTMLElement对象
 * @param {*} className 类名
 */
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

/**
 * 添加class
 * @param {*} el HTMLElement对象
 * @param {*} className 类名
 */
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

/**
 * 移除class
 * @param {*} el HTMLElement对象
 * @param {*} className 类名
 */
export function removeClass(el, className) {
  if (!hasClass(el, className)) {
    return
  }

  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g')
  el.className = el.className.replace(reg, ' ')
}

/**
 * 切换class
 * @param {*} el HTMLElement对象
 * @param {*} className 类名
 */
export function toggleClass(el, className) {
  if (hasClass(el, className)) {
    removeClass(el, className)
  } else {
    addClass(el, className)
  }
}

/**
 * 获取/设置H5的data-属性值
 * @param {*} el HTMLElement对象
 * @param {*} name 属性名
 * @param {*} val 值(存在即是设置，不存在即是获取)
 */
export function getData(el, name, val) {
  let prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

/**
 * 获取元素的边框范围
 * @param {*} el HTMLElement对象
 */
export function getRect(el) {
  if (el instanceof window.SVGElement) {
    let rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

/**
 * 打开全屏
 * @param {Element} element 全屏的元素
 */
export function requestFullScreen(element) {
  const requestMethod = element.requestFullScreen || // W3C
      element.webkitRequestFullScreen || // Chrome等
      element.mozRequestFullScreen || // FireFox
      element.msRequestFullScreen // IE11
  if (requestMethod) {
    requestMethod.call(element)
  } else if (typeof window.ActiveXObject !== 'undefined') { // for Internet Explorer
    var wscript = new window.ActiveXObject('WScript.Shell')
    if (wscript !== null) {
      wscript.SendKeys('{F11}')
    }
  }
}

/**
 * 退出全屏
 */
export function exitFull() {
  var exitMethod = document.exitFullscreen || // W3C
      document.webkitExitFullscreen || // Chrome等
      document.mozCancelFullScreen || // FireFox
      document.msExitFullscreen // IE11
  if (exitMethod) {
    exitMethod.call(document)
  } else if (typeof window.ActiveXObject !== 'undefined') { // for Internet Explorer
    var wscript = new window.ActiveXObject('WScript.Shell')
    if (wscript !== null) {
      wscript.SendKeys('{F11}')
    }
  }
}

/**
 * 判断当前是否全屏
 */
export function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
}

/**
 * 全屏事件监听
 * @param {Function} handler 触发全屏事件后的处理方法
 */
export function onFullScreen(handler) {
  if (!handler) {
    console.error('回调函数不能为空')
    return
  }
  const fullscreenEvts = {
    'webkitRequestFullscreen': 'webkitfullscreenchange',
    'mozRequestFullScreen': 'mozfullscreenchange',
    'msRequestFullscreen': 'msfullscreenchange',
    'requestFullscreen': 'fullscreenchange'
  }
  const root = document.documentElement
  let evtName = ''
  for (let key in fullscreenEvts) {
    if (root[key]) {
      evtName = fullscreenEvts[key]
      break
    }
  }
  if (document.addEventListener) {
    document.addEventListener(evtName, handler, false)
  } else {
    document.attachEvent('on' + evtName, handler)
  }
}

/**
 * 取消全屏事件监听
 * @param {Function} handler 取消监听后的处理方法
 */
export function offFullScreen(handler) {
  const fullscreenEvts = {
    'webkitRequestFullscreen': 'webkitfullscreenchange',
    'mozRequestFullScreen': 'mozfullscreenchange',
    'msRequestFullscreen': 'msfullscreenchange',
    'requestFullscreen': 'fullscreenchange'
  }
  const root = document.documentElement
  let evtName = ''
  for (let key in fullscreenEvts) {
    if (root[key]) {
      evtName = fullscreenEvts[key]
      break
    }
  }
  if (document.removeEventListener) {
    document.removeEventListener(evtName, handler, false)
  } else {
    document.detachEvent('on' + evtName, handler)
  }
}
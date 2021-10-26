export default async function AMapLoader () {
  if (window.AMap && window.AMapUI) {
    return
  }
  // 未载入高德地图API，则先载入API再初始化
  await remoteLoad(`https://webapi.amap.com/maps?v=1.4.15&key=bd8b9b566463b9b5c9a7c588229b23f6`)
  await remoteLoad('https://webapi.amap.com/ui/1.0/main.js?v=1.0.11')
}

function remoteLoad (url, hasCallback) {
  let scriptElement = document.createElement('script')
  document.body.appendChild(scriptElement)

  const promise = new Promise((resolve, reject) => {
    scriptElement.addEventListener('load', e => {
      document.body.removeChild(scriptElement)
      if (!hasCallback) {
        resolve(e)
      }
    }, false)

    scriptElement.addEventListener('error', e => {
      document.body.removeChild(scriptElement)
      reject(e)
    }, false)

    if (hasCallback) {
      window.____callback____ = function () {
        resolve()
        window.____callback____ = null
      }
    }
  })

  if (hasCallback) {
    url += '&callback=____callback____'
  }

  scriptElement.src = url

  return promise
}
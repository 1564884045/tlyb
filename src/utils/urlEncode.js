export function urlEncode(param, key, encode) {
  if (!param) return ''
  var paramStr = ''
  var t = typeof param
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += '&' + key + '=' + (encode == null || encode ? encodeURIComponent(param) : param)
  } else {
    for (var i in param) {
      var k =
        key == null
          ? i
          : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
      paramStr += urlEncode(param[i], k, encode)
    }
    paramStr = '?' + paramStr.substring(1)
  }
  return paramStr
}

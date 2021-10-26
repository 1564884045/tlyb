/**
 * 格式化数字
 * @param {Number | String} number 要格式化的数字
 * @param {String} decimals 保留几位小数
 * @param {*} decPoint 小数点符号
 * @param {*} thousandsSep 千分位符号
 * @param {*} roundtag 舍入参数，默认 "ceil" 向上取,"floor"向下取,"round" 四舍五入
 */
export function formatNumber(number, decimals = 2, decPoint, thousandsSep, roundtag) {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '')
  roundtag = roundtag || 'ceil' // "ceil","floor","round"
  const n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = thousandsSep || ','
  var dec = decPoint || '.'
  var s = ''
  var toFixedFix = function (n, prec) {
    var k = Math.pow(10, prec)
    return '' + parseFloat(Math[roundtag](parseFloat((n * k).toFixed(prec * 2))).toFixed(prec * 2)) / k
  }
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  var re = /(-?\d+)(\d{3})/
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2')
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

/**
 * 人民币 数字转换为大写金额
 * @param {Float} money 人民币金额
 */
export function convertMoney(money) {
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(money)) {
    return '数据非法'
  }
  money = parseFloat(money)
  if (money === 0) {
    return '零元'
  }
  var unit = '千百拾亿千百拾万千百拾元角分'
  var str = ''
  money += '00'
  var p = money.indexOf('.')
  if (p >= 0) {
    money = money.substring(0, p) + money.substr(p + 1, 2)
  }
  unit = unit.substr(unit.length - money.length)
  for (var i = 0; i < money.length; i++) {
    str += '零壹贰叁肆伍陆柒捌玖'.charAt(money.charAt(i)) + unit.charAt(i)
  }
  return str.replace(/零(千|百|拾|角)/g, '零').replace(/(零)+/g, '零').replace(/零(万|亿|元)/g, '$1').replace(/(亿)万|壹(拾)/g, '$1$2').replace(/^元零?|零分/g, '').replace(/元$/g, '元整')
}
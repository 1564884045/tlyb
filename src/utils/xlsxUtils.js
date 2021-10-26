import XLSX from 'xlsx'
import XLSXStyle from 'xlsx-style'
import { saveAs } from 'file-saver'
import path from 'path'
import _ from 'lodash'
import moment from 'moment'
import { ImortRecord } from '../utils/storage'
import { MessageBox } from 'element-ui'

const FILE_NAME = '桃李云帮表格.xlsx'
const COL_PARAMS = ['hidden', 'wpx', 'width', 'wch', 'MDW']
const STYLE_PARAMS = ['fill', 'font', 'alignment', 'border']

/**
 * 数字转换成excel表头。 （递归处理）
 * @param {Number} num 需要转换的数字
 */
// eslint-disable-next-line no-unused-vars
function numToString(num) {
  let strArray = []
  let numToStringAction = function(o) {
    let temp = o - 1
    let a = parseInt(temp / 26)
    let b = temp % 26
    strArray.push(String.fromCharCode(64 + parseInt(b + 1)))
    if (a > 0) {
      numToStringAction(a)
    }
  }
  numToStringAction(num)
  return strArray.reverse().join('')
}

/**
 * 表头字母转换成数字。（进制转换）
 * @param {string} str 需要装换的字母
 */
function stringToNum(str) {
  let temp = str.toLowerCase().split('')
  let len = temp.length
  let getCharNumber = function(charx) {
    return charx.charCodeAt() - 96
  }
  let numout = 0
  let charnum = 0
  for (let i = 0; i < len; i++) {
    charnum = getCharNumber(temp[i])
    numout += charnum * Math.pow(26, len - i - 1)
  }
  return numout
}

/**
 * worksheet转成ArrayBuffer
 * @param {worksheet} s xlsx库中的worksheet
 */
function s2ab(s) {
  if (typeof ArrayBuffer !== 'undefined') {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF
    }
    return buf
  } else {
    const buf = new Array(s.length)
    for (let i = 0; i !== s.length; ++i) {
      buf[i] = s.charCodeAt(i) & 0xFF
    }
    return buf
  }
}

/**
 * 导出成Excel
 * @param {Array} data 数据
 * @param {Object} columns 每列参数说明。可直接写对应的中文名称，也可以写这一列的样式。比如列宽，背景色
 * @param {String} filename 文件名。可根据文件名后缀动态判断文件格式。支持xlsx, xlsm, xlsb（这三个支持自定义样式）, html, csv等
 * @param {Object} styleConf 其他xlsx-style的参数
 *
 * columns数据格式：{
 *         name: '姓名',
 *         sex: '性别',
 *         birthday: {
 *           name: '出生日期',
 *           wch: 14
 *         },
 *         address: {
 *           name: '地址',
 *           wpx: 160,
 *           alignment: { wrapText: true }
 *         }
 *       }
 *
 * styleConf数据格式: {
 *          'E4': {
 *             font: {
 *               bold: true,
 *               color: { rgb 'FFFF0000' }
 *             }
 *          },
 *          '!merges': [ // 合并第一行
 *             {
 *               s: { c: 0, r: 0 },
 *               e: { c: 7, r: 0 }
 *             }
 *          ]
 *        }
 */
export function exportExcel(data, columns, filename = FILE_NAME, styleConf) {
  let keys = _.keys(columns)
  let colNames = _.mapValues(columns, o => {
    if (_.isPlainObject(o)) {
      return o.name
    } else {
      return o
    }
  })

  // 创建工作簿
  let wb = XLSX.utils.book_new()

  // 显示表头
  const ws = XLSX.utils.json_to_sheet([
    colNames
  ], { header: keys, skipHeader: true })
  // 过滤数据，只显示表头包含的数据
  for (let i = 0; i < data.length; i++) {
    data[i] = _.pick(data[i], keys)
  }
  // 追加数据到excel中，从第二行开始
  XLSX.utils.sheet_add_json(ws, data, { header: keys, skipHeader: true, origin: 'A2' })

  wb.SheetNames.push('sheet1')
  wb.Sheets['sheet1'] = ws

  // 根据不同的扩展名，导出不同格式的文件
  let bookType = null
  let ext = path.extname(filename)
  if (ext == null) {
    filename += '.xlsx'
    bookType = 'xlsx'
  } else {
    bookType = ext.substr(1).toLowerCase()
  }

  let wbOut
  // 如果是支持样式的格式
  if (['xlsx', 'xlsm', 'xlsb'].includes(bookType)) {
    // ws['!merges'] = [{// 合并第一行数据[B1,C1,D1,E1]
    //   s: {// s为开始
    //     c: 0, // 开始列
    //     r: 0// 开始取值范围
    //   },
    //   e: {// e结束
    //     c: 7, // 结束列
    //     r: 0// 结束范围
    //   }
    // }]

    for (const key in ws) {
      // 第一行，表头
      if (key.replace(/[^0-9]/ig, '') === '1') {
        ws[key].s = {
          fill: {
            fgColor: { rgb: 'FFA3F4B1' }
          },
          font: {
            name: '宋体',
            sz: 12,
            bold: true
          },
          border: {
            bottom: {
              style: 'thin',
              color: 'FF000000'
            }
          }
        }
      } else {
        let str = key.replace(/[^A-Za-z]+$/ig, '')
        let colIndex = stringToNum(str) - 1
        if (keys[colIndex] && _.isPlainObject(columns[keys[colIndex]])) {
          const a = _.pick(columns[keys[colIndex]], STYLE_PARAMS)
          ws[key].s = _.assign(ws[key].s, a)
        }
      }
    }
    // 设置列宽
    const colsP = []
    _.mapValues(columns, o => {
      colsP.push(_.pick(o, COL_PARAMS))
    })
    ws['!cols'] = colsP

    // 合并其他样式参数
    if (styleConf) {
      for (const key in styleConf) {
        if (ws.hasOwnProperty(key)) {
          ws[key].s = styleConf[key]
        } else {
          ws[key] = styleConf[key]
        }
      }
    }
    wbOut = XLSXStyle.write(wb, { bookType: bookType, bookSST: false, type: 'binary' })
  } else {
    wbOut = XLSX.write(wb, { bookType: bookType, bookSST: false, type: 'binary' })
  }

  saveAs(new Blob([s2ab(wbOut)], { type: '' }), filename)
}

/**
 * 导入Excel
 * @param {File} file File文件
 */
export function importExcel(file) {
  // let colNames = _.keys(columns)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async function(e) {
      const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true })
      // 获取规则页
      const ruleWs = wb.Sheets['rules']
      let rules = XLSX.utils.sheet_to_json(ruleWs)
      if (rules.length === 0) {
        reject({ code: 1, message: '模板文件有误，请重新下载并使用最新的模板。' })
        return
      }
      let dataStartIndex = 2 // 数据开始行号
      let headerIndex = 1 // 表头行号
      if (rules.find(o => o.key === 'data_start_index')) {
        dataStartIndex = parseInt(rules.find(o => o.key === 'data_start_index').value)
        rules = rules.filter(o => o.key !== 'data_start_index')
      }
      if (rules.find(o => o.key === 'header_index')) {
        headerIndex = parseInt(rules.find(o => o.key === 'header_index').value)
        rules = rules.filter(o => o.key !== 'header_index')
      }
      let wsHeader = rules.map(o => o.value)
      const dataWs = wb.Sheets[wb.SheetNames[0]]
      let data = XLSX.utils.sheet_to_json(dataWs, { header: wsHeader })
      let dataList = []
      for (let i = 0; i < data.length; i++) {
        for (let key in data[i]) {
          if (`${data[i][key]}`.trim() !== '') {
            dataList.push(data[i])
            break
          }
        }
      }
      data = dataList
      // 校验表头
      const headerCol = data[headerIndex - 1]
      for (const key in headerCol) {
        if (key !== headerCol[key]) {
          reject({ code: 1, message: '模板文件有误，请重新下载并使用最新的模板。' })
          return
        }
      }
      // 过滤表头数据
      data = data.slice(dataStartIndex - 1)
      if (data == null || data.length === 0) {
        reject({ code: 2, message: '模板中没有数据，请确认后上传！' })
        return
      }

      const excelConf = {
        headerIndex,
        dataStartIndex,
        rules,
        filename: file.name || file.filename,
        CreatedDate: wb.Props.CreatedDate,
        ModifiedDate: wb.Props.ModifiedDate
      }
      if (ImortRecord.isImported(excelConf.filename, excelConf.CreatedDate, excelConf.ModifiedDate)) {
        try {
          await MessageBox.confirm('该文件已经上传过了，继续上传可能会有重复数据，是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        } catch (error) {
          reject({ code: 4, message: '文件重复，并且取消上传。' })
          return
        }
      }

      // 校验数据
      const errList = []
      const resList = []
      for (let i = 0; i < data.length; i++) {
        // 最多10条错误信息
        if (errList.length > 10) {
          reject({ code: 3, data: errList, excelConf })
          return
        }
        let res = {}
        // console.log(data[i])
        for (let j = 0; j < rules.length; j++) {
          const col = rules[j]
          let cell = data[i][col.value] // 单元格数据
          // 处理时间格式
          if (cell instanceof Date) {
            cell = moment(cell).format('YYYY-MM-DD HH:mm:ss')
          }
          // 必填校验
          if (col.required && (cell == null || cell === '')) {
            errList.push({
              row: i + dataStartIndex,
              column: col.value,
              errorMsg: col.message || ('请填写' + col.value)
            })
          }
          // 长度校验
          if (col.length && cell && cell.length > col.length) {
            errList.push({
              row: i + dataStartIndex,
              column: col.value,
              errorMsg: col.message || '数据超出长度！'
            })
          }
          // 正则校验
          if (col.pattern && cell && !new RegExp(col.pattern).test(cell)) {
            errList.push({
              row: i + dataStartIndex,
              column: col.value,
              errorMsg: col.message || '请填写正确的数据'
            })
          }
          // 组装正确的数据
          if (cell != null) res[col.key] = cell
        }

        // 没有出错
        resList.push(res)
      }
      if (errList.length > 0) {
        reject({ code: 3, data: errList, excelConf })
      }
      resolve({ data: resList, excelConf })
    }
    reader.readAsBinaryString(file)
  })
}

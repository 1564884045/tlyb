export default {
  getFileExt(fileName) {
    return fileName.replace(/.+\./, '').toLowerCase()
  },
  getFileInfo(filePath, key) {
    let temp = filePath.split('?')[0] // 去参数
    // eslint-disable-next-line no-useless-escape
    const re = /([^\.\/\\]+)\.([a-z]+)$/i
    const resultArr = re.exec(temp)
    const info = {}
    if (resultArr) {
      info.name = resultArr[1]
      info.type = resultArr[2]
    }
    return key ? info[key] : info
  }
}
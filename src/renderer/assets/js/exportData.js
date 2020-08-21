const fs = require('fs')
const os = require('os')
const xlsx = require('xlsx')

/**
 * 导出数据
 * @param fieldList 数据标题
 * @param exportData 导出数据
 * @param exportDataType 导出数据类型
 * @param path 路径
 * @param callback
 */
function exportTaskData (fieldList, exportData, exportDataType, path, callback) {
  if (exportDataType == 1) { // 导出xlsx
    let filePath = path + '.xlsx'
    createExcel(fieldList, exportData, filePath, (msg, res) => {
      callback(res, msg)
    })
  } else if (exportDataType == 3) {
    let filePath = path + '.json'
    createJson(exportData, filePath, (msg, success) => {
      callback(success, msg)
    })
  } else if (exportDataType == 4) {
    let filePath = path + '.csv'
    createCsv(fieldList, exportData, filePath, (msg, success) => {
      callback(success, msg)
    })
  }
}
/**
 * 导出excel
 * @param headArr 导出数据标题
 * @param excel  导出数据
 * @param filePath 保存路径
 * @param callback
 * @returns {*}
 */
function createExcel (headArr, excel, filePath, callback) {
  if (!(headArr instanceof Array) || !(excel instanceof Array) || typeof filePath !== 'string') {
    // console.log(headArr instanceof Array ,excel instanceof Array,typeof filePath);
    return callback('创建文件方法所需参数传递错误', null)
  } else {
    const headers = headArr.map(({ name }) => name)
    // 为 headArr 添加对应的单元格位置
    // [ { v: '标题', position: 'A1' },
    //   { v: '日期', position: 'B1' }]
      .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
    // 转换成 worksheet 需要的结构
    // { A1: { v: '标题' },
    //   B1: { v: '日期' }}
      .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {})

    const data = excel // 匹配 headers 的位置，生成对应的单元格数据
    // 匹配 headers 的位置，生成对应的单元格数据
    // [ [ { v: '开封市', position: 'A2' },
    //     { v: '2019-10-11', position: 'B2' }],
    //   [ { v: '洛阳市', position: 'A3' },
    //     { v: '2019-10-11', position: 'B3' }]
    // ]
      .map((v, i) => headArr.map(({ name }, j) => Object.assign({}, { v: v[name], position: String.fromCharCode(65 + j) + (i + 2) })))
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    // [ { v: '开封市', position: 'A2' },
    //   { v: '2019-10-11', position: 'B2' },
    //   { v: '洛阳市', position: 'A3' },
    //   { v: '2019-10-11', position: 'B3' }]
      .reduce((prev, next) => prev.concat(next))
      .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {})
    // 转换成 worksheet 需要的结构
    //   { A2: { v: '开封市' },
    //     B2: { v: '2019-10-11' },
    //     A3: { v: '洛阳市' },
    //     B3: { v: '2019-10-11' }}

    // 合并 headers 和 data
    // console.log(headers);
    // console.log(data);
    const output = Object.assign({}, headers, data)

    // 获取所有单元格的位置
    const outputPos = Object.keys(output)

    // 计算出范围
    const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]

    // 构建 workbook 对象
    const wb = {
      SheetNames: ['sheet1'],
      Sheets: {
        'sheet1': Object.assign({}, output, {'!ref': ref})
      }
    }

    // 导出文件
    xlsx.writeFile(wb, filePath)
    // const html = xlsx.utils.sheet_to_html(ws);
  }
  callback(null, true)
}

/**
 * 导出json格式文件
 * @param data
 * @param filePath
 * @param callback
 */
function createJson (data, filePath, callback) {
  let str = JSON.stringify(data, '', '\t')
  fs.writeFile(filePath, str, function (err) {
    if (err) {
      callback('写入失败', false)
    } else {
      callback(null, true)
    }
  })
}

/*
const fieldList = [{"name":"标题"},{"name":"日期"}];
const tableData = [
    {'标题':'开封市','日期':'2019-10-11'},
    {'标题':'洛阳市','日期':'2019-10-11'}];
*/
/**
 * 导出csv格式文件
 * @param data
 * @param filePath
 * @param callback
 */
function createCsv (fieldList, tbaleData, filePath, callback) {
  let csv = ''
  fieldList.forEach((field, index) => {
    csv = csv + field.name + ','
  })
  csv = csv.substring(0, csv.length - 1) + '\n'

  tbaleData.forEach((data, index) => {
    fieldList.forEach((field, index) => {
      csv = csv + data[field.name] + ','
    })
    csv = csv.substring(0, csv.length - 1) + '\n'
  })

  fs.writeFile(filePath, csv, function (err) {
    if (err) {
      callback('写入失败', false)
    } else {
      callback(null, true)
    }
  })
}

export {exportTaskData, createExcel, createJson, createCsv}

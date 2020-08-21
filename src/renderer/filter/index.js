
export default{

  /**
     * 时间格式化
     * @param fmt转化的格式
     * @param date 输入时间
     * @returns {void | string} 返回格式化后的时间
     */
  dateFormat: function (date, fmt) {
    if (date == null || date == undefined || date == '') {
      return ''
    }
    if (!(date instanceof Date)) {
      date = new Date(date)
    }

    var o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
    }
    return fmt
  },

  // 任务运行状态
  dictionary: function (state) {
    let dic = ''
    if (state == 0) {
      dic = '全部'
    } else if (state == 1) {
      dic = '未运行'
    } else if (state == -1) {
      dic = '正在等待'
    } else if (state == 2) {
      dic = '运行中'
    } else if (state == 3) {
      dic = '已停止'
    } else if (state == 4) {
      dic = '已完成'
    } else {
      // console.log(dic);
      dic = '未运行'
    }
    return dic
  }

}

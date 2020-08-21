// 通过remote模块取的原本在主进程中才能使用的session模块
const session = require('electron').remote.session
/**
 * 获得
 */
const Cookie = {}
const Session = session
Cookie.getCookies = (name) => {
  let data = []
  return new Promise(function (resolve, reject) {
    Session.defaultSession.cookies.get({ url: name }, function (error, cookies) {
      console.log('cookies', cookies)
      if (cookies.length > 0) {
        data = cookies
      }
      resolve(cookies)
    })
  })
}
/**
 * 清空缓存
 */
Cookie.clearCookies = (url, callback) => {
  Session.defaultSession.clearStorageData({
    origin: url,
    storages: ['cookies']
  }, function (error) {
    if (error) console.error(error)
    callback(error)
  })
}

/**
 * 保存cookie
 * @param name  cookie名称
 * @param value cookie值
 */
Cookie.setCookie = (name, value, url) => {
  let Days = 30
  let exp = new Date()
  let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60
  const cookie = {
    url: url,
    name: name,
    value: value,
    expirationDate: date
  }
  Session.defaultSession.cookies.set(cookie, (error) => {
    if (error) {
      console.log(error)
    }
  })
}
/**
 * 设置自定义cookie
 * @param cookieStr 自定义cookie
 * @param url 地址
 * @param rollback 回调方法
 */
Cookie.setCookies = (cookieStr, url, rollback) => {
  let cookies = cookieStr.split(';')
  cookies.forEach((cookie, item) => {
    cookie = cookie.trim()
    let arr = cookie.split('=')
    Cookie.setCookie(arr[0], arr[1], url)
  })
  rollback()
}

// export default cookie
export default Cookie

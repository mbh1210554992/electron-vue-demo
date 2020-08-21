'use strict'

import {app, Menu, Tray, BrowserWindow, ipcMain as ipc, globalShortcut} from 'electron'
const path = require('path')
const SqliteDB = require('../renderer/database/sqlite').SqliteDB;
var file = 'database.db'
var sqliteDB = new SqliteDB(file)

app.sqliteDB = sqliteDB
let mainWindow
let loginWin
let upgradeWin;
let aboutWin;
let registeWin;
let userInfoWin;
//托盘对象
let tray = null;
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/index`
  : `file://${__dirname}/index.html`

function createWindow () {
  if (loginWin) {
    try {
      loginWin.close();
    } catch (e) {
    }
  }
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 768,
    width: 1360,
    minWidth: 1360,
    minHeight: 768,
    backgroundColor: '#fff ',
    useContentSize: true,

    webPreferences: {webSecurity: false},
    frame: false,
    show: false,
    movable: true
  })
  mainWindow.loadURL(winURL)
  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.show()
  })
  // 系统图标
  let trayIcon = path.join(__static, '/img/icon.ico')
  console.log(trayIcon)
  tray = new Tray(trayIcon)

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '主界面',
      click: function () {
        mainWindow.show()
      }
    },
    {
      label: '关于',
      click: function () {
        if (aboutWin) {
          aboutWin.show()
        } else {
          createAboutWindow()
        }
      }
    },
    {
      label: '注销',
      click: function () {
        createLoginWindow()
      }
    },
    {
      label: '退出',
      click: function () {
        closeSchedule()
        app.quit()// 关闭
      }
    }
  ])

  // 设置此托盘图标的悬停提示内容
  tray.setToolTip('数据采集')

  // 设置图标的上下文菜单
  tray.setContextMenu(contextMenu)

  tray.on('click', function () {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createLoginWindow() {
  const modalPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#/login'
    : `file://${__dirname}/index.html#login`

  loginWin = new BrowserWindow({
    width: 464,
    height: 411,
    webPreferences: {
      webSecurity: false
    },
    frame: false,
    resizable: false, transparent: false, show: false, alwaysOnTop: false,
    //parent: mainWindow // mainWindow是主窗口
  })

  loginWin.loadURL(modalPath);

  //loginWin.webContents.openDevTools();
  loginWin.webContents.on('did-finish-load', function () {
    loginWin.show();
    if (mainWindow) {
      try {
        mainWindow.close();
      } catch (e) {
      }
    }
    if (tray) {
      try {
        tray.destroy();
      } catch (e) {
      }
    }
  });

  loginWin.on('closed', () => {
    loginWin = null
  })
}

app.on('ready', createLoginWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipc.on('window-close', function () {
  mainWindow.close()
  app.quit()
})
// 用户登录成功
ipc.on('user-login-success', function (event, arg) {
  createWindow();
});

// 关闭登录窗体
ipc.on('login-window-close', function () {
  loginWin = null;
  app.quit();
})

//最小化窗口
ipc.on('window-min',function () {
  mainWindow.minimize();
})
//最大化窗口
ipc.on('window-max', function () {
  if(mainWindow.isMaximized()){
    mainWindow.restore();
  }else{
    mainWindow.maximize();
  }
})

//注销登录，打开登录窗口
ipc.on('logout',function () {
  if(mainWindow){
    mainWindow.close();
  }
  createLoginWindow();
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

'use strict'

var menuItems = [
  {
    id: 'run',
    title: '点击',
    icon: '#run',
    items: [
      {
        id: 'clickElement',
        title: '点击链接',
        icon: '#eat'
      },
      {
        id: 'cycleClickAll',
        title: '循环全部点击',
        icon: '#shower'
      },
      {
        id: 'cycleClickOne',
        title: '循环单个点击',
        icon: '#sleep'
      },
      {
        id: 'cancelSelected',
        title: '取消',
        icon: '#close'
      }
    ]
  },
  {
    id: 'drive',
    title: '采集',
    icon: '#drive',
    items: [
      {
        id: 'selectText',
        title: '采集链接文本',
        icon: '#workout'
      },
      {
        id: 'selectTextInner',
        title: '采集InnerHtml',
        icon: '#knife'
      },
      {
        id: 'selectTextOut',
        title: '采集OutHtml',
        icon: '#machete'
      },
      {
        id: 'cancelSelected',
        title: '取消',
        icon: '#close'
      }
    ]
  },
  {
    id: 'enterText',
    title: '输入文字',
    icon: '#fight'
  },
  {
    id: 'cancelSelected',
    title: '取消',
    icon: '#close'
  }
  /* {
        id: 'weapon',
        title: '验证码',
        icon: '#weapon',
    } */
]

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export {menuItems}

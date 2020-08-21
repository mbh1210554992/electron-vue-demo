'use strict'
/**
 *流程采集配置模型
 */
export default {
  // 采集任务json
  task: {
    'id': '',
    'name': '采集任务',
    'order': 1,
    'groupId': '',
    'userId': '',
    'createTime': '',
    'taskData': [],
    // 定时任务：type:1不定时执行，2每周，3每天，4间隔，5cron，week：1周一，2周二...；time时间点；interval间隔，intervalStd间隔单位；cron表达式
    'cronStrategy': {'type': 1, 'week': 2, 'weekTime': '', 'dayTime': '', 'interval': 1, 'intervalStd': 4, 'cron': ''},
    'ipStrategy': {'isRadioIP': 0, 'ipSwitch': 1}, // 代理ip
    // 切换UA:type，1自定义切换周期，2切换代理ip时切换，uaSwitch切换周期，uaType标识，uaName名称，userAgent浏览器版本，userAgentList切换浏览器列表
    'uaStrategy': {'isUserAgent': 0, 'type': 0, 'uaSwitch': 1, 'uaType': 1, 'uaSystem': '', 'uaName': '', 'userAgent': '', 'userAgentList': [{'uaType': 1, 'uaName': '', 'userAgent': ''}]},
    // 采集策略：isIncrement是否增量采集,filterType增量采集去重类型1url,2request去重,crawlerModleType:模拟工具类型0selenium,1pyppeteer,
    // lastDate:记录上次采集数据的最大时间（用于触发器的上次采集数据）,screenshotType页面截图保存格式1图片0:base64,crawlerType:0web采集，1公众号采集
    'dataStrategy': {'isIncrement': 0, 'filterType': 1, 'isLocalService': 0, 'crawlerModleType': 0, 'lastDate': '', 'screenshotType': 1, 'isSendSms': 0},
    // taskType:采集类型web采集，1公众号采集 //wechatStrategy公众号任务配置，wechatTaskData公众号默认操作流程，appiumModel模拟器信息
    'taskType': 0,
    'wechatStrategy': {'weChatId': '', 'weChatName': '', 'sourceUrl': '', 'wechatTaskData': {}, 'appiumModel': {}, 'isFocusON': 0}
  },
  // 节点操作模型
  openUrl: {
    'id': '1',
    'name': '打开网址',
    'type': 1,
    'url': '',
    'isCycle': 0, // 使用循环0:不使用，1使用，下同
    'timeOut': 4, // 超时时间默认20秒
    'sleepTime': 1, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'cookie': {'isCustomCookie': 0, 'customCookie': ''}, // 设置cookie
    'isClearCache': 0, // 清除缓存
    'rollPage': {'isRoll': 0, 'rollWay': 1, 'rollNumber': 0, 'rollInterval': 1}, // 滚动页面：rollway,1滚动一屏，2直接滚动到底部；rollNumber滚动次数；rollinterval滚动间隔
    'retry': {'isOpenRetry': 0, // 是否重试
      'conditions': [{'conditionType': 1, 'conditionWay': 1, 'condition': '', 'iframeXpath': ''}], // 重试条件：conditionType:1网址，2文本，3元素xpath;conditionWay:1包括，2不包括；condition内容
      'maxRetryNumber': 1,
      'retryInterval': 0}, // 重试次数，重试间隔
    'order': 1
  },
  clickEle: {
    'id': '2',
    'name': '点击元素',
    'type': 2,
    'sleepTime': 1, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'isAutoRetry': 0, // 自动重试
    'isCycle': 0,
    'isNewTab': 0, // 是否打开新页面
    'isExecuteRepeat': 0, // 是否执行去重
    'repeatFilter': {'filterType': 1, 'reqUrl': ''}, // 去重方式1:url布隆过滤器，2:request指纹过滤
    'selectElement': {'selectElementWay': 1, 'selectElementInput': '', 'isInIframe': 0, 'iframeInput': '', 'isRelative': 0, 'relativeInput': ''}, // 选取元素：selectElementWay:1xpath,2css,3jsonPath,4正则；isInIframe元素是否在iframe，iframeInput：iframe路径
    'ajax': {'isAjaxLoading': 0, 'sleepTime': 0}, // ajax加载
    'rollPage': {'isRoll': 0, 'rollWay': 1, 'rollNumber': 0, 'rollInterval': 1}, // 滚动页面：rollway,1滚动一屏，2直接滚动到底部；rollNumber滚动次数；rollinterval滚动间隔
    'retry': {'isOpenRetry': 0, // 是否重试
      'conditions': [{'conditionType': 1, 'conditionWay': 1, 'condition': '', 'iframeXpath': ''}], // 重试条件：conditionType:1网址，2文本，3元素xpath;conditionWay:1包括，2不包括；condition内容
      'maxRetryNumber': 3,
      'retryInterval': 0}, // 重试次数，重试间隔
    'order': 2
  },
  inputText: {
    'id': '3',
    'name': '输入文本',
    'type': 3,
    'sleepTime': 1, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'isCycle': 0,
    'inputText': '', // 输入的文本
    'selectElement': {'selectElementWay': 1, 'selectElementInput': '', 'isInIframe': 0, 'iframeInput': ''}, // 选取元素：selectElementWay:1xpath,2css,3jsonPath,4正则；isInIframe元素是否在iframe，iframeInput：iframe路径
    'order': 3
  },
  circulate: {
    'id': '4',
    'name': '循环',
    'type': 4,
    'sleepTime': 1, // 等待时间
    'sleepXpath': '', // 等待出现元素
    'isInIframe': 0, // 元素是否在iframe中
    'iframeInput': '', // iframe路径xpath
    'cycleWay': 3, // 循环方式：1网址列表，2文本列表，3列表元素，4分页按钮，5下拉框
    'cycleInput': '', // 循环列表值
    'cycleEnd': {'isOpenCycleEnd': 0, 'cycleEndNumber': 1}, // 退出循环,isOpenCycleEnd:是否开启循环推出，cycleEndNumber：循环次数
    'childOperate': [], // 子步骤
    'extract': {'isExtractChild': 0, 'extractXpath': '', 'extractUrl': ''}, // 采集子元素设置
    'isMergeField': 0, // 合并字段
    'order': 4
  },
  extract: {
    'id': '5',
    'name': '提取元素',
    'type': 5,
    'fieldList': [
      {'name': '字段名',
        'id': 0,
        'mergeSameField': 1,
        'mergeDiffentField': 1,
        'selectElement': {'selectElementWay': 1, 'selectElementInput': '', 'isInIframe': 0, 'iframeInput': '', 'isRelative': 0, 'relativeInput': ''}, // 提取元素：selectElementWay:1xpath,2css,3jsonPath,4正则；
        // 提取方式 1提取元素熟悉(attributeName),2文本，3out-html,4inner-html,5页面网址，6页面标题，7页面源码中抓取（抓取extractxpath,匹配类型matchType:1匹配第一个，2匹配所有）,8固定值inputText,9当前时间
        extractWay: {'type': 1, 'attributeName': '', 'extractXpath': '', 'matchType': 1, 'inputText': ''},
        'dealNoFindWay': 1,
        'defaultValue': '',
        'value': '',
        // 格式化：type:1字符串替换，oldStr需要替换的内容，newStr替换成的内容 {"type":1,"id":0,"name":"替换","oldStr":"","newStr":""}
        'formatConfigList': []
      }
    ],
    'triggerList': [],
    'sleepTime': 1, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'isCycle': 0, // 采集当前循环中设置的元素
    'order': 5
  },
  fieldExtract: {// 采集字段配置
    'name': '字段名',
    'id': 0,
    'mergeSameField': 1,
    'mergeDiffentField': 1, // mergeSameField同一字段合并,循环提取合并成一行，mergeDiffentField不同字段合并，
    'selectElement': {'selectElementWay': 1, 'selectElementInput': '', 'isInIframe': 0, 'iframeInput': '', 'isRelative': 0, 'relativeInput': ''}, // 提取元素：selectElementWay:1xpath,2css,3id
    // 提取方式 1提取元素熟悉(attributeName),2文本，3out-html,4inner-html,5页面网址，6页面标题，7页面源码中抓取（抓取extractxpath,匹配类型matchType:1匹配第一个，2匹配所有）,8固定值inputText,9当前时间
    // 10截取当前屏幕(底部高度bottomHeight 默认100px, 每次减少高度everyReduceHeight 默认0,screenshotType:截图类型，1长截图（longOpenRoll 开启滚动,  scrRollInterval 滚动间隔）
    // 2拼接截图（scrRollInterval 滚动间隔）),
    'extractWay': {'type': 2,
      'attributeName': '',
      'extractXpath': '',
      'matchType': 1,
      'inputText': '',
      'bottomHeight': 100,
      'everyReduceHeight': 0,
      'screenshotType': 1,
      'longOpenRoll': 0,
      'scrRollInterval': 0,
      'maxRollNum': 10
    },
    'dealNoFindWay': 1,
    'defaultValue': '',
    'value': '',
    // 格式化：type:1字符串替换，oldStr需要替换的内容，newStr替换成的内容 {"type":1,"order":0,"name":"替换","oldStr":"","newStr":""}
    'formatConfigList': []
  },
  conditional: {
    'id': '6',
    'name': '判断条件',
    'type': 6,
    'sleepTime': 1, // 等待时间
    'sleepXpath': '', // 等待出现元素
    'childOperate': [
      {
        'id': 71,
        'name': '条件分支',
        'type': 7,
        'sleepTime': 1,
        'sleepXpath': '',
        'conditionType': 1, // 1不判断，总是执行该分支，2当前页面包含文本，3当前页面包含元素
        'conditionValue': '',
        'isInIframe': 0, // 元素是否在iframe中
        'iframeInput': '', // iframe路径xpath
        'childOperate': []
      },
      {
        'id': 72,
        'name': '条件分支',
        'type': 7,
        'sleepTime': 1,
        'sleepXpath': '',
        'conditionType': 1, // 1不判断，总是执行该分支，2当前页面包含文本，3当前页面包含元素
        'conditionValue': '',
        'isInIframe': 0, // 元素是否在iframe中
        'iframeInput': '', // iframe路径xpath
        'childOperate': []
      }
    ], // 子步骤
    'order': 5
  },
  codeExtract: {
    'id': '9',
    'name': '验证码',
    'type': 9,
    'sleepTime': 1, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'codeType': 1, // 验证码类型
    // 选取元素：selectElementWay:1xpath,2css,3jsonPath,4正则；isInIframe元素是否在iframe，iframeInput：iframe路径,ocrType1本地服务识别2华为云识别，
    // isThreshBin是否二值化处理，threshBin二值化阈值，isClearNoise是否去噪，noiseRate去噪阈值
    'selectElement': {'selectElementWay': 1,
      'selectElementInput': '',
      'selectElementText': '',
      'selectElementCode': '',
      'selectElementClick': '',
      'isInIframe': 0,
      'iframeInput': '',
      'ocrType': 2,
      'isThreshBin': 1,
      'threshBin': 100,
      'isClearNoise': 0,
      'noiseRate': 3},
    'ajax': {'isAjaxLoading': 0, 'sleepTime': 0}, // ajax加载
    'retry': {'isOpenRetry': 0, // 是否重试
      'conditions': [{'conditionType': 1, 'conditionWay': 1, 'condition': '', 'iframeXpath': ''}], // 重试条件：conditionType:1网址，2文本，3元素xpath;conditionWay:1包括，2不包括；condition内容
      'maxRetryNumber': 3,
      'retryInterval': 0}, // 重试次数，重试间隔
    'order': 9
  },

  /** 公众号采集配置**/
  wechatTaskData: [
    // 选取元素：selectElementWay:1xpath,2id,3内容
    {'id': '1', 'name': '点击搜索', 'type': 2, 'sleepTime': 20, 'sleepXpath': '//android.widget.RelativeLayout[@resource-id="com.tencent.mm:id/dn7"]', 'selectElement': {'selectElementWay': 1, 'selectElementInput': '//android.widget.RelativeLayout[@resource-id="com.tencent.mm:id/dn7"]'}, 'order': 1},
    {'id': '2', 'name': '输入公众号', 'type': 3, 'sleepTime': 5, 'sleepXpath': '', 'inputText': '', 'selectElement': {'selectElementWay': 2, 'selectElementInput': 'com.tencent.mm:id/bhn'}, 'order': 2},
    {'id': '3', 'name': '点击元素', 'type': 2, 'sleepTime': 5, 'sleepXpath': '', 'selectElement': {'selectElementWay': 2, 'selectElementInput': 'com.tencent.mm:id/h1r'}, 'order': 3},
    {'id': '4', 'name': '点击公众号', 'type': 2, 'sleepTime': 5, 'sleepXpath': '', 'selectElement': {'selectElementWay': 1, 'selectElementInput': '//android.webkit.WebView[@content-desc="搜一搜"]/android.view.View[2]'}, 'order': 4},
    {'id': '5',
      'name': '循环列表',
      'type': 4,
      'sleepTime': 5,
      'sleepXpath': '',
      'selectElement': {'selectElementWay': 1, 'selectElementInput': '//android.widget.ListView[@resource-id="android:id/list"]/android.widget.LinearLayout/android.view.ViewGroup'},
      'cycleEnd': {'isOpenCycleEnd': 0, 'cycleEndNumber': 1},
      'order': 5
    }
  ],
  wechatExtract: {
    'id': '5',
    'name': '提取公众号信息',
    'type': 5,
    'fieldList': [
      {'name': 'title',
        'id': 0,
        'mergeSameField': 1,
        'mergeDiffentField': 1,
        'selectElement': {'selectElementWay': 1, 'selectElementInput': '//*[@id="activity-name"]'},
        'extractWay': {'type': 2, 'attributeName': '', 'extractXpath': '', 'matchType': 1, 'inputText': ''},
        'dealNoFindWay': 1,
        'defaultValue': '',
        'value': '--',
        'formatConfigList': []
      },
      {'name': 'date',
        'id': 2,
        'mergeSameField': 1,
        'mergeDiffentField': 1,
        'selectElement': {'selectElementWay': 1, 'selectElementInput': '//*[@id="publish_time"]', 'isDate': 1},
        'extractWay': {'type': 2, 'attributeName': '', 'extractXpath': '', 'matchType': 1, 'inputText': ''},
        'dealNoFindWay': 1,
        'defaultValue': '',
        'value': '--',
        'formatConfigList': []
      },
      {'name': 'content',
        'id': 3,
        'mergeSameField': 1,
        'mergeDiffentField': 1,
        'selectElement': {'selectElementWay': 1, 'selectElementInput': '//*[@id="js_content"]'},
        'extractWay': {'type': 3, 'attributeName': '', 'extractXpath': '', 'matchType': 1, 'inputText': ''},
        'dealNoFindWay': 1,
        'defaultValue': '',
        'value': '--',
        'formatConfigList': []
      },
      {'name': 'source',
        'id': 4,
        'mergeSameField': 1,
        'mergeDiffentField': 1,
        'selectElement': {'selectElementWay': 1, 'selectElementInput': ''},
        'extractWay': {'type': 5, 'attributeName': '', 'extractXpath': '', 'matchType': 1, 'inputText': ''},
        'dealNoFindWay': 1,
        'defaultValue': '',
        'value': '--',
        'formatConfigList': []
      }
    ],
    'triggerList': [],
    'sleepTime': 2, // 等待时间 默认1秒
    'sleepXpath': '', // 等待出现元素
    'isCycle': 0, // 采集当前循环中设置的元素
    'order': 1
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// export {openUrl,clickEle,inputText,circulate,extract}

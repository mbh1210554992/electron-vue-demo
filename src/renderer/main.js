import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import filters from './filter/index'
import './assets/css/base.css'
import './assets/css/common.css'
import './assets/css/iconfont/iconfont.css'
import comm from './util/common'

//过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(Element)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.utils = comm;

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

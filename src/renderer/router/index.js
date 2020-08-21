import Vue from 'vue'
import Router from 'vue-router'

const index = () => import('../components/index')
const list = () => import('../components/list')
const table = () => import('../components/table')
const taskDetail = () => import('../components/taskDetail')
const login = () => import('../components/login')
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/login',
      component: login,
      name: 'login'
    },
    {
      path: '/index',
      name: 'index',
      component: index,
      children: [
        {
          path: '',
          name: 'list',
          component: list
        },
        {
          path: 'list',
          name: 'list',
          component: list
        },
        {
          path: 'table',
          name: 'table',
          component: table
        },
        {
          path: 'taskDetail',
          name: 'taskDetail',
          component: taskDetail
        }

      ]
    }
  ]
})
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import KukuDoge from './views/KukuDoge.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/kukudoge',
      name: 'home',
      component: KukuDoge
    }
  ]
})

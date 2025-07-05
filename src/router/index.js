import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.config.js instead!
    // quasar.config.js -> build -> vueRouterMode
    // quasar.config.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // 添加路由守卫
  Router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
    const isAuthenticated = !!localStorage.getItem('token')

    console.log('🚦 路由守卫:', {
      route: to.fullPath,
      requiresAuth,
      requiresAdmin,
      isAuthenticated,
    })

    if (requiresAuth && !isAuthenticated) {
      // 如果需要登录但未登录，重定向到登录页面
      console.log('⚠️ 需要登录权限，重定向至登录页面')
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      })
    } else if (requiresAdmin && isAuthenticated) {
      // 如果需要管理员权限，检查用户角色
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // 更新为中文角色名
          const isAdmin = user.role === '普通管理员' || user.role === '超级管理员'
          if (!isAdmin) {
            console.log('⚠️ 需要管理员权限，但当前用户不是管理员')
            next('/')
            return
          }
          console.log('✅ 管理员权限验证通过')
        } catch (error) {
          console.error('❌ 解析用户数据失败:', error)
          next('/')
          return
        }
      } else {
        console.log('⚠️ 需要管理员权限，但未找到用户数据')
        next('/')
        return
      }
      next()
    } else {
      next()
    }
  })

  return Router
})

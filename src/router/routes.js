const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'lose',
        component: () => import('pages/LosePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'find',
        component: () => import('pages/FindPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'message',
        component: () => import('pages/MessagePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'user',
        component: () => import('pages/UserPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      // { path: 'register', component: () => import('pages/RegisterPage.vue') }, // 暂时注释掉，等组件创建后再启用
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

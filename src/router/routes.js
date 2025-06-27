const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'lose', component: () => import('pages/LosePage.vue') },
      { path: 'find', component: () => import('pages/FindPage.vue') },
      { path: 'message', component: () => import('pages/MessagePage.vue') },
      { path: 'user', component: () => import('pages/UserPage.vue') },
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

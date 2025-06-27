<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-avatar circle>
          <img src="favicon.ico">
        </q-avatar>
        <q-toolbar-title>
          易寻 校园失物招领平台
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <q-tabs v-model="tab" inline-label class="text-white">
        <q-route-tab name="home" icon="home" :label="!$q.screen.lt.md ? '首页' : ''" to="/" />
        <q-route-tab name="lose" icon="wrong_location" :label="!$q.screen.lt.md ? '我丢失了物品' : ''" to="/lose" />
        <q-route-tab name="find" icon="radar" :label="!$q.screen.lt.md ? '我找到了物品' : ''" to="/find" />
        <q-route-tab name="message" icon="forum" :label="!$q.screen.lt.md ? '留言板' : ''" to="/message" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'

const route = useRoute()
const tab = ref('home')
const $q = useQuasar()

// 根据当前路由设置选中的标签
const updateTab = () => {
  const path = route.path
  if (path === '/') {
    tab.value = 'home'
  } else if (path === '/lose') {
    tab.value = 'lose'
  } else if (path === '/find') {
    tab.value = 'find'
  } else if (path === '/message') {
    tab.value = 'message'
  }
}

// 监听路由变化
watch(() => route.path, updateTab)

// 组件挂载时初始化
onMounted(() => {
  updateTab()
})

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

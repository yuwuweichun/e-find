<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-avatar circle>
          <img src="/favicon.ico">
        </q-avatar>
        <q-toolbar-title>
          易寻 校园失物招领平台
        </q-toolbar-title>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="300" :breakpoint="400" :overlay="$q.screen.lt.md">
      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm" @click="handleUserClick" style="cursor:pointer;">
            <img :src="avatar" style="object-fit: cover; width: 100%; height: 100%; object-position: center;" />
          </q-avatar>
          <div class="text-weight-bold" @click="handleUserClick" style="cursor:pointer;">{{ displayName }}</div>
        </div>
      </q-img>
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
        <q-list padding>
          <q-item clickable v-ripple to="/" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              首页
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/lose">
            <q-item-section avatar>
              <q-icon name="wrong_location" />
            </q-item-section>
            <q-item-section>
              我丢失了物品
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/find">
            <q-item-section avatar>
              <q-icon name="radar" />
            </q-item-section>
            <q-item-section>
              我找到了物品
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/message">
            <q-item-section avatar>
              <q-icon name="forum" />
            </q-item-section>
            <q-item-section>
              留言板
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/user">
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>
            <q-item-section>
              个人中心
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>


  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'

const route = useRoute()
const router = useRouter()
const tab = ref('home')
const $q = useQuasar()

const userStore = useUserStore()
userStore.loadFromStorage()
userStore.fetchProfile()

const avatar = computed(() => userStore.avatar)
const displayName = computed(() => userStore.displayName)

function handleUserClick() {
  if (!userStore.isLoggedIn) {
    router.push('/auth/login')
  } else {
    router.push('/user')
  }
}

// 根据当前路由设置选中的标签
const updateTab = () => {
  const path = route.path.replace('/', '')
  tab.value = path === '' ? 'home' : path
}

// 监听路由变化
watch(() => route.path, updateTab)

// 组件挂载时初始化
onMounted(() => {
  updateTab()
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

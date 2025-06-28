<template>
  <q-page class="user-page">
    <!-- 顶部用户信息区域 -->
    <div class="user-header">
      <div class="header-bg"></div>
      <div class="user-info">
        <div class="avatar-section">
          <q-avatar size="80px" class="user-avatar">
            <img :src="avatar" alt="用户头像" />
            <q-btn flat round color="white" icon="camera_alt" size="sm" class="avatar-edit-btn" @click="editAvatar">
              <q-tooltip>更换头像</q-tooltip>
            </q-btn>
          </q-avatar>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ userInfo.name }}</h2>
          <p class="user-email">{{ userInfo.email }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userInfo.posts }}</span>
              <span class="stat-label">发布</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userInfo.found }}</span>
              <span class="stat-label">找回</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userInfo.helped }}</span>
              <span class="stat-label">帮助</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 快速操作卡片 -->
      <q-card class="quick-actions-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="dashboard" size="1.5rem" color="white" />
            <span class="card-title">快速操作</span>
          </div>
        </q-card-section>
        <q-card-section class="actions-grid">
          <div class="action-item" @click="navigateTo('/find')">
            <q-icon name="add_circle" size="2rem" color="primary" />
            <span>发布招领</span>
          </div>
          <div class="action-item" @click="navigateTo('/lose')">
            <q-icon name="report_problem" size="2rem" color="orange" />
            <span>发布失物</span>
          </div>
          <div class="action-item" @click="navigateTo('/message')">
            <q-icon name="forum" size="2rem" color="teal" />
            <span>留言板</span>
          </div>
          <div class="action-item" @click="showSearch = true">
            <q-icon name="search" size="2rem" color="purple" />
            <span>搜索物品</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- 我的发布 -->
      <q-card class="my-posts-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="history" size="1.5rem" color="white" />
            <span class="card-title">我的发布</span>
          </div>
        </q-card-section>
        <q-card-section>
          <q-tabs v-model="activeTab" class="text-grey-8" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
            <q-tab name="all" label="全部" />
            <q-tab name="find" label="招领" />
            <q-tab name="lose" label="失物" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="all" class="q-pa-none">
              <div v-if="myPosts.length === 0" class="empty-state">
                <q-icon name="inbox" size="3rem" color="grey-4" />
                <p>暂无发布记录</p>
              </div>
              <div v-else class="posts-list">
                <div v-for="post in myPosts" :key="post.id" class="post-item" @click="viewPost(post)">
                  <div class="post-icon">
                    <q-icon :name="post.type === 'find' ? 'search' : 'lost_and_found'"
                      :color="post.type === 'find' ? 'primary' : 'orange'" size="1.5rem" />
                  </div>
                  <div class="post-content">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-info">
                      <span class="post-type">{{ post.type === 'find' ? '招领' : '失物' }}</span>
                      <span class="post-time">{{ formatTime(post.time) }}</span>
                    </div>
                  </div>
                  <div class="post-status">
                    <q-chip :color="post.status === 'active' ? 'positive' : 'grey'" text-color="white" size="sm">
                      {{ post.status === 'active' ? '进行中' : '已结束' }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="find" class="q-pa-none">
              <div class="posts-list">
                <div v-for="post in findPosts" :key="post.id" class="post-item" @click="viewPost(post)">
                  <div class="post-icon">
                    <q-icon name="search" color="primary" size="1.5rem" />
                  </div>
                  <div class="post-content">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-info">
                      <span class="post-time">{{ formatTime(post.time) }}</span>
                    </div>
                  </div>
                  <div class="post-status">
                    <q-chip color="positive" text-color="white" size="sm">
                      进行中
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="lose" class="q-pa-none">
              <div class="posts-list">
                <div v-for="post in losePosts" :key="post.id" class="post-item" @click="viewPost(post)">
                  <div class="post-icon">
                    <q-icon name="lost_and_found" color="orange" size="1.5rem" />
                  </div>
                  <div class="post-content">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-info">
                      <span class="post-time">{{ formatTime(post.time) }}</span>
                    </div>
                  </div>
                  <div class="post-status">
                    <q-chip color="positive" text-color="white" size="sm">
                      进行中
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- 设置菜单 -->
      <q-card class="settings-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="settings" size="1.5rem" color="white" />
            <span class="card-title">设置</span>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list>
            <q-item clickable v-ripple @click="editProfile">
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>编辑资料</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="showNotifications = true">
              <q-item-section avatar>
                <q-icon name="notifications" color="orange" />
              </q-item-section>
              <q-item-section>消息通知</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="showPrivacy = true">
              <q-item-section avatar>
                <q-icon name="security" color="green" />
              </q-item-section>
              <q-item-section>隐私设置</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="showHelp = true">
              <q-item-section avatar>
                <q-icon name="help" color="info" />
              </q-item-section>
              <q-item-section>帮助中心</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative">退出登录</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- 搜索对话框 -->
    <q-dialog v-model="showSearch">
      <q-card class="search-dialog">
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="search" size="1.5rem" color="white" />
            <span class="card-title">搜索物品</span>
          </div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="searchQuery" placeholder="输入物品名称或描述" outlined class="search-input">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn unelevated label="搜索" color="primary" @click="performSearch" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

import avatar from 'src/assets/icons/user_avatar.png'

const $q = useQuasar()
const router = useRouter()

// 响应式数据
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')

// 用户信息
const userInfo = ref({
  name: 'username',
  email: 'username@example.com',
  posts: 12,
  found: 8,
  helped: 15
})

// 我的发布数据
const myPosts = ref([
  {
    id: 1,
    title: '在图书馆捡到一部手机',
    type: 'find',
    status: 'active',
    time: '2024-01-15 14:30'
  },
  {
    id: 2,
    title: '丢失了钱包，内有重要证件',
    type: 'lose',
    status: 'active',
    time: '2024-01-14 16:20'
  },
  {
    id: 3,
    title: '在食堂捡到一串钥匙',
    type: 'find',
    status: 'active',
    time: '2024-01-13 09:15'
  }
])

// 计算属性
const findPosts = computed(() =>
  myPosts.value.filter(post => post.type === 'find')
)

const losePosts = computed(() =>
  myPosts.value.filter(post => post.type === 'lose')
)

// 方法
const editAvatar = () => {
  $q.notify({
    type: 'info',
    message: '头像编辑功能开发中...',
    position: 'top'
  })
}

const navigateTo = (path) => {
  router.push(path)
}

const viewPost = (post) => {
  $q.notify({
    type: 'info',
    message: `查看${post.title}`,
    position: 'top'
  })
}

const editProfile = () => {
  $q.notify({
    type: 'info',
    message: '编辑资料功能开发中...',
    position: 'top'
  })
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    $q.notify({
      type: 'info',
      message: `搜索: ${searchQuery.value}`,
      position: 'top'
    })
    showSearch.value = false
    searchQuery.value = ''
  }
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const logout = () => {
  $q.dialog({
    title: '确认退出',
    message: '您确定要退出登录吗？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: '已退出登录',
      position: 'top'
    })
    // 这里可以添加退出登录的逻辑
  })
}
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  position: relative;
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  padding: 2rem 1rem 3rem;
  color: white;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
}

.user-info {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

/* .avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
} */

.user-avatar img {
  object-fit: cover;
  object-position: center;
  width: 100%;
  height: 100%;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.page-content {
  padding: 0 1rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  margin-top: -2rem;
}

.quick-actions-card,
.my-posts-card,
.settings-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  color: white;
  padding: 1.5rem;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.action-item span {
  font-weight: 600;
  color: #333;
}

.posts-list {
  padding: 1rem;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.post-item:hover {
  background: #f8f9fa;
}

.post-icon {
  flex-shrink: 0;
}

.post-content {
  flex: 1;
}

.post-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.post-info {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.post-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.post-status {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-state p {
  margin: 1rem 0 0 0;
}

.search-dialog {
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
}

.search-input {
  margin-top: 1rem;
}

/* 移动端优化 */
@media (max-width: 600px) {
  .user-header {
    padding: 1.5rem 1rem 2.5rem;
  }

  .user-name {
    font-size: 1.25rem;
  }

  .user-stats {
    gap: 1.5rem;
  }

  .page-content {
    padding: 0 0.75rem 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }

  .action-item {
    padding: 1rem;
  }
}
</style>

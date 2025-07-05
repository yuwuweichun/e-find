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
          <h2 class="user-name">{{ displayName }}</h2>
          <p class="user-email">{{ user.value?.phone || user.value?.student_no || '' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userInfo.posts }}</span>
              <span class="stat-label">发布</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userInfo.messages }}</span>
              <span class="stat-label">留言</span>
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
                    <q-chip :color="getStatusColor(post.status)" text-color="white" size="sm">
                      {{ getStatusLabel(post.status) }}
                    </q-chip>
                    <q-btn v-if="post.status === 'approved'" size="sm" color="info" flat label="标记为已结束"
                      @click="markAsFinished(post)" class="q-ml-sm" />
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
                    <q-chip :color="getStatusColor(post.status)" text-color="white" size="sm">
                      {{ getStatusLabel(post.status) }}
                    </q-chip>
                    <q-btn v-if="post.status === 'approved'" size="sm" color="info" flat label="标记为已结束"
                      @click="markAsFinished(post)" class="q-ml-sm" />
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
                    <q-chip :color="getStatusColor(post.status)" text-color="white" size="sm">
                      {{ getStatusLabel(post.status) }}
                    </q-chip>
                    <q-btn v-if="post.status === 'approved'" size="sm" color="info" flat label="标记为已结束"
                      @click="markAsFinished(post)" class="q-ml-sm" />
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

            <q-item clickable v-ripple @click="notificationFeature">
              <q-item-section avatar>
                <q-icon name="notifications" color="orange" />
              </q-item-section>
              <q-item-section>消息通知</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="privacyFeature">
              <q-item-section avatar>
                <q-icon name="security" color="green" />
              </q-item-section>
              <q-item-section>隐私设置</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-ripple @click="helpFeature">
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

    <!-- 编辑资料弹窗 -->
    <q-dialog v-model="showEditProfile">
      <q-card style="min-width:350px;max-width:90vw;">
        <q-card-section class="text-h6">编辑资料</q-card-section>
        <q-card-section class="q-pa-md">
          <!-- 头像上传区域 -->
          <div class="avatar-upload-section">
            <div class="avatar-preview">
              <q-avatar size="100px">
                <img :src="avatarPreview || editForm.avatar_url || avatar" alt="头像预览"
                  style="object-fit: cover; width: 100%; height: 100%;" />
              </q-avatar>
            </div>
            <div class="upload-controls">
              <q-file v-model="avatarFile" label="选择头像图片" outlined accept="image/*"
                @update:model-value="handleFileSelected" style="max-width: 220px">
                <template v-slot:prepend>
                  <q-icon name="add_photo_alternate" color="primary" />
                </template>
                <template v-slot:hint>
                  支持jpg, png格式，不超过2MB
                </template>
              </q-file>
              <q-btn :disable="!avatarFile" label="上传头像" color="primary" dense class="q-mt-sm"
                :loading="avatarUploading" @click="uploadAvatar" />
            </div>
          </div>

          <!-- 用户基本信息 -->
          <div class="user-fields q-mt-md">
            <!-- 不可修改字段 -->
            <q-input v-model="editForm.id" label="用户ID" disable readonly />
            <q-input v-model="editForm.username" label="用户名" disable readonly />
            <q-input v-model="editForm.role" label="角色" disable readonly />

            <!-- 可修改字段 -->
            <q-input v-model="editForm.full_name" label="真实姓名" />
            <q-input v-model="editForm.phone" label="手机号"
              :rules="[val => !val || /^1[3-9]\d{9}$/.test(val) || '请输入有效的手机号码']" />
            <q-input v-model="editForm.student_no" label="学号" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup :disable="editLoading" />
          <q-btn flat label="保存" color="primary" :loading="editLoading" @click="saveProfile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { useQuasar } from 'quasar'
import { getUserStats, getMyItems } from 'src/services/api'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()
userStore.loadFromStorage()
userStore.fetchProfile()

const avatar = computed(() => userStore.avatar)
const user = computed(() => userStore.user)
const displayName = computed(() => userStore.displayName)

// 响应式数据
const activeTab = ref('all')
const showSearch = ref(false)
const searchQuery = ref('')
const avatarPreview = ref(null)

// 用户信息统计
const userInfo = ref({
  posts: 0,
  found: 0,
  lose: 0,
  helped: 0,
  messages: 0
})

// 我的发布数据
const myPosts = ref([])

// 计算属性
const findPosts = computed(() =>
  myPosts.value.filter(post => post.type === 'found')
)

const losePosts = computed(() =>
  myPosts.value.filter(post => post.type === 'lost')
)

// 未实现功能通知
const notificationFeature = () => {
  $q.notify({ type: 'info', message: '消息通知功能开发中...' })
}

const privacyFeature = () => {
  $q.notify({ type: 'info', message: '隐私设置功能开发中...' })
}

const helpFeature = () => {
  $q.notify({ type: 'info', message: '帮助中心功能开发中...' })
}

// 获取用户统计信息和我的发布
async function fetchUserData() {
  try {
    const statsRes = await getUserStats()
    if (statsRes.success) {
      userInfo.value = statsRes.data
    }
    const postsRes = await getMyItems({ limit: 100 })
    if (postsRes.success) {
      myPosts.value = (postsRes.data.items || []).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        time: item.posted_date
      }))
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '获取数据失败' })
  }
}

onMounted(fetchUserData)

// 方法
const editAvatar = () => {
  $q.notify({ type: 'info', message: '更换头像功能请在编辑资料中操作' })
  showEditProfile.value = true
}

const navigateTo = (path) => {
  router.push(path)
}

const viewPost = (post) => {
  $q.notify({
    type: 'info',
    message: `查看详情功能开发中... (${post.title})`,
    position: 'top'
  })
}

const showEditProfile = ref(false)
const editForm = ref({ ...user.value })
const editLoading = ref(false)
const avatarFile = ref(null)
const avatarUploading = ref(false)

async function saveProfile() {
  editLoading.value = true
  try {
    await userStore.updateProfile({
      full_name: editForm.value.full_name,
      phone: editForm.value.phone,
      student_no: editForm.value.student_no,
    })
    $q.notify({ type: 'positive', message: '资料更新成功' })
    showEditProfile.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '资料更新失败' })
  }
  editLoading.value = false
}

const editProfile = () => {
  showEditProfile.value = true
  editForm.value = { ...user.value }
  avatarPreview.value = null
  avatarFile.value = null
}

const logout = () => {
  userStore.logout()
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    $q.notify({
      type: 'info',
      message: `搜索功能开发中... (搜索词: ${searchQuery.value})`,
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

// 状态显示辅助函数
function getStatusLabel(status) {
  switch (status) {
    case 'pending': return '未审核'
    case 'approved': return '进行中'
    case 'rejected': return '已驳回'
    case 'finished': return '已结束'
    default: return status
  }
}
function getStatusColor(status) {
  switch (status) {
    case 'pending': return 'grey'
    case 'approved': return 'positive'
    case 'rejected': return 'negative'
    case 'finished': return 'info'
    default: return 'grey'
  }
}

// 新增方法
async function markAsFinished(post) {
  try {
    // 这里的API调用可能不正确，因为getMyItems可能没有updateItem方法
    // 所以添加开发中提示
    console.log('标记物品ID:', post.id)
    $q.notify({ type: 'info', message: '标记为已结束功能开发中...' })
  } catch {
    $q.notify({ type: 'negative', message: '操作失败' })
  }
}

const handleFileSelected = () => {
  // 验证文件大小
  if (avatarFile.value && avatarFile.value.size > 2 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: '头像图片不能超过2MB'
    })
    avatarFile.value = null
    avatarPreview.value = null
    return
  }

  // 创建本地预览
  if (avatarFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(avatarFile.value)
  } else {
    avatarPreview.value = null
  }
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return

  avatarUploading.value = true
  try {
    const result = await userStore.uploadAvatar(avatarFile.value)
    if (result && result.success) {
      $q.notify({
        type: 'positive',
        message: '头像上传成功'
      })
      // 更新表单中的头像预览
      editForm.value.avatar_url = result.data.url
      avatarFile.value = null
      avatarPreview.value = null
    }
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.message || '头像上传失败'
    })
  }
  avatarUploading.value = false
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

/* 头像上传区域样式 */
.avatar-upload-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.avatar-preview {
  flex-shrink: 0;
}

.upload-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 用户字段样式 */
.user-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

  .avatar-upload-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>

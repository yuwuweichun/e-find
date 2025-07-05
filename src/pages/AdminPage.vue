<template>
  <q-page class="admin-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <q-icon name="admin_panel_settings" size="2rem" color="white" class="header-icon" />
          <h1 class="page-title">后台管理</h1>
          <p class="page-subtitle">系统管理和数据统计</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="row q-gutter-md justify-center">
          <div class="col-12 col-md-4" v-for="(item, idx) in statsList" :key="idx">
            <q-card class="stat-card" elevated>
              <q-card-section class="text-center">
                <q-icon :name="item.icon" size="3rem" :color="item.color" />
                <div class="stat-number">{{ item.value }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- 管理功能 -->
      <div class="admin-functions">
        <div class="row q-gutter-md justify-center">
          <div class="col-12 col-md-6">
            <!-- 物品管理 -->
            <q-card class="function-card" elevated>
              <q-card-section class="card-header">
                <div class="header-with-icon">
                  <q-icon name="inventory" size="1.5rem" color="white" />
                  <span class="card-title">物品管理</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list>
                  <q-item clickable v-ripple @click="viewAllItems">
                    <q-item-section avatar>
                      <q-icon name="list" color="primary" />
                    </q-item-section>
                    <q-item-section>管理所有物品</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <!-- 用户管理 -->
            <q-card class="function-card" elevated>
              <q-card-section class="card-header">
                <div class="header-with-icon">
                  <q-icon name="people" size="1.5rem" color="white" />
                  <span class="card-title">用户管理</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list>
                  <q-item clickable v-ripple @click="viewAllUsers">
                    <q-item-section avatar>
                      <q-icon name="group" color="primary" />
                    </q-item-section>
                    <q-item-section>用户列表</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="manageRoles">
                    <q-item-section avatar>
                      <q-icon name="admin_panel_settings" color="green" />
                    </q-item-section>
                    <q-item-section>角色管理</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="userReports">
                    <q-item-section avatar>
                      <q-icon name="report" color="red" />
                    </q-item-section>
                    <q-item-section>用户举报</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <!-- 系统管理 -->
            <q-card class="function-card" elevated>
              <q-card-section class="card-header">
                <div class="header-with-icon">
                  <q-icon name="settings" size="1.5rem" color="white" />
                  <span class="card-title">系统管理</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list>
                  <q-item clickable v-ripple @click="publishAnnouncement">
                    <q-item-section avatar>
                      <q-icon name="add_circle" color="primary" />
                    </q-item-section>
                    <q-item-section>发布公告</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="manageAnnouncements">
                    <q-item-section avatar>
                      <q-icon name="announcement" color="primary" />
                    </q-item-section>
                    <q-item-section>公告管理</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="systemSettings">
                    <q-item-section avatar>
                      <q-icon name="tune" color="green" />
                    </q-item-section>
                    <q-item-section>系统设置</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="dataBackup">
                    <q-item-section avatar>
                      <q-icon name="backup" color="orange" />
                    </q-item-section>
                    <q-item-section>数据备份</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <!-- 数据统计 -->
            <q-card class="function-card" elevated>
              <q-card-section class="card-header">
                <div class="header-with-icon">
                  <q-icon name="analytics" size="1.5rem" color="white" />
                  <span class="card-title">数据统计</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list>
                  <q-item clickable v-ripple @click="viewAnalytics">
                    <q-item-section avatar>
                      <q-icon name="bar_chart" color="primary" />
                    </q-item-section>
                    <q-item-section>数据报表</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="exportData">
                    <q-item-section avatar>
                      <q-icon name="download" color="green" />
                    </q-item-section>
                    <q-item-section>导出数据</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-ripple @click="activityLogs">
                    <q-item-section avatar>
                      <q-icon name="history" color="orange" />
                    </q-item-section>
                    <q-item-section>操作日志</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <ItemListDialog v-model="showItemList" @update-status="handleUpdateItemStatus" />
    <UserListDialog v-model="showUserList" />
    <RoleManageDialog v-model="showRoleManage" />
    <AnnouncementManageDialog v-model="showAnnouncementManage" />
    <AnnouncementPublishDialog v-model="showAnnouncementPublish" @published="showAnnouncementManage = true" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { itemAPI, userAPI } from 'src/services/api'
import ItemListDialog from 'src/components/ItemListDialog.vue'
import UserListDialog from 'src/components/UserListDialog.vue'
import RoleManageDialog from 'src/components/RoleManageDialog.vue'
import AnnouncementManageDialog from 'src/components/AnnouncementManageDialog.vue'
import AnnouncementPublishDialog from 'src/components/AnnouncementPublishDialog.vue'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()

// 检查管理员权限
onMounted(async () => {
  if (!userStore.isAdmin) {
    $q.notify({
      type: 'negative',
      message: '您没有管理员权限',
      position: 'top'
    })
    router.push('/')
    return
  }
  try {
    // 加载统计数据 - 简单方式
    // 实际项目中可能需要调用后端统计接口
    const itemsResponse = await itemAPI.getItems({ page: 0, size: 1 })
    const usersResponse = await userAPI.getUserList({ page: 0, size: 1 })

    if (itemsResponse.success && itemsResponse.data) {
      statsList.value[0].value = itemsResponse.data.totalElements || 0

      // 已解决和待处理的数量需要额外查询
      const solvedItems = await itemAPI.getItems({ status: '已找到', page: 0, size: 1 })
      const pendingItems = await itemAPI.getItems({ status: '待审核', page: 0, size: 1 })

      if (solvedItems.success && solvedItems.data) {
        statsList.value[2].value = solvedItems.data.totalElements || 0
      }

      if (pendingItems.success && pendingItems.data) {
        statsList.value[3].value = pendingItems.data.totalElements || 0
      }
    }

    if (usersResponse.success && usersResponse.data) {
      statsList.value[1].value = usersResponse.data.totalItems || 0
    }

    console.log('✅ 管理页面统计数据加载成功')
  } catch (e) {
    console.error('❌ 获取统计数据失败:', e)
    $q.notify({ type: 'negative', message: '获取统计数据失败: ' + (e.message || e) })
  }
})

// 统计数据
const statsList = ref([
  { icon: 'inventory', color: 'primary', value: 0, label: '总物品数' },
  { icon: 'person', color: 'green', value: 0, label: '注册用户' },
  { icon: 'check_circle', color: 'orange', value: 0, label: '已解决' },
  { icon: 'pending', color: 'red', value: 0, label: '待处理' }
])

const showItemList = ref(false)
const showUserList = ref(false)
const showRoleManage = ref(false)
const showAnnouncementManage = ref(false)
const showAnnouncementPublish = ref(false)

// 管理功能方法
const viewAllItems = () => {
  showItemList.value = true
}

const viewAllUsers = () => {
  showUserList.value = true
}

const manageRoles = () => {
  showRoleManage.value = true
}

const userReports = () => {
  $q.notify({ type: 'info', message: '用户举报功能开发中...' })
}

const publishAnnouncement = () => {
  showAnnouncementPublish.value = true
}

const manageAnnouncements = () => {
  showAnnouncementManage.value = true
}

const systemSettings = () => {
  $q.notify({ type: 'info', message: '系统设置功能开发中...' })
}

const dataBackup = () => {
  $q.notify({ type: 'info', message: '数据备份功能开发中...' })
}

const viewAnalytics = () => {
  $q.notify({ type: 'info', message: '数据报表功能开发中...' })
}

const exportData = () => {
  $q.notify({ type: 'info', message: '导出数据功能开发中...' })
}

const activityLogs = () => {
  $q.notify({ type: 'info', message: '操作日志功能开发中...' })
}

// 处理物品状态修改
const handleUpdateItemStatus = async (itemId, newStatus, rejectionReason = null) => {
  try {
    console.log('📝 更新物品状态:', { itemId, newStatus, rejectionReason })
    const response = await itemAPI.updateItemStatus(itemId, newStatus, rejectionReason)
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: '物品状态已更新',
        position: 'top'
      })

      // 刷新统计数据
      try {
        const itemsResponse = await itemAPI.getItems({ page: 0, size: 1 })
        const solvedItems = await itemAPI.getItems({ status: '已找到', page: 0, size: 1 })
        const pendingItems = await itemAPI.getItems({ status: '待审核', page: 0, size: 1 })

        if (itemsResponse.success) {
          statsList.value[0].value = itemsResponse.data.totalElements || 0
        }

        if (solvedItems.success) {
          statsList.value[2].value = solvedItems.data.totalElements || 0
        }

        if (pendingItems.success) {
          statsList.value[3].value = pendingItems.data.totalElements || 0
        }
      } catch (e) {
        console.error('❌ 刷新统计数据失败:', e)
      }
    } else {
      $q.notify({
        type: 'negative',
        message: response.message || '物品状态更新失败',
        position: 'top'
      })
    }
  } catch (e) {
    console.error('❌ 物品状态更新失败:', e)
    $q.notify({
      type: 'negative',
      message: '物品状态更新失败: ' + (e.message || e),
      position: 'top'
    })
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  color: white;
  padding: 2.5rem 1rem 2rem 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.header-icon {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.stats-section {
  padding: 2rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card,
.function-card {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: #fff;
}

.card-header {
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
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

.q-item {
  padding: 1rem;
  transition: background 0.2s;
}

.q-item:hover {
  background: #f8f9fa;
}

.stat-number {
  font-size: 2.1rem;
  font-weight: bold;
  color: #43cea2;
  margin: 0.5rem 0;
}

.stat-label {
  font-size: 0.95rem;
  color: #666;
}

.admin-functions {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 0 1rem;
}
</style>

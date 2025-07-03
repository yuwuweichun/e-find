<template>
  <q-page class="q-pa-md">
    <!-- 页面标题 -->
    <div class="text-h4 q-mb-md">
      <q-icon name="announcement" class="q-mr-sm" />
      公告栏
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm text-grey">加载中...</div>
    </div>

    <!-- 公告列表 -->
    <div v-else-if="announcements.length > 0">
      <q-card v-for="announcement in announcements" :key="announcement.id" class="q-mb-md announcement-card" clickable
        @click="viewAnnouncement(announcement)">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-h6 text-weight-bold">{{ announcement.title }}</div>
              <div class="text-body2 text-grey q-mt-xs">
                {{ (announcement.content || '').substring(0, 100) }}{{ (announcement.content &&
                  announcement.content.length > 100) ? '...' : '' }}
              </div>
            </div>
            <div class="col-auto">
              <q-chip :color="getPriorityColor(announcement.priority)" text-color="white" size="sm">
                {{ getPriorityText(announcement.priority) }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row items-center justify-between text-caption text-grey">
            <div class="row items-center">
              <q-icon name="person" size="16px" class="q-mr-xs" />
              <span>{{ announcement.author }}</span>
            </div>
            <div class="row items-center">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span>{{ formatDate(announcement.createdAt) }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center q-pa-lg">
      <q-icon name="announcement" size="80px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">暂无公告</div>
      <div class="text-body2 text-grey">管理员还没有发布任何公告</div>
    </div>

    <!-- 公告详情对话框 -->
    <q-dialog v-model="showAnnouncementDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedAnnouncement?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center">
              <q-icon name="person" size="16px" class="q-mr-xs" />
              <span class="text-caption">{{ selectedAnnouncement?.author }}</span>
            </div>
            <div class="row items-center">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span class="text-caption">{{ formatDate(selectedAnnouncement?.createdAt) }}</span>
            </div>
          </div>

          <q-chip v-if="selectedAnnouncement" :color="getPriorityColor(selectedAnnouncement.priority)"
            text-color="white" size="sm" class="q-mb-md">
            {{ getPriorityText(selectedAnnouncement.priority) }}
          </q-chip>

          <div class="text-body1 q-mt-md">
            {{ selectedAnnouncement?.content }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { announcementAPI } from 'src/services/api'

const $q = useQuasar()

// 响应式数据
const loading = ref(true)
const announcements = ref([])
const showAnnouncementDialog = ref(false)
const selectedAnnouncement = ref(null)

// 获取公告列表
const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const res = await announcementAPI.getAll()
    console.log('公告栏接口返回数据:', res)
    // 提取 res.data[0] 作为公告数组来源
    announcements.value = Array.isArray(res.data?.[0]) ? res.data[0] : []
  } catch (error) {
    console.error('获取公告失败:', error)
    $q.notify({
      type: 'negative',
      message: '获取公告失败，请稍后重试'
    })
  } finally {
    loading.value = false
  }
}

// 查看公告详情
const viewAnnouncement = (announcement) => {
  selectedAnnouncement.value = announcement
  showAnnouncementDialog.value = true
}

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const colors = {
    high: 'negative',
    medium: 'warning',
    normal: 'primary'
  }
  return colors[priority] || 'primary'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const texts = {
    high: '重要',
    medium: '一般',
    normal: '普通'
  }
  return texts[priority] || '普通'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement-card {
  transition: all 0.3s ease;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

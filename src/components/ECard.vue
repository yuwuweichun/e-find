<template>
  <div class="row justify-center q-gutter-md">
    <q-card class="my-card q-mb-xl" bordered>
      <!-- 物品图片，如果有图片则显示，否则显示默认图片 -->
      <q-img :src="getImgUrl(item) || defaultImg" :ratio="16 / 9" style="min-height: 120px;"
        @error="() => { console.log('图片加载失败', getImgUrl(item)) }" />

      <q-card-section>
        <!-- 发布时间 -->
        <div class="text-overline text-orange-9">{{ formatDateTime(item.posted_date) }}</div>
        <!-- 物品标题 -->
        <div class="text-h5 q-mt-sm q-mb-xs">{{ item.title }}</div>
        <!-- 物品类型 -->
        <div class="text-caption text-blue">类型：{{ item.type === 'lost' ? '丢失' : '招领' }}</div>
        <!-- 物品描述 -->
        <div class="text-caption text-grey">{{ item.description }}</div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="secondary" label="复制联系方式" @click="copyContact" />
        <q-space />
        <!-- 展开按钮 -->
        <q-btn color="grey" round flat dense :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded" />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <!-- 物品位置 -->
          <q-card-section class="text-subtitle2">
            物品位置：{{ item.location || '未知' }}
          </q-card-section>
          <!-- 丢失/招领日期 -->
          <q-card-section class="text-subtitle2">
            日期：{{ formatDate(item.lost_date) }}
          </q-card-section>
          <!-- 联系方式 -->
          <q-card-section class="text-subtitle2">
            联系方式：{{ item.contact_info || '无' }}
          </q-card-section>
          <!-- 审核状态 -->
          <q-card-section class="text-subtitle2">
            状态：{{ statusText }}
          </q-card-section>
          <!-- 如果被拒绝，显示原因 -->
          <q-card-section v-if="item.status === 'rejected'" class="text-negative">
            拒绝原因：{{ item.rejection_reason }}
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import defaultImg from '@/assets/images/default_item_photo.png'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// 日期时间格式化函数
function formatDateTime(dateStr) {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}
// 只显示年月日
function formatDate(dateStr) {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

console.log('ECard item:', props.item)
const expanded = ref(false)
// 状态文字
const statusText = computed(() => {
  switch (props.item.status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
})
// 复制联系方式
function copyContact() {
  if (props.item.contact_info) {
    navigator.clipboard.writeText(props.item.contact_info)
  }
}
// 获取图片url
function getImgUrl(item) {
  if (Array.isArray(item.photos) && item.photos.length > 0) {
    return item.photos[0]
  }
  if (typeof item.photos === 'string') {
    try {
      const arr = JSON.parse(item.photos)
      if (Array.isArray(arr) && arr.length > 0) return arr[0]
    } catch { /* ignore JSON parse error */ }
  }
  if (item.photo_url) return item.photo_url
  if (item.photoUrl) return item.photoUrl
  // 兜底：返回 null，外层用 || defaultImg
  return null
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 400px
</style>

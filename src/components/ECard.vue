<template>
  <div class="row justify-center q-gutter-md">
    <q-card class="my-card q-mb-xl" bordered>
      <!-- 物品图片，如果有图片则显示，否则显示默认图片 -->
      <q-img :src="getImgUrl(item) || defaultImg" :ratio="16 / 9" style="min-height: 120px;" @error="onImageError" />

      <q-card-section>
        <!-- 发布时间 -->
        <div class="text-overline text-orange-9">{{ formatDateTime(item.postedDate || item.posted_date) }}</div>
        <!-- 物品标题 -->
        <div class="text-h5 q-mt-sm q-mb-xs">{{ item.title }}</div>
        <!-- 物品类型 -->
        <div class="text-caption text-blue">类型：{{ getTypeText(item.type) }}</div>
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
            拾失日期：{{ formatDate(item.lostDate || item.lost_date) }}
          </q-card-section>
          <!-- 联系方式 -->
          <q-card-section class="text-subtitle2">
            联系方式：{{ item.contactInfo || item.contact_info || '无' }}
          </q-card-section>
          <!-- 审核状态 -->
          <q-card-section class="text-subtitle2">
            状态：{{ item.status }}
          </q-card-section>
          <!-- 如果被拒绝，显示原因 -->
          <q-card-section v-if="item.status === '未通过'" class="text-negative">
            拒绝原因：{{ item.rejectionReason || '未提供' }}
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

// 处理物品类型文字
function getTypeText(type) {
  switch (type) {
    case 'lost': return '丢失'
    case 'found': return '招领'
    default: return type || '未知'
  }
}

// 图片加载错误处理
function onImageError(e) {
  console.error('图片加载失败:', e.target.src)
  // 直接使用导入的默认图片，确保不使用相对路径
  e.target.src = defaultImg
  // 防止循环触发error事件
  e.target.onerror = null
}

const expanded = ref(false)

// 复制联系方式
function copyContact() {
  const contactInfo = props.item.contactInfo || props.item.contact_info
  if (contactInfo) {
    navigator.clipboard.writeText(contactInfo)
      .then(() => {
        // 可以使用Quasar通知用户复制成功
        console.log('联系方式已复制:', contactInfo)
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }
}

// 获取图片url
function getImgUrl(item) {
  // 检查新API的photos字段
  if (Array.isArray(item.photos) && item.photos.length > 0) {
    // 确保我们使用完整的图片URL
    let photoUrl = item.photos[0]

    // 如果photoUrl是对象格式(如{id:3, url:'...'})，则取出url属性
    if (photoUrl && typeof photoUrl === 'object' && photoUrl.url) {
      photoUrl = photoUrl.url
    }

    if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
      photoUrl = `http://192.168.188.46:8080${photoUrl}`
    }

    return typeof photoUrl === 'string' ? photoUrl : null
  }

  // 兼容旧API的字符串形式photos
  if (typeof item.photos === 'string') {
    try {
      const arr = JSON.parse(item.photos)
      if (Array.isArray(arr) && arr.length > 0) {
        let photoUrl = arr[0]

        // 如果photoUrl是对象格式，则取出url属性
        if (photoUrl && typeof photoUrl === 'object' && photoUrl.url) {
          photoUrl = photoUrl.url
        }

        if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
          photoUrl = `http://192.168.188.46:8080${photoUrl}`
        }

        return typeof photoUrl === 'string' ? photoUrl : null
      }
    } catch {
      // 如果直接是URL字符串，直接返回
      if (item.photos && typeof item.photos === 'string') {
        return item.photos.startsWith('http') ? item.photos : `http://192.168.188.46:8080${item.photos}`
      }
    }
  }

  // 检查其他可能的字段名
  if (item.photo_url) {
    let photoUrl = item.photo_url
    if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
      photoUrl = `http://192.168.188.46:8080${photoUrl}`
    }
    return typeof photoUrl === 'string' ? photoUrl : null
  }

  if (item.photoUrl) {
    let photoUrl = item.photoUrl
    if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
      photoUrl = `http://192.168.188.46:8080${photoUrl}`
    }
    return typeof photoUrl === 'string' ? photoUrl : null
  }

  // 兜底：返回null，外层用 || defaultImg
  return null
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 400px
</style>

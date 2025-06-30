<template>
  <div class="row justify-center q-gutter-md">
    <q-card class="my-card" bordered>
      <!-- 物品图片，如果有图片则显示，否则显示默认图片 -->
      <q-img :src="item.photoUrl || defaultImg" />

      <q-card-section>
        <!-- 发布时间 -->
        <div class="text-overline text-orange-9">{{ item.posted_date || '未知时间' }}</div>
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
            日期：{{ item.lost_date || '未知' }}
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

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ECard',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const expanded = ref(false)
    const defaultImg = 'https://cdn.quasar.dev/img/parallax2.jpg'
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
    return { expanded, defaultImg, statusText, copyContact }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 400px
</style>

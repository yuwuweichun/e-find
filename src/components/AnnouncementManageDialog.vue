<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">公告管理</div>
      </q-card-section>
      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="a in announcements" :key="a.id" clickable :active="selectedId === a.id"
            @click="selectedId = a.id">
            <q-item-section>
              <div class="text-subtitle2">{{ a.title }}</div>
              <div class="text-caption text-grey">{{ (a.content || '').substring(0, 100) }}{{ (a.content &&
                a.content.length > 100) ? '...' : '' }}</div>
              <q-chip :color="getPriorityColor(a.priority)" text-color="white" size="xs" class="priority-chip">{{
                getPriorityText(a.priority) }}</q-chip>
              <span class="text-caption">{{ a.author }} | {{ formatDate(a.created_at) }}</span>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="delete" color="negative" flat round dense @click.stop="removeAnnouncement(a.id)"
                :loading="removingId === a.id" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="关闭" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { announcementAPI } from 'src/services/api'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])
const show = ref(props.modelValue)
watch(() => props.modelValue, v => show.value = v)
watch(show, v => emit('update:modelValue', v))

const $q = useQuasar()
const announcements = ref([])
const removingId = ref(null)
const selectedId = ref(null)

function getPriorityColor(priority) {
  return priority === 'high' ? 'negative' : priority === 'medium' ? 'warning' : 'primary'
}
function getPriorityText(priority) {
  return priority === 'high' ? '重要' : priority === 'medium' ? '一般' : '普通'
}
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

async function fetchAnnouncements() {
  try {
    const res = await announcementAPI.getAll()
    announcements.value = Array.isArray(res.data?.[0]) ? res.data[0] : []
  } catch (e) {
    $q.notify({ type: 'negative', message: '获取公告失败: ' + (e.message || e) })
  }
}

async function removeAnnouncement(id) {
  removingId.value = id
  try {
    await announcementAPI.remove(id)
    $q.notify({ type: 'positive', message: '删除成功' })
    fetchAnnouncements()
  } catch (e) {
    $q.notify({ type: 'negative', message: '删除失败: ' + (e.message || e) })
  } finally {
    removingId.value = null
  }
}

onMounted(fetchAnnouncements)
watch(show, v => { if (v) fetchAnnouncements() })
</script>

<style scoped>
.priority-chip {
  min-width: 20px;
  font-size: 12px;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
}
</style>

<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">发布公告</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="addAnnouncement">
          <q-input v-model="form.title" label="公告标题" required class="q-mb-sm" />
          <q-input v-model="form.content" label="公告内容" type="textarea" required class="q-mb-sm" />
          <q-select v-model="form.priority" :options="priorityOptions" label="优先级" class="q-mb-sm" />
          <q-input v-model="form.author" label="发布人" required class="q-mb-sm" />
          <q-btn type="submit" color="primary" label="发布" :loading="adding" />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="关闭" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { announcementAPI } from 'src/services/api'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'published'])
const show = ref(props.modelValue)
watch(() => props.modelValue, v => show.value = v)
watch(show, v => emit('update:modelValue', v))

const $q = useQuasar()
const adding = ref(false)
const form = ref({ title: '', content: '', priority: 'normal', author: '' })
const priorityOptions = [
  { label: '重要', value: 'high' },
  { label: '一般', value: 'medium' },
  { label: '普通', value: 'normal' }
]

async function addAnnouncement() {
  adding.value = true
  try {
    const data = {
      ...form.value,
      priority: typeof form.value.priority === 'object' ? form.value.priority.value : form.value.priority
    }
    await announcementAPI.add(data)
    $q.notify({ type: 'positive', message: '发布成功' })
    emit('published')
    show.value = false
    form.value = { title: '', content: '', priority: 'normal', author: '' }
  } catch (e) {
    $q.notify({ type: 'negative', message: '发布失败: ' + (e.message || e) })
  } finally {
    adding.value = false
  }
}
</script>

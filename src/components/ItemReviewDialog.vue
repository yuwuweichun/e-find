<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 700px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">审核物品</div>
      </q-card-section>
      <q-separator />
      <q-card-section style="padding: 0;">
        <q-table :rows="items" :columns="columns" row-key="id" flat dense selection="multiple"
          v-model:selected="selected" :pagination="{ rowsPerPage: 8 }" :loading="loading"
          :no-data-label="loading ? '加载中...' : '暂无待审核物品'" class="my-table">
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at || props.row.create_time || props.row.time) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="审核通过" color="primary" :disable="selected.length === 0" @click="approveSelected" />
        <q-btn flat label="关闭" color="primary" @click="dialogVisible = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { itemAPI } from 'src/services/api'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(props.modelValue)
const loading = ref(false)
const selected = ref([])

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const items = ref([])
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'item_name', label: '物品名', field: row => row.item_name || row.name || row.title || '', align: 'left', sortable: true },
  { name: 'status', label: '状态', field: 'status', align: 'left', sortable: true },
  { name: 'created_at', label: '创建时间', field: row => row.created_at || row.create_time || row.time || '', align: 'left', sortable: true }
]

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString()
}

async function fetchItems() {
  loading.value = true
  try {
    const res = await itemAPI.getItems({ status: 'pending' })
    items.value = res.items || []
  } catch { /* 忽略错误 */ }
  loading.value = false
  selected.value = []
}

async function approveSelected() {
  if (selected.value.length === 0) return
  loading.value = true
  try {
    for (const row of selected.value) {
      await itemAPI.updateItem(row.id, { status: 'solved' })
    }
    await fetchItems()
  } catch { /* 忽略错误 */ }
  loading.value = false
}

watch(dialogVisible, (val) => {
  if (val) fetchItems()
})
</script>

<style scoped>
.my-table {
  min-height: 320px;
  font-size: 15px;
}

.q-table__top,
.q-table__bottom {
  padding: 0 16px;
}

.q-table th,
.q-table td {
  padding: 8px 12px;
}
</style>

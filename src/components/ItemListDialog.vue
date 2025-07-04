<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 700px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">物品列表</div>
      </q-card-section>
      <q-separator />
      <q-card-section style="padding: 0;">
        <q-table :rows="items" :columns="columns" row-key="id" flat dense :pagination="{ rowsPerPage: 8 }"
          :no-data-label="'暂无物品'" class="my-table">
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div style="display: flex; align-items: center;">
                <q-select v-model="props.row.status" :options="statusOptions" dense outlined
                  style="width: 120px; margin-right: 8px;" emit-value map-options />
                <q-btn size="sm" color="primary" flat label="保存" @click="() => updateStatus(props.row)" />
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at || props.row.create_time || props.row.time) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
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
const emit = defineEmits(['update:modelValue', 'update-status'])

const dialogVisible = ref(props.modelValue)

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

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已结束', value: 'finished' }
]

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString()
}

watch(dialogVisible, async (val) => {
  if (val) {
    try {
      const res = await itemAPI.getItems()
      items.value = res.items || []
    } catch {
      items.value = []
    }
  }
})

async function updateStatus(row) {
  try {
    const statusValue = typeof row.status === 'object' ? row.status.value : row.status
    const response = await itemAPI.updateItem(row.id, { status: statusValue })
    if (response.success) {
      emit('update-status', row.id, statusValue)
      // 刷新数据
      const res = await itemAPI.getItems()
      items.value = res.items || []
      console.log('✅ 物品状态更新成功:', row.id, statusValue)
    } else {
      console.error('❌ 物品状态更新失败:', response.message)
    }
  } catch (error) {
    console.error('❌ 物品状态更新失败:', error)
  }
}
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

<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 700px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">物品列表</div>
      </q-card-section>

      <q-separator />

      <!-- 搜索筛选区 -->
      <q-card-section class="q-pa-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-md-4 col-sm-6 col-xs-12">
            <q-input dense outlined v-model="filters.keyword" label="关键词搜索" @keyup.enter="fetchItems">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select dense outlined v-model="filters.type" :options="typeOptions" label="物品类型" emit-value map-options
              clearable @update:model-value="fetchItems" />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select dense outlined v-model="filters.status" :options="statusOptions" label="状态" emit-value map-options
              clearable @update:model-value="fetchItems" />
          </div>
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-btn color="primary" icon="refresh" label="刷新" @click="fetchItems" />
          </div>
        </div>
      </q-card-section>

      <q-card-section style="padding: 0;">
        <q-table :rows="items" :columns="columns" row-key="id" flat dense :pagination="pagination" :loading="loading"
          @request="onRequest" :no-data-label="'暂无物品'" class="my-table">

          <!-- 图片列 -->
          <template v-slot:body-cell-photos="props">
            <q-td :props="props">
              <q-img v-if="getPhotoUrl(props.row)" :src="getPhotoUrl(props.row)" spinner-color="primary"
                style="height: 50px; max-width: 50px; object-fit: cover;" @error="onImageError" />
              <span v-else>无图片</span>
            </q-td>
          </template>

          <!-- 状态列 -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div style="display: flex; align-items: center;">
                <q-select v-model="props.row.status" :options="fullStatusOptions" dense outlined
                  style="width: 120px; margin-right: 8px;" />
                <q-btn size="sm" color="primary" flat label="保存" @click="() => updateStatus(props.row)" />
              </div>
            </q-td>
          </template>

          <!-- 日期列 -->
          <template v-slot:body-cell-postedDate="props">
            <q-td :props="props">
              {{ formatDate(props.row.postedDate) }}
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs justify-center">
                <q-btn size="sm" color="info" flat round icon="visibility" @click="viewItem(props.row)">
                  <q-tooltip>查看详情</q-tooltip>
                </q-btn>
                <q-btn size="sm" color="negative" flat round icon="delete" @click="confirmDelete(props.row.id)">
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </div>
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
import { ref, watch, onMounted } from 'vue'
import { itemAPI } from 'src/services/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'update-status'])

const dialogVisible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    fetchItems()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 列表数据
const items = ref([])
const loading = ref(false)

// 分页
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'postedDate',
  descending: true
})

// 筛选条件
const filters = ref({
  keyword: '',
  type: null,
  status: null,
})

// 表格列定义
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'photos', label: '图片', field: 'photos', align: 'center' },
  { name: 'title', label: '物品名称', field: 'title', align: 'left', sortable: true },
  {
    name: 'type', label: '类型', field: 'type', align: 'left', sortable: true,
    format: val => val === 'lost' ? '丢失' : val === 'found' ? '招领' : val
  },
  { name: 'location', label: '位置', field: 'location', align: 'left' },
  { name: 'postedDate', label: '发布时间', field: 'postedDate', align: 'left', sortable: true },
  { name: 'status', label: '状态', field: 'status', align: 'left', sortable: true },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
]

// 选项
const typeOptions = [
  { label: '丢失', value: 'lost' },
  { label: '招领', value: 'found' }
]

const statusOptions = [
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
  { label: '未通过', value: '未通过' },
  { label: '已找到', value: '已找到' }
]

const fullStatusOptions = [
  '待审核',
  '已通过',
  '未通过',
  '已找到'
]

// 格式化日期
function formatDate(val) {
  if (!val) return '未知'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取图片URL
function getPhotoUrl(item) {
  if (Array.isArray(item.photos) && item.photos.length > 0) {
    // 如果photoUrl是对象格式(如{id:3, url:'...'})，则取出url属性
    if (item.photos[0] && typeof item.photos[0] === 'object' && item.photos[0].url) {
      return item.photos[0].url
    }
    return item.photos[0]
  }
  return null
}

// 图片加载错误处理
function onImageError(e) {
  console.error('图片加载失败:', e.target.src)
  e.target.src = require('@/assets/images/default_item_photo.png')
  e.target.onerror = null
}

// 获取物品列表
async function fetchItems(startPage) {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      page: startPage !== undefined ? startPage : pagination.value.page - 1, // API从0开始计数
      size: pagination.value.rowsPerPage
    }

    // 添加筛选条件
    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.status) params.status = filters.value.status

    // 排序
    if (pagination.value.sortBy) {
      params.order = `${pagination.value.sortBy},${pagination.value.descending ? 'desc' : 'asc'}`
    }

    // 发送请求
    const res = await itemAPI.getItems(params)

    // 处理返回数据
    if (res.success && res.data) {
      items.value = Array.isArray(res.data.content) ? res.data.content : []

      // 更新分页信息
      pagination.value.page = (res.data.pageNumber || res.data.number || 0) + 1 // 转换为从1开始计数
      pagination.value.rowsNumber = res.data.totalElements || 0
      pagination.value.rowsPerPage = res.data.pageable?.pageSize || 10
    } else {
      items.value = []
      console.error('获取物品列表失败:', res.message)
      $q.notify({ type: 'negative', message: '获取物品列表失败: ' + res.message })
    }
  } catch (error) {
    items.value = []
    console.error('获取物品列表失败:', error)
    $q.notify({ type: 'negative', message: '获取物品列表失败: ' + (error.message || error) })
  } finally {
    loading.value = false
  }
}

// 表格分页/排序事件处理
function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  fetchItems()
}

// 更新物品状态
async function updateStatus(item) {
  try {
    const response = await itemAPI.updateItemStatus(item.id, item.status)
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: `物品 "${item.title}" 状态已更新为 "${item.status}"`
      })
      emit('update-status', item.id, item.status)
      // 不需要刷新整个列表
    } else {
      $q.notify({
        type: 'negative',
        message: '更新失败: ' + response.message
      })
    }
  } catch (error) {
    console.error('❌ 物品状态更新失败:', error)
    $q.notify({
      type: 'negative',
      message: '更新失败: ' + (error.message || error)
    })
  }
}

// 查看物品详情
function viewItem(item) {
  // 可以跳转到详情页或打开详情对话框
  $q.notify({ type: 'info', message: `查看物品 "${item.title}" 详情功能开发中...` })
}

// 删除物品确认
function confirmDelete(itemId) {
  $q.dialog({
    title: '确认删除',
    message: '确定要删除这个物品吗？此操作不可撤销。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteItem(itemId)
  })
}

// 删除物品
async function deleteItem(itemId) {
  try {
    const response = await itemAPI.deleteItem(itemId)
    if (response.success) {
      $q.notify({ type: 'positive', message: '物品已成功删除' })
      // 重新获取物品列表
      fetchItems()
    } else {
      $q.notify({ type: 'negative', message: '删除失败: ' + response.message })
    }
  } catch (error) {
    console.error('❌ 物品删除失败:', error)
    $q.notify({ type: 'negative', message: '删除失败: ' + (error.message || error) })
  }
}

// 初始化
onMounted(() => {
  // 如果对话框已打开，则获取数据
  if (dialogVisible.value) {
    fetchItems()
  }
})
</script>

<style scoped>
.my-table {
  min-height: 320px;
  font-size: 14px;
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

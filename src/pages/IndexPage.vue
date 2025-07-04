<template>
  <q-page class="q-pa-md">

    <!-- 轮播图 -->
    <div class="q-pa-md flex flex-center">
      <q-carousel swipeable animated v-model="slide" thumbnails infinite
        style="height: 500px; width: 100%; max-width: 1000px;" autoplay interval="3000">
        <q-carousel-slide :name="1" :img-src="carousel1" img-class="carousel-img-contain" />
        <q-carousel-slide :name="2" :img-src="carousel2" img-class="carousel-img-contain" />
        <!-- <q-carousel-slide :name="3" img-src="" /> -->
        <!-- <q-carousel-slide :name="4" img-src="" /> -->
      </q-carousel>
    </div>

    <!-- 搜索和日期筛选区 -->
    <div class="row justify-center q-gutter-md">
      <!-- 搜索框 -->
      <q-input rounded outlined v-model="search" type="search" hint="Search" label="输入失物名称搜索" color="info"
        class="col-5">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <!-- 日期选择器 -->
      <q-input outlined v-model="selectedDate" type="date" label="按发布日期筛选" class="col-2" style="max-width: 140px;"
        clearable />
    </div>

    <!-- 卡片显示区 -->
    <div class="q-pa-md row justify-center">
      <div class="col-xs-12 col-sm-4" v-for="item in currentCards" :key="item.id">
        <ECard :item="item" />
      </div>
      <div v-if="currentCards.length === 0" class="text-grey q-mt-md">
        没有找到符合条件的失物
      </div>
    </div>

    <!-- 分页控制区 -->
    <div class="row items-center q-mb-md justify-center">
      <q-btn flat round dense icon="chevron_left" :disable="currentPage === 1" @click="prevPage" />
      <span class="q-mx-md">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <q-btn flat round dense icon="chevron_right" :disable="currentPage === totalPages" @click="nextPage" />
      <q-input v-model.number="jumpPage" type="number" dense style="width: 30px" class="q-ml-md" :min="1"
        :max="totalPages" @keyup.enter="goToPage" placeholder="跳转页" />
      <q-btn flat label="跳转" @click="goToPage" class="q-ml-xs" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { itemAPI } from 'src/services/api.js'
import ECard from 'components/ECard.vue'
// 导入本地轮播图图片
import carousel1 from 'src/assets/images/carousel_1.png'
import carousel2 from 'src/assets/images/carousel_2.jpg'

// 轮播图
const slide = ref(1)

// 数据相关
const items = ref([]) // 所有失物
const loading = ref(false)
const error = ref(null)

const pageSize = 6
const currentPage = ref(1)
const jumpPage = ref(1)

// 搜索和日期筛选
const search = ref('')
const selectedDate = ref('') // 日期字符串，格式如 '2024-07-01'

// 计算属性：筛选后的失物
const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return items.value.filter(item => {
    // 只显示状态为approved或finished的失物
    if (item.status !== 'approved' && item.status !== 'finished') return false
    // 关键词匹配（title/location）
    const matchKeyword =
      !keyword ||
      (item.title && item.title.toLowerCase().includes(keyword)) ||
      (item.location && item.location.toLowerCase().includes(keyword))
    // 日期匹配（posted_date 只取日期部分）
    const matchDate =
      !selectedDate.value ||
      (item.posted_date && item.posted_date.slice(0, 10) === selectedDate.value)
    return matchKeyword && matchDate
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize))

// 当前页要显示的卡片
const currentCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

// 获取数据
async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const res = await itemAPI.getItems()
    items.value = res.items || res
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchItems)

// 分页相关
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    jumpPage.value = currentPage.value
  }
}
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    jumpPage.value = currentPage.value
  }
}
function goToPage() {
  if (jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    currentPage.value = jumpPage.value
  }
}

// 监听筛选条件变化，自动回到第1页
watch([search, selectedDate], () => {
  currentPage.value = 1
  jumpPage.value = 1
})
</script>

<style>
.carousel-img-contain {
  object-fit: contain !important;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}
</style>

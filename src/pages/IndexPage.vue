<template>
  <q-page class="q-pa-md">
    <!--搜索框-->
    <div class="row justify-center">
      <q-input
        rounded
        outlined
        v-model="search"
        type="search"
        hint="Search"
        label="按失物名称搜索"
        color="info"
        class="col-6"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 卡片显示区 -->
    <div class="row justify-center">
      <div class="col-xs-12 col-sm-4" v-for="n in currentCards" :key="n">
        <ECard />
      </div>
    </div>

    <!-- 分页控制区 -->
    <div class="row items-center q-mb-md justify-center">
      <q-btn flat round dense icon="chevron_left" :disable="currentPage === 1" @click="prevPage" />
      <span class="q-mx-md">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <q-btn
        flat
        round
        dense
        icon="chevron_right"
        :disable="currentPage === totalPages"
        @click="nextPage"
      />
      <q-input
        v-model.number="jumpPage"
        type="number"
        dense
        style="width: 30px"
        class="q-ml-md"
        :min="1"
        :max="totalPages"
        @keyup.enter="goToPage"
        placeholder="跳转页"
      />
      <q-btn flat label="跳转" @click="goToPage" class="q-ml-xs" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import ECard from 'components/ECard.vue'

// 模拟33个卡片
const cards = Array.from({ length: 33 }, (_, i) => i + 1)

const pageSize = 6 // 每页显示6个
const currentPage = ref(1)
const jumpPage = ref(1)
const totalPages = computed(() => Math.ceil(cards.length / pageSize))

// 当前页要显示的卡片
const currentCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return cards.slice(start, start + pageSize)
})

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    jumpPage.value = currentPage.value
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    jumpPage.value = currentPage.value
  }
}

// 跳转到指定页
function goToPage() {
  if (jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    currentPage.value = jumpPage.value
  }
}
</script>

<template>
  <q-page class="lose-page">
    <!-- 顶部渐变背景区域 -->
    <div class="page-header">
      <div class="header-content">
        <q-icon name="lost_and_found" size="2rem" color="white" class="header-icon" />
        <h1 class="page-title">我丢失了物品</h1>
        <p class="page-subtitle">发布失物信息，让好心人帮您找回</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 发布失物信息的表单 -->
      <q-card class="form-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="report_problem" size="1.5rem" color="white" />
            <span class="card-title">发布失物信息</span>
          </div>
        </q-card-section>

        <q-card-section class="form-section">
          <q-form @submit="onSubmit" class="q-gutter-lg">
            <div class="form-group">
              <q-input v-model="form.title" label="物品名称" outlined :rules="[val => !!val || '请输入物品名称']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="inventory_2" color="orange" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.description" label="物品描述" type="textarea" outlined
                :rules="[val => !!val || '请输入物品描述']" class="custom-input" bg-color="grey-1" rows="3">
                <template v-slot:prepend>
                  <q-icon name="description" color="orange" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.location" label="丢失地点" outlined :rules="[val => !!val || '请输入丢失地点']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="location_on" color="orange" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.contact" label="联系方式" outlined :rules="[val => !!val || '请输入联系方式']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="phone" color="orange" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.date" label="丢失日期" type="date" outlined :rules="[val => !!val || '请选择丢失日期']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="event" color="orange" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-file v-model="form.photos" label="上传图片" outlined multiple accept=".jpg,.jpeg,.png,.gif"
                class="custom-input" bg-color="grey-1" @rejected="onRejected">
                <template v-slot:prepend>
                  <q-icon name="add_photo_alternate" color="orange" />
                </template>
              </q-file>
              <div v-if="form.photos && form.photos.length" class="row q-mt-sm">
                <div v-for="(photo, index) in form.photos" :key="index" class="col-4 q-pa-xs">
                  <q-img :src="URL.createObjectURL(photo)" spinner-color="orange" style="height: 100px"
                    class="rounded-borders">
                    <div class="absolute-top-right">
                      <q-btn round flat dense size="sm" icon="close" color="negative" @click="removePhoto(index)" />
                    </div>
                  </q-img>
                </div>
              </div>
            </div>

            <div class="submit-section">
              <q-btn label="发布失物信息" type="submit" color="orange" size="lg" class="submit-btn" :loading="loading"
                unelevated>
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- 提示信息 -->
      <q-card class="info-card" flat>
        <q-card-section class="text-center">
          <q-icon name="lightbulb" color="orange" size="1.5rem" />
          <p class="info-text">发布失物信息后，好心人可以通过搜索找到您的信息并联系您</p>
        </q-card-section>
      </q-card>

      <!-- 快速操作按钮 -->
      <!-- <div class="quick-actions">
        <q-btn label="查看招领信息" color="primary" outline class="action-btn" icon="search" />
        <q-btn label="我的发布" color="orange" outline class="action-btn" icon="history" />
      </div> -->
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { itemAPI } from 'src/services/api.js'
import { photoAPI } from 'src/services/api.js'

const $q = useQuasar()
const URL = window.URL

const form = ref({
  title: '',
  description: '',
  location: '',
  contact: '',
  date: '',
  photos: []
})

const loading = ref(false)

const removePhoto = (index) => {
  form.value.photos.splice(index, 1)
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: '请上传有效的图片文件（JPG、PNG、GIF）',
    position: 'top'
  })
}

const onSubmit = async () => {
  loading.value = true
  console.log('提交失物表单:', form.value)

  try {
    // 构造基本请求体
    const payload = {
      title: form.value.title,
      description: form.value.description,
      location: form.value.location,
      contactInfo: form.value.contact,
      lostDate: form.value.date,
      type: 'lost',
      publisherId: parseInt(localStorage.getItem('userId')) || 0
    }
    console.log('准备创建物品:', payload)

    // 创建失物信息
    const createResult = await itemAPI.createItem(payload)
    console.log('创建物品响应:', createResult)

    if (!createResult.success) {
      throw new Error(createResult.message || '创建物品失败')
    }

    // 如果有上传图片，先创建物品记录，然后上传图片
    const itemId = createResult.data?.id
    if (itemId && form.value.photos && form.value.photos.length) {
      console.log('开始上传物品图片')
      for (const photo of form.value.photos) {
        try {
          // 使用新的photoAPI.uploadItemPhoto方法上传
          await photoAPI.uploadItemPhoto(itemId, photo)
          console.log('图片上传成功')
        } catch (photoError) {
          console.error('图片上传失败:', photoError)
          // 继续上传其他图片，不中断
        }
      }
    }

    $q.notify({
      type: 'positive',
      message: '失物信息发布成功！',
      icon: 'check_circle',
      position: 'top'
    })

    // 重置表单
    form.value = {
      title: '',
      description: '',
      location: '',
      contact: '',
      date: '',
      photos: []
    }
  } catch (error) {
    console.error('发布失物信息失败:', error)
    $q.notify({
      type: 'negative',
      message: error.message || '发布失败，请稍后重试',
      icon: 'error',
      position: 'top'
    })
  }

  loading.value = false
}
</script>

<style scoped>
.lose-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
}

.page-header {
  padding: 2rem 1rem 3rem;
  text-align: center;
  color: white;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.header-icon {
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

.page-content {
  padding: 0 1rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  padding: 1.5rem;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.form-section {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.custom-input {
  border-radius: 12px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
}

.submit-section {
  margin-top: 2rem;
  text-align: center;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
}

.info-card {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.info-text {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* 移动端优化 */
@media (max-width: 600px) {
  .page-header {
    padding: 1.5rem 1rem 2rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .page-content {
    padding: 0 0.75rem 1.5rem;
  }

  .quick-actions {
    flex-direction: column;
  }
}
</style>

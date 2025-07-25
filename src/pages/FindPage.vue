<template>
  <q-page class="find-page">
    <!-- 顶部渐变背景区域 -->
    <div class="page-header">
      <div class="header-content">
        <q-icon name="search" size="2rem" color="white" class="header-icon" />
        <h1 class="page-title">我找到了物品</h1>
        <p class="page-subtitle">帮助失主找回心爱之物</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 发布招领信息的表单 -->
      <q-card class="form-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="add_circle" size="1.5rem" color="primary" />
            <span class="card-title">发布招领信息</span>
          </div>
        </q-card-section>

        <q-card-section class="form-section">
          <q-form @submit="onSubmit" class="q-gutter-lg">
            <div class="form-group">
              <q-input v-model="form.title" label="物品名称" outlined :rules="[val => !!val || '请输入物品名称']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="inventory_2" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.description" label="物品描述" type="textarea" outlined
                :rules="[val => !!val || '请输入物品描述']" class="custom-input" bg-color="grey-1" rows="3">
                <template v-slot:prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.location" label="拾获地点" outlined :rules="[val => !!val || '请输入拾获地点']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="location_on" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.contact_info" label="联系方式" outlined :rules="[val => !!val || '请输入联系方式']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.date" label="拾获日期" type="date" outlined :rules="[val => !!val || '请选择日期']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-file v-model="form.photos" label="上传图片" outlined multiple accept=".jpg,.jpeg,.png,.gif"
                class="custom-input" bg-color="grey-1" @rejected="onRejected">
                <template v-slot:prepend>
                  <q-icon name="add_photo_alternate" color="primary" />
                </template>
              </q-file>
              <div v-if="form.photos && form.photos.length" class="row q-mt-sm">
                <div v-for="(photo, index) in form.photos" :key="index" class="col-4 q-pa-xs">
                  <q-img :src="URL.createObjectURL(photo)" spinner-color="primary" style="height: 100px"
                    class="rounded-borders">
                    <div class="absolute-top-right">
                      <q-btn round flat dense size="sm" icon="close" color="negative" @click="removePhoto(index)" />
                    </div>
                  </q-img>
                </div>
              </div>
            </div>

            <div class="submit-section">
              <q-btn label="发布招领信息" type="submit" color="primary" size="lg" class="submit-btn" :loading="loading"
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
          <q-icon name="info" color="info" size="1.5rem" />
          <p class="info-text">发布招领信息后，失主可以通过搜索找到您的信息</p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { itemAPI } from 'src/services/api.js'

const $q = useQuasar()
const URL = window.URL

const form = ref({
  title: '',
  description: '',
  location: '',
  contact_info: '',
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
  try {
    // 先上传图片
    const photoUrls = []
    if (form.value.photos && form.value.photos.length) {
      for (const photo of form.value.photos) {
        const formData = new FormData()
        formData.append('image', photo)
        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData
        })
        const result = await response.json()
        if (result.success) {
          photoUrls.push(result.data.url)
        }
      }
    }

    // 构造请求体
    const payload = {
      title: form.value.title,
      description: form.value.description,
      location: form.value.location,
      contact_info: form.value.contact_info,
      lost_date: form.value.date,
      type: 'found',
      photos: photoUrls
    }

    // 创建招领信息
    await itemAPI.createItem(payload)

    $q.notify({
      type: 'positive',
      message: '招领信息发布成功！',
      icon: 'check_circle',
      position: 'top'
    })

    // 重置表单
    form.value = {
      title: '',
      description: '',
      location: '',
      contact_info: '',
      date: '',
      photos: []
    }
  } catch (error) {
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
.find-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  animation: bounce 2s infinite;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
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
}
</style>

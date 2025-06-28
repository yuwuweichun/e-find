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
      <div class="quick-actions">
        <q-btn label="查看招领信息" color="primary" outline class="action-btn" icon="search" />
        <q-btn label="我的发布" color="orange" outline class="action-btn" icon="history" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const form = ref({
  title: '',
  description: '',
  location: '',
  contact: ''
})

const loading = ref(false)

const onSubmit = async () => {
  loading.value = true

  // 模拟提交延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 这里可以添加发布失物信息的逻辑
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
    contact: ''
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

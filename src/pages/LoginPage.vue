<template>
  <q-page class="login-page">
    <div class="page-header">
      <div class="header-content">
        <q-icon name="login" size="2rem" color="white" class="header-icon" />
        <h1 class="page-title">用户登录</h1>
        <p class="page-subtitle">登录后即可发布失物招领信息</p>
      </div>
    </div>

    <div class="page-content">
      <q-card class="form-card" elevated>
        <q-card-section class="form-section">
          <q-form @submit="onSubmit" class="q-gutter-lg">
            <div class="form-group">
              <q-input v-model="form.username" label="用户名" outlined :rules="[val => !!val || '请输入用户名']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.password" label="密码" type="password" outlined :rules="[val => !!val || '请输入密码']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="submit-section">
              <q-btn label="登录" type="submit" color="primary" size="lg" class="submit-btn" :loading="loading"
                unelevated>
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <div class="register-section">
        <p class="register-text">还没有账号？</p>
        <q-btn label="立即注册" color="primary" outline class="register-btn" @click="$router.push('register')" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authAPI } from 'src/services/api.js'
import { useUserStore } from 'src/stores/user'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await authAPI.login(form.value)
    if (response.success) {
      console.log('🔑 登录成功:', response.data)
      // 保存到 pinia
      userStore.setToken(response.data.token)
      userStore.setUser(response.data.user)

      $q.notify({
        type: 'positive',
        message: '登录成功！',
        icon: 'check_circle'
      })

      // 跳转到个人中心
      router.push('/user')
    }
  } catch (error) {
    console.error('❌ 登录失败:', error)
    $q.notify({
      type: 'negative',
      message: error.message || '登录失败，请稍后重试',
      icon: 'error'
    })
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  padding: 2rem 1rem 3rem;
  text-align: center;
  color: white;
}

.header-content {
  max-width: 400px;
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
  max-width: 400px;
  margin: 0 auto;
}

.form-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
}

.register-section {
  margin-top: 2rem;
  text-align: center;
  color: white;
}

.register-text {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.register-btn {
  width: 200px;
  height: 40px;
  border-radius: 20px;
  font-weight: 600;
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

<template>
  <q-page class="register-page">
    <div class="page-header">
      <div class="header-content">
        <q-icon name="person_add" size="2rem" color="white" class="header-icon" />
        <h1 class="page-title">用户注册</h1>
        <p class="page-subtitle">注册后即可发布失物招领信息</p>
      </div>
    </div>
    <div class="page-content">
      <q-card class="form-card" elevated>
        <q-card-section class="form-section">
          <q-form @submit.prevent="onRegister" class="q-gutter-lg">
            <div class="form-group">
              <q-input v-model="form.username" label="用户名" outlined
                :rules="[val => !!val || '请输入用户名', val => val.length >= 3 || '至少3位']" class="custom-input"
                bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="form-group">
              <q-input v-model="form.password" label="密码" type="password" outlined
                :rules="[val => !!val || '请输入密码', val => val.length >= 6 || '至少6位']" class="custom-input"
                bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="form-group">
              <q-input v-model="form.phone" label="电话" outlined
                :rules="[val => !!val || '请输入电话', val => /^1[3-9]\d{9}$/.test(val) || '请输入正确的手机号']" class="custom-input"
                bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="form-group">
              <q-input v-model="form.studentNo" label="学号" outlined :rules="[val => !!val || '请输入学号']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="form-group">
              <q-input v-model="form.fullName" label="真实姓名" outlined :rules="[val => !!val || '请输入真实姓名']"
                class="custom-input" bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="face" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="submit-section">
              <q-btn label="注册" type="submit" color="primary" size="lg" class="submit-btn" :loading="loading"
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
        <p class="register-text">已有账号？</p>
        <q-btn label="去登录" color="primary" outline class="register-btn" @click="$router.push('/auth/login')" />
      </div>
    </div>
    <q-dialog v-model="dialog.show">
      <q-card class="dialog-card">
        <q-card-section class="dialog-section">
          <div class="dialog-icon-wrap">
            <q-icon :name="dialog.success ? 'check_circle' : 'error'" :color="dialog.success ? 'positive' : 'negative'"
              size="48px" />
          </div>
          <div class="dialog-message">{{ dialog.message }}</div>
        </q-card-section>
        <q-card-actions align="center" class="dialog-actions">
          <q-btn flat label="确定" color="primary" class="dialog-btn" v-close-popup @click="onDialogOk" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from 'src/services/api'

const router = useRouter()
const form = ref({
  username: '',
  password: '',
  phone: '',
  studentNo: '',
  fullName: '',
})
const loading = ref(false)
const dialog = ref({ show: false, message: '', success: false })

const onRegister = async () => {
  loading.value = true
  try {
    console.log('📝 提交注册表单:', form.value)
    const response = await authAPI.register(form.value)

    if (response.success) {
      console.log('✅ 注册成功:', response)
      dialog.value = { show: true, message: '注册成功！请登录', success: true }
    } else {
      throw new Error(response.message || '注册失败，请稍后重试')
    }
  } catch (err) {
    console.error('❌ 注册失败:', err)
    let msg = err.message || '注册失败，请稍后重试'
    dialog.value = { show: true, message: msg, success: false }
  } finally {
    loading.value = false
  }
}
const onDialogOk = () => {
  if (dialog.value.success) {
    router.push('/auth/login')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
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

.dialog-card {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  min-width: 260px;
  max-width: 90vw;
}

.dialog-section {
  padding: 2rem 1.5rem 1rem 1.5rem;
  text-align: center;
}

.dialog-icon-wrap {
  margin-bottom: 1rem;
}

.dialog-message {
  font-size: 1.15rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.dialog-actions {
  padding-bottom: 1.2rem;
}

.dialog-btn {
  min-width: 120px;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 600;
}
</style>

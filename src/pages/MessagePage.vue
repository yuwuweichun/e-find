<template>
  <q-page class="message-page">
    <!-- 顶部渐变背景区域 -->
    <div class="page-header">
      <div class="header-content">
        <q-icon name="forum" size="2rem" color="white" class="header-icon" />
        <h1 class="page-title">留言板</h1>
        <p class="page-subtitle">分享您的故事，传递温暖</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 发布留言的表单 -->
      <q-card class="form-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="edit" size="1.5rem" color="white" />
            <span class="card-title">发布留言</span>
          </div>
        </q-card-section>

        <q-card-section class="form-section">
          <q-form @submit="onSubmit" class="q-gutter-lg">
            <div class="form-group">
              <q-input v-model="form.author" label="昵称" outlined :rules="[val => !!val || '请输入昵称']" class="custom-input"
                bg-color="grey-1">
                <template v-slot:prepend>
                  <q-icon name="person" color="teal" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <q-input v-model="form.content" label="留言内容" type="textarea" outlined :rules="[val => !!val || '请输入留言内容']"
                class="custom-input" bg-color="grey-1" rows="4" autogrow>
                <template v-slot:prepend>
                  <q-icon name="chat" color="teal" />
                </template>
              </q-input>
            </div>

            <div class="submit-section">
              <q-btn label="发布留言" type="submit" color="teal" size="lg" class="submit-btn" :loading="loading" unelevated>
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- 留言列表 -->
      <q-card class="messages-card" elevated>
        <q-card-section class="card-header">
          <div class="header-with-icon">
            <q-icon name="message" size="1.5rem" color="white" />
            <span class="card-title">留言列表</span>
            <q-badge color="white" text-color="teal" class="message-count">
              {{ messages.length }}
            </q-badge>
          </div>
        </q-card-section>

        <q-card-section class="messages-section">
          <div v-if="messages.length === 0" class="empty-state">
            <q-icon name="forum" size="4rem" color="grey-4" />
            <p class="empty-text">暂无留言</p>
            <p class="empty-subtext">成为第一个留言的人吧！</p>
          </div>

          <div v-else class="messages-list">
            <transition-group name="message-fade" tag="div">
              <q-card v-for="message in messages" :key="message.id" class="message-item" flat bordered>
                <q-card-section class="message-content">
                  <div class="message-header">
                    <div class="user-info">
                      <q-avatar :color="getAvatarColor(message.author)" text-color="white" class="user-avatar">
                        {{ message.author.charAt(0).toUpperCase() }}
                      </q-avatar>
                      <div class="user-details">
                        <div class="user-name">{{ message.author }}</div>
                        <div class="message-time">{{ formatTime(message.time) }}</div>
                      </div>
                    </div>
                    <q-btn flat round color="grey-6" icon="more_vert" size="sm" />
                  </div>

                  <div class="message-text">
                    {{ message.content }}
                  </div>

                  <div class="message-actions">
                    <q-btn flat round color="grey-6" icon="thumb_up" size="sm" class="action-btn">
                      <q-tooltip>点赞</q-tooltip>
                    </q-btn>
                    <q-btn flat round color="grey-6" icon="reply" size="sm" class="action-btn">
                      <q-tooltip>回复</q-tooltip>
                    </q-btn>
                    <q-btn flat round color="grey-6" icon="share" size="sm" class="action-btn">
                      <q-tooltip>分享</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </transition-group>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const form = ref({
  author: '',
  content: ''
})

const loading = ref(false)

const messages = ref([
  {
    id: 1,
    author: '张三',
    content: '这个平台真的很方便，帮我找到了丢失的钥匙！感谢所有好心人的帮助，让我感受到了社会的温暖。',
    time: '2024-01-15 14:30'
  },
  {
    id: 2,
    author: '李四',
    content: '感谢好心人帮我找到了钱包，谢谢！里面的证件对我很重要，真的非常感谢！',
    time: '2024-01-14 16:20'
  },
  {
    id: 3,
    author: '王五',
    content: '今天在图书馆捡到了一部手机，已经通过这个平台联系到失主了。希望大家都能互帮互助！',
    time: '2024-01-13 09:15'
  }
])

const getAvatarColor = (name) => {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const onSubmit = async () => {
  loading.value = true

  // 模拟提交延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 添加新留言
  const newMessage = {
    id: Date.now(),
    author: form.value.author,
    content: form.value.content,
    time: new Date().toLocaleString('zh-CN')
  }

  messages.value.unshift(newMessage)

  $q.notify({
    type: 'positive',
    message: '留言发布成功！',
    icon: 'check_circle',
    position: 'top'
  })

  // 重置表单
  form.value = {
    author: '',
    content: ''
  }

  loading.value = false
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #02aab0 0%, #00cdac 100%);
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
  animation: float 3s ease-in-out infinite;
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

.form-card,
.messages-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  background: linear-gradient(135deg, #02aab0 0%, #00cdac 100%);
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

.message-count {
  margin-left: auto;
}

.form-section,
.messages-section {
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

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-text {
  font-size: 1.2rem;
  color: #666;
  margin: 1rem 0 0.5rem 0;
}

.empty-subtext {
  color: #999;
  margin: 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.message-content {
  padding: 1.5rem;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
  font-weight: 600;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.message-time {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.message-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

/* 动画效果 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.5s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
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

  .form-section,
  .messages-section {
    padding: 1.5rem;
  }

  .page-content {
    padding: 0 0.75rem 1.5rem;
  }

  .message-content {
    padding: 1rem;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}
</style>

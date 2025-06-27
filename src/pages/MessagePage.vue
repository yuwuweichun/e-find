<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">留言板</div>

    <!-- 发布留言的表单 -->
    <q-card class="q-pa-md q-mb-md">
      <q-card-section>
        <div class="text-h6">发布留言</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="form.author" label="昵称" outlined :rules="[val => !!val || '请输入昵称']" />

          <q-input v-model="form.content" label="留言内容" type="textarea" outlined :rules="[val => !!val || '请输入留言内容']" />

          <div class="row justify-end">
            <q-btn label="发布留言" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- 留言列表 -->
    <q-card>
      <q-card-section>
        <div class="text-h6">留言列表</div>
      </q-card-section>

      <q-card-section>
        <div v-if="messages.length === 0" class="text-center q-pa-md text-grey">
          暂无留言
        </div>

        <div v-else class="q-gutter-md">
          <q-card v-for="message in messages" :key="message.id" flat bordered>
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar color="primary" text-color="white" class="q-mr-sm">
                  {{ message.author.charAt(0) }}
                </q-avatar>
                <div class="text-weight-medium">{{ message.author }}</div>
                <q-space />
                <div class="text-caption text-grey">{{ message.time }}</div>
              </div>
              <div class="text-body1">{{ message.content }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
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

const messages = ref([
  {
    id: 1,
    author: '张三',
    content: '这个平台真的很方便，帮我找到了丢失的钥匙！',
    time: '2024-01-15 14:30'
  },
  {
    id: 2,
    author: '李四',
    content: '感谢好心人帮我找到了钱包，谢谢！',
    time: '2024-01-14 16:20'
  }
])

const onSubmit = () => {
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
    message: '留言发布成功！'
  })

  // 重置表单
  form.value = {
    author: '',
    content: ''
  }
}
</script>

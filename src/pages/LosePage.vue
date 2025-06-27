<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">我丢失了物品</div>

    <!-- 发布失物信息的表单 -->
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">发布失物信息</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="form.title" label="物品名称" outlined :rules="[val => !!val || '请输入物品名称']" />

          <q-input v-model="form.description" label="物品描述" type="textarea" outlined
            :rules="[val => !!val || '请输入物品描述']" />

          <q-input v-model="form.location" label="丢失地点" outlined :rules="[val => !!val || '请输入丢失地点']" />

          <q-input v-model="form.contact" label="联系方式" outlined :rules="[val => !!val || '请输入联系方式']" />

          <div class="row justify-end">
            <q-btn label="发布信息" type="submit" color="info" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
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

const onSubmit = () => {
  // 这里可以添加发布失物信息的逻辑
  $q.notify({
    type: 'positive',
    message: '失物信息发布成功！'
  })

  // 重置表单
  form.value = {
    title: '',
    description: '',
    location: '',
    contact: ''
  }
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 600px;">
      <q-card-section>
        <div class="text-h6">用户列表</div>
      </q-card-section>
      <q-card-section>
        <q-table :rows="users" :columns="columns" row-key="id" flat dense :pagination="{ rowsPerPage: 10 }"
          :no-data-label="'暂无用户'" class="my-table">
          <template v-slot:body-cell-role="props">
            <q-td>
              {{ props.row.role }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="关闭" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
// 用户列表弹窗组件，分页显示所有用户，super admin可修改角色
import { ref, watch } from 'vue'
import { adminAPI } from 'src/services/api'

import { useQuasar } from 'quasar'

const show = defineModel() // v-model 绑定弹窗显示
const users = ref([])
const columns = [
  { name: 'id', label: 'ID', field: row => row.id, align: 'left', sortable: true },
  { name: 'username', label: '用户名', field: row => row.username, align: 'left', sortable: true },
  { name: 'role', label: '角色', field: row => row.role, align: 'left', sortable: true },
  { name: 'phone', label: '手机号', field: row => row.phone, align: 'left', sortable: true },
  { name: 'student_no', label: '学号/工号', field: row => row.student_no, align: 'left', sortable: true },
  { name: 'full_name', label: '真实姓名', field: row => row.full_name, align: 'left', sortable: true },
]
const $q = useQuasar()



// 获取用户列表
const fetchUsers = async () => {
  try {
    const res = await adminAPI.getUsers(1, 1000)
    // 兼容一维和二维数组
    users.value = Array.isArray(res.users) && Array.isArray(res.users[0]) ? res.users[0] : res.users || []
  } catch {
    $q.notify({ type: 'negative', message: '获取用户失败' })
    users.value = []
  }
}

// 打开时自动加载
watch(show, (val) => {
  if (val) fetchUsers()
})
</script>

<style scoped>
.my-table {
  min-height: 320px;
  font-size: 15px;
}

.q-table__top,
.q-table__bottom {
  padding: 0 16px;
}

.q-table th,
.q-table td {
  padding: 8px 12px;
}
</style>

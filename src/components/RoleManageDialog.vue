<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 500px;">
      <q-card-section>
        <div class="text-h6">角色管理</div>
      </q-card-section>
      <q-card-section>
        <q-table :rows="users" :columns="columns" row-key="id" flat dense :pagination="{ rowsPerPage: 10 }"
          :no-data-label="'暂无用户'" class="my-table">
          <template v-slot:body-cell-role="props">
            <q-td>
              <q-select v-if="isSuperAdmin && props.row.id !== myId" v-model="roleEdit[props.row.id]"
                :options="roleOptions" dense outlined style="min-width: 100px;"
                @update:model-value="val => changeRole(props.row, val)" />
              <span v-else>{{ props.row.role }}</span>
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
import { ref, computed, watch } from 'vue'
import { adminAPI } from 'src/services/api'
import { useUserStore } from 'src/stores/user'
import { useQuasar } from 'quasar'

const show = defineModel() // v-model 绑定弹窗显示
const users = ref([])
const columns = [
  { name: 'id', label: 'ID', field: row => row.id, align: 'left', sortable: true },
  { name: 'username', label: '用户名', field: row => row.username, align: 'left', sortable: true },
  { name: 'role', label: '角色', field: row => row.role, align: 'left', sortable: true },
]
const $q = useQuasar()
const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.user?.role === 'super admin')
const myId = computed(() => userStore.user?.id)
const roleOptions = ['user', 'admin', 'super admin']
const roleEdit = ref({})

const fetchUsers = async () => {
  try {
    const res = await adminAPI.getUsers(1, 1000)
    users.value = Array.isArray(res.users) && Array.isArray(res.users[0]) ? res.users[0] : res.users || []
    // 初始化每个用户的角色编辑值
    roleEdit.value = {}
    users.value.forEach(u => { roleEdit.value[u.id] = u.role })
  } catch {
    $q.notify({ type: 'negative', message: '获取用户失败' })
    users.value = []
  }
}

const changeRole = async (user, newRole) => {
  if (user.role === newRole) return
  try {
    await adminAPI.updateUserRole(user.id, newRole)
    $q.notify({ type: 'positive', message: '角色修改成功' })
    fetchUsers()
  } catch {
    $q.notify({ type: 'negative', message: '角色修改失败' })
    // 回退显示
    roleEdit.value[user.id] = user.role
  }
}

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

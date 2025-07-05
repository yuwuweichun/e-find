import { defineStore } from 'pinia'
import { userAPI } from 'src/services/api'
import avatarDefault from 'src/assets/icons/user_avatar.png'

const defaultUser = {
  id: null,
  username: '',
  avatarUrl: '',
  role: '',
  phone: '',
  studentNo: '',
  fullName: '',
  status: '',
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: { ...defaultUser },
    token: localStorage.getItem('token') || '',
    loaded: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => state.user.username || '请登录',
    avatar: (state) => {
      if (state.user.avatarUrl) {
        if (state.user.avatarUrl.startsWith('http')) {
          return state.user.avatarUrl
        } else {
          return `http://192.168.188.46:8080${state.user.avatarUrl}`
        }
      }
      return avatarDefault
    },
    isAdmin: (state) => state.user.role === '普通管理员' || state.user.role === '超级管理员',
    isSuperAdmin: (state) => state.user.role === '超级管理员',
  },
  actions: {
    setUser(user) {
      const adaptedUser = {
        ...defaultUser,
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        studentNo: user.studentNo,
        fullName: user.fullName,
        status: user.status,
      }

      this.user = adaptedUser
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('userId', this.user.id)
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    clear() {
      this.user = { ...defaultUser }
      this.token = ''
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
    },
    loadFromStorage() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          this.user = { ...defaultUser, ...JSON.parse(userStr) }
        } catch (e) {
          console.error('加载用户数据失败:', e)
          this.clear()
        }
      }
      this.token = localStorage.getItem('token') || ''
    },
    async fetchProfile() {
      if (!this.token) return
      try {
        const userId = localStorage.getItem('userId')
        const res = await userAPI.getProfile(userId)
        if (res && res.data) {
          this.setUser(res.data)
          console.log('✅ 用户信息加载成功:', this.user.username)
        }
        this.loaded = true
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
        if (error.message.includes('401')) {
          this.clear()
        }
      }
    },
    async updateProfile(profile) {
      try {
        const res = await userAPI.updateProfile(this.user.id, profile)
        await this.fetchProfile()
        return res
      } catch (error) {
        console.error('❌ 更新用户信息失败:', error)
        throw error
      }
    },
    logout() {
      this.clear()
      window.location.href = '/auth/login'
    },
  },
})

import { defineStore } from 'pinia'
import { userAPI } from 'src/services/api'
import avatarDefault from 'src/assets/icons/user_avatar.png'

const defaultUser = {
  id: null,
  username: '',
  avatar_url: '',
  role: '',
  phone: '',
  student_no: '',
  full_name: '',
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
    avatar: (state) => state.user.avatar_url || avatarDefault,
    isAdmin: (state) => state.user.role === 'admin' || state.user.role === 'super admin',
  },
  actions: {
    setUser(user) {
      this.user = { ...defaultUser, ...user }
      localStorage.setItem('user', JSON.stringify(this.user))
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
    },
    loadFromStorage() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        this.user = { ...defaultUser, ...JSON.parse(userStr) }
      }
      this.token = localStorage.getItem('token') || ''
    },
    async fetchProfile() {
      if (!this.token) return
      const res = await userAPI.getProfile()
      if (res && res.data) {
        this.setUser(res.data)
      }
      this.loaded = true
    },
    async updateProfile(profile) {
      const res = await userAPI.updateProfile(profile)
      await this.fetchProfile()
      return res
    },
    async uploadAvatar(file) {
      const res = await userAPI.uploadAvatar(file)
      if (res && res.data && res.data.url) {
        // 更新头像URL
        this.user.avatar_url = res.data.url
        localStorage.setItem('user', JSON.stringify(this.user))
      }
      return res
    },
    logout() {
      this.clear()
      window.location.href = '/auth/login'
    },
  },
})

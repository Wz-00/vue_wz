<template>
  <div class="content">
    <div class="col-md-6 offset-md-3">
      <h3>Login</h3>
      <form @submit.prevent="submit">
          <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-primary" :disabled="loading">Register</button>
        </div>
      </form>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
export default {
  data() {
    return { name: '', username: '', password: '', email: '', loading: false, error: null }
  },
  methods: {
    async submit() {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/auth/register', { name: this.name, username: this.username, password: this.password, email: this.email })
        const data = res.data || {}
        // dukung beberapa nama token yang mungkin dikembalikan backend
        const token =
          data.token ||
          data.accessToken ||
          (data.data && (data.data.token || data.data.accessToken))

        if (!token) throw new Error('Token tidak diterima dari backend')
        localStorage.setItem('jwt_token', token)

        const redirect = this.$route.query.redirect || '/'
        this.$router.push(redirect)
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Gagal Register'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
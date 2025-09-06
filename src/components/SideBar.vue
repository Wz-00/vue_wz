<!-- components/Sidebar.vue (perbarui seluruh file) -->
<template>
  <div>
    <div v-if="open" class="sidebar-overlay" @click="close"></div>
    <aside :class="['sidebar-drawer', open ? 'open' : '']" role="navigation" aria-label="Kategori">
      <div class="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
        <h5 class="mb-0">Kategori</h5>
        <button class="btn btn-sm btn-light" @click="close">Tutup</button>
      </div>

      <div class="sidebar-body px-3 py-2">
        <!-- TOP: conditional -->
        <div class="top-block">
          <div v-if="!isLogged" class="mb-2">
            <p class="mb-2 text-white">Belum punya akun?</p>
            <div class="d-flex gap-2">
              <router-link class="btn btn-outline-light btn-sm flex-fill" :to="{ name: 'Register' }" @click="close">Register</router-link>
              <router-link class="btn btn-light btn-sm flex-fill" :to="{ name: 'Login' }" @click="close">Login</router-link>
            </div>
          </div>

          <div v-else-if="userRole === 'user'" class="mb-2 text-white">
            <p class="mb-2">Selamat Datang, <strong>{{ displayName }}</strong></p>
            <router-link class="btn btn-primary btn-sm" :to="{ name: 'CreatePost' }" @click="close">Buat Post</router-link>
          </div>

          <div v-else-if="userRole === 'admin'" class="mb-2 text-white">
            <p class="mb-2">Selamat Datang, <strong>{{ displayName }}</strong></p>
            <div class="d-flex gap-2 mb-2">
              <router-link class="btn btn-primary btn-sm" :to="{ name: 'CreatePost' }" @click="close">Buat Post</router-link>
              <router-link class="btn btn-outline-light btn-sm" :to="{ path: '/category/add' }" @click="close">Tambah Category</router-link>
            </div>
          </div>

          <!-- fallback: tampilkan nama bila sudah login tapi role belum terdeteksi -->
          <div v-else-if="isLogged" class="mb-2 text-white">
            <p class="mb-2">Selamat Datang, <strong>{{ displayName || 'User' }}</strong></p>
            <small class="text-muted">Role tidak terdeteksi — periksa struktur user atau token.</small>
          </div>
        </div>

        <div class="faded-hr" />

        <div v-if="loading" class="text-white">Memuat kategori...</div>
        <div v-else-if="categories.length === 0" class="text-white">Belum ada kategori</div>
        <ul class="list-unstyled">
          <li v-for="cat in categories" :key="cat.id" class="mb-2">
            <router-link
              :to="{ name: 'Category', params: { slug: cat.slug } }"
              class="text-white d-block"
              @click="close"
            >
              {{ cat.name }}
              <small class="text-muted">({{ (cat.posts && cat.posts.length) || '-' }})</small>
            </router-link>
          </li>
        </ul>

        <template v-if="isLogged && userRole === 'admin'">
          <div class="faded-hr" />
          <div class="mt-2">
            <router-link class="btn btn-success btn-sm w-100" :to="{ path: '/category/add' }" @click="close">
              Tambah Category
            </router-link>
          </div>
        </template>
        <div v-else-if="isLogged" class="mb-2 text-white">
            <button class="btn btn-sm btn-outline-danger" @click="logout">Logout</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  data() {
    return {
      open: false,
      categories: [],
      loading: false,
      userObj: null
    }
  },
  computed: {
    isLogged() {
      return !!localStorage.getItem('jwt_token')
    },
    // coba banyak kemungkinan nama role
    userRole() {
      if (!this.userObj) return null
      const u = this.userObj
      // jika backend return array roles, ambil nama pertama
      if (Array.isArray(u.roles) && u.roles.length) {
        if (typeof u.roles[0] === 'string') return u.roles[0]
        if (u.roles[0].name) return u.roles[0].name
      }
      return u.role || u.role_name || u.user_role || u.type || (u.roles && typeof u.roles === 'string' ? u.roles : null) || null
    },
    displayName() {
      if (!this.userObj) return ''
      return this.userObj.name || this.userObj.username || this.userObj.full_name || this.userObj.email || ''
    }
  },
  mounted() {
    window.addEventListener('toggle-sidebar', this.onToggle)
    // listen auth changes so sidebar updates immediately after login/logout
    window.addEventListener('auth-changed', this.onAuthChanged)
    this.unwatch = this.$router.afterEach(() => { this.open = false })
    this.loadUser()
    this.fetchCategories()
  },
  beforeUnmount() {
    window.removeEventListener('toggle-sidebar', this.onToggle)
    window.removeEventListener('auth-changed', this.onAuthChanged)
    if (this.unwatch) this.unwatch()
  },
  methods: {
    onToggle() { this.open = !this.open },
    close() { this.open = false },
    logout() {
      localStorage.removeItem('jwt_token')
      window.dispatchEvent(new Event('auth-changed'))
      this.$router.push({ name: 'Home' })
    },

    async onAuthChanged() {
      // jika token hilang => clear userObj, jika ada => reload user
      if (!localStorage.getItem('jwt_token')) {
        this.userObj = null
        try { localStorage.removeItem('user') } catch (e) {}
      }
      // selalu coba load user (will short-circuit to localStorage.user or /me)
      await this.loadUser()
    },

    async loadUser() {
      // 1) coba localStorage.user
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          this.userObj = JSON.parse(raw)
          return
        }
      } catch (e) { /* ignore */ }

      // 2) decode jwt payload
      const token = localStorage.getItem('jwt_token')
      if (token) {
        try {
          const payload = parseJwtPayload(token)
          if (payload) {
            const possibleName = payload.name || payload.username || payload.sub || payload.email
            const possibleRole = payload.role || payload.roles || payload['http://schemas.role'] || payload['role_name']
            this.userObj = { name: possibleName, role: possibleRole || (Array.isArray(payload.roles) ? payload.roles[0] : null), rawPayload: payload }
            try { localStorage.setItem('user', JSON.stringify(this.userObj)) } catch(e) {}
            return
          }
        } catch (e) { /* ignore */ }
      }

      // 3) fallback: panggil /me jika token ada
      if (token) {
        try {
          const resp = await api.get('/me')
          this.userObj = resp.data.data || resp.data || null
          if (this.userObj) {
            try { localStorage.setItem('user', JSON.stringify(this.userObj)) } catch(e) {}
          }
        } catch (err) { /* ignore */ }
      }
    },

    async fetchCategories() {
      this.loading = true
      try {
        const resp = await api.get('/categories')
        this.categories = resp.data.data || resp.data || []
      } catch (err) {
        this.categories = []
      } finally {
        this.loading = false
      }
    }
  }
}

/* helper: decode base64url JWT payload */
function parseJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (e) {
    console.warn('parseJwtPayload error', e)
    return null
  }
}
</script>

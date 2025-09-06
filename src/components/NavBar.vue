<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <a class="navbar-brand" href="/">MyNews</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse">
        <span class="navbar-toggler-icon"></span>
      </button>

      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <!-- trigger sidebar -->
          <button class="btn text-white ms-5" @click="toggleSidebar">
            <iconify-icon icon="material-symbols:menu-rounded" class="me-2"></iconify-icon> Menu
          </button>
        </li>
      </ul>

      <div class="collapse navbar-collapse" id="navCollapse">
        <form class="d-flex ms-auto me-3" @submit.prevent="search">
          <input v-model="q" class="form-control me-2" placeholder="Cari artikel..." />
          <button class="btn btn-outline-primary" type="submit">Cari</button>
        </form>
        <div class="auth-check" v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">Login</router-link>
        </div>
        <div class="auth-check" v-else>
          <button class="btn btn-sm btn-outline-danger" @click="logout">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return { q: '', logged: !!localStorage.getItem('jwt_token') }
  },
  computed: {
    isLoggedIn() { return this.logged }
  },
  mounted() {
    window.addEventListener('auth-changed', this.onAuthChanged)
  },
  beforeUnmount() {
    window.removeEventListener('auth-changed', this.onAuthChanged)
  },
  methods: {
    onAuthChanged() { this.logged = !!localStorage.getItem('jwt_token') },
    search() {
      const q = (this.q || '').trim()
      if (q) {
        // gunakan push agar tercatat di history; pastikan page reset ke 1
        this.$router.push({ name: 'Home', query: { q, page: 1 } }).catch(()=>{})
      } else {
        // hapus query agar URL bersih
        this.$router.push({ name: 'Home', query: {} }).catch(()=>{})
      }
    },
    logout() {
      localStorage.removeItem('jwt_token')
      window.dispatchEvent(new Event('auth-changed'))
      this.$router.push({ name: 'Home' })
    },
    toggleSidebar() {
      window.dispatchEvent(new Event('toggle-sidebar')) 
    }
  }
}
</script>

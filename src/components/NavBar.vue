<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="/">MyNews</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navCollapse">
        <form class="d-flex ms-auto me-3" @submit.prevent="search">
          <input v-model="q" class="form-control me-2" placeholder="Cari artikel..." />
          <button class="btn btn-outline-primary" type="submit">Cari</button>
        </form>

        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item" v-else>
            <button class="btn btn-sm btn-outline-danger" @click="logout">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return { q: '' }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('jwt_token')
    }
  },
  methods: {
    search() {
      this.$router.push({ name: 'Home', query: { q: this.q } })
    },
    logout() {
      localStorage.removeItem('jwt_token')
      // optional: remove other user data
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Berita Terbaru</h2>
      <div>
        <router-link v-if="isLoggedIn" to="/create" class="btn btn-primary">Buat Post</router-link>
        <router-link v-else to="/login" class="btn btn-outline-secondary">Login</router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">Loading…</div>

    <div v-else>
      <PostCard v-for="p in posts" :key="p.id" :post="p" />
      <nav v-if="meta.pages && meta.pages > 1">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: meta.page <= 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(meta.page - 1)">Previous</a>
          </li>
          <li class="page-item" v-for="n in meta.pages" :class="{ active: n === meta.page }" :key="n">
            <a class="page-link" href="#" @click.prevent="changePage(n)">{{ n }}</a>
          </li>
          
          <li class="page-item" :class="{ disabled: meta.page >= meta.pages }">
            <a class="page-link" href="#" @click.prevent="changePage(meta.page + 1)">Next</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal for unauthorized access -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Akses Ditolak</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Anda belum melakukan login untuk mengakses halaman ini, agar dapat mengakses halaman ini silahkan login dengan link yang sudah disediakan.
          </div>
          <div class="modal-footer">
            <router-link class="btn btn-primary" to="/login">Login</router-link>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import PostCard from '@/components/PostCard.vue'

export default {
  components: { PostCard },
  data() {
    return {
      posts: [],
      meta: { page: 1, pages: 1, total: 0, limit: 10 },
      loading: false
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('jwt_token')
    }
  },
  async mounted() {
    // open modal if redirected with unauth
    if (this.$route.query.unauth === '1') {
      const modalEl = document.getElementById('loginModal')
      if (modalEl) {
        const bootstrapModal = new bootstrap.Modal(modalEl)
        bootstrapModal.show()
      }
    }
    await this.fetchPosts()
  },
  watch: {
    '$route.query': {
      handler() { this.fetchPosts() },
      deep: true
    }
  },
  methods: {
    async fetchPosts() {
      this.loading = true
      try {
        const params = {
          page: this.$route.query.page || 1,
          limit: this.$route.query.limit || 10,
          q: this.$route.query.q || undefined
        }
        const resp = await api.get('/posts', { params })
        let items = resp.data.data || []

        // client-side search fallback: jika backend tidak memfilter berdasarkan q
        const q = String(this.$route.query.q || '').trim().toLowerCase()
        if (q) {
          items = items.filter(p => {
            if ((p.title || '').toLowerCase().includes(q)) return true
            if ((p.excerpt || '').toLowerCase().includes(q)) return true
            if (p.category && (p.category.name || '').toLowerCase().includes(q)) return true
            if (Array.isArray(p.tags) && p.tags.some(t => (t.name || '').toLowerCase().includes(q))) return true
            return false
          })

          const limit = Number(resp.data.meta?.limit || this.meta.limit || 10)
          const total = items.length
          this.meta = {
            page: 1,
            pages: Math.max(1, Math.ceil(total / limit)),
            total,
            limit
          }
        } else {
          // gunakan meta dari backend bila tidak ada query
          this.meta = resp.data.meta || this.meta
        }

        this.posts = items
      } catch (err) {
        console.error('Failed to fetch posts', err)
      } finally {
        this.loading = false
      }
    },
    changePage(n) {
      if (n < 1 || n > this.meta.pages) return
      this.$router.push({ name: 'Home', query: { ...this.$route.query, page: n } })
    }
  }
}
</script>

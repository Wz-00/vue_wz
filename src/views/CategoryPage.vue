<template>
  <div class="content">
    <div class="news-container container">
      <div class="row">
        <div class="col-lg-8">
          <div class="mb-4" v-if="category && category.posts && category.posts.length">
            <PostCard :post="category.posts[0]" variant="headline-stacked" />
          </div>

          <div class="row g-3">
            <div class="col-6 col-md-4" v-for="p in gridItems" :key="p.id">
              <PostCard :post="p" variant="stacked" />
            </div>
          </div>

          <div v-if="!category || !category.posts || category.posts.length === 0" class="text-white mt-3">
            Belum ada artikel pada kategori ini.
          </div>
        </div>

        <!-- kanan: sidebar populer (bisa reuse dari Home) -->
        <div class="col-lg-4">
          <aside class="sidebar-popular">
            <h4 class="mb-4"><strong>Artikel Terbaru</strong></h4>
            <div v-for="(p, idx) in popular" :key="p.id" class="pop-item">
              <div class="pop-rank">{{ idx+1 }}</div>
              <div style="flex:1;">
                <router-link :to="{ name: 'PostDetail', params: { slug: p.slug } }" class="text-white">{{ p.title }}</router-link>
                <div class="text-white opacity-75" style="font-size: 12px;">{{ p.category?.name || '' }}</div>
              </div>
            </div>
            <router-link class="text-primary" :to="{ name: 'Home', query: { } }">Terpopuler Lainnya &nbsp;›</router-link>
          </aside>
        </div>
      </div>

      <!-- sorotan: tampilkan category sebagai sorotan kecil -->
      <div class="sorotan-section mt-4">
        <h4 class="sorotan-title">Sorotan Lain</h4>
        <div class="row g-4">
          <div class="col-12 col-md-6" v-for="cat in categoriesWithPosts" :key="cat.id">
            <h6 class="text-white mb-2">{{ cat.name }}</h6>
            <div class="row g-2">
              <div class="col-6" v-for="post in (cat.posts || []).slice(0,2)" :key="post.id">
                <div class="news-tile">
                  <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" style="text-decoration:none;">
                    <img :src="resolveImage(post)" class="tile-image" alt="" loading="lazy"/>
                    <div class="tile-title">{{ post.title }}</div>
                    <div class="tile-meta">{{ formatDate(post.published_at || post.created_at) }}</div>
                  </router-link>
                </div>
              </div>
            </div>
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
  props: ['slug'],
  data() {
    return {
      category: null,
      popular: [],
      categoriesWithPosts: [],
    }
  },
  async mounted() {
    await this.fetchCategoryBySlug()
    await this.fetchPopular()
    await this.fetchCategoriesWithPosts()
  },
  watch: {
    // jika user pindah slug, refetch
    '$route.params.slug': 'fetchCategoryBySlug'
  },
  methods: {
    async fetchCategoryBySlug() {
      const slug = this.$route.params.slug
      if (!slug) return
      try {
        // gunakan endpoint /categories/posts yang mengembalikan categories dengan posts
        const resp = await api.get('/categories/posts')
        const cats = resp.data.data || resp.data || []
        this.category = cats.find(c => (c.slug || '').toString() === slug.toString()) || null
      } catch (err) {
        console.error('fetchCategoryBySlug error', err)
        this.category = null
      }
    },
    async fetchPopular() {
      try {
        const resp = await api.get('/posts/popular')
        // dukung bentuk resp.data.data dan resp.data
        this.popular = (resp.data && (resp.data.data || resp.data)) || []
      } catch (err) {
        console.error('fetchPopular error:', err)
        // fallback: ambil post global terbaru (bukan kategori)
        try {
          const resp2 = await api.get('/posts', { params: { page: 1, limit: 5 } })
          this.popular = (resp2.data && (resp2.data.data || resp2.data)) || []
        } catch (err2) {
          console.error('fallback latest posts failed:', err2)
          this.popular = []
        }
      }
    },


    async fetchCategoriesWithPosts() {
      try {
        const resp = await api.get('/categories/posts')
        this.categoriesWithPosts = (resp.data.data || resp.data || []).filter(c => Array.isArray(c.posts) && c.posts.length > 0)
      } catch (err) {
        this.categoriesWithPosts = []
      }
    },
    resolveImage(post) {
      if (!post) return '/placeholder-rect.png'
      const img = post.featured_image || post.image || (post.media && post.media.path) || post.media
      if (!img) return '/placeholder-rect.png'
      if (typeof img === 'string') return img.startsWith('http') ? img : `${api.defaults.baseURL}/${img.replace(/^\//, '')}`
      if (img.full_url) return img.full_url
      if (img.path) return `${api.defaults.baseURL}/${img.path.replace(/^\//, '')}`
      return '/placeholder-rect.png'
    },
    formatDate(v) {
      if (!v) return ''
      return new Date(v).toLocaleDateString()
    }
  },
  computed: {
    gridItems() {
      if (!this.category || !this.category.posts) return []
      return (this.category.posts || []).slice(1, 7)
    }
  }
}
</script>

<style scoped>
/* minimal local style; global CSS sudah ada */
</style>

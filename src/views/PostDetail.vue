<template>
  <div>
    <div v-if="loading" class="text-center py-5">Loading…</div>

    <div v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p class="text-muted">oleh {{ post.author?.name }} • {{ formatDate(post.published_at || post.created_at) }}</p>
      <img v-if="post.featured_image" :src="absoluteMediaUrl(post.featured_image)" class="img-fluid mb-3" />
      <div v-html="post.content"></div>
    </div>

    <div v-else class="alert alert-warning">Artikel tidak ditemukan.</div>
  </div>
</template>

<script>
import api, { absoluteMediaUrl } from '@/services/api'

export default {
  props: ['slug'],
  data() { return { post: null, loading: false } },
  async mounted() {
    await this.load()
  },
  methods: {
    absoluteMediaUrl,
    async load() {
      this.loading = true
      try {
        const resp = await api.get(`/posts/${this.$route.params.slug}`)
        this.post = resp.data.data
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.post = null
        } else {
          console.error(err)
        }
      } finally {
        this.loading = false
      }
    },
    formatDate(v) {
      if (!v) return ''
      return new Date(v).toLocaleString()
    }
  }
}
</script>

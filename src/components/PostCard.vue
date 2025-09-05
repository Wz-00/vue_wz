<template>
  <div class="card mb-3">
    <div v-if="imageUrl" class="row g-0">
      <div class="col-md-4">
        <!-- gunakan img biasa; jika pakai Ionic dan ingin lazy-loading, bisa ganti ke <ion-img> -->
        <img
          :src="imageUrl"
          :alt="post.title || 'featured image'"
          class="img-fluid rounded-start"
          style="object-fit: cover; height: 180px; width: 100%;"
          loading="lazy"
          crossorigin="anonymous"
        />
      </div>

      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">
            <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }">
              {{ post.title }}
            </router-link>
          </h5>
          <p class="card-text" v-html="post.excerpt"></p>
          <p class="card-text">
            <small class="text-muted">
              by {{ post.author?.name || 'Unknown' }} • {{ formatDate(post.published_at || post.created_at) }}
            </small>
          </p>
        </div>
      </div>
    </div>

    <div v-else class="card-body">
      <h5 class="card-title">
        <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }">
          {{ post.title }}
        </router-link>
      </h5>
      <p class="card-text" v-html="post.excerpt"></p>
      <p class="card-text">
        <small class="text-muted">
          by {{ post.author?.name || 'Unknown' }} • {{ formatDate(post.published_at || post.created_at) }}
        </small>
      </p>
    </div>
  </div>
</template>

<script>
import { absoluteMediaUrl } from '@/services/api'

export default {
  props: { post: { type: Object, required: true } },
  computed: {
    // compute satu imageUrl yang reliable
    imageUrl() {
      const img = this.post.featured_image || this.post.image || this.post.media

      if (!img) return null

      // if already an object with full_url or path
      if (typeof img === 'object') {
        if (img.full_url && /^https?:\/\//i.test(img.full_url)) return img.full_url
        if (img.path) return absoluteMediaUrl(img.path)
        if (img.url) return absoluteMediaUrl(img.url)
      }

      // if string and already absolute
      if (typeof img === 'string') {
        if (/^https?:\/\//i.test(img)) return img
        // otherwise treat as relative path
        return absoluteMediaUrl(img)
      }

      return null
    }
  },
  methods: {
    formatDate(v) {
      if (!v) return ''
      return new Date(v).toLocaleString()
    }
  }
}
</script>

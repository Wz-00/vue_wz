<template>
  <div>
    <!-- HEADLINE (image top, title below) -->
    <div v-if="variant === 'headline-stacked'" class="headline-block">
      <router-link :to="postLink" style="text-decoration:none;">
        <img :src="imageUrl" :alt="post.title || 'headline image'" loading="lazy" crossorigin="anonymous" />
      </router-link>
      <div class="headline-caption">
        <router-link :to="postLink" class="headline-title">{{ post.title }}</router-link>
        <div class="text-white" style="font-size:12px; margin-top:6px;">
          {{ post.category?.name || '' }} • {{ formatDate(post.published_at || post.created_at) }}
        </div>
      </div>
    </div>

    <!-- STACKED SMALL (image top, title below) -->
    <div v-else-if="variant === 'stacked'" class="news-tile">
      <router-link :to="postLink" style="text-decoration:none;">
        <img :src="imageUrl" class="tile-image" :alt="post.title || 'thumb'" loading="lazy" crossorigin="anonymous" />
        <div class="tile-title">{{ post.title }}</div>
        <div class="tile-meta">{{ post.category?.name || '' }}</div>
      </router-link>
    </div>

    <!-- fallback: simple link -->
    <div v-else>
      <router-link :to="postLink" class="text-white">{{ post.title }}</router-link>
    </div>
  </div>
</template>

<script>
import { absoluteMediaUrl } from '@/services/api'

export default {
  props: {
    post: { type: Object, required: true },
    variant: { type: String, default: 'stacked' } // 'stacked' | 'headline-stacked'
  },
  computed: {
    imageUrl() {
      const img = this.post.featured_image || this.post.image || (this.post.media && this.post.media.path) || this.post.media
      if (!img) return '/placeholder-rect.png'
      if (typeof img === 'string') {
        if (/^https?:\/\//i.test(img)) return img
        return absoluteMediaUrl(img)
      }
      if (typeof img === 'object') {
        if (img.full_url) return img.full_url
        if (img.path) return absoluteMediaUrl(img.path)
        if (img.url) return absoluteMediaUrl(img.url)
      }
      return '/placeholder-rect.png'
    },
    postLink() {
      return { name: 'PostDetail', params: { slug: this.post.slug } }
    }
  },
  methods: {
    formatDate(v) {
      if (!v) return ''
      return new Date(v).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
/* Kosong: styling utama sudah di src/assets/css/news-layout.css */
</style>

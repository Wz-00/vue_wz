<template>
  <div class="col-md-8 offset-md-2">
    <h3>Buat Post Baru</h3>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label>Judul</label>
        <input v-model="title" class="form-control" required />
      </div>

      <div class="mb-3">
        <label>Excerpt</label>
        <textarea v-model="excerpt" class="form-control" rows="2"></textarea>
      </div>

      <div class="mb-3">
        <label>Content (HTML allowed)</label>
        <textarea v-model="content" class="form-control" rows="8"></textarea>
      </div>

      <!-- Category -->
      <div class="mb-3">
        <label>Category (opsional)</label>
        <div class="d-flex gap-2 mb-2">
          <select v-model="selectedCategoryId" class="form-select">
            <option :value="null">-- Pilih category (opsional) --</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <!-- Tags -->
      <div class="mb-3">
        <label>Tags (opsional)</label>
        <div class="mb-2">
          <div v-if="tags.length">
            <div v-for="t in tags" :key="t.id" class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" :id="'tag-'+t.id" :value="t.id" v-model="selectedTags" />
              <label class="form-check-label" :for="'tag-'+t.id">{{ t.name }}</label>
            </div>
          </div>
        </div>
        <div class="input-group">
          <input v-model="newTagName" placeholder="Tambahkan tag baru..." class="form-control" />
          <button type="button" class="btn btn-secondary" @click="createTag" :disabled="creatingTag">
            {{ creatingTag ? 'Membuat...' : 'Tambah Tag' }}
          </button>
        </div>
      </div>

      <!-- Featured image upload -->
      <div class="mb-3">
        <label>Featured Image (opsional)</label>
        <div class="d-flex align-items-center gap-2">
          <input ref="file" type="file" accept="image/*" @change="onFileChange" />
          <button type="button" class="btn btn-outline-secondary" @click="uploadImage" :disabled="!file || uploading">
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
          <div v-if="featuredImagePath" class="ms-2">
            <small>Uploaded: </small>
            <a :href="featuredImagePath" target="_blank" rel="noopener">{{ featuredImageName }}</a>
            <button type="button" class="btn btn-sm btn-link text-danger" @click="removeFeaturedImage">Hapus</button>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="mb-3">
        <label>Status</label>
        <select v-model="status" class="form-select">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button class="btn btn-success" :disabled="loading">{{ loading ? 'Menyimpan...' : 'Kirim' }}</button>
    </form>

    <div v-if="message" class="alert alert-info mt-3">{{ message }}</div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import api from '@/services/api' // pastikan ini instance axios dengan auth header jika perlu

export default {
  data() {
    return {
      title: '',
      excerpt: '',
      content: '',
      loading: false,
      message: '',
      error: '',

      // tags & category
      tags: [],
      selectedCategoryId: null,

      selectedTags: [], // will hold tag ids (numbers) and we will append new tag names
      newTagName: '',
      creatingTag: false,

      // image upload
      file: null,
      uploading: false,
      featuredImagePath: null,
      featuredImageName: null,

      status: 'draft'
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchTags();
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await api.get('/categories');
        this.categories = res.data.data || [];
      } catch (err) {
        console.error('fetchCategories', err);
      }
    },
    async fetchTags() {
      try {
        const res = await api.get('/tags');
        this.tags = res.data.data || [];
      } catch (err) {
        console.error('fetchTags', err);
      }
    },
    async createTag() {
      if (!this.newTagName || !this.newTagName.trim()) return;
      this.creatingTag = true;
      try {
        const res = await api.post('/tags', { name: this.newTagName.trim() });
        const t = res.data.data;
        this.tags.push(t);
        // check the newly created tag
        this.selectedTags.push(t.id);
        this.newTagName = '';
      } catch (err) {
        console.error('createTag', err);
        alert(err.response?.data?.message || 'Gagal membuat tag');
      } finally {
        this.creatingTag = false;
      }
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      this.file = f || null;
    },
    async uploadImage() {
      if (!this.file) return alert('Pilih file terlebih dahulu');
      this.uploading = true;
      this.message = this.error = '';
      try {
        const fd = new FormData();
        fd.append('file', this.file);
        const res = await api.post('/media/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const media = res.data.data;
        // backend harus mengembalikan { id, path, filename }
        this.featuredImagePath = media.path;
        this.featuredImageName = media.filename || media.path;
        this.file = null;
        this.$refs.file.value = '';
      } catch (err) {
        console.error('uploadImage', err);
        this.error = err.response?.data?.message || 'Gagal upload image';
      } finally {
        this.uploading = false;
      }
    },
    removeFeaturedImage() {
      this.featuredImagePath = null;
      this.featuredImageName = null;
    },

    async submit() {
      this.loading = true;
      this.message = this.error = '';
      try {
        // Prepare tags payload:
        // - include selected tag ids (numbers)
        // - no need to include tag objects for ones that already exist
        // - any new tags already created via createTag() will be in selectedTags as id
        // If you want to allow sending new tag names directly (not created), you could append strings:
        // e.g. tagsPayload = [...this.selectedTags, ...this.pendingNewTagNames]
        const tagsPayload = this.selectedTags;

        const payload = {
          title: this.title,
          excerpt: this.excerpt,
          content: this.content,
          status: this.status,
          category_id: this.selectedCategoryId || null,
          tags: tagsPayload,
          featured_image: this.featuredImagePath || null
        };

        const res = await api.post('/posts', payload);
        const created = res.data.data;
        this.message = 'Post berhasil dibuat!';
        // redirect jika ada slug
        if (created && created.slug) {
          this.$router.push({ name: 'PostDetail', params: { slug: created.slug } });
        }
      } catch (err) {
        console.error('submit', err);
        this.error = err.response?.data?.message || err.response?.data?.error || 'Gagal membuat post';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

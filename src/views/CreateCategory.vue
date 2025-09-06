<template>
    <div class="content">
        <div class="col-md-8 offset-md-2">
            <h3>Buat Kategori Baru</h3>

            <form @submit.prevent="submit">
            <div class="mb-3">
                <label>Nama</label>
                <input v-model="name" class="form-control" required :disabled="loading" />
            </div>

            <div class="mb-3">
                <label>Deskripsi (opsional)</label>
                <textarea v-model="description" class="form-control" rows="4" :disabled="loading"></textarea>
            </div>

            <button class="btn btn-success" :disabled="loading">{{ loading ? 'Menyimpan...' : 'Kirim' }}</button>
            </form>

            <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
    </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'CreateCategory',
  data() {
    return {
      name: '',
      description: '',
      loading: false,
      message: '',
      error: ''
    }
  },
  methods: {
    async submit() {
      // reset
      this.loading = true
      this.message = ''
      this.error = ''

      try {
        const payload = {
          name: this.name,
          description: this.description || null
        }

        const res = await api.post('/categories', payload)
        const cat = res.data && res.data.data

        if (res.status === 201) {
          this.message = 'Kategori berhasil dibuat!'
        } else {
          // 200 means already existed (findOrCreate returned existing)
          this.message = 'Kategori disimpan (sudah ada atau diambil).'
        }

        // jika backend mengembalikan slug, langsung arahkan ke halaman category
        if (cat && cat.slug) {
          // push route ke Category (sesuaikan dengan router Anda)
          this.$router.push({ name: 'Category', params: { slug: cat.slug } })
        }
      } catch (err) {
        console.error('create category error', err)
        if (err.response) {
          const status = err.response.status
          const data = err.response.data || {}

          if (status === 403) {
            this.error = 'Akses hanya untuk admin.'
          } else if (status === 422) {
            this.error = data.error || 'Nama kategori wajib diisi.'
          } else {
            this.error = data.message || data.error || 'Gagal membuat kategori.'
          }
        } else {
          this.error = 'Tidak dapat menghubungi server.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* sedikit penyesuaian layout agar rapi pada mobile */
@media (max-width: 767px) {
  .col-md-8.offset-md-2 {
    padding: 0 1rem;
  }
}
</style>

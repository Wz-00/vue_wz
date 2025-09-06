// services/category.js
import api from './api'

// endpoint assumed: POST /categories
export function createCategory(payload) {
  return api.post('/categories', payload)
}

export function listCategories(params = {}) {
  return api.get('/categories', { params })
}

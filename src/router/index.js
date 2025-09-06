import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import PostDetail from '@/views/PostDetail.vue'
import Login from '@/views/LoginPage.vue'
import CreatePost from '@/views/CreatePost.vue'
import Register from '@/views/RegisterPage.vue'
import CategoryPage from '@/views/CategoryPage.vue'
import CreateCategory from '@/views/CreateCategory.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/post/:slug', name: 'PostDetail', component: PostDetail, props: true },
  { path: '/category/:slug', name: 'Category', component: CategoryPage, props: true },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/create', name: 'CreatePost', component: CreatePost, meta: { requiresAuth: true } },
  { path: '/category/add', name: 'CreateCategory', component: CreateCategory, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwt_token')
  if (to.meta && to.meta.requiresAuth && !token) {
    // redirect to home with query that menandakan "unauthorized"
    next({ name: 'Home', query: { unauth: '1', redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

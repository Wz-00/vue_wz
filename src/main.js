import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

/* Ionic CSS */
import '@ionic/vue/css/core.css'
/* Bootstrap */
import 'bootstrap/dist/css/bootstrap.min.css'
/* Bootstrap JS (bundle includes modal) */
import 'bootstrap/dist/js/bootstrap.bundle'
// Css Layout
import '@/assets/css/news-layout.css'

const app = createApp(App)
const head = createHead()
app.use(head)
app.use(IonicVue).use(router)

router.isReady().then(() => {
  app.mount('#app')
})

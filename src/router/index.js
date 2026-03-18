import { createRouter, createWebHistory } from 'vue-router'
import Today from '../views/Today.vue'
import Consultation from '../views/Consultation.vue'
import Prescription from '../views/Prescription.vue'
import Companion from '../views/Companion.vue'
import Doctors from '../views/Doctors.vue'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: Today,
    meta: { title: '今日' }
  },
  {
    path: '/consultation',
    name: 'Consultation',
    component: Consultation,
    meta: { title: '问诊' }
  },
  {
    path: '/prescription',
    name: 'Prescription',
    component: Prescription,
    meta: { title: '方子' }
  },
  {
    path: '/companion',
    name: 'Companion',
    component: Companion,
    meta: { title: '陪伴' }
  },
  {
    path: '/doctors',
    name: 'Doctors',
    component: Doctors,
    meta: { title: '医生' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

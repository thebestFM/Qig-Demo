import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有store
export * from './user'
export * from './consultation'
export * from './prescription'
export * from './companion'
export * from './doctor'

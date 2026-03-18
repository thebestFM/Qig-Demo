<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
    >
      <div class="tab-icon"><img :src="tab.icon" :alt="tab.label" class="tab-icon-img" /></div>
      <div class="tab-label">{{ tab.label }}</div>
      <div class="tab-active-line"></div>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/today', label: '四时', icon: '/compass.png' },
  { path: '/consultation', label: '四诊', icon: '/maixiang.png' },
  { path: '/prescription', label: '本草', icon: '/yaoguan.png' },
  { path: '/companion', label: '问道', icon: '/chat.png' },
  { path: '/doctors', label: '寻医', icon: '/doctor.png' }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--tab-bar-height) + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 12px rgba(44, 36, 22, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0 4px;
  text-decoration: none;
  transition: all var(--transition-normal);
  position: relative;
}

.tab-icon {
  margin-bottom: 3px;
  transition: transform var(--transition-normal);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.45;
  transition: opacity var(--transition-normal), filter var(--transition-normal);
  filter: grayscale(30%);
}

.tab-item.active .tab-icon-img {
  opacity: 1;
  filter: none;
}

.tab-label {
  font-size: 20px;
  color: var(--text-secondary);
  font-family: var(--font-xingshu);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-normal);
  line-height: 1.2;
}

.tab-active-line {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: transform var(--transition-normal);
}

.tab-item.active .tab-icon {
  transform: scale(1.15);
}

.tab-item.active .tab-label {
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.tab-item.active .tab-active-line {
  transform: translateX(-50%) scaleX(1);
}

.tab-item:not(.active):hover .tab-label {
  color: var(--text-primary);
}
</style>

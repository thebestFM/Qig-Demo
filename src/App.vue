<script setup>
import AppHeader from './components/common/AppHeader.vue'
import TabBar from './components/common/TabBar.vue'
</script>

<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <!-- 水印 Logo -->
      <div class="watermark">
        <img src="/wendao.png" alt="" class="watermark-img" />
      </div>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <TabBar />
  </div>
</template>

<style>
.main-content {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  position: relative;
}

.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300vw;        /* ← 调整水印大小：改这里的数值，单位 vw（视口宽度百分比）*/
  max-width: 1000px;   /* ← 最大宽度上限 */
  min-width: 200px;
  pointer-events: none;
  z-index: 0;
}

.watermark-img {
  width: 100%;
  height: auto;
  opacity: 0.07;
  filter: grayscale(30%);
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

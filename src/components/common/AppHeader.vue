<template>
  <header class="app-header">
    <div class="header-left"></div>
    <div class="header-content">
      <img src="/wendao.png" alt="岐黄问道" class="logo-img" />
      <p class="app-subtitle"><span class="qig-en">Qig</span>四时常伴</p>
    </div>
  </header>
</template>

<script setup>
// 顶部栏组件
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 248, 243, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px var(--spacing-lg) 10px;
}

.header-left {
  position: absolute;
  left: var(--spacing-lg);
}

.header-content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.logo-img {
  height: 80px;
  width: auto;
  object-fit: contain;
  display: block;
}

.app-subtitle {
  font-size: 16px;
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  letter-spacing: 0.25em;
  margin: 0 0 4px 0;
}

.qig-en {
  font-family: var(--font-english-script);
  font-size: 18px;
  letter-spacing: 0.05em;
}

</style>

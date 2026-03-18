<template>
  <header class="app-header">
    <div class="header-left"></div>
    <div class="header-content">
      <img src="/wendao.png" alt="岐黄问道" class="logo-img" />
      <p class="app-subtitle">AI 中医陪伴</p>
    </div>
    <div class="header-decoration">
      <div class="seal"></div>
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
  height: var(--header-height);
  background: rgba(250, 248, 243, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-lg);
}

.header-left {
  position: absolute;
  left: var(--spacing-lg);
}

.ai-badge {
  font-size: 10px;
  font-family: var(--font-sans);
  color: var(--color-accent);
  background: rgba(200, 75, 49, 0.08);
  border: 1px solid rgba(200, 75, 49, 0.2);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  letter-spacing: 0.05em;
  font-weight: var(--font-weight-medium);
}

.header-content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  display: block;
}

.app-subtitle {
  font-size: 10px;
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  letter-spacing: 0.25em;
  margin: 0;
}

.header-decoration {
  position: absolute;
  right: var(--spacing-lg);
}

.seal {
  width: 30px;
  height: 30px;
  border: 2px solid var(--color-accent);
  border-radius: var(--radius-sm);
  position: relative;
  transform: rotate(5deg);
  background: rgba(200, 75, 49, 0.04);
}

.seal::before {
  content: '道';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-xingshu);
  font-size: 16px;
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
}
</style>

<template>
  <div class="card-base" :class="[size, { clickable: clickable }]">
    <div v-if="title" class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.card-base {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.card-base.clickable {
  cursor: pointer;
}

.card-base.clickable:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.card-base.clickable:active {
  transform: translateY(0);
}

/* 尺寸 */
.card-base.small {
  padding: var(--spacing-md);
}

.card-base.medium {
  padding: var(--spacing-lg);
}

.card-base.large {
  padding: var(--spacing-xl);
}

/* 头部 */
.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* 主体 */
.card-body {
  flex: 1;
}

/* 底部 */
.card-footer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}
</style>

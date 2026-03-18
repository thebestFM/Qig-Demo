<template>
  <button
    class="btn-base"
    :class="[type, size, { block: block, loading: loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary', // primary, secondary, text
    validator: (value) => ['primary', 'secondary', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  outline: none;
  white-space: nowrap;
  user-select: none;
}

.btn-base:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-base.loading {
  cursor: wait;
}

/* 尺寸 */
.btn-base.small {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.btn-base.medium {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.btn-base.large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

/* 块级按钮 */
.btn-base.block {
  display: flex;
  width: 100%;
}

/* 类型样式 */
.btn-base.primary {
  background: var(--color-accent);
  color: var(--text-light);
}

.btn-base.primary:hover:not(:disabled) {
  background: var(--color-accent-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.btn-base.primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-base.secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-base.secondary:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--color-accent);
}

.btn-base.text {
  background: transparent;
  color: var(--color-accent);
}

.btn-base.text:hover:not(:disabled) {
  background: rgba(200, 75, 49, 0.08);
}

/* 加载动画 */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

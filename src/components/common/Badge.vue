<template>
  <span class="badge-base" :class="type">
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary', // primary, success, warning, danger
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  }
})
</script>

<style scoped>
.badge-base {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.badge-base.primary {
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent);
}

.badge-base.success {
  background: rgba(91, 140, 90, 0.1);
  color: var(--color-success);
}

.badge-base.warning {
  background: rgba(230, 162, 60, 0.1);
  color: var(--color-warning);
}

.badge-base.danger {
  background: rgba(245, 108, 108, 0.1);
  color: var(--color-danger);
}
</style>

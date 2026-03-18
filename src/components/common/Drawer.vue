<template>
  <teleport to="body">
    <transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click="closeOnOverlay && close()">
        <div class="drawer-container" :class="position" @click.stop>
          <div v-if="title" class="drawer-header">
            <h3 class="drawer-title">{{ title }}</h3>
            <button v-if="closable" class="drawer-close" @click="close">
              <span>×</span>
            </button>
          </div>
          <div class="drawer-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    default: 'bottom', // bottom, right
    validator: (value) => ['bottom', 'right'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 禁止body滚动
watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  z-index: 2000;
}

.drawer-container {
  background: var(--bg-card);
  box-shadow: var(--shadow-heavy);
  display: flex;
  flex-direction: column;
}

.drawer-container.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.drawer-container.right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 80vw;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.drawer-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.drawer-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.drawer-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.drawer-close span {
  font-size: 24px;
  line-height: 1;
}

.drawer-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

/* 过渡动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--transition-normal);
}

.drawer-enter-active .drawer-container,
.drawer-leave-active .drawer-container {
  transition: all var(--transition-normal);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-container.bottom,
.drawer-leave-to .drawer-container.bottom {
  transform: translateY(100%);
}

.drawer-enter-from .drawer-container.right,
.drawer-leave-to .drawer-container.right {
  transform: translateX(100%);
}
</style>

<template>
  <div class="page-container prescription-page">
    <div class="content-wrapper">
      <div v-if="!prescriptionStore.currentPrescription" class="upload-section">
        <h2 class="section-title">方子解析</h2>
        <p class="section-desc">上传处方图片，AI 将为您解析方义与注意事项</p>

        <!-- 多模态能力标注 -->
        <div class="multimodal-badges">
          <span class="mm-badge">👁️ Vision OCR</span>
          <span class="mm-badge">📚 RAG 药典</span>
          <span class="mm-badge">🤖 方义解析</span>
        </div>

        <div class="upload-area">
          <input
            type="file"
            accept="image/*"
            @change="handlePrescriptionUpload"
            ref="prescriptionInput"
            style="display: none"
          />
          <button class="upload-btn" @click="$refs.prescriptionInput.click()">
            <div class="upload-text">上传处方图片</div>
            <div class="upload-hint">支持手写 / 印刷处方，拍照或从相册选取</div>
          </button>
        </div>

        <!-- 分步 loading -->
        <div v-if="isProcessing" class="processing-overlay">
          <div class="processing-content">
            <div class="processing-icon">🔍</div>
            <div class="processing-title">多模态 AI 识别中</div>
            <div class="processing-steps">
              <div
                v-for="(step, i) in processingSteps"
                :key="i"
                class="proc-step"
                :class="{ active: processingStepIndex > i, current: processingStepIndex === i }"
              >
                <span class="proc-check">{{ processingStepIndex > i ? '✓' : (processingStepIndex === i ? '⟳' : '○') }}</span>
                <span class="proc-label">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="prescription-detail">
        <!-- 返回按钮 -->
        <button class="back-btn" @click="prescriptionStore.setCurrentPrescription(null)">
          ← 返回
        </button>

        <!-- 方子标题 -->
        <div class="prescription-header">
          <h2 class="prescription-name font-serif">{{ prescriptionStore.currentPrescription.name }}</h2>
          <div class="prescription-summary">{{ prescriptionStore.currentPrescription.summary }}</div>
        </div>

        <!-- 核心要点 -->
        <div class="key-points-section">
          <h3 class="subsection-title">核心思路</h3>
          <div class="key-points">
            <div 
              v-for="(point, index) in prescriptionStore.currentPrescription.keyPoints"
              :key="index"
              class="point-item"
            >
              <span class="point-number">{{ index + 1 }}</span>
              <span class="point-text">{{ point }}</span>
            </div>
          </div>
        </div>

        <!-- 逐味解析 -->
        <div class="herbs-section">
          <h3 class="subsection-title">逐味解析</h3>
          <div class="herbs-list">
            <div 
              v-for="herb in prescriptionStore.currentPrescription.herbs"
              :key="herb.name"
              class="herb-card"
            >
              <div class="herb-header">
                <h4 class="herb-name">{{ herb.name }}</h4>
                <span class="herb-dose">{{ herb.dose }}</span>
              </div>
              <div class="herb-details">
                <div class="herb-detail">
                  <span class="detail-label">性味:</span>
                  <span class="detail-value">{{ herb.nature }}</span>
                </div>
                <div class="herb-detail">
                  <span class="detail-label">归经:</span>
                  <span class="detail-value">{{ herb.meridian }}</span>
                </div>
                <div class="herb-detail">
                  <span class="detail-label">功效:</span>
                  <span class="detail-value">{{ herb.effect }}</span>
                </div>
              </div>
              <div class="herb-caution">
                <span class="caution-icon">⚠️</span>
                <span class="caution-text">{{ herb.caution }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="warnings-section">
          <h3 class="subsection-title">⚠️ 风险提示</h3>
          <div class="warnings-list">
            <div 
              v-for="(warning, index) in prescriptionStore.currentPrescription.warnings"
              :key="index"
              class="warning-item"
            >
              {{ warning }}
            </div>
          </div>
        </div>

        <!-- 证据层 -->
        <div class="references-section">
          <h3 class="subsection-title">依据与引用 (RAG)</h3>
          <div class="references-list">
            <div 
              v-for="reference in prescriptionStore.currentPrescription.references"
              :key="reference.source"
              class="reference-item"
            >
              <div class="reference-source">{{ reference.source }}</div>
              <div class="reference-content">"{{ reference.content }}"</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions-section">
          <button class="action-btn primary" @click="addToPlan">
            把建议加入计划
          </button>
          <button class="action-btn secondary" @click="askWhy">
            问 AI 依据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePrescriptionStore } from '../stores/prescription'
import { useUserStore } from '../stores/user'

const router = useRouter()
const prescriptionStore = usePrescriptionStore()
const userStore = useUserStore()

const isProcessing = ref(false)
const processingStepIndex = ref(0)
const processingSteps = [
  '图像预处理 · 去噪增强',
  'Vision OCR · 文字提取',
  'RAG 药典匹配',
  '方义解析生成'
]

const handlePrescriptionUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    isProcessing.value = true
    processingStepIndex.value = 0
    // 分步动画
    const stepTimer = setInterval(() => {
      processingStepIndex.value++
      if (processingStepIndex.value >= processingSteps.length) {
        clearInterval(stepTimer)
      }
    }, 400)
    setTimeout(async () => {
      const prescription = await prescriptionStore.recognizePrescription(file)
      prescriptionStore.setCurrentPrescription(prescription)
      isProcessing.value = false
      processingStepIndex.value = 0
    }, 1800)
  }
}

const addToPlan = () => {
  userStore.addToActions(`服用${prescriptionStore.currentPrescription.name}`)
  alert('已加入今日计划')
}

const askWhy = () => {
  router.push('/companion')
}
</script>

<style scoped>
.prescription-page {
  padding-bottom: calc(var(--tab-bar-height) + var(--spacing-xl));
}

.upload-section {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-xingshu);
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.08em;
}

.section-desc {
  font-size: var(--font-size-base);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

/* 多模态能力标注 */
.multimodal-badges {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.mm-badge {
  font-size: 11px;
  font-family: var(--font-sans);
  color: var(--color-accent);
  background: rgba(200, 75, 49, 0.06);
  border: 1px solid rgba(200, 75, 49, 0.18);
  border-radius: var(--radius-full);
  padding: 3px 10px;
}

.upload-area {
  position: relative;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl);
  background: var(--bg-card);
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.upload-btn:hover {
  border-color: var(--color-accent);
  background: rgba(200, 75, 49, 0.05);
}

.upload-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 36, 22, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;
  color: var(--text-light);
  min-width: 260px;
}

.processing-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  animation: pulse 1.5s ease-in-out infinite;
}

.processing-title {
  font-size: var(--font-size-lg);
  font-family: var(--font-xingshu);
  margin-bottom: var(--spacing-lg);
  letter-spacing: 0.05em;
}

.processing-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-align: left;
}

.proc-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.proc-step.active,
.proc-step.current {
  opacity: 1;
}

.proc-check {
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.proc-step.current .proc-check {
  animation: spin 1s linear infinite;
  display: inline-block;
}

.proc-label {
  font-family: var(--font-xingshu);
}

/* 处方详情 */
.prescription-detail {
  padding: 0;
}

.back-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--color-accent);
  font-size: var(--font-size-base);
  cursor: pointer;
  margin-bottom: var(--spacing-lg);
}

.prescription-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.prescription-name {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}

.prescription-summary {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.subsection-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

/* 核心要点 */
.key-points-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
}

.key-points {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.point-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.point-number {
  width: 24px;
  height: 24px;
  background: var(--color-accent);
  color: var(--text-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.point-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* 药味列表 */
.herbs-section {
  margin-bottom: var(--spacing-md);
}

.herbs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.herb-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
}

.herb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.herb-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.herb-dose {
  font-size: var(--font-size-base);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.herb-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.herb-detail {
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  margin-left: var(--spacing-xs);
}

.herb-caution {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(230, 162, 60, 0.1);
  border-radius: var(--radius-sm);
}

.caution-icon {
  font-size: 16px;
}

.caution-text {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  flex: 1;
}

/* 风险提示 */
.warnings-section {
  background: rgba(245, 108, 108, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.warning-item {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  line-height: var(--line-height-relaxed);
}

/* 引用 */
.references-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-light);
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reference-item {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-accent);
}

.reference-source {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.reference-content {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-style: italic;
  line-height: var(--line-height-relaxed);
}

/* 操作按钮 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.action-btn {
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn.primary {
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.action-btn.secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.action-btn.secondary:hover {
  border-color: var(--color-accent);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

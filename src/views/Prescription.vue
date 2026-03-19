<template>
  <div class="page-container prescription-page">
    <div class="content-wrapper">
      <div v-if="!showHardcodedResult && !prescriptionStore.currentPrescription" class="upload-section">
        <h2 class="section-title">方子解析</h2>
        <p class="section-desc">上传处方照片，Qig智能体将为您解析方义与注意事项</p>

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


      <div v-else-if="showHardcodedResult" class="hardcoded-result">
        <h2 class="section-title result-title">方子解析</h2>

        <div class="fangzi-image-wrap">
          <img src="/fangzi.png" alt="方子" class="fangzi-img" />
        </div>

        <div class="fangzi-analysis-card">
          <p class="fangzi-intro">这个茶方像是给身体“顺顺气、养养脾”的小茶饮，思路很简单：</p>
          <div class=”herb-item herb-meigui”><span class=”herb-name-plain”>玫瑰花</span>—— 是让你”开心”的。帮你舒缓情绪，改善闷闷不乐的感觉。</div>
          <div class=”herb-item herb-chenpi”><span class=”herb-name-plain”>陈皮</span>—— 是帮你”顺气”的。感觉腹胀、没胃口时，它能理气健脾，让肚子舒服点。</div>
          <div class=”herb-item herb-fuling”><span class=”herb-name-plain”>茯苓</span>—— 是帮你”祛湿”的。对付莫名的疲惫、身体沉重或大便不成形，它能让脾胃运转更利落。</div>
          <div class=”herb-item herb-hongzao”><span class=”herb-name-plain”>红枣</span>—— 是给你”加油”的。稍微补补气血，也让整个茶方更温和。</div>
          <p class="fangzi-summary">简单来说：玫瑰花管心情，陈皮管肚子胀，茯苓管祛湿累，红枣管调和。四样一起，就是一边帮你放松，一边帮脾胃减负。</p>
          <div class="fangzi-notice-group">
            <div class="fangzi-notice"><span class="notice-label">怎么喝：</span>所有材料用热水泡着当茶喝就行，建议饭后喝。</div>
            <div class="fangzi-notice"><span class="notice-label">注意：</span>这是养生调理，不是治病的药。如果不舒服持续或加重，一定要看医生。</div>
            <div class="fangzi-notice"><span class="notice-label">不合适的人：</span>如果正感冒发烧，或平时容易上火、便秘、口干舌燥，就不太适合。孕妇也请先咨询医生。</div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="result-input-area">
          <button class="result-action-btn supplement-btn">补充方子</button>
          <input
            v-model="supplementInput"
            type="text"
            class="result-chat-input"
            placeholder="补充描述症状或备注…"
          />
          <button class="result-action-btn reupload-btn" @click="resetUpload">重新上传</button>
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
          <h3 class="subsection-title">依据与引用</h3>
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
const showHardcodedResult = ref(false)
const supplementInput = ref('')
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
    setTimeout(() => {
      isProcessing.value = false
      processingStepIndex.value = 0
      showHardcodedResult.value = true
    }, 1800)
  }
}

const resetUpload = () => {
  showHardcodedResult.value = false
  supplementInput.value = ''
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

/* 硬编码解析结果页 */
.hardcoded-result {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(var(--tab-bar-height) + 70px);
}

.result-title {
  text-align: center;
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
}

.fangzi-image-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.fangzi-img {
  width: 20%;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-light);
  object-fit: contain;
}

.fangzi-analysis-card {
  margin: 0 var(--spacing-lg) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
}

.fangzi-intro {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-xingshu);
}

.herb-item {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-sm);
  padding-left: var(--spacing-sm);
}

.herb-meigui  { border-left: 2px solid #C2447A; }
.herb-chenpi  { border-left: 2px solid #8B5E3C; }
.herb-fuling  { border-left: 2px solid #3A6B4A; }
.herb-hongzao { border-left: 2px solid var(--color-accent); }

.herb-name-plain {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-xingshu);
  margin-right: 2px;
}

.fangzi-summary {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-style: italic;
}

.fangzi-notice-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.fangzi-notice {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.notice-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* 底部操作栏 */
.result-input-area {
  position: fixed;
  bottom: var(--tab-bar-height);
  left: 0;
  right: 0;
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  align-items: center;
  z-index: 100;
}

.result-action-btn {
  flex-shrink: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.supplement-btn {
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
}

.supplement-btn:hover {
  opacity: 0.88;
}

.reupload-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.reupload-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.result-chat-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  outline: none;
  background: transparent;
  transition: border-color var(--transition-fast);
}

.result-chat-input:focus {
  border-color: var(--color-accent);
}
</style>

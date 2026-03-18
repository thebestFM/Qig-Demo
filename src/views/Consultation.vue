<template>
  <div class="page-container consultation-page">
    <div class="content-wrapper">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ active: currentStepIndex >= index }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>

      <!-- 流程内容 -->
      <div class="step-content">
        <!-- 空闲状态 -->
        <div v-if="consultationStore.currentStep === 'idle'" class="idle-state">
          <div class="idle-icon">🌿</div>
          <h2 class="idle-title font-serif">四诊合参</h2>
          <p class="idle-description">
            通过望闻问切,结合AI分析,为您提供个性化的中医体质辨识与健康建议。
          </p>
          <div class="idle-features">
            <div class="feature-item">
              <span class="feature-icon">📸</span>
              <span class="feature-text">舌象面象采集</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎤</span>
              <span class="feature-text">声诊脉象记录</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📋</span>
              <span class="feature-text">智能问诊分析</span>
            </div>
          </div>
          <button class="start-btn" @click="startCapture">
            开始问诊
          </button>
        </div>

        <!-- 采集步骤 -->
        <div v-else-if="consultationStore.currentStep === 'capture'" class="capture-state">
          <h3 class="state-title">四诊采集</h3>

          <!-- 舌象上传 -->
          <div class="capture-item">
            <div class="capture-header">
              <div class="capture-header-left">
                <h4>舌象</h4>
                <span class="optional-tag">选填</span>
              </div>
              <span v-if="consultationStore.captureData.tongue" class="status-badge success">已采集</span>
            </div>
            <div class="capture-content">
              <div v-if="!consultationStore.captureData.tongue" class="upload-area">
                <input type="file" accept="image/*" @change="handleTongueUpload" ref="tongueInput" style="display:none" />
                <button class="upload-btn" @click="$refs.tongueInput.click()">上传舌象照片</button>
              </div>
              <div v-else class="preview-area">
                <img :src="consultationStore.captureData.tongue" alt="舌象" class="preview-image" />
                <div class="quality-badge" :class="consultationStore.captureData.tongueQuality">
                  {{ consultationStore.captureData.tongueQuality === 'good' ? '质量良好' : '需重拍' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 面象上传 -->
          <div class="capture-item">
            <div class="capture-header">
              <div class="capture-header-left">
                <h4>面象</h4>
                <span class="optional-tag">选填</span>
              </div>
              <span v-if="consultationStore.captureData.face" class="status-badge success">已采集</span>
            </div>
            <div class="capture-content">
              <div v-if="!consultationStore.captureData.face" class="upload-area">
                <input type="file" accept="image/*" @change="handleFaceUpload" ref="faceInput" style="display:none" />
                <button class="upload-btn" @click="$refs.faceInput.click()">上传面象照片</button>
              </div>
              <div v-else class="preview-area">
                <img :src="consultationStore.captureData.face" alt="面象" class="preview-image" />
              </div>
            </div>
          </div>

          <!-- 声诊 -->
          <div class="capture-item">
            <div class="capture-header">
              <div class="capture-header-left">
                <h4>声诊</h4>
                <span class="optional-tag">选填</span>
              </div>
              <span v-if="consultationStore.captureData.voice" class="status-badge success">已采集</span>
            </div>
            <div class="capture-content">
              <div v-if="!consultationStore.captureData.voice" class="upload-area">
                <input type="file" accept="audio/*" @change="handleVoiceUpload" ref="voiceInput" style="display:none" />
                <button class="upload-btn" @click="$refs.voiceInput.click()">上传声音文件</button>
              </div>
              <div v-else class="audio-preview">
                <span class="audio-name">{{ consultationStore.captureData.voice }}</span>
              </div>
            </div>
          </div>

          <!-- 自述症状 -->
          <div class="capture-item">
            <div class="capture-header">
              <div class="capture-header-left">
                <h4>自述症状</h4>
                <span class="optional-tag">选填</span>
              </div>
              <span v-if="symptomText.trim()" class="status-badge success">已填写</span>
            </div>
            <div class="capture-content">
              <textarea
                v-model="symptomText"
                class="symptom-textarea"
                placeholder="请描述您的身体感受或症状，如：近日头晕乏力、口苦咽干…"
                rows="3"
              />
            </div>
          </div>

          <!-- 脉象选择 -->
          <div class="capture-item">
            <div class="capture-header">
              <div class="capture-header-left">
                <h4>脉象</h4>
                <span class="optional-tag">选填</span>
              </div>
              <div class="capture-header-right">
                <span v-if="consultationStore.captureData.pulse?.rate" class="status-badge success">已选择</span>
                <div class="pulse-help-wrap">
                  <button class="pulse-help-btn">？</button>
                  <div class="pulse-tooltip">
                    <p><strong>如何自测脉象</strong></p>
                    <p>用右手食指、中指、无名指并拢，轻放于左手腕横纹上方、靠拇指侧的桡动脉搏动处，保持安静，感受约30秒。</p>
                    <p><strong>频率判断：</strong>正常心率约60-100次/分。搏动明显偏快、有点数不过来为「快」；搏动缓慢、有迟滞感为「缓」；介于两者之间为「平」。</p>
                    <p><strong>深浅判断：</strong>轻轻触碰即能感受到跳动为「浮」；需稍用力下压才能感受到为「沉」；中等力度可感受到为「中」。</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="capture-content">
              <div class="pulse-options">
                <div class="pulse-group">
                  <label>频率</label>
                  <div class="option-buttons">
                    <button v-for="option in pulseOptions.rate" :key="option"
                      class="option-btn"
                      :class="{ selected: consultationStore.captureData.pulse?.rate === option }"
                      @click="selectPulse('rate', option)">{{ option }}</button>
                  </div>
                </div>
                <div class="pulse-group">
                  <label>深浅</label>
                  <div class="option-buttons">
                    <button v-for="option in pulseOptions.depth" :key="option"
                      class="option-btn"
                      :class="{ selected: consultationStore.captureData.pulse?.depth === option }"
                      @click="selectPulse('depth', option)">{{ option }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="next-btn" @click="nextStep">
            {{ isCaptureComplete ? '下一步' : '跳过' }}
          </button>
        </div>

        <!-- 问卷步骤 -->
        <div v-else-if="consultationStore.currentStep === 'questionnaire'" class="questionnaire-state">
          <h3 class="state-title">智能问诊</h3>
          <div class="questions-list">
            <!-- 前4题单选 -->
            <div v-for="(question, index) in singleQuestions" :key="index" class="question-item">
              <div class="question-text">{{ index + 1 }}. {{ question.text }}</div>
              <div class="question-options">
                <button
                  v-for="option in question.options"
                  :key="option"
                  class="option-btn"
                  :class="{ selected: consultationStore.questionnaireAnswers[question.key] === option }"
                  @click="selectAnswer(question.key, option)"
                >{{ option }}</button>
              </div>
            </div>
            <!-- 第5题多选不适症状 -->
            <div class="question-item">
              <div class="question-text">5. 近期有无以下不适？（可多选）</div>
              <div class="question-options">
                <button
                  v-for="option in symptomOptions"
                  :key="option"
                  class="option-btn"
                  :class="{ selected: consultationStore.questionnaireAnswers.symptoms.includes(option) }"
                  @click="toggleSymptom(option)"
                >{{ option }}</button>
              </div>
              <input
                v-model="consultationStore.questionnaireAnswers.symptomsOther"
                class="other-input"
                placeholder="其他症状（选填，可直接输入）"
              />
            </div>
          </div>
          <button class="next-btn" @click="nextStep" :disabled="!isQuestionnaireComplete">
            下一步
          </button>
        </div>

        <!-- 汇总确认 -->
        <div v-else-if="consultationStore.currentStep === 'review'" class="review-state">
          <h3 class="state-title">汇总确认</h3>
          <div class="review-list">
            <div class="review-item">
              <div class="review-label">舌象</div>
              <div class="review-value">{{ consultationStore.captureData.tongue ? '已采集' : '未采集' }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">面象</div>
              <div class="review-value">{{ consultationStore.captureData.face ? '已采集' : '未采集' }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">声诊</div>
              <div class="review-value">{{ consultationStore.captureData.voice ? '已采集' : '未采集' }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">脉象</div>
              <div class="review-value">
                {{ consultationStore.captureData.pulse?.rate }} / 
                {{ consultationStore.captureData.pulse?.depth }}
              </div>
            </div>
            <div class="review-item" v-if="consultationStore.questionnaireAnswers.energy">
              <div class="review-label">精力体力</div>
              <div class="review-value">{{ consultationStore.questionnaireAnswers.energy }}</div>
            </div>
            <div class="review-item" v-if="consultationStore.questionnaireAnswers.sleep">
              <div class="review-label">睡眠状况</div>
              <div class="review-value">{{ consultationStore.questionnaireAnswers.sleep }}</div>
            </div>
            <div class="review-item" v-if="consultationStore.questionnaireAnswers.digestion">
              <div class="review-label">消化情况</div>
              <div class="review-value">{{ consultationStore.questionnaireAnswers.digestion }}</div>
            </div>
            <div class="review-item" v-if="consultationStore.questionnaireAnswers.emotion">
              <div class="review-label">情绪状态</div>
              <div class="review-value">{{ consultationStore.questionnaireAnswers.emotion }}</div>
            </div>
            <div class="review-item">
              <div class="review-label">不适症状</div>
              <div class="review-value">{{ consultationStore.questionnaireAnswers.symptoms.length ? consultationStore.questionnaireAnswers.symptoms.join('、') : '无明显不适' }}{{ consultationStore.questionnaireAnswers.symptomsOther ? '；' + consultationStore.questionnaireAnswers.symptomsOther : '' }}</div>
            </div>
            <div class="review-item" v-if="symptomText.trim()">
              <div class="review-label">自述症状</div>
              <div class="review-value">{{ symptomText }}</div>
            </div>
          </div>
          <button class="next-btn" @click="nextStep">
            生成报告
          </button>
        </div>

        <!-- 生成中 -->
        <div v-else-if="consultationStore.currentStep === 'generating'" class="generating-state">
          <div class="generating-animation">
            <div class="pulse-circle"></div>
            <div class="generating-icon">🌿</div>
          </div>
          <h3 class="generating-title">四诊合参</h3>
          <p class="generating-subtitle">多模态信息融合 · RAG 典籍检索 · 辨证推理</p>
          <div class="pipeline-info">
            <div class="pipeline-row">望诊（舌象 · 面象）→ 闻诊（声诊）→ 问诊（症状）→ 切诊（脉象）</div>
          </div>
          <div class="qig-loading">
            <span class="qig-label">Qig Agents 分析中</span>
            <span class="qig-dots">{{ dotsDisplay }}</span>
          </div>
        </div>

        <!-- 报告结果 -->
        <div v-else-if="consultationStore.currentStep === 'result'" class="result-state">
          <div class="result-header">
            <div class="result-icon">✨</div>
            <h2 class="result-title font-serif">问诊报告</h2>
          </div>

          <div class="report-sections">
            <!-- 概览 -->
            <div class="report-section">
              <h3 class="section-title">本次概览</h3>
              <p class="overview-text">{{ consultationStore.report.overview }}</p>
            </div>

            <!-- 倾向标签 -->
            <div class="report-section">
              <h3 class="section-title">可能倾向</h3>
              <div class="tendency-tags">
                <span 
                  v-for="tendency in consultationStore.report.tendencies"
                  :key="tendency"
                  class="tendency-tag"
                >
                  {{ tendency }}
                </span>
              </div>
            </div>

            <!-- 今日建议 -->
            <div class="report-section">
              <h3 class="section-title">今日建议</h3>
              <div class="suggestion-list">
                <div 
                  v-for="suggestion in consultationStore.report.suggestions"
                  :key="suggestion.category"
                  class="suggestion-item"
                >
                  <div class="suggestion-category">{{ suggestion.category }}</div>
                  <div class="suggestion-content">{{ suggestion.content }}</div>
                  <button 
                    class="add-to-plan-btn"
                    @click="addToPlan(suggestion.content)"
                  >
                    加入计划
                  </button>
                </div>
              </div>
            </div>

            <!-- 红旗提示 -->
            <div class="report-section warning-section">
              <h3 class="section-title">⚠️ 红旗提示</h3>
              <div class="warning-list">
                <div 
                  v-for="(warning, index) in consultationStore.report.warnings"
                  :key="index"
                  class="warning-item"
                >
                  {{ warning }}
                </div>
              </div>
            </div>

            <!-- 依据与引用 -->
            <div class="report-section">
              <h3 class="section-title">依据与引用 (RAG)</h3>
              <div class="reference-list">
                <div 
                  v-for="reference in consultationStore.report.references"
                  :key="reference.source"
                  class="reference-item"
                >
                  <div class="reference-source">{{ reference.source }}</div>
                  <div class="reference-content">"{{ reference.content }}"</div>
                </div>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <button class="action-btn primary" @click="addToPlanAll">
              加入今日计划
            </button>
            <button class="action-btn secondary" @click="goToDoctors">
              找医生复核
            </button>
            <button class="action-btn text" @click="resetConsultation">
              重新问诊
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConsultationStore } from '../stores/consultation'
import { useUserStore } from '../stores/user'
import { analyzeConsultation } from '../services/claudeService.js'

const symptomText = ref('')

const router = useRouter()
const consultationStore = useConsultationStore()
const userStore = useUserStore()

// 步骤配置
const steps = [
  { key: 'idle', label: '开始' },
  { key: 'capture', label: '采集' },
  { key: 'questionnaire', label: '问诊' },
  { key: 'review', label: '确认' },
  { key: 'generating', label: '分析' },
  { key: 'result', label: '报告' }
]

const currentStepIndex = computed(() => {
  return steps.findIndex(s => s.key === consultationStore.currentStep)
})

// 脉象选项（平/中 放中间）
const pulseOptions = {
  rate: ['快', '平', '缓'],
  depth: ['浮', '中', '沉']
}

// 前4题单选
const singleQuestions = [
  {
    text: '近期精力与体力如何？',
    key: 'energy',
    options: ['精力充沛', '略感疲倦', '明显乏力', '极度疲惫']
  },
  {
    text: '近期睡眠状况如何？',
    key: 'sleep',
    options: ['入睡困难', '易醒多梦', '嗜睡困倦', '睡眠尚可']
  },
  {
    text: '近期消化与食欲情况？',
    key: 'digestion',
    options: ['食欲不振', '口干口苦', '腹胀便溏', '消化正常']
  },
  {
    text: '近期情绪与心理状态？',
    key: 'emotion',
    options: ['焦虑紧张', '烦躁易怒', '情绪低落', '心情平和']
  }
]

// 第5题多选症状选项
const symptomOptions = [
  '无明显不适', '头晕头痛', '胸闷心悸', '腰膝酸软',
  '畏寒肢冷', '潮热盗汗', '咽干口渴', '耳鸣目涩',
  '皮肤干燥', '月经不调'
]

// 省略号动画
const dotsCount = ref(1)
const dotsDisplay = computed(() => '.'.repeat(dotsCount.value))
let dotsTimer = null

// 开始采集
const startCapture = () => {
  consultationStore.nextStep()
}

// 上传处理
const handleTongueUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      consultationStore.setCaptureData('tongue', e.target.result)
      // Mock质量评估
      consultationStore.setCaptureData('tongueQuality', Math.random() > 0.3 ? 'good' : 'poor')
    }
    reader.readAsDataURL(file)
  }
}

const handleFaceUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      consultationStore.setCaptureData('face', e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

const handleVoiceUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    consultationStore.setCaptureData('voice', file.name)
  }
}

// 脉象选择
const selectPulse = (type, value) => {
  if (!consultationStore.captureData.pulse) {
    consultationStore.setCaptureData('pulse', {})
  }
  consultationStore.captureData.pulse[type] = value
}

// 问卷答案（单选）
const selectAnswer = (question, answer) => {
  consultationStore.setAnswer(question, answer)
}

// 第5题多选切换
const toggleSymptom = (option) => {
  const symptoms = consultationStore.questionnaireAnswers.symptoms
  if (option === '无明显不适') {
    // 选「无明显不适」时清空其他选项
    consultationStore.questionnaireAnswers.symptoms = symptoms.includes('无明显不适') ? [] : ['无明显不适']
    return
  }
  // 选其他时，移除「无明显不适」
  const filtered = symptoms.filter(s => s !== '无明显不适')
  const idx = filtered.indexOf(option)
  if (idx === -1) {
    consultationStore.questionnaireAnswers.symptoms = [...filtered, option]
  } else {
    filtered.splice(idx, 1)
    consultationStore.questionnaireAnswers.symptoms = [...filtered]
  }
}

// 采集是否完成（至少一项有信息即可，否则可跳过；脉象任一题选了即算）
const isCaptureComplete = computed(() => {
  return !!(consultationStore.captureData.tongue ||
         consultationStore.captureData.face ||
         consultationStore.captureData.voice ||
         consultationStore.captureData.pulse?.rate ||
         consultationStore.captureData.pulse?.depth ||
         symptomText.value.trim())
})

// 问卷是否完成（前4题都选了才能下一步）
const isQuestionnaireComplete = computed(() => {
  return !!(consultationStore.questionnaireAnswers.energy &&
         consultationStore.questionnaireAnswers.sleep &&
         consultationStore.questionnaireAnswers.digestion &&
         consultationStore.questionnaireAnswers.emotion)
})

// 下一步 / 生成报告
const nextStep = async () => {
  if (consultationStore.currentStep === 'review') {
    consultationStore.nextStep()
    // 启动省略号动画
    dotsCount.value = 1
    dotsTimer = setInterval(() => {
      dotsCount.value = dotsCount.value >= 3 ? 1 : dotsCount.value + 1
    }, 500)
    // 调用 Claude API，等待真实返回
    try {
      const report = await analyzeConsultation(
        consultationStore.captureData,
        consultationStore.questionnaireAnswers,
        symptomText.value
      )
      consultationStore.report.overview = report.overview || consultationStore.report.overview
      consultationStore.report.tendencies = report.tendencies || consultationStore.report.tendencies
      consultationStore.report.suggestions = report.suggestions || consultationStore.report.suggestions
      consultationStore.report.warnings = report.warnings || consultationStore.report.warnings
      consultationStore.report.references = report.references || consultationStore.report.references
    } catch (e) {
      console.warn('Claude API 不可用，使用 mock 报告:', e.message)
    }
    // API 返回后停止动画，跳转结果
    clearInterval(dotsTimer)
    dotsTimer = null
    consultationStore.nextStep()
  } else {
    consultationStore.nextStep()
  }
}

// 加入计划
const addToPlan = (text) => {
  userStore.addToActions(text)
  alert('已加入今日计划')
}

// 加入所有建议
const addToPlanAll = () => {
  consultationStore.report.suggestions.forEach(s => {
    userStore.addToActions(s.content)
  })
  alert('已将所有建议加入今日计划')
  router.push('/today')
}

// 找医生
const goToDoctors = () => {
  router.push('/doctors')
}

// 重置
const resetConsultation = () => {
  consultationStore.reset()
  if (dotsTimer) { clearInterval(dotsTimer); dotsTimer = null }
  dotsCount.value = 1
  symptomText.value = ''
}

onUnmounted(() => {
  if (dotsTimer) clearInterval(dotsTimer)
})
</script>

<style scoped>
.consultation-page {
  padding-bottom: calc(var(--tab-bar-height) + var(--spacing-xl));
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  padding: 0 var(--spacing-md);
}

.step-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 15px;
  right: 0;
  width: 50%;
  height: 2px;
  background: var(--border-light);
  transform: translateX(50%);
}

.step-item.active:not(:last-child)::after {
  background: var(--color-accent);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.step-item.active .step-number {
  background: var(--color-accent);
  color: var(--text-light);
}

.step-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.step-item.active .step-label {
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

/* 内容区域 */
.step-content {
  min-height: 400px;
}

/* 空闲状态 */
.idle-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.idle-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  animation: pulse 2s ease-in-out infinite;
}

.idle-title {
  font-size: var(--font-size-3xl);
  font-family: var(--font-xingshu);
  letter-spacing: 0.15em;
  margin-bottom: var(--spacing-md);
}

.idle-description {
  font-size: var(--font-size-base);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: var(--line-height-relaxed);
}

.idle-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md);
}

.feature-icon {
  font-size: 24px;
}

.feature-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.start-btn {
  padding: var(--spacing-md) var(--spacing-3xl);
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-family: var(--font-xingshu);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* 标题 */
.state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
}

/* 采集状态 */
.capture-state {
  padding: 0;
}

.capture-item {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
}

.capture-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.capture-header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.capture-header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.capture-header h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.optional-tag {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  padding: 1px 6px;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.success {
  background: rgba(91, 140, 90, 0.1);
  color: var(--color-success);
}

.upload-area {
  display: flex;
  justify-content: center;
}

.upload-btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.upload-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(200, 75, 49, 0.05);
}

.preview-area {
  position: relative;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  border-radius: var(--radius-md);
  margin: 0 auto;
  display: block;
}

.quality-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.quality-badge.good {
  background: rgba(91, 140, 90, 0.2);
  color: var(--color-success);
}

.quality-badge.poor {
  background: rgba(230, 162, 60, 0.2);
  color: var(--color-warning);
}

.symptom-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  resize: vertical;
  min-height: 72px;
}

.symptom-textarea:focus {
  border-color: var(--color-accent);
  background: var(--bg-card);
}

.symptom-textarea::placeholder {
  color: var(--text-tertiary);
}

.audio-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.audio-icon {
  font-size: 24px;
}

.audio-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.pulse-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.pulse-group label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.option-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.option-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-btn:hover {
  border-color: var(--color-accent);
}

.option-btn.selected {
  background: rgba(200, 75, 49, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

/* 问卷 */
.questionnaire-state {
  padding: 0;
}

.questions-list {
  margin-bottom: var(--spacing-lg);
}

.question-item {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
}

.question-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* 汇总确认 */
.review-state {
  padding: 0;
}

.review-list {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-light);
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.review-item:last-child {
  border-bottom: none;
}

.review-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.review-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 脉象帮助提示 */
.pulse-help-wrap {
  position: relative;
  display: inline-block;
}

.pulse-help-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  font-size: 11px;
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.pulse-help-wrap:hover .pulse-tooltip {
  display: block;
}

.pulse-tooltip {
  display: none;
  position: absolute;
  right: 0;
  top: 24px;
  width: 260px;
  background: var(--bg-card);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-medium);
  z-index: 200;
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
}

.pulse-tooltip p {
  margin-bottom: var(--spacing-xs);
}

.pulse-tooltip p:last-child {
  margin-bottom: 0;
}

/* 其他症状输入 */
.other-input {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.other-input::placeholder {
  color: var(--text-tertiary);
}

/* 生成中 */
.generating-state {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.generating-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto var(--spacing-lg);
}

.pulse-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(200, 75, 49, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

.generating-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 44px;
}

.generating-title {
  font-size: var(--font-size-xl);
  font-family: var(--font-xingshu);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.generating-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
  letter-spacing: 0.05em;
}

.pipeline-info {
  margin-bottom: var(--spacing-xl);
}

.pipeline-row {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: rgba(255,255,255,0.6);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  display: inline-block;
  letter-spacing: 0.03em;
}

.qig-loading {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-top: var(--spacing-lg);
}

.qig-label {
  font-size: var(--font-size-base);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
}

.qig-dots {
  font-size: var(--font-size-lg);
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
  min-width: 24px;
  text-align: left;
  letter-spacing: 2px;
}

.generating-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 360px;
  margin: 0 auto;
  text-align: left;
}

.generating-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  opacity: 0.35;
  transition: all var(--transition-normal);
}

.generating-step.active {
  opacity: 1;
  background: rgba(91, 140, 90, 0.06);
  border-color: rgba(91, 140, 90, 0.2);
}

.generating-step.current {
  opacity: 1;
  background: rgba(200, 75, 49, 0.05);
  border-color: rgba(200, 75, 49, 0.2);
}

.step-left {
  flex: 0 0 32px;
  display: flex;
  justify-content: center;
}

.step-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.generating-step.active .step-icon-wrap {
  background: rgba(91, 140, 90, 0.15);
}

.generating-step.current .step-icon-wrap {
  background: rgba(200, 75, 49, 0.1);
}

.step-check {
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
  font-size: 14px;
}

.step-running {
  color: var(--color-accent);
  font-size: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.step-icon {
  font-size: 14px;
}

.step-right {
  flex: 1;
}

.step-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-family: var(--font-xingshu);
}

.step-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.step-done-badge {
  font-size: 10px;
  color: var(--color-success);
  background: rgba(91, 140, 90, 0.1);
  border-radius: var(--radius-full);
  padding: 2px 6px;
  white-space: nowrap;
}

.step-running-bar {
  width: 48px;
  height: 3px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.step-running-fill {
  height: 100%;
  width: 40%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  animation: runningBar 1s ease-in-out infinite;
}

@keyframes runningBar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

/* 报告结果 */
.result-state {
  padding: 0;
}

.result-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.result-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.result-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-xingshu);
  letter-spacing: 0.12em;
}

.report-sections {
  margin-bottom: var(--spacing-2xl);
}

.report-section {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
}

.report-section .section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

.overview-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

.tendency-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tendency-tag {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.suggestion-item {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.suggestion-category {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.suggestion-content {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  flex: 1;
}

.add-to-plan-btn {
  align-self: flex-start;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-to-plan-btn:hover {
  background: rgba(200, 75, 49, 0.1);
}

.warning-section {
  background: rgba(245, 108, 108, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.2);
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.warning-item {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  line-height: var(--line-height-relaxed);
}

.reference-list {
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

.result-actions {
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

.action-btn.text {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.action-btn.text:hover {
  color: var(--text-primary);
}

/* 下一步按钮 */
.next-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: var(--spacing-lg);
}

.next-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.next-btn:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
}

/* 脉动动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>

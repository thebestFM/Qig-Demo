<template>
  <div class="today-root">
  <div class="page-container today-page">
    <div class="content-wrapper">
      <!-- 节气胶囊 -->
      <div class="solar-term-section animate-fadeIn">
        <div class="solar-term-capsule">
          <span class="solar-term-icon">🌸</span>
          <div class="solar-term-info">
            <div class="solar-term-name">{{ solarTerm.name }}</div>
            <div class="solar-term-tip">{{ solarTerm.tip }}</div>
          </div>
          <button class="solar-term-expand" @click="showRagModal">
            <span class="expand-icon">⊕</span>
            <span class="expand-text">更多节气养生</span>
          </button>
        </div>
        <div class="daily-quote">
          <span class="quote-mark">「</span>{{ dailyQuote }}<span class="quote-mark">」</span>
        </div>
      </div>


      <!-- 健康卡片 -->
      <div class="health-cards-section">
        <div class="section-title">今日健康</div>
        <div class="health-cards-scroll">
          <!-- 元气指数 -->
          <div class="health-card">
            <div class="card-label">元气指数</div>
            <div class="card-value">
              <span class="value-number">93</span>
              <span class="value-unit">分</span>
            </div>
            <div class="card-detail">
              睡眠 {{ userStore.healthData.sleep }}h · HRV {{ userStore.healthData.hrv }}
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: '93%' }"
              ></div>
            </div>
          </div>

          <!-- 情绪 -->
          <div class="health-card">
            <div class="card-label">今日情绪</div>
            <div class="card-value">{{ userStore.healthData.mood }}</div>
            <div class="card-action">
              <button class="action-btn" @click="startMeditation">
                开始3分钟放松
              </button>
            </div>
          </div>

          <!-- 体质趋势 -->
          <div class="health-card trend-card">
            <div class="card-label">体质趋势</div>
            <div class="trend-scroll-wrap">
              <div class="trend-chart-scroll">
                <div
                  v-for="(item, index) in constitutionTrendData"
                  :key="index"
                  class="trend-bar"
                >
                  <div class="bar-value-label">{{ item.value }}</div>
                  <div class="bar-fill" :style="{ height: item.height + '%', background: item.gradient }"></div>
                  <div class="bar-label">{{ item.day }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日行动 -->
      <div class="action-section">
        <div class="section-title">今日行动</div>
        <div class="action-list">
          <div
            v-for="action in userStore.todayActions"
            :key="action.id"
            class="action-item"
            :class="{ completed: action.completed }"
            @click="userStore.toggleAction(action.id)"
          >
            <div class="action-checkbox">
              <span v-if="action.completed" class="checkmark">✓</span>
            </div>
            <div class="action-text">{{ action.text }}</div>
          </div>
        </div>
      </div>

      <!-- 经典知识库 -->
      <div class="classic-section">
        <div class="section-title">今日典籍</div>
        <div class="classic-card">
          <div class="classic-decoration-top"></div>
          <div class="classic-quote">「{{ classicQuote.text }}」</div>
          <div class="classic-source">—— {{ classicQuote.source }}</div>
          <div class="classic-decoration-bottom"></div>
          <button class="reference-btn" @click="showRagModal">查看 RAG 引用</button>
        </div>
      </div>

      <!-- 主CTA -->
      <div class="cta-section">
        <button class="main-cta-btn" @click="startConsultation">
          <span class="cta-icon">🌿</span>
          <span class="cta-text">开始四诊合参</span>
          <span class="cta-time">约 2 分钟</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 节气养生弹窗 -->
  <Modal v-model="showRagDetail" title="春分节气养生">
    <div class="rag-modal-content">
      <div class="rag-desc">春分时节养生要点：</div>
      <div class="rag-sources">
        <div class="rag-source-item">疏肝健脾 · 饮食宜清淡，多食绿色蔬菜</div>
        <div class="rag-source-item">调畅情志 · 保持心情舒畅，避免大喜大怒</div>
        <div class="rag-source-item">适度运动 · 宜散步、太极，顺应春生之气</div>
        <div class="rag-source-item">早睡早起 · 夜卧早起，广步于庭</div>
      </div>
      <div class="rag-note">——据《黄帝内经·素问·四气调神大论》：「春三月，此谓发陈，天地俱生，万物以荣，夜卧早起，广步于庭……」</div>
    </div>
  </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Modal from '../components/common/Modal.vue'

const router = useRouter()
const userStore = useUserStore()

// 体质趋势数据 3.14-3.20，值：82 85 89 86 90 91 93（满分100）
// 颜色：80及以下暗绿，100明亮浅绿，中间渐变
function trendColor(value) {
  // 80->暗绿 #2d6a2d, 100->亮浅绿 #a8e063
  const t = Math.max(0, Math.min(1, (value - 80) / 20))
  const r = Math.round(45 + t * (168 - 45))
  const g = Math.round(106 + t * (224 - 106))
  const b = Math.round(45 + t * (99 - 45))
  const r2 = Math.round(80 + t * (199 - 80))
  const g2 = Math.round(160 + t * (255 - 160))
  const b2 = Math.round(80 + t * (130 - 80))
  return `linear-gradient(to top, rgb(${r},${g},${b}), rgb(${r2},${g2},${b2}))`
}
const trendValues = [82, 85, 89, 86, 90, 91, 93]
const trendDates = ['3/14', '3/15', '3/16', '3/17', '3/18', '3/19', '3/20']
const constitutionTrendData = trendValues.map((v, i) => ({
  day: trendDates[i],
  value: v,
  height: v,
  gradient: trendColor(v)
}))

// 节气数据
const solarTerm = computed(() => {
  return { name: '春分', tip: '平衡肝脾·疏肝健脾' }
})

// 今日一句话
const dailyQuote = ref('春分时节，宜调和肝脾，保持情志舒畅。')

// 经典引用
const classicQuote = ref({
  text: '春三月，此谓发陈，天地俱生，万物以荣。',
  source: '《黄帝内经·素问》'
})

// Modal 状态
const showRagDetail = ref(false)

const showRagModal = () => {
  showRagDetail.value = true
}

// 开始冥想
const startMeditation = () => {
  alert('开始3分钟放松...')
}

// 开始问诊
const startConsultation = () => {
  router.push('/consultation')
}
</script>

<style scoped>
.today-root {
  display: contents;
}

.today-page {
  padding-bottom: calc(var(--tab-bar-height) + var(--spacing-xl));
}

/* 节气部分 */
.solar-term-section {
  margin-bottom: var(--spacing-xl);
}

.solar-term-capsule {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(200, 75, 49, 0.10), rgba(230, 162, 60, 0.10));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(200, 75, 49, 0.15);
  margin-bottom: var(--spacing-md);
}

.solar-term-icon {
  font-size: 36px;
}

.solar-term-info {
  flex: 1;
}

.solar-term-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-xs);
}

.solar-term-tip {
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
}

.solar-term-expand {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(230, 162, 60, 0.10);
  border: 1px solid rgba(230, 162, 60, 0.25);
  border-radius: var(--radius-full);
  padding: 3px 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.solar-term-expand:hover {
  background: rgba(230, 162, 60, 0.20);
}

.expand-icon {
  font-size: 14px;
  color: var(--color-warning);
}

.expand-text {
  font-size: 10px;
  font-family: var(--font-xingshu);
  color: var(--color-warning);
}

.daily-quote {
  font-size: var(--font-size-base);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  line-height: var(--line-height-relaxed);
  letter-spacing: 0.06em;
}

.quote-mark {
  color: var(--color-accent);
  font-size: 1.2em;
}


/* 区块标题 */
.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.05em;
}

/* 健康卡片 */
.health-cards-section {
  margin-bottom: var(--spacing-2xl);
}

.health-cards-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  -webkit-overflow-scrolling: touch;
}

.health-cards-scroll::-webkit-scrollbar {
  display: none;
}

.health-card {
  flex: 0 0 200px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
}

.card-label {
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.card-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.value-number {
  color: var(--color-accent);
}

.value-unit {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
}

.card-detail {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  margin-top: var(--spacing-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.card-action {
  margin-top: var(--spacing-md);
}

.action-btn {
  font-size: var(--font-size-xs);
  font-family: var(--font-xingshu);
  color: var(--color-accent);
  background: rgba(200, 75, 49, 0.08);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: rgba(200, 75, 49, 0.15);
}

/* 体质趋势图 */
.trend-card {
  flex: 0 0 240px !important;
}

.trend-scroll-wrap {
  overflow: hidden;
  width: 100%;
}

.trend-chart-scroll {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 80px;
  padding-top: var(--spacing-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.trend-chart-scroll::-webkit-scrollbar {
  display: none;
}

.trend-bar {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  width: 22px;
}

.bar-value-label {
  font-size: 9px;
  color: var(--text-tertiary);
  margin-bottom: 2px;
}

.bar-fill {
  width: 10px;
  border-radius: 2px 2px 0 0;
  transition: height var(--transition-slow);
}

.bar-label {
  font-size: 9px;
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
  white-space: nowrap;
}

/* 今日行动 */
.action-section {
  margin-bottom: var(--spacing-2xl);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-item:hover {
  box-shadow: var(--shadow-medium);
}

.action-item.completed {
  opacity: 0.6;
}

.action-item.completed .action-text {
  text-decoration: line-through;
}

.action-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-item.completed .action-checkbox {
  background: var(--color-success);
  border-color: var(--color-success);
}

.checkmark {
  color: var(--text-light);
  font-weight: var(--font-weight-bold);
  animation: checkmarkScale 0.3s ease;
}

.action-text {
  flex: 1;
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
}

/* 经典知识库 */
.classic-section {
  margin-bottom: var(--spacing-2xl);
}

.classic-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(200, 75, 49, 0.08);
  text-align: center;
}

.classic-decoration-top,
.classic-decoration-bottom {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(200, 75, 49, 0.3), transparent);
  margin: var(--spacing-md) 0;
}

.classic-quote {
  font-size: var(--font-size-lg);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  letter-spacing: 0.08em;
  margin-bottom: var(--spacing-sm);
}

.classic-source {
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  text-align: right;
}

.reference-btn {
  font-size: var(--font-size-xs);
  font-family: var(--font-xingshu);
  color: var(--color-accent);
  background: transparent;
  border: 1px solid var(--color-accent);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.reference-btn:hover {
  background: rgba(200, 75, 49, 0.08);
}

/* 主CTA */
.cta-section {
  padding: var(--spacing-lg) 0;
}

.main-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-family: var(--font-xingshu);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-medium);
  letter-spacing: 0.08em;
}

.main-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-heavy);
}

.main-cta-btn:active {
  transform: translateY(0);
}

.cta-icon {
  font-size: 24px;
}

.cta-time {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  opacity: 0.9;
}

/* 节气养生 Modal */
.rag-modal-content {
  padding: var(--spacing-sm) 0;
}

.rag-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.rag-sources {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.rag-source-item {
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-accent);
}

.rag-note {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  line-height: var(--line-height-relaxed);
}

@keyframes checkmarkScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
</style>

<template>
  <div class="page-container doctors-page">
    <div class="content-wrapper">
      <h2 class="page-title font-serif">医生推荐</h2>
      <p class="page-desc">根据您的问诊结果,为您匹配最合适的中医专家</p>

      <!-- 医生列表 -->
      <div class="doctors-list">
        <div 
          v-for="doctor in doctorStore.doctors"
          :key="doctor.id"
          class="doctor-card"
          @click="showDoctorDetail(doctor)"
        >
          <div class="doctor-header">
            <div class="doctor-avatar">👨‍⚕️</div>
            <div class="doctor-info">
              <h3 class="doctor-name">{{ doctor.name }}</h3>
              <p class="doctor-title">{{ doctor.title }}</p>
              <p class="doctor-institution">{{ doctor.institution }}</p>
            </div>
            <div class="match-score">
              <div class="score-value">{{ doctor.matchScore }}%</div>
              <div class="score-label">匹配度</div>
            </div>
          </div>
          
          <div class="doctor-match">
            <span class="match-icon">✨</span>
            <span class="match-reason">{{ doctor.matchReason }}</span>
          </div>

          <div class="doctor-status">
            <span class="status-dot" :class="{ online: doctor.isOnline }"></span>
            <span class="status-text">{{ doctor.isOnline ? '在线' : '离线' }}</span>
            <span class="price">¥{{ doctor.price }}</span>
            <span class="wait-time">{{ doctor.waitTime }}</span>
          </div>

          <div class="ai-report-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">已附 AI 初筛报告</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 医生详情弹窗 -->
    <Modal v-model="showDetail" :title="selectedDoctor?.name">
      <div v-if="selectedDoctor" class="doctor-detail">
        <div class="detail-header">
          <div class="detail-avatar">👨‍⚕️</div>
          <div class="detail-info">
            <h3 class="detail-name">{{ selectedDoctor.name }}</h3>
            <p class="detail-title">{{ selectedDoctor.title }}</p>
            <p class="detail-institution">{{ selectedDoctor.institution }}</p>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-label">擅长方向</h4>
          <div class="specialties-list">
            <span 
              v-for="specialty in selectedDoctor.specialties"
              :key="specialty"
              class="specialty-tag"
            >
              {{ specialty }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-label">医生简介</h4>
          <p class="detail-text">{{ selectedDoctor.description }}</p>
        </div>

        <div class="detail-section">
          <h4 class="detail-label">咨询须知</h4>
          <p class="detail-note">{{ selectedDoctor.consultationNote }}</p>
        </div>

        <div class="detail-footer">
          <div class="price-info">
            <span class="price-label">问诊费用</span>
            <span class="price-value">¥{{ selectedDoctor.price }}</span>
          </div>
          <button class="consult-btn" @click="startConsultation">
            立即问诊
          </button>
        </div>
      </div>
    </Modal>

    <!-- Demo提示弹窗 -->
    <Modal v-model="showDemoNotice" title="提示">
      <div class="demo-notice">
        <p>本功能为Demo演示,暂不支持真实问诊。</p>
        <p>将为您模拟医生助理接入...</p>
      </div>
      <template #footer>
        <button class="confirm-btn" @click="goToCompanion">确定</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '../stores/doctor'
import Modal from '../components/common/Modal.vue'

const router = useRouter()
const doctorStore = useDoctorStore()

const showDetail = ref(false)
const showDemoNotice = ref(false)
const selectedDoctor = ref(null)

const showDoctorDetail = (doctor) => {
  selectedDoctor.value = doctor
  showDetail.value = true
}

const startConsultation = () => {
  showDetail.value = false
  showDemoNotice.value = true
}

const goToCompanion = () => {
  showDemoNotice.value = false
  router.push('/companion')
}
</script>

<style scoped>
.doctors-page {
  padding-bottom: calc(var(--tab-bar-height) + var(--spacing-xl));
}

.page-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-xingshu);
  letter-spacing: 0.08em;
  margin-bottom: var(--spacing-sm);
}

.page-desc {
  font-size: var(--font-size-sm);
  font-family: var(--font-xingshu);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.doctors-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.doctor-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.doctor-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.doctor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.doctor-info {
  flex: 1;
}

.doctor-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs);
}

.doctor-title {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs);
}

.doctor-institution {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin: 0;
}

.match-score {
  text-align: center;
}

.score-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.doctor-match {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(200, 75, 49, 0.08);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.match-icon {
  font-size: 16px;
}

.match-reason {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.doctor-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.status-dot.online {
  background: var(--color-success);
}

.status-text {
  flex: 1;
}

.price {
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.wait-time {
  color: var(--text-tertiary);
}

.ai-report-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(91, 140, 90, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-icon {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}

/* 医生详情 */
.doctor-detail {
  padding: 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.detail-info {
  flex: 1;
}

.detail-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs);
}

.detail-title {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs);
}

.detail-institution {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.detail-section {
  margin-bottom: var(--spacing-lg);
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.specialties-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.specialty-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.detail-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
}

.detail-note {
  padding: var(--spacing-md);
  background: rgba(230, 162, 60, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  line-height: var(--line-height-relaxed);
}

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.price-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.consult-btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.consult-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* Demo提示 */
.demo-notice {
  padding: var(--spacing-lg) 0;
  text-align: center;
}

.demo-notice p {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.confirm-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}
</style>

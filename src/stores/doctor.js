import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDoctorStore = defineStore('doctor', () => {
  // 医生列表
  const doctors = ref([
    {
      id: 1,
      name: '张医师',
      title: '副主任中医师',
      institution: '某中医院',
      matchScore: 92,
      matchReason: '擅长肝郁调理',
      isOnline: true,
      price: 50,
      waitTime: '约10分钟',
      specialties: ['肝郁证', '脾胃病', '妇科调理'],
      description: '从事中医临床工作20余年,擅长运用疏肝解郁法治疗各类情志疾病。',
      consultationNote: '请提前准备好舌苔照片和主要症状描述'
    },
    {
      id: 2,
      name: '李医师',
      title: '主治中医师',
      institution: '某中医院',
      matchScore: 88,
      matchReason: '专长体质辨识',
      isOnline: true,
      price: 30,
      waitTime: '约5分钟',
      specialties: ['体质辨识', '亚健康调理', '养生保健'],
      description: '专注于中医体质辨识与调理,善于制定个性化的养生方案。',
      consultationNote: '建议携带近期的体检报告'
    },
    {
      id: 3,
      name: '王医师',
      title: '主任医师',
      institution: '某中医院',
      matchScore: 85,
      matchReason: '内科经验丰富',
      isOnline: false,
      price: 100,
      waitTime: '预约排队中',
      specialties: ['内科杂病', '疑难病症', '脉诊'],
      description: '从医30年,临床经验丰富,擅长运用脉诊结合四诊合参诊疗疾病。',
      consultationNote: '主任医师号源紧张,请提前预约'
    }
  ])

  // 当前选中的医生
  const selectedDoctor = ref(null)

  // 选择医生
  const selectDoctor = (doctor) => {
    selectedDoctor.value = doctor
  }

  return {
    doctors,
    selectedDoctor,
    selectDoctor
  }
})

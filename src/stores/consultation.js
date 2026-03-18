import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConsultationStore = defineStore('consultation', () => {
  // 流程状态: idle, capture, questionnaire, review, generating, result
  const currentStep = ref('idle')

  // 采集数据
  const captureData = ref({
    tongue: null, // 舌象图片
    tongueQuality: null, // 舌象质量评估
    face: null, // 面象图片
    faceQuality: null, // 面象质量
    voice: null, // 声诊音频
    pulse: null // 脉象选择
  })

  // 问卷答案
  const questionnaireAnswers = ref({
    energy: '',      // 精力体力
    sleep: '',       // 睡眠
    digestion: '',   // 消化
    emotion: '',     // 情绪
    symptoms: [],    // 多选不适症状
    symptomsOther: '' // 其他症状自填
  })

  // 报告数据
  const report = ref({
    overview: '本次问诊显示您的身体整体状态良好,但存在轻微的肝郁脾虚倾向。',
    tendencies: ['肝郁倾向', '脾虚倾向'],
    suggestions: [
      { category: '饮食', content: '建议多食山药、莲子等健脾食物' },
      { category: '作息', content: '建议晚上11点前入睡,避免熬夜' },
      { category: '穴位', content: '每日按揉太冲穴3-5分钟' },
      { category: '运动', content: '建议练习八段锦或太极拳' }
    ],
    warnings: [
      '若出现高热、剧烈头痛、胸痛等严重症状,请立即就医',
      '若症状持续加重或超过3天无改善,建议线下就诊'
    ],
    references: [
      { source: '《黄帝内经·素问》', content: '肝者,将军之官,谋虑出焉' },
      { source: '《伤寒论》', content: '见肝之病,知肝传脾,当先实脾' },
      { source: '国家中医药管理局', content: '中医体质辨识与调理指南' }
    ]
  })

  // 设置采集数据
  const setCaptureData = (type, data) => {
    captureData.value[type] = data
  }

  // 设置问卷答案
  const setAnswer = (question, answer) => {
    questionnaireAnswers.value[question] = answer
  }

  // 进入下一步
  const nextStep = () => {
    const steps = ['idle', 'capture', 'questionnaire', 'review', 'generating', 'result']
    const currentIndex = steps.indexOf(currentStep.value)
    if (currentIndex < steps.length - 1) {
      currentStep.value = steps[currentIndex + 1]
    }
  }

  // 重置流程
  const reset = () => {
    currentStep.value = 'idle'
    captureData.value = {
      tongue: null,
      tongueQuality: null,
      face: null,
      faceQuality: null,
      voice: null,
      pulse: null
    }
    questionnaireAnswers.value = {
      energy: '',
      sleep: '',
      digestion: '',
      emotion: '',
      symptoms: [],
      symptomsOther: ''
    }
  }

  return {
    currentStep,
    captureData,
    questionnaireAnswers,
    report,
    setCaptureData,
    setAnswer,
    nextStep,
    reset
  }
})

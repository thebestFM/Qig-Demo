import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户健康数据
  const healthData = ref({
    sleep: 7.5, // 睡眠时长(小时)
    hrv: 65, // HRV
    heartRate: 72, // 心率
    steps: 8234, // 步数
    mood: '平和', // 今日心情
    constitution: '平和质' // 体质
  })

  // 体质趋势(最近7天)
  const constitutionTrend = ref([
    { day: '周一', value: 0.7 },
    { day: '周二', value: 0.65 },
    { day: '周三', value: 0.72 },
    { day: '周四', value: 0.68 },
    { day: '周五', value: 0.75 },
    { day: '周六', value: 0.70 },
    { day: '周日', value: 0.73 }
  ])

  // 今日行动
  const todayActions = ref([
    { id: 1, text: '晨起八段锦15分钟', completed: false },
    { id: 2, text: '午休养神20分钟', completed: false },
    { id: 3, text: '睡前泡脚15分钟', completed: false }
  ])

  // 计算恢复指数
  const recoveryIndex = computed(() => {
    const sleepScore = (healthData.value.sleep / 8) * 100
    const hrvScore = (healthData.value.hrv / 100) * 100
    return Math.round((sleepScore + hrvScore) / 2)
  })

  // 切换行动完成状态
  const toggleAction = (id) => {
    const action = todayActions.value.find(a => a.id === id)
    if (action) {
      action.completed = !action.completed
    }
  }

  // 添加到今日行动
  const addToActions = (text) => {
    const id = Date.now()
    todayActions.value.push({ id, text, completed: false })
  }

  return {
    healthData,
    constitutionTrend,
    todayActions,
    recoveryIndex,
    toggleAction,
    addToActions
  }
})

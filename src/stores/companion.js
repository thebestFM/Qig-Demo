import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompanionStore = defineStore('companion', () => {
  // 聊天消息
  const messages = ref([
    {
      id: 1,
      type: 'ai',
      content: '您好!我是您的AI中医管家。根据您今日的健康数据,建议您保持良好的作息习惯。有什么想问我的吗?',
      timestamp: new Date().toISOString(),
      evidence: null
    }
  ])

  // 情境快捷入口
  const quickChips = [
    { id: 1, text: '我睡不着', icon: '🌙' },
    { id: 2, text: '我上火', icon: '🔥' },
    { id: 3, text: '我没胃口', icon: '🍽️' },
    { id: 4, text: '我很焦虑', icon: '😰' },
    { id: 5, text: '我想运动', icon: '🏃' }
  ]

  // 添加消息
  const addMessage = (message) => {
    messages.value.push({
      id: Date.now(),
      ...message,
      timestamp: new Date().toISOString()
    })
  }

  // 删除消息（用于移除「思考中」占位气泡）
  const removeMessage = (id) => {
    const idx = messages.value.findIndex(m => m.id === id)
    if (idx !== -1) messages.value.splice(idx, 1)
  }

  // 根据情境生成AI回复
  const generateResponse = (situation) => {
    const responses = {
      '我睡不着': {
        content: '睡眠问题往往与心神不宁有关。建议您:1)睡前泡脚15分钟;2)避免睡前使用手机;3)可尝试按揉神门穴。需要我把"睡前泡脚"加入今日计划吗?',
        evidence: {
          source: '《黄帝内经·素问》',
          content: '阳气尽则卧,阴气尽则寤。睡眠与阴阳平衡密切相关。'
        }
      },
      '我上火': {
        content: '上火多因阴虚火旺或肝郁化火。建议:1)多喝温水;2)避免辛辣油腻食物;3)可饮用菊花茶或金银花茶清热。需要我为您定制清热方案吗?',
        evidence: {
          source: '《中医内科学》',
          content: '火热证的治疗以清热泻火为主,同时需顾护阴液。'
        }
      },
      '我没胃口': {
        content: '食欲不振可能与脾胃虚弱有关。建议:1)少食多餐;2)选择易消化食物如山药粥;3)可按揉足三里穴促进消化。需要我把食疗建议加入计划吗?',
        evidence: {
          source: '《脾胃论》',
          content: '脾胃为后天之本,脾胃虚弱则纳差便溏。'
        }
      },
      '我很焦虑': {
        content: '焦虑情绪与肝气郁结相关。建议:1)深呼吸练习;2)适度运动如八段锦;3)可尝试玫瑰花茶疏肝解郁。我可以教您一个简单的呼吸放松法吗?',
        evidence: {
          source: '《丹溪心法》',
          content: '气顺则百病除,气郁则百病生。'
        }
      },
      '我想运动': {
        content: '适量运动有益气血运行。建议:1)八段锦(简单易学);2)太极拳(调和气血);3)散步(饭后半小时)。根据您今日体力,推荐练习八段锦15分钟。要加入计划吗?',
        evidence: {
          source: '《中医养生学》',
          content: '动能生阳,适度运动可促进气血运行,增强体质。'
        }
      }
    }

    return responses[situation] || {
      content: '我理解您的情况。让我为您分析一下...',
      evidence: null
    }
  }

  return {
    messages,
    quickChips,
    addMessage,
    removeMessage,
    generateResponse
  }
})

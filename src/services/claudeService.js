// 岐黄问道 · 对话服务层（Demo 硬编码版）
// API 调用已移除，Prompt 模板保留于 src/config/prompts.js 备用

// import { CLAUDE_CONFIG } from '../config/claude.js'
// import { buildConsultationPrompt, buildCompanionSystemPrompt, buildWendaoChatSystemPrompt } from '../config/prompts.js'

// ─── 原 Claude API 调用层（已注释，保留备用） ───────────────────────────
// async function callClaude(messages, systemPrompt) {
//   const response = await fetch(CLAUDE_CONFIG.baseURL + '/v1/messages', {
//     method: 'POST',
//     headers: {
//       'x-api-key': CLAUDE_CONFIG.apiKey,
//       'anthropic-version': '2023-06-01',
//       'content-type': 'application/json'
//     },
//     body: JSON.stringify({ model: CLAUDE_CONFIG.model, max_tokens: CLAUDE_CONFIG.maxTokens, system: systemPrompt, messages })
//   })
//   if (!response.ok) throw new Error('API Error ' + response.status)
//   const data = await response.json()
//   return data.content[0].text
// }
// function dataURLToImageBlock(dataURL) {
//   const match = dataURL.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/)
//   if (!match) return null
//   return { type: 'image', source: { type: 'base64', media_type: match[1], data: match[3] } }
// }
// ──────────────────────────────────────────────────────────────────────────

// 硬编码四诊报告
const HARDCODED_CONSULTATION_RESULT = {
  overview: '整体状态尚可，近期略显疲惫，伴有烦躁与腹胀，提示肝气郁结、气机不畅，影响脾胃运化。',
  tendencies: ['肝气郁结', '脾胃气滞'],
  suggestions: [
    { category: '饮食', content: '宜食玫瑰花、陈皮、山楂等疏肝理气食材，少食辛辣；可饮解郁茶（玫瑰花3朵＋陈皮一片）。' },
    { category: '作息', content: '保持规律作息，晚11点前入睡；午间可短暂静卧10-15分钟以养肝气。' },
    { category: '穴位', content: '可按揉太冲穴（足背第一、二跖骨间）每侧1-2分钟，有助疏肝解郁。' },
    { category: '运动', content: '推荐八段锦或散步，避免剧烈运动；户外慢走配合深呼吸，有助肝气舒展。' }
  ],
  warnings: [
    '若腹胀、烦躁持续超过一周或加重，建议及时就医。',
    '咽干口渴明显时注意补充水分，避免久坐少动。'
  ],
  references: [
    { source: '《本草纲目拾遗》', content: '玫瑰花「和血行血，理气，治风痹、噤口痢、乳痈、肿毒初起、肝胃气痛」' }
  ]
}

/**
 * 四诊合参报告生成（硬编码 Demo，模拟3秒分析耗时）
 */
export async function analyzeConsultation(captureData, answers, symptomText) {
  await new Promise(resolve => setTimeout(resolve, 3000))
  return HARDCODED_CONSULTATION_RESULT
}

// 问道对话轮次计数（第一轮返回详细硬编码回复，后续返回简短引导语）
let wendaoCallCount = 0

const FIRST_WENDAO_REPLY = "从你过往的健康数据和今天进行的问诊记录报告来看，你的身体状态尚可，但最近的疲惫、烦躁和腹胀，很像是“肝气郁结”影响了脾胃的运作，这通常是身体负担略高的信号：肝的疏泄功能容易失常，气机不畅就会烦躁；肝气横犯脾胃，就会导致腹胀、食欲不振；气郁久了也可能微微化热，耗伤津液，所以你感觉咽干口渴。你的报告里还提及了舌苔泛白，也提示中焦气机不够流通。是不是最近工作繁忙，以至于有点烦躁啦？\n别担心，这是身体在提醒你需要稍微调整一下节奏。我建议你可以从这两件小事开始尝试：\n1) 一杯“解郁茶”：用玫瑰花3-5朵、陈皮一小片，泡水代茶饮。玫瑰花能温和地疏解肝郁，让你心情舒缓，陈皮理气和胃，有助于缓解腹胀。味道清香，也很适合在办公室随时饮用。（——《本草纲目拾遗》载：玫瑰花“和血行血，理气，治风痹、噤口痢、乳痈、肿毒初起、肝胃气痛”）\n2) 出门走走散散心：如果有公园长椅坐坐最好，或者单纯地在不拥挤的街上走走也是很好的。在安全的前提下，不要多想工作或生活的问题，把注意力放在身边的行人和事物。有意地调整呼吸到平稳、悠长的感觉，用鼻子深深吸气，然后用嘴缓缓地呼气，想象把胸口的闷气都呼出去。这与肝相应，有助于平肝气、散郁结。（此法源于传统养生“六字诀”）\n我们的身体很聪明，这些小信号是在和你对话。先试试这些自然的方法，给身体一点温柔的关照。当然，如果腹胀、烦躁或疲惫感持续没有缓解，甚至有加重的趋势，一定要及时去看医生，线下医生为你面对面调理会更稳妥。"

const FOLLOWUP_REPLIES = [
  '你说得很对，身体的反应往往是最真实的信号。继续保持觉察，有什么不舒服随时告诉我。',
  '调养需要时间，不必心急。玫瑰茶和散步可以先从今天开始，慢慢感受身体的变化。',
  '肝气郁结的调养，重在疏解而非压制。保持心情舒畅，比任何方子都重要。'
]

/**
 * 问道聊天（含症状上下文，多轮对话）
 * 第一次调用：等待6秒，返回详细分析；后续调用：等待1秒，返回简短引导
 */
export async function sendWendaoMessage(history, userMessage) {
  if (wendaoCallCount === 0) {
    wendaoCallCount++
    await new Promise(resolve => setTimeout(resolve, 6000))
    return FIRST_WENDAO_REPLY
  }
  const idx = (wendaoCallCount - 1) % FOLLOWUP_REPLIES.length
  wendaoCallCount++
  await new Promise(resolve => setTimeout(resolve, 1000))
  return FOLLOWUP_REPLIES[idx]
}

/**
 * AI 陪伴对话（Companion 页，硬编码简短回复）
 */
export async function sendCompanionMessage(history, userMessage) {
  await new Promise(resolve => setTimeout(resolve, 1200))
  return '您好，有什么关于身体调养的问题，我都可以为您解答。'
}

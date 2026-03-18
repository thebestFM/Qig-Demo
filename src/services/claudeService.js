// 岐黄问道 · Claude API 服务层
import { CLAUDE_CONFIG } from '../config/claude.js'
import { buildConsultationPrompt, buildCompanionSystemPrompt } from '../config/prompts.js'

/**
 * 调用 Claude API（Anthropic Messages API）
 */
async function callClaude(messages, systemPrompt) {
  if (!CLAUDE_CONFIG.apiKey || CLAUDE_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('API_KEY_NOT_SET')
  }

  const response = await fetch(`${CLAUDE_CONFIG.baseURL}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_CONFIG.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      system: systemPrompt,
      messages
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API Error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.content[0].text
}

/**
 * 将 base64 DataURL 转为 { type, media_type, data } 格式
 * 仅支持 image/jpeg, image/png, image/gif, image/webp
 */
function dataURLToImageBlock(dataURL) {
  const match = dataURL.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/)
  if (!match) return null
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: match[1],
      data: match[2]
    }
  }
}

/**
 * 四诊合参报告生成
 * @param {Object} captureData
 * @param {Object} answers
 * @param {string} symptomText - 用户自述症状
 */
export async function analyzeConsultation(captureData, answers, symptomText) {
  const { systemPrompt, userMessage } = buildConsultationPrompt(captureData, answers, symptomText)

  // 构建含图片的 content 块
  const contentBlocks = []

  // 添加舌象图片
  if (captureData.tongue) {
    const imgBlock = dataURLToImageBlock(captureData.tongue)
    if (imgBlock) {
      contentBlocks.push(imgBlock)
      contentBlocks.push({ type: 'text', text: '以上是患者舌象图片。' })
    }
  }

  // 添加面象图片
  if (captureData.face) {
    const imgBlock = dataURLToImageBlock(captureData.face)
    if (imgBlock) {
      contentBlocks.push(imgBlock)
      contentBlocks.push({ type: 'text', text: '以上是患者面象图片。' })
    }
  }

  // 添加文字 prompt
  contentBlocks.push({ type: 'text', text: userMessage })

  const text = await callClaude(
    [{ role: 'user', content: contentBlocks }],
    systemPrompt
  )

  // 解析 JSON 响应
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid JSON response')
  return JSON.parse(jsonMatch[0])
}

/**
 * AI 陪伴对话
 * @param {Array} history - companionStore.messages 中最近10条
 * @param {string} userMessage
 */
export async function sendCompanionMessage(history, userMessage) {
  const messages = [
    ...history
      .slice(-10)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content.slice(0, 500)
      })),
    { role: 'user', content: userMessage }
  ]

  const text = await callClaude(messages, buildCompanionSystemPrompt())
  return text
}

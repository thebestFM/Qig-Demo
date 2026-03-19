// 岐黄问道 · Prompt 模板（已注释保留，供后续 API 接入使用）
// 如需启用，请取消注释并在 claudeService.js 中恢复 import

// // 岐黄问道 · Prompt 模板
// 
// /**
//  * 四诊合参问诊报告生成 Prompt
//  * @param {Object} captureData - 采集数据（舌象/面象/声诊/脉象）
//  * @param {Object} answers - 问卷答案
//  * @param {string} symptomText - 用户自述症状文字
//  */
// export function buildConsultationPrompt(captureData, answers, symptomText) {
//   const sections = []
// 
//   // 舌象（有图片时由 claudeService 传入 vision，这里只记文字标记）
//   if (captureData.tongue) {
//     sections.push('舌象：已上传图片（见附件）')
//   }
// 
//   // 面象
//   if (captureData.face) {
//     sections.push('面象：已上传图片（见附件）')
//   }
// 
//   // 声诊（音频 API 不支持，仅记录文件名）
//   if (captureData.voice) {
//     sections.push(`声诊：患者已录制声音文件（${captureData.voice}），请结合其他信息推断`)
//   }
// 
//   // 脉象
//   if (captureData.pulse?.rate || captureData.pulse?.depth) {
//     sections.push(`脉象：频率「${captureData.pulse.rate || '未知'}」，深浅「${captureData.pulse.depth || '未知'}」`)
//   }
// 
//   // 问卷答案
//   const answerParts = []
//   if (answers.energy)    answerParts.push(`精力体力：${answers.energy}`)
//   if (answers.sleep)     answerParts.push(`睡眠状况：${answers.sleep}`)
//   if (answers.digestion) answerParts.push(`消化情况：${answers.digestion}`)
//   if (answers.emotion)   answerParts.push(`情绪状态：${answers.emotion}`)
//   const symptomList = [...(answers.symptoms || [])]
//   if (answers.symptomsOther && answers.symptomsOther.trim()) {
//     symptomList.push(`其他：${answers.symptomsOther.trim()}`)
//   }
//   if (symptomList.length) {
//     answerParts.push(`近期不适症状：${symptomList.join('、')}`)
//   } else {
//     answerParts.push('近期不适症状：无明显不适')
//   }
//   if (answerParts.length) {
//     sections.push('【问诊答案】\n' + answerParts.join('\n'))
//   }
// 
//   // 自述症状文字
//   if (symptomText && symptomText.trim()) {
//     sections.push(`【患者自述】\n${symptomText.trim()}`)
//   }
// 
//   const systemPrompt = `你是一位资深中医问诊 AI 助手，精通四诊合参（望闻问切），擅长体质辨识与健康调养。
//     请根据用户提供的四诊信息，给出专业、温和、有依据的中医分析报告。
//     报告要有人情味，语气温和，体现中医整体观。
//     必须严格按照以下 JSON 格式返回，不要添加任何额外文字：
// {
//   "overview": "整体状态概述（2-3句话）",
//   "tendencies": ["体质倾向1", "体质倾向2"],
//   "suggestions": [
//     {"category": "饮食", "content": "具体建议"},
//     {"category": "作息", "content": "具体建议"},
//     {"category": "穴位", "content": "具体建议"},
//     {"category": "运动", "content": "具体建议"}
//   ],
//   "warnings": ["注意事项1", "注意事项2"],
//   "references": [
//     {"source": "典籍名称", "content": "相关原文片段"}
//   ]
// }`
// 
//   const userMessage = `请根据以下四诊信息，生成中医问诊报告：\n\n${sections.join('\n\n')}`
// 
//   return { systemPrompt, userMessage }
// }
// 
// /**
//  * AI 陪伴对话 Prompt
//  */
// export function buildCompanionSystemPrompt() {
//   return `你是「岐黄问道」Qig中医管家，精通中医理论，包括阴阳五行、脏腑经络、四诊八纲、体质辨识等。
// 请用温和、亲切、专业的语气回答用户的健康问题。
// 回答要求：
// 1. 请使用尽可能简洁的话回复，每次回复不超过120字
// 2. 给出1-3条可操作的具体建议
// 3. 如有典籍依据，请在末尾注明来源（格式：——《典籍名》）
// 4. 涉及严重症状时，必须建议就医
// 5. 用词温雅，体现中医文化底蕴`
// }
// 
// // 用户近期身体状况
// const CURRENT_SYMPTOMS = ``
// 
// /**
//  * 问道聊天 Prompt（含症状上下文）
//  */
// export function buildWendaoChatSystemPrompt() {
//   return `请你作为一个中医建议助手，与患者进行轻松自然的聊天。语言简洁、平和、温暖，不超过100字每次回复。
// 
// 你的任务是回复患者发起的聊天，重点是陪伴和倾听，而非诊断。可以在聊天中自然地融入一两句与中医相关的生活小建议，但不必每次都给出建议，更不要给出严格的医学性诊断或处方。
// 
// 请记住你只是一个陪伴式助手，遇到严重症状请建议就医，不要过度发挥医学专业性。
// 
// 以下是该患者近期的身体状况，供你参考（不必每次都提及，仅作背景）：
// ${CURRENT_SYMPTOMS}`
// }
// 
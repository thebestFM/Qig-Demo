<template>
  <div class="page-container companion-page">
    <!-- 计划进度 -->
    <div class="progress-bar">
      <div class="progress-label">今日计划进度</div>
      <div class="progress-info">
        <span class="progress-count">{{ completedActions }}/{{ userStore.todayActions.length }}</span>
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ width: (completedActions / userStore.todayActions.length * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Agent 状态条 -->
    <div class="agent-status-bar">
      <span class="agent-dot"></span>
      <span class="agent-label">Agent 模式 · RAG 增强 · Claude Opus</span>
      <span class="agent-model">实时在线</span>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-area" ref="chatArea">
      <div class="messages-list">
        <div
          v-for="message in companionStore.messages"
          :key="message.id"
          class="message-item"
          :class="{ 'ai-message': message.type === 'ai', 'user-message': message.type === 'user' }"
        >
          <div v-if="message.type === 'ai'" class="ai-avatar">
            <span class="ai-avatar-icon">🌿</span>
          </div>
          <div class="message-bubble-wrap">
            <div v-if="message.type === 'ai'" class="ai-model-tag">Claude Opus · RAG</div>
            <div class="message-bubble">
              <div class="message-content">{{ message.content }}</div>
              <div v-if="message.type === 'ai' && !message.isThinking" class="message-actions">
                <button class="msg-action-btn" @click="addToPlanFromMessage(message)">
                  加入今日计划
                </button>
                <button
                  v-if="message.evidence"
                  class="msg-action-btn"
                  @click="showEvidence(message.evidence)"
                >
                  问一句为什么
                </button>
              </div>
            </div>
            <div v-if="message.type === 'ai'" class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 情境快捷入口 -->
    <div class="quick-chips">
      <button 
        v-for="chip in companionStore.quickChips"
        :key="chip.id"
        class="chip-btn"
        @click="handleQuickChip(chip)"
      >
        <span class="chip-icon">{{ chip.icon }}</span>
        <span class="chip-text">{{ chip.text }}</span>
      </button>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <button class="voice-btn" @click="handleVoice" title="声诊语音输入">
        🎤
      </button>
      <input
        v-model="userInput"
        type="text"
        class="chat-input"
        placeholder="输入您想问的，或点击🎤语音输入..."
        @keyup.enter="sendMessage"
      />
      <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim()">
        发送
      </button>
    </div>

    <!-- 证据抽屉 -->
    <Drawer v-model="showEvidenceDrawer" title="依据说明">
      <div v-if="currentEvidence" class="evidence-content">
        <div class="evidence-source">{{ currentEvidence.source }}</div>
        <div class="evidence-text">"{{ currentEvidence.content }}"</div>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useCompanionStore } from '../stores/companion'
import { useUserStore } from '../stores/user'
import Drawer from '../components/common/Drawer.vue'
import { sendCompanionMessage } from '../services/claudeService.js'

const companionStore = useCompanionStore()
const userStore = useUserStore()

const userInput = ref('')
const chatArea = ref(null)
const showEvidenceDrawer = ref(false)
const currentEvidence = ref(null)

const completedActions = computed(() => {
  return userStore.todayActions.filter(a => a.completed).length
})

const isAiThinking = ref(false)

const sendMessage = async () => {
  if (!userInput.value.trim() || isAiThinking.value) return

  companionStore.addMessage({
    type: 'user',
    content: userInput.value
  })

  const userText = userInput.value
  userInput.value = ''

  await nextTick()
  scrollToBottom()

  isAiThinking.value = true
  // 添加「思考中」占位气泡
  const thinkingId = Date.now()
  companionStore.addMessage({
    id: thinkingId,
    type: 'ai',
    content: '思考中……',
    isThinking: true
  })
  await nextTick()
  scrollToBottom()

  try {
    const replyText = await sendCompanionMessage(
      companionStore.messages.filter(m => !m.isThinking),
      userText
    )
    companionStore.removeMessage(thinkingId)
    companionStore.addMessage({
      type: 'ai',
      content: replyText,
      evidence: null
    })
  } catch (e) {
    companionStore.removeMessage(thinkingId)
    // 降级到 mock 回复
    const response = companionStore.generateResponse(userText)
    companionStore.addMessage({
      type: 'ai',
      content: response.content,
      evidence: response.evidence
    })
  } finally {
    isAiThinking.value = false
    await nextTick()
    scrollToBottom()
  }
}

const handleQuickChip = async (chip) => {
  if (isAiThinking.value) return

  companionStore.addMessage({
    type: 'user',
    content: chip.text
  })

  await nextTick()
  scrollToBottom()

  isAiThinking.value = true
  const thinkingId = Date.now()
  companionStore.addMessage({
    id: thinkingId,
    type: 'ai',
    content: '思考中……',
    isThinking: true
  })
  await nextTick()
  scrollToBottom()

  try {
    const replyText = await sendCompanionMessage(
      companionStore.messages.filter(m => !m.isThinking),
      chip.text
    )
    companionStore.removeMessage(thinkingId)
    companionStore.addMessage({
      type: 'ai',
      content: replyText,
      evidence: null
    })
  } catch (e) {
    companionStore.removeMessage(thinkingId)
    const response = companionStore.generateResponse(chip.text)
    companionStore.addMessage({
      type: 'ai',
      content: response.content,
      evidence: response.evidence
    })
  } finally {
    isAiThinking.value = false
    await nextTick()
    scrollToBottom()
  }
}

const addToPlanFromMessage = (message) => {
  // 提取建议内容
  const lines = message.content.split('\n')
  const suggestions = lines.filter(line => line.match(/^\d\)/))
  
  if (suggestions.length > 0) {
    suggestions.forEach(s => {
      userStore.addToActions(s.replace(/^\d\)/, '').trim())
    })
    alert('已加入今日计划')
  } else {
    userStore.addToActions(message.content.substring(0, 30))
    alert('已加入今日计划')
  }
}

const showEvidence = (evidence) => {
  currentEvidence.value = evidence
  showEvidenceDrawer.value = true
}

const scrollToBottom = () => {
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

const handleVoice = () => {
  alert('声诊语音输入功能开发中，敬请期待...')
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.companion-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  background: var(--bg-primary);
  padding: 0;
}

/* Agent 状态条 */
.agent-status-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 6px var(--spacing-lg);
  background: rgba(91, 140, 90, 0.06);
  border-bottom: 1px solid rgba(91, 140, 90, 0.12);
  font-size: 11px;
}

.agent-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

.agent-label {
  flex: 1;
  color: var(--color-success);
  font-family: var(--font-sans);
  letter-spacing: 0.03em;
}

.agent-model {
  color: var(--text-tertiary);
  font-size: 10px;
}

/* 进度条 */
.progress-bar {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.progress-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.progress-track {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  -webkit-overflow-scrolling: touch;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.message-item.user-message {
  flex-direction: row-reverse;
}

.message-item.ai-message {
  flex-direction: row;
}

.ai-avatar {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,75,49,0.12), rgba(230,162,60,0.12));
  border: 1px solid rgba(200,75,49,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-top: 2px;
}

.message-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message-item.user-message .message-bubble-wrap {
  align-items: flex-end;
}

.ai-model-tag {
  font-size: 10px;
  color: var(--text-tertiary);
  font-family: var(--font-sans);
  margin-bottom: 3px;
  padding-left: 2px;
}

.message-bubble {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  line-height: var(--line-height-relaxed);
}

.user-message .message-bubble {
  background: var(--color-accent);
  color: var(--text-light);
  border-bottom-right-radius: var(--radius-sm);
}

.ai-message .message-bubble {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--text-primary);
  border-bottom-left-radius: var(--radius-sm);
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.message-content {
  font-size: var(--font-size-base);
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.msg-action-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.msg-action-btn:hover {
  background: rgba(200, 75, 49, 0.2);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

/* 快捷入口 */
.quick-chips {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  overflow-x: auto;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  -webkit-overflow-scrolling: touch;
}

.quick-chips::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.chip-btn:hover {
  border-color: var(--color-accent);
  background: rgba(200, 75, 49, 0.05);
}

.chip-icon {
  font-size: 16px;
}

.chip-text {
  color: var(--text-primary);
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  padding-bottom: calc(var(--spacing-md) + var(--safe-area-bottom));
  align-items: center;
}

.voice-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(200, 75, 49, 0.06);
  border: 1px solid rgba(200, 75, 49, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.voice-btn:hover {
  background: rgba(200, 75, 49, 0.12);
  border-color: var(--color-accent);
}

.chat-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  outline: none;
  transition: border-color var(--transition-fast);
}

.chat-input:focus {
  border-color: var(--color-accent);
}

.send-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-accent);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.send-btn:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
}

/* 证据内容 */
.evidence-content {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-accent);
}

.evidence-source {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.evidence-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-style: italic;
  line-height: var(--line-height-relaxed);
}
</style>

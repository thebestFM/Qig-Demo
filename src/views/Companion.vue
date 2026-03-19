<template>
  <div class="page-container companion-page">
    <!-- Agent 状态条 + 进度条 -->
    <div class="agent-status-bar">
      <div class="status-left">
        <span class="agent-dot"></span>
        <span class="agent-label"><span class="qig-en">Qig</span> 在线</span>
      </div>
      <div class="status-right">
        <span class="inline-progress-label">今日计划 {{ completedActions }}/{{ userStore.todayActions.length }}</span>
        <div class="inline-progress-bar">
          <div
            class="inline-progress-fill"
            :style="{ width: (completedActions / userStore.todayActions.length * 100) + '%' }"
          ></div>
        </div>
      </div>
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
            <img src="/Qig.png" alt="Qig" class="ai-avatar-img" />
          </div>
          <div class="message-bubble-wrap">
            <div v-if="message.type === 'ai'" class="ai-model-tag">Qig中医管家</div>
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

    <!-- 输入区域 -->
    <div class="input-area">
      <button class="voice-btn" @click="handleVoice" title="声诊语音输入">
        <img src="/microphone.png" alt="语音" class="voice-icon-img" />
      </button>
      <input
        v-model="userInput"
        type="text"
        class="chat-input"
        placeholder="输入您想问的，或点击话筒语音输入..."
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
import { sendWendaoMessage } from '../services/claudeService.js'

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
    const replyText = await sendWendaoMessage(
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
    companionStore.addMessage({
      type: 'ai',
      content: `[API错误] ${e.message}`,
      evidence: null
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
  height: calc(100vh - var(--header-height) - var(--tab-bar-height));
  background: transparent;
  padding: 0;
  overflow: hidden;
}

/* Agent 状态条 */
.agent-status-bar {
  display: flex;
  align-items: center;
  padding: 7px var(--spacing-lg);
  background: rgba(91, 140, 90, 0.06);
  border-bottom: 1px solid rgba(91, 140, 90, 0.12);
  font-size: 12px;
}

.status-left {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.agent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

.agent-label {
  color: var(--color-success);
  font-family: var(--font-sans);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.inline-progress-label {
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

.inline-progress-bar {
  width: 80px;
  flex-shrink: 0;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid rgba(160, 160, 160, 0.35);
}

.inline-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-success-light));
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,75,49,0.12), rgba(230,162,60,0.12));
  border: 1px solid rgba(200,75,49,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-top: 2px;
  overflow: hidden;
}

.ai-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.qig-en {
  font-family: var(--font-english-script);
  font-style: normal;
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
  font-size: 13px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
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

.voice-icon-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
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

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'label-editor:appearance-presets'

/**
 * 外观预设存储：全局命名预设，持久化到 localStorage。
 * 预设结构：{ id, name, sourceType, values: { [语义外观键]: 值 }, createdAt }
 */
export const usePresetStore = defineStore('appearancePresets', () => {
  const presets = ref(loadPresets())

  function loadPresets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  // 任何增删改后写回本地，刷新/切换元件后仍可使用
  watch(presets, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 存储不可用时忽略，本次会话内预设仍可用
    }
  }, { deep: true })

  const normalizeName = (name) => (typeof name === 'string' ? name.trim() : '')

  // excludeId 用于重命名时排除自身
  function findByName(name, excludeId = null) {
    const target = normalizeName(name)
    return presets.value.find(p => p.name === target && p.id !== excludeId)
  }

  /**
   * 保存新预设。名称为空或重名时拒绝，并返回具体原因。
   * @returns {{ ok: boolean, message?: string, preset?: object }}
   */
  function addPreset({ name, sourceType, values }) {
    const finalName = normalizeName(name)
    if (!finalName) {
      return { ok: false, message: '预设名称不能为空' }
    }
    if (findByName(finalName)) {
      return { ok: false, message: `已存在名为“${finalName}”的预设，请换一个名称` }
    }

    const preset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: finalName,
      sourceType,
      values: { ...values },
      createdAt: Date.now()
    }
    presets.value.push(preset)
    return { ok: true, preset }
  }

  /**
   * 重命名预设。名称为空或与其他预设重名时拒绝。
   * @returns {{ ok: boolean, message?: string }}
   */
  function renamePreset(id, name) {
    const preset = presets.value.find(p => p.id === id)
    if (!preset) {
      return { ok: false, message: '预设不存在' }
    }
    const finalName = normalizeName(name)
    if (!finalName) {
      return { ok: false, message: '预设名称不能为空' }
    }
    if (findByName(finalName, id)) {
      return { ok: false, message: `已存在名为“${finalName}”的预设，请换一个名称` }
    }
    preset.name = finalName
    return { ok: true }
  }

  function removePreset(id) {
    const index = presets.value.findIndex(p => p.id === id)
    if (index !== -1) {
      presets.value.splice(index, 1)
    }
  }

  return {
    presets,
    addPreset,
    renamePreset,
    removePreset
  }
})

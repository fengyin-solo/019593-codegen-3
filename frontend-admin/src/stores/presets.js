import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'label-editor-appearance-presets'

// 外观项的规范字段定义。
// 不同元件类型上表达同一外观的属性名不同（例如文本的字体是 fontFamily，
// 表格的字体是 cellFontFamily），这里建立规范字段到各类型属性名的映射，
// 这样跨类型套用时可以按“共有外观项”覆盖，而不是生硬地按键名比对。
export const APPEARANCE_FIELDS = {
  fontFamily: {
    label: '字体',
    keys: { text: 'fontFamily', table: 'cellFontFamily' }
  },
  fontSize: {
    label: '字号',
    keys: { text: 'fontSize', table: 'cellFontSize' }
  },
  fontColor: {
    label: '字色',
    keys: { text: 'color', table: 'cellFontColor' }
  },
  borderColor: {
    label: '边框色',
    keys: { rect: 'strokeColor', circle: 'strokeColor', line: 'strokeColor', table: 'borderColor' }
  },
  borderWidth: {
    label: '边框粗细',
    keys: { rect: 'strokeWidth', circle: 'strokeWidth', line: 'strokeWidth', table: 'borderWidth' }
  },
  textAlign: {
    label: '对齐方式',
    keys: { table: 'cellTextAlign' }
  }
}

// 支持外观预设的元件类型（图片、条码、二维码没有这些可预设的外观项）
export const PRESET_ELEMENT_TYPES = ['text', 'rect', 'circle', 'line', 'table']

export const ELEMENT_TYPE_LABELS = {
  text: '文本',
  rect: '矩形',
  circle: '圆形',
  line: '线条',
  image: '图片',
  barcode: '条码',
  qrcode: '二维码',
  table: '表格'
}

// 某元件类型拥有的规范外观字段
export function getFieldsOfType(type) {
  return Object.keys(APPEARANCE_FIELDS).filter(field => !!APPEARANCE_FIELDS[field].keys[type])
}

// 从元件上提取可预设的外观（坐标、宽高、旋转、内容等一律不提取）
export function extractStyles(element) {
  const styles = {}
  for (const field of getFieldsOfType(element.type)) {
    const key = APPEARANCE_FIELDS[field].keys[element.type]
    if (element[key] !== undefined) {
      styles[field] = element[key]
    }
  }
  return styles
}

function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(p => p && typeof p.name === 'string' && typeof p.sourceType === 'string' && p.styles && typeof p.styles === 'object')
      .map(p => ({ id: String(p.id), name: p.name, sourceType: p.sourceType, styles: { ...p.styles } }))
  } catch (e) {
    return []
  }
}

export const usePresetStore = defineStore('presets', () => {
  const presets = ref(loadPresets())
  let presetIdCounter = presets.value.reduce((max, p) => {
    const n = Number(String(p.id).replace('preset_', ''))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.value))
    } catch (e) {
      // localStorage 不可用时仅保留内存中的预设，不阻断操作
    }
  }

  // 名称校验：不能为空（纯空白也算空）、不能与已有预设重名
  // excludeId 用于改名时排除预设自身
  function validateName(name, excludeId = null) {
    const trimmed = String(name ?? '').trim()
    if (!trimmed) {
      return { ok: false, message: '预设名称不能为空，请填写名称后再保存' }
    }
    const duplicated = presets.value.find(p => p.id !== excludeId && p.name === trimmed)
    if (duplicated) {
      return { ok: false, message: `名称「${trimmed}」与已有预设重名，请更换一个不重复的名称` }
    }
    return { ok: true, name: trimmed }
  }

  // 把当前元件的外观存成命名预设
  function savePreset(name, element) {
    const check = validateName(name)
    if (!check.ok) return { ok: false, message: check.message }

    const id = `preset_${++presetIdCounter}`
    const preset = {
      id,
      name: check.name,
      sourceType: element.type,
      styles: extractStyles(element)
    }
    presets.value.push(preset)
    persist()
    return { ok: true, preset }
  }

  function renamePreset(id, newName) {
    const preset = presets.value.find(p => p.id === id)
    if (!preset) return { ok: false, message: '预设不存在，可能已被移除' }
    const check = validateName(newName, id)
    if (!check.ok) return { ok: false, message: check.message }
    preset.name = check.name
    persist()
    return { ok: true, preset }
  }

  function removePreset(id) {
    const index = presets.value.findIndex(p => p.id === id)
    if (index === -1) return { ok: false, message: '预设不存在，可能已被移除' }
    const [removed] = presets.value.splice(index, 1)
    persist()
    return { ok: true, preset: removed }
  }

  // 计算把预设套用到目标元件时需要覆盖的属性。
  // 只覆盖双方共有的外观项，返回目标元件属性名到值的 updates；
  // 位置、宽高、旋转角度等不在更新范围内，保持套用前的值。
  function resolveApply(id, element) {
    const preset = presets.value.find(p => p.id === id)
    if (!preset) return { ok: false, message: '预设不存在，可能已被移除' }

    const updates = {}
    const appliedLabels = []
    const skippedLabels = []

    for (const [field, def] of Object.entries(APPEARANCE_FIELDS)) {
      if (!(field in preset.styles)) continue
      const targetKey = def.keys[element.type]
      if (targetKey) {
        updates[targetKey] = preset.styles[field]
        appliedLabels.push(def.label)
      } else {
        skippedLabels.push(def.label)
      }
    }

    return {
      ok: true,
      preset,
      updates,
      appliedLabels,
      skippedLabels
    }
  }

  return {
    presets,
    validateName,
    savePreset,
    renamePreset,
    removePreset,
    resolveApply
  }
})

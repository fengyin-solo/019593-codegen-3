/**
 * 外观预设：统一描述“常用外观项”，以及各元件类型与这些外观项之间的字段映射。
 *
 * 外观项以语义键（canonical key）存储，跨元件类型套用时按语义匹配，
 * 例如文本的 color 与表格的 cellFontColor 都代表“字色”，可互相套用；
 * 而 rect/circle 的 strokeColor 代表“边框色”，与“字色”不会混用。
 */

// 外观项元数据：key -> 中文名称
export const APPEARANCE_FIELDS = {
  fontFamily: '字体',
  fontSize: '字号',
  fontColor: '字色',
  borderColor: '边框色',
  borderWidth: '边框粗细',
  textAlign: '对齐方式'
}

// 元件类型 -> 中文名称
export const TYPE_LABELS = {
  text: '文本',
  rect: '矩形',
  circle: '圆形',
  line: '线条',
  table: '表格',
  image: '图片',
  barcode: '条码',
  qrcode: '二维码'
}

// 元件类型 -> 支持的外观项（语义键 -> 该元件上的实际属性名）
const TYPE_FIELD_MAP = {
  text: {
    fontFamily: 'fontFamily',
    fontSize: 'fontSize',
    fontColor: 'color'
  },
  rect: {
    borderColor: 'strokeColor',
    borderWidth: 'strokeWidth'
  },
  circle: {
    borderColor: 'strokeColor',
    borderWidth: 'strokeWidth'
  },
  line: {
    borderColor: 'strokeColor',
    borderWidth: 'strokeWidth'
  },
  table: {
    fontFamily: 'cellFontFamily',
    fontSize: 'cellFontSize',
    fontColor: 'cellFontColor',
    borderColor: 'borderColor',
    borderWidth: 'borderWidth',
    textAlign: 'cellTextAlign'
  }
}

export const typeLabel = (type) => TYPE_LABELS[type] || type

export const fieldLabel = (key) => APPEARANCE_FIELDS[key] || key

/** 某类元件支持的外观项（语义键数组） */
export const supportedFields = (type) => Object.keys(TYPE_FIELD_MAP[type] || {})

/** 该类元件是否存在可保存/套用的外观项 */
export const supportsAppearance = (type) => supportedFields(type).length > 0

/**
 * 从元件上提取可保存的外观值。
 * @returns {{ values: Object, fields: string[] }} values 以语义键存储
 */
export function extractAppearance(element) {
  const mapping = TYPE_FIELD_MAP[element?.type] || {}
  const values = {}
  const fields = []
  for (const [fieldKey, propName] of Object.entries(mapping)) {
    if (element[propName] !== undefined) {
      values[fieldKey] = element[propName]
      fields.push(fieldKey)
    }
  }
  return { values, fields }
}

/**
 * 规划一次预设套用：只计算双方共有外观项对应的属性覆盖，不改动坐标/宽高/旋转。
 * @returns {{ updates: Object, appliedKeys: string[], skippedKeys: string[] }}
 */
export function planApply(preset, targetType) {
  const targetMapping = TYPE_FIELD_MAP[targetType] || {}
  const updates = {}
  const appliedKeys = []
  const skippedKeys = []

  for (const fieldKey of Object.keys(APPEARANCE_FIELDS)) {
    const inPreset = Object.prototype.hasOwnProperty.call(preset.values, fieldKey)
    const inTarget = Object.prototype.hasOwnProperty.call(targetMapping, fieldKey)
    if (inPreset && inTarget) {
      updates[targetMapping[fieldKey]] = preset.values[fieldKey]
      appliedKeys.push(fieldKey)
    } else if (inPreset) {
      // 预设包含、但当前元件不支持的外观项，跳过
      skippedKeys.push(fieldKey)
    }
  }

  return { updates, appliedKeys, skippedKeys }
}

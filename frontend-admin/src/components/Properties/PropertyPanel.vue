<template>
  <div class="property-panel card">
    <div class="section-title">属性设置</div>
    <div class="property-content" v-if="element">
      <el-form label-position="left" label-width="60px" size="small">
        <!-- 通用属性 -->
        <div class="property-group">
          <div class="group-title">位置与尺寸 <span class="hint">(单位: px, 不可超出画布)</span></div>
          <el-form-item label="X">
            <el-input-number v-model="formData.x" :min="0" :max="maxX" controls-position="right" @change="updateProp('x')" />
          </el-form-item>
          <el-form-item label="Y">
            <el-input-number v-model="formData.y" :min="0" :max="maxY" controls-position="right" @change="updateProp('y')" />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number v-model="formData.width" :min="10" :max="maxWidth" controls-position="right" @change="updateProp('width')" />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number v-model="formData.height" :min="10" :max="maxHeight" controls-position="right" @change="updateProp('height')" />
          </el-form-item>
          <el-form-item label="旋转">
            <el-input-number v-model="formData.rotation" :min="0" :max="360" :step="15" controls-position="right" @change="updateProp('rotation')" />
            <span class="unit">°</span>
          </el-form-item>
        </div>

        <!-- 文本属性 -->
        <div v-if="element.type === 'text'" class="property-group">
          <div class="group-title">文本属性</div>
          <el-form-item label="内容">
            <el-input v-model="formData.content" @change="updateProp('content')" />
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="formData.fontFamily" @change="updateProp('fontFamily')">
              <el-option v-for="f in fonts" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="formData.fontSize" :min="8" :max="200" @change="updateProp('fontSize')" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="formData.color" @change="updateProp('color')" />
          </el-form-item>
          <el-form-item label="样式">
            <el-checkbox v-model="formData.bold" @change="updateProp('bold')">粗体</el-checkbox>
            <el-checkbox v-model="formData.italic" @change="updateProp('italic')">斜体</el-checkbox>
          </el-form-item>
        </div>

        <!-- 图形属性 -->
        <div v-if="['rect', 'circle'].includes(element.type)" class="property-group">
          <div class="group-title">图形属性</div>
          <el-form-item label="填充色">
            <el-color-picker v-model="formData.fillColor" show-alpha @change="updateProp('fillColor')" />
          </el-form-item>
          <el-form-item label="边框色">
            <el-color-picker v-model="formData.strokeColor" @change="updateProp('strokeColor')" />
          </el-form-item>
          <el-form-item label="边框宽">
            <el-input-number v-model="formData.strokeWidth" :min="0" :max="20" @change="updateProp('strokeWidth')" />
          </el-form-item>
        </div>

        <!-- 线条属性 -->
        <div v-if="element.type === 'line'" class="property-group">
          <div class="group-title">线条属性</div>
          <el-form-item label="颜色">
            <el-color-picker v-model="formData.strokeColor" @change="updateProp('strokeColor')" />
          </el-form-item>
          <el-form-item label="粗细">
            <el-input-number v-model="formData.strokeWidth" :min="1" :max="50" @change="updateProp('strokeWidth')" />
          </el-form-item>
        </div>

        <!-- 图片属性 -->
        <div v-if="element.type === 'image'" class="property-group">
          <div class="group-title">图片属性</div>
          <el-form-item label="图片">
            <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" @change="handleImageUpload">
              <el-button type="primary" size="small">选择图片</el-button>
            </el-upload>
          </el-form-item>
          <div v-if="element.imageData" class="image-preview">
            <img :src="element.imageData" alt="预览" />
          </div>
        </div>

        <!-- 条码属性 -->
        <div v-if="element.type === 'barcode'" class="property-group">
          <div class="group-title">条码属性</div>
          <el-form-item label="内容">
            <el-input v-model="formData.content" @change="updateProp('content')" />
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="formData.format" @change="updateProp('format')">
              <el-option v-for="f in barcodeFormats" :key="f.value" :label="f.label" :value="f.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="文字">
            <el-checkbox v-model="formData.showText" @change="updateProp('showText')">显示</el-checkbox>
          </el-form-item>
        </div>

        <!-- 二维码属性 -->
        <div v-if="element.type === 'qrcode'" class="property-group">
          <div class="group-title">二维码属性</div>
          <el-form-item label="内容">
            <el-input v-model="formData.content" @change="updateProp('content')" />
          </el-form-item>
          <el-form-item label="容错">
            <el-select v-model="formData.errorLevel" @change="updateProp('errorLevel')">
              <el-option v-for="l in errorLevels" :key="l.value" :label="l.label" :value="l.value" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 表格属性 -->
        <div v-if="element.type === 'table'" class="property-group">
          <div class="group-title">表格属性</div>
          <el-form-item label="行数">
            <el-input-number v-model="formData.rows" :min="1" :max="20" @change="handleRowsChange" />
          </el-form-item>
          <el-form-item label="列数">
            <el-input-number v-model="formData.cols" :min="1" :max="20" @change="handleColsChange" />
          </el-form-item>
          <el-form-item label="边框色">
            <el-color-picker v-model="formData.borderColor" @change="updateProp('borderColor')" />
          </el-form-item>
          <el-form-item label="边框宽">
            <el-input-number v-model="formData.borderWidth" :min="0" :max="10" @change="updateProp('borderWidth')" />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="formData.cellFontSize" :min="6" :max="72" @change="updateProp('cellFontSize')" />
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="formData.cellFontFamily" @change="updateProp('cellFontFamily')">
              <el-option v-for="f in fonts" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item label="字色">
            <el-color-picker v-model="formData.cellFontColor" @change="updateProp('cellFontColor')" />
          </el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="formData.cellTextAlign" @change="updateProp('cellTextAlign')">
              <el-option label="左对齐" value="left" />
              <el-option label="居中" value="center" />
              <el-option label="右对齐" value="right" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 表格单元格编辑 -->
        <div v-if="element.type === 'table'" class="property-group">
          <div class="group-title">单元格内容 <span class="hint">(双击画布中的单元格也可编辑)</span></div>
          <div class="cell-editor-grid">
            <div v-for="r in formData.rows" :key="r" class="cell-editor-row">
              <div v-for="c in formData.cols" :key="c" class="cell-editor-item">
                <el-input
                  :model-value="getCellText(r - 1, c - 1)"
                  size="small"
                  placeholder=""
                  @update:model-value="(val) => setCellText(r - 1, c - 1, val)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 外观预设 -->
        <div v-if="element" class="property-group">
          <div class="group-title">
            外观预设
            <span class="hint">(只覆盖外观，不改位置尺寸与旋转)</span>
          </div>
          <div class="preset-save-row">
            <el-input
              v-model="presetName"
              size="small"
              placeholder="预设名称"
              maxlength="20"
              @keyup.enter="savePreset"
            />
            <el-button
              size="small"
              type="primary"
              :disabled="!hasAppearance"
              @click="savePreset"
            >存为预设</el-button>
          </div>
          <div v-if="!hasAppearance" class="preset-tip">
            {{ typeLabel(element.type) }}元件没有可保存的外观项
          </div>
          <div v-if="presetStore.presets.length" class="preset-list">
            <div v-for="preset in presetStore.presets" :key="preset.id" class="preset-item">
              <span class="preset-name" :title="preset.name">{{ preset.name }}</span>
              <el-tag size="small" type="info" effect="plain">{{ typeLabel(preset.sourceType) }}</el-tag>
              <div class="preset-ops">
                <el-button size="small" link @click="applyPreset(preset)">套用</el-button>
                <el-button size="small" link @click="renamePreset(preset)">改名</el-button>
                <el-button size="small" link type="danger" @click="removePreset(preset)">移除</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无预设" :image-size="40" />
        </div>

        <!-- 操作按钮 -->
        <div class="property-group">
          <div class="group-title">元件对齐 <span class="hint">(Ctrl+点击多选后可用)</span></div>
          <div class="align-buttons">
              <el-button size="small" :disabled="!canAlign" @click="alignElements('left')">
                左对齐
              </el-button>
              <el-button size="small" :disabled="!canAlign" @click="alignElements('center-h')">
                水平居中
              </el-button>
              <el-button size="small" :disabled="!canAlign" @click="alignElements('right')">
                右对齐
              </el-button>
          </div>
          <el-divider />
          <div class="action-buttons">
            <el-button size="small" @click="duplicate">复制元件</el-button>
            <el-button size="small" type="danger" @click="remove">删除元件</el-button>
          </div>
        </div>
      </el-form>
    </div>
    <el-empty v-else description="请选择元件" :image-size="80" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { usePresetStore } from '@/stores/presets'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  typeLabel,
  fieldLabel,
  supportsAppearance,
  extractAppearance,
  planApply
} from '@/utils/appearancePresets'

const barcodeFormats = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' }
]

const errorLevels = [
  { value: 'L', label: '低 (7%)' },
  { value: 'M', label: '中 (15%)' },
  { value: 'Q', label: '较高 (25%)' },
  { value: 'H', label: '高 (30%)' }
]

const store = useCanvasStore()
const element = computed(() => store.selectedElement)
const canAlign = computed(() => store.selectedElementIds.length >= 2)
const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Microsoft YaHei', 'SimSun', 'SimHei']

// 计算最大值限制
const maxX = computed(() => element.value ? store.canvasPixelWidth - element.value.width : store.canvasPixelWidth)
const maxY = computed(() => element.value ? store.canvasPixelHeight - element.value.height : store.canvasPixelHeight)
const maxWidth = computed(() => element.value ? store.canvasPixelWidth - element.value.x : store.canvasPixelWidth)
const maxHeight = computed(() => element.value ? store.canvasPixelHeight - element.value.y : store.canvasPixelHeight)

const formData = reactive({
  x: 0, y: 0, width: 100, height: 40, rotation: 0,
  content: '', fontSize: 14, fontFamily: 'Arial', color: '#000000', bold: false, italic: false,
  fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 1,
  format: 'CODE128', showText: true, errorLevel: 'M',
  rows: 3, cols: 3, borderWidth: 1, borderColor: '#000000',
  cellFontSize: 12, cellFontFamily: 'Arial', cellFontColor: '#000000', cellTextAlign: 'center',
  cells: {}
})

watch(element, (el) => {
  if (el) {
    Object.keys(formData).forEach(key => {
      if (el[key] !== undefined) formData[key] = el[key]
    })
  }
}, { immediate: true, deep: true })

// ========== 外观预设 ==========
const presetStore = usePresetStore()
const presetName = ref('')
// 当前选中元件是否有可保存/套用的外观项
const hasAppearance = computed(() => !!element.value && supportsAppearance(element.value.type))

// 把当前元件的外观按名称保存为预设
const savePreset = () => {
  const el = element.value
  if (!el) {
    ElMessage.warning('请先选择元件')
    return
  }
  if (!supportsAppearance(el.type)) {
    ElMessage.warning(`${typeLabel(el.type)}元件没有可保存的外观项`)
    return
  }

  const { values } = extractAppearance(el)
  const result = presetStore.addPreset({
    name: presetName.value,
    sourceType: el.type,
    values
  })

  if (!result.ok) {
    // 名称为空 / 重名：说明是哪里不合要求，并定位到名称输入
    ElMessage.error(result.message)
    return
  }
  ElMessage.success(`预设“${result.preset.name}”已保存`)
  presetName.value = ''
}

// 一键套用预设：仅覆盖共有外观项，坐标/宽高/旋转保持不变
const applyPreset = (preset) => {
  const el = element.value
  if (!el) {
    ElMessage.warning('请先选择元件')
    return
  }

  const { updates, appliedKeys, skippedKeys } = planApply(preset, el.type)

  if (appliedKeys.length === 0) {
    // 双方没有任何共有外观项
    const skipped = skippedKeys.map(fieldLabel).join('、')
    ElMessage.warning(
      `「${preset.name}」是${typeLabel(preset.sourceType)}预设（含：${skipped}），` +
      `与${typeLabel(el.type)}元件没有可共用的外观项，未套用任何样式`
    )
    return
  }

  // 只更新外观字段，x/y/width/height/rotation 不在 updates 中
  store.updateElement(el.id, updates)
  Object.assign(formData, updates)

  const applied = appliedKeys.map(fieldLabel).join('、')
  if (skippedKeys.length > 0) {
    const skipped = skippedKeys.map(fieldLabel).join('、')
    ElMessage.warning(
      `已套用共有外观项：${applied}；「${preset.name}」中的 ${skipped} ` +
      `${typeLabel(el.type)}元件不支持，已跳过（位置、尺寸与旋转保持不变）`
    )
  } else {
    ElMessage.success(`已套用预设“${preset.name}”：${applied}（位置、尺寸与旋转保持不变）`)
  }
}

const renamePreset = async (preset) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新的预设名称', '预设改名', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValue: preset.name,
      inputValidator: (value) => {
        const name = (value || '').trim()
        if (!name) return '预设名称不能为空'
        const duplicated = presetStore.presets.some(p => p.id !== preset.id && p.name === name)
        if (duplicated) return `已存在名为“${name}”的预设，请换一个名称`
        return true
      }
    })
    const result = presetStore.renamePreset(preset.id, value)
    if (result.ok) ElMessage.success('已改名')
    else ElMessage.error(result.message)
  } catch {
    // 用户取消
  }
}

const removePreset = async (preset) => {
  try {
    await ElMessageBox.confirm(
      `确定移除预设“${preset.name}”吗？已套用该预设的元件不受影响。`,
      '移除预设',
      { confirmButtonText: '移除', cancelButtonText: '取消', type: 'warning' }
    )
    presetStore.removePreset(preset.id)
    ElMessage.success('已移除预设')
  } catch {
    // 用户取消
  }
}

const updateProp = (key) => {
  if (element.value) {
    let value = formData[key]
    // 确保不超出画布
    if (key === 'x') value = Math.min(value, store.canvasPixelWidth - element.value.width)
    if (key === 'y') value = Math.min(value, store.canvasPixelHeight - element.value.height)
    if (key === 'width') value = Math.min(value, store.canvasPixelWidth - element.value.x)
    if (key === 'height') value = Math.min(value, store.canvasPixelHeight - element.value.y)
    store.updateElement(element.value.id, { [key]: value })
  }
}

const handleImageUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    store.updateElement(element.value.id, { imageData: e.target.result })
    ElMessage.success('图片已上传')
  }
  reader.readAsDataURL(file.raw)
}

const getCellText = (row, col) => {
  const cells = formData.cells
  if (cells && cells[row] && cells[row][col] !== undefined) {
    return cells[row][col]
  }
  return ''
}

const setCellText = (row, col, text) => {
  const oldCells = formData.cells || {}
  const cells = {}
  for (const r in oldCells) {
    cells[r] = { ...oldCells[r] }
  }
  if (!cells[row]) cells[row] = {}
  cells[row][col] = text
  formData.cells = cells
  store.updateElement(element.value.id, { cells })
}

const rebuildCells = (newRows, newCols) => {
  const oldCells = formData.cells || {}
  const newCells = {}
  for (let r = 0; r < newRows; r++) {
    newCells[r] = {}
    for (let c = 0; c < newCols; c++) {
      if (oldCells[r] && oldCells[r][c] !== undefined) {
        newCells[r][c] = oldCells[r][c]
      }
    }
  }
  return newCells
}

const handleRowsChange = (val) => {
  const cells = rebuildCells(val, formData.cols)
  formData.cells = cells
  store.updateElement(element.value.id, { rows: val, cells })
}

const handleColsChange = (val) => {
  const cells = rebuildCells(formData.rows, val)
  formData.cells = cells
  store.updateElement(element.value.id, { cols: val, cells })
}

const alignElements = (type) => {
  store.alignElements(type)
  ElMessage.success('对齐完成')
}

const duplicate = () => {
  store.duplicateElement(element.value.id)
  ElMessage.success('已复制')
}

const remove = () => {
  store.deleteElement(element.value.id)
  ElMessage.success('已删除')
}
</script>

<style lang="scss" scoped>
.property-panel { width: 260px; display: flex; flex-direction: column; overflow: hidden; }
.property-content { flex: 1; overflow-y: auto; padding: 12px; }

.property-group {
  margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ebeef5;
  &:last-child { border-bottom: none; }
}

.group-title {
  font-size: 13px; font-weight: 600; color: #303133; margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
  .hint { font-size: 11px; font-weight: normal; color: #909399; }
}

:deep(.el-form-item) {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  .el-form-item__label { padding-right: 8px; font-size: 12px; }
  .el-form-item__content { flex: 1; }
}

:deep(.el-input-number) { width: 100%; }
:deep(.el-select) { width: 100%; }
:deep(.el-input) { width: 100%; }

.unit { margin-left: 4px; font-size: 12px; color: #909399; }

.image-preview {
  margin-top: 8px; padding: 8px; background: #f5f7fa; border-radius: 4px;
  img { max-width: 100%; max-height: 100px; display: block; margin: 0 auto; }
}

.align-buttons {
  display: flex; gap: 8px; justify-content: center;
}

.action-buttons {
  display: flex; gap: 8px; justify-content: center;
}

.preset-save-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.preset-tip {
  font-size: 11px;
  color: #e6a23c;
  margin-bottom: 8px;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: #f5f7fa;
  border-radius: 4px;

  .preset-name {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preset-ops {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    :deep(.el-button) {
      padding: 0 2px;
      height: auto;
      font-size: 12px;
    }
  }
}

.cell-editor-grid {
  max-height: 240px;
  overflow-y: auto;
}

.cell-editor-row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.cell-editor-item {
  flex: 1;
  min-width: 0;
}

.cell-editor-item :deep(.el-input) {
  width: 100%;
}

.cell-editor-item :deep(.el-input__inner) {
  padding: 0 4px;
  text-align: center;
}
</style>

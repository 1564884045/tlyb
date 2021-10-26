<template>
  <el-popover
    placement="bottom"
    width="200px"
    trigger="click"
    popper-class="inline-select-popover"
    v-model="visible">
    <p slot="reference"
      class="inline-select"
      :style="{width: typeof labelWidth === 'string' ? labelWidth : labelWidth + 'px'}">
      {{visibleValue}}
      <i class="inline-select-right el-icon-caret-bottom" :class="{'rotate-icon': visible}"/>
    </p>
    <ul class="inline-select-opreation">
      <li class="input-area">
        <el-form label-position="top" :model="range" inline>
          <el-form-item label="最小值" prop="min">
            <el-input
              v-model.number="range.min"
              :style="{width: '60px'}"
              type="number"
              @change="handleMinChange">
            </el-input>
          </el-form-item>
          <div style="display: inline-block; margin: 39px 8px 0px 8px;">~</div>
          <el-form-item label="最大值" prop="max">
            <el-input
              v-model.number="range.max"
              :style="{width: '60px'}"
              type="number"
              @change="handleMaxChange">
            </el-input>
          </el-form-item>
        </el-form>
      </li>
      <li class="lineWrapper"></li>
      <li class="btn-area">
        <el-button style="width: 67px;" @click="handleCancel">取消</el-button>
        <el-button type="primary" style="width: 67px;" @click="visible = false">确认</el-button>
      </li>
    </ul>
  </el-popover>
</template>

<script>
export default {
  name: 'InlineSelect',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    /** 默认显示的标签 */
    label: String,
    /** 加载状态 */
    loading: Boolean,
    /** 标签宽度 */
    labelWidth: {
      type: [String, Number],
      default: 'auto'
    }
  },
  computed: {
    visibleValue() {
      let effect = (this.value != null) && (this.value.length > 1) && (this.value[0] != null && this.value[1] != null)
      if (effect) {
        return this.value[0] + ' 至 ' + this.value[1] + '岁'
      }
      return this.label
    }
  },
  data() {
    return {
      visible: false,
      range: {
        min: undefined,
        max: undefined
      }
    }
  },
  watch: {
    value(val) {
      let effect = (val == null) && (val.length === 0) && (val[0] == null && val[1] == null)
      if (effect) {
        this.range.min = undefined
        this.range.max = undefined
      }
    }
  },
  methods: {
    handleMinChange(val) {
      if (val > 100) {
        this.range.min = 100
      } else if (val < 0) {
        this.range.min = 0
      }
      this.$emit('change', [this.range.min, this.range.max])
    },
    handleMaxChange(val) {
      if (val > 100) {
        this.range.max = 100
      } else if (val < 0) {
        this.range.max = 0
      } else if (this.range.min > val) {
        this.range.max = this.range.min
      }
      this.$emit('change', [this.range.min, this.range.max])
    },
    handleCancel() {
      this.range.min = undefined
      this.range.max = undefined
      this.$emit('change', [])
      this.visible = false
    }
  }
}
</script>

<style lang="stylus">
.inline-select
  display inline-block
  padding-right 26px
  cursor pointer
  box-sizing border-box
  position relative
  margin-right 20px
  .inline-select-right
    margin-left 6px
    position absolute
    right 6px
    top 3px
  .rotate-icon
    transform rotate(180deg)
  &:hover
    color $color-primary

.inline-select-opreation
  padding 0 10px
  li
    margin-bottom 10px
  li:last-child
    margin-bottom 0px
  .input-area
    padding 0px
    .el-form
      margin-bottom 0px
      .el-form-item
        margin-right 0px
        margin-bottom 0px
        text-align center
  .btn-area
    text-align center
.inline-select-popover
  min-width 100px
  padding 12px 0

.lineWrapper {
  margin 15px 0px
  width 100%
  height 2px
  border-bottom-style solid
  border-width 1px
  border-color #dedede
}
</style>

<style lang="stylus">
.el-form--label-top .el-form-item__label
  padding: 0px
</style>

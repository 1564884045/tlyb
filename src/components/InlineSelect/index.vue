<template>
  <el-popover
    v-model="visible"
    placement="bottom"
    :width="optionWidth"
    trigger="click"
    @show="$emit('show')"
    @hide="$emit('hide')"
    popper-class="inline-select-popover">
    <p slot="reference"
      class="inline-select"
      @mousemove="handleMouseover"
      @mouseleave="handleMouseout"
      :style="{width: typeof labelWidth === 'string' ? labelWidth : labelWidth + 'px'}">
      <template v-if="multiple">
        <template v-if="visibleValue.length > 0">
          <el-tag v-for="(item, index) in visibleValue" :key="index" size="mini" disable-transitions closable @close.stop="handleCloseTag(index)">{{item}}</el-tag>
        </template>
        <template v-else>
          {{label}}
        </template>
      </template>
      <template v-else>
        <span :class="{'color-primary': isSelected}">{{visibleValue}}</span>
      </template>
      <i v-show="!showClear" class="inline-select-right el-icon-caret-bottom" :class="{'rotate-icon': visible}"/>
      <i v-show="showClear" class="inline-select-right el-icon-circle-close" @click.stop="clearValue"/>
    </p>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <ul class="inline-select-options">
        <li class="search-input" v-if="filterable || remote">
          <el-input v-model="searchValue" @input="handleSearchChange" :maxlength="50" @keyup.enter="handleSearchChange" size="mini"/>
        </li>
        <li v-if="loading" class="tip-text">加载中...</li>
        <template v-else-if="visibleOptions.length > 0">
          <li v-for="item in visibleOptions" :key="item[valueAttr]"
            class="select-option"
            :class="{'selected-option': multiple ? value.includes(item[valueAttr]) : item[valueAttr] === value, 'disabled-option': item.disabled}"
            @click="select(item[valueAttr])">
            <slot name="option" :option="item" :selected="multiple ? value.includes(item[valueAttr]) : item[valueAttr] === value">
              {{item[labelAttr]}}
              <i class="inline-select-checked el-icon-check" v-if="multiple && value.includes(item[valueAttr])" />
            </slot>
          </li>
        </template>
        <li v-else class="tip-text">无匹配数据</li>
      </ul>
    </el-scrollbar>
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
    value: [Number, String, Array],
    /** 默认显示的标签 */
    label: String,
    /** 是否支持多选 */
    multiple: Boolean,
    /** 多选时用户最多可以选择的项目数，为 0 则不限制  */
    multipleLimit: Number,
    /** 是否可清除 */
    clearable: Boolean,
    /** 是否正在加载 */
    loading: Boolean,
    /** 是否可搜索 */
    filterable: Boolean,
    /**
     * 自定义搜索方法 返回值为可视的options
     */
    filterMethod: Function,
    /** 是否为远程搜索 */
    remote: Boolean,
    /**
     * 远程搜索方法
     * 必须是异步请求方法。比如Promise，resolve中返回可视的options
     */
    remoteMethod: Function,
    /**
     * 标识字段的属性
     */
    valueAttr: {
      type: String,
      default: 'value'
    },
    /**
     * 显示字段的属性
     */
    labelAttr: {
      type: String,
      default: 'label'
    },
    /**
     * 选项列表
     * valueAttr    选项值
     * labelAttr    显示标签
     * disabled     是否禁用
     */
    options: {
      type: Array,
      default: () => []
    },
    /** 标签宽度 */
    labelWidth: {
      type: [String, Number],
      default: 'auto'
    },
    /** 选项宽度 */
    optionWidth: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data() {
    return {
      visible: false,
      showClear: false,
      searchValue: '',
      visibleOptions: this.options
    }
  },
  computed: {
    isSelected() {
      // 单选，并且已选中
      if (!this.multiple) {
        const obj = this.options.find(o => o[this.valueAttr] === this.value)
        if (obj) return true
      }
      return false
    },
    visibleValue() {
      if (this.multiple) {
        const temp = []
        this.value.map(m => {
          const obj = this.options.find(n => n[this.valueAttr] === m)
          if (obj) {
            temp.push(obj[this.labelAttr])
          }
        })
        return temp
      } else {
        const obj = this.options.find(o => o[this.valueAttr] === this.value)
        if (obj) return obj[this.labelAttr]
        return this.label
      }
    }
  },
  methods: {
    handleMouseover() {
      if (!this.clearable) return
      if (this.value == null || this.value.length === 0) return
      this.showClear = true
    },
    handleMouseout() {
      if (!this.clearable) return
      this.showClear = false
    },
    /** 清空选中的值 */
    clearValue() {
      if (this.multiple) {
        this.$emit('change', [])
      } else {
        this.$emit('change', '')
      }
      this.showClear = false
    },
    /** 选择其中的一项 */
    select(value) {
      // 判断是否禁用
      const obj = this.options.find(o => o[this.valueAttr] === value)
      if (obj && obj.disabled) return

      if (this.multiple) {
        const temp = JSON.parse(JSON.stringify(this.value))
        const index = temp.findIndex(o => o === value)
        if (index > -1) {
          temp.splice(index, 1)
        } else {
          if (this.multipleLimit && temp.length >= this.multipleLimit) return
          temp.push(value)
        }
        this.$emit('change', temp)
      } else {
        this.$emit('change', value)
        this.visible = false
      }
    },
    /** 关闭标签 */
    handleCloseTag(index) {
      const temp = JSON.parse(JSON.stringify(this.value))
      temp.splice(index, 1)
      this.$emit('change', temp)
    },
    /** 搜索框的值发生变化 */
    async handleSearchChange() {
      if (!this.searchValue) {
        this.visibleOptions = this.options
        return
      }
      if (this.remote && this.remoteMethod) {
        try {
          this.visibleOptions = await this.remoteMethod()
        } catch (error) {
        }
      }
      if (this.filterMethod) {
        this.visibleOptions = this.filterMethod(this.searchValue)
        return
      }
      // 默认只通过label过滤
      this.visibleOptions = this.options.filter(m => m[this.labelAttr].includes(this.searchValue))
    }
  },
  watch: {
    options() {
      this.visibleOptions = this.options
    }
  }
}
</script>

<style lang="stylus">
.inline-select
  display inline-block
  // padding 6px 12px
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
  .el-tag
    &+.el-tag
      margin-left 8px

.inline-select-options
  margin 0
  padding 12px 0
  .select-option
    height 32px
    line-height 32px
    padding 0 12px
    text-align left
    cursor pointer
    no-wrap()
    &:hover
      color $color-primary
      background #f5f7fa
  .selected-option
    color $color-primary
    font-weight bold
  .disabled-option
    color $color-info
    cursor not-allowed
  .inline-select-checked
    float right
    color $color-primary
    line-height 32px
  .search-input
    padding 4px 12px
    .el-input__inner
      padding 0 6px
  .tip-text
    text-align center
    font-size 13px
    color $color-text-3
    line-height 32px

.inline-select-popover
  min-width 100px
  padding 0
  .scrollbar-wrapper
    margin-bottom -4px !important
    max-height 45vh
</style>

<template>
  <el-cascader
    style="width: 100%"
    :value="value"
    :props="areaProp"
    :options="areaList"
    :placeholder="placeholder"
    :clearable="clearable"
    :separator="separator"
    filterable
    @change="(val) => $emit('change', val)"
  >
  </el-cascader>
</template>

<script>
export default {
  name: 'AreaSelect',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Array,
    /**
     * 默认显示层级。
     */
    levels: {
      type: Number,
      default: 3
    },
    /** 详情看element官网Cascader组件说明 */
    props: Object,
    placeholder: {
      type: String,
      default: '请选择省市区'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    separator: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      areaList: require('./district.json')
    }
  },
  computed: {
    areaProp() {
      return {
        value: 'name',
        label: 'name',
        ...this.props
      }
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>

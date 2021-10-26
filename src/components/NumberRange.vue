<template lang="html">
    <div class="range-panel">
        <el-input-number v-model="range[0]" controls-position="right" :min="0" :max="99999" placeholder="最小值" class="range-min-value"></el-input-number>
        <p style="color: #aaa;" class="range-division">-</p>
        <el-input-number  v-model="range[1]" controls-position="right" :min="range[0] || 0" :max="99999" placeholder="最大值" class="range-max-value"></el-input-number>
    </div>
</template>
<script>
export default {
  name: 'NumberRange',
  model: {
    prop: 'range',
    event: 'rangeChange'
  },
  props: {
    range: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  watch: {
    range(val) {
      this.$emit('rangeChange', val)
    }
  }
}
</script>
<style lang="stylus" scoped>
.range-panel
  display flex
  .range-min-value
    width 45%
  .range-division
    width  10%
    text-align center
  .range-max-value
    width 45%
</style>

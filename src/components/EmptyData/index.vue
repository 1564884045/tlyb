<template>
  <div class="empty-panel">
   <div class="center">
      <img :src="require('@/assets/icon_no_data.svg')" alt="" @click="handleClick"/>
      <p v-html="tip" @click="handleClick"></p>
   </div>
  </div>
</template>

<script>
export default {
  props: {
    tip: {
      type: String,
      default: '暂无数据'
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="stylus" scoped>
.empty-panel
  width 100%
  height 100%
  padding 15px 15px
  display flex
  justify-content center
  align-items center
  .center
    text-align center
    img
      min-width 150px
      min-height 150px
    p
      color #bbbbbb
      font-size 14px
</style>

<template>
  <div class="empty-panel">
    <img class="empty-logo" alt="not allow" src="../../assets/loadingsource/circles.svg">
    <p>加载失败或暂无数据</p>
  </div>
</template>

<script>
export default {
  props: {},
  methods: {}
}
</script>

<style lang="stylus" scoped>
.empty-panel
  width 250px
  height 250px
  .empty-logo
    width 200px
  p
    color $color-text-3
    font-size 14px
</style>

<template>
  <div class="container" v-if="visible">
    <!-- （手机）弹窗模板 -->
    <div class="content">
      <!-- 正文 -->
      <div class="straight-matter">
        <slot></slot>
      </div>
    </div>
    <!-- 关闭窗口 -->
    <i class="el-icon-close shut" @click="closeDialog"></i>
  </div>
</template>

<script>
export default {
  name: 'CellphoneDialog',
  data() {
    return {}
  },
  props: {
    fatherMethod: {
      type: Function,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 关闭弹窗
    closeDialog() {
      if (this.fatherMethod) {
        this.fatherMethod()
      } else {
        this.$emit('update:visible', false)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  position fixed
  width 100vw
  height 100vh
  background-color rgba(0, 0, 0, 0.5)
  top 0
  left 0
  z-index 2002
  .content
    position absolute
    left 40%
    top 5%
    z-index 2003
    width 350px
    height 667px
    background-image url('../../assets/dialog/iphoneBorder.png')
    background-size 100% 100%
    background-color #ffffff
    border-radius 34px
    box-shadow 3px 3px 5px #eeeeee, -3px -3px 5px #eeeeee
  .shut
    color #ffffff
    font-size 24px
    position absolute
    top 5%
    right 35%
  .straight-matter
    width 94%
    margin 0 auto
    height 86%
    overflow-y auto
    margin-top 44px
</style>
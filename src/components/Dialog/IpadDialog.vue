<template>
  <div class="container" v-if="visible">
    <!-- （平板）弹窗模板 -->
    <div class="content">
      <!-- 正文 -->
      <div class="straight-matter">
        <slot></slot>
        <div :id="stylecss">sad</div>
      </div>
    </div>
    <!-- 关闭窗口 -->
    <i class="el-icon-close shut" @click="closeDialog"></i>
  </div>
</template>

<script>
export default {
  name: 'IpadDialog',
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
    },
    stylecss: {
      type: String,
      default: './css1.css'
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
<style src="./css1.css" scoped></style>
<style src="./css2.css" scoped></style>
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
    left 20%
    top 5%
    z-index 2003
    width 960px
    height 667px
    background-image url('../../assets/dialog/pad_bg.png')
    background-size 100% 100%
    background-color #ffffff
    border-radius 34px
    box-shadow 3px 3px 5px #eeeeee, -3px -3px 5px #eeeeee
  .shut
    color #ffffff
    font-size 34px
    position absolute
    right 15%
    top 5%
  .straight-matter
    width 88%
    margin 0 auto
    height 71%
    overflow-y auto
    margin-top 142px
</style>
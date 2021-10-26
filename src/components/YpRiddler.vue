<template>
  <!-- 滑动图片进行人及校验 -->
  <div id="cbox"></div>
</template>

<script>
import YpRiddler from 'YpRiddler'

export default {
  name: 'Ypriddler',
  props: {
    toMode: {
      type: String,
      default: function () {
        return 'dialog'
      }
    }
  },
  data() {
    return {
      passVerify: false
    }
  },
  mounted() {
    this.verifyUser()
  },
  methods: {
    // 滑块图片验证
    verifyUser() {
      let that = this
      // 初始化
      new YpRiddler({
        expired: 10,
        mode: that.toMode, // flat-直接嵌入，float-浮动，dialog-对话框，external-外置滑动
        winWidth: 300,
        lang: 'zh-cn', // 界面语言, 目前支持: 中文简体 zh-cn, 英语 en
        // langPack: LANG_OTHER, // 你可以通过该参数自定义语言包, 其优先级高于lang
        container: document.getElementById('cbox'),
        appId: 'c04f00b6011c40f1937695b0329b50ac',
        version: 'v1',
        onError: function (param) {
          if (!param.code) {
            that.$message({
              message: '错误请求',
              type: 'warning'
            })
          } else if (parseInt(param.code / 100) === 5) {
            // 服务不可用时，开发者可采取替代方案
            that.$message({
              message: '验证服务暂不可用',
              type: 'warning'
            })
          } else if (param.code === 429) {
            that.$message({
              message: '请求过于频繁，请稍后再试',
              type: 'warning'
            })
          } else if (param.code === 403) {
            that.$message({
              message: '请求受限，请稍后再试',
              type: 'warning'
            })
          } else if (param.code === 400) {
            that.$message({
              message: '非法请求，请检查参数',
              type: 'warning'
            })
          }
          // 异常回调
          console.error('验证服务异常')
        },
        onSuccess: function (validInfo, close, useDefaultSuccess) {
          // 成功回调
          that.passVerify = true
          that.$emit('toFatherData', that.passVerify)
          that.$emit('open', validInfo)
          // 验证成功默认样式
          useDefaultSuccess(true)
          // close()
        },
        onFail: function (code, msg, retry) {
          // 失败回调
          that.$message({
            message: '验证失败，请重试',
            type: 'warning'
          })
          retry()
        },
        beforeStart: function (next) {
          next()
        },
        onExit: function () {
          // 退出验证 （仅限dialog模式有效）
        }
      })
    }
  }
}
</script>

<style lang="stylus">
.yp-riddler-slider-trajectory
  background-color $color-primary !important
.yp-riddler-slider-btn, .yp-riddler-slider-btn-sign
  background-color $color-primary !important
  color #fff !important
.yp-riddler-slider-btn
  overflow hidden
</style>
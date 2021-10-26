<template>
  <el-dialog
    :visible="value"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    :show-close="false"
    width="320px"
    top="20vh"
    custom-class="wx-pay-dialog">
    <p slot="title" class="title">
      <img src="../../assets/wx_pay.png"/>
      {{title}}
      <i class="close-btn el-icon-close" @click="$emit('toggle', false)"/>
    </p>
    <div class="pay-con">
      <slot></slot>
      <qrcode v-if="codeUrl != null && codeUrl !== ''" :value="codeUrl" :options="{ width: 200, margin: 0 }"/>
      <a class="refresh" @click.prevent.stop="refreshCode">二维码失效？点击刷新</a>
      <el-button type="success" round plain style="width: 120px" :loading="submitLoading" @click="validatePayStatus">我已支付</el-button>
    </div>

  </el-dialog>
</template>

<script>
import QRCode from '../QRCode'

export default {
  name: 'WxPayDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    title: {
      type: String,
      default: '微信支付'
    },
    outTradeNo: {
      type: String,
      default: ''
    },
    codeUrl: {
      type: String,
      default: ''
    }
  },
  components: {
    [QRCode.name]: QRCode
  },
  data() {
    return {
      submitLoading: false
    }
  },
  methods: {
    refreshCode() {
      this.$emit('refresh')
    },
    validatePayStatus() {
      this.submitLoading = true
      this.$http.get('/v1/CommonOrder/getCommonOrderByOutTradeNo', {
        outTradeNo: this.outTradeNo
      }).then(res => {
        if (res.data == null) {
          this.$message.error('未查询到订单！请刷新后重试。')
          return
        }
        switch (res.data.payStatus) {
          case 0:
            this.$message.warning('您还没有支付！如有疑问，请联系管理员。')
            break
          case 1:
          case 3:
            this.$message.success('您已支付成功！')
            this.$emit('paySuccess')
            this.$emit('toggle', false)
            break
          case 2:
            this.$message.warning('您的支付已失效，请刷新二维码。')
            break
        }
      }).finally(() => {
        this.submitLoading = false
      })
    }
  }
}
</script>

<style lang="stylus">
.wx-pay-dialog
  overflow hidden
  text-align center
  .el-dialog__header
    padding 0
  .el-dialog__body
    padding 16px
    box-sizing border-box
  .title
    border-bottom 1px solid $color-border-2
    background $color-background
    font-size 16px
    font-weight bold
    color $color-text-1
    line-height 40px
    height 40px
    position relative
    img
      height 32px
      vertical-align middle
  .close-btn
    position absolute
    right 16px
    top 12px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .refresh
    display block
    color #4848d7
    font-size 13px
    margin-bottom 16px
</style>

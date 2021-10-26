<template>
  <el-dialog :visible="value" :close-on-click-modal="false" append-to-body destroy-on-close :show-close="false" width="320px" top="20vh" custom-class="wx-pay-dialog">
    <div class="pay-con">
      <i class="close-btn el-icon-close" @click="$emit('toggle', false)" />
      <div class="code-box">
        <div class="title-box">
          <p slot="title" class="title">
            <img style="width: 30px; height: 30px" :src="title === '微信支付' ? require('../../assets/wx_pay.png') : require('../../assets/icon_alipay.png') " />
            {{title === '微信支付' ? '微信支付' : '支付宝'}}
          </p>
        </div>
        <div class="pay-code" :class="title === '微信支付' ? 'vxpay-color' : 'zfbpay-color'">
          <slot></slot>
          <qrcode class="qrcode" v-if="codeUrl != null && codeUrl !== ''" :value="codeUrl" :options="{ width: 160, margin: 0 }" />
          <a class="refresh" @click.prevent.stop="refreshCode">二维码失效？点击刷新</a>
        </div>
      </div>
      <div class="btn">
        <el-button type="primary" round plain style="width: 120px" :loading="submitLoading" @click="validatePayStatus">我已支付</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import QRCode from '../QRCode'

export default {
  name: 'PayTypeDialog',
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
    // 支付成功
    validatePayStatus() {
      // this.$emit('showPayCodes', false)
      // window.location.reload()
      this.submitLoading = true
      this.$http
        .get(
          `/v1/CommonOrder/getCommonOrderByOutTradeNo?outTradeNo=${this.outTradeNo}`
        )
        .then((res) => {
          switch (res.data.payStatus) {
            // 0-待支付，1-已支付，2-已取消，3-已完成
            case 1:
              window.location.reload()
              break
            case 3:
              window.location.reload()
              break
            default:
              this.$notify({
                title: '支付失败',
                message: '订单未支付或者支付失败。若已支付请联系客服！',
                type: 'warning'
              })
              break
          }
        }).finally(() => {
          this.submitLoading = false
        })
    }
  }
}
</script>

<style scoped lang="stylus">
.vxpay-color
  background-color rgb(0, 188, 0)
.zfbpay-color
  background-color rgb(0, 140, 215)
.pay-con
  height 422px
  .pay-code
    padding 50px 0 20px 0
  .code-box
    border-radius 30px
    overflow hidden
    box-shadow 3px -3px 2px #eeeeee, -3px -3px 2px #eeeeee, -3px 3px 2px #eeeeee, 3px 3px 2px #eeeeee
  .title-box
    background-color rgb(248, 246, 247)
    padding 20px 0
    .title
      border none
      font-size 26px
  .qrcode
    padding 10px
    background-color #ffffff
  .refresh
    color #ffffff
    margin-top 15px
  .btn
    background-color #ffffff
    padding-top 14px
</style>

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
    right 4px
    top 4px
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

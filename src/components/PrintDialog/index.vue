<template>
  <el-dialog
    :visible="value"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    :show-close="false"
    width="840px"
    top="7vh"
    custom-class="print-dialog"
    @open="handleShowDialog">
    <p slot="title" class="title">{{title}}
      <i class="close-btn el-icon-close" @click="$emit('toggle', false)"/>
    </p>
    <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 100%;">
      <div class="tool-bar clearfix">
        <el-checkbox v-if="isShowDiscountCheckBox" v-model="isShowDiscount">优惠显示</el-checkbox>
        <el-button type="primary" @click="print" icon="el-icon-printer" class="print-btn">打印</el-button>
      </div>
      <small-ticket ref="printCon" class="print-con" :printConf="printConf" :orderInfo="orderInfo"></small-ticket>
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import SmallTicket from './smallTicket'

import print from './print'

export default {
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    title: {
      type: String,
      default: '收据打印'
    },
    orderInfo: Object
  },
  data() {
    return {
      isShowDiscount: false,
      isShowDiscountCheckBox: false,
      printConf: {
        id: null,
        logo: '',
        departmentName: '',
        phone: '',
        departmentAddress: '',
        wechatQrCode: '',
        studentQrFlg: 1,
        appendInfo: ''
      }
    }
  },
  components: {
    SmallTicket
  },
  methods: {
    _getPrintConf() {
      this.$http.get('/v1/PrintSetting/getPrintSettingByOrgId', {
        orgId: this.$store.getters.organizationInfo.id,
        depId: this.$store.getters.currentBranch.id
      }).then(res => {
        if (res.data) {
          for (const key in this.printConf) {
            if (res.data.hasOwnProperty(key)) {
              this.printConf[key] = res.data[key]
            }
          }

          sessionStorage.setItem('iTK_print_conf', JSON.stringify(this.printConf))
        } else {
          this.$message.error('您还未配置打印信息，请前往【基础设置】->【打印配置】配置打印信息')
        }
      })
    },
    print() {
      print(this.$refs.printCon.$el)
    },
    handleShowDialog() {
      let printTemp = sessionStorage.getItem('iTK_print_conf')
      if (printTemp) {
        this.printConf = JSON.parse(printTemp)
      } else {
        this._getPrintConf()
      }
    }
  },
  watch: {
    isShowDiscount() {
      // 取消是否显示优惠选项选择框
      this.$refs.printCon.isShowDiscount = this.isShowDiscount
    },
    value() {
      if (this.orderInfo) {
        this.orderInfo.courseList.forEach(item => {
          if ((Number(item.originPrice) - Number(item.price) !== 0) && item.price > 0) {
            this.isShowDiscountCheckBox = true
          }
        })
      }
    }
  }
}
</script>

<style lang="stylus">
.print-dialog
  overflow hidden
  height 86vh
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    font-size 14px
    font-weight bold
    color $color-text-1
    line-height 36px
    height 36px
    position relative
    no-wrap()
  .el-dialog__body
    padding 0
    height calc(100% - 38px)
    box-sizing border-box
  .close-btn
    position absolute
    right 16px
    top 10px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .scrollbar-wrapper
    padding 0 16px 12px 16px
    box-sizing border-box
  .tool-bar
    height 30px
    line-height 30px
    padding 12px 0
    border-bottom 1px solid $color-border-2
    margin-bottom 20px
    .print-btn
      font-size 13px
      padding 6px 12px
      float right
  .print-con
    border 1px solid $color-border-2
    margin 0 auto
    box-sizing border-box
</style>

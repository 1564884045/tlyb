<template>
  <!-- 小票打印 -->
  <div class="small-ticket">
    <p class="p_logo">
      <img v-if="printConf.logo" :src="printConf.logo" width="60%"/>
    </p>
    <p class="p_title">
      {{printConf.departmentName}}
    </p>
    <template v-if="orderInfo">
      <p class="p_cancel" v-if="orderInfo.valid === 0">已作废</p>
      <p class="p_label">订单号: {{orderInfo.outTradeNo}}</p>
      <p class="p_label">经办人: {{orderInfo.recommendUsername}}</p>
      <p class="p_label">缴费日期: {{orderInfo.payTime ? orderInfo.payTime.split(' ')[0] : ''}}</p>
      <p class="p_label">姓名: {{orderInfo.studentName}}</p>
      <template v-for="(item, index) in orderInfo.courseList">
        <div class="p_line" :key="'line1' + index"></div>
        <p class="p_label" :key="'signUpCourse' + index">{{orderInfo.orderType === 0 ? '购买课程: ' : '退课课程: '}}{{item.name || item.courseName}}</p>

        <p v-if="item.validTime || item.periodEndDate" class="p_label" :key="'validTo' + index">有效期至:
          <span v-if="item.valuationType !== 1">{{item.validTime.slice(0, 10)}}</span>
          <span v-else>{{item.periodEndDate.slice(0, 10)}}</span>
        </p>

        <p v-if="item.price > 0 || (item.periodPrice > 0)" class="p_label" :key="'numPayCourse' + index">购买课程:
          <span v-if="item.enableClassHour === 1">
            {{item.classHour}}课时
          </span>
          <span v-if="item.enableClassHour === 0">
            <span v-if="item.valuationType === 1">一期</span>
            <span v-if="item.valuationType === 2">{{item.timeCount}}{{item.enableClassHour ? '课时' : sendTimeType[item.timeType].date}}</span>
          </span>
        </p>

        <p v-if="(item.sendClassHour !== 0 || item.sendTimeCount !== 0) && (item.sendClassHour || item.sendTimeCount) && (item.price || (item.periodPrice > 0)) > 0" class="p_label" :key="'sendCourse' + index">赠送课程:
          <span v-if="item.enableClassHour === 1">
            {{item.sendClassHour}}课时
          </span>
          <span v-if="item.enableClassHour === 0">
            <span v-if="item.valuationType === 1">--</span>
            <span v-if="item.valuationType === 2">{{item.enableClassHour ? item.sendClassHour + '课时' : item.sendTimeCount + sendTimeType[item.sendTimeUnit].date}}</span>
          </span>
        </p>

        <p v-if="item.price > 0 || (item.periodPrice > 0)" class="p_label" :key="'courseAveragePrice' + index">课程均价: ￥
          <span v-if="item.enableClassHour === 1">{{(item.price/(item.classHour + item.sendClassHour)).toFixed(2)}} /课时</span>
          <span v-if="item.enableClassHour === 0">
            <span v-if="item.valuationType === 1">{{item.enableClassHour ? (item.price/(item.classHour + item.sendClassHour)).toFixed(2) + '/课时': item.price + '/期'}} </span>
            <span v-if="item.valuationType === 2">
              {{!item.enableClassHour
              ? (item.price / (
                item.timeCount * sendTimeType[item.timeType].time + item.sendClassHour * sendTimeType[item.sendTimeUnit].time
              )).toFixed(2) + '/天'
              : (item.price/(item.classHour + item.sendClassHour)).toFixed(2) + '/课时' || 0
              }}
            </span>
          </span>

        </p>

        <p v-if="item.price > 0 || (item.periodPrice > 0)" class="p_label" :key="'shouldPay' + index">应付金额: ￥{{item.originPrice || item.periodPrice}}</p>
        <p v-if="((item.originPrice - item.price !== 0) && item.price > 0) && isShowDiscount" class="p_label" :key="'discountPay' + index">优惠金额: ￥{{(item.originPrice - item.price) || (item.periodPrice - item.price)}}</p>
        <p class="p_label" :key="'realPay' + index">{{orderInfo.orderType === 0 ? '实付金额: ' : '退课金额: '}}￥{{item.price}}</p>
      </template>
      <template v-for="(item, index) in orderInfo.tuitionList">
        <div class="p_line" :key="'tuitionLine' + index"></div>
        <p class="p_label" :key="'tuition' + index">学杂: {{item.name || item.tuitionName}}</p>
        <p class="p_label" :key="'tuitionNum' + index">数量: {{item.tuitionNum}}</p>
        <p class="p_label" :key="'tuitionPrice' + index">价格: ￥{{item.price}}</p>
      </template>
      <div class="p_line p_mt16"><label>交费记录</label></div>
      <p class="p_label" style="font-weight: 900; text-align: right;">{{orderInfo.payTypeStr}} 支付</p>
      <p class="p_label"><span style="font-weight: 900;">合计:</span> ￥{{orderInfo.shouldTotalFee}}</p>
      <p class="p_label"><span style="font-weight: 900;">{{orderInfo.orderType === 0 ? '实收: ' : '实退: '}}</span> ￥{{orderInfo.totalFee}}</p>
    </template>
    <div class="p_line"></div>
    <p class="p_label">联系电话: {{printConf.phone}}</p>
    <p class="p_label" v-if="printConf.servicePhone">机构电话: {{printConf.servicePhone}} </p>
    <p class="p_label">地址: {{printConf.departmentAddress}}</p>
    <p class="p_label p_mt16" v-if="printConf.appendInfo">{{printConf.appendInfo}}</p>
    <p class="p_center p_mt8">
      <img v-if="printConf.wechatQrCode" :src="printConf.wechatQrCode" width="190px"/>
    </p>
    <p class="p_center" style="font-size: 12px;margin-top: 4px;" v-if="printConf.wechatQrCode">扫码关注我们</p>
    <div class="p_center p_mt8" v-if="printConf.studentQrFlg">
      <qrcode v-if="parentQrCode" :value="parentQrCode" tag="img" :options="{ width: 165, margin: 0 }"/>
    </div>
    <br/>
    <p class="p_center" style="font-size: 12px;margin-top: 4px;" v-if="orderInfo">扫码关注【{{orderInfo.studentName}}】</p>
    <br/>
    <p class="p_center" style="font-size: 12px;margin-top: 4px;">请在24小时内扫码绑定学员</p>
    <br/>
    <p class="p_center" style="font-size: 12px;margin-top: 4px;">请将小票放于平整处扫描</p>
  </div>
</template>

<script>
import QRCode from '../../components/QRCode'
import { mapGetters } from 'vuex'

export default {
  name: 'SmallTicket',
  data() {
    return {
      isShowDiscount: true,
      sendTimeType: [
        { date: '天', time: 1 },
        { date: '月', time: 30 },
        { date: '季度', time: 90 },
        { date: '半年', time: 180 },
        { date: '年', time: 365 }
      ]
    }
  },
  props: {
    printConf: Object,
    orderInfo: Object
  },
  components: {
    [QRCode.name]: QRCode
  },
  computed: {
    ...mapGetters([
      'organizationInfo'
    ]),
    parentQrCode() {
      if (this.orderInfo && this.orderInfo.studentId) {
        if (this.organizationInfo.openWechatDeploy === 1) {
          // todo 暂时先处理墨蕊阅读为单独的链接
          // if (this.organizationInfo.id === '3aabbf6b42bc4697b7facae1fbd7ec1b') {
          //   return `http://wechat.tlybond.com/parent/#/bindStudent/${
          //     this.orderInfo.studentId
          //   }?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
          // }
          return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${this.orderInfo.studentId}?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
        }
        return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${this.orderInfo.studentId}?_t=${Date.now()}`
      }
      return ''
    }
  }
}
</script>

<style lang="stylus">
.small-ticket
  width 210px
  box-sizing border-box
  padding 16px 12px
  font-family "黑体" !important
  color #000
  position relative
  .p_cancel
    font-size 20px
    padding 4px 12px
    border 1px solid #333
    position absolute
    top 40%
    left 50%
    transform translate(-50%, -50%) rotate(-45deg)
    z-index 999
  .p_logo
    line-height 1
    margin-bottom 6px
  .p_title
    font-size 17px
    text-align center
    line-height 1.2
    margin-bottom 20px
    img
      vertical-align middle
      margin-right 6px
  .p_label
    line-height 1.3
    font-size 13px
  .p_line
    border-top 1px dashed #000
    margin 10px 0
    text-align center
    line-height 1
    height 2px
    font-size 13px
    label
      display inline-block
      background #ffffff
      padding 0 6px
      transform translateY(-60%)
  .p_right
    float right
  .p_mt8
    margin-top 8px
  .p_mt16
    margin-top 16px
  .p_center
    text-align center

@media print
  body
    color #000
    background #fff
    margin 0
    font-weight bold
    font-family "黑体" !important
  .small-ticket
    padding-left 0
    padding-right 12px
</style>

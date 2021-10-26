<!-- 订单分析 -->
<template>
  <div class="container">
    <div class="query-form">
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="打卡开始日期"
        end-placeholder="打卡结束日期"
        value-format="yyyy-MM-dd"
        :clearable="false"
        :picker-options="pickerOptions"
        @change="query"
      >
      </el-date-picker>
      <el-button type="text" :disabled="!echartsLoading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
    </div>

    <!-- 总览统计 -->
    <div class="all-stat">
      <div class="item">
        <img :src="require('@/assets/icon_analyse_shouldTotalFee.png')" alt=""/>
        <div class="info">
          <p class="digital">{{String(allStat.shouldTotalFee.toFixed(2)).replace(/(\d)(?=(\d{3})+$)/g, "$1,")}}</p>
          <p class="title">应收总金额</p>
        </div>
      </div>
      <div class="item">
        <img :src="require('@/assets/icon_analyse_totalFee.png')" alt=""/>
        <div class="info">
          <p class="digital">{{String(allStat.totalFee.toFixed(2)).replace(/(\d)(?=(\d{3})+$)/g, "$1,")}}</p>
          <p class="title">实收总金额</p>
        </div>
      </div>
      <div class="item">
        <img :src="require('@/assets/icon_analyse_outputFee.png')" alt=""/>
        <div class="info">
          <p class="digital">{{String(Math.abs(allStat.outputFee).toFixed(2)).replace(/(\d)(?=(\d{3})+$)/g, "$1,")}}</p>
          <p class="title">支出总金额</p>
        </div>
      </div>
      <div class="item">
        <img :src="require('@/assets/icon_analyse_netIncome.png')" alt=""/>
        <div class="info">
          <p class="digital">{{String(allStat.netIncome.toFixed(2)).replace(/(\d)(?=(\d{3})+$)/g, "$1,")}}</p>
          <p class="title">净收总金额</p>
        </div>
      </div>
    </div>

    <div class="echart">
      <div class="barEchart">
        <div id="orderEchart" v-loading="echartsLoading"></div>
      </div>
      <div class="order-analysis" v-if="false">
        <div class="order-item" v-for="(item,index) in orderSortDataList" :key="index">
          <div class="order-icon"  :style="{backgroundColor: item.backgroundColor}">
            <img :src="item.icon" alt="">
          </div>
          <div class="order-info">
            <div>应收 <span class="color1"> {{item.shouldTotalFee}} </span> 元</div>
            <div>实收 <span class="color2"> {{item.totalFee}} </span> 元</div>
            <div>支出 <span class="color3"> {{Math.abs(item.outputFee)}} </span> 元</div>
            <div>利润 <span class="color4"> {{item.netIncome}} </span> 元</div>
          </div>
        </div>
      </div>
      <div class="pieEchart">
        <div class="pieEchart-item">
          <div class="item-title">应收订单金额</div>
          <div id="shouldTotalFeeCategoryEchart" v-loading="echartsLoading"></div>
        </div>
        <div class="pieEchart-item">
          <div class="item-title">实收订单金额</div>
          <div id="totalFeeCategoryEchart" v-loading="echartsLoading"></div>
        </div>
        <div class="pieEchart-item">
          <div class="item-title">支出订单金额</div>
          <div id="outputFeeCategoryEchart" v-loading="echartsLoading"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import echarts from 'echarts'
import { mapGetters } from 'vuex'
export default {
  name: 'OrderStatistics',
  data() {
    return {
      echartsLoading: false,
      queryForm: {
        dateRange: []
      },
      allStat: {
        shouldTotalFee: 0, // 应付订单总金额
        totalFee: 0, // 实收订单总金额
        outputFee: 0, // 支出订单总金额
        netIncome: 0 // 净收入订单总金额
      }, // 总的统计
      orderDataList: [], // 柱状图
      orderSortDataList: [],
      orderEchart: null, // 柱状图
      totalFeeCategoryEchart: null, // 饼状图:实付
      shouldTotalFeeCategoryEchart: null, // 饼状图：应收
      outputFeeCategoryEchart: null, // 饼状图： 支出
      pickerOptions: {
        disabledDate(time) {
          // 可选时间范围是当前时间到一年前的今天之间
          return time.getTime() > Date.now() || time < new Date().setFullYear(new Date().getFullYear() - 1)
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'weeks').toDate(), new Date()])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'months').toDate(), new Date()])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(3, 'months').toDate(), new Date()])
          }
        }]
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    this.queryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this._getOrderAnalyseInfo()
  },
  // 相关方法
  methods: {
    query() {
      this._getOrderAnalyseInfo()
    },
    reset() {
      this.queryForm = {
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      }
      this._getOrderAnalyseInfo()
    },
    // 获取订单数据进行绘制echart
    _getOrderAnalyseInfo() {
      this.echartsLoading = true
      this.allStat = {
        shouldTotalFee: 0, // 应付订单总金额
        totalFee: 0, // 实收订单总金额
        outputFee: 0, // 支出订单总金额
        netIncome: 0 // 净收入订单总金额
      }
      const params = {
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        startTime: this.queryForm.dateRange[0] + ' 00:00:00',
        endTime: this.queryForm.dateRange[1] + ' 23:59:59'
      }
      this.$http.get('/v1/Statistics/getOrderAnalyseInfoByTime', params).then((res) => {
        // 计算总额处理
        res.data.forEach(item => {
          this.allStat.shouldTotalFee += item.shouldTotalFee
          this.allStat.totalFee += item.totalFee
          this.allStat.outputFee += item.outputFee
          this.allStat.netIncome += item.netIncome
        })

        this.orderDataList = res.data // 柱形图
        // 柱状图
        this.orderDataList.forEach((item) => {
          switch (item.payType) {
            case 0:
              item.payTypeName = '微信'
              break
            case 1:
              item.payTypeName = '支付宝'
              break
            case 2:
              item.payTypeName = '现金'
              break
            case 3:
              item.payTypeName = '刷卡'
              break
            default:
              item.payTypeName = '微信'
          }
          return {
            payType: item.payTypeName, //
            netIncome: item.netIncome, // 净收入订单金额
            totalFee: item.totalFee, // 实收订单金额
            outputFee: item.outputFee, // 退费订单金额
            shouldTotalFee: item.shouldTotalFee // 应收订单金额
          }
        })
        // 对返回的数组按payType排序
        this.orderSortDataList = this.orderDataList.sort((a, b) => {
          return a.payType - b.payType
        })
        // 对排序完的数组添加color和icon属性，页面获取此数据进行渲染
        this.orderSortDataList.forEach((item) => {
          switch (item.payType) {
            case 0:
              item.backgroundColor = '#00cc52'
              item.icon = require('@/assets/icon_wechat_statics.png')
              break
            case 1:
              item.backgroundColor = '#00adf1'
              item.icon = require('@/assets/icon_alipay_statics.png')
              break
            case 2:
              item.backgroundColor = '#ffa200'
              item.icon = require('@/assets/icon_paycard.png')
              break
            case 3:
              item.backgroundColor = '#ff3541'
              item.icon = require('@/assets/icon_swipe.png')
              break
            default:
              item.backgroundColor = '#00cc52'
              item.icon = require('@/assets/icon_wechat_statics.png')
          }
        })
        // 柱状图
        this.orderEchart.setOption({
          dataset: {
            dimensions: ['payTypeName', 'netIncome', 'shouldTotalFee', 'totalFee', 'outputFee'],
            source: this.orderDataList
          },
          series: [
            {
              name: '利润',
              type: 'bar',
              YAxisIndex: '0',
              label: {
                show: true,
                position: 'inside'
              },
              color: '#00cc52'
            },
            {
              name: '应收',
              type: 'bar',
              YAxisIndex: '0',
              label: {
                show: true,
                position: 'inside'
              },
              color: '#00adf1'
            },
            {
              name: '实收',
              type: 'bar',
              YAxisIndex: '0',
              label: {
                show: true,
                position: 'inside'
              },
              color: '#ffa200'
            },
            {
              name: '支出',
              type: 'bar',
              YAxisIndex: '0',
              label: {
                show: true,
                position: 'inside'
              },
              color: '#ff3541'
            }
          ]
        })

        // 饼状图：实收
        let pieData = this.orderDataList.map((item) => {
          return {
            name: item.payTypeName,
            value: item.totalFee
          }
        })
        this.totalFeeCategoryEchart.setOption({
          series: [
            {
              type: 'pie',
              data: pieData,
              color: [ '#00cc52', '#00adf1', '#ffa200', '#ff3541' ]
            }
          ]
        })
        // 饼状图：应收订单
        let shouldTotalFeeData = this.orderDataList.map((item) => {
          return {
            name: item.payTypeName,
            value: item.shouldTotalFee
          }
        })
        this.shouldTotalFeeCategoryEchart.setOption({
          series: [
            {
              type: 'pie',
              data: shouldTotalFeeData,
              color: [ '#00cc52', '#00adf1', '#ffa200', '#ff3541' ]
            }
          ]
        })

        // 饼状图：支出
        let outPutFeeData = this.orderDataList.map((item) => {
          return {
            name: item.payTypeName,
            value: Math.abs(item.outputFee)
          }
        })
        this.outputFeeCategoryEchart.setOption({
          series: [
            {
              type: 'pie',
              data: outPutFeeData,
              color: [ '#00cc52', '#00adf1', '#ffa200', '#ff3541' ]
            }
          ]
        })
      }).finally(() => {
        this.echartsLoading = false
      })
    },
    // 初始化订单趋势：柱状图
    initOrderEchart() {
      this.orderEchart = echarts.init(document.getElementById('orderEchart'))
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          // data: ['利润', '支出', '收入']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            splitLine: { // y轴线
              lineStyle: {
                type: 'dashed',
                color: '#DDD'
              }
            },
            axisLine: {
              lineStyle: { // x轴
                type: 'solid',
                color: '#DDD',
                width: '1'
              }
            },
            axisLabel: {
              textStyle: { // x轴的字体颜色
                color: '#999'
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: { // y轴中间线
                type: 'solid',
                color: '#DDD',
                width: '1'
              }
            },
            axisLabel: {
              textStyle: { // y轴的字体颜色
                color: '#999'
              }
            }
          }
        ],
        series: [
          {
            name: '',
            type: 'bar',
            barWidth: 15,
            barMaxWidth: 30,
            stack: '总量',
            label: {
              show: true,
              position: 'inside'
            }
          }
        ]
      }
      this.orderEchart.setOption(option)
    },
    // 饼状图：实收
    initTotalFeePieEchart() {
      this.totalFeeCategoryEchart = echarts.init(document.getElementById('totalFeeCategoryEchart'))
      const option = {
        title: {
          // text: '实收订单金额',
          subtext: '',
          left: 'left',
          textStyle: {
            color: '#888'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: `{a} <br/>{b} : {c} ({d}%)`
        },
        legend: {
          orient: 'horizontal',
          left: 'right'
          // data: ['微信', '支付宝', '现金', '刷卡']
        },
        series: [
          {
            name: '实收统计',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['50%', '60%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.totalFeeCategoryEchart.setOption(option)
    },
    // 饼状图：应收
    initNetInComePieEchart() {
      this.shouldTotalFeeCategoryEchart = echarts.init(document.getElementById('shouldTotalFeeCategoryEchart'))
      const option = {
        title: {
          // text: '应收订单金额',
          subtext: '',
          left: 'left',
          textStyle: {
            color: '#888'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: `{a} <br/>{b} : {c} ({d}%)`
        },
        legend: {
          orient: 'horizontal',
          left: 'right'
          // data: ['微信', '支付宝', '现金', '刷卡']
        },
        series: [
          {
            name: '应收入订单统计',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['50%', '60%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.shouldTotalFeeCategoryEchart.setOption(option)
    },
    // 饼状图：支出
    initOutPutFeePieEchart() {
      this.outputFeeCategoryEchart = echarts.init(document.getElementById('outputFeeCategoryEchart'))
      const option = {
        title: {
          // text: '支出订单金额',
          subtext: '',
          left: 'left',
          textStyle: {
            color: '#888'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: `{a} <br/>{b} : {c} ({d}%)`
        },
        legend: {
          orient: 'horizontal',
          left: 'right'
          // data: ['微信', '支付宝', '现金', '刷卡']
        },
        series: [
          {
            name: '支出订单统计',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['50%', '60%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.outputFeeCategoryEchart.setOption(option)
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {
    this.initOrderEchart()
    this.initTotalFeePieEchart()
    this.initNetInComePieEchart()
    this.initOutPutFeePieEchart()
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo'
    ])
  }
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container {
  width 100%
  height 100%
}
.all-stat
  margin-bottom 14px
  display flex
  justify-content space-between
  flex-wrap nowrap
  .item
    width calc((100vw - 250px)/4)
    height 90px
    display flex
    border-radius 6px
    justify-content flex-start
    background-color #fff
    overflow hidden
    img
      width 80px
      height 80px
      margin 5px 0 0 10px
    .info
      width 100%
      margin-top 15px
      text-align center
      .digital
        color #888888
        font-size 25px
        margin-bottom 10px
        font-weight bold
      .title
        color #999999
        font-size 15px
    &:hover
      box-shadow 1px 2px 10px $color-border-1
.order-analysis
  margin-top 14px
  display flex
  justify-content space-between
  flex-wrap nowrap
  .order-item
    width calc((100vw - 250px)/4)
    display flex
    border-radius 6px
    justify-content flex-start
    background-color #fff
    overflow hidden
    &:hover
      box-shadow 1px 2px 10px $color-border-1
    .order-icon
      display flex
      justify-content center
      align-items center
      width 100px
      height 100%
      img
        width 60px
        height 60px
    .order-info
      margin 0 0 0 10px
      color #888
      font-size 12px
      div
        margin 6px auto
        span
          color orange
          font-size 18px
          font-weight bold
        .color1
          color #00adf1
        .color2
          color #ffa200
        .color3
          color #ff3541
        .color4
          color #00cc52

.echart
  padding 0px 6px 20px 0
  .barEchart
    background #ffffff
    #orderEchart
      width calc((100vw - 208px))
      padding 14px 0px
      height 454px
  .pieEchart
    display flex
    justify-content space-between
    padding 14px 0 0 0
    .pieEchart-item
      background #ffffff
      .item-title
        border-bottom 1px solid $color-border-3
        height 38px
        padding-left 14px
        line-height 38px
        color #888
      #totalFeeCategoryEchart
        width calc((100vw - 360px)/3)
        height 254px
        padding 14px 20px 0
      #shouldTotalFeeCategoryEchart
        height 254px
        width calc((100vw - 360px)/3)
        padding 14px 20px 0
      #outputFeeCategoryEchart
        height 254px
        width calc((100vw - 360px)/3)
        padding 14px 20px 0
  </style>

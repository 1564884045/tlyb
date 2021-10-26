<template>
  <div class="dashboard-wrapper">
    <el-row :gutter="15" class="banner-list">
      <el-col v-for="item in bannerList" :key="item.id" :span="24 / bannerList.length">
        <a target="_blank" :title="item.name" :href="item.articleUrl">
          <img :src="item.url" width="100%"/>
        </a>
      </el-col>
    </el-row>

    <p class="title">今日统计</p>
    <el-row :gutter="15" class="today-data">
      <el-col :span="6">
        <router-link tag="div" class="today-item" to="/executive/userSign">
          <p class="today-title">老师出勤</p>
          <div class="teacher-attendce">
            <p>实到<span class="color-success">{{todayData.realOnShcoolTeacherCount}}</span>人
            <span class="divider">/</span>应到<span class="color-primary">{{todayData.shouldOnShcoolTeacherCount}}</span>人</p>
            <el-progress :percentage="parseFloat((todayData.realOnShcoolTeacherCount / (todayData.shouldOnShcoolTeacherCount || 1) * 100).toFixed(2)) || 0" :stroke-width="8"></el-progress>
          </div>
        </router-link >
      </el-col>
      <el-col :span="6">
        <router-link tag="div" class="today-item" to='/classService/studentSign'>
          <p class="today-title">学员签到</p>
          <div class="student-sign">
            <div>
              <p>实到<span class="color-success">{{todayData.realOnShcoolStudentCount}}</span><span class="divider">/</span>
              应到<span class="color-primary">{{todayData.shouldOnShcoolStudentCount}}</span></p>
              <p>请假<span class="color-danger">{{todayData.applyLeaveStudentCount}}</span></p>
            </div>
            <div id="student-pie"></div>
          </div>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link tag="div" class="today-item" to='/educational/timetable'>
          <p class="today-title">课务情况</p>
          <ul class="class-service">
            <li><router-link to="/classService/classRecord">已上课数：<span class="color-success">{{todayData.passedCourseCount}}</span></router-link></li>
            <li><router-link to="/educational/timetable">应上课数：<span class="color-primary">{{todayData.todayCourseCount}}</span></router-link></li>
            <li><router-link to="/classService/preparation">布置作业：<span class="color-danger">{{todayData.homeworkCount}}</span>次</router-link></li>
            <li><router-link to="/classService/preparation">上传附件：<span class="color-warning">{{todayData.uploadAttachmentCount}}</span>次</router-link></li>
          </ul>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link tag="div" class="today-item" to='/executive/notificationRecord'>
          <p class="today-title">消息通知</p>
          <div class="notification-record">
            <ul>
              <li>微信通知：<span class="color-success">{{todayData.wechatSendCount}}</span></li>
              <li>短信通知：<span class="color-primary">{{todayData.smsSendCount}}</span></li>
            </ul>
            <div id="notification-pie"></div>
          </div>
        </router-link>
      </el-col>
    </el-row>

    <div class="shortcut-container" style="margin-bottom:0px;">
      <el-row :gutter="15">
        <el-col :span="12">
          <div class="wrapper" style="padding:0;background:#f5f7fa;">
            <p class="title">快捷入口</p>
            <el-row :gutter="16" class="shortcut-entrance">
              <el-col :span="8" v-for="(item, index) in shortcutEntrance" :key="item.name">
                <div v-if="index < shortcutEntrance.length / 2" class="shortcut-item" @click="handleShortcut(item)">
                  <img :src="item.icon" :alt="item.name"/>
                  <p>{{item.name}}</p>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="16" class="shortcut-entrance">
              <el-col :span="8" v-for="(item, index) in shortcutEntrance" :key="item.name">
                <div v-if="index >= (shortcutEntrance.length / 2)" class="shortcut-item" @click="handleShortcut(item)">
                  <img :src="item.icon" :alt="item.name"/>
                  <p>{{item.name}}</p>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
        <el-col :span="12">
          <p class="title">机构统计</p>
          <div class="stat-wrapper" v-loading="loadingTotal">
            <div class="grid-wrapper">
              <div class="grid-item">
                <router-link class="grid-content child1" tag="div" to="/educational/student">
                  <div class="total-icon">
                    <i class="el-icon-user"/>
                  </div>
                  <p class="total-numbers">{{totalData.studentCount || 0}}</p>
                  <p class="total-name">在读学员</p>
                </router-link>
              </div>
              <div class="grid-item">
                <router-link class="grid-content child2" tag="div" to="/educational/class">
                  <div class="total-icon">
                    <i class="el-icon-c-scale-to-original"/>
                  </div>
                  <p class="total-numbers">{{totalData.classCount}}</p>
                  <p class="total-name">开设班级</p>
                </router-link>
              </div>
            </div>
            <div class="grid-wrapper">
              <div class="grid-item">
                <router-link class="grid-content child3" tag="div" to="/sales/order">
                  <div class="total-icon">
                    <i class="el-icon-coin"/>
                  </div>
                  <p class="total-numbers">{{totalData.orderCount}}</p>
                  <p class="total-name">总订单数</p>
                </router-link>
              </div>
              <div class="grid-item">
                <router-link class="grid-content child4" tag="div" to="/sales/order">
                  <div class="total-icon">
                    <i class="el-icon-money"/>
                  </div>
                  <p class="total-numbers">{{totalData.realMoney}}</p>
                  <p class="total-name">订单总金额</p>
                </router-link>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="shortcut-container" style="height:">
      <el-row :gutter="15">
        <el-col :span="12">
          <div class="wrapper">
            <div class="potential-stat">
              <div class="trend-student-wrapper">
                <p class="title-no-border">新增潜客</p>
                <el-radio-group v-model="potRangeType" size="small" @change="_getPotTrendData">
                  <el-radio-button :label="0">最近一周</el-radio-button>
                  <el-radio-button :label="1">最近一月</el-radio-button>
                  <el-radio-button :label="2">上个月</el-radio-button>
                </el-radio-group>
              </div>
              <div id="potTrendChart" v-loading="loadingPotTrend"></div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="wrapper">
            <div class="potential-stat">
              <div class="trend-student-wrapper">
                <p class="title-no-border">新增学员</p>
                <el-radio-group v-model="stuRangeType" size="small" @change="_getStuTrendData">
                  <el-radio-button :label="0">最近一周</el-radio-button>
                  <el-radio-button :label="1">最近一月</el-radio-button>
                  <el-radio-button :label="2">上个月</el-radio-button>
                </el-radio-group>
              </div>
              <div id="stuTrendChart" v-loading="loadingStuTrend"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="chart-block">
      <div class="line-chart">
        <div class="title-no-border trend-title">
          <inline-select
            v-model="trendType"
            :options="trendTypeList"
            :loading="loadingTrend"
            @change="_getTrendData"
            label="趋势图">
          </inline-select>
          <el-radio-group v-model="rangeType" size="small" @change="_getTrendData">
            <!-- <el-radio-button :label="0">最近一周</el-radio-button> -->
            <el-radio-button :label="1">最近一月</el-radio-button>
            <el-radio-button :label="2">上个月</el-radio-button>
          </el-radio-group>
        </div>
        <div id="trendChart" v-loading="loadingTrend"></div>
      </div>
    </div>
  </div>
</template>

<script>
import InlineSelect from '@/components/InlineSelect'

import echarts from 'echarts'
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      loadingTrend: false,
      loadingTotal: false,
      bannerList: [], // 顶部Banner列表
      shortcutEntrance: [
        {
          name: '新生报名',
          icon: require('../assets/shortcut/xinshengbaoming.png'),
          linkUrl: '/educational/studentEnroll'
        },
        {
          name: '快速排课',
          icon: require('../assets/shortcut/kuaisupaike.png'),
          linkUrl: '/educational/timetable'
        },
        {
          name: '潜客登记',
          icon: require('../assets/shortcut/qiankedengji.png'),
          linkUrl: '/sales/potential'
        },
        {
          name: '课表查看',
          icon: require('../assets/shortcut/kebiaochakan.png'),
          linkUrl: '/educational/timetable'
        },
        {
          name: '订单管理',
          icon: require('../assets/shortcut/dingdanguanli.png'),
          linkUrl: '/sales/order'
        },
        {
          name: '老师备课',
          icon: require('../assets/shortcut/laoshibeike.png'),
          linkUrl: '/classService/preparation'
        }
      ], // 快捷入口列表
      todayData: {
        realOnShcoolTeacherCount: 0, // 实到老师
        shouldOnShcoolTeacherCount: 0, // 应到老师
        applyLeaveStudentCount: 0, // 请假学员
        realOnShcoolStudentCount: 0, // 实到学员
        shouldOnShcoolStudentCount: 0, // 应到学员
        smsSendCount: 0, // 发送短信数
        wechatSendCount: 0, // 微信消息数
        passedCourseCount: 0, // 已上课
        todayCourseCount: 0, // 今日课程数
        uploadAttachmentCount: 0, // 上传附件数
        homeworkCount: 0 // 布置作业数
      }, // 今日数据
      stuRangeType: 1, // 学员趋势类型-(1-默认一个月)
      loadingStuTrend: false, // 加载学员趋势标识
      potRangeType: 1, // 潜客趋势类型-(1-默认一个月)
      loadingPotTrend: false, // 加载潜客趋势标识
      trendType: 2,
      rangeType: 1,
      trendTypeList: [
        {
          value: 2,
          label: '订单收入'
        }
      ],
      totalData: {
        classCount: 0,
        orderCount: 0,
        realMoney: 0,
        studentCount: 0
      }
    }
  },
  components: {
    InlineSelect
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  mounted() {
    this.initStuTrendChart()
    this.initPotTrendChart()
    this.initTrendChart()
    this.initStudentPieChart()
    this.initNotificationChart()

    this._getBannerList()
    this._getStuTrendData()
    this._getPotTrendData()
    this._getTrendData()
    this._getTotalData()
    this._getTodayData()
  },
  methods: {
    // 指引手册下一步、
    next() {
      this.guideInfo.active++
      this.guideInfo.disabledLast = false
      if (this.guideInfo.active > 2) this.guideInfo.disabledNext = true
    },
    // 指引手册上一步、
    last() {
      this.guideInfo.active--
      this.guideInfo.disabledNext = false
      if (this.guideInfo.active < 1) this.guideInfo.disabledLast = true
    },
    // 获取banner列表
    _getBannerList() {
      this.$http.get('/v1/Banner/getBannerList', {
        status: 1,
        pageSize: 4
      }).then(res => {
        this.bannerList = res.data
      })
    },
    // 获取学员趋势数据
    _getStuTrendData() {
      const params = {
        organizationId: this.organizationInfo.id,
        type: 0
      }
      switch (this.stuRangeType) {
        case 0:
          params.startTime = moment().subtract(6, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 1:
          params.startTime = moment().subtract(30, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 2:
          params.startTime = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
          params.endTime = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
          break
      }
      this.loadingStuTrend = true
      // 新增学员
      this.$http.get('/v1/Statistics/getStudentIncrementCount', params).then(res => {
        const data = []
        const current = moment(params.startTime)
        while (current.isBefore(params.endTime)) {
          const temp = {
            time: current.format('MM-DD'),
            count: 0
            // count: Math.round(Math.random() * 100)
          }
          const find = res.data.find(o => moment(o.time.split(' ')[0]).format('MM-DD') === temp.time)
          if (find) {
            temp.count = find.count
          }
          data.push(temp)
          current.add(1, 'days')
        }
        this.stuTrendChart.setOption({
          dataset: {
            dimensions: ['time', 'count'],
            source: data
          },
          series: [
            {
              name: '学员数量'
            }
          ]
        })
      })
      this.loadingStuTrend = false
    },
    // 获取潜客趋势数据
    _getPotTrendData() {
      const params = {
        organizationId: this.organizationInfo.id,
        type: 0
      }
      switch (this.potRangeType) {
        case 0:
          params.startTime = moment().subtract(6, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 1:
          params.startTime = moment().subtract(30, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 2:
          params.startTime = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
          params.endTime = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
          break
      }
      this.loadingPotTrend = true
      this.$http.get('/v1/Statistics/getPotentialCustomerCount', params).then(res => {
        const data = []
        const current = moment(params.startTime)
        while (current.isBefore(params.endTime)) {
          const temp = {
            time: current.format('MM-DD'),
            count: 0
            // count: Math.round(Math.random() * 100)
          }
          const find = res.data.find(o => moment(o.time.split(' ')[0]).format('MM-DD') === temp.time)
          if (find) {
            temp.count = find.count
          }
          data.push(temp)
          current.add(1, 'days')
        }
        this.potTrendChart.setOption({
          dataset: {
            dimensions: ['time', 'count'],
            source: data
          },
          series: [
            {
              name: '潜客数量'
            }
          ]
        })
      })
      this.loadingPotTrend = false
    },
    // 获取潜客、订单趋势数据
    _getTrendData() {
      const params = {
        organizationId: this.organizationInfo.id,
        type: 0
      }
      switch (this.rangeType) {
        case 0:
          params.startTime = moment().subtract(6, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 1:
          params.startTime = moment().subtract(30, 'days').format('YYYY-MM-DD') + ' 00:00:00'
          params.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
          break
        case 2:
          params.startTime = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
          params.endTime = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
          break
      }
      this.loadingTrend = true

      switch (this.trendType) {
        case 0:
          // 新增学员
          this.$http.get('/v1/Statistics/getStudentIncrementCount', params).then(res => {
            const data = []
            const current = moment(params.startTime)
            while (current.isBefore(params.endTime)) {
              const temp = {
                time: current.format('YYYY-MM-DD'),
                count: 0
              }
              const find = res.data.find(o => o.time.split(' ')[0] === temp.time)
              if (find) {
                temp.count = find.count
              }
              data.push(temp)
              current.add(1, 'days')
            }
            this.trendChart.setOption({
              grid: {
                left: '2%'
              },
              dataset: {
                dimensions: ['time', 'count'],
                source: data
              },
              series: [
                {
                  name: '学员数量'
                }
              ]
            })
          })
          this.loadingTrend = false
          break
        case 1:
          // 新增潜客
          this.$http.get('/v1/Statistics/getPotentialCustomerCount', params).then(res => {
            const data = []
            const current = moment(params.startTime)
            while (current.isBefore(params.endTime)) {
              const temp = {
                time: current.format('YYYY-MM-DD'),
                count: 0
              }
              const find = res.data.find(o => o.time.split(' ')[0] === temp.time)
              if (find) {
                temp.count = find.count
              }
              data.push(temp)
              current.add(1, 'days')
            }
            this.trendChart.setOption({
              grid: {
                left: '2%'
              },
              dataset: {
                dimensions: ['time', 'count'],
                source: data
              },
              series: [
                {
                  name: '潜客数量'
                }
              ]
            })
          }).finally(() => {
            this.loadingTrend = false
          })
          break
        case 2:
          // 订单收入
          this.$http.get('/v1/Statistics/getStatisticsOrderData', params).then(res => {
            const data = []
            const current = moment(params.startTime)
            while (current.isBefore(params.endTime)) {
              const temp = {
                time: current.format('YYYY-MM-DD'),
                realMoney: 0,
                virtualMoney: 0
              }
              const find = res.data.find(o => o.time.split(' ')[0] === temp.time)
              if (find) {
                temp.realMoney = find.realMoney
                temp.virtualMoney = find.virtualMoney
              }
              data.push(temp)
              current.add(1, 'days')
            }
            this.trendChart.setOption({
              grid: {
                left: '6%'
              },
              dataset: {
                dimensions: ['time', 'realMoney'],
                source: data
              },
              series: [
                {
                  name: '实收金额'
                }
              ]
            })
          }).finally(() => {
            this.loadingTrend = false
          })
          break
      }
    },
    // 获取总计数据
    _getTotalData() {
      this.loadingTotal = true
      this.$http.get('/v1/Statistics/getBasicData', {
        organizationId: this.organizationInfo.id
      }).then(res => {
        if (res.data) {
          this.totalData = res.data
        }
      }).finally(() => {
        this.loadingTotal = false
      })
    },
    // 获取今日数据
    _getTodayData() {
      this.$http.get('/v1/Statistics/getDashboardEducationStatistics', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        startTime: moment().format('YYYY-MM-DD') + ' 00:00:00',
        endTime: moment().format('YYYY-MM-DD') + ' 23:59:59'
      }).then(res => {
        this.todayData = res.data

        this.studentChart.setOption({
          series: {
            data: [
              { value: res.data.realOnShcoolStudentCount, name: '到课' },
              { value: res.data.applyLeaveStudentCount, name: '请假' },
              { value: res.data.shouldOnShcoolStudentCount - res.data.realOnShcoolStudentCount - res.data.applyLeaveStudentCount, name: '其他' }
            ]
          }
        })

        this.notificationChart.setOption({
          series: {
            data: [
              { value: res.data.wechatSendCount, name: '微信通知' },
              { value: res.data.smsSendCount, name: '短信通知' }
            ]
          }
        })
      })
    },
    // 点击快捷方式
    handleShortcut(item) {
      if (item.linkUrl === '') {
        this.$message.info('功能马上完成，敬请期待~')
        return
      }
      switch (item.name) {
        case '快速排课':
          // 携带参数
          sessionStorage.setItem('quickSchedule', 1)
          this.$router.push(item.linkUrl)
          break
        default:
          // 默认直接跳转
          this.$router.push(item.linkUrl)
          break
      }
    },
    // 初始化潜客、订单趋势图
    initTrendChart() {
      this.trendChart = echarts.init(document.getElementById('trendChart'))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: '5%',
          left: '6%',
          right: '0%',
          bottom: '10%'
        },
        xAxis: [{
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          splitNumber: 4,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#333'
            }
          },
          nameTextStyle: {
            color: '#999'
          },
          splitArea: {
            show: false
          }
        }],
        series: [{
          name: '潜客数量',
          type: 'line',
          lineStyle: {
            normal: {
              width: 3,
              color: {
                type: 'linear',

                colorStops: [{
                  offset: 0,
                  color: '#A9F387' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#48D8BF' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
              },
              shadowColor: 'rgba(72,216,191, 0.3)',
              shadowBlur: 10,
              shadowOffsetY: 20
            }
          },
          itemStyle: {
            normal: {
              color: '#fff',
              borderWidth: 5,
              borderColor: '#A9F387'
            }
          },
          smooth: true
        }]
      }

      this.trendChart.setOption(option)
    },
    // 初始化学员新增趋势图标
    initStuTrendChart() {
      this.stuTrendChart = echarts.init(document.getElementById('stuTrendChart'))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: [{
          top: '5%',
          left: '8%',
          right: '0%',
          bottom: '10%'
        }],
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            rotate: 20
          }
        }],
        yAxis: [{
          type: 'value',
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#999'
            }
          },
          nameTextStyle: {
            color: '#999'
          },
          splitArea: {
            show: false
          }
        }],
        series: [{
          name: '学员数量',
          type: 'bar',
          barWidth: 15,
          barMaxWidth: 30,
          // showBackground: true,
          itemStyle: {
            normal: {
              color: '#409EFF',
              borderColor: '#409EFF'
            }
          }
        }]
      }

      this.stuTrendChart.setOption(option)
    },
    // 初始化潜客新增趋势图标
    initPotTrendChart() {
      this.potTrendChart = echarts.init(document.getElementById('potTrendChart'))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: [{
          top: '5%',
          left: '8%',
          right: '0%',
          bottom: '10%'
        }],
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            rotate: 20
          }
        }],
        yAxis: [{
          type: 'value',
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#999'
            }
          },
          nameTextStyle: {
            color: '#999'
          },
          splitArea: {
            show: false
          }
        }],
        series: [{
          name: '潜客数量',
          type: 'bar',
          // showBackground: true,
          barWidth: 15,
          barMaxWidth: 30,
          itemStyle: {
            normal: {
              color: '#14B7D0',
              borderColor: '#14B7D0'
            }
          }
        }]
      }

      this.potTrendChart.setOption(option)
    },
    // 初始化学生饼图
    initStudentPieChart() {
      this.studentChart = echarts.init(document.getElementById('student-pie'))
      const option = {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        color: ['#00d488', '#f1bb4c', '#3bafff'],
        series: [
          {
            name: '学员签到',
            type: 'pie',
            radius: ['60%', '90%'],
            avoidLabelOverlap: false,
            hoverOffset: 3,
            selectedOffset: 3,
            label: {
              show: false
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: 335, name: '到课' },
              { value: 310, name: '请假' },
              { value: 234, name: '其他' }
            ]
          }
        ]
      }
      this.studentChart.setOption(option)
    },
    // 初始化消息饼图
    initNotificationChart() {
      this.notificationChart = echarts.init(document.getElementById('notification-pie'))
      const option = {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        color: ['#00d488', '#f1bb4c'],
        series: [
          {
            name: '消息通知',
            type: 'pie',
            radius: '90%',
            avoidLabelOverlap: false,
            hoverOffset: 3,
            selectedOffset: 3,
            label: {
              show: false
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: 335, name: '微信通知' },
              { value: 310, name: '短信通知' }
            ]
          }
        ]
      }
      this.notificationChart.setOption(option)
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  position relative
  height 36px
  line-height 36px
  border-bottom 1px solid $color-border-1
  font-size 14px
  margin-top 16px
  margin-bottom 12px
  font-weight bold
  &:before
    font-family "iconfont"
    font-style normal
    -webkit-font-smoothing antialiased
    content "\E7B0"
    font-size 24px
    color $color-primary
    float left
    margin-left -6px
.title-no-border
  position relative
  height 36px
  line-height 36px
  font-size 14px
  margin-bottom 12px
  font-weight bold
  &:before
    font-family "iconfont"
    font-style normal
    -webkit-font-smoothing antialiased
    content "\E7B0"
    font-size 24px
    color $color-primary
    float left
    margin-left -6px

// 新增学员
.trend-student-wrapper
  display flex
  justify-content space-between
  align-items center

.trend-title
  margin 0
  height 44px
  line-height 44px
  .el-radio-group
    float right
    margin-top 6px

.banner-list
  margin-left 0 !important
  margin-right 0 !important
  overflow hidden
  width 100%
  margin-bottom 16px
  img
    vertical-align top
.shortcut-container
  margin-bottom 10px
  .wrapper
    height 300px
    margin-top 5px
    padding-left 5px
    padding-right 5px
    background-color #fff
    border-radius 3px
    .shortcut-entrance
      .shortcut-item
        height 120px
        margin-bottom 10px
        padding 12px 16px
        background #fff
        border-top-left-radius 3px
        border-top-right-radius 3px
        display flex
        align-items center
        justify-content center
        cursor pointer
        border-bottom 2px solid #ffbd0c
        border-radius 3px
        box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
        &:hover
          box-shadow 3px 3px 6px lighten(#ffbd0c, 25)
      .el-col:nth-child(2) .shortcut-item
        border-color #3dd23f
        &:hover
          box-shadow 3px 3px 6px lighten(#3dd23f, 25)
      .el-col:nth-child(3) .shortcut-item
        border-color #FF7E00
        &:hover
          box-shadow 3px 3px 6px lighten(#FF7E00, 25)
      .el-col:nth-child(4) .shortcut-item
        border-color #1082FF
        &:hover
          box-shadow 3px 3px 6px lighten(#1082FF, 25)
      .el-col:nth-child(5) .shortcut-item
        border-color #FF7E00
        &:hover
          box-shadow 3px 3px 6px lighten(#FF7E00, 25)
      img
        display inline-block
        width 50px
        height 50px
        margin-right 6px
    .potential-stat
      height 300px

.today-data
  margin-bottom 5px
  .today-item
    background #fff
    height 140px
    border-radius 3px
    cursor pointer
    position relative
    .today-title
      height 36px
      line-height 36px
      padding 0 16px
      border-bottom 1px solid $color-border-3
    &>div, &>ul
      padding 12px 16px
    &:hover
      box-shadow 1px 2px 10px $color-border-1
      .today-title
        color $color-primary
// 老师考勤
.teacher-attendce
  text-align center
  p
    margin-top 14px
    margin-bottom 16px
    span
      font-size 18px
      margin 0 6px
  .divider
    margin 0 16px
// 学员签到
.student-sign
  display flex
  justify-content space-between
  align-items center
  p
    &+p
      margin-top 12px
    span
      font-size 18px
      margin-left 3px
  .divider
    margin 0 6px
#student-pie
  width 80px
  height 80px
  flex-shrink 0
// 课务情况
.class-service
  display flex
  flex-wrap wrap
  li
    flex-shrink 0
    width 50%
    margin-top 12px
    color $color-text-1
    no-wrap()
    a:hover, a:visited, a:link, a:active
      color $color-text-1
    a:hover
      text-decoration underline
  span
    font-size 18px
    margin-right 4px
// 消息通知
.notification-record
  display flex
  justify-content space-between
  align-items center
  li+li
    margin-top 12px
  span
    font-size 18px
    margin-right 4px
#notification-pie
  width 80px
  height 80px
  flex-shrink 0

.chart-block
  display flex
  align-items flex-start
  .line-chart
    flex-shrink 1
    width 100%
    background #ffffff
    padding 0 16px
#trendChart
  height 454px
#stuTrendChart
  height 240px
  margin 0 10px
#potTrendChart
  height 240px
  margin 0 10px
  div
    width 500px
    height 100%
.stat-wrapper
  height 300px
  margin-top 5px
.grid-wrapper
  display flex
  align-items center
  justify-content space-between
  .grid-content
    transition-duration .28s
    padding 16px
    height 145px
    background-color #fff
    border-radius 3px
    box-sizing border-box
    z-index 3
    cursor pointer
    &:hover
      transform scale(1.03)
      box-shadow 0 0 8px $color-border-2
      border-radius 5px
  .grid-item
    width 50%
    .child1
      margin-bottom 10px
      margin-right 7px
      border-right-width 1px
      .grid-content
        border-top-left-radius 5px
      .total-icon
        background rgba($color-success, 0.2)
        color $color-success
    .child2
      margin-bottom 10px
      margin-left 7px
      border-right-width 0
      .grid-content
        border-top-right-radius 5px
      .total-icon
        background rgba($color-primary-dark, 0.2)
        color $color-primary-dark
    .child3
      margin-right 7px
      border-bottom-width 0
      .grid-content
        border-bottom-left-radius 5px
      .total-icon
        background rgba($color-danger, 0.2)
        color $color-danger
    .child4
      margin-left 7px
      border-right-width 0
      border-bottom-width 0
      .grid-content
        border-bottom-right-radius 5px
      .total-icon
        background rgba($color-primary, 0.2)
        color $color-primary
  .total-icon
    width 50px
    height 50px
    line-height 50px
    text-align center
    margin 0 auto
    font-size 30px
    border-radius 50%
  .total-numbers
    font-size 21px
    font-weight bold
    color $color-text-2
    text-align center
    margin-top 12px
  .total-name
    font-size 14px
    color $color-text-3
    text-align center
    margin-top 8px
.el-header
    margin-bottom 20px
.guideTitle
  text-align center
  font-size 36px
  padding 0
  margin 0
.guideStep
  text-align right
  padding 18px
  buttom
    margin-left 18px
.guideContent
  background-color rgb(222,222,222)
  color black
  padding 10px
  max-height 40vh
  overflow-y auto
  h2
    text-align center
    font-size 28px
  p
    font-size 24px
    text-indent 2em
    line-height 36px
</style>

<style lang="stylus">
.dashboard-wrapper
  margin-left 10px !important
  margin-right 10px !important
  padding 0 !important
  .inline-select .inline-select-right
    top 15px
</style>
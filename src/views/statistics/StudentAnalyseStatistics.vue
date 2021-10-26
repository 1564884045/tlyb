<!-- 学员分析 -->
<template>
  <div class="container">
    <div class="query-form">
      <el-date-picker
        v-model="dateRange"
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
      ></el-date-picker>
      <el-button type="text" :disabled="!analyseLoading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
    </div>
    <div class="student-sex">
      <div class="sex-box">
        <div class="box-left"><img src="../../assets/student-sum.png" alt="图片加载中"></div>
        <div class="box-right">
          <p> {{ studentSum }} 人</p>
          <span>总数</span>
        </div>
      </div>
        <div class="sex-box" v-for="item in studentsSex" :key="item.sex">
          <div class="box-left"><img :src="studentSexImg[item.sex]" alt="图片加载中"></div>
          <div class="box-right">
            <p> {{ item.count }} 人</p>
            <span>
              <span v-if="item.sex === 0">未知:</span>
              <span v-if="item.sex === 1">男性:</span>
              <span v-if="item.sex === 2">女性:</span>
              {{ studentSum > 0 ? ((item.count / studentSum) * 100).toFixed(2) : 0 }} %
              </span>
          </div>
        </div>
    </div>

    <div class="studentsSurcesEcharts">
      <!-- 学生性别 -->
      <!-- <div id="studentsSexAnalyse" v-loading="analyseLoading"></div> -->
      <!-- 学生来源分析 -->
      <div id="studentsSurcesAnalyse" v-loading="analyseLoading"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  name: 'StudentAnalyseStatistics',
  data() {
    return {
      analyseLoading: false,
      dateRange: [moment().subtract(3, 'months').toDate(), new Date()], // 选择日期
      pickerOptions: {
        disabledDate(time) {
          // 可选时间范围是当前时间到一年前的今天之间
          return (
            time.getTime() > Date.now() ||
            time < new Date().setFullYear(new Date().getFullYear() - 1)
          )
        },
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', [new Date(), new Date()])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              picker.$emit('pick', [
                moment().subtract(1, 'weeks').toDate(),
                new Date()
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              picker.$emit('pick', [
                moment().subtract(1, 'months').toDate(),
                new Date()
              ])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              picker.$emit('pick', [
                moment().subtract(3, 'months').toDate(),
                new Date()
              ])
            }
          }
        ]
      },
      // 学员来源分析
      studentsSurces: [],
      // 学员性别
      studentsSex: [],
      // 性别
      studentSexImg: [require('../../assets/student-0.png'), require('../../assets/student-1.png'), require('../../assets/student-2.png')],
      studentSum: 0
    }
  },
  // 生命周期 - 创建完成
  created() {
    this.dateRange = [
      moment().subtract(1, 'weeks').format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    ]
    this._studentsSurces()
    this._studentsSexAnalyse()
  },
  computed: {
    ...mapGetters(['organizationInfo', 'currentBranch'])
  },
  // 相关方法
  methods: {
    reset() {
      this.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      this.query()
    },
    query() {
      this._studentsSurces()
      this._studentsSexAnalyse()
    },
    _studentsSurces() {
      this.analyseLoading = true
      this.$http
        .get(
          `/v1/StudentAnalyseStatistics/getStudentResourceAnalyse?departmentId=${
            this.currentBranch.id
          }&organizationId=${this.organizationInfo.id}&startTime=${
            this.dateRange[0] + ' 00:00:00'
          }&endTime=${this.dateRange[1] + ' 23:59:59'}`
        )
        .then((res) => {
          this.studentsSurces = res.data
          this.studentsSurcesAnalyse = echarts.init(
            document.getElementById('studentsSurcesAnalyse')
          )
          let xAxisData = []
          let seriesData = []
          for (let i = 0; i < this.studentsSurces.length; i++) {
            xAxisData.push(this.studentsSurces[i].resourceName)
            seriesData.push(this.studentsSurces[i].count)
          }
          this.studentsSurcesAnalyse.setOption({
            title: {
              text: '学员来源统计',
              textStyle: {
                fontWeight: 'lighter',
                fontSize: 14,
                color: '#888888'
              }
            },
            color: ['#3398DB'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                // 坐标轴指示器，坐标轴触发有效
                type: 'line' // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            grid: {
              left: '0',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            dataZoom: [ // x轴数据过多时，滚动显示
              {
                type: 'slider',
                show: true,
                start: 0,
                end: Number(1000 / xAxisData.length),
                xAxisIndex: [0]
              }
            ],
            xAxis: [
              {
                data: xAxisData,
                axisTick: {
                  alignWithLabel: true
                },
                show: true,
                name: '来源',
                axisLabel: {
                  show: true,
                  rotate: 45,
                  color: '#888'
                },
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: '#aaa'
                  }
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                axisLabel: {
                  color: '#888'
                },
                splitLine: {
                  show: true,
                  lineStyle: {
                    type: 'dashed'
                  }
                },
                show: true,
                name: '人数',
                axisLine: {
                  show: false,
                  lineStyle: {
                    color: '#aaa'
                  }
                }
              }
            ],
            series: [
              {
                name: '报名人数',
                type: 'bar',
                barWidth: '30px',
                data: seriesData,
                barMinHeight: [2]
              }
            ]
          })
        })
        .finally(() => {
          this.analyseLoading = false
        })
    },
    _studentsSexAnalyse() {
      this.$http
        .get(
          `/v1/StudentAnalyseStatistics/getStudentSexAnalyse?departmentId=${
            this.currentBranch.id
          }&organizationId=${this.organizationInfo.id}&startTime=${
            this.dateRange[0] + ' 00:00:00'
          }&endTime=${this.dateRange[1] + ' 23:59:59'}`
        )
        .then((res) => {
          this.studentsSex = res.data
          // this.studentsSexAnalyse = echarts.init(
          //   document.getElementById('studentsSexAnalyse')
          // )
          // let studentsSexDataList = { value: '', name: '' }
          // let studentsSexData = []
          // let sex
          this.studentSum = 0
          for (let i = 0; i < this.studentsSex.length; i++) {
            this.studentSum += this.studentsSex[i].count
            // switch (this.studentsSex[i].sex) {
            //   case 0:
            //     sex = '未知'
            //     break
            //   case 1:
            //     sex = '男'
            //     break
            //   default:
            //     sex = '女'
            //     break
            // }
            // studentsSexDataList = { value: this.studentsSex[i].count, name: sex }
            // studentsSexData.push(studentsSexDataList)
          }
          // this.studentsSexAnalyse.setOption({
          //   color: ['#000000', 'rgb(51,152,219)', 'rgb(241,187,76)'],
          //   title: {
          //     text: '学员性别统计',
          //     left: 'left'
          //   },
          //   legend: {
          //     orient: 'horizontal',
          //     top: 30,
          //     left: 20,
          //     data: ['未知', '男', '女']
          //   },
          //   series: [
          //     {
          //       name: '性别',
          //       type: 'pie',
          //       radius: '55%',
          //       center: ['40%', '50%'],
          //       data: studentsSexData,
          //       emphasis: {
          //         itemStyle: {
          //           shadowBlur: 10,
          //           shadowOffsetX: 0,
          //           shadowColor: 'rgba(0, 0, 0, 0.5)'
          //         }
          //       }
          //     }
          //   ],
          //   tooltip: {
          //     trigger: 'item',
          //     formatter: '{a}<br/>{b} : {c} ({d}%)'
          //   }
          // })
        })
        .finally(() => {
        })
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  width 100%
  height 100%
#studentsSurcesAnalyse
  // width calc(100% - 200px)
  width 99%
  height 320px
  margin 0 auto
.studentsSurcesEcharts
  background-color #ffffff
  padding 15px
  display flex
// #studentsSexAnalyse
//   width 300px
//   height 320px
.student-sex
  margin-bottom 20px
  display flex
  justify-content space-between
  align-items center
  flex-flow row wrap
  .sex-box
    width calc((100vw - 250px) / 4)
    height 90px
    background-color #ffffff
    padding 10px 0
    border-radius 10px
    overflow hidden
    display flex
    align-items center
    transition 0.6s
    justify-content space-around
    &:hover
      box-shadow 1px 2px 10px $color-border-1
    .box-right
      width calc(100% - 81px)
      display flex
      flex-flow column nowrap
      justify-content space-around
      text-align center
      p
        padding 0
        margin 0
        font-size 25px
        color #555555
      span
        font-size 15px
        color #555555
    .box-left
      width 66px
      height 64px
      margin 6px 0 0 10px
      overflow hidden
      img
        width 66px
        display inline-block
.student-sum
  font-size 28px
</style>

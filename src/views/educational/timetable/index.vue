<!-- 排课管理 -->
<template>
  <div class="timetable-wrapper">
    <el-tabs v-model="currentMode">
      <el-tab-pane label="列表模式" name="0"></el-tab-pane>
      <el-tab-pane label="视图模式" name="1"></el-tab-pane>
    </el-tabs>
    <list-mode v-if="currentMode === '0'" ref="listMode" @quickSchedule="handleQuickSchedule"/>
    <chart-mode v-else-if="currentMode === '1'" ref="chartMode" @quickSchedule="handleQuickSchedule" @select="select"/>

    <schedule-arrangement-dialog
      v-model="scheduleVisible"
      :data="scheduleData"
      :scheduleType="scheduleType"
      :getSchedulePlan="getSchedulePlan"
      @success="handleSuccess">
    </schedule-arrangement-dialog>
  </div>
</template>

<script>
import ListMode from './ListMode'
import ChartMode from './ChartMode'
import ScheduleArrangementDialog from './ScheduleArrangementDialog'

import moment from 'moment'

export default {
  name: 'TimeTable',
  provide () {
    return {
      refreshTimetableByCurrentMode: () => {
        if (this.currentMode === '0') {
          return this.$refs.listMode && this.$refs.listMode._getTableData()
        } else {
          return this.$refs.chartMode && this.$refs.chartMode._getEventList()
        }
      }
    }
  },
  data () {
    return {
      scheduleVisible: false,
      currentMode: '1',
      scheduleData: null,
      scheduleType: 'both',
      getSchedulePlan: true
    }
  },
  components: {
    ListMode, ChartMode, ScheduleArrangementDialog
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const flag = sessionStorage.getItem('quickSchedule')
      if (flag) {
        vm.handleQuickSchedule()
        sessionStorage.removeItem('quickSchedule')
      }
    })
  },
  methods: {
    handleQuickSchedule () {
      this.scheduleVisible = true
      this.scheduleType = 'both'
      this.getSchedulePlan = true
    },
    select(start, end) {
      this.scheduleType = 'single'
      this.getSchedulePlan = false
      this.scheduleData = {
        courseSchedulingType: 1, // 单词排课
        startDate: moment(start).format('YYYY-MM-DD'),
        coursePlanTimeEntityList: [
          {
            classHour: 0, // 授课课时
            startTime: moment(start).format('HH:mm'), // 上课结束时间(时间格式为: HH:mm:ss)
            endTime: moment(end).format('HH:mm') // 上课开始时间(时间格式为：HH:mm:ss)
          }
        ]
      }
      this.scheduleVisible = true
    },
    handleSuccess() {
      if (this.currentMode === '0') {
        this.$refs.listMode._getTableData()
      } else {
        this.$refs.chartMode._getEventList()
      }
    }
  }
}

</script>

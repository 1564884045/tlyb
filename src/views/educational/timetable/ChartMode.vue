<template>
  <div class="timetable-chart" style="position: relative;">
    <div class="query-form">
      <div class="query-select-list">
        <el-radio-group v-model="currentType" @change="handleTypeChange" style="margin-left: 0;">
          <el-radio-button label="0">按班级</el-radio-button>
          <el-radio-button label="1">按课程</el-radio-button>
          <el-radio-button label="2">按老师</el-radio-button>
          <el-radio-button label="3">按教室</el-radio-button>
        </el-radio-group>
        <inline-select
          v-model="queryForm.courseId"
          :options="courseList"
          :loading="loadingCourse"
          @change="_getEventList"
          @show="_getCourseList"
          label="课程"
          valueAttr="id"
          labelAttr="name"
          filterable
          clearable/>
        <inline-select
          v-model="queryForm.classId"
          :options="classList"
          :loading="loadingClass"
          @change="_getEventList"
          @show="_getClassList"
          label="班级"
          valueAttr="id"
          labelAttr="name"
          filterable
          clearable/>
        <inline-select
          v-model="queryForm.classroomId"
          :options="classRoomList"
          :loading="loadingClassRoom"
          @change="_getEventList"
          @show="_getClassRoomList"
          label="教室"
          valueAttr="id"
          labelAttr="name"
          filterable
          clearable/>
        <inline-select
          v-model="queryForm.teacherId"
          :options="teacherList"
          :loading="loadingTeacher"
          @change="_getEventList"
          @show="_getTeacherList"
          label="上课老师"
          valueAttr="id"
          labelAttr="username"
          filterable
          clearable/>
        <el-divider direction="vertical"></el-divider>
        <el-checkbox-group v-model="queryForm.giveLessonsWay" @change="_getEventList">
          <el-checkbox label="1">一对多</el-checkbox>
          <el-checkbox label="0">一对一</el-checkbox>
        </el-checkbox-group>
        <el-checkbox v-model="displayEventTime" @change="handleDisplayEventTimeChange">显示课表时间</el-checkbox>
        <el-button type="text" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
        <el-button type="text" @click="_getEventList" size="medium" style="margin-left: 12px;">刷&nbsp;新</el-button>
      </div>

      <div ref="calendarWrapper" class="calendar-wrapper">
        <div class="fc-toolbar fc-header-toolbar">
          <div class="fc-left"></div>
          <div class="fc-center">
            <h2>{{ currentWeekStr }}</h2>
            <div class="fc-button-group">
              <button @click="prevWeek" type="button" class="fc-prev-button fc-button fc-button-primary"
                      aria-label="prev">
                <span class="fc-icon fc-icon-chevron-left"></span>
                上周
              </button>
              <button @click="nextWeek" type="button" class="fc-next-button fc-button fc-button-primary"
                      aria-label="next">
                下周
                <span class="fc-icon fc-icon-chevron-right"></span>
              </button>
            </div>
            <button @click="toToday" type="button" class="fc-today-button fc-button fc-button-primary"
                    :disabled="isCurrentWeek">本周
            </button>
          </div>
          <div class="fc-right">
            <el-button v-if="!fullscreen" type="primary" icon="el-icon-date" @click="$emit('quickSchedule')">快速排课
            </el-button>
            <el-button
              type="primary"
              @click="toggleFullscreen"
              :icon="fullscreen ? 'icon iconfont icon-fullscreen-exit' : 'icon iconfont icon-fullscreen'"
              :style="{'margin-right': fullscreen ? '16px' : ''}">
              {{ fullscreen ? '退出全屏' : '全屏显示' }}
            </el-button>
            <el-popover
              v-if="!fullscreen"
              placement="left"
              width="400"
              v-model="showExportTablePopover"
              @show="handleShowExportPopover"
              trigger="click">
              <div class="export-table-container">
                <p class="title">导出课程表</p>
                <div class="condition-container">
                  <el-radio-group v-model="exportCourseTimeTableForm.type"
                                  size="medium"
                                  @change="handleSelectTimeTypeChange"
                                  style="margin-right:30px;">
                    <el-radio label="本周"></el-radio>
                    <el-radio label="下周"></el-radio>
                    <el-radio label="未来一个月"></el-radio>
                  </el-radio-group>
                  <inline-select
                    v-model="exportCourseTimeTableForm.teacherId"
                    :options="teacherList"
                    :loading="loadingTeacher"
                    @show="_getTeacherList"
                    label="上课老师"
                    valueAttr="id"
                    labelAttr="username"
                    filterable
                    clearable/>

                  <div class="custom-condition">
                    <el-date-picker
                      v-model="exportCourseTimeTableForm.selectedTime"
                      type="daterange"
                      align="right"
                      :editable="false"
                      :clearable="false"
                      unlink-panels
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      @change="handleCustomConditionDateSelectChange"
                      :picker-options="customConditionPickerOptions">
                    </el-date-picker>
                  </div>
                </div>
                <div class="footer">
                  <el-button plain @click="showExportTablePopover = false">取 消</el-button>
                  <el-button type="primary" plain @click="handleExportCourseTable()">确 定</el-button>
                </div>
              </div>
              <el-button type="success" icon="icon iconfont icon-export" slot="reference">导出课表</el-button>
            </el-popover>
          </div>
        </div>
        <div style="display:none" id="courseTableContainer"></div>
        <FullCalendar
          id="courseTimeTable"
          v-loading="loading"
          ref="timetable"
          :plugins="calendarPlugins"
          :header="false"
          :events="list"
          :eventDataTransform="eventDataTransform"
          :columnHeaderHtml="renderColumnHeader"
          :firstDay="1"
          height="auto"
          allDayText="全天"
          :allDayDefault="false"
          :weekends="true"
          :weekNumbers="false"
          :allDaySlot="false"
          weekLabel="时间"
          :displayEventTime="displayEventTime"
          slotDuration="00:30:00"
          :slotLabelInterval="{
            hours: 1
          }"
          minTime="06:00:00"
          maxTime="24:00:00"
          :slotLabelFormat="{
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          }"
          :selectable="true"
          locales="zh-cn"
          @eventRender="handleEventRender"
          @eventDestroy="handleEventLeave"
          @eventClick="handleClickEvent"
          @select="handleSelect"
        >
        </FullCalendar>
      </div>
    </div>
  </div>
</template>

<script>
import InlineSelect from '@/components/InlineSelect'

import FullCalendar from '@fullcalendar/vue'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import moment from 'moment'
// import html2canvas from 'html2canvas'
import Tooltip from 'tooltip.js'
import { mapGetters } from 'vuex'
import { requestFullScreen, exitFull, fullscreenElement, onFullScreen, offFullScreen } from '../../../utils/dom'

moment.locale('zh-cn')

export default {
  data() {
    return {
      calendarPlugins: [timeGridPlugin, interactionPlugin],
      showPopper: false,
      displayEventTime: true, // 是否显示时间
      loading: false,
      loadingCourse: false,
      loadingClass: false,
      loadingClassRoom: false,
      loadingTeacher: false,
      currentType: '0',
      currentWeek: [],
      queryForm: {
        giveLessonsWay: [], // 授课方式 0一对一 1一对多
        courseId: '',
        classId: '',
        classroomId: '',
        teacherId: ''
      },
      tooltips: {},
      list: [],
      holidayList: [],
      courseList: [],
      classList: [],
      teacherList: [],
      classRoomList: [],
      fullscreen: false,
      showExportTablePopover: false,
      exportCourseTimeTableForm: { // 导出课表相关参数
        selectedTime: [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)],
        teacherId: null,
        type: '本周'
      },
      customConditionPickerOptions: {
        disabledDate(time) {
          return time.getTime() < moment().startOf('week').weekday(0) || time.getTime() > moment().add(180, 'days')
        }
      }
    }
  },
  components: {
    InlineSelect, FullCalendar
  },
  computed: {
    isCurrentWeek() {
      return moment().isBetween(this.currentWeek[0], this.currentWeek[1])
    },
    currentWeekStr() {
      return this.currentWeek[0].format('MM月DD日') + ' - ' + this.currentWeek[1].format('MM月DD日')
    },
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  async created() {
    this.currentWeek = [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)]
    try {
      const res = await this.$http.get('/v1/Vacation/getByDepIdAndTime', {
        departmentId: this.currentBranch.id,
        time: this.currentWeek[0].format('YYYY-MM-DD')
      })
      this.holidayList = res.data
    } catch (error) {
    }
    this._getEventList()
  },
  mounted() {
    this.calendar = this.$refs.timetable.getApi()

    // 页面全屏监听
    onFullScreen(() => {
      this.fullscreen = !!fullscreenElement()
    })
  },
  destroyed() {
    // 退出全屏，清掉事件
    offFullScreen()
    this.handleEventLeave()
  },
  methods: {
    _getEventList() {
      if (this.loading) return
      this.loading = true
      const params = {
        startDate: this.currentWeek[0].format('YYYY-MM-DD'),
        endDate: this.currentWeek[1].format('YYYY-MM-DD'),
        ...this.queryForm
      }
      // 清除为空字符串的数据
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === '') {
          delete params[key]
        }
      }
      if (params.giveLessonsWay.length === 0 || params.giveLessonsWay.length >= 2) {
        delete params.giveLessonsWay
      } else {
        params.giveLessonsWay = params.giveLessonsWay[0]
      }
      this.$http.get('/v1/CoursePlan/getCourseTime/' + this.currentBranch.id, params).then((res) => {
        // 先移除event
        if (this.calendar) {
          const events = this.calendar.getEvents()
          events.forEach(item => {
            item.remove()
          })
        }
        res.data.forEach(item => {
          // 添加默认值并处理数据,如果班级名称为空时,尝试展示学员名称+课程名称
          item.className = item.className || item.oneStudentName + '(' + item.oneCourseName + ')' || '暂无班级'
          item.courseName = item.courseName || item.oneCourseName || '暂无课程'
          if (!item.teacherName) item.teacherName = '暂无老师'
          if (!item.classRoomName) item.classRoomName = '暂无教室'
        })
        this.list = []
        this.$nextTick(() => {
          this.list = res.data
        })
      }).finally(() => {
        this.loading = false
      })
    },
    _getClassList() {
      if (this.classList.length > 0) return
      this.loadingClass = true
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id }).then(res => {
        this.classList = res.data
      }).finally(() => {
        this.loadingClass = false
      })
    },
    _getCourseList() {
      if (this.courseList.length > 0) return
      this.loadingCourse = true
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, { status: 1 }).then(res => {
        this.courseList = res.data
      }).finally(() => {
        this.loadingCourse = false
      })
    },
    _getClassRoomList() {
      if (this.classRoomList.length > 0) return
      this.loadingClassRoom = true
      this.$http.get('/v1/Classroom/getClassroomList', { departmentId: this.currentBranch.id }).then(res => {
        this.classRoomList = res.data
      }).finally(() => {
        this.loadingClassRoom = false
      })
    },
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.loadingTeacher = true
      this.$http.get('/v1/User/getByUserLogo', {
        userLogo: 1,
        departmentId: this.currentBranch.id,
        organizationId: this.organizationInfo.id
      }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.loadingTeacher = false
      })
    },
    reset() {
      this.queryForm = {
        giveLessonsWay: [], // 授课方式 0一对一 1一对多
        courseId: '',
        classId: '',
        classroomId: '',
        teacherId: ''
      }
      this._getEventList()
    },
    /** 获取String的hash值 */
    hashCode(str) {
      if (Array.prototype.reduce) {
        return str.split('').reduce(function (a, b) {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
      }
      let hash = 0
      if (str.length === 0) return hash
      for (var i = 0; i < str.length; i++) {
        var character = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + character
        hash = hash & hash // Convert to 32bit integer
      }
      return hash
    },
    /** 转化成标准event数据  */
    eventDataTransform(item) {
      const result = {
        id: item.id,
        start: item.goToClassDate.split(' ')[0] + ' ' + item.goToClassStartTime,
        end: item.goToClassDate.split(' ')[0] + ' ' + item.goToClassEndTime,
        extendedProps: item
      }
      switch (this.currentType) {
        case '0':
          result.title = item.className
          result.className = 'event-' + Math.abs(this.hashCode(item.className || '')) % 10
          break
        case '1':
          result.title = item.courseName
          result.className = 'event-' + Math.abs(this.hashCode(item.courseName || '')) % 10
          break
        case '2':
          result.title = item.teacherName
          result.className = 'event-' + Math.abs(this.hashCode(item.teacherName || '')) % 10
          break
        case '3':
          result.title = item.classRoomName
          result.className = 'event-' + Math.abs(this.hashCode(item.classRoomName || '')) % 10
          break
      }
      return result
    },
    // 单选选择事件处理导出课表时间
    handleSelectTimeTypeChange(value) {
      switch (value) {
        case '本周':
          this.exportCourseTimeTableForm.selectedTime = [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)]
          break
        case '下周':
          this.exportCourseTimeTableForm.selectedTime = [moment().startOf('week').weekday(0).add(7, 'days'), moment().endOf('week').weekday(6).add(7, 'days')]
          break
        case '一个月':
          this.exportCourseTimeTableForm.selectedTime = [moment(), moment().add(1, 'month')]
          break
        default:
          this.exportCourseTimeTableForm.selectedTime = [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)]
          break
      }
    },
    // 导出课表时间选择事件
    handleCustomConditionDateSelectChange(values) {
      this.exportCourseTimeTableForm.type = null
      const minTime = moment().startOf('week').weekday(0)
      if (values[0] < minTime) {
        this.exportCourseTimeTableForm.selectedTime[0] = minTime
      }
      if (moment(values[1]).diff(moment(values[0]), 'days') < 7) {
        this.exportCourseTimeTableForm.selectedTime = [values[0], moment(values[0]).add(7, 'days')]
        this.$message.warning('最小时间段为一周的时间，已将您选择的时间进行处理！')
      }
      if (moment(values[1]).diff(moment(values[0]), 'days') > 30) {
        this.exportCourseTimeTableForm.selectedTime = [moment(), moment().add(1, 'month')]
        this.$message.warning('最大时间段为一个月的时间，已将您选择的时间默认为未来一个月！')
      }
      if (moment(values[1]).diff(moment(), 'days') >= 180) {
        this.exportCourseTimeTableForm.selectedTime = [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)]
        this.$message.warning('最大只能支持导出未来半年内的课表，已将您选择的时间重置为本周！')
      }
    },
    // 显示导出课表popover
    handleShowExportPopover() {
      this.exportCourseTimeTableForm = {
        selectedTime: [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)],
        teacherId: null,
        type: '本周'
      }
    },
    // 导出课表
    handleExportCourseTable() {
      const startDate = moment(this.exportCourseTimeTableForm.selectedTime[0]).format('YYYY-MM-DD')
      const endDate = moment(this.exportCourseTimeTableForm.selectedTime[1]).format('YYYY-MM-DD')
      let msg = `导出时间段为【${startDate} ~ ${endDate}】`
      if (this.exportCourseTimeTableForm.teacherId && this.exportCourseTimeTableForm.teacherId.length > 0) {
        const teacher = this.teacherList.find(o => o.id === this.exportCourseTimeTableForm.teacherId)
        msg += `，您指定导出的教师为【${teacher.username || '未知教师'}】的课程表。`
      } else {
        msg += '，由于您未指定教师导出，导出课表将默认导出该时间段内的整个校区的课程表。'
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: '正在导出课表中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        let dowloadInfoUrl = window.location.origin + process.env.VUE_APP_BASE_API + '/v1/ExportOrImport/exportCourseTimeTable?'
        dowloadInfoUrl += `branchId=${this.currentBranch.id}&startDate=${startDate}&endDate=${endDate}`
        if (this.exportCourseTimeTableForm.teacherId && this.exportCourseTimeTableForm.teacherId.length > 0) {
          dowloadInfoUrl += `&teacherId=${this.exportCourseTimeTableForm.teacherId}`
        }
        console.log(dowloadInfoUrl)
        const fileName = `课程表【${startDate} ~ ${endDate}】.xls`
        this.$http.getDownload(dowloadInfoUrl, fileName).then(res => {
          this.$message.success('导出课表成功！')
        }).catch(() => {
          this.$message.error('导出课表失败！')
        }).finally(() => {
          setTimeout(() => {
            loading.close()
          }, 500)
          // 重置表单数据
          this.exportCourseTimeTableForm = {
            selectedTime: [moment().startOf('week').weekday(0), moment().endOf('week').weekday(6)],
            teacherId: null,
            type: '本周'
          }
        })
      })
    },
    // 是否显示课表时间
    handleDisplayEventTimeChange(value) {
      this.displayEventTime = value
    },
    handleTypeChange() {
      if (!this.calendar) return
      // 先移除event
      const events = this.calendar.getEvents()
      events.forEach(item => {
        item.remove()
      })
      // 再重新添加
      this.list.forEach(item => {
        this.calendar.addEvent(this.eventDataTransform(item))
      })
    },
    // 本周
    toToday() {
      // 把周开始时间设置为星期一
      this.currentWeek = [moment().startOf('week').weekday(1), moment().endOf('week').weekday(7)]
      this.calendar.today()
      this._getEventList()
    },
    // 上周
    prevWeek() {
      this.currentWeek = [
        this.currentWeek[0].subtract(7, 'days'),
        this.currentWeek[1].subtract(7, 'days')
      ]
      this.calendar.prev()
      this._getEventList()
    },
    // 下周
    nextWeek() {
      this.currentWeek = [
        this.currentWeek[0].add(7, 'days'),
        this.currentWeek[1].add(7, 'days')
      ]
      this.calendar.next()
      this._getEventList()
    },
    // 渲染头部
    renderColumnHeader(date) {
      let holiday = null
      for (let i = 0; i < this.holidayList.length; i++) {
        const item = this.holidayList[i]
        if (moment(date).add(1, 'hours').isBetween(item.date + ' 00:00:00', item.endDate + ' 23:59:59')) {
          holiday = item
          break
        }
      }

      if (holiday) {
        return `<p class="fc-header-date">${moment(date).format('MM-DD')}</p>
                <p class="fc-header-name is-holiday">${holiday.name}</p>`
      } else {
        return `<p class="fc-header-date">${moment(date).format('MM-DD')}</p>
                <p class="fc-header-name">${moment(date).format('dddd')}</p>`
      }
    },
    handleEventRender(info) {
      if (this.fullscreen) return
      if (this.tooltips[info.event.id]) return
      this.tooltips[info.event.id] = new Tooltip(info.el, {
        title: `<ul>
                  <li><label>上课时间：</label>${info.event.extendedProps.goToClassStartTime} ~ ${info.event.extendedProps.goToClassEndTime}</li>
                  <li><label>上课教室：</label>${info.event.extendedProps.classRoomName || ''}</li>
                  <li><label>课程名称：</label>${info.event.extendedProps.courseName || ''}</li>
                  <li><label>${info.event.extendedProps.className.indexOf('(') !== -1 ? '学员' : '班级'}：</label>${info.event.extendedProps.className || ''}</li>
                  <li><label>老师：</label>${info.event.extendedProps.teacherName || ''}</li>
                  <li><label>课时数：</label>${info.event.extendedProps.classHour}</li>
                  <li><label>备注：</label>${info.event.extendedProps.remark ? info.event.extendedProps.remark : '-'}</li>
                </ul>`,
        html: true,
        placement: 'bottom-start',
        container: 'body'
      })
    },
    handleEventLeave() {
      for (const key in this.tooltips) {
        if (this.tooltips.hasOwnProperty(key)) {
          this.tooltips[key].dispose()
        }
      }
      this.tooltips = {}
    },
    // 点击单项
    handleClickEvent(info) {
      this.$emit('toDetail', info.event.extendedProps)
    },
    // 格子选择
    handleSelect(info) {
      if (this.fullscreen) return
      if (!moment(info.start).isSame(moment(info.end), 'day')) {
        this.$message.warning('只能选择同一天！')
        return
      }
      if (moment(info.start).isBefore(moment())) {
        this.$confirm('您选择的时间已过，是否继续？', '提示').then(() => {
          this.$emit('select', info.start, info.end)
        })
        return
      }
      this.$emit('select', info.start, info.end)
    },
    // 切换全屏
    toggleFullscreen() {
      const elem = this.$refs.calendarWrapper
      if (!this.fullscreen) {
        requestFullScreen(elem)
        this.handleEventLeave()
      } else {
        exitFull()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.query-select-list
  margin-top 0

  .el-checkbox-group
    display inline-block
    margin 0 20px

.calendar-wrapper
  background #fff
</style>

<style lang="stylus">
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/timegrid/main.css';
.export-table-container
  margin-top 5px

  .title
    margin-bottom 10px
    padding-bottom 10px
    font-size 16px
    text-align center
    color #777777
    border-bottom 1px solid #eee

  .condition-container
    margin-top 30px
    margin-bottom 50px
    text-align center
    .custom-condition
      margin-top 30px
  .footer
    text-align center

.fc-day-header
  background #eee
  font-weight normal
  padding 4px 0 !important

  &.fc-today
    color $color-primary

  .fc-header-date
    font-size 13px

  .fc-header-name
    font-size 14px

    &.is-holiday
      color $color-danger
      font-weight bold

.fc-toolbar
  margin-top 12px

  .fc-center
    h2
      display inline-block
      vertical-align middle

.fc-list-empty
  background none !important
  padding 50px 0

.fc-time-grid
  .fc-event
    display flex
    align-items center

.fc-time-grid-event
  text-align center
  overflow auto

  .fc-content
    text-align left
    width 100%

  .fc-title
    display table-cell
    vertical-align middle
    font-size 13px
    font-weight bold

  &.event-0
    background-color #FF6F60
    border-color #D15252
    color #F5F5F5

  &.event-1
    background-color #67B4EF
    border-color #5394C5
    color #F5F5F5

  &.event-2
    background-color #FF9438
    border-color #D6833B
    color #F5F5F5

  &.event-3
    background-color #6FD4E3
    border-color #43B5C6
    color #F5F5F5

  &.event-4
    background-color #F3C134
    border-color #C99914
    color #F5F5F5

  &.event-5
    background-color #9CDA79
    border-color #7DA169
    color #F5F5F5

  &.event-6
    background-color #F18499
    border-color #D6657B
    color #F5F5F5

  &.event-7
    background-color #EBB083
    border-color #B7835B
    color #F5F5F5

  &.event-8
    background-color #C69BF0
    border-color #A16BD8
    color #F5F5F5

  &.event-9
    background-color #8299F6
    border-color #737FAE
    color #F5F5F5

.tooltip
  position absolute
  background #ffffff
  color black
  border-radius 3px
  padding 10px
  text-align center
  z-index 49
  box-shadow 0px 0px 8px #bbb

  .tooltip-arrow
    width 0
    height 0
    border-style solid
    position absolute
    margin 8px
    border-color #ffffff
    z-index 1

  &[x-placement^="top"]
    margin-bottom 8px

    .tooltip-arrow
      border-width 8px 8px 0 8px
      border-left-color transparent
      border-right-color transparent
      border-bottom-color transparent
      bottom -8px
      left calc(50% - 8px)
      margin-top 0
      margin-bottom 0

  &[x-placement^="bottom"]
    margin-top 8px

    .tooltip-arrow
      border-width 0 8px 8px 8px
      border-left-color transparent
      border-right-color transparent
      border-top-color: transparent
      top -8px
      left calc(50% - 8px)
      margin-top 0
      margin-bottom 0

  &[x-placement^="right"]
    margin-left 8px

    .tooltip-arrow
      border-width 8px 8px 8px 0
      border-left-color transparent
      border-top-color transparent
      border-bottom-color transparent
      left -8px
      top calc(50% - 8px)
      margin-left 0
      margin-right 0

  &[x-placement^="left"]
    margin-right: 8px

    .tooltip-arrow
      border-width 8px 0 8px 8px
      border-top-color transparent
      border-right-color transparent
      border-bottom-color transparent
      right -8px
      top calc(50% - 8px)
      margin-left 0
      margin-right 0

.tooltip-inner
  li
    font-size 14px
    width 220px
    color $colo-text-1
    text-align left

    & + li
      margin-top 8px

    label
      display inline-block
      width 80px
      text-align right
      color $color-text-3
      margin-right 6px
</style>

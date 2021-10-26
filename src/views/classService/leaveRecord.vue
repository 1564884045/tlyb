<!-- 请假管理 -->
<template>
  <div class="student-wrapper">
    <div class="query-form">
      <el-input v-model="queryForm.searchInput" :maxlength="50" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 88px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始录入日期"
        end-placeholder="结束录入日期"
        :picker-options="dateOptions"
        @change="query"
        style="margin: 0 16px; width: 250px;">
      </el-date-picker>
      <inline-select v-model="queryForm.teacherId" @change="query" label="任课老师" valueAttr="id" labelAttr="username" :loading="teacherLoading" :options="teacherList" @show="_getTeacherList" filterable clearable/>
      <inline-select v-model="queryForm.status" @change="query" label="状态" :options="statusList" clearable/>
      <el-button :disabled="!queryLoading ? false : true" type="text" @click="reset" size="medium" style="margin: 0 10px;">重&nbsp;置</el-button>

      <div class="right-btns">
        <el-button type="primary" icon="el-icon-tickets" @click="handleApply">请假</el-button>
      </div>
    </div>

    <div class="showTableData">
      <el-table
        :data="recordList"
        v-loading="queryLoading">
        <el-table-column
          prop="studentName"
          label="姓名(昵称)"
          width="144">
          <p class="username" slot-scope="scope">
            <a>{{scope.row.studentName}}</a>
            <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
            <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
          </p>
        </el-table-column>
        <el-table-column
          prop="primaryContactPhone"
          label="联系方式"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="timeStr"
          label="上课时间段"
          width="210"
          align="center">
        </el-table-column>
        <el-table-column
          prop="teacherName"
          label="任课老师"
          width="100"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.teacherName || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="courseName"
          label="课程名称"
          width="120"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.courseName || scope.row.oneCourseName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="reason"
          label="请假原因"
          min-width="210">
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="提交时间"
          width="144"
          align="center">
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="状态"
          width="100"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="144">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDeal(scope.row)">{{scope.row.status === 0 ? '处理' : '重新处理'}}</el-button>
            <el-button type="text" @click="handleDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getLeaveRecord"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <el-dialog :visible.sync="showDetail" custom-class="custom-dialog" title="请假详情" width="640px" top="6vh">
      <div v-loading="detailLoading" class="student-info-wrapper">
        <el-button class="handle-btn" type="primary" plain @click="handleDeal(recordDetail)" size="mini">{{recordDetail.status === 0 ? '处理' : '重新处理'}}</el-button>
        <div class="student-info">
          <img :src="recordDetail.studentAvatar" class="avatar"/>
          <div >
            <p class="username">{{recordDetail.studentName}}</p>
            <p class="info">
              <label>昵称：</label>
              <span>{{recordDetail.studentNickName}}</span>
              <label>联系方式：</label>
              <span>{{recordDetail.primaryContactPhone}}</span>
            </p>
          </div>
        </div>
        <ul class="record-infos">
          <li>
            <label>提交时间:</label>{{recordDetail.createAt}}
          </li>
          <li>
            <label>请假时间:</label>{{recordDetail.timeStr}}
          </li>
          <li>
            <label>任课老师:</label>{{recordDetail.teacherName}}
          </li>
          <li>
            <label>课程名称:</label>{{recordDetail.courseName}}
          </li>
          <li>
            <label>请假原因:</label>{{recordDetail.reason}}
          </li>
        </ul>
        <ul class="record-infos">
          <li>
            <label>状态:</label><span :class="'color-' + recordDetail.statusClass">{{recordDetail.statusStr}}</span>
          </li>
          <li>
            <label>处理时间:</label>{{recordDetail.updateAt}}
          </li>
          <li>
            <label>备注:</label>{{recordDetail.remark}}
          </li>
          <li>
            <label>处理人:</label>{{recordDetail.teacherName}}
          </li>
        </ul>
      </div>
    </el-dialog>

    <el-dialog custom-class="custom-dialog" :visible.sync="showDeal" title="请假处理">
      <el-form :model="dealForm" ref="dealForm" :rules="rules" label-width="88px">
        <el-form-item prop="status" label="处理结果">
          <el-radio-group v-model="dealForm.status">
            <el-radio :label="1">同意请假</el-radio>
            <el-radio :label="2">拒绝请假</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="dealForm.remark" type="textarea" :rows="5" placeholder="请填写处理备注" :maxlength="200"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showDeal = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitDeal">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog custom-class="custom-dialog" :visible.sync="showApply" title="发起请假" width="640px" top="6vh" :close-on-click-modal="false">
      <el-form :model="applyForm" ref="applyForm" :rules="rules" label-width="88px">
        <el-form-item prop="studentId" label="学员姓名">
          <el-select v-model="applyForm.studentId" placeholder="输入学生姓名搜索" filterable remote :remote-method="remoteGetStudent" :loading="studentLoading">
            <el-option v-for="item in studentList" :key="item.id" :label="item.name" :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.primaryContactPhone }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="startDate" label="开始时间">
          <el-date-picker v-model="applyForm.startDate" placeholder="请选择开始时间" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item prop="endDate" label="结束时间">
          <el-date-picker v-model="applyForm.endDate" placeholder="请选择结束时间" :picker-options="endDateOptions" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item prop="courseTimeList" label="请假的课">
          <ul class="course-time-list" v-if="applyForm.courseTimeList.length > 0">
            <li v-for="item in applyForm.courseTimeList" :key="item.id">
              <span>{{item.courseTimeStr}}</span>
              <span class="course-name">{{item.courseName}}</span>
            </li>
          </ul>
          <el-button icon="el-icon-plus" type="text" size="medium" @click="filterCourseTime">添加请假的课</el-button>
        </el-form-item>
        <el-form-item prop="reason" label="请假原因">
          <el-input v-model="applyForm.reason" type="textarea" :rows="5" placeholder="请填写请假原因" :maxlength="200"/>
        </el-form-item>
        <el-form-item prop="remark" label="备注" style="border-top: 1px dashed #d8dadd; padding-top: 16px;">
          <el-input v-model="applyForm.remark" type="textarea" :rows="5" placeholder="请填写处理备注" :maxlength="200"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showApply = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitApply">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog custom-class="custom-dialog" :visible.sync="showCourseTime" title="选择课表" :close-on-click-modal="false">
      <el-table ref="courseTimeTable"
        :data="courseTimeList"
        v-loading="courseTimeLoading"
        @selection-change="handleCourseTimeSelect">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
          <el-table-column
            prop="courseTimeStr"
            label="上课时间"
            width="200"
            align="center">
          </el-table-column>
          <el-table-column
            prop="className"
            label="班级"
            width="160"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="courseName"
            label="课程"
            min-width="160"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="classRoomName"
            label="教室"
            width="160"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="teacherName"
            label="上课老师"
            min-width="100"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="classHour"
            label="授课课时"
            width="80"
            align="center"
          ></el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="showCourseTime = false">取 消</el-button>
        <el-button type="primary"  @click="submitSelectCourseTime">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import InlineSelect from '_c/InlineSelect'
import { mapGetters } from 'vuex'
import moment from 'moment'

moment.locale('zh-cn')
export default {
  name: 'LeaveRecord',
  data () {
    return {
      queryLoading: false,
      teacherLoading: false,
      studentLoading: false,
      courseTimeLoading: false,
      submitLoading: false,
      detailLoading: false,
      showDetail: false,
      showDeal: false,
      showApply: false,
      showCourseTime: false,
      teacherList: [],
      searchTypeList: [
        {
          value: 'studentName',
          label: '姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'primaryContactPhone',
          label: '手机号',
          placeholder: '请输入手机号码'
        }
      ],
      queryForm: {
        searchType: 'studentName',
        searchInput: '',
        dateRange: [],
        status: '',
        teacherId: ''
      },
      dateOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      endDateOptions: {
        disabledDate: (time) => {
          if (!this.applyForm.startDate) return false
          return moment(time).isBefore(this.applyForm.startDate)
        }
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      statusList: [
        { value: 0, label: '待处理', type: 'info' },
        { value: 1, label: '同意请假', type: 'success' },
        { value: 2, label: '拒绝请假', type: 'danger' },
        { value: 3, label: '取消申请', type: 'warning' }
      ],
      recordList: [],
      recordDetail: {},
      dealForm: {
        id: null,
        status: 1,
        remark: ''
      },
      applyForm: {
        studentId: '',
        startDate: '',
        endDate: '',
        courseTimeList: [],
        courseTimeListTemp: [],
        status: 1,
        reason: '',
        remark: ''
      },
      rules: {
        studentId: { required: true, message: '请选择请假学员', trigger: 'change' },
        courseTimeList: { required: true, message: '请选择请假的课', trigger: 'change' },
        startDate: { required: true, message: '请选择请假开始时间', trigger: 'change' },
        endDate: { required: true, message: '请选择请假结束时间', trigger: 'change' },
        reason: { required: true, message: '请填写请假原因', trigger: 'blur' },
        status: { required: true, message: '请选择请假状态', trigger: 'change' },
        remark: { required: true, message: '请填写审批备注', trigger: 'blur' }
      },
      studentList: [],
      courseTimeList: []
    }
  },
  components: {
    InlineSelect
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo'
    ])
  },
  created() {
    this._getLeaveRecord()
  },
  methods: {
    // 获取请假列表
    _getLeaveRecord() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        departmentId: this.currentBranch.id,
        status: this.queryForm.status || null,
        teacherId: this.queryForm.teacherId || null
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.dateRange.length > 0) {
        params.startDate = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endDate = this.queryForm.dateRange[1] + ' 23:59:59'
      }

      this.queryLoading = true
      this.$http.get('/v1/LeaveRecord/getLeaveRecordList', params).then(res => {
        res.data.forEach(item => {
          switch (item.sex) {
            case 1:
              item.sexIcon = require('../../assets/icon_male.png')
              break
            case 2:
              item.sexIcon = require('../../assets/icon_famale.png')
              break
          }
          const statusObj = this.statusList.find(o => o.value === item.status)
          if (statusObj) {
            item.statusStr = statusObj.label
            item.statusClass = statusObj.type
          }
          item.timeStr = item.goToClassDate.split(' ')[0] + ' ' + item.goToClassStartTime + ' 至 ' + item.goToClassEndTime
        })
        this.recordList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.teacherLoading = true
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id, userLogo: 1 }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.teacherLoading = false
      })
    },
    // 重置
    reset() {
      this.queryForm = {
        searchType: 'studentName',
        searchInput: '',
        dateRange: [],
        status: '',
        teacherId: ''
      }
      this.query()
    },
    // 查询
    query() {
      this.pageNum = 1
      this._getLeaveRecord()
    },
    handleApply() {
      if (this.$refs.applyForm) {
        this.$refs.applyForm.resetFields()
        this.$refs.applyForm.clearValidate()
      }
      this.showApply = true
    },
    handleDetail(row) {
      this.detailLoading = true
      this.$http.get('/v1/LeaveRecord/getLeaveRecordById', {
        id: row.id
      }).then(res => {
        if (res.data) {
          const item = res.data
          if (item.studentAvatar == null) {
            item.sex === 2
              ? item.studentAvatar = require('../../assets/famale-small.jpg')
              : item.studentAvatar = require('../../assets/male-small.jpg')
          }
          const statusObj = this.statusList.find(o => o.value === item.status)
          if (statusObj) {
            item.statusStr = statusObj.label
            item.statusClass = statusObj.type
          }
          item.timeStr = item.goToClassDate.split(' ')[0] + ' ' + item.goToClassStartTime + ' 至 ' + item.goToClassEndTime
          this.recordDetail = item
          this.showDetail = true
        } else {
          this.$message.error('获取数据失败！')
        }
      }).finally(() => {
        this.detailLoading = false
      })
    },
    handleDeal(row) {
      // 判断当前老师
      if (this.userInfo.id !== row.teacherId) {
        this.$message.warning('您不是这条请假的上课老师，不能处理该条请假！')
        return
      }
      this.dealForm = {
        id: row.id,
        status: 1,
        remark: ''
      }
      this.$refs.dealForm && this.$refs.dealForm.clearValidate()
      this.showDeal = true
    },
    submitDeal() {
      this.$refs.dealForm.validate(valid => {
        if (valid) {
          this.submitLoading = false
          this.$http.put('/v1/LeaveRecord/updateLeaveRecord', this.dealForm).then(() => {
            this.$message.success('处理请假成功！')
            this.showDeal = false
            this._getLeaveRecord()
          })
        }
      })
    },
    submitApply() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          // 处理参数
          const params = []
          this.applyForm.courseTimeList.forEach(item => {
            params.push({
              courseTimeId: item.id,
              departmentId: this.currentBranch.id,
              organizationId: this.organizationInfo.id,
              reason: this.applyForm.reason,
              remark: this.applyForm.remark,
              status: 1,
              studentId: this.applyForm.studentId,
              teacherId: this.userInfo.id
            })
          })
          this.submitLoading = true
          this.$http.post('/v1/LeaveRecord/addLeaveRecords', params).then(() => {
            this.$message.success('请假成功！')
            this.query()
            this.showApply = false
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },
    submitSelectCourseTime() {
      if (this.applyForm.courseTimeListTemp.length === 0) {
        this.$message.warning('请选择请假的课')
        return
      }
      this.applyForm.courseTimeList = JSON.parse(JSON.stringify(this.applyForm.courseTimeListTemp))
      this.showCourseTime = false
    },
    remoteGetStudent(str) {
      if (!str) return
      this.studentLoading = true
      this.$http.get('/v1/Student/getByNameOrPhone', {
        departmentId: this.currentBranch.id,
        organizationId: this.organizationInfo.id,
        studentName: str,
        staatus: 0
      }).then(res => {
        this.studentList = res.data
      }).finally(() => {
        this.studentLoading = false
      })
    },
    filterCourseTime() {
      if (!this.applyForm.studentId) {
        this.$message.warning('请先选择请假学员')
        return
      }
      if (!this.applyForm.startDate && !this.applyForm.endDate) {
        this.$message.warning('请先选择请假时间')
        return
      }
      if (moment(this.applyForm.endDate).isBefore(this.applyForm.startDate)) {
        this.$message.warning('开始时间不能大于结束时间')
        return
      }
      this.showCourseTime = true
      this.courseTimeLoading = true
      this.$http.get('/v1/CoursePlan/getStudentCourseTime/' + this.applyForm.studentId, {
        startDate: this.applyForm.startDate,
        endDate: this.applyForm.endDate,
        flag: 1 // 只 查未请假课表
      }).then(res => {
        res.data.forEach(item => {
          item.courseTimeStr = moment(item.goToClassDate).format('YYYY-MM-DD') + ' ' +
                               moment(item.goToClassDate).format('dddd') + ' ' +
                               moment('2019-09-03 ' + item.goToClassStartTime).format('HH:mm') + '~' +
                               moment('2019-09-03 ' + item.goToClassEndTime).format('HH:mm')
        })
        this.courseTimeList = res.data
      }).finally(() => {
        this.courseTimeLoading = false
      })
    },
    handleCourseTimeSelect(val) {
      this.applyForm.courseTimeListTemp = val
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.student-info-wrapper
  position relative
  .handle-btn
    position absolute
    top 0
    right 12px
    width 80px
.record-infos
  border-top 1px dashed $color-border-1
  padding 16px 0
  li
    line-height 1.6
    font-size 14px
    color $color-text-1
    &+li
      margin-top 10px
  label
    display inline-block
    width 88px
    text-align right
    margin-right 12px
    color $color-text-3
.student-info
  display flex
  align-items center
  padding-bottom 16px
  color $color-text-1
  .avatar
    width 80px
    height 80px
    margin-right 16px
    flex-shrink 0
  .username
    font-size 18px
    width 100%
    margin-bottom 12px
    .el-button
      float right
      width 100px
  .info
    span
      display inline-block
      min-width 180px

.course-time-list
  padding 12px 20px
  border-radius 3px
  border 1px dashed $color-border-1
  li
    no-wrap()
    line-height 1.3
    &+li
      margin-top 12px
  .course-name
    margin-left 24px
.showTableData
  background #fff
  padding 14px
</style>

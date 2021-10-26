<!-- 课时统计 -->
<template>
  <div class="container">
    <el-tabs v-model="currentTab" @tab-click="handleClick">
      <el-tab-pane label="学生课时" name="0"></el-tab-pane>
      <el-tab-pane label="老师课时" name="1"></el-tab-pane>
    </el-tabs>
    <div v-show="currentTab === '0'">
      <div class="query-form">
        <el-alert
          description="此处统计的课时为正常的课时消耗情况，并不包含自己修正后的课时部分！"
          type="warning"
          style="margin-bottom:10px;">
        </el-alert>
        <el-input v-model.trim="queryForm.searchInput" v-if="currentTab === '0'" :maxlength="10" placeholder="请输入学生姓名"
                  class="input-with-select" style="margin-right: 16px;">
          <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
        </el-input>
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
        <span class="query-select-list select">
          <inline-select v-model="queryForm.courseId" @change="query" label="课程" valueAttr="id" labelAttr="name"
                         :loading="courseLoading" :options="courseList" @show="_getCourseList" filterable clearable/>
          <inline-select v-model="queryForm.classId" @change="query" label="班级" valueAttr="id" labelAttr="name"
                         :loading="classLoading" :options="classList" @show="_getClassList" filterable clearable/>
          <inline-select v-model="queryForm.teacherId" @change="query" label="任课老师" valueAttr="id" labelAttr="username"
                         :loading="teacherLoading" :options="teacherList" @show="_getTeacherList" filterable clearable/>
        </span>
        <el-button type="text" :disabled="!studentsQueryLoading ? false : true" @click="studentsResetForm" size="medium"
                   style="margin-left: 12px;">重&nbsp;置
        </el-button>
      </div>
      <el-radio-group v-model="studentMode" class="selectMode" @change="handleStudentsModeClick">
        <el-radio-button label="0">列表统计</el-radio-button>
        <el-radio-button label="1">图表统计</el-radio-button>
      </el-radio-group>
      <!-- 学生table表 -->
      <div v-show="studentMode !== '1'" class="showTableData">
        <el-table
          :data="studentsTableDataList"
          stripe
          v-loading="studentsQueryLoading"
          :show-summary="true"
          class="table"
          style="width: 100%">
          <el-table-column
            prop="studentName"
            label="姓名"
            align="left"
            width="200">
          </el-table-column>
          <el-table-column
            prop="classHour"
            align="center"
            label="应消耗课时"
          >
          </el-table-column>
          <el-table-column
            prop="usedClassHour"
            align="center"
            label="实际消耗课时"
          >
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="140">
            <template slot-scope="scope">
              <el-tooltip v-if="scope.row.classHour === 0" disabled class="item" effect="light"
                          content="因为实际消耗课时为0，所以暂无详情" placement="top">
                <el-button type="text" disabled size="small"> 详情</el-button>
              </el-tooltip>
              <el-button v-else @click="handleStudentsDetails(scope.row.studentId, scope.row.studentName)" type="text"
                         size="small"> 详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="bottom-pagination">
          <el-pagination
            @size-change="query"
            @current-change="_getStudentsCourseTimeBaseIn"
            :current-page.sync="pageNum"
            :page-sizes="[10, 20, 30, 40]"
            :page-size.sync="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
      <div v-show="studentMode === '1'" class="chart-block">
        <div class="echart-head">
          <div class="head-title"><span class="smallDot color"></span>应消耗课时</div>
          <div class="head-title"><span class="smallDot useColor"></span>已消耗课时</div>
        </div>
        <div class="echart">
          <div v-show="studentsTableDataList.length !== 0" id="studentsEchart" v-loading="studentsEchartsLoading"></div>
          <div v-show="studentsTableDataList.length === 0" class="echart-info">暂无数据</div>
        </div>
      </div>
    </div>

    <div v-show="currentTab === '1'">
      <div class="query-form">
        <el-date-picker
          v-model="teacherQueryForm.dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="打卡开始日期"
          end-placeholder="打卡结束日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="teacherQuery"
        >
        </el-date-picker>
        <span class="query-select-list select">
          <inline-select v-model="teacherQueryForm.courseId" @change="teacherQuery" label="课程" valueAttr="id"
                         labelAttr="name" :loading="courseLoading" :options="courseList" @show="_getCourseList"
                         filterable clearable/>
          <inline-select v-model="teacherQueryForm.classId" @change="teacherQuery" label="班级" valueAttr="id"
                         labelAttr="name" :loading="classLoading" :options="classList" @show="_getClassList" filterable
                         clearable/>
          <inline-select v-model="teacherQueryForm.teacherId" @change="teacherQuery" label="任课老师" valueAttr="id"
                         labelAttr="username" :loading="teacherLoading" :options="teacherList" @show="_getTeacherList"
                         filterable clearable/>
        </span>
        <el-checkbox v-model="teacherQueryForm.onlyValid" @change="teacherQuery">仅查看有排课老师</el-checkbox>
        <el-button type="text" :disabled="!teacherQueryLoading ? false : true" @click="teacherResetForm" size="medium"
                   style="margin-left: 12px;">重&nbsp;置
        </el-button>
      </div>
      <el-radio-group v-model="teacherMode" class="selectMode" @change="handleTeacherModeClick">
        <el-radio-button label="0">列表统计</el-radio-button>
        <el-radio-button label="1">图表统计</el-radio-button>
      </el-radio-group>
      <!-- 老师table -->
      <div v-show="teacherMode !== '1'" class="showTableData">
        <el-table
          :data="teacherTableDataList"
          stripe
          v-loading="teacherQueryLoading"
          :show-summary="true"
          class="table"
          style="width: 100%">
          <el-table-column
            prop="teacherName"
            label="姓名"
            align="left"
            width="200">
          </el-table-column>
          <el-table-column
            prop="classHour"
            align="center"
            label="应消耗课时"
          >
          </el-table-column>
          <el-table-column
            prop="usedClassHour"
            align="center"
            label="实际消耗课时"
          >
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="140">
            <template slot-scope="scope">
              <el-tooltip v-if="scope.row.usedClassHour === 0" disabled class="item" effect="light"
                          content="因为实际消耗课时为0，所以暂无详情" placement="top">
                <el-button type="text" disabled size="small"> 详情</el-button>
              </el-tooltip>
              <el-button v-else @click="handleTeacherDetails(scope.row.teacherId, scope.row.teacherName)" type="text"
                         size="small"> 详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="bottom-pagination">
          <el-pagination
            @size-change="teacherQuery"
            @current-change="_getTeacherCourseTimeBaseIn"
            :current-page.sync="teacherPageNum"
            :page-sizes="[10, 20, 30, 40]"
            :page-size.sync="teacherPageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="teacherTotal">
          </el-pagination>
        </div>
      </div>
      <div v-show="teacherMode === '1'" class="chart-block">
        <div class="echart-head">
          <div class="head-title"><span class="smallDot color"></span>应消耗课时</div>
          <div class="head-title"><span class="smallDot useColor"></span>已消耗课时</div>
        </div>
        <div class="echart">
          <div v-show="teacherTableDataList.length !== 0" id="teacherEchart" v-loading="teacherEchartsLoading"></div>
          <div v-show="teacherTableDataList.length === 0" class="echart-info">暂无数据</div>
        </div>
      </div>
    </div>
    <!-- 学生详情弹框 -->
    <el-dialog :title="studentsDetailsTitle + '课时详情'"
               :visible.sync="studentsDetailsDialogFormVisible"
               width="800px"
               :close-on-press-escape="false"
               custom-class="custom-dialog"
               :close-on-click-modal="false"
               @close="closeDetailsDialog"
    >
      <el-table
        :data="studentsDetailsTableDataList"
        v-loading="studentsDetailsTableLoading"
        stripe
        class="detailsTable"
        style="width: 100%">
        <el-table-column
          prop="courseName"
          align="center"
          label="课程名称"
          width="140"
          fixed
        >
          <template slot-scope="scope">
            <span>{{ scope.row.courseName || scope.row.oneCourseName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassDate"
          align="center"
          label="时间"
          width="140"
        >
        </el-table-column>
        <el-table-column
          prop="shouldSubClassHour"
          align="center"
          label="应扣除课时数"
          width="140"
        >
        </el-table-column>
        <el-table-column
          prop="realSubClassHour"
          align="center"
          label="实扣除课时数"
          width="140"
        >
        </el-table-column>
        <el-table-column
          prop="residueClassHour"
          align="center"
          label="剩余课时数"
          width="140"
        >
        </el-table-column>
        <el-table-column
          prop="callRollStatus"
          fixed="right"
          align="center"
          label="点名情况"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.callRollStatus === 0" type="success">到课</el-tag>
            <el-tag v-if="scope.row.callRollStatus === 1" type="info">缺课</el-tag>
            <el-tag v-if="scope.row.callRollStatus ===  2" type="warning">请假</el-tag>
            <el-tag v-if="scope.row.callRollStatus ===  3" type="warning">未点名</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="studentsDetilasQuery"
        @current-change="_getStudentsCourseTimeDetails"
        :current-page.sync="detailsPageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size.sync="detailsPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="detailsTotal">
      </el-pagination>
    </el-dialog>

    <!-- 老师详情弹框 -->
    <el-dialog :title="teacherDetailsTitle + '课时详情'"
               :visible.sync="teacherDetailsDialogFormVisible"
               custom-class="custom-dialog"
               width="800px"
               :close-on-press-escape="false"
               :close-on-click-modal="false"
               @close="closeDetailsDialog"
    >
      <el-table
        :data="teacherDetailsTableDataList"
        v-loading="teacherDetailsTableLoading"
        stripe
        class="detailsTable"
        style="width: 100%">
        <el-table-column
          prop="className"
          align="center"
          label="班级名称"
          width="150"
          fixed
        >
        </el-table-column>
        <el-table-column
          prop="courseName"
          align="center"
          label="课程名称"
          width="160"
        >
        </el-table-column>
        <el-table-column
          prop="classHour"
          align="center"
          label="消耗课时"
          width="120"
        >
        </el-table-column>
        <el-table-column
          prop="goToClassDate"
          align="center"
          label="上课日期"
          width="150"
        >
        </el-table-column>
        <el-table-column
          prop="goToClassStartTime"
          align="center"
          label="上课时间"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.goToClassStartTime }} ~ {{ scope.row.goToClassEndTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassStatus"
          align="center"
          label="上课状态"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.goToClassStatus === 0" type="warning">未授课</el-tag>
            <el-tag v-if="scope.row.goToClassStatus === 1" type="success">已授课</el-tag>
            <el-tag v-if="scope.row.goToClassStatus === 2" type="warning">部分点名</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="TeacherDetilasQuery"
        @current-change="_getTeacherCourseTimeDetails"
        :current-page.sync="detailsPageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size.sync="detailsPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="detailsTotal">
      </el-pagination>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import InlineSelect from '../../components/InlineSelect'
import echarts from 'echarts'
import { mapGetters } from 'vuex'

export default {
  name: '',
  components: {
    InlineSelect
  },
  data() {
    return {
      courseLoading: false, // 课程
      classLoading: false, // 班级
      teacherLoading: false, // 老师
      studentsQueryLoading: false, // 学生table表
      teacherQueryLoading: false, // 老师table表
      studentsDetailsDialogFormVisible: false, // 学生详情
      teacherDetailsDialogFormVisible: false, // 老师详情
      studentsDetailsTableLoading: false, // 学生详情table表
      teacherDetailsTableLoading: false, // 老师详情table表
      studentsEchartsLoading: false, // 学生echarts
      teacherEchartsLoading: false, // 老师echarts
      studentsEchart: null, // 学生echart
      teacherEchart: null, // 老师echart
      allStudentcourse: [], // 学生全部列表数据
      courseList: [], // 所有课程列表
      classList: [], // 所有班级列表
      teacherList: [], // 所有老师列表
      studentsTableDataList: [], // 学生table表
      teacherTableDataList: [], // 老师table表
      currentTab: '0', // tab栏
      studentMode: 0, // 选择模式： 0:列表模式 1：视图模式
      teacherMode: 0, // 选择模式： 0:列表模式 1：视图模式
      // 学生查询条件
      queryForm: {
        searchInput: '', // 搜索框输入的值
        dateRange: [], // 选择日期
        courseId: '', // 课程
        classId: '', // 班级
        teacherId: 0, // 老师
        classroomId: 0 // 教室
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      // 老师查询条件
      teacherQueryForm: {
        dateRange: [], // 选择日期
        courseId: '', // 课程
        classId: '', // 班级
        teacherId: 0, // 老师
        classroomId: 0, // 教室
        onlyValid: true //
      },
      teacherPageNum: 1,
      teacherPageSize: 10,
      teacherTotal: 0,
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
      },
      // 详情
      studentsDetailsTableDataList: [], // 学生详情table数据
      teacherDetailsTableDataList: [], // 老师详情table数据
      studentsDetailsTitle: '', // 学生详情弹框
      teacherDetailsTitle: '', // 老师详情弹框
      detailsID: 0, // 详情id
      detailsPageNum: 1,
      detailsPageSize: 10,
      detailsTotal: 0
    }
  },
  // 生命周期 - 创建完成
  created() {
    this.queryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this.teacherQueryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this._getStudentsCourseTimeBaseIn() // 获取学生的课时统计
  },
  // 相关方法
  methods: {
    handleClick(tab, event) {
    },
    // 获取课程列表
    _getCourseList() {
      if (this.courseList.length > 0) return
      this.courseLoading = true
      this.$http.get(`/v1/Course/getAllByDepartmentId`, { departmentId: this.currentBranch.id }).then(res => {
        this.courseList = res.data
      }).finally(() => {
        this.courseLoading = false
      })
    },
    // 获取班级列表
    _getClassList() {
      if (this.classList.length > 0) return
      this.classLoading = true
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id }).then(res => {
        this.classList = res.data
      }).finally(() => {
        this.classLoading = false
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
    // 学生查询条件
    query() {
      this.pageNum = 1
      this._getStudentsCourseTimeBaseIn()
    },
    // 老师查询条件
    teacherQuery() {
      this.teacherPageNum = 1
      this._getTeacherCourseTimeBaseIn()
    },
    // 获取学生课时统计
    _getStudentsCourseTimeBaseIn() {
      this.studentsQueryLoading = true
      const params = {
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        startTime: this.queryForm.dateRange[0] + ' 00:00:00',
        endTime: this.queryForm.dateRange[1] + ' 23:59:59',
        studentName: this.queryForm.searchInput
      }
      if (this.queryForm.courseId) { // 课程
        params.courseId = this.queryForm.courseId
      }
      if (this.queryForm.classId) { // 班级
        params.classId = this.queryForm.classId
      }
      if (this.queryForm.teacherId) { // 老师
        params.teacherId = this.queryForm.teacherId
      }
      this.$http.get('/v1/CourseTimeStatistics/getStudentCourseTimeBaseInfo', params).then((res) => {
        this.studentsTableDataList = res.data
        this.total = res.total
      }).finally(() => {
        this.studentsQueryLoading = false
      })
    },
    // 获取老师课时统计
    _getTeacherCourseTimeBaseIn() {
      this.teacherQueryLoading = true
      const params = {
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        pageNum: this.teacherPageNum,
        pageSize: this.teacherPageSize,
        startTime: this.teacherQueryForm.dateRange[0] + ' 00:00:00',
        endTime: this.teacherQueryForm.dateRange[1] + ' 23:59:59',
        onlyGoToClassTeacher: this.teacherQueryForm.onlyValid ? 1 : 0
      }
      if (this.teacherQueryForm.courseId) { // 课程
        params.courseId = this.teacherQueryForm.courseId
      }
      if (this.teacherQueryForm.classId) { // 班级
        params.classId = this.teacherQueryForm.classId
      }
      if (this.teacherQueryForm.teacherId) { // 老师
        params.teacherId = this.teacherQueryForm.teacherId
      }
      this.$http.get('/v1/CourseTimeStatistics/getTeacherClassHourStatistics', params).then((res) => {
        this.teacherTableDataList = res.data
        this.teacherTotal = res.total
      }).finally(() => {
        this.teacherQueryLoading = false
      })
    },
    // 学生详情
    handleStudentsDetails(id, name) {
      this.studentsDetailsTitle = name
      this.studentsDetailsDialogFormVisible = true
      this.detailsID = id
      this._getStudentsCourseTimeDetails()
    },
    // 老师详情
    handleTeacherDetails(id, name) {
      this.teacherDetailsTitle = name
      this.teacherDetailsDialogFormVisible = true
      this.detailsID = id
      this._getTeacherCourseTimeDetails()
    },
    // 学生详情分页
    studentsDetilasQuery() {
      this.detailsPageNum = 1
      this._getStudentsCourseTimeDetails()
    },
    // 老师详情分页
    TeacherDetilasQuery() {
      this.detailsPageNum = 1
      this._getTeacherCourseTimeDetails()
    },
    // 获取学生课时统计详情数据
    _getStudentsCourseTimeDetails() {
      this.studentsDetailsTableLoading = true
      let paramas = {
        startTime: this.queryForm.dateRange[0] + ' 00:00:00',
        endTime: this.queryForm.dateRange[1] + ' 23:59:59',
        pageNum: this.detailsPageNum,
        pageSize: this.detailsPageSize
      }
      if (this.queryForm.courseId) { // 课程
        paramas.courseId = this.queryForm.courseId
      }
      if (this.queryForm.classId) { // 班级
        paramas.classId = this.queryForm.classId
      }
      if (this.queryForm.teacherId) { // 老师
        paramas.teacherId = this.queryForm.teacherId
      }
      paramas.studentId = this.detailsID
      this.$http.get('/v1/CourseTimeStatistics/getStudentCourseCheckInByStudentIdAndTime', paramas).then((res) => {
        this.detailsTotal = res.total
        res.data.forEach(item => {
          item.goToClassDate = item.goToClassDate.split(' ')[0]
        })
        this.studentsDetailsTableDataList = res.data
      }).finally(() => {
        this.studentsDetailsTableLoading = false
      })
    },
    // 获取老师课时统计详情
    _getTeacherCourseTimeDetails() {
      this.teacherDetailsTableLoading = true
      const paramas = {
        startTime: this.teacherQueryForm.dateRange[0] + ' 00:00:00',
        endTime: this.teacherQueryForm.dateRange[1] + ' 23:59:59',
        pageNum: this.detailsPageNum,
        pageSize: this.detailsPageSize
      }
      paramas.teacherId = this.detailsID
      this.$http.get('/v1/CourseTimeStatistics/getTeacherCourseHourDetailByTeacherIdAndTime', paramas).then((res) => {
        this.detailsTotal = res.total
        res.data.forEach(item => {
          item.goToClassDate = item.goToClassDate.split(' ')[0]
        })
        this.teacherDetailsTableDataList = res.data
      }).finally(() => {
        this.teacherDetailsTableLoading = false
      })
    },
    // 弹出框关闭
    closeDetailsDialog() {
      this.detailsID = 0
      this.detailsPageNum = 1
      this.detailsPageSize = 10
    },
    // 学生重置
    studentsResetForm() {
      this.queryForm = {
        searchInput: '', // 搜索框输入的值
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        courseId: '', // 课程
        classId: '', // 班级
        teacherId: 0, // 老师
        classroomId: 0 // 教室
      }
      this.pageSize = 10
      this.pageNum = 1
      this._getStudentsCourseTimeBaseIn()
    },
    // 老师重置
    teacherResetForm() {
      this.teacherQueryForm = {
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')], // 选择日期
        courseId: '', // 课程
        classId: '', // 班级
        teacherId: 0, // 老师
        classroomId: 0, // 教室
        onlyValid: true
      }
      this.teacherPageNum = 1
      this.teacherPageSize = 10
      this._getTeacherCourseTimeBaseIn()
    },
    // 切换学生的列表模式和视图模式
    handleStudentsModeClick() {
      this._getStudentsTrendData()
    },
    // 切换老师的列表模式和视图模式
    handleTeacherModeClick() {
      this._getTeacherTrendData()
    },
    // 获取学生数据进行绘制echart
    _getStudentsTrendData() {
      if (this.studentMode === '1') {
        this.studentsEchartsLoading = true
        const params = {
          departmentId: this.currentBranch.id, // 所属分校ID
          organizationId: this.organizationInfo.id, // 所属机构ID
          startTime: this.queryForm.dateRange[0] + ' 00:00:00',
          endTime: this.queryForm.dateRange[1] + ' 23:59:59',
          studentName: this.queryForm.searchInput
        }
        if (this.queryForm.courseId) { // 课程
          params.courseId = this.queryForm.courseId
        }
        if (this.queryForm.classId) { // 班级
          params.classId = this.queryForm.classId
        }
        if (this.queryForm.teacherId) { // 老师
          params.teacherId = this.queryForm.teacherId
        }
        this.$http.get('/v1/CourseTimeStatistics/getStudentCourseTimeBaseInfo', params).then((res) => {
          this.allStudentcourse = res.data
          let data = this.allStudentcourse.map((item, index) => {
            return { name: item.studentName, hours: item.classHour, used: item.usedClassHour }
          })
          data.push({ name: ' ', hours: '', used: '' })
          data.unshift({ name: '', hours: '', used: '' })
          this.studentsEchart.setOption({
            dataset: {
              dimensions: ['name', 'hours', 'used'],
              source: data
            },
            series: [
              {
                name: '应消耗课时',
                type: 'bar',
                yAxisIndex: '0', // 第一个柱状图的数据
                label: {
                  show: true,
                  position: 'top'
                }
              },
              {
                name: '已消耗课时',
                type: 'bar',
                yAxisIndex: '0', // 第二个柱状图的数据 yAxisIndex设置为同一个值，共用一个y轴
                label: {
                  show: true,
                  position: 'top'
                }
              }
            ]
          })
        }).finally(() => {
          this.studentsEchartsLoading = false
        })
      }
    },
    // 初始化学生课时趋势图标
    initStudentsEchart() {
      this.studentsEchart = echarts.init(document.getElementById('studentsEchart'))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: [{
          top: '5%',
          left: '20px',
          right: '20px',
          bottom: '8%'
        }],
        dataZoom: [ // x轴数据过多时，滚动显示
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 80,
            xAxisIndex: [0]
          }
        ],
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
        yAxis: [
          {
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
        series: [
          {
            name: '课时统计',
            type: 'bar',
            // showBackground: true,
            barWidth: 15,
            barMaxWidth: 30,
            itemStyle: {
              normal: {
                color: '#91C7AE',
                borderColor: '#91C7AE'
              }
            }
          },
          {
            name: '课时统计',
            type: 'bar',
            // showBackground: true,
            barWidth: 15,
            barMaxWidth: 30,
            itemStyle: {
              normal: {
                color: '#D48265',
                borderColor: '#D48265'
              }
            }
          }
        ]
      }
      this.studentsEchart.setOption(option)
    },
    // 获取老师数据进行绘制echart
    _getTeacherTrendData() {
      if (this.teacherMode === '1') {
        this.teacherEchartsLoading = true
        const params = {
          departmentId: this.currentBranch.id, // 所属分校ID
          organizationId: this.organizationInfo.id, // 所属机构ID
          startTime: this.teacherQueryForm.dateRange[0] + ' 00:00:00',
          endTime: this.teacherQueryForm.dateRange[1] + ' 23:59:59',
          onlyGoToClassTeacher: this.teacherQueryForm.onlyValid ? 1 : 0
        }
        if (this.teacherQueryForm.courseId) { // 课程
          params.courseId = this.teacherQueryForm.courseId
        }
        if (this.teacherQueryForm.classId) { // 班级
          params.classId = this.teacherQueryForm.classId
        }
        if (this.teacherQueryForm.teacherId) { // 老师
          params.teacherId = this.teacherQueryForm.teacherId
        }
        this.$http.get('/v1/CourseTimeStatistics/getTeacherClassHourStatistics', params).then((res) => {
          this.allStudentcourse = res.data
          let data = this.allStudentcourse.map((item, index) => {
            return { name: item.teacherName, hours: item.classHour, used: item.usedClassHour }
          })
          data.push({ name: ' ', hours: '', used: '' })
          data.unshift({ name: '', hours: '', used: '' })
          this.teacherEchart.setOption({
            dataset: {
              dimensions: ['name', 'hours', 'used'],
              source: data
            },
            series: [
              {
                name: '应消耗课时',
                type: 'bar',
                yAxisIndex: '0', // 第一个柱状图
                label: {
                  show: true,
                  position: 'top'
                }
              },
              {
                name: '已消耗课时',
                type: 'bar',
                yAxisIndex: '0', // 第二个柱状图
                label: {
                  show: true,
                  position: 'top'
                }
              }
            ]
          })
        }).finally(() => {
          this.teacherEchartsLoading = false
        })
      }
    },
    // 初始化老师课时趋势图标
    initTeacherEchart() {
      this.teacherEchart = echarts.init(document.getElementById('teacherEchart'))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: [{
          top: '5%',
          left: '20px',
          right: '20px',
          bottom: '8%'
        }],
        dataZoom: [ // x轴数据过多时，滚动显示
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 80,
            xAxisIndex: [0]
          }
        ],
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
        yAxis: [
          {
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
        series: [
          {
            name: '课时统计',
            type: 'bar',
            // showBackground: true,
            barWidth: 15,
            barMaxWidth: 30,
            itemStyle: {
              normal: {
                color: '#91C7AE',
                borderColor: '#91C7AE'
              }
            }
          },
          {
            name: '课时统计',
            type: 'bar',
            // showBackground: true,
            barWidth: 15,
            barMaxWidth: 30,
            itemStyle: {
              normal: {
                color: '#D48265',
                borderColor: '#D48265'
              }
            }
          }
        ]
      }
      this.teacherEchart.setOption(option)
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {
    this.initStudentsEchart()
    this.initTeacherEchart()
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo'
    ])
  },
  watch: {
    currentTab() {
      if (this.currentTab === '0') {
        this._getStudentsCourseTimeBaseIn()
      } else {
        this._getTeacherCourseTimeBaseIn()
      }
    },
    // 监听学生课时统计参数：eacher表
    queryForm: {
      handler: function () {
        if (this.studentMode === '1') {
          this._getStudentsTrendData()
        }
      },
      deep: true
    },
    // 监听老师课时统计参数：eacher表
    teacherQueryForm: {
      handler: function () {
        if (this.teacherMode === '1') {
          this._getTeacherTrendData()
        }
      },
      deep: true
    }
  }
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.detailsTable
  margin 0 0 20px 0

.select
  margin 0 0 0 30px

.tab
  width 200px

.selectMode
  padding 14px 0 0px 14px
  width 100%
  background #ffffff
  display flex
  align-items center

// 视图模式下echart的title
.chart-block
  margin 0px 0 0 0
  background #ffffff

  .echart-head
    margin 0 0 20px 14px
    padding 20px 20px 0 0
    display flex
    justify-content flex-start
    align-items center

    .head-title
      font-style normal
      -webkit-font-smoothing antialiased
      font-size 14px
      font-weight bold
      display flex
      align-items center
      margin 0 14px 0 0

      .smallDot
        display block
        width 10px
        height 10px
        border-radius 10px
        margin 0 14px 0 0

      .color
        background #91C7AE

      .useColor
        background #D48265

  .echart
    display flex
    justify-content center
    background #ffffff

    #studentsEchart
      width calc(100vw - 208px)
      padding 0px 20px 0
      flex 1
      height 454px
      margin 0 auto

    #teacherEchart
      width calc(100vw - 208px)
      padding 0px 20px 0
      flex 1
      height 454px
      margin 0 auto

    .echart-info
      color #909399
      font-size 12px
      line-height 60px

.showTableData
  background #fff
  padding 14px
</style>

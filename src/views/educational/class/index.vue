<template>
  <div class="class-wrapper">
    <div class="query-form">
      <el-input v-model="queryForm.name" :maxlength="30" :placeholder="'请输入班级名称'" @keyup.native.enter="handleSimpleSearch" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="handleSimpleSearch"></el-button>
      </el-input>
      <el-button type="primary" style="float: right" icon="el-icon-plus"  @click="handleAddData">添加班级</el-button>
      <div class="query-select-list">
        <inline-select :options="option.userOptions" label="班主任" v-model="queryForm.headmaster" @change="handleSimpleSearch" filterable clearable :loading="loading.userLoading"></inline-select>
        <inline-select :options="option.courseOptions" label="课程" v-model="queryForm.courseId" @change="handleSimpleSearch" filterable clearable :loading="loading.courseLoading"></inline-select>
        <inline-select :options="option.userOptions" label="上课老师" v-model="queryForm.teacherId" @change="handleSimpleSearch" filterable clearable :loading="loading.userLoading"></inline-select>
        <inline-select
          :options="option.classroomOptions"
          label="教室"
          v-model="queryForm.classroomId"
          @change="handleSimpleSearch"
          valueAttr="id"
          labelAttr="name"
          filterable
          clearable
          :loading="loading.classroomLoading"
        ></inline-select>
        <el-divider direction="vertical"></el-divider>
        <el-radio-group v-model="queryForm.studentOverflow" v-if="studentOverflowVaild">
          <el-radio :label="1" @click.native="handleStudentOverflowRadioClick(1)">满班</el-radio>
          <el-radio :label="0" @click.native="handleStudentOverflowRadioClick(0)">未满班</el-radio>
        </el-radio-group>
        <el-divider direction="vertical"></el-divider>
        <el-button type="text" :disabled="!tableLoading ? false : true" @click="handleSimpleSearchReset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
        <el-button type="text" :disabled="!tableLoading ? false : true" @click="handleSimpleSearch" size="medium" style="margin-left: 12px;">刷&nbsp;新</el-button>
      </div>
    </div>
    <div style="margin-top: 10px; background-color: #fff; padding: 15px">
      <el-table ref="multipleDataTable" :data="tableData" style="width: 100%" @sort-change="handleSortChange" v-loading="tableLoading">
        <el-table-column prop="name" label="班级名称" min-width="180" sortable fixed="left"></el-table-column>
        <el-table-column prop="courseName" label="课程" min-width="180" align="center"></el-table-column>
        <el-table-column prop="headmasterName" label="班主任" min-width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.headmasterName">{{scope.row.headmasterName}}</span>
            <el-tag v-else type="danger">还未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="班级容量" width="70" align="center"></el-table-column>
        <el-table-column prop="volume" label="班级人数" width="80" align="center">
          <template slot-scope="scope">{{scope.row.studentCount}}/{{scope.row.volume}}</template>
        </el-table-column>
        <el-table-column prop="volume" label="教学进度" width="80" align="center">
          <template slot-scope="scope">{{scope.row.alreadyCourseTimeCount}}/{{scope.row.totalCourseTimeCount}}</template>
        </el-table-column>
        <el-table-column prop="classDate" label="计划开班日期" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ moment(scope.row.classDate).format('YYYY-MM-DD')}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="上课老师" min-width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.teacherName">{{scope.row.teacherName}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="classroomName" label="教室名称" min-width="180" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.classroomName">{{scope.row.classroomName}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" sortable></el-table-column>
        <el-table-column label="操作" align="center" width="170" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleClassStudentDetail(scope.row, scope.$index)">本班学员</el-button>
            <el-button type="text" size="mini" @click="handleClassTimeDetail(scope.row, scope.$index)">本班课表</el-button>
            <el-dropdown type="text" @command="com => handleOperationCommand(com, scope.row, scope.$index)" style="margin-left: 10px">
              <el-button type="text" size="mini">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command='edit'>编 &nbsp;&nbsp;&nbsp;&nbsp; 辑</el-dropdown-item>
                <el-dropdown-item command='delete'>删 &nbsp;&nbsp;&nbsp;&nbsp; 除</el-dropdown-item>
                <el-dropdown-item divided command='addHomework'>布置作业</el-dropdown-item>
                <el-dropdown-item command='viewClassRecord'>上课记录</el-dropdown-item>
                <el-dropdown-item command='viewSign'>签到记录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 10px;"
      ></el-pagination>
    </div>
    <el-dialog :title="editDialogTitle" custom-class="custom-dialog" :visible.sync="editDialogVisible" :width="(currentStep === 1 && '750px') || (currentStep === 2 && '1170px') || null" :close-on-click-modal="false" top="5vh">
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="1. 编辑班级信息"></el-step>
        <el-step title="2. 分配学员"></el-step>
      </el-steps>
      <!-- 班级信息编辑 -->
      <div v-show="currentStep === 1" style="display: flex; justify-content: center;">
        <el-form :model="editForm" ref="editForm" label-width="120px" :rules="formRules">
          <el-form-item label="班级名称" prop="name">
            <el-input v-model="editForm.name" :maxlength="50" autocomplete="off" :style="{ width: formItemWidth }" placeholder="请输入班级名称"></el-input>
          </el-form-item>
          <el-form-item label="班主任" prop="headmaster">
            <el-select v-model="editForm.headmaster" filterable clearable placeholder="请选择或搜索" :loading="loading.userLoading" :style="{ width: formItemWidth }">
              <el-option v-for="item in option.userOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-popover
              width="200"
              trigger="hover">
              <!-- <span>无可选班主任？请点击<span class="jump-link-text" @click="handleJumpTo({ path: '/executive/staff' })">员工管理</span>进行添加</span> -->
              <span>无可选班主任？请点击<span class="jump-link-text" @click="showClassAddStaffDialog = true">员工管理</span>进行添加</span>
              <i slot="reference" class="el-icon-circle-plus color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
            <el-popover
              width="200"
              trigger="hover">
            <span>班主任必填主要用于【校讯帮】查看班级学员花名册及限制部分教师可看问题。</span>
              <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
          </el-form-item>
          <el-form-item label="课程" prop="courseId">
            <el-select v-model="editForm.courseId" filterable clearable placeholder="请选择或搜索" :loading="loading.courseLoading" :style="{ width: formItemWidth }" @change="handleCourseOptionChange">
              <el-option v-for="item in option.courseOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-popover width="200" trigger="hover">
              <span>
                无可选课程？请点击
                <span class="jump-link-text" @click="showCourseForm = true">课程管理</span>进行添加
              </span>
              <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;" />
            </el-popover>
          </el-form-item>
          <el-form-item label="最大人数" prop="volume" v-loading="volumeLoading">
            <el-input-number v-model.number="editForm.volume" :min="0" :max="2000" :style="{ width: '150px' }" :disabled="giveLessonsWay === 0"></el-input-number>&nbsp;&nbsp;&nbsp;
            <span v-if="giveLessonsWay === 0" class="form-item-tip">已选择了一对一的课程</span>
            <span v-else-if="giveLessonsWay === 1" class="form-item-tip">本班最多可以容纳的人数</span>
          </el-form-item>
          <el-form-item label="上课老师" prop="teacherId">
            <el-select v-model="editForm.teacherId" filterable clearable placeholder="请选择或搜索" :style="{ width: formItemWidth }" :loading="loading.userLoading">
              <el-option v-for="item in option.userOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="教室" prop="classroomId">
            <el-select v-model="editForm.classroomId" filterable clearable placeholder="请选择或搜索" :style="{ width: formItemWidth }" :loading="loading.classroomLoading">
              <el-option v-for="item in option.classroomOptions" :key="item.id" :label="item.name" :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">容量: {{ item.volume }}人</span>
              </el-option>
            </el-select>
            <el-popover
              width="200"
              trigger="hover">
              <span>无可选教室？请点击<span class="jump-link-text" @click="showClassroomEditDialog = true">基础设置</span>进行添加</span>
              <i slot="reference" class="el-icon-circle-plus color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="editForm.sort" controls-position="right" :step="1" :min="-100" :max="10000" />
          </el-form-item>
          <el-form-item label="计划开班日期" prop="classDate">
            <el-date-picker v-model="editForm.classDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" :style="{ width: formItemWidth }"></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <!-- 班级分配学员 -->
      <student-allocation v-if="currentStep === 2" :classId="studentAllocation.classId"></student-allocation>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <div v-if="currentStep === 1">
          <el-button @click="closeDialog">取&nbsp;&nbsp;消</el-button>
          <el-button type="primary" @click="handleEditFormSubmit" :loading="submitBtnLoading">下&nbsp;一&nbsp;步</el-button>
        </div>
        <div v-else-if="currentStep === 2">
          <el-button @click="currentStep--">上&nbsp;一&nbsp;步</el-button>
          <el-button type="primary" @click="closeDialog">完&nbsp;&nbsp;成</el-button>
        </div>
      </div>
    </el-dialog>
    <class-detail-dialog v-model="classDetialVisible" :classData="currentClass" :activeTab="classDetialActiveTab" />
    <!-- 班级管理下直接添加课程新增 -->
    <course-dialog v-model="showCourseForm" @success="getCourseList"></course-dialog>
    <!-- 班级管理下直接新增教室 -->
    <classroom-edit-dialog v-model="showClassroomEditDialog" @success="getClassroomList"></classroom-edit-dialog>
    <!-- 班级管理下直接添加员工 -->
    <class-add-staff-dialog v-model="showClassAddStaffDialog"  @success="getUserList"></class-add-staff-dialog>
  </div>
</template>

<script>
import ClassroomEditDialog from '../../basicInfo/classroom/ClassroomEditDialog'
import ClassAddStaffDialog from '../components/ClassAddStaffDialog'
import InlineSelect from '@/components/InlineSelect'
import StudentAllocation from './StudentAllocation'
import ClassDetailDialog from './ClassDetailDialog'
import moment from 'moment'
import lodash from 'lodash'
import { setTimeout } from 'timers'
// 新增课程
import CourseDialog from '../course/courseManagement/CourseDialog'
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    {
      type: 'string',
      min: 1,
      max: 50,
      message: '长度在1至16位',
      trigger: 'blur'
    }
  ],
  headmaster: [
    { type: 'string', required: true, message: '请选择班主任', trigger: 'blur' }
  ],
  courseId: [
    { type: 'string', required: true, message: '请选择课程', tigger: 'blur' }
  ],
  volume: [
    {
      type: 'number',
      required: true,
      validator: (rule, value, callback) => {
        if (value < 1) {
          callback(new Error('最大人数不能小于1'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  classDate: [
    {
      type: 'string',
      required: true,
      message: '请设置计划开班日期',
      trigger: 'blur'
    }
  ]
}
export default {
  name: 'Class',
  components: {
    [InlineSelect.name]: InlineSelect,
    StudentAllocation,
    ClassDetailDialog,
    CourseDialog,
    ClassroomEditDialog,
    ClassAddStaffDialog
  },
  provide() {
    return {
      refreshClassTable: this._getTableData
    }
  },
  data() {
    return {
      showClassAddStaffDialog: false,
      showClassroomEditDialog: false, // 新增教室
      showCourseForm: false, // 新增课程
      classDetialActiveTab: 'classStudentTable',
      classDetialVisible: false,
      studentOverflowVaild: true,
      moment,
      volumeLoading: false,
      currentClass: {},
      currentStep: 1,
      inputItemWidth: '300px',
      /** 表格相关 */
      tableLoading: false, // 表格的加载标志
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      tableData: [],
      /** 搜索相关 */
      queryForm: {
        name: '', // 班级名称
        headmaster: '', // 班主任id
        courseId: '', // 课程id
        teacherId: '', // 上课老师id
        classroomId: '', // 所在教室id
        studentOverflow: null // 是否满班
      },
      option: {
        classroomOptions: [], // 所有教室的选项
        courseOptions: [], // 所有课程的选项
        userOptions: [] // 所有员工的选项
      },
      loading: {
        classroomLoading: false,
        courseLoading: false,
        userLoading: false
      },
      currentQueryFunc: () => {}, // 使用闭包，保留上一次调用_getTableData()传入的查询参数（区别于分页参数），应该在分页数据变化时调用
      /** 编辑表单相关 */
      giveLessonsWay: -1, // 授课方式: 0--一对一; 1--一对多; -1--请先选择课程
      submitBtnLoading: false, // 提交按钮加载状态标志
      currentFormOperation: '', // update--修改， add--新增
      isRepeatAddClass: true,
      addClassId: null,
      editDialogVisible: false, // 编辑表单的显示标志
      formRules: rules,
      formItemWidth: '300px',
      editForm: {
        id: null,
        name: '', // 班级名称
        headmaster: '', // 班主任id
        courseId: '', // 课程id
        teacherId: '', // 上课老师id
        classroomId: '', // 所在教室id
        volume: 0, // 最大人数
        sort: 0,
        classDate: '' // 计划开班日期
      },
      studentAllocation: {
        courseId: null,
        classId: null
      },
      recover: {
        recoverable: false,
        dataCopy: null
      },
      actionSign: 0,
      sortName: '', // 排序字段名
      sortType: 0 // 排序类型
    }
  },
  computed: {
    departmentId() {
      return (
        this.$store.getters.currentBranch &&
        this.$store.getters.currentBranch.id
      )
    },
    organizationId() {
      return (
        this.$store.getters.organizationInfo &&
        this.$store.getters.organizationInfo.id
      )
    },
    editDialogTitle() {
      let tmpTitle = ''
      if (this.currentFormOperation === 'add') {
        tmpTitle =
          (this.currentStep === 1 && '新增班级') ||
          (this.currentStep === 2 && `学员分班`)
      } else if (this.currentFormOperation === 'update') {
        tmpTitle =
          (this.currentStep === 1 && '修改班级') ||
          (this.currentStep === 2 && `学员分班`)
      }
      return tmpTitle
    }
  },
  watch: {
    // 当重选校区时，更新表格数据和选项数据
    departmentId(val) {
      if (val) {
        this._updateQueryOption()
        this.pagination.pageNum = 1
        this._getTableData({})
      }
    }
  },
  // 当切换路由时，更新选项信息
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.recover.recoverable) {
        Object.keys(vm.recover.dataCopy).forEach((item) => {
          vm[item] = vm.recover.dataCopy[item]
        })
      }
      vm.recover.recoverable = false
      vm._updateQueryOption()
    })
  },
  created() {
    this._getTableData({})
  },
  methods: {
    /** 表格相关的操作 */
    _getTableData(queryParams = {}) {
      this.currentQueryFunc = this._queryFunc(queryParams)
      this.currentQueryFunc(this.pagination)
    },
    _queryFunc(queryParams) {
      const _self = this
      return function (pagination) {
        _self.tableLoading = true
        const params = Object.assign({}, queryParams, pagination, {
          departmentId: this.departmentId
        })

        if (this.sortName === 'name') {
          if (this.sortType === 'descending') params.nameSortType = 1
          if (this.sortType === 'ascending') params.nameSortType = 0
        }
        if (this.sortName === 'sort') {
          if (this.sortType === 'descending') params.valueSortType = 1
          if (this.sortType === 'ascending') params.valueSortType = 0
        }
        _self.$http
          .get('/v1/Class/getClassList', params)
          .then((res) => {
            _self.tableData = res.data
            _self.total = res.total
          })
          .finally(() => {
            _self.tableLoading = false
          })
      }
    },
    // 快速布置作业
    handleQuickAddHomework(row, index) {
      this.$router.push({
        path: '/classService/preparation',
        query: {
          classId: row.id
        }
      })
    },
    // 查看上课记录
    handleViewClassRecord(row, index) {
      this.$router.push({
        path: '/classService/classRecord',
        query: {
          classId: row.id
        }
      })
    },
    // 查看学员考勤记录
    handleViewSign(row, index) {
      this.$router.push({
        path: '/classService/studentSign',
        query: {
          classId: row.id
        }
      })
    },
    handleTableEdit (row, index) {
      if (!this.departmentId) {
        this.$message.warning('请先选择校区')
        return
      }
      this.currentClass = row
      this.$http
        .get('/v1/Course/getCourseById', { id: row.courseId })
        .then((res) => {
          this.giveLessonsWay = res.data.giveLessonsWay
        })
      this.editForm = JSON.parse(JSON.stringify(row))
      // 匹配老师和班主任现在是否还在职
      let headmasterInfo = this.option.userOptions.find(item => item.value === this.editForm.headmaster)
      this.editForm.headmaster = headmasterInfo ? headmasterInfo.value : ''
      let teacherInfo = this.option.userOptions.find(item => item.value === this.editForm.teacherId)
      this.editForm.teacherId = teacherInfo ? teacherInfo.value : ''
      // 匹配课程是是否上下架
      let courseInfo = this.option.courseOptions.find(item => item.value === this.editForm.courseId)
      this.editForm.courseId = courseInfo ? courseInfo.value : ''
      // 匹配教室是否存在
      let classroomInfo = this.option.classroomOptions.find(item => item.id === this.editForm.classroomId)
      this.editForm.classroomId = classroomInfo ? classroomInfo.id : ''

      this.currentFormOperation = 'update'
      this.$refs.editForm && this.$refs.editForm.clearValidate()
      this.currentStep = 1
      this.editDialogVisible = true
    },
    handleTableDelete(row, index) {
      // 删除函数
      const deleteFunc = () => {
        this.$http.delete('/v1/Class/deleteById/' + row.id).then(() => {
          this.tableData.splice(index, 1)
          this.total--
          this.$message.success(`班级数据，【${row.name}】删除成功`)
        })
      }
      // 根据未上课课时数确定删除逻辑
      if (row.residueCourseTimeCount > 0) {
        this.$confirm(`班级【${row.name}】仍有未上的课时，如果继续删除该班级将会连带已排的课及班级关联的学员关系都会被删除，是否继续？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFunc()
        })
      } else {
        this.$confirm(`此操作将删除班级【${row.name}】，并将删除与之相关的历史排课数据，是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFunc()
        }).catch(() => {})
      }
    },
    // 每页条数变更事件
    handleSizeChange(value) {
      this.pagination.pageSize = value
      this.currentQueryFunc(this.pagination)
    },
    // 页码变更事件
    handleCurrentChange(value) {
      this.pagination.pageNum = value
      this.currentQueryFunc(this.pagination)
    },
    handleAddData() {
      if (!this.departmentId) {
        this.$message.warning('请先选择校区')
        return
      }
      this.giveLessonsWay = -1
      this.editForm = {
        id: null,
        name: '',
        headmaster: '',
        courseId: '',
        teacherId: '',
        classroomId: '',
        volume: 0,
        sort: 1,
        classDate: ''
      }
      this.currentFormOperation = 'add'
      this.currentStep = 1
      this.$refs.editForm && this.$refs.editForm.clearValidate()
      this.editDialogVisible = true
    },
    handleClassStudentDetail(row) {
      this.currentClass = row
      this.classDetialActiveTab = 'classStudentTable'
      this.classDetialVisible = true
    },
    handleClassTimeDetail(row) {
      this.currentClass = row
      this.classDetialActiveTab = 'classTimeTable'
      this.classDetialVisible = true
    },
    /** 搜索相关的操作 */
    _updateQueryOption() {
      this._getClassroomOption(true)
      this._getCourseOption(true)
      this._getUserOption(true)
    },
    _getClassroomOption(isUpdate) {
      if (isUpdate) this.option.classroomOptions = [] // 更新操作
      if (this.option.classroomOptions.length > 0) return
      // 教室
      this.loading.classroomLoading = true
      this.$http
        .get('/v1/Classroom/getClassroomListByOrgIdOrDepId', {
          depId: this.departmentId,
          orgId: this.organizationId
        })
        .then((res) => {
          this.option.classroomOptions = res.data
        })
        .finally(() => {
          this.loading.classroomLoading = false
        })
    },
    _getCourseOption(isUpdate) {
      if (isUpdate) this.option.courseOptions = []
      if (this.option.courseOptions.length > 0) return
      // 课程
      this.loading.courseLoading = true
      this.$http
        .get('/v1/Course/getCourseList/' + this.departmentId, { status: 1 })
        .then((res) => {
          res.data.forEach((item) => {
            this.option.courseOptions.push({ value: item.id, label: item.name })
          })
        })
        .finally(() => {
          this.loading.courseLoading = false
        })
    },
    _getUserOption(isUpdate) {
      if (isUpdate) this.option.userOptions = []
      if (this.option.userOptions.length > 0) return
      // 班主任、老师、助教
      this.loading.userLoading = true
      this.$http
        .get('/v1/User/getByUserLogo', {
          userLogo: 1,
          departmentId: this.departmentId,
          organizationId: this.organizationId
        })
        .then((res) => {
          res.data.forEach((item) => {
            this.option.userOptions.push({
              value: item.id,
              label: item.username
            })
          })
        })
        .finally(() => {
          this.loading.userLoading = false
        })
    },
    handleSimpleSearch() {
      this.pagination.pageNum = 1
      let params = lodash.cloneDeep(this.queryForm)
      for (let item in params) {
        if (params[item] == null || params[item].toString().trim() === '') {
          delete params[item]
        }
      }
      this._getTableData(params)
    },
    // 重置搜索表单
    handleSimpleSearchReset() {
      this.queryForm.name = ''
      this.queryForm.headmaster = ''
      this.queryForm.courseId = ''
      this.queryForm.teacherId = ''
      this.queryForm.classroomId = ''
      this.queryForm.studentOverflow = null
      this.handleSimpleSearch()
    },
    handleEditFormSubmit() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          if (this.currentFormOperation === 'add' && this.isRepeatAddClass) {
            this.submitBtnLoading = true
            this.$http
              .post(
                '/v1/Class/addClass',
                Object.assign({}, this.editForm, {
                  departmentId: this.departmentId,
                  organizationId: this.organizationId
                })
              )
              .then((res) => {
                this.addClassId = res.data
                this.$message.success('班级新增成功')
                this.pagination.pageNum = 1
                this._getTableData()
                this.currentStep++
                this.studentAllocation.courseId = this.editForm.courseId
                this.studentAllocation.classId = res.data
                this.isRepeatAddClass = false
              })
              .finally(() => {
                this.submitBtnLoading = false
              })
          } else if (this.currentFormOperation === 'add' && !this.isRepeatAddClass) {
            this.editForm.id = this.addClassId
            this.$http
              .put(
                '/v1/Class/updateClass',
                Object.assign({}, this.editForm, {
                  departmentId: this.departmentId,
                  organizationId: this.organizationId
                })
              )
              .then((res) => {
                this.pagination.pageNum = 1
                this._getTableData()
                this.currentStep++
                this.studentAllocation.courseId = this.editForm.courseId
                this.studentAllocation.classId = this.editForm.id
              })
              .finally(() => {
              })
          } else if (this.currentFormOperation === 'update') {
            this.submitBtnLoading = true
            this.$http
              .put(
                '/v1/Class/updateClass',
                Object.assign({}, this.editForm, {
                  departmentId: this.departmentId,
                  organizationId: this.organizationId
                })
              )
              .then((res) => {
                this.$message.success('班级修改成功')
                this.pagination.pageNum = 1
                this._getTableData()
                this.currentStep++
                this.studentAllocation.courseId = this.editForm.courseId
                this.studentAllocation.classId = this.editForm.id
              })
              .finally(() => {
                this.submitBtnLoading = false
                // this.editDialogVisible = false
              })
          }
        } else {
          return false
        }
      })
    },
    closeDialog() {
      this.editDialogVisible = false
      this.currentFormOperatio = '' // update--修改， add--新增
      this.isRepeatAddClass = true
      this.addClassId = null
    },
    handleCourseOptionChange(item) {
      if (item) {
        this.volumeLoading = true
        this.$http
          .get('/v1/Course/getCourseById', { id: item })
          .then((res) => {
            this.giveLessonsWay = res.data.giveLessonsWay
            if (this.giveLessonsWay === 0) {
              this.editForm.volume = 1
            } else {
              this.editForm.volume = 0
            }
          })
          .finally(() => {
            this.volumeLoading = false
          })
      }
    },
    handleStudentOverflowRadioClick(val) {
      if (this.queryForm.studentOverflow === val) {
        this.queryForm.studentOverflow = null
        this.studentOverflowVaild = false
        this.$nextTick(() => {
          this.studentOverflowVaild = true
        })
      }
      this._actionOnce(this.handleSimpleSearch)
    },
    /**
     *  当在很短的时间（小于50ms）执行两次时，传入的函数（func）, 只执行一次
     */
    _actionOnce(func) {
      this.actionSign++
      setTimeout(() => {
        if (this.actionSign === 2) {
          this.actionSign = 0
          func()
        }
      }, 50)
    },
    handleOperationCommand(com, row, index) {
      switch (com) {
        case 'edit':
          this.handleTableEdit(row, index)
          break
        case 'delete':
          this.handleTableDelete(row, index)
          break
        case 'addHomework':
          this.handleQuickAddHomework(row, index)
          break
        case 'viewClassRecord':
          this.handleViewClassRecord(row, index)
          break
        case 'viewSign':
          this.handleViewSign(row, index)
          break
        default:
      }
    },
    handleJumpTo(params) {
      this.recover.recoverable = true
      this.recover.dataCopy = {
        editForm: lodash.cloneDeep(this.editForm),
        editDialogVisible: this.editDialogVisible
      }
      this.editDialogVisible = false
      this.$router.push(params)
    },
    // 排序处理
    handleSortChange({ column, prop, order }) {
      this.sortName = prop
      this.sortType = order

      this.handleSimpleSearch()
    },
    // 新增窗口后重新请求数据
    getCourseList() {
      this._getCourseOption(true)
    },
    // 新增教室后重新请求教室数据
    getClassroomList() {
      this._getClassroomOption(true)
    },
    // 新增员工后刷新
    getUserList() {
      this._getUserOption(true)
    }
  }
}
</script>

<style lang="stylus" scoped>
.jump-link-text
  color $color-primary
  cursor pointer
.form-item-tip
  display inline-block
  color $color-text-3
.el-steps
  padding-top 9px
  padding-bottom 9px
  border-radius 40px
  background #eff3fa
  width 380px
  margin 0 auto
  margin-bottom 30px
  .el-step__head.is-process
    color $color-primary
    border-color $color-primary
.el-dialog
  .dialog-footer
    .el-button
      padding 9px 30px
      margin-right 30px
    .el-button:last-child
      margin-right 0px
</style>

<style lang="stylus">
.class-wrapper
  .el-step__head
    display none
  .el-step__title.is-process
    color $color-primary
    border-color $color-primary
</style>

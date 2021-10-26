<template>
  <el-dialog
    :title="alreadyClassName ? '选择班级(当前班级:' + alreadyClassName + ')': '选择班级'"
    :visible="value"
    :close-on-click-modal="false"
    @open="reset"
    @close="$emit('toggle', false)"
    top="10vh"
    width="880px"
    append-to-body
    custom-class="select-classs-dialog">
    <div class="query-form">
      <el-input v-model="queryForm.name" :maxlength="30" placeholder="请输入班级名称" @keyup.native.enter="query"
                class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <inline-select v-model="queryForm.teacherId" :options="teacherList" @show="_getTeacherList"
                     :loading="loadingTeacher" @change="query" label="上课老师" valueAttr="id" labelAttr="username"
                     filterable clearable/>
      <el-button type="text" @click="reset" size="medium" style="margin-left: 24px;">重&nbsp;置</el-button>
    </div>
    <el-table
      ref="table"
      :data="classList"
      v-loading="tableloading"
      height="400px"
      border
      style="width: 100%">
      <el-table-column label="" width="40" align="center">
        <el-radio slot-scope="scope" :label="scope.row.id" v-model="currentClassId"></el-radio>
      </el-table-column>
      <el-table-column
        prop="name"
        label="班级名称"
      ></el-table-column>
      <el-table-column
        prop="courseName"
        label="课程"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="headmasterName"
        label="班主任"
        align="center"
        width="88"
      ></el-table-column>
      <el-table-column
        prop="teacherName"
        label="上课老师"
        align="center"
        width="88"
      ></el-table-column>
      <el-table-column
        prop="classroomName"
        label="教室名称"
        align="center"
        width="104"
      ></el-table-column>
      <el-table-column
        prop="volume"
        label="班级人数"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.studentCount }}/{{ scope.row.volume }}
        </template>
      </el-table-column>
      <el-table-column
        prop="alreadyCourseTimeCount"
        label="教学进度"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.alreadyCourseTimeCount }}/{{ scope.row.totalCourseTimeCount }}
        </template>
      </el-table-column>
      <el-table-column
        prop="classDate"
        label="计划开班日期"
        width="96"
        align="center"
      >
      </el-table-column>
      <p slot="empty">暂无数据，去<a class="link" @click="handleToClass" style="margin-left: 6px;">添加班级</a></p>
    </el-table>
    <div slot="footer">
      <div class="bottom-btns">
        <el-pagination
          @size-change="query"
          @current-change="_getClassList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
        <div>
          <el-button @click="$emit('toggle', false)">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </div>
      </div>
    </div>
    <el-dialog
      title="新增班级"
      :visible="showAddClassInfo"
      :show-close="false"
      top="10vh"
      append-to-body
      width="750px"
      custom-class="select-classs-dialog">
      <el-form :model="editForm" ref="editForm" label-width="220px" :rules="formRules">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model.trim="editForm.name" :maxlength="30" autocomplete="off" :style="{ width: formItemWidth }"
                    placeholder="请输入班级名称"></el-input>
        </el-form-item>
        <el-form-item label="班主任" prop="headmaster">
          <el-select v-model="editForm.headmaster" filterable clearable placeholder="请选择或搜索"
                     :loading="loading.userLoading" :style="{ width: formItemWidth }">
            <el-option v-for="item in option.userOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
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
          <el-select v-model="editForm.courseId" filterable clearable placeholder="请选择或搜索"
                     :loading="loading.courseLoading" :style="{ width: formItemWidth }"
                     @change="handleCourseOptionChange">
            <el-option v-for="item in option.courseOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
          <el-popover width="200" trigger="hover">
              <span>
                无可选课程？请点击
                <span class="jump-link-text" @click="showCourseForm = true">课程管理</span>进行添加
              </span>
            <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="最大人数" prop="volume" v-loading="volumeLoading">
          <el-input-number v-model.number="editForm.volume" :min="0" :max="2000" :style="{ width: '150px' }"
                           :disabled="giveLessonsWay === 0"></el-input-number>&nbsp;&nbsp;&nbsp;
          <span v-if="giveLessonsWay === 0" class="form-item-tip">已选择了一对一的课程</span>
          <span v-else-if="giveLessonsWay === 1" class="form-item-tip">本班最多可以容纳的人数</span>
        </el-form-item>
        <el-form-item label="上课老师" prop="teacherId">
          <el-select v-model="editForm.teacherId" filterable clearable placeholder="请选择或搜索"
                     :style="{ width: formItemWidth }" :loading="loading.userLoading">
            <el-option v-for="item in option.userOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教室" prop="classroomId">
          <el-select v-model="editForm.classroomId" filterable clearable placeholder="请选择或搜索"
                     :style="{ width: formItemWidth }" :loading="loading.classroomLoading">
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
          <el-input-number v-model="editForm.sort" controls-position="right" :step="1" :min="-100" :max="10000"/>
        </el-form-item>
        <el-form-item label="计划开班日期" prop="classDate">
          <el-date-picker v-model="editForm.classDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" type="date"
                          placeholder="选择日期" :style="{ width: formItemWidth }"></el-date-picker>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="wipeCache">取&nbsp;&nbsp;消</el-button>
        <el-button type="primary" @click="handleEditFormSubmit('editForm')" :loading="submitBtnLoading">完&nbsp;&nbsp;成
        </el-button>
      </div>
    </el-dialog>
    <!-- 学员分班无班级是添加班级无课程直接添加课程新增 -->
    <course-dialog v-model="showCourseForm" @success="_getCourseOption(true)"></course-dialog>
    <!-- 学员分班无班级是添加教室无课时直接新增教室 -->
    <classroom-edit-dialog v-model="showClassroomEditDialog"
                           @success="_getClassroomOptions(true)"></classroom-edit-dialog>
    <!-- 学员分班无班级是添加员工无员工直接新增员工 -->
    <class-add-staff-dialog v-model="showClassAddStaffDialog" @success="_getUserOption(true)"></class-add-staff-dialog>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import InlineSelect from '@/components/InlineSelect'
import CourseDialog from '../course/courseManagement/CourseDialog'
import ClassroomEditDialog from '../../basicInfo/classroom/ClassroomEditDialog'
import ClassAddStaffDialog from './ClassAddStaffDialog'

const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    {
      type: 'string',
      min: 1,
      max: 16,
      message: '长度在1至16位',
      trigger: 'blur'
    }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'blur' }
  ],
  volume: [
    { required: true, message: '请输入班级容量', trigger: 'blur' }
  ],
  classDate: [
    { required: true, message: '请选择开班日期', trigger: 'blur' }
  ],
  headmaster: [
    { required: true, message: '请选择班主任', trigger: 'blur' }
  ]
}
export default {
  name: 'SelectClassDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    courseId: String,
    alreadyClassId: String,
    alreadyClassName: String
  },
  data() {
    return {
      showClassAddStaffDialog: false,
      submitBtnLoading: false,
      showClassroomEditDialog: false,
      showCourseForm: false,
      showAddClassInfo: false,
      tableloading: false,
      loadingTeacher: false,
      queryForm: {
        name: '', // 课程名称
        teacherId: '' // 上课老师id
      },
      classList: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      currentClassId: null,
      teacherList: [],
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
      formItemWidth: '300px',
      volumeLoading: false,
      formRules: rules,
      giveLessonsWay: -1 // 授课方式: 0--一对一; 1--一对多; -1--请先选择课程
    }
  },
  components: {
    InlineSelect,
    CourseDialog,
    ClassroomEditDialog,
    ClassAddStaffDialog
  },
  mounted() {
    // 获取教室列表
    this._getClassroomOptions()
    // 获取课程列表
    this._getCourseOption()
    // 获取员工数据
    this._getUserOption()
  },
  computed: {
    currentClass() {
      return this.classList.find(o => o.id === this.currentClassId)
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  methods: {
    _getClassList() {
      if (this.courseId == null) return
      this.loading = true
      this.$http.get('/v1/Class/getClassList', {
        // organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        courseId: this.courseId,
        teacherId: this.queryForm.teacherId || null,
        name: this.queryForm.name || null,
        pageSize: this.pageSize,
        pageNum: this.pageNum
      }).then(res => {
        res.data.forEach(item => {
          item.classDate = moment(item.classDate).format('YYYY-MM-DD')
        })
        this.classList = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    _getTeacherList() {
      if (this.teacherList.length > 0 || this.loadingTeacher) return
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
    _setAlreadyClassId() {
      this.currentClassId = this.alreadyClassId
    },
    query() {
      this.pageNum = 1
      this._getClassList()
      this.$refs.table && this.$refs.table.setCurrentRow()
    },
    reset() {
      this.queryForm = {
        name: '', // 课程名称
        teacherId: '' // 上课老师id
      }
      this.query()
      // 设置默认选择的班级
      this._setAlreadyClassId()
    },
    submit() {
      if (this.currentClassId === null) {
        this.$message.warning('请选择班级！')
        return
      }
      // 如果存在旧的班级id说明是转班,则将旧的班级id添加到currentClass
      if (this.alreadyClassId) {
        this.currentClass.oldClassId = this.alreadyClassId
        // 如果新班级与旧班级id一致,表示班级没有变更,直接提示用户
        if (this.currentClass.oldClassId === this.currentClass.id) {
          this.$message.warning('班级没有变化！')
          return
        }
      }
      this.$emit('submit', this.currentClass)
      this.$emit('toggle', false)
    },
    // 打开添加班级的dialog
    handleToClass() {
      this.showAddClassInfo = true
    },
    // 搜索课程
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
    // 获取教室列表
    _getClassroomOptions(isUpdate) {
      if (isUpdate) this.option.classroomOptions = []
      if (this.option.classroomOptions.length > 0) return
      this.$http.get('/v1/Classroom/getClassroomListByOrgIdOrDepId', { depId: this.currentBranch.id })
        .then((res) => {
          this.option.classroomOptions = res.data
        })
    },
    // 获取课程列表
    _getCourseOption(isUpdate) {
      if (isUpdate) this.option.courseOptions = []
      if (this.option.courseOptions.length > 0) return
      // 课程
      this.$http
        .get('/v1/Course/getAllByDepartmentId', { departmentId: this.currentBranch.id })
        .then((res) => {
          res.data.forEach((item) => {
            this.option.courseOptions.push({ value: item.id, label: item.name })
          })
        })
    },
    // 获取员工数据
    _getUserOption(isUpdate) {
      if (isUpdate) this.option.userOptions = []
      if (this.option.userOptions.length > 0) return
      // 班主任、老师、助教
      this.$http
        .get('/v1/User/getByUserLogo', {
          userLogo: 1,
          departmentId: this.currentBranch.id,
          organizationId: this.organizationInfo.id
        })
        .then((res) => {
          res.data.forEach((item) => {
            this.option.userOptions.push({
              value: item.id,
              label: item.username
            })
          })
        })
    },
    handleJumpTo(params) {
      this.$router.push(params)
    },
    // 提交
    handleEditFormSubmit(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          this.submitBtnLoading = true
          this.$http
            .post(
              '/v1/Class/addClass',
              Object.assign({}, this.editForm, {
                departmentId: this.currentBranch.id,
                organizationId: this.organizationInfo.id
              })
            )
            .then((res) => {
              this.$message.success('班级新增成功')
              this.wipeCache()
              this._getClassList()
            })
            .finally(() => {
              this.submitBtnLoading = false
            })
        } else {
          return false
        }
      })
    },
    // 关闭 清空数据
    wipeCache() {
      this.showAddClassInfo = false
      this.$refs.editForm.resetFields()
      this.editForm = {
        id: null,
        name: '',
        headmaster: '',
        courseId: '',
        teacherId: '',
        classroomId: '',
        volume: 0,
        sort: 0,
        classDate: ''
      }
    }
  }
}
</script>

<style lang='stylus'>
.select-classs-dialog
  .el-dialog__body
    padding 0 20px
    margin-bottom 6px

  .bottom-btns
    display flex
    justify-content space-between

  .query-form
    padding 0

    .input-with-select
      width 180px
      margin-right 16px

    .inline-select
      margin-right 16px

    .el-radio-group
      margin 0

  .el-table
    .el-radio__label
      display none

  .dialog-footer
    padding 20px 0 50px 245px

    .el-button
      padding 9px 30px
      margin-right 30px

    .el-button:last-child
      margin-right 0px

.jump-link-text
  color $color-primary
  cursor pointer
</style>

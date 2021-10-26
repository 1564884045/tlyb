<template>
  <div class="timetable-list">
    <div class="query-form">
      <el-date-picker
        class="el-date-picker"
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        unlink-panels
        :clearable="false"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="handleSimplequery"
        style="width: 300px;">
      </el-date-picker>
      <el-time-picker
        is-range
        clearable
        format="HH:mm"
        value-format="HH:mm:ss"
        v-model="queryForm.timeRange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        @change="handleSimplequery"
        style="width: 250px;">
      </el-time-picker>
      <el-input v-model="queryForm.oneStudentName" :maxlength="10" style="margin-left: 20px" :placeholder="'请输入一对一学员排课学员名称'" @keyup.native.enter="handleSimplequery" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="handleSimplequery"></el-button>
      </el-input>
      <div class="right-btns" style="margin-top: 10px">
        <el-button type="primary" icon="el-icon-date" @click="$emit('quickSchedule')">快速排课</el-button>
        <el-button type="warning" icon="el-icon-edit-outline" @click="handleOpenBatchModifyTimTable">批量修改</el-button>
        <el-button type="danger" icon="el-icon-delete-solid" @click="handleBatchDelete">批量删除</el-button>
        <!-- <el-button type="primary" icon="icon iconfont icon-export" >导出课表</el-button> -->
      </div>
      <div>
        <div class="query-select-list">
          <inline-select
            v-model="queryForm.courseId"
            :options="queryOption.course"
            :loading="queryLoading.course"
            @change="handleSimplequery"
            @show="handleCourseSelectShow"
            label="课程"
            valueAttr="id"
            labelAttr="name"
            filterable
            clearable/>
          <inline-select
            v-model="queryForm.classId"
            :options="queryOption.class"
            :loading="queryLoading.class"
            @change="handleSimplequery"
            @show="handleClassSelectShow"
            label="班级"
            valueAttr="id"
            labelAttr="name"
            filterable
            clearable/>
          <inline-select
            v-model="queryForm.classroomId"
            :options="queryOption.classRoom"
            :loading="queryLoading.classRoom"
            @change="handleSimplequery"
            @show="handleClassRoomSelectShow"
            label="教室"
            valueAttr="id"
            labelAttr="name"
            filterable
            clearable/>
          <inline-select
            v-model="queryForm.teacherId"
            :options="queryOption.teacher"
            :loading="queryLoading.teacher"
            @change="handleSimplequery"
            @show="handleTeacherSelectShow"
            label="上课老师"
            valueAttr="id"
            labelAttr="username"
            filterable
            clearable/>
          <el-divider direction="vertical"></el-divider>
          <el-radio-group v-model="queryForm.goToClassStatus" v-if="goToClassStatusVisible">
            <el-radio :label="1" @click.native="handleGoToClassStatusRadioClick(1)">已上</el-radio>
            <el-radio :label="0" @click.native="handleGoToClassStatusRadioClick(0)">未上</el-radio>
          </el-radio-group>
          <el-divider direction="vertical"></el-divider>
          <el-radio-group v-model="queryForm.giveLessonsWay" v-if="giveLessonsWayVisible">
            <el-radio :label="1" @click.native="handleGiveLessonsWayRadioClick(1)">一对多</el-radio>
            <el-radio :label="0" @click.native="handleGiveLessonsWayRadioClick(0)">一对一</el-radio>
          </el-radio-group>
          <el-button type="text" :disabled="!tableLoading ? false : true" @click="handleReset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
          <el-button type="text" :disabled="!tableLoading ? false : true" @click="handleSimplequery" size="medium" style="margin-left: 12px;">刷&nbsp;新
          </el-button>
        </div>
      </div>
      <div class="table-area">
        <el-table
          ref="tableRef"
          :data="tableData"
          style="width: 100%"
          v-loading="tableLoading"
          @selection-change="val => {multipleSelection = val}">
          <el-table-column
            type="selection"
            width="55"
            fixed="left"
            align="center">
          </el-table-column>
          <el-table-column
            prop="goToClassDate"
            label="上课时间"
            width="240"
            align="center">
            <template slot-scope="scope">
              <p class="time-data-item">
                <span>{{ moment(scope.row.goToClassDate).format('YYYY-MM-DD') }}</span>
                <span>{{ date2Weekday(scope.row.goToClassDate) }}</span>
                <span>{{
                    moment(scope.row.goToClassStartTime, 'HH:mm:ss').format('HH:mm')
                  }}-{{ moment(scope.row.goToClassEndTime, 'HH:mm:ss').format('HH:mm') }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column
            prop="className"
            label="班级/学员"
            min-width="180"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.oneStudentId ? scope.row.oneStudentName + '(学员)' : scope.row.className }}
            </template>
          </el-table-column>
          <el-table-column
            prop="courseName"
            label="课程"
            min-width="180"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.oneStudentId ? scope.row.oneCourseName : scope.row.courseName }}
            </template>
          </el-table-column>
          <el-table-column
            prop="classRoomName"
            label="教室"
            min-width="180"
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
            width="70"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="goToClassStatus"
            label="状态"
            width="80"
            align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.goToClassStatus === 2" type="warning">部分点名</el-tag>
              <el-tag v-if="scope.row.goToClassStatus === 1" type="success">已上</el-tag>
              <el-tag v-else-if="scope.row.goToClassStatus === 0" type="info">未上</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="180">
            <template slot-scope="scope">
              <template v-if="scope.row.goToClassStatus === 0">
                <el-button type="text" size="mini" @click="handleCheckStudent(scope.row)">
                  点名
                </el-button>
                <el-button type="text" size="mini" @click="handleEdit(scope.row)">
                  课表变更
                </el-button>
              </template>
              <template v-else-if="scope.row.goToClassStatus === 1 || scope.row.goToClassStatus === 2">
                <el-button type="text" size="mini" @click="handleCheckStudent(scope.row)">
                  编辑点名
                </el-button>
                <el-button type="text" size="mini" @click="handleCancel(scope.row)">
                  取消点名
                </el-button>
              </template>
              <el-button type="text" size="mini" @click="handleDelete(scope.row, scope.$index)">
                删除
              </el-button>
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
          style="margin-top: 10px;">
        </el-pagination>
      </div>
    </div>

    <edit-dialog v-model="editVisible" :data="rowData" @success="handleEditSuccess"></edit-dialog>
    <call-roll-dialog v-model="checkStuVisible" :courseTimeData="currentCourseTime"
                      @success="handleCheckSuccess"></call-roll-dialog>
    <el-dialog
      title="批量修改"
      :visible.sync="visibleModification"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="custom-dialog"
      width="800px">
      <el-form
        :model="modificationForm"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="授课课时：" prop="classHour">
          <el-input-number :disabled="!classHourSwitch" v-model="modificationForm.classHour" controls-position="right"
                           :min="1" :max="1000"></el-input-number>
          <el-switch style="margin-left:20px" v-model="classHourSwitch">
          </el-switch>
        </el-form-item>
        <el-form-item label="上课教室：" prop="classRoomId">
          <el-select
            v-model="modificationForm.classRoomId"
            filterable
            placeholder="请选择或输入搜索">
            <el-option
              v-for="item in Object.values(scheduleOption.classRoom)"
              :key="item.id"
              :label="item.name"
              :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right"><el-tag v-if="item.conflictStatus === 1" type="danger"
                                                 effect="dark">冲突</el-tag></span>
            </el-option>
          </el-select>
          <span
            v-if="scheduleOption.classRoom[modificationForm.classRoomId] && scheduleOption.classRoom[modificationForm.classRoomId].conflictStatus === 1"
            class="conflict-warning"><i class="el-icon-warning-outline"></i> 教室冲突</span>
        </el-form-item>

        <el-form-item label="上课老师：" prop="teacherId">
          <el-select
            v-model="modificationForm.teacherId"
            filterable
            placeholder="请选择或输入搜索">
            <el-option
              v-for="item in Object.values(scheduleOption.teacher)"
              :key="item.id"
              :label="item.username"
              :value="item.id">
              <span style="float: left">{{ item.username }}</span>
              <span style="float: right"><el-tag v-if="item.conflictStatus === 1" type="danger"
                                                 effect="dark">冲突</el-tag></span>
            </el-option>
          </el-select>
          <span
            v-if="scheduleOption.teacher[modificationForm.teacherId] && scheduleOption.teacher[modificationForm.teacherId].conflictStatus === 1"
            class="conflict-warning"><i class="el-icon-warning-outline"></i> 老师冲突</span>
        </el-form-item>

        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model="modificationForm.remark"
            type="textarea"
            :rows="3"
            style="width: 600px"
            placeholder="请输入备注"
            maxlength="256"
            show-word-limit>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeModification">取 消</el-button>
        <el-button type="primary" :loading="submitModificationLoading" @click="subModification">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import InlineSelect from '@/components/InlineSelect'
import EditDialog from './EditDialog'
import CallRollDialog from './CallRollDialog'
import lodash from 'lodash'
import { urlEncode } from '../../../utils/urlEncode'

const pickerOptions = {
  shortcuts: [{
    text: '最近一周',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }]
}

export default {
  name: 'listMode',
  components: {
    InlineSelect,
    EditDialog,
    CallRollDialog
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  data() {
    return {
      submitModificationLoading: false,
      classHourSwitch: false,
      visibleModification: false,
      modificationForm: {
        classHour: null, // 授课课时
        classRoomId: '', // 上课教室id
        teacherId: '', // 老师id
        remark: '' // 备注
      },
      scheduleOption: {
        classRoom: [],
        teacher: []
      },
      actionSign: 0,
      currentCourseTime: null,
      editVisible: false,
      checkStuVisible: false,
      pickerOptions,
      moment,
      rowData: {},
      tableLoading: false,
      goToClassStatusVisible: true,
      giveLessonsWayVisible: true,
      queryForm: {
        timeRange: ['', ''],
        dateRange: [moment().format('YYYY-MM-DD'), moment().add(7, 'days').format('YYYY-MM-DD')],
        goToClassStatus: null, // 上课状态 0未上 1已上
        giveLessonsWay: null, // 授课方式 0一对一 1一对多
        courseId: '',
        classId: '',
        classroomId: '',
        teacherId: '',
        oneStudentName: '' // 一对一学员排课的学员名称
      },
      queryOption: {
        course: [],
        class: [],
        classRoom: [],
        teacher: []
      },
      queryLoading: {
        course: false,
        class: false,
        classRoom: false,
        teacher: false
      },
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      currentQueryParams: {},
      multipleSelection: [],
      idList: []
    }
  },
  // 当切换路由时，更新选项信息
  beforeRouteLeave(to, from, next) {
    this._clearAllOption()
  },
  mounted() {
    this.handleSimplequery()
    // 获取员工列表
    this._getUserOption()
    // 获取教室列表
    this._getClassroomOptions()
  },
  methods: {
    // 打开批量修改界面
    handleOpenBatchModifyTimTable() {
      if (this.multipleSelection.length !== 0) {
        this.visibleModification = true
        for (let i = 0; i < this.multipleSelection.length; i++) {
          this.idList.push(this.multipleSelection[i].id)
        }
      } else {
        this.$message.warning('您尚未选择任何需要批量修改的课表')
      }
    },
    // 获取教室列表
    _getClassroomOptions() {
      this.$http.get('/v1/Classroom/getClassroomListByOrgIdOrDepId', { depId: this.currentBranch.id })
        .then((res) => {
          this.scheduleOption.classRoom = res.data
        })
    },
    // 获取员工数据
    _getUserOption() {
      // 班主任、老师、助教
      this.$http
        .get('/v1/User/getByUserLogo', {
          userLogo: 1,
          departmentId: this.currentBranch.id,
          organizationId: this.organizationInfo.id
        })
        .then((res) => {
          this.scheduleOption.teacher = res.data
        })
    },
    // 提交修改
    subModification() {
      if (!this.modificationForm.classRoomId && !this.modificationForm.remark && !this.modificationForm.teacherId && !this.classHourSwitch) {
        this.$message.error(`请至少选择一个修改项`)
      } else {
        this.submitModificationLoading = true
        const param = {
          classHour: this.classHourSwitch ? this.modificationForm.classHour : null,
          classRoomId: this.modificationForm.classRoomId,
          remark: this.modificationForm.remark,
          teacherId: this.modificationForm.teacherId
        }
        this.$http.put(`/v1/CoursePlan/updateCourseTimeBatch${urlEncode(param, null, null)}`, this.idList)
          .then((res) => {
            this.$message.success(`修改成功,已修改${res.data}条数据`)
            this.closeModification()
            this._getTableData()
            this.multipleSelection = []
          })
          .finally(() => {
            this.submitModificationLoading = false
          })
      }
    },
    // 取消修改
    closeModification() {
      this.visibleModification = false
      this.modificationForm = {
        classHour: null, // 授课课时
        classRoomId: '', // 上课教室id
        teacherId: '', // 老师id
        remark: '' // 备注
      }
      this.classHourSwitch = false
      this.idList = []
      this.multipleSelection = []
      this.$refs.tableRef.clearSelection()
    },
    handleCheckStudent(row) {
      this.currentCourseTime = row
      this.checkStuVisible = true
    },
    handleEdit(row) {
      this.rowData = row
      this.editVisible = true
    },
    handleCancel(row) {
      this.$confirm(`是否取消点名,取消后将自动还原学员课时数,且删除学员上课记录`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.put(`/v1/CourseCheckingIn/cancelCourseCheckingIn?courseTimeId=${row.id}`)
          .then(res => {
            if (res.data > 0) {
              this.$message.success(`取消点名成功`)
              this._getTableData()
            } else {
              this.$message.error(`取消点名失败`)
            }
          })
      })
    },
    handleDelete(row, index) {
      this.$confirm(`是否删除本次排课，删除后无法还原，确认删除？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/CoursePlan/deleteCourseTime`, { ids: row.id })
          .then(res => {
            if (res.data > 0) {
              this.$message.success(`课表删除成功`)
              this.tableData.splice(index, 1)
            } else {
              this.$message.error(`课表删除失败`)
            }
          })
      })
    },
    // 批量删除
    handleBatchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('您尚未选择任何需要删除的列！')
        return
      }
      if (this.multipleSelection.length > 0) {
        this.$confirm(`此操作将批量的删除数据, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = this.multipleSelection.map(item => item.id)
          this.$http.delete(`/v1/CoursePlan/deleteCourseTime`, { ids: ids.join(';') })
            .then(res => {
              if (res.data > 0) {
                this.$message.success(`课表删除成功`)
                this._getTableData()
                this.multipleSelection = []
              } else {
                this.$message.error(`课表删除失败`)
              }
            })
        }).catch(() => {
          this.multipleSelection = []
          this.$refs.tableRef.clearSelection()
        })
      }
    },
    handleEditSuccess() {
      this._getTableData()
    },
    handleCheckSuccess() {
      this._getTableData()
    },
    handleGoToClassStatusRadioClick(val) {
      if (this.queryForm.goToClassStatus === val) {
        this.queryForm.goToClassStatus = null
        this.goToClassStatusVisible = false
        this.$nextTick(() => {
          this.goToClassStatusVisible = true
        })
      }
      this._actionOnce(this.handleSimplequery)
    },
    handleGiveLessonsWayRadioClick(val) {
      if (this.queryForm.giveLessonsWay === val) {
        this.queryForm.giveLessonsWay = null
        this.giveLessonsWayVisible = false
        this.$nextTick(() => {
          this.giveLessonsWayVisible = true
        })
      }
      this._actionOnce(this.handleSimplequery)
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
    _getTableData() {
      if (!this.currentBranch.id) {
        return
      }
      const basicParams = {
        pageSize: this.pagination.pageSize,
        pageNum: this.pagination.pageNum
      }
      const params = Object.assign({}, this.currentQueryParams, basicParams)
      this.tableLoading = true
      this.$http.get(`/v1/CoursePlan/getCourseTime/${this.currentBranch.id}`, params)
        .then(res => {
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    _clearAllOption() {
      this.queryOption = {
        course: [],
        class: [],
        classRoom: [],
        teacher: []
      }
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this._getTableData()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this._getTableData()
    },
    handleSimplequery() {
      let queryTmp = {
        startDate: this.queryForm.dateRange && this.queryForm.dateRange[0],
        endDate: this.queryForm.dateRange && this.queryForm.dateRange[1],
        startTime: this.queryForm.timeRange && this.queryForm.timeRange[0],
        endTime: this.queryForm.timeRange && this.queryForm.timeRange[1],
        ...lodash.cloneDeep(this.queryForm)
      }
      delete queryTmp.dateRange
      delete queryTmp.timeRange
      // 过滤undefined、null 、 ''
      for (let item in queryTmp) {
        if (queryTmp[item] == null || queryTmp[item] === '') delete queryTmp[item]
      }
      this.currentQueryParams = queryTmp
      this._getTableData()
    },
    handleClassSelectShow() {
      if (this.queryOption.class.length > 0) return
      this.queryLoading.class = true
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id })
        .then(res => {
          this.queryOption.class = res.data
        })
        .finally(() => {
          this.queryLoading.class = false
        })
    },
    handleCourseSelectShow() {
      if (this.queryOption.course.length > 0) return
      this.queryLoading.course = true
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, { status: 1 })
        .then(res => {
          this.queryOption.course = res.data
        })
        .finally(() => {
          this.queryLoading.course = false
        })
    },
    handleClassRoomSelectShow() {
      if (this.queryOption.classRoom.length > 0) return
      this.queryLoading.classRoom = true
      this.$http.get('/v1/Classroom/getClassroomList', { departmentId: this.currentBranch.id })
        .then(res => {
          this.queryOption.classRoom = res.data
        })
        .finally(() => {
          this.queryLoading.classRoom = false
        })
    },
    handleTeacherSelectShow() {
      if (this.queryOption.teacher.length > 0) return
      this.queryLoading.teacher = true
      this.$http.get('/v1/User/getByUserLogo', {
        userLogo: 1,
        departmentId: this.currentBranch.id,
        organizationId: this.organizationInfo.id
      })
        .then(res => {
          this.queryOption.teacher = res.data
        })
        .finally(() => {
          this.queryLoading.teacher = false
        })
    },
    handleReset() {
      this.queryForm = {
        timeRange: ['', ''],
        dateRange: [moment().format('YYYY-MM-DD'), moment().add(7, 'days').format('YYYY-MM-DD')],
        goToClassStatus: null,
        giveLessonsWay: null,
        courseId: '',
        classId: '',
        classroomId: '',
        teacherId: ''
      }
      this.handleSimplequery()
    },
    date2Weekday(date) {
      const day = moment(date).day()
      let dayStr = ''
      switch (day) {
        case 0:
          dayStr = '星期天'
          break
        case 1:
          dayStr = '星期一'
          break
        case 2:
          dayStr = '星期二'
          break
        case 3:
          dayStr = '星期三'
          break
        case 4:
          dayStr = '星期四'
          break
        case 5:
          dayStr = '星期五'
          break
        case 6:
          dayStr = '星期六'
          break
        default:
      }
      return dayStr
    }
  }
}
</script>

<style lang="stylus" scoped>
.timetable-list
  .query-form
    .el-date-picker
      margin-right 20px

  .table-area
    .time-data-item
      span + span
        margin-left 10px
</style>

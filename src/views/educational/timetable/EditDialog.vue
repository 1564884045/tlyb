<template>
  <el-dialog
    title="课表变更"
    :visible="visible"
    :close-on-click-modal="false"
    @close="toggle(false)"
    custom-class="custom-dialog"
    width="800px"
    top="5vh">
    <div class="schedule-body" v-loading="formLoading">
      <el-form
        :model="scheduleForm"
        ref="scheduleFormRef"
        label-position="right"
        label-width="100px"
        :rules="rules">
        <div class="info-iuput">
          <el-form-item label="上课日期：" prop="goToClassDate" >
            <el-date-picker
              v-model="scheduleForm.goToClassDate"
              :clearable="false"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="选择上课日期"
              @blur="handleSelectClassDate"
              :picker-options="goToClassDatePickerOptions"
              @change="handleGotoClassDateChange">
            </el-date-picker>
          </el-form-item>
          <el-form-item  label="上课时间：" prop="goToClassTimeRange">
            <el-time-picker
              v-model="scheduleForm.goToClassTimeRange"
              is-range
              :clearable="false"
              format="HH:mm"
              value-format="HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择上课时间"
              @change="handleGoToClassTimeRangeChange">
            </el-time-picker>
          </el-form-item>
          <el-form-item label="授课课时：" prop="classHour">
            <el-input-number
              style="width: 210px"
              v-model="scheduleForm.classHour"
              controls-position="right" :min="0" :max="1000"></el-input-number>
          </el-form-item>
          <el-form-item label="上课教室：" prop="classRoomId" >
            <el-select
              v-model="scheduleForm.classRoomId"
              :loading="loading.classRoom"
              filterable
              placeholder="请选择或输入搜索">
              <el-option
                v-for="item in Object.values(scheduleOption.classRoom)"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right" ><el-tag v-if="item.conflictStatus === 1" type="danger" effect="dark" >冲突</el-tag></span>
              </el-option>
            </el-select>
            <span v-if="scheduleOption.classRoom[scheduleForm.classRoomId] && scheduleOption.classRoom[scheduleForm.classRoomId].conflictStatus === 1" class="conflict-warning"><i class="el-icon-warning-outline"></i> 教室冲突</span>
          </el-form-item>
          <el-form-item label="上课老师："  prop="teacherId">
            <el-select
              v-model="scheduleForm.teacherId"
              :loading="loading.teacher"
              filterable
              placeholder="请选择或输入搜索">
              <el-option
                v-for="item in Object.values(scheduleOption.teacher)"
                :key="item.id"
                :label="item.username"
                :value="item.id">
                <span style="float: left">{{ item.username }}</span>
                <span style="float: right" ><el-tag v-if="item.conflictStatus === 1" type="danger" effect="dark" >冲突</el-tag></span>
              </el-option>
            </el-select>
            <span v-if="scheduleOption.teacher[scheduleForm.teacherId] && scheduleOption.teacher[scheduleForm.teacherId].conflictStatus === 1" class="conflict-warning"><i class="el-icon-warning-outline"></i> 老师冲突</span>
          </el-form-item>
          <el-form-item label="备注：" prop="remark">
          <el-input
              v-model="scheduleForm.remark"
              type="textarea"
              :rows="3"
              style="width: 600px"
              placeholder="请输入备注"
              maxlength="256"
              show-word-limit>
            </el-input>
          </el-form-item>
        </div>
        <div class="divider-dashed"></div>
        <div class="operation-area">
          <el-button @click="handleExit">取&nbsp;消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提&nbsp;交</el-button>
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import lodash from 'lodash'

const rules = {
  classRoomId: [
    { type: 'string', required: true, message: '请选择上课教室', trigger: 'blur' }
  ],
  teacherId: [
    { type: 'string', required: true, message: '请选择上课老师', trigger: 'blur' }
  ],
  goToClassDate: [
    { type: 'string', required: true, message: '请设置上课日期', trigger: 'blur' }
  ],
  classHour: [
    { type: 'number', required: true, min: 0, message: '授课课时不能为负', trigger: 'change' }
  ],
  goToClassTimeRange: [
    { type: 'array',
      required: true,
      validator: (rule, value, callback) => {
        if (value == null || value.length < 1 || (value[0] === '' && value[1] === '')) {
          callback(new Error('请设置开始时间和结束时间'))
        } else {
          callback()
        }
      },
      trigger: 'change' }
  ]
}
export default {
  name: 'EditDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  props: {
    // dialog显示控制
    visible: {
      type: Boolean,
      default: false
    },
    data: Object
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  data() {
    return {
      rules,
      formLoading: false,
      submitLoading: false,
      scheduleForm: {
        classId: '', // 班级id
        classHour: 0, // 授课课时
        classRoomId: '', // 上课教室id
        goToClassDate: '', // 上课日期(时间格式为：yyyy-MM-dd HH:mm:ss)
        goToClassStatus: -1, // 上课状态 0未上 1已上
        teacherId: '', // 老师id
        courseId: '', // 课程ID
        remark: '', // 备注
        goToClassStartTime: '', // 开始上课时间
        goToClassEndTime: '', // 结束上课时间
        goToClassTimeRange: ['', '']
      },
      scheduleOption: {
        classRoom: {},
        teacher: {}
      },
      loading: {
        classRoom: false,
        teacher: false
      },
      holidaysList: [], // 节假日时间
      goToClassDatePickerOptions: {
        disabledDate(timeVal) {
          return moment(timeVal).isBefore(moment().subtract(1, 'days'))
        }
      }
    }
  },
  watch: {
    // 当班级变化时，更新老师和教室的冲突选项列表
    scheduleForm(val) {
      if (val) {
        this._getTeacherAndClassroomConflictStatusList()
      }
    },
    visible(val) {
      if (val) {
        this.$refs['scheduleFormRef'] && this.$refs['scheduleFormRef'].clearValidate()
      }
    },
    data(val) {
      this.initScheduleForm()
      this.scheduleForm = Object.assign({}, this.scheduleForm, JSON.parse(JSON.stringify(val)))
    },
    'scheduleForm.goToClassStartTime': {
      handler: function(val) {
        this.$set(this.scheduleForm.goToClassTimeRange, 0, val)
      },
      immediate: true
    },
    'scheduleForm.goToClassEndTime': {
      handler: function(val) {
        this.$set(this.scheduleForm.goToClassTimeRange, 1, val)
      },
      immediate: true
    }
  },
  created() {
    this._getCurrentYearVacationList()
  },
  methods: {
    _getCurrentYearVacationList() {
      this.$http.get('/v1/Vacation/getVacationList', {
        departmentId: this.currentBranch.id,
        pageNum: 1,
        pageSize: 50
      }).then((res) => {
        this.holidaysList = res.data
        console.log(this.holidaysList, '节假日时间处理后的列表数据')
      }).finally(() => {
      })
    },
    _getTeacherAndClassroomConflictStatusList() {
      // 获取老师的冲突列表数据
      let requestParams = {
        date: this.scheduleForm.goToClassDate,
        startTime: this.scheduleForm.goToClassStartTime,
        endTime: this.scheduleForm.goToClassEndTime,
        classId: this.scheduleForm.classId,
        courseTimeId: this.scheduleForm.id
      }
      this.loading.teacher = true
      this.$http.get(`/v1/User/getTeacherListAndConflictStatusSingle/${this.currentBranch.id}`, requestParams)
        .then(res => {
          res.data.forEach(element => {
            this.scheduleOption.teacher[element.id] = element
          })
        })
        .finally(() => {
          this.loading.teacher = false
        })
        // 获取教室的冲突列表数据
      this.loading.classRoom = true
      this.$http.get(`/v1/Classroom/getClassroomListAndConflictStatusSingle/${this.currentBranch.id}`, requestParams)
        .then(res => {
          res.data.forEach(element => {
            this.scheduleOption.classRoom[element.id] = element
          })
        })
        .finally(() => {
          this.loading.classRoom = false
        })
    },
    handleSubmit() {
      this.$refs['scheduleFormRef'].validate((valid) => {
        if (valid) {
          let requestParams = lodash.cloneDeep(this.scheduleForm)
          delete requestParams.goToClassTimeRange
          this.submitLoading = true
          this.$http.put(`/v1/CoursePlan/updateCourseTime/${this.scheduleForm.id}`, null, {
            params: requestParams
          })
            .then(res => {
              if (res.data > 0) {
                this.$message.success('课表修改成功')
                this.$emit('toggle', false)
                this.$emit('success')
              } else {
                this.$message.success('课表修改失败')
                this.$emit('toggle', false)
              }
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          return false
        }
      })
    },
    handleGotoClassDateChange() {
      this._getTeacherAndClassroomConflictStatusList()
    },
    handleGoToClassTimeRangeChange(val) {
      this._getTeacherAndClassroomConflictStatusList()
      this.scheduleForm.goToClassStartTime = val[0]
      this.scheduleForm.goToClassEndTime = val[1]
    },
    handleExit() {
      this.$emit('toggle', false)
    },
    toggle(val) {
      this.$emit('toggle', val)
    },
    initScheduleForm() {
      this.scheduleForm = {
        classId: '', // 班级id
        classHour: 0, // 授课课时
        classRoomId: '', // 上课教室id
        goToClassDate: '', // 上课日期(时间格式为：yyyy-MM-dd HH:mm:ss)
        goToClassStatus: -1, // 上课状态 0未上 1已上
        teacherId: '', // 老师id
        courseId: '', // 课程ID
        remark: '', // 备注
        goToClassStartTime: '', // 开始上课时间
        goToClassEndTime: '', // 结束上课时间
        goToClassTimeRange: ['', '']
      }
    },
    // 选择上课日期
    handleSelectClassDate() {
      console.log(this.scheduleForm.goToClassDate)
      this.holidaysList.forEach(item => {
        if (new Date(this.scheduleForm.goToClassDate) >= new Date(item.date) && new Date(this.scheduleForm.goToClassDate) <= new Date(item.endDate)) {
          return this.$message.warning(`此时间为${item.name}期间（${item.date}~${item.endDate}）`)
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.divider-dashed
    background none
    border dashed #e8e8e8
    border-width 1px 0 0
    margin 24px 0px

.schedule-body
  .operation-area
    text-align center
    .el-button
      margin-right 20px
    .el-button:last-child
      margin-right 0px
  .info-iuput
    .conflict-warning
      color $color-warning
      margin-left 10px
</style>

<template>
  <div>
    <el-dialog
      title="排课"
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
          <div class="pre-setting">
            <el-form-item label="上课方式：" prop="classType">
              <el-radio-group v-model="scheduleForm.classType" @change="handleClassTypeChange">
                <el-radio :label="1">一对多</el-radio>
                <el-radio :label="0">一对一</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="排课对象：" prop="scheduleArrangementTarget" v-if="scheduleForm.classType === 0">
              <el-radio-group v-model="scheduleForm.scheduleArrangementTarget"
                              @change="handleScheduleArrangementTargetChange">
                <el-radio :label="0">班级</el-radio>
                <el-radio :label="1">学员</el-radio>
              </el-radio-group>
            </el-form-item>
            <!--  班级下拉列表 一对多排课时显示,一对一排课且排课对象为班级时显示  -->
            <el-form-item
              v-if="scheduleForm.classType === 1 || (scheduleForm.classType === 0 && scheduleForm.scheduleArrangementTarget === 0)"
              label="班级：" prop="classId">
              <el-select v-model="scheduleForm.classId" :loading="loading.class" filterable
                         @change="handleClassSelectChange" placeholder="请选择或输入搜索" @focus="handleClassSelectFocus">
                <el-option
                  v-for="item in scheduleOption.class"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <!--  学员/课程下拉列表 一对一排课时,且排课对象为学员时显示  -->
            <div v-if="scheduleForm.classType === 0 && scheduleForm.scheduleArrangementTarget === 1" class="student-course-select">
              <el-form-item label="学员：" prop="studentId">
                <el-select v-model="scheduleForm.studentId" :loading="loading.student" filterable
                           @change="handleStudentSelectChange" placeholder="请选择或输入搜索" @focus="handleStudentSelectFocus">
                  <el-option
                    v-for="item in scheduleOption.student"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="课程：" prop="courseId">
                <el-select v-model="scheduleForm.courseId" :loading="loading.course" filterable
                           @change="handleCourseSelectChange" placeholder="请选择或输入搜索" @focus="handleCourseSelectFocus">
                  <el-option
                    v-for="item in scheduleOption.course"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item v-if="scheduleType === 'both'" label="排课方式：" prop="courseSchedulingType">
              <el-radio-group v-model="scheduleForm.courseSchedulingType">
                <el-radio :label="0">循环</el-radio>
                <el-radio :label="1">单次</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="divider-dashed"></div>
          <div class="info-iuput">
            <template v-if="scheduleForm.courseSchedulingType === 0">
              <el-form-item label="开始日期：" prop="startDate">
                <el-date-picker
                  v-model="scheduleForm.startDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="选择开始日期"
                  :clearable="true"
                  :picker-options="startDatePickerOptions"
                  @change="handleStartDateChange">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期：" prop="endDate">
                <el-date-picker
                  v-model="scheduleForm.endDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="选择结束日期"
                  :clearable="true"
                  :picker-options="endDatePickerOptions"
                  @change="handleEndDateChange">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="排课安排：" prop="coursePlanTimeEntityList">
                <course-plan-time-entity
                  class="course-plan-time-entity"
                  ref="coursePlanTimeEntityRef"
                  v-for="(item, index) in scheduleForm.coursePlanTimeEntityList"
                  :key="index"
                  :deleteDisabled="scheduleForm.coursePlanTimeEntityList.length === 1"
                  v-model="scheduleForm.coursePlanTimeEntityList[index]"
                  @remove="handleRemoveCoursePlanTimeEntity(index)"
                  @change="handleCoursePlanTimeEntityChange">
                </course-plan-time-entity>
                <div class="entity-add-item" @click="handleMoreCoursePlanTimeEntity">
                  <p class="entity-add-item-icon"><i class="el-icon-circle-plus-outline"/></p>
                  <p>添加排课安排</p>
                </div>
              </el-form-item>
              <el-form-item class="item-skipHolidaysState" label="避开节假日：">
                <el-radio-group v-model="scheduleForm.skipHolidays" @change="handleSkipHolidaysChange">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
                <span class="tip-text"><span>(勾选后系统将自动跳过所设置的节假日进行排课)</span></span>
              </el-form-item>
              <el-form-item label="排课数量：" prop="classTypeAndNum">
                <div class="class-num-item" v-loading="classNumSettingLoading">
                  <el-select
                    v-model="scheduleForm.classNumType"
                    placeholder="请选择"
                    @change="handlelassNumTypeChange"
                    style="width: 100px; margin-right: 15px;">
                    <el-option
                      :label="'课次'"
                      :value="0">
                    </el-option>
                    <el-option
                      :label="'课时'"
                      :value="1">
                    </el-option>
                    <el-option
                      :label="'周'"
                      :value="2">
                    </el-option>
                  </el-select>
                  <el-input-number
                    v-model="scheduleForm.classNum"
                    @change="handleClassNumChange"
                    :controls="false"
                    :min="0"
                    :max="classNumLimit > -1 ? classNumLimit : scheduleForm.classNumType === 0 ? 400 : scheduleForm.classNumType === 1 ? 1000 : 60"
                    @focus="handleClassNumFocus"
                    style="width:80px;">
                  </el-input-number>
                  <span v-if="classNumLimit > -1"
                        class="tip-text"><span>({{
                      scheduleForm.endDate ? '所选时间段内最多可排' : '未选择结束时间,最多可排'
                    }} {{
                      classNumLimit
                    }} {{
                      (scheduleForm.classNumType === 0 && '课次') || (scheduleForm.classNumType === 1 && '课时') || (scheduleForm.classNumType === 2 && '周') || ''
                    }})</span></span>
                </div>
              </el-form-item>
            </template>
            <template v-else-if="scheduleForm.courseSchedulingType === 1">
              <el-form-item label="上课日期：" prop="soloEntity.startDate">
                <el-date-picker
                  v-model="scheduleForm.soloEntity.startDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  placeholder="选择上课日期"
                  @change="handleStartDateChange">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="上课时间：" prop="soloEntity.endTime">
                <el-time-select
                  placeholder="起始时间"
                  v-model="scheduleForm.soloEntity.startTime"
                  :picker-options="{
                    start: startTime,
                    step: '00:05',
                    end: endTime
                  }"
                  :clearable="false"
                  style="width: 120px">
                </el-time-select>
                <span style="margin: 0 12px;">~</span>
                <el-time-select
                  placeholder="结束时间"
                  v-model="scheduleForm.soloEntity.endTime"
                  :picker-options="{
                    start: startTime,
                    step: '00:05',
                    end: endTime,
                    minTime: scheduleForm.soloEntity.startTime
                  }"
                  :clearable="false"
                  style="width: 120px">
                </el-time-select>
                <el-popover
                  placement="top-start"
                  width="200"
                  trigger="hover">
                  <i slot="reference" class="el-icon-question color-primary"
                     style="margin-left: 12px; font-size: 14px;"></i>
                  <p>上课时间范围来自于校区的营业时间！</p>
                </el-popover>
              </el-form-item>
              <el-form-item label="授课课时：" prop="soloEntity.classHour">
                <el-input-number
                  v-model="scheduleForm.soloEntity.classHour"
                  controls-position="right" :min="0" :max="1000"
                  @change="handleClassHourChange">
                </el-input-number>
                <span class="form-tip">(每次上课消耗的课时数，无课时课程授课课时应设置为0)</span>
              </el-form-item>
            </template>
            <el-form-item label="上课教室：" prop="classRoomId">
              <el-select
                v-model="scheduleForm.classRoomId"
                :loading="loading.classRoom"
                filterable
                placeholder="请选择或输入搜索"
                @focus="handleClassRoomSelectFocus">
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
                v-if="scheduleOption.classRoom[scheduleForm.classRoomId] && scheduleOption.classRoom[scheduleForm.classRoomId].conflictStatus === 1"
                class="conflict-warning">
                <i class="el-icon-warning-outline"></i> 教室冲突
              </span>
              <span
                v-if="scheduleOption.classRoom[scheduleForm.classRoomId] && scheduleOption.classRoom[scheduleForm.classRoomId].volumeOverflow === 1"
                class="overflow-warning">
                <el-tooltip content="当前班级的最大人数大于当前教室的容量" placement="bottom" effect="light">
                  <span><i class="el-icon-warning-outline"></i> 容量溢出</span>
                </el-tooltip>
              </span>
            </el-form-item>
            <el-form-item label="上课老师：" prop="teacherId">
              <el-select
                v-model="scheduleForm.teacherId"
                :loading="loading.teacher"
                filterable
                placeholder="请选择或输入搜索"
                @focus="handleTeacherSelectFocus">
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
                v-if="scheduleOption.teacher[scheduleForm.teacherId] && scheduleOption.teacher[scheduleForm.teacherId].conflictStatus === 1"
                class="conflict-warning">
                <i class="el-icon-warning-outline"></i> 老师冲突</span>
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
    <conflict-table-dialog
      v-model="conflictTableVisible"
      :conflictTable="conflictTable"
      :submitFunc="submitFunc"
      @success="handleSubmitSuccess"/>
  </div>

</template>

<script>
import CoursePlanTimeEntity from './CoursePlanTimeEntity'
import ConflictTableDialog from './ConflictTableDialog'
import { mapGetters } from 'vuex'
import moment from 'moment'
import lodash from 'lodash'

const coursePlanTimeEntityEctype = {
  classHour: 1, // 授课课时
  endTime: '', // 上课结束时间(时间格式为：yyyy-MM-dd HH:mm:ss)
  startTime: '', // 上课开始时间(时间格式为：yyyy-MM-dd HH:mm:ss)
  week: [] // 星期 1 2 3 4 5 6 7
}

const soloEntityEctype = { // 为了验证方便>>>>>提交数据时删除
  startDate: '', // 上课日期
  classHour: 0, // 授课课时
  endTime: '', // 上课结束时间(时间格式为：yyyy-MM-dd HH:mm:ss)
  startTime: '' // 上课开始时间(时间格式为：yyyy-MM-dd HH:mm:ss)
}
export default {
  name: 'ScheduleArrangementDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  inject: ['refreshTimetableByCurrentMode'],
  props: {
    // dialog显示控制
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 表单数据
     *
     * 数据结构：
     * {
     *   courseSchedulingType: 0, // 排课方式（必要的，为空的话，默认为 0）
     *   classId: '', // 班级id
     *   classNum: 0, // 排课数量
     *   classNumType: 0, // 排课数量类型
     *   classRoomId: '', // 上课教室
     *   classType: 1, // 上课方式
     *   startDate: '', // 起始日期(时间格式为：yyyy-MM-dd)
     *   endDate: '', // 结束日期(时间格式为：yyyy-MM-dd)
     *   remark: '', // 备注
     *   skipHolidays: 0, // 是否跳过节假日
     *   teacherId: '', // 老师id
     *   coursePlanTimeEntityList: [
     *     {
     *       classHour: 0, // 授课课时
     *       endTime: '', // 上课结束时间(时间格式为: HH:mm:ss)
     *       startTime: '', // 上课开始时间(时间格式为：HH:mm:ss)
     *       week: [] // 周日--1，周一--2，周二--3，周三--4，周四--5，周五--6，周六--7
     *     },
     *     ......
     *   ]
     * }
     */
    data: {
      type: Object
    },
    /** 排课类型：
     * both -- 单次、循环
     * single -- 单次
     * circulation -- 循环
     * */
    scheduleType: {
      type: String,
      default: () => 'both'
    },
    /**
     * 是否在选择班级的时候获取排课计划
     */
    getSchedulePlan: {
      type: Boolean,
      default: true
    }
  },
  components: {
    CoursePlanTimeEntity,
    ConflictTableDialog
  },
  data() {
    return {
      submitFunc: () => {
      },
      conflictTable: {
        conflictTableClassroom: [],
        conflictTableTeacher: []
      },
      conflictTableVisible: false,
      classNumLimit: -1,
      rules: {
        courseSchedulingType: [
          { type: 'number', required: true, message: '请选择排课方式', trigger: 'blur' }
        ],
        classId: [
          { type: 'string', required: true, message: '请选择班级', trigger: 'blur' }
        ],
        studentId: [
          { type: 'string', required: true, message: '请选择学员', trigger: 'blur' }
        ],
        courseId: [
          { type: 'string', required: true, message: '请选择课程', trigger: 'blur' }
        ],
        classRoomId: [
          { type: 'string', required: true, message: '请选择上课教室', trigger: 'blur' }
        ],
        classType: [
          { type: 'number', required: true, message: '请选择上课方式', trigger: 'blur' }
        ],
        startDate: [
          { type: 'string', required: true, message: '请设置上课起始日期', trigger: 'blur' }
        ],
        teacherId: [
          { type: 'string', required: true, message: '请选择上课老师', trigger: 'blur' }
        ],
        coursePlanTimeEntityList: [
          { type: 'array', required: true, message: '请设置排课安排', trigger: 'blur' }
        ],
        classTypeAndNum: [
          {
            type: 'array',
            required: true,
            validator: (rule, value, callback) => {
              if (value[1] === 0) {
                const tmp = (value[0] === 0 && '课次') || (value[0] === 1 && '课时') || (value[0] === 2 && '周') || ''
                callback(new Error('排课数量不能设置为 0 ' + tmp))
              } else if (value[1] == null) {
                callback(new Error('排课数量不能为空'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        'soloEntity.startDate': [
          { type: 'string', required: true, message: '请设置上课日期', trigger: 'blur' }
        ],
        'soloEntity.classHour': [
          { type: 'number', required: true, min: 0, message: '授课课时不能为负', trigger: 'change' }
        ],
        'soloEntity.endTime': [
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!this.scheduleForm.soloEntity.startTime) {
                callback(new Error('请选择上课开始时间'))
              } else if (this.scheduleForm.soloEntity.startTime && this.scheduleForm.soloEntity.endTime && this.scheduleForm.soloEntity.startTime >= this.scheduleForm.soloEntity.endTime) {
                callback(new Error('上课的开始时间必须小于上课的结束时间'))
              } else {
                callback()
              }
            }
          },
          { required: true, message: '请选择上课结束时间', trigger: 'blur' }

        ]
      },
      formLoading: false,
      submitLoading: false,
      scheduleForm: {
        courseSchedulingType: 0, // 排课方式 0循环 1单次
        classId: '', // 班级id
        classNum: 0, // 排课数量
        classNumType: 0, // 排课数量类型 0课次 1课时 2周
        classRoomId: '', // 上课教室id
        classType: 1, // 上课方式  0--一对一 1--一对多
        scheduleArrangementTarget: 1, // 排课对象 0班级 1学员
        coursePlanTimeEntityList: [lodash.cloneDeep(coursePlanTimeEntityEctype)],
        endDate: '', // 结束日期(时间格式为：yyyy-MM-dd HH:mm:ss)
        remark: '', // 备注
        skipHolidays: 1, // 是否跳过节假日 0否 1是
        startDate: '', // 起始日期(时间格式为：yyyy-MM-dd HH:mm:ss)
        teacherId: '', // 老师id
        studentId: '', // 学员id
        courseId: '', // 课程id
        classTypeAndNum: [0, 0], // 为了方便验证>>>>>提交数据时删除
        soloEntity: lodash.cloneDeep(soloEntityEctype) // 为了验证方便>>>>>提交数据时删除
      },
      scheduleOption: {
        class: [],
        classRoom: {},
        teacher: {},
        student: [],
        course: []
      },
      loading: {
        class: false,
        classRoom: false,
        teacher: false,
        student: false,
        course: false
      },
      classNumSettingLoading: false
    }
  },
  computed: {
    startTime() {
      if (this.currentBranch && this.currentBranch.businessStartDate) {
        return this.currentBranch.businessStartDate
      }
      return '06:00'
    },
    endTime() {
      if (this.currentBranch && this.currentBranch.businessEndDate) {
        return this.currentBranch.businessEndDate
      }
      return '21:00'
    },
    startDatePickerOptions() {
      return {
        disabledDate: (timeVal) => {
          return moment(timeVal).isBefore(moment().subtract(1, 'days'))
        }
      }
    },
    endDatePickerOptions() {
      return {
        disabledDate: (timeVal) => {
          return moment(timeVal).isBefore(moment(this.scheduleForm.startDate || '', 'YYYY-MM-DD'))
        }
      }
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  watch: {
    'scheduleForm.courseSchedulingType'(val) {
      this.$refs['scheduleFormRef'] && this.$refs['scheduleFormRef'].clearValidate()
    },
    // 当班级变化时，更新老师和教室的冲突选项列表
    async scheduleForm(val) {
      let pass = true
      let resquestParams = await this.paramsFilter(this.scheduleForm)
      for (let item of this.scheduleForm.coursePlanTimeEntityList) {
        pass = item.classHour && item.startTime && item.endTime
      }
      pass = this.scheduleForm.startDate && this.scheduleForm.classNum
      if (val && this.getSchedulePlan && pass) {
        // 获取老师的冲突列表数据
        this.$http.post(`/v1/User/getTeacherListAndConflictStatus/${this.currentBranch.id}`, resquestParams).then(res => {
          res.data.forEach(item => {
            this.scheduleOption.teacher[item.id] = item
          })
          this.$forceUpdate()
        })
        // 获取教室的冲突列表数据
        this.$http.post(`/v1/Classroom/getClassroomListAndConflictStatus/${this.currentBranch.id}`, resquestParams).then(res => {
          res.data.forEach(item => {
            this.scheduleOption.classRoom[item.id] = item
          })
          this.$forceUpdate()
        })
      }
    },
    visible(val) {
      if (val) {
        this.$refs['scheduleFormRef'] && this.$refs['scheduleFormRef'].clearValidate()
        this.$refs['coursePlanTimeEntityRef'] && this.$refs['coursePlanTimeEntityRef'][0] && this.$refs['coursePlanTimeEntityRef'][0].clearValidate()
      } else {
        this.scheduleForm.classNum = 0
        this.scheduleForm.classNumType = 0
        this.clearFields()
      }
    },
    data(val) {
      if (val) {
        this.scheduleForm = this._exogenousDataMap(val)
      }
    },
    scheduleType: {
      handler: function (val) {
        switch (val) {
          case 'both':
            this.scheduleForm.courseSchedulingType = 0
            break
          case 'single':
            this.scheduleForm.courseSchedulingType = 1
            break
          case 'circulation':
            this.scheduleForm.courseSchedulingType = 0
            break
          default:
        }
      },
      immediate: true
    },
    classNumLimit(val) {
      if (this.scheduleForm.classNum > val) {
        this.scheduleForm.classNum = val
      }
    }
  },
  mounted() {
    this.data && (this.scheduleForm = this._exogenousDataMap(this.data))
  },
  methods: {
    _getClassData(queryParam = {}) {
      let temParam = Object.assign({}, queryParam, { departmentId: this.currentBranch.id })
      this.loading.class = true
      this.$http.get('/v1/Class/getForDropDown', temParam)
        .then(res => {
          this.scheduleOption.class = res.data
        })
        .finally(() => {
          this.loading.class = false
        })
    },
    // 获取一对一学员列表
    _getStudentData(queryParam = {}) {
      let temParam = Object.assign({}, queryParam, {
        departmentId: this.currentBranch.id,
        organizationId: this.organizationInfo.id
      })
      this.loading.student = true
      this.$http.get('/v1/Student/getOneByOneStudent', temParam)
        .then(res => {
          this.scheduleOption.student = res.data
        })
        .finally(() => {
          this.loading.student = false
        })
    },
    // 根据学员获取课程id
    _getCourseData() {
      let temParam = Object.assign({}, { departmentId: this.currentBranch.id })
      this.loading.course = true
      this.$http.get(`/v1/Course/getStudentOneByOneCourse/${this.scheduleForm.studentId}`, temParam)
        .then(res => {
          this.scheduleOption.course = res.data
        })
        .finally(() => {
          this.loading.course = false
        })
    },
    // 外源数据必然要通过的方法
    _exogenousDataMap(data) {
      let tmpData = JSON.parse(JSON.stringify(data))
      let value = Object.assign({}, this.scheduleForm, tmpData)
      value.classTypeAndNum = [value.classNumType, value.classNum]
      // 单次时
      if (value.courseSchedulingType === 1) {
        let entity = value.coursePlanTimeEntityList[0]
        let tmp = {
          startDate: value.startDate,
          classHour: entity['classHour'] || 0,
          startTime: entity['startTime'] || '',
          endTime: entity['endTime'] || ''
        }
        value['soloEntity'] = tmp
      } else if (value.courseSchedulingType === 0) {
        value['soloEntity'] = {
          startDate: '',
          classHour: 0,
          startTime: '',
          endTime: ''
        }
      }
      // 完成
      return value
    },
    // 重置表单
    clearFields() {
      this.scheduleForm = {
        courseSchedulingType: 0,
        classId: '',
        classNum: 0,
        classNumType: 0,
        classRoomId: '',
        classType: this.scheduleForm.classType,
        scheduleArrangementTarget: this.scheduleForm.scheduleArrangementTarget,
        coursePlanTimeEntityList: [lodash.cloneDeep(coursePlanTimeEntityEctype)],
        endDate: '',
        remark: '',
        skipHolidays: 1,
        startDate: '',
        teacherId: '',
        classTypeAndNum: [0, 0],
        soloEntity: lodash.cloneDeep(soloEntityEctype)
      }
    },
    async handleSubmit() {
      if (this.submitLoading || !this.visible) return
      let pass = true
      await this.$refs['scheduleFormRef'].validate((valid) => {
        if (!valid) {
          pass = false
          return false
        }
      })
      if (this.$refs['coursePlanTimeEntityRef']) {
        await this.$refs['coursePlanTimeEntityRef'].forEach(item => {
          item.validate((valid) => {
            if (!valid) {
              pass = false
              return false
            }
          })
        })
      }
      // 判断开始日期是否大于结束日期
      if (this.scheduleForm.courseSchedulingType === 0 && moment(this.scheduleForm.startDate).isAfter(this.scheduleForm.endDate)) {
        this.$message.error('开始日期不能大于结束日期')
        return false
      }
      if (pass) {
        const _self = this
        let submitFunction = async function (inspectStatus) {
          let tmpObj = await _self.paramsFilter(_self.scheduleForm)
          let finalParam = Object.assign({}, tmpObj, {
            organizationId: _self.organizationInfo.id,
            departmentId: _self.currentBranch.id
          })
          let resData = {}
          _self.submitLoading = true
          await _self.$http.post(`/v1/CoursePlan/addCoursePlan?inspectStatus=${inspectStatus}`, finalParam)
            .then(res => {
              resData = res.data
            })
            .finally(() => {
              _self.submitLoading = false
            })
          return resData
        }
        let resData = await submitFunction(1)
        if ((typeof resData) === 'number' && resData > 0) {
          this.$message.success('课表数据提交成功')
          this.toggle(false)
          this.refreshTimetableByCurrentMode()
        } else if ((typeof resData) === 'number' && resData === 0) {
          this.$message.success('课表数据提交失败')
        } else {
          this.conflictTable.conflictTableClassroom = resData.classroomConflictList
          this.conflictTable.conflictTableTeacher = resData.teacherConflictList
          this.submitFunc = async function () {
            let resData = await submitFunction(0)
            return resData
          }
          this.conflictTableVisible = true
        }
      }
    },
    formatTime(time, defaultVal) {
      if (time == null || time === '') return defaultVal
      if (time.lastIndexOf(':') === 2) {
        return time + ':00'
      }
      return time
    },
    // 将请求参数进行处理，使之合理，并返回处理后的值，这个值不具有任何引用关联
    paramsFilter(value) {
      let tmpObj = JSON.parse(JSON.stringify(value))
      if (tmpObj.courseSchedulingType === 0) {
        let tmpStack = []
        tmpObj.coursePlanTimeEntityList.forEach(item => {
          item.startTime = this.formatTime(item.startTime, '06:00:00')
          item.endTime = this.formatTime(item.endTime, '21:00:00')
          item.week.forEach(weekday => {
            let itemTmp = JSON.parse(JSON.stringify(item))
            itemTmp.week = weekday
            tmpStack.push(itemTmp)
          })
        })
        tmpObj.coursePlanTimeEntityList = tmpStack
        delete tmpObj.soloEntity
        delete tmpObj.classTypeAndNum
      } else if (tmpObj.courseSchedulingType === 1) {
        let arrayTmp = [{
          classHour: tmpObj.soloEntity.classHour,
          startTime: this.formatTime(tmpObj.soloEntity.startTime, '06:00:00'),
          endTime: this.formatTime(tmpObj.soloEntity.endTime, '21:00:00'),
          week: moment(tmpObj.soloEntity.startDate).day() % 7 + 1
        }]
        tmpObj.coursePlanTimeEntityList = arrayTmp
        tmpObj.startDate = tmpObj.soloEntity.startDate
        tmpObj.classNum = 1 // 单次时，排课数量默认为零
        tmpObj.classNumType = 0 // 单次时，排课数量类型默认为课次
        tmpObj.skipHolidays = 0 // 单次时，默认不跳过节假日
        delete tmpObj.soloEntity
        delete tmpObj.classTypeAndNum
      }
      return tmpObj
    },
    // 将排课计划的数据纬度从一维变至二维
    responseFilter(tmpObj) {
      let dimenObj = {} // 分组对象
      for (let i = 0; i < tmpObj.coursePlanTimeEntityList.length; i++) {
        const item = tmpObj.coursePlanTimeEntityList[i]
        // 处理时间
        if (item.startTime) {
          item.startTime = item.startTime.substr(0, 5)
        }
        if (item.endTime) {
          item.endTime = item.endTime.substr(0, 5)
        }
        const key = item.startTime + '~' + item.endTime + '~' + item.classHour
        if (dimenObj[key]) {
          dimenObj[key].push(item.week)
        } else {
          dimenObj[key] = [item.week]
        }
      }
      const tempArr = []
      for (let i = 0; i < tmpObj.coursePlanTimeEntityList.length; i++) {
        const item = tmpObj.coursePlanTimeEntityList[i]
        const key = item.startTime + '~' + item.endTime + '~' + item.classHour
        const find = tempArr.find(o => (o.startTime + '~' + o.endTime + '~' + o.classHour) === key)
        if (!find) {
          // 如果没找到
          tempArr.push({
            classHour: item.classHour,
            endTime: item.endTime,
            startTime: item.startTime,
            week: dimenObj[key] || []
          })
        }
      }
      tmpObj.coursePlanTimeEntityList = tempArr
      return this._exogenousDataMap(tmpObj)
    },
    handleMoreCoursePlanTimeEntity() {
      if (this.scheduleForm.coursePlanTimeEntityList.length < 8) {
        this.scheduleForm.coursePlanTimeEntityList.push(JSON.parse(JSON.stringify(coursePlanTimeEntityEctype)))
      }
    },
    handleRemoveCoursePlanTimeEntity(index) {
      if (this.scheduleForm.coursePlanTimeEntityList.length > 1) {
        this.scheduleForm.coursePlanTimeEntityList.splice(index, 1)
      }
    },
    handleClassTypeChange(val) {
      this.scheduleForm.classId = ''
    },
    handleScheduleArrangementTargetChange(val) {
      // todo 切换目标对象点击事件
      console.log(val)
    },
    async handleClassNumFocus() {
      let pass = await this.preConditionJudgeInClassNum()
      if (!pass) return
      let temParam = this.paramsFilter(this.scheduleForm)
      if (temParam.endDate) {
        this.classNumSettingLoading = true
        this.$http.post(`/v1/CoursePlan/maxClassNum/${this.currentBranch.id}`, temParam)
          .then(res => {
            this.classNumLimit = res.data
            this.scheduleForm.classNum = this.classNumLimit
            this.scheduleForm.classTypeAndNum = [this.scheduleForm.classNumType, res.data]
            if (this.classNumLimit !== 0) {
              this.$refs['scheduleFormRef'].clearValidate()
            }
          })
          .finally(() => {
            this.classNumSettingLoading = false
          })
      } else {
        this.classNumLimit = this.scheduleForm.classNumType === 0 ? 400 : this.scheduleForm.classNumType === 1 ? 1000 : 60
        this.scheduleForm.classNum = 0
      }
    },
    async handleClassRoomSelectFocus() {
      let pass = await this.preConditionJudge()
      if (!pass) return
      let temParam = await this.paramsFilter(this.scheduleForm)
      this.loading.classRoom = true
      this.$http.post(`/v1/Classroom/getClassroomListAndConflictStatus/${this.currentBranch.id}`, temParam)
        .then(res => {
          res.data.forEach(item => {
            this.scheduleOption.classRoom[item.id] = item
          })
        })
        .finally(() => {
          this.loading.classRoom = false
        })
    },
    async handleTeacherSelectFocus() {
      let pass = await this.preConditionJudge()
      if (!pass) return
      let temParam = await this.paramsFilter(this.scheduleForm)
      this.loading.teacher = true
      this.$http.post(`/v1/User/getTeacherListAndConflictStatus/${this.currentBranch.id}`, temParam)
        .then(res => {
          res.data.forEach(item => {
            this.scheduleOption.teacher[item.id] = item
          })
        })
        .finally(() => {
          this.loading.teacher = false
        })
    },
    handleClassSelectFocus() {
      this._getClassData({ giveLessonsWay: this.scheduleForm.classType })
    },
    handleStudentSelectFocus() {
      this._getStudentData()
    },
    handleCourseSelectFocus() {
      this._getCourseData()
    },
    // 前置条件判断: 排课数量的前置判断条件
    async preConditionJudgeInClassNum() {
      if (this.scheduleForm.courseSchedulingType === 0) {
        let errMsgStack = []
        let ok = true
        // 2. 开始日期判断
        await this.$refs['scheduleFormRef'].validateField('startDate', errMsg => {
          if (errMsg) {
            errMsgStack.push('开始日期')
            ok = false
          }
        })
        // 3. 排课安排判断
        await this.$refs['coursePlanTimeEntityRef'].forEach(item => {
          item.validate((valid) => {
            if (!valid) {
              ok = false
              errMsgStack.push('排课安排')
            }
          })
        })
        if (!ok) {
          this.$message.error(`请完善：${errMsgStack.join('；')}`)
        }
        return ok
      } else if (this.scheduleForm.courseSchedulingType === 1) {
        let errMsgStack = []
        let ok = true
        // 2. 上课日期判断
        await this.$refs['scheduleFormRef'].validateField('soloEntity.startDate', errMsg => {
          if (errMsg) {
            errMsgStack.push('上课日期')
            ok = false
          }
        })
        // 3. 上课时间判断
        await this.$refs['scheduleFormRef'].validateField('soloEntity.endTime', errMsg => {
          if (errMsg) {
            errMsgStack.push('上课时间')
            ok = false
          }
        })
        // 4. 授课课时判断
        await this.$refs['scheduleFormRef'].validateField('soloEntity.classHour', errMsg => {
          if (errMsg) {
            errMsgStack.push('授课课时')
            ok = false
          }
        })
        if (!ok) {
          this.$message.error(`请完善：${errMsgStack.join('；')}`)
        }
        return ok
      }
    },
    // 前置条件判断: 上课教室和上课老师请求的前置判断条件
    async preConditionJudge(silent = false) {
      if (this.scheduleForm.courseSchedulingType === 0) {
        let errMsgStack = []
        let ok = true
        // 1. 班级
        await this.$refs['scheduleFormRef'].validateField('classId', errMsg => {
          if (errMsg) {
            errMsgStack.push('班级')
            ok = false
          }
        })
        // 1. 开始日期判断
        await this.$refs['scheduleFormRef'].validateField('startDate', errMsg => {
          if (errMsg) {
            errMsgStack.push('开始日期')
            ok = false
          }
        })
        // 2. 排课安排判断
        await this.$refs['coursePlanTimeEntityRef'].forEach(item => {
          item.validate((valid) => {
            if (!valid) {
              ok = false
              errMsgStack.push('排课安排')
            }
          })
        })
        // 3.课时选择判断
        await this.$refs['scheduleFormRef'].validateField('classTypeAndNum', errMsg => {
          if (errMsg) {
            errMsgStack.push('排课数量')
            ok = false
          }
        })
        if (!ok && !silent) {
          this.$message.error(`请完善：${errMsgStack.join('；')}`)
        }
        if (silent) {
          this.$refs['scheduleFormRef'].clearValidate()
        }
        return ok
      } else if (this.scheduleForm.courseSchedulingType === 1) {
        let errMsgStack = []
        let ok = true
        // 1. 班级
        await this.$refs['scheduleFormRef'].validateField('classId', errMsg => {
          if (errMsg) {
            errMsgStack.push('班级')
            ok = false
          }
        })
        // 1. 上课日期判断
        await this.$refs['scheduleFormRef'].validateField('soloEntity.startDate', errMsg => {
          if (errMsg) {
            errMsgStack.push('上课日期')
            ok = false
          }
        })
        // 2. 上课时间判断
        await this.$refs['scheduleFormRef'].validateField('soloEntity.endTime', errMsg => {
          if (errMsg) {
            errMsgStack.push('上课时间')
            ok = false
          }
        })
        //
        await this.$refs['scheduleFormRef'].validateField('soloEntity.classHour', errMsg => {
          if (errMsg) {
            errMsgStack.push('授课课时')
            ok = false
          }
        })
        // 3.课时选择判断
        await this.$refs['scheduleFormRef'].validateField('classTypeAndNum', errMsg => {
          if (errMsg) {
            errMsgStack.push('排课数量')
            ok = false
          }
        })
        if (!ok && !silent) {
          this.$message.error(`请完善：${errMsgStack.join('；')}`)
        }
        if (silent) {
          this.$refs['scheduleFormRef'].clearValidate()
        }
        return ok
      }
    },
    handleSkipHolidaysChange() {
      this.scheduleForm.classTypeAndNum = [0, 0]
      this.scheduleForm.classNumType = 0
      this.scheduleForm.classNum = 0
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    async handlelassNumTypeChange(val) {
      this.handleClassNumFocus()
      this.$set(this.scheduleForm.classTypeAndNum, 0, val)
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
      let pass = await this.preConditionJudgeInClassNum()
      if (!pass) return
      let temParam = this.paramsFilter(this.scheduleForm)
      this.classNumLimit = -1 // 防止数据上次的数据污染
      if (temParam.endDate) {
        this.classNumSettingLoading = true
        await this.$http.post(`/v1/CoursePlan/maxClassNum/${this.currentBranch.id}`, temParam)
          .then(res => {
            this.classNumLimit = res.data
            this.scheduleForm.classTypeAndNum = [this.scheduleForm.classNumType, res.data]
            if (this.classNumLimit !== 0) {
              this.$refs['scheduleFormRef'].clearValidate()
            }
          })
          .finally(() => {
            this.classNumSettingLoading = false
          })
      } else {
        this.classNumLimit = this.scheduleForm.classNumType === 0 ? 400 : this.scheduleForm.classNumType === 1 ? 1000 : 60
      }
    },
    handleClassNumChange(val) {
      this.$set(this.scheduleForm.classTypeAndNum, 1, val)
      if (this.scheduleForm.classRoomId || this.scheduleForm.teacherId) {
        this.scheduleForm.teacherId = ''
        this.scheduleForm.classRoomId = ''
      }
    },
    handleClassSelectChange(val) {
      this.$refs['scheduleFormRef'].clearValidate()
      if (this.getSchedulePlan) {
        this.formLoading = true
        this.$http.get(`/v1/CoursePlan/coursePlan/${val}`)
          .then(res => {
            if (res.data) {
              delete res.data.classType // 不同步上课方式
              this.scheduleForm = this.responseFilter(res.data)
              this.preConditionJudge()
            } else {
              this.clearFields()
              this.scheduleForm.classId = val
            }
          })
          .finally(() => {
            this.formLoading = false
          })
      }
    },
    handleStudentSelectChange(val) {
      this.scheduleForm.studentId = val
    },
    handleCourseSelectChange(val) {
      console.log(val)
    },
    handleStartDateChange() {
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    handleEndDateChange() {
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    handleCoursePlanTimeEntityChange() {
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    handleTimeRangeChange() {
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    handleClassHourChange() {
      this.scheduleForm.teacherId = ''
      this.scheduleForm.classRoomId = ''
    },
    handleExit() {
      this.$emit('toggle', false)
    },
    handleSubmitSuccess() {
      this.refreshTimetableByCurrentMode()
      this.toggle(false)
    },
    toggle(val) {
      this.$emit('toggle', val)
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

.form-tip
  font-size 13px
  color $color-info
  margin-left 20px

.student-course-select
  display flex

.schedule-body
  padding 0px

  .pre-setting
    padding 0px

  .info-iuput
    padding 0px

    .class-num-item
      display flex

      .el-input-number
        margin-bottom 1px

      .tip-text
        margin-left 15px
        font-size 13px

        span
          color $color-text-3

    .item-skipHolidaysState
      .tip-text
        font-size 13px

        span
          color $color-text-3
          margin-left 50px

    .conflict-warning
      color $color-warning
      margin-left 10px
      cursor default

    .overflow-warning
      color $color-warning
      margin-left 10px
      cursor help

    .entity-add-item
      display flex
      width 110px
      cursor pointer
      color $color-primary
      margin-top 5px

      &:hover
        color #F80

      .entity-add-item-icon
        margin-right 5px

    .course-plan-time-entity + .course-plan-time-entity
      margin-top 20px

  .operation-area
    text-align center

    .el-button
      margin-right 20px

    .el-button:last-child
      margin-right 0px
</style>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible="visible"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    :append-to-body="true"
    custom-class="custom-dialog"
    @close="toggle(false)"
    width="1000px"
    top="5vh"
    class="check-dialog">
    <div class="tip-text">
      <span
        v-if="courseTimeData && (courseTimeData.goToClassStatus === 0)">注：{{
          (courseTimeData && courseTimeData.className) || ''
        }}当前已分班的学员</span>
      <span
        v-else-if="courseTimeData && (courseTimeData.goToClassStatus === 1 || courseTimeData.goToClassStatus === 2)">注：{{
          (courseTimeData && courseTimeData.className) || ''
        }}已点名的学员</span>
    </div>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      class="check-table"
      size="mini">
      <el-table-column
        prop="name"
        label="姓名（昵称）"
        min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
          <span v-if="scope.row.nickName">({{ scope.row.nickName }})</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="classHour"
        label="剩余课时"
        min-width="100"
        align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.classHour || scope.row.oneClassHour || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="signInStatus"
        label="签到情况"
        min-width="100"
        align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.signInStatus === 0">未签到</el-tag>
          <el-tag v-else-if="scope.row.signInStatus === 1" type="success">已签到</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="点名操作"
        width="440"
        align="center">
        <template slot-scope="scope" v-if="callRollStatusValid">
          <el-radio-group v-model="scope.row.callRollStatus" @change="handleCallRollStatusChange"
                          :disabled="scope.row.makeUpMissedLessonsTime != null ? true : false">
            <el-radio :label="0" style="width: 80px; text-align: left">到课</el-radio>
            <el-radio :label="1" style="width: 80px; text-align: left"
                      v-if="scope.row.makeUpMissedLessonsStatus == 1 && scope.row.makeUpMissedLessonsTime != null && scope.row.callRollStatus == 1">
              缺勤(已补课)
            </el-radio>
            <el-radio :label="1" style="width: 80px; text-align: left"
                      v-else-if="scope.row.makeUpMissedLessonsStatus == 2 && scope.row.makeUpMissedLessonsTime != null && scope.row.callRollStatus == 1">
              缺勤(已忽略)
            </el-radio>
            <el-radio :label="1" style="width: 80px; text-align: left" v-else>缺勤</el-radio>
            <el-radio :label="2" style="width: 80px; text-align: left"
                      v-if="scope.row.makeUpMissedLessonsStatus == 1 && scope.row.makeUpMissedLessonsTime != null && scope.row.callRollStatus == 2">
              请假(已补课)
            </el-radio>
            <el-radio :label="2" style="width: 80px; text-align: left"
                      v-else-if="scope.row.makeUpMissedLessonsStatus == 2 && scope.row.makeUpMissedLessonsTime != null && scope.row.callRollStatus == 2">
              请假(已忽略)
            </el-radio>
            <el-radio :label="2" style="width: 80px; text-align: left" v-else>请假</el-radio>
            <el-radio :label="3" style="width: 80px; text-align: left">未点名</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <span v-if="courseTimeData && (courseTimeData.goToClassStatus === 0)" slot="empty">暂时没有分配学员</span>
      <span v-else-if="courseTimeData && (courseTimeData.goToClassStatus === 1)" slot="empty">没有历史学员</span>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('toggle', false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提 交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

export default {
  name: 'CheckStudentDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    courseTimeData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      callRollStatusValid: true,
      tableLoading: false,
      submitLoading: false,
      /**
       *  id
       *  name
       *  nickName
       *  sex
       *  valuationType: // 课程计价方式 0课时计价 1按期计费 2按时间计费 3日历计价
       *  classHour
       */
      tableData: []
    }
  },
  computed: {
    dialogTitle() {
      if (this.courseTimeData == null || this.courseTimeData.goToClassStatus == null) {
        return ''
      } else if (this.courseTimeData.goToClassStatus === 0 && this.courseTimeData.className) {
        return `学生点名（${this.courseTimeData.className}）`
      } else if (this.courseTimeData.goToClassStatus === 0 && this.courseTimeData.oneStudentName) {
        return `学生点名（${this.courseTimeData.oneStudentName}）`
      } else if ((this.courseTimeData.goToClassStatus === 1 || this.courseTimeData.goToClassStatus === 2) && this.courseTimeData.className) {
        return `编辑点名（${this.courseTimeData.className}）`
      } else if ((this.courseTimeData.goToClassStatus === 1 || this.courseTimeData.goToClassStatus === 2) && this.courseTimeData.oneStudentName) {
        return `编辑点名（${this.courseTimeData.oneStudentName}）`
      } else {
        return ''
      }
    }
  },
  watch: {
    courseTimeData() {
      this._getTableData()
    }
  },
  created() {
  },
  methods: {
    _getTableData() {
      if (this.courseTimeData === null && Object.keys(this.courseTimeData).length === 0) return
      // 未点名的学生数据
      if (this.courseTimeData.goToClassStatus === 0) {
        // 班级排课点名
        if (this.courseTimeData.classId) {
          this.tableLoading = true
          this.$http.get(`/v1/Student/getStudentList/${this.courseTimeData.classId}`)
            .then(res => {
              this.tableData = res.data
              this.tableData.forEach(item => {
                item['callRollStatus'] = 0 // 点名状态默认：0--到课
                item['courseTimeId'] = this.courseTimeData.id // 每条课表的ID
                item['signInStatus'] = 0 // 签到状态：0--未签到
                item['studentId'] = item.id // 学生ID
                delete item.id
              })
            })
            .finally(() => {
              this.tableLoading = false
            })
        } else {
          // 学员排课点名
          this.tableLoading = true
          this.$http.get(`/v1/Student/getStudent/${this.courseTimeData.id}`)
            .then(res => {
              this.tableData = []
              this.tableData.push(res.data)
              this.tableData.forEach(item => {
                item['callRollStatus'] = 0 // 点名状态默认：0--到课
                item['courseTimeId'] = this.courseTimeData.id // 每条课表的ID
                item['signInStatus'] = 0 // 签到状态：0--未签到
                item['studentId'] = item.id // 学生ID
                delete item.id
              })
            })
            .finally(() => {
              this.tableLoading = false
            })
        }
        // 已点名的学生数据
      } else if (this.courseTimeData.goToClassStatus === 1 || this.courseTimeData.goToClassStatus === 2) {
        this.tableLoading = true
        this.$http.get(`/v1/CourseCheckingIn/getCourseCheckingIn/${this.courseTimeData.id}`)
          .then(res => {
            // makeUpMissedLessonsStatus 补课处理状态 0未处理 1已补课 2已忽略
            // makeUpMissedLessonsTime 补课时间
            this.tableData = res.data
          })
          .finally(() => {
            this.tableLoading = false
          })
      }
    },
    handleSubmit() {
      if (this.submitLoading || !this.visible) return
      // 检查日期是否在今天之后
      let isAfter = moment(this.courseTimeData.goToClassDate).isAfter()
      if (isAfter) {
        this.$message.warning('不能对今天之后的课表进行点名操作')
        return
      }
      // 检查是否有学员
      if (this.tableData.length === 0) {
        this.$message.warning('暂无学员，不能进行点名')
        return
      }
      // 未点名的学生数据
      if (this.courseTimeData.goToClassStatus === 0) {
        let tmpData = lodash.cloneDeep(this.tableData)
        // tmpData.forEach(item => {
        //   delete item.name
        //   delete item.nickName
        //   delete item.sex
        //   delete item.valuationType
        //   delete item.classHour
        // })
        this.submitLoading = true
        this.$http.post('/v1/CourseCheckingIn/addCourseCheckingIn', tmpData)
          .then(() => {
            this.$message.success('点名成功')
            this.$emit('toggle', false)
            this.$emit('success')
          })
          .finally(() => {
            this.submitLoading = false
          })
        // 已点名的学生数据
      } else if (this.courseTimeData.goToClassStatus === 1 || this.courseTimeData.goToClassStatus === 2) {
        let tmpData = lodash.cloneDeep(this.tableData)
        tmpData.forEach(item => {
          item['courseTimeId'] = this.courseTimeData.id
        })
        this.submitLoading = true
        this.$http.put('/v1/CourseCheckingIn/updateCourseCheckingIn', tmpData)
          .then(() => {
            this.$message.success('编辑点名成功')
            this.$emit('toggle', false)
            this.$emit('success')
          })
          .finally(() => {
            this.submitLoading = false
          })
      }
    },
    handleCallRollStatusChange() {
      this.callRollStatusValid = false
      this.$nextTick(() => {
        this.callRollStatusValid = true
      })
    },
    toggle(flag) {
      this.$emit('toggle', flag)
    }
  }
}
</script>

<style lang="stylus" scoped>
.check-dialog
  .tip-text
    margin-bottom 5px
    color $color-text-2

  .dialog-footer
    text-align center

    .el-button + .el-button
      margin-left 20px

    .el-button
      width 70px

</style>

<template>
  <el-dialog
    title="冲突列表"
    :visible="visible"
    :close-on-click-modal="false"
    @close="toggle(false)"
    custom-class="custom-dialog"
    width="800px"
    top="5vh">
    <div class="timetable-wrapper">
      <el-tabs v-model="currentMode">
        <el-tab-pane label="冲突老师" name="0"></el-tab-pane>
        <el-tab-pane label="冲突教室" name="1"></el-tab-pane>
      </el-tabs>
    </div>
    <div>
      <el-table
        v-show="currentMode === '0'"
        :data="conflictTable.conflictTableTeacher || ''"
        style="width: 100%"
        empty-text="无冲突数据"
        height="40vh">
        <el-table-column
          prop="teacherName"
          label="老师姓名"
          width="180"
          align="center">
        </el-table-column>
        <el-table-column
          prop="className"
          label="班级名称"
          width="180"
          align="center">
        </el-table-column>
        <el-table-column
          prop="goToClassDate"
          label="开课日期"
          width="180"
          align="center">
          <template slot-scope="scope">
            {{ moment(scope.row.goToClassDate).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassStartTime"
          label="开始上课时间"
          align="center">
          <template slot-scope="scope">
            {{moment(scope.row.goToClassStartTime, "HH:mm:ss").format("HH:mm")}}
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassEndTime"
          label="结束上课时间"
          align="center">
          <template slot-scope="scope">
            {{moment(scope.row.goToClassEndTime, "HH:mm:ss").format("HH:mm")}}
          </template>
        </el-table-column>
      </el-table>
      <el-table
        v-show="currentMode === '1'"
        :data="conflictTable.conflictTableClassroom || []"
        style="width: 100%"
        empty-text="无冲突数据"
        height="40vh">
        <el-table-column
          prop="classRoomName"
          label="教室名称"
          width="180"
          align="center">
        </el-table-column>
      <el-table-column
          prop="className"
          label="班级名称"
          width="180"
          align="center">
        </el-table-column>
        <el-table-column
          prop="goToClassDate"
          label="开课日期"
          width="180"
          align="center">
          <template slot-scope="scope">
            {{ moment(scope.row.goToClassDate).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassStartTime"
          label="开始上课时间"
          align="center">
          <template slot-scope="scope">
            {{moment(scope.row.goToClassStartTime, "HH:mm:ss").format("HH:mm")}}
          </template>
        </el-table-column>
        <el-table-column
          prop="goToClassEndTime"
          label="结束上课时间"
          align="center">
          <template slot-scope="scope">
            {{moment(scope.row.goToClassEndTime, "HH:mm:ss").format("HH:mm")}}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="operation-area">
      <el-button @click="handleQuit">&nbsp;放弃提交&nbsp;</el-button>
      <el-button type="primary" @click="handleIgnoreConflict" :loading="submitLoading">&nbsp;忽略冲突&nbsp;</el-button>
    </div>
  </el-dialog>
</template>

<script>
import moment from 'moment'
export default {
  name: 'ConflictTableDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    conflictTable: Object, // 冲突表格数据
    submitFunc: Function // 数据提交函数
  },
  data() {
    return {
      moment,
      currentMode: '0',
      submitLoading: false
    }
  },
  methods: {
    handleQuit() {
      this.toggle(false)
      this.$emit('quit')
    },
    async handleIgnoreConflict() {
      if (!this.visible || this.submitLoading) return
      this.submitLoading = true
      try {
        let count = await this.submitFunc()
        if ((typeof count) === 'number' && count > 0) {
          this.$message.success('课表数据提交成功')
          this.$emit('success')
          this.toggle(false)
        } else {
          this.$message.success('课表数据提交失败')
          this.$emit('failure')
        }
      } catch (error) {
        this.submitLoading = false
      }
      this.submitLoading = false
    },
    toggle(flag) {
      this.$emit('toggle', flag)
    }
  }
}
</script>

<style lang="stylus" scoped>
.operation-area
  text-align center
  margin-top 20px
  .el-button+.el-button
    margin-left 20px
</style>
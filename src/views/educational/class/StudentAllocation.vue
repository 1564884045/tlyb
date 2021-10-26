<template>
  <div class="transfer" v-loading="pageLoading">
    <div class="transfer-right">
      <span class="transfer-header">{{currentClass.courseName || '该课程' }}（课程）的未分班学员</span>
      <div class="query-operation">
        <el-input v-model="queryForm.name" :maxlength="30" :placeholder="'请输入学生姓名'" @keyup.native.enter="handleRightQuery" style="width: 200px; margin-right: 30px">
          <el-button slot="append" icon="el-icon-search" @click="handleRightQuery" type="primary"></el-button>
        </el-input>
        <inline-select
          :options="gradeOptions"
          label="就读年级"
          v-model="queryForm.grade"
          @change="handleRightQuery"
          :optionWidth="180"/>
        <el-button :disabled="!left.tableLoading ? false : true" @click="handleRightQueryReset" type="text">重置</el-button>
      </div>
      <el-table
        :data="right.tableData"
        stripe
        size="mini"
        v-loading="left.tableLoading"
        ref="rightTable"
        height="50vh"
        style="border: 1px solid #e6e6e6"
        :key="right.selectionRefeshKey"
        @selection-change="handleRightToggleSelection">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名(昵称)"
          min-width="140">
          <p class="username" slot-scope="scope">
            <span>{{scope.row.name}}</span>
            <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
          </p>
        </el-table-column>
        <el-table-column
          prop="primaryContactPhone"
          label="主要联系人(手机号)"
          min-width="160">
          <p class="username" slot-scope="scope">
            <span>{{scope.row.primaryContactName}}</span>
            <span v-if="scope.row.primaryContactPhone">({{scope.row.primaryContactPhone}})</span>
          </p>
        </el-table-column>
        <el-table-column
          prop="sex"
          label="性别"
          width="64">
          <template slot-scope="scope">
            {{ (scope.row.sex === 1 && '男') || (scope.row.sex === 2 && '女') || '未知'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          width="64">
          <template slot-scope="scope">
            {{(scope.row.age || 0) + '岁'}}
          </template>
        </el-table-column>
        <span slot="empty">{{ `暂无学员，当前课程：${currentClass.courseName || ''}`}}</span>
      </el-table>
      <div>
        <span>当前总人数：{{ right.tableData.length }}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span>已选择的人数：{{ right.selectedStudent.length }}</span>
      </div>
    </div>
    <div class="transfer-center">
      <div class="trun-btn">
        <el-tooltip :content="`将选中的已分班学员分出${currentClass.name || '本班'}`" placement="right" effect="light">
          <el-button circle @click="handleLeaveClass" :type="left.selectedStudent.length > 0 ? 'success' : ''">
            <i class="el-icon-arrow-left transfer-icon"></i>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="`将选中未分班的学员分入${currentClass.name || '本班'}`" placement="left" effect="light">
          <el-button circle @click="handleEnterClass" :type="right.selectedStudent.length > 0 ? 'success' : ''">
            <i class="el-icon-arrow-right transfer-icon"></i>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="transfer-left">
      <span class="transfer-header">{{currentClass.name || '本班'}}的学员</span>
      <div class="class-info">
        <p>可容纳人数：<span class="number-info-text">{{ currentClass['volume'] }}</span></p>
        <p>当前已分配人数：<span class="number-info-text">{{ left.tableData.length }}</span></p>
      </div>
      <el-table
        :data="left.tableData"
        stripe
        v-loading="left.tableLoading"
        ref="leftTable"
        height="50vh"
        style="border: 1px solid #e6e6e6;"
        @selection-change="handleLeftToggleSelection">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="studentName"
          label="姓名(昵称)"
          min-width="140">
          <p class="username" slot-scope="scope">
            <span>{{scope.row.studentName}}</span>
            <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
          </p>
        </el-table-column>
        <el-table-column
          prop="primaryContactPhone"
          label="主要联系人(手机号)"
          min-width="160">
          <p class="username" slot-scope="scope">
            <span>{{scope.row.primaryContactName}}</span>
            <span v-if="scope.row.primaryContactPhone">({{scope.row.primaryContactPhone}})</span>
          </p>
        </el-table-column>
        <el-table-column
          prop="sex"
          label="性别"
          width="64">
          <template slot-scope="scope">
            {{ (scope.row.sex === 1 && '男') || (scope.row.sex === 2 && '女') || '未知'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          width="64">
          <template slot-scope="scope">
            {{(scope.row.age || 0) + '岁'}}
          </template>
        </el-table-column>
        <span slot="empty">{{ `暂未分配学员`}}</span>
      </el-table>
      <div>
        <span>当前总人数：{{ left.tableData.length }}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span>已选择的人数：{{ left.selectedStudent.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import InlineSelect from '@/components/InlineSelect'
import moment from 'moment'
const gradeList = ['托管', '小班', '中班', '大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三']

export default {
  name: 'StudentAllocation',
  components: {
    InlineSelect
  },
  inject: ['refreshClassTable'],
  props: {
    classId: {
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  data () {
    return {
      currentCourseId: null,
      currentClass: {},
      pageLoading: false,
      left: {
        tableLoading: false,
        tableData: [],
        selectedStudent: []
      },
      right: {
        tableLoading: false,
        tableData: [],
        selectedStudent: []
      },
      gradeOptions: gradeList.map(item => { return { label: item, value: item } }),
      queryForm: {
        grade: '',
        name: ''
      },
      currentQueryParams: {}
    }
  },
  watch: {
    classId: {
      handler() {
        this._getCurrentClassDetail()
        this._getAllStudentClassList()
      },
      immediate: true
    }
  },
  methods: {
    _getCurrentClassDetail() {
      if (!this.classId) return
      this.$http.get('/v1/Class/getClassById', { id: this.classId, organizationId: this.organizationInfo.id, departmentId: this.currentBranch.id })
        .then(res => {
          this.currentClass = res.data
          this.currentCourseId = res.data.courseId
          this._getNoClassStudentList()
        })
    },
    /** 左边表格的操作: 获取该课程下的所有学生 */
    _getAllStudentClassList () {
      if (!this.classId) return
      const basic = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        classId: this.classId
      }
      const params = Object.assign({}, basic)
      this.left.tableLoading = true
      this.$http.get('/v1/StudentClass/getStudentClassList', params)
        .then(res => {
          res.data.forEach(item => {
            if (item.birthday) {
              item['age'] = Math.abs(moment(item.birthday).diff(moment(), 'year'))
            }
          })
          this.left.tableData = res.data
        })
        .finally(() => {
          this.left.tableLoading = false
        })
    },
    /** 右边表格的操作：获取当前课程下的所有学生 */
    _getNoClassStudentList() {
      if (!this.currentCourseId) return
      const basic = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        courseId: this.currentCourseId
      }
      const params = Object.assign({}, this.currentQueryParams, basic)
      this.right.tableLoading = true
      this.$http.get('/v1/Student/getNoClassStudentInfoByCourseId', params)
        .then(res => {
          res.data.forEach(item => {
            if (item.birthday) {
              item['age'] = Math.abs(moment(item.birthday).diff(moment(), 'year'))
            }
          })
          this.right.tableData = res.data
        })
        .finally(() => {
          this.right.tableLoading = false
        })
    },
    handleEnterClass () {
      // 是否已有选择
      if (this.right.selectedStudent.length < 1) return
      // 提交数据的方法
      const submitFunc = () => {
        let params = []
        this.right.selectedStudent.forEach(item => {
          params.push({ classId: this.classId, studentId: item.id })
        })
        this.pageLoading = true
        this.$http.post('/v1/StudentClass/addStudentClasses', params)
          .then(() => {
            this.$message.success('学员分配成功')
            // 将已分派的学员去除
            this.right.selectedStudent.forEach(item => {
              const allStuIds = this.right.tableData.map(item => item.id)
              const index = allStuIds.indexOf(item.id)
              if (index > -1) {
                this.right.tableData.splice(index, 1)
              }
            })
            // 请求已分班学生的数据
            this._getAllStudentClassList()
            this.refreshClassTable()
          })
          .finally(() => {
            this.$refs['rightTable'].clearSelection()
            this.pageLoading = false
          })
      }
      // 检测人数的合理性
      let increment = this.right.selectedStudent.length
      let current = this.left.tableData.length
      if (increment + current > this.currentClass.volume) {
        this.$confirm(`分班人数超过本班的人数限制, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          submitFunc()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        submitFunc()
      }
    },
    handleLeaveClass () {
      // 是否已有选择
      if (this.left.selectedStudent.length < 1) return
      const idsStr = this.left.selectedStudent.map(item => item.studentId).join(';')
      this.pageLoading = true
      this.$http.delete('/v1/StudentClass/deleteBatch', { studentIds: idsStr, classId: this.classId })
        .then(() => {
          this.refreshClassTable()
          this.$message.success('学员退班成功')
          // 将已分派的学员去除
          this.left.selectedStudent.forEach(item => {
            const allStuIds = this.left.tableData.map(item => item.studentId)
            const index = allStuIds.indexOf(item.studentId)
            if (index > -1) {
              this.left.tableData.splice(index, 1)
            }
          })
          // 请求已分班学生的数据
          this._getNoClassStudentList()
          this.refreshClassTable()
        })
        .finally(() => {
          this.$refs['leftTable'].clearSelection()
          this.pageLoading = false
        })
    },
    handleRightQueryReset () {
      this.queryForm.ageRange = []
      if (Array.isArray(this.queryForm.grade)) {
        this.queryForm.grade = []
      } else {
        this.queryForm.grade = ''
      }
      this.queryForm.name = ''
      this.currentQueryParams = {}
      this._getNoClassStudentList()
    },
    handleRightQuery () {
      let params = {
        grade: this.queryForm.grade,
        name: this.queryForm.name
      }
      Object.keys(params)
        .forEach(item => {
          if (params[item] == null) { delete params[item] }
        })
      this.currentQueryParams = params
      this._getNoClassStudentList()
    },
    handleLeftToggleSelection(val) {
      this.left.selectedStudent = val
    },
    handleRightToggleSelection(val) {
      this.right.selectedStudent = val
    }
  }
}
</script>

<style lang="stylus" scoped>
.transfer
  display flex
  max-width 1100px
  padding 15px
  background-color #fff
  .transfer-left
    width 100%
    .class-info
      margin 7px 0px
      height 42px
      p
        margin-bottom 5px
        .number-info-text
          color $color-primary
  .transfer-center
    display flex
    align-items center
    .trun-btn
      padding 0 30px
      .el-button
        margin-left 0px
        margin-bottom 20px
        .transfer-icon
          font-weight 600
      .el-button:last-child
        margin-bottom 0px
  .transfer-right
    width 100%
    .query-operation
      margin 7px 0px
      height 42px

.transfer-header
  display flex
  justify-content space-around
  margin-bottom 20px
  color #FF6600
  font-size 800
  font-weight 600
  font-size 16px
</style>

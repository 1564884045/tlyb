<!--  -->
<template>
  <div class="order-wrapper">
    <div class="query-form">
      <el-date-picker
        v-model="queryForm.dateRange"
        align="right"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm:ss"
        value-format="yyyy-MM-dd HH:mm:ss"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        :picker-options="pickerOptions"
        @change="query"
        style="margin-left: 16px;">
      </el-date-picker>
      <inline-select v-model="queryForm.userId" label="选择教师" @change="query" valueAttr="id" labelAttr="username" :loading="userLoading" :options="teacherList" @show="_getTeacherList" filterable clearable style="margin-left:20px;"/>
    </div>
    <div class="container">
      <el-table
        :data="tableList"
        stripe
        v-loading="queryLoading">
        <el-table-column
          prop="teacherName"
          label="教师姓名"
          width="180"
          fixed="left">
        </el-table-column>
        <el-table-column
          prop="assignHomeworkCount"
          label="作业布置次数"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          prop="receivableHomeworkCount"
          label="布置作业次数"
          width="120"
          align="center">
        </el-table-column>
        <!-- <el-table-column
          prop="receivedHomeworkCount"
          label="实收作业次数"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="totalReviewCount"
          label="应点评次数"
          width="120"
          align="center">
        </el-table-column> -->
        <el-table-column
          prop="reviewedCount"
          label="实际点评次数"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          prop="totalAttendClassCount"
          label="应上课次数"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          prop="attendClassCount"
          label="实际上课次数"
          width="140"
          align="center">
        </el-table-column>
        <el-table-column
          prop="classDynamicsCount"
          label="发布课堂动态次数"
          win-width="140"
          align="center">
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="queryForm.pageNum"
          :page-size.sync="queryForm.pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'TeacherEduStatistics',
  data() {
    return {
      queryLoading: false,
      userLoading: false,
      teacherList: [],
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [moment().subtract('days', 7).format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        userId: null
      },
      total: 0,
      tableList: [],
      pickerOptions: {
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
        }, {
          text: '今年',
          onClick(picker) {
            picker.$emit('pick', [moment().startOf('year').toDate(), moment().endOf('year').toDate()])
          }
        }]
      }
    }
  },
  components: {
    InlineSelect
  },
  // 生命周期 - 创建完成
  created() {
    this._getTeacherList()
    // this._getTeacherCourseStatistics()
  },
  // 相关方法
  methods: {
    _getTeacherCourseStatistics() {
      if (!this.queryForm.dateRange || this.queryForm.dateRange.length === 0) {
        this.$message.error('开始时间和结束时间不能为空')
        return
      }
      this.queryLoading = true
      const params = {
        organizationId: this.currentBranch.organizationId,
        pageNum: this.queryForm.pageNum,
        pageSize: this.queryForm.pageSize
      }
      if (this.queryForm.userId) {
        params.userId = this.queryForm.userId
      } else {
        let userIds = ''
        this.teacherList.forEach(item => {
          userIds += item.id + ';'
        })
        if (userIds.length > 0) {
          userIds = userIds.substring(0, userIds.length - 1)
        }
        params.userIds = userIds
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0]
        params.endTime = this.queryForm.dateRange[1]
      }
      this.$http.get('/v1/Statistics/getTeacherCourseStatistics', params).then(res => {
        this.tableList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.userLoading = true
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.userLoading = false
        this._getTeacherCourseStatistics()
      })
    },
    handleSizeChange(val) {
      this.queryForm.pageSize = val
      this._getTeacherCourseStatistics()
    },
    handleCurrentChange(val) {
      this.queryForm.pageNum = val
      this._getTeacherCourseStatistics()
    },
    query() {
      this._getTeacherCourseStatistics()
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'organizationInfo',
      'currentBranch'
    ])
  }
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  width 100%
  height 100%
</style>

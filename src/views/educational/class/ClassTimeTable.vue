<template>
  <div class="table-area">
    <el-table ref="tableRef" :data="tableData" border style="width: 100%" v-loading="tableLoading" size="mini" height="50vh">
      <el-table-column prop="goToClassDate" label="上课时间" width="240" align="center">
        <template slot-scope="scope">
          <p class="time-data-item">
            <span>{{ moment(scope.row.goToClassDate).format("YYYY-MM-DD") }}</span>
            <span>{{ date2Weekday(scope.row.goToClassDate) }}</span>
            <span>{{ moment(scope.row.goToClassStartTime, "HH:mm:ss").format("HH:mm") }}-{{moment(scope.row.goToClassEndTime, "HH:mm:ss").format("HH:mm")}}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="courseName" label="课程" min-width="180" align="center"></el-table-column>
      <el-table-column prop="classRoomName" label="教室" min-width="170" align="center"></el-table-column>
      <el-table-column prop="teacherName" label="上课老师" min-width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.teacherName">{{scope.row.teacherName}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="classHour" label="授课课时" width="70" align="center"></el-table-column>
      <el-table-column label="点名" width="80" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.goToClassStatus === 0">
            <el-button type="text" size="mini" @click="handleCheckStudent(scope.row)">点名</el-button>
          </template>
          <template v-else-if="scope.row.goToClassStatus === 1 || scope.row.goToClassStatus === 2">
            <el-button type="text" size="mini" @click="handleCheckStudent(scope.row)">编辑点名</el-button>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="goToClassStatus" label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.goToClassStatus === 2" type="warning">部分点名</el-tag>
          <el-tag v-if="scope.row.goToClassStatus === 1" type="success">已上</el-tag>
          <el-tag v-else-if="scope.row.goToClassStatus === 0" type="info">未上</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.pageNum"
      :page-sizes="[10, 20, 30]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="total"
      style="margin-top: 10px;"
    ></el-pagination>
    <!-- 点名 -->
    <call-roll-dialog v-model="checkStuVisible" :courseTimeData="currentCourseTime" @success="getTableData"></call-roll-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
//  点名窗口
import CallRollDialog from '../timetable/CallRollDialog'

export default {
  name: 'ClassTimeTable',
  props: {
    currentClass: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      checkStuVisible: false, // 点名
      currentCourseTime: null,
      moment,
      tableLoading: false,
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0
    }
  },
  components: {
    CallRollDialog
  },
  computed: {
    ...mapGetters(['organizationInfo', 'currentBranch'])
  },
  mounted() {
    this._getTableData()
  },
  methods: {
    _getTableData() {
      const params = {
        pageSize: this.pagination.pageSize,
        pageNum: this.pagination.pageNum,
        classId: this.currentClass.id
      }
      this.tableLoading = true
      this.$http
        .get(`/v1/CoursePlan/getCourseTime/${this.currentBranch.id}`, params)
        .then((res) => {
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    getTableData() {
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
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this._getTableData()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this._getTableData()
    },
    // 点名
    handleCheckStudent(row) {
      this.currentCourseTime = row
      this.checkStuVisible = true
    }
  }
}
</script>

<style lang="stylus" scoped>
.table-area
  .time-data-item
    span+span
      margin-left 10px
</style>

<template>
  <div>
    <div class="query-operation">
      <el-input v-model="queryForm.studentName" :maxlength="30" :placeholder="'请输入学生姓名'" @keyup.native.enter="handleQuery" style="width: 200px; margin-right: 30px">
        <el-button slot="append" icon="el-icon-search" @click="handleQuery" type="primary"></el-button>
      </el-input>
      <inline-select
        :options="gradeOptions"
        label="就读年级"
        v-model="queryForm.grade"
        clearable
        @change="handleQuery"
        :optionWidth="180"/>
      <el-checkbox v-model="queryForm.onlyOnline" style="margin-right: 12px" @change="handleQuery">只查在读</el-checkbox>
      <el-button :disabled="!tableLoading ? false : true" @click="handleReset" type="text" size="medium">重置</el-button>
      <el-button @click="handleStudentAllocation" style="float: right" type="primary">学员分班</el-button>
    </div>
    <el-table
      :data="tableData"
      stripe
      v-loading="tableLoading"
      height="50vh"
      empty-text="本班暂无学员，请分配学员">
      <el-table-column
        prop="studentName"
        label="姓名(昵称)"
        min-width="160">
        <p class="username" slot-scope="scope">
          <span>{{scope.row.studentName}}</span>
          <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
        </p>
      </el-table-column>
      <el-table-column
        prop="residueClassHour"
        align="center"
        label="剩余课时数"
        width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.residueClassHour" type="warning">{{scope.row.residueClassHour}}</el-tag>
          <el-tag v-else type="danger">0</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="primaryContactPhone"
        label="主要联系人(手机号)"
        align="center"
        min-width="160">
        <p class="username" slot-scope="scope">
          <span v-if="scope.row.primaryContactName">{{scope.row.primaryContactName}}</span>
          <span v-if="scope.row.primaryContactPhone">({{scope.row.primaryContactPhone}})</span>
          <span v-if="!scope.row.primaryContactName && !scope.row.primaryContactPhone">--</span>
        </p>
      </el-table-column>
      <el-table-column
        prop="sex"
        label="性别"
        width="100"
        align="center">
        <template slot-scope="scope">
          {{ (scope.row.sex === 1 && '男') || (scope.row.sex === 2 && '女') || '未知'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="grade"
        label="就读年级"
        width="140"
        align="center">
        <template slot-scope="scope">
          <span>{{scope.row.grade || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="age"
        label="年龄"
        width="100"
        align="center">
        <template slot-scope="scope">
          {{(scope.row.age || 0) + '岁'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="endStatus"
        label="就读状态"
        width="140"
        align="center">
        <el-tag slot-scope="scope" :type="(scope.row.endStatus || scope.row.stopCourse !== 0) ? 'info' : 'success'">{{scope.row.endStatus ? '已结课' : scope.row.stopCourse === 0 ? '在读' : '停课'}}</el-tag>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-size="pageSize"
      :current-page="pageNum"
      :page-sizes="[10, 20, 30]"
      layout="total, sizes, prev, pager, next"
      :total="total"
      style="margin-top: 10px;">
    </el-pagination>
  </div>
</template>

<script>
import InlineSelect from '@/components/InlineSelect'
import { mapGetters } from 'vuex'
import moment from 'moment'
const gradeList = ['托管', '小班', '中班', '大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三']

export default {
  name: 'ClassStudentTable',
  props: {
    /**
     * 弹窗标题
     */
    title: {
      type: String,
      default: '本班学生详情'
    },
    /**
     * 班级
     */
    currentClass: {
      type: Object,
      required: true
    }
  },
  components: {
    InlineSelect
  },
  data() {
    return {
      pageSize: 10,
      pageNum: 1,
      total: 0,
      tableData: [],
      tableLoading: false,
      gradeOptions: gradeList.map(item => { return { label: item, value: item } }),
      queryForm: {
        studentName: '',
        grade: '',
        onlyOnline: false
      }
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  watch: {
    currentClass() {
      this._getClassStudentList()
    },
    value(val) {
      this.visible = val
    }
  },
  created () {
    this._getClassStudentList()
  },
  methods: {
    _getClassStudentList() {
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        classId: this.currentClass.id,
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        grade: this.queryForm.grade,
        studentName: this.queryForm.studentName
      }
      if (this.queryForm.onlyOnline) {
        params.endStatus = 0
      }

      this.tableLoading = true
      this.$http.get('/v1/StudentClass/getStudentClassList', params)
        .then(res => {
          // 记录所有的该班的学生
          res.data.forEach(item => {
            if (item.birthday) {
              item.birthday = item.birthday.split(' ')[0]
              item['age'] = Math.abs(moment(item.birthday).diff(moment(), 'year'))
            }
          })
          // 给表格赋值
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this._getClassStudentList()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this._getClassStudentList()
    },
    handleQuery () {
      this.pageNum = 1
      this._getClassStudentList()
    },
    handleReset () {
      this.queryForm = {
        studentName: '',
        grade: '',
        onlyOnline: false
      }
      this._getClassStudentList()
    },
    handleStudentAllocation() {
      this.$emit('studentAllocate')
    }
  }
}
</script>

<style lang="stylus" scoped>
.query-operation
  margin 7px 0px
.bottom-btn
  text-align center
  .el-button
    padding 9px 30px
    margin-right 30px
  .el-button:last-child
    margin-right 0px
</style>

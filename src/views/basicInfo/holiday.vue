<template>
  <div class="holiday-wrapper">
    <div style="margin-bottom:16px">
      <el-button type="primary" @click="handleAdd">添加节假日</el-button>
      <el-button type="warning" :loading="refreshLoading" @click="handleRefresh">同步最新的节假日</el-button>
    </div>
    <el-table
      :data="holidayList"
      v-loading="loading">
      <el-table-column
        fixed
        prop="name"
        label="节假日"
        width="160">
      </el-table-column>
      <el-table-column
        prop="date"
        label="开始时间"
        width="160">
      </el-table-column>
      <el-table-column
        prop="endDate"
        label="结束时间"
        width="160">
      </el-table-column>
      <el-table-column
        prop="desc"
        label="说明">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="144">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="bottom-pagination">
      <el-pagination
        @current-change="_getHolidayList"
        @size-change="handleSizeChange"
        :page-size.sync="pageSize"
        :current-page.sync="pageNum"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="holidayForm.id ? '修改节假日' : '添加节假日'" :visible.sync="showForm" :close-on-click-modal="false" width="496px">
      <el-form ref="holidayForm" :model="holidayForm" :rules="rules" label-width="68px">
        <el-form-item label="节假日" prop="name">
          <el-input v-model="holidayForm.name" placeholder="请填写节假日名称" :maxlength="20" autocomplete="off" style="width: 350px;"></el-input>
        </el-form-item>

        <el-form-item label="日期" prop="dateRange">
          <el-date-picker
            v-model="holidayForm.dateRange"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-popover
            width="200"
            trigger="hover"
            content="节假日的设定将会影响排课的实际结果">
            <i slot="reference" class="el-icon-question color-warning" style="font-size: 18px; margin-left: 12px;"/>
          </el-popover>
        </el-form-item>

        <el-form-item label="说明" prop="desc">
          <el-input type="textarea" v-model="holidayForm.desc" :rows="4" maxlength="80" placeholder="节假日说明" show-word-limit></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      loading: false,
      showForm: false,
      submitLoading: false,
      refreshLoading: false,
      holidayList: [],
      holidayForm: {
        id: null,
        name: '',
        dateRange: [],
        desc: ''
      },
      rules: {
        name: [
          { required: true, message: '请填写节假日名称', trigger: 'blur' },
          { maxlen: 12, message: '最多12个字符', trigger: 'blur' }
        ],
        dateRange: [
          { type: 'array', required: true, message: '请选择日期', trigger: 'change' }
        ],
        desc: [
          { maxlen: 80, message: '最多80个字', trigger: 'blur' }
        ]
      },
      total: 0,
      pageNum: 1,
      pageSize: 10
    }
  },
  computed: {
    ...mapGetters([
      'currentBranch'
    ])
  },
  created() {
    this._getHolidayList()
  },
  methods: {
    _getHolidayList() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }
      this.loading = true
      this.$http.get('/v1/Vacation/getVacationList', {
        departmentId: this.currentBranch.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then((res) => {
        this.holidayList = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange() {
      this.pageNum = 1
      this._getHolidayList()
    },
    handleAdd() {
      this.$refs.holidayForm && this.$refs.holidayForm.resetFields()
      this.holidayForm.id = null
      this.showForm = true
    },
    handleEdit(row) {
      this.holidayForm = {
        id: row.id,
        name: row.name,
        dateRange: [row.date, row.endDate],
        desc: row.desc
      }
      this.showForm = true
    },
    handleDelete(row) {
      this.$confirm(`确定删除节假日【${row.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/Vacation/deleteById/' + row.id).then(res => {
          this.$message.success('删除节假日成功！')
          this._getHolidayList()
        })
      })
    },
    handleSubmit() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }

      if (!this.showForm || this.submitLoading) return

      this.$refs.holidayForm.validate((valid) => {
        if (valid) {
          const params = {
            departmentId: this.currentBranch.id,
            name: this.holidayForm.name,
            date: this.holidayForm.dateRange[0],
            endDate: this.holidayForm.dateRange[1],
            desc: this.holidayForm.desc
          }
          if (this.holidayForm.id) {
            // 修改
            params.id = this.holidayForm.id
            this.submitLoading = true
            this.$http.put('/v1/Vacation/updateVacation', params).then(res => {
              this.$message.success('修改节假日成功！')
              this._getHolidayList()
              this.showForm = false
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 新增
            this.submitLoading = true
            this.$http.post('/v1/Vacation/addVacation', params).then(res => {
              this.$message.success('新增节假日成功！')
              this._getHolidayList()
              this.showForm = false
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    handleRefresh() {
      this.refreshLoading = true
      this.$http.get('/v1/Vacation/syncCurrentYearVacation/' + this.currentBranch.id).then(() => {
        this.handleSizeChange()
      }).finally(() => {
        this.refreshLoading = false
      })
    }
  },
  watch: {
    currentBranch() {
      if (this.currentBranch) {
        this.pageNum = 1
        this._getHolidayList()
      }
    }
  }
}
</script>

<style lang='stylus' scoped>
.holiday-wrapper {
  background #fff
  padding 15px
}
</style>

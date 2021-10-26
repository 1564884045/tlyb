<!-- 学校信息 -->
<template>
  <div
    class="classroom-info"
    v-loading="tableLoading"
  >
    <div style="margin-bottom:16px">
      <el-button
        type="primary"
        @click="handleAddData"
      >添加教室</el-button>
    </div>
    <el-table
      :data="tableData"
      size="medium"
    >
      <el-table-column
        fixed
        prop="name"
        label="教室名称"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="volume"
        label="教室容量"
        min-width="120"
      >
      </el-table-column>
      <el-table-column
        prop="status"
        label="可用状态"
        min-width="120"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0">可用</el-tag>
          <el-tag
            type="info"
            v-if="scope.row.status === 1"
          >装修</el-tag>
          <el-tag
            type="danger"
            v-if="scope.row.status === 2"
          >废弃</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="useNum"
        label="已使用班级数"
        min-width="120"
      >
      </el-table-column> -->
      <el-table-column
        fixed="right"
        label="操作"
        width="120"
      >
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini"  @click="handleViewDetail(scope.row, scope.$index)">
            详情
          </el-button> -->
          <el-button type="text" size="mini" @click="handleTableEdit(scope.row, scope.$index)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="handleTableDelete(scope.row, scope.$index)">
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
      style="margin-top: 10px;"
    >
    </el-pagination>
    <classroom-edit-dialog v-model="showEditDialog" :data="formData" @success="handleSuccess"/>
  </div>
</template>

<script>
import ClassroomEditDialog from './ClassroomEditDialog'

export default {
  name: 'Classroom',
  components: {
    ClassroomEditDialog
  },
  data () {
    return {
      /* 表格相关属性 */
      tableLoading: false,
      showEditDialog: false,
      total: 0,
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      /* 表单相关属性 */
      formData: {},
      formInputWidth: '250px',
      submitLoading: false
    }
  },
  created () {
    this._getData()
  },
  computed: {
    departmentId () {
      return this.$store.getters.currentBranch && this.$store.getters.currentBranch.id
    },
    organizationId () {
      return this.$store.getters.organizationInfo && this.$store.getters.organizationInfo.id
    }
  },
  watch: {
    departmentId (val) {
      val && this._getData()
    }
  },
  methods: {
    /* 表格相关方法 */
    _getData() {
      this.tableLoading = true
      let params = Object.assign({}, this.pagination, { departmentId: this.departmentId })
      this.$http.get('/v1/Classroom/getClassroomList', params)
        .then(res => {
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleSuccess() {
      this._getData()
    },
    handleAddData() {
      this.showEditDialog = true
      this.formData = {}
    },
    handleTableEdit(row) {
      this.formData = row
      this.showEditDialog = true
    },
    // 每页条数变更事件
    handleSizeChange(value) {
      this.pagination.pageSize = value
      this._getData()
    },
    // 页码变更事件
    handleCurrentChange(value) {
      this.pagination.pageNum = value
      this._getData()
    },
    handleTableDelete(row, index) {
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/Classroom/deleteById/' + row.id)
          .then(() => {
            this.tableData.splice(index, 1)
            this.total--
            this.$message({
              type: 'success',
              message: '教室删除成功'
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    /** 表单相关方法 */
    handleFormBack () {
      this.showEditDialog = false
    },
    handleSubmitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.formData.id) {
            let params = Object.assign({}, this.formData, { departmentId: this.departmentId })
            this.$http.put('/v1/Classroom/updateClassroom', params)
              .then(res => {
                this.$message.success('教室修改成功')
                this._getData()
              })
              .finally(() => {
                this.showEditDialog = false
                this.submitLoading = false
              })
          } else {
            let params = Object.assign({}, this.formData, { departmentId: this.departmentId })
            this.$http.post('/v1/Classroom/addClassroom', params)
              .then(res => {
                this.$message.success('教室新增成功')
                this._getData()
              })
              .finally(() => {
                this.showEditDialog = false
                this.submitLoading = false
              })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang='stylus' scoped>
.classroom-info {
  background #fff
  padding 15px
}
</style>

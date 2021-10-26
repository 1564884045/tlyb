<!-- 学校信息 -->
<template>
  <div class="surround-info">
    <div style="margin-bottom:16px">
      <el-button
        type="primary"
        @click="handleTableAdd"
      >添加周边学校</el-button>
      <el-tooltip class="tip-info-area" content="新增周边学校的名称，便于登记学员信息时快速选择学员的就读学校" placement="right" effect="light">
        <i class="el-icon-question"/>
      </el-tooltip>
    </div>
    <el-table
      :data="tableData"
      v-loading="tableLoading">
      <el-table-column
        prop="name"
        label="名称"
        min-width="250">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="100">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleTableEdit(scope.row, scope.$index)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="handleTableDelete(scope.row, scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="formData.id ? '修改周边学校' : '新增周边学校'"
      :visible.sync="showEditDialog"
      width="400px"
      :close-on-click-modal="false">
      <el-form :model="formData" ref="formEdit" :rules="editFormRules" label-width="88px">
        <el-form-item label="学校名称" prop="name" >
          <el-input v-model="formData.name" :maxlength="16" autocomplete="off" style="width:200px" placeholder="请输入周边学校名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button @click="handleCancelForm">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSubmitForm('formEdit')" :loading="submitLoading">提&nbsp;交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const rules = {
  name: [
    { required: true, message: '请输入周边学校名称', trigger: 'blur' },
    { type: 'string', min: 2, max: 32, message: '长度在2至32位', trigger: 'blur' }
  ]
}

export default {
  name: 'SurroundSchool',
  data () {
    return {
      /** 表格的相关属性 */
      tableData: [],
      tableLoading: false,
      showEditDialog: false,

      /** 表单相关属性 */
      submitLoading: false,
      editFormRules: rules,
      formData: {
        id: null,
        name: ''
      }
    }
  },
  computed: {
    departmentId () {
      return this.$store.getters.currentBranch && this.$store.getters.currentBranch.id
    }
  },
  watch: {
    departmentId (val) {
      val && this._getTableData()
    }
  },
  created () {
    this._getTableData()
  },
  methods: {
    _getTableData() {
      this.tableLoading = true
      this.$http.get('/v1/SurroundSchool/getSurroundSchoolList', { departmentId: this.departmentId })
        .then(res => {
          this.tableData = res.data
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleSubmitForm (formName) {
      if (!this.showEditDialog || this.submitLoading) return
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.formData.id) {
            let params = Object.assign({}, this.formData, { departmentId: this.departmentId })
            this.$http.put('/v1/SurroundSchool/updateSurroundSchool', params)
              .then(res => {
                this.$message.success('周边学校修改成功')
                this._getTableData()
              })
              .finally(() => {
                this.showEditDialog = false
                this.submitLoading = false
              })
          } else {
            let params = Object.assign({}, this.formData, { departmentId: this.departmentId })
            this.$http.post('/v1/SurroundSchool/addSurroundSchool', params)
              .then(res => {
                this.$message.success('周边学校新增成功')
                this._getTableData()
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
    },
    handleCancelForm () {
      this.showEditDialog = false
    },
    handleTableAdd () {
      this.formData = {
        id: null,
        name: ''
      }
      this.$refs.formEdit && this.$refs.formEdit.clearValidate()
      this.showEditDialog = true
    },
    handleTableEdit (row, index) {
      this.formData = JSON.parse(JSON.stringify(row))
      this.$refs.formEdit && this.$refs.formEdit.clearValidate()
      this.showEditDialog = true
    },
    handleTableDelete (row, index) {
      this.$confirm(`此操作将删除【${row.name}】, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/SurroundSchool/deleteById/' + row.id)
          .then(() => {
            this.tableData.splice(index, 1)
            this.$message({
              type: 'success',
              message: `周边学校删除成功`
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang='stylus' scoped>
.surround-info
  background #fff
  padding 15px
  .tip-info-area
    margin-left 10px
    color $color-primary
</style>

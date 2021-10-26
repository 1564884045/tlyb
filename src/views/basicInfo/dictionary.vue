<!-- 来源渠道维护 -->
<template>
  <div class="container">
    <div class="queryForm">
      <!-- <el-input v-model="queryForm.name" maxlength="10" clearable placeholder="请输入名称" @keyup.native.enter="query" class="input-with-select" @clear="query()">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input> -->
      <div class="right-btns">
        <el-button type="primary" @click="dialogVisible = true">添加来源渠道</el-button>
      </div>
    </div>
    <el-table
      :data="tableDatas"
      v-loading="loading">
      <el-table-column
        prop="name"
        label="来源渠道名称"
        width="240"
        fixed="left">
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序权重"
        width="120"
        align="center">
      </el-table-column>
      <el-table-column
        prop="createAt"
        label="创建时间"
        align="center">
      </el-table-column>
      <el-table-column
        prop="updateAt"
        label="更新时间"
        align="center">
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="160">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="bottom-pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page.sync="queryForm.pageNum"
        :page-size.sync="queryForm.pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <!-- 表单区域 -->
    <el-dialog
      :title="dicForm.id ? '修改数据' : '新增数据'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleClose"
      width="520px">
      <el-form :model="dicForm" ref="dicForm" :rules="rules" label-width="80px" style="margin: 0 auto;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dicForm.name" autocomplete="off" maxlength="25" style="width:300px" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dicForm.sort" :min="0" :max="10000" ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSubmitForm" :loading="submitLoading">提&nbsp;交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dictionary',
  data() {
    return {
      loading: false,
      total: 0,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        name: null
      },
      tableDatas: [],
      submitLoading: false,
      dialogVisible: false,
      dicForm: {
        id: null,
        name: null,
        sort: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { type: 'string', max: 20, message: '长度不能超过20个字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  // 生命周期 - 创建完成
  created() {
    this._getDicList()
  },
  // 相关方法
  methods: {
    _getDicList() {
      this.loading = true
      const params = {
        pageNum: this.queryForm.pageNum,
        pageSize: this.queryForm.pageSize,
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      this.$http.get('/v1/dictionary/DicStudentSource/getDicStudentSourceList', params).then(res => {
        this.total = res.total
        if (res.data && res.data.length > 0) {
          this.tableDatas = res.data
        }
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.queryForm.pageNum = 1
      this._getDicList()
    },
    handleSizeChange(value) {
      this.queryForm.pageSize = value
      this._getDicList()
    },
    handlePageChange(value) {
      this.queryForm.pageNum = value
      this._getDicList()
    },
    // 编辑
    handleEdit(row) {
      this.dicForm = {
        id: row.id,
        name: row.name,
        sort: row.sort
      }
      this.dialogVisible = true
    },
    // 删除
    handleDelete(row) {
      this.$confirm(`此操作将删除【${row.name}】, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/dictionary/DicStudentSource/deleteById/${row.id}`).then(res => {
          this._getDicList()
        })
      })
    },
    // 提交数据
    handleSubmitForm() {
      this.$refs.dicForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.dicForm.id) { // 编辑
            this.$http.put('/v1/dictionary/DicStudentSource/update', this.dicForm).then(res => {
              this.dialogVisible = false
              this.resetForm()
              this._getDicList()
            }).finally(() => {
              this.submitLoading = false
            })
          } else { // 新增
            this.dicForm.organizationId = this.organizationInfo.id
            this.dicForm.departmentId = this.currentBranch.id
            this.$http.post('/v1/dictionary/DicStudentSource/add', this.dicForm).then(res => {
              this.dialogVisible = false
              this.resetForm()
              this.query()
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    // 关闭弹出框
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },
    // 重置表单
    resetForm() {
      this.dicForm = {
        id: null,
        name: null,
        sort: 0
      }
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {
  }
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  background #fff
  padding 15px
  .queryForm
    margin-bottom 10px
</style>

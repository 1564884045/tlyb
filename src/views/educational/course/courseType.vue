<!-- 课程类别 -->
<template>
  <div class="school-info">
    <!-- <search-bar></search-bar> -->

    <div class="semester-course-table">
      <el-button style="float: right" type="primary" class="semester-table-btn" icon="el-icon-plus" @click="addSchoolInfo">添加课程类别</el-button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

      <el-table
        :data="tableData"
        style="width: 100%">

        <el-table-column
          prop="name"
          label="课程类别名称">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="110"
          align="center">
          <template slot-scope="scope">
            <span type="primary" style="color: #ff6600; cursor: default; fontSize: 12px;" @click="schoolEdit(scope.row)">编辑</span> &nbsp;&nbsp;&nbsp;
            <span type="primary" style="color: #ff6600; cursor: default; fontSize: 12px;" @click="schoolDelect(scope.row)">删除</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="sizeChange"
          @current-change="_getDepartmentById"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCourseList">
        </el-pagination>
      </div>
    </div>

    <!-- 对话框 -->
    <el-dialog :title="addShow ? '新增课程类别' : '编辑课程类别'" custom-class="custom-dialog" :visible.sync="dialogFormVisible" :modal-append-to-body="false" width='400px'>
      <el-form :model="form" :rules="rules" ref="form" style="width: 370px">
        <el-form-item label="课程类别名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" :maxlength="30" autocomplete="off"></el-input>
        </el-form-item>
        <div style="textAlign: center; marginTop: 30px">
          <el-button v-if="addShow" :loading='loadingAdd' type="primary" @click="schoolEditSubmit('form')">确 定</el-button>
          <el-button v-if="!addShow" :loading='loadingEdit' type="primary" @click="schoolEditSubmit('form')">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CourseType',
  data () {
    return {
      tableData: [],
      dialogFormVisible: false, // 弹框控制
      formLabelWidth: '110px',
      form: {
        belongDepartment: '',
        name: ''
      },
      addShow: false, // 控制新增/编辑切换
      rules: {
        name: [
          { required: true, message: '请输入课程类别名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },
      loadingAdd: false, // 新增loading
      loadingEdit: false, // 编辑loading
      pageNum: 1,
      pageSize: 10,
      totalCourseList: null
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo', // 机构信息
      'currentBranch' // 当前切换学校
    ])
  },
  watch: {
    currentBranch() {
      this._getDepartmentById()
    }
  },
  created () {
    this._getDepartmentById()
  },
  mounted () {},
  methods: {
    // 编辑
    schoolEdit(row) {
      this.addShow = false
      this.dialogFormVisible = true
      this.form.id = row.id
      this.form.name = row.name
    },
    // 删除校区
    schoolDelect(row) {
      this.$confirm('删除 【' + row.name + '】课程，使用【' + row.name + '】课程的“课程管理”等板块都将受到影响，是否确定删除?', '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/CourseCategory/deleteByIds', {
          ids: row.id
        }).then(res => {
          this.$message.success('删除成功~')
          this._getDepartmentById()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 编辑/新增提交
    schoolEditSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 新增提交
          if (this.addShow) {
            this.loadingAdd = true
            let params = Object.assign({}, this.form)
            this.$http.post('/v1/CourseCategory/addCourseCategory', params)
              .then(res => {
                this.dialogFormVisible = false
                this._getDepartmentById()
                this.loadingAdd = false
              })
              .catch(() => {
                this.loadingAdd = false
              })
          } else {
            // 编辑提交
            this.loadingEdit = true
            let params = Object.assign({}, this.form)
            this.$http.put('/v1/CourseCategory/updateCourseCategory', params)
              .then(res => {
                this.dialogFormVisible = false
                this._getDepartmentById()
                this.loadingEdit = false
              })
              .catch(() => {
                this.loadingEdit = false
              })
          }
        } else {
          return false
        }
      })
    },
    // 获取校区信息
    _getDepartmentById() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }
      this.$http.get(`/v1/CourseCategory/getCourseCategoryList/${this.currentBranch.id}`, {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      })
        .then(res => {
          this.tableData = res.data
          this.totalCourseList = res.total
        })
    },
    // 分页
    sizeChange() {
      this.pageNum = 1
      this._getDepartmentById()
    },
    // 新增学校信息
    addSchoolInfo() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }
      this.form.name = ''
      this.form.belongDepartment = this.currentBranch.id
      this.dialogFormVisible = true
      this.addShow = true
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.semester-course-table {
  background #fff
  padding 15px
  .semester-table-btn {
    margin-bottom 10px
    // color #ff6600
    display inline-block
    // font-weight bold
    cursor default
  }
}
</style>

<style lang="stylus">

</style>

<!-- 学期管理 -->
<template>
  <div class="school-info">
    <div class="semester-course-table">
      <el-button style="float: right" type="primary" icon="el-icon-plus" class="semester-table-btn" @click="addSchoolInfo">添加学期管理</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="学期名称"></el-table-column>

        <el-table-column prop="startDate" label="开始时间" align="center">
            <div slot-scope="scope">{{scope.row.startDate ? (scope.row.startDate).slice(0, 10) : '-'}}</div>
        </el-table-column>

        <el-table-column prop="endDate" label="结束时间" align="center">
          <div slot-scope="scope">{{scope.row.endDate ? (scope.row.endDate).slice(0, 10) : '-'}}</div>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="110" align="center">
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
          :total="totalCourseList"
        ></el-pagination>
      </div>
    </div>

    <!-- 对话框 -->
    <el-dialog custom-class="custom-dialog" :title="addShow ? '学期新增' : '学期编辑'" :visible.sync="dialogFormVisible" width="540px" :before-close="handleDialogClose">
      <div style="display: flex">
        <el-form :model="form" :rules="rules" ref="form" style="width: 500px">
          <el-form-item label="学期名称" :label-width="formLabelWidth" prop="name">
            <el-input v-model="form.name" :maxlength="30" autocomplete="off" class="semester-name"></el-input>
          </el-form-item>

          <el-form-item label="有效时间" :label-width="formLabelWidth" prop="startTime">
             <el-date-picker v-model="form.startTime" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" :clearable="false" ></el-date-picker>
          </el-form-item>
           <ul class="upload-tip">
            <li class="color-warning" style="margin-top:20px;">有效时间说明：</li>
            <li>1. 开始时间为课程开始时间</li>
            <li>2. 结束时间为预计课程结束时间，会发送预警信息</li>
          </ul>
          <div style="textAlign: center;marginTop: 30px; width: 500px">
            <el-button v-if="addShow" :loading="loadingAdd" type="primary" @click="schoolEditSubmit('form')">确 定</el-button>
            <el-button v-if="!addShow" :loading="loadingEdit" type="primary" @click="schoolEditSubmit('form')">确 定</el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import moment from 'moment'

export default {
  name: 'Semester',
  data() {
    return {
      tableData: [],
      dialogFormVisible: false, // 弹框控制
      formLabelWidth: '90px',
      form: {
        belongDepartment: '',
        startTime: [],
        name: ''
      },
      addShow: false, // 控制新增/编辑切换
      rules: {
        name: [
          { required: true, message: '请输入学期管理名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择课程有效期', trigger: 'blur' }
        ]
      },
      loadingAdd: false, // 新增loading
      loadingEdit: false, // 编辑loading
      pageNum: 1,
      pageSize: 10,
      totalCourseList: null
    }
  },
  components: {
    // searchBar
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
  created() {
    this._getDepartmentById()
  },
  mounted() {},
  methods: {
    // 关闭窗口
    handleDialogClose() {
      this.dialogFormVisible = false
      this.form.startTime = []
      this.form.name = ''
    },
    // 编辑
    schoolEdit(row) {
      this.addShow = false
      this.dialogFormVisible = true
      this.form.id = row.id
      this.form.name = row.name
      this.form.belongDepartment = row.belongDepartment
      if (row.startDate) {
        this.form.startTime = [new Date(Date.parse(row.startDate.replace(/-/g, '/'))), new Date(Date.parse(row.endDate.replace(/-/g, '/')))]
      }
    },
    // 删除校区
    schoolDelect(row) {
      this.$confirm(
        '删除 【' +
          row.name +
          '】学期，使用【' +
          row.name +
          '】学期的“收费套餐”等板块都将受到影响，是否确定删除?',
        '删除',
        {
          confirmButtonText: '确定',
          type: 'warning'
        }
      )
        .then(() => {
          this.$http
            .delete('/v1/Period/deleteByIds', {
              ids: row.id
            })
            .then((res) => {
              this.$message.success('删除成功~')
              this._getDepartmentById()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 日期时间不满10时自动前面补0
    addZeroToDate(s) {
      return s < 10 ? '0' + s : s
    },
    convertDate(date) {
      const d = new Date(date)
      const resDate = d.getFullYear() + '-' + this.addZeroToDate((d.getMonth() + 1)) + '-' + this.addZeroToDate(d.getDate())
      return resDate
    },
    // 编辑/新增提交
    schoolEditSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 新增提交
          if (this.addShow) {
            this.loadingAdd = true
            let params = {
              belongDepartment: this.form.belongDepartment,
              name: this.form.name,
              startDate: this.form.startTime[0],
              endDate: this.form.startTime[1]
            }
            this.$http
              .post('/v1/Period/addPeriod', params)
              .then((res) => {
                this.dialogFormVisible = false
                this.form.startTime = []
                this.form.name = ''
                this._getDepartmentById()
                this.loadingAdd = false
              })
              .catch(() => {
                this.loadingAdd = false
              })
          } else {
            // 编辑提交
            this.loadingEdit = true
            let params = {
              id: this.form.id,
              belongDepartment: this.form.belongDepartment,
              name: this.form.name,
              startDate: this.convertDate(this.form.startTime[0]),
              endDate: this.convertDate(this.form.startTime[1])
            }
            this.$http
              .put('/v1/Period/updatePeriod', params)
              .then((res) => {
                this.dialogFormVisible = false
                this.form.startTime = []
                this.form.name = ''
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
      this.$http
        .get(`/v1/Period/getPeriodList/${this.currentBranch.id}`, {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        .then((res) => {
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
.semester-course-table
  background #fff
  padding 15px
  .semester-table-btn
    margin-bottom 10px
    // color #ff6600
    display inline-block
    // font-weight bold
    cursor default
.semester-name
  width 85%
</style>

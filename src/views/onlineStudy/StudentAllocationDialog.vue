<template>
  <el-dialog
    :title="title"
    :visible="value"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
    width="1170px"
    custom-class="student-allocation-dialog"
    top="6vh">
    <p slot="title" class="title">
      <span v-if="title" class="color-danger">{{title}}</span>学员分配
      <i class="close-btn el-icon-close" @click="$emit('toggle', false)"/>
    </p>
    <div class="transfer" v-loading="authLoading">
      <div class="transfer-right">
        <span class="transfer-header">未授权学员</span>
        <div class="query-operation">
          <el-input v-model="queryForm.name" :maxlength="30" :placeholder="'请输入学生姓名'" @keyup.native.enter="_getAllStudent" style="width: 200px; margin-right: 30px">
            <el-button slot="append" icon="el-icon-search" @click="_getAllStudent" type="primary"></el-button>
          </el-input>
          <inline-select
            label="报名课程"
            v-model="queryForm.courseId"
            @change="_getAllStudent"
            :optionWidth="180"
            valueAttr="id" labelAttr="name"
            :loading="courseLoading"
            :options="courseList"
            @show="_getCourseList()"
            filterable clearable/>
          <el-button @click="reset" type="text">重置</el-button>
        </div>
        <el-table
          :data="allStudent"
          stripe
          size="mini"
          v-loading="leftLoading"
          ref="rightTable"
          height="60vh"
          @selection-change="(val) => leftSection = val"
          style="border: 1px solid #e6e6e6">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名(昵称)"
            min-width="160">
            <p class="username" slot-scope="scope">
              <span>{{scope.row.name}}</span>
              <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
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
            prop="grade"
            label="就读年级"
            width="100">
          </el-table-column>
          <el-table-column
            prop="age"
            label="年龄"
            width="64">
            <template slot-scope="scope">
              {{(scope.row.age || 0) + '岁'}}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="transfer-center">
        <div class="trun-btn">
          <el-tooltip content="取消授权" placement="right" effect="light">
            <el-button circle @click="handleRemoveAuthStudent()" :type="rightSection.length > 0 ? 'success' : ''" icon="el-icon-arrow-left">
            </el-button>
          </el-tooltip>
          <el-tooltip content="学员授权" placement="left" effect="light">
            <el-button circle @click="handleAuthStudent()" :type="leftSection.length > 0 ? 'success' : ''" icon="el-icon-arrow-right">
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="transfer-left">
        <span class="transfer-header">已授权的学员</span>
        <el-table
          :data="selectedStudent"
          stripe
          v-loading="rightLoading"
          ref="leftTable"
          height="60vh"
          @selection-change="(val) => rightSection = val"
          style="border: 1px solid #e6e6e6;">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名(昵称)"
            min-width="160">
            <p class="username" slot-scope="scope">
              <span>{{scope.row. name}}</span>
              <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
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
            prop="grade"
            label="就读年级"
            width="100">
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
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

import InlineSelect from '../../components/InlineSelect'

export default {
  name: 'StudentAllocationDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    /**
     * 弹出层标题
     */
    title: {
      type: String,
      default: '学员分配'
    },
    /**
     * 视频系列
     */
    seriesId: {
      tpye: String,
      default: null
    }
  },
  data() {
    return {
      authLoading: false,
      leftLoading: false,
      rightLoading: false,
      courseLoading: false,
      courseList: [],
      allStudent: [],
      selectedStudent: [],
      queryForm: {
        name: '',
        courseId: ''
      },
      leftSection: [],
      rightSection: []
    }
  },
  components: {
    InlineSelect
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  methods: {
    _getAllStudent() {
      this.leftLoading = true
      this.$http.get('/v1/Student/getStudentInfoList', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        name: this.queryForm.name,
        courseId: this.queryForm.courseId
      }).then(res => {
        res.data.forEach(item => {
          item.age = Math.floor(moment().diff(moment(item.birthday), 'years', true))
        })
        // 过滤已选学员
        res.data = res.data.filter(item => {
          return this.selectedStudent.findIndex(o => o.id === item.id) === -1
        })
        this.allStudent = res.data
      }).finally(() => {
        this.leftLoading = false
      })
    },
    _getSelectedStudent() {
      this.rightLoading = true
      this.$http.get('/v1/StudentVideo/getStudentInfoByVideoCourseId', {
        videoCourseId: this.seriesId
      }).then(res => {
        this.selectedStudent = res.data.map(item => {
          return {
            id: item.studentId,
            name: item.studentName,
            grade: item.grade,
            sex: item.sex,
            nickName: item.nickName,
            age: Math.floor(moment().diff(moment(item.birthday), 'years', true))
          }
        })
        // 过滤已选学员
        this.allStudent = this.allStudent.filter(item => {
          return this.selectedStudent.findIndex(o => o.id === item.id) === -1
        })
      }).finally(() => {
        this.rightLoading = false
      })
    },
    _getCourseList() {
      if (this.courseList.length > 0) return

      this.courseLoading = true
      this.$http.get('/v1/Course/getCourseList/' + this.currentBranch.id).then(res => {
        this.courseList = res.data
      }).finally(() => {
        this.courseLoading = false
      })
    },
    async handleAuthStudent() {
      if (this.authLoading) return
      // 添加授权的人
      if (this.leftSection.length === 0) {
        this.$message.success('请选择需要授权的学员')
        return
      }
      // 合并
      let ids = this.selectedStudent.map(o => o.id)
      ids = ids.concat(this.leftSection.map(o => o.id))
      // 去重
      ids = ids.filter((a, b) => a !== b)

      this.authLoading = true
      try {
        await this.$http.post('/v1/StudentVideo/addStudentVedios', null, {
          params: {
            videoCourseId: this.seriesId,
            studentIds: ids.join(';')
          }
        })
        this.$message.success('学员授权成功！')
        // this._getAllStudent()
        // this._getSelectedStudent()
        this.leftSection.forEach(item => {
          // 移除左边的数据
          if (this.allStudent.findIndex(o => o.id === item.id) > -1) {
            this.allStudent.splice(this.allStudent.findIndex(o => o.id === item.id), 1)
          }
          // 添加到右边
          if (this.selectedStudent.findIndex(o => o.id === item.id) === -1) {
            this.selectedStudent.push(item)
          }
        })
      } catch (error) {
      }
      this.authLoading = false
    },
    async handleRemoveAuthStudent() {
      if (this.authLoading) return
      // 移除授权的人
      if (this.rightSection.length === 0) {
        this.$message.success('请选择需要取消授权的学员')
        return
      }
      let ids = this.rightSection.map(o => o.id)

      this.authLoading = true
      try {
        await this.$http.delete('/v1/StudentVideo/deleteBatch', null, {
          params: {
            videoCourseId: this.seriesId,
            studentIds: ids.join(';')
          }
        })
        this.$message.success('学员取消授权成功！')
        // this._getAllStudent()
        // this._getSelectedStudent()
        this.rightSection.forEach(item => {
          // 移除右边的数据
          if (this.selectedStudent.findIndex(o => o.id === item.id) > -1) {
            this.selectedStudent.splice(this.selectedStudent.findIndex(o => o.id === item.id), 1)
          }
          // 添加到左边
          if (this.allStudent.findIndex(o => o.id === item.id) === -1) {
            this.allStudent.push(item)
          }
        })
      } catch (error) {
      }
      this.authLoading = false
    },
    reset() {
      this.queryForm = {
        name: '',
        courseId: ''
      }
      this._getAllStudent()
    }
  },
  watch: {
    seriesId(val) {
      if (val) {
        this._getSelectedStudent()
      }
    },
    value(val) {
      if (val) {
        // 重置数据
        this.leftSection = []
        this.rightSection = []
        this.authLoading = false
        this._getAllStudent()
      } else {
        this.queryForm = {
          name: '',
          courseId: ''
        }
      }
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
    .transfer-header
      margin-bottom 69px
  .transfer-center
    display flex
    align-items center
    .trun-btn
      padding 0 30px
      .el-button
        margin-left 0px
        margin-bottom 20px
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

<style lang="stylus">
.student-allocation-dialog
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 16px
    background $color-background
    font-size 14px
    line-height 36px
    .title
      color $color-text-2
      span
        font-size 15px
        margin-right 6px
        font-weight bold
  .close-btn
    position absolute
    right 16px
    top 9px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .el-dialog__body
    padding 0
</style>
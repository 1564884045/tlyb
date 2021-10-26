<template>
  <el-dialog
    title="选择课程"
    :visible="value"
    :close-on-click-modal="false"
    @open="reset"
    @close="abolish()"
    top="8vh"
    append-to-body
    custom-class="select-course-dialog">
    <div class="query-form">
      <el-input v-model="queryForm.name" :maxlength="30" placeholder="请输入课程名称" @keyup.native.enter="query" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <inline-select v-model="queryForm.courseCategoryId" @change="query" @show="_getCategoryList" :loading="categoryLoading" :options="categoryList" label="课程类别" valueAttr="id" labelAttr="name" filterable clearable/>
      <inline-select v-model="queryForm.valuationType" :options="valuationTypeList" @change="query" label="收费模式" clearable/>
      <inline-select v-model="queryForm.type" :options="typeList" @change="query" label="类型" clearable/>
      <el-radio-group v-model="queryForm.giveLessonsWay" @change="query">
        <el-radio :label="0">一对一</el-radio>
        <el-radio :label="1">一对多</el-radio>
      </el-radio-group>
      <el-button type="text" @click="reset" size="medium" style="margin-left: 24px;">重&nbsp;置</el-button>
    </div>
    <el-table
      ref="table"
      :data="courseList"
      v-loading="loading"
      height="360px"
      border
      style="width: 100%"
      @select="handleSelect"
      @select-all="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="48"
        align="center">
      </el-table-column>
      <el-table-column
        prop="name"
        label="课程名称">
        <template slot-scope="scope">
          {{scope.row.name}}
          <el-tag v-if="scope.row.addCourseStatus" type="warning" style="margin-left: 6px;">续报</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="giveLessonsWayStr"
        label="上课方式"
        width="100px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="courseCategoryName"
        label="课程类型"
        width="120"
        align="center">
      </el-table-column>
      <el-table-column
        prop="valuationTypeStr"
        label="收费模式"
        width="120"
        align="center">
      </el-table-column>
      <el-table-column
        prop="typeStr"
        label="类型"
        width="100"
        align="center">
      </el-table-column>
      <p slot="empty">暂无数据，去<router-link class="link" to="/educational/course" style="margin-left: 6px;">添加课程</router-link></p>
    </el-table>
    <div class="bottom-pagination">
      <el-pagination
        @size-change="query"
        @current-change="_getCourseList"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <div class="footer-btns" slot="footer">
      <p>已选中 <span>{{selectedCourse.length}}</span> 个</p>
      <div>
        <el-button @click="abolish()">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import InlineSelect from '@/components/InlineSelect'

import { mapGetters } from 'vuex'

export default {
  name: 'SelectCourseDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    studentId: String,
    transferCourseList: { // 转课功能使用的属性
      type: Array,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      loading: false,
      categoryLoading: false,
      valuationTypeList: [
        { value: 0, label: '课时计费' },
        { value: 1, label: '按期计费' },
        { value: 2, label: '按时间计费' }
      ],
      typeList: [
        { value: 0, label: '标准课' },
        { value: 1, label: '体验课' },
        { value: 2, label: '优惠课' }
      ],
      categoryList: [],
      courseList: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      queryForm: {
        name: '',
        courseCategoryId: '',
        valuationType: '',
        type: '',
        giveLessonsWay: ''
      },
      selectedCourse: [],
      selectedCourseType: true
    }
  },
  components: {
    InlineSelect
  },
  computed: {
    ...mapGetters([
      'currentBranch'
    ])
  },
  methods: {
    abolish() {
      this.$emit('toggle', false)
      this.selectedCourse = []
      for (let i = 0; i < this.$parent.courses.length; i++) {
        this.selectedCourse.push(this.$parent.courses[i])
      }
    },
    _getCategoryList() {
      if (this.categoryList.length > 0) return
      this.categoryLoading = true
      this.$http.get('/v1/CourseCategory/getCourseCategoryList/' + this.currentBranch.id).then((res) => {
        this.categoryList = res.data
      }).finally(() => {
        this.categoryLoading = false
      })
    },
    _getCourseList() {
      this.loading = true
      const params = Object.assign({}, this.queryForm)
      params.status = 1
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      params.status = 1
      // 过滤为空字段
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === '') {
          delete params[key]
        }
      }
      let url = ''
      if (this.studentId) {
        url = '/v1/Course/getCourseList/' + this.currentBranch.id + '/' + this.studentId
      } else {
        url = '/v1/Course/getCourseList/' + this.currentBranch.id
      }
      this.$http.get(url, params).then(res => {
        res.data.forEach(item => {
          const typeObj = this.typeList.find(o => o.value === item.type)
          if (typeObj) {
            item.typeStr = typeObj.label
          }
          item.valuationTypeStr = ''
          const valuationTypeObj = this.valuationTypeList.find(n => n.value === item.valuationType)
          if (valuationTypeObj) {
            item.valuationTypeStr = valuationTypeObj.label
          }
          item.giveLessonsWayStr = item.giveLessonsWay === 1 ? '一对多' : '一对一'
          if (item.addCourseStatus == null) {
            item.addCourseStatus = 0
          }
        })
        if (this.transferCourseList.length > 0) {
          for (let i = 0; i < this.transferCourseList.length; i++) {
            for (let j = 0; j < res.data.length; j++) {
              if (this.transferCourseList[i].courseId === res.data[j].id) {
                res.data.splice(j, 1)
              }
            }
          }
        }
        this.courseList = res.data
        if (this.transferCourseList.length > 0) {
          this.total = res.data.length
        } else {
          this.total = res.total
        }
        // 回显已勾选的行
        this.$nextTick(function () {
          if (this.selectedCourseType) this.selectedCourse = this.$parent.courses
          this.selectedCourse.forEach(s => {
            this.courseList.forEach(c => {
              if (s.id === c.id) {
                this.$refs.table.toggleRowSelection(c, true)
              }
            })
            this.selectedCourseType = false
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getCourseList()
    },
    reset() {
      this.queryForm = {
        name: '',
        courseCategoryId: '',
        valuationType: '',
        type: '',
        giveLessonsWay: ''
      }
      this.$refs.table && this.$refs.table.clearSelection()
      this.query()
    },
    handleSelect(selection, row) {
      let isHaveItem = this.selectedCourse.find(item => item.id === row.id)
      if (isHaveItem) {
        // 已有,则移除
        this.selectedCourse = this.selectedCourse.filter(item => item.id !== isHaveItem.id)
      } else {
        // 还没有,则添加
        this.selectedCourse.push(row)
      }
    },
    handleSelectionChange(val) {
      // 全选
      if (val.length !== 0) {
        for (let i = 0; i < val.length; i++) {
          // let isHaveItem = this.selectedCourse.find(item => item.id === val[i].id)
          if (!this.selectedCourse.find(item => item.id === val[i].id)) {
            this.selectedCourse.push(val[i])
          }
        }
      } else {
        // 全取消
        this.selectedCourse = []
      }
    },
    submit() {
      if (this.selectedCourse.length === 0) {
        this.$message.warning('请选择课程！')
        return
      }
      this.$emit('submit', this.selectedCourse.concat([]))
      this.$emit('toggle', false)
    }
  }
}
</script>

<style lang='stylus'>
.select-course-dialog
  .el-dialog__body, .el-dialog__footer
    padding 0 20px
  .query-form
    padding 0
    .input-with-select
      width 180px
      margin-right 16px
    .inline-select
      margin-right 16px
    .el-radio-group
      margin 0
  .footer-btns
    display flex
    justify-content space-between
    border-top 1px solid $color-border-1
    padding 12px 0
    margin-top 16px
    align-items center
    p span
      color $color-primary
</style>

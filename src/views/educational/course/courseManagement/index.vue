<template>
  <div>
    <div class="query-form">
      <el-input v-model="queryForm.name" :maxlength="30" placeholder="请输入课程名称搜索" @keyup.native.enter="query" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>

      <div class="right-btns">
        <el-button type="primary" @click="handleOpenCourseForm(null)" icon="el-icon-plus">添加课程</el-button>
      </div>

      <el-radio-group v-model="queryForm.status" @change="query">
        <el-radio :label="1">已上架</el-radio>
        <el-radio :label="0">已下架</el-radio>
      </el-radio-group>

      <el-button :disabled="!queryLoading ? false : true" type="text" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
      <el-button :disabled="!queryLoading ? false : true" type="text" @click="query" size="medium" style="margin-left: 12px;">刷&nbsp;新</el-button>

      <div class="query-select-list">
        <inline-select v-model="queryForm.giveLessonsWay" @change="query" label="授课方式" valueAttr="id" labelAttr="name" :options="giveLessonsWayList" clearable />
        <inline-select v-model="queryForm.type" @change="query" label="类型" valueAttr="id" labelAttr="name" :options="typeList" clearable />
      </div>
    </div>

    <div class="educational-course-table">
      <el-table
        :data="courseList"
        v-loading="queryLoading"
        style="width: 100%">

        <el-table-column
          prop="name"
          label="课程名称"
          width="180">
        </el-table-column>

        <el-table-column
          prop="applyAge"
          label="适龄"
          width='108'
          align="center">
        </el-table-column>

        <el-table-column
          prop="type"
          label="类型"
          width='100'
          align="center">
        </el-table-column>

        <el-table-column
          prop="giveLessonsWay"
          label="授课方式"
          width='88'
          align="center">
        </el-table-column>

        <el-table-column
          prop="courseCategoryName"
          label="课程类别"
          width='120'
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.courseCategoryName || '-'}}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="description"
          :show-overflow-tooltip="true"
          label="课程描述">
          <template slot-scope="scope">
            <span>{{scope.row.description || '-'}}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="valuationType"
          width='120'
          align="center"
          label="收费类型">
          <template slot-scope="scope">
            <span v-if="scope.row.valuationType === 0">课时计费</span>
            <span v-if="scope.row.valuationType === 1">按期计费</span>
            <span v-if="scope.row.valuationType === 2">按时间计费</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="tuitionStr"
          label="包含学杂"
          width="108"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.tuitionClass">{{scope.row.tuitionStr}}</el-tag>
        </el-table-column>

        <el-table-column
          prop="status"
          label="状态"
          width="88"
          align="center">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenCourseForm(scope.row.id)">编辑</el-button>
            <el-button type="text" @click="toggleStatus(scope.row)" >{{scope.row.statusBtn}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getCourseList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <course-dialog v-model="showCourseForm" :courseId="selectedCourseId" @success="handleCourseSuccess"></course-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import InlineSelect from '_c/InlineSelect'
import CourseDialog from './CourseDialog'

export default {
  name: 'CourseManagement',
  data() {
    return {
      queryLoading: false,
      showCourseForm: false,
      queryForm: {
        name: '',
        status: 1, // 1-上架   0-下架
        type: '', // 类型 0标准课 1体验课 2优惠
        giveLessonsWay: '' // 授课方式 0一对一 1一对多
      },
      courseList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      typeList: [
        {
          id: '0',
          name: '标准课'
        },
        {
          id: '1',
          name: '体验课'
        },
        {
          id: '2',
          name: '优惠课'
        }
      ],
      giveLessonsWayList: [
        {
          id: '0',
          name: '一对一'
        },
        {
          id: '1',
          name: '一对多'
        }
      ],
      selectedCourseId: null
    }
  },
  components: {
    InlineSelect,
    CourseDialog
  },
  computed: {
    ...mapGetters([
      'currentBranch'
    ])
  },
  created() {
    this._getCourseList()
  },
  methods: {
    _getCourseList() {
      this.queryLoading = true
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        status: this.queryForm.status,
        giveLessonsWay: this.queryForm.giveLessonsWay,
        type: this.queryForm.type,
        name: this.queryForm.name
      }).then(res => {
        res.data.forEach(item => {
          if (item.province) {
            item.province = item.province.split(';')
          }
          switch (item.status) {
            case 0:
              item.status = '已下架'
              item.statusBtn = '上架'
              break
            case 1:
              item.status = '已上架'
              item.statusBtn = '下架'
              break
          }
          switch (item.type) {
            case 0:
              item.type = '标准课'
              break
            case 1:
              item.type = '体验课'
              break
            case 2:
              item.type = '优惠课'
              break
          }
          switch (item.giveLessonsWay) {
            case 0:
              item.giveLessonsWay = '一对一'
              break
            case 1:
              item.giveLessonsWay = '一对多'
              break
          }
          item.tuitionClass = 'info'
          item.tuitionStr = '不包含'
          if (item.containTuition) {
            item.tuitionClass = 'warning'
            item.tuitionStr = '可选购买'
            if (item.mustTuition) {
              item.tuitionClass = 'success'
              item.tuitionStr = '必需购买'
            }
          }
        })
        this.courseList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getCourseList()
    },
    reset() {
      this.queryForm = {
        name: '',
        status: 1, // 1-在职   0-离职
        type: '', // 类型 0标准课 1体验课 2优惠
        giveLessonsWay: '' // 授课方式 0一对一 1一对多
      }
      this.query()
    },
    // 上下架
    toggleStatus(e) {
      let statusNum = null
      switch (e.statusBtn) {
        case '下架':
          statusNum = 0
          break
        case '上架':
          statusNum = 1
          break
      }

      this.$confirm(`是否${e.statusBtn}【${e.name}】？`, '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.put(`/v1/Course/modifyCourseStatus/${e.id}?status=` + statusNum)
          .then(res => {
            this._getCourseList()
            this.$message.success(`${e.statusBtn}成功`)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleOpenCourseForm(courseId) {
      this.selectedCourseId = courseId
      this.showCourseForm = true
    },
    handleCourseSuccess() {
      if (this.selectedCourseId) {
        // 修改
        this._getCourseList()
      } else {
        // 新增
        this.query()
      }
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.cropper-img
  padding 0 0 10px
  .cropper-img-con
    margin 0 10px 10px
    width 160px
    height 80px
  .cropper-btn
    margin 0 10px 10px

.educational-course-table
  background #fff
  margin-top 10px
  padding 15px
</style>

<!-- 收费套餐 -->
<template>
  <div class="school-info">

    <div class="semester-course-table">
      <el-checkbox v-model="onlyValid" @change="query">只查有效</el-checkbox>
      <el-button type="primary" class="semester-table-btn" @click="feeStandardDialogEdit()" style="float: right;" icon="el-icon-plus">  添加收费套餐</el-button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <el-table
        :data="tableData"
        v-loading="queryLoading"
        style="width: 100%">

        <el-table-column
          label="收费套餐名称">
          <template slot-scope="scope">
            <span @click="tuitionFeeDiog(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="valuationTypeStr"
          label="收费方式">
        </el-table-column>
        <el-table-column
          width="144"
          label="状态"
          align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.cancel === 1 ? 'info' : 'success'">{{ scope.row.cancel === 1 ? '已作废' : '使用中' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="110"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="feeStandardDialogEdit(scope.row)">编辑</el-button>
            <el-button type="text"  @click="toggleFeeStatus(scope.row)">{{scope.row.cancel === 0 ? '作废': '恢复'}}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getFeeTemplateList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCourseList">
        </el-pagination>
      </div>
    </div>

    <!-- 对话框-->
    <fee-standard-dialog v-model="showDialog" :feeId="currentRowId" @success="query"></fee-standard-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FeeStandardDialog from './FeeStandardDialog'

export default {
  name: 'FeeStandard',
  data () {
    return {
      queryLoading: false,
      tableData: [],
      showDialog: false, // 新增弹框
      // form: {
      // belongDepartment: '',
      // name: ''
      // },
      onlyValid: true, // 只查有效
      currentRowId: '', // 编辑时当前行ID
      pageNum: 1,
      pageSize: 10,
      totalCourseList: null // table中总数据
    }
  },
  components: {
    FeeStandardDialog
  },
  computed: {
    ...mapGetters([
      'organizationInfo', // 机构信息
      'currentBranch' // 当前切换学校
    ])
  },
  created () {
    this._getFeeTemplateList()
  },
  mounted () {},
  methods: {
    // 编辑
    feeStandardDialogEdit(row) {
      this.currentRowId = row && row.id
      this.showDialog = true
    },
    // 禁用启用收费套餐
    toggleFeeStatus(row) {
      let tip = '删除 【' + row.name + '】收费套餐，使用【' + row.name + '】收费套餐的“课程管理”等板块都将受到影响，是否确定作废?'
      // let tip = '作废收费套餐，可能会影响到之前的课程价格数据，以及动态课消的计算规则。确认作废？'
      if (row.cancel === 1) {
        tip = '确认恢复该收费套餐的使用？'
      }
      this.$confirm(tip, '作废/恢复', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.put('/v1/FeeTemplate/updateSimpleFeeTemplate', {
          id: row.id,
          cancel: row.cancel === 0 ? 1 : 0
        }).then(res => {
          this.$message.success('操作成功~')
          this._getFeeTemplateList()
        })
      })
    },
    // 获取列表数据------------------------------------
    _getFeeTemplateList() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }
      this.queryLoading = true
      const params = {
        belongDepartment: this.currentBranch.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        cancel: this.cancel
      }
      if (this.onlyValid) {
        params.cancel = 0
      }
      this.$http.get('/v1/FeeTemplate/getFeeTemplateList', params).then(res => {
        res.data.forEach(item => {
          switch (item.valuationType) {
            case '0':
              item.valuationTypeStr = '课时计费'
              break
            case '1':
              item.valuationTypeStr = '按期计费'
              break
            case '2':
              item.valuationTypeStr = '按时间计费'
              break
          }
        })
        this.tableData = res.data
        this.totalCourseList = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    // 分页
    query() {
      this.pageNum = 1
      this._getFeeTemplateList()
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

.semester-name {
  color $color-primary
  text-decoration underline
  cursor default
}
</style>

<style lang="stylus">

</style>

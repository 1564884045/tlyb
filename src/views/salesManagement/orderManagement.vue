<template>
  <div class="order-wrapper">
    <div class="query-form">
      <div style="margin-bottom:10px;">
        <el-alert
          title="使用提示"
          type="warning">
          <template>
            <ul>
              <li>1. 默认查询为当前登录用户的订单，切换经办人即可查看其它人的订单记录，也可以【重置】查询条件即可查看全部订单数据；</li>
              <li>2. 批量作废订单需在列表中选择需要作废的订单，【批量作废订单】按钮才会生效;</li>
              <li>3. 导出订单的数据为下面的检索条件的订单数据，并非全部订单数据;</li>
            </ul>
          </template>
        </el-alert>
      </div>
      <el-input v-model.trim="queryForm.searchInput" :maxlength="36" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select" style="width: 320px;">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始支付时间"
        end-placeholder="结束支付时间"
        :picker-options="dateOptions"
        @change="query"
        style="margin-left: 16px;">
      </el-date-picker>
      <div class="query-select-list">
        <inline-select v-model="queryForm.orderType" label="订单类型" @change="query" :options="orderTypeList" clearable/>
        <inline-select v-model="queryForm.payType" label="支付方式" @change="query" :options="payTypeList" clearable/>
        <inline-select v-model="queryForm.recommendUserId" label="经办人" @change="query" valueAttr="id" labelAttr="username" :loading="teacherLoading" :options="teacherList" @show="_getTeacherList" filterable clearable/>
        <el-checkbox v-model="queryForm.onlyArrears" size="small" @change="query">
          欠费订单
          <el-popover
            placement="right"
            width="200"
            trigger="hover"
            content="什么是欠费订单？欠费订单为实付金额小于应付金额。">
            <i class="el-icon-question" style="font-size:18px;color:#ff6600;" slot="reference"></i>
          </el-popover>
        </el-checkbox>
        <el-checkbox v-model="queryForm.onlyValid" size="small" @change="query">
          已作废
          <el-popover
            placement="right"
            width="200"
            trigger="hover"
            content="为什么不能删除订单数据？为了避免用户失误导致订单数据丢失不可逆转问题，目前仅支持作废！">
            <i class="el-icon-question" style="font-size:18px;color:#ff6600;" slot="reference"></i>
          </el-popover>
        </el-checkbox>
        <el-button type="text" :disabled="!queryLoading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
        <el-button type="primary" :disabled="invalidOrderBtnDisable" size="small" icon="el-icon-delete-solid" @click="handleInvalidOrderBatch" style="float:right;">批量作废订单</el-button>
        <el-button type="primary" size="small" @click="handleExportOrderInfo" icon="icon iconfont icon-import" :loading="exportLoading" style="float:right;">导出订单</el-button>
      </div>
    </div>
    <div class="order-container">
      <p class="total-info">
        <label>应收总金额：</label><span>{{totalInfo.shouldTotalFee | formatNumber}}元</span>
        <label>实收总金额：</label><span>{{totalInfo.totalFee | formatNumber}}元</span>
      </p>
      <el-table
        :data="orderList"
        stripe
        ref="table"
        @selection-change="handleSelectionChange"
        v-loading="queryLoading">
        <el-table-column
          type="selection"
          :selectable="handleEnableClear"
          width="55">
        </el-table-column>
        <el-table-column
          prop="outTradeNo"
          label="订单编号"
          width="194"
          fixed="left">
          <span slot-scope="scope" class="link" @click="handleOpenDetail(scope.row.id)">
            {{scope.row.outTradeNo}}
            <el-tag v-if="scope.row.valid === 0" type="danger" size="small">已作废</el-tag>
          </span>
        </el-table-column>
        <el-table-column
          prop="studentName"
          label="学员姓名"
          width="120">
        </el-table-column>
        <el-table-column
          prop="orderTypeStr"
          label="订单类型"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="payTypeStr"
          label="支付方式"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="shouldTotalFee"
          label="应收金额"
          width="120"
          align="center">
          <span slot-scope="scope">￥{{scope.row.shouldTotalFee}}</span>
        </el-table-column>
        <el-table-column
          prop="totalFee"
          label="实收金额"
          width="120"
          align="center">
          <span :class="scope.row.totalFee < scope.row.shouldTotalFee ? 'color-danger' : ''" slot-scope="scope">￥{{scope.row.totalFee}}</span>
        </el-table-column>
        <el-table-column
          prop="goodsName"
          label="订单信息"
          min-width="210">
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="210">
          <div class="remark-wrapper" slot-scope="scope" v-if="scope.row.remark" :ref="'remarkHack' + scope.$index" :title="scope.row.remark">
            <span>{{scope.row.remark}}</span>
            <el-popover
              width="240"
              trigger="click"
              popper-class="remark-edit-popver">
              <div class="remark-edit-form">
                <label>备注：</label>
                <el-input type="textarea" v-model="scope.row.remarkCopy" :maxlength="120" show-word-limit placeholder="订单备注(最多120个字)"/>
              </div>
              <div class="remark-edit-btns">
                <el-button size="mini" @click="$refs['remarkHack' + scope.$index].click()">取消</el-button>
                <el-button size="mini" type="primary" @click="editRemark(scope.row, scope.$index)">确认</el-button>
              </div>
              <i slot="reference" class="el-icon-edit-outline"/>
            </el-popover>
          </div>
          <span v-else>-</span>
        </el-table-column>
        <el-table-column
          prop="recommendUsername"
          label="经办人"
          width="120">
        </el-table-column>
        <el-table-column
          prop="payTime"
          label="支付时间"
          width="144"
          align="center"
          fixed="right">
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getOrderList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>

    <order-detail-dialog ref="orderDetailDialog" @cancelSuccess="query"></order-detail-dialog>

    <!-- 导出学员弹框 -->
    <el-dialog title="正在导出中" :visible.sync="exportStudentsDialog" custom-class="custom-dialog" width="300px" :show-close="false" :center="true" :close-on-press-escape="false" :close-on-click-modal="false">
      <div class="progress">
        <el-progress v-if="processStatus === 0" type="circle" :percentage="percentage" :color="percentageColor"></el-progress>
        <el-progress v-else type="circle" :percentage="percentage" status="exception"></el-progress>
      </div>
      <div slot="footer" class="dialog-footer cancelExprot">
        <el-button @click="cancelExportStudent">取消导出</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import OrderDetailDialog from './OrderDetailDialog'
import { mapGetters } from 'vuex'
import store from '../../store'
// import { saveAs } from 'file-saver'

import moment from 'moment'

export default {
  data() {
    return {
      queryLoading: false,
      teacherLoading: false,
      searchTypeList: [
        {
          value: 'studentName',
          label: '学员姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'outTradeNo',
          label: '订单编号',
          placeholder: '请输入订单编号'
        }
      ],
      exportStudentsDialog: false, // 导出学员信息弹框
      exportLoading: false,
      percentage: 0, // 导出学员进度
      percentageColor: '#67c23a', // 进度条颜色
      processStatus: 0, // 进度条状态
      queryForm: {
        searchType: 'studentName',
        searchInput: '',
        orderType: '',
        payType: '',
        recommendUserId: null,
        dateRange: [],
        onlyValid: false,
        onlyArrears: false
      },
      studentId: null, // 用于接收从学员中心跳转过来的学员ID
      searchCount: 0, // 用于记录检索次数用以及校验是否是从【学员中心】导航过来的，避免从【学员中心】导航到此页面时，导出数据与列表数据不一致问题
      orderList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      teacherList: [],
      payTypeList: [
        { value: 0, label: '微信' },
        { value: 1, label: '支付宝' },
        { value: 2, label: '现金' },
        { value: 3, label: '刷卡' }
      ],
      orderTypeList: [
        { value: 0, label: '报名' },
        { value: 1, label: '退课' },
        { value: 2, label: '转课' }
      ],
      invalidOrderBtnDisable: true, // 批量作废订单按钮是否可用
      selectedTableRows: [], // 已选中的表格的行数据
      dateOptions: {
        shortcuts: [
          {
            text: '最近一个月',
            onClick(picker) {
              picker.$emit('pick', [moment().subtract(1, 'months').toDate(), new Date()])
            }
          },
          {
            text: '本月',
            onClick(picker) {
              picker.$emit('pick', [moment().startOf('month').toDate(), moment().endOf('month').toDate()])
            }
          },
          {
            text: '今年',
            onClick(picker) {
              picker.$emit('pick', [moment().startOf('year').toDate(), moment().endOf('year').toDate()])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      totalInfo: {
        shouldTotalFee: 0,
        totalFee: 0
      },
      orderDetail: null
    }
  },
  components: {
    OrderDetailDialog, InlineSelect
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    ...mapGetters([
      'currentBranch',
      'userInfo'
    ])
  },
  created() {
    this.studentId = this.$route.query.studentId
    // 获取当前用户的订单记录
    this._getTeacherList()
    this.queryForm.recommendUserId = this.userInfo.id
    // 获取订单统计数据及订单列表数据
    this._getOrderTotalInfo()
    this._getOrderList()
  },
  methods: {
    // 获取订单列表信息
    _getOrderList() {
      this.queryLoading = true
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        departmentId: this.currentBranch.id,
        orderType: this.queryForm.orderType,
        payType: this.queryForm.payType,
        recommendUserId: this.queryForm.recommendUserId
      }

      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.onlyValid) {
        params.valid = 0
      } else {
        params.valid = 1
      }
      if (this.queryForm.onlyArrears) {
        params.isArrears = 1
      }
      // 如果是学员中心发导航过来的，那么清空其他全部条件
      if (this.searchCount === 0 && this.studentId) {
        params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          departmentId: this.currentBranch.id,
          studentId: this.studentId
        }
      } else {
        this.searchCount += 1
      }
      // 校验是否为超级管理员
      // const flag = this.validUserIsAdmin()
      // if (!flag) {
      //   params.createBy = this.userInfo.id
      // }
      this.$http.get('/v1/order/getOrderList', params).then(res => {
        res.data.forEach(item => {
          const payTypeObj = this.payTypeList.find(o => o.value === item.payType)
          if (payTypeObj) item.payTypeStr = payTypeObj.label

          const orderTypeObj = this.orderTypeList.find(o => o.value === item.orderType)
          if (orderTypeObj) item.orderTypeStr = orderTypeObj.label

          if (item.remark == null) item.remark = ''
          item.remarkCopy = item.remark
        })
        this.orderList = res.data
        this.total = res.total || 0
      }).finally(() => {
        this.queryLoading = false
        this.studentId = null
      })
    },
    // 订单总信息
    _getOrderTotalInfo() {
      const params = {
        departmentId: this.currentBranch.id,
        orderType: this.queryForm.orderType,
        payType: this.queryForm.payType,
        recommendUserId: this.queryForm.recommendUserId,
        valid: 1
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      if (this.queryForm.onlyArrears) {
        params.isArrears = 1
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      this.$http.get('/v1/order/getOrderStatistics', params).then(res => {
        if (res.data) {
          this.totalInfo = res.data
        }
      })
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.teacherLoading = true
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.teacherLoading = false
      })
    },
    // 是否可以选中行方法
    handleEnableClear(row) {
      if (row.valid === 1) {
        return true
      } else {
        return false
      }
    },
    // 表格行选中变化事件
    handleSelectionChange(rows) {
      if (rows && rows.length > 0) {
        this.selectedTableRows = rows
        this.invalidOrderBtnDisable = false
      } else {
        this.selectedTableRows = []
        this.invalidOrderBtnDisable = true
      }
    },
    // 提交批量作废订单
    handleInvalidOrderBatch() {
      if (this.selectedTableRows.length === 0) {
        this.$message.error('您尚未选择任何需要作废的订单')
        return
      }
      this.$confirm(`此操作将批量作废您已选中的订单, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectedTableRows.forEach(item => {
          ids.push(item.id)
        })
        this.$http.put('/v1/order/cancelOrderBatch', ids).then(res => {
          this.$refs.table.clearSelection()
          this.pageNum = 1
          this.pageSize = 10
          this.total = 0
          this._getOrderList()
        })
      }).catch(() => {
        this.$refs.table.clearSelection()
        this.invalidOrderBtnDisable = true
        this.selectedTableRows = []
      })
    },
    async handleExportOrderInfo() {
      if (!this.orderList || this.orderList.length === 0) {
        this.$message.error('当前查询条件暂无任何数据，无法导出订单数据！')
        return
      }
      this.exportStudentsDialog = true
      this.processStatus = 0
      this.percentageColor = '#67c23a'
      let setInt = setInterval(() => {
        this.percentage += Math.ceil(Math.random() * 3)
      }, 1000)
      let params = {
        departmentId: this.currentBranch.id,
        orderType: this.queryForm.orderType,
        payType: this.queryForm.payType,
        recommendUserId: this.queryForm.recommendUserId
      }

      // 校验是否是超级管理员
      // const flag = this.validUserIsAdmin()
      // if (!flag) {
      //   params.createBy = this.userInfo.id
      // }

      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.onlyValid) {
        params.valid = 0
      } else {
        params.valid = 1
      }
      if (this.queryForm.onlyArrears) {
        params.isArrears = 1
      }
      // 特殊处理从【学员中心】导航过来的数据导出
      if (this.searchCount === 0) {
        params = {
          departmentId: this.currentBranch.id,
          studentId: this.$route.query.studentId
        }
      }
      // 处理下载链接
      let dowloadInfoUrl = window.location.origin + process.env.VUE_APP_BASE_API + '/api/ExportOrImport/downloadOrderInfoFile?'
      for (let i = 0; i < Object.keys(params).length; i++) {
        const key = Object.keys(params)[i]
        if (i === 0) {
          dowloadInfoUrl += key + '=' + params[key]
        } else {
          if (params[key]) {
            dowloadInfoUrl += '&' + key + '=' + params[key]
          }
        }
      }
      this.$http.getDownload(dowloadInfoUrl, '订单导出.xls').then(res => {
        this.percentage = 100
        setTimeout(() => {
          this.$message.success(res)
        }, 500)
      }).catch(err => {
        if (err.code === '-100000') {
          this.percentage = 100
          this.processStatus = 1
          this.$message.warning(err.message)
        } else {
          this.percentageColor = '#f56c6c'
          setTimeout(() => {
            this.$message.error('导出订单失败')
          }, 1000)
        }
      }).finally(() => {
        clearInterval(setInt) // 清除定时器
        setTimeout(() => {
          this.percentage = 0
          this.exportStudentsDialog = false
        }, 1000)
      })
    },
    // 取消导出学员信息
    cancelExportStudent () {
      store.dispatch('handleRequestCancelToken', true)
    },
    /**
     * 校验用户是否是超级管理员
     * 校验是否是超级管理员，如果不是，则只能获取和管理自己的订单，否则可以查看全部的订单
     */
    validUserIsAdmin() {
      let flag = false // 默认不是超管
      if (this.userInfo.roles && this.userInfo.roles.length > 0) {
        for (let i = 0; i < this.userInfo.roles.length; i++) {
          if (this.userInfo.roles[i].name === 'admin') {
            flag = true
            break
          }
        }
      }

      return flag
    },
    query() {
      this.pageNum = 1
      this._getOrderList()
      this._getOrderTotalInfo()
    },
    reset() {
      this.queryForm = {
        searchType: 'studentName',
        searchInput: '',
        orderType: '',
        payType: '',
        recommendUserId: null,
        dateRange: [],
        onlyValid: false,
        onlyArrears: false
      }
      this.query()
    },
    // 打开详情
    handleOpenDetail(orderId) {
      this.$refs.orderDetailDialog.open(orderId)
    },
    // 编辑备注
    editRemark(row, index) {
      this.$http.put('/v1/order/orderRemark', null, {
        params: {
          orderId: row.id,
          remark: row.remarkCopy
        }
      }).then(res => {
        row.remark = row.remarkCopy + ''
        this.$refs['remarkHack' + index].click()
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.progress
  display flex
  justify-content center
  align-items center
.cancelExprot
  display flex
  justify-content center
.order-container
  padding 12px
  background #fff

.total-info
  margin-bottom 12px
  font-size 14px
  label
    color $color-text-3
    margin-left 24px
    &:first-child
      margin-left 0
  span
    color $color-text-1
    font-size 16px
    font-weight bold

.remark-wrapper
  padding-right 30px
  position relative
  min-height 22px
  no-wrap()
  i
    position absolute
    right 12px
    top 4px
    font-size 14px
    cursor pointer
</style>

<style lang="stylus">
.remark-edit-popver
  .remark-edit-form
    display flex
    label
      flex-shrink 0
      width 46px
  .remark-edit-btns
    text-align center
    margin-top 16px
</style>

<template>
  <div>
    <div class="not-data" v-if="isNotData">
      <p class="title">当前校区：<span>{{currentBranch.name}}</span><br>校区还未绑定收款账户，使用微信扫描下面二维码绑定。</p>
      <div class="qr-code-box">
        <qrcode :value="bindQrCode" :options="{ width: 200, margin: 0 }"/>
        <p class="tip">两小时内有效</p>
      </div>
    </div>
    <div v-if="accountInfo" class="account-wrapper">
      <div class="account-info">
        <div class="top-info">
          <div class="top-item">
            <p class="info-title">账户余额(元)</p>
            <div class="amount-row">
              <span class="amount">{{(accountInfo.amount / 100).toFixed(2)}}</span>
              <el-button type="primary" @click="handleOpenApply" style="width: 100px;">申请提现</el-button>
            </div>
          </div>
          <div class="top-item">
            <p class="info-title">正在申请提现(元)</p>
            <div class="amount-row">
              <span class="amount">{{(accountInfo.transferMoney / 100).toFixed(2)}}</span>
              <el-button type="text" size="medium" @click="handleOpenApplyRecord">提现记录</el-button>
            </div>
          </div>
        </div>
        <div class="bottom-info">
          <div class="bottom-item">
            <p class="info-title">账号负责人</p>
            <p class="info-content">
              {{accountInfo.userName}}
              <el-button type="text" size="medium" @click="handleOpenUpdateQr">换绑负责人</el-button>
            </p>
          </div>
          <div class="bottom-item">
            <p class="info-title">手机号码</p>
            <p class="info-content">{{accountInfo.phone}}</p>
          </div>
          <div class="bottom-item">
            <p class="info-title">当前校区</p>
            <p class="info-content">{{currentBranch.name}}</p>
          </div>
        </div>
      </div>
      <div class="record-container">
        <p class="title">收支记录</p>
        <div class="query-form">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            align="right"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始发起日期"
            end-placeholder="结束发起日期"
            :picker-options="dateOptions"
            @change="query"
            style="margin-right: 16px; width: 250px;">
          </el-date-picker>
          <el-checkbox :value="queryForm.type === 0" @click.native.prevent="handleTypeChange(0)">只查收入</el-checkbox>
          <el-checkbox :value="queryForm.type === 1" @click.native.prevent="handleTypeChange(1)">只查支出</el-checkbox>
          <el-button type="text" @click="reset" :disabled="!loadingQuery ? false : true" size="medium" style="margin: 0 10px;">重&nbsp;置</el-button>
        </div>

        <el-table
          :data="recordList"
          v-loading="loadingQuery">
          <el-table-column
            prop="type"
            label="类型"
            width="100"
            align="center">
            <el-tag slot-scope="scope" :type="scope.row.type === 1 ? 'danger' : 'success'">{{scope.row.type === 1 ? '支出' : '收入'}}</el-tag>
          </el-table-column>
          <el-table-column
            prop="amount"
            label="金额"
            width="140"
            align="center">
            <template slot-scope="scope">{{(scope.row.amount / 100).toFixed(2)}}元</template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="收支说明">
          </el-table-column>
          <el-table-column
            prop="userName"
            label="经办人"
            width="120"
            align="center">
          </el-table-column>
          <el-table-column
            prop="phone"
            label="经办人电话"
            width="120"
            align="center">
          </el-table-column>
          <el-table-column
            prop="createAt"
            label="交易时间"
            width="144"
            align="center">
          </el-table-column>
        </el-table>

        <div class="bottom-pagination">
          <el-pagination
            @size-change="query"
            @current-change="_getRecordList"
            :current-page.sync="pageNum"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="showUpdateQr" title="更换收款账户负责人" width="360px" center custom-class="custom-dialog">
      <div class="qr-code-box">
        <qrcode :value="bindUpdateQrCode" :options="{ width: 200, margin: 0 }"/>
        <p class="tip">使用微信扫一扫<br>两小时内有效</p>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="showApply" title="申请提现" width="420px" :close-on-click-modal="false" custom-class="custom-dialog" @close="stopCountDown">
      <el-form :model="applyForm" ref="applyForm" :rules="applyRules" label-width="88px">
        <el-form-item label="申请人" prop="applyUserName">
          <el-input v-model="applyForm.applyUserName" disabled style="width: 210px"/>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="applyForm.phone" disabled style="width: 210px"/>
        </el-form-item>
        <el-form-item label="提现金额" prop="money">
          <el-input-number v-model="applyForm.money" :min="0.1" :max="accountInfo ? accountInfo.amount : 9999999" :precision="1" controls-position="right" style="width: 210px"/>元
        </el-form-item>
        <el-form-item label="提现说明" prop="reason">
          <el-input v-model="applyForm.reason" type="textarea" :rows="3" :maxlength="100" placeholder="请填写提现说明。(最多100个字)"/>
        </el-form-item>
        <el-form-item label="验证码" prop="smsCode">
          <el-input v-model.trim="applyForm.smsCode" @keyup.enter.native="handleApplySubmit" placeholder="请填写短信验证码" maxlength="6" autocomplete="off">
            <el-button slot="append" class="sms-btn" @click="getSmsCode" :disabled="loadingSms || applyForm.smsCount < 60">{{countMsg}}</el-button>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="showApply = false">取消</el-button>
          <el-button type="primary" :loading="loadingApply" @click="handleApplySubmit">确定申请</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="showApplyRecord" title="提现申请记录" top="6vh" width="920px" custom-class="custom-dialog">
      <div class="query-form">
          <el-date-picker
            v-model="applyQueryForm.dateRange"
            type="daterange"
            align="right"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始申请日期"
            end-placeholder="结束申请日期"
            :picker-options="dateOptions"
            @change="queryApplyRecord"
            style="margin-right: 16px; width: 250px;">
          </el-date-picker>
          <inline-select v-model="applyQueryForm.withdrawStatus" label="审核状态" :options="[
            { value: 0, label: '正在审核' },
            { value: 1, label: '审核通过' },
            { value: 2, label: '审核不通过' }
          ]" @change="queryApplyRecord" clearable/>
        </div>

        <el-table
          :data="applyRecordList"
          v-loading="loadingQueryApply">
          <el-table-column
            prop="type"
            label="申请人"
            width="168">
            <template slot-scope="scope">
              {{scope.row.applyUserName + '：' + scope.row.phone}}
            </template>
          </el-table-column>
          <el-table-column
            prop="money"
            label="金额"
            width="100">
            <span slot-scope="scope" class="color-danger">{{(scope.row.money / 100).toFixed(2)}}元</span>
          </el-table-column>
          <el-table-column
            prop="reason"
            label="提款说明">
          </el-table-column>
          <el-table-column
            prop="withdrawStatus"
            label="状态"
            width="120"
            align="center">
            <el-tag slot-scope="scope" :type="scope.row.withdrawStatusClass">{{scope.row.withdrawStatusStr}}</el-tag>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="审核说明">
          </el-table-column>
          <el-table-column
            prop="createAt"
            label="提现时间"
            width="144"
            align="center">
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center">
            <template slot-scope="scope">
              <el-button type="text" :disabled="scope.row.valid === 0 || scope.row.withdrawStatus !== 0" @click="handleCancelApply(scope.row)">撤销</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="bottom-pagination">
          <el-pagination
            @size-change="queryApplyRecord"
            @current-change="_getApplyRecordList"
            :current-page.sync="applyPageNum"
            :page-size.sync="applyPageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="applyTotal">
          </el-pagination>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import QRCode from '../../components/QRCode'
import InlineSelect from '../../components/InlineSelect'

export default {
  data() {
    return {
      showUpdateQr: false, // 展示更新二维码
      showWithdrawal: false, // 展示提现
      showApply: false, // 展示申请
      showApplyRecord: false, // 申请列表
      loadingQuery: false,
      loadingQueryApply: false,
      loadingSms: false,
      loadingApply: false,
      isNotData: false,
      accountInfo: null,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      queryForm: {
        dateRange: [],
        type: null
      },
      recordList: [],
      dateOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      bindUpdateQrCode: '',
      applyForm: {
        walletId: null,
        applyUserName: '',
        phone: '',
        reason: '',
        money: 0,
        smsCode: '',
        smsCount: 60
      },
      applyRules: {
        applyUserName: { required: true, message: '请填写申请人姓名', trgger: 'blur' },
        phone: { required: true, message: '请填写申请人手机号码', trgger: 'blur' },
        reason: { required: true, message: '请填写申请原因', trgger: 'blur' },
        money: { type: 'number', required: true, message: '请填写申请金额', trgger: 'blur' },
        smsCode: { required: true, message: '请填写短信验证码', trgger: 'blur' }
      },
      applyRecordList: [],
      applyPageNum: 1,
      applyPageSize: 10,
      applyTotal: 0,
      applyQueryForm: {
        dateRange: [],
        withdrawStatus: ''
      }
    }
  },
  components: {
    [QRCode.name]: QRCode,
    InlineSelect
  },
  computed: {
    bindQrCode() {
      return `${process.env.VUE_APP_PARENT_URL}/#/bindPayAccount/${this.currentBranch.id}?orgId=${this.organizationInfo.id}&userId=${this.userInfo.id}&_t=${Date.now()}`
    },
    countMsg() {
      if (this.loadingSms) {
        return '正在获取验证码'
      }
      if (this.applyForm.smsCount >= 60) {
        return '获取短信验证码'
      }
      return `重新获取(${this.applyForm.smsCount}s)`
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo'
    ])
  },
  created() {
    this._getAccountInfo()
  },
  destroyed() {
    this.stopCountDown()
  },
  methods: {
    // 获取账户基础信息
    _getAccountInfo() {
      this.loadingQuery = true
      this.$http.get('/v1/Wallet/getWalletByOrgIdAndDepId', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }).then(res => {
        if (res.data) {
          this.accountInfo = res.data
          this._getRecordList()
        } else {
          this.isNotData = true
        }
      }).finally(() => {
        this.loadingQuery = false
      })
    },
    // 获取收支记录
    _getRecordList() {
      this.loadingQuery = true
      const params = {
        walletId: this.accountInfo.id,
        type: this.type,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      this.$http.get('/v1/WalletIncomeOrExpenseRecord/getWalletIncomeOrExpenseRecordList', params).then(res => {
        this.recordList = res.data
        this.total = res.total
      }).finally(() => {
        this.loadingQuery = false
      })
    },
    // 获取申请记录
    _getApplyRecordList() {
      const params = {
        pageNum: this.applyPageNum,
        pageSize: this.applyPageSize,
        withdrawStatus: this.applyQueryForm.withdrawStatus,
        walletId: this.accountInfo && this.accountInfo.id
      }
      if (this.applyQueryForm.dateRange && this.applyQueryForm.dateRange.length > 0) {
        params.startTime = this.applyQueryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.applyQueryForm.dateRange[1] + ' 23:59:59'
      }
      this.loadingQueryApply = true
      this.$http.get('/v1/TransferApply/getTransferApplyList', params).then(res => {
        res.data.forEach(item => {
          switch (item.withdrawStatus) {
            case 0:
              item.withdrawStatusStr = '正在审核'
              item.withdrawStatusClass = 'info'
              break
            case 1:
              item.withdrawStatusStr = '审批通过'
              item.withdrawStatusClass = 'success'
              break
            case 2:
              item.withdrawStatusStr = '审批不通过'
              item.withdrawStatusClass = 'danger'
              break
          }
          if (item.valid === 0) {
            item.withdrawStatusStr = '已撤销'
            item.withdrawStatusClass = 'warning'
          }
        })
        this.applyRecordList = res.data
        this.applyTotal = res.total
      }).finally(() => {
        this.loadingQueryApply = false
      })
    },
    handleTypeChange(type) {
      if (this.queryForm.type === type) {
        this.queryForm.type = null
      } else {
        this.queryForm.type = type
      }
      this._getAccountInfo()
    },
    query() {
      this.pageNum = 1
      this._getRecordList()
    },
    reset() {
      this.queryForm = {
        dateRange: [],
        type: null
      }
      this.query()
    },
    handleOpenUpdateQr() {
      this.showUpdateQr = true
      this.bindUpdateQrCode = `${process.env.VUE_APP_PARENT_URL}/#/bindUpdatePayAccount/${this.accountInfo.id}?orgId=${this.organizationInfo.id}&depId=${this.currentBranch.id}&userId=${this.userInfo.id}&_t=${Date.now()}`
    },
    handleOpenApply() {
      this.applyForm = {
        walletId: this.accountInfo.id,
        applyUserName: this.accountInfo.userName,
        phone: this.accountInfo.phone,
        reason: '',
        money: 0,
        smsCode: '',
        smsCount: 60
      }
      this.showApply = true
    },
    handleOpenApplyRecord() {
      this.applyRecordList = []
      this.applyPageNum = 1
      this.applyPageSize = 10
      this.applyTotal = 0
      this.applyQueryForm = {
        dateRange: [],
        withdrawStatus: null
      }
      this.showApplyRecord = true
      this._getApplyRecordList()
    },
    getSmsCode() {
      if (this.loadingSms) return
      if (this.applyForm.smsCount < 60) return

      this.loadingSms = true
      this.$http.get('/v1/sendSmsTransferVerification', {
        phone: this.applyForm.phone
      }).then(() => {
        this.$message.success('发送验证码成功！')
        this.startCountDown()
      }).finally(() => {
        this.loadingSms = false
      })
    },
    startCountDown() {
      this.applyForm.smsCount--
      this.timer = setInterval(() => {
        if (this.applyForm.smsCount > 0) {
          this.applyForm.smsCount--
        } else {
          this.applyForm.smsCount = 60
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    stopCountDown() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.applyForm.smsCount = 60
    },
    handleApplySubmit() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          this.loadingApply = true
          this.$http.post('/v1/TransferApply/transferApply', this.applyForm).then(() => {
            this.$message.success('发起提款申请成功，请等待审核！')
            this._getAccountInfo()
            this.showApply = false
          }).finally(() => {
            this.loadingApply = false
          })
        }
      })
    },
    queryApplyRecord() {
      this.applyPageNum = 1
      this._getApplyRecordList()
    },
    handleCancelApply(row) {
      this.$confirm('是否确定撤销该条提现申请？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/TransferApply/deleteById/' + row.id).then(() => {
          this.$message.success('撤销提现申请成功！')
          this._getApplyRecordList()
          this._getAccountInfo()
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.not-data
  background #ffffff
  padding 20px
  width 400px
  text-align center
  margin 12vh auto 0
  .title
    margin-bottom 24px
    line-height 1.8
    span
      color $color-danger
.qr-code-box
  text-align center
.tip
  color $color-text-3

.account-info
  background #fff
  padding 24px
  border-bottom 2px solid $color-primary
  margin 0 auto 24px
  max-width 1120px
  box-sizing border-box
  .info-title
    color $color-text-3
    font-size 14px
    margin-bottom 12px
  .info-content
    color $color-text-1
    font-size 20px
.top-info
  border-bottom 1px solid $color-border-3
  margin-bottom 16px
  padding-bottom 24px
  display flex
  .top-item
    flex 1
.amount-row
  display flex
  align-items center
  .amount
    margin-right 48px
    color $color-primary
    font-size 28px
  .el-button
    font-size 14px
    &+.el-button
      margin-left 16px
.bottom-info
  display flex
.bottom-item
  flex 1
  box-sizing border-box
  padding 16px 16px 6px 16px
  line-height 1.2
  &:first-child
    padding-left 0
  &+.bottom-item
    border-left 1px solid $color-border-3

.record-container
  padding 12px 16px 16px
  background #fff
  margin 0 auto
  max-width 1120px
  box-sizing border-box
  .query-form
    padding 0
    float right
  .title
    position relative
    height 32px
    line-height 32px
    padding-left 18px
    font-size 18px
    margin-bottom 12px
    float left
    &:before
      width 3px
      top 6px
      bottom 6px
      left 0
      position absolute
      background $color-primary
      content ''
      display block
      border-radius 3px
</style>

<style lang="stylus">
.account-dialog
  .el-dialog__header
    height 40px
    line-height 40px
    background $color-background
    padding 0 16px
  .el-dialog__headerbtn
    top 12px
  .el-dialog__body
    padding 16px
  .query-form
    padding 0
</style>
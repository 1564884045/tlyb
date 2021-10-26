<template>
  <div>
    <div class="query-form">
      <div style="margin-bottom:10px;">
        <el-alert
          title="使用提示"
          type="warning">
          <template>
            <ul>
              <li>1. 发送预警通知有两种，一是短信通知，另一种是微信通知。</li>
              <li>2. 短信通知成功的前提：（1）学员有主要联系人电话；（2）机购买了短信服务。</li>
              <li>3. 微信通知成功的前提：（1）学员家长关注了嫁接了公众号的机构自己的公众号或我们官方提供的【校讯帮】的公众号；（2）家长在公众号上绑定了学员。</li>
              <li>4. 发送通知为两种通知同时发送，主要满足上述2或3中的条件即可。</li>
            </ul>
          </template>
        </el-alert>
      </div>
      <el-input v-model="queryForm.stuName" :maxlength="30" placeholder="请输入学员姓名搜索" @keyup.native.enter="query" clearable class="input-with-select" style="width: 180px; margin-right: 16px;"></el-input>
      <el-input v-model="queryForm.phone" :maxlength="20" placeholder="请输入手机号搜索" @keyup.native.enter="query" clearable class="input-with-select" style="width: 160px; margin-right: 16px;"></el-input>
      <!-- <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        :clearable="false"
        :picker-options="pickerOptions"
        @change="query">
      </el-date-picker> -->
      <el-button type="text" @click="query" size="medium" style="margin: 0 10px;">查&nbsp;询</el-button>
      <el-button type="text" @click="reset" size="medium" style="margin: 0 10px;">重&nbsp;置</el-button>

      <div class="right-btns">
        <el-button type="primary" icon="el-icon-tickets" @click="handleWarningSetting">预警设置</el-button>
      </div>
    </div>
    <div class="showTableData">
      <el-table
        :data="warningList"
        v-loading="loadingQuery">
        <el-table-column
          prop="stuName"
          label="学员姓名"
          width="240">
        </el-table-column>
        <el-table-column
          label="联系方式"
          width="260">
          <template slot-scope="scope">
              <div size="medium">{{scope.row.contact || '-'}}({{scope.row.relation || '-'}})：{{scope.row.phone || '-'}}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="预警信息">
          <template slot-scope="scope">
            <div class="warning-information">
              <div v-if="scope.row.courseNameAndResidueClassHour">
                <div class="residue-info" v-for="(item,index) in scope.row.courseNameAndResidueClassHour.split(',')" v-bind:key="index">
                  <el-tag size="medium">{{ item.split("-")[0] }} - 剩余: {{item.split("-")[1] ? item.split("-")[1] : '-' + item.split("--")[1]}} 课时 </el-tag>
                </div>
              </div>
              <div v-if="scope.row.courseNameAndResidueClassDay">
                <div class="residue-info" v-for="(item,index) in scope.row.courseNameAndResidueClassDay.split(',')" v-bind:key="index">
                  <el-tag size="medium">{{ item.split("-")[0] }} - 剩余: {{item.split("-")[1] ? item.split("-")[1] : '-' + item.split("--")[1]}} 天 </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="lastRemindTime"
          label="上次提醒时间"
          width="200"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.lastRemindTime || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="160"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleSendSms(scope.row)">发送通知</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @current-change="_getWarningList"
          @size-change="query"
          :page-size.sync="pageSize"
          :current-page.sync="pageNum"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <el-dialog
      :visible.sync="showSetting"
      custom-class="custom-dialog"
      title="预警设置"
      :close-on-click-modal="false"
      width="420px">
      <el-form :model="settingForm" label-width="108px">
        <el-form-item prop="autoWarning" label="是否自动预警" required>
          <el-switch v-model="settingForm.autoWarning"></el-switch>
          <p class="form-tip">开启后将自动每天发送短信预警通知</p>
        </el-form-item>
        <el-form-item prop="courseNum" label="剩余课时" required>
          <el-input-number v-model="settingForm.courseNum" :min="1" :max="10" :controls="false"></el-input-number>
          <p class="form-tip">剩余{{settingForm.courseNum}}个课时达到预警值</p>
        </el-form-item>
        <el-form-item prop="residueDays" label="剩余天数" required>
          <el-input-number v-model="settingForm.residueDays" :min="1" :max="90" :controls="false"></el-input-number>
          <p class="form-tip">(按时间课程)剩余{{settingForm.residueDays}}天时达到预警值</p>
        </el-form-item>
        <el-form-item>
          <el-button @click="showSetting = false">取消</el-button>
          <el-button type="primary" :loading="loadingSubmit" @click="handleSubmitSetting">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import moment from 'moment'

export default {
  data() {
    return {
      loadingQuery: false,
      loadingSubmit: false,
      showSetting: false,
      queryForm: {
        stuName: '',
        phone: ''
        // dateRange: []
      },
      warningList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      settingForm: {
        autoWarning: false,
        courseNum: 4,
        residueDays: 7
      },
      settingList: []
    }
  },
  computed: {
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  created() {
    this._getWarningList()
  },
  methods: {
    _getWarningList() {
      this.loadingQuery = true
      const params = {
        depId: this.currentBranch.id,
        orgId: this.organizationInfo.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        stuName: this.queryForm.stuName,
        phone: this.queryForm.phone
      }
      this.$http.get('/v1/warn/getCourseWarn', params).then(res => {
        this.warningList = res.data
        this.total = res.total
      }).finally(() => {
        this.loadingQuery = false
      })
    },
    query() {
      this.pageNum = 1
      this._getWarningList()
    },
    reset() {
      this.queryForm = {
        stuName: '',
        phone: '',
        dateRange: []
      }
      this.query()
    },
    /**
     * 发送通知方法
     */
    handleSendSms(row) {
      let isEmptyPhone = false
      if (!row.phone) {
        isEmptyPhone = true
      }
      const msg = isEmptyPhone ? (`学员【${row.stuName}】未有联系人电话，将无法发送短信预警，仅能发送微信通知！` + `您确定要给【${row.stuName}】发送通知吗?`) : `您确定要给【${row.stuName}】发送通知吗?`
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.get('/v1/warn/sendSmsWarn', {
          depId: this.currentBranch.id,
          orgId: this.organizationInfo.id,
          courseNameAndResidueClassHour: row.courseNameAndResidueClassHour,
          courseNameAndResidueClassDay: row.courseNameAndResidueClassDay ? row.courseNameAndResidueClassDay : null,
          phone: row.phone,
          stuName: row.stuName,
          studentId: row.id
        }).then(() => {
          if (isEmptyPhone) {
            this.$message.success('发送微信预警通知成功')
          } else {
            this.$message.success('发送短信和微信预警通知成功！')
          }
          this._getWarningList()
        }).catch((err) => {
          // 短信剩余条数不足
          if (err.code === '200001') {
            this.$alert('微信通知发送成功，但短信条数剩余量不足,请前往行政管理->通知记录->短信通知->短信充值界面进行充值,如已充值仍无法发送,请前往<a target="_blank" href="https://www.tlybond.com">桃李云帮官网</a>联系客服', '提示', {
              distinguishCancelAndClose: true,
              confirmButtonText: '我知道了',
              dangerouslyUseHTMLString: true
            })
          }
        })
      })
    },
    /**
     * 预警通知设置
     */
    handleWarningSetting() {
      this.$http.get('/v1/OrganizationSetting/getWarnSettingByOrgIdAndDepId', {
        depId: this.currentBranch.id,
        orgId: this.organizationInfo.id
      }).then((res) => {
        if (res.data && res.data.length > 0) {
          this.settingList = res.data
          res.data.forEach(item => {
            if (item.settingCode === 'renew_warn_setting') {
              this.settingForm.courseNum = parseInt(item.settingValue.split(';')[0]) || 4
              this.settingForm.residueDays = parseInt(item.settingValue.split(';')[1]) || 7
            } else if (item.settingCode === 'auto_warn_setting') {
              this.settingForm.autoWarning = item.settingValue === 'true'
            }
          })
          this.showSetting = true
        } else {
          this.$message.error('机构没有预警设置数据，请联系管理员！')
        }
      })
    },
    handleSubmitSetting() {
      this.loadingSubmit = true
      this.settingList.forEach(item => {
        if (item.settingCode === 'renew_warn_setting') {
          item.settingValue = this.settingForm.courseNum + '' + ';' + this.settingForm.residueDays
        } else if (item.settingCode === 'auto_warn_setting') {
          item.settingValue = this.settingForm.autoWarning + ''
        }
      })
      this.$http.put('/v1/OrganizationSetting/updateBatchWarnSetting', this.settingList).then(res => {
        this.showSetting = false
        this.$message.success('预警设置成功！')
        this._getWarningList()
      }).finally(() => {
        this.loadingSubmit = false
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.showTableData
  background #fff
  padding 14px
.form-tip
  color $color-text-3
  font-size 13px
  margin-top 4px
  line-height 1

.residue-info
  margin-top 6px

.residue-info:first-child
  margin-top 0px
// .warning-information
//   max-height 100px
//   overflow-y auto
</style>

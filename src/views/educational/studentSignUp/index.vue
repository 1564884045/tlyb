<!-- 报名管理 -->
<template>
  <div class="container">
    <div>
      <div style="margin-bottom:10px;" v-if="!isShowQrcode">
        <el-alert title="使用提示" description="嫁接了公众号的机构才能使用扫描二维码报名功能" type="warning"></el-alert>
      </div>
      <div class="query-form">
        <el-input v-model.trim="queryForm.searchInput" :maxlength="11" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select" style="width: 320px; margin-right: 16px;">
          <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
            <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
        </el-input>
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="打卡开始日期"
          end-placeholder="打卡结束日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="query">
        </el-date-picker>
        <el-button type="text" :disabled="!tableDataLoading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
        <el-button type="text" :disabled="!tableDataLoading ? false : true" @click="query" size="medium" style="margin-left: 12px;">刷&nbsp;新</el-button>
        <!-- <span>
          <el-tooltip placement="bottom" effect="light">
            <div slot="content" class="code" v-if="isShowQrcode">
              <qrcode :value="signUpQrCode" tag="img" :options="{ width: 120, margin: 0 }"/>
            </div>
            <div slot="content" v-else>请先嫁接公众号</div>
            <el-button id="btn">报名二维码</el-button>
          </el-tooltip>
        </span> -->
        <span class="popover">
          <el-popover
            placement="bottom"
            trigger="hover"
            popper-class="popover">
            <div class="code" v-if="isShowQrcode">
              <qrcode style="display:block;margin: 0 auto" :value="signUpQrCode" tag="img" :options="{ width: 150, margin: 0}"/>
            </div>
            <el-button id="button" slot="reference" :disabled="!isShowQrcode">报名二维码</el-button>
          </el-popover>
        </span>
        <div class="checkBox">
          <span>报名状态：</span>
          <el-checkbox-group v-model="queryForm.disposeStatus" @change="query">
            <el-checkbox :label="0">待处理</el-checkbox>
            <el-checkbox :label="1">已处理</el-checkbox>
            <el-checkbox :label="2">已忽略</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="signUpTable">
        <el-table
          :data="tableData"
          v-loading="tableDataLoading"
          style="width: 100%">
          <el-table-column
            fixed
            label="姓名"
            prop=""
            props
            width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.oldStudentName">
                <span>{{scope.row.oldStudentName}}</span>
              </span>
              <span v-else>{{scope.row.newStudentName}} <el-tag type="warning" size="mini">新学员</el-tag></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="selectCourseNum"
            label="课程"
            width="140"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="selectTuitionNum"
            label="学杂"
            align="center"
            width="140"
          >
          </el-table-column>
          <el-table-column
            prop="createAt"
            label="报名时间"
          >
          </el-table-column>
          <el-table-column
            prop="newPrimaryContactPhone"
            label="家长电话"
            align="center"
            width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.oldPrimaryContactPhone">
                <span>{{scope.row.oldPrimaryContactPhone}}</span>
              </span>
              <span v-else>{{scope.row.newPrimaryContactPhone}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="newPrimaryContactName"
            label="家长姓名"
            align="center"
            width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.oldPrimaryContactName">
                <span>{{scope.row.oldPrimaryContactName}}</span>
              </span>
              <span v-else>{{scope.row.newPrimaryContactName}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="disposeStatus"
            label="报名状态"
            align="center"
            width="120">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.disposeStatus === 0" type="warning">待处理</el-tag>
              <el-tag v-if="scope.row.disposeStatus === 1" type="success">已处理</el-tag>
              <el-tag v-if="scope.row.disposeStatus === 2" type="info">已忽略</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="140">
            <template slot-scope="scope">
              <el-button v-if="scope.row.disposeStatus === 1" @click="handleCheck(scope.row)" type="text" size="small">查看</el-button>
              <el-button v-if="scope.row.disposeStatus === 0" type="text" @click="handleOrder(scope.row.id)" size="small">处理</el-button>
              <el-button v-if="scope.row.disposeStatus === 0" @click="handleIgnore(scope.row, 0)" type="text" size="small">忽略</el-button>
              <el-button type="text" size="small" @click="handleIgnore(scope.row, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          @size-change="query"
          @current-change="_getPreSignUpList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>
    <!-- 订单详情 -->
    <order-detail-dialog ref="orderDetailDialog" :closeOnModal="false"></order-detail-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import OrderDetailDialog from '@/views/salesManagement/OrderDetailDialog'
import QRCode from '@/components/QRCode'
export default {
  name: 'StudentSignUp',
  components: {
    OrderDetailDialog,
    [QRCode.name]: QRCode
  },
  data() {
    return {
      isShowQrcode: false, // 是否显示报名二维码
      tableDataLoading: false,
      signUpQrCode: null, // 报名二维码
      queryForm: {
        searchType: 'studentName',
        searchInput: '',
        disposeStatus: [],
        dateRange: []
      },
      searchTypeList: [
        {
          value: 'studentName',
          label: '学员姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'primaryContactPhone',
          label: '家长号码',
          placeholder: '请输入家长手机号码'
        }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'weeks').toDate(), new Date()])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'months').toDate(), new Date()])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(3, 'months').toDate(), new Date()])
          }
        }]
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    // 默认一周
    this.queryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this._getPreSignUpList()
    this.createQRCode() // 若嫁接是公众号的机构，移入显示出扫码报名二维码
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  // 相关方法
  methods: {
    // 获取扫码报名学员
    _getPreSignUpList() {
      this.tableDataLoading = true
      const params = {
        belongDepartment: this.currentBranch.id,
        belongOrganization: this.organizationInfo.id,
        startDate: this.queryForm.dateRange[0] + ' 00:00:00',
        endDate: this.queryForm.dateRange[1] + ' 23:59:59',
        disposeStatusArr: this.queryForm.disposeStatus.join(','),
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      this.$http.get('/v1/preSign/getPreSignUpList', params).then(res => {
        this.tableData = res.data
        this.total = res.total
      }).finally(() => {
        this.tableDataLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getPreSignUpList()
    },
    reset() {
      this.queryForm = {
        searchType: 'studentName',
        searchInput: '',
        disposeStatus: [],
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      }
      this.pageNum = 1
      this.pageSize = 10
      this._getPreSignUpList()
    },
    // 生成学员报名二维码
    createQRCode() {
      if (this.organizationInfo.openWechatDeploy) { // 已嫁接公众号
        this.isShowQrcode = !this.isShowQrcode
        this.signUpQrCode = `${process.env.VUE_APP_PARENT_URL}/#/scanCode?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
      }
    },
    // 处理
    handleOrder(studentId) {
      this.$router.push({ name: 'StudentSignUpInformation', query: { studentId: studentId } })
    },
    // 查看学员报名数据
    handleCheck(row) {
      // 显示订单信息
      this.$refs.orderDetailDialog.open(row.orderId)
    },
    // 忽略
    handleIgnore(row, status) {
      let studnetName = ''
      if (row.newStudentName) {
        studnetName = row.newStudentName
      } else {
        studnetName = row.oldStudentName
      }
      this.$confirm(`此操作将会永久${status === 0 ? '忽略' : '删除'}学员【${studnetName}】的报名信息，是否继续`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (status === 0) {
          this.$http.put(`/v1/preSign/ignorePreSignUp/${row.id}`).then(res => {
            this.$message({ message: `学员【${studnetName}】报名信息已忽略`, type: 'success' })
            this._getPreSignUpList()
          })
        } else {
          this.$http.delete(`/v1/preSign/deletePreSignUp/${row.id}`).then(res => {
            this.$message({ message: `学员【${studnetName}】报名信息已删除`, type: 'success' })
            this._getPreSignUpList()
          })
        }
      })
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
  width 100%
  height 100%
  .signUpTable
    background #fff
    padding 14px
  .popover
    #button
      border none
      padding 0 0 0 14px
      font-size 14px
      color $color-primary
      &:hover
        background-color #fff
  >>>.el-tooltip
    border none
  .checkBox
    margin-top 12px
    display flex
    justify-content flex-start
    align-items center
  .pagination
    margin-top 12px
</style>

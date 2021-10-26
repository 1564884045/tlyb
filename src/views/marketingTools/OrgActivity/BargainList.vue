<template>
  <div>
    <el-table
      v-loading="loading"
      :data="list"
      v-if="isShow"
      style="width: 100%">

      <el-table-column
        prop="name"
        label="名称">
        <span slot-scope="scope" class="link" @click="handleShowRow(scope.row)">{{scope.row.name}}</span>
      </el-table-column>

      <el-table-column
        prop="startTime"
        label="开始时间"
        width='160'
        align="center">
      </el-table-column>

      <el-table-column
        prop="endTime"
        label="结束时间"
        width='160'
        align="center">
      </el-table-column>

      <el-table-column
        prop="launchCount"
        label="发起砍价数"
        width='100'
        align="center">
      </el-table-column>

      <el-table-column
        prop="attendCount"
        label="帮助砍价数"
        width='100'
        align="center">
      </el-table-column>

      <el-table-column
        prop="statusStr"
        label="活动状态"
        width='140'
        align="center">
        <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="viewData(scope.row)">报名表</el-button>
          <el-button v-if="scope.row.status != 2 && scope.row.status != 3 && scope.row.launchCount > 0" type="text" size="mini" @click="handleOpenRecord(scope.row)">结算</el-button>
          <el-button v-if="scope.row.statusSelf" type="text" size="mini" @click="toggleStatus(scope.row)">{{scope.row.statusSelf}}</el-button>
          <el-button v-if="scope.row.status !== 2" type="text" size="mini" @click="edit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === 0" type="text" size="mini" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

      <p slot="empty">暂无数据，请从【模板库】中选择添加</p>
    </el-table>

    <!-- 更新后的版本 -->
    <div class="model-container" v-loading="loading">
      <div v-if="list.length == 0" class="empty">
        <p>暂无数据</p>
      </div>
      <div v-else class="item" v-for="item in list" :key="item.id">
        <img class="thumb-img" :src="!item.thumbUrl ? defaultImg : item.thumbUrl"/>
        <div class="item-content">
          <div class="delault-height">
            <el-popover
              placement="bottom"
              width="500"
              trigger="hover"
              :disabled="!item.name || (item.name && item.name.length < 35)"
              :content="item.name">
              <p slot="reference" class="title">{{item.name}}</p>
            </el-popover>
          </div>
          <div class="delault-height">
            <el-tag v-if="!item.template">暂无</el-tag>
            <el-tag v-else type="primary">{{item.template}}</el-tag>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>浏览量: </span>
              <p>{{item.browseCount}}</p>
            </span>
            <span class="stat-content">
              <span>分享量: </span>
              <p>{{item.shareCount}}</p>
            </span>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>发起量: </span>
              <p>{{item.launchCount}}</p>
            </span>
            <span class="stat-content">
              <span>参与量: </span>
              <p>{{item.attendCount}}</p>
            </span>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>原价: </span>
              <p>￥{{item.originalPrice}}</p>
            </span>
            <span class="stat-content">
              <span>最大可砍金额: </span>
              <p>￥{{item.maxReducePrice}}</p>
            </span>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>最大可砍价次数: </span>
              <p>{{item.maxReduceCount}}</p>
            </span>
            <span class="stat-content">
              <span>可参与用户数: </span>
              <p>{{item.maxReduceUserCount}}</p>
            </span>
          </div>
          <div class="content-footer">
            <p class="delault-height">活动时间：<span>{{item.startTime}} ~ {{item.endTime}}</span></p>
          </div>
        </div>
        <div class="item-footer">
          <el-button type="text" size="mini" @click="handleShowRow(item)">查看</el-button>
          <el-button type="text" size="mini" @click="viewData(item)">数据统计</el-button>
          <el-button v-if="item.status != 2 && item.status != 3 && item.launchCount > 0" type="text" size="mini" @click="handleOpenRecord(item)">结算</el-button>
          <el-button v-if="item.statusSelf" type="text" size="mini" @click="toggleStatus(item)">{{item.statusSelf}}</el-button>
          <el-button v-if="item.status !== 2" type="text" size="mini" @click="edit(item)">编辑</el-button>
          <el-button v-if="item.status === 0" type="text" size="mini" @click="remove(item.id)">删除</el-button>
        </div>
        <p class="template-tag" :class="item.statusModelClass">{{item.statusStr}}</p>
      </div>
    </div>

    <div class="bottom-pagination">
      <el-pagination
        @size-change="query"
        @current-change="_getActivityList"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[5, 10, 15, 20, 25]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <!-- 统计数据弹框 -->
    <el-dialog
      :visible.sync="showDetail"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      width="880px"
      top="6vh">
      <ul class='bargain-detail-dialog'>
        <li>
          <p>浏览总量</p>
          <p class="nums">{{browseCountNum}}</p>
        </li>
        <li>
          <p>分享总量</p>
          <p class="nums">{{shareCountNum}}</p>
        </li>
        <li>
          <p>报名总人数</p>
          <p class="nums">{{applyUserCountNum}}</p>
        </li>
      </ul>
      <p class="data-title">报名列表</p>
      <el-table
        :data="userList">
        <el-table-column
          prop="type"
          label="类型"
          width="64"
          align="center">
          <span slot-scope="scope" :class="scope.row.type === 1 ? 'color-success' : 'color-danger'">
            {{scope.row.type === 1 ? '学员' : '潜客'}}
          </span>
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="sex"
          label="性别"
          width="64"
          align="center">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号"
          width="120">
        </el-table-column>
        <el-table-column
          prop="currentReducePrice"
          label="已砍金额"
          width="120">
          <template slot-scope="scope">{{scope.row.currentReducePrice}}元</template>
        </el-table-column>
        <el-table-column
          label="剩余金额"
          width="120">
          <template slot-scope="scope">{{(scope.row.originalPrice - scope.row.currentReducePrice).toFixed(2)}}元</template>
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="支付状态"
          width="100"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="发起时间"
          width="148"
          align="center">
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="queryUser"
          @current-change="_getUserList"
          :current-page.sync="userPageNum"
          :page-size.sync="userPageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next"
          :total="userTotal"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 结算确认清单 -->
    <el-dialog
      title="结算清单"
      :visible.sync="showRecordList"
      width="880px"
      top="6vh"
      custom-class="bargain-record-list-dialog">
      <p slot="title" class="title">
        结算清单<span class="color-danger">({{currentActivity && currentActivity.name}})</span>
      </p>
      <p class="tip">
        活动累计支付金额：<span class="price">{{recordTotalAmount}}</span>元。
        (<span class="color-warning">实际到账金额会扣除微信手续费用，审核时间一般7天</span>)
      </p>
      <el-table
        :data="recordList"
        height="62vh">
        <el-table-column
          prop="outTradeNo"
          label="订单编号">
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          width="64"
          align="center">
          <span slot-scope="scope" :class="scope.row.type === 1 ? 'color-success' : 'color-danger'">
            {{scope.row.type === 1 ? '学员' : '潜客'}}
          </span>
        </el-table-column>
        <el-table-column
          prop="targetUsername"
          label="姓名"
          width="100">
        </el-table-column>
        <el-table-column
          prop="targetPhone"
          label="手机号"
          width="100">
        </el-table-column>
        <el-table-column
          prop="currentReducePrice"
          label="已砍金额"
          width="100">
          <template slot-scope="scope">{{scope.row.currentReducePrice}}元</template>
        </el-table-column>
        <el-table-column
          prop="actualPayMoney"
          label="实际支付金额"
          width="100">
          <template slot-scope="scope">{{scope.row.actualPayMoney}}元</template>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="发起时间"
          width="148"
          align="center">
        </el-table-column>
      </el-table>
      <div class="bottom-pagination clearfix">
        <el-pagination
          @size-change="queryRecord"
          @current-change="_getRecordList"
          :current-page.sync="recordPageNum"
          :page-size.sync="recordPageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next"
          :total="recordTotal"
          style="float: left;"
        >
        </el-pagination>
        <div style="float: right;">
          <el-button @click="showRecordList = false">取消</el-button>
          <el-button type="primary" :loading="loadingSubmitRecord" @click="handleSattle">确认并结算</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { TweenLite } from 'gsap/TweenMax'
import moment from 'moment'
import defaultImg from '../../../assets/model-load-error.png'

export default {
  name: 'OrgActivity',
  props: {
    name: String
  },
  data() {
    return {
      isShow: false,
      defaultImg: defaultImg,
      loading: false,
      loadingUser: false, // 加载潜在客户
      loadingQueryRecord: false,
      loadingSubmitRecord: false,
      showDetail: false,
      showRecordList: false, // 砍价结算清单
      list: [],
      pageNum: 1,
      pageSize: 5,
      total: 0,
      applyUserCount: 0, // 报名总人数数据
      browseCount: 0, // 浏览总量
      shareCount: 0, // 分享总量
      userList: [], // 有效潜在客户列表
      userPageSize: 10,
      userPageNum: 1,
      userTotal: 0,
      currentActivity: null,
      // 结算清单相关
      recordList: [],
      recordTotalAmount: 0,
      recordPageNum: 1,
      recordPageSize: 10,
      recordTotal: 0
    }
  },
  computed: {
    applyUserCountNum() {
      return this.applyUserCount.toFixed(0)
    },
    browseCountNum() {
      return this.browseCount.toFixed(0)
    },
    shareCountNum() {
      return this.shareCount.toFixed(0)
    }
  },
  created() {
    this._getActivityList()
  },
  methods: {
    // 获取活动列表
    _getActivityList() {
      this.loading = true
      this.$http.get('/v1/OrganizationReduceWeb/getOrganizationReduceWebList', {
        organizationId: this.$store.getters.organizationInfo.id,
        departmentId: this.$store.getters.currentBranch.id,
        name: this.name,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(res => {
        res.data.forEach(item => {
          switch (item.status) {
            case 0:
              item.statusStr = '未上架'
              item.statusClass = 'info'
              item.statusSelf = '发布'
              item.statusModelClass = 'model0'
              break
            case 1:
              if (moment().isBefore(item.startTime)) {
                item.statusStr = '未开始'
                item.statusClass = 'warning'
                item.statusSelf = '下架'
                item.statusModelClass = 'model0'
              } else if (moment().isAfter(item.endTime)) {
                item.statusStr = '已结束'
                item.statusClass = 'success'
                item.statusModelClass = 'model2'
              } else {
                item.statusStr = '进行中'
                item.statusModelClass = 'model1'
              }
              break
            case 2:
              item.statusStr = '已下架'
              item.statusClass = 'info'
              if (item.statusStr === '未开始') {
                item.statusSelf = '重新上架'
              }
              item.statusModelClass = 'model1'
              break
            case 3:
              item.statusStr = '已结算'
              item.statusClass = 'info'
              item.statusModelClass = 'model2'
              break
          }
        })
        this.list = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    // 获取有效用户
    _getUserList() {
      if (this.currentActivity == null) return

      this.userList = []
      this.loadingUser = true
      this.$http.get('/v1/PotentialCustomer/getReduceStudentAndPotentialCustomerInfo', {
        pageNum: this.userPageNum,
        pageSize: this.userPageSize,
        webId: this.currentActivity.id
      }).then(res => {
        res.data.forEach(item => {
          switch (item.sex) {
            case 1:
              item.sex = '男'
              break
            case 2:
              item.sex = '女'
              break
            default:
              item.sex = '未知'
              break
          }
          switch (item.status) {
            case 0:
              item.statusClass = 'info'
              item.statusStr = '未支付'
              break
            case 1:
              item.statusClass = 'success'
              item.statusStr = '已支付'
              break
            case 2:
              item.statusClass = 'warning'
              item.statusStr = '已取消'
              break
          }
        })
        this.userList = res.data
        this.userTotal = res.total
        this.currentActivity.launchCount = res.total
        TweenLite.to(this.$data, 1, { applyUserCount: res.total || 0 })
      }).finally(() => {
        this.loadingUser = false
      })
    },
    // 获取结算清单
    _getRecordList() {
      this.loadingQueryRecord = true
      this.$http.get('/v1/LaunchReduceRecord/getLaunchReduceRecordList', {
        webId: this.currentActivity.id,
        status: 1,
        pageNum: this.recordPageNum,
        pageSize: this.recordPageSize
      }).then(res => {
        if (res.data) {
          this.recordList = res.data.launchReduceRecords || []
          this.recordTotalAmount = res.data.onlinePayAmount || 0
          this.recordTotal = res.total
        }
      }).finally(() => {
        this.loadingQueryRecord = false
      })
    },
    query() {
      this.pageNum = 1
      this._getActivityList()
    },
    queryUser() {
      this.userPageNum = 1
      this._getUserList()
    },
    queryRecord() {
      this.recordPageNum = 1
      this._getRecordList()
    },
    handleShowRow(row) {
      this.$emit('show', row)
    },
    handleOpenRecord(row) {
      this.currentActivity = Object.assign({}, row)
      this.recordList = []
      this.recordTotalAmount = 0
      this.recordPageNum = 1
      this.recordPageSize = 10
      this.recordTotal = 0
      this._getRecordList()
      this.showRecordList = true
    },
    viewData(row) {
      this.showDetail = true
      this.applyUserCount = 0
      this.browseCount = 0
      this.shareCount = 0
      TweenLite.to(this.$data, 1, { applyUserCount: row.launchCount || 0 })
      TweenLite.to(this.$data, 1, { browseCount: row.browseCount || 0 })
      TweenLite.to(this.$data, 1, { shareCount: row.shareCount || 0 })
      // 去查询潜在客户
      this.currentActivity = row
      this.queryUser()
    },
    toggleStatus(row) {
      this.$confirm(`是否 ${row.statusSelf} 该活动？`, '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        // 切换上下架
        this.$http.put('/v1/OrganizationReduceWeb/putawayOrSoudOut', null, {
          params: {
            id: row.id,
            status: row.status === 1 ? 2 : 1
          }
        }).then(() => {
          this.query()
          this.$message.success(row.status === 1 ? '下架成功' : '上架成功')
        })
      })
    },
    edit(row) {
      this.$emit('edit', row)
    },
    remove(id) {
      this.$confirm('是否确定删除该砍价活动？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/OrganizationReduceWeb/delete/${id}`).then(res => {
          this.$message.success('删除活动成功！')
          this._getActivityList()
        })
      })
    },
    handleSattle() {
      if (this.recordTotalAmount <= 0) {
        this.$message.warning('该活动没有可结算金额！')
        return
      }
      this.$confirm('确定该结算清单无误，继续结算？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.loadingSubmitRecord = true
        this.$http.post('/v1/ActivitySettle/activitySettleAction', {
          organizationId: this.$store.getters.organizationInfo.id,
          departmentId: this.$store.getters.currentBranch.id,
          type: 0,
          webId: this.currentActivity.id
        }).then(() => {
          this.$message.success('结算成功！')
          this.showRecordList = false
          this._getActivityList()
        }).finally(() => {
          this.loadingSubmitRecord = false
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.bargain-detail-dialog
  width 540px
  margin 0 auto
  margin-top -26px
  li
    display inline-block
    width 150px
    height 100px
    background #f2f2f2
    text-align center
    margin 0 15px
    border-radius 5px
    p
      margin-top 20px
    .nums
      font-size 30px
      color $color-primary
      margin-top 12px
.data-title
  margin-top 18px
  margin-bottom 10px
  line-height 24px
  font-size 18px
  color #303133
.model-container
  width 100%
  color #999999
  .empty
    border 1px solid #eeeeee
    height 100px
    p
      width 100%
      height 100px
      line-height 100px
      text-align center
      color #aaaaaa
  .item
    height 180px
    margin-bottom 15px
    padding 10px
    border 1px solid #eeeeee
    position relative
    overflow hidden
    .thumb-img
      width 190px
      height 100%
      float left
    .item-content
      float left
      margin-left 20px
      min-width 550px
      position relative
      .delault-height
        margin-bottom 10px
      .title
        font-weight bold
        overflow hidden
        text-overflow ellipsis
        display -webkit-box
        -webkit-line-clamp 1
        -webkit-box-orient vertical
      .el-tag
        margin-right 15px
      .content-footer
        margin-top 8px
        span
          color #888888
    .item-stat
      display flex
      margin-bottom 5px
      .stat-content
        width 250px
        display flex
        span
          margin-right 10px
          color #999999
        p
          color #888888
          margin-right 20px
    .item-footer
      width 180px
      line-height 190px
      float right
    .template-tag
      position absolute
      top 6px
      right -35px
      line-height 30px
      width 120px
      text-align center
      color #fff
      transform rotateZ(45deg)
      transform-origin center
      box-shadow 0 4px 12px #686868
      z-index 1
      font-size 14px
      &.model0
        background #acacac
        font-size 16px
      &.model1
        background #e51a1a
      &.model2
        background $color-success
    &:hover
      box-shadow 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
      background-color #fefefe
</style>

<style lang="stylus">
.bargain-record-list-dialog
  .el-dialog__header
    font-weight bold
    line-height 40px
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    span
      color $color-danger
      margin-left 12px
  .tip
    margin-bottom 12px
    .price
      color $color-danger
      font-size 18px
      font-weight bold
      margin-left 8px
      margin-right 4px
  .el-dialog__headerbtn
    top 14px
  .el-dialog__body
    padding 16px
  .el-tabs__header
    padding 0
</style>
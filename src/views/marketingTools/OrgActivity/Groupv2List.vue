<template>
  <div class="group-list-wrapper">
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
        label="发起团数"
        width='120'
        align="center">
      </el-table-column>

      <el-table-column
        prop="attendCount"
        label="参与人数"
        width='120'
        align="center">
      </el-table-column>

      <el-table-column
        prop="statusStr"
        label="活动状态"
        width='120'
        align="center">
        <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        width="210">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="viewData(scope.row)">报名表</el-button>
          <el-button v-if="scope.row.launchCount > 0" type="text" size="mini" @click="openCommissionDialog(scope.row)">分佣详情</el-button>
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
            <el-tag v-if="item.posterShareKickback == 1" type="success">已开启海报分佣</el-tag>
            <el-tag v-if="item.posterShareKickback == 0" type="danger">未开启海报分佣</el-tag>
            <el-tag v-if="item.isShowAllGroup == 1" type="success">显示全部可参与的团</el-tag>
            <el-tag v-if="item.isShowAllGroup == 0" type="danger">不显示全部可参与的团</el-tag>
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
              <span>点赞量: </span>
              <p>{{item.starCount}}</p>
            </span>
            <span class="stat-content">
              <span>单用户可发起 / 参与数: </span>
              <p>{{item.launchLimit}} / {{item.attendLimit}}</p>
            </span>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>发起拼团金额: </span>
              <p>￥{{item.launchFee}}</p>
            </span>
            <span class="stat-content">
              <span>参与拼团金额: </span>
              <p>￥{{item.attendFee}}</p>
            </span>
          </div>
          <div class="item-stat">
            <span class="stat-content">
              <span>发起拼团次数: </span>
              <p>{{item.launchCount}}</p>
            </span>
            <span class="stat-content">
              <span>参与拼团次数: </span>
              <p>{{item.attendCount}}</p>
            </span>
          </div>
          <div class="content-footer">
            <p class="delault-height">活动时间：<span>{{item.startTime}} ~ {{item.endTime}}</span></p>
          </div>
        </div>
        <div class="item-footer">
          <el-button type="text" size="mini" @click="handleShowRow(item)">查看</el-button>
          <el-button type="text" size="mini" @click="viewData(item)">数据统计</el-button>
          <el-button v-if="item.launchCount > 0" type="text" size="mini" @click="openCommissionDialog(item)">分佣详情</el-button>
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
      width="80%"
      top="6vh">
      <ul class='detail_dialog'>
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
          <p class="nums">{{attendCountNum}}</p>
        </li>
        <li>
          <p>报名总费用</p>
          <p class="nums">{{totalFeeNum}}</p>
        </li>
      </ul>
      <p class="data-title">报名列表</p>
      <el-form :model="userForm" inline>
        <el-form-item prop="goodsId" label="商品:">
          <el-select v-model="userForm.goodsId" clearable style="width: 160px">
            <el-option v-for="item in goodsList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="userName" label="用户名:">
          <el-input v-model="userForm.userName" :maxlength="20" placeholder="请填写用户名" style="width: 140px"/>
        </el-form-item>
        <el-form-item prop="phone" label="手机号:">
          <el-input v-model="userForm.phone" :maxlength="11" placeholder="请填写手机号码" style="width: 140px"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryUser">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        border
        :data="userList"
        row-key="id"
        :tree-props="{children: 'memberInfo'}"
        v-loading="loadingUser">
        <el-table-column
          prop="activityGoodsName"
          label="商品名"
          width="200">
        </el-table-column>
        <el-table-column
          v-for="item in userColumn"
          :key="item.key"
          :prop="item.key"
          :label="item.label"
          :width="item.key == 'userName' || item.key == 'phone' ? '100' : ''">
          <template slot-scope="scope">{{scope.row[item.key] instanceof Array ? scope.row[item.key].join('、') : scope.row[item.key]}}</template>
        </el-table-column>
        <el-table-column
          prop="num"
          label="人数"
          width="54"
          align="center">
        </el-table-column>
        <el-table-column
          prop="isFull"
          label="是否满团"
          width="78"
          align="center">
          <el-tag v-if="scope.row.isFull != null" slot-scope="scope" :type="scope.row.isFull ? 'success' : 'info'">{{scope.row.isFull ? '已满团' : '未满团'}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="totalFee"
          label="支付金额"
          width="88"
          align="center">
        </el-table-column>
        <el-table-column
          label="备注">
          <div class="remark-wrapper" slot-scope="scope" :ref="'remarkHack' + scope.$index">
            <span :title="scope.row.remark">{{scope.row.remark}}</span>
            <el-popover
              width="240"
              trigger="click"
              popper-class="remark-edit-popver">
              <div class="remark-edit-form">
                <label>备注：</label>
                <el-input type="textarea" v-model="scope.row.remarkCopy" :maxlength="120" show-word-limit placeholder="报名备注(最多120个字)"/>
              </div>
              <div class="remark-edit-btns">
                <el-button size="mini" @click="$refs['remarkHack' + scope.$index].click()">取消</el-button>
                <el-button size="mini" type="primary" @click="editUserRemark(scope.row, scope.$index)">确认</el-button>
              </div>
              <i slot="reference" class="el-icon-edit-outline" title="编辑备注"/>
            </el-popover>
          </div>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="参团时间"
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="userTotal"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 分佣记录 -->
    <el-dialog
      :visible.sync="showCommission"
      :close-on-click-modal="false"
      width="80%"
      top="6vh"
      custom-class="group-record-list-dialog">
      <p slot="title" class="title">
        分佣详情<span class="color-danger">({{currentActivity && currentActivity.name}})</span>
      </p>
      <el-form :model="commissionForm" inline>
        <el-form-item prop="status" label="商品:">
          <el-select v-model="commissionForm.status" clearable style="width: 120px">
            <el-option :value="1" label="已领取"></el-option>
            <el-option :value="0" label="待领取"></el-option>
            <el-option :value="2" label="领取失败"></el-option>
            <el-option :value="3" label="系统已回收"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="userName" label="用户名:">
          <el-input v-model="commissionForm.userName" :maxlength="20" placeholder="请填写用户名" style="width: 140px"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryCommission">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        border
        :data="commissionList"
        v-loading="loadingCommission">
        <el-table-column
          prop="targetWechatUserName"
          label="推广人"
          width="128">
        </el-table-column>
        <el-table-column
          prop="userName"
          label="报名人"
          width="100">
        </el-table-column>
        <el-table-column
          prop="payFee"
          label="支付金额"
          width="80"
          align="center">
        </el-table-column>
        <el-table-column
          prop="payTime"
          label="支付时间"
          width="148"
          align="center">
        </el-table-column>
        <el-table-column
          prop="totalFee"
          label="红包金额"
          width="80"
          align="center">
        </el-table-column>
        <el-table-column
          prop="status"
          label="分佣状态"
          width="88"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="sendTime"
          label="发送时间"
          width="148"
          align="center">
        </el-table-column>
        <el-table-column
          prop="failReason"
          label="失败原因">
          <template slot-scope="scope">
            {{scope.row.failReason}}
            <span v-if="scope.row.failReason && !scope.row.canReSend" class="color-danger">[不能补发]</span>
            <el-popover
              v-if="scope.row.failureRecords && scope.row.failureRecords.length > 0"
              width="440"
              trigger="click">
              <el-table :data="scope.row.failureRecords">
                <el-table-column width="148" prop="createAt" label="时间" align="center"></el-table-column>
                <el-table-column width="88" prop="totalFee" label="金额" align="center"></el-table-column>
                <el-table-column prop="msg" label="原因"></el-table-column>
              </el-table>
              <el-button slot="reference" type="text" style="margin-left: 16px;">失败记录</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
          align="center">
          <template slot-scope="scope">
            <el-button :disabled="!scope.row.canReSend" @click="reSend(scope.row)" type="primary">补发</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="queryCommission"
          @current-change="_getCommissionList"
          :current-page.sync="commissionPageNum"
          :page-size.sync="commissionPageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="commissionTotal"
        >
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { TweenLite } from 'gsap/TweenMax'
import moment from 'moment'
import defaultImg from '../../../assets/model-load-error.png'

export default {
  name: 'Groupv2List',
  props: {
    name: String
  },
  data() {
    return {
      isShow: false,
      defaultImg: defaultImg,
      loading: false,
      loadingUser: false, // 加载潜在客户
      loadingCommission: false, // 加载潜在客户
      loadingQueryRecord: false,
      showDetail: false,
      showCommission: false,
      showRecordList: false, // 砍价结算清单
      list: [],
      pageNum: 1,
      pageSize: 5,
      total: 0,
      currentActivity: null,
      goodsList: [],
      attendCount: 0, // 报名总人数数据
      totalFee: 0, // 报名总收费用
      browseCount: 0, // 浏览总量
      shareCount: 0, // 分享总量
      // 报名列表
      userForm: {
        goodsId: '',
        phone: '',
        userName: ''
      },
      userColumn: [], // 显示的潜在客户列
      userList: [], // 有效潜在客户列表
      userPageSize: 10,
      userPageNum: 1,
      userTotal: 0,
      // 分销记录
      commissionForm: {
        status: '',
        userName: ''
      },
      commissionList: [],
      commissionPageNum: 1,
      commissionPageSize: 10,
      commissionTotal: 0,
      gradeList: []
    }
  },
  computed: {
    attendCountNum() {
      return this.attendCount.toFixed(0)
    },
    totalFeeNum() {
      return this.totalFee.toFixed(0)
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
    this._getGradeList()
  },
  methods: {
    _getGradeList() {
      this.$http.get('/v1/dictionary/DicClass/getAll').then(res => {
        console.log(res.data)
        this.gradeList = res.data
      })
    },
    _getActivityList() {
      this.loading = true
      this.$http.get('/v1/ActivityGroupPurchase/getActivityGroupPurchaseList', {
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
              item.statusModelClass = 'model-info'
              break
            case 1:
              if (moment().isBefore(item.startTime)) {
                item.statusStr = '未开始'
                item.statusClass = 'warning'
                item.statusSelf = '下架'
                item.statusModelClass = 'model-info'
              } else if (moment().isAfter(item.endTime)) {
                item.statusStr = '已结束'
                item.statusClass = 'success'
                item.statusModelClass = 'model-warning'
              } else {
                item.statusStr = '进行中'
                item.statusModelClass = 'model-primary'
              }
              break
            case 2:
              item.statusStr = '已下架'
              item.statusClass = 'info'
              if (item.statusStr === '未开始') {
                item.statusSelf = '重新上架'
              }
              item.statusModelClass = 'model-danger'

              break
            case 3:
              item.statusStr = '已结算'
              item.statusModelClass = 'model-success'
              break
          }
        })
        this.list = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    _getGoodsList() {
      if (this.currentActivity == null) return
      this.$http.get('/v1/ActivityGoods/getByActivityId', { activityId: this.currentActivity.id }).then(res => {
        this.goodsList = res.data
      })
    },
    // 获取报名列表
    _getUserList() {
      if (this.currentActivity == null) return
      // 获取有效用户
      const params = Object.assign({}, this.userForm, {
        id: this.currentActivity.id,
        pageNum: this.userPageNum,
        pageSize: this.userPageSize
      })
      this.loadingUser = true
      this.$http.get('/v1/ActivityGroupPurchase/getActivityGroupPurchaseDetailInfo', params).then(res => {
        if (res.data) {
          // 刷新顶部数据
          TweenLite.to(this.$data, 1, { browseCount: res.data.browseCount || 0 })
          TweenLite.to(this.$data, 1, { shareCount: res.data.shareCount || 0 })
          TweenLite.to(this.$data, 1, { attendCount: res.data.attendCount || 0 })
          TweenLite.to(this.$data, 1, { totalFee: res.data.totalFee || 0 })
          // 同步列表中的统计数据
          const activity = this.list.find(o => o.id === this.currentActivity.id)
          activity.attendCount = res.data.attendCount
          activity.launchCount = res.data.launchCount
          // 处理数据
          let groupList = []
          res.data.groupInfos.forEach(group => {
            // 处理otherInfo
            let leader = null
            let memberList = []
            group.memberInfo.forEach(member => {
              member.id = member.openId + member.groupId
              if (member.remark == null) member.remark = ''
              member.remarkCopy = member.remark
              if (member.otherInfo) {
                member = Object.assign(member, JSON.parse(member.otherInfo))
              }
              if (member.openId === group.groupInfo.openId) {
                leader = member
              } else {
                memberList.push(member)
              }
            })
            // 找到团长
            if (leader) {
              leader.activityGoodsName = group.groupInfo.activityGoodsName
              leader.num = group.memberInfo.length
              leader.isFull = group.memberInfo.length >= group.groupInfo.fullGroupLimit
              leader.userName += '(团长)'
              leader.memberInfo = memberList
              groupList.push(leader)
            }
          })
          const that = this
          groupList.forEach(item => {
            switch (item.sex) {
              case 0:
                item.sex = '未知'
                break
              case 1:
                item.sex = '男'
                break
              case 2:
                item.sex = '女'
                break
            }
            for (let i = 0; i < that.gradeList.length; i++) {
              if (item.grade === that.gradeList[i].id) {
                item.grade = that.gradeList[i].name
                break
              }
            }
          })
          this.userList = groupList
          this.userTotal = res.data.total
        }
      }).finally(() => {
        this.loadingUser = false
      })
    },
    // 获取分佣记录
    _getCommissionList() {
      if (this.currentActivity == null) return
      // 获取有效用户
      const params = Object.assign({}, this.commissionForm, {
        activityGroupPurchaseId: this.currentActivity.id,
        pageNum: this.commissionPageNum,
        pageSize: this.commissionPageSize
      })
      this.loadingCommission = true
      this.$http.get('/v1/ActivityGroupPurchaseKickback/getByActivityId', params).then(res => {
        res.data.forEach(item => {
          switch (item.status) {
            case 1:
              item.statusStr = '待领取'
              item.statusClass = 'info'
              break
            case 2:
              item.statusStr = '已领取'
              item.statusClass = 'success'
              break
            case 3:
              item.statusStr = '领取失败'
              item.statusClass = 'danger'
              break
            case 4:
              item.statusStr = '已回收'
              item.statusClass = 'warning'
              break
            case 5:
              item.statusStr = '发送失败'
              item.statusClass = 'danger'
              break
            default:
              break
          }
          if (item.failureRecords && item.failureRecords.length > 0) {
            item.failReason = item.failureRecords[0].msg
            item.errCode = item.failureRecords[0].type
          }
          item.canReSend = false
          if (item.status === 4) {
            item.canReSend = true
          } else if (item.status === 5) {
            if (item.errCode === 2 || item.errCode === 4 || item.errCode === 5 || item.errCode === 7 || item.errCode === 11 || item.errCode === 12 ||
            item.errCode === 13 || item.errCode === 15 || item.errCode === 18 || item.errCode === 19 || item.errCode === 20) {
              item.canReSend = true
            }
          }
        })
        this.commissionList = res.data
        this.commissionTotal = res.total
      }).finally(() => {
        this.loadingCommission = false
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
    queryCommission() {
      this.commissionPageNum = 1
      this._getCommissionList()
    },
    handleShowRow(row) {
      this.$emit('show', row)
    },
    viewData(row) {
      this.showDetail = true
      this.attendCount = 0
      this.browseCount = 0
      this.shareCount = 0
      this.totalFee = 0
      TweenLite.to(this.$data, 1, { browseCount: row.browseCount || 0 })
      TweenLite.to(this.$data, 1, { shareCount: row.shareCount || 0 })
      TweenLite.to(this.$data, 1, { attendCount: row.attendCount || 0 })
      TweenLite.to(this.$data, 1, { totalFee: row.totalFee || 0 })
      // 显示什么列
      this.userColumn = []
      const data = JSON.parse(row.data)
      data.reservationInfo = data.reservationInfo || []
      const cols = [{ label: '姓名', key: 'userName' }, { label: '手机号', key: 'phone' }]
      data.reservationInfo.forEach(key => {
        let label = ''
        switch (key) {
          case 'age':
            label = '年龄'
            break
          case 'grade':
            label = '年级'
            break
          case 'school':
            label = '学校'
            break
          case 'sex':
            label = '性别'
            break
          case 'address':
            label = '地址'
            break
          default:
            if (key.label) {
              label = key.label
            }
            break
        }
        cols.push({
          key: typeof key === 'object' ? key.label : key,
          label
        })
      })
      this.userColumn = cols
      // 去查询潜在客户
      this.currentActivity = Object.assign({}, row)
      this._getGoodsList()
      this.queryUser()
    },
    openCommissionDialog(row) {
      this.showCommission = true
      this.currentActivity = Object.assign({}, row)
      this.queryCommission()
    },
    toggleStatus(row) {
      this.$confirm(`是否 ${row.statusSelf} 该活动？`, '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        // 切换上下架
        this.$http.put('/v1/ActivityGroupPurchase/updateStatus', null, {
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
      this.$confirm('是否确定删除该拼团活动？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/ActivityGroupPurchase/deleteById/${id}`).then(res => {
          this.$message.success('删除活动成功！')
          this._getActivityList()
        })
      })
    },
    handleOpenRecord(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http.get('/v1/ActivityGroupPurchase/getStatisticsInfoById', {
        activityId: row.id
      }).then(res => {
        this.$msgbox({
          title: '结算确认',
          message: `<div class="sattle-msgbox">
                    <p>当前活动累计收益：<span class="color-success">${res.data.income}元</span></p>
                    <p>已领取红包：<span class="color-danger" style="margin-right: 6px">${res.data.receivedOutput}元</span>
                      待领取红包：<span class="color-danger">${res.data.unReceiveOutput}元</span></p>
                    <p class="color-warning" style="margin-top: 16px;">结算后活动将自动结束，确定该结算信息无误，继续结算？</p>
                    <p class="color-info" style="margin-top: 16px;">结算将收取6‰手续费，此手续费由微信平台收取与桃李云帮平台无关，实际到账金额以收款账户中收支记录为准，审核时间一般7天以内</p>
                    </div>`,
          dangerouslyUseHTMLString: true,
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              if (res.data.unReceiveOutput > 0) {
                this.$message.warning('该活动仍有待领取红包，不能结算。请确认后操作！')
                done()
                return
              }
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '结算中...'
              this.$http.post('/v1/ActivitySettle/activitySettleAction', {
                organizationId: this.$store.getters.organizationInfo.id,
                departmentId: this.$store.getters.currentBranch.id,
                type: 2,
                webId: row.id
              }).then(() => {
                done()
                this.$message.success('结算成功！')
                this._getActivityList()
              }).finally(() => {
                instance.confirmButtonText = '确认'
                instance.confirmButtonLoading = false
              })
            } else {
              done()
            }
          }
        })
      }).finally(() => {
        loading.close()
      })
    },
    editUserRemark(row, index) {
      this.$http.put('/v1/ActivityGroupPurchaseForm/updateActivityGroupPurchaseForm', {
        id: row.formId,
        remark: row.remarkCopy
      }).then(res => {
        row.remark = row.remarkCopy + ''
        this.$refs['remarkHack' + index].click()
      })
    },
    reSend(row) {
      this.$confirm(`确定补发红包给【${row.targetWechatUserName}】？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http.post('/v1/ActivityGroupPurchaseKickback/reSendRedPack', null, {
          params: {
            kickBackId: row.id
          }
        }).then(() => {
          this.$message.success('补发成功！')
          this._getCommissionList()
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.detail_dialog
  display flex
  justify-content center
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
      width 550px
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
        width 220px
        display flex
        span
          margin-right 10px
          color #999999
        p
          color #888888
          margin-right 20px
    .item-footer
      flex 1
      display flex
      flex-direction row
      align-items center
      justify-content flex-end
      height 180px
      margin-right 20px
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
      &.model-primary
        background $color-primary-dark
      &.model-success
        background $color-success
      &.model-warning
        background $color-warning
      &.model-danger
        background $color-danger
      &.model-info
        background $color-info
    &:hover
      box-shadow 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
      background-color #fefefe
</style>

<style lang="stylus">
.group-list-wrapper
  .avatar-column
    .cell
      display flex
      align-items center
    .el-table__expand-icon
      font-size 16px
      font-weight bold
      margin-left 0
      margin-right 6px
.group-record-list-dialog
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
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
        prop="potentialCount"
        label="报名数"
        width='120'
        align="center">
      </el-table-column>

      <el-table-column
        prop="activityStatus"
        label="活动状态"
        width='160'
        align="center">
        <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.activityStatus}}</el-tag>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="viewData(scope.row)">报名表</el-button>
          <el-button v-if="scope.row.activityStatus !== '进行中' && scope.row.activityStatus !== '已结束'" type="text" size="mini" @click="toggleStatus(scope.row)">{{scope.row.statusShelf}}</el-button>
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
            <el-tag v-if="!item.keywords">暂无</el-tag>
            <el-tag v-else type="primary" v-for="(subItem, index) in item.keywords.split(';')" :key="index">{{subItem}}</el-tag>
          </div>
          <div class="item-stat">
            <span>浏览量: </span>
            <p>{{item.browseCount}}</p>
          </div>
          <div class="item-stat">
            <span>潜客量: </span>
            <p>{{item.potentialCount}}</p>
          </div>
          <div class="item-stat">
            <span>分享量: </span>
            <p>{{item.shareCount}}</p>
          </div>
          <div class="content-footer">
            <p class="delault-height">活动时间：<span>{{item.startTime}} ~ {{item.endTime}}</span></p>
          </div>
        </div>
        <div class="item-footer">
          <el-button type="text" size="mini" @click="handleShowRow(item)">查看</el-button>
          <el-button type="text" size="mini" @click="viewData(item)">数据统计</el-button>
          <el-button v-if="item.activityStatus !== '进行中' && item.activityStatus !== '已结束'" type="text" size="mini" @click="toggleStatus(item)">{{item.statusShelf}}</el-button>
          <el-button v-if="item.status !== 2" type="text" size="mini" @click="edit(item)">编辑</el-button>
          <el-button v-if="item.status === 0" type="text" size="mini" @click="remove(item.id)">删除</el-button>
        </div>
        <p class="template-tag" :class="item.statusModelClass">{{item.activityStatus}}</p>
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
      width="60%"
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
          <p class="nums">{{applyUserCountNum}}</p>
        </li>
      </ul>
      <p class="data-title">报名列表</p>
      <el-table
        :data="userList">
        <el-table-column
          v-for="item in userColumn"
          :key="item.key"
          :prop="item.key"
          :label="item.label"
        >
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
  </div>
</template>

<script>
import { TweenLite } from 'gsap/TweenMax'
import defaultImg from '../../../assets/model-load-error.png'

export default {
  name: 'OrgActivity',
  props: {
    name: String,
    status: Number
  },
  data() {
    return {
      isShow: false,
      defaultImg: defaultImg,
      loading: false,
      loadingUser: false, // 加载潜在客户
      showDetail: false,
      list: [],
      pageNum: 1,
      pageSize: 5,
      total: 0,
      applyUserCount: 0, // 报名总人数数据
      browseCount: 0, // 浏览总量
      shareCount: 0, // 分享总量
      userColumn: [], // 显示的潜在客户列
      userList: [], // 有效潜在客户列表
      userPageSize: 10,
      userPageNum: 1,
      userTotal: 0,
      currentActivity: null
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
    _getActivityList() {
      this.loading = true
      this.$http.get('/v1/OrganizationMicroWeb/getOrganizationMicroWebList', {
        organizationId: this.$store.getters.organizationInfo.id,
        departmentId: this.$store.getters.currentBranch.id,
        name: this.name,
        status: this.status,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(res => {
        res.data.forEach(item => {
          switch (item.status) {
            case 0:
              item.statusShelf = '发布'
              break
            case 1:
              item.statusShelf = '下架'
              break
            case 2:
              item.statusShelf = '重新上架'
              break
          }

          switch (item.activityStatus) {
            case '已下架':
            case '未上架':
              item.statusClass = 'info'
              item.statusModelClass = 'model0'
              break
            case '进行中':
              item.statusClass = ''
              item.statusModelClass = 'model2'
              break
            case '已结束':
              item.statusClass = 'success'
              item.statusModelClass = 'model1'
              break
            case '未开始':
              item.statusClass = 'warning'
              item.statusModelClass = 'model0'
              break
          }
        })
        this.list = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    _getUserList() {
      if (this.currentActivity == null) return

      // 获取有效用户
      this.userList = []
      this.loadingUser = true
      this.$http.get('/v1/PotentialCustomer/getByWebId', {
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
        })
        this.userList = res.data
        this.userTotal = res.total

        this.currentActivity.potentialCount = res.total
        TweenLite.to(this.$data, 1, { applyUserCount: res.total || 0 })
      }).finally(() => {
        this.loadingUser = false
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
    handleShowRow(row) {
      this.$emit('show', row)
    },
    viewData(row) {
      this.showDetail = true
      this.applyUserCount = 0
      this.browseCount = 0
      this.shareCount = 0
      TweenLite.to(this.$data, 1, { applyUserCount: row.potentialCount || 0 })
      TweenLite.to(this.$data, 1, { browseCount: row.browseCount || 0 })
      TweenLite.to(this.$data, 1, { shareCount: row.shareCount || 0 })
      // 显示什么列
      this.userColumn = []
      const data = JSON.parse(row.data)
      data.reservationInfo = data.reservationInfo || []
      const cols = [{ label: '姓名', key: 'name' }, { label: '手机号', key: 'phone' }]
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
        }
        cols.push({
          key,
          label
        })
      })
      cols.push({ label: '提交时间', key: 'createAt' })
      this.userColumn = cols
      // 去查询潜在客户
      this.currentActivity = row
      this.queryUser()
    },
    toggleStatus(row) {
      this.$confirm(`是否 ${row.statusShelf} 该活动？`, '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        switch (row.status) {
          case 0:
          case 2:
            // 去发布、重新上架
            this.$http.put('/v1/OrganizationMicroWeb/putaway?id=' + row.id).then(() => {
              this.query()
              this.$message.success('上架成功')
            })
            break
          case 1:
            // 去下架
            this.$http.put('/v1/OrganizationMicroWeb/sldout?id=' + row.id).then(() => {
              this.query()
              this.$message.success('下架成功')
            })
            break
        }
      })
    },
    edit(row) {
      this.$emit('edit', row)
    },
    remove(id) {
      this.$confirm('是否确定删除该微传单活动？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/OrganizationMicroWeb/delete/${id}`).then(res => {
          this.$message.success('删除活动成功！')
          this._getActivityList()
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.detail_dialog
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
        margin-bottom 15px
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
        margin-top 20px
        span
          color #888888
    .item-stat
      display flex
      margin-bottom 5px
      span
        margin-right 20px
        color #999999
      p
       color #888888
    .item-footer
      width 150px
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
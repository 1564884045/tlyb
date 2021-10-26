<template>
  <el-header height="50px">
    <el-dropdown class="navbar-left" @command="handleBranchDropdown">
      <p class="link">
        <i class="el-icon-menu"></i>
        <span>{{currentBranchName}}</span>
        <i class="el-icon-arrow-down"></i>
      </p>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in branchList" :key="item.id" :command="item.id">{{item.name}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- 系统目录 -->
    <div class="navbar-right">
      <ul>
        <!-- <li>
          <a @click.stop.prevent="$store.commit('toggleShowTopUp', true)" style="color: #f00;"><img class="pre-icon pay-icon" src="../../assets/system_logo.png" style="height: 24px; margin-bottom: 4px;"/>系统购买</a>
        </li> -->
        <!-- <li v-if="userInfo && userInfo.vipInfo">
          <a @click.stop.prevent="$store.commit('toggleShowJoinVip', true)" style="color: #f00;"><img class="pre-icon" src="../../assets/vip_logo.png" style="height: 24px; margin-bottom: 4px;"/>{{userInfo.vipInfo.basicVipName}}</a>
        </li>
        <li v-else>
          <a @click.stop.prevent="$store.commit('toggleShowJoinVip', true)"><img class="pre-icon" src="../../assets/join_vip.png" style="height: 24px; margin-bottom: 4px;"/>开通会员</a>
        </li>-->
        <li class="pay">
          <el-popover placement="bottom" width="150" trigger="hover">
            <div>
              <p>请使用微信扫描小程序二维码进行购买。</p>
              <img style="width:150px" src="../../assets/mini_program.jpg" alt="图片加载中" title="请使用微信扫描小程序二维码进行购买" />
            </div>
            <el-button id="btn" slot="reference">
              <i id="icon" class="el-icon-shopping-cart-full pre-icon" />设备购买
            </el-button>
          </el-popover>
        </li>
        <li>
          <a @click.stop.prevent="$store.commit('toggleShowIntroduction', true)">
            <i class="el-icon-info pre-icon" />版本说明
          </a>
        </li>
        <li>
          <a href="http://help.tlybond.com" target="_blank">
            <i class="el-icon-question pre-icon" />帮助中心
          </a>
        </li>
        <li>
          <el-dropdown trigger="hover" @command="handleUserInfoDropdown">
            <div class="userInfo" v-if="userInfo">
              <img class="avatar" :src="userInfo.avatar || require('@/assets/default_avatar.png')" />
              <span>{{userInfo && userInfo.vipInfo ? '尊敬的会员' : '你好'}}，</span>
              <span class="userInfo-name">{{userInfo.username}}</span>
            </div>
            <el-dropdown-menu slot="dropdown" class="userInfo-dropdown">
              <el-dropdown-item command="personalInfo">
                <i class="el-icon-user" aria-hidden="true"></i> 个人信息
              </el-dropdown-item>
              <!-- <el-dropdown-item command="getVersionsRight">
                <i class="el-icon-ice-cream" aria-hidden="true"></i> 版本权益
              </el-dropdown-item> -->
              <el-dropdown-item command="logout" divided>
                <i class="el-icon-switch-button" aria-hidden="true"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
      </ul>
    </div>
    <person-info v-model="showPersonInfo"></person-info>
    <!-- 版本权益 -->
    <!-- <versions-right v-model="showVersionsRight"></versions-right> -->

    <el-dialog
      :visible.sync="showMaturityDate"
      title="续费预警"
      append-to-body
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      width="360px">
      <div class="reminder-box">
        <p class="title">
          <img style="width: 18px; height: 18px" :src="require('../../assets/systemLogo/warning.png')" alt=""> 尊敬的用户,您好</p>
        您所购买的系统将在<span class="reminder">{{maturityDateInfo.day}}</span>天<span class="reminder">{{maturityDateInfo.h}}</span>小时后到期，请您及时续费。系统到期后将会默认切换为<span class="reminder">免费版</span>，部分功能将<span class="reminder">无法使用</span>，给您带来的不便，敬请谅解 ！
        <span style="color: #ff6600; cursor: pointer" @click="$store.commit('toggleShowTopUp', true), showMaturityDate = false">(点我快速续费)</span>
      </div>
    </el-dialog>

  </el-header>
</template>

<script>
import { mapGetters } from 'vuex'
import PersonInfo from '@/views/basicInfo/person'
// import VersionsRight from '@/views/basicInfo/versionsRight'
// import { SystemAuthInfo } from '@/utils/user'
export default {
  name: 'Navbar',
  // components: {
  //   PersonInfo, VersionsRight
  // },
  components: {
    PersonInfo
  },
  data() {
    return {
      showMaturityDate: false,
      maturityDateInfo: {
        day: '',
        h: ''
      },
      showPersonInfo: false,
      showVersionsRight: false,
      handoverMessage: false // 切换校区后的友好提示
    }
  },
  computed: {
    currentBranchName() {
      if (this.currentBranch == null) return '全部校区'
      return this.currentBranch.name
    },
    ...mapGetters([
      'userInfo',
      'sidebar',
      'organizationInfo',
      'currentBranch',
      'branchList'
    ])
  },
  created() {
    this._getBranchList()
    this.open()
  },
  methods: {
    _getBranchList() {
      this.$http.get('/v1/Department/getViewAbleDepartment').then((res) => {
        res.data.forEach((item) => {
          if (item.province) {
            item.province = item.province.split(';')
          }
          // 默认校区选中
          if (this.currentBranch == null && item.isDefault) {
            this.$store.commit('setCurrentBranch', item)
          }
        })
        // 没有默认，默认选中第一个
        if (this.currentBranch == null && res.data.length > 0) {
          this.$store.commit('setCurrentBranch', res.data[0])
        }
        this.$store.commit('setBranchList', res.data)
      })
    },
    goCashManagePage() {
      this.$router.push('/cash/index')
    },
    goMessagePage() {
      this.$router.push('/message/index')
    },
    handleBranchDropdown(id) {
      const obj = this.branchList.find((o) => o.id === id)
      console.log(obj)
      if (obj && obj.id !== this.currentBranch.id) {
        this.$confirm('您确认切换校区吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.commit('setCurrentBranch', obj)
          setTimeout(() => {
            window.location.reload()
          }, 80)
          this.$message({
            type: 'success',
            message: '您已切换校区成功！'
          })
        })
      }
    },
    open() {
      this.$message({
        message: '您已进入【' + this.currentBranchName + '】',
        type: 'success'
      })
      // const param = {
      //   organizationId: this.organizationInfo.id,
      //   departmentId: this.currentBranch.id
      // }
      // this.$http.get('/v1/VersionsOrgnizationAuth/getFullSystemAuthInfo', param).then(res => {
      //   SystemAuthInfo.set(res.data.systemAuthInfo)
      //   this.$store.dispatch('addUserMenus', res.data.menuList)
      // }).finally(() => {
      //   this.maturityDate()
      // })
    },
    // 系统到期提示
    // maturityDate() {
    //   if (SystemAuthInfo.get()) {
    //     const strTime = SystemAuthInfo.get().endValidateTime
    //     let date = Date.parse(strTime.replace(/-/g, '/'))
    //     let maturityDate = date - new Date().getTime()
    //     let dTime = 1000 * 60 * 60 * 24
    //     this.maturityDateInfo.day = Math.floor(maturityDate / dTime)
    //     this.maturityDateInfo.h = Math.floor((maturityDate % dTime) / (1000 * 60 * 60))
    //     // 到期时间小于7天提醒
    //     if (maturityDate < (7 * dTime)) {
    //       this.showMaturityDate = true
    //     }
    //   }
    // },
    handleUserInfoDropdown(cmd) {
      switch (cmd) {
        case 'logout':
          this.$store.dispatch('logout')
          break
        case 'personalInfo':
          this.showPersonInfo = true
          break
        case 'getVersionsRight':
          this.showVersionsRight = true
          break
        default:
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.left
  float left
  width 60px
.left
  .el-tooltip__popper
    padding 8px 10px
  .right .el-tooltip__popper
    padding 8px 10px
.item
  margin 4px
// 设置header z-index 高于body中tab切换背景
.el-header
  z-index 2 !important
.pay
  padding 0 16px
  cursor pointer
  position relative
  #btn
    background-color #fff
    font-size 14px
    color #303133
    width 100%
    height 20px
    margin 0 0 5px 0
    padding 0
    border none
  img
    position absolute
    left 0
    top 50px
    width 150px
    height 0
    transition 0.2s
  &:hover
    color $color-primary
    background $color-background
    #icon
      color $color-primary
    img
      height 150px
    #btn
      background $color-background
      color $color-primary
      border none
.el-header
  background #ffffff
  border-bottom 1px solid $color-border-2
  box-shadow 0 3px 10px -3px $color-border-1
  z-index 1
.el-badge
  line-height 1
.navbar-left
  line-height 50px
.navbar-right
  float right
  ul
    list-style none
    margin 0
    li
      float left
      height 50px
      line-height 50px
      &+li
        margin-left 20px
    a
      height 100%
      display inline-block
      color $color-text-1
      font-size 14px
      cursor pointer
      padding 0 8px
      &:visited
        color $color-text-1
      &:hover
        color $color-primary
        background $color-background
        i
          color $color-primary
    .pre-icon
      font-size 16px
      vertical-align middle
      margin-right 4px
      margin-bottom 3px
      color #999999
    .pay-icon
      height 16px !important
    .avatar
      width 30px
      height 30px
      border-radius 50%
      margin-right 10px
      margin-top 10px
      float left
    .userInfo
      cursor pointer
      .userInfo-name
        color $color-primary
.userInfo-dropdown
  list-style none
  margin 0
  width 110px
  p
    margin 0
  i
    display inline-block
    width 20px
    font-size 21px
    margin-right 1px
    // transform translateY(2.5px)
    text-align center
    vertical-align middle
  .user-box
    display flex
    padding 8px 0
    line-height 16px
    .avatar
      width 80px
      height 80px
      border-radius 5px
      vertical-align middle
      margin-right 12px
    .user-text
      text-align center
      flex 1
      .username
        font-size 18px
        line-height 22px
        font-weight 400
        margin-bottom 12px
        margin-top 4px
      .job
        margin-bottom 5px
  .item-between
    display flex
    justify-content space-between
    align-items center
    .el-badge
      transform translateY(5px)
// 续费提示
.reminder-box
  margin-top -10px
  line-height 26px
.title
  font-size 18px
  font-weight bold
  margin-bottom 10px
.reminder
  font-size 16px
  color #ff6600
  font-weight bold
</style>

<style lang="stylus">
.navbar
  .navbar-right
    .el-badge__content.is-fixed
      top 15px
      font-size 10px
      height 16px
      line-height 16px
      padding 0 6px
    .el-badge__content.is-dot
      height 6px
      width 6px
      padding 0
      right 0
      border-radius 50%
.userInfo-dropdown
  .el-dropdown-menu__item
    line-height 36px
</style>

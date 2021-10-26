<template>
  <div :class="sidebarCss">
    <el-aside class="sidebar-container" :width="sidebar.opened ? '180px' : '44px'">
      <!-- logo -->
      <div class="logo" :style="sidebar.opened ? { height: '90px' } : { height: '60px' }">
        <a href>
          <div v-if="sidebar.opened" class="picture-item" :style="{ backgroundImage: `url( ${logoUri} )` }"></div>
          <span v-else>iTK</span>
        </a>
      </div>

      <!-- 菜单列表 -->
      <el-menu
        class="sidebar-menu"
        router
        :default-active="this.$route.path"
        :collapse="!sidebar.opened"
        :collapse-transition="false"
        :show-timeout="200"
        unique-opened
        background-color="#272a36"
        text-color="#e7e7e7"
        active-text-color="#ff6600"
      >
        <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 100%;">
          <template v-for="group in menuList">
            <el-submenu :id="group.id" v-if="group.children && group.children.length > 0" :key="group.id" :index="group.id">
              <template slot="title">
                <i :class="group.icon"></i>
                <span slot="title">{{group.name}}</span>
              </template>
              <el-menu-item :id="menu.id" v-for="menu in group.children" :key="menu.id" :index="menu.url">
                <i class="icon iconfont icon-pointer" style="vertical-align: baseline;" />
                {{menu.name}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item :id="group.id" v-else :key="group.id" :index="group.url">
              <i :class="group.icon"></i>
              <span slot="title">{{group.name}}</span>
            </el-menu-item>
          </template>
        </el-scrollbar>

        <div class="bottom-menu" v-if="settingMenu != null && settingMenu.children.length > 0">
          <el-menu-item index="/basicInfo">
            <i class="el-icon-s-tools"></i>
            <span slot="title" id="basicSetting">基础设置</span>
          </el-menu-item>
        </div>
      </el-menu>

      <!-- 版本号 -->
      <p class="version">{{ sidebar.opened ? `桃李云帮 v${version}` : '桃李云帮' }}</p>
      <!-- 开关按钮 -->
      <i class="menu-opt-btn" :class="sidebar.opened ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'" @click.stop="$store.dispatch('toggleSideBar')" />
    </el-aside>
    <!-- 指引窗口 -->
    <div class="guide-box" v-if="guide.guideVisible">
      <!-- 左边占位 -->
      <div class="guide-left">
        <div class="guide-titel" ref="btnClick">
          <h4>快速上手桃李云帮</h4>
          <span>第{{guide.openText.one[0] }}步: {{ guide.openText.one[1] }}</span>
          <div class="open-arrows"></div>
        </div>
      </div>
      <!-- 右边引导图 -->
      <div class="guide-right">
        <div class="guide-right-open" ref="guideRightOpen">
          <h1 v-if="guide.openText.tow[0]">1、{{ guide.openText.tow[0] }}</h1>
          <h1 v-if="guide.openText.tow[1]">2、{{ guide.openText.tow[1] }}</h1>
          <img :src="guide.message[guide.index].url" alt="图片加载中" ondragstart="return false" />
          <div class="list-button">
            <el-button @click="openClose">{{ guide.buttonText }}</el-button>
            <el-button @click="skipGuide">跳过指引</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import logoUri from '@/assets/logo.png'

export default {
  name: 'Sidebar',
  data() {
    return {
      deviceAuth: process.env.VUE_APP_DEVICE_AUTH, // 是否启动设备权限检验功能
      sidebarCss: 'sidebar-container',
      accomplishGuide: true,
      guide: {
        openText: {
          one: ['一', '添加教室'],
          tow: ['点击[基础设置]>[教室管理]>[添加教室]进行教室添加']
        },
        index: 0,
        guideVisible: false,
        buttonText: '下一步',
        message: [
          {
            name: '基础设置',
            url: require('../../assets/guide/basicSetting.png'),
            path: '/basicInfo',
            openText: {
              one: ['一', '添加教室'],
              tow: ['点击[基础设置]>[教室管理]>[添加教室]进入页面进行教室添加']
            }
          },
          {
            name: '员工管理',
            url: require('../../assets/guide/staffManagement.png'),
            openText: {
              one: ['二', '新增员工'],
              tow: ['点击[行政管理]>[员工管理]>[新增员工]或[员工导入]进入页面进行员工信息的录入', '[员工导入]可批量导入员工信息,[新增员工]每次仅能增加单员工信息']
            }
          },
          {
            name: '课程管理',
            url: require('../../assets/guide/courseManagement.png'),
            openText: {
              one: ['三', '添加收费套餐'],
              tow: ['点击[教务管理]>[课程管理]>[收费套餐]>[添加收费套餐]进入页面设定收费套餐']
            }
          },
          {
            name: '班级管理',
            url: require('../../assets/guide/classManagement.png'),
            openText: {
              one: ['四', '添加班级'],
              tow: ['点击[教务管理]>[班级管理]>[添加班级]进入页面添加班级信息']
            }
          }
        ]
      },
      logoUri,
      version: process.env.VUE_APP_VERSION
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'menuList', 'settingMenu', 'organizationInfo'])
  },
  mounted() {
    this._findGuide()
    this._equipmentPermissions()
  },
  methods: {
    // 获取机构设备授权情况
    _equipmentPermissions() {
      if (Number(this.deviceAuth) === 1) {
        this.$http.get('/v1/DeviceAuth/getDeviceAuthById', { id: this.organizationInfo.id }).then((res) => {
          // 是否可以使用刷卡设备(0-否，1-是)
          let enableUseCardDevice = res.data.enableUseCardDevice
          sessionStorage.setItem('enableUseCardDevice', enableUseCardDevice)
          // 是否可以使用人脸设备(0-否，1-是)
          let enableUseFaceDevice = res.data.enableUseFaceDevice
          sessionStorage.setItem('enableUseFaceDevice', enableUseFaceDevice)
          // 是否可以使用打印设备(0-否，1-是)
          let enableUsePrintDevice = res.data.enableUsePrintDevice
          sessionStorage.setItem('enableUsePrintDevice', enableUsePrintDevice)
          // 是否开启刷卡课消(0-否，1-是)
          let enableCardCourseMinus = res.data.enableCardCourseMinus
          sessionStorage.setItem('enableCardCourseMinus', enableCardCourseMinus)
          // 是否开启人脸课消(0-否，1-是)
          let enableFaceCourseMinus = res.data.enableFaceCourseMinus
          sessionStorage.setItem('enableFaceCourseMinus', enableFaceCourseMinus)
        })
      } else {
        sessionStorage.setItem('enableUseCardDevice', 1)
        sessionStorage.setItem('enableUseFaceDevice', 1)
        sessionStorage.setItem('enableUsePrintDevice', 1)
        sessionStorage.setItem('enableCardCourseMinus', 1)
        sessionStorage.setItem('enableFaceCourseMinus', 1)
      }
    },
    // 初次加载指引
    _findGuide() {
      // 判断是否是管理员&&是否已进行过指引
      if (
        this.$store.state.user.userInfo.roles[0].name === 'admin' &&
        !localStorage.getItem('guidance')
      ) {
        this.guide.guideVisible = true
        this.sidebarCss = 'sidebar'
        if (this.guide.index === 0) {
          this.currentPath = '/basicInfo'
          this.$router.replace('/basicInfo')
        }
        if (this.guide.index > 0) {
          this.$nextTick(() => {
            // 查找指引元素
            let guideTarget = this.getMenuId(
              this.menuList,
              this.guide.message[this.guide.index].name
            )
            // 找到时做处理
            if (guideTarget.id) {
              this.$router.replace(guideTarget.url)
              this.$nextTick(() => {
                setTimeout(() => {
                  this.$refs.guideRightOpen.style.right = 140 + 'px'
                  this.$refs.guideRightOpen.style.top = 40 + 'px'
                  this.$refs.btnClick.style.top =
                    document
                      .getElementById(guideTarget.id)
                      .getBoundingClientRect().top -
                    180 +
                    'px'
                }, 300)
              })
            }
          })
        }
      }
    },
    // 查找对应元素
    getMenuId(menuList, menuName) {
      for (let i = 0; i < menuList.length; i++) {
        if (menuList[i].name === menuName) {
          return menuList[i]
        }
        if (menuList[i].children.length > 0) {
          let result = this.getMenuId(menuList[i].children, menuName)
          if (result) {
            return result
          }
        }
      }
    },
    // 下一步
    openClose() {
      if (this.guide.index < this.guide.message.length - 1) {
        this.guide.openText = this.guide.message[this.guide.index + 1].openText
        this.guide.index++
        if (this.guide.index === this.guide.message.length - 1) {
          this.guide.buttonText = '开始使用'
        }
        this._findGuide()
      } else {
        this.skipGuide()
      }
    },
    // 跳过指引
    skipGuide() {
      this.sidebarCss = 'sidebar-container'
      // 本地存储已浏览或者跳过指引
      let guidance = this.accomplishGuide
      this.guide.guideVisible = false
      this.$nextTick(() => {
        localStorage.setItem('guidance', guidance)
        this.$store.commit('setlocalStorageSidebar', true)
        // this.currentPath = '/dashboard'
        this.$router.replace('/dashboard')
      })
    }
  }
}
</script>

<style scoped lang="stylus">
.sidebar
  display flex
.guide-box
  position absolute
  left 0
  z-index 3300
  width 100%
  min-width 1200px
  height 100%
  overflow-y auto
  display flex
  .guide-left
    width 180px
    height 100%
    z-index 2222
    .guide-titel
      width 400px
      height 200px
      position absolute
      bottom 20px
      left 120px
      right calc(100% - 181px)
      z-index 3001
      border-radius 50%
      border 5px solid $color-primary
      line-height 50px
      text-align center
      color #000
      font-size 24px
      background-color #ffffff
      transition 1s
      span
        font-size 24px
      .open-arrows
        position absolute
        top 155px
        left -22px
        width 0
        height 0
        border-top 10px solid rgba(0, 0, 0, 0)
        border-left transparent
        border-bottom 10px solid rgba(255, 255, 255, 0)
        border-right 50px solid $color-primary
        transform rotate(-45deg)
  .guide-right
    background-color rgba(0, 0, 0, 0.5)
    width calc(100% - 181px)
    height 100%
    position relative
    overflow-y auto
    .guide-right-open
      transition 1s
      width 500px
      height 520px
      border-radius 15px
      position absolute
      right calc(100vw - 1150px)
      img
        width 500px
        object-fit cover
        border-bottom 2px solid #fff
        padding-bottom 10px
      h1
        margin-bottom 0
        padding-left 10px
        line-height 33px
        color #fff
      .list-button
        margin-left 50%
        transform translate(-50%)
        width 400px
        height 60px
        display flex
        justify-content space-between
        background-image url(../../assets/guide/guideBg.png)
        background-size 100% 100%
        .el-button
          width 120px
          margin-top 5px
          margin-right 45px
          margin-left 20px
          font-size 24px
          border transparent
          border-radius 5px
          background-color transparent
          color #fff
          &:hover
            color $color-primary
.icon-size
  font-size 18px
.sidebar-container
  height 100vh
  position relative
  background #272a36
  overflow visible
  transition width 0.28s
.logo
  z-index 4
  text-align center
  background-color #606266
  align-items center
  justify-content center
  display flex
  .picture-item
    width 160px
    height 35px
    background-size cover
    background-position center
    background-repeat no-repeat
  a
    font-size 24px
    color #ffffff
  img
    height 36px
    width auto
    margin-left 2px
    margin-top 5px
.version
  position absolute
  bottom 8px
  left 0
  width 100%
  font-size 10px
  color darken(#ffffff, 50)
  text-align center
.menu-opt-btn
  background #272a36
  width 20px
  height 40px
  line-height 40px
  border-top-right-radius 40px
  border-bottom-right-radius 40px
  text-align right
  box-sizing border-box
  padding-right 6px
  position absolute
  top 50%
  right 0
  transform translate(99%, -50%)
  color #ffffff
  font-size 14px
  cursor pointer
  z-index 99
</style>

<style lang="stylus">
/* sidebar Menu */
.sidebar-container
  .sidebar-menu
    letter-spacing 1px
    z-index 4
    height calc(100% - 160px)
    &>li
      margin-bottom 8px
  .el-menu
    border-right none
    background none !important
  .el-submenu__title, .el-menu-item
    background none !important
    margin 0
    padding 0 6px !important
    height auto
    height 42px
    line-height 42px
    box-sizing border-box
    i
      color #f7f7f7
    &:hover
      background none
  .el-menu-item
    &:hover, &:focus
      background none
      color #ff6600 !important
  .el-submenu
    &:hover, &:focus
      &>.el-submenu__title
        background none
    .el-menu-item
      padding-left 24px !important
      min-width 100px
      height 38px
      line-height 38px
      &:hover, &:focus
        background none
    &.is-opened
      background #1c1e26
  .el-submenu.is-active
    &>.el-submenu__title
      color #ff6600 !important
      background none
      i
        color #ff6600
  .el-menu-item.is-active
    i
      color #ff6600
  .el-submenu__icon-arrow
    font-size 14px
    color #e6e6e6 !important
    width auto
    right 12px
  // 折叠后的菜单
  .el-menu--collapse
    width 44px
    .el-menu-item
      margin-left 0
      margin-right 0
      text-align center
      height 34px
      text-align center
      .el-tooltip
        padding 0 !important
        line-height 34px
    .el-menu-item [class^=el-icon-], .el-submenu [class^=el-icon-]
      margin-right 0
    .el-submenu
      .el-submenu__title
        text-align center
      span, .el-submenu__icon-arrow
        display none
.el-menu--vertical .el-menu--popup .el-menu-item
  height 40px
  line-height 40px
  &:hover, &:focus
    background none
    color #ff6600 !important
</style>

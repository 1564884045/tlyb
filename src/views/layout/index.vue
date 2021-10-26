<template>
  <el-container class="main" :class="{'chrome-tip' : !_isChrome()}">
    <!-- 侧边栏菜单 -->
    <sidebar></sidebar>
    <el-container direction="vertical" v-if="localStorageSidebar">
      <!-- 顶部导航栏 -->
      <navbar></navbar>
      <!-- 内容区域 -->
      <el-main class="main-container">
        <el-scrollbar wrap-class="scrollbar-wrapper main-scrollbar-wrapper" style="height: 100%;">
          <!-- <transition name="fade-transform" mode="out-in"> -->
          <keep-alive :include="cachedRoutes" :max="5 ">
            <router-view :key="key" />
          </keep-alive>
          <!-- </transition> -->
        </el-scrollbar>
        <div class="quick-function" ref="quickFunction">
          <div class="box">
            <div class="box-top">
              <div class="btn" v-on:click="handleSignClick(0)">
              <i class="el-icon-time">&nbsp;快速打卡</i>
              </div>
              <div class="btn" v-on:click="handleSignClick(1)">
                <i class="el-icon-finished">&nbsp;快速课消</i>
              </div>
            </div>
            <div class="btn-box" @click="popupQuickMenu">
              <i v-show="!popupQuickMenuOpen" class="el-icon-d-arrow-left"></i>
              <i v-show="popupQuickMenuOpen" class="el-icon-d-arrow-right"></i>
            </div>
          </div>
        </div>
      </el-main>
      <!-- <el-footer height="50px">Footer</el-footer> -->
    </el-container>
    <global-dialog />
    <!-- 快速考勤弹出框 -->
    <el-dialog title="刷卡快速签到" :show-close="false" custom-class="custom-dialog" :visible.sync="signDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" center width="400px">
      <div class="sign-container">
        <img class="logo" :src="signCardLogo" />
        <p class="title">注意事项及使用说明</p>
        <ul>
          <li>1. 只有打开系统且打开此窗口时有效，其他任何情况皆识别无效;</li>
          <li>2. 在关闭此窗口后，快速刷卡打卡识别将无效；</li>
          <li>3. 在刷卡过程中切勿在键盘做任何操作，以免影响系统读取卡数据导致刷卡失败；</li>
          <li>4. 同时支持员工和学员刷卡；</li>
          <li class="info">5. 先将卡贴合到刷卡机刷卡处；</li>
          <li class="info">6. 系统读取到卡号会自动进行打卡操作；</li>
          <li class="info">7. 使用完毕后点击窗口右上角的关闭按钮即可；</li>
        </ul>
        <el-button type="primary" @click="signDialogVisible = false">关闭窗口</el-button>
      </div>
    </el-dialog>
    <!-- 快速课消弹出框 -->
    <el-dialog title="刷卡快速课消" :show-close="false" custom-class="custom-dialog" :visible.sync="deductClasshourDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" center width="400px">
      <div class="sign-container">
        <img class="logo" :src="courseCardAction" />
        <p class="title">注意事项及使用说明</p>
        <ul>
          <li>1. 刷卡后仅会扣除当天课程课时，且下课时间需在刷卡时间之前；</li>
          <li>2. 若当天有多门课程下课时间在刷卡时间之前，将优先扣除下课时间最早的课程课时；</li>
          <li class="info">3. 只有打开系统且打开此窗口时有效，其他任何情况皆识别无效;</li>
          <li class="info">4. 在关闭此窗口后，快速刷卡消课识别将无效；</li>
          <li class="info">5. 在刷卡过程中切勿在键盘做任何操作，以免影响系统读取卡数据导致刷卡失败；</li>
        </ul>
      <el-button type="primary" @click="deductClasshourDialogVisible = false">关闭窗口</el-button>
      </div>
    </el-dialog>
    <audio ref="audio" v-show="false" src="../../assets/clock_in_success.mp3" controls="controls"></audio>
    <audio ref="audio1" v-show="false" src="../../assets/clock_in_fail.mp3" controls="controls"></audio>
    <audio ref="audio2" v-show="false" src="../../assets/reduce_course_time.mp3" controls="controls"></audio>
    <audio ref="audio3" v-show="false" src="../../assets/course_time.mp3" controls="controls"></audio>
    <audio ref="audio4" v-show="false" src="../../assets/repetition_reduce_course.mp3" controls="controls"></audio>
  </el-container>
</template>

<script>
import Sidebar from './sidebar'
import Navbar from './navbar'
import GlobalDialog from './GlobalDialog'

import { mapGetters } from 'vuex'
import { constantRouterMap } from '../../router'

import SignCardLogo from '../../assets/sign-card-logo.png'
import CourseCardAction from '../../assets/course_card_action.png'

export default {
  name: 'Layout',
  components: {
    Sidebar,
    Navbar,
    GlobalDialog
  },
  data() {
    return {
      popupQuickMenuOpen: false,
      signCardLogo: SignCardLogo,
      courseCardAction: CourseCardAction,
      signDialogVisible: false,
      deductClasshourDialogVisible: false,
      icCardNo: '',
      checkTime: []
    }
  },
  created() {
    this.globalKeyEvent()
  },
  computed: {
    cachedRoutes() {
      const res = []
      constantRouterMap.forEach((item) => {
        if (item.children) {
          item.children.forEach((route) => {
            if (route.meta.keepAlive) res.push(route.name)
          })
        }
      })
      return res
    },
    key() {
      return this.$route.fullPath
    },
    ...mapGetters([
      'sidebar',
      'currentBranch',
      'organizationInfo',
      'localStorageSidebar'
    ])
  },
  methods: {
    // 判断当前是否是chrome浏览器
    _isChrome() {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf('Chrome') > -1) {
        // 判断是否Chrome浏览器
        return true
      } else {
        return false
      }
    },
    // 快速打卡方法
    handleSignClick(item) {
      if (Number(sessionStorage.getItem('enableUseCardDevice'))) {
        this.popupQuickMenu()
        this.icCardNo = ''
        switch (item) {
          case 0:
            this.signDialogVisible = true
            break
          default:
            this.deductClasshourDialogVisible = true
        }
      } else {
        this.$message({
          message: '刷卡设备未授权',
          type: 'warning'
        })
      }
    },
    // 全局捕获刷卡输入方法
    globalKeyEvent() {
      document.onkeydown = (e) => {
        if (this.signDialogVisible || this.deductClasshourDialogVisible) {
          if ('0123456789'.indexOf(e.key) >= 0) {
            this.icCardNo += e.key
          }
          if (window.event.keyCode === 13) {
            if (this.deductClasshourDialogVisible) {
              this.handleDeductClasshour()
            }
            if (this.signDialogVisible) {
              this.handleSignAction()
            }
          }
        }
      }
    },
    // 快速课消
    handleDeductClasshour() {
      if (
        !this.icCardNo ||
        this.icCardNo.length < 10 ||
        this.icCardNo.length > 32
      ) {
        this.$message.warning('无效卡号')
        return
      } else {
        const param = {
          icCardNo: this.icCardNo,
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id
        }
        if (sessionStorage.getItem('courseTime')) {
          if (
            new Date().getTime() - sessionStorage.getItem('courseTime') <
            3000
          ) {
            this.$notify({
              title: '课消失败',
              message: '3秒内无法再次刷卡课消',
              type: 'warning'
            })
            this.$refs.audio4.play()
            this.icCardNo = ''
            return
          }
        }
        // 课消
        this.courseReduce(param)
      }
      this.icCardNo = ''
    },
    courseReduce(param) {
      this.$http
        .get('/v1/AutoMinusCourse/minusCourseAction', param)
        .then((res) => {
          const msg = `<p>学员【<label style="color:#ff6600;">${
            res.data.studentName
          }</label>】课时扣除成功</p><p>课程名称：${res.data.courseName}</p><p>扣除课时:${res.data.classHour}</p><p>上课老师:【<label style="color:#ff6600;">${res.data.teacherName}</label>】</p><p>上课时间:${
            res.data.goToClassStartTime.slice(0, 5) + '~~' + res.data.goToClassEndTime.slice(0, 5)
          }</p>`
          const typ = res.data.classHour ? 'success' : 'warning'
          if (res.data.classHour) {
            this.$refs.audio2.play()
          } else {
            this.$refs.audio3.play()
          }
          this.$notify({
            title: '快速课消成功',
            dangerouslyUseHTMLString: true,
            type: typ,
            message: msg,
            duration: 5000
          })
        }).finally(() => {
          sessionStorage.setItem('courseTime', new Date().getTime())
        })
    },
    // 快速签到方法
    handleSignAction() {
      if (
        !this.icCardNo ||
        this.icCardNo.length < 10 ||
        this.icCardNo.length > 32
      ) {
        this.$message.warning('无效卡号')
        return
      } else {
        const param = {
          // deviceId: this.icCardNo,
          icCardNo: this.icCardNo,
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id
        }
        if (sessionStorage.getItem('checkTime')) {
          let sessionStorageCheckTime = JSON.parse(
            sessionStorage.getItem('checkTime')
          )
          for (let j = 0; j < sessionStorageCheckTime.length; j++) {
            if (
              sessionStorageCheckTime[j].icCardNo === param.icCardNo &&
              new Date().getTime() - sessionStorageCheckTime[j].time < 300000
            ) {
              this.$notify({
                title: '请勿重复打卡',
                message: '同一学员五分钟内无法再次打卡',
                type: 'warning'
              })
              this.$refs.audio1.play()
              this.icCardNo = ''
              return
            }
          }
        }
        // 打卡
        this.signIn(param)
      }
      this.icCardNo = ''
    },
    signIn(param) {
      this.$http.post('/v1/IcCard/quickAddPunchRecord', param).then((res) => {
        // this.$http.post('/v1/StudentPunchRecord/quickAddStudentPunchRecord', param).then(res => {
        let type = ''
        switch (res.data.type) {
          case 0:
            type = '到校打卡'
            break
          case 1:
            type = '普通打卡'
            break
          case 2:
            type = '离校打卡'
            break
          default:
            type = '到校打卡'
            break
        }
        const msg = `<p>${
          res.data.cardType === 0 ? '用户' : '学员'
        }【<label style="color:#ff6600;">${
          res.data.targetName
        }</label>】打卡成功</p><p>打卡类型：${type}</p><p>打卡时间：${
          res.data.punchDate
        }</p>`
        this.$notify({
          title: '签到成功',
          dangerouslyUseHTMLString: true,
          type: 'success',
          message: msg,
          duration: 5000
        })
        this.$refs.audio.play()
        if (this.checkTime.length) {
          for (let i = 0; i < this.checkTime.length; i++) {
            if (this.checkTime[i].icCardNo === param.icCardNo) {
              this.checkTime[i].time = new Date().getTime()
              break
            }
          }
        }
        this.checkTime.push({
          icCardNo: param.icCardNo,
          time: new Date().getTime()
        })
        sessionStorage.setItem('checkTime', JSON.stringify(this.checkTime))
        this.icCardNo = ''
      })
    },
    // 快捷打卡窗口
    popupQuickMenu() {
      this.$refs.quickFunction.style.right = this.popupQuickMenuOpen ? '-102px' : '-10px'
      this.popupQuickMenuOpen = !this.popupQuickMenuOpen
    }
  },
  watch: {
    // signDialogVisible() {
    //   if (this.signDialogVisible) {
    //     this.$nextTick(() => {
    //       this.$refs.bindICCardFormInput.focus()
    //     })
    //   }
    // }
  }
}
</script>

<style scoped lang="stylus">
.main
  height 100vh
.chrome-tip
  height calc(100vh - 48px)
.main-container
  // position relative
  padding 0
  overflow hidden
  .quick-function
    position fixed
    top calc(100vh / 2 - 100px)
    right -102px
    z-index 2001
    transition 0.5s
    box-shadow -3px 3px 6px $color-primary, -3px -3px 6px $color-primary
    .box
      position relative
      .box-top
        // border-radius 15px 0 0 15px
        padding 1px 10px
        background-color rgb(39,42,54)
        position relative
        border-left transparent
        z-index 2001
    .btn
      width 80px
      background-color $color-primary
      border 1px solid $color-primary
      border-top-left-radius 8px
      border-bottom-left-radius 8px
      margin 15px 0
      position relative
      z-index 2001
      cursor pointer
      i
        width 100%
        line-height 25px
        color #ffffff
        font-size 13px
        text-align center
    .btn-box
      width 40px
      height 40px
      background-color rgb(39,42,54)
      border-radius 50px
      position absolute
      z-index 2000
      left -20px
      top 28px
      cursor pointer
      color $color-primary
      line-height 40px
      font-size 20px
      box-shadow -3px 3px 6px $color-primary, -3px -3px 6px $color-primary
      i
        margin-left 4px
.el-main
  .main-wrapper
    padding 15px
    background #fff
    border-radius 5px
    min-height 100%
    box-sizing border-box
.el-footer
  background-color #B3C0D1
  color #333
  line-height 50px
.sign-container
  width 300px
  margin 0 auto
  overflow hidden
  .el-button
    margin-top 15px
    margin-left 110px
  .logo
    width 160px
    height auto
    margin-left 70px
    margin-bottom 15px
  .title
    width 100%
    text-align center
    font-size 17px
    margin-bottom 5px
  ul
    .info
      color #999999
      text-decoration none
    li
      color #ff6600
      margin-bottom 5px
      text-decoration none
/* fade-transform */
.fade-transform-leave-active, .fade-transform-enter-active
  transition all 30s
.fade-transform-enter
  opacity 0
  transform translateX(-30px)
.fade-transform-leave-to
  opacity 0
  transform translateX(30px)
</style>

<style lang="stylus">
.main-container
  .main-scrollbar-wrapper
    padding 12px
    box-sizing border-box
</style>

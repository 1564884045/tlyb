<template>
  <div class="login-wrapper" :class="{'chrome-tip' : !_isChrome()}">
    <p v-if="systemNotice" :style="{backgroundColor: systemNotice.backgroundColor, color: systemNotice.textColor}" class="system-notice">{{systemNotice.content}}</p>
    <div class="login-main">
      <img class="guide-img" src="../assets/login_left_img.png" />
      <p class="divider">全能校务管理平台</p>
      <div class="login-form">
        <img class="logo" src="../assets/logo.png" />
        <ul class="tab-nav">
          <li :class="{active: currentTab === 0}" @click="handleTabChange(0)">密码登录</li>
          <li :class="{active: currentTab === 1}" @click="handleTabChange(1)">验证码登录</li>
        </ul>

        <el-form ref="loginForm" :model="loginForm" :rules="rules" size="medium">
          <!-- <el-form-item prop="phone">
            <el-col :span="4">
              <el-select v-model="currentAreaCode" filterable placeholder="请选择">
                <el-option
                  v-for="item in phoneAreaCodeArr"
                  :key="item.id"
                  :label="item.areaCode"
                  :value="item.areaCode">
                  <span style="float: left">{{ item.areaCode }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.countryName }}</span>
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="20" style="margin-top: 1px">
              <el-input v-model.trim="loginForm.phone" :maxlength="11" type="tel" placeholder="请填写您的手机号码" role="name" autocomplete :autofocus="true" tabindex="1">
                <i slot="prepend" class="icon iconfont icon-user" />
              </el-input>
            </el-col>
          </el-form-item> -->

          <el-form-item prop="phone">
            <div class="user-phone">
              <span class="icon iconfont icon-user" :class="lineColor === 0 ? 'icon-user' : (lineColor === 1 ? 'icon-user-suceess' : 'icon-user-err') "></span>
              <el-select v-model="currentAreaCode" filterable placeholder="请选择">
                <el-option
                  v-for="item in phoneAreaCodeArr"
                  :key="item.id"
                  :label="item.areaCode"
                  :value="item.areaCode">
                  <span style="float: left">{{ item.areaCode }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.countryName }}</span>
                </el-option>
              </el-select>
              <el-input v-model.trim="loginForm.phone" :maxlength="11" type="tel" placeholder="请填写您的手机号码" @blur="handlePhoneblur" role="name" autocomplete :autofocus="true" tabindex="1">
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="password" v-if="currentTab === 0">
            <el-input
              v-model.trim="loginForm.password"
              @keyup.enter.native="submitLogin"
              :type="showPassword ? 'text' : 'password'"
              placeholder="6-20位字符，包含字母、数字"
              minlength="6"
              maxlength="20"
              tabindex="2"
            >
              <i slot="prepend" class="icon iconfont icon-password" />
              <el-button slot="append" @click="showPassword = !showPassword" :icon="`icon iconfont ${showPassword ? 'icon-pwd-show' : 'icon-pwd-hide'}`" class="eye-btn"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item class="rpriddler-box" prop="smsCode" v-if="currentTab === 1">
            <el-input v-model.trim="loginForm.smsCode" @keyup.enter.native="submitLogin(0)" placeholder="请填写短信验证码" maxlength="6" autocomplete="off" tabindex="4">
              <i slot="prepend" class="icon iconfont icon-validate-code" />
              <el-button slot="append" type="text" size="mini" class="sms-btn" @click="getSmsCode" :disabled="loadingSms || count < 60">{{countMsg}}</el-button>
            </el-input>
            <Ypriddler v-if="ypRiddlerVisible && currentTab === 1" class="rpriddler" @open="getSmsCode" :toMode="toMode" style="margin-bottom:18px;" @toFatherData="sendSonData"></Ypriddler>
          </el-form-item>
          <el-form-item size="mini" class="tip-form-item">
            <!-- <el-checkbox v-model="loginForm.autoForm" tabindex="5">三天内自动登录</el-checkbox> -->
            <div class="tip">
              <el-checkbox v-model="loginForm.angree" />
              <span @click.stop="loginForm.angree != loginForm.angree">
                已阅读并同意
                <a @click="showPolicy = true" class="link">《用户使用协议》</a>
              </span>
            </div>
            <router-link class="link" to="/forgetPassword" style="float: right; font-size: 12px;">忘记密码?</router-link>
          </el-form-item>
          <el-form-item class="login-btn">
            <el-button type="primary" @click="submitLogin()" :loading="loadingSubmit" tabindex="6">登&emsp;录</el-button>
            <router-link to="/register" replace>机构入驻，注册机构账号</router-link>
            <Ypriddler v-if="ypRiddlerVisible && currentTab === 0" class="rpriddler" @open="ypRiddlerData" :toMode="toMode" style="margin-bottom:18px;" @toFatherData="sendSonData"></Ypriddler>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 版本号 -->
    <p class="version">
      © 贵州中测信息科技有限公司 &nbsp;&nbsp;&nbsp;
      {{ `桃李云帮 v${version}` }}
    </p>

    <el-dialog :visible.sync="showPolicy" title="用户使用协议" :close-on-click-modal="false" center top="8vh" class="plicy-dialog">
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 64vh;">
        <iframe ref="policyFrame" src="http://policy.tlybond.com/" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="100%" :height="policyFrameHeight"></iframe>
      </el-scrollbar>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showPolicy = false" type="primary">已阅读</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { phoneValidator, passwordValidator } from '@/utils/validate'
import Cookie from 'js-cookie'
// import path from 'path'
import Ypriddler from '../components/YpRiddler.vue'
import { PhoneAreaCode } from '@/utils/storage'
// import { SystemAuthInfo } from '@/utils/user'

export default {
  name: 'Login',
  data() {
    return {
      toMode: 'flat',
      ypRiddlerVisible: false,
      passVerify: false, // 验证是否通过
      loadingSubmit: false,
      loadingSms: false,
      currentTab: 0,
      showPassword: false,
      showPolicy: false,
      policyFrameHeight: '1000px',
      count: 60,
      systemNotice: null,
      phoneAreaCodeArr: [],
      currentAreaCode: '+86',
      loginForm: {
        phone: '',
        password: '',
        smsCode: '',
        autoLogin: false,
        angree: true,
        yunpianToken: '',
        yunpianAuthenticate: ''
      },
      rules: {
        phone: [
          { required: true, message: '请填写手机号码', trigger: 'blur' },
          { validator: phoneValidator, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { validator: passwordValidator, trigger: 'blur' }
        ],
        smsCode: [
          { required: true, message: '请填写短信验证码', trigger: 'blur' },
          { len: 6, message: '短信验证码的长度是6位', trigger: 'blur' }
        ]
      },
      version: process.env.VUE_APP_VERSION,
      lineColor: 0
    }
  },
  components: {
    Ypriddler
  },
  watch: {
    currentAreaCode(val) {
      let currentArea = this.phoneAreaCodeArr.filter(item => {
        return item.areaCode === val
      })
      PhoneAreaCode.setCurrentValidate(currentArea[0].regularExpression)
    }
  },
  computed: {
    countMsg() {
      if (this.loadingSms) {
        return '正在获取验证码'
      }
      if (this.count >= 60) {
        return '获取短信验证码'
      }
      return `重新获取(${this.count}s)`
    },
    isPhoneClient() {
      return (
        /phone|Android|webOS|iPhone|iPod|BlackBerry|iPad/i.test(
          navigator.userAgent
        ) && window.innerWidth < 1024
      )
    }
  },
  created() {
    window.addEventListener('message', (event) => {
      if (event.origin === 'http://policy.tlybond.com') {
        this.policyFrameHeight = event.data
      }
    })
    this._initSystemNotice()
    this._initPhoneAreaCode()
  },
  mounted() {
    if (this.isPhoneClient) {
      this.$message('请使用电脑登录系统，体验更佳！')
    }
    // 显示提示
    const msg = sessionStorage.getItem('iTK_noAuth')
    if (msg) {
      this.$message.error(msg)
      sessionStorage.removeItem('iTK_noAuth')
    }
    // this.ypRiddlerVisible = false
    // this.passVerify = false
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    ypRiddlerData(item) {
      this.ypRiddlerVisible = false
      this.loginForm.yunpianToken = item.token
      this.loginForm.yunpianAuthenticate = item.authenticate
      this.submitLogin()
    },
    // 接收子组件传来的数据
    sendSonData(data) {
      this.passVerify = data
    },
    handleTabChange(index) {
      if (this.currentTab !== index) {
        this.ypRiddlerVisible = false
        this.currentTab = index
      }
    },
    // 获取验证码
    getSmsCode(item) {
      if (item.token) {
        this.ypRiddlerData(item)
      }
      if (this.loadingSms) return
      if (this.count < 60) return
      // eslint-disable-next-line no-eval
      if (!eval(PhoneAreaCode.getCurrentValidate()).test(this.loginForm.phone)) {
        this.$message.error('请填写正确的手机号')
        return
      }
      if (!this.loginForm.yunpianToken) {
        this.ypRiddlerVisible = true
        return
      }
      if (!this.passVerify) {
        this.$message.error('请验证通过后再请求验证码')
        this.ypRiddlerVisible = true
        return
      }
      this.loadingSms = true
      this.$http
        .get('/api/Yunpian/sendSmsVerification', {
          phone: this.loginForm.phone,
          phoneAreaCode: this.currentAreaCode,
          yunpianToken: this.loginForm.yunpianToken,
          yunpianAuthenticate: this.loginForm.yunpianAuthenticate
        })
        .then(() => {
          this.$message.success('发送验证码成功！')
          this.startCountDown()
        })
        .catch(() => {
          this.ypRiddlerVisible = true
          this.passVerify = false // 验证是否通过
          this.loginForm.yunpianToken = ''
          this.loginForm.yunpianAuthenticate = ''
        })
        .finally(() => {
          this.loadingSms = false
        })
    },
    startCountDown() {
      this.count--
      this.timer = setInterval(() => {
        if (this.count > 0) {
          this.count--
        } else {
          this.count = 60
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    submitLogin(val) {
      if (this.isPhoneClient) {
        this.$message('请使用电脑登录系统，体验更佳！')
        return
      }
      if (this.currentTab === val) return
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          if (this.currentTab === 0) {
            if (!this.loginForm.yunpianToken) {
              this.ypRiddlerVisible = true
              return
            }
            if (!this.passVerify) {
              this.$message.error('请通过验证后再登录')
              this.ypRiddlerVisible = true
              return
            }
          }
          if (!this.loginForm.angree) {
            this.$message.warning('请阅读并同意《用户使用协议》')
            return
          }
          this.loadingSubmit = true
          const params = {
            phone: this.loginForm.phone,
            phoneAreaCode: this.currentAreaCode,
            type: this.currentTab
          }
          if (params.type === 0) {
            params.password = this.loginForm.password
            params.yunpianToken = this.loginForm.yunpianToken
            params.yunpianAuthenticate = this.loginForm.yunpianAuthenticate
          } else {
            params.smsCode = this.loginForm.smsCode
          }
          this.$http
            .post('/user/login', null, {
              params
            })
            .then((res) => {
              // 设置初始信息
              this.$store.dispatch('setInitInfo', res.data)
              // 存储机构购买的系统版本信息
              // SystemAuthInfo.set(res.data.systemAuthInfo)
              // 设置cookie
              Cookie.set('auth_token', res.data.token)
              const redirect = this.$route.query && this.$route.query.redirect
              this.$router.push({
                path: redirect || '/'
              })
            })
            .catch((err) => {
              if (err.code === '10001') {
                this.ypRiddlerVisible = true
              }
              this.passVerify = false // 验证是否通过
              this.loginForm.yunpianToken = ''
              this.loginForm.token = ''
            })
            .finally(() => {
              this.loadingSubmit = false
            })
        }
      })
    },
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
    _initSystemNotice() {
      this.$http.get('/api/systemNotice').then((res) => {
        this.systemNotice = res.data
      })
    },
    _initPhoneAreaCode() {
      this.phoneAreaCodeArr = PhoneAreaCode.get()
    },
    handlePhoneblur() {
      // eslint-disable-next-line no-eval
      if (eval(PhoneAreaCode.getCurrentValidate()).test(this.loginForm.phone)) {
        this.lineColor = 1
      } else {
        this.lineColor = 2
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.system-notice
  width 100%
  height 48px
  text-align center
  line-height 48px
.login-wrapper
  height 100vh
  background-image url('../assets/login_bg.jpg')
  background-size 100% 100%
  background-repeat no-repeat
  min-width 1200px
  min-height 600px
.chrome-tip
  height calc(100vh - 48px)
.login-main
  display flex
  justify-content space-between
  align-items center
  width 72%
  margin 0 auto
  padding-top 16vh
  .guide-img
    width 38%
  .divider
    writing-mode vertical-lr
    color #f2a24a
    position relative
    letter-spacing 3px
    &:before, &:after
      width 1px
      height 60%
      background #f8a244
      content ''
      display block
      position absolute
      left 50%
    &:before
      top 0
      transform translate(0, -130%)
    &:after
      bottom 0
      transform translate(0, 130%)
  .login-form
    width 38%
  .el-form
    max-width 480px
    margin 0 auto
.logo
  margin 0 auto
  display block
  height 60px
  margin-bottom 40px
.tab-nav
  color $color-text-3
  display flex
  justify-content center
  font-size 18px
  margin-bottom 20px
  li
    position relative
    padding 0 18px
    cursor pointer
    height 36px
    line-height 36px
    &+li:before
      width 1px
      height 14px
      background #bfbfbf
      content ''
      display block
      position absolute
      left 0
      top 50%
      transform translateY(-50%)
  .active
    color $color-primary
    &:after
      width 40%
      height 2px
      background $color-primary
      position absolute
      bottom 0
      left 50%
      transform translateX(-50%)
      content ''
      display block
      border-radius 4px
.login-btn
  position relative
  .rpriddler
    position absolute
    bottom -100%
  margin 50px 12% 0
  .el-button
    width 100%
  a
    color $color-primary
    display inline
    font-size 13px
    margin-top 12px
.tip-form-item
  padding 0 6px
  line-height 1.1
.tip
  font-size 12px
  margin-left 6px
  float left
.version
  text-align center
  color #666
  font-size 12px
  position fixed
  bottom 10px
  width 100%
.rpriddler-box
  position relative
  .rpriddler
    position absolute
    z-index 100
.user-phone
  display flex
  justify-content center
  align-items center
  .icon-user
    padding 0 8px 1px 8px
    font-size 22px
    color #D7DEE3
    border-bottom 1px solid #DCDFE6
  .icon-user-suceess
    border-bottom 1px solid #67C23A
  .icon-user-err
    border-bottom 1px solid #F56C6C
  .el-select
    width 90px
    display inline-block
    // padding-right 10px
  // .el-input
  //   flex 1
</style>

<style lang="stylus">
.login-main
  .el-input
    border-bottom 1px solid #DCDFE6
  .is-error .el-input
    border-color $color-danger
  .is-success .el-input
    border-color $color-success
  .el-input-group__prepend
    background none
    border none
    padding-left 6px
    padding-right 12px
    font-size 24px
    color #d7dee3
  .el-input-group__append
    background none
    border none
    padding-right 6px
    padding-left 12px
    font-size 21px
    .el-button--text
      font-size 14px
      color $color-primary
      &.is-disabled
        color $color-info
  .el-input__inner
    border none
    background none
    padding 0 6px
    font-size 16px
  .el-checkbox
    margin-right 12px
  .el-checkbox__label
    font-size 12px
  .el-form-item--mini .el-form-item__content
    line-height 1.1
</style>

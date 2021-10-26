<template>
  <div class="forget-passowrd-wrapper">
    <header class="forget-passowrd-header">
      <img class="logo" src="@/assets/logo.png" alt="桃李云帮" />
      <p class="title">忘记密码</p>
    </header>
    <main class="forget-passowrd-main">
      <!-- <div class="forget-passowrd-thumb">
        <img src="@/assets/login_left_img.png" alt="桃李云帮介绍">
      </div>-->
      <el-form class="forget-passowrd-form" ref="forgetPassowrdForm" :model="forgetPassowrdForm" :rules="rules" size="medium">
        <el-form-item prop="phone">
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
          <el-col :span="1" style="height: 1px">{{''}}</el-col>
          <el-col :span="19">
            <el-input v-model="forgetPassowrdForm.phone" placeholder="请填写您的手机号码" autocomplete :autofocus="true" tabindex="1"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="forgetPassowrdForm.password" :type="showPassword ? 'text' : 'password'" placeholder="请填写新密码（6-20位字符，包含字母、数字）" minlength="6" maxlength="20" tabindex="2">
            <el-button slot="append" @click="showPassword = !showPassword" :icon="`icon iconfont ${showPassword ? 'icon-pwd-show' : 'icon-pwd-hide'}`" class="eye-btn"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item class="rpriddler-box" prop="smsCode">
          <Ypriddler @open="getSmsCode" :toMode="toMode" v-if="ypRiddlerVisible" class="rpriddler" style="margin-bottom: 20px;" @toFatherData="sendSonData"></Ypriddler>
          <el-input v-model="forgetPassowrdForm.smsCode" @keydown.enter="submitRegister" placeholder="请填写短信验证码" maxlength="6" autocomplete="off" tabindex="4">
            <el-button slot="append" type="text" class="sms-btn" @click="getSmsCode" :disabled="loadingSms || count < 60">{{countMsg}}</el-button>
          </el-input>
        </el-form-item>
        <el-form-item class="forget-passowrd-btn">
          <el-button type="primary" @click="submitRegister" :loading="loadingSubmit" tabindex="6">确认修改</el-button>
        </el-form-item>
        <el-form-item size="mini">
          <div class="tip">
            <div class="left"></div>
            <div>
              <router-link to="/login" replace>已有账号，立即登录</router-link>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </main>
  </div>
</template>

<script>
import { phoneValidator, passwordValidator } from '@/utils/validate'
// import path from 'path'
import Ypriddler from '../components/YpRiddler.vue'
import { PhoneAreaCode } from '@/utils/storage'

export default {
  name: 'ForgetPassword',
  components: {
    Ypriddler
  },
  data() {
    return {
      toMode: 'flat', // 验证的类型
      ypRiddlerVisible: false,
      passVerify: false, // 验证是否通过
      loadingSubmit: false,
      loadingSms: false,
      showPassword: false,
      phoneAreaCodeArr: [],
      currentAreaCode: '+86',
      count: 60,
      forgetPassowrdForm: {
        phone: '',
        password: '',
        smsCode: '',
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
      }
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
    }
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  created() {
    this._initPhoneAreaCode()
  },
  watch: {
    currentAreaCode(val) {
      let currentArea = this.phoneAreaCodeArr.filter(item => {
        return item.areaCode === val
      })
      PhoneAreaCode.setCurrentValidate(currentArea[0].regularExpression)
    }
  },
  methods: {
    ypRiddlerData(item) {
      this.ypRiddlerVisible = false
      this.forgetPassowrdForm.yunpianToken = item.token
      this.forgetPassowrdForm.yunpianAuthenticate = item.authenticate
    },
    // 接收子组件传来的数据
    sendSonData(data) {
      this.passVerify = data
    },
    getSmsCode(item) {
      this.ypRiddlerData(item)
      if (this.loadingSms) return
      if (this.count < 60) return
      // eslint-disable-next-line no-eval
      if (!eval(PhoneAreaCode.getCurrentValidate()).test(this.forgetPassowrdForm.phone)) {
        this.$message.error('请填写正确的手机号')
        return
      }
      if (!this.forgetPassowrdForm.yunpianAuthenticate) {
        this.ypRiddlerVisible = true
        return
      }
      if (!this.passVerify) {
        this.$message.error('请通过验证后再获取验证码')
        return
      }
      this.loadingSms = true
      this.$http
        .get('/api/Yunpian/sendSmsVerification', {
          yunpianToken: this.forgetPassowrdForm.yunpianToken,
          yunpianAuthenticate: this.forgetPassowrdForm.yunpianAuthenticate,
          phoneAreaCode: this.currentAreaCode,
          phone: this.forgetPassowrdForm.phone
        })
        .then(() => {
          this.$message.success('发送验证码成功！')
          this.startCountDown()
        })
        .catch(() => {
          this.ypRiddlerVisible = true
          this.passVerify = false // 验证是否通过
          this.forgetPassowrdForm.yunpianToken = ''
          this.forgetPassowrdForm.yunpianAuthenticate = ''
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
    submitRegister() {
      this.$refs.forgetPassowrdForm.validate((valid) => {
        if (valid) {
          if (!this.forgetPassowrdForm.angree) {
            this.$message.warning('请阅读并同意《用户使用协议》')
            return
          }
          this.loadingSubmit = true
          const params = {
            phone: this.forgetPassowrdForm.phone,
            newPassword: this.forgetPassowrdForm.password,
            smsCode: this.forgetPassowrdForm.smsCode,
            phoneAreaCode: this.currentAreaCode
          }
          this.$http
            .post('/user/forgetPwd', null, {
              params
            })
            .then((res) => {
              this.$message.success('修改密码成功！')
              this.$router.replace('/login')
            })
            .finally(() => {
              this.loadingSubmit = false
            })
        }
      })
    },
    _initPhoneAreaCode() {
      this.phoneAreaCodeArr = PhoneAreaCode.get()
    }
  }
}
</script>

<style lang="stylus" scoped>
.forget-passowrd-wrapper
  width 1000px
  margin 0 auto
.forget-passowrd-header
  font-size 16px
  padding 20px 10px 0
  border-bottom 1px solid #dddddd
  margin-bottom 80px
  .logo
    height 45px
    vertical-align bottom
  .title
    display inline-block
    margin 0
    margin-left 50px
    height 40px
    line-height 40px
    color #333
    border-bottom 2px solid $color-primary
.forget-passowrd-main
  display flex
  justify-content center
  align-items center
  .forget-passowrd-thumb
    width 400px
    margin-right 80px
    img
      width 100%
  .forget-passowrd-form
    width 360px
    .el-form-item
      // margin-bottom 24px
  .sms-btn
    margin 0
    color $color-primary
  .sms-btn.is-disabled
    color $color-info
  .el-checkbox
    font-size 12px
    margin-right 10px
  .forget-passowrd-btn
    margin-top 76px
    margin-bottom 4px !important
    .el-button
      width 100%
  .tip
    font-size 12px
    display flex
    justify-content space-between
    a
      color $color-primary
      display inline
    .divider
      display inline-block
      width 1px
      height 12px
      background #ddd
      margin 0 6px
      vertical-align middle
      transform scaleX(0.7)
  .rpriddler-box
    position relative
    .rpriddler
      position absolute
      bottom -100%
      z-index 100
</style>

<style lang="stylus">
.forget-passowrd-main
  .el-input
    border-bottom 1px solid #DCDFE6
  .is-error .el-input
    border-color $color-danger
  .is-success .el-input
    border-color $color-success
  .el-input__inner
    border none
    padding 0 6px
  .el-input-group__append
    background none
    border none
    padding-right 0
  .el-checkbox__label
    font-size 12px
</style>

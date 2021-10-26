<template>
  <div class="register-wrapper">
    <div class="register-container">
      <header class="register-header">
        <img class="logo" src="@/assets/logo.png" alt="桃李云帮" />
        <ul class="title">
          <li :class="{active: currentStep == 0}">机构注册</li>
          <li :class="{active: currentStep == 1}">完善信息</li>
        </ul>
      </header>
      <main class="register-main">
        <div class="register-thumb">
          <img src="@/assets/register_left_img.png" alt="桃李云帮介绍" />
        </div>

        <el-form class="register-form" ref="orgForm" :model="orgForm" :rules="rules" :label-position="isPhoneClient ? 'top' : 'left'" size="medium" label-width="100px">
          <template v-if="currentStep == 0">
            <el-form-item prop="name" label="机构名称">
              <el-input v-model="orgForm.name" placeholder="请填写机构名称" :maxlength="24" />
            </el-form-item>
            <el-form-item prop="username" label="管理员姓名">
              <el-input v-model="orgForm.username" placeholder="请填写管理员姓名" :maxlength="20" />
            </el-form-item>
            <el-form-item prop="phone" label="手机号码">
              <el-col :span="6">
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
              <el-col :span="17">
                <el-input v-model="orgForm.phone" @blur="blurPhone" placeholder="请填写您的手机号码" autocomplete :autofocus="true" tabindex="1"></el-input>
              </el-col>
            </el-form-item>
            <el-form-item class="rpriddlerFormItem" prop="smsCode" label="短信验证码">
              <el-input v-model="orgForm.smsCode" @keydown.enter="submitRegister" placeholder="请填写短信验证码" maxlength="6" autocomplete="off" tabindex="4">
                <el-button slot="append" type="text" class="sms-btn" @click="getSmsCode" :disabled="loadingSms || count < 60">{{countMsg}}</el-button>
              </el-input>
              <Ypriddler :toMode="toMode" v-if="ypRiddlerVisible" @open="getSmsCode" class="rpriddler" style="margin-bottom: 20px;" @toFatherData="sendSonData"></Ypriddler>
            </el-form-item>
            <el-form-item class="register-btn">
              <el-button type="primary" @click="submitRegister" :loading="loadingSubmit" tabindex="6">确认注册</el-button>
            </el-form-item>
            <el-form-item size="mini">
              <div class="tip">
                <div class="left">
                  <el-checkbox v-model="orgForm.angree" />
                  <span @click.stop="orgForm.angree = !orgForm.angree">
                    已阅读并同意
                    <a @click="showPolicy = true">《用户使用协议》</a>
                  </span>
                </div>
                <div v-if="!isPhoneClient">
                  <router-link to="/login" replace>已有账号，立即登录</router-link>
                </div>
              </div>
            </el-form-item>
          </template>

          <template v-else-if="currentStep == 1">
            <el-form-item prop="name" label="机构名称">
              <el-input v-model="orgForm.name" placeholder="请填写机构名称" />
            </el-form-item>
            <el-form-item prop="categorys" label="机构类型">
              <el-select v-model="orgForm.categorys" placeholder="请选择机构类型" multiple :multiple-limit="5">
                <el-option v-for="item in orgCategory" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="province" label="机构地址">
              <area-select v-model="orgForm.province" placeholder="请选择机构总部所在省市区" />
            </el-form-item>
            <el-form-item prop="address" label="详细地址">
              <el-input v-model="orgForm.address" placeholder="请填写详细地址" :maxlength="80" />
            </el-form-item>
            <!-- <el-form-item prop="address">
            <el-input v-model="orgForm.address" placeholder="请填写详细地址" :maxlength="80" style="width: 210px;"/>
            <el-button @click="toPOISelect" style="margin-left: 12px;">地图检索</el-button>
          </el-form-item>
          <el-form-item prop="longitude">
            <el-input :value="orgForm.longitude ? orgForm.longitude + ',' + orgForm.latitude : ''" placeholder="机构总部经纬度" disabled/>
            </el-form-item>-->
            <el-form-item prop="userLogo" label="用户设置">
              <el-checkbox v-model="orgForm.userLogo" :true-label="1" :false-label="0">将注册用户设为授课老师</el-checkbox>
            </el-form-item>
            <el-form-item class="register-btn">
              <el-button type="primary" @click="submitRegister" :loading="loadingSubmit" tabindex="6">确认提交</el-button>
            </el-form-item>
          </template>
        </el-form>
      </main>

      <el-dialog :visible.sync="showPolicy" title="用户使用协议" :close-on-click-modal="false" center top="8vh" class="plicy-dialog">
        <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 64vh;">
          <iframe ref="policyFrame" src="http://policy.tlybond.com/" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="100%" :height="plicyFrameHeight"></iframe>
        </el-scrollbar>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showPolicy = false" type="primary">已阅读</el-button>
        </span>
      </el-dialog>

      <!-- <poi-select v-model="showPOISelect" @select="handlePOISelect" :address="orgForm.address" :city="orgForm.province[1]"/> -->
    </div>

    <div class="round-1"></div>
    <div class="round-2"></div>
  </div>
</template>

<script>
import { phoneValidator } from '@/utils/validate'
// import path from 'path'

import AreaSelect from '../components/AreaSelect'
// import POISelect from '../components/POISelect'
import Ypriddler from '../components/YpRiddler.vue'
import { PhoneAreaCode } from '@/utils/storage'

export default {
  name: 'Register',
  data() {
    return {
      toMode: 'flat', // 验证的类型
      ypRiddlerVisible: false,
      passVerify: false, // 验证是否通过
      loadingSubmit: false,
      loadingSms: false,
      showPolicy: false,
      showPOISelect: false,
      phoneAreaCodeArr: [],
      currentAreaCode: '+86',
      plicyFrameHeight: '1000px',
      count: 60,
      currentStep: 0,
      orgCategory: [],
      orgForm: {
        name: '',
        username: '',
        phone: '',
        userLogo: 1,
        province: [],
        categorys: [],
        address: '',
        latitude: 0,
        longitude: 0,
        angree: true,
        yunpianToken: '',
        yunpianAuthenticate: ''
      },
      pwdForm: {
        password: '',
        rePassword: ''
      },
      rules: {
        name: [
          { required: true, message: '请填写机构/校区名称', trigger: 'blur' },
          { max: 20, message: '机构/校区名称太长', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请填写负责人姓名', trigger: 'blur' },
          { max: 12, message: '负责人姓名太长', trigger: ['blur', 'change'] }
        ],
        phone: [
          { required: true, message: '请填写正确的电话号码', trigger: 'blur' },
          {
            validator: phoneValidator,
            message: '请填写正确的电话号码',
            trigger: ['change', 'blur']
          }
        ],
        smsCode: [
          { required: true, message: '请填写短信验证码', trigger: 'blur' },
          { len: 6, message: '短信验证码的长度是6位', trigger: 'blur' }
        ],
        userLogo: {
          required: true,
          message: '请选择是否将注册用户设为授课老师',
          trigger: 'blur'
        },
        categorys: {
          required: true,
          message: '请选择机构类型',
          trigger: 'blur'
        },
        province: {
          required: true,
          message: '请选择机构所在省市区',
          trigger: 'blur'
        },
        address: {
          required: true,
          message: '请填写机构详细地址',
          trigger: 'blur'
        }
      },
      pwdRules: {
        password: [{ required: true, message: '请填写密码', trigger: 'blur' }],
        rePassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.orgForm.password !== this.orgForm.rePassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      verificationShow: 0
    }
  },
  components: {
    AreaSelect,
    Ypriddler
    // [POISelect.name]: POISelect
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
    this._initPhoneAreaCode()
    window.addEventListener('message', (event) => {
      if (event.origin === 'http://policy.tlybond.com') {
        this.plicyFrameHeight = event.data
      }
    })
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
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
    // 接收子组件传来的数据
    sendSonData(data) {
      this.passVerify = data
    },
    _getOrgCategory() {
      if (this.orgCategory.length > 0) return
      this.$http
        .get('/user/IntentionUser/getAllOrgCategory', {
          type: 1
        })
        .then((res) => {
          this.orgCategory = res.data
        })
    },
    // 手机输入框失去焦点时检测是否已注册
    blurPhone() {
      if (!this.orgForm.phone) {
        return
      }
      // eslint-disable-next-line no-eval
      if (!eval(PhoneAreaCode.getCurrentValidate()).test(this.orgForm.phone)) {
        this.$message.error('请填写正确的手机号')
        return
      }
      this.$http
        .get('/isRegister', {
          phone: this.orgForm.phone,
          phoneAreaCode: this.currentAreaCode
        })
        .then((res) => {
          if (res.data) {
            this.$message.error('该手机号已注册。如有疑问请联系管理员！')
            this.verificationShow = 1
          } else {
            this.verificationShow = 0
          }
        })
    },
    ypRiddlerData(item) {
      this.ypRiddlerVisible = false
      this.orgForm.yunpianToken = item.token
      this.orgForm.yunpianAuthenticate = item.authenticate
    },
    // 获取验证码
    getSmsCode(item) {
      this.ypRiddlerData(item)
      if (this.loadingSms) return
      if (this.count < 60) return
      // eslint-disable-next-line no-eval
      if (!eval(PhoneAreaCode.getCurrentValidate()).test(this.orgForm.phone)) {
        this.$message.error('请填写正确的手机号')
        return
      }
      if (this.verificationShow === 0) {
        if (!this.orgForm.yunpianToken) {
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
            phone: this.orgForm.phone,
            phoneAreaCode: this.currentAreaCode,
            yunpianToken: this.orgForm.yunpianToken,
            yunpianAuthenticate: this.orgForm.yunpianAuthenticate
          })
          .then(() => {
            this.$message.success('发送验证码成功！')
            this.startCountDown()
          })
          .catch(() => {
            this.ypRiddlerVisible = true
            this.passVerify = false // 验证是否通过
            this.orgForm.yunpianToken = ''
            this.orgForm.yunpianAuthenticate = ''
          })
          .finally(() => {
            this.loadingSms = false
          })
      } else {
        this.$message.error('该手机号已注册')
      }
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
    toPOISelect() {
      if (this.orgForm.province.length === 0) {
        this.$message.warning('请先选择省市区')
        return
      }
      this.showPOISelect = true
    },
    handlePOISelect(res) {
      if (res) {
        let address = res.address

        if (
          this.orgForm.province.length > 0 &&
          res.address.indexOf(this.orgForm.province.join('')) > -1
        ) {
          address = res.address.split(this.orgForm.province.join(''))[1]
        }
        this.orgForm.address = address
        this.orgForm.latitude = res.latitude
        this.orgForm.longitude = res.longitude
      }
    },
    submitRegister() {
      if (this.verificationShow === 1) {
        this.$message.error('该手机已注册')
        return
      }
      this.$refs.orgForm.validate((valid) => {
        if (valid) {
          if (!this.orgForm.angree) {
            this.$message.warning('请阅读并同意《用户使用协议》')
            return
          }
          if (this.currentStep === 0) {
            // 1. 快速注册
            this.loadingSubmit = true
            this.$http
              .post('/user/IntentionUser/addIntentionUser', {
                organizationName: this.orgForm.name,
                phone: this.orgForm.phone,
                userName: this.orgForm.username,
                smsCode: this.orgForm.smsCode,
                phoneAreaCode: this.currentAreaCode
              })
              .then(() => {
                this.$message.success('提交成功，请完善机构信息完成注册！')
                this.currentStep = 1
                this._getOrgCategory()
              })
              .finally(() => {
                this.loadingSubmit = false
              })
          } else if (this.currentStep === 1) {
            // 2. 完善机构信息
            this.loadingSubmit = true
            // 处理数据
            const params = {
              organizationInfo: Object.assign({}, this.orgForm),
              userInfo: {
                phone: this.orgForm.phone,
                username: this.orgForm.username,
                phoneAreaCode: this.currentAreaCode,
                password: '123456'
              },
              departments: [
                Object.assign({}, this.orgForm, {
                  name: this.orgForm.name + '(主校区)'
                })
              ]
            }
            params.organizationInfo.province = params.organizationInfo.province.join(
              ';'
            )
            // params.organizationInfo.validDate = params.userInfo.validDate // 有效期处理
            params.departments.forEach((item) => {
              item.province = item.province.join(';')
              item.depUserInfo = {
                username: item.username,
                phone: item.phone
              }
            })
            params.categorys = params.organizationInfo.categorys
            delete params.organizationInfo.categorys
            this.$http
              .post('/user/register', params, {
                timeout: 30000
              })
              .then((res) => {
                if (this.isPhoneClient) {
                  this.$router.replace('/registrationSuccessful')
                } else {
                  this.$alert(
                    '默认密码【123456】，为了系统安全，请及时更改密码。',
                    '注册成功',
                    {
                      confirmButtonText: '确定',
                      type: 'success',
                      callback: () => {
                        this.$router.replace('/login')
                      }
                    }
                  )
                }
              })
              .finally(() => {
                this.loadingSubmit = false
              })
          }
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
.register-wrapper
  background #fff
  min-height 100vh
  position relative
  overflow hidden
.round-1
  width 400px
  height 400px
  border 60px solid $color-primary
  border-radius 50%
  position absolute
  top -320px
  right -300px
.round-2
  width 180px
  height 180px
  border 30px solid #96C651
  border-radius 50%
  position absolute
  bottom -140px
  left -140px
.register-container
  width 1000px
  background #fff
  margin 0 auto
.register-header
  font-size 16px
  padding 20px 10px 0
  border-bottom 1px solid #dddddd
  margin-bottom 60px
  .logo
    height 45px
    vertical-align bottom
  .title
    display inline-block
    margin 0
    margin-left 50px
    li
      display inline-block
      height 40px
      line-height 40px
      color #999
      margin-right 32px
    .active
      color #333
      border-bottom 2px solid $color-primary
.register-main
  display flex
  justify-content center
  align-items center
  .register-thumb
    width 480px
    margin-right 80px
    img
      width 100%
  .register-form
    width 420px
  .sms-btn
    margin 0
    color $color-primary
  .sms-btn.is-disabled
    color $color-info
  .el-checkbox
    font-size 12px
    margin-right 10px
  .register-btn
    margin-top 50px
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
@media screen and (max-width 765px)
  .register-wrapper
    width 100%
    margin 0
  .register-header
    margin-bottom 30px
  .register-main
    display block
    .register-form
      width 100%
    .el-form-item
      margin-bottom 16px
  .register-thumb
    display none
.rpriddlerFormItem
  position relative
  .rpriddler
    position absolute
    z-index 100
</style>

<style lang="stylus">
@media screen and (max-width 768px)
  .register-wrapper
    .el-form-item__label
      padding 0 17px
    .el-form-item__content
      margin 0 17px
      .el-input
        width 80%
      .el-input-group
        width 100%
    .el-select, .el-dialog, .el-message-box
      width 100% !important
    .el-dialog__body
      padding 0 !important
    .el-message-box
      width 80% !important
      margin-left -15px !important
</style>

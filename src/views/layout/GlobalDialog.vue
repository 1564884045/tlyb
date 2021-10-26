<template>
  <div>
    <!-- 设置密码 -->
    <el-dialog
      :visible="showSetPwd"
      title="设置密码"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="custom-dialog"
      append-to-body
      @close="$store.commit('toggleShowSetPwd', false)"
      width="440px"
    >
      <el-form ref="pwdForm" :model="pwdForm" :rules="pwdRules" label-width="88px">
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="pwdForm.password" placeholder="6-20位字符，包含字母、数字" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="againPwd">
          <el-input type="password" v-model="pwdForm.againPwd" placeholder="请再次确认密码" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="$store.commit('toggleShowSetPwd', false)">取 消</el-button>
        <el-button type="primary" :loading="setPwdLoading" @click="submitSetPwd">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 更新说明 -->
    <el-dialog
      :visible="showIntroduction"
      :destroy-on-close="true"
      custom-class="custom-dialog"
      append-to-body
      center
      top="8vh"
      width="64vw"
      :close-on-click-modal="false"
      class="plicy-dialog"
      @close="handleCloseVersion"
    >
      <p slot="title" class="introduction-title">
        {{introduction.title}}
        <span>{{introduction.versionCode}}</span>
      </p>
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 74vh; padding-bottom: 12px;">
        <div class="introduction-content" v-html="introduction.content"></div>
      </el-scrollbar>
    </el-dialog>
    <!-- 系统充值 -->
    <el-dialog
      :visible="showTopUp"
      :destroy-on-close="true"
      custom-class="custom-dialog"
      append-to-body
      top="8vh"
      width="720px"
      :close-on-click-modal="false"
      @close="$store.commit('toggleShowTopUp', false)"
      class="join-vip-dialog"
    >
      <p slot="title" class="join-vip-title">
        <img src="../../assets/system_logo.png" />系统购买
      </p>
      <div class="join-vip-con">
        <p class="con-title">套餐选择</p>
        <ul v-if="versionsList.length === 0 && topUpLoading === false" class="versions-rights">
          <li>暂无选项</li>
        </ul>
        <div class="edition-box" v-else v-loading="topUpLoading">
          <div v-for="(item, index) in versionsList" :key="item.id" class="edition" @click="checkSystemType(index, item)" :class="checkType === index ? 'edition-active' : '' ">
            <!-- 名称 -->
            <div class="edition-title" :class="item.icon || 'flagship_logo'">
              <div>
                <img style="width: 40px" :src="require(`../../assets/systemLogo/${item.icon || 'flagship_logo'}.png`)" />
              </div>
              <div>
                <p class="keyword">{{item.name}}</p>
                <p class="edition-remark" style="font-size: 12px">{{item.remark}}</p>
              </div>
            </div>
            <!-- 内容 -->
            <div class="edition-content">
              <ul v-if="item.versionsRights.length > 0">
                <li style="padding: 6px" v-for="ver in item.versionsRights" :key="ver.id">
                  <span style="font-size: 12px; color: #ff6600; padding: 6px; margin-top: 6px">{{ver.name}}</span>
                  <span style="font-size: 12px; color: #333333">{{ver.remark}}</span>
                </li>
              </ul>
              <ul v-else>
                <li>暂无选项</li>
              </ul>
              <p class="content-remark"><span>简介：</span>{{item.remark}}</p>
            </div>
          </div>
        </div>
        <template>
          <div style="display: flex">
            <div style="width: 460px">
              <p class="con-title">支付人信息</p>

              <el-form ref="form" :model="payFrom" :rules="rules" style="width: 350px; margin-right: 20px" label-width="80px">
                <el-form-item label="姓名" prop="contractName">
                  <el-input v-model="payFrom.contractName" :maxlength="20" placeholder="请输入支付人姓名"></el-input>
                </el-form-item>

                <el-form-item label="电话" prop="phone">
                  <AreaCode @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
                  <el-input style="width: 180px" v-model="payFrom.phone" placeholder="请输入支付人电话"></el-input>
                </el-form-item>

                <el-form-item label="验证码" prop="smsCode">
                  <el-input v-model.trim="payFrom.smsCode" @keyup.enter.native="buySystem()" placeholder="请填写短信验证码" maxlength="6" autocomplete="off" tabindex="4">
                    <i slot="prepend" class="icon iconfont icon-validate-code" />
                    <el-button slot="append" type="text" size="mini" class="sms-btn" @click="getSmsCode" :disabled="loadingSms || count < 60">{{countMsg}}</el-button>
                  </el-input>
                </el-form-item>
              </el-form>
            </div>

            <div style="width: 240px">
              <p class="con-title">开通时长</p>
              <!-- <ul class="time-list clearfix" v-if="payTimes.length > 0">
                <li v-for="(item, index) in payTimes" :class="payTime === index ? 'pay-time pay-active' : 'pay-active' " @click="paySystemTime(index, item)" :key="item.id">
                  <span style="color: #ff6600">{{item.yearUnit}}</span>
                  年
                  <span style="color: #ff6600">({{item.price / 100}}</span>
                  元(￥))
                </li>
              </ul> -->
              <div v-if="payTimes.length > 0">
                <div class="pay-item" v-for="(item, index) in payTimes" :class="payTime === index ? 'pay-item-active' : '' " @click="paySystemTime(index, item)" :key="item.id">
                  <div class="year-unit">{{item.yearUnit}}年</div>
                  <div class="price-box">
                    <span style="color: rgb(245,98,46); font-size: 18px; margin-right: 4px">￥{{item.price / 100}}</span>
                    <span style="color: #666666; font-size: 12px">{{((item.price / 100) / (item.yearUnit * 12)).toFixed(2)}}元/月</span>
                  </div>
                </div>
              </div>
              <ul v-else class="versions-rights">
                <li>暂无选项</li>
              </ul>
            </div>
          </div>

          <p class="con-title">支付方式</p>
          <div class="pay-list clearfix">
            <p class="pay-type pay-active" :class="payFrom.type === 0 ? 'pay-type-active' : '' " @click="paySystemType(0)">
              <img src="../../assets/wx_pay.png" />微信
            </p>
            <p class="pay-type pay-active" :class="payFrom.type === 1 ? 'pay-type-active' : '' " @click="paySystemType(1)" style="margin-left: 10px">
              <img src="../../assets/icon_alipay.png" />支付宝
            </p>
            <span class="pay-tip">暂不支持其它支付方式</span>
          </div>
          <Ypriddler v-if="ypRiddlerVisible" class="rpriddler" @open="ypRiddlerData" :toMode="toMode" style="margin-bottom:18px;" @toFatherData="sendSonData"></Ypriddler>
          <div class="pay-price"><span class="con-title">支付金额</span><span style="font-size: 18px; margin-left: 20px">{{(payPrice / 100).toFixed(2)}}元</span></div>
          <el-button class="submit-btn" type="success" plain round size="large" @click="buySystem" :loading="vipLoading">
            立即下单
          </el-button>
          <el-tooltip class="tip-info-area" content="当前版本为旗舰版时无法购买普通版" placement="right" effect="light">
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
      </div>
    </el-dialog>

    <!-- 开通会员 -->
    <el-dialog
      :visible="showJoinVip"
      :destroy-on-close="true"
      custom-class="custom-dialog"
      append-to-body
      top="8vh"
      width="720px"
      :close-on-click-modal="false"
      @close="$store.commit('toggleShowJoinVip', false)"
      class="join-vip-dialog"
    >
      <p slot="title" class="join-vip-title">
        <img style="width: 16px; height: 16px" src="../../assets/join_vip.png" />
        {{userInfo && userInfo.vipInfo ? '尊敬的会员' : '开通会员'}}
      </p>
      <div class="join-vip-con">
        <p class="con-title">会员权益</p>
        <ul class="right-list">
          <li>
            <img src="../../assets/vip_right_free.png" />
            <span class="keyword">招生帮</span>所有模板免费使用。
          </li>
          <li>
            <img src="../../assets/vip_right_discount.png" />
            <span class="keyword">教育商城</span>所有商品尊享
            <span class="color-primary">9.2折</span>。
          </li>
          <li>
            <img src="../../assets/vip_right_mutil.png" />
            <span class="keyword">机构管理</span>可以开通多个校区，校区独立运营，学校统一管理。
          </li>
          <li>
            <img src="../../assets/vip_right_service.png" />
            <span class="keyword">点对点服务</span>技术专员点对点服务，在线为您解答、处理系统使用问题。
          </li>
        </ul>
        <p v-if="userInfo && userInfo.vipInfo" class="vip-info">
          会员到期时间
          <span class="color-danger">{{userInfo.vipInfo.endTime}}</span>
        </p>
        <template v-else>
          <p class="con-title">开通时长</p>
          <ul class="time-list clearfix">
            <li v-for="item in vipPriceList" :key="item.id" :class="{active: item.id === vipForm.vipPriceId}" @click="vipForm.vipPriceId = item.id">{{item.priceStr}}</li>
          </ul>
          <p class="con-title">支付方式</p>
          <div class="pay-list clearfix">
            <p class="pay-type">
              <img src="../../assets/wx_pay.png" />微信支付
            </p>
            <span class="pay-tip">暂时只支持微信付款</span>
          </div>
          <el-button class="submit-btn" type="success" plain round size="large" @click="buyVip" :loading="vipLoading">立即开通</el-button>
        </template>
      </div>
    </el-dialog>

    <wx-pay-dialog v-model="showPayCode" :outTradeNo="wxPayObj.outTradeNo" :codeUrl="wxPayObj.codeUrl" @refresh="buyVip()" @paySuccess="refresh()"></wx-pay-dialog>

    <PayTypeDialog v-model="showPayCodes" :codeUrl="codeUrl" :outTradeNo='outTradeNo' :title="payTitle" @showPayCodes="payCodes" @refresh="buySystem()" @paySuccess="refresh()"></PayTypeDialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { passwordValidator, phoneValidator } from '@/utils/validate'
import moment from 'moment'
import WxPayDialog from '@/components/WxPayDialog'
import PayTypeDialog from '@/components/PayTypeDialog'
import { PhoneAreaCode } from '@/utils/storage'
import Ypriddler from '@/components/YpRiddler.vue'
import AreaCode from '@/components/PhoneAreaCode'

export default {
  data() {
    return {
      codeUrl: '',
      outTradeNo: '',
      rules: {
        contractName: {
          required: true,
          message: '请填写支付人姓名',
          trgger: 'blur'
        },
        phone: [
          { required: true, message: '请填写电话号码', trgger: 'blur' },
          { validator: phoneValidator, trigger: 'blur' }
        ],
        smsCode: { required: true, message: '请填写验证码', trgger: 'blur' }
      },
      count: 60,
      payFrom: {
        versionsFeeId: '', // 版本资费ID
        type: 0, // 类型（0-微信，1-支付宝）
        phone: '', // 电话号码
        contractName: '', // 购买人姓名
        smsCode: '', // 验证码
        angree: true,
        yunpianToken: '',
        yunpianAuthenticate: ''
      },
      setPwdLoading: false,
      vipLoading: false,
      showPayCode: false,
      showPayCodes: false,
      payTitle: '微信支付',
      topUpLoading: false,
      checkType: null, // 系统版本
      payTime: null, // 购买的时长
      pwdForm: {
        password: '',
        againPwd: ''
      },
      pwdRules: {
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { validator: passwordValidator, trigger: 'blur' }
        ],
        againPwd: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请再次输入密码'))
              } else if (value !== this.pwdForm.password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      introduction: {
        versionCode: '',
        title: '',
        content: ''
      },
      vipPriceList: [],
      vipForm: {
        basicVipId: null,
        vipPriceId: null
      },
      wxPayObj: {
        outTradeNo: '',
        codeUrl: ''
      },
      loadingSms: false,
      currentAreaCode: '+86',
      phoneAreaCodeArr: [],
      toMode: 'flat',
      ypRiddlerVisible: false,
      passVerify: false, // 验证是否通过
      versionsList: [], // 版本列表
      payTimes: [], // 版本资费列表
      payPrice: 0
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo',
      'showSetPwd',
      'showIntroduction',
      'showJoinVip',
      'showTopUp'
    ]),
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
  components: {
    WxPayDialog,
    PayTypeDialog,
    Ypriddler,
    AreaCode
  },
  created() {
    this.payFrom = {
      versionsFeeId: '', // 版本资费ID
      type: 0, // 类型（0-微信，1-支付宝）
      phone: this.userInfo.phone, // 电话号码
      contractName: this.userInfo.username, // 购买人姓名
      smsCode: '', // 验证码
      angree: true,
      yunpianToken: '',
      yunpianAuthenticate: ''
    }
    PhoneAreaCode.setCheck(this.userInfo.phoneAreaCode)
    this.validateVersion()
    this._initPhoneAreaCode()
    this.currentAreaCode = PhoneAreaCode.getCheck()
  },
  watch: {
    showSetPwd(val) {
      val && this.$refs.pwdForm && this.$refs.pwdForm.resetFields()
    },
    showJoinVip(val) {
      if (val) this._getVipInfo()
    },
    showTopUp(val) {
      if (val) this._getList()
    }
  },
  methods: {
    payCodes(boolean) {
      this.showPayCodes = boolean
      this.$store.commit('toggleShowTopUp', false)
      this.versionsList = []
    },
    // 获取系統版本列表
    _getList() {
      if (this.versionsList && this.versionsList.length === 0) {
        this.topUpLoading = true
        this.$http
          .get('/v1/Versions/getFullVersionsInfo')
          .then((res) => {
            res.data.forEach((item, index) => {
              if (item.id === '10000') {
                res.data.splice(index, 1)
              }
            })
            this.versionsList = res.data
            console.log(res.data, '系统版本')
          })
          .finally(() => {
            this.topUpLoading = false
          })
      }
    },
    _initPhoneAreaCode() {
      this.phoneAreaCodeArr = PhoneAreaCode.get()
    },
    // 系统购买时长
    paySystemTime(time, item) {
      this.payTime = time
      // 资费id
      this.payFrom.versionsFeeId = item.id
      this.payPrice = item ? item.price : 0
    },
    // 支付方式
    paySystemType(type) {
      this.payFrom.type = type
    },
    // 选择的系统版本
    checkSystemType(type, item) {
      this.checkType = type
      // 版本资费
      this.payTimes = item.versionsFees
      this.paySystemTime(null, '')
    },
    _getVipInfo() {
      this.$http.get('/v1/CommonVip/getBasicVipInfo').then((res) => {
        if (res.data == null || res.data.length === 0) {
          this.$message.error('未找到VIP相关信息')
          return
        }
        const info = res.data[0]
        if (info.vipPriceInfo == null || info.vipPriceInfo.length === 0) {
          this.$message.error('未找到VIP的价格信息')
          return
        }
        this.vipForm = {
          basicVipId: info.id,
          vipPriceId: info.vipPriceInfo[0].id
        }
        info.vipPriceInfo.forEach((item) => {
          item.priceStr =
            parseFloat((item.price / 100).toFixed(2)) + '元/' + item.remark
        })
        this.vipPriceList = info.vipPriceInfo
      })
    },
    // 验证版本信息
    validateVersion() {
      // 获取最新的版本信息，和本地匹配
      this.$http
        .get('/v1/SystemVersionInstructions/getSystemVersionInstructionsList', {
          pageSize: 1,
          pageNum: 1
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const item = res.data[0]
            item.createAt = moment(item.createAt).format('YYYY-MM-DD')

            const version = localStorage.getItem('iTK_version')
            if (
              version == null ||
              this.versionCompare(item.versionCode, version)
            ) {
              this.$store.commit('toggleShowIntroduction', true)
            }
            this.introduction = item
          }
        })
    },
    // 版本匹配。 v1 > v2 true
    versionCompare(str1, str2) {
      // 第一步：使用正则，先把传参进来的两个版本号中空格给替换成空。
      let nStr1 = str1.replace(/(^\s+)|(\s+$)/gi, '')
      let nStr2 = str2.replace(/(^\s+)|(\s+$)/gi, '')
      // 第二步：进行一次判断，万一我们传进来的是空的，提示一下，
      if (!nStr1 || !nStr2) {
        return true
      }
      // 第三步：使用正则来匹配截取两个传进来的版本号中的版本数字
      const req = /\d(\.|\d)*\d/gi // 这个是匹配**.**.**数字的正则
      nStr1 = nStr1.match(req)[0] // match出来的是一个数组，这个匹配出来在第0个
      nStr2 = nStr2.match(req)[0]
      // 第四步：版本比较，先把版本号字符串切割成数组，[主版本号，次版本号，修订号]
      let arr1 = nStr1.split('.') // [**,**,**]
      let arr2 = nStr2.split('.')
      // 第五步：开始比较
      const minL = Math.min(arr1.length, arr2.length)
      let index = 0
      let diff = 0
      while (index < minL) {
        // 循环数组的每一项，相减的差额来做判断
        diff = parseInt(arr1[index]) - parseInt(arr2[index])
        if (diff !== 0) {
          break
        }
        index++
      }
      diff = diff !== 0 ? diff : arr1.length - arr2.length
      // 通过diff的值与0比较，生成true（第一个大于第二个） 或者是false（不大于）
      return diff > 0
    },
    handleCloseVersion() {
      this.$store.commit('toggleShowIntroduction', false)
      this.introduction &&
        localStorage.setItem('iTK_version', this.introduction.versionCode)
    },
    // 修改密码
    submitSetPwd() {
      if (this.setPwdLoading || !this.showSetPwd) return
      this.$refs.pwdForm.validate((valid) => {
        if (valid) {
          this.setPwdLoading = true
          this.$http
            .put('/v1/User/setPassword', null, {
              params: { password: this.pwdForm.password }
            })
            .then(() => {
              this.$message.success('设置密码成功')
              setTimeout(() => {
                // this.$store.dispatch('logout')
                // 直接刷新页面
                window.location.reload()
              }, 500)
            })
            .finally(() => {
              this.setPwdLoading = false
            })
        }
      })
    },
    // 开通VIP
    buyVip() {
      this.vipLoading = true
      const params = Object.assign({}, this.vipForm, {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        goodDesc: '开通桃李云帮会员'
      })
      this.$http
        .post('/v1/BuyGoodsOrder/vipOrder', params)
        .then((res) => {
          this.wxPayObj = {
            outTradeNo: res.data.outTradeNo,
            codeUrl: res.data.codeUrl
          }
          this.showPayCode = true
        })
        .finally(() => {
          this.vipLoading = false
        })
    },
    // 购买系统（下订单）
    buySystem() {
      if (!this.payFrom.versionsFeeId) {
        this.$message.warning('请选择套餐与购买时长')
        return
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.vipLoading = true
          switch (this.payFrom.type) {
            case 0:
              this.payTitle = '微信支付'
              break
            case 1:
              this.payTitle = '支付宝支付'
              break
          }
          const param = {
            contractName: this.payFrom.contractName,
            organizationId: this.organizationInfo.id, // 机构ID
            departmentId: this.currentBranch.id, // 分校ID
            phone: this.payFrom.phone,
            smsCode: this.payFrom.smsCode,
            type: this.payFrom.type,
            versionsFeeId: this.payFrom.versionsFeeId
          }
          this.$http
            .post('/v1/BuyGoodsOrder/buySystemOrder', param)
            .then((res) => {
              this.codeUrl = res.data.codeUrl
              this.outTradeNo = res.data.outTradeNo
              this.showPayCodes = true
              this.payFrom.yunpianToken = ''
            })
            .catch(() => {
              // this.$message.warning('下单失败')
            })
            .finally(() => {
              this.vipLoading = false
            })
        }
      })
    },
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.currentAreaCode = info
    },
    // 刷新页面
    refresh() {
      window.location.reload()
    },
    ypRiddlerData(item) {
      this.ypRiddlerVisible = false
      this.payFrom.yunpianToken = item.token
      this.payFrom.yunpianAuthenticate = item.authenticate
      this.getSmsCode()
    },
    // 接收子组件传来的数据
    sendSonData(data) {
      this.passVerify = data
    },
    // 获取验证码
    getSmsCode() {
      if (!this.payFrom.yunpianToken) {
        this.ypRiddlerVisible = true
        return
      }
      if (this.loadingSms) return
      if (this.count < 60) return
      // eslint-disable-next-line no-eval
      if (!eval(PhoneAreaCode.getCurrentValidate()).test(this.payFrom.phone)) {
        this.$message.error('请填写正确的手机号')
        return
      }
      if (!this.payFrom.yunpianToken) {
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
          phone: this.payFrom.phone,
          phoneAreaCode: this.currentAreaCode,
          yunpianToken: this.payFrom.yunpianToken,
          yunpianAuthenticate: this.payFrom.yunpianAuthenticate
        })
        .then(() => {
          this.$message.success('发送验证码成功！')
          this.startCountDown()
        })
        .finally(() => {
          this.passVerify = false // 验证是否通过
          this.payFrom.yunpianToken = ''
          this.payFrom.yunpianAuthenticate = ''
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.plicy-dialog
  .introduction-title
    text-align center
    color $color-primary
    font-size 18px
    font-weight bold
    padding-top 6px
    span
      font-size 14px
      color #b8b8b8
      font-weight normal
      margin-left 12px
  .dialog-footer
    position relative
  .publish-time
    float left
    color #b8b8b8
    position absolute
    left 0
    bottom 0px
.join-vip-dialog
  .join-vip-title
    background $color-background
    color $color-danger
    font-size 16px
    font-weight bold
    line-height 40px
    padding 0 16px
    img
      width 18px
      vertical-align middle
      margin-right 6px
      margin-bottom 4px
  .join-vip-con
    padding 0 16px 20px
  .con-title
    color $color-text-1
    font-weight bold
    padding-left 12px
    position relative
    margin-top 32px
    margin-bottom 16px
    &:before
      display block
      content ''
      position absolute
      left 0
      top 6%
      width 3px
      height 88%
      border-radius 3px
      background $color-primary
  .right-list
    margin-left 50px
    color $color-text-1
    li
      margin-bottom 12px
    img
      height 32px
      vertical-align middle
      margin-right 12px
    .keyword
      font-weight bold
      margin-right 12px
  .time-list
    margin-left 50px
    color $color-text-1
    li
      float left
      line-height 32px
      padding 0 16px
      border-radius 3px
      border 1px solid $color-border-1
      margin-right 16px
      margin-bottom 16px
      cursor pointer
      overflow hidden
      position relative
    .active
      color $color-primary
      border-color rgb(255, 194, 153)
      background-color rgb(255, 240, 230)
      &:after
        content ''
        display block
        position absolute
        bottom 0
        right 0
        background-image url('../../assets/icon_checked_right_bottom.png')
        background-size cover
        width 20px
        height 20px
  .pay-list
    margin-left 50px
    color #000
    display flex
    align-items flex-end
    .pay-type
      line-height 32px
      padding 0 16px
      border-radius 3px
      border 1px solid #dddddd
      cursor pointer
      overflow hidden
      position relative
      color $color-primary
      img
        height 24px
        vertical-align middle
        margin-right 6px
    .pay-type-active
      border 1px solid #ff6600
      border-radius 4px
    .pay-tip
      margin-left 12px
      font-size 13px
      color $color-text-3
      margin-bottom 6px
  .submit-btn
    display block
    width 160px
    margin 20px auto 0
  .vip-info
    margin-top 80px
    margin-bottom 50px
    text-align center
    font-weight bold
    span
      margin-left 12px
// 系统版本
.edition
  display inline-block
  width 200px
  height 280px
  border 1px solid #eeeeee
  margin 0 10px 10px 10px
  overflow hidden
  &:hover
    border 1px solid rgba(255, 102, 0, 0.3)
    border-radius 4px
  .edition-title
    display flex
    justify-content space-around
    padding 10px
    text-align center
    .edition-remark
      padding-top 5px
      font-size 12px
      display -webkit-box
      -webkit-box-orient vertical
      -webkit-line-clamp 1
      overflow hidden
  .edition-content
    height 210px
    overflow-y auto
    // 滚动条宽度
    &::-webkit-scrollbar
      width 6px
    &::-webkit-scrollbar-track
      -webkit-box-shadow inset 0 0 6px rgba(0,0,0,0.2)
      border-radius 3px
      /* 滚动条滑块长度 */
    &::-webkit-scrollbar-thumb
      border-radius 3px
      height 30px
      background-color #ccc
    .content-remark
      padding 6px
      font-size 13px
      span
        font-weight bold
.edition-active
  border-radius 4px
  border 1px solid rgba(255, 102, 0, 0.6)
.pay-active
  &:hover
    border 1px solid rgba(255, 102, 0, 0.3)
    background-color rgba(9, 187, 7, 0.1)
.pay-time
  border-radius 5px
  border 1px solid #ff6600 !important
// 云片弹窗
.rpriddler
  position absolute
  top 50%
  left calc(50% - 147px)
// 获取验证码按钮
.sms-btn
  color #ff6600 !important
.con-title-box
  display flex
// 系统权益
.versions-rights
  padding-left 50px
  li
    margin 10px 0
  .versions-rights-name
    color #ff6600
// 各种版本对应的背景色
.gratis_logo
  background linear-gradient(to right, #4590ff, #1b77ff)
  color #ffffff
.logordinary_logo
  background linear-gradient(to right, #f4e0b2, #e1ba80)
// 支付价格
.pay-price
  margin-top 10px
  span
    color #ff6600
.tip-info-area
  position absolute
  bottom 33px
  right 255px
  color $color-primary
// 每年价格
.pay-item
  border 1px solid #eeeeee
  border-radius 4px
  display flex
  margin-bottom 10px
  overflow hidden
  cursor pointer
  height 40px
  div
    padding 8px
    line-height 28px
  .year-unit
    background-color #dedede
    width 50px
    text-align center
  &:hover
    background-color rgba(255,102,0, 0.1)
    .year-unit
      background-color rgba(255,102,0, 0.3)
.pay-item-active
  border 1px solid #ff6600
.price-box
  width 160px
  display flex
  justify-content space-between
</style>

<style lang="stylus">
.plicy-dialog
  .introduction-content
    p
      line-height 1.5
    img
      max-width 100%
.join-vip-dialog
  .el-dialog__header, .el-dialog__body
    padding 0
  .el-dialog__headerbtn
    top 12px
    right 16px
// 套餐选择
.top-up
  min-height 100px
</style>
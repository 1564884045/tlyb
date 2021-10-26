<!-- 机构信息完善 -->
<template>
  <div class="organization-info">
    <div class="info-wrapper">
      <p class="title">设置机构信息</p>
<!--      <div class="QrCode">-->
<!--        <qrcode class="micro-web-QrCode" :value="microWebQrCode" tag="img" :options="{ width: 125, margin: 0}"/>-->
<!--        <div class="title">微官网二维码</div>-->
<!--        <div class="prompt">仅能使用微信扫码</div>-->
<!--      </div>-->
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" style="width: 560px">
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="ruleForm.name" :maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="机构负责人" prop="username">
          <el-input v-model="ruleForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="负责人电话" prop="phone">
          <el-input v-model.trim="ruleForm.phone" disabled></el-input>
        </el-form-item>
        <el-form-item label="机构类型">
          <el-select v-model="ruleForm.categoryIds" multiple placeholder="请选择" style="width:260px">
            <el-option
              v-for="item in categoryOption"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="submitLoading" type="primary" @click="submitForm('ruleForm')">确认提交</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="we-chat-serve" v-if="organizationInfo.openWechatDeploy && organizationInfo.openWechatDeploy == 1" >
      <span class="title">微信服务号：</span>
      <el-button type="warning" @click="handleBindWeChatService" plain>{{isAllowConfig ? '更换绑定' : '去绑定'}}</el-button>
    </div>

    <!-- 自定义公众号标题及关于机构信息 -->
    <div class="info-wrapper" v-if="isAllowConfig">
      <div class="wechatInfo-wrapper">
        <p class="title">公众号自定义页面信息</p>
        <el-form :model="wechatInfoForm" :rules="wechatInfoFormRules" ref="wechatInfoForm" label-width="100px" style="width: 560px">
          <div class="tips">
            <ul>
              <li>1. 您已开启了公众号嫁接功能，所以您可以变更下面的内容。</li>
              <li>2. “标题名称”为公众号应用顶部的标题栏，需要自定义的在下面填写即可，但由于考虑手机宽度问题显示不了完整自定义标题，显示标题字数为6个字。</li>
              <li>3. “机构LOGO”为公众号应用【关于】页面的LOGO，简介同样如此。</li>
              <li>4. 此处的“机构LOGO”和“机构简介”为什么不用【打印配置】的数据？原因为您机构面向的用户群体为您自己的机构用户，所以此处并不会去复用您系统里的机构LOGO及简介。</li>
            </ul>
          </div>
        <el-form-item label="标题名称" prop="appName">
          <el-input v-model="wechatInfoForm.appName" :maxlength="6" placeholder="请输入标题名称(最大只能输入6个字是因为考虑手机显示不全问题)" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="机构LOGO" prop="logoUrl">
          <el-upload
              :action="imgUploadPath"
              accept="image/*"
              list-type="picture-card"
              :show-file-list="true"
              :limit="1"
              :file-list="wechatInfoForm.imgList"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemove">
              <i class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" style="color:#409EFF;">大小：1M以内（300*300）</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="机构简介" prop="content">
            <el-input v-model.trim="wechatInfoForm.content" type="textarea" rows="15" maxlength="1000" placeholder="请输入机构简介" show-word-limit></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="wechatInfoFormSubmitLoading" type="primary" @click="handleSubmitWechatInfo">确认提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 绑定微信公众号弹框 -->
    <el-dialog
      title="微信服务号绑定"
      :visible.sync="weChatServiceDialogVisible"
      class="student-detail-dialog"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="400px"
      :before-close="handleWeChatClose">
      <div class="weChat-authorization">
        <div class="step">
          <div class="prompt">1.我已经拥有微信认证的服务号</div>
          <div class="handle">
            <el-radio-group v-model="weChatService.authenticate">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="step" v-if="weChatService.authenticate === 1">
          <div class="prompt">2.我已经申请服务号模板消息</div>
          <div class="handle">
            <el-radio-group v-model="weChatService.applicationTemplate">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="step" v-if="weChatService.applicationTemplate === 1 && weChatService.authenticate === 1">
          <div class="prompt">3.将服务号授权给桃李云帮</div>
          <div class="handle">
            <el-button v-if="!authCodeValidTime" type="warning" @click="handleAuthorization" :loading="authorizationLoading">立即授权</el-button>
            <div v-else class="auth">
              <span class="auth-success">授权成功</span>
              <span>{{againGetAuthTime}}后重新授权</span>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleWeChatClose">取 消</el-button>
        <el-button type="primary" @click="handleWeChatSubmit" :loading="weChatSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import lodash from 'lodash'
import QRCode from '@/components/QRCode'

export default {
  name: 'OrganizationInfo',
  components: {
    [QRCode.name]: QRCode
  },
  data () {
    return {
      isAllowConfig: false,
      weChatServiceDialogVisible: false,
      authorizationLoading: false,
      weChatSubmitLoading: false,
      // 机构信息时间选择
      submitLoading: false,
      microWebQrCode: null,
      authCodeValidTime: null,
      ruleForm: {
        name: '',
        username: '',
        phone: '',
        categoryIds: []
      }, // 机构信息完善
      rules: {
        name: [
          { required: true, message: '请输入机构名称', trigger: 'blur' },
          { max: 30, message: '最多 30 个字符', trigger: 'blur' }
        ]
      },
      wechatInfoFormSubmitLoading: false,
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      wechatInfoForm: { // 机构自定义公众号标题关于等信息
        organizationId: null,
        appName: null,
        logoUrl: null,
        imgList: [],
        content: null
      },
      wechatInfoFormRules: {
        appName: { required: true, message: '请输入名称', trigger: 'blur' },
        logoUrl: { required: true, message: '请上传机构LOGO', trigger: 'blur' },
        content: { required: true, message: '请输入机构介绍', trigger: 'blur' }
      },
      categoryOption: [],
      // 微信服务号
      weChatService: {
        authenticate: null, // 认证
        applicationTemplate: null // 申请模板
      },
      againGetAuthTime: null, // 再次授权时间
      setInterval: null
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo'
    ])
  },
  created () {
    this.$http.get('/v1/dictionary/DicOrganizationCategory/getAll', { type: 1 })
      .then(res => {
        this.categoryOption = res.data
      })
    this._getWechatOrganizationInfo()
    this._getAuthorize()
    this.authCodeValidTime = localStorage.getItem('auth_time')
    // this.createQRCode() // 生成微官网二维码
  },
  mounted () {
    this.ruleForm = {
      name: this.organizationInfo.name,
      username: this.organizationInfo.principalInfo && this.organizationInfo.principalInfo.username,
      phone: this.organizationInfo.principalInfo && this.organizationInfo.principalInfo.phone,
      categoryIds: this.organizationInfo.organizationCategoryEntityList && this.organizationInfo.organizationCategoryEntityList.map(item => item.categoryId)
    }
    if (!this.organizationInfo.organizationCategoryEntityList) {
      this.$http.get(`/v1/OrganizationCategory/getOrganizationCategory/${this.organizationInfo.id}`)
        .then(res => {
          let resData = res.data.sort((a, b) => { return a - b })
          this.ruleForm['categoryIds'] = resData.map(item => item.categoryId)
          this.organizationInfo['organizationCategoryEntityList'] = resData
          this.$store.commit('setOrganizationInfo', this.organizationInfo)
        })
    }
  },
  methods: {
    // 生成微官网二维码
    createQRCode() {
      this.microWebQrCode = `${process.env.VUE_APP_PARENT_URL}/#/MicroWeb?organizationId=${this.organizationInfo.id}`
    },
    // 获取公众号自定义标题等信息
    _getWechatOrganizationInfo() {
      if (this.organizationInfo.openWechatDeploy && this.organizationInfo.openWechatDeploy === 1) {
        this.$http.get(`/v1/OrganizationWechatAppInfo/getOrganizationWechatAppInfoByOrganizationId?organizationId=${this.organizationInfo.id}`).then(res => {
          if (res.data) {
            this.wechatInfoForm = {
              organizationId: res.data.organizationId,
              appName: res.data.appName,
              logoUrl: res.data.logoUrl,
              content: res.data.content
            }
            this.wechatInfoForm.imgList = [
              { name: 'default.png', url: res.data.logoUrl }
            ]
          }
        })
      }
    },
    // 提交机构信息
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 参数处理
          let params = lodash.cloneDeep(this.ruleForm)
          let orgId = this.organizationInfo.id
          params['id'] = orgId
          params.organizationCategoryEntityList = this.ruleForm.categoryIds
            .map((item, index) => {
              return { categoryId: item, organizationId: orgId, sort: index }
            })
          delete params.categoryIds
          // 请求
          this.submitLoading = true
          this.$http.put('/v1/Organization/updateOrganization', params)
            .then(res => {
              this.$message.success('机构信息更新成功')
              this.$store.commit('setOrganizationInfo', Object.assign({}, this.organizationInfo, params))
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          return false
        }
      })
    },
    // 提交自定义公众号相关信息
    handleSubmitWechatInfo() {
      this.$refs.wechatInfoForm.validate(valid => {
        if (valid) {
          this.wechatInfoFormSubmitLoading = true
          if (this.wechatInfoForm.organizationId) { // 编辑
            const param = {
              organizationId: this.wechatInfoForm.organizationId,
              appName: this.wechatInfoForm.appName,
              logoUrl: this.wechatInfoForm.logoUrl,
              content: this.wechatInfoForm.content
            }
            this.$http.put('/v1/OrganizationWechatAppInfo/updateOrganizationWechatAppInfo', param).then(res => {
              this.$message.success('更新自定义公众号信息成功')
            }).finally(() => {
              this.wechatInfoFormSubmitLoading = false
            })
          } else { // 新增
            const param = {
              organizationId: this.organizationInfo.id,
              appName: this.wechatInfoForm.appName,
              logoUrl: this.wechatInfoForm.logoUrl,
              content: this.wechatInfoForm.content
            }
            this.$http.post('/v1/OrganizationWechatAppInfo/addOrganizationWechatAppInfo', param).then(res => {
              this.wechatInfoForm.organizationId = this.organizationInfo.id
              this.$message.success('新增自定义公众号信息成功')
            }).finally(() => {
              this.wechatInfoFormSubmitLoading = false
            })
          }
        }
      })
    },
    handleBeforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过1M!')
      }
      return isJPG && isLt2M
    },
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          if (!this.wechatInfoForm.logoUrl) {
            this.wechatInfoForm.logoUrl = null
          }
          res.data.forEach(item => {
            this.wechatInfoForm.logoUrl = item.downloadPath
            // 处理回显数据
            this.wechatInfoForm.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.wechatInfoForm.logoUrl = null
      this.wechatInfoForm.imgList = fileList
    },
    // 绑定微信服务号
    handleBindWeChatService() {
      this.weChatServiceDialogVisible = true
    },
    // 时间格式化处理
    getNowFormatDate(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let strDate = date.getDate()
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate
      }
      let h = date.getHours()
      h = h < 10 ? '0' + h : h
      let min = date.getMinutes()
      min = min < 10 ? '0' + min : min
      let s = date.getSeconds()
      s = s < 10 ? '0' + s : s

      let currentdate = year + '-' + month + '-' + strDate + ' ' + h + ':' + min + ':' + s
      return currentdate
    },
    // 查看该机构是否完成服务号配置
    _getAuthorize() {
      this.$http.get(`v1/ThirdParty/isAuthorize?organizationId=${this.organizationInfo.id}`).then(res => {
        if (res.data.code === '000000') {
          this.isAllowConfig = true
        } else if (res.data.code === '-1') {
          this.$message.warning(res.data.msg)
        } else if (res.data.code === '-2') {
          this.isAllowConfig = true
          this.$message.warning(res.data.msg)
        }
      })
    },
    // 立即授权
    handleAuthorization() {
      this.authorizationLoading = true
      this.$http.get(`/v1/ThirdParty/authorize?organizationId=${this.organizationInfo.id}`).then(res => {
        window.open(res.data.url)
      }).finally(() => {
        this.authorizationLoading = false
      })
    },
    // 提交
    handleWeChatSubmit() {
      if (this.weChatService.authenticate !== 1 || this.weChatService.applicationTemplate !== 1) {
        return this.$message.warning('请先拥有微信认证的服务号和申请服务号模板消息')
      }
      if (!localStorage.getItem('we_chat_auth_code')) {
        return this.$message.warning('请同意公众平台帐号授权')
      }
      if ((!localStorage.getItem('auth_time') || new Date(localStorage.getItem('auth_time')).getTime() / 1000 + Number(localStorage.getItem('we_chat_expires_in'))) < (new Date().getTime() / 1000)) {
        localStorage.removeItem('we_chat_auth_code')
        localStorage.removeItem('auth_time')
        return this.$message.warning('授权已过期，请重新授权')
      }
      this.weChatSubmitLoading = true
      const param = {
        organizationId: this.organizationInfo.id,
        authCode: localStorage.getItem('we_chat_auth_code'),
        expiresIn: localStorage.getItem('we_chat_expires_in')
      }
      this.$http.get('/v1/ThirdParty/getAuthorizationCode', param).then(res => {
        if (res.message === 'waiting') {
          this.$message.info('正在处理中，请等待处理结果')
          this.weChatServiceDialogVisible = false
          setTimeout(() => {
            this._getAuthorizationResult()
          }, 1000)
        } else {
          this.$message.success('微信服务号绑定成功')
          this.isAllowConfig = true
          this.handleWeChatClose()
          localStorage.removeItem('we_chat_auth_code')
          localStorage.removeItem('we_chat_expires_in')
          localStorage.removeItem('auth_time')
        }
      }).finally(() => {
        this.weChatSubmitLoading = false
      })
    },
    _getAuthorizationResult() {
      this.$http.get(`/v1/ThirdParty/getAuthorizationResult?organizationId=${this.organizationInfo.id}`).then(res => {
        this.isAllowConfig = true
        this.handleWeChatClose()
        this.$message.success('微信服务号绑定成功')
        localStorage.removeItem('we_chat_auth_code')
        localStorage.removeItem('we_chat_expires_in')
        localStorage.removeItem('auth_time')
      })
    },
    // 取消
    handleWeChatClose() {
      this.weChatServiceDialogVisible = false
      this.weChatService = {
        authenticate: null, // 认证
        applicationTemplate: null // 申请模板
      }
    }
  },
  watch: {
    weChatServiceDialogVisible() {
      if (this.weChatServiceDialogVisible) {
        this.setInterval = setInterval(() => {
          this.authCodeValidTime = localStorage.getItem('auth_time')
          if (this.authCodeValidTime) {
            let againTime = new Date(localStorage.getItem('auth_time')).getTime() + Number(localStorage.getItem('we_chat_expires_in') * 1000)
            this.againGetAuthTime = this.getNowFormatDate(new Date(againTime))

            // 判断是否过期
            if ((new Date(localStorage.getItem('auth_time')).getTime() / 1000 + Number(localStorage.getItem('we_chat_expires_in'))) < (new Date().getTime() / 1000)) {
              localStorage.removeItem('we_chat_auth_code')
              localStorage.removeItem('auth_time')
              this.authCodeValidTime = null
            }
          }
        }, 1000)
      } else {
        if (this.setInterval) {
          clearInterval(this.setInterval)
        }
      }
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.organization-info
  padding 5px 5px 5px 0
  .info-wrapper
    background-color #ffffff
    padding-bottom 10px
    position relative
.schoolBtn {
  text-align center
  width 260px
  padding 15px
}
.wechatInfo-wrapper
  margin-top 10px
  .tips
    margin 15px 0 15px 15px
    border 1px dashed $color-primary
    border-radius 5px
    padding 15px 15px 5px 15px
    ul
      li
        font-size 13px
        color $color-primary
        margin-bottom 5px
.title
  height 40px
  line-height 40px
  margin-bottom 10px
  font-size 15px
  font-weight bold
  padding-left 15px
  border-bottom 1px dashed #dddddd
.QrCode
  position absolute
  top 60px
  // left 760px
  right 16%
  text-align center
  padding 10px 20px
  box-shadow 0px 0px 2px #cccccc
  .title
    text-align center
    font-size 14px
    margin 4px 0px
  .prompt
    color #ff6600
.we-chat-serve
  margin 10px 0px 0px 0px
  padding 10px 0px
  background #ffffff
.weChat-authorization
  .step
    margin-bottom 22px
    .prompt
      margin-bottom 12px
    .handle
      padding-left 14px
.auth
  font-size 12px
  .auth-success
    font-size 14px
    color $color-primary
    margin-right 10px
</style>

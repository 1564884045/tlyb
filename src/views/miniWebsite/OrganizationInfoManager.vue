<!-- 关于机构（机构信息） -->
<template>
  <div class="container">
    <div class="form-content">
<!--      <div class="QrCode">-->
<!--        <qrcode class="micro-web-QrCode" :value="microWebQrCode" tag="img" :options="{ width: 125, margin: 0}"/>-->
<!--        <div class="title">微官网二维码</div>-->
<!--        <div class="prompt">仅能使用微信扫码</div>-->
<!--      </div>-->
      <el-form :model="introduceForm" :rules="introduceFormRules" ref="introduceForm" label-width="100px" style="width: 560px">
        <el-form-item label="机构LOGO" prop="logoUrl">
          <el-upload
            :action="imgUploadPath"
            accept="image/*"
            list-type="picture-card"
            :show-file-list="true"
            :limit="1"
            :file-list="introduceForm.imgList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" style="color:#409EFF;">建议大小：1M以内（200*200）,只能上传1张图哦！</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="机构电话" prop="phone" style="width:350px">
          <el-input v-model="introduceForm.phone" :maxlength="13"></el-input>
        </el-form-item>
        <el-form-item label="机构邮箱" prop="email" style="width:350px">
          <el-input v-model="introduceForm.email" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="机构地址" prop="address">
          <el-input v-model="introduceForm.address" type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="机构简介" prop="profile">
          <el-input v-model="introduceForm.profile" rows="8" type="textarea" maxlength="255" show-word-limit placeholder="请输入机构简介"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="submitForm('introduceForm')">确认提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import QRCode from '@/components/QRCode'
export default {
  name: 'MiniWebsiteOrganizationInfoManager',
  components: {
    [QRCode.name]: QRCode
  },
  data() {
    return {
      introduceForm: {
        id: 0,
        phone: '',
        logoUrl: null,
        imgList: [],
        address: '',
        profile: '',
        email: null
      },
      introduceFormRules: {
        phone: {
          required: true,
          message: '请输入机构电话号码',
          trigger: 'blur'
        },
        address: { required: true, message: '请输入机构地址', trigger: 'blur' },
        logoUrl: { required: true, message: '请上传机构LOGO', trigger: 'blur' },
        profile: { required: true, message: '请输入机构简介', trigger: 'blur' }
      },
      submitLoading: false,
      // 上传图片的地址
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo', // 所属机构ID
      'currentBranch' // 所属分校ID
    ])
  },
  // 生命周期 - 创建完成
  created() {
    this._getOrganizationInfo()
    // this.createQRCode() // 生成微官网二维码
  },
  // 相关方法
  methods: {
    // 生成微官网二维码
    createQRCode() {
      this.microWebQrCode = `http://192.168.3.22:8091/#/MicroWeb?organizationId=${this.organizationInfo.id}`
    },
    // 获取列表
    _getOrganizationInfo() {
      this.$http
        .get('/v1/MiniWebsiteOrganizationInfo/getMiniWebsiteOrganizationInfoById', {
          id: this.organizationInfo.id
        })
        .then(res => {
          console.log(res)
          if (res.data) {
            const getUploadList = [{ name: 'default.png', url: res.data.logo }]
            this.introduceForm = {
              id: res.data.id,
              phone: res.data.phone,
              logoUrl: res.data.logo,
              imgList: getUploadList,
              address: res.data.address,
              profile: res.data.profile,
              email: res.data.email
            }
          }
        })
    },
    // 图片上传之前
    handleBeforeUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 1
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过2M!')
      }
      return isJPG && isLt2M
    },
    // 图片上传成功
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          if (!this.introduceForm.logoUrl) {
            this.introduceForm.logoUrl = null
          }
          res.data.forEach((item) => {
            this.introduceForm.logoUrl = item.downloadPath
            // 处理回显数据
            this.introduceForm.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.introduceForm.logoUrl = null
      this.introduceForm.imgList = fileList
    },
    // 新增、更新
    submitForm() {
      this.$refs.introduceForm.validate((valid) => {
        // 填写邮箱后，验证邮箱格式是否正确
        if (this.introduceForm.email) {
          const mailReg = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          if (!mailReg.test(this.introduceForm.email)) {
            return this.$message.warning('请填写正确的邮箱格式')
          }
        }
        if (valid) {
          this.submitLoading = true
          const params = {
            organizationId: this.organizationInfo.id, // 所属机构ID
            departmentId: this.currentBranch.id, // 所属分校ID
            address: this.introduceForm.address, // 机构地址
            logo: this.introduceForm.logoUrl, // 机构logo
            phone: this.introduceForm.phone, // 机构电话
            profile: this.introduceForm.profile, // 机构简介
            email: this.introduceForm.email // 机构邮箱
          }
          if (this.introduceForm.id) {
            // 更新
            params.id = this.introduceForm.id
            this.$http
              .put(
                '/v1/MiniWebsiteOrganizationInfo/updateMiniWebsiteOrganizationInfo',
                params
              )
              .then((res) => {
                this.$message.success('更新成功')
              }).finally(() => {
                this.submitLoading = false
              })
          } else {
            // 新增
            this.$http.post('/v1/MiniWebsiteOrganizationInfo/addMiniWebsiteOrganizationInfo', params)
              .then((res) => {
                this.$message.success('提交成功')
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        }
      })
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  width 100%
  height 100%
.btns
  margin-bottom 15px
  background-color #ffffff
  padding 15px
.form-content
  background-color #ffffff
  padding-bottom 10px
  padding-top 20px
.head
  color #FF6600
  font-size 16px
.QrCode
  position absolute
  top 24px
  left 700px
  text-align center
  padding 10px 20px
  box-shadow 0px 0px 2px #cccccc
  .title
    text-align center
    font-size 14px
    margin 4px 0px
  .prompt
    color #ff6600
</style>

<template>
  <el-form v-loading="queryLoading" :model="printInfo" ref="printInfo" :rules="rules" label-width="120px" class="print-setting-wrapper">
    <el-form-item prop="logo" label="机构logo" class="uploader-wrapper">
      <el-upload
        class="avatar-uploader"
        :action="uploadUrl"
        accept="image/*"
        :show-file-list="false"
        :on-success="handleLogoSuccess"
        :before-upload="beforeImageUpload">
        <img v-if="printInfo.logo" :src="printInfo.logo" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <div class="right-tip">
        <el-button icon="el-icon-delete" @click="handleDeleteLogo"></el-button>
        <ul class="bottom-top">
          <li>建议尺寸800*800像素，图片支持JPEG、JPG、PNG格式</li>
          <li>请尽量试用文字logo或镂空的logo</li>
        </ul>
      </div>
    </el-form-item>
    <template>
      <el-form-item label="校区信息">
        <div class="default-depinfo-wrapper">
          <el-alert title="复用当前校区数据到打印配置信息后，需点击【保存配置信息】按钮提交数据才会生效。" type="warning" :closable="false"></el-alert>
          <ul>
            <li>校区名称：<label>{{currentBranchInfo.name}}</label></li>
            <li>校区电话：<label>{{currentBranchInfo.phone}}</label></li>
            <li>校区地址：<label>{{currentBranchInfo.address}}</label></li>
          </ul>
          <div class="btn">
            <el-button type="primary" plain @click="initDefaultInfo()">复用当前校区数据到打印配置信息</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="departmentName" label="校区名称">
        <el-input v-model="printInfo.departmentName" placeholder="请填写校区名称" :maxlength="30" style="width: 280px"></el-input>
      </el-form-item>
      <el-form-item prop="phone" label="校区电话">
        <el-input v-model="printInfo.phone" placeholder="请填写校区电话" :maxlength="20" style="width: 280px"></el-input>
      </el-form-item>
      <el-form-item prop="servicePhone" label="座机或备用电话">
        <el-input v-model="printInfo.servicePhone" placeholder="请填校区座机或备用电话" :maxlength="20" style="width: 280px"></el-input>
      </el-form-item>
      <el-form-item prop="departmentAddress" label="校区地址">
        <el-input v-model="printInfo.departmentAddress" type="textarea" :rows="4" :maxlength="100" show-word-limit placeholder="请填写校区地址" style="width: 42%"></el-input>
      </el-form-item>
    </template>
    <el-form-item prop="wechatQrCode" label="校区二维码" class="uploader-wrapper">
      <el-upload
        class="avatar-uploader"
        :action="uploadUrl"
        accept="image/*"
        :show-file-list="false"
        :on-success="handleQrCodeSuccess"
        :before-upload="beforeImageUpload">
        <img v-if="printInfo.wechatQrCode" :src="printInfo.wechatQrCode" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <div class="right-tip">
        <el-button icon="el-icon-delete" @click="handleDeleteQrCode"></el-button>
        <ul class="bottom-top">
          <li>可上传黑白色的微信公众号二维码</li>
          <li>主要作用是如果机构有自己的公众号，为了方便家长在小票中能直接看到公众号二维码，并且方便家长关注，那么可以在此处设置即可。</li>
        </ul>
      </div>
    </el-form-item>
    <el-form-item prop="studentQrFlg" label="显示学员二维码">
      <el-switch v-model="printInfo.studentQrFlg" :width="54" size="mini" :active-value="1" :inactive-value="0"></el-switch>
      <p class="tip">是否在小票中显示给家长需要绑定的学员的二维码，用于【校讯帮】中</p>
    </el-form-item>
      <el-form-item prop="appendInfo" label="附加信息">
        <el-input v-model="printInfo.appendInfo" type="textarea" :rows="8" :maxlength="200" show-word-limit placeholder="可填写报名须知，近期宣传或者祝福语" style="width: 42%"></el-input>
      </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit" :loading="submitLoading">保存配置信息</el-button>
    </el-form-item>
    <!-- 提醒机构购买设备 -->
    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      width="30%">
      <div class="mini-program">
        <span><i class="el-icon-warning"></i> 您当前还没配置打印相关。如果需要购买打票机，请使用微信扫描下方小程序二维码进行购买。</span>
        <img src="../../assets/mini_program.jpg" alt="图片加载中">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>

<script>
export default {
  name: 'PrintSetting',
  data() {
    return {
      dialogVisible: false,
      queryLoading: false,
      submitLoading: false,
      currentBranchInfo: null, // 当前校区信息
      printInfo: {
        id: null,
        logo: '', // 校区logo地址
        departmentName: null,
        phone: null, // 联系电话
        servicePhone: null, // 座机或其他联系电话
        departmentAddress: '',
        wechatQrCode: '', // 校区微信公众号二维码
        studentQrFlg: 1, // 是否在小票展示学员二维码 0-否，1-是
        appendInfo: null // 附件信息
      },
      rules: {
        departmentName: { required: true, message: '请填写校区名称', trigger: 'blur' },
        phone: { required: true, message: '请填写校区手机号', trigger: 'blur' }
      },
      uploadUrl: process.env.VUE_APP_UPLOAD_URL
    }
  },
  created() {
    this.currentBranchInfo = this.$store.getters.currentBranch
    // this.initDefaultInfo()
    this._getPrintSetting()
  },
  methods: {
    // 初始化默认数据(在机构未设置打印设置的情况下)
    initDefaultInfo() {
      if (this.currentBranchInfo) {
        this.printInfo.departmentName = this.currentBranchInfo.name
        this.printInfo.phone = this.currentBranchInfo.phone
        this.printInfo.departmentAddress = this.currentBranchInfo.address
      }
    },
    _getPrintSetting() {
      this.queryLoading = true
      this.$http.get('/v1/PrintSetting/getPrintSettingByOrgId', {
        orgId: this.$store.getters.organizationInfo.id,
        depId: this.$store.getters.currentBranch.id
      }).then(res => {
        if (res.data) {
          for (const key in this.printInfo) {
            if (res.data.hasOwnProperty(key)) {
              this.printInfo[key] = res.data[key]
            }
          }

          sessionStorage.setItem('iTK_print_conf', JSON.stringify(this.printInfo))
        } else {
          this.dialogVisible = true
        }
      }).finally(() => {
        this.queryLoading = false
      })
    },
    beforeImageUpload(file) {
      const isJPG = file.type.split('/')[0] === 'image'
      const isLt1M = file.size / 1024 < 500

      if (!isJPG) {
        this.$message.error('上传文件只能是图片格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传头像图片大小不能超过 500K!')
      }
      return isJPG && isLt1M
    },
    handleLogoSuccess(res) {
      if (res.code === '000000' && res.data.length > 0) {
        this.printInfo.logo = res.data[0].downloadPath
      }
    },
    handleQrCodeSuccess(res) {
      if (res.code === '000000' && res.data.length > 0) {
        this.printInfo.wechatQrCode = res.data[0].downloadPath
      }
    },
    submit() {
      if (this.queryLoading) return
      this.$refs.printInfo.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const params = Object.assign({}, this.printInfo)
          if (params.id) {
            this.$http.put('/v1/PrintSetting/updatePrintSetting', params).then(res => {
              this.$message.success('提交打印配置成功！')
              sessionStorage.setItem('iTK_print_conf', JSON.stringify(params))
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 增加
            params.organizationId = this.$store.getters.organizationInfo.id
            params.departmentId = this.$store.getters.currentBranch.id
            this.$http.post('/v1/PrintSetting/addPrintSetting', params).then(res => {
              this.$message.success('提交打印配置成功！')
              sessionStorage.setItem('iTK_print_conf', JSON.stringify(params))
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    handleDeleteLogo() {
      if (!this.printInfo.logo || !this.printInfo.id) return

      this.$http.put('/v1/PrintSetting/updatePrintSetting', {
        id: this.printInfo.id,
        logo: ''
      }).then(res => {
        this.printInfo.logo = ''
      })
    },
    handleDeleteQrCode() {
      if (!this.printInfo.wechatQrCode || !this.printInfo.id) return

      this.$http.put('/v1/PrintSetting/updatePrintSetting', {
        id: this.printInfo.id,
        wechatQrCode: ''
      }).then(res => {
        this.printInfo.wechatQrCode = ''
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
>>>.el-dialog__body
  padding 0px 20px
.mini-program
  span
    line-height 30px
    padding 12px
    display inline-block
    color #E6A23C
    background-color: #fdf6ec
  img
    width 280px
    margin-left 50%
    transform translateX(-50%)
.tip
  font-size 13px
  color $color-text-3
  display inline-block
  margin-left 30px
</style>

<style lang="stylus">
.print-setting-wrapper
  background #ffffff
  padding 12px
  .avatar-uploader
    line-height 1
  .avatar-uploader .el-upload
    border 1px dashed #d9d9d9
    border-radius 6px
    cursor pointer
    position relative
    overflow hidden
  .avatar-uploader .el-upload:hover
    border-color #409EFF
  .avatar-uploader-icon
    font-size 28px
    color #8c939d
    width 138px
    height 138px
    line-height 138px
    text-align center
  .avatar
    width 138px
    height 138px
    display block
.uploader-wrapper
  .el-form-item__content
    display flex
  .right-tip
    margin-left 16px
    padding 2px 0
    box-sizing border-box
    position relative
  .bottom-top
    position absolute
    bottom 0
    left 0
    width 400px
    color $color-text-3
    font-size 13px
    line-height 1.6
    margin-left 16px
    li
      list-style-type disc
.default-depinfo-wrapper
  width 490px
  margin-bottom 15px
  padding 10px
  border 1px dashed #dddddd
  border-radius 5px
  ul
    margin-top 5px
    li
      color #888888
      font-size 14px
      margin-bottom 3px
      label
        color #555555
  .btn
    border-top 1px dashed #dddddd
    padding-top 10px
    display flex
    justify-content center
    align-items center
</style>

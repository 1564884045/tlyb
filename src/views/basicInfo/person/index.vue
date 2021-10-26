<!--  -->
<template>
  <el-dialog
    :title="'个人信息'"
    top="6vh"
    :visible.sync="showPersonInfo"
    :close-on-click-modal="false"
    append-to-body
    width="640px"
    @close="toggle(false)">
    <div class="person-info" v-loading="loading">
      <div class="avatar-area">
        <ul>
          <li>
            <div class="sex-badge">
              <sup v-if="staffData.sex === 2" class="sex-icon el-icon-female"/>
              <sup v-else-if="staffData.sex === 1" class="sex-icon el-icon-male"/>
              <div class="avatar" :style="{backgroundImage:`url(${avatar})`}"></div>
            </div>
          </li>
          <li><span style="font-weight: bold; font-size: 20px;">{{staffData.username}}</span></li>
          <li><el-button type="primary" @click="handleUpdateAvatar">修改头像</el-button></li>
        </ul>
      </div>
      <div class="detail-area">
        <el-row :gutter="20">
          <el-col :span="13">
            <p>
              <i class="el-icon-mobile-phone"></i>&nbsp;&nbsp;
              <label>手机号：</label>
              <span>{{staffData.phone || '未知'}}</span>
            </p>
            <p>
              <i class="el-icon-user"></i>&nbsp;&nbsp;
              <label>身份证号：</label>
              <span>{{staffData.idCard || '未知'}}</span>
            </p>
            <p>
              <i class="el-icon-s-cooperation"></i>&nbsp;&nbsp;
              <label>工号：</label>
              <span>{{staffData.userNo || '未知'}}</span>
            </p>
          </el-col>
          <el-col :span="11">
            <p>
              <i class="el-icon-office-building"></i>&nbsp;&nbsp;
              <label>所在部门：</label>
              <span>{{staffData.departmentName || '未知'}}</span>
            </p>
            <p>
              <i class="el-icon-s-check"></i>&nbsp;&nbsp;
              <label>人事状态：</label>
              <span>{{staffData.statusName || '未知'}}</span>
            </p>
            <p>
              <i class="el-icon-copy-document"></i>&nbsp;&nbsp;
              <label>工作性质：</label>
              <span>{{(staffData.employType.toString() === '0' && '兼职') || (staffData.employType.toString() === '1' && '全职') || (staffData.employType.toString() === '2' && '合作') || '未知'}}</span>
            </p>
          </el-col>
        </el-row>
      </div>
      <div class="divider-dashed"></div>
      <div class="jobtag-area">
        <p>岗位</p>
        <el-tag
          v-for="tag in staffData.roles.map(item => { return item.name })"
          :key="tag">
          {{tag}}
        </el-tag>
      </div>
      <div class="divider-dashed"></div>
      <div class="operation-area">
        <p>操作</p>
        <el-button type='primary' v-if="isSetPassword" @click="handleUpdatePwd">修改密码</el-button>
        <el-button type='primary' v-else @click="handleSetPwd">设置密码</el-button>
        <el-button type='primary' @click="handleFormEdit">修改个人信息</el-button>
        <el-button v-if="staffData.roles.length > 0 && staffData.roles[0].name === 'admin'" type='primary' @click="handleChangePhone">换绑手机号</el-button>
      </div>
    </div>

    <!-- 修改个人信息 -->
    <el-dialog
      :title="'修改个人信息'"
      :visible.sync="showEditDialog"
      width="480px"
      append-to-body
      :close-on-click-modal="false">
      <div style="display: flex; justify-content: center;">
        <el-form :model="staffForm" ref="formEdit" :rules="editFormRules" label-width="100px">
          <el-form-item label="姓名" prop="username" >
            <el-input v-model="staffForm.username" :maxlength="16" autocomplete="off"  style="width: 250px" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="sex" >
            <el-radio-group v-model="staffForm.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">未知</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="身份证号码" prop="idCard" >
            <el-input v-model="staffForm.idCard" autocomplete="off" style="width: 250px" placeholder="请输入身份证号码"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button @click="handleFormBack">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSubmitForm" :loading="submitLoading">提&nbsp;交</el-button>
      </span>
    </el-dialog>
    <!-- 修改密码 -->
    <el-dialog
      :visible.sync="showUpdatePwd"
      title="修改密码"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      append-to-body
      width="440px">
      <el-form ref="updatePwdForm" :model="updatePwdForm" :rules="updatePwdRules" label-width="88px">
        <el-form-item label="原始密码" prop="oldPwd">
          <el-input type="password" v-model.trim="updatePwdForm.oldPwd" placeholder="请输入原始密码" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model.trim="updatePwdForm.password" placeholder="6-20位字符，包含字母、数字" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="againPwd">
          <el-input type="password" v-model.trim="updatePwdForm.againPwd" placeholder="请再次确认密码" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showUpdatePwd = false">取 消</el-button>
        <el-button type="primary" :loading="updatePwdLoading" @click="submitUpdatePwd">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 上传头像 -->
    <cropper-dialog
      ref="cropperDialog"
      v-model="showUploadAvatar"
      :options="{ aspectRatio: 1 }"
      title="上传头像"
      :maxSize="1024 * 1024"
      @uploadSizeLimit="handleUploadSizeLimit"
      @uploadComplete="handleUploadAvatar"
    />
    <!-- 换绑手机号 -->
    <el-dialog
      :title="'换绑手机号'"
      :visible.sync="showChangePhoneDialog"
      width="480px"
      append-to-body
      :close-on-click-modal="false">
      <div style="display: flex; justify-content: center;">
        <el-form :model="changePhoneForm" ref="formChangePhoneEdit" :rules="editChangePhoneFormRules" label-width="100px">
          <el-form-item label="当前手机号" prop="oldPhone" >
            <AreaCode ref="myFrishChild"></AreaCode>
            <el-input v-model="staffData.phone" :disabled="true" :maxlength="16" autocomplete="off"  style="width: 250px" placeholder="请输入当前手机号"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="currentAdminSmsCode">
            <el-input v-model.trim="changePhoneForm.currentAdminSmsCode" @keyup.enter.native="handleApplySubmit" placeholder="请填写短信验证码" maxlength="6" autocomplete="off">
              <el-button slot="append" class="sms-btn" @click="getSmsCode1" :disabled="loadingSms1 || smsCount1 < 60">{{countMsg1}}</el-button>
            </el-input>
          </el-form-item>
          <el-form-item label="新手机号" prop="newPhone" >
            <AreaCode ref="mychild" @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
            <el-input v-model="changePhoneForm.newPhone" autocomplete="off" style="width: 250px" placeholder="请输入新手机号"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="newAdminSmsCode">
            <el-input v-model.trim="changePhoneForm.newAdminSmsCode" @keyup.enter.native="handleApplySubmit" placeholder="请填写短信验证码" maxlength="6" autocomplete="off">
              <el-button slot="append" class="sms-btn" @click="getSmsCode2" :disabled="loadingSms2 || smsCount2 < 60">{{countMsg2}}</el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button @click="handleChangePhoneFormBack">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSubmitChangePhoneForm" :loading="submitLoading">确&nbsp;定</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import maleAvatar from '@/assets/male-small.jpg'
import famaleAvatar from '@/assets/famale-small.jpg'
import { passwordValidator } from '@/utils/validate'
import { mapGetters } from 'vuex'

import CropperDialog from '@/components/CropperDialog'
import AreaCode from '@/components/PhoneAreaCode'
import { PhoneAreaCode } from '@/utils/storage'

export default {
  name: 'PersonInfo',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  components: { CropperDialog, AreaCode },
  computed: {
    avatar() {
      return this.tempAvatar || this.staffData.avatar || (this.staffData.sex === 2 ? famaleAvatar : maleAvatar)
    },
    countMsg1() {
      if (this.loadingSms1) {
        return '正在获取验证码'
      }
      if (this.smsCount1 >= 60) {
        return '获取短信验证码'
      }
      return `重新获取(${this.smsCount1}s)`
    },
    countMsg2() {
      if (this.loadingSms2) {
        return '正在获取验证码'
      }
      if (this.smsCount2 >= 60) {
        return '获取短信验证码'
      }
      return `重新获取(${this.smsCount2}s)`
    },
    ...mapGetters([
      'userInfo',
      'organizationInfo'
    ])
  },
  watch: {
    value(val) {
      this.showPersonInfo = val
      if (val) {
        this._getData()
        this.$http.get('/v1/User/hasPwd')
          .then(res => {
            this.isSetPassword = res.data
          })
      }
    }
  },
  data () {
    return {
      // 更换手机号相关
      changePhoneForm: {
        currentAdminSmsCode: '',
        newAdminSmsCode: '',
        newPhone: ''
      },
      loadingSms1: false,
      loadingSms2: false,
      smsCount1: 60,
      smsCount2: 60,
      // 更换手机号相关
      isSetPassword: false,
      showPersonInfo: this.value,
      showUpdatePwd: false,
      updatePwdLoading: false,
      showEditDialog: false,
      showChangePhoneDialog: false,
      showUploadAvatar: false,
      maleAvatar,
      famaleAvatar,
      loading: false,
      submitLoading: false,
      staffData: {
        id: null,
        avatar: '', // 头像
        username: '', // 名字
        phone: '', // 手机号
        userNo: '', // 用户编号
        sex: '', // 性别（0-未知，1-男，2-女）
        userLogo: 0, // 是否为授课教师（0-否，1-是）
        statusName: '', // 人事状态ID
        departmentName: '', // 所属部门ID
        idCard: '', // 身份证号
        employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
        roles: [] // 岗位列表
      },
      tempAvatar: '',
      staffForm: {
        username: '',
        sex: 0,
        idCard: ''
      },
      editFormRules: {
        usernames: [
          { type: 'string', max: 16, message: '长度最多16位', trigger: 'blur' }
        ],
        idCard: [
          { type: 'string', len: 18, message: '请输入正确的身份证号码', trigger: 'blur' }
        ]
      },
      updatePwdForm: {
        oldPwd: '',
        password: '',
        againPwd: ''
      },
      updatePwdRules: {
        oldPwd: { required: true, message: '请填写原始密码', trigger: 'blur' },
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { validator: passwordValidator, trigger: 'blur' },
          { trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value && value === this.updatePwdForm.oldPwd) {
                callback(new Error('新密码不能和原始密码相同'))
              } else {
                callback()
              }
            }
          }
        ],
        againPwd: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('请再次输入密码'))
            } else if (value !== this.updatePwdForm.password) {
              callback(new Error('两次输入密码不一致!'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
          }
        ]
      },
      editChangePhoneFormRules: {
        currentAdminSmsCode: { required: true, message: '当前手机号验证码不能为空', trigger: 'blur' },
        newAdminSmsCode: { required: true, message: '新手机号验证码不能为空', trigger: 'blur' },
        newPhone: { required: true, message: '新手机号不能为空', trigger: 'blur' }
      }
    }
  },
  methods: {
    _getData() {
      if (this.userInfo['id']) {
        this.loading = true
        this.$http.get('/v1/User/getUserById', { id: this.userInfo.id })
          .then(res => {
            // 设置用户信息
            // this.$store.commit('setUserInfo', res.data)
            // 赋值
            this.staffData = res.data
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.changePhoneForm.phoneAreaCode = info
    },
    // 超出上传大小
    handleUploadSizeLimit() {
      this.$message.error('上传头像的大小，限制为1M')
    },
    // 上传头像的回调
    handleUploadAvatar(res) {
      this.staffData.avatar = res.url
      this.tempAvatar = res.tempUrl
      let params = {
        id: this.staffData.id,
        avatar: res.url,
        organizationId: this.organizationInfo.id
      }
      // Object.assign({}, this.staffData)
      this.$http.put('/v1/User/updateUser', params)
        .then(() => {
          this.$message.success('头像修改成功！')
          this._getData()
        })
    },
    // 选择图片
    handleUpdateAvatar() {
      this.$refs.cropperDialog.select()
    },
    handleFormEdit() {
      this.staffForm.username = this.staffData.username
      this.staffForm.sex = this.staffData.sex
      this.staffForm.idCard = this.staffData.idCard
      this.showEditDialog = true
    },
    // 换绑手机号
    handleChangePhone() {
      this.showChangePhoneDialog = true
      const that = this
      console.log(that.staffData.phoneAreaCode)
      setTimeout(function () { that.$refs.myFrishChild.setAreaCode(that.staffData.phoneAreaCode) }, 100)
      this.changePhoneForm.phoneAreaCode = PhoneAreaCode.getCheck()
    },
    handleSubmitForm() {
      let params = Object.assign({}, this.staffForm)
      params.id = this.staffData.id
      params.organizationId = this.organizationInfo.id
      this.$refs['formEdit'].validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$http.put('/v1/User/updateUser', params)
            .then(() => {
              this.$message.success('个人信息修改成功！')
              this.showEditDialog = false
              this._getData()
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          return false
        }
      })
    },
    handleSubmitChangePhoneForm () {
      let params = Object.assign({}, {
        phone: this.changePhoneForm.newPhone,
        currAdminSmsCode: this.changePhoneForm.currentAdminSmsCode,
        newAdminSmsCode: this.changePhoneForm.newAdminSmsCode,
        phoneAreaCode: this.changePhoneForm.phoneAreaCode
      })
      this.$refs['formChangePhoneEdit'].validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$http.get('/v1/ReBandOrganizationUser/reBand', params)
            .then(() => {
              this.$message.success('换绑手机号成功！')
              this.showEditDialog = false
              this._getData()
              this.$store.dispatch('logout')
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          return false
        }
      })
    },
    handleFormBack () {
      this.showEditDialog = false
    },
    handleChangePhoneFormBack () {
      this.showChangePhoneDialog = false
    },
    toggle (val) {
      this.$emit('toggle', val)
    },
    handleUpdatePwd() {
      this.showUpdatePwd = true

      this.$nextTick(() => {
        this.$refs.updatePwdForm && this.$refs.updatePwdForm.resetFields()
      })
    },
    handleSetPwd() {
      this.$store.commit('toggleShowSetPwd', true)
    },
    submitUpdatePwd() {
      if (this.updatePwdLoading || !this.showUpdatePwd) return
      this.$refs.updatePwdForm.validate((valid) => {
        if (valid) {
          this.updatePwdLoading = true
          this.$http.put('/v1/User/resetPassword', null, {
            params: { newPassword: this.updatePwdForm.password, oldPassword: this.updatePwdForm.oldPwd }
          }).then(() => {
            this.$message.success('重置密码成功')
            setTimeout(() => {
              // this.$store.dispatch('logout')
              // 直接刷新页面
              window.location.reload()
            }, 500)
          }).finally(() => {
            this.updatePwdLoading = false
          })
        }
      })
    },
    getSmsCode1() {
      if (this.loadingSms1) return
      if (this.smsCount1 < 60) return
      this.loadingSms1 = true
      this.$http.get('/v1/sendSmsTransferVerification', {
        phone: this.staffData.phone,
        phoneAreaCode: this.staffData.phoneAreaCode
      }).then(() => {
        this.$message.success('发送验证码成功！')
        this.startCountDown1()
      }).finally(() => {
        this.loadingSms1 = false
      })
    },
    getSmsCode2() {
      if (this.loadingSms2) return
      if (this.smsCount2 < 60) return
      this.loadingSms2 = true
      this.$http.get('/v1/sendSmsTransferVerification', {
        phone: this.changePhoneForm.newPhone,
        phoneAreaCode: this.changePhoneForm.phoneAreaCode
      }).then(() => {
        this.$message.success('发送验证码成功！')
        this.startCountDown2()
      }).finally(() => {
        this.loadingSms2 = false
      })
    },
    startCountDown1() {
      this.smsCount1--
      this.timer1 = setInterval(() => {
        if (this.smsCount1 > 0) {
          this.smsCount1--
        } else {
          this.smsCount1 = 60
          clearInterval(this.timer1)
          this.timer1 = null
        }
      }, 1000)
    },
    stopCountDown1() {
      if (this.timer1) {
        clearInterval(this.timer1)
        this.timer1 = null
      }
      this.smsCount1 = 60
    },
    startCountDown2() {
      this.smsCount2--
      this.timer2 = setInterval(() => {
        if (this.smsCount2 > 0) {
          this.smsCount2--
        } else {
          this.smsCount2 = 60
          clearInterval(this.timer2)
          this.timer2 = null
        }
      }, 1000)
    },
    stopCountDown2() {
      if (this.timer2) {
        clearInterval(this.timer2)
        this.timer2 = null
      }
      this.smsCount2 = 60
    }
  }
}

</script>

<style lang='stylus' scoped>
.divider-dashed {
    background: none;
    border: dashed #e8e8e8;
    border-width: 1px 0 0;
    margin 24px 0px
}
.person-info
  background-color #fff
  width 600px
  .avatar-area
    text-align center
    .sex-badge
      display inline-block
      .sex-icon
        border-radius 50%
        padding 1px
        position relative
        left 56px
        top 36px
        background-color red
        font-weight bold
        color #fff
    .avatar
      width 120px
      height 120px
      border-radius 50%
      background-size cover
      background-position center
      background-repeat no-repeat
    ul li
      margin-bottom 10px
  .detail-area
    margin-top 24px
    .el-row
      p
        margin-bottom 10px
      p:last-child
        margin-bottom 0px
  .jobtag-area
    p
      margin-bottom 10px
    .el-tag
      margin-right 10px
    .el-tag:last-child
      margin-right 0px
  .operation-area
    p
      margin-bottom 10px
</style>

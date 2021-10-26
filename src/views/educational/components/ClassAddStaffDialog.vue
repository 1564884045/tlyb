<template>
  <!-- 添加员工 -->
  <el-dialog :title="'新增员工'" :visible="visible" width="742px" top="6vh" :show-close="false" append-to-body>
    <el-form ref="staffForm" :model="staffForm" :rules="staffRules" class="staff-form" label-width="80px">
      <div class="avatar-wrapper" prop="avatar" label-width="0">
          <div class="avatar-pic">
            <img :src="staffForm.tempAvatar || staffForm.avatar"/>
            <a @click="toSelectAvatar" size="mini">选择头像</a>
          </div>
            <p class="form-item-tip">建议尺寸: 200x200，图片大小限制1M</p>
        </div>

        <el-form-item label="姓名" prop="username">
          <el-input v-model="staffForm.username" placeholder="请输入员工姓名" :maxlength="20"/>
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="staffForm.sex" @change="handleSexChange">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="手机号码" prop="phone" :style="{'margin-bottom': staffForm.roles && staffForm.roles.includes('0') ? '0' : '24px'}">
          <AreaCode ref="mychild" @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
          <el-input style="width: 150px" v-model="staffForm.phone" :disabled="staffForm.roles && staffForm.roles.includes('0')" placeholder="请输入员工手机号码"/>
          <p v-if="staffForm.roles && staffForm.roles.includes('0')" class="form-item-tip" style="display: block; margin-left: 0;">【系统管理员】不能修改手机号</p>
        </el-form-item>

        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="staffForm.idCard" placeholder="请输入身份证号码"/>
        </el-form-item>
        <el-form-item label="员工编号" prop="userNo">
          <el-input v-model="staffForm.userNo" placeholder="请输入员工编号" :maxlength="36"/>
        </el-form-item>
        <el-form-item label="人事状态" prop="status">
          <el-select v-model="staffForm.status" :disabled="staffForm.roles && staffForm.roles.includes('0')">
            <el-option v-for="item in statusList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作性质" prop="employType">
          <el-select v-model="staffForm.employType">
            <el-option :value="0" label="兼职"></el-option>
            <el-option :value="1" label="全职"></el-option>
            <el-option :value="2" label="合作"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId">
          <department-select ref="departmentSelect" v-model="staffForm.departmentId"/>
          <el-popover
              width="200"
              trigger="hover">
              <p class="form-item-tip">无可选部门？请点击<a class="jump-link-text" @click="toDepartment">部门设置</a>进行添加</p>
              <i slot="reference" class="el-icon-circle-plus color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
        </el-form-item>
        <el-form-item label="岗位" prop="roles">
          <el-select v-model="staffForm.roles" :disabled="staffForm.roles && staffForm.roles.includes('0')" multiple filterable>
            <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
          <p v-if="staffForm.roles && staffForm.roles.includes('0')" class="form-item-tip">【系统管理员】不能修改所属岗位</p>
        </el-form-item>
        <el-form-item label="是否为授课老师" label-width="120px" prop="userLogo">
          <el-radio-group v-model="staffForm.userLogo" style="width: 200px;">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <el-popover
              width="200"
              trigger="hover">
              <p class="form-item-tip">设置上课教师，便于设置班级和排课时选择教师。</p>
              <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
        </el-form-item>
        <el-form-item label="查看所有校区" label-width="120px" prop="enableViewAllOrg">
          <el-radio-group v-model="staffForm.enableViewAllOrg" style="width: 200px;">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <el-popover
              width="200"
              trigger="hover">
              <p class="form-item-tip">默认不可查看其它校区。</p>
              <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
        </el-form-item>
        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker
            v-model="staffForm.entryTime"
            type="date"
            :editable="false"
            clearable
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择入职日期">
          </el-date-picker>
        </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="countermand()">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="saveStaff">确 定</el-button>
    </div>

    <cropper-dialog
      ref="cropperDialog"
      v-model="showUploadAvatar"
      :options="{ aspectRatio: 1 }"
      title="上传头像"
      :maxSize="1024 * 1024"
      @uploadSizeLimit="handleUploadSizeLimit"
      @uploadComplete="handleUploadAvatar"/>
  </el-dialog>
</template>

<script>
import MaleAvatar from '../../../assets/male-small.jpg'
import { phoneValidator, idCardValidator } from '../../../utils/validate'
import DepartmentSelect from '../../../components/DepartmentSelect'
import FaMaleAvatar from '../../../assets/famale-small.jpg'
import CropperDialog from '../../../components/CropperDialog'

import AreaCode from '@/components/PhoneAreaCode'
import { PhoneAreaCode } from '@/utils/storage'

import { mapGetters } from 'vuex'
export default {
  name: 'ClassAddStaffDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showUploadAvatar: false,
      roleList: [], // 岗位列表
      submitLoading: false,
      statusList: [], // 人事状态列表
      staffForm: {
        id: null,
        avatar: '', // 头像
        tempAvatar: MaleAvatar,
        username: '', // 名字
        phone: '', // 手机号
        userNo: '', // 用户编号
        sex: 1, // 性别
        userLogo: 1, // 是否为授课教师   0-否   1-是
        entryTime: null, // 入职时间
        status: '', // 人事状态ID
        departmentId: [], // 所属部门ID
        idCard: '', // 身份证号
        employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
        enableViewAllOrg: 0, // 是否查看所有校区
        roles: [], // 岗位列表
        phoneAreaCode: PhoneAreaCode.getCheck()
      },
      staffRules: {
        username: [
          { required: true, message: '请填写姓名', trigger: 'blur' },
          { max: 12, message: '姓名长度最多12位', trigger: ['change', 'blur'] }
        ],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'blur' },
          {
            validator: phoneValidator,
            message: '请填写正确的手机号',
            trigger: ['change', 'blur']
          }
        ],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        userNo: [
          { max: 20, message: '员工编号最多20位', trigger: ['change', 'blur'] }
        ],
        userLogo: [
          { required: true, message: '请选择是否为授课老师', trigger: 'blur' }
        ],
        enableViewAllOrg: {
          required: true,
          message: '请选择是否为授课老师',
          trigger: 'blur'
        },
        roles: { required: true, message: '请选择岗位', trigger: 'blur' },
        departmentId: [
          { required: true, message: '请选择所属部门', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择人事状态', trigger: 'blur' }
        ],
        idCard: [
          {
            validator: idCardValidator,
            message: '请填写正确的身份证号码',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  components: {
    DepartmentSelect,
    CropperDialog,
    AreaCode
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'userInfo',
      'currentBranch'
    ])
  },
  mounted() {
    // 获取岗位列表
    this._getRoleList()
    // 获取人事状态
    this._getStatusList()
  },
  methods: {
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.staffForm.phoneAreaCode = info
    },
    _getStatusList() {
      this.$http.get('/v1/dictionary/DicOrganizationUserStatus/getAll').then((res) => {
        this.statusList = res.data
      })
    },
    // 路由到组织框架 新增部门
    toDepartment() {
      this.$parent.showClassAddStaffDialog = false
      // this.saveDialogContent = true
      this.$router.push('/executive/department')
    },
    // 性别改变事件
    handleSexChange(val) {
      if (!this.staffForm.avatar) {
        if (val === 2) {
          this.staffForm.tempAvatar = FaMaleAvatar
        } else {
          this.staffForm.tempAvatar = MaleAvatar
        }
      }
    },
    // 选择图片文件
    toSelectAvatar() {
      this.$refs.cropperDialog.select()
    },
    // 关闭
    countermand() {
      this.$emit('toggle', false)
      this.$refs.staffForm.resetFields()
      this.staffForm = {
        id: null,
        avatar: '', // 头像
        tempAvatar: MaleAvatar,
        username: '', // 名字
        phone: '', // 手机号
        userNo: '', // 用户编号
        sex: 1, // 性别
        userLogo: 1, // 是否为授课教师   0-否   1-是
        entryTime: null, // 入职时间
        status: '', // 人事状态ID
        departmentId: [], // 所属部门ID
        idCard: '', // 身份证号
        employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
        enableViewAllOrg: 0, // 是否查看所有校区
        roles: [] // 岗位列表
      }
    },
    // 获取岗位列表
    _getRoleList() {
      if (this.roleList.length > 0) return
      this.$http.get('/v1/Role/getRoleList', {
        organizationId: this.organizationInfo.id
      }).then((res) => {
        this.roleList = res.data
      })
    },
    // 超出上传大小
    handleUploadSizeLimit() {
      this.$message.error('上传头像的大小，限制为1M')
    },
    // 上传头像的回调
    handleUploadAvatar(res) {
      this.staffForm.avatar = res.url
      this.staffForm.tempAvatar = res.tempUrl
    },
    // 保存员工基本信息
    saveStaff() {
      if (this.submitLoading) return
      console.log(this.staffForm)
      this.$refs.staffForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          console.log(this.staffForm)
          const params = Object.assign({}, this.staffForm)
          // 处理部门
          if (params.departmentId.length) {
            if (params.departmentId.constructor === Array) {
              params.departmentId = params.departmentId[params.departmentId.length - 1]
            }
          } else {
            params.departmentId = ''
          }
          // 处理角色
          params.roles = params.roles.map(o => {
            return { id: o }
          })
          // 过滤为空字符串数据
          for (const key in params) {
            if (params.hasOwnProperty(key) && params[key] === '') {
              delete params[key]
            }
          }
          params.organizationId = this.organizationInfo.id
          // 添加员工基本信息
          this.$http.post('/v1/User/addUser', params).then(res => {
            if (res.message === '成功') {
              console.log(987)
              this.$message.success('添加员工信息成功！')
              this.$emit('success')
              this.countermand()
            }
          })
          this.submitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.staff-form
  .el-form-item
    margin-left 24px
    display inline-block
  .el-input, .el-select, .el-radio-group, .el-date-editor, .el-cascader
    width 240px
  .form-item-tip
    display inline-block
    margin-left 20px
    color $color-text-3
    font-size 13px
    a
      color $color-primary
.jump-link-text
  color $color-primary
  cursor pointer

.avatar-wrapper
  float right
  text-align center
  margin-right 48px

.avatar-pic
  width 120px
  height 120px
  border 1px dashed $color-border-2
  position relative
  background #ffffff
  border-radius 3px
  &:hover
    border-color $color-primary
  img
    width 100%
  a
    height 30px
    line-height 30px
    background rgba($color-primary, 0.2)
    text-align center
    position absolute
    bottom -1px
    left -1px
    right -1px
    color $color-primary
    &:hover
      background rgba($color-primary, 0.8)
      color #ffffff
  .form-item-tip
    font-size 12px
    margin-top 6px

.staff-detail
  display flex
  .main-info
    text-align center
    width 210px
    flex-shrink 0
    border-right 1px solid $color-border-3
    min-height 320px
    .avatar
      border-radius 5px
    .username
      margin 12px 0
      font-size 18px
      font-weight bold
  .more-info
    width 100%
    padding 0 30px
    margin 0
    li
      margin-bottom 12px
    label
      display inline-block
      min-width 80px
      color $color-text-3
      margin-right 6px
      text-align right
    span, a
      color $color-text-1
    .link
      color $color-primary

.upload-file
  .file-input
    display none
    visibility hidden
  .link
    margin-left 20px
  .el-input
    cursor pointer
.upload-err-tip
  margin-top 16px
  margin-bottom 16px
  color $color-warning
.upload-tip
  font-size 14px
  color $color-text-3
  padding-top 16px
  margin-top 20px
  border-top 1px dashed $color-border-1
  li
    line-height 1.5
    margin-bottom 4px
</style>

<style lang="stylus">
.import-staff-dialog
  min-height 48vh
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    font-size 16px
    color $color-text-1
    line-height 36px
    font-weight bold
  .close-btn
    position absolute
    right 16px
    top 9px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .el-dialog__body
    padding 20px 16px
</style>
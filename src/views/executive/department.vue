<template>
  <div class="department-wrapper">
    <el-button type="primary" @click="handleAddDepartment()" style="margin-bottom: 16px;">新建部门</el-button>
    <p class="tips">注：对校区信息的修改和管理，请前往<router-link class="link" to="/basicInfo?tab=schoolInfoMany">基础设置 -> 校区管理</router-link></p>
    <el-table
      :data="departmentList"
      row-key="id"
      border
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column
        prop="name"
        label="名称"
        sortable
        width="320">
        <span slot-scope="scope">
          <img :src="scope.row.type === 0 ? require('../../assets/icon_department.png') : require('../../assets/icon_branch.png')" width="14px" height="14px" style="vertical-align: middle; margin-right: 4px;"/>
          <span style="vertical-align: middle;">{{scope.row.name}}</span>
        </span>
      </el-table-column>
      <el-table-column
        prop="phone"
        label="负责人"
        width="180">
        <span slot-scope="scope" v-if="scope.row.userId">{{scope.row.username + '：' + scope.row.phone }}</span>
        <span v-else>-</span>
      </el-table-column>
      <el-table-column
        prop="servicePhone"
        label="服务电话"
        width="120">
        <template slot-scope="scope">
          <span>{{scope.row.servicePhone || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址">
        <template slot-scope="scope">
          <span>{{scope.row.address || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        align="center"
        width="60">
        <template slot-scope="scope">
          <span>{{scope.row.sort || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180">
        <template slot-scope="scope">
          <el-button type="text" @click="handleAddDepartment(scope.row)">添加子部门</el-button>
          <template v-if="scope.row.type === 0">
            <el-button type="text" @click="handleEditDepartment(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleDeleteDepartment(scope.row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 部门弹框 -->
    <el-dialog
      :visible.sync="showForm"
      :title="departmentForm.id ? '修改部门' : '添加部门'"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      width="560px">
      <el-form ref="departmentForm" :model="departmentForm" :rules="rules" label-width="88px" class="department-form">
        <el-form-item label="上一级" v-show="departmentForm.id == null">
          <el-input v-model="departmentForm.pName" :maxlength="20" placeholder="父节点部门名称" disabled></el-input>
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" :maxlength="20" placeholder="请填写部门名称" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="userId">
          <el-select
            v-model="departmentForm.userId"
            clearable
            filterable
            remote
            :remote-method="_getUserList"
            :loading="userLoading"
            placeholder="输入姓名/手机号筛选员工"
            style="width: 240px">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="item.id">
              <span style="float: left">{{ item.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
            </el-option>
          </el-select>
          <el-button icon="el-icon-plus" type="primary" plain circle @click="handleOpenStaffForm" style=" margin-left: 6px;"></el-button>
          <el-popover
            width="200"
            trigger="hover"
            content="可输入姓名或者手机，进行模糊匹配。如果需要新增负责人信息，请点击【加号按钮】添加负责人"
          >
            <i slot="reference" class="el-icon-question color-warning" style="font-size: 20px; margin-left: 14px; vertical-align: middle;"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="服务电话" prop="servicePhone">
          <div style="display: flex">
            <AreaCode ref="mychild" @getPhoneAreaCode="getServicePhone"></AreaCode>
            <el-input v-model="departmentForm.servicePhone" :maxlength="30" placeholder="请填写服务电话" style="width: 240px"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="departmentForm.sort" controls-position="right" :min="0" :max="999999"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitDepartment">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 员工弹框 -->
    <el-dialog title="添加负责人" custom-class="custom-dialog" :visible.sync="showStaffForm" width="742px" :close-on-click-modal="false">
      <el-form ref="staffForm" :model="staffForm" :rules="staffRules" class="staff-form" label-width="80px">
        <div class="avatar-wrapper">
          <div class="avatar-pic">
            <img :src="staffForm.tempAvatar"/>
            <a @click="toSelectAvatar" size="mini">选择头像</a>
          </div>
            <p class="form-item-tip">建议尺寸: 200x200，图片大小限制1M</p>
        </div>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="staffForm.username" :maxlength="20" placeholder="请输入员工姓名"/>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="staffForm.sex" @change="handleSexChange">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone" style="margin-bottom: 24px;">
          <AreaCode @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
          <el-input style="width: 150px" v-model="staffForm.phone" placeholder="请输入员工手机号码"/>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="staffForm.idCard" placeholder="请输入身份证号码"/>
        </el-form-item>
        <el-form-item label="员工编号" prop="userNo">
          <el-input v-model="staffForm.userNo" :maxlength="36" placeholder="请输入员工编号"/>
        </el-form-item>
        <el-form-item label="人事状态" prop="status">
          <el-select v-model="staffForm.status">
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
        <el-form-item label="是否为授课老师" label-width="120px" prop="userLogo">
          <el-radio-group v-model="staffForm.userLogo" style="width: 200px;">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <p class="form-item-tip">设置上课教师，便于设置班级和排课时选择教师。</p>
        </el-form-item>
        <el-form-item label="岗位" prop="roles">
          <el-select v-model="staffForm.roles" multiple filterable>
            <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showStaffForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveStaff">确 定</el-button>
      </div>
    </el-dialog>

    <cropper-dialog
      ref="cropperDialog"
      v-model="showUploadAvatar"
      :options="{ aspectRatio: 1 }"
      title="上传头像"
      :maxSize="1024 * 1024"
      @uploadSizeLimit="handleUploadSizeLimit"
      @uploadComplete="handleUploadAvatar"/>
  </div>
</template>

<script>
import CropperDialog from '../../components/CropperDialog'

import { mapGetters } from 'vuex'
import { phoneValidator, idCardValidator } from '../../utils/validate'
import MaleAvatar from '../../assets/male-small.jpg'
import FaMaleAvatar from '../../assets/famale-small.jpg'
import { getTrees } from '../../utils/tree'
import AreaCode from '@/components/PhoneAreaCode'
import { PhoneAreaCode } from '@/utils/storage'

export default {
  name: 'Department',
  data() {
    return {
      loading: false,
      showForm: false,
      showStaffForm: false,
      showUploadAvatar: false,
      submitLoading: false,
      userLoading: false,
      userList: [],
      departmentList: [],
      departmentForm: {
        pid: '',
        pName: '',
        name: '',
        userId: '',
        servicePhone: '',
        sort: 0,
        phoneAreaCode: '+86'
      },
      rules: {
        name: [
          { required: true, message: '请填写部门名称', trigger: 'blur' },
          { max: 12, message: '部门名称最多12个字符', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '请填写负责人电话号码', trigger: ['blur', 'change'] }
        ],
        servicePhone: [
          { max: 20, message: '服务电话最多20位', trigger: 'blur' }
        ]
      },
      roleList: [], // 岗位列表
      statusList: [], // 人事状态列表
      staffForm: {
        avatar: '', // 头像
        tempAvatar: MaleAvatar,
        username: '', // 名字
        phone: '', // 手机号
        userNo: '', // 用户编号
        sex: 1, // 性别
        userLogo: 0, // 是否为授课教师   0-否   1-是
        status: '', // 人事状态ID
        departmentId: [], // 所属部门ID
        idCard: '', // 身份证号
        employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
        roles: [], // 岗位列表
        phoneAreaCode: '+86'
      },
      staffRules: {
        username: [
          { required: true, message: '请填写姓名', trigger: 'blur' },
          { max: 12, message: '姓名长度最多12位', trigger: ['change', 'blur'] }
        ],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'blur' },
          { validator: phoneValidator, message: '请填写正确的手机号', trigger: ['change', 'blur'] }
        ],
        userNo: [
          { max: 20, message: '员工编号最多20位', trigger: ['change', 'blur'] }
        ],
        userLogo: [
          { required: true, message: '请选择是否为授课老师', trigger: 'blur' }
        ],
        departmentId: [
          { required: true, message: '请选择所属部门', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择人事状态', trigger: 'blur' }
        ],
        idCard: [
          { validator: idCardValidator, message: '请填写正确的身份证号码', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  components: {
    CropperDialog,
    AreaCode
  },
  computed: {
    departmentRootId() {
      if (this.userInfo.enableViewAllOrg === 0 && this.currentBranch) {
        return this.currentBranch.id
      }
      return null
    },
    ...mapGetters([
      'userInfo',
      'organizationInfo',
      'currentBranch'
    ])
  },
  created() {
    this._getDepartmentList()
  },
  methods: {
    // 存储员工手机地区码
    getPhoneAreaCode(info) {
      this.staffForm.phoneAreaCode = info
    },
    // 存储服务手机地区码
    getServicePhone(info) {
      this.departmentForm.phoneAreaCode = info
    },
    _getDepartmentList() {
      this.loading = true
      this.$http.get('/v1/Department/getByOrganizationId', {
        organizationId: this.organizationInfo.id,
        pid: this.organizationInfo.id
      }).then(res => {
        const data = getTrees(res.data, this.organizationInfo.id, 'pid', 'id', true)
        this.departmentList = data
        this.$store.commit('setDepartmentList', data)
      }).finally(() => {
        this.loading = false
      })
    },
    _getUserList(query) {
      if (!query) {
        return
      }
      this.userLoading = true
      const params = {
        organizationId: this.organizationInfo.id
      }
      if (isNaN(parseInt(query))) {
        // 按照姓名查询
        params.username = query
      } else {
        params.phone = query
      }
      this.$http.get('/v1/User/getByUserLogo', params).then(res => {
        this.userList = res.data
      }).finally(() => {
        this.userLoading = false
      })
    },
    _getRoleList() {
      if (this.roleList.length > 0) return
      this.$http.get('/v1/Role/getRoleList', {
        organizationId: this.organizationInfo.id
      }).then((res) => {
        this.roleList = res.data
      })
    },
    _getStatusList() {
      this.$http.get('/v1/dictionary/DicOrganizationUserStatus/getAll').then((res) => {
        this.statusList = res.data
      })
    },
    handleAddDepartment(pNode) {
      if (this.$refs.departmentForm) {
        this.$refs.departmentForm.resetFields()
      }
      if (pNode) {
        this.departmentForm.pid = pNode.id
        this.departmentForm.pName = pNode.name
      } else {
        this.departmentForm.pid = this.organizationInfo.id
        this.departmentForm.pName = this.organizationInfo.name
      }
      this.userList = []
      this.departmentForm.id = null
      this.showForm = true
      this.departmentForm.phoneAreaCode = PhoneAreaCode.getCheck()
      const that = this
      setTimeout(function () { that.$refs.mychild.setAreaCode(PhoneAreaCode.getCheck()) }, 100)
    },
    handleEditDepartment(row) {
      if (this.$refs.departmentForm) {
        this.$refs.departmentForm.resetFields()
      }
      this.userList = [
        { id: row.userId, username: row.username, phone: row.phone }
      ]
      this.departmentForm = Object.assign({}, row)
      this.showForm = true
      const that = this
      setTimeout(function () { that.$refs.mychild.setAreaCode(row.phoneAreaCode) }, 100)
    },
    handleDeleteDepartment(row) {
      this.$confirm(`是否删除【${row.name}】部门?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/Department/deleteById/' + row.id, {
          organizationId: this.organizationInfo.id
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this._getDepartmentList()
        })
      })
    },
    // 提交部门数据
    handleSubmitDepartment() {
      if (!this.showForm || this.submitLoading) return

      this.$refs.departmentForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.departmentForm)
          this.submitLoading = true
          if (this.departmentForm.id) {
            // 修改
            params.id = this.departmentForm.id
            this.$http.put('/v1/Department/updateDepartment', params).then(res => {
              this.$message.success('修改部门成功！')
              this._getDepartmentList()
              this.showForm = false
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 添加
            params.type = 0 // 0-部门   1-校区
            params.organizationId = this.organizationInfo.id
            this.$http.post('/v1/Department/addDepartment', params).then(res => {
              this.$message.success('添加部门成功！')
              this._getDepartmentList()
              this.showForm = false
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    // 打开员工表单
    handleOpenStaffForm() {
      this.showStaffForm = true
      if (this.$refs.staffForm) this.$refs.staffForm.resetFields()
      this.staffForm.avatar = ''
      this.staffForm.tempAvatar = MaleAvatar
      this.staffForm.phoneAreaCode = PhoneAreaCode.getCheck()

      if (this.statusList.length === 0) this._getStatusList()
      if (this.roleList.length === 0) this._getRoleList()
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
      if (!this.showStaffForm || this.submitLoading) return

      this.$refs.staffForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          const params = Object.assign({}, this.staffForm)
          params.organizationId = this.organizationInfo.id
          // 处理部门
          if (params.departmentId.length > 0) {
            params.departmentId = params.departmentId[params.departmentId.length - 1]
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
          try {
            // 添加员工基本信息
            const res = await this.$http.post('/v1/User/addUser', params)
            this.$message.success('添加负责人信息成功！')
            this.showStaffForm = false
            this.departmentForm.userId = res.data
            this.userList = [
              { id: res.data, username: this.staffForm.username, phone: this.staffForm.phone }
            ]
          } catch (error) {
          }
          this.submitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.department-form
  width 400px
  padding-right 40px
  margin 0 auto

.tips
  display inline-block
  color $color-text-2
  font-size 13px
  margin-left 20px
  .link
    margin-left 6px

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
    a
      color $color-primary

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
</style>

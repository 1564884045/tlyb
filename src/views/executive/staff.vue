<template>
  <div class="staff-list">
    <div class="query-form">
      <el-input v-model="queryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <div class="right-btns">
        <el-button type="primary" icon="icon iconfont icon-import" size="small" @click="handleOpenImport">员工导入</el-button>
        <el-button v-if="false" type="primary" icon="icon iconfont icon-import" size="small" @click="downloadUserQrCode">二维码下载</el-button>
        <el-button type="primary" icon="el-icon-plus" size="small" @click="handleOpenForm()">新增员工</el-button>
      </div>
      <el-radio-group v-model="queryForm.staffType" @change="query">
        <el-radio :label="1">在职</el-radio>
        <el-radio :label="0">离职</el-radio>
      </el-radio-group>
      <el-button type="text" :disabled="!loading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
      <div class="query-select-list">
        <department-select v-model="queryForm.departmentId" :rootId="departmentRootId" inline @change="query" />
        <!-- <inline-select v-model="queryForm.departmentId" @change="query" label="所属部门" valueAttr="id" labelAttr="name" :loading="loadingDepartment" :options="departmentList" @show="_getDepartmentList()" filterable clearable/> -->
        <inline-select v-model="queryForm.roleId" @change="query" label="所在岗位" valueAttr="id" labelAttr="name" :loading="loadingRole" :options="roleList" @show="_getRoleList" filterable clearable />
        <inline-select v-model="queryForm.userLogo" @change="query" label="员工类型" valueAttr="id" labelAttr="name" :loading="loadingRole" :options="userLogoList" filterable clearable />
      </div>
    </div>
    <div class="showTableData">
      <el-table :data="staffList" v-loading="loading">
        <el-table-column prop="avatar" label="头像" width="72" align="center">
          <img slot-scope="scope" class="link" :src="scope.row.avatar" width="50px" height="50px" style="vertical-align: middle;" />
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="120">
          <template slot-scope="scope">
            <!-- <img :src="scope.row.sexIcon" height="18px" style="vertical-align: middle; "/> -->
            <span v-if="queryForm.staffType === 1" class="link" @click="handleOpenDetail(scope.row)">{{scope.row.username}}</span>
            <span v-else>{{scope.row.username}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="icCardNo" label="IC卡号" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.icCardNo && scope.row.icCardNo.length !== 0" type="success">{{scope.row.icCardNo}}</el-tag>
            <el-tag v-else type="warning">未绑定</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="departmentName" label="部门" width="160"></el-table-column>
        <el-table-column prop="ruleNames" label="岗位"></el-table-column>
        <el-table-column prop="userNo" label="工号" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.userNo || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否老师" width="80" align="center">
          <el-tag slot-scope="scope" :type="scope.row.userLogo === 1 ? 'success' : 'info'">{{scope.row.userLogo === 1 ? '是' : '否'}}</el-tag>
        </el-table-column>
        <el-table-column label="人脸" width="100" align="center">
          <el-tag slot-scope="scope" :type="scope.row.faceLibUrl ? 'success' : 'info'">{{scope.row.faceLibUrl ? '已录入' : '未录入'}}</el-tag>
        </el-table-column>
        <el-table-column prop="entryTime" label="入职时间" width="140" align="center"></el-table-column>
        <el-table-column prop="createAt" label="添加日期" width="144" align="center"></el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <template v-if="queryForm.staffType === 1">
              <el-button type="text" @click="handleOpenForm(scope.row)">编辑</el-button>
              <el-button type="text" @click="handleDismission(scope.row)" :disabled="!!(scope.row.roles && scope.row.roles.find(o => o.id === '0'))">辞退</el-button>
            </template>
            <el-button v-else type="text" @click="handleCallbackDismission(scope.row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getStaffList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>

    <el-dialog :title="staffForm.id ? '编辑员工信息' : '新增员工'" :visible.sync="showForm" width="742px" top="6vh" custom-class="custom-dialog" :close-on-click-modal="false">
      <el-form ref="staffForm" :model="staffForm" :rules="staffRules" class="staff-form" label-width="80px">
        <div class="avatar-wrapper" prop="avatar" label-width="0">
          <div class="avatar-pic">
            <img :src="staffForm.tempAvatar || staffForm.avatar" />
            <a @click="toSelectAvatar" size="mini">选择头像</a>
          </div>
          <p class="form-item-tip">建议尺寸: 200x200，图片大小限制1M</p>
        </div>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="staffForm.username" placeholder="请输入员工姓名" :maxlength="20" />
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
          <el-input style="width: 150px" v-model="staffForm.phone" :disabled="staffForm.roles && staffForm.roles.includes('0')" placeholder="请输入员工手机号码" maxlength="11" />
          <p v-if="staffForm.roles && staffForm.roles.includes('0')" class="form-item-tip" style="display: block; margin-left: 0;">【系统管理员】不能修改手机号</p>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="staffForm.idCard" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-form-item label="员工编号" prop="userNo">
          <el-input v-model="staffForm.userNo" placeholder="请输入员工编号" :maxlength="36" />
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
          <department-select ref="departmentSelect" v-model="staffForm.departmentId" />
          <el-popover width="200" trigger="hover">
            <p class="form-item-tip">
              无可选部门？请点击
              <a class="jump-link-text" @click="toDepartment">部门设置</a>进行添加
            </p>
            <i slot="reference" class="el-icon-circle-plus color-primary" style="font-size: 18px; margin-left: 12px;" />
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
          <el-popover width="200" trigger="hover">
            <p class="form-item-tip">设置上课教师，便于设置班级和排课时选择教师。</p>
            <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;" />
          </el-popover>
        </el-form-item>
        <el-form-item label="查看所有校区" label-width="120px" prop="enableViewAllOrg">
          <el-radio-group v-model="staffForm.enableViewAllOrg" style="width: 200px;">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <el-popover width="200" trigger="hover">
            <p class="form-item-tip">默认不可查看其它校区。</p>
            <i slot="reference" class="el-icon-question color-primary" style="font-size: 18px; margin-left: 12px;" />
          </el-popover>
        </el-form-item>
        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker v-model="staffForm.entryTime" type="date" :editable="false" clearable format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择入职日期"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveStaff">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="员工详情" custom-class="custom-dialog" :visible.sync="showDetail" width="742px">
      <div class="staff-detail">
        <div class="main-info">
          <img class="avatar" :src="selectedStaff.avatar" width="100px" />
          <p class="username">{{selectedStaff.username}}</p>
          <el-button type="primary" plain icon="el-icon-edit" @click="handleOpenForm(selectedStaff)">编辑</el-button>
          <el-button type="primary" plain icon="el-icon-camera" @click="faceIdentification">录入人脸</el-button>
          <el-button type="primary" plain icon="el-icon-bank-card" @click="handleBindIcCard(selectedStaff)" style="margin-top:20px;">{{selectedStaff.icCardNo ? '更改绑定' : '绑定IC卡'}}</el-button>
        </div>
        <ul class="more-info">
          <li>
            <label>手机号：</label>
            <span>{{selectedStaff.phone}}</span>
          </li>
          <li>
            <label>身份证号：</label>
            <span>{{selectedStaff.idCard}}</span>
          </li>
          <li>
            <label>工号：</label>
            <span>{{selectedStaff.userNo}}</span>
          </li>
          <li>
            <label>所在部门：</label>
            <span>{{selectedStaff.departmentName}}</span>
          </li>
          <li>
            <label>岗位：</label>
            <span>{{selectedStaff.ruleNames}}</span>
          </li>
          <li>
            <label>人事状态：</label>
            <span>{{selectedStaff.statusName}}</span>
          </li>
          <li>
            <label>工作性质：</label>
            <span>{{selectedStaff.employTypeStr}}</span>
          </li>
          <li>
            <label>是否为授课老师：</label>
            <span>{{selectedStaff.userLogo === 1 ? '是' : '否'}}</span>
          </li>
          <li>
            <label>是否可查看所有校区：</label>
            <span>{{selectedStaff.enableViewAllOrg === 1 ? '是' : '否'}}</span>
          </li>
          <li>
            <label>人脸：</label>
            <a
              :class="{'link': selectedStaff.faceLibUrl}"
              :href="selectedStaff.faceLibUrl || 'javascript:void(0);'"
              :target="selectedStaff.faceLibUrl ? '_blank' : ''"
            >{{selectedStaff.faceLibUrl ? '点击查看' : '未录入'}}</a>
          </li>
          <li>
            <label>IC卡号：</label>
            <span v-if="selectedStaff.icCardNo">{{selectedStaff.icCardNo}}</span>
            <span v-else>
              <label style="color:#ff6600;">
                未绑定（刷卡设备购买请联系客服：
                <i style="font-weiht:bold;font-size:20px;">0851-38157629</i>）
              </label>
            </span>
            <el-button v-if="selectedStaff.icCardNo" type="text" @click="handleUnbindICCard(selectedStaff)" :loading="unBindICCardLoading" style="margin-left:20px;">解除IC卡绑定</el-button>
          </li>
        </ul>
      </div>
    </el-dialog>

    <!-- 员工绑定IC卡 -->
    <el-dialog title="绑定IC卡" custom-class="custom-dialog" :visible.sync="bindIcCardDialogVisible" width="30%">
      <el-form ref="bindICCardForm" :model="staffIcForm" label-width="80px">
        <el-form-item v-if="staffIcForm.originalIcCardNo" label="原卡号">
          <p>{{staffIcForm.originalIcCardNo}}</p>
        </el-form-item>
        <el-form-item label="员工卡号">
          <el-input ref="bindICCardFormInput" @change="handleCardInputChange" v-model="staffIcForm.icCardNo" clearable placeholder="请刷卡读取卡号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bindIcCardDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddOrUpdateIcCard()" :loading="staffIcFormSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="showImport"  :close-on-click-modal="false" :show-close="false" custom-class="import-staff-dialog">
      <p slot="title" class="title">
        员工导入
        <i class="close-btn el-icon-close" @click="showImport = false" />
      </p>
      <div class="upload-file">
        <el-input :value="uploadFileName" @click.native.stop="selectExcelFile" :readonly="true" placeholder="请选择上传文件" style="width: 340px;">
          <el-button slot="append" type="primary" @click.stop="selectExcelFile">选择文件</el-button>
        </el-input>
        <span class="link" @click="downloadTemplate">下载导入模板</span>
        <input ref="fileInput" @change="handleExcelChange" class="file-input" type="file" accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
      </div>
      <template v-if="uploadErrList.length > 0">
        <p class="upload-err-tip">数据有误，请检查数据后上传！错误信息如下：</p>
        <el-table :data="uploadErrList" style="margin-top: 16px;">
          <el-table-column prop="row" label="行数" cennter width="100">
            <template slot-scope="scope">第{{scope.row.row}}行</template>
          </el-table-column>
          <el-table-column prop="column" label="标签" cennter width="160"></el-table-column>
          <el-table-column prop="errorMsg" label="错误信息"></el-table-column>
        </el-table>
      </template>
      <ul class="upload-tip" v-if="uploadErrList.length === 0">
        <li class="color-warning">员工导入须知：</li>
        <li>1. 员工手机号码在【桃李云帮】中不能重复使用</li>
        <li>2. 必填项的数据请务必全部填写</li>
        <li>3. 一次最多导入500条数据</li>
      </ul>
    </el-dialog>

    <cropper-dialog
      ref="cropperDialog"
      v-model="showUploadAvatar"
      :options="{ aspectRatio: 1 }"
      title="上传头像"
      :maxSize="1024 * 1024"
      @uploadSizeLimit="handleUploadSizeLimit"
      @uploadComplete="handleUploadAvatar"
    />

    <screen-capture v-model="showCapture" title="员工人脸录入" @submit="handleCaptureSubmit" />
    <DownloadTeacherInfo @clsoeDownloadUserQrCode='clsoeDownloadUserQrCode' ref=childUser v-model="showDownloadUserInfo"></DownloadTeacherInfo>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import DepartmentSelect from '../../components/DepartmentSelect'
import CropperDialog from '../../components/CropperDialog'
import ScreenCapture from '../../components/ScreenCapture'

import moment from 'moment'
import DownloadTeacherInfo from './components/DownloadTeacherInfo'
import { saveAs } from 'file-saver'
import { importExcel } from '../../utils/xlsxUtils'
import { mapGetters } from 'vuex'
import { phoneValidator, idCardValidator } from '../../utils/validate'
import MaleAvatar from '../../assets/male-small.jpg'
import FaMaleAvatar from '../../assets/famale-small.jpg'
import AreaCode from '@/components/PhoneAreaCode'
import { PhoneAreaCode } from '@/utils/storage'
// import { SystemAuthInfo } from '@/utils/user'

export default {
  name: 'Staff',
  data() {
    return {
      showDownloadUserInfo: false,
      loading: false,
      submitLoading: false,
      loadingDepartment: false,
      loadingRole: false,
      showForm: false,
      showDetail: false,
      showUploadAvatar: false,
      showCapture: false,
      showImport: false,
      // 员工绑卡
      bindIcCardDialogVisible: false,
      staffIcFormSubmitLoading: false,
      unBindICCardLoading: false, // 解除卡号
      searchTypeList: [
        {
          value: 'username',
          label: '姓名',
          placeholder: '请输入姓名'
        },
        {
          value: 'phone',
          label: '手机号',
          placeholder: '请输入手机号码'
        },
        {
          value: 'userNo',
          label: '工号',
          placeholder: '请输入员工编号'
        }
      ],
      departmentList: [], // 部门列表
      roleList: [], // 岗位列表
      userLogoList: [
        { value: '00', id: 0, name: '其他员工' },
        { value: '11', id: 1, name: '授课老师' }
      ], // 是否为授课老师
      statusList: [], // 人事状态列表
      queryForm: {
        searchType: 'username',
        searchInput: '',
        staffType: 1, // 1-在职   0-离职
        departmentId: [],
        roleId: ''
      },
      staffList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
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
        icCardNo: '',
        employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
        enableViewAllOrg: 0, // 是否查看所有校区
        roles: [], // 岗位列表
        phoneAreaCode: '+86'
      },
      staffRules: {
        username: [
          { required: true, message: '请填写姓名', trigger: 'blur' },
          { max: 20, message: '姓名长度最多20位', trigger: ['change', 'blur'] }
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
      },
      staffIcForm: {
        // 员工IC卡信息
        id: null,
        icCardNo: null,
        originalIcCardNo: null // 更改时,保存以前的ic卡号
      },
      selectedStaff: {}, // 选中的员工
      uploadFileName: '',
      uploadErrList: [] // 上传过程中错误信息
    }
  },
  components: {
    InlineSelect,
    DepartmentSelect,
    CropperDialog,
    ScreenCapture,
    AreaCode,
    DownloadTeacherInfo
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(
        (o) => o.value === this.queryForm.searchType
      ).placeholder
    },
    departmentRootId() {
      // 只查本校区
      if (this.userInfo.enableViewAllOrg === 0 && this.currentBranch) {
        return this.currentBranch.id
      }
      return null
    },
    ...mapGetters(['organizationInfo', 'userInfo', 'currentBranch'])
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.saveDialogContent && from.name === 'Department') {
        vm.showForm = true
        vm.saveDialogContent = false // 只能用一次
        vm.$refs.departmentSelect._getDepartmentList()
      }
    })
  },
  created() {
    if (this.$route.query.recommend === 1) {
      this.showForm = true
    }

    this.queryForm.departmentId = [this.currentBranch.id]
    this._getStaffList()
    this._getDepartmentList()
  },
  watch: {
    bindIcCardDialogVisible() {
      if (this.bindIcCardDialogVisible) {
        this.$nextTick(() => {
          this.$refs.bindICCardFormInput.focus()
        })
      }
    }
  },
  methods: {
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.staffForm.phoneAreaCode = info
    },
    _getDepartmentList() {
      if (this.departmentList.length > 0) return
      this.loadingDepartment = false
      this.$http
        .get('/v1/Department/getDepartmentList', {
          organizationId: this.organizationInfo.id,
          pid: this.currentBranch.id,
          isLock: 0 // 只查启用的校区
        })
        .then((res) => {
          this.departmentList = res.data
        })
        .finally(() => {
          this.loadingDepartment = false
        })
    },
    _getRoleList() {
      if (this.roleList.length > 0) return
      this.loadingRole = true
      this.$http
        .get('/v1/Role/getRoleList', {
          organizationId: this.organizationInfo.id
        })
        .then((res) => {
          this.roleList = res.data
        })
        .finally(() => {
          this.loadingRole = false
        })
    },
    _getStatusList() {
      this.$http
        .get('/v1/dictionary/DicOrganizationUserStatus/getAll')
        .then((res) => {
          this.statusList = res.data
        })
    },
    _getStaffList() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roleId: this.queryForm.roleId,
        userLogo: this.queryForm.userLogo
      }
      if (this.queryForm.departmentId.length > 0) {
        params.departmentId = this.queryForm.departmentId[this.queryForm.departmentId.length - 1]
      } else {
        // 默认查当前机构的员工
        params.departmentId = this.organizationInfo.id
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === '') {
          delete params[key]
        }
      }
      // 区分在职和离职
      let url = '/v1/User/getUserList'
      if (this.queryForm.staffType === 0) {
        url = '/v1/DimissionUser/getDimissionUserList'
        params.departmentId = null
        params.organizationId = this.organizationInfo.id
      }
      this.loading = true
      this.$http
        .get(url, params)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            res.data.forEach((item) => {
              if (!item.avatar) {
                item.avatar =
                  item.sex === 2
                    ? require('../../assets/famale-small.jpg')
                    : require('../../assets/male-small.jpg')
              }
              item.createAt = moment(item.createAt).format(
                'YYYY-MM-DD HH:mm:ss'
              )
              item.ruleNames = ''
              if (item.roles && item.roles.length > 0) {
                item.ruleNames = item.roles.map((o) => o.name).join('、')
              }
              if (item.entryTime) {
                item.entryTime = item.entryTime.split(' ')[0]
              } else {
                item.entryTime = '-'
              }
            })
          }
          this.staffList = res.data
          this.total = res.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    query() {
      this.pageNum = 1
      this._getStaffList()
    },
    reset() {
      this.queryForm = {
        searchType: 'username',
        searchInput: '',
        staffType: 1, // 1-在职   0-离职
        departmentId: [],
        roleId: ''
      }
      this.query()
    },
    toDepartment() {
      this.showForm = false
      this.saveDialogContent = true
      this.$router.push('/executive/department')
    },
    handleOpenForm(item) {
      // 当前学员数大于或等于机构购买系统版本限制学员人数时不允许新增员工，只允许编辑
      // if (SystemAuthInfo.get().versionsTeacherLimit <= this.total && !item) {
      //   this.$notify({
      //     title: '员工已达上限',
      //     message: `当前系统版本为【${SystemAuthInfo.get().versionsName}】,最大员工人数为${SystemAuthInfo.get().versionsTeacherLimit}人，已有员工数为${this.total}人`,
      //     type: 'warning'
      //   })
      //   return
      // }
      this.showForm = true
      if (this.$refs.staffForm) {
        this.$refs.staffForm.clearValidate()
        this.$refs.staffForm.resetFields()
      }
      const that = this

      if (item) {
        setTimeout(function () { that.$refs.mychild.setAreaCode(item.phoneAreaCode) }, 100)
        let temp = Object.assign({}, item)
        this.$http.get('/v1/User/getUserById', { id: item.id }).then((res) => {
          if (res.data) temp = res.data
          for (const key in this.staffForm) {
            if (key === 'avatar') {
              this.staffForm.avatar = temp.avatar
            } else if (key === 'tempAvatar') {
              if (!temp.avatar) {
                if (temp.sex === 2) {
                  this.staffForm.tempAvatar = FaMaleAvatar
                } else {
                  this.staffForm.tempAvatar = MaleAvatar
                }
              } else {
                this.staffForm.tempAvatar = null
              }
            } else if (key === 'roles') {
              this.staffForm.roles = temp.roles
                ? temp.roles.map((o) => o.id)
                : []
            } else if (key === 'departmentId') {
              this.staffForm.departmentId = temp.departmentId
              // setTimeout(() => {
              //   this.$refs.departmentSelect && this.$refs.departmentSelect.findPath(temp.departmentId)
              // }, 200)
            } else {
              this.staffForm[key] = temp[key]
            }
          }
        })
      } else {
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
          icCardNo: '', // IC卡号
          employType: '', // 聘用状态(0-兼职 1-全职 2-合作)
          enableViewAllOrg: 0, // 是否查看所有校区
          roles: [], // 岗位列表
          phoneAreaCode: PhoneAreaCode.getCheck()
        }
        setTimeout(function () { that.$refs.mychild.setAreaCode(PhoneAreaCode.getCheck()) }, 100)
      }

      if (this.statusList.length === 0) this._getStatusList()
      if (this.roleList.length === 0) this._getRoleList()
    },
    handleOpenDetail(item) {
      this.showDetail = true
      if (item.id !== this.selectedStaff) {
        this.$http
          .get('/v1/User/getUserById', {
            id: item.id
          })
          .then((res) => {
            if (res.data == null) return

            if (!res.data.avatar) {
              res.data.avatar = res.data.sex === 2 ? FaMaleAvatar : MaleAvatar
            }
            if (res.data.roles && res.data.roles.length > 0) {
              res.data.ruleNames = res.data.roles.map((o) => o.name).join('、')
            }
            switch (res.data.employType) {
              case 0:
                res.data.employTypeStr = '兼职'
                break
              case 1:
                res.data.employTypeStr = '全职'
                break
              case 2:
                res.data.employTypeStr = '合作'
                break
            }
            this.selectedStaff = res.data
          })
      }
    },
    // 员工ic卡
    handleBindIcCard(staffInfo) {
      if (Number(sessionStorage.getItem('enableUseCardDevice'))) {
        this.staffIcForm = {
          id: staffInfo.id,
          originalIcCardNo: staffInfo.icCardNo
        }
        this.bindIcCardDialogVisible = true
      } else {
        this.$message({
          message: '刷卡设备未授权',
          type: 'warning'
        })
      }
    },
    handleCardInputChange(value) {
      let cardReg = /^\d{10}/
      if (cardReg.test(value)) {
        this.icCardNo = value
        this.handleAddOrUpdateIcCard()
      }
    },
    // 提交IC卡绑定信息
    handleAddOrUpdateIcCard() {
      if (!this.staffIcForm.icCardNo) {
        this.$message.warning('卡号不能为空')
        return
      }
      if (
        this.staffIcForm.icCardNo &&
        this.staffIcForm.originalIcCardNo === this.staffIcForm.icCardNo
      ) {
        this.staffIcForm.icCardNo = null
        return this.$message.warning('待绑定的卡号与原卡号一致，无需再绑定')
      }
      this.staffIcFormSubmitLoading = true
      const param = {
        icCardNo: this.staffIcForm.icCardNo,
        organizationId: this.organizationInfo.id,
        targetId: this.staffIcForm.id,
        departmentId: this.currentBranch.id,
        type: 0
      }
      this.$http
        .put('/v1/IcCard/updateIcCardNoByTargetId', param)
        .then((res) => {
          this.$message.success(res.message)
          this.bindIcCardDialogVisible = false
          this.showDetail = false
          this.staffIcForm = {
            id: null,
            originalIcCardNo: null
          }
          this._getStaffList()
        })
        .finally(() => {
          this.staffIcForm.icCardNo = null
          this.staffIcFormSubmitLoading = false
        })
    },
    // 解除IC卡号
    handleUnbindICCard(staffInfo) {
      this.$confirm(
        `此操作将解除员工【${staffInfo.username}】对IC卡【${staffInfo.icCardNo}】的绑定, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.unBindICCardLoading = true
          const param = {
            icCardNo: '',
            organizationId: this.organizationInfo.id,
            targetId: staffInfo.id,
            departmentId: this.currentBranch.id,
            type: 0
          }
          this.$http
            .put('/v1/IcCard/updateIcCardNoByTargetId', param)
            .then((res) => {
              this.$message({
                type: 'success',
                message: '解除绑定成功!'
              })
              // 重新拉取员工数据
              this.showDetail = false
              this._getStaffList()
            })
            .finally(() => {
              this.unBindICCardLoading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消解绑操作'
          })
        })
    },
    // 离职
    handleDismission(row) {
      this.$confirm(
        `确定把员工【${row.username}】辞退？<br>请确保该员工的所有工作交接已完成！`,
        '提示',
        {
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }
      ).then(() => {
        this.$http.delete('/v1/User/dimission/' + row.id).then(() => {
          this.$message.success(`辞退【${row.username}】成功！`)
          this.query()
        })
      })
    },
    // 恢复职位
    handleCallbackDismission(row) {
      this.$confirm(`确定把【${row.username}】恢复成为机构员工？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http
          .post('/v1/User/undoDimission', null, {
            params: {
              phone: row.phone,
              userId: row.id,
              phoneAreaCode: row.phoneAreaCode
            }
          })
          .then(() => {
            this.$message.success(`恢复员工【${row.username}】成功！`)
            this.query()
          })
      })
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
      if (!this.showForm || this.submitLoading) return
      this.$refs.staffForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          const params = Object.assign({}, this.staffForm)
          // 处理部门
          if (!params.departmentId || params.departmentId.length === 0) {
            this.$message.error('您尚未选择员工所属部门!')
            return
          }

          if (params.departmentId.length) {
            if (params.departmentId.constructor === Array) {
              // 处理所属分校或部门等信息(兼容老版本方式)
              // const departments = []
              // params.departmentId.forEach(item => {
              //   departments.push({
              //     id: item[item.length - 1],
              //     branchId: item[0]
              //   })
              // })
              const departments = [
                {
                  id: params.departmentId[params.departmentId.length - 1],
                  branchId: params.departmentId[0]
                }
              ]
              params.departments = departments
              // 此处处理的是老版本的部门选择
              params.branchId = params.departmentId[0]
              params.departmentId =
                params.departmentId[params.departmentId.length - 1]
            }
          } else {
            params.branchId = ''
            params.departmentId = ''
          }
          // 处理角色
          params.roles = params.roles.map((o) => {
            return { id: o }
          })
          // 过滤为空字符串数据
          for (const key in params) {
            if (params.hasOwnProperty(key) && params[key] === '') {
              delete params[key]
            }
          }
          // 添加用户所属机构
          params.organizationId = this.organizationInfo.id
          try {
            if (params.id) {
              // 修改员工基本信息
              await this.$http.put('/v1/User/updateUser', params)
              this.$message.success('修改员工信息成功！')
            } else {
              // 添加员工基本信息
              await this.$http.post('/v1/User/addUser', params)
              this.$message.success('添加员工信息成功！')
            }
            this.query()
            this.showForm = false
          } catch (error) {}
          this.submitLoading = false
        }
      })
    },
    handleCaptureSubmit(res) {
      this.$http
        .post('/v1/FaceDill/addOrUpdateUserFace', {
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id,
          userOrStudentId: this.selectedStaff.id,
          userOrStudentName: this.selectedStaff.username,
          faceImageUrl: res.src,
          desc: '联系方式：' + this.selectedStaff.phone
        })
        .then(() => {
          this.$message.success('录入人脸成功！')
          this.showDetail = false
          this._getStaffList()
        })
    },
    handleOpenImport() {
      // 当前学员数大于或等于机构购买系统版本限制学员人数时不允许导入员工
      // if (SystemAuthInfo.get().versionsTeacherLimit <= this.total) {
      //   this.$notify({
      //     title: '员工已达上限',
      //     message: `当前系统版本为【${SystemAuthInfo.get().versionsName}】,最大员工数为${SystemAuthInfo.get().versionsTeacherLimit}人，已有员工数为${this.total}人`,
      //     type: 'warning'
      //   })
      //   return
      // }
      this.uploadFileName = ''
      this.uploadErrList = []
      this.showImport = true
    },
    downloadTemplate() {
      const downloadPath =
        window.location.origin +
        process.env.VUE_APP_BASE_API +
        `/api/ExportOrImport/downloadImportUserExcelTemplate?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
      saveAs(downloadPath)
    },
    selectExcelFile() {
      this.$refs.fileInput.click()
    },
    handleExcelChange(event) {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return
      const file = files[0]
      this.uploadFileName = file.name || file.filename

      const loading = this.$loading({
        lock: true,
        text: '正在解析Excel文档...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      importExcel(file)
        .then(async (res) => {
          loading.text = '正在校验基础信息...'
          res.data.forEach(item => {
            item.phoneAreaCode = item.phoneAreaCode.split('-')[0]
          })
          const data = res.data
          const excelConf = res.excelConf
          const phoneList = data.map((o) => o.phone)
          try {
            const res1 = await this.$http.post(
              '/v1/ExportOrImport/validateExistsUser',
              phoneList
            )
            loading.text = '正在上传员工数据...'
            if (res1.data.length === 0) {
              await this.$http.post('/v1/ExportOrImport/importUser', data, {
                params: {
                  organizationId: this.organizationInfo.id,
                  departmentId: this.currentBranch.id
                }
              })
              // 上传成功
              this.$message.success('上传员工数据成功！')
              this.query()
              this.showImport = false
            } else {
              // 出现重复手机号数据
              const errList = []
              for (let i = 0; i < data.length; i++) {
                const obj = res1.data.find(
                  (o) => o.phone + '' === data[i].phone + ''
                )
                if (obj) {
                  errList.push({
                    row: i + excelConf.dataStartIndex,
                    column: '电话(必填)',
                    errorMsg: `手机号${obj.phone}在系统中已存在，用户名【${obj.username}】`
                  })
                }
                this.uploadErrList = errList
              }
            }
          } catch (error) {}
          loading.close()
        })
        .catch((err) => {
          switch (err.code) {
            case 1:
            case 2:
              this.$message.error(err.message)
              break
            case 3:
              this.uploadErrList = err.data
              break
          }
          loading.close()
        })
      // 重置为空
      this.$refs.fileInput.value = ''
    },
    // 打开人脸录入弹窗
    faceIdentification() {
      if (Number(sessionStorage.getItem('enableUseFaceDevice'))) {
        this.showCapture = true
      } else {
        this.$message({
          message: '人脸设备未授权',
          type: 'warning'
        })
      }
    },
    // 打开下载用户二维码
    downloadUserQrCode() {
      this.showDownloadUserInfo = true
      this.$refs.childUser._getUserList()
    },
    clsoeDownloadUserQrCode() {
      this.showDownloadUserInfo = false
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
.showTableData
  background #fff
  padding 14px
</style>

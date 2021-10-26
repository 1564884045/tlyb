<!-- 学校信息 -->
<template>
  <div class="school-info-many">
    <div style="background: #fff; marginTop: 10px; padding: 15px">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="handleOpenForm()">新  增</el-button>
      </div>
      <el-table
        :data="branchList"
        style="width: 100%">

        <el-table-column
          prop="name"
          label="校区名称"
          width="150">
        </el-table-column>

        <el-table-column
          prop="address"
          label="校区地址">
        </el-table-column>

        <el-table-column
          prop="businessDate"
          label="营业时间"
          width="144">
        </el-table-column>

        <el-table-column
          prop="username"
          label="负责人姓名"
          width="100"
          align="center">
        </el-table-column>

        <el-table-column
          prop="phone"
          label="负责人电话"
          width="120">
        </el-table-column>

        <el-table-column
          label="状态"
          width="100"
          align="center">
          <template slot-scope="scope">
            <el-switch :value="scope.row.isLock" class="el-switch-cutomer" :width="62" size="medium" :active-value="0" :inactive-value="1" @click.native="toggleStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column
          label="校讯帮老师查看学员联系方式"
          width="200"
          align="center">
          <template slot-scope="scope">
            <el-switch :value="scope.row.showStudentCall" class="el-switch-cutomer" :width="62" size="medium" :active-value="1" :inactive-value="0" @click.native="toggleShowStudentCall(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="110"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click.native="handleOpenForm(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 对话框 -->
    <el-dialog
      :title="!branchForm.id ? '新增校区' : '编辑校区'"
      :visible.sync="showBranchForm"
      width='440px'
      :close-on-click-modal="false">
      <div>
        <el-form :model="branchForm" :rules="rules" ref="branchForm" label-width="95px" style="width: 393px" >
          <el-form-item label="校区名称" prop="name">
            <el-input v-model="branchForm.name" :maxlength="30" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="校区类型" prop="category">
            <el-select v-model="branchForm.category" placeholder="请选择" style="width: 297px">
              <el-option
                v-for="item in schoolTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="营业时间" required>
            <el-time-picker
              style="width: 267px"
              is-range
              v-model="branchForm.businessDate"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择时间范围">
            </el-time-picker>
            <el-popover
              placement="top-start"
              width="200"
              trigger="hover">
              <i slot="reference" class="el-icon-question color-primary" style="margin-left: 12px; font-size: 14px;"></i>
              <p>设置好营业时间，方便排课时间选择！</p>
            </el-popover>
          </el-form-item>

          <el-form-item label="负责人姓名" prop="userId">
            <el-select v-model="branchForm.userId" placeholder="请选择负责人姓名" style="width: 297px">
              <el-option v-for='item in userList' :key="item.id" :label="item.username" :value='item.id'>
                <div style="display: flex; justify-content: space-between;">
                  <span>{{item.username}}</span>
                  <span>{{item.phone}}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="校区地址" prop="province">
            <area-select v-model="branchForm.province" placeholder="请选择省市区"/>
          </el-form-item>

          <el-form-item label="详细地址" prop="address">
            <el-input v-model="branchForm.address" :maxlength="120" placeholder="请填写详细地址" />
          </el-form-item>

          <!-- <el-form-item prop="longitude">
            <el-input :value="branchForm.longitude ? branchForm.longitude + ',' + branchForm.latitude : ''" placeholder="机构总部经纬度" disabled style="width: 205px" />
            <el-button @click="toPOISelect" style="margin-left: 12px;">地图检索</el-button>
          </el-form-item> -->
        </el-form>

        <div class="cropper-wrapper">
          <span>
            <el-button plain type="primary" class="cropper-btn" @click="handleOpenCropperLogo">裁剪logo</el-button>
            <img class="cropper-img-con" :src="branchForm.tempLogo || branchForm.logo" alt="">
          </span>
          <span>
            <el-button plain type="primary" class="cropper-btn" @click="handleOpenCropper">缩略图</el-button>
            <img  class="cropper-img-con" :src="branchForm.tempThumbUrl || branchForm.thumbUrl" alt="">
          </span>
        </div>
        <div style="textAlign: center">
          <el-button :loading='loadingSubmit' type="primary" @click="handleSubmit()">确 定</el-button>
        </div>
      </div>
    </el-dialog>

    <cropper-dialog :options="{aspectRatio: 2/1}" title="logo上传" ref="cropperDialogLogo" v-model="showCropperLogo" @uploadComplete="handleUploadCompleteLogo"/>

    <cropper-dialog :options="{aspectRatio: 2/1}" title="缩略图上传" ref="cropperDialogThumb" v-model="showCropperThumb" @uploadComplete="handleUploadThumbComplete"/>

    <poi-select v-model="showPOISelect" @select="handlePOISelect" :address="branchForm.address" :city="branchForm.province.length > 1 ? branchForm.province[1] : null"/>

  </div>
</template>

<script>
import AreaSelect from '_c/AreaSelect'
import POISelect from '_c/POISelect'
import { mapGetters } from 'vuex'
import cropperDialog from '_c/CropperDialog'
// import { SystemAuthInfo } from '@/utils/user'

export default {
  name: 'schoolInfo',
  data () {
    return {
      branchList: [],
      showBranchForm: false,
      showCropperThumb: false,
      showCropperLogo: false,
      showPOISelect: false,
      loadingSubmit: false,
      total: 0,
      maxTotal: 0,
      branchForm: {
        id: null,
        name: '',
        category: '',
        businessDate: [], // 营业时间
        userId: '', // 负责人
        province: [],
        address: '',
        longitude: '',
        latitude: '',
        tempThumbUrl: '',
        thumbUrl: '',
        tempLogo: '',
        logo: ''
      },
      userList: [], // 负责人姓名数据
      rules: {
        name: [
          { required: true, message: '请输入机构名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择校区类型', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '请选择负责人姓名', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请选择省市区', trigger: ['blur', 'change'] }
        ],
        businessDate: [
          { required: true, message: '请选择营业时间', trigger: ['blur', 'change'] }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: ['blur', 'change'] }
        ]
      },
      schoolTypeList: []
    }
  },
  components: {
    AreaSelect,
    [POISelect.name]: POISelect,
    cropperDialog
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  created () {
    this._getDepartmentById()
    this._getSchoolTypeList()
    this._getUserList()
    // this._getCreateBranchLimit()
  },
  methods: {
    // 获取机构可建立校区数
    _getCreateBranchLimit() {
      this.$http.get(`/v1/Department/getCreateBranchLimit?organizationId=${this.organizationInfo.id}`).then(res => {
        this.maxTotal = res.data
      })
    },
    // 获取校区信息
    _getDepartmentById() {
      this.$http.get('/v1/Department/getDepartmentList', {
        organizationId: this.organizationInfo.id,
        type: 1
      }).then(res => {
        res.data.forEach(item => {
          if (item.businessStartDate && item.businessEndDate) {
            item.businessDate = item.businessStartDate + '~' + item.businessEndDate
          }
          if (item.province) {
            item.province = item.province.split(';')
          }
        })
        this.branchList = res.data
        this.total = res.total
        // 设置全局的校区列表（未锁定的）
        this.$store.commit('setBranchList', res.data.filter(o => o.isLock === 0))
      })
    },
    // 获取负责人姓名数据
    _getUserList() {
      if (this.userList.length > 0) return

      this.$http.get('/v1/User/getByUserLogo', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }).then(res => {
        this.userList = res.data
      })
    },
    // 获取校区类型数据
    _getSchoolTypeList() {
      if (this.schoolTypeList.length > 0) return

      this.$http.get('/v1/dictionary/DicOrganizationCategory/getAll', {
        type: 0
      }).then(res => {
        this.schoolTypeList = res.data
      })
    },
    // 打开校区编辑表单
    handleOpenForm(row) {
      // 当前校区数大于或等于机构购买系统版本限制校区数时不允许新增
      // if (this.maxTotal <= this.total && !row) {
      //   this.$notify({
      //     title: '校区已达上限',
      //     message: `当前系统版本为【${SystemAuthInfo.get().versionsName}】,最大校区数为${this.maxTotal}，已有校区数为${this.total}`,
      //     type: 'warning'
      //   })
      //   return
      // }
      // 新增
      this.branchForm = {
        id: null,
        name: '',
        category: '',
        businessDate: ['09:00', '18:00'], // 营业时间
        userId: '', // 负责人
        province: [],
        address: '',
        longitude: '',
        latitude: '',
        tempThumbUrl: '',
        thumbUrl: '',
        tempLogo: '',
        logo: ''
      }
      // 如果是修改，需要重置数据
      if (row) {
        // 设置通用属性
        for (const key in this.branchForm) {
          if (row.hasOwnProperty(key)) {
            this.branchForm[key] = row[key]
          }
        }
        // 设置时间段
        if (row.businessStartDate && row.businessEndDate) {
          this.branchForm.businessDate = [row.businessStartDate, row.businessEndDate]
        } else {
          this.branchForm.businessDate = ['09:00', '18:00']
        }
        // userId存在于用户列表则选取对应的负责人
        let j = 0
        for (let i = 0; i < this.userList.length; i++) {
          if (this.branchForm.userId === this.userList[i].id) {
            break
          } else {
            j++
            if (j === this.userList.length) {
              if (row.username) {
                this.userList.push({
                  username: row.username,
                  phone: row.phone,
                  id: row.userId
                })
              } else {
                this.branchForm.userId = ''
              }
            }
          }
        }
      }
      this.showBranchForm = true
      this.$refs.branchForm && this.$refs.branchForm.clearValidate()
    },
    // 编辑 / 新增提交
    handleSubmit() {
      this.$refs.branchForm.validate((valid) => {
        if (valid) {
          const params = Object.assign({}, this.branchForm)
          if (params.businessDate.length > 0) {
            params.businessStartDate = params.businessDate[0]
            params.businessEndDate = params.businessDate[1]
          }
          delete params.businessDate
          params.province = params.province.join(';')
          this.loadingSubmit = true
          // 新增
          if (params.id == null) {
            params.organizationId = this.organizationInfo.id
            params.pid = this.organizationInfo.id
            params.type = 1

            this.$http.post('/v1/Department/addDepartment', params).then(res => {
              this.$message.success('新增校区成功')
              this.showBranchForm = false
              this._getDepartmentById()
            }).finally(() => {
              this.loadingSubmit = false
            })
          } else {
            // 编辑
            this.$http.put('/v1/Department/updateDepartment', params).then(res => {
              this.$message.success('修改校区成功')
              this.showBranchForm = false
              this._getDepartmentById()

              // 更新当前校区的数据
              if (params.id === this.currentBranch.id) {
                this.$store.commit('setCurrentBranch', params)
              }
              this.loadingEdit = false
            }).finally(() => {
              this.loadingSubmit = false
            })
          }
        }
      })
    },
    handlePOISelect(res) {
      if (res) {
        let address = res.address
        if (this.branchForm.province.length > 0 && res.address.indexOf(this.branchForm.province.join('')) > -1) {
          address = res.address.split(this.form.province.join(''))[1]
        }
        this.branchForm.address = address
        this.branchForm.latitude = res.latitude
        this.branchForm.longitude = res.longitude
      }
    },
    toPOISelect() {
      this.showPOISelect = true
    },
    handleOpenCropper() {
      this.$refs.cropperDialogThumb.select()
    },
    handleOpenCropperLogo() {
      this.$refs.cropperDialogLogo.select()
    },
    handleUploadThumbComplete(res) {
      this.branchForm.tempThumbUrl = res.temp
      this.branchForm.thumbUrl = res.url
    },
    handleUploadCompleteLogo(res) {
      this.branchForm.tempLogo = res.temp
      this.branchForm.logo = res.url
    },
    toggleStatus(row) {
      let tip = '是否确定启用该校区？'
      if (!row.isLock) {
        tip = '是否确定禁用该校区？禁用后该校区将不可用'
      }
      this.$confirm(tip, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http.put('/v1/Department/updateIsLockById', null, {
          params: {
            id: row.id,
            isLock: row.isLock === 0 ? 1 : 0
          }
        }).then(() => {
          this.$message.success(row.isLock === 0 ? '禁用成功' : '启用成功')
          row.isLock = row.isLock === 0 ? 1 : 0
        })
      })
    },
    toggleShowStudentCall(row) {
      let tip = '是否确定启用老师在校讯帮查看学生联系方式'
      if (row.showStudentCall) {
        tip = '是否确定禁止老师在校讯帮查看学生联系方式,禁用后老师将无法看到学生联系方式'
      }
      this.$confirm(tip, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http.put('/v1/Department/updateShowStudentCall', null, {
          params: {
            id: row.id,
            showStudentCall: row.showStudentCall === 0 ? 1 : 0
          }
        }).then(() => {
          row.showStudentCall = row.showStudentCall === 0 ? 1 : 0
          this.$message.success(row.showStudentCall === 0 ? '禁用成功' : '启用成功')
        })
      })
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.cropper-wrapper
  display flex
  justify-content center
  margin-bottom 10px
  .cropper-img-con
    margin 0 10px 10px
    width 160px
    height 80px
    border 1px dashed #eeeeee
    background-color #fefefe
    display block
  .cropper-btn
    margin 0 10px 10px
</style>

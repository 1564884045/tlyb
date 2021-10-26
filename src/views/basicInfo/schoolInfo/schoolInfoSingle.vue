<!-- 单个学校信息 -->
<template>
  <div class="school-info-single">

    <div v-if="this.currentBranch !== null">
      <div style="display: flex;">
        <div>
          <el-form :model="form" :rules="rules" ref="form">
            <el-form-item label="校区名称" :label-width="formLabelWidth" prop="name">
              <el-input v-model="form.name" :maxlength="30" autocomplete="off" style="width: 240px"></el-input>
            </el-form-item>

            <el-form-item label="校区类型" :label-width="formLabelWidth" prop="category">
              <el-select v-model="form.category" placeholder="请选择" style="width: 240px">
                <el-option
                  v-for="item in optionsSchoolTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="营业时间" required :label-width="formLabelWidth">
              <el-time-picker
                style="width: 240px"
                is-range
                @change='timeChange'
                v-model="value4"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间范围">
              </el-time-picker>
            </el-form-item>

            <el-form-item label="负责人姓名" :label-width="formLabelWidth" prop="username">
              <el-select v-model="form.userId" placeholder="请选择负责人姓名" style="width: 240px">
                <el-option v-for='item in userNameInfo' :key="item.id" :label="item.username" :value='item.id'>
                  <div style="display: flex; justify-content: space-between;">
                    <span>{{item.username}}</span>
                    <span>{{item.phone}}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="校区地址" :label-width="formLabelWidth" prop="province">
              <area-select @change="schoolChange" v-model="form.province" placeholder="请选择省市区" style="width: 240px" />
            </el-form-item>

            <el-form-item label="详细地址" :label-width="formLabelWidth" prop="address">
              <el-input v-model="form.address" placeholder="请填写详细地址" :maxlength="120" style="width: 240px" />
            </el-form-item>

            <el-form-item prop="longitude" style="marginLeft: 20px">
              <el-button @click="toPOISelect" style="marginRight: 10px">地图检索</el-button>
              <el-input :value="form.longitude ? form.longitude + ',' + form.latitude : ''" placeholder="机构总部经纬度" disabled style="width: 240px" />
            </el-form-item>
          </el-form>

          <!-- 裁剪logo -->
          <div class="cropper-img">
            <el-button plain class="cropper-btn" style="width: 80px; display: block" @click="handleOpenCropper">裁剪logo</el-button>
            <img v-if='cropperImgLocal !== ""' class="cropper-img-con" :src="cropperImgLocal" alt="">
          </div>

          <!-- 缩略图 -->
          <div class="cropper-img">
            <el-button plain class="cropper-btn" style="width: 80px; display: block" @click="handleOpenCropper1">缩略图</el-button>
            <img v-if='cropperImgLocal1 !== ""' class="cropper-img-con" :src="cropperImgLocal1" alt="">
          </div>
        </div>

        <!-- 富文本编译器 -->
        <!-- <div style="width: 360px; margin: 0 0 10px 30px">
          <vue-editor id="editor" useCustomImageHandler @imageAdded="handleImageAdded" v-model="content"> </vue-editor>
        </div> -->
      </div>

      <div class="schoolBtn">
        <el-button :loading='loadingEdit' type="primary" @click="schoolEditSubmit('form')">确认提交</el-button>
      </div>
    </div>

    <!-- logo -->
    <cropper-dialog :options="{aspectRatio: 2/1}" title="logo上传" ref="cropperDialog" v-model="showCropper" @uploadComplete="handleUploadComplete"/>

    <!-- 缩略图 -->
    <cropper-dialog :options="{aspectRatio: 2/1}" title="缩略图" ref="cropperDialog1" v-model="showCropper1" @uploadComplete="handleUploadComplete1"/>

    <poi-select v-model="showPOISelect" @select="handlePOISelect" :address="form.address" :city="form.province[1]"/>

  </div>
</template>

<script>
import AreaSelect from '_c/AreaSelect'
import POISelect from '_c/POISelect'
import { mapGetters } from 'vuex'
import cropperDialog from '_c/CropperDialog'

export default {
  name: 'schoolInfo',
  data () {
    return {
      formLabelWidth: '110px',
      value4: [new Date(2019, 12, 1, 8, 0), new Date(2019, 12, 1, 18, 0)],
      form: {
        name: '', // 校区名称
        category: '', // 校区类型
        businessStartDate: '', // 开始时间
        businessEndDate: '', // 结束时间
        userId: '', // 负责人ID
        username: '', // 负责人姓名
        province: [], // 校区地址
        address: '', // 详细地址
        longitude: '', // 经度
        latitude: '', // 经度
        logo: '', // logo
        thumbUrl: '' // 缩略图
      },
      showPOISelect: false,
      rules: {
        name: [
          { required: true, message: '请输入机构名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择校区类型', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请选择负责人姓名', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请选择省市区', trigger: ['blur', 'change'] }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        longitude: [
          { required: true, message: '请选择经纬度址', trigger: 'blur' }
        ]
      },
      loadingAdd: false,
      loadingEdit: false,
      showCropper: false,
      showCropper1: false,
      cropperImgLocal: '', // logo裁剪后图片
      cropperImgLocal1: '', // 缩略图裁剪后图片
      cropperImgUrl: '', // logo裁剪后的线上图片地址
      cropperImgUrl1: '', // 缩略图裁剪后的线上图片地址
      optionsSchoolTypeList: [], // 校区类型数据
      content: '', // 富文本编译器
      userNameInfo: [] // 负责人姓名数据
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
  watch: {
    currentBranch() {
      this._getDepartmentById()
    }
  },
  created () {
    this._getSchoolTypeList()
    this._getDepartmentById()
    this._getUserNameList() // 获取负责人信息数据
  },
  mounted () {},
  methods: {
    // 地址变化
    schoolChange(e) {
      this.form.province = e
    },
    // 时间更改
    timeChange(e) {
      this.form.businessStartDate = e[0]
      this.form.businessEndDate = e[1]
    },
    // 编辑提交
    schoolEditSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loadingEdit = true
          if (this.form.businessStartDate && JSON.stringify(this.form.businessStartDate).indexOf('T') !== -1) {
            this.form.businessStartDate = '09:00'
          }

          if (this.form.businessEndDate && JSON.stringify(this.form.businessEndDate).indexOf('T') !== -1) {
            this.form.businessEndDate = '18:00'
          }

          this.form.category = this.form.category
          this.form.pid = this.organizationInfo.id
          this.form.id = this.currentBranch.id
          this.form.contentHtml = this.content

          let params = Object.assign({}, this.form)
          params.province = JSON.stringify(this.form.province).replace(/\[|]|"/g, '').replace(/,/g, ';')
          params.userId = this.form.userId

          this.$http.put('/v1/Department/updateDepartment', params)
            .then(res => {
              this.$message.success('编辑提交成功~')
              this._getDepartmentById()
              this.loadingEdit = false
            })
            .catch(() => {
              this.loadingEdit = false
            })
        } else {
          return false
        }
      })
    },
    // 获取校区信息
    _getDepartmentById() {
      if (this.currentBranch === null) {
        this.$message.warning('请选择学校')
        return
      }

      this.$http.get('/v1/Department/getDepartmentById', {
        id: this.currentBranch.id
      }).then(res => {
        if (res.data) {
          for (const key in this.form) {
            if (this.form.hasOwnProperty(key) && res.data[key]) {
              this.form[key] = res.data[key]
            }
          }
          this.form.name = res.data.name || ''
          // this.form.category = res.data.category
          this.form.businessStartDate = res.data.businessStartDate || ''
          this.form.businessEndDate = res.data.businessEndDate || ''
          this.value4 = [res.data.businessStartDate, res.data.businessEndDate]
          this.form.address = res.data.address || ''
          this.form.longitude = res.data.longitude || ''
          this.form.latitude = res.data.latitude || ''
          this.cropperImgLocal = res.data.logo || ''
          this.cropperImgLocal1 = res.data.thumbUrl || ''
          // this.form.username = res.data.username || ''
          this.content = res.data.contentHtml
          this.form.province = (res.data.province).split(';')
        }
      })
    },
    handlePOISelect(res) {
      if (res) {
        let address = res.address
        if (this.currentStep === 1) {
          if (this.form.province.length > 0 && res.address.indexOf(this.form.province.join('')) > -1) {
            address = res.address.split(this.form.province.join(''))[1]
          }
          this.form.address = address
          this.form.latitude = res.latitude
          this.form.longitude = res.longitude
        } else {
          if (this.form.province.length > 0 && res.address.indexOf(this.form.province.join('')) > -1) {
            address = res.address.split(this.form.province.join(''))[1]
          }
          this.form.address = address
          this.form.latitude = res.latitude
          this.form.longitude = res.longitude
        }
      }
    },
    toPOISelect() {
      this.showPOISelect = true
    },
    handleOpenCropper() {
      this.$refs.cropperDialog.select()
    },
    handleOpenCropper1() {
      this.$refs.cropperDialog1.select()
    },
    handleUploadComplete(res) {
      this.cropperImgLocal = res.tempUrl
      this.form.logo = res.url
    },
    handleUploadComplete1(res) {
      this.cropperImgLocal1 = res.tempUrl
      this.form.thumbUrl = res.url
    },
    // 获取校区类型数据
    _getSchoolTypeList() {
      this.$http.get('/v1/dictionary/DicOrganizationCategory/getAll', {
        type: 0
      }).then(res => {
        this.optionsSchoolTypeList = res.data
      })
    },
    // 富文本编译器 Handle image uploading instead of using default conversion to Base64
    handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      this.$http.upload(file)
        .then(res => {
          let url = res.url // Get url from response
          Editor.insertEmbed(cursorLocation, 'image', url)
          resetUploader()
        })
    },
    // 获取负责人姓名数据
    _getUserNameList() {
      this.$http.get('/v1/User/getByUserLogo', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }).then(res => {
        this.userNameInfo = res.data
      })
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.school-info-single {
  padding 30px 15px 15px
  background #fff
  // min-height calc(100vh - 180px)
}

.cropper-img {
  // position relative
  display flex
  margin 0 10px 5px
  .cropper-img-con {
    margin 0 10px 10px
    width 160px
    height 80px
    border 1px solid #f2f2f2
  }
  .cropper-btn {
    margin 0 10px 10px
    height 32px
    // position absolute
    // top 0
    // left 0
  }
}

.schoolBtn {
  text-align center
  width 330px
  padding 15px
  border-top 1px solid #f2f2f2
  // position fixed
  // right 0
  // left 0
  // bottom 0px
  // background red
}
</style>

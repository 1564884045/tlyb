<template>
  <!-- 机构介绍 -->
  <div class="container">
    <h1>机构介绍</h1>
    <div class="form-content">
      <el-form class="print-setting-wrapper" ref="form" :rules="rules" :model="form" label-width="80px" :loading="showFromDataInfolog">
        <el-form-item prop="imgUrl" label="背景图" class="uploader-wrapper">
          <el-upload class="avatar-uploader" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="form.imgUrl" :src="form.imgUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="right-tip">
            <el-button icon="el-icon-delete" @click="handleDeleteLogo"></el-button>
            <ul class="bottom-top">
              <li>建议图片尺寸为1267px*395px,其它尺寸可能会导致图片显示失真</li>
              <li>图片支持JPEG、JPG、PNG格式</li>
              <li>图片大小不能超过2M,否则会导致上传失败</li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="机构简介" prop="description">
          <el-input class="description" placeholder="请输入10到200个字符" maxlength="200" rows="6" show-word-limit type="textarea" minlength="10" v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item :required="true" prop="content" label="图文内容">
          <editor-bar :uploadImgMaxSize="3*1024*1024" v-model="form.content" ref="editors" @onSuccess="editorUploadImgSuccess" @onChange="editorContentChange"></editor-bar>
        </el-form-item>
        <el-form-item class="form_button">
          <el-button type="primary" :loading="submitBtnLoding" @click="submitForm('form')">保存更改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EditorBar from '../../components/WangEditor'

export default {
  name: 'OrganizationIntro',
  data() {
    return {
      showFromDataInfolog: false,
      formTitle: '新增机构简介',
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL, // 上传图片地址
      submitBtnLoding: false,
      // dialogVisible: false,
      form: {
        id: '',
        content: null, // 图文内容
        description: null, // 机构简介
        imgUrl: null // 图片地址
      },
      rules: {
        content: [
          { required: true, message: '图文内容不能为空', trigger: 'blur' }
        ],
        imgUrl: [{ required: true, message: '请上传图片', trigger: 'blur' }],
        description: [
          { required: true, message: '请输入机构简介', trigger: 'blur' },
          {
            min: 10,
            max: 200,
            message: '长度在 10 到 200 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  components: {
    EditorBar
  },
  mounted() {
    this._getOrganizationInfos()
  },
  computed: {
    ...mapGetters(['currentBranch', 'userInfo', 'organizationInfo'])
  },
  methods: {
    // 获取
    _getOrganizationInfos() {
      this.showFromDataInfolog = true
      this.$http
        .get(
          '/v1/FaceDeviceOrganizationProfile/getByOrgazanitionIdAndDepartmentId',
          {
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id
          }
        )
        .then((res) => {
          this.form = {
            id: res.data.id,
            content: res.data.content,
            description: res.data.description,
            imgUrl: res.data.imgUrl
          }
        })
        .catch(() => {
          this.form = {
            content: this.form.content, // 图文内容
            description: this.form.description, // 机构简介
            imgUrl: this.form.imgUrl, // 图片地址
            id: this.form.id
          }
        })
        .finally(() => {
          this.showFromDataInfolog = false
        })
    },
    /**
     *method 请求方法
     *Url 接口地址
     *params 传送数据
     */
    pushOrganizationInfos(Url, method, params, captionOne, captionTwo) {
      method(Url, params)
        .then((res) => {
          this.$message({
            type: 'success',
            message: captionOne
          })
        })
        .catch(() => {
          this.$message({
            type: 'warning',
            message: captionTwo
          })
        })
        .finally(() => {
          this.submitBtnLoding = false
          this._getOrganizationInfos()
        })
    },
    // 新增/更新
    _addOrganizationInfos() {
      const params = {
        content: this.form.content, // 图文内容
        organizationId: this.organizationInfo.id, // 所属机构ID
        departmentId: this.currentBranch.id, // 所属分校ID
        description: this.form.description, // 机构简介
        imgUrl: this.form.imgUrl, // 图片地址
        id: this.form.id
      }
      if (this.form.id) {
        // 更新
        this.pushOrganizationInfos(
          '/v1/FaceDeviceOrganizationProfile/updateFaceDeviceOrganizationProfile',
          this.$http.put,
          params,
          '更新成功',
          '更新失败'
        )
      } else {
        // 新增
        this.pushOrganizationInfos(
          '/v1/FaceDeviceOrganizationProfile/addFaceDeviceOrganizationProfile',
          this.$http.post,
          params,
          '新增成功',
          '新增失败'
        )
      }
    },
    handleDeleteLogo() {
      if (!this.form.imgUrl || !this.form.id) return
      this.$http
        .put(
          '/v1/FaceDeviceOrganizationProfile/updateFaceDeviceOrganizationProfile',
          {
            id: this.form.id,
            imgUrl: ''
          }
        )
        .then((res) => {
          this.form.imgUrl = ''
        })
    },
    // 表单校验、提交新增或更新
    submitForm(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (this.form.content === '' || this.form.content === '<p><br></p>') {
            this.$message({
              type: 'warning',
              message: '图文内容不能为空'
            })
          } else {
            this.submitBtnLoding = true
            // 提交数据
            this._addOrganizationInfos()
            // 重置数据
            // this._getOrganizationInfos()
          }
        } else {
          return false
        }
      })
    },
    // 上传图片（上传成功后执行）
    handleAvatarSuccess(res, file, files) {
      if (file.response) {
        this.form.imgUrl = null
        this.form.imgUrl = file.response.data[0].downloadPath
      }
    },
    // 限制图片大小(上传之前的判断)
    beforeAvatarUpload(file) {
      const imageStyleJPG = file.type === 'image/jpeg'
      const imageStylePNG = file.type === 'image/png'
      const imageStyleJPEG = file.type === 'image/jpeg'
      const imageSize = file.size / 1024 / 1024 < 2
      if (!imageStyleJPG && !imageStylePNG && !imageStyleJPEG) {
        this.$message.error('上传头像图片只能是 JEPG、JPG、PNG格式!')
      }
      if (!imageSize) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      this.loading = true
      return (imageStyleJPG || imageStylePNG || imageStyleJPEG) && imageSize
    },
    // 富文本编辑器上传成功事件
    editorUploadImgSuccess(xhr, editor, result) {
      this.$message({
        type: 'success',
        message: '上传成功'
      })
    },
    editorContentChange(data) {
      this.form.content = data
    }
  }
}
</script>

<style lang="stylus" scoped>
h1
  margin 0
  padding 12px
  margin-bottom 10px
  background-color #ffffff
.form-content
  background-color #ffffff
.print-setting-wrapper
  width 800px
  background #ffffff
  padding 12px
  .avatar-uploader
    line-height 1
    img
      border 1px dashed #aaaaaa
      border-radius 5px
  .el-upload
    border 1px dashed #d9d9d9
    border-radius 6px
    cursor pointer
    position relative
    overflow hidden
  .el-upload:hover
    border-color #409EFF
  .avatar-uploader-icon
    font-size 28px
    color #8c939d
    width 138px
    height 138px
    line-height 138px
    text-align center
    border-radius 5px
    border 1px dashed #d9d9d9
    &:hover
      border 1px dashed green
  .avatar
    width 138px
    height 138px
    border 1px dashed #d9d9d9
    display block
.uploader-wrapper
  .right-tip
    position absolute
    top 0
    left 138px
    margin-left 16px
    padding 2px 0
    box-sizing border-box
  .bottom-top
    margin-top 45px
    color $color-text-3
    font-size 13px
    line-height 1.6
    margin-left 16px
    li
      list-style-type disc
</style>

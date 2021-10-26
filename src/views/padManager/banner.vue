<template>
  <div class="container">
    <div class="query-form">
      <div style="float: right">
        <el-button type="primary" @click="dialogVisible = true" icon="el-icon-plus">新增数据</el-button>
      </div>
    </div>
    <div class="showTableData">
      <el-table v-loading="tableloading" :data="tableData" style="width: 100%">
        <el-table-column fixed prop="title" label="标题" width="140"></el-table-column>
        <el-table-column prop="imgUrl" label="banner图片" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl" alt="图片加载中" width="auto" height="50" @click="chakandatu(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="linkUrl" align="center" label="资源预览" width="120">
          <template slot-scope="scope">
            <a :href="scope.row.linkUrl" v-if="!scope.row.resourceType" target="_blank">外部预览</a>
            <el-button v-if="scope.row.resourceType" @click="handleViewContent(scope.row)" type="text">点击预览</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createAt" align="center" label="创建日期" width="200"></el-table-column>
        <el-table-column prop="updateAt" align="center" label="更新时间" width="200"></el-table-column>
        <el-table-column fixed="right" width="200" align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="redactInfo(scope.row)" size="small">编辑</el-button>
            <el-button @click="open(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
          <!-- 分页 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParam.pageNum"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>

    <!-- 新建banner数据 -->
    <el-dialog :title="formTitle" :closeOnClickModal="false" :visible.sync="dialogVisible" width="800px" custom-class="custom-dialog" :before-close="initialForm">
      <el-form class="fromSize" :rules="rules" ref="form" :model="form" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input placeholder="请输入3到20个字符" maxlength="20" v-model="form.title"></el-input>
        </el-form-item>

        <el-form-item prop="imgUrl" label="上传图片" class="uploader-wrapper">
          <el-upload class="avatar-uploader" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="form.imgUrl" :src="form.imgUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="right-tip">
            <el-button icon="el-icon-delete" @click="handleDeleteLogo"></el-button>
            <ul class="bottom-top">
              <li>建议图片尺寸为1920px*400px,其它尺寸可能会导致图片显示失真</li>
              <li>图片支持JPEG、JPG、PNG格式</li>
              <li>图片大小不能超过2M,否则会导致上传失败</li>
            </ul>
          </div>
        </el-form-item>
        <!-- 资源类型 -->
        <el-form-item :required="true" label="资源类型">
          <el-select v-model="form.resourceType" placeholder="请选择">
            <el-option :key="'外部链接'" label="外部链接" :value="0"></el-option>
            <el-option :key="'图文'" label="图文" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <!-- 外部链接 时显示-->
        <el-form-item v-show="form.resourceType === 0" label="外部链接" prop="linkUrl" :rules="this.form.resourceType === 0 ? [{required: true, message: '外部链接不能为空', trigger: 'blur'}] : [{required: false, message: '请选择资源类型', trigger: 'blur'}]">
          <el-input v-model="form.linkUrl" maxlength="200"></el-input>
        </el-form-item>
        <!-- 图文 时显示-->
        <el-form-item v-show="form.resourceType === 1" prop="content" label="图文内容" :rules="this.form.resourceType === 1 ? [{required: true, message: '图文内容不能为空', trigger: 'blur'}] : [{required: false, message: '请选择资源类型', trigger: 'blur'}]">
          <editor-bar v-model="form.content" ref="editors" @onSuccess="editorUploadImgSuccess" @onChange="editorContentChange"></editor-bar>
        </el-form-item>
        <el-form-item class="form_button">
          <el-button style="float: right;margin-left: 14px" type="primary" v-loading="submitBtnLoding" @click="submitForm('form')">{{ this.form.id ? '更新' : '新增' }}</el-button>
          <el-button style="float: right" @click="initialForm()">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 图文预览 -->
    <el-dialog class="preview" title="图文预览" custom-class="custom-dialog" :visible.sync="viewContentDialogVisible" width="800px">
      <div class="img-preview">
        <!-- <img src="../../assets/pad_bg.png" alt=""> -->
        <div v-html="viewHtmlContent"></div>
      </div>
    </el-dialog>
    <!-- 大图 -->
    <el-dialog :visible.sync="viewTupian" custom-class="custom-dialog" :show-close="false" width="500px">
      <img :src="tupiansrc" alt="图片加载中" width="100%" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EditorBar from '../../components/WangEditor'

export default {
  name: 'Banner',
  data() {
    return {
      upImgloading: false,
      viewTupian: false,
      tupiansrc: '',
      viewHtmlContent: '<p></p>',
      viewContentDialogVisible: false, // 图文效果
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL, // 上传图片地址
      tableloading: false,
      dialogVisible: false,
      tableData: [],
      formTitle: '新增数据',
      submitBtnLoding: false,
      form: {
        id: '',
        imgUrl: '', // banner图片地址
        resourceType: 0, // 资源类型(0-外部链接，1-图文
        title: '', // 标题
        content: '', // 图文内容
        createAt: null, // 创建时间(时间格式为：yyyy-MM-dd HH:mm:ss)
        linkUrl: '', // 外部链接地址
        valid: null // 是否有效
      },
      total: null, // 数据长度
      // 表单校验
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        imgUrl: [
          { required: true, message: '请上传banner图片', trigger: 'blur' },
          {
            min: 3,
            max: 200,
            message: '长度在 3 到 200 个字符',
            trigger: 'blur'
          }
        ],
        resourceType: [
          { required: true, message: '请选择资源类型', trigger: 'blur' }
        ]
      },
      // 分页数据
      queryParam: {
        // 默认初始页
        pageNum: 1,
        // 默认每页数据条数
        pageSize: 10,
        type: null,
        status: null
      }
    }
  },
  components: {
    EditorBar
  },
  computed: {
    ...mapGetters(['currentBranch', 'userInfo', 'organizationInfo'])
  },
  created() {
    this._getBannerInfos()
  },
  methods: {
    // 获取列表
    _getBannerInfos() {
      this.tableloading = true
      const params = {
        pageNum: this.queryParam.pageNum, // 当前页
        pageSize: this.queryParam.pageSize, // 每页条数
        organizationId: this.organizationInfo.id, // 所属机构ID
        departmentId: this.currentBranch.id, // 所属分校ID
        imgUrl: '',
        resourceType: null, // 资源类型(0-外部链接，1-图文)
        title: '' // 标题
      }
      this.$http
        .get('/v1/FaceDeviceBanner/getList', params)
        .then((res) => {
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableloading = false
        })
    },
    // 新增
    _setBannerInfos() {
      // 富文本内容赋值给this.form.content
      const params = {
        organizationId: this.organizationInfo.id, // 所属机构ID
        departmentId: this.currentBranch.id, // 所属分校ID
        id: this.form.id,
        content: this.form.content,
        imgUrl: this.form.imgUrl, // banner图片URL
        linkUrl: this.form.linkUrl, // 链接地址
        resourceType: this.form.resourceType, // 资源类型(0-外部链接，1-图文)
        title: this.form.title // 标题
      }
      if (params.id) {
        this.$http
          .put('/v1/FaceDeviceBanner/updateFaceDeviceBanner', params)
          .then((res) => {
            // 重新获取列表
            this._getBannerInfos()
          })
          .finally(() => {
            this.submitBtnLoding = false
          })
      } else {
        this.$http
          .post('/v1/FaceDeviceBanner/addFaceDeviceBanner', params)
          .then((res) => {
            this._getBannerInfos()
          })
          .finally(() => {
            this.submitBtnLoding = false
          })
      }
    },
    // 限制图片大小(上传之前的判断)
    beforeAvatarUpload(file) {
      this.upImgloading = true
      const imageStyleJPG = file.type === 'image/jpeg'
      const imageStylePNG = file.type === 'image/png'
      const imageStyleSVG = file.type === 'image/svg'
      const imageSize = file.size / 1024 / 1024 < 2
      if (!imageStyleJPG && !imageStylePNG && !imageStyleSVG) {
        this.$message.error('上传头像图片只能是 JPG、PNG、SVG 格式!')
        this.upImgloading = false
      }
      if (!imageSize) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        this.upImgloading = false
      }
      return imageStyleJPG || imageStylePNG || (imageStyleSVG && imageSize)
    },
    // 上传图片（上传成功后执行）
    handleAvatarSuccess(res, file, files) {
      if (file.response) {
        this.form.imgUrl = null
        this.form.imgUrl = file.response.data[0].downloadPath
      }
      this.upImgloading = false
    },
    handleRemove(file, fileList) {
    },
    // 当前页
    handleCurrentChange(currentPage) {
      this.queryParam.pageNum = currentPage
      this._getBannerInfos()
    },
    // 每页数据条数
    handleSizeChange(pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNum = 1
      this._getBannerInfos()
    },
    chakandatu(row) {
      this.viewTupian = true
      this.tupiansrc = row.imgUrl
    },
    // 图文
    handleViewContent(row) {
      this.viewHtmlContent = row.content
      this.viewContentDialogVisible = true
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
    },
    // 表单校验、提交新增或更新
    submitForm(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if (this.form.resourceType) {
            this.form.linkUrl = ''
          } else {
            this.form.content = ''
          }
          let reg = /(http|https):\/\/([\w.]+\/?)\S*/gi
          if (this.form.resourceType === 1 && this.form.content === '<p><br></p>') {
            return this.$message({ type: 'warning', message: '图文内容不能为空' })
          } else if (!this.form.linkUrl.match(reg) && this.form.resourceType === 0) {
            return this.$message({ type: 'warning', message: '外部链接格式错误' })
          } else {
            this.submitBtnLoding = true
            // 提交数据
            this._setBannerInfos()
            // 初始化初始化数据
            this.initialForm()
            this._getBannerInfos()
          }
        } else {
          return false
        }
      })
    },
    // 编辑
    redactInfo(row) {
      this.form = {
        id: row.id,
        imgUrl: row.imgUrl, // banner图片地址
        resourceType: row.resourceType, // 资源类型(0-外部链接，1-图文
        title: row.title, // 标题
        content: row.content, // 图文内容
        createAt: row.createAt, // 创建时间(时间格式为：yyyy-MM-dd HH:mm:ss)
        linkUrl: row.linkUrl // 外部链接地址
      }
      this.formTitle = '更新数据'
      this.dialogVisible = true
    },
    // 关闭窗口时清除数据
    initialForm() {
      this.dialogVisible = false
      this.$refs.editors.clearTxt()
      this.form = {
        id: '',
        imgUrl: '', // banner图片地址
        resourceType: 0, // 资源类型(0-外部链接，1-图文
        title: '', // 标题
        content: null, // 图文内容
        createAt: null, // 创建时间(时间格式为：yyyy-MM-dd HH:mm:ss)
        linkUrl: null // 外部链接地址
      }
      this.formTitle = '新增简介'
      this.$refs.form.clearValidate()
    },
    // 删除
    deleBanner(row) {
      this.$http
        .delete('/v1/FaceDeviceBanner/updateValidById/', { id: row.id })
        .then((res) => {})
        .finally(() => {
          // 删除后重载数据，当前页若无数据，返回首页
          if (this.tableData.length === 1) {
            this.queryParam.pageNum = this.queryParam.pageNum - 1
          }
          this._getBannerInfos()
        })
    },
    // 删除时提示
    open(row) {
      this.$confirm(`此操作将永久删除 【${row.title}】 , 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleBanner(row)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
    },
    // 删除图片
    handleDeleteLogo() {
      this.form.imgUrl = ''
    }
  }
}
</script>

<style lang="stylus" scoped>
.img-preview
  background-image url('../../assets/pad_bg.png')
  background-size 100% auto
  background-repeat no-repeat
  height 400px
  padding 108px 40px 0px 40px
  div
    height 358px
    overflow-y auto
.block
  margin-top 18px
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
.showTableData
  background #fff
  padding 14px
</style>

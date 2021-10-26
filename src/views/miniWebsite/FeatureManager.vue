<!-- 新闻资讯管理 -->
<template>
  <div class="container">
    <div class="dialog-box">
        <div class="dialog-left">
          <div class="left-content">
            <news :newsData="formData" @emptyData="emptyData" @child-event="handleUpdataImg" @child-content="handleUpdataContent"  @child-addPushData="addPushData"></news>
          </div>
          <el-button class="bnt" type="primary" :loading="submitLoading" @click="handleSumbit">确认提交</el-button>
        </div>
        <div class="dialog-right">
          <el-form class="form" :model="formData" ref="form" :rules="rules" label-width="80px">
            <el-form-item label="标题字体" prop="titleFontSize">
              <el-radio-group v-model="formData.titleFontSize">
                <el-radio label="20px">大</el-radio>
                <el-radio label="16px">中</el-radio>
                <el-radio label="12px">小</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" minlength="3" style="width: 400px" maxlength="20" show-word-limit autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="缩略图" prop="headerImgUrl">
              <div @click="upload(0)">
                <el-upload
                  :action="imgUploadPath"
                  accept="image/*"
                  list-type="picture-card"
                  :show-file-list="true"
                  :limit="9"
                  :file-list="formData.imgList"
                  :before-upload="handleBeforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-remove="handleRemoveheaderImgUrl"
                >
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" style="color:#409EFF;">建议大小：2M以内（375*160）</div>
                </el-upload>
              </div>
            </el-form-item>
            <div class="form-content">
              <el-form-item id="content" label="内容" prop="content">
                <el-input v-model="inputContentValue" style="width: 500px" type="textarea" rows="4" maxlength="120" show-word-limit autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label prop>
                <el-button type="primary" @click="handleAddContent(0)">确 定</el-button>
              </el-form-item>
            </div>

            <div class="form-content">
              <el-form-item label="图片排版" prop="styleName">
                <el-radio-group @change="changeImgNumber" v-model="formData.styleName">
                  <el-radio label="single">单张平铺</el-radio>
                  <el-radio label="most">九宫格布局</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item id="resources" label="图集" prop="resources">
                <div @click="upload(1)">
                  <el-upload
                    :action="imgUploadPath"
                    accept="image/*"
                    list-type="picture-card"
                    :show-file-list="true"
                    :limit="upImgData.imgNumber"
                    :file-list="formData.contentImgList"
                    :before-upload="handleBeforeUpload"
                    :on-success="handleUploadSuccess"
                    :on-remove="handleRemovecontentImg"
                  >
                    <i class="el-icon-plus avatar-uploader-icon"></i>
                    <div slot="tip" style="color:#409EFF;">建议大小：2M以内，建议张数：最多9张（375*160）</div>
                  </el-upload>
                </div>
              </el-form-item>
              <el-form-item label prop>
                <el-button type="primary" @click="handleAddContent(1)">确 定</el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import News from './components/News'

export default {
  name: 'FeatureManager',
  data() {
    return {
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      submitLoading: false,
      uploadStatus: 0, // 0：上传缩略图 1：上传图片
      inputContentValue: '',
      formData: {
        titleFontSize: '16px',
        styleName: 'single',
        headerImgUrl: null, // 缩略图
        title: null, // 标题
        imgList: [], // 回显数据
        contentImgList: [],
        content: {// 内容
          contentValue: []
        }
      },
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        content: [{ required: true, message: '请填写内容', trigger: 'blur' }],
        title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
        headerImgUrl: [{ required: true, message: '请上传课程封面图片', trigger: 'blur' }]
      },
      upImgData: {
        index: -1,
        ind: -1,
        imgNumber: 9
      },
      upContentDataIndex: -1
    }
  },
  // 声明组件
  components: {
    News
  },
  // 生命周期 - 创建完成
  created() {
    this._getList()
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  },
  // 相关方法
  methods: {
    handleAddContent(state) {
      if (!state) { // 上传文本
        if (this.inputContentValue) {
          if (this.upContentDataIndex === -1) {
            this.formData.content.contentValue.push(`contentVallue${this.inputContentValue}`)
          } else {
            this.formData.content.contentValue.splice(this.upContentDataIndex, 1, `contentVallue${this.inputContentValue}`)
            this.upContentDataIndex = -1
          }
          this.inputContentValue = ''
        } else {
          this.$message({ type: 'warning', message: '请先输入添加的内容' })
        }
      } else { // 上传图片
        if (this.formData.contentImgList.length > 0) {
          this.formData.contentImgList.forEach((item) => {
            item.styleName = this.formData.styleName
          })
          if (this.upImgData.index === -1) { // 新增：直接在数据末尾添加图片
            this.formData.content.contentValue.push(this.formData.contentImgList)
          } else { // 修改：替换原来的数据
            this.formData.content.contentValue[this.upImgData.index].splice(this.upImgData.ind, 1)
            this.formData.contentImgList.forEach((o) => {
              this.formData.content.contentValue[this.upImgData.index].splice(this.upImgData.ind, 0, o)
            })
            this.upImgData = {
              index: -1,
              ind: -1,
              imgNumber: 9
            }
          }
          this.formData.contentImgList = []
        } else {
          this.$message({ type: 'warning', message: '请先选择上传的图片' })
        }
      }
    },
    // 获取列表
    _getList() {
      this.tableLoading = true
      let param = {
        pageNum: this.queryParam.pageNum,
        pageSize: this.queryParam.pageSize,
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id // 所属机构ID
      }
      this.$http
        .get('/v1/MiniWebsiteFeature/getList', param)
        .then((res) => {
          if (res.data.length > 0) {
            this.formData = {
              id: res.data[0].id,
              titleFontSize: res.data[0].title.slice(res.data[0].title.length - 4, res.data[0].title.length),
              styleName: 'single',
              headerImgUrl: res.data[0].headerImgUrl, // 缩略图
              title: res.data[0].title.slice(0, res.data[0].title.length - 4), // 标题
              imgList: [], // 回显数据
              contentImgList: [],
              content: JSON.parse(res.data[0].content.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
            }
            this.formData.imgList.push({
              name: 'asdukojhgdasas.png',
              url: res.data[0].headerImgUrl
            })
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 打开编辑弹窗
    openAddTeacherInfoDialog(item) {
      if (item) {
        this.formData = {
          id: item.id,
          styleName: 'single',
          titleFontSize: item.titleFontSize,
          headerImgUrl: item.headerImgUrl,
          content: JSON.parse(item.content),
          title: item.title,
          imgList: [], // 回显数据
          // resourcesImgList: [] // 新上传的图片列表
          contentImgList: []
        }
        this.formData.imgList = [
          { name: 'default.png', url: item.headerImgUrl }
        ]
      }
      this.dialogVisible = true
    },
    // 新增数据
    handleSumbit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          let param = {
            content: JSON.stringify(this.formData.content),
            headerImgUrl: this.formData.headerImgUrl,
            title: this.formData.title + this.formData.titleFontSize,
            departmentId: this.currentBranch.id, // 所属分校ID
            organizationId: this.organizationInfo.id // 所属机构ID
          }
          if (!this.formData.id) { // 新增数据
            this.$http
              .post('/v1/MiniWebsiteFeature/addMiniWebsiteFeature', param)
              .then((res) => {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                })
                // 清除数据
                this.shutDialog()
                // 重新加载数据
                this._getList()
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            param.id = this.formData.id
            this.$http
              .put('/v1/MiniWebsiteFeature/updateMiniWebsiteFeature', param)
              .then((res) => {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                })
                // 清除数据
                this.shutDialog()
                // 重新加载数据
                this._getList()
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        } else {
          this.$message({ type: 'warning', message: '请完成必填项' })
        }
      })
    },
    handleBeforeUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过1M!')
      }
      return isJPG && isLt2M
    },
    // 判断是上传缩略图图/内容里的图片
    upload(status) {
      this.uploadStatus = status
    },
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          if (!this.uploadStatus) { // 上传封面图
            if (!this.formData.headerImgUrl) {
              this.formData.headerImgUrl = ''
            }
            res.data.forEach(item => {
              this.formData.headerImgUrl = item.downloadPath
              // 处理回显数据
              this.formData.imgList = [
                { name: 'default.png', url: item.downloadPath }
              ]
            })
          } else { // 上传课程图片
            res.data.forEach(item => {
              this.formData.contentImgList.push({ name: 'default.png', url: item.downloadPath })
            })
          }
        }
      }
    },
    handleRemoveheaderImgUrl(file, fileList) {
      this.formData.headerImgUrl = ''
      this.formData.imgList = fileList
    },
    handleRemovecontentImg(file, fileList) {
      this.formData.contentImgList = fileList
    },
    // 修改图片
    handleUpdataImg(index, val, ind) {
      this.upImgData = {
        index: index,
        ind: ind
      }
      this.formData.contentImgList = []
      this.formData.contentImgList.push({
        name: val.name,
        url: val.url
      })
      this.formData.styleName = val.styleName
    },
    // 修改文字
    handleUpdataContent(index) {
      this.upContentDataIndex = index
      let childContent = this.formData.content.contentValue[index]
      this.inputContentValue = childContent.slice(13, childContent.length)
    },
    // 指定位置添加数据
    addPushData(item, index, type) {
      index = type ? index : index + 1
      if (item) {
        this.formData.content.contentValue.splice(index, 0, 'contentVallue欢迎使用桃李云帮，智慧教育服务平台！')
        this.handleUpdataContent(index)
      } else {
        console.log(this.formData.content.contentValue)
        let imgItems = [
          {
            name: 'default.png',
            url: 'http://qz.cdn.ideatower.cn/159273913770347bcba32-827b-4448-8f07-21496024c8ef.jpg',
            styleName: 'single'
          }
        ]
        this.formData.content.contentValue.splice(index, 0, imgItems)
        this.handleUpdataImg(index, this.formData.content.contentValue[index][0], 0)
        // alert('添加图片')
      }
    },
    // 改变图片上传数量
    changeImgNumber(value) {
      if (value === 'most') {
        this.upImgData.imgNumber = 9
      } else {
        this.upImgData.imgNumber = 1
      }
    },
    // 删除图片或文字清空表单修改数据
    emptyData(type) {
      if (type) {
        this.upContentDataIndex = -1
        this.inputContentValue = ''
      } else {
        this.upImgData = {
          index: -1,
          ind: -1,
          imgNumber: 9
        }
        this.formData.contentImgList = []
      }
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
.container
  background-color #ffffff
  padding 20px 0px 20px 20px
.dialog-box
  display flex
  max-width 1200px
  .dialog-left
    width 260px
    height 500px
    background-image url('../../assets/iphoneBorder.png')
    background-size 100% 100%
    position relative
    .left-content
      position absolute
      top 6%
      width 94%
      height 88%
      left 3%
      overflow-y auto
  .dialog-right
    flex 1
    border 1px solid #eeeeee
    margin-left 20px
    .form
      overflow-y auto
      margin-left 10px
      .form-content
        padding 8px 6px 0 0
@media screen and (max-width: 1400px)
  .dialog-right
    .form
      height calc(100vh - 60px)
@media screen and (min-width: 1400px)
  .dialog-right
    min-height 800px
    margin 0px 20px
    padding 10px 30px 0px 0px
    .form
      height 100%
.viewPhone
  width 260px
  height 500px
  background-image url('../../assets/iphoneBorder.png')
  background-size 100% 100%
  position relative
  .viewPhone-content
    position absolute
    top 6%
    width 94%
    height 88%
    left 3%
    overflow-y auto
.bnt
  margin-top 520px
  margin-left 81px
</style>

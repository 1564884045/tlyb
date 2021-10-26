<!-- 新闻资讯管理 -->
<template>
  <div class="container">
    <div class="dialog-box">
      <div class="dialog-left">
        <div class="left-content">
          <news :newsData="formData" @child-event="handleUpdataImg" @child-content="handleUpdataContent" @emptyData="emptyData" @child-addPushData="addPushData"></news>
        </div>
      </div>
      <div class="dialog-right">
        <el-form class="form" :model="formData" ref="form" :rules="rules" label-width="80px">
          <div class="form-content">
            <el-form-item label="图片排版" prop="styleName">
              <el-radio-group @change="changeImgNumber" v-model="formData.styleName">
                <el-radio label="single">单张平铺</el-radio>
                <el-radio label="most">九宫格布局</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item id="resources" label="图集" prop="resources">
              <div>
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
            <el-form-item label>
              <el-button style="float:right;margin-right:4px" type="primary" @click="handleAddContent(1)">确 定</el-button>
            </el-form-item>

            <div class="form-content">
              <el-form-item id="content" label="内容" prop="content">
                <el-input v-model="inputContentValue" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label prop>
                <el-button style="float:right;margin-right:4px" type="primary" @click="handleAddContent(0)">确 定</el-button>
              </el-form-item>
            </div>
            <el-button class="bnt" type="primary" :loading="submitLoading" @click="handleSumbit">确认提交</el-button>
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
  name: 'EnvironmentManager',
  data() {
    return {
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      submitLoading: false,
      uploadStatus: 0, // 0：上传缩略图 1：上传图片
      inputContentValue: '',
      formData: {
        id: null,
        styleName: 'single',
        contentImgList: [],
        content: {
          // 内容
          contentValue: []
        }
      },
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        content: [{ required: true, message: '请填写内容', trigger: 'blur' }]
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
      if (!state) {
        // 上传文本
        if (this.inputContentValue) {
          if (this.upContentDataIndex === -1) {
            this.formData.content.contentValue.push(
              `contentVallue${this.inputContentValue}`
            )
          } else {
            this.formData.content.contentValue.splice(
              this.upContentDataIndex,
              1,
              `contentVallue${this.inputContentValue}`
            )
            this.upContentDataIndex = -1
          }
          this.inputContentValue = ''
        } else {
          this.$message({ type: 'warning', message: '请先输入添加的内容' })
        }
      } else {
        // 上传图片
        if (this.formData.contentImgList.length > 0) {
          this.formData.contentImgList.forEach((item) => {
            item.styleName = this.formData.styleName
          })
          if (this.upImgData.index === -1) {
            // 新增：直接在数据末尾添加图片
            this.formData.content.contentValue.push(
              this.formData.contentImgList
            )
          } else {
            // 修改：替换原来的数据
            this.formData.content.contentValue[this.upImgData.index].splice(
              this.upImgData.ind,
              1
            )
            this.formData.contentImgList.forEach((o) => {
              this.formData.content.contentValue[this.upImgData.index].splice(
                this.upImgData.ind,
                0,
                o
              )
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
        .get('/v1/MiniWebsiteEnvironment/getList', param)
        .then((res) => {
          this.tableDatas = res.data
          if (res.data.length > 0) {
            this.formData = {
              id: res.data[0].id,
              styleName: 'single',
              contentImgList: [],
              content: JSON.parse(res.data[0].content.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
            }
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 新增数据
    handleSumbit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          let param = {
            content: JSON.stringify(this.formData.content),
            departmentId: this.currentBranch.id, // 所属分校ID
            organizationId: this.organizationInfo.id // 所属机构ID
          }
          if (!this.formData.id) {
            // 新增数据
            this.$http
              .post(
                '/v1/MiniWebsiteEnvironment/addMiniWebsiteEnvironment',
                param
              )
              .then((res) => {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                })
                // 重新加载数据
                this._getList()
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            param.id = this.formData.id
            this.$http
              .put(
                '/v1/MiniWebsiteEnvironment/updateMiniWebsiteEnvironment',
                param
              )
              .then((res) => {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                })
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
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          // 上传课程图片
          res.data.forEach((item) => {
            this.formData.contentImgList.push({
              name: 'default.png',
              url: item.downloadPath
            })
          })
        }
      }
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
        this.formData.content.contentValue.splice(
          index,
          0,
          'contentVallue欢迎使用桃李云帮，智慧教育服务平台！'
        )
        this.handleUpdataContent(index)
      } else {
        let imgItems = [
          {
            name: 'default.png',
            url:
              'http://qz.cdn.ideatower.cn/159273913770347bcba32-827b-4448-8f07-21496024c8ef.jpg',
            styleName: 'single'
          }
        ]
        this.formData.content.contentValue.splice(index, 0, imgItems)
        this.handleUpdataImg(index, this.formData.content.contentValue[index][0], 0)
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
  padding 20px
.dialog-box
  display flex
  width 960px
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
      // height calc(100vh - 60px)
      overflow-y auto
      margin-left 10px
      .form-content
        padding 8px 6px 0 0
@media screen and (max-width: 1400px)
  .dialog-right
    margin 0px 20px
    padding 10px 30px 0px 0px
    .form
      height calc(100vh - 60px)
@media screen and (min-width: 1400px)
  .dialog-right
    min-height 520px
    margin 0px 20px
    padding 10px 30px 0px 0px
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
  position relative
  left 20px
  top -20px
</style>

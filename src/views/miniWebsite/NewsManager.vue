<!-- 新闻资讯管理 -->
<template>
  <div class="container">
    <div class="query-form">
      <div style="float: left;border: 1px solid #ffffff">
        <el-checkbox :disabled="!tableLoading ? false : true" v-model="available" @change="query">仅查看有效</el-checkbox>
      </div>
      <div style="float: right">
        <el-button type="primary" @click="openAddTeacherInfoDialog(0)" icon="el-icon-plus">新增</el-button>
      </div>
    </div>
    <div style="margin-top: 10px; background-color: #fff; padding: 15px">
      <el-table :data="tableDatas" style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="title" label="标题" width="140" fixed="left" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column
            prop="thumbnail"
            label="缩略图"
            width="120"
            align="center"
            >
            <template slot-scope="scope">
              <img :src="scope.row.thumbnail" alt="" style="height: 42px; width: 80px ">
            </template>
          </el-table-column>
        <el-table-column prop="content" label="内容" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleCheck(scope.row)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center"></el-table-column>
        <el-table-column prop="shareCount" label="分享量" width="100" align="center"></el-table-column>
        <el-table-column prop="available" label="是否有效" align="center" width="100">
          <template slot-scope="scope">
            <el-switch class="el-switch-cutomer1" @click.native="handleUpdateAvailable(scope.row)" :value="scope.row.available" :width="55" size="mini" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openAddTeacherInfoDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click="deleteTeacherInfo(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="_getList"
        :current-page.sync="queryParam.pageNum"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="queryParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="queryParam.total"
        style="margin-top: 10px;">
      </el-pagination>
    </div>
    <el-dialog :title="formData.id ? '编辑数据' : '新增数据'" custom-class="custom-dialog" :visible.sync="dialogVisible" width="800px" @close="shutDialog" :close-on-press-escape="false" :close-on-click-modal="false">
      <div class="dialog-box">
        <div class="dialog-left">
          <div class="left-content">
            <news :newsData="formData" @child-event="handleUpdataImg" @child-content="handleUpdataContent" @emptyData="emptyData" @child-addPushData="addPushData"></news>
          </div>
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
              <el-input v-model="formData.title" minlength="3" maxlength="20" show-word-limit autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="缩略图" prop="thumbnail">
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
                  :on-remove="handleRemoveThumbnail">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" style="color:#409EFF;">建议大小：2M以内（375*160）</div>
                </el-upload>
              </div>
            </el-form-item>
            <div class="form-content">
              <el-form-item id="content" label="内容" prop="content">
                <el-input v-model="inputContentValue" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button style="float:right;margin-right:4px" type="primary" @click="handleAddContent(0)">确 定</el-button>
              </el-form-item>
            </div>

            <div class="form-content">
              <el-form-item label="图片排版" prop="styleName">
                <el-radio-group @change="changeImgNumber" v-model="formData.styleName">
                  <el-radio label="single">单张平铺</el-radio>
                  <el-radio label="most">九宫格布局</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="图集" id="resources" prop="resources">
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
              <el-form-item label="" prop="">
                <el-button style="float:right;margin-right:4px" type="primary" @click="handleAddContent(1)">确 定</el-button>
              </el-form-item>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer" style="float:right;margin: 10px 14px 0 0">
            <el-button @click="shutDialog">取 消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSumbit">提 交</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 预览效果 -->
    <div v-if="viewPhoneDialogVisible" class="phone">
      <div class="mask-layer" @click="handleClosePhoneView"></div>
      <div class="phone-template">
        <news class="phone-preview" :newsData="formData" :isShowHover="false" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import News from './components/News'

export default {
  name: 'MiniWebsiteTeacherManager',
  data() {
    return {
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      dialogVisible: false,
      tableLoading: false,
      submitLoading: false,
      viewPhoneDialogVisible: false,
      tableDatas: [],
      available: false, // 查询条件
      uploadStatus: 0, // 0：上传缩略图 1：上传图片
      inputContentValue: '',
      formData: {
        titleFontSize: '16px',
        styleName: 'single',
        thumbnail: null, // 缩略图
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
        thumbnail: [{ required: true, message: '请上传课程封面图片', trigger: 'blur' }]
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
    // 查看预览效果
    handleCheck(item) {
      this.viewPhoneDialogVisible = true
      this.formData = {
        titleFontSize: item.titleFontSize,
        thumbnail: item.thumbnail,
        content: JSON.parse(item.content),
        title: item.title,
        imgList: [], // 回显数据
        contentImgList: []
      }
    },
    handleViewPhoneClose() {
      this.formData = {
        titleFontSize: '16px',
        styleName: 'single',
        thumbnail: null, // 缩略图
        title: null, // 标题
        imgList: [], // 回显数据
        contentImgList: [],
        content: {// 内容
          contentValue: []
        }
      }
      this.viewPhoneDialogVisible = false
    },
    query(size) {
      this._getList()
    },
    // 是否有效
    handleUpdateAvailable(item) {
      if (new Date().getTime() - sessionStorage.getItem('newDate') < 5000) {
        this.$message.success('请勿频繁操作，5秒后再试试')
        return
      }
      item.available = item.available ? 0 : 1
      const param = {
        id: item.id,
        available: item.available
      }
      sessionStorage.setItem('newDate', new Date().getTime())
      this.$http
        .put('/v1/MiniWebsiteNews/updateMiniWebsiteNews', param)
        .then((res) => {
          return this.$message.success('更改成功')
        })
    },
    // 每页数据条数
    handleSizeChange(pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNum = 1
      this._getBannerList()
    },
    // 获取列表
    _getList() {
      this.tableLoading = true
      let param = {
        pageNum: this.queryParam.pageNum,
        pageSize: this.queryParam.pageSize,
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        available: this.available ? 1 : null
      }
      this.$http
        .get('/v1/MiniWebsiteNews/getList', param)
        .then((res) => {
          res.data.forEach(item => {
            // 处理title，获取设置字体大小
            item.titleFontSize = item.title.slice(item.title.length - 4, item.title.length)
            item.title = item.title.slice(0, item.title.length - 4)
          })
          this.tableDatas = res.data
          this.queryParam.total = res.total
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
          thumbnail: item.thumbnail,
          content: JSON.parse(item.content),
          title: item.title,
          imgList: [], // 回显数据
          // resourcesImgList: [] // 新上传的图片列表
          contentImgList: []
        }
        this.formData.imgList = [
          { name: 'default.png', url: item.thumbnail }
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
            thumbnail: this.formData.thumbnail,
            title: this.formData.title + this.formData.titleFontSize,
            departmentId: this.currentBranch.id, // 所属分校ID
            organizationId: this.organizationInfo.id // 所属机构ID
          }
          if (!this.formData.id) { // 新增数据
            this.$http
              .post('/v1/MiniWebsiteNews/addMiniWebsiteNews', param)
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
              .put('/v1/MiniWebsiteNews/updateMiniWebsiteNews', param)
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
    // 删除
    deleteTeacherInfo(item) {
      this.$confirm('此操作将删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http
          .delete(`/v1/MiniWebsiteNews/updateValidById?id=${item.id}`)
          .then((res) => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            if (this.tableDatas.length === 1) {
              this.queryParam.pageNum--
            }
            this._getList()
          })
      }).catch(() => {
      })
    },
    // 窗口关闭时清除数据
    shutDialog() {
      this.formData = {
        titleFontSize: '16px',
        styleName: 'single',
        thumbnail: null, // 缩略图
        title: null, // 标题
        imgList: [], // 回显数据
        contentImgList: [],
        content: {// 内容
          contentValue: []
        }
      }
      this.dialogVisible = false
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
            if (!this.formData.thumbnail) {
              this.formData.thumbnail = ''
            }
            res.data.forEach(item => {
              this.formData.thumbnail = item.downloadPath
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
    handleRemoveThumbnail(file, fileList) {
      this.formData.thumbnail = ''
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
    },
    handleClosePhoneView() {
      this.viewPhoneDialogVisible = false
      this.formData = {
        titleFontSize: '16px',
        styleName: 'single',
        thumbnail: null, // 缩略图
        title: null, // 标题
        imgList: [], // 回显数据
        contentImgList: [],
        content: {// 内容
          contentValue: []
        }
      }
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.dialog-box
  display flex
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
    .form
      height 500px
      border 1px solid #eeeeee
      overflow-y auto
      margin-left 10px
      .form-content
        border 1px solid #eeeeee
        padding 8px 6px 0 0
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
.phone
  .mask-layer
    width 100vw
    height 100vh
    position fixed
    top 0
    left 0
    background-color rgba(0, 0, 0, 0.5)
    z-index 200
  .phone-template
    width 310px
    height 580px
    background-image url("../../assets/iphoneBorder.png")
    background-size 100% 100%
    box-sizing border-box
    padding 30px 10px 0px 10px
    position fixed
    top 50%
    left 50%
    margin -290px 0 0 -115px
    z-index 200
    .phone-preview
      width 290px
      height 520px
      overflow-y auto
      background-color #fff
@media screen and (min-width: 1300px)
  .phone
    .mask-layer
      width 100vw
      height 100vh
      position fixed
      top 0
      left 0
      background-color rgba(0, 0, 0, 0.5)
      z-index 200
    .phone-template
      width 310px
      height 640px
      background-image url("../../assets/iphoneBorder.png")
      background-size 100% 100%
      box-sizing border-box
      padding 30px 10px 0px 10px
      position fixed
      top 50%
      left 50%
      margin -320px 0 0 -115px
      z-index 200
      .phone-preview
        width 290px
        height 580px
        overflow-y auto
        background-color #fff
>>>.el-switch-cutomer1
  height 40px
  .el-switch__core
    height 26px
    line-height 25px
    border-radius 16px
    &:after
      top 50%
      margin-top -8px
>>>.el-switch-cutomer1 .el-switch__core:before
  display block
  content '否'
  text-align right
  color #646464
  padding-right 8px
>>>.el-switch-cutomer1.is-checked .el-switch__core:before
  content '是'
  text-align left
  color #fff
  padding-left 8px
</style>

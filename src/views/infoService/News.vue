<!-- 校讯帮新闻管理 -->
<template>
  <div class="container">
    <el-tabs v-model="currentTab">
      <el-tab-pane label="新闻管理" name="0"></el-tab-pane>
      <el-tab-pane label="模板库" name="1"></el-tab-pane>
    </el-tabs>
    <div v-if="currentTab === '0'">
      <el-alert :title="remindInfo.title" :description="remindInfo.description" :type="remindInfo.type" style="margin-bottom:10px;"></el-alert>
      <div class="query-form">
        <inline-select v-model="queryParam.targetType" @change="query" label="显示端" valueAttr="value" labelAttr="label" :options="targetTypeOptions" clearable />
        <inline-select v-model="queryParam.status" @change="query" label="状态" valueAttr="value" labelAttr="label" :options="statusOptions" clearable />
        <div style="float: right">
          <el-button type="primary" :disabled="organizationInfo.openWechatDeploy == 1 ? false : true" icon="el-icon-plus" @click="handleAdd()">添加新闻</el-button>
          <el-button type="primary" :disabled="organizationInfo.openWechatDeploy == 1 ? false : true" icon="el-icon-brush" @click="handleUseModelAdd()">使用模板</el-button>
        </div>
      </div>
      <div style="margin-top: 10px; background-color: #fff; padding: 15px">
        <el-table :data="tableDatas" style="width: 100%" v-loading="loading">
          <el-table-column prop="title" label="名称" width="260" fixed="left">
            <template slot-scope="scope">
              <div>
                <el-tag v-if="scope.row.isTop == 1" type="primary">
                  <i class="el-icon-top istop-primary" />已置顶
                </el-tag>
                <el-tag v-if="scope.row.isTop == 0" type="info">
                  <i class="el-icon-top istop-default" />未置顶
                </el-tag>
                <label style="margin-left:10px;font-weight:bold;">{{scope.row.title}}</label>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="thumbnail" label="缩略图" width="120" align="center">
            <template slot-scope="scope">
              <img width="80" height="40" :src="scope.row.thumbnail" />
            </template>
          </el-table-column>
          <el-table-column prop="browseCount" label="浏览次数" width="120" align="center"></el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{scope.row.description || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="显示端" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.type == 0" type="primary">两端</el-tag>
              <el-tag v-if="scope.row.type == 1" type="warning">家长端</el-tag>
              <el-tag v-if="scope.row.type == 2" type="success">教师端</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status == 0" type="primary">未发布</el-tag>
              <el-tag v-if="scope.row.status == 1" type="success">已发布</el-tag>
              <el-tag v-if="scope.row.status == 2" type="danger">已下架</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isTop" label="是否置顶" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="text" v-if="scope.row.isTop == 0" @click="handleIsTop(scope.row)">点击置顶</el-button>
              <el-button type="text" style="color:#67C23A;" v-if="scope.row.isTop == 1" @click="handleIsTop(scope.row)">取消置顶</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="图文内容" width="140" align="center">
            <template slot-scope="scope">
              <el-button v-if="scope.row.content" type="text" @click="handleViewContent(scope.row)">预览效果</el-button>
              <label v-else>-</label>
            </template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="140" align="center"></el-table-column>
          <el-table-column prop="createAt" label="创建时间" width="140" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status == 0" type="text" size="mini" @click="handlePublishNews(scope.row, 1)">发布</el-button>
              <el-button v-if="scope.row.status == 1" type="text" size="mini" @click="handlePublishNews(scope.row, 2)">下架</el-button>
              <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="queryParam.pageNum"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="queryParam.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="margin-top: 10px;"
        ></el-pagination>
      </div>
    </div>
    <div v-else class="model-store">
      <!-- 显示模板库 -->
      <div v-for="(item,index) in selectModelList" :key="index" class="item">
        <img :src="item.thumbbnail" alt />
        <div class="bottom">
          <span class="name">{{item.title}}</span>
          <el-button @click="addModel(item)" class="add-activity">使用模板</el-button>
        </div>
        <div class="icon-box">
          <i @click="checkModel(item)" class="el-icon-view view-icon"></i>
        </div>
      </div>
    </div>
    <!-- 模板库预览效果 -->
    <div v-if="phoneTemplateVisible" class="phone">
      <div class="mask-layer" @click="phoneTemplateVisible = false"></div>
      <div class="phone-template">
        <phone-preview class="phone-preview" :cardStyle="showComponentStyle" :previewData="selectModelFormData" />
      </div>
    </div>
    <!-- 使用模板： 新增/编辑窗口 -->
    <el-dialog :title="form.id ? '编辑新闻' : '新增新闻'" custom-class="custom-dialog" :visible.sync="usemodelDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" width="860px">
      <component v-if="usemodelDialogVisible" :cardStyle="showComponentStyle" :is="showComponent" :updateFormData="selectModelFormData" ref="selectModelComponent">
        <div class="slot">
          <h3 class="basics-title">基础信息：</h3>
          <el-form :model="form" ref="form" :rules="rules" label-width="80px">
            <el-form-item label="名称" prop="title">
              <el-input v-model="form.title" minlength="3" maxlength="30" show-word-limit autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="缩略图" prop="thumbnail">
              <el-upload
                :action="imgUploadPath"
                accept="image/*"
                list-type="picture-card"
                :show-file-list="true"
                :limit="1"
                :file-list="form.imgList"
                :before-upload="handleBeforeUpload"
                :on-success="handleUploadSuccess"
                :on-remove="handleRemove"
              >
                <i class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" style="color:#409EFF;">建议大小：1M以内（375*160）</div>
              </el-upload>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="显示端" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :label="0">两端</el-radio>
                <el-radio :label="1">家长端</el-radio>
                <el-radio :label="2">教师端</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="上线状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="0">未上线</el-radio>
                <el-radio :label="1">已上线</el-radio>
                <el-radio :label="2">已下线</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否置顶" prop="isTop">
              <el-radio-group v-model="form.isTop">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <h3 class="model-title">模板信息：</h3>
        </div>
      </component>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit(1)" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增或编辑窗口 -->
    <el-dialog :title="form.id ? '编辑新闻' : '新增新闻'" :visible.sync="dialogVisible" custom-class="custom-dialog" :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" width="800px">
      <el-form :model="form" ref="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" minlength="3" maxlength="30" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="缩略图" prop="thumbnail">
          <el-upload
            :action="imgUploadPath"
            accept="image/*"
            list-type="picture-card"
            :show-file-list="true"
            :limit="1"
            :file-list="form.imgList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" style="color:#409EFF;">建议大小：1M以内（375*160）</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="显示端" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">两端</el-radio>
            <el-radio :label="1">家长端</el-radio>
            <el-radio :label="2">教师端</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上线状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">未上线</el-radio>
            <el-radio :label="1">已上线</el-radio>
            <el-radio :label="2">已下线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否置顶" prop="isTop">
          <el-radio-group v-model="form.isTop">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <editor-bar v-model="form.content" ref="editors" @onSuccess="editorUploadImgSuccess" @onChange="editorContentChange"></editor-bar>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit(0)" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 查看图文 -->
    <!-- 查看图文 -->
    <el-dialog title="预览效果" :visible.sync="viewContentDialogVisible" custom-class="custom-dialog" :center="true" width="370px">
      <div v-if="rowContent" class="content-wrapper">
        <div class="body">
          <img class="header" :src="require('../../assets/bg-phone-header.jpg')" />
          <div class="content" v-html="rowContent"></div>
        </div>
      </div>
      <!-- <phone-preview v-if="rowFormContent" :cardStyle="showComponentStyle" :previewData="rowFormContent" /> -->
    </el-dialog>
    <!-- 预览效果 -->
    <div v-if="updataPhoneTemplateVisible" class="phone">
      <div class="mask-layer" @click="updataPhoneTemplateVisible = false"></div>
      <div class="phone-template">
        <phone-preview class="phone-preview" :cardStyle="showComponentStyle" :previewData="rowFormContent" />
      </div>
    </div>
  </div>
</template>

<script>
import EditorBar from '../../components/WangEditor'
import InlineSelect from '../../components/InlineSelect'
import { mapGetters } from 'vuex'
import NewsInformation from './components/NewsInformation/index'
import PhonePreview from '@/views/infoService/components/preview/PhonePreview'

export default {
  name: 'News',
  components: {
    EditorBar,
    InlineSelect,
    NewsInformation,
    PhonePreview
  },
  data() {
    return {
      loading: false,
      usemodelDialogVisible: false, // 模板新建/编辑弹框
      addModeldialogVisible: false, // 创建模板弹框
      phoneTemplateVisible: false,
      updataPhoneTemplateVisible: false,
      showComponent: 'NewsInformation',
      showComponentStyle: '',
      selectModelFormData: {}, // 创建模板数据
      currentTab: '0',
      baseRemindInfo: {
        successInfo: {
          title: '使用提示',
          description:
            '此处管理的是【校讯帮】首页机构自己的新闻资讯，您机构已开启【公众号嫁接】功能，可以使用下面的功能。',
          type: 'success'
        },
        errorInfo: {
          title: '功能提示',
          description:
            '此处管理的是【校讯帮】首页机构自己的新闻资讯，只有开启了【公众号嫁接】的机构才有权限在【校讯帮】展示自己的新闻资讯及其新闻内容详情。',
          type: 'error'
        }
      }, // 提示信息
      remindInfo: {},
      total: 0,
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        type: null,
        status: null
      },
      targetTypeOptions: [
        { label: '两端', value: 0 },
        { label: '家长端', value: 1 },
        { label: '教师端', value: 2 }
      ],
      statusOptions: [
        { label: '未发布', value: 0 },
        { label: '已发布', value: 1 },
        { label: '已下架', value: 2 }
      ],
      tableDatas: [],
      viewViewDialogVisible: false,
      newsAvailableDatas: [],
      viewContentDialogVisible: false,
      rowContent: null,
      rowFormContent: null,
      dialogVisible: false,
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      submitLoading: false,
      form: {
        id: null,
        title: null,
        thumbnail: null,
        imgList: [],
        description: null,
        content: null,
        status: 0,
        type: 0,
        isTop: 0
      },
      selectModelList: [], // 模板库列表
      rules: {
        title: [
          { required: true, message: '请输入名称', triggle: 'blur' },
          { minlength: 15, message: '最大长度为30位', trigger: 'blur' },
          { minlength: 3, message: '最小长度为3位', trigger: 'blur' }
        ],
        description: { required: true, message: '请输入内容', triggle: 'blur' },
        thumbnail: { required: true, message: '请上传图片', triggle: 'blur' },
        // targetType: { required: true, message: '请选择显示类型', triggle: 'blur' },
        // status: { required: true, message: '请选择是否上线', triggle: 'blur' },
        // resourceType: { required: true, message: '请选择轮播图内容类型', triggle: 'blur' },
        content: { required: true, message: '请输入内容', triggle: 'blur' }
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    if (this.organizationInfo.openWechatDeploy === 1) {
      this.remindInfo = this.baseRemindInfo.successInfo
    } else {
      this.remindInfo = this.baseRemindInfo.errorInfo
    }
    this._getList()
    this._getNewsTemplateList() // 获取模板库数据
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  },
  // 相关方法
  methods: {
    _getList() {
      this.loading = true
      this.queryParam.organizationId = this.organizationInfo.id
      this.queryParam.departmentId = this.currentBranch.id
      this.$http
        .get('/v1/News/getNewsList', this.queryParam)
        .then((res) => {
          this.total = res.total
          this.tableDatas = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取模板库数据
    _getNewsTemplateList() {
      const params = {
        pageNum: 1,
        pageSize: 10
      }
      this.$http.get(`/v1/NewsTemplate/getList`, params).then((res) => {
        res.data.forEach((item) => {
          item.templateName = item.name.split('-')[1] // 使用模板名
          item.styleName = item.name.split('-')[2] // 使用模板样式名
        })
        this.selectModelList = res.data
      })
    },
    query() {
      this._getList()
    },
    handlePageChange(val) {
      this.queryParam.pageNum = val
      this.query()
    },
    handleSizeChange(val) {
      this.queryParam.pageSize = val
      this.query()
    },
    handleAdd() {
      this.dialogVisible = true
    },
    handleUseModelAdd() {
      this.currentTab = '1'
    },
    handleClose() {
      this.dialogVisible = false
      this.selectModelFormData = {}
      this.usemodelDialogVisible = false
      this.clearContent()
      this.form = {
        id: null,
        title: null,
        thumbnail: null,
        imgList: [],
        description: null,
        content: null,
        status: 0,
        type: 0,
        isTop: 0
      }
    },
    handleSubmit(modelStatus) {
      if (this.organizationInfo.openWechatDeploy === 0) {
        this.$message.error('您机构未开启微信公众号嫁接功能，无法提交数据')
        return
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          let param = {
            id: this.form.id,
            title: this.form.title,
            thumbnail: this.form.thumbnail,
            description: this.form.description,
            type: this.form.type,
            status: this.form.status,
            isTop: this.form.isTop,
            content: this.form.content
          }
          this.submitLoading = true
          if (modelStatus === 1) {
            // 使用模板
            param.content = JSON.stringify(
              this.$refs.selectModelComponent.formData
            )
            param.templateName = `newsTemplate-${this.showComponent}-${this.showComponentStyle}`
          }
          if (param.id) {
            this.$http
              .put('/v1/News/updateNews', param)
              .then((res) => {
                this.$message.success('更新数据成功')
                this.form = {
                  id: null,
                  title: null,
                  thumbnail: null,
                  imgList: [],
                  description: null,
                  content: null,
                  status: 0,
                  type: 0,
                  isTop: 0
                }
                this._getList()
                this.clearContent()
                this.dialogVisible = false
                this.selectModelFormData = {}
                this.usemodelDialogVisible = false
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            param.organizationId = this.organizationInfo.id
            param.departmentId = this.currentBranch.id
            this.$http
              .post('/v1/News/addNews', param)
              .then((res) => {
                this.$message.success('新增数据成功')
                this.form = {
                  id: null,
                  title: null,
                  thumbnail: null,
                  imgList: [],
                  description: null,
                  content: null,
                  status: 0,
                  type: 0,
                  isTop: 0
                }
                this.clearContent()
                this._getList()
                this.dialogVisible = false
                this.selectModelFormData = {}
                this.usemodelDialogVisible = false
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        }
      })
    },
    // 查看图文内容方法
    handleViewContent(row) {
      this.rowContent = null
      this.rowFormContent = null
      if (row.templateName) {
        this.showComponent = row.templateName.split('-')[1]
        this.showComponentStyle = row.templateName.split('-')[2]
        this.rowFormContent = JSON.parse(row.content)
        this.updataPhoneTemplateVisible = true
      } else {
        this.rowContent = row.content.replace(/<img/gi, '<img style="width:100%;height:auto"')
        this.viewContentDialogVisible = true
      }
    },
    // 发布或下架banner处理事件
    handlePublishNews(row, status) {
      const param = {
        id: row.id,
        status: status
      }
      this.$http.put('/v1/News/updateNews', param).then((res) => {
        if (status === 1) {
          this.$message.success('发布成功')
        }
        if (status === 2) {
          this.$message.success('下架成功')
        }
        this._getList()
      })
    },
    handleEdit(row) {
      this.clearContent()
      this.form = {
        id: row.id,
        title: row.title,
        thumbnail: row.thumbnail,
        description: row.description,
        type: row.type,
        status: row.status,
        content: row.content,
        isTop: row.isTop
      }
      this.form.imgList = []
      this.form.imgList.push({
        url: row.thumbnail,
        name: 'default.png'
      })
      if (row.templateName) {
        // 弹出使用模板窗口
        this.usemodelDialogVisible = true
        this.showComponent = row.templateName.split('-')[1]
        this.showComponentStyle = row.templateName.split('-')[2]
        this.selectModelFormData = JSON.parse(row.content)
      } else {
        this.dialogVisible = true
      }
    },
    // 置顶或取消置顶
    handleIsTop(row) {
      const param = {
        id: row.id,
        organizationId: row.organizationId,
        departmentId: row.departmentId
      }
      if (row.isTop === 0) {
        // 执行置顶操作
        param.isTop = 1
        this.$confirm(`确定要将【${row.title}】置顶吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.put(`/v1/News/moveToTop`, param).then((res) => {
            this.$message.success(res.message)
            this._getList()
          })
        })
      } else {
        // 执行取消置顶操作
        param.isTop = 0
        this.$confirm(`确定要将【${row.title}】置顶吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.put(`/v1/News/updateNews`, param).then((res) => {
            this.$message.success(res.message)
            this._getList()
          })
        })
      }
    },
    handleDelete(row) {
      this.$confirm(`确定要删除【${row.title}】吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/News/delete/${row.id}`).then((res) => {
          this.$message.success(res.message)
          this._getList()
        })
      })
    },
    // 清空富文本编辑器内容
    clearContent() {
      this.$nextTick(() => {
        if (this.$refs.editors) {
          this.$refs.editors.clearTxt()
        }
      })
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
          if (!this.form.thumbnail) {
            this.form.thumbnail = ''
          }
          res.data.forEach((item) => {
            this.form.thumbnail = item.downloadPath
            // 处理回显数据
            this.form.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.form.thumbnail = ''
      this.form.imgList = fileList
    },
    // 创建新的模板
    addModel(item) {
      this.currentTab = '0'
      this.showComponent = item.templateName
      this.showComponentStyle = item.styleName
      this.selectModelFormData = JSON.parse(item.content)
      this.usemodelDialogVisible = true // 新闻管理：新建窗口
    },
    checkModel(item) {
      this.phoneTemplateVisible = true
      this.showComponentStyle = item.styleName
      this.selectModelFormData = JSON.parse(item.content)
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  width 100%
  height 100%
.istop-primary
  color $color-primary
.istop-default
  color $color-info
.content-wrapper
  height 670px
  overflow hidden
  background-image url('../../assets/iphoneBorder.png')
  background-size 100% 100%
  background-repeat no-repeat
  .body
    margin-top 38px
    margin-left 6px
    margin-right 6px
    margin-bottom 38px
    border-radius 7px
    .header
      width 100%
      height 50px
      border-top-left-radius 7px
      border-top-right-radius 7px
    .content
      height 530px
      overflow-y auto
      background-color #ffffff
      padding 5px
      border-bottom-left-radius 7px
      border-bottom-right-radius 7px
      img
        width 100%
.slot
  .basics-title
    margin-left 4px
  .model-title
    padding-top 14px
    border-top 6px solid #ccc
    margin-left 4px
.model-store
  background #fff
  padding 14px
  display flex
  justify-content flex-start
  flex-wrap wrap
  .item
    border 1px solid #eeeeee
    box-shadow 0 4px 8px #d8d8d8
    margin 0px 11px 32px 0
    position relative
    .icon-box
      height 196px
      width 196px
      background-color rgba(0, 0, 0, 0)
      position absolute
      top 0
      .view-icon
        cursor pointer
        font-size 30px
        position absolute
        bottom 0
        left 83px
        color $color-primary
        opacity 0
    img
      width 196px
      height 196px
      image-rendering pixelated
    .bottom
      height 50px
      display flex
      justify-content center
      align-items center
      .name
        width 180px
        text-align center
        color #303133
        margin-bottom 4px
      .add-activity
        display none
    &:hover
      height 250px
      transition width 1s
      box-shadow 0px 0px 10px rgba(255, 102, 0, 0.4)
      position relative
      .icon-box
        background-color rgba(0, 0, 0, 0.4)
        display block
        .view-icon
          transition 0.8s
          display block
          position absolute
          bottom 83px
          opacity 1
      .bottom
        .name
          display none
        .add-activity
          display block
          color $color-primary
@media screen and (min-width 1400px)
  .model-store
    .item
      margin 0px 20px 32px 0
// 模板预览
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
</style>
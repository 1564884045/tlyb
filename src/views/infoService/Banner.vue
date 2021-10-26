<!-- 校讯帮banner管理 -->
<template>
  <div class="container">
    <el-tabs v-model="currentTab">
      <el-tab-pane label="轮播管理" name="0"></el-tab-pane>
      <el-tab-pane label="模板库" name="1"></el-tab-pane>
    </el-tabs>
    <div v-if="currentTab === '0'">
      <el-alert :title="remindInfo.title" :description="remindInfo.description" :type="remindInfo.type" style="margin-bottom:10px;"></el-alert>
      <div class="query-form">
        <inline-select v-model="queryParam.targetType" @change="query" label="显示端" valueAttr="value" labelAttr="label" :options="targetTypeOptions" clearable />
        <inline-select v-model="queryParam.status" @change="query" label="状态" valueAttr="value" labelAttr="label" :options="statusOptions" clearable />
        <inline-select v-model="queryParam.resourceType" @change="query" label="类型" valueAttr="value" labelAttr="label" :options="resourceTypeOptions" clearable />
        <div style="float: right">
          <el-button type="primary" :disabled="organizationInfo.openWechatDeploy == 1 ? false : true" icon="el-icon-thumb" @click="handleViewBanner()">轮播效果</el-button>
          <el-button type="primary" :disabled="organizationInfo.openWechatDeploy == 1 ? false : true" icon="el-icon-plus" @click="handleAdd()">添加轮播图</el-button>
          <el-button type="primary" :disabled="organizationInfo.openWechatDeploy == 1 ? false : true" icon="el-icon-brush" @click="handleUseModelAdd()">使用模板</el-button>
        </div>
      </div>
      <div style="margin-top: 10px; background-color: #fff; padding: 15px">
        <el-table :data="bannerList" style="width: 100%" v-loading="loading">
          <el-table-column prop="title" label="名称" width="160" fixed="left"></el-table-column>
          <el-table-column prop="url" label="图片" width="120" align="center">
            <template slot-scope="scope">
              <img width="80" height="40" :src="scope.row.url" />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" width="140" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{scope.row.description || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="targetType" label="显示端" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.targetType == 0" type="primary">两端</el-tag>
              <el-tag v-if="scope.row.targetType == 1" type="warning">家长端</el-tag>
              <el-tag v-if="scope.row.targetType == 2" type="success">教师端</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status == 0" type="primary">未发布</el-tag>
              <el-tag v-if="scope.row.status == 1" type="success">已发布</el-tag>
              <el-tag v-if="scope.row.status == 2" type="danger">已下架</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="resourceType" label="轮播图类型" width="140" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.resourceType == 0" type="primary">图文</el-tag>
              <el-tag v-if="scope.row.resourceType == 2" type="danger">外部链接</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="图文内容" width="140" align="center">
            <template slot-scope="scope">
              <el-button v-if="scope.row.content" type="text" @click="handleViewContent(scope.row)">预览效果</el-button>
              <label v-else>-</label>
            </template>
          </el-table-column>
          <el-table-column prop="outsideUrl" label="链接地址" min-width="140" align="center">
            <template slot-scope="scope">
              <a v-if="scope.row.outsideUrl" :href="scope.row.outsideUrl" target="_blank">查看详情</a>
              <label v-else>-</label>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status == 0" type="text" size="mini" @click="handlePublishBanner(scope.row, 1)">发布</el-button>
              <el-button v-if="scope.row.status == 1" type="text" size="mini" @click="handlePublishBanner(scope.row, 2)">下架</el-button>
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
    <el-dialog :title="form.id ? '编辑新闻' : '新增新闻'" :visible.sync="usemodelDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" custom-class="custom-dialog" width="860px">
      <component v-if="usemodelDialogVisible" :cardStyle="showComponentStyle" :is="showComponent" :updateFormData="selectModelFormData" ref="selectModelComponent">
        <div class="slot">
          <h3 class="basics-title">基础信息：</h3>
          <el-form :model="form" ref="form" :rules="rules" label-width="80px">
            <el-form-item label="名称" prop="title">
              <el-input v-model="form.title" minlength="3" maxlength="30" show-word-limit autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="轮播图" prop="url">
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
            <el-form-item label="显示端" prop="targetType">
              <el-radio-group v-model="form.targetType">
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
            <el-form-item label="资源类型" prop="resourceType">
              <el-radio-group v-model="form.resourceType">
                <el-radio :label="0">图文</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.resourceType == 2" prop="outsideUrl" label="链接地址">
              <el-input v-model="form.outsideUrl" maxlength="150" show-word-limit autocomplete="off" clearable placeholder="请输入链接(如：http://www.tlybond.com)"></el-input>
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
    <el-dialog :title="form.id ? '编辑轮播图' : '新增轮播图'" custom-class="custom-dialog" :visible.sync="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" width="800px">
      <el-form :model="form" ref="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" minlength="3" maxlength="30" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="轮播图" prop="url">
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
        <el-form-item label="显示端" prop="targetType">
          <el-radio-group v-model="form.targetType">
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
        <el-form-item label="资源类型" prop="resourceType">
          <el-radio-group v-model="form.resourceType">
            <el-radio :label="0">图文</el-radio>
            <el-radio :label="2">外部链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.resourceType == 0" prop="content" label="内容">
          <editor-bar v-model="form.content" ref="editors" @onSuccess="editorUploadImgSuccess" @onChange="editorContentChange"></editor-bar>
        </el-form-item>
        <el-form-item v-if="form.resourceType == 2" prop="outsideUrl" label="链接地址">
          <el-input v-model="form.outsideUrl" maxlength="150" show-word-limit autocomplete="off" clearable placeholder="请输入链接(如：http://www.tlybond.com)"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit(0)" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 轮播效果 -->
    <el-dialog title="轮播效果" custom-class="custom-dialog" :visible.sync="viewBannerDialogVisible" :center="true" width="350px">
      <div class="banner-wrapper">
        <div class="body">
          <img class="header" :src="require('../../assets/bg-phone-header.jpg')" />
          <el-carousel height="130px">
            <el-carousel-item v-for="(item, index) in bannerAvailableDatas" :key="index">
              <img width="100%" height="100%" :src="item" />
            </el-carousel-item>
          </el-carousel>
          <img class="footer" :src="require('../../assets/bg-phone-xxb-body.jpg')" />
        </div>
      </div>
    </el-dialog>
    <!-- <div class="banner-wrapper">
        <el-carousel height="170px">
          <el-carousel-item v-for="(item, index) in bannerAvailableDatas" :key="index">
            <img width="100%" height="100%" :src="item"/>
          </el-carousel-item>
        </el-carousel>
        <img width="100%" height="465px" :src="defaultParentImg"/>
    </div>-->

    <!-- 查看图文 -->
    <el-dialog title="预览效果" custom-class="custom-dialog" :visible.sync="viewContentDialogVisible" :center="true" width="370px">
      <div v-if="rowContent" class="content-wrapper">
        <div class="body">
          <img class="header" :src="require('../../assets/bg-phone-header.jpg')" />
          <div class="content" v-html="rowContent"></div>
        </div>
      </div>
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

import DefaultParentImg from '../../assets/default-parent.png'
import NewsInformation from './components/NewsInformation/index'
import PhonePreview from '@/views/infoService/components/preview/PhonePreview'

export default {
  name: 'Banner',
  components: {
    EditorBar,
    InlineSelect,
    NewsInformation,
    PhonePreview
  },
  data() {
    return {
      defaultParentImg: DefaultParentImg,
      currentTab: '0',
      usemodelDialogVisible: false, // 模板新建/编辑弹框
      addModeldialogVisible: false, // 创建模板弹框
      phoneTemplateVisible: false,
      updataPhoneTemplateVisible: false,
      showComponent: 'NewsInformation',
      showComponentStyle: '',
      selectModelFormData: {}, // 创建模板数据
      rowFormContent: null, // 预览时，模板内容
      baseRemindInfo: {
        successInfo: {
          title: '使用提示',
          description:
            '此处管理的是【校讯帮】首页顶部的轮播图，您机构已开启【公众号嫁接】功能，可以使用下面的功能。',
          type: 'success'
        },
        errorInfo: {
          title: '功能提示',
          description:
            '此处管理的是【校讯帮】首页顶部的轮播图，只有开启了【公众号嫁接】的机构才有权限在【校讯帮】展示自己的轮播图及其详细内容。',
          type: 'error'
        }
      }, // 提示信息
      remindInfo: {},
      loading: false,
      total: 0,
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        targetType: null,
        status: null,
        resourceType: null
      },
      selectModelList: [], // 模板列表
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
      resourceTypeOptions: [
        { label: '图文展示', value: 0 },
        { label: '外部网站', value: 2 }
      ],
      bannerList: [],
      viewBannerDialogVisible: false,
      bannerAvailableDatas: [],
      viewContentDialogVisible: false,
      rowContent: null,
      dialogVisible: false,
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      submitLoading: false,
      form: {
        id: null,
        title: null,
        url: null,
        imgList: [],
        description: null,
        targetType: 0,
        status: 0,
        resourceType: 0, // 0-图文，2-外链
        content: null,
        innerUrl: null,
        outsideUrl: null
      },
      rules: {
        title: [
          { required: true, message: '请填写名称', triggle: 'blur' },
          { minlength: 15, message: '最大长度为30位', trigger: 'blur' },
          { minlength: 3, message: '最小长度为3位', trigger: 'blur' }
        ],
        url: { required: true, message: '请上传图片', triggle: 'blur' },
        // targetType: { required: true, message: '请选择显示类型', triggle: 'blur' },
        // status: { required: true, message: '请选择是否上线', triggle: 'blur' },
        // resourceType: { required: true, message: '请选择轮播图内容类型', triggle: 'blur' },
        content: { required: true, message: '请填写内容', triggle: 'blur' },
        outsideUrl: {
          required: true,
          message: '请填写外部网站链接地址',
          triggle: 'blur'
        }
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
    this._getBannerList()
    this._getNewsTemplateList() // 获取模板库数据列表
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  },
  // 相关方法
  methods: {
    _getBannerList() {
      this.loading = true
      this.queryParam.organizationId = this.organizationInfo.id
      this.queryParam.departmentId = this.currentBranch.id
      this.$http
        .get(
          '/v1/BannerOrganization/getBannerOrganizationList',
          this.queryParam
        )
        .then((res) => {
          this.total = res.total
          this.bannerList = res.data
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
      this._getBannerList()
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
    // 使用模板
    handleUseModelAdd() {
      this.currentTab = '1'
    },
    // 关闭弹出框
    handleClose() {
      this.dialogVisible = false
      this.selectModelFormData = {}
      this.usemodelDialogVisible = false
      this.clearContent()
      this.form = {
        id: null,
        title: null,
        url: null,
        imgList: [],
        description: null,
        targetType: 0,
        status: 0,
        resourceType: 0,
        content: null,
        innerUrl: null,
        outsideUrl: null
      }
    },
    // 查看轮播效果
    handleViewBanner() {
      this.bannerAvailableDatas = []
      this.bannerList.forEach((item) => {
        if (item.status === 1) {
          this.bannerAvailableDatas.push(item.url)
        }
      })
      if (this.bannerAvailableDatas.length === 0) {
        this.$message.warning('暂无已发布轮播图')
      } else {
        this.viewBannerDialogVisible = true
      }
    },
    handleSubmit(modelStatus) {
      if (this.organizationInfo.openWechatDeploy === 0) {
        this.$message.error('您机构未开启微信公众号嫁接功能，无法提交数据')
        return
      }
      if (this.form.outsideUrl) {
        if (
          !this.form.outsideUrl.startsWith('http://') &&
          !this.form.outsideUrl.startsWith('https://')
        ) {
          this.$message.error('外部链接必须以【http://】或【https://】开头')
          return
        }
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          let param = {
            id: this.form.id,
            title: this.form.title,
            url: this.form.url,
            description: this.form.description,
            targetType: this.form.targetType,
            status: this.form.status,
            resourceType: this.form.resourceType,
            content: this.form.content,
            innerUrl: this.innerUrl,
            outsideUrl: this.form.outsideUrl
          }
          switch (param.resourceType) {
            case 0:
              param.innerUrl = null
              param.outsideUrl = null
              break
            case 1:
              param.content = null
              param.outsideUrl = null
              break
            case 2:
              param.content = null
              param.innerUrl = null
              break
          }
          this.submitLoading = true
          if (modelStatus === 1) {
            // 使用模板
            param.content = JSON.stringify(
              this.$refs.selectModelComponent.formData
            )
            param.templateName = `BannerOrganizationTemplate-${this.showComponent}-${this.showComponentStyle}`
          }
          if (param.id) {
            this.$http
              .put('/v1/BannerOrganization/updateBannerOrganization', param)
              .then((res) => {
                this.$message.success('更新数据成功')
                this.form = {
                  id: null,
                  title: null,
                  url: null,
                  imgList: [],
                  description: null,
                  targetType: 0,
                  status: 0,
                  resourceType: 0,
                  content: null,
                  innerUrl: null,
                  outsideUrl: null
                }
                this._getBannerList()
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
              .post('/v1/BannerOrganization/addBannerOrganization', param)
              .then((res) => {
                this.$message.success('新增数据成功')
                this.form = {
                  id: null,
                  title: null,
                  url: null,
                  imgList: [],
                  description: null,
                  targetType: 0,
                  status: 0,
                  resourceType: 0,
                  content: null,
                  innerUrl: null,
                  outsideUrl: null
                }
                this._getBannerList()
                this.clearContent()
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
        this.rowContent = row.content.replace(
          /<img/gi,
          '<img style="width:100%;height:auto"'
        )
        this.viewContentDialogVisible = true
      }
    },
    // 发布或下架banner处理事件
    handlePublishBanner(row, status) {
      const param = {
        id: row.id,
        status: status
      }
      this.$http
        .put('/v1/BannerOrganization/updateBannerOrganization', param)
        .then((res) => {
          if (status === 1) {
            this.$message.success('发布成功')
          }
          if (status === 2) {
            this.$message.success('下架成功')
          }
          this._getBannerList()
        })
    },
    handleEdit(row) {
      this.clearContent()
      this.form = {
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        targetType: row.targetType,
        status: row.status,
        resourceType: row.resourceType,
        content: row.content,
        innerUrl: row.innerUrl,
        outsideUrl: row.outsideUrl
      }
      this.form.imgList = []
      this.form.imgList.push({
        url: row.url,
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
    handleDelete(row) {
      this.$confirm(`确定要删除【${row.title}】吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http
          .delete(`/v1/BannerOrganization/delete/${row.id}`)
          .then((res) => {
            this.$message.success(res.message)
            this._getBannerList()
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
          if (!this.form.url) {
            this.form.url = ''
          }
          res.data.forEach((item) => {
            this.form.url = item.downloadPath
            // 处理回显数据
            this.form.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.form.url = ''
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
.banner-wrapper
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
    height 598px
    background-color #eeeeee
    overflow hidden
    .header
      width 100%
      height 50px
    .content
      height 620px
      background-color #ffffff
      padding 10px
      overflow-y auto
    .footer
      width 100%
      margin-top 10px
      height 408px
    >>>.el-carousel--horizontal
      margin-top -2px !important
    >>>.el-carousel__button
      width 5px
      height 5px
      border-radius 5px
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
        display block
        color #303133
      .add-activity
        display none
    &:hover
      height 250px
      transition width 1s
      box-shadow 0px 0px 10px rgba(255, 102, 0, 0.5)
      position relative
      .icon-box
        display block
        background-color rgba(0, 0, 0, 0.4)
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

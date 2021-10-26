<template>
  <div>
    <div class="query-form">
      <el-input v-model.trim="queryForm.name" :maxlength="30" placeholder="请输入系列/视频名称搜索" @keyup.native.enter="query" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <el-radio-group v-model="queryForm.status" @change="query">
        <el-radio :label="0">未上架</el-radio>
        <el-radio :label="1">已上架</el-radio>
        <el-radio :label="2">已下架</el-radio>
      </el-radio-group>
      <el-button type="text" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
      <div class="right-btns">
        <el-button type="primary" icon="el-icon-s-help" @click="handleOpenTypeDialog">分类管理</el-button>
        <el-button type="primary" icon="el-icon-tickets" @click="handleOpenForm()">创建视频系列</el-button>
      </div>
      <div class="query-select-list">
        <inline-select v-model="queryForm.videoCourseTypeId" @change="query" label="视频类型" valueAttr="id" labelAttr="name" :loading="typeLoading" :options="typeList" @show="_getTypeList()" filterable clearable/>
        <inline-select v-model="queryForm.teacherId" @change="query" label="上传老师" valueAttr="id" labelAttr="username" :loading="teacherLoading" :options="teacherList" @show="_getTeacherList" filterable clearable/>
        <inline-select v-model="queryForm.isCharge" @change="query" label="是否收费" :options="[{ value: 0, label: '免费视频' }, { value: 1, label: '收费视频' }]" clearable/>
        <inline-select v-model="queryForm.isPublic" @change="query" label="是否公开" :options="[{ value: 0, label: '不公开视频' }, { value: 1, label: '公开视频' }]" clearable/>
      </div>
    </div>

    <el-table
      :data="list"
      v-loading="loading">
      <el-table-column
        prop="name"
        label="名称"
        width="240"
        fixed="left"
      ></el-table-column>
      <el-table-column
        prop="frontCover"
        label="封面图"
        width="140"
        align="center"
      >
        <img slot-scope="scope" :src="scope.row.frontCover" width="108px" height="68px" style="vertical-align: top;"/>
      </el-table-column>
      <el-table-column
        prop="teacherName"
        label="上传老师"
        width="140"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="typeName"
        label="类型"
        width="140"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="resourceType"
        label="是否公开"
        width="88"
        align="center"
      >
        <el-tag slot-scope="scope" :type="scope.row.resourceType === 1 ? 'success' : 'danger'">{{scope.row.resourceType === 1 ? '是' : '否'}}</el-tag>
      </el-table-column>
      <el-table-column
        prop="chargeType"
        label="收费套餐"
        width="88"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.chargeType === 0" type="primary">免费</el-tag>
          <span v-else class="color-danger">{{scope.row.price}}元</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="desc"
        label="详细说明"
        min-width="360"
      >
        <template slot-scope="scope">{{scope.row.desc &&scope.row.desc.length > 108 ? scope.row.desc.substr(0, 108) + '...' : scope.row.desc}}</template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="88"
        align="center"
        fixed="right"
      >
        <el-tag slot-scope="scope" :type="scope.row.statusClass">{{scope.row.statusStr}}</el-tag>
      </el-table-column>
      <el-table-column
        label="操作"
        width="160"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="handleOpenContent(scope.row)">内容管理</el-button>
          <el-button type="text" @click="handleStudentAllocation(scope.row)">分配学员</el-button>
          <br>
          <el-button type="text" @click="handleStatusChange(scope.row)">{{scope.row.statusTip}}</el-button>
          <el-button type="text" @click="handleOpenForm(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="bottom-pagination">
      <el-pagination
        @size-change="query"
        @current-change="_getDataList"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <el-dialog
      :visible.sync="showForm"
      :show-close="false"
      custom-class="series-form-dialog"
      width="640px"
      top="5vh">
      <p slot="title" class="title">{{seriesForm.id ? '修改' : '创建'}}视频系列
        <i class="close-btn el-icon-close" @click="showForm = false"/>
      </p>
      <el-form ref="seriesForm" :model="seriesForm" :rules="rules" label-width="88px">
        <el-form-item prop="name" label="系列名称">
          <el-input v-model="seriesForm.name" placeholder="请输入系列名称" :maxlength="30"/>
        </el-form-item>
        <el-form-item prop="frontCover" label="封面图">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleFrontSuccess"
            :before-upload="beforeImageUpload">
            <img v-if="seriesForm.frontCover" :src="seriesForm.frontCover" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item prop="teacherId" label="授课老师">
          <el-select v-model="seriesForm.teacherId" placeholder="请选择授课老师">
            <el-option v-for="item in teacherList" :key="item.id" :value="item.id" :label="item.username"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="videoCourseTypeId" label="类型">
          <el-select v-model="seriesForm.videoCourseTypeId" placeholder="请选择类型">
            <el-option v-for="item in typeList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="resourceType" label="是否公开">
          <el-radio-group v-model="seriesForm.resourceType">
            <el-radio :label="0">不公开</el-radio>
            <el-radio :label="1">公开</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="chargeType" label="是否收费">
          <el-radio-group v-model="seriesForm.chargeType">
            <el-radio :label="0">免费</el-radio>
            <el-radio :label="1">收费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="seriesForm.chargeType" prop="price" label="详情">
          <el-input-number v-model="seriesForm.price" :controls="false" :precision="2" :min="0" :max="99999999"/>元
        </el-form-item>
        <el-form-item prop="desc" label="详情">
          <el-input type="textarea" v-model="seriesForm.desc" :rows="3" placeholder="请填写系列详情。(最多200字)" :maxlength="200" show-word-limit/>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :visible.sync="showContent"
      :show-close="false"
      custom-class="series-content-dialog"
      width="74vw"
      top="6vh">
      <p slot="title" class="title"><span class="color-danger">{{currentSeries && currentSeries.name}}</span>内容管理
        <i class="close-btn el-icon-close" @click="showContent = false"/>
      </p>
      <el-tabs v-model="contentTab">
        <el-tab-pane label="视频内容" name="0"></el-tab-pane>
        <el-tab-pane label="观看记录" name="1"></el-tab-pane>
      </el-tabs>
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 72vh;">
        <div v-if="contentTab === '0'" class="video-content-wrapper">
          <div class="video-header">
            <el-input v-model="videoName" placeholder="请输入视频名称搜索" style="width: 180px;" @keydown.enter.native="_getVideoList" @blur="_getVideoList"/>
            <el-button icon="el-icon-upload" type="primary" @click="selectVideo">上传视频</el-button>
          </div>

          <el-table
            :data="videoList"
            v-loading="videoListLoading">
            <el-table-column
              type="index"
              width="50"
              fixed="left">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="180"
              fixed="left"
            >
              <a slot-scope="scope" target="blank" :href="scope.row.url">{{scope.row.name}}</a>
            </el-table-column>
            <el-table-column
              prop="frontCover"
              label="封面图"
              width="140"
              align="center"
            >
              <img slot-scope="scope" :src="scope.row.frontCover" width="88px" height="56px" style="vertical-align: top;"/>
            </el-table-column>
            <el-table-column
              prop="videoTimeStr"
              label="时长"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="sizeStr"
              label="大小"
              width="100"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="freeType"
              label="是否试听"
              width="80"
              align="center"
            >
              <el-tag slot-scope="scope" :type="scope.row.freeType ? 'success' : 'info'">{{scope.row.freeType ? '是' : '否'}}</el-tag>
            </el-table-column>
            <el-table-column
              prop="desc"
              label="详情"
              min-width="240"
            >
               <template slot-scope="scope">{{scope.row.desc && scope.row.desc.length > 60 ? scope.row.desc.substr(0, 60) + '...' : scope.row.desc}}</template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="100"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button type="text" @click="handleOpenVideoForm(scope.row)">编辑</el-button>
                <el-button type="text" @click="handleDeleteVideo(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else-if="contentTab === '1'">
        </div>
      </el-scrollbar>
    </el-dialog>

    <el-dialog
      :visible.sync="showVideoForm"
      :show-close="false"
      custom-class="series-form-dialog"
      width="560px"
      top="5vh">
      <p slot="title" class="title">{{videoForm.isNew ?'添加' : '修改'}}视频
        <i class="close-btn el-icon-close" @click="showForm = false"/>
      </p>
      <el-form ref="videoForm" :model="videoForm" :rules="videoRules" label-width="88px">
        <el-form-item prop="name" label="视频名称">
          <el-input v-model="videoForm.name" placeholder="请输入视频名称" :maxlength="30"/>
        </el-form-item>
        <el-form-item prop="frontCover" label="封面图">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleVideoFrontSuccess"
            :before-upload="beforeImageUpload">
            <img v-if="videoForm.frontCover" :src="videoForm.frontCover" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item prop="freeType" label="是否试听">
          <el-radio-group v-model="videoForm.freeType">
            <el-radio :label="0">非试听</el-radio>
            <el-radio :label="1">试听课程</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="sort" label="排序">
          <el-input-number v-model="videoForm.sort" :controls="false" :min="0" :step="1" :max="9999999"/>
        </el-form-item>
        <el-form-item prop="desc" label="详情">
          <el-input type="textarea" v-model="videoForm.desc" :rows="3" placeholder="请填写系列详情。(最多200字)" :maxlength="200" show-word-limit/>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="showVideoForm = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitVideo" :loading="submitVideoLoading">确定提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :visible.sync="showType"
      :show-close="false"
      custom-class="series-form-dialog"
      width="720px"
      top="12vh"
      :close-on-click-modal="false">
      <p slot="title" class="title">视频分类
        <i class="close-btn el-icon-close" @click="showType = false"/>
      </p>
      <el-row :gutter="20" class="type-list">
        <el-col :span="6" v-for="(item, index) in typeList" :key="item.id">
          <div class="type-item" @click.prevent="handleTypeClick(item, index)" @mousemove="item.show = true" @mouseleave="item.show = false">
            <el-input v-show="item.edit" ref="typeItem" v-model="item.name" placeholder="类型名称【回车确认】" @keyup.enter.native="handleChangeType(item)" @blur="item.edit = false"/>
            <span v-show="!item.edit">{{item.name}}</span>
            <el-button v-show="item.show" @click.stop="handleDeleteType(item)" class="icon-del" icon="el-icon-delete" circle plain></el-button>
          </div>
        </el-col>
        <el-col :span="6" v-if="typeList.length < 8">
          <div class="type-item add-btn" @click="handleTypeClick()">
            <!-- <span>{{item.name}}</span> -->
            <el-input v-show="showEditType" ref="addType" v-model="typeInput" placeholder="类型名称【回车确认】" @keyup.enter.native="handleChangeType()" @blur="showEditType = false"/>
            <i v-show="!showEditType" class="icon-add el-icon-plus" />
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <StudentAllocationDialog v-model="showStudentDialog" :title="allocationTitle" :seriesId="selectedSeries">
    </StudentAllocationDialog>

    <input ref="videoInput" type="file" accept="video/*" @change="handleSelectVideo" style="display: none;"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import InlineSelect from '../../components/InlineSelect'
import StudentAllocationDialog from './StudentAllocationDialog'

export default {
  data() {
    return {
      loading: false,
      teacherLoading: false,
      typeLoading: false,
      submitLoading: false,
      submitVideoLoading: false,
      videoListLoading: false,
      showForm: false,
      showType: false,
      showContent: false,
      showVideoForm: false,
      showEditType: false,
      showStudentDialog: false,
      queryForm: {
        name: '',
        videoCourseTypeId: '',
        teacherId: '',
        isCharge: '',
        isPublic: '',
        status: null
      },
      typeList: [],
      teacherList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      list: [],
      seriesForm: {
        id: null,
        name: '',
        frontCover: '',
        desc: '',
        videoCourseTypeId: '',
        teacherId: '',
        resourceType: 0,
        chargeType: 0,
        price: 0
      },
      rules: {
        name: { required: true, message: '请填写系列名称', trigger: 'blur' },
        frontCover: { required: true, message: '请上传封面图', trigger: 'blur' },
        desc: { required: true, message: '请填写描述', trigger: 'blur' },
        videoCourseTypeId: { required: true, message: '请选择类型', trigger: 'blur' },
        teacherId: { required: true, message: '请选择授课老师', trigger: 'blur' },
        resourceType: { required: true, message: '请选择是否公开', trigger: 'blur' },
        chargeType: { required: true, message: '请选择是否收费', trigger: 'blur' }
      },
      uploadUrl: process.env.VUE_APP_UPLOAD_URL,
      currentSeries: null,
      contentTab: '0',
      videoName: '',
      videoList: [],
      videoForm: {
        isNew: false,
        id: null,
        freeType: 0,
        videoType: 0,
        name: '',
        sort: 0,
        frontCover: '',
        desc: ''
      },
      videoRules: {
        name: { required: true, message: '请填写视频名称', trigger: 'blur' },
        frontCover: { required: true, message: '请上传封面图', trigger: 'blur' },
        freeType: { required: true, message: '请选择是否试听', trigger: 'blur' },
        sort: { required: true, message: '请填写排序', trigger: 'blur' }
      },
      typeInput: '',
      allocationTitle: '学员分配',
      selectedSeries: null
    }
  },
  components: {
    InlineSelect,
    StudentAllocationDialog
  },
  computed: {
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  created() {
    this._getDataList()
  },
  methods: {
    _getTypeList(first) {
      if (!first && this.typeList.length > 0) return

      this.typeLoading = true
      this.$http.get('/v1/DicVideoCourse/getAll', {
        organizationId: this.organizationInfo.id
      }).then(res => {
        res.data.forEach(item => {
          item.show = false
          item.edit = false
        })
        this.typeList = res.data
      }).finally(() => {
        this.typeLoading = false
      })
    },
    _getTeacherList() {
      if (this.teacherList.length > 0) return

      this.teacherLoading = true
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id, userLogo: 1 }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.teacherLoading = false
      })
    },
    _getDataList() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        name: this.queryForm.name,
        videoCourseTypeId: this.queryForm.videoCourseTypeId,
        teacherId: this.queryForm.teacherId,
        status: this.queryForm.status,
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }

      if (this.queryForm.isCharge !== '') params.chargeType = this.queryForm.isCharge
      if (this.queryForm.isPublic !== '') params.resourceType = this.queryForm.isPublic

      this.loading = true
      this.$http.get('/v1/VideoCourse/getVideoCourseList', params).then(res => {
        res.data.forEach(item => {
          switch (item.status) {
            case 0:
              item.statusClass = 'info'
              item.statusStr = '未上架'
              item.statusTip = '发布'
              break
            case 1:
              item.statusClass = 'success'
              item.statusStr = '已上架'
              item.statusTip = '下架'
              break
            case 2:
              item.statusClass = 'danger'
              item.statusStr = '已下架'
              item.statusTip = '重新上架'
              break
          }
        })
        this.list = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    _getVideoList() {
      if (this.currentSeries == null) return
      this.videoListLoading = true
      this.$http.get('/v1/Video/getVideoList', {
        courseId: this.currentSeries.id,
        name: this.videoName
      }).then(res => {
        res.data.forEach(item => {
          // 处理时长
          item.videoTimeStr = this.formartTime(item.videoTime)
          // 处理大小
          item.sizeStr = this.formatFileSize(item.size)
        })
        this.videoList = res.data
      }).finally(() => {
        this.videoListLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getDataList()
    },
    reset() {
      this.queryForm = {
        name: '',
        videoCourseTypeId: '',
        teacherId: '',
        isCharge: '',
        isPublic: ''
      }
      this.query()
    },
    handleOpenForm(row) {
      this.seriesForm = {
        id: null,
        name: '',
        frontCover: '',
        desc: '',
        videoCourseTypeId: '',
        teacherId: '',
        resourceType: 0,
        chargeType: 0,
        price: 0
      }
      if (row != null) {
        for (const key in this.seriesForm) {
          if (row.hasOwnProperty(key)) {
            this.seriesForm[key] = row[key]
          }
        }
      }
      this.showForm = true
      this._getTypeList()
      this._getTeacherList()
    },
    handleDelete(row) {
      this.$confirm('确定删除【' + row.name + '】课程系列吗？删除后将不能恢复！！！', '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/VideoCourse/deleteById/' + row.id).then(res => {
          this.$message.success('删除成功~')
          this._getDataList()
        })
      })
    },
    handleStatusChange(row) {
      this.$confirm('是否确定 ' + row.statusTip + '  【' + row.name + '】课程系列吗？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.put('/v1/VideoCourse/modifyStatus', {
          id: row.id,
          status: row.status !== 1 ? 1 : 2
        }).then(res => {
          this.$message.success(row.statusTip + '成功~')
          this._getDataList()
        })
      })
    },
    handleFrontSuccess(res) {
      if (res.code === '000000' && res.data.length > 0) {
        this.seriesForm.frontCover = res.data[0].downloadPath
      }
    },
    beforeImageUpload(file) {
      const isJPG = file.type.split('/')[0] === 'image'
      const isLt1M = file.size / 1024 < 500

      if (!isJPG) {
        this.$message.error('上传文件只能是图片格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传头像图片大小不能超过 500K!')
      }
      return isJPG && isLt1M
    },
    handleSubmit() {
      this.$refs.seriesForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.seriesForm.id == null) {
            // 添加
            const params = Object.assign({}, this.seriesForm)
            params.status = 0
            params.organizationId = this.organizationInfo.id
            params.departmentId = this.currentBranch.id
            this.$http.post('/v1/VideoCourse/addVideoCourse', params).then(res => {
              this.$message.success('创建成功！')
              this.showForm = false
              this.query()
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 修改
            const params = Object.assign({}, this.seriesForm)
            this.$http.put('/v1/VideoCourse/updateVideoCourse', params).then(res => {
              this.$message.success('修改成功！')
              this.showForm = false
              this.query()
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    handleOpenContent(row) {
      this.showContent = true
      this.contentTab = '0'
      this.videoName = ''
      this.videoList = []
      this.currentSeries = row

      this._getVideoList()
    },
    dataURItoBuffer(dataURI) {
      const byteString = atob(dataURI.split(',')[1])
      const buffer = new ArrayBuffer(byteString.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < byteString.length; i++) {
        view[i] = byteString.charCodeAt(i)
      }
      return buffer
    },
    /**
     * base64转File
     */
    dataURItoFile(dataURI, filename) {
      const mimeString = dataURI.split(',')[0].split(':')[1].split('')[0]
      const buffer = this.dataURItoBuffer(dataURI)
      return new File([buffer], filename, {
        type: mimeString
      })
    },
    /**
     * 获取视频信息。(时长、首图等信息)
     */
    getVideoInfo(videoFile) {
      return new Promise((resolve, reject) => {
        const videoUrl = window.URL.createObjectURL(videoFile)
        const videoEl = document.createElement('video')
        videoEl.autoplay = true
        videoEl.muted = true
        videoEl.src = videoUrl
        const _self = this
        const info = {
          size: videoFile.size
        }
        videoEl.addEventListener('loadeddata', function (e) {
          info.duration = videoEl.duration
          if (info.thumb) {
            videoEl.src = ''
            resolve(info)
            return
          }
          var canvas = document.createElement('canvas')
          canvas.width = e.target.videoWidth || window.innerWidth
          canvas.height = e.target.videoHeight || window.innerHeight
          setTimeout(() => {
            canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height)
            const dataURL = canvas.toDataURL('image/jpeg')
            let blob = _self.dataURItoFile(dataURL, 'video_image.jpeg')
            _self.$http.upload(blob, true).then(res => {
              info.thumb = res.src
              videoEl.src = ''
              resolve(info)
            }).catch(err => {
              videoEl.src = ''
              reject(err)
            })
          }, 200)
        })
      })
    },
    // 秒转换分钟00:00:00格式
    formartTime(times) {
      var t
      if (times > -1) {
        var hour = Math.floor(times / 3600)
        var min = Math.floor(times / 60) % 60
        var sec = times % 60
        if (hour < 10) {
          t = '0' + hour + ':'
        } else {
          t = hour + ':'
        }

        if (min < 10) { t += '0' }
        t += min + ':'
        if (sec < 10) { t += '0' }
        t += sec.toFixed(2)
      }
      t = t.substring(0, t.length - 3)
      return t
    },
    formatFileSize(fileSize) {
      var temp
      if (fileSize < 1024) {
        return fileSize + 'B'
      } else if (fileSize < (1024 * 1024)) {
        temp = fileSize / 1024
        temp = temp.toFixed(2)
        return temp + 'KB'
      } else if (fileSize < (1024 * 1024 * 1024)) {
        temp = fileSize / (1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'MB'
      } else {
        temp = fileSize / (1024 * 1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'GB'
      }
    },
    selectVideo() {
      this.$refs.videoInput.click()
    },
    async handleSelectVideo() {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return
      if (this.currentSeries == null) return
      // 上传视频
      const loading = this.$loading({
        lock: true,
        text: '上传视频中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        const videoInfo = await this.getVideoInfo(files[0])
        // 上传视频
        const res = await this.$http.upload(files[0], false, {
          timeout: 15 * 60 * 1000
        })
        const params = {
          isNew: true,
          courseId: this.currentSeries.id,
          departmentId: this.currentBranch.id,
          organizationId: this.organizationInfo.id,
          freeType: 0,
          videoType: 0,
          name: res.fileName.substr(0, res.fileName.lastIndexOf('.')),
          url: res.downloadPath,
          fileName: res.fileName,
          size: res.fileSize,
          sort: this.videoList.length === 0 ? 0 : (this.videoList[this.videoList.length - 1].sort + 1),
          videoTime: videoInfo.duration,
          frontCover: videoInfo.thumb,
          desc: ''
        }
        const res1 = await this.$http.post('/v1/Video/addVideo', params)
        params.id = res1.data
        this.handleOpenVideoForm(params)
        this._getVideoList()
        this.$message.success('新增视频成功！')
      } catch (error) {
        console.error(error)
      }
      loading.close()
      // 重置为空
      this.$refs.videoInput.value = ''
    },
    handleOpenVideoForm(video) {
      this.videoForm = {
        isNew: false,
        id: null,
        freeType: 0,
        videoType: 0,
        name: '',
        url: '',
        sort: 0,
        frontCover: '',
        desc: ''
      }
      if (video != null) {
        for (const key in this.videoForm) {
          if (video.hasOwnProperty(key)) {
            this.videoForm[key] = video[key]
          }
        }
      }
      this.showVideoForm = true
    },
    handleDeleteVideo(video) {
      this.$confirm('确定删除【' + video.name + '】视频吗？删除后将不能恢复！！！', '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/Video/deleteById/' + video.id).then(res => {
          this.$message.success('删除视频成功~')
          this._getVideoList()

          this.$http.delete('/v1/Qiniu/delete', {
            fileName: video.url
          })
        })
      })
    },
    handleVideoFrontSuccess(res) {
      if (res.code === '000000' && res.data.length > 0) {
        this.videoForm.frontCover = res.data[0].downloadPath
      }
    },
    handleSubmitVideo() {
      if (this.videoForm.id == null) {
        this.showVideoForm = false
        return
      }

      this.$refs.videoForm.validate(valid => {
        if (valid) {
          this.submitVideoLoading = true
          this.$http.put('/v1/Video/updateVideo', Object.assign({}, this.videoForm)).then(() => {
            this.showVideoForm = false
            this.$message.success('修改视频成功！')
            this._getVideoList()
          }).finally(() => {
            this.submitVideoLoading = false
          })
        }
      })
    },
    handleOpenTypeDialog() {
      this._getTypeList(true)
      this.showType = true
    },
    handleTypeClick(type, index) {
      if (type) {
        type.edit = true
        this.$nextTick(() => {
          this.$refs.typeItem[index].focus()
        })
      } else {
        this.showEditType = true
        this.typeInput = ''
        this.$nextTick(() => {
          this.$refs.addType.focus()
        })
      }
    },
    handleChangeType(type) {
      if (this.typeChangeLoading) return

      if (type) {
        // 修改
        if (type.name === '') {
          type.edit = false
          return
        }
        this.typeChangeLoading = true
        this.$http.put('/v1/DicVideoCourse/updateDicVideoCourse', {
          id: type.id,
          name: type.name
        }).then(() => {
          this._getTypeList(true)
          type.show = false
        }).finally(() => {
          this.typeChangeLoading = false
        })
      } else {
        // 增加
        if (this.typeInput === '') {
          this.showEditType = false
          return
        }
        this.typeChangeLoading = true
        this.$http.post('/v1/DicVideoCourse/addDicVideoCourse', {
          name: this.typeInput,
          organizationId: this.organizationInfo.id
        }).then(() => {
          this._getTypeList(true)
          this.showEditType = false
        }).finally(() => {
          this.typeChangeLoading = false
        })
      }
    },
    handleDeleteType(type) {
      this.$confirm('确定删除类型【' + type.name + '】视频吗？请确认该类型下没有视频系列！！！', '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/DicVideoCourse/deleteById/' + type.id).then(res => {
          this.$message.success('删除类型成功~')
          this._getTypeList(true)
        })
      })
    },
    // 学员分配
    handleStudentAllocation(row) {
      this.selectedSeries = row.id
      this.allocationTitle = row.name
      this.showStudentDialog = true
    }
  }
}
</script>

<style lang="stylus" scoped>
.video-content-wrapper
  padding 0 16px
  .video-header
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px

.type-list
  padding 8px 16px 16px
  .type-item
    height 80px
    border-radius 5px
    position relative
    text-align center
    line-height 68px
    border 1px solid $color-border-1
    box-sizing border-box
    padding 8px
    margin-bottom 16px
    background #f2f2f2
    cursor pointer
    .icon-del
      position absolute
      top 0
      right 0
      transform translate(50%, -50%)
    .icon-add
      font-size 28px
      color $color-text-3
  .add-btn
    background #f2f2f2
    cursor pointer
</style>

<style lang="stylus">
.series-form-dialog
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
    padding 20px 24px 12px 6px
  .avatar-uploader
    line-height 1
  .avatar-uploader .el-upload
    border 1px dashed #d9d9d9
    border-radius 6px
    cursor pointer
    position relative
    overflow hidden
  .avatar-uploader .el-upload:hover
    border-color #409EFF
  .avatar-uploader-icon
    font-size 28px
    color #8c939d
    width 138px
    height 138px
    line-height 138px
    text-align center
  .avatar
    width 138px
    height 138px
    display block
  .type-list .el-input__inner
    padding 0 6px
    font-size 13px

.series-content-dialog
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 16px
    background $color-background
    font-size 14px
    line-height 36px
    .title
      color $color-text-2
      span
        font-size 15px
        margin-right 6px
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
    padding 0
</style>
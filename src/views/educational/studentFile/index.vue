<!-- 学生档案列表 -->
<template>
  <div class="container">
    <div v-show="!showTimeline">
      <div class="query-form">
        <inline-select
          v-model="queryForm.classId"
          @change="query(3)"
          label="所属班级"
          valueAttr="id"
          labelAttr="name"
          :options="queyDropdownClassList"
          @show="_getClassListForQuery"
          filterable
          clearable
        />
        <inline-select
          v-model="queryForm.studentId"
          @change="query(1)"
          label="学生姓名"
          valueAttr="id"
          labelAttr="name"
          :loading="studentForQueryDropDownLoading"
          :options="queyDropdownStudentList"
          @show="_getStudentListForQuery"
          filterable
          clearable
        />
        <inline-select
          v-model="queryForm.studentType"
          @change="query(2)"
          label="学生类型"
          valueAttr="type"
          labelAttr="label"
          :options="studentTypeList"
          clearable
        />
        <el-button :disabled="!loading ? false : true" type="text" @click="handleReset" size="medium">重 置</el-button>
        <div class="btn-wrapper">
          <el-button type="primary" @click="handleOpenDialog()" icon="el-icon-plus">新 增</el-button>
        </div>
    </div>
    <div class="info-wrapper" :loading="loading">
        <ul v-if="studentCoverList && studentCoverList.length > 0">
            <li class="student-sex-imgbox" v-for="(item, index) in studentCoverList" :key="index" :style="{backgroundImage:'url(' + item.themeImgUrl || '' + ')'}">
                  <!-- <img class="studentTypeImg" :src="studentBgimg[item.studentType]" alt=""> -->
                  <img class="back" :src="item.headerUrl" alt=""/>
                  <img class="student-sex-img" v-if="item.sex === 1" :src="iconMale" alt="">
                  <img class="student-sex-img" v-if="item.sex === 2" :src="iconGamale" alt="">
                  <div class="header">
                      <img class="front" :src="item.headerUrl" alt=""/>
                  </div>
                  <p class="stu-name">{{item.studentName}}</p>
                  <span class="level">
                    <span v-if="item.studentType !== 4">
                      <i v-for="index in (item.studentType + 2)" :key="index" class="el-icon-trophy" type="primary"></i>
                    </span>
                    <span v-else>-</span>
                  </span>
                  <p>{{item.description}}</p>
                  <div class="footer">
                    <!-- 查看学生时间档案线 -->
                    <el-button type="success" circle icon="el-icon-view"  @click="handleViewTimelineClick(item)"></el-button>
                    <!-- 编辑学生时间档案线 -->
                    <el-button type="primary" circle icon="el-icon-edit"  @click="handleItemEdit(item)"></el-button>
                  </div>
            </li>
        </ul>
        <div v-else class="no-data">
          <p>暂无数据</p>
        </div>
        <div class="bottom-pagination">
          <el-pagination
            @size-change="query"
            @current-change="_getStudentCoverList"
            :current-page.sync="queryForm.pageNum"
            :page-size.sync="queryForm.pageSize"
            :page-sizes="[10, 20, 30]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            ></el-pagination>
      </div>
    </div>
      <!-- 新增弹出框 -->
    <el-dialog
        :title="studentCoverForm.organizationId ? `编辑学生【${studentCoverForm.studentName}】档案封面` : '新增学员档案封面'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @close="handleDialogClose"
        custom-class="custom-dialog"
        width="600px">
        <el-form ref="coverForm"
          :model="studentCoverForm"
          :rules="studentCoverRules"
          label-width="80px">
          <el-form-item label="选择学生" prop="studentId">
            <el-select v-model="studentCoverForm.studentId" :disabled="studentCoverForm.organizationId ? true : false" filterable clearable placeholder="请选择学生">
              <el-option
                v-for="item in tempStudentList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item ref="headerUpload" label="学生头像" prop="imgList">
            <el-upload
              :action="imgUploadPath"
              :class="{ uploadActive: studentCoverForm.headerUrl}"
              accept="image/*"
              list-type="picture-card"
              :show-file-list="true"
              :limit="1"
              :file-list="studentCoverForm.imgList"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemove">
              <i v-if="!studentCoverForm.headerUrl" class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" style="color:#409EFF;">大小：1M以内（建议413*295）</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="学生类型" prop="studentType">
            <el-select v-model="studentCoverForm.studentType" placeholder="请选择学生">
              <el-option
                v-for="item in studentTypeList"
                :key="item.type"
                :label="item.label"
                :value="item.type">
              </el-option>
            </el-select>
            <span style="margin-left:10px;color:#FF6600;font-size:20px;">
              <span v-if="studentCoverForm.studentType !== 4">
                <i v-for="index in (studentCoverForm.studentType + 2)" :key="index" class="el-icon-trophy" type="primary"></i>
              </span>
            </span>
          </el-form-item>
          <el-form-item label="学生简介" prop="description">
            <el-input
              type="textarea"
              :rows="5"
              show-word-limit
              maxlength="100"
              placeholder="请输入学生简介"
              v-model="studentCoverForm.description">
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleDialogClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit()" :loading="submitLoading">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 时间线面板 -->
    <div v-if="showTimeline" class="time-line">
        <div class="back-wrapper">
          <el-button type="primary" plain icon="el-icon-back" @click="handleHideTimeline()">返回上级</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleAddTimeline()" style="float:right;">新增档案</el-button>
        </div>
        <!-- 学生档案信息面板 -->
        <div class="stu-info-wrapper">
          <!-- <div class="base-info" :loading="studentDetailInfoLoaing" :style="{backgroundImage: 'url('+ (studentDetailInfo && studentDetailInfo.themeImgUrl ? studentDetailInfo.themeImgUrl : defaultThemeBg ) +')'}"> -->
            <div class="base-info" :loading="studentDetailInfoLoaing" style="background-color:#fff">
            <img class="left" :src="studentDetailInfo.headerUrl" alt=""/>
            <div class="right">
              <p class="stu-name">
                <label>{{studentDetailInfo.studentName}}
                  <i v-if="studentDetailInfo.sex === 0" class="el-icon-question"></i>
                  <i v-if="studentDetailInfo.sex === 1" class="el-icon-male"></i>
                  <i v-if="studentDetailInfo.sex === 2" class="el-icon-female"></i>
                </label>
              </p>
              <span v-if="studentDetailInfo.studentType" class="rank">
                <span v-if="studentDetailInfo.studentType !==4">
                  <i v-for="index in (studentDetailInfo.studentType + 2)" :key="index" class="el-icon-trophy" type="primary"></i>
                </span>
                <i v-else></i>
                <!-- <img v-for="index in (studentDetailInfo.studentType + 1)" :key="index" :src="require('../../../assets/cover/ring.png')" alt=""/> -->
              </span>
              <p class="item">
                <label class="title"><i class="el-icon-school"></i>学校</label>
                <label class="content">{{studentDetailInfo.school || '暂无'}}</label>
              </p>
              <p class="item">
                <label class="title"><i class="el-icon-c-scale-to-original"></i>年级</label>
                <label class="content">{{studentDetailInfo.grade || '暂无'}}</label>
              </p>
              <p class="item">
                <label class="title"><i class="el-icon-map-location"></i>住址</label>
                <label class="content">{{studentDetailInfo.address || '暂无'}}</label>
              </p>
              <p class="item">
                <label class="title"><i class="el-icon-potato-strips"></i>生日</label>
                <label class="content">{{studentDetailInfo.birthday || '暂无'}}</label>
              </p>
              <p class="item">
                <label class="title"><i class="el-icon-paperclip"></i>简介</label>
                <label class="content">{{studentDetailInfo.description || '暂无'}}</label>
              </p>
            </div>
          </div>
        </div>
        <div class="time-line-list">
          <el-timeline v-if="timelineList.length > 0">
            <el-timeline-item
              v-for="item in timelineList"
              :key="item.id"
              :timestamp="item.createAt"
              :color="item.color"
              :icon="item.icon"
              size="large"
              placement="top">
              <el-card shadow="hover">
                <div class="action-panel" v-if="false">
                  <el-button type="primary" icon="el-icon-edit" plain @click="handleEditTimeline(item)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" plain @click="handleDeleteTimeline(item)">删除</el-button>
                </div>
                <p class="title">{{item.title}}</p>
                <p class="desc">{{item.description}}</p>
                <div v-if="item.timelineImgs && item.timelineImgs.length > 0">
                  <viewer :images="item.timelineImgs">
                    <img
                      v-for="src in item.timelineImgs"
                      :src="src.imgUrl"
                      :key="src.id"
                      class="item-img"/>
                  </viewer>
                </div>
                <div v-if="item.videoUrl" class="video">
                  <!-- 图片预览 -->
                  <div class="img-msk">
                    <el-button class="btn-play" @click.stop="handlePreviewOpen(item.videoUrl)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <empty-data v-else @click="handleAddTimeline"></empty-data>
        </div>
        <!-- 新增档案弹出框 -->
        <el-dialog
        :title="timelineForm.id ? `编辑档案` : '新增档案'"
        :visible.sync="addTimelineDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        custom-class="custom-dialog"
        @close="handleTimelineDialogClose"
        width="600px">
        <el-form ref="timlineForm"
          :model="timelineForm"
          :rules="timelineRules"
          label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input
              show-word-limit
              maxlength="20"
              placeholder="请输入标题"
              v-model="timelineForm.title">
            </el-input>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              type="textarea"
              :rows="6"
              show-word-limit
              maxlength="120"
              placeholder="请输入描述"
              v-model="timelineForm.description">
            </el-input>
          </el-form-item>
          <el-form-item label="学生图集" prop="imgList">
            <el-upload
              :action="imgUploadPath"
              accept="image/*"
              list-type="picture-card"
              :show-file-list="true"
              :limit="10"
              :file-list="timelineForm.imgList"
              :before-upload="handleBeforeUpload"
              :on-success="handleAddTimelineUploadSuccess"
              :on-remove="handleAddTimelineRemove">
              <i class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" style="color:#409EFF;">大小：2M以内，尺寸不限，最多支持10张。</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="学生视频" prop="videoList">
            <ele-upload-video
              :data="{}"
              :fileSize="80"
              :width="200"
              :height="200"
              @error="handleUploadError"
              :responseFn="handleResponse"
              :action="imgUploadPath"
              v-model="timelineForm.videoUrl"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleTimelineDialogClose">取 消</el-button>
          <el-button type="primary" @click="handleTimelineSubmit()" :loading="submitTimelineLoading">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 该组件只能放在最外层，否则无法正常工作 -->
    <photo-preview ref="photoVideoPreview" :list="videoList" @on-close="handlePreviewClose"></photo-preview>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EleUploadVideo from 'vue-ele-upload-video'
import InlineSelect from '../../../components/InlineSelect'
import PhotoPreview from '../../../components/PhotoPreview'
import EmptyData from '../../../components/EmptyData'
import DefaultThemeBg from '../../../assets/cover/paper.jpg'
import IconMale from '../../../assets/icon_male.png'
import IconGamale from '../../../assets/icon_famale.png'
import StudentBg0 from '../../../assets/student_bg01.png'
import StudentBg1 from '../../../assets/student_bg02.png'
import StudentBg2 from '../../../assets/student_bg03.png'
import StudentBg3 from '../../../assets/student_bg04.png'

import moment from 'moment'

export default {
  name: 'StudentFile',
  data() {
    return {
      studentBgimg: [StudentBg0, StudentBg1, StudentBg2, StudentBg3],
      classForQueryDropDownLoading: false, // 获取班级列表loading
      queyDropdownClassList: [], // 查询列表
      defaultThemeBg: DefaultThemeBg,
      iconMale: IconMale,
      iconGamale: IconGamale,
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      studentForQueryDropDownLoading: false,
      queyDropdownStudentList: [],
      studentForAddDropDownLoading: false,
      addDropdownStudentList: [],
      tempStudentList: [], // 临时存储学生列表数据，因为编辑下拉选择和新增的下拉学生列表时不一样的
      loading: false, // 类别加载的laoding
      queryForm: {
        pageNum: 1,
        pageSize: 10
      },
      studentTypeList: [
        {
          type: 0,
          label: '普通生'
        },
        {
          type: 1,
          label: '中等生'
        },
        {
          type: 2,
          label: '优等生'
        },
        {
          type: 3,
          label: '学霸级'
        },
        {
          type: 4,
          label: '其他'
        }
      ],
      total: 0,
      studentCoverList: [],
      dialogVisible: false,
      submitLoading: false,
      studentCoverForm: { // 表单
        studentId: null,
        themeId: null,
        headerUrl: null,
        studentType: 4,
        description: null,
        organizationId: null,
        departmentId: null,
        imgList: []
      },
      studentCoverRules: {
        studentId: [
          { required: true, message: '请选择学员', trigger: 'blur' }
        ],
        imgList: [
          { required: true, message: '请上传学员头像图片', trigger: 'blur' }
        ],
        studentType: [
          { required: true, message: '请学员等级', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请学员简介', trigger: 'blur' }
        ]
      },
      showTimeline: false,
      // 往下的时间线及表单数据对象
      tempStudentCoverData: {}, // 临时学生的封面数据
      addTimelineDialogVisible: false,
      timlineListLoading: false,
      timelineList: [], // 学生档案线列表
      timelineForm: { // 表单
        id: null,
        title: null,
        description: null,
        content: null,
        videoUrl: null,
        imgList: []
      },
      submitTimelineLoading: false,
      timelineRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ]
      },
      studentDetailInfoLoaing: false,
      studentDetailInfo: {}, //  学生详情信息
      videoList: [] // 视频列表
    }
  },
  components: {
    InlineSelect,
    EleUploadVideo,
    PhotoPreview,
    EmptyData
  },
  // 生命周期 - 创建完成
  created() {
    this._getStudentCoverList()
    this._getStudentListForAdd()
    this._getClassListForQuery()
    this.upTimeline()
  },
  // 相关方法
  methods: {
    upTimeline() {
      if (this.$route.query.id) {
        this.showTimeline = true
        this._getStudentDetailInfo(this.$route.query.id)
        this.$http.get('/v1/StudentTimeline/getStudentTimelineAllByStudentId', { studentId: this.$route.query.id }).then(res => {
          this.timelineList = res.data
          if (this.timelineList && this.timelineList.length > 0) {
            let index = 0
            this.timelineList.forEach(item => {
              if (index === 0) {
                item.color = '#ff6600'
                item.icon = 'el-icon-s-claim'
              } else {
                item.color = '#67C23A'
                item.icon = 'el-icon-s-flag'
              }
              index++
            })
          }
        })
      }
    },
    // 获取班级列表作为查询条件下拉选择学员列表
    _getClassListForQuery() {
      this.classForQueryDropDownLoading = true
      const params = {
        departmentId: this.currentBranch.id
      }
      this.$http.get('/v1/Class/getForDropDown', params).then(res => {
        this.queyDropdownClassList = []
        res.data.forEach((item) => {
          this.queyDropdownClassList.push({ id: item.id, name: item.name })
        })
      }).finally(() => {
        this.classForQueryDropDownLoading = false
      })
    },
    // 获取在档案中的学生列表作为查询条件下拉选择学员列表
    _getStudentListForQuery() {
      this.studentForQueryDropDownLoading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        type: 0 // 获取在档案中的学生列表
      }
      this.$http.get('/v1/Student/getIdAndNameByOrgAndDep', params).then(res => {
        this.queyDropdownStudentList = res.data
      }).finally(() => {
        this.studentForQueryDropDownLoading = false
      })
    },
    // 获取不在档案中的学生列表作为新增条件下拉选择学员列表
    _getStudentListForAdd() {
      this.studentForAddDropDownLoading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        type: 1 // 获取不在档案中的学生列表
      }
      this.$http.get('/v1/Student/getIdAndNameByOrgAndDep', params).then(res => {
        this.addDropdownStudentList = res.data
      }).finally(() => {
        this.studentForAddDropDownLoading = false
      })
    },
    _getStudentCoverList() {
      this.loading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        pageNum: this.queryForm.pageNum,
        pageSize: this.queryForm.pageSize
      }
      if (this.queryForm.classId) {
        params.classId = this.queryForm.classId
      }
      if (this.queryForm.studentId) {
        params.studentId = this.queryForm.studentId
      }
      if (this.queryForm.studentType || this.queryForm.studentType === 0) {
        params.studentType = this.queryForm.studentType
      }
      this.$http.get('/v1/StudentCover/getList', params).then(res => {
        this.total = res.total
        this.studentCoverList = res.data
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置查询条件
    handleReset() {
      this.queryForm = {
        pageNum: 1,
        pageSize: 10
      }

      this._getStudentCoverList()
    },
    query(type) {
      if (type && type === 3) {
        this.queryForm.studentType = null
        this.queryForm.studentId = null
      }
      if (type && type === 1) {
        this.queryForm.studentType = null
        this.queryForm.classId = null
      }
      if (type && type === 2) {
        this.queryForm.studentId = null
        this.queryForm.classId = null
      }
      this.queryForm.pageNum = 1
      this._getStudentCoverList()
    },
    // 查看学生档案时间线详情页
    handleViewTimelineClick(item) {
      this.showTimeline = true
      this.tempStudentCoverData = item
      this._getStudentTimelineByStudentId()
      if (this.tempStudentCoverData) {
        this._getStudentDetailInfo(this.tempStudentCoverData.studentId)
      }
    },
    // 获取学生档案详情信息
    _getStudentDetailInfo(studentId) {
      this.studentDetailInfoLoaing = true
      this.$http.get('/v1/StudentCover/getStudentDetailInfoByStudentId', { studentId: studentId }).then(res => {
        this.studentDetailInfo = res.data
        if (this.studentDetailInfo.birthday) {
          this.studentDetailInfo.birthday = this.studentDetailInfo.birthday.split(' ')[0]
        }
        if (this.studentDetailInfo.sex) {
          switch (this.studentDetailInfo.sex) {
            case 0:
              this.studentDetailInfo.sexStr = '未知'
              break
            case 1:
              this.studentDetailInfo.sexStr = '男'
              break
            case 2:
              this.studentDetailInfo.sexStr = '女'
              break
            default:
              this.studentDetailInfo.sexStr = '未知'
              break
          }
        } else {
          this.studentDetailInfo.sexStr = '未知'
        }
        // 0-普通生，1-中等生，2-优等生，3-学霸级
        if (this.studentDetailInfo.studentType) {
          switch (this.studentDetailInfo.studentType) {
            case 0:
              this.studentDetailInfo.studentTypeStr = '普通生'
              break
            case 1:
              this.studentDetailInfo.studentTypeStr = '中等生'
              break
            case 2:
              this.studentDetailInfo.studentTypeStr = '优等生'
              break
            case 3:
              this.studentDetailInfo.studentTypeStr = '学霸级'
              break
            case 4:
              this.studentDetailInfo.studentTypeStr = '其他'
              break
            default:
              this.studentDetailInfo.studentTypeStr = '--'
              break
          }
        }
      }).finally(() => {
        this.studentDetailInfoLoaing = false
      })
    },
    handleOpenDialog() {
      this.tempStudentList = this.addDropdownStudentList
      this.dialogVisible = true
    },
    handleDialogClose() {
      this.dialogVisible = false
      this.resetCoverForm()
    },
    // 重置表单
    resetCoverForm() {
      this.studentCoverForm = {
        studentId: null,
        themeId: null,
        headerUrl: null,
        studentType: 4,
        description: null,
        organizationId: null,
        departmentId: null,
        imgList: []
      }
    },
    // 编辑
    handleItemEdit(data) {
      this.tempStudentList = [
        { id: data.studentId, name: data.studentName }
      ]
      this.studentCoverForm = {
        studentId: data.studentId,
        studentName: data.studentName,
        themeId: data.themeId,
        headerUrl: data.headerUrl,
        studentType: data.studentType,
        description: data.description,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        imgList: [
          { name: 'default.png', url: data.headerUrl }
        ]
      }
      this.dialogVisible = true
    },
    // 提交表单
    handleSubmit() {
      this.$refs.coverForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.studentCoverForm.organizationId && this.studentCoverForm.departmentId) { // 更新数据
            const params = {
              studentId: this.studentCoverForm.studentId,
              themeId: this.studentCoverForm.themeId,
              headerUrl: this.studentCoverForm.headerUrl,
              studentType: this.studentCoverForm.studentType,
              description: this.studentCoverForm.description,
              organizationId: this.studentCoverForm.organizationId,
              departmentId: this.studentCoverForm.departmentId
            }

            this.$http.put('/v1/StudentCover/updateStudentCover', params).then(res => {
              this.query()
              this.handleDialogClose()
            }).finally(() => {
              this.submitLoading = false
            })
          } else { // 新增
            const params = {
              studentId: this.studentCoverForm.studentId,
              themeId: this.studentCoverForm.themeId,
              headerUrl: this.studentCoverForm.headerUrl,
              studentType: this.studentCoverForm.studentType,
              description: this.studentCoverForm.description,
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id
            }

            this.$http.post('/v1/StudentCover/addStudentCover', params).then(res => {
              this.query()
              this.handleDialogClose()
              // 新增成功之后，查询列表的学生下拉和新增的下拉列表数据需重新获取
              this._getStudentListForQuery()
              this._getStudentListForAdd()
              this._getClassListForQuery()
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    },
    // 时间线返回按钮事件
    handleHideTimeline() {
      this.showTimeline = false
      this.tempStudentCoverData = {}
      this.timelineList = []
      this.studentDetailInfo = {}
      this.videoList = []
    },
    // 根据学生ID获取档案列表
    _getStudentTimelineByStudentId() {
      if (this.tempStudentCoverData) {
        this.timlineListLoading = true
        this.$http.get('/v1/StudentTimeline/getStudentTimelineAllByStudentId', { studentId: this.tempStudentCoverData.studentId }).then(res => {
          this.timelineList = res.data
          if (this.timelineList && this.timelineList.length > 0) {
            let index = 0
            this.timelineList.forEach(item => {
              if (index === 0) {
                item.color = '#ff6600'
                item.icon = 'el-icon-s-claim'
              } else {
                item.color = '#67C23A'
                item.icon = 'el-icon-s-flag'
              }
              index++
            })
          }
        }).finally(() => {
          this.timlineListLoading = false
        })
      } else {
        this.timelineList = []
      }
    },
    // 编辑学生档案线
    handleEditTimeline(data) {
      this.timelineForm = {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        videoUrl: data.videoUrl
      }
      this.timelineForm.imgList = []
      if (data.timelineImgs && data.timelineImgs.length > 0) {
        data.timelineImgs.forEach(item => {
          this.timelineForm.imgList.push(
            {
              name: item.id + '.png',
              url: item.imgUrl
            }
          )
        })
      }
      this.addTimelineDialogVisible = true
    },
    // 删除档案线数据
    handleDeleteTimeline(data) {
      this.$confirm('此操作将永久删除此档案且不可恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/StudentTimeline/updateValidById', { id: data.id }).then(res => {
          let index = -1
          for (let i = 0; i < this.timelineList.length; i++) {
            if (this.timelineList[i].id === data.id) {
              index = i
              break
            }
          }
          if (index !== -1) {
            this.timelineList.splice(index, 1)
          }
          this.$message.success('删除成功')
        })
      })
    },
    // 打开新增档案表单弹出层
    handleAddTimeline() {
      this.timelineForm = {
        id: null,
        title: null,
        description: null,
        content: null,
        videoUrl: null,
        imgList: []
      }
      this.addTimelineDialogVisible = true
    },
    // 图片预览
    handlePreviewOpen(videoUrl) {
      const autoplay = true
      this.videoList.push({
        html: `<video src="${videoUrl}" poster="${videoUrl}" ${autoplay ? 'autoplay' : ''} controls width="800" height="600"></video>`
      })
      console.log(this.videoList)
      this.$refs.photoVideoPreview.show(0)
    },
    // 关闭预览
    handlePreviewClose() {
      const elList = this.$refs.photoVideoPreview.photoswipe.container.querySelectorAll('video')
      for (let i = 0; i < elList.length; i++) {
        elList[i].pause()
      }
    },
    // 关闭新增档案弹出框
    handleTimelineDialogClose() {
      this.timelineForm = {
        id: null,
        title: null,
        description: null,
        content: null,
        videoUrl: null,
        imgList: []
      }
      this.addTimelineDialogVisible = false
    },
    // 提交档案
    handleTimelineSubmit() {
      this.$refs.timlineForm.validate(valid => {
        this.submitTimelineLoading = true
        if (this.timelineForm.id) { // 编辑(目前此方法预留，暂时不放出)
          const params = {
            id: this.timelineForm.id,
            title: this.timelineForm.title,
            description: this.timelineForm.description,
            videoUrl: this.timelineForm.videoUrl,
            content: this.timelineForm.content,
            timelineImgs: []
          }
          if (this.timelineForm.imgList && this.timelineForm.imgList.length > 0) {
            this.timelineForm.imgList.forEach(item => {
              params.timelineImgs.push({ imgUrl: item.url })
            })
          }
          this.$http.put('/v1/StudentTimeline/updateStudentTimeline', params).then(res => {
            this.addTimelineDialogVisible = false
            // 为了缓解后端压力，使用前端解决数据展示
            const tempData = this.timelineList.find(o => o.id === params.id)
            tempData.title = params.title
            tempData.description = params.description
            tempData.videoUrl = params.videoUrl
            tempData.content = params.content
            tempData.timelineImgs = params.timelineImgs

            this.$message.success('更新档案成功')
          }).finally(() => {
            this.submitTimelineLoading = false
          })
        } else { // 新增
          const params = {
            studentId: this.tempStudentCoverData.studentId,
            title: this.timelineForm.title,
            description: this.timelineForm.description,
            videoUrl: this.timelineForm.videoUrl,
            content: this.timelineForm.content,
            timelineImgs: [],
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id
          }
          if (this.timelineForm.imgList && this.timelineForm.imgList.length > 0) {
            this.timelineForm.imgList.forEach(item => {
              params.timelineImgs.push({ imgUrl: item.url })
            })
          }

          this.$http.post('/v1/StudentTimeline/addStudentTimeline', params).then(res => {
            this.addTimelineDialogVisible = false
            // 为了缓解后端压力，使用前端解决数据展示
            const temp = Object.assign([], this.timelineList)
            this.timelineList = []
            this.timelineList.push({
              id: res.data,
              studentId: params.studentId,
              title: params.title,
              description: params.description,
              videoUrl: params.videoUrl,
              content: params.content,
              timelineImgs: params.timelineImgs,
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              createAt: moment().format('YYYY-MM-DD HH:mm:ss')
            })
            this.timelineList = this.timelineList.concat(temp)
            if (this.timelineList && this.timelineList.length > 0) {
              let index = 0
              this.timelineList.forEach(item => {
                if (index === 0) {
                  item.color = '#ff6600'
                  item.icon = 'el-icon-s-claim'
                } else {
                  item.color = '#67C23A'
                  item.icon = 'el-icon-s-flag'
                }
                index++
              })
            }
            this.$message.success('新增档案成功')
          }).finally(() => {
            this.submitTimelineLoading = false
          })
        }
      })
    },
    // 上传图片相关
    handleBeforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2

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
          if (!this.studentCoverForm.headerUrl) {
            this.studentCoverForm.headerUrl = ''
          }
          res.data.forEach(item => {
            this.studentCoverForm.headerUrl = item.downloadPath
            // 处理回显数据
            this.studentCoverForm.imgList = [
              { name: item.fileName, url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.studentCoverForm.headerUrl = null
      this.studentCoverForm.imgList = []
    },
    // 档案图片上传成功事件
    handleAddTimelineUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          res.data.forEach(item => {
            // 处理回显数据
            this.timelineForm.imgList = this.timelineForm.imgList.concat({ name: item.fileName, url: item.downloadPath })
          })
        }
      }
    },
    // 档案移除事件
    handleAddTimelineRemove(file, fileList) {
      this.timelineForm.imgList = fileList
    },
    // 视频上传相关
    handleUploadError() {
      this.$message.error('上传视频失败')
    },
    handleResponse(response) {
      return response.data[0].downloadPath
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>

<style>
@import url("../../../styles/studentBook/theme.css");
</style>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
/* el-divider 修改高度&虚线效果 */
  .query-form
    .btn-wrapper
      float right
  // 当上传图片达到限制张数时，隐藏可上传icon和border
  .uploadActive
    >>>.el-upload--picture-card
      border 1px solid #fff
  .info-wrapper
    padding 15px
    background-color #ffffff
    .no-data
      height 100px
      p
        text-align center
        color #999999
        line-height 100px
    ul
      display flex
      justify-content flex-start
      flex-direction row
      flex-wrap wrap
      li
        width 249px
        height 350px
        margin 0 10px 14px 0
        border 1px solid #eeeeee
        border-radius 2px
        text-align center
        transition-duration .28s
        position relative
        overflow hidden
        .stu-name
          color #666666
          font-size 17px
          margin 15px 0 10px 0
          font-weight bold
        .level
          font-size 20px
          margin 5px 0 0 0
          color $color-primary
        .back
          display none
        .header
          margin-top 10px
          .front
            width 100px
            height 100px
            border 1px solid #eeeeee
            border-radius 110px
            margin-top 20px
        p
          margin-top 10px
          color #888888
          padding 0 10px 0 10px
          letter-spacing 1px
          display -webkit-box
          -webkit-box-orient vertical
          -webkit-line-clamp 4
          overflow hidden
        .footer
          display none
          position absolute
          bottom 5px
          left 35%
        &:hover
          border 1px solid transparent
          box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.2)
          transform scale(1.03)
          .stu-name
            color $color-primary
          p
            color $color-primary
          .footer
            display flex
          .back
            width 90%
            height 90%
            position absolute
            display block
            z-index -1
            filter blur(30px)
            -webkit-filter blur(30px)
            -moz-filter blur(30px)
            -ms-filter blur(30px)
            -o-filter blur(30px)
  .time-line
    >>>.el-timeline-item__tail
      border-left 1px dashed $color-primary
    >>>.el-timeline-item__node
      left -6px
      width 20px
      height 20px
    .back-wrapper
      padding 10px
      background-color #ffffff
    .stu-info-wrapper
      margin-top 10px
      .base-info
        margin-bottom 10px
        // border 1px dashed $color-primary
        border-radius 5px
        padding 20px
        display flex
        justify-content fixed-start
        .left
          width 210px
          height 210px
          border 1px solid #eeeeee
          border-radius 4px
        .right
          margin-left 20px
          padding-right 10px
          .stu-name
            font-size 20px
            color $color-primary
          .rank
            i
              margin 10px 5px 10px 0
              font-size 20px
              color $color-danger
            img
              width 30px
              height 30px
          .item
            margin-bottom 7px
            .title
              color #999999
              margin-right 10px
              i
                margin-right 5px
                color $color-text-1
            .content
              color rgba(0,0,0,0.8)
    .time-line-list
      background-color #ffffff
      min-height 100px
      padding 10px 30px 10px 10px
      .action-panel
        display flex
        justify-content flex-end
        border-bottom 1px dashed #eeeeee
        padding-bottom 10px
      .title
        margin 10px 0
        font-size 18px
      .item-img
        width 150px
        height 150px
        border 1px solid #eeeeee
        border-radius 12px
        margin 10px 20px 10px 0
        &:hover
          box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
      .desc
        margin-bottom 10px
        color #708090
        letter-spacing 1px
        text-shadow 0 0 20px #708090
      .video
        .img-msk
          width 150px
          height 150px
          margin-top 10px
          border-radius 5px
          background rgba(0, 0, 0, 0.3)
          position relative
          text-align center
          &:hover
            box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
          .btn-play
            width 40px
            height 40px
            position absolute
            top 55px
            bottom 0
            left 55px
            right 0
            font-size 18px
            padding 6px
@media screen and (min-width: 1300px)
  .container .info-wrapper ul li
    margin-right 30px
.student-sex-imgbox
  position relative
  // border none !important
  .student-sex-img
    position absolute
    width 20px
    right 78px
    top 32px
  .studentTypeImg
    position absolute
    width 100%
    height 100%
    left 0
</style>
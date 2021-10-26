<template>
  <div>
    <!-- <el-tabs v-model="currentTab">
      <el-tab-pane label="上课记录" name="0"></el-tab-pane>
      <el-tab-pane label="课后作业" name="1"></el-tab-pane>
    </el-tabs> -->
    <div class="query-form">
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始录入日期"
        end-placeholder="结束录入日期"
        :picker-options="dateOptions"
        @change="query"
        style="margin-right: 16px; width: 300px;">
      </el-date-picker>
      <inline-select v-model="queryForm.classId" @change="query" label="班级" valueAttr="id" labelAttr="name" :loading="classLoading" :options="classList" @show="_getClassList" filterable clearable/>
      <inline-select v-model="queryForm.courseId" @change="query" label="课程" valueAttr="id" labelAttr="name" :loading="courseLoading" :options="courseList" @show="_getCourseList" filterable clearable/>
      <inline-select v-model="queryForm.teacherId" @change="query" label="任课老师" valueAttr="id" labelAttr="username" :loading="teacherLoading" :options="teacherList" @show="_getTeacherList" filterable clearable/>
      <el-button :disabled="!queryLoading ? false : true" type="text" @click="reset" size="medium" style="margin: 0 10px;">重&nbsp;置</el-button>
    </div>
    <div class="showTableData">
      <el-table
        :data="coursRecordList"
        v-loading="queryLoading">
        <el-table-column
          prop="courseTimeStr"
          label="上课时间"
          width="240"
          align="center">
          <span slot-scope="scope" class="link" @click="handleOpenDetail(scope.row)">{{scope.row.courseTimeStr}}</span>
        </el-table-column>
        <el-table-column
          prop="className"
          label="班级/学员"
          width="130"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.className || scope.row.oneStudentName + '(学员)'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="courseName"
          label="课程"
          width="130"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.courseName || scope.row.oneCourseName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="teacherName"
          label="任课老师"
          width="130"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.teacherName || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="classRoomName"
          label="教室">
        </el-table-column>
        <el-table-column
          prop="classHour"
          label="消耗课时"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="checkInCount"
          label="实到人数"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="studentCount"
          label="应到人数"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="homeworkCount"
          label="是否布置作业"
          width="100"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.homeworkCount ? 'success' : 'info'">{{scope.row.homeworkCount  ? '是' : '否'}}</el-tag>
        </el-table-column>
        <!-- <el-table-column
          prop="createAt"
          label="点名时间"
          width="144"
          align="center">
        </el-table-column> -->
        <el-table-column
          label="操作"
          align="center"
          width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenDetail(scope.row)">详情</el-button>
            <el-button type="text" :disabled="scope.row.homeworkCount ? true : false" @click="handleDeployHomework(scope.row)">布置作业</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getCourseRecord"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <el-dialog title="上课记录详情"
      :visible.sync="showDetail"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      top="5vh"
      class="class-record-detail-dialog"
      width="860px">
      <el-tabs v-model="currentTab" @tab-click="handleTabChange">
        <el-tab-pane label="点名记录" name="0"></el-tab-pane>
        <el-tab-pane label="课堂附件" name="1"></el-tab-pane>
        <el-tab-pane label="课后作业" name="2"></el-tab-pane>
        <el-tab-pane label="收交作业" name="3"></el-tab-pane>
      </el-tabs>
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 60vh;">
        <template v-if="currentTab === '0'">
          <el-checkbox-group :value="callRollStatus" style="margin-bottom: 8px;">
            <el-checkbox :label="0" @click.native.prevent="handleCallRollStatusChange(0)">到课</el-checkbox>
            <el-checkbox :label="2" @click.native.prevent="handleCallRollStatusChange(2)">请假</el-checkbox>
            <el-checkbox :label="1" @click.native.prevent="handleCallRollStatusChange(1)">缺勤</el-checkbox>
          </el-checkbox-group>
          <el-table
            :data="callRollList"
            v-loading="tabLoading">
            <el-table-column prop="name" label="学生姓名">
              <template slot-scope="scope">{{scope.row.name}}<span v-if="scope.row.nickName"> ({{scope.row.nickName}})</span></template>
            </el-table-column>
            <el-table-column prop="primaryContactPhone" label="手机号码">
            </el-table-column>
            <el-table-column prop="signInStatus" label="是否签到">
              <el-tag slot-scope="scope" :type="scope.row.signInStatus ? 'success' : 'info'">{{scope.row.signInStatusStr}}</el-tag>
            </el-table-column>
            <el-table-column prop="callRollStatusStr" label="点名情况">
              <el-tag slot-scope="scope" :type="scope.row.callRollStatusClass">{{scope.row.callRollStatusStr}}</el-tag>
            </el-table-column>
          </el-table>
          <div class="bottom-pagination">
            <el-pagination
              @size-change="handleCallRollSizeChange"
              @current-change="_getCallRollRecord"
              :current-page.sync="callRollPageNum"
              :page-size.sync="callRollPageSize"
              :page-sizes="[10, 20, 30, 40, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="callRollTotal">
            </el-pagination>
          </div>
        </template>
        <div v-else-if="currentTab === '1'"  v-loading="tabLoading">
          <el-upload
            :action="uploadUrl"
            :file-list="courseFiles"
            show-file-list
            accept=".doc, .docx, .ppt, .pptx, .xls, .xlsx"
            :on-preview="handlePreviewFile"
            :on-remove="handleRemoveFile"
            :on-success="handleSuccessFile"
            :before-upload="handleBeforeUpload"
            :before-remove="(file) => $confirm(`确定删除课堂附件【${ file.name }】？`, '提示')"
            :limit="1">
            <template v-if="courseFiles.length === 0">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                1. 只能上传.doc, .docx, .ppt, .pptx, .xls, .xlsx文件，且不超过10M<br>
                2. 只允许上传一个文件
              </div>
            </template>
          </el-upload>
        </div>
        <div v-else-if="currentTab === '2'" class="homework-list" v-loading="tabLoading">
          <template v-if="homeWorkList.length > 0">
            <div class="homeword-item" v-for="item in homeWorkList" :key="item.id">
              <p class="top-title">
                <span class="left">{{item.name}}</span>
                <span class="right">截止时间：{{item.endTime}} (<span>{{item.endTimeStr}}</span>)</span>
              </p>
              <div class="question-list" v-if="item.content">
                <p class="content">{{item.content.message}}</p>
                <ul class="img-list" v-if="item.content.atlas">
                  <li v-for="(item1, index) in item.content.atlas" :key="index" @click="preview(item.content.atlas, index)">
                    <img :src="item1.thumb || item1.url" width="100%" height="100%"/>
                    <template v-if="item1.type === 1">
                      <div class="img-msk">
                        <el-button class="btn-play" @click.stop="preview(item.content.atlas, index)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                      </div>
                    </template>
                  </li>
                </ul>
              </div>
            </div>
          </template>
          <empty-data v-else tip="没有布置课后作业！"></empty-data>
        </div>
        <div v-else-if="currentTab === '3'" v-loading="tabLoading" class="student-work-wrapper">
          <template v-if="!noWork">
            <p class="tip">提示：点击行查看提交的作业内容！点击学员对学生作业进行点评！<label style="color:ff6600;">(点击图片可放大)</label></p>
            <div class="wrapper">
              <div class="work-list">
                <el-table
                  :data="studentWorkList"
                  border
                  highlight-current-row
                  @row-click="handleWorkRowChange">
                  <el-table-column
                    prop="name"
                    label="学员姓名"
                    width="110">
                    <template slot-scope="scope">
                      <el-tooltip content="点击此处点评作业" placement="top" effect="light">
                        <el-button type="text" :disabled="scope.row.uploadStatus != 1">{{scope.row.name}}</el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="primaryContactPhone"
                    label="联系方式"
                    width="100">
                  </el-table-column>
                  <el-table-column
                    prop="uploadStatus"
                    label="是否提交"
                    align="center"
                    width="100">
                    <el-tag slot-scope="scope" :type="scope.row.uploadStatus > 0 ? 'success' : 'info'">{{scope.row.uploadStatus > 0 ? '已提交' : '未提交'}}</el-tag>
                  </el-table-column>
                </el-table>
              </div>
              <div class="work-detail">
                <div class="question-list" v-if="workDetail">
                  <p class="title">学员作业:</p>
                  <p class="content">{{workDetail.replyContent}}</p>
                  <ul class="homework-img-list" v-if="workDetail.replyAtlas">
                    <li v-for="(item1, index) in workDetail.replyAtlas" :key="index" @click="preview(workDetail.replyAtlas, index)">
                      <img :src="item1.url || item1" width="100%" height="100%"/>
                      <template v-if="item1.type === 1">
                        <div class="img-msk">
                          <el-button class="btn-play" @click.stop="preview(workDetail.replyAtlas, index)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                        </div>
                      </template>
                    </li>
                  </ul>
                  <div class="teacher-comment">
                    <p class="title">教师点评:</p>
                    <div v-if="workDetail.commentContent">
                      <p>{{workDetail.commentContent}}</p>
                      <ul class="homework-img-list" v-if="workDetail.commentAttachment">
                        <li v-for="(item1, index) in workDetail.commentAttachment" :key="index" @click="preview(workDetail.commentAttachment, index)">
                          <img v-if="item1.type === 0" :src="item1.src" width="100%" height="100%"/>
                          <img v-if="item1.type === 1" :src="item1.thumb" width="100%" height="100%"/>
                          <template v-if="item1.type === 1">
                            <div class="img-msk-item">
                              <el-button class="btn-play" @click.stop="preview(workDetail.commentAttachment, index)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                            </div>
                          </template>
                        </li>
                      </ul>
                      <el-button type="success" plain @click="handleAddOrEditHomeWorkComment(workDetail, 1)">编辑点评</el-button>
                    </div>
                    <el-button v-else type="primary" plain @click="handleAddOrEditHomeWorkComment(workDetail, 0)">点评作业</el-button>
                  </div>
                </div>
                <p class="not-data" v-if="workDetail == null">没有提交的作业内容！</p>
              </div>
            </div>
          </template>
          <empty-data v-else tip="没有布置课后作业！"></empty-data>
        </div>
      </el-scrollbar>
    </el-dialog>

    <!-- 作业点评弹出框 -->
    <el-dialog
      :title="teacherCommentFormTitle"
      :visible.sync="commentDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="custom-dialog"
      width="600px">
      <el-form :model="teacherCommentForm" ref="teacherCommentForm" :rules="teacherCommentFormRules" label-width="90px">
        <el-form-item label="点评内容" prop="commentContent">
          <el-input v-model="teacherCommentForm.commentContent" type="textarea" rows="8" maxlength="200" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="点评文件" prop="commentAttachment">
          <multi-uploader v-model="teacherCommentForm.commentAttachment" @clickItem="previewFile" @uploadFileSuccess="updateHomeWorkContent" @deleteFileSuccess="updateHomeWorkContent"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUploadTeacherComment()" :loading="teacherCommentSubmitLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 图片预览 -->
    <photo-preview ref="photoPreview" :list="imgs" @on-index-change="handlePreviewChange" @on-close="handlePreviewClose"></photo-preview>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import PhotoPreview from '../../components/PhotoPreview'
import EmptyData from '../../components/EmptyData'
import MultiUploader from '_c/MultiUploader'

import { mapGetters } from 'vuex'
import moment from 'moment'
import path from 'path'
import { saveAs } from 'file-saver'

moment.locale('zh-cn')
export default {
  data() {
    return {
      queryLoading: false,
      classLoading: false,
      courseLoading: false,
      teacherLoading: false,
      tabLoading: false,
      showDetail: false,
      dateOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      uploadUrl: process.env.VUE_APP_UPLOAD_URL,
      queryForm: {
        dateRange: [],
        classId: '',
        classroomId: '',
        courseId: '',
        teacherId: ''
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      coursRecordList: [],
      workList: [],
      teacherList: [],
      classList: [],
      courseList: [],
      currentTab: '0',
      selectedRecord: null,
      callRollStatus: [],
      callRollPageNum: 1,
      callRollPageSize: 10,
      callRollTotal: 0,
      callRollList: [], // 点名记录
      homeWorkList: [], // 课后习题
      courseFiles: [], // 课堂附件
      studentWorkList: [], // 学生提交的作业
      noWork: false, // 没有布置作业？
      workDetail: null,
      imgs: [], // 预览的图集
      commentDialogVisible: false,
      teacherCommentSubmitLoading: false,
      teacherCommentFormTitle: '新增点评',
      teacherCommentForm: {
        id: null,
        uploadCommentType: 0,
        commentContent: null,
        commentAttachment: []
      },
      teacherCommentFormRules: {
        commentContent: [
          { required: true, message: '请填写名称', triggle: 'blur' },
          { minlength: 3, message: '最小长度为3位', trigger: 'blur' },
          { maxlength: 200, message: '最大长度为200位', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'currentBranch'
    ])
  },
  components: {
    InlineSelect, PhotoPreview, EmptyData, MultiUploader
  },
  created() {
    this._getClassList()
    this.queryForm.classId = this.$route.query.classId
    // 默认当前老师
    // if (this.userInfo.userLogo) {
    //   this.queryForm.teacherId = this.userInfo.id
    //   this._getTeacherList()
    // }
    this._getCourseRecord()
  },
  methods: {
    // 获取上课记录
    _getCourseRecord() {
      this.queryLoading = true
      const params = Object.assign({}, this.queryForm)
      if (params.dateRange && params.dateRange.length > 0) {
        params.startDate = params.dateRange[0]
        params.endDate = params.dateRange[1]
      }
      delete params.dateRange
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      params.goToClassStatus = 1
      this.$http.get('/v1/CoursePlan/getCourseTimeByParams/' + this.currentBranch.id, params).then(res => {
        res.data.forEach(item => {
          item.courseTimeStr = moment(item.goToClassDate).format('YYYY-MM-DD') + ' ' +
                               moment(item.goToClassDate).format('dddd') + ' ' +
                               moment('2019-09-03 ' + item.goToClassStartTime).format('HH:mm') + '~' +
                               moment('2019-09-03 ' + item.goToClassEndTime).format('HH:mm')
        })
        this.coursRecordList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.teacherLoading = true
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id, userLogo: 1 }).then(res => {
        this.teacherList = res.data
      }).finally(() => {
        this.teacherLoading = false
      })
    },
    // 获取班级列表
    _getClassList() {
      if (this.classList.length > 0) return
      this.classLoading = true
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id }).then(res => {
        this.classList = res.data
      }).finally(() => {
        this.classLoading = false
      })
    },
    // 获取课程列表
    _getCourseList() {
      if (this.courseList.length > 0) return
      this.courseLoading = true
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, { status: 1 }).then(res => {
        this.courseList = res.data
      }).finally(() => {
        this.courseLoading = false
      })
    },
    // 获取点名记录
    _getCallRollRecord() {
      this.tabLoading = true
      const params = {
        pageNum: this.callRollPageNum,
        pageSize: this.callRollPageSize
      }
      if (this.callRollStatus.length > 0) {
        params.callRollStatus = this.callRollStatus[0]
      }
      this.$http.get('/v1/CourseCheckingIn/getCourseCheckingIn/' + this.selectedRecord.id, params).then(res => {
        res.data.forEach(item => {
          if (item.signInStatus) {
            item.signInStatusStr = '已签到'
          } else {
            item.signInStatusStr = '未签到'
          }
          switch (item.callRollStatus) {
            case 0:
              item.callRollStatusStr = '到课'
              item.callRollStatusClass = 'success'
              break
            case 1:
              item.callRollStatusStr = '缺席'
              item.callRollStatusClass = 'danger'
              break
            case 2:
              item.callRollStatusStr = '请假'
              item.callRollStatusClass = 'warning'
              break
          }
        })
        this.callRollList = res.data
        this.callRollTotal = res.total
      }).finally(() => {
        this.tabLoading = false
      })
    },
    // 课后习题
    _getHomeWork() {
      this.tabLoading = true
      this.$http.get('/v1/Homework/getHomeworkByCourseTimeId', {
        courseTimeId: this.selectedRecord.id
      }).then(res => {
        res.data.forEach(item => {
          if (item.content) {
            item.content = JSON.parse(item.content)
            if (typeof item.content.atlas === 'string') {
              item.content = item.content.atlas.split(';').map(o => { return { type: 0, src: o, url: o } })
            } else {
              item.content.atlas.forEach(item => {
                item.url = item.src
              })
            }
          }
          if (moment().isAfter(item.endTime)) {
            item.endTimeStr = '已结束'
          } else {
            const hours = Math.abs(moment().diff(item.endTime, 'hours'))
            item.endTimeStr = `还剩余${parseInt(hours / 24)}天${hours % 24}小时`
          }
        })
        this.homeWorkList = res.data
      }).finally(() => {
        this.tabLoading = false
      })
    },
    // 获取课堂附件
    _getCourseFile() {
      this.tabLoading = true
      this.$http.get('/v1/Attachment/getAttachmentListByCourseTimeId', {
        courseTimeId: this.selectedRecord.id
      }).then(res => {
        res.data.forEach(item => {
          item.url = item.downloadAddress
        })
        this.courseFiles = res.data
      }).finally(() => {
        this.tabLoading = false
      })
    },
    // 获取学生上传的作业
    _getStudentWork() {
      this.tabLoading = true
      this.studentWorkList = []
      this.noWork = false
      this.$http.get('/v1/StudentHomeworkInfo/getHomeworkStudentInfo', {
        courseTimeId: this.selectedRecord.id
      }).then(res => {
        this.studentWorkList = res.data
      }).catch(err => {
        if (err.code === '300000') {
          this.noWork = true
        }
      }).finally(() => {
        this.tabLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getCourseRecord()
    },
    reset() {
      this.queryForm = {
        dateRange: [],
        classId: '',
        classroomId: '',
        courseId: '',
        teacherId: ''
      }

      // 默认当前老师
      // if (this.userInfo.userLogo) {
      //   this.queryForm.teacherId = this.userInfo.id
      // }
      this.query()
    },
    handleOpenDetail(row) {
      this.selectedRecord = Object.assign({}, row)
      this.currentTab = '0'
      this.callRollPageSize = 10
      this.handleCallRollSizeChange()
      this.showDetail = true
    },
    // 导航到布置作业界面
    handleDeployHomework(row) {
      this.$router.push({
        path: '/classService/preparation',
        query: {
          courseTimeId: row.id
        }
      })
    },
    handleTabChange(val) {
      switch (val.name) {
        case '0':
          this.handleCallRollSizeChange()
          break
        case '1':
          this._getCourseFile()
          break
        case '2':
          this._getHomeWork()
          break
        case '3':
          this.workDetail = null
          this._getStudentWork()
          break
      }
    },
    handleCallRollSizeChange() {
      this.callRollPageNum = 1
      this._getCallRollRecord()
    },
    handleCallRollStatusChange(val) {
      if (this.callRollStatus.includes(val)) {
        this.callRollStatus = []
      } else {
        this.callRollStatus = [val]
      }
      this.handleCallRollSizeChange()
    },
    // 新增或编辑教师点评 type=0新增，type=1编辑
    handleAddOrEditHomeWorkComment(data, type) {
      this.teacherCommentForm.commentAttachment = []
      if (type === 0) {
        this.teacherCommentFormTitle = '新增点评'
      } else {
        this.teacherCommentFormTitle = '编辑点评'
      }

      this.teacherCommentForm.id = data.id
      this.teacherCommentForm.commentContent = data.commentContent
      if (data.commentAttachment && data.commentAttachment.length > 0) {
        data.commentAttachment.forEach(item => {
          this.teacherCommentForm.commentAttachment.push(item)
        })
      }
      this.commentDialogVisible = true
    },
    updateHomeWorkContent() {
      // 删除文件后，更新数据
      // console.log(this.teacherCommentForm)
    },
    // 提交教师点评
    handleUploadTeacherComment() {
      this.teacherCommentSubmitLoading = true
      this.$refs.teacherCommentForm.validate(valid => {
        if (valid) {
          const param = {
            id: this.teacherCommentForm.id,
            commentContent: this.teacherCommentForm.commentContent,
            commentAttachment: this.teacherCommentForm.commentAttachment && this.teacherCommentForm.commentAttachment.length > 0 ? JSON.stringify(this.teacherCommentForm.commentAttachment) : null
          }
          this.$http.put('/v1/UploadHomework/updateUploadHomework', param).then(res => {
            if (this.uploadCommentType === 0) {
              this.$message.success('新增点评成功')
            } else {
              this.$message.success('编辑点评成功')
            }
            // 变更数据
            this.workDetail.commentContent = this.teacherCommentForm.commentContent
            this.workDetail.commentAttachment = this.teacherCommentForm.commentAttachment
            this.commentDialogVisible = false
          }).finally(() => {
            this.teacherCommentSubmitLoading = false
          })
        }
      })
    },
    // 处理弹出框图片或视频预览问题，与下面的方法有点点区别
    previewFile(index) {
      let res = []
      this.teacherCommentForm.commentAttachment.forEach((item, i) => {
        if (item.type === 1) {
          let autoplay = false
          if (i === index) autoplay = true
          res.push({
            html: `<video src="${item.src}" poster="${item.thumb}" ${autoplay ? 'autoplay' : ''} controls width="800" height="600"></video>`
          })
        } else {
          res.push({
            src: item.src || item
          })
        }
      })
      this.imgs = res
      this.$refs.photoPreview.show(index)
    },
    // 图片预览
    preview(imgs, index) {
      let res = []
      imgs.forEach((item, i) => {
        if (item.type === 1) {
          let autoplay = false
          if (i === index) autoplay = true
          res.push({
            html: `<video src="${item.src}" poster="${item.thumb}" ${autoplay ? 'autoplay' : ''} controls width="800" height="600"></video>`
          })
        } else {
          res.push({
            src: item.src || item
          })
        }
      })
      this.imgs = res
      this.$refs.photoPreview.show(index)
    },
    // 预览图发生变化
    handlePreviewChange({ currentIndex }) {
      // const items = this.$refs.photoPreview.photoswipe.items
      // for (let i = 0; i < items.length; i++) {
      //   const item = items[i]
      //   const videoEl = item.container.querySelector('video')
      //   if (videoEl) {
      //     i === currentIndex ? videoEl.play() : videoEl.pause()
      //   }
      // }
    },
    // 关闭预览
    handlePreviewClose() {
      const elList = this.$refs.photoPreview.photoswipe.container.querySelectorAll('video')
      for (let i = 0; i < elList.length; i++) {
        elList[i].pause()
      }
    },
    // 文件上传前
    handleBeforeUpload(file) {
      let fileType = path.extname(file.name)
      fileType = fileType.split('.')[1]
      const isFile = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileType.toLowerCase())
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isFile) {
        this.$message.error('上传文件只支持Word、Excel、PPT文件！')
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
      }
      return isFile && isLt10M
    },
    // 上传成功后
    handleSuccessFile(res) {
      if (res.code === '000000' && res.data.length > 0) {
        this.tabLoading = true
        const file = res.data[0]
        this.$http.post('/v1/Attachment/addAttachment', {
          courseTimeId: this.selectedRecord.id,
          name: file.fileName,
          downloadAddress: file.downloadPath,
          size: file.size,
          type: file.type
        }).then(res => {
          this.courseFiles.push({
            id: res.data,
            name: file.fileName,
            url: file.downloadPath
          })
          this.$message.success('上传课堂附件成功')
        }).finally(() => {
          this.tabLoading = false
        })
      } else {
        this.$message.error('上传文件失败！')
      }
    },
    // 删除文件
    handleRemoveFile(file) {
      if (file.id) {
        this.tabLoading = true
        this.$http.delete('/v1/Attachment/deleteById/' + file.id).then(() => {
          this.$message.success('删除课堂附件成功！')
          const index = this.courseFiles.findIndex(o => o.id === file.id)
          if (index > -1) this.courseFiles.splice(index, 1)
        }).finally(() => {
          this.tabLoading = false
        })
      }
    },
    // 预览文件
    handlePreviewFile(file) {
      saveAs(file.url, file.name)
    },
    // 切换学生的作业内容
    handleWorkRowChange(row, col) {
      if (row.uploadStatus > 0) {
        this.$http.get('/v1/UploadHomework/getByStudentIdAndCourseTimeId', {
          courseTimeId: row.courseTimeId,
          studentId: row.id
        }).then(res => {
          if (res.data && res.data.length > 0) {
            res.data.forEach(item => {
              item.replyAtlas = item.replyAtlas ? item.replyAtlas.split(';') : []
              if (item.commentAttachment) {
                item.commentAttachment = JSON.parse(item.commentAttachment)
              }
            })
            this.workDetail = res.data[0]
          }
        })
      } else {
        this.workDetail = null
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.homework-list
  .homeword-item+.homeword-item
    margin-top 16px
  .top-title
    height 40px
    display flex
    justify-content space-between
    align-items center
    border-bottom 1px dashed $color-border-1
    .left
      color $color-text-1
    .right
      flex-shrink 0
      font-size 13px
      margin-left 12px
      span
        color $color-warning

.question-list
  padding 12px 16px
  margin-top 0px
  .content
    line-height 1.6

.student-work-wrapper
  .wrapper
    display flex
    justify-content space-between
    .work-list
      width 38%
      height 650px
      border 1px solid $color-border-2
    .work-detail
      width 60%
      height 650px
      border 1px solid $color-border-2
      overflow-x auto
      .title
        font-size 16px
        font-weight bold
        margin-bottom 10px
        color $color-primary
        border-bottom 1px dashed $color-primary
      .teacher-comment
        min-height 100px
        padding-top 15px
        margin-top 10px
      .not-data
        color $color-text-3
        margin-top 80px
        text-align center
      .homework-img-list
        margin-top 10px
        display flex
        flex-flow wrap
        li
          width 100px
          height 100px
          line-height 100px
          text-align center
          margin-right 12px
          margin-bottom 12px
          border 1px solid $color-border-2
          border-radius 3px
          color $color-text-3
          position relative
          img
            border-radius 3px
        .img-msk-item
          position absolute
          top 0
          left 0
          bottom 0
          right 0
          z-index 5
          text-align center
          background rgba(0, 0, 0, 0.3)
          .btn-play
            font-size 18px
            padding 6px
          .empty-panel
            width 100%

.tip
  font-size 13px
  color $color-text-3
  margin-bottom 6px

.img-list
  margin-top 10px
  li
    width 100px
    height 100px
    line-height 100px
    text-align center
    margin-right 12px
    margin-bottom 12px
    border 1px solid $color-border-2
    border-radius 3px
    color $color-text-3
    position relative
    float left
    img
      border-radius 3px
  .img-msk
    position absolute
    top 0
    left 0
    bottom 0
    right 0
    z-index 5
    text-align center
    background rgba(0, 0, 0, 0.3)
    .btn-play
      font-size 18px
      padding 6px
</style>

<style lang="stylus">
.class-record-detail-dialog
  .el-dialog__body
    padding-top 0
  .el-tabs__header
    padding-left 0
    padding-right 0
.showTableData
  background #fff
  padding 14px
</style>

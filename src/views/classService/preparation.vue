<template>
  <div>
    <div class="query-form">
      <div style="margin-bottom:10px;">
        <el-alert
          description="批量布置作业操作需在下面的列表中选中指定行后方可批量布置作业，否则【批量布置作业】按钮会处于禁用状态。"
          type="warning">
        </el-alert>
      </div>
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
      <el-button type="primary" size="small" :disabled="addBtnDisable" @click="showDetail = true" style="float:right;" icon="el-icon-edit">批量布置作业</el-button>
    </div>
    <div class="showTableData">
      <el-table
        ref="table"
        :data="timetableList"
        @selection-change="handleSelectionChange"
        v-loading="queryLoading">
        <template slot="empty">
          <!-- <empty-data></empty-data> -->
          <!-- <loading-view></loading-view> -->
        </template>
        <el-table-column
          type="selection"
          :selectable="handleEnableClear"
          width="55">
        </el-table-column>
        <el-table-column
          prop="courseTimeStr"
          label="上课时间"
          width="210"
          align="center">
        </el-table-column>
        <el-table-column
          prop="className"
          label="班级/学员"
          width="120"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.className || scope.row.oneStudentName + '(学员)'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="courseName"
          label="课程"
          width="120"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.courseName || scope.row.oneCourseName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="teacherName"
          label="任课老师"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          prop="classRoomName"
          label="教室"
          width="120"
          align="center">
        </el-table-column>
        <el-table-column
          prop="attachmentName"
          label="课堂附件">
          <template slot-scope="scope">
            <a v-if="scope.row.attachmentName" class="link" @click="downloadFile(scope.row.downloadAddress, scope.row.attachmentName)" title="下载附件">
              {{scope.row.attachmentName}}
              <i class="el-icon-circle-close" title="删除附件" @click.stop="removeFile(scope.row.attachmentId, scope.row.attachmentName)"/>
            </a>
            <el-button v-else type="text" size="mini" @click="uploadFile(scope.row)">上传附件</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="homeworkName"
          label="课后作业"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <a v-if="scope.row.homeworkName" class="link" title="查看课后作业" @click="handleOpenHomeWork(scope.row)">
              {{scope.row.homeworkName}}
              <i class="el-icon-circle-close" title="删除课后作业" @click.stop="removeHomeWork(scope.row.homeworkId, scope.row.homeworkName)"/>
            </a>
            <el-button v-else size="mini" type="text" @click="handleOpenHomeWork(scope.row)">布置作业</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getTimetableList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 作业布置 -->
    <el-dialog
      custom-class="custom-dialog"
      :visible.sync="showDetail"
      title="课后作业"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleDialogClose"
      width="580px">
      <el-form :model="homeWorkInfo" ref="homeWorkInfo" :rules="rules" label-width="78px">
        <el-form-item prop="name" label="作业标题">
          <el-input v-model="homeWorkInfo.name" :maxlength="30" show-word-limit placeholder="请填写作业名称" style="width: 220px;"/>
        </el-form-item>
        <el-form-item prop="endTime" label="提交时间">
           <el-date-picker
            v-model="homeWorkInfo.endTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择截止提交时间"
            :picker-options="{
              disabledDate: function (time) {
                return time.getTime() < Date.now()
              }
            }">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="message" label="作业内容">
          <el-input v-model="homeWorkInfo.message" type="textarea" :rows="8" show-word-limit placeholder="请填写作业内容" :maxlength="500"/>
        </el-form-item>
        <el-form-item prop="atlas" label="作业图片">
          <ul class="img-list">
            <li v-for="(item, index) in homeWorkInfo.atlas" :key="index" @click="preview(homeWorkInfo.atlas, index)">
              <img :src="item.thumb || item.url" width="100%" height="100%"/>
              <template v-if="item.type === 1">
                <div class="img-msk">
                  <el-button class="btn-play" @click.stop="preview(homeWorkInfo.atlas, index)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                </div>
              </template>
              <el-button class="btn-delete" icon="el-icon-delete" plain circle type="danger" @click.stop="deleteHomeWorkdAtlas(index)"/>
            </li>
            <li class="img-add" @click="uploadImage">
              <i class="el-icon-plus"/>
            </li>
          </ul>
        </el-form-item>
        <!-- 批量布置作业时需显示 -->
        <el-form-item v-if="selectedTableRows.length > 0" label="已选择">
          <el-tag v-for="item in selectedTableRows" :key="item.id" style="margin-right:10px;">{{item.courseName}}【{{item.className}}】【{{item.teacherName}}】</el-tag>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitHomeWork">提交</el-button>
      </template>
    </el-dialog>

    <input ref="fileInput" type="file" :accept="acceptType" @change="handleSelectFile" style="display: none;"/>

    <!-- 图片预览 -->
    <photo-preview ref="photoPreview" :list="imgs" @on-index-change="handlePreviewChange" @on-close="handlePreviewClose"></photo-preview>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import PhotoPreview from '../../components/PhotoPreview'
// import EmptyData from '../../components/EmptyData'
// import LoadingView from '../../components/LoadingView'

import { mapGetters } from 'vuex'
import moment from 'moment'
import { saveAs } from 'file-saver'
import * as qiniu from '../../utils/qiniuPlugin'

const MAX_VIDEO_DURATION = 2 * 60

moment.locale('zh-cn')
export default {
  data() {
    return {
      queryLoading: false,
      classLoading: false,
      courseLoading: false,
      teacherLoading: false,
      submitLoading: false,
      showDetail: false,
      acceptType: '.doc, .docx, .ppt, .pptx, .xls, .xlsx',
      dateOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', [new Date(), new Date()])
            }
          },
          {
            text: '明天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() + 3600 * 1000 * 24 * 3)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      uploadUrl: process.env.VUE_APP_UPLOAD_URL,
      queryForm: {
        id: null,
        dateRange: [],
        classId: '',
        classroomId: '',
        courseId: '',
        teacherId: ''
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      timetableList: [],
      teacherList: [],
      classList: [],
      courseList: [],
      homeWorkInfo: {
        id: null,
        name: '',
        endTime: '',
        message: '',
        atlas: [],
        atlasTemp: []
      }, // 课后作业详情
      rules: {
        name: { required: true, message: '请填写作业标题', trigger: 'blur' },
        endTime: { required: true, message: '请选择作业提交的截止时间', trigger: 'blur' },
        message: { required: true, message: '请填写作业内容', trigger: 'blur' },
        atlas: { required: true, type: 'array', message: '请选择作业图集', trigger: 'blur' }
      },
      addBtnDisable: true,
      selectedTableRows: [], // 已选中的表格的行数据
      imgs: [] // 预览的图集
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'currentBranch'
    ])
  },
  components: {
    InlineSelect, PhotoPreview //, LoadingView
  },
  created() {
    this._getClassList()
    this.queryForm.dateRange = [moment().format('YYYY-MM-DD'), moment().add(3, 'days').format('YYYY-MM-DD')]
    this.queryForm.classId = this.$route.query.classId
    this.queryForm.id = this.$route.query.courseTimeId // 获取从上课记录界面导航过来的排课ID

    // 默认当前老师
    // if (this.userInfo.userLogo) {
    //   this.queryForm.teacherId = this.userInfo.id
    //   this._getTeacherList()
    // }

    this._getTimetableList()
  },
  methods: {
    // 获取上课记录
    _getTimetableList() {
      this.queryLoading = true
      const params = Object.assign({}, this.queryForm)
      if (params.dateRange && params.dateRange.length > 0) {
        params.startDate = params.dateRange[0]
        params.endDate = params.dateRange[1]
      }
      delete params.dateRange
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      this.$http.get('/v1/CourseTable/getCourseTimeByTeacherId/' + this.currentBranch.id, params).then(res => {
        res.data.forEach(item => {
          item.courseTimeStr = moment(item.goToClassDate).format('YYYY-MM-DD') + ' ' +
                               moment(item.goToClassDate).format('dddd') + ' ' +
                               moment('2019-09-03 ' + item.goToClassStartTime).format('HH:mm') + '~' +
                               moment('2019-09-03 ' + item.goToClassEndTime).format('HH:mm')

          if (item.attachmentInfos && item.attachmentInfos.length > 0) {
            item.attachmentId = item.attachmentInfos[0].id
            item.attachmentName = item.attachmentInfos[0].name
            item.downloadAddress = item.attachmentInfos[0].downloadAddress
          }
          if (item.homeworkInfos && item.homeworkInfos.length > 0) {
            item.homeworkId = item.homeworkInfos[0].id
            item.homeworkName = item.homeworkInfos[0].name
          }
        })
        this.timetableList = res.data
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
      this.$http.get('/v1/Class/getClassList', { departmentId: this.currentBranch.id }).then(res => {
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
    query() {
      this.pageNum = 1
      this._getTimetableList()
    },
    reset() {
      this.queryForm = {
        dateRange: [moment().format('YYYY-MM-DD'), moment().add(3, 'days').format('YYYY-MM-DD')],
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
    // 上传文件
    uploadFile(row) {
      this.selectedTimetableId = row.id
      this.acceptType = '.doc, .docx, .ppt, .pptx, .xls, .xlsx'
      this.$confirm('只能上传.doc, .docx, .ppt, .pptx, .xls, .xlsx文件，且不超过10M', '提示').then(() => {
        this.$refs.fileInput.click()
      })
    },
    // 下载文件
    downloadFile(url, name) {
      saveAs(url, name)
    },
    // 删除文件
    removeFile(id, name) {
      this.$confirm('是否确定删除课堂附件【' + name + '】？', '提示').then(() => {
        this.queryLoading = true
        this.$http.delete('/v1/Attachment/deleteById/' + id).then(() => {
          this.$message.success('删除课堂附件成功！')
          this._getTimetableList()
        }).finally(() => {
          this.queryLoading = false
        })
      })
    },
    uploadImage() {
      this.acceptType = 'image/*, video/*'
      setTimeout(() => {
        this.$refs.fileInput.click()
      }, 120)
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
     * 获取视频信息
     */
    getVideoInfo(videoFile, maxSize = MAX_VIDEO_DURATION) {
      return new Promise((resolve, reject) => {
        const videoUrl = window.URL.createObjectURL(videoFile)
        const videoEl = document.createElement('video')
        videoEl.autoplay = true
        videoEl.muted = true
        videoEl.src = videoUrl
        const _self = this
        const info = {}
        videoEl.addEventListener('loadeddata', function(e) {
          info.duration = videoEl.duration
          if (videoEl.duration > maxSize) {
            videoEl.src = ''
            resolve(info)
            return
          }
          if (info.thumb) {
            videoEl.src = ''
            resolve(info)
            return
          }
          var canvas = document.createElement('canvas')
          canvas.width = e.target.videoWidth || window.innerWidth
          canvas.height = e.target.videoHeight || window.innerHeight
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
        })
      })
    },
    async handleSelectFile(event) {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return

      const file = files[0]
      let videoInfo = {}
      // 上传前判断
      if (file.type.indexOf('image') === 0) {
        // 上传限制判断
        if (file.size / 1024 / 1024 > 1) {
          this.$message.error('作业图集不能超过1M')
          this.$refs.fileInput.value = ''
          return
        }
      } else if (file.type.indexOf('video') === 0) {
        // 上传视频
        videoInfo = await this.getVideoInfo(file)
        if (videoInfo.duration > MAX_VIDEO_DURATION) {
          this.$message.error('视频长度不能超过2分钟')
          this.$refs.fileInput.value = ''
          return
        }
      } else {
        // 上传文件
        if (file.size / 1024 / 1024 > 10) {
          this.$message.error('课堂附件不能超过10M')
          this.$refs.fileInput.value = ''
          return
        }
      }

      // 上传文件
      const loading = this.$loading({
        lock: true,
        text: '上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        if (file.type.indexOf('image') === 0) {
          // 上传家庭作业的图片
          const res = await this.$http.upload(file, true)
          this.homeWorkInfo.atlas.push({
            url: res.tempUrl,
            src: res.src
          })
          this.uploadHomeWorkContent()
        } else if (file.type.indexOf('video') === 0) {
          // 上传家庭作业的视频
          const resUrl = await qiniu.uploadFile(file, file.name, 3 * 60 * 1000)
          this.homeWorkInfo.atlas.push({
            thumb: videoInfo.thumb,
            src: resUrl,
            type: 1
          })
          this.uploadHomeWorkContent()
        } else {
          // 上传其他文档
          const res = await this.$http.upload(file, false)
          // 上传附件
          await this.$http.post('/v1/Attachment/addAttachment', {
            courseTimeId: this.selectedTimetableId,
            name: res.fileName,
            downloadAddress: res.downloadPath,
            size: res.fileSize,
            type: res.fileType
          })
          this.$message.success('上传附件成功！')
          this._getTimetableList()
        }
      } catch (error) {
      }
      loading.close()
      // 重置为空
      this.$refs.fileInput.value = ''
    },
    removeHomeWork(id, name) {
      this.$confirm('是否确定删除课后作业【' + name + '】？', '提示').then(() => {
        this.queryLoading = true
        this.$http.delete('/v1/Homework/delete/' + id).then(() => {
          this.$message.success('删除课后作业成功！')
          this._getTimetableList()
        }).finally(() => {
          this.queryLoading = false
        })
      })
    },
    // 是否可以选中方法
    handleEnableClear(row) {
      if (!row.homeworkId) {
        return true
      } else {
        return false
      }
    },
    // 批量选择排课并弹出新增作业
    handleSelectionChange(rows) {
      let tmpAddBtnDisable = false
      this.selectedTableRows = []
      if (rows && rows.length > 0) {
        if (rows.length > 1) {
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].courseId !== rows[0].courseId) {
              tmpAddBtnDisable = true
              break
            }
          }
          if (!tmpAddBtnDisable) { // 不是同一课程批量布置作业时，提示用户，否则不需要提醒用户
            this.selectedTableRows = this.selectedTableRows.concat(rows)
            this.addBtnDisable = false
          } else {
            this.$confirm(`已选择的课程存在不属于同种课程, 是否继续?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.selectedTableRows = this.selectedTableRows.concat(rows)
              this.addBtnDisable = false
            }).catch(() => {
              this.$refs.table.clearSelection()
              this.selectedTableRows = []
              this.addBtnDisable = true
            })
          }
        } else {
          this.selectedTableRows = this.selectedTableRows.concat(rows)
          this.addBtnDisable = false
        }
      } else {
        this.addBtnDisable = true
      }
    },
    // 关闭批量新增作业弹出框
    handleDialogClose() {
      if (this.selectedTableRows.length > 0) {
        this.addBtnDisable = true
        this.selectedTableRows = []
        this.$refs.table.clearSelection()
      }
      this.showDetail = false
    },
    handleOpenHomeWork(row) {
      this.showDetail = true
      this.selectedTimetableId = row.id
      this.selectedCourseName = row.courseName
      // 先重置数据
      this.homeWorkInfo = {
        id: null,
        name: '',
        endTime: '',
        message: '',
        atlas: []
      }
      if (row.homeworkId) {
        this.submitLoading = true
        this.$http.get('/v1/Homework/getHomeworkById', {
          id: row.homeworkId
        }).then(res => {
          // 只取一个
          if (res.data) {
            const item = res.data
            if (typeof item.content === 'string') {
              try {
                item.content = JSON.parse(item.content)
              } catch (error) {
                item.content = {
                  message: '',
                  atlas: []
                }
              }
            }

            if (typeof item.content.atlas === 'string') {
              item.content = item.content.atlas.split(';').map(o => { return { type: 0, src: o, url: o } })
            } else {
              item.content.atlas.forEach(item => {
                item.url = item.src
              })
            }
            this.homeWorkInfo.id = item.id
            this.homeWorkInfo.name = item.name
            this.homeWorkInfo.endTime = item.endTime
            this.homeWorkInfo.message = item.content.message
            this.homeWorkInfo.atlas = item.content.atlas
          }
        }).finally(() => {
          this.submitLoading = false
        })
      }
    },
    // 重置表单
    resetHomeworkForm() {
      this.homeWorkInfo = {
        id: null,
        name: null,
        endTime: null,
        message: null,
        atlas: [],
        atlasTemp: []
      }
    },
    submitHomeWork() {
      this.$refs.homeWorkInfo.validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.selectedTableRows.length > 0) { // 只要选中的行大于0，那么说明是批量布置作业
            const param = Object.assign({}, this.homeWorkInfo)
            param.content = JSON.stringify({
              message: param.message,
              atlas: param.atlas.map(o => {
                if (o.type === 1) {
                  return {
                    type: o.type,
                    thumb: o.thumb,
                    src: o.src
                  }
                } else {
                  return {
                    type: o.type,
                    src: o.src
                  }
                }
              })
            })
            delete param.message
            delete param.atlas
            param.uploadStatus = 1
            param.startTime = moment().format('YYYY-MM-DD HH:mm:ss')
            const params = []
            this.selectedTableRows.forEach(item => {
              param.courseTimeId = item.id
              param.belongCourseName = item.courseName
              params.push({
                name: param.name,
                belongCourseName: item.courseName,
                content: param.content,
                courseTimeId: item.id,
                endTime: param.endTime,
                startTime: param.startTime,
                uploadStatus: param.uploadStatus
              })
            })
            // 执行网络请求操作
            this.$http.post(`/v1/Homework/addHomeworks?organizationId=${this.userInfo.organizationId}&departmentId=${this.currentBranch.id}`, params).then(res => {
              this.$message.success('批量布置作业成功')
              this.addBtnDisable = true
              this.selectedTableRows = []
              this.$refs.table.clearSelection()
              this.showDetail = false
              this.resetHomeworkForm()
              this._getTimetableList()
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            const params = Object.assign({}, this.homeWorkInfo)
            params.content = JSON.stringify({
              message: params.message,
              atlas: params.atlas.map(o => {
                if (o.type === 1) {
                  return {
                    type: o.type,
                    thumb: o.thumb,
                    src: o.src
                  }
                } else {
                  return {
                    type: o.type,
                    src: o.src
                  }
                }
              })
            })
            delete params.message
            delete params.atlas
            if (params.id) {
              // 修改
              this.$http.put('/v1/Homework/updateHomework', params).then(() => {
                this.$message.success('修改作业成功！')
                this._getTimetableList()
                this.showDetail = false
                this.resetHomeworkForm()
              }).finally(() => {
                this.submitLoading = false
              })
            } else {
              // 新增
              params.uploadStatus = 1
              params.courseTimeId = this.selectedTimetableId
              params.belongCourseName = this.selectedCourseName
              params.startTime = moment().format('YYYY-MM-DD HH:mm:ss')
              this.$http.post('/v1/Homework/addHomework', params).then(() => {
                this.$message.success('布置作业成功！')
                this._getTimetableList()
                this.resetHomeworkForm()
                this.showDetail = false
              }).finally(() => {
                this.submitLoading = false
              })
            }
          }
        }
      })
    },
    // 文件上传前
    handleBeforeUpload(file) {
      let isImage = file.type.indexOf('image/') > -1
      const isLt10M = file.size / 1024 / 1024 < 1

      if (!isImage) {
        this.$message.error('上传文件只支持图片文件！')
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 1MB!')
      }
      return isImage && isLt10M
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
            src: item.src
          })
        }
      })
      this.imgs = res
      this.$refs.photoPreview.show(index)
    },
    // 预览图发生变化
    handlePreviewChange({ currentIndex }) {
      const items = this.$refs.photoPreview.photoswipe.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const videoEl = item.container.querySelector('video')
        if (videoEl) {
          i === currentIndex ? videoEl.play() : videoEl.pause()
        }
      }
    },
    // 关闭预览
    handlePreviewClose() {
      const elList = this.$refs.photoPreview.photoswipe.container.querySelectorAll('video')
      for (let i = 0; i < elList.length; i++) {
        elList[i].pause()
      }
    },
    uploadHomeWorkContent() {
      if (this.homeWorkInfo == null || this.homeWorkInfo.id == null) return
      // 删除文件后，更新数据
      const atlas = this.homeWorkInfo.atlas.map(o => {
        if (o.type === 1) {
          return {
            type: o.type,
            thumb: o.thumb,
            src: o.src
          }
        } else {
          return {
            type: o.type,
            src: o.src
          }
        }
      })
      let params = {
        id: this.homeWorkInfo.id,
        content: {
          'message': this.message,
          'atlas': atlas
        }
      }
      params.content = JSON.stringify(params.content)
      this.$http.put('/v1/Homework/updateHomework', params)
    },
    deleteHomeWorkdAtlas(index) {
      this.$confirm('确定删除该文件？', '提示').then(() => {
        const item = this.homeWorkInfo.atlas[index]
        this.$http.delete('/v1/Qiniu/delete', {
          fileName: item && item.src
        }).then(() => {
          // 删除附件成功
          this.homeWorkInfo.atlas.splice(index, 1)
          this.uploadHomeWorkContent()
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.link
  color #409EFF
  .el-icon-circle-close
    display none
    margin-left 12px
    padding-right 6px
    font-size 16px
    vertical-align middle
  &:hover
    .el-icon-circle-close
      display inline-block

.question-list
  padding 12px 16px
  margin-top 16px
  .content
    line-height 1.6
  img
    width 100px
    height 100px
    margin-top 12px
    margin-right 12px
    cursor pointer

.img-list
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
    float left
    cursor pointer
    position relative
    img
      border-radius 3px
    .btn-delete
      position absolute
      top 0
      right 0
      transform translate(25%, -25%)
      z-index 999
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
  .img-add
    border-style dashed
    font-size 32px
    &:hover
      border-color $color-primary
.showTableData
  background #fff
  padding 14px
</style>

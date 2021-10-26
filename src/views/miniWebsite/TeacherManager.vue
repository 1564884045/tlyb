<!-- 优秀教师管理 -->
<template>
  <div class="container">
    <div class="query-form">
      <div style="float: left;border: 1px solid #ffffff">
        <el-checkbox :disabled="!tableLoading ? false : true" v-model="available" @change="query">仅查看有效</el-checkbox>
      </div>
      <div>
        <!-- <el-button type="text" :disabled="!tableLoading ? false : true" @click="reset" size="medium">重 置</el-button> -->
        <el-button style="float: right;margin-right: 14px" type="primary" @click="openAddTeacherInfoDialog(0)" icon="el-icon-plus">新增</el-button>
      </div>
    </div>
    <div style="margin-top: 10px; background-color: #fff; padding: 15px">
      <el-table :data="tableDatas" style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="name" label="姓名" width="80" fixed="left"></el-table-column>
        <el-table-column prop="avator" label="头像" width="120" align="center">
          <template slot-scope="scope">
            <img v-if="scope.row.avator" width="80" height="40" :src="scope.row.avator" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别" align="center" width="60">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sex == 2" type="primary">女</el-tag>
            <el-tag v-if="scope.row.sex == 1" type="warning">男</el-tag>
            <el-tag v-if="scope.row.sex == 0" type="danger">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="false" prop="resources" label="资源链接" align="center" width="100">
          <template slot-scope="scope">{{scope.row.resources}}</template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" align="center" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.phone">{{scope.row.phone}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" :show-overflow-tooltip="true" width="160">
        </el-table-column>
        <el-table-column prop="edu" label="毕业院校" :show-overflow-tooltip="true" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.edu">{{scope.row.edu}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column class="profile" prop="profile" :show-overflow-tooltip="true" label="简介">
          <template slot-scope="scope">
            <span v-if="scope.row.profile">{{scope.row.profile}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" align="center" width="60"></el-table-column>
        <el-table-column prop="shareCount" label="分享量" align="center" width="60"></el-table-column>
        <el-table-column prop="available" label="是否有效" align="center" width="100">
          <template slot-scope="scope">
            <el-switch class="el-switch-cutomer1" @click.native="updateMiniWebsiteTeacher(scope.row)" :value="scope.row.available" :width="55" size="mini" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openAddTeacherInfoDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click="addExperience(scope.row)">新增经历</el-button>
            <el-button type="text" size="mini" @click="deleteTeacherInfo(scope.row)">删除</el-button>
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
        :total="queryParam.total"
        style="margin-top: 10px;"
      ></el-pagination>
    </div>
    <el-dialog :title="formData.id ? '编辑数据' : '新增数据'" :visible.sync="dialogVisible" width="600px" custom-class="custom-dialog" :close-on-press-escape="false" @close="shutDialog" :close-on-click-modal="false">
      <el-form :model="formData" ref="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="teacherId">
          <el-select v-model="formData.teacherId" :loading="getTeacherIdListLoading" filterable placeholder="请选择或输入搜索" @change="setTeacherId" @focus="_getTeacherList">
            <el-option v-for="item in teacherList" :key="item.id" :label="item.username" :value="item.id">
              <span style="float: left">{{ item.username }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avator">
          <el-upload
            :action="imgUploadPath"
            accept="image/*"
            list-type="picture-card"
            :show-file-list="true"
            :limit="1"
            :file-list="formData.imgList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" style="color:#409EFF;">建议大小：2M以内</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="false" prop="sex" label="性别">
          <el-radio-group v-model="formData.sex">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="formData.phone" maxlength="11" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="edu" label="毕业院校">
          <el-input v-model="formData.edu" maxlength="20" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <el-input v-model="formData.content" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="profile">
          <el-input v-model="formData.profile" type="textarea" rows="5" maxlength="120" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shutDialog">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="open">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 新增经历 -->
    <el-drawer
      title="教育经历"
      style="borderL: 1px solid red"
      :close-on-press-escape="false"
      :wrapperClosable="false"
      direction="rtl"
      :show-close="true"
      size="600px"
      :visible.sync="experienceDrawer"
      :with-header="false">
      <div>
        <div class="experience-drawer" v-loading="drawerLoading">
          <div class="stu-info-wrapper" v-if="teacherInfo">
            <div class="base-info" style="background-color:#fff">
              <img class="left" :src="teacherInfo.avator" alt=""/>
              <div class="right">
                <p class="stu-name">
                  <label>{{teacherInfo.name}}
                    <i v-if="teacherInfo.sex === 0" class="el-icon-question"></i>
                    <i v-if="teacherInfo.sex === 1" class="el-icon-male"></i>
                    <i v-if="teacherInfo.sex === 2" class="el-icon-female"></i>
                  </label>
                </p>
                <p class="item">
                  <label class="phone"><i class="el-icon-phone"></i>电话</label>
                  <label class="content">{{teacherInfo.phone || '暂无'}}</label>
                </p>
                <p class="item">
                  <label class="school"><i class="el-icon-school"></i>学校</label>
                  <label class="content">{{teacherInfo.edu || '暂无'}}</label>
                </p>
                <!-- <p class="item">
                  <label class="title"><i class="el-icon-school"></i>简历</label>
                  <label class="content">{{teacherInfo.profile || '暂无'}}</label>
                </p> -->
              </div>
            </div>
          </div>
          <!-- 时间线 -->
          <div class="time-line-list">
            <el-timeline v-if="teacherExperiencedDetails.length > 0">
              <el-timeline-item
                v-for="item in teacherExperiencedDetails"
                :key="item.id"
                :timestamp="item.createAt"
                :color="item.color"
                :icon="item.icon"
                size="large"
                placement="top">
                <el-card shadow="hover">
                  <p class="desc">{{item.content}}</p>
                  <div class="icon">
                    <el-button type="success" @click="handleEditExperience(item)" icon="el-icon-edit" circle></el-button>
                    <el-button type="primary" @click="handleDeleteExperience(item)" icon="el-icon-delete" circle></el-button>
                  </div>
                  <div v-if="item.resources && item.resources.length > 0">
                    <viewer :images="item.resources">
                      <img
                        v-for="src in item.resources"
                        :src="src.resourceUrl"
                        :key="src.id"
                        class="item-img"/>
                    </viewer>
                  </div>
                  <!-- <div v-if="item.videoUrl" class="video">
                    <div class="img-msk">
                      <el-button class="btn-play" @click.stop="handlePreviewOpen(item.videoUrl)" type="primary" icon="icon iconfont icon-play-solid" circle/>
                    </div>
                  </div> -->
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <empty-data v-else></empty-data>
          </div>
        </div>
        <div class="close-Drawer">
          <el-button @click="closeDrawer">关 闭</el-button>
          <el-button type="primary" :loading="submitLoading" @click="openAddExperience">添加经历</el-button>
        </div>
      </div>
    </el-drawer>
    <!-- 经历表单 -->
    <el-dialog :title="experienceForm.id ? '编辑经历数据' : '新增经历数据'" append-to-body :visible.sync="experienceDialogVisible" width="600px" custom-class="custom-dialog" :close-on-press-escape="false" @close="handleCloseExperienceForm" :close-on-click-modal="false">
      <el-form :model="experienceForm" ref="experienceForm" :rules="experienceRules" label-width="80px">
        <el-form-item label="姓名" prop="teacherId">
          <el-select v-model="experienceForm.teacherId" :disabled="experienceForm.teacherId ? true : false" :loading="getTeacherIdListLoading" filterable placeholder="请选择或输入搜索" @change="setExperienceTeacherId" @focus="_getTeacherList">
            <el-option v-for="item in teacherList" :key="item.id" :label="item.username" :value="item.id">
              <span style="float: left">{{ item.username }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教育经历" prop="content">
          <el-input v-model="experienceForm.content" type="textarea" rows="4" maxlength="120" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图集" prop="imgList">
          <el-upload
            :action="imgUploadPath"
            accept="image/*"
            list-type="picture-card"
            :show-file-list="true"
            :limit="9"
            :file-list="experienceForm.imgList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadExperienceSuccess"
            :on-remove="handleRemoveExperienceImg">
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" style="color:#409EFF;">建议大小：2M以内，建议张数：最多9张（375*160）</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseExperienceForm">取 消</el-button>
        <el-button type="primary" :loading="submitExperienceLoading" @click="handleSubmitExperience">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DefaultThemeBg from '@/assets/cover/paper.jpg'
import EmptyData from '@/components/EmptyData'
export default {
  name: 'MiniWebsiteTeacherManager',
  components: {
    EmptyData
  },
  data() {
    return {
      teacherList: [],
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      dialogVisible: false,
      tableLoading: false,
      experienceDialogVisible: false,
      submitLoading: false,
      experienceDrawer: false, // 经历
      getTeacherIdListLoading: false,
      submitExperienceLoading: false,
      available: false, // 查看有效数据
      drawerLoading: false, // 经历加载
      defaultThemeBg: DefaultThemeBg,
      tableDatas: [
        {
          avator: null, // 头像
          name: null, // 姓名
          sex: null, // 性别
          phone: null, // 电话
          edu: null, // 毕业院校
          profile: null, // 简介
          resources: [
            {
              resourceUrl: null, // 资源链接（图片或者视频）
              id: null
            }
          ],
          teacherId: null // 桃李云帮老师ID
        }
      ],
      formData: {
        avator: null,
        name: null,
        sex: 0,
        phone: null,
        content: null,
        available: true,
        edu: null,
        profile: null,
        resources: [
          {
            resourceUrl: null, // 资源链接（图片或者视频）
            id: null
          }
        ],
        teacherId: null, // 桃李云帮老师ID
        imgList: []
      },
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        teacherId: [{ required: true, message: '请选择教师', trigger: 'blur' }],
        avator: [{ required: true, message: '请上传头像', trigger: 'blur' }],
        content: [{ required: true, message: '请填写内容', trigger: 'blur' }],
        phone: [
          { required: true, message: '请填写正确的电话号码', trigger: 'blur' }
        ]
      },
      teacherInfo: null,
      teacherId: null,
      teacherExperiencedDetails: [],
      // 教育经历表单
      experienceForm: {
        id: null,
        content: null,
        imgList: [],
        teacherId: null // 桃李云帮老师ID
      },
      experienceQuery: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      experienceRules: {
        content: [{ required: true, message: '请填写教育经历', trigger: 'blur' }],
        imgList: [{ required: true, message: '请上传头像', trigger: 'blur' }]
      },
      experienceList: [] //
    }
  },
  // 生命周期 - 创建完成
  created() {
    this._getList()
    this._getTeacherList()
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  },
  // 相关方法
  methods: {
    handleCommand(command) {
      this.$message('click on item ' + command)
    },
    setTeacherId() {
      this.teacherList.forEach((item) => {
        if (item.id === this.formData.teacherId) {
          this.formData.name = item.username
          this.formData.sex = item.sex
          this.formData.phone = item.phone
          this.$refs.form.clearValidate()
        }
      })
    },
    _getTeacherList() {
      this.getTeacherIdListLoading = true
      this.$http
        .get(
          `/v1/User/getBranchTeacher/?departmentId=${this.currentBranch.id}&organizationId=${this.organizationInfo.id}`
        )
        .then((res) => {
          this.teacherList = res.data
        })
        .finally(() => {
          this.getTeacherIdListLoading = false
        })
    },
    query() {
      this._getList()
    },
    _getList() {
      this.tableLoading = true
      let param = {
        pageNum: this.queryParam.pageNum,
        pageSize: this.queryParam.pageSize,
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        available: this.available ? 1 : ''
      }
      this.$http
        .get('/v1/MiniWebsiteTeacher/getList', param)
        .then((res) => {
          this.tableDatas = res.data
          this.queryParam.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    openAddTeacherInfoDialog(item) {
      if (item) {
        this.formData = {
          avator: item.avator,
          name: item.name,
          sex: item.sex,
          phone: item.phone,
          available: item.available,
          edu: item.edu,
          content: item.content,
          profile: item.profile,
          resources: item.resources,
          teacherId: item.teacherId, // 桃李云帮老师ID
          id: item.id,
          imgList: []
        }
        if (item.avator !== '') {
          this.formData.imgList.push({ name: 'teacherAvatr', url: item.avator })
        }
      }
      this.dialogVisible = true
    },
    open() {
      if (this.formData.id) {
        this.updateMiniWebsiteTeacher(0)
      } else {
        this.handleAdd()
      }
    },
    // 新增数据
    handleAdd() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          let param = {
            avator: this.formData.avator,
            name: this.formData.name,
            sex: this.formData.sex,
            phone: this.formData.phone,
            available: 1,
            edu: this.formData.edu,
            content: this.formData.content,
            teacherId: this.formData.teacherId,
            profile: this.formData.profile,
            departmentId: this.currentBranch.id, // 所属分校ID
            organizationId: this.organizationInfo.id // 所属机构ID
          }
          this.$http
            .post('/v1/MiniWebsiteTeacher/addMiniWebsiteTeacher', param)
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
        }
      })
    },
    // 更新数据
    updateMiniWebsiteTeacher(item) {
      if (item) {
        if (
          new Date().getTime() - sessionStorage.getItem('frequently') <
          5000
        ) {
          this.$message({
            message: '请勿频繁操作,5秒后再试试',
            type: 'info'
          })
        } else {
          sessionStorage.setItem('frequently', new Date().getTime())
          let param = item
          param.available = item.available ? 0 : 1
          this.$http
            .put('/v1/MiniWebsiteTeacher/updateMiniWebsiteTeacher', param)
            .then((res) => {
              this.$message({
                message: '更新成功',
                type: 'success'
              })
              item.available = item.available ? 1 : 0
            })
            .catch(() => {
              item.available = item.available ? 0 : 1
            })
        }
      } else {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.submitLoading = true
            let param = {
              available: this.formData.available,
              school: this.formData.school,
              resources: this.formData.resources,
              teacherId: this.formData.teacherId, // 桃李云帮老师ID
              id: this.formData.id,
              avator: this.formData.avator,
              name: this.formData.name,
              sex: this.formData.sex,
              phone: this.formData.phone,
              edu: this.formData.edu,
              content: this.formData.content,
              profile: this.formData.profile
            }
            this.$http
              .put('/v1/MiniWebsiteTeacher/updateMiniWebsiteTeacher', param)
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
        })
      }
    },
    // 删除
    deleteTeacherInfo(item) {
      this.$confirm('此操作将删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete(`/v1/MiniWebsiteTeacher/updateValidById?id=${item.id}`)
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
        })
        .catch(() => {
        })
    },
    // 窗口关闭时清除数据
    shutDialog() {
      this.formData = {
        avator: null,
        name: null,
        sex: 0,
        phone: null,
        edu: null,
        content: null,
        profile: null,
        resources: [
          {
            resourceUrl: null, // 资源链接（图片或者视频）
            id: null
          }
        ],
        teacherId: null, // 桃李云帮老师ID
        imgList: []
      }
      this.dialogVisible = false
      // 关闭时清除表单校验
      this.$refs.form.clearValidate()
    },
    reset() {
      this.queryParam = {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
      this._getList()
    },
    handleSizeChange(val) {
      this.queryParam.pageSize = val
      this.query()
    },
    handlePageChange(val) {
      this.queryParam.pageNum = val
      this.query()
    },
    handleBeforeUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过2M!')
      }
      return isJPG && isLt2M
    },
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          if (!this.formData.avator) {
            this.formData.avator = ''
          }
          res.data.forEach((item) => {
            this.formData.avator = item.downloadPath
            // 处理回显数据
            this.formData.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.formData.avator = ''
      this.formData.imgList = fileList
    },
    // 教学经历
    handleUploadExperienceSuccess(res, file, fileList) {
      res.data.forEach(item => {
        this.experienceForm.imgList.push({ name: 'default.png', url: item.downloadPath })
      })
    },
    handleRemoveExperienceImg(file, fileList) {
      this.experienceForm.imgList = []
      fileList.forEach((item) => {
        this.experienceForm.imgList.push(item)
      })
    },
    // 新增经历
    addExperience(item) {
      console.log(item, '教师数据')
      this.teacherInfo = item
      this.experienceDrawer = true
      this.teacherId = item.teacherId
      this.experienceForm.teacherId = item.teacherId
      this._getTeacherExperiencedList(this.teacherId)
    },
    // 获取经历列表
    _getTeacherExperiencedList(teacherId) {
      this.drawerLoading = true
      this.$http.get(`/v1/MiniWebsiteTeacherEducationLine/getAllByTeacherId?teacherId=${teacherId}`).then(res => {
        console.log(res, '获取老师个人经历数据')
        this.teacherExperiencedDetails = res.data
        if (this.teacherExperiencedDetails && this.teacherExperiencedDetails.length > 0) {
          let index = 0
          this.teacherExperiencedDetails.forEach(item => {
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
        this.drawerLoading = false
      })
    },
    // 打开添加弹窗
    openAddExperience() {
      this.experienceDialogVisible = true
    },
    setExperienceTeacherId() {
      this.teacherList.forEach((item) => {
        if (item.id === this.experienceForm.teacherId) {
          this.experienceForm.name = item.username
        }
      })
    },
    // 编辑经历表单
    handleEditExperience(item) {
      console.log(item, '编辑时的数据')
      let imgList = item.resources.map(item => {
        item = {
          id: item.id,
          name: 'default.png',
          url: item.resourceUrl
        }
        return item
      })
      console.log(item.id)
      this.experienceForm = {
        id: item.id,
        content: item.content,
        imgList: imgList,
        teacherId: item.teacherId // 桃李云帮老师ID
      }
      this.experienceDialogVisible = true
    },
    // 删除经历数据
    handleDeleteExperience(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/MiniWebsiteTeacherEducationLine/updateValidById?id=${row.id}`).then(res => {
          this.$message({ type: 'success', message: '成功删除数据' })
          this._getTeacherExperiencedList(this.teacherId)
        })
      }).catch(() => {
      })
    },
    // 经历表单提交
    handleSubmitExperience() {
      this.$refs.experienceForm.validate((valid) => {
        if (valid) {
          this.submitExperienceLoading = true
          const param = {
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id,
            content: this.experienceForm.content,
            teacherId: this.experienceForm.teacherId,
            resources: []
          }
          param.resources = this.experienceForm.imgList.map(item => {
            item = {
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              resourceType: 0, // 资源类型（0：图片， 1：视频）
              resourceUrl: item.url, // 资源链接
              dataType: 2, // 数据类型：课程信息
              valid: 1 // 是否有效数据
            }
            return item
          })
          if (!this.experienceForm.id) { // 新增数据
            this.$http.post('/v1/MiniWebsiteTeacherEducationLine/addMiniWebsiteTeacherEducationLine', param).then(res => {
              this.$message({ type: 'success', message: '数据添加成功' })
              this._getTeacherExperiencedList(this.teacherId)
              this.handleCloseExperienceForm()
            }).finally(() => {
              this.submitExperienceLoading = false
            })
          } else { // 编辑数据
          // 处理编辑图片新增数据
            param.id = this.experienceForm.id
            let newResourcesData = []
            let x = 0
            this.experienceForm.imgList.forEach(item => {
              param.resources.forEach((val, index) => {
                if (val.resourceUrl === item.url) {
                  newResourcesData.push({ id: item.id, resourceUrl: item.url, organizationId: this.organizationInfo.id, departmentId: this.currentBranch.id })
                } else {
                  x++
                  if (x === param.resources.length) {
                    newResourcesData.push({ resourceUrl: val.url, organizationId: this.organizationInfo.id, departmentId: this.currentBranch.id })
                  }
                }
              })
            })
            param.resources = newResourcesData.filter(item => item.resourceUrl !== undefined)
            this.$http.put('/v1/MiniWebsiteTeacherEducationLine/updateMiniWebsiteTeacherEducationLine', param).then(res => {
              this.$message({ type: 'success', message: '数据更新成功' })
              this._getTeacherExperiencedList(this.teacherId)
              this.handleCloseExperienceForm()
            }).finally(() => {
              this.submitExperienceLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    // 关闭
    closeDrawer() {
      this.experienceDrawer = false
      this.teacherExperiencedDetails = []
    },
    // 经历表单重置
    handleCloseExperienceForm() {
      this.experienceDialogVisible = false
      this.experienceForm = {
        id: '',
        content: '',
        imgList: [],
        teacherId: this.teacherId
      }
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
>>>.el-dialog--center
  .el-dialog__footer
    text-align right
>>>.el-drawer
  position fixed
  top 0px
  right 0px
// 个人经历展示
.experience-drawer
  height 91vh
  overflow-y auto
  .stu-info-wrapper
    .base-info
      margin 0px 0px 10px 10px
      border-radius 5px
      padding 10px
      display flex
      justify-content fixed-start
      .left
        width 100px
        height 100px
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
          margin-top 10px
          i
            margin-right 4px
          .phone,.school
            margin-right 10px
          .content
            color rgba(0,0,0,0.8)
  .time-line-list
    background-color #ffffff
    width 90%
    margin 0 auto
    padding 10px 30px 10px 10px
    position relative
    .action-panel
      display flex
      justify-content flex-end
      border-bottom 1px dashed #eeeeee
    .el-timeline-item
      >>>.el-timeline-item__tail
        border-left 1px dashed red
      .item-img
        width 100px
        height 100px
        border 1px solid #eeeeee
        border-radius 12px
        margin 10px 20px 10px 0
        &:hover
          box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
      .desc
        margin-bottom 10px
        margin-top 10px
        color #708090
        letter-spacing 1px
      .icon
        display none
        position absolute
        top 30px
        right 10px
        .el-button--small.is-circle
          padding: 5px
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
      &:hover
        .icon
          display block
.close-Drawer
  display flex
  justify-content center
  margin-top 10px
@media screen and (min-width: 1300px)
  .container
    .experience-drawer
      height 93vh
</style>

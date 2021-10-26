<!-- 课程信息管理 -->
<template>
  <div class="container">
      <div class="query-form">
        <div style="float: left;border: 1px solid #ffffff">
          <el-checkbox :disabled="!tableLoading ? false : true" v-model="available" @change="query">仅查看有效</el-checkbox>
        </div>
        <div style="float: right">
          <el-button
          type="primary" @click="handleAdd" icon="el-icon-plus">新增</el-button>
        </div>
      </div>
      <div style="margin-top: 10px; background-color: #fff; padding: 15px">
        <el-table
          :data="tableDatas"
          v-loading="tableLoading"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="课程名称"
            :show-overflow-tooltip="true"
            width="120"
            >
          </el-table-column>
          <el-table-column
            prop="thumbnail"
            label="封面图"
            width="120"
            align="center"
            >
            <template slot-scope="scope">
              <img :src="scope.row.thumbnail" alt="" style="height: 42px; width: 80px ">
            </template>
          </el-table-column>
          <el-table-column
            prop="content"
            label="内容"
            :show-overflow-tooltip="true"
            width="160"
            >
          </el-table-column>
          <el-table-column
            prop="description"
            label="课程描述"
            :show-overflow-tooltip="true"
            >
            <template slot-scope="scope">
              <span v-if="scope.row.description">{{scope.row.description}}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="课程价格" width="140" align="center">
            <template slot-scope="scope">
              <span>￥{{scope.row.price}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rate" label="推荐指数" width="100" align="center"></el-table-column>
          <el-table-column prop="viewCount" label="浏览量" width="100" align="center"></el-table-column>
          <el-table-column prop="shareCount" label="分享量" width="100" align="center"></el-table-column>
          <el-table-column prop="available" label="是否有效" align="center" width="100">
            <template slot-scope="scope">
              <el-switch class="el-switch-cutomer1" @click.native="handleUpdateAvailable(scope.row)" :value="scope.row.available" :width="55" size="mini" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="160"
            fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog
      :title="formData.id ? '编辑数据': '新增数据'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      :close-on-press-escape="false"
      width="800px"
      @close="handleClose"
      >
      <el-form :model="formData" ref="form" :rules="rules" label-width="80px">
        <el-form-item label="关联课程" prop="courseId">
          <el-select
          v-model="formData.courseId"
          :multiple = "false"
          placeholder="请选择课程名称"
          @change="selectCourse"
          >
            <el-option
                v-for="item in courseList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图" prop="thumbnail">
          <div @click="upload(0)">
            <el-upload
              :action="imgUploadPath"
              accept="image/*"
              list-type="picture-card"
              :show-file-list="true"
              :limit="1"
              :file-list="formData.imgList"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemoveThumbnail">
              <i class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" style="color:#409EFF;">建议大小：2M以内（375*160）</div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item prop="name" label="课程名称">
          <el-input v-model="formData.name" rows="3" :disabled="formData.courseId ? true : false" maxlength="16" placeholder="请输入课程的名称" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="课程图片" prop="courseImgList">
          <div @click="upload(1)">
            <el-upload
              :action="imgUploadPath"
              accept="image/*"
              list-type="picture-card"
              :show-file-list="true"
              :limit="9"
              :file-list="formData.courseImgList"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemoveCourseImg">
              <i class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" style="color:#409EFF;">建议大小：2M以内，建议张数：最多9张（375*160）</div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item prop="price" label="课程价格">
          <el-input-number v-model="formData.price" :min="1" :max="1000000" label="请输入课程价格"></el-input-number>
        </el-form-item>
        <el-form-item prop="rate" label="推荐指数">
          <el-input-number v-model="formData.rate" :min="1" :max="10" label="请选择课程推荐指数"></el-input-number>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <el-input v-model="formData.content" type="textarea" rows="3" maxlength="120" placeholder="请输入课程的内容" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="description" label="课程描述">
          <el-input v-model="formData.description" type="textarea" rows="3" maxlength="120" placeholder="请输入课程的描述" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'MiniWebsiteTeacherManager',
  data() {
    return {
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      dialogVisible: false,
      tableLoading: false,
      submitLoading: false, // 提交数据
      tableDatas: [],
      courseList: [],
      available: false, // 查询条件
      formData: {
        id: null,
        uploadStatus: 0,
        rate: 6, // 课程推荐指数
        price: null,
        content: null,
        courseId: null, // 关联课程的id
        imgList: [], // 课程封面图
        courseImgList: [], // 课程图片
        thumbnail: null, // 课程封面地址
        name: null, // 课程名称
        description: null // 课程描述
      },
      rules: {
        thumbnail: [{ required: true, message: '请上传课程封面图片', trigger: 'blur' }],
        name: [{ required: true, message: '请输入课程的名称', trigger: 'blur' }],
        content: [{ required: true, message: '请输入课程的内容', trigger: 'blur' }],
        price: [{ required: true, message: '请输入课程价格', trigger: 'blur' }]
      },
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    this._getList()
    this._getCourseList() // 获取课程列表
  },
  computed: {
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  // 相关方法
  methods: {
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
        .put('/v1/MiniWebsiteCourseInfo/updateMiniWebsiteCourseInfo', param)
        .then((res) => {
          return this.$message.success('更改成功')
        })
    },
    _getList() {
      this.tableLoading = true
      const param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        pageNum: this.queryParam.pageNum,
        pageSize: this.queryParam.pageSize,
        available: this.available ? 1 : null
      }
      this.$http.get('/v1/MiniWebsiteCourseInfo/getList', param).then(res => {
        this.tableDatas = res.data
        this.queryParam.total = res.total
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 添加教学环境
    handleAdd() {
      this.dialogVisible = true
    },
    // 每页数据条数
    handleSizeChange(pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNum = 1
      this._getBannerList()
    },
    query() {
      this._getList()
    },
    // 判断是上传封面图/课程图片
    upload(status) {
      this.formData.uploadStatus = status
    },
    handleBeforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
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
          if (!this.formData.uploadStatus) { // 上传封面图
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
              this.formData.courseImgList.push({ name: 'default.png', url: item.downloadPath })
            })
          }
        }
      }
    },
    handleRemoveThumbnail(file, fileList) {
      this.formData.thumbnail = ''
      this.formData.imgList = fileList
    },
    handleRemoveCourseImg(file, fileList) {
      this.formData.courseImgList = []
      fileList.forEach((item) => {
        this.formData.courseImgList.push(item)
      })
    },
    // 编辑数据
    handleEdit(row) {
      this.$http.get(`/v1/MiniWebsiteCourseInfo/getMiniWebsiteCourseInfoById?id=${row.id}`).then(res => {
        let detailsImgList = res.data.resources.map(item => {
          item = {
            id: item.id,
            name: 'default.png',
            url: item.resourceUrl
          }
          return item
        })
        console.log(row)
        let imgList = [{ name: 'default.png', url: res.data.thumbnail }]
        this.formData = {
          categoryName: row.categoryName, // 课程分类名称
          categoryId: row.categoryId, // 课程分类名称
          id: res.data.id,
          courseId: res.data.courseId,
          imgList: imgList, // 课程封面图
          rate: res.data.rate,
          price: res.data.price,
          content: res.data.content,
          courseImgList: detailsImgList, // 课程图片
          thumbnail: res.data.thumbnail, // 课程封面地址
          name: res.data.name, // 课程名称
          description: res.data.description // 课程描述
        }
      }).finally(() => {
        this.dialogVisible = true
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/v1/MiniWebsiteCourseInfo/updateValidById?id=${row.id}`).then(res => {
          this.$message({ type: 'success', message: '成功删除数据' })
          this._getList()
        })
      }).catch(() => {
      })
    },
    // 获取课程列表
    _getCourseList() {
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, { status: 1 }).then(res => {
        this.courseList = res.data
      })
    },
    selectCourse(courseId) {
      this.courseList.forEach(item => {
        if (item.id === courseId) {
          this.formData.name = item.name
          this.formData.categoryName = item.courseCategoryName
          this.formData.categoryId = item.courseCategoryId
        }
      })
    },
    // 提交数据
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const param = {
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id,
            name: this.formData.name,
            price: this.formData.price,
            rate: this.formData.rate, // 推荐课程指数
            thumbnail: this.formData.thumbnail, // 封面图
            description: this.formData.description,
            valid: 1,
            content: this.formData.content,
            categoryName: this.formData.categoryName, // 课程分类名称
            categoryId: this.formData.categoryId, // 课程分类名称ID
            resources: []
          }
          param.resources = this.formData.courseImgList.map(item => {
            item = {
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              resourceType: 0, // 资源类型（0：图片， 1：视频）
              resourceUrl: item.url, // 资源链接
              dataType: 4, // 数据类型：课程信息
              valid: 1 // 是否有效数据
            }
            return item
          })
          if (this.formData.courseId) {
            param.courseId = this.formData.courseId
          }
          if (!this.formData.id) { // 新增数据
            this.$http.post('/v1/MiniWebsiteCourseInfo/addMiniWebsiteCourseInfo', param).then(res => {
              this.handleClose()
              this._getList()
            }).finally(() => {
              this.submitLoading = false
            })
          } else { // 编辑数据
          // 处理编辑图片新增数据
            param.id = this.formData.id
            let newResourcesData = []
            let x = 0
            this.formData.courseImgList.forEach(item => {
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
            this.$http.put('/v1/MiniWebsiteCourseInfo/updateMiniWebsiteCourseInfo', param).then(res => {
              this.$message({ type: 'success', message: '数据更新成功' })
              this.handleClose()
              this._getList()
            }).finally(() => {
              this.submitLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    // 取消提交
    handleClose() {
      this.dialogVisible = false
      this.formData = {
        id: null,
        uploadStatus: 0,
        rate: 6, // 课程推荐指数
        price: null,
        content: null,
        courseId: null, // 关联课程的id
        imgList: [], // 课程封面图
        courseImgList: [], // 课程图片
        thumbnail: null, // 课程封面地址
        name: null, // 课程名称
        description: null // 课程描述
      }
      this.$refs.form.clearValidate()
    }
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {
  }
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
</style>

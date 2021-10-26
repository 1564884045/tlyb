<!-- 校园活动 -->
<template>
  <div class="container">
      <div class="query-form">
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
            prop="title"
            label="活动标题"
            width="140"
            :show-overflow-tooltip="true"
            >
          </el-table-column>
          <el-table-column
            prop="content"
            label="活动内容"
            :show-overflow-tooltip="true"
            >
          </el-table-column>
          <el-table-column
            prop="activityStartTime"
            label="开始时间"
            :show-overflow-tooltip="true"
            width="140"
            >
            <template slot-scope="scope">
              <span v-if="scope.row.activityStartTime">{{scope.row.activityStartTime}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="activityEndTime"
            label="结束时间"
            :show-overflow-tooltip="true"
            width="140"
            >
            <template slot-scope="scope">
              <span v-if="scope.row.activityEndTime">{{scope.row.activityEndTime}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="viewCount" label="浏览量" width="100" align="center"></el-table-column>
          <el-table-column prop="shareCount" label="分享量" width="100" align="center"></el-table-column>
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
          @size-change="query"
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
        <el-form-item prop="title" label="标题">
          <el-input v-model="formData.title" type="textarea" rows="3" maxlength="120" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="imgList">
          <el-upload
            :action="imgUploadPath"
            accept="image/*"
            list-type="picture-card"
            :show-file-list="true"
            :limit="9"
            :file-list="formData.imgList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove">
            <i class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" style="color:#409EFF;">建议大小：2M以内，建议张数：最多9张（375*160）</div>
          </el-upload>
        </el-form-item>
        <el-form-item prop="activityTime" label="活动时间">
          <el-date-picker
            v-model="formData.activityTime"
            type="datetimerange"
            align="right"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
            :picker-options="pickerOptions"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item prop="content" label="活动内容">
          <el-input v-model="formData.content" type="textarea" rows="3" maxlength="120" show-word-limit autocomplete="off"></el-input>
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
      formData: {
        id: 0,
        imgList: [],
        activityTime: null, // 活动时间
        title: null, // 备注说明
        content: null, // 校园活动内容
        resourceType: null, // 资源类型（0：图片， 1：视频）
        dataType: 1, // 数据类型：教学环境
        detailsImgList: [] // 保存获取详情时，图片数据
      },
      rules: {
        title: [{ required: true, message: '请输入活动的标题', trigger: 'blur' }],
        imgList: [{ required: true, message: '请上传图片', trigger: 'blur' }],
        content: [{ required: true, message: '请输入教学环境说明', trigger: 'blur' }]
        // activityTime: [{ required: true, message: '请选择日期' }]
      },
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      pickerOptions: {
        disabledDate(time) {
          // 可选时间范围是当前时间到一年前的今天之间
          return new Date(time).getTime() < Date.now()
        }
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    this._getList()
  },
  computed: {
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  // 相关方法
  methods: {
    _getList() {
      this.tableLoading = true
      const param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        pageNum: this.queryParam.pageNum,
        pageSize: this.queryParam.pageSize
      }
      this.$http.get('/v1/MiniWebsiteActivity/getList', param).then(res => {
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
    query(size) {
      this.queryParam.pageSize = size
      this.queryParam.pageNum = 1
      this._getList()
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
          res.data.forEach(item => {
            // 处理回显数据
            this.formData.imgList.push({ name: 'default.png', url: item.downloadPath })
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.formData.imgList = fileList
    },
    // 编辑数据
    handleEdit(row) {
      this.$http.get(`/v1/MiniWebsiteActivity/getMiniWebsiteActivityById?id=${row.id}`).then(res => {
        let detailsImgList = res.data.resources.map(item => {
          item = {
            id: item.id,
            name: 'default.png',
            url: item.resourceUrl
          }
          return item
        })
        // 活动时间
        let activityTime = []
        if (res.data.activityStartTime) {
          activityTime.push(res.data.activityStartTime, res.data.activityEndTime)
        } else {
          activityTime.push('0:0:0', '0:0:0')
        }
        this.formData = {
          id: res.data.id,
          activityTime: activityTime,
          imgList: detailsImgList,
          content: res.data.content, // 环境说明
          title: res.data.title, // 备注说明
          detailsImgList: detailsImgList
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
        this.$http.delete(`/v1/MiniWebsiteActivity/updateValidById?id=${row.id}`).then(res => {
          this.$message({ type: 'success', message: '成功删除数据' })
          this._getList()
        })
      }).catch(() => {
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
            content: this.formData.content, // 环境说明
            title: this.formData.title, // 备注说明
            valid: 1,
            resources: []
          }
          param.resources = this.formData.imgList.map(item => {
            item = {
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              resourceType: 0, // 资源类型（0：图片， 1：视频）
              resourceUrl: item.url, // 资源链接
              dataType: 6, // 数据类型：校园活动
              valid: 1 // 是否有效数据
            }
            return item
          })
          if (this.formData.activityTime) {
            param.activityStartTime = this.formData.activityTime[0]
            param.activityEndTime = this.formData.activityTime[1]
          }
          if (!this.formData.id) { // 新增数据
            this.$http.post('/v1/MiniWebsiteActivity/addMiniWebsiteActivity', param).then(res => {
              this.handleClose()
              this._getList()
            }).finally(() => {
              this.submitLoading = false
            })
          } else { // 更新数据
            param.id = this.formData.id
            let newResourcesData = []
            let x = 0
            this.formData.imgList.forEach(item => {
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
            this.$http.put('/v1/MiniWebsiteActivity/updateMiniWebsiteActivity', param).then(res => {
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
        id: 0,
        imgList: [],
        activityTime: null, // 活动时间
        title: null, // 备注说明
        content: null, // 校园活动内容
        resourceType: null, // 资源类型（0：图片， 1：视频）
        dataType: 1, // 数据类型：教学环境
        detailsImgList: [] // 保存获取详情时，图片数据
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
</style>

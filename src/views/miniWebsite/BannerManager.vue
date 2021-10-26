<!-- banner管理 -->
<template>
  <div class="container">
    <div class="query-form">
      <div style="float: left;border: 1px solid #ffffff">
        <el-checkbox :disabled="!tableLoading ? false : true" v-model="available" @change="query">仅查看有效</el-checkbox>
      </div>
      <div style="float: right">
        <el-button type="primary" icon="el-icon-plus" @click="dialogVisible = true">新增</el-button>
      </div>
    </div>
    <div style="margin-top: 10px; background-color: #fff; padding: 15px">
      <el-table v-loading="tableLoading" :data="tableData">
        <el-table-column prop="title" width="160" label="标题"></el-table-column>
        <el-table-column prop="imgUrl" width="140" label="图片" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl" alt="图片加载中" style="width: 90px; height: 40px" />
          </template>
        </el-table-column>
        <!-- <el-table-column prop="content" label="内容" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{scope.row.content}}</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="description" min-width="150" label="描述" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.description">{{scope.row.description}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="available" label="是否有效" align="center" width="100">
          <template slot-scope="scope">
            <el-switch class="switch" @click.native="handleUpdateAvailable(scope.row)" :value="scope.row.available" :width="55" size="mini" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createAt" align="center" label="创建日期" width="150"></el-table-column>
        <el-table-column prop="updateAt" align="center" label="更新时间" width="150"></el-table-column> -->
        <el-table-column fixed="right" width="100" align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="editForm(scope.row)" size="small">编辑</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="paging">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParam.pageNum"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="queryParam.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>

    <!-- 添加轮播图 -->
    <el-dialog :title="form.id ? '更新' : '新增'" :closeOnClickModal="false" :visible.sync="dialogVisible" custom-class="custom-dialog" :before-close="resetForm">
      <el-form :model="form" ref="form" :rules="formrules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-col :span="15">
            <el-input v-model="form.title" minlength="3" maxlength="16" show-word-limit autocomplete="off"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="轮播图" prop="imgUrl">
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
            <div slot="tip" style="color:#409EFF;">建议大小：2M以内(375*160),只能上传1张图哦！</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="5" maxlength="120" placeholder="请输入描述" show-word-limit autocomplete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" rows="10" maxlength="500" show-word-limit autocomplete="off"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm()">取 消</el-button>
        <el-button type="primary" :loading="submitBtnLoading" @click="submitForm('form')">{{ this.form.id ? '更新' : '新增' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MiniWebsiteBannerManager',
  data() {
    return {
      form: {
        id: null,
        title: null,
        imgUrl: null,
        imgList: [],
        content: null,
        description: null
      },
      available: false, // 查询条件
      total: 0, // 数据长度
      tableData: [],
      dialogVisible: false,
      tableLoading: false, // 获取列表
      submitBtnLoading: false, // 更新、新增表单
      formrules: {
        title: { required: true, message: '请输入标题', trigger: 'blur' },
        // content: { required: true, message: '请输入内容', trigger: 'blur' },
        imgUrl: { required: true, message: '请上传图片', trigger: 'blur' }
      },
      // 图片上传地址
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL,
      // 分页数据
      queryParam: {
        // 默认初始页
        pageNum: 1,
        // 默认每页数据条数
        pageSize: 10,
        type: null,
        status: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo', // 所属机构ID
      'currentBranch' // 所属分校ID
    ])
  },
  // 生命周期 - 创建完成
  created() {
    this._getBannerList()
  },
  // 相关方法
  methods: {
    handleRemove(file, fileList) {
      this.form.imgUrl = null
      this.form.imgList = fileList
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
        .put('/v1/MiniWebsiteBanner/updateMiniWebsiteBanner', param)
        .then((res) => {
          return this.$message.success('更改成功')
        })
    },
    query() {
      this._getBannerList()
    },
    // 获取列表
    _getBannerList() {
      this.tableLoading = true
      const params = {
        pageNum: this.queryParam.pageNum, // 当前页
        pageSize: this.queryParam.pageSize, // 每页条数
        organizationId: this.organizationInfo.id, // 所属机构ID
        departmentId: this.currentBranch.id, // 所属分校ID
        imgUrl: '',
        title: '',
        description: '',
        content: '',
        available: this.available ? 1 : null
      }
      this.$http
        .get('/v1/MiniWebsiteBanner/getList', params)
        .then((res) => {
          this.tableData = res.data
          this.total = res.total
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 当前页
    handleCurrentChange(currentPage) {
      this.queryParam.pageNum = currentPage
      this._getBannerList()
    },
    // 每页数据条数
    handleSizeChange(pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNum = 1
      this._getBannerList()
    },
    // 新增轮播图
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitBtnLoading = true
          const params = {
            id: this.form.id,
            organizationId: this.organizationInfo.id, // 所属机构ID
            departmentId: this.currentBranch.id, // 所属分校ID
            imgUrl: this.form.imgUrl, // 轮播图
            title: this.form.title, // 标题
            description: this.form.description, // 描述
            content: this.form.content // 内容
          }
          // 更新
          if (this.form.id) {
            this.$http
              .put('/v1/MiniWebsiteBanner/updateMiniWebsiteBanner', params)
              .then((res) => {
                this.$message.success('更新成功')
                this.resetForm()
                this._getBannerList()
              })
              .finally(() => {
                this.submitBtnLoading = false
              })
          } else {
            // 新增
            this.$http
              .post('/v1/MiniWebsiteBanner/addMiniWebsiteBanner', params)
              .then((res) => {
                this.$message.success('新增成功')
                this.resetForm()
                this._getBannerList()
              })
              .finally(() => {
                this.submitBtnLoading = false
              })
          }
        }
      })
    },
    // 更新
    editForm(row) {
      this.form = {
        id: row.id,
        imgUrl: row.imgUrl,
        title: row.title,
        content: row.content,
        description: row.description
      }
      this.form.imgList = [{ name: 'default.png', url: row.imgUrl }]
      this.dialogVisible = true
    },
    // 关闭窗口时清空数据
    resetForm() {
      this.dialogVisible = false
      this.form = {
        id: null,
        title: null,
        imgUrl: null,
        imgList: [],
        content: null,
        description: null
      }
      this.$refs.form.clearValidate() // 清空表单校验
    },
    // 图片上传之前
    handleBeforeUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' || 'image/jpg' || 'image/png' || 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过1M!')
      }
      return isJPG && isLt2M
    },
    // 图片上传成功
    handleUploadSuccess(res, file, fileList) {
      if (res.code === '000000') {
        if (res.data) {
          if (!this.form.imgUrl) {
            this.form.imgUrl = null
          }
          res.data.forEach((item) => {
            this.form.imgUrl = item.downloadPath
            // 处理回显数据
            this.form.imgList = [
              { name: 'default.png', url: item.downloadPath }
            ]
          })
        }
      }
    },
    // 删除
    deleteBanner(row) {
      this.$http
        .delete('/v1/MiniWebsiteBanner/updateValidById', { id: row.id })
        .then((res) => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .finally(() => {
          // 删除后重载数据，当前页若无数据，返回首页
          if (this.tableData.length === 1) {
            this.queryParam.pageNum = this.queryParam.pageNum - 1
          }
          this._getBannerList()
        })
    },
    // 删除时提示
    handleDelete(row) {
      this.$confirm(`此操作将永久删除 【${row.title}】 , 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteBanner(row)
      })
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
.paging
  margin-top 18px
/deep/.switch
  height 40px
  .el-switch__core
    height 26px
    line-height 26px
    border-radius 16px
    &:after
      top 50%
      margin-top -8px
/deep/.switch .el-switch__core:before
  display block
  content '否'
  text-align right
  color #646464
  padding-right 8px
/deep/.switch.is-checked .el-switch__core:before
  content '是'
  text-align left
  color #fff
  padding-left 8px
</style>

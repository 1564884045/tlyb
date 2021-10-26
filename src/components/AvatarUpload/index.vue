<template>
  <div>
    <el-upload
      class="avatar-uploader"
      :action="action"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :on-error="handleError"
    >
      <img
        v-if="imageUrl"
        :src="pictureUrl || imageUrl"
        class="avatar"
      >
      <i
        v-else
        class="el-icon-plus avatar-uploader-icon"
      ></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img
        width="100%"
        :src="dialogImageUrl"
        alt=""
      >
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AvatarUpload',
  model: {
    prop: 'imageUrl',
    event: 'onSuccess'
  },
  props: {
    action: {
      type: String,
      default: process.env.VUE_APP_UPLOAD_URL
    },
    imageUrl: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      pictureUrl: null,
      dialogVisible: false,
      dialogImageUrl: ''
    }
  },
  methods: {
    handleSuccess(res, file) {
      if (res && res.code === '000000') {
        this.$message.success(res.message)
        this.pictureUrl = URL.createObjectURL(file.raw)
        if (res.data.length > 0) {
          this.$emit('onSuccess', res.data[0].downloadPath)
        }
      }
    },
    handleError(err, file) {
      this.$message.error('图片上传失败')
      console.error('图片上传失败', err)
    },
    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isLt2M
    }
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  line-height: 148px;
  text-align: center;
}
.avatar {
  width: 148px;
  height: 148px;
  display: block;
}
</style>
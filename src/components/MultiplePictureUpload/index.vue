<template>
  <div>
    <el-upload
      :action="action"
      list-type="picture-card"
      accept="image/*"
      :limit="20"
      :file-list="temPictureList"
      :multiple="true"
      :on-success="handleSuccess"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-error="handleError"
      :on-exceed="handleExceed"
      style="margin-left: 10px;"
    >
      <i class="el-icon-plus"></i>
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
  name: 'MultiplePictureUpload',
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
  data() {
    return {
      doneSetValue: false,
      dialogImageUrl: '',
      dialogVisible: false,
      temPictureList: []
    }
  },
  watch: {
    // 1. 用于通过 element ui 的重置函数直接清空
    // 2. 如果已经存在图片的话，将图片的url赋值给 temPictureList
    imageListRecord (val) {
      if (val.length === 0) {
        this.temPictureList = []
      } else {
        if (!this.doneSetValue && this.temPictureList.length === 0) {
          val.forEach(item => {
            this.temPictureList.push(item)
          })
          this.doneSetValue = true
        }
      }
    }
  },
  computed: {
    // imageUrl 的映射：将字符形式的 imageUrl 映射为对象形式的 imageListRecord
    imageListRecord () {
      if (this.imageUrl == null || this.imageUrl.toString() === '') return []
      let imgList = []
      this.imageUrl.split(';')
        .forEach((item, index) => {
          const pos = item.lastIndexOf('/')
          let imgName = pos > -1 ? item.toString().substring(pos + 1) : item.toString()
          imgList.push({ name: imgName, url: item.toString() })
        })
      return imgList
    }
  },
  methods: {
    handleExceed (file, fileList) {
      this.$message.warning('最多只能上传20张图片')
    },
    handleRemove(file, fileList) {
      let urlStr = this.fileList2str(fileList)
      this.$emit('onSuccess', urlStr)
    },
    handleSuccess(res, file, fileList) {
      if (res && res.code === '000000') {
        this.doneSetValue = true
        this.$message.success(res.message)
        let urlStr = this.fileList2str(fileList)
        this.$emit('onSuccess', urlStr)
      }
    },
    handleError(err, file, fileList) {
      this.$message.error('图片上传失败')
      console.error('图片上传失败', err)
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isLt2M
    },
    fileList2str (fileList) {
      if (!fileList || fileList.length === 0) return ''
      let urlArr = []
      fileList.forEach(item => {
        try {
          if (item.response) {
            urlArr.push(item.response.data[0].downloadPath)
          } else {
            urlArr.push(item.url)
          }
        } catch (error) {
          console.error(error, item)
        }
      })
      return urlArr.join(';')
    }
  }
}
</script>
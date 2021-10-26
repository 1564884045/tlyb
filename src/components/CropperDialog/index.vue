<template>
<div class="cropper-dialog">
  <el-dialog
    :title="title"
    :visible="value"
    :width="typeof width === 'string' ? width : (width + 'px')"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('toggle', false)">

    <div class="cropper-container" :style="{height: typeof height === 'string' ? height : (height + 'px')}">
      <img ref="image" :src="tempImg" />
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="$emit('toggle', false)">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="handleCropper">裁 剪</el-button>
    </span>
  </el-dialog>

  <input ref="imageInput" type="file" :accept="acceptType" @change="handleSelectImage" style="display: none;"/>
</div>
</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

export default {
  name: 'VueCropper',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    /**
     * 弹出层标题
     */
    title: {
      type: String,
      default: '裁剪图片'
    },
    /**
     * 容器宽度
     */
    width: {
      type: [String, Number],
      default: '42%'
    },
    /**
     * 容器高度
     */
    height: {
      type: [String, Number],
      default: '45vh'
    },
    /**
     * 可选择文件
     */
    acceptType: {
      tpye: String,
      default: 'image/*'
    },
    /**
     * 传入的图片
     */
    img: {
      type: String,
      default: ''
    },
    /**
     * 自动上传
     */
    autoUpload: {
      type: Boolean,
      default: true
    },
    /**
     * cropper 初始化选项
     * https://github.com/fengyuanchen/cropperjs
     */
    options: {
      type: Object,
      default: () => {}
    },
    /**
     * 裁剪过后的canvas选项
     */
    croppedOptions: {
      type: Object,
      default: () => {}
    },
    /**
     * 最大上传大小。单位 b
     */
    maxSize: Number
  },
  data() {
    return {
      loading: false,
      tempImg: this.img
    }
  },
  methods: {
    initCropper() {
      if (this.cropper == null) {
        this.cropper = new Cropper(this.$refs.image, {
          aspectRatio: 4 / 3,
          viewMode: 1,
          autoCropArea: 0.8,
          ...this.options
        })
      } else {
        this.cropper.replace(this.tempImg)
      }
    },
    select() {
      this.$refs.imageInput.click()
    },
    handleSelectImage() {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return
      this.tempImg = window.URL.createObjectURL(files[0])
      this.$emit('toggle', true)
      this.$nextTick(() => {
        this.initCropper()
      })
      // 重置为空
      this.$refs.imageInput.value = ''
    },
    handleCropper() {
      if (this.cropper) {
        this.loading = true
        try {
          this.cropper.getCroppedCanvas(
            {
              maxWidth: 1600,
              maxHeight: 1200,
              ...this.croppedOptions
            }
          ).toBlob((blob) => {
            // 裁剪过后的文件，超出限制大小
            if (this.maxSize && blob.size > this.maxSize) {
              this.$emit('uploadSizeLimit')
              this.loading = false
              return
            }
            this.$emit('cropperComplete', blob)
            if (this.autoUpload) {
              this.$http.upload(blob).then((res) => {
                this.$emit('uploadComplete', res)
                this.$emit('toggle', false)
              }).finally(() => {
                this.loading = false
              })
              return
            }
            this.loading = false
            this.$emit('toggle', false)
          })
        } catch (error) {
          this.loading = false
        }
      }
    }
  },
  watch: {
    value() {
      if (this.value && this.img != null && this.img !== '') {
        this.$nextTick(() => {
          this.initCropper()
        })
      }
    }
  }
}
</script>

<style lang="stylus">
.cropper-dialog
  .el-dialog__header, .el-dialog__footer
    padding 10px 20px
  .el-dialog__body
    padding 0
</style>
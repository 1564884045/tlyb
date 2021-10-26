<template>
  <div class="multi-uploader">
    <!-- <p class="tip" v-show="showEdit"><span style="color: red; font-size: 12px; margin: 0 3px 0 -5px">*</span>{{tip}}</p> -->
    <p class="tip" v-show="showEdit">{{tip}}</p>
    <div class="file-list">
      <div class="multi-uploader-item" v-for="(item, index) in fileList" :key="index" @click="$emit('clickItem', index, item, fileList)">

        <el-image
          v-if="isImageFile(item)"
          fit="fill"
          style="width:80px;height:80px;border:1px solid #eeeeee;"
          :src="item.thumb || item.src">
        </el-image>

        <div v-else class="no-image">
          <van-icon class="file-icon" name="description"/>
          <p class="file-name van-ellipsis">{{item.file ? item.file.name : item.src}}</p>
        </div>

        <template v-if="item.type === 1">
          <div class="multi-uploader-mask"></div>
          <i class="el-icon-video-play btn-play"/>
        </template>

        <i class="el-icon-delete btn-delete" @click.stop="handleDeleteFile(index, item)" v-show="showEdit"/>
      </div>
      <div class="multi-uploader-input" v-show="showAddBtn && showEdit" @click.stop="handleOpenSelect">
        <i class="el-icon-plus btn-add"/>
        <input ref="input"
          value=""
          type="file"
          :multiple="multiple"
          :accept="accept"
          :capture="capture"
          @change="handleFileChange"/>
      </div>
    </div>

    <el-popover
      trigger="click"
      :value="showSelect"
      placement="top"
      ref="seelctFilePopever">
      <p class="multi-uploader-popup-title">{{ handleLoading ? '文件处理中，请等待...' : '选择上传文件类型' }}</p>
      <div class="multi-uploader-popup-wrapper">
        <div class="file-type" @click.stop="handleSelectFile(0)">
          <img src="../../assets/img/icon_img.png"/>
          <p>图片</p>
        </div>
        <div class="file-type" @click.stop="handleSelectFile(1)">
          <img src="../../assets/img/icon_video.png"/>
          <p>视频</p>
        </div>
      </div>
      <div class="multi-uploader-popup-close-btn">
        <el-button type="primary" plain size="small" :loading="handleLoading" @click="closePop()">关闭</el-button>
      </div>
    </el-popover>

    <video ref="video" style="display: none; visibility: hidden;" muted autoplay proload="meta" webkit-playsinline="true" playsinline>
    </video>
  </div>
</template>

<script>
import path from 'path'
import * as qiniu from '../../utils/qiniuPlugin'

const MAX_VIDEO_DURATION = 2 * 60

export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    tip: {
      type: String,
      default: '最多可上传图片或视频9个，单个视频限长2分钟。'
    },
    value: Array,
    maxCount: {
      type: Number,
      default: 9
    },
    multiple: {
      type: Boolean,
      default: true
    },
    showEdit: { // 展示/编辑控制
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showSelect: false,
      handleLoading: false,
      fileList: this.value,
      accept: 'image/*',
      capture: ''
    }
  },
  components: {
  },
  mounted() {
    // this.openPop()
  },
  computed: {
    // isIOS() {
    //   var u = navigator.userAgent
    //   return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    // },
    showAddBtn() {
      return this.fileList.length < this.maxCount
    }
  },
  methods: {
    openPop() {
      this.$refs.seelctFilePopever.doShow()
    },
    closePop() {
      this.showSelect = false
      this.$refs.seelctFilePopever.doClose()
    },
    isImageFile(item) {
      if (item.isImage) {
        return true
      }
      if (item.file && item.file.type) {
        return item.file.type.indexOf('image') === 0
      }
      if (item.thumb || item.src) {
        return /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i.test(item.thumb || item.src)
      }
      if (item.content) {
        return item.content.indexOf('data:image') === 0
      }
      return false
    },
    /**
     * dataURI to blob, ref to https://gist.github.com/fupslot/5015897
     * @param dataURI
     */
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
     * base64转Blob
     */
    dataURItoBlob(dataURI, filename) {
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
        let videoEl = this.$refs.video
        // if (!this.isIOS) {
        //   videoEl = document.createElement('video')
        //   videoEl.muted = true
        //   videoEl.autoplay = true
        //   videoEl.controls = true
        //   videoEl.preload = 'meta'
        //   videoEl.setAttribute('playsinline', true)
        //   videoEl.setAttribute('webkit-playsinline', true)
        // }
        videoEl.src = window.URL.createObjectURL(videoFile)
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
          canvas.getContext('2d').drawImage(e.target, 0, 0, canvas.width, canvas.height)
          const dataURL = canvas.toDataURL('image/jpeg')
          let blob = _self.dataURItoBlob(dataURL, 'video_image.jpeg')
          _self.$http.upload(blob, true).then(res => {
            info.thumb = res.src
            videoEl.src = ''
            resolve(info)
          }).catch(err => {
            videoEl.src = ''
            reject(err)
          })
          _self.showUploadVideo = false
        })
      })
    },
    /**
     * 选择文件
     */
    handleSelectFile(type) {
      if (this.handleLoading) {
        return
      }
      this.capture = false
      switch (type) {
        case 0:
          // this.capture = 'camera'
          this.accept = 'image/*'
          break
        case 1:
          // this.capture = 'camcorder'
          this.accept = 'video/*'
          break
      }

      setTimeout(() => {
        this.$refs.input.click()
      }, 80)
    },
    /**
     * 选择了文件
     */
    async handleFileChange(e) {
      const files = e.target.files
      if (files.length === 0 || files[0].size === 0) return

      this.handleLoading = true
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isVideo = file.type && file.type.indexOf('video') === 0
        try {
          let videoInfo = {}
          if (isVideo) {
            videoInfo = await this.getVideoInfo(file)
            if (videoInfo.duration > MAX_VIDEO_DURATION) {
              this.$message.warning('视频长度不能超过2分钟')
              this.$refs.input.value = ''
              return
            }
            const resUrl = await qiniu.uploadFile(file, file.name, 3 * 60 * 1000)
            this.fileList.push({
              thumb: videoInfo.thumb,
              src: resUrl,
              type: 1
            })
          } else {
            const res = await this.$http.upload(file, true)
            this.fileList.push({
              src: res.src,
              type: 0
            })
          }
          this.$emit('uploadFileSuccess')
        } catch (error) {
          alert('上传视频报错了')
        }
      }

      this.$refs.input && (this.$refs.input.value = '')
      this.handleLoading = false
      this.showSelect = false
    },
    handleOpenSelect() {
      this.handleLoading = false
      this.showSelect = true
    },
    handleDeleteFile(index, item) {
      this.$confirm('是否确定移除该文件？', '提示').then(async () => {
        try {
          if (item.type === 1) {
            await this.$http.loadingGet('/v1/Qiniu/deleteFile', {
              fileName: path.basename(item.thumb)
            })
          }
          await this.$http.loadingGet('/v1/Qiniu/deleteFile', {
            fileName: path.basename(item.src)
          })
        } catch (error) {
        }
        this.fileList.splice(index, 1)
        this.$emit('deleteFileSuccess')
      })
    }
  },
  watch: {
    value(val) {
      this.fileList = val
    }
    // showSelect(val) {
    //   console.log(val)
    //   if (!val) {
    //     this.doClose()
    //   } else {
    //     this.openPop()
    //   }
    // }
  }
}
</script>

<style lang="stylus">
.multi-uploader
  padding-left 16px
  .tip
    font-size 14px
    color $color-text-3
    margin-bottom 16px
  .file-list
    display flex
    flex-wrap wrap
.multi-uploader-item
  position relative
  margin 0 8px 8px 0
  width 80px
  height 80px
  .van-image
    width 100%
    height 100%
  .no-image
    display flex
    flex-direction column
    align-items center
    justify-content center
    width 80px
    height 80px
    background-color #f8f8f8
    border-radius 4px
    .file-icon
      color #7d7e80
      font-size 20px
    .file-name
      box-sizing border-box
      width 100%
      margin-top 8px
      padding 0 4px
      color #7d7e80
      font-size 12px
      text-align center
  .multi-uploader-mask
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    border-radius 4px
    z-index 1
  .btn-play
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    color rgba(255, 255, 255, 0.5)
    font-size 32px
    z-index 10
  .btn-delete
    position absolute
    top -5px
    right -5px
    color #ff6600
    font-size 15px
    padding 2px
    background-color #eeeeee
    border 2px solid #ffffff
    border-radius 15px
    z-index 99
.multi-uploader-input
  position relative
  margin 0 8px 8px 0
  width 80px
  height 80px
  border-radius 4px
  border 1px dashed #e5e5e5
  box-sizing border-box
  display flex
  flex-direction column
  align-items center
  justify-content center
  .btn-add
    font-size 24px
    color $color-text-3
  input
    display none
    visibility hidden

.multi-uploader-popup-title
  color $color-warning
  text-align center
  margin-top 16px
  margin-bottom 8px

.multi-uploader-popup-close-btn
  display flex
  justify-content center

.multi-uploader-popup-wrapper
  width 150px
  display flex
  padding 16px 32px 32px
  justify-content space-around
  .file-type
    text-align center
    img
      margin-bottom 6px
      width 50px
      height 50px
      border-radius 50%
      vertical-align top
    p
      color $color-text-3
      font-size 13px
      margin 0
</style>

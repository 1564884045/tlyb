<template>
  <el-dialog
    :visible="value"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    :show-close="false"
    width="740px"
    custom-class="screen-capture">
    <p slot="title" class="title">{{title}}
      <i class="close-btn el-icon-close" @click="$emit('toggle', false)"/>
    </p>
    <div class="capture-con">
      <div class="video-con">
        <ul v-if="captureStatus === 1" class="brower-tip">
          <li>1. 建议使用较新版本的Chrome浏览器。&nbsp;当前浏览器：<span :class="browerName.indexOf('Chrome') > -1 ? 'color-success' : 'color-danger'">{{browerName}} {{browerVersion}}</span></li>
          <li>2. 打开Chrome配置 chrome://flags/#unsafely-treat-insecure-origin-as-secure，添加 http://m.tlybond.com 域名，并设置Enable启用。<a class="link" href="http://taokecdn.tlybond.com/1575281093414da7622ec-4cbd-48df-961c-fc341d715a2a.png" target="_blank">单击打开示例图</a></li>
          <li>3. 配置完成过后，请重启浏览器</li>
          <li>4. 确定打开摄像头</li>
        </ul>
        <template v-else>
          <video ref="video" width="400px" height="400px">
            您使用的浏览器不兼容vidoe。推荐使用Chrome浏览器
          </video>
          <img class="face-mask" src="../../assets/face_reg_mask.png"/>
          <p class="capture-tip">请打开摄像头</p>
        </template>
      </div>
      <div class="opt-con">
        <div class="img-con">
          <img class="capture-img" v-if="img" :src="img" width="100%"/>
          <img v-show="validateResult === 1" class="result-img result-success" src="../../assets/icon_success.png"/>
          <img v-show="validateResult === 2" class="result-img result-fail" src="../../assets/icon_fail.png"/>
        </div>
        <p v-if="validateResult === 0" class="capture-tip">请先拍照，等待图片校验过后才可提交</p>
        <p v-if="validateResult === 2" class="capture-tip">图片校验不合格，请重新拍摄！</p>
        <div class="opt-btns">
          <el-button type="warning" plain icon="el-icon-camera" @click="capture">拍照</el-button>
          <el-button type="primary" icon="el-icon-upload2" :loading="submitLoading" @click="submit">提交</el-button>
        </div>
      </div>
    </div>
</el-dialog>
</template>

<script>
var mediaStreamTrack

export default {
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    title: {
      type: String,
      default: '截图'
    }
  },
  data() {
    return {
      submitLoading: false,
      img: '',
      validateResult: 0,
      browerName: '',
      browerVersion: '',
      captureStatus: 0
    }
  },
  created() {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {}
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
        }
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }

    this.getBrowserInfo()
  },
  methods: {
    getBrowserInfo() {
      // 检测所有套壳浏览器， 比如360、QQ
      const ua = navigator.userAgent.toLowerCase()
      const testVs = regexp => ua.match(regexp).toString().replace(/[^0-9|_.]/g, '').replace(/_/g, '.')
      let name = ''
      let version = ''

      if (/micromessenger/g.test(ua)) {
        name = '微信浏览器'
        version = testVs(/micromessenger\/[\d._]+/g)
      } else if (/qqbrowser/g.test(ua)) {
        name = 'QQ浏览器'
        version = testVs(/qqbrowser\/[\d._]+/g)
      } else if (/ucbrowser/g.test(ua)) {
        name = 'UC浏览器'
        version = testVs(/ucbrowser\/[\d._]+/g)
      } else if (/qihu 360se/g.test(ua)) {
        name = '360浏览器'
      } else if (/metasr/g.test(ua)) {
        name = '搜狗浏览器'
      } else if (/lbbrowser/g.test(ua)) {
        name = '猎豹浏览器'
      } else if (/firefox/g.test(ua)) {
        name = '火狐浏览器'
        version = testVs(/firefox\/[\d._]+/g)
      } else if (/opera/g.test(ua)) {
        name = '欧朋浏览器'
        version = testVs(/opera\/[\d._]+/g)
      } else if (/maxthon/g.test(ua)) {
        name = '遨游浏览器'
        version = testVs(/maxthon\/[\d._]+/g)
      } else if (/msie/g.test(ua) || /trident/g.test(ua)) {
        name = 'IE浏览器'
        version = /msie/g.test(ua) ? testVs(/msie\/[\d._]+/g) : testVs(/rv:([\d.]+)/g)
      } else if (/chrome/g.test(ua)) {
        name = 'Chrome浏览器'
        version = testVs(/chrome\/[\d._]+/g)
        const is360 = this._mime('type', 'application/vnd.chromium.remoting-viewer')
        if (is360) {
          name = '360浏览器'
          version = ''
        }
      }
      if (name === '') {
        this.browerName = '未知浏览器'
      } else {
        this.browerName = name
        this.browerVersion = version
      }
    },
    _mime(option, value) {
      const mimeTypes = navigator.mimeTypes
      for (var mt in mimeTypes) {
        if (mimeTypes[mt][option] === value) {
          return true
        }
      }
      return false
    },
    validateFace(img) {
      this.$http.post('/v1/BaiduFace/faceDetectWithBase64', img).then(() => {
        this.validateResult = 1
        this.$message.success('图片校验通过！')
      }).catch(() => {
        this.validateResult = 2
      })
    },
    openVideo() {
      if (this.captureStatus === 1) return

      this.validateResult = 0
      const options = { audio: false, video: { width: 400, height: 400 } }
      const video = this.$refs.video
      navigator.mediaDevices.getUserMedia(options).then(function(mediaStream) {
        mediaStreamTrack = mediaStream
        video.srcObject = mediaStream
        video.onloadedmetadata = function(e) {
          video.play()
        }
      }).catch(() => {
        // this.$message.warning(err.name + ': ' + err.message)
        this.captureStatus = 1
      })
    },
    closeVideo() {
      this.img = ''
      this.$refs.video.pause()
      return mediaStreamTrack.getTracks()[0].stop()
    },
    capture() {
      // 绘制canvas图形
      const canvas = document.createElement('canvas')
      canvas.width = 360
      canvas.height = 360
      canvas.getContext('2d').drawImage(this.$refs.video, 0, 0, 360, 360)
      this.img = canvas.toDataURL('image/jpeg')

      this.validateFace(this.img.split(',')[1])
    },
    submit() {
      if (this.img === '') {
        this.$message.warning('请拍摄！')
        return
      }
      if (this.validateResult !== 1) {
        this.$message.warning('图片校验不合格，请重新拍摄！')
        return
      }
      // 上传
      this.submitLoading = true
      this.$http.upload(this.dataURItoBlob(this.img)).then(res => {
        this.$emit('submit', res)
        this.$emit('toggle', false)
      }).finally(() => {
        this.submitLoading = false
      })
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
    dataURItoBlob(dataURI) {
      const mimeString = dataURI.split(',')[0].split(':')[1].split('')[0]
      var buffer = this.dataURItoBuffer(dataURI)
      return new Blob([buffer], {
        type: mimeString
      })
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.$nextTick(() => {
          this.openVideo()
        })
      } else {
        this.closeVideo()
      }
    }
  }
}
</script>

<style lang="stylus">
.screen-capture
  overflow hidden
  .capture-tip
    font-size 13px
    color $color-warning
    width 100%
    text-align center
    line-height 1.5
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    font-size 16px
    color $color-text-1
    line-height 36px
    no-wrap()
  .el-dialog__body
    padding 12px 16px
  .close-btn
    position absolute
    right 16px
    top 9px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .capture-con
    display flex
  .video-con
    flex-shrink 0
    margin-right 16px
    border 1px solid $color-border-2
    position relative
    line-height 1
    overflow hidden
    width 400px
    box-sizing border-box
    min-height 400px
    .face-mask
      position absolute
      top 28px
      left 0
      width 100%
      height 100%
      z-index 3
    .capture-tip
      z-index 1
      font-size 16px
      color $color-danger
      position absolute
      top 50%
      transform translateY(-50%)
    video
      position relative
      z-index 2
    .brower-tip
      line-height 1.6
      padding 16px
      li+li
        margin-top 8px
  .opt-con
    width 100%
    flex-shrink 1
    border-radius 3px
    position relative
    box-sizing border-box
  .img-con
    border 1px solid $color-border-3
    min-height 240px
    position relative
    line-height 1
    .capture-img
      width 100%
      z-index 2
    .result-img
      width 40px
      position absolute
      top 20px
      right 20px
      z-index 3
  .opt-btns
    position absolute
    bottom 6px
    left 0
    right 0
    text-align center
</style>
<!-- 微传单dialog -->
<template>
<el-dialog
  custom-class='template-dialog'
  top="4vh"
  :visible="value"
  width="1000px"
  append-to-body
  :close-on-click-modal="false"
  :show-close="false"
  :destroy-on-close="true">
  <p class="dialog-title" slot="title">
    {{dialogTitle}}
    <span class="color-danger" style="margin-left: 12px;">{{templateLabel}}</span>
    <el-button icon="el-icon-close" type="text" circle @click="confirmHide" class="close-btn"></el-button>
  </p>
  <div class='dialog-con'>
    <div class='dialog-left'>
      <el-scrollbar wrap-class="scrollbar-wrapper" class='scrollbar-sty'  v-loading="pageLoading">
        <iframe v-if="type === 5" ref="iframe" frameborder="no" scrolling="no" :src="templateUrl" width="100%" height="100%"></iframe>
        <template v-else>
          <div class="template-header"></div>
          <div class="template-content"></div>
        </template>
      </el-scrollbar>
    </div>
    <div class="dislog-right">
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 520px;">
        <!-- 查看模式 -->
          <template v-if="visiableShowMode">
            <p class="share-title">分享信息</p>
            <div class="share-info">
              <img :src="activityInfo.shareImageUrl" alt="分享封面"/>
              <div class="right">
                <p class="title">分享标题：{{activityInfo.shareTitle}}</p>
                <p class="desc">分享描述：{{activityInfo.shareDesc}}</p>
              </div>
            </div>
            <div class="qr-code">
              <qrcode v-if="activityInfo.h5Url" class='rqcode-img' tag="img" :value="activityInfo.h5Url" :options="{
                width: 120,
                height: 120,
                margin: 0
              }" alt="二维码"/>
              <p>扫一扫分享到微信</p>
            </div>
            <div class="share-link">
              <label>链接分享</label>
              <el-input placeholder="请输入内容" v-model="activityInfo.h5Url">
                <el-button slot="append" icon="el-icon-document-copy" :data-clipboard-text="activityInfo.h5Url" class="copy-btn">复制链接</el-button>
              </el-input>
            </div>
            <div class="share-btns">
              <el-button icon="el-icon-edit" @click="toEditTemplate">编辑</el-button>
              <el-button v-if="activityInfo.status === 0" icon="el-icon-upload" type="primary" @click="publish">发布活动</el-button>
            </div>
          </template>
          <!-- 编辑模式 -->
          <div v-show="!visiableShowMode">
            <leaflet-form
              v-if="type === 0"
              ref="leaflet"
              :templateId="templateId"
              :templateData="templateData"
              :activityId="activityId"
              :musicList="musicList"></leaflet-form>
            <bargain-form
              v-else-if="type === 1"
              ref="bargain"
              :templateId="templateId"
              :templateData="templateData"
              :activityId="activityId"
              :activityInfo="activityInfo.id ? activityInfo : null"
              :musicList="musicList"></bargain-form>
            <group-form
              v-else-if="type === 3"
              ref="group"
              :templateId="templateId"
              :templateData="templateData"
              :activityId="activityId"
              :activityInfo="activityInfo.id ? activityInfo : null"
              :musicList="musicList"></group-form>
            <groupv2-form
              v-else-if="type === 5"
              ref="groupv2"
              :templateId="templateId"
              :templateData="templateData"
              :activityId="activityId"
              :activityInfo="activityInfo.id ? activityInfo : null"
              :musicList="musicList"
              @postMessage="handlePostMessage"></groupv2-form>
          </div>
      </el-scrollbar>
    </div>
  </div>
  <el-button
    v-if="!visiableShowMode"
    slot="footer"
    class="dialog-footer"
    type="primary"
    @click="submitSave"
    :loading="submitLoading">
    {{activityId ? '提交保存' : '保存至我的作品'}}
  </el-button>
</el-dialog>
</template>

<script>
import QRCode from '@/components/QRCode'
import LeafletForm from './LeafletForm'
import BargainForm from './BargainForm'
import GroupForm from './GroupForm'
import Groupv2Form from './Groupv2Form'

import ClipboardJS from 'clipboard'
import axios from 'axios'
import { on, off } from '../../../utils/dom'

export default {
  name: 'TemplateDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    type: Number, // 模板类型
    templateId: String, // 基础模板ID
    activityId: String, // 活动ID
    isShowMode: Boolean // 是否为显示模式
  },
  data () {
    return {
      pageLoading: false,
      submitLoading: false,
      visiableShowMode: this.isShowMode,
      tempType: -1,
      musicList: [],
      templateLabel: '',
      templateData: null,
      templateUrl: '',
      activityInfo: {}
    }
  },
  computed: {
    dialogTitle() {
      let str = ''
      str = this.visiableShowMode ? '查看' : '编辑'
      switch (this.type) {
        case 0:
          str += '【微传单】'
          break
        case 1:
          str += '【砍价】'
          break
        case 2:
          str += '【助力】'
          break
        case 3:
          str += '【拼团】'
          break
        case 4:
          str += '【0元购】'
          break
        case 5:
          str += '【超级拼团】'
          break
        default:
          str += '【微传单】'
          break
      }
      str += '模板'
      return str
    },
    typeName() {
      switch (this.type) {
        case 0:
          return 'leaflet'
        case 1:
          return 'bargain'
        case 2:
          return 'leaflet'
        case 3:
          return 'group'
        case 4:
          return 'leaflet'
        case 5:
          return 'groupv2'
        default:
          return 'leaflet'
      }
    }
  },
  components: {
    [QRCode.name]: QRCode,
    LeafletForm,
    BargainForm,
    GroupForm,
    Groupv2Form
  },
  mounted() {
    on(window, 'message', (e) => {
      // TODO 限制域
      if (e.data.type === 'height' && this.$refs.iframe) {
        this.$refs.iframe.style.height = e.data.value + 'px'
      }
    })
  },
  destroyed() {
    off(window, 'message')
  },
  methods: {
    confirmHide() {
      if (this.visiableShowMode) {
        // 查看模式，直接关闭
        this.hide()
        return
      }
      this.$confirm('您正在编辑模板，是否确认放弃本次编辑？', '提示').then(() => {
        this.hide()
      })
    },
    hide() {
      this.templateLabel = ''
      const musicPlayer = document.getElementById('bacMusic')
      musicPlayer && musicPlayer.pause()
      this.$emit('toggle', false)
    },
    _getMusicList() {
      if (this.musicList.length > 0) return

      this.$http.get('/v1/LibMusic/getAllLibMusic').then(res => {
        this.musicList = res.data
      })
    },
    _getTemplateById() {
      this.pageLoading = true
      this.$http.get('/v1/BasicWebTemplate/getBasicWebTemplateById', {
        id: this.templateId
      }).then(res => {
        if (res.data) {
          this.templateLabel = res.data.name
          if (this.type === 5) {
            this.templateUrl = `${process.env.VUE_APP_QINIU_CDN}/template/${this.typeName}/${res.data.template}/index.html?activityId=${res.data.id}`
            this.templateData = JSON.parse(res.data.data)
          } else {
            this.setTemplateHtml(res.data.template, JSON.parse(res.data.data))
          }
        }
      }).finally(() => {
        this.pageLoading = false
      })
    },
    _getActivityById() {
      let url = ''
      switch (this.type) {
        case 0:
          url = '/v1/OrganizationMicroWeb/getOrganizationMicroWebById'
          break
        case 1:
          url = '/v1/OrganizationReduceWeb/getOrganizationReduceWebById'
          break
        case 3:
          url = '/v1/OrganizationGroupPurchase/getOrganizationGroupPurchaseById'
          break
        case 5:
          url = '/v1/ActivityGroupPurchase/getActivityGroupPurchaseById'
          break
      }
      this.pageLoading = true
      this.$http.get(url, {
        id: this.activityId
      }).then(res => {
        if (res.data) {
          res.data.data = JSON.parse(res.data.data)

          switch (this.type) {
            case 0:
              res.data.shareTitle = res.data.data.shareTitle
              res.data.shareDesc = res.data.data.shareDesc
              res.data.shareImageUrl = res.data.data.shareImageUrl
              break
            case 1:
            case 3:
            case 5:
              res.data.shareTitle = res.data.data.shareInfo.title
              res.data.shareDesc = res.data.data.shareInfo.desc
              res.data.shareImageUrl = res.data.data.shareInfo.imageUrl
              break
          }
          this.templateLabel = res.data.templateName
          res.data.h5Url = `${process.env.VUE_APP_QINIU_CDN}/h5/${this.typeName}/${res.data.template}/index.html?activityId=${res.data.id}&templateId=${res.data.templateId}`

          this.activityInfo = res.data
          // 动态设置url
          if (this.type === 5) {
            this.templateUrl = `${process.env.VUE_APP_QINIU_CDN}/template/${this.typeName}/${res.data.template}/index.html?activityId=${res.data.id}`
            this.templateData = res.data.data
          } else {
            this.setTemplateHtml(res.data.template, res.data.data)
          }
        }
      }).finally(() => {
        this.pageLoading = false
      })
    },
    setTemplateHtml(templateName, templateData) {
      axios.get(`${process.env.VUE_APP_QINIU_CDN}/template/${this.typeName}/${templateName}/index.html?v=${new Date().getTime()}`).then(res => {
        let html = `
          <link rel="stylesheet" href="${process.env.VUE_APP_QINIU_CDN}/template/${this.typeName}/${templateName}/css/index.css?v=${new Date().getTime()}">
          ${res.data}
        `
        $('.template-content').html(html)
        // 关闭自动播放音乐
        $('#bacMusic').removeAttr('autoplay')

        this.templateData = templateData
      })
    },
    addTemplateHeader() {
      /* eslint-disable no-useless-escape */
      this.$nextTick(() => {
        let headerHtml = `
          <link rel="stylesheet" href="${process.env.VUE_APP_QINIU_CDN}/template/${this.typeName}/libs/css/common.css">
        `
        if (this.type === 3) {
          headerHtml += `
            <script type="text/javascript" src="http://tmpcdn.tlybond.com/template/groupv2/libs/js/vue.min.js"><\/script>
            <script type="text/javascript" src="http://tmpcdn.tlybond.com/template/groupv2/libs/js/swiper.min.js"><\/script>
          `
          document.documentElement.style.fontSize = 31.5 + 'px'
        }
        $('.template-header').html(headerHtml)
      })
    },
    // 推送iframe消息
    handlePostMessage(obj) {
      this.$refs.iframe && this.$refs.iframe.contentWindow.postMessage(obj, '*')
    },
    // 去编辑模板
    toEditTemplate() {
      this.visiableShowMode = false
    },
    publish() {
      let url = ''
      switch (this.type) {
        case 0:
          url = '/v1/OrganizationMicroWeb/putaway?id=' + this.activityId
          break
        case 1:
          url = '/v1/OrganizationReduceWeb/putawayOrSoudOut?status=1&id=' + this.activityId
          break
        case 3:
          url = '/v1/OrganizationGroupPurchase/putawayOrSoudOut?status=1&id=' + this.activityId
          break
        // case 5:
        //   url = '/v1/OrganizationGroupPurchase/putawayOrSoudOut?status=1&id=' + this.activityId
        //   break
      }
      // 发布活动
      this.$http.put(url, {
        id: this.activityId,
        status: 1
      }).then(() => {
        this.$message.success('发布活动成功')
        this.activityInfo.status = 1
        this.visiableShowMode = true
        this.hide()
        this.$emit('refresh', false)
      })
    },
    // 提交保存
    async submitSave() {
      if (!this.value || this.submitLoading) return
      this.submitLoading = true
      try {
        switch (this.type) {
          case 0:
            this.$refs.leaflet && (await this.$refs.leaflet.save())
            break
          case 1:
            this.$refs.bargain && (await this.$refs.bargain.save())
            break
          case 3:
            this.$refs.group && (await this.$refs.group.save())
            break
          case 5:
            this.$refs.groupv2 && (await this.$refs.groupv2.save())
            break
        }
        this.hide()
        this.$emit('refresh', false)
      } catch (err) {
        err && console.error(err)
      }
      this.submitLoading = false
    }
  },
  watch: {
    value(val) {
      if (val && !this.visiableShowMode) {
        this._getMusicList()
        // TODO 判断类型
        if (this.type !== 5) {
          this.addTemplateHeader()
        }
        if (this.activityId) {
          this._getActivityById()
        } else if (this.templateId) {
          this._getTemplateById()
        }
      }
    },
    isShowMode(val) {
      this.visiableShowMode = val
      if (val) {
        this.$nextTick(() => {
          if (this.clipboard == null) {
            this.clipboard = new ClipboardJS('.copy-btn')
            this.clipboard.on('success', (e) => {
              this.$message.success('复制成功！')

              e.clearSelection()
            })
          }
        })
      }
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.dialog-title
  background $color-background
  height 40px
  line-height 40px
  padding 0 20px
  font-weight bold
  position relative
  .close-btn
    position absolute
    font-size 17px
    color $color-text-3
    top 3px
    right 12px
    &:hover
      color $color-primary
.dialog-con
  height 540px
  display flex
  padding 12px 0
.dialog-left
  flex-shrink 0
  width 271.5px
  height 558.75px
  margin 10px 20px 0 30px
  position relative
  z-index 500
  background-image url(../../../assets/iphoneBorder.png)
  background-size 100% 100%
  box-sizing border-box
  padding 32px 6.5px 34px 4.5px
  .scrollbar-sty
    width 100%
    height 100%
    border-radius 2px
  iframe
    min-height 558.75px
.dislog-right
  flex-shrink 1
  width 100%
  margin-top 10px
  margin-left 20px
  .scrollbar-wrapper
    box-sizing border-box
    padding-right 30px

.share-title
  color $color-text-1
  font-size 18px
  margin-bottom 16px
.share-info
  display flex
  align-items flex-start
  img
    flex-shrink 0
    width 120px
    max-height 90px
    margin-right 20px
  .right
    width 450px
    overflow hidden
    .title
      font-size 16px
      font-weight bold
      color $color-text-1
      margin-bottom 16px
      no-wrap()
    .desc
      font-size 14px
      color $color-text-3
      line-height 1.5
      no-wrap-n(2)

.qr-code
  padding 12px 20px 8px 20px
  margin 30px auto
  text-align center
  border 1px solid #aaa
  width 162px
  height 166px
  p
    font-size 12px
    color $color-text-3
    margin-top 4px

.share-link
  display flex
  align-items center
  label
    margin-right 20px
    flex-shrink 0
  .el-input
    width 520px

.share-btns
  margin-top 50px
  text-align center
</style>

<style lang="stylus">
.template-dialog
  margin 6vh auto
  height 635px
  .el-dialog__header
    padding 0
  .el-dialog__body
    padding 0 20px
  .el-dialog__footer
    padding 12px 20px
    background #fff
  .dislog-right .scrollbar-wrapper
    box-sizing border-box
    padding-right 30px

.r_music, .lef_btn, .lef_mydo
  position absolute !important
</style>

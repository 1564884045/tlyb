<template>
  <div class="base-template-wrapper">
    <ul class="query-list">
      <li>
        <label>类型:</label>
        <span class="query-item" :class="{active: queryForm.type === null}" @click="queryForm.type = null">全部</span>
        <span
          class="query-item"
          v-for="item in typeList"
          :key="item.value"
          :class="{active: queryForm.type === item.value}"
          @click="queryForm.type = item.value"
        >{{item.label}}</span>
      </li>
      <li>
        <label>节假:</label>
        <span class="query-item" :class="{active: queryForm.festivalId === null}" @click="queryForm.festivalId = null">全部</span>
        <span
          class="query-item"
          v-for="item in festivalList"
          :key="item.id"
          :class="{active: queryForm.festivalId === item.id}"
          @click="queryForm.festivalId = item.id"
        >{{item.name}}</span>
      </li>
      <li>
        <label>风格:</label>
        <span class="query-item" :class="{active: queryForm.categoryId === null}" @click="queryForm.categoryId = null">全部</span>
        <span
          class="query-item"
          v-for="item in categoryList"
          :key="item.id"
          :class="{active: queryForm.categoryId === item.id}"
          @click="queryForm.categoryId = item.id"
        >{{item.name}}</span>
      </li>
      <li>
        <label>费用:</label>
        <span class="query-item" :class="{active: queryForm.chargeType === null}" @click="queryForm.chargeType = null">全部</span>
        <span
          class="query-item"
          v-for="item in chargeTypeList"
          :key="item.id"
          :class="{active: queryForm.chargeType === item.id}"
          @click="queryForm.chargeType = item.id"
        >{{item.name}}</span>
      </li>
    </ul>
    <ul class="template-list" v-loading="loading" v-infinite-scroll="loadMore" :infinite-scroll-disabled="noMore || loadingMore">
      <li v-for="item in templateList" :key="item.id">
        <div class="template-con">
          <el-image
            :src="item.thumbUrl"
            fit="cover">
          </el-image>
          <div class="template-mask">
            <qrcode class="qrcode-img" tag="img" :value="item.h5Url" :options="{
              width: 120,
              height: 120
            }" alt="二维码"/>
          </div>
          <p class="template-tag" :class="item.priceClass">
            {{item.priceStr}}
          </p>
        </div>
        <div class="bottom-opt">
          <p class="template-name">{{item.name}}</p>
          <el-button v-if="item.priceClass == 'charge'" type="danger" @click="buy(item)">
            立即购买
          </el-button>
          <el-button v-else plain type="primary" @click="createActivity(item)">
            创建活动
          </el-button>
        </div>
      </li>
      <p v-if="loadingMore" style="text-align: center;">加载中...</p>
    </ul>

    <template-dialog v-if="mode === '1'" v-model="showTemplate" :templateId="currentTemplate && currentTemplate.id" :type="type"></template-dialog>

    <wx-pay-dialog
      v-model="showPayCode"
      :outTradeNo="wxPayObj.outTradeNo"
      :codeUrl="wxPayObj.codeUrl"
      @refresh="buy()"
      @paySuccess="refresh()">
      <template v-if="currentTemplate">
        <!-- <p style="font-weight: bold; margin-bottom: 6px">招生帮模板【{{currentTemplate.name}}】</p> -->
        <p style="margin-bottom: 12px">
          需支付<span class="color-danger" style="font-weight: bold;">{{currentTemplate.priceStr}}</span>
          <span v-if="userInfo && userInfo.vipInfo" style="color: #999; font-size: 13px; margin-left: 8px;text-decoration: line-through;">原价:{{currentTemplate.price + '元'}}</span>
        </p>
      </template>
    </wx-pay-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import QRCode from '@/components/QRCode'
import WxPayDialog from '@/components/WxPayDialog'
import TemplateDialog from './TemplateDialog'

export default {
  props: {
    mode: String,
    typeList: Array
  },
  data() {
    return {
      loading: false,
      loadingMore: true,
      noMore: false,
      showTemplate: false,
      showPayCode: false,
      wxPayObj: {
        outTradeNo: '',
        codeUrl: ''
      },
      pageNum: 1,
      queryForm: {
        type: null,
        festivalId: null,
        categoryId: null,
        chargeType: null
      },
      festivalList: [],
      categoryList: [],
      templateList: [],
      chargeTypeList: [
        { id: 0, name: '免费' },
        { id: 1, name: '收费' },
        { id: 2, name: '已购买' }
      ],
      type: null,
      currentTemplate: null
    }
  },
  components: {
    [QRCode.name]: QRCode,
    WxPayDialog,
    TemplateDialog
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch',
      'userInfo'
    ])
  },
  created() {
    this._getFestivalList()
    this._getCategoryList()

    this._getBaseTemplate()
  },
  methods: {
    // 获取节假日选项数据
    _getFestivalList() {
      this.$http.get('/v1/DicFestival/getAllDicFestival').then(res => {
        this.festivalList = res.data
      })
    },
    // 获取风格选项数据
    _getCategoryList() {
      this.$http.get('/v1/DicBasicWebCategory/getAllDicBasicWebCategory').then(res => {
        this.categoryList = res.data
      })
    },
    _getBaseTemplate() {
      const params = Object.assign({}, this.queryForm)
      // 收费类型处理
      if (params.chargeType === 0) {
        params.price = 0
      } else if (params.chargeType === 1) {
        params.price = 1
      } else if (params.chargeType === 2) {
        params.payStatus = 1
      }
      params.pageNum = this.pageNum
      params.pageSize = 20
      params.organizationId = this.organizationInfo.id

      this.pageNum <= 1 ? this.loading = true : this.loadingMore = true
      this.$http.get('/v1/BasicWebTemplate/getBasicWebTemplateList', params).then(res => {
        if (res.data == null) {
          this.noMore = true
          return
        }
        if (res.data.length < 20) {
          this.noMore = true
        }
        res.data.forEach(item => {
          // TODO
          let typeName = ''
          switch (item.type) {
            case 0:
              typeName = 'leaflet'
              break
            case 1:
              typeName = 'bargain'
              break
            case 2:
              typeName = 'leaflet'
              break
            case 3:
              typeName = 'group'
              break
            case 4:
              typeName = 'leaflet'
              break
            case 5:
              typeName = 'groupv2'
              break
            default:
              typeName = 'leaflet'
              break
          }
          item.h5Url = `${process.env.VUE_APP_QINIU_CDN}/h5/${typeName}/${item.template}/index.html?templateId=${item.id}`

          item.data = JSON.parse(item.data)

          // 处理价格
          item.price = parseFloat((item.price / 100).toFixed(2))
          item.vipPrice = parseFloat((item.vipPrice / 100).toFixed(2))
          if (item.payStatus === 1) {
            item.priceStr = '已购买'
            item.priceClass = 'payed'
          } else {
            if (this.userInfo && this.userInfo.vipInfo) {
              // 会员
              if (item.vipPrice > 0) {
                item.priceStr = item.vipPrice + '元'
                item.priceClass = 'charge'
              } else {
                item.priceStr = '免费'
                item.priceClass = 'free'
              }
            } else {
              // 正常价格
              if (item.price > 0) {
                item.priceStr = item.price + '元'
                item.priceClass = 'charge'
              } else {
                item.priceStr = '免费'
                item.priceClass = 'free'
              }
            }
          }
        })
        if (this.pageNum <= 1) {
          this.templateList = res.data
        } else {
          this.templateList = this.templateList.concat(res.data)
        }
      }).finally(() => {
        this.loading = false
        this.loadingMore = false
      })
    },
    loadMore() {
      this.pageNum++
      this._getBaseTemplate()
    },
    createActivity(item) {
      this.type = item.type
      this.currentTemplate = item
      this.showTemplate = true
    },
    buy(item) {
      if (item != null) {
        this.currentTemplate = item
      }
      const loading = this.$loading({
        lock: true,
        text: '加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http.post('/v1/BuyGoodsOrder/zsbOrder', {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        targetGoodsType: 0,
        targetGoodsId: this.currentTemplate.id,
        goodDesc: `招生帮模板【${this.currentTemplate.name}】`,
        count: 1
      }).then(res => {
        this.wxPayObj = {
          outTradeNo: res.data.outTradeNo,
          codeUrl: res.data.codeUrl
        }
        this.showPayCode = true
      }).finally(() => {
        loading.close()
      })
    },
    refresh() {
      this.pageNum = 1
      this.queryForm.chargeType = 2
      this._getBaseTemplate()
    }
  },
  watch: {
    queryForm: {
      handler: function () {
        this.pageNum = 1
        this._getBaseTemplate()
      },
      deep: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.query-list
  li
    line-height 24px
    margin-bottom 12px
  label
    font-size 14px
    color $color-text-3
    margin-right 12px
  .query-item
    padding 0 10px
    border-radius 24px
    cursor pointer
    display inline-block
    &:hover
      background $color-background
    &+.query-item
      margin-left 8px
  .active
    color #ffffff
    background-color $color-danger !important

.template-list
  margin-top 24px
  overflow auto
  li
    display inline-block
    margin-right 20px
    margin-bottom 20px
    box-shadow 0 1px 8px #d8d8d8
    width 196px
    cursor pointer
    border-bottom-left-radius 3px
    border-bottom-right-radius 3px
    overflow hidden
    &:hover
      .template-mask
        display block
      .bottom-opt .el-button
        display inline-block
      .bottom-opt .template-name
        display none
  .template-con
    width 100%
    height 196px
    position relative
    .el-image
      width 100%
      height 100%
    .template-tag
      position absolute
      top 6px
      right -35px
      line-height 30px
      width 120px
      text-align center
      color #fff
      transform rotateZ(45deg)
      transform-origin center
      box-shadow 0 4px 12px #686868
      z-index 1
      font-size 14px
      &.free
        background #acacac
        font-size 16px
      &.charge
        background #e51a1a
      &.payed
        background $color-success
    .template-mask
      width 100%
      height 100%
      background rgba(0, 0, 0, 0.4)
      position absolute
      left 0
      top 0
      display none
      z-index 2
      .qrcode-img
        position absolute
        top 50%
        left 50%
        transform translate(-50%, -50%)
  .bottom-opt
    height 50px
    line-height 50px
    text-align center
    background #ffffff
    .el-button
      display none
</style>
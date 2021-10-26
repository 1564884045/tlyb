<template>
  <div id="app">
    <p v-if="!_isChrome()" class="chrome-tips">
      暂不支持该浏览器，请使用
      <a href="https://www.google.cn/chrome/" target="_blank" class="download-chrome">chrome浏览器</a> 体验更佳,
      <a href="https://www.google.cn/chrome/" target="_blank" class="download-chrome">点击此处</a>进行下载
    </p>
    <router-view />

    <p v-if="_isTest()" class="test-env">测试库环境</p>
  </div>
</template>

<script>
import { PhoneAreaCode } from '@/utils/storage'

export default {
  name: 'app',
  created() {
    this._initPhoneArea()
  },
  methods: {
    // 判断当前是否是chrome浏览器
    _isChrome() {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf('Chrome') > -1) {
        // 判断是否Chrome浏览器
        return true
      } else {
        return false
      }
    },
    _isTest() {
      return process.env.NODE_ENV === 'development'
    },
    _initPhoneArea() {
      this.$http.get('/api/phoneAreaCode').then((res) => {
        PhoneAreaCode.set(res.data)
        let initialArea = res.data.filter(item => {
          return item.areaCode === '+86'
        })
        PhoneAreaCode.setCurrentValidate(initialArea[0].regularExpression)
      })
    }
  }
}
</script>

<style lang="stylus">
@media screen and (max-width: 768px) {
  #app {
    min-width: 100vw !important;
    overflow-y: scroll;
  }
}

#app {
  min-width: 1200px;
}

.test-env {
  height: 50px;
  line-height: 50px;
  width: 300px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  background-color: $color-danger;
  position: fixed;
  top: 20px;
  left: -100px;
  z-index: 999;
  transform: rotate(-45deg);
}

.chrome-tips {
  background-color: #FAF1D1;
  width: 100%;
  height: 48px;
  text-align: center;
  line-height: 48px;

  .download-chrome {
    cursor: pointer;
    color: #3370ff;
  }
}

.custom-dialog
  .el-dialog__header
    border 1px solid #e4e7ed
    padding 0 20px
    background #f5f7fa
    font-size 16px
    color #303133
    line-height 40px
    color #333
  .el-dialog__headerbtn
    position absolute
    top 15px
    right 20px
    padding 0
    background 0 0
    border none
    outline 0
    cursor pointer
    font-size 16px
</style>

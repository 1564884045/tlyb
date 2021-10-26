<!-- 注册成功 -->
<template>
  <div class='registration-successful'>
    <img :src="require('_img/logo.png')" />
    <div class="register-txt">注册成功!</div>
    <div class="register-label">终于等到你 还好没放弃</div>
    <ul class='register-content'>
      <li style="color: #FD8334; font-weight: bold;">默认登陆密码【123456】</li>
      <li>请使用电脑登陆查看更多内容</li>
      <li>方法一：http://m.tlybond.com</li>
      <li>方法二：搜索“桃李云帮官网”</li>
    </ul>
  </div>
</template>

<script>

export default {
  name: '',
  props: {},
  data () {
    return {
    }
  },
  components: {},
  watch: {},
  computed: {},
  created () {},
  mounted () {},
  methods: {}
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
  .registration-successful {
    // text-align center
    position relative
    padding 30px
    img {
      width 100px
      position absolute
      top 20px
      left 15px
    }
    .register-txt {
      margin-top 15vh
      font-size 40px
      font-weight bold
      color #FD8334
    }
    .register-label {
      font-size 14px
      color #999
    }
    .register-content {
      margin 10vh 0 0 30px
      width 100%
      li {
        padding 5px 0
        list-style-type: square
      }
    }
  }
</style>

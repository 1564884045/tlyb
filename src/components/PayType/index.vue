<template>
  <ul class="pay-type-list">
    <li v-for="item in payTypeList" :key="item.value" :class="{active: item.value === type}" @click="handleChange(item.value)">
      <img :src="item.icon"/>
      <span>{{item.label}}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'PayType',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: [Number, String]
  },
  data() {
    return {
      type: '',
      payTypeList: [
        {
          value: 0,
          label: '微信',
          icon: require('@/assets/icon_wechat.png')
        },
        {
          value: 1,
          label: '支付宝',
          icon: require('@/assets/icon_alipay.png')
        },
        {
          value: 2,
          label: '现金',
          icon: require('@/assets/icon_cash.png')
        },
        {
          value: 3,
          label: '刷卡',
          icon: require('@/assets/icon_pos_card.png')
        }
      ]
    }
  },
  methods: {
    handleChange(val) {
      this.type = val
      this.$emit('change', val)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.type = val
        this.$emit('change', val)
      }
    }
  }
}
</script>

<style lang="stylus">
.pay-type-list
  height 32px
  li
    display inline-block
    border 1px solid $color-border-1
    border-radius 3px
    font-size 12px
    padding 5px 10px
    position relative
    overflow hidden
    cursor pointer
    box-sizing border-box
    line-height 1
    &+li
      margin-left 12px
    img
      width 18px
      height 18px
      margin-right 4px
      vertical-align middle
    span
      vertical-align middle
  .active
    border-color $color-primary
    &::after
      content ''
      display block
      position absolute
      bottom 0
      right 0
      background-image url(../../assets/icon_checked_right_bottom.png)
      background-size cover
      width 20px
      height 20px
</style>
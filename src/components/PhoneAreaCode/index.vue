<template>
  <el-select style="width: 80px; margin-right: 10px" v-model="currentAreaCode" @change="checkPhoneAreaCode" filterable placeholder="请选择">
    <el-option v-for="item in phoneAreaCodeArr" :key="item.id" :label="item.areaCode" :value="item.areaCode">
      <span style="float: left">{{ item.areaCode }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ item.countryName }}</span>
    </el-option>
  </el-select>
</template>

<script>
import { PhoneAreaCode } from '@/utils/storage'
export default {
  name: 'PhoneAreaCode',
  data() {
    return {
      currentAreaCode: '+86', // 默认地区码
      phoneAreaCodeArr: [] // 手机地区码
    }
  },
  created() {
    this._initPhoneAreaCode()
    this.currentAreaCode = PhoneAreaCode.getCheck()
  },
  watch: {
    currentAreaCode(val) {
      let currentArea = this.phoneAreaCodeArr.filter(item => {
        return item.areaCode === val
      })
      PhoneAreaCode.setCurrentValidate(currentArea[0].regularExpression)
    }
  },
  methods: {
    // 获取下拉数据
    _initPhoneAreaCode() {
      this.phoneAreaCodeArr = PhoneAreaCode.get()
      this.phoneAreaCodeArr.forEach(item => {
        if (item.areaCode === '+86') {
          PhoneAreaCode.setCurrentValidate(item.regularExpression)
        }
      })
    },
    // 记录本次操作
    checkPhoneAreaCode() {
      PhoneAreaCode.setCheck(this.currentAreaCode)
      this.$emit('getPhoneAreaCode', this.currentAreaCode)
    },
    // 回显
    setAreaCode(e) {
      this.currentAreaCode = e
    }
  }
}
</script>

<style>
</style>
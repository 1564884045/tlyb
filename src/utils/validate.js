/*
 * @Author: xukai
 * @name: 文件名
 * @Description: 描述
 * @Date: 2020-08-23 08:59:51
 * @LastEditors: xukai
 * @LastEditTime: 2020-09-03 15:49:08
 */
// 手机号正则
// export const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[01235678]|18[0-9]|19[1589])\d{8}$/
// 邮箱校验
import { PhoneAreaCode } from '@/utils/storage'

export const mailReg = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
// 身份证号正则
export const idReg = /^[1-9]\d{5}(18|19|2([0-9]))\d{2}(0[0-9]|10|11|12)([0-2][0-9]|30|31)\d{3}[0-9Xx]$/
// 密码正则
export const passwordReg = /^(\w){6,20}$/

// 定义校验全局的变量
// 号码校验
export const phoneValidator = (rule, value, callback) => {
  // console.log(PhoneAreaCode.getCurrentValidate())
  // eslint-disable-next-line no-eval
  const phoneReg = eval(PhoneAreaCode.getCurrentValidate())
  if (!value) {
    if (rule.required) {
      callback(new Error('请输入手机号码'))
    } else {
      callback()
    }
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}
// 邮箱校验
export const emailValidator = (rule, value, callback) => {
  if (!value) {
    if (rule.required) {
      callback(new Error('请输入邮箱'))
    } else {
      callback()
    }
  } else if (!mailReg.test(value)) {
    callback(new Error('请输入正确的邮箱'))
  } else {
    callback()
  }
}
// 身份证号校验
export const idCardValidator = (rule, value, callback) => {
  if (!value) {
    if (rule.required) {
      callback(new Error('请输入身份证号'))
    } else {
      callback()
    }
  } else if (!idReg.test(value)) {
    callback(new Error('请输入正确的身份证号'))
  } else {
    callback()
  }
}
// 密码校验
export const passwordValidator = (rule, value, callback) => {
  if (!value) {
    if (rule.required) {
      callback(new Error('请输入密码'))
    } else {
      callback()
    }
  } else if (!passwordReg.test(value)) {
    callback(new Error('请输入由字母和数字组合的6-20位密码'))
  } else {
    callback()
  }
}

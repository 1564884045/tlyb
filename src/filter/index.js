import Vue from 'vue'
import { formatNumber, convertMoney } from './format'

Vue.filter('formatNumber', formatNumber)
Vue.filter('convertMoney', convertMoney)
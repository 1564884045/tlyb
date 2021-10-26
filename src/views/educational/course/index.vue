<!-- 课程管理板块 -->
<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane :label="item.label" :name="item.name" v-for="(item, index) in tabList" :key="index"></el-tab-pane>
    </el-tabs>
    <keep-alive :include="['CourseManagement']">
      <component :is="activeComponent" :listenTab="listenTab" @changeTab="handleChangeTab"></component>
    </keep-alive>
  </div>
</template>

<script>
import course from './courseManagement'
import feeStandard from './feeStandard'
import tuitionFee from './tuitionFee'
import courseType from './courseType'
import semester from './semester'

export default {
  name: 'Course',
  data () {
    return {
      activeName: '1',
      listenTab: null, // 监听的tab页面
      tabList: [
        {
          label: '课程管理',
          name: '1',
          component: course
        },
        {
          label: '收费套餐',
          name: '2',
          component: feeStandard
        },
        {
          label: '学杂管理',
          name: '3',
          component: tuitionFee
        },
        {
          label: '课程类别',
          name: '4',
          component: courseType
        },
        {
          label: '学期管理',
          name: '5',
          component: semester
        }
      ],
      activeCourseDialog: false // 是否需要缓存课程弹窗
    }
  },
  computed: {
    activeComponent() {
      return this.tabList.find(o => o.name === this.activeName).component
    }
  },
  methods: {
    /**
     * 内部页面跳转到其他的tab
     * tabName 跳转的tab页面
     * isKeepAlive 是否缓存当前弹窗
     */
    handleChangeTab(tabName) {
      this.listenTab = tabName
      this.activeName = tabName
    }
  }
}

</script>
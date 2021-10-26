<!-- 基础信息完善 -->
<template>
  <div class="base-info-wrapper">
    <div class="container">
      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
      </el-tabs>
      <component :is="activeComponent" class="tab-panel-wrapper"/>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'BaseInfo',
  data () {
    return {
      activeTab: 'orgInfo',
      allTabList: [
        {
          name: 'orgInfo',
          label: '机构信息',
          component: () => import('./organizationInfo')
        },
        {
          name: 'branchInfo',
          label: '校区信息',
          component: () => import('./schoolInfo/schoolInfoMany')
        },
        {
          name: 'holiday',
          label: '节假日',
          component: () => import('./holiday')
        },
        {
          name: 'surroundSchool',
          label: '周边学校',
          component: () => import('./surroundSchool')
        },
        {
          name: 'classroom',
          label: '教室管理',
          component: () => import('./classroom')
        },
        {
          name: 'notice',
          label: '通知设置',
          component: () => import('./notice')
        },
        {
          name: 'printSetting',
          label: '打印配置',
          component: () => import('./printSetting')
        },
        {
          name: 'device',
          label: '设备管理',
          component: () => import('./device')
        },
        {
          name: 'dictionary',
          label: '来源渠道',
          component: () => import('./dictionary')
        },
        {
          name: 'punchSetting',
          label: '考勤设置',
          component: () => import('./punchSetting')
        }
      ]
    }
  },
  computed: {
    tabList() {
      if (this.settingMenu == null) return

      return this.allTabList.filter(m => this.settingMenu.children.find(n => n.url === m.name))
    },
    activeComponent() {
      const tab = this.tabList.find(o => o.name === this.activeTab)
      return tab == null ? null : tab.component
    },
    ...mapGetters([
      'sidebar',
      'settingMenu'
    ])
  },
  created() {
    const tab = this.$route.query.tab
    if (tab && this.tabList.find(o => o.name === tab)) {
      this.activeTab = tab
    }
    const tabItem = this.tabList.find(o => o.name === this.activeTab)
    if (tabItem == null && this.tabList.length > 0) {
      this.activeTab = this.tabList[0].name
    }
  }
}
</script>

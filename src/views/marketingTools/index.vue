<template>
  <el-tabs v-model="mode" type="border-card" class="marketing-tools">
    <el-tab-pane label="我的作品" class="tools-panel">
      <!-- 传递mode，保证TemplateDialog只有一个实例 -->
      <org-activity ref="orgActivity" :typeList="typeList" :mode="mode" @toggleMode="(mode) => this.mode=mode"></org-activity>
    </el-tab-pane>
    <el-tab-pane label="模板库" class="tools-panel">
      <base-template :typeList="typeList" :mode="mode"></base-template>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import BaseTemplate from './BaseTemplate'
import OrgActivity from './OrgActivity'

export default {
  name: 'MarketingTools',
  data() {
    return {
      mode: '0',
      typeList: [
        {
          value: 0,
          name: 'leaflet',
          label: '微传单'
        },
        {
          value: 1,
          name: 'bragain',
          label: '砍价'
        },
        // {
        //   value: 2,
        //   name: 'leaflet',
        //   label: '助力'
        // },
        {
          value: 3,
          name: 'leaflet',
          label: '拼团'
        },
        // {
        //   value: 4,
        //   name: 'leaflet',
        //   label: '0元购'
        // }
        {
          value: 5,
          name: 'groupv2',
          label: '超级拼团'
        }
      ]
    }
  },
  components: {
    BaseTemplate,
    OrgActivity
  },
  watch: {
    mode() {
      this.$refs.orgActivity && this.$refs.orgActivity.query()
    }
  }
}
</script>

<style lang="stylus" scope>
.marketing-tools
  box-shadow 0 1px 3px $color-border-2
  .tools-panel
    min-height 400px
</style>

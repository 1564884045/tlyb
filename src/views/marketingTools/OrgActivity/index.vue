<template>
  <div class="org-activity">
    <el-radio-group v-model="currentType" size="small" class="type-radio">
      <el-radio-button :label="0">微传单</el-radio-button>
      <el-radio-button :label="1">砍价</el-radio-button>
      <!-- <el-radio-button :label="2">助力</el-radio-button> -->
      <el-radio-button :label="3">拼团</el-radio-button>
      <!-- <el-radio-button :label="4">0元购</el-radio-button> -->
      <el-radio-button :label="5">超级拼团</el-radio-button>
    </el-radio-group>
    <div class="query-form" style="padding: 12px 0;">
      <el-input v-model="name" :maxlength="30" placeholder="请输入活动名称" @keyup.native.enter="query" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <!-- <el-select v-model="status" placeholder="请选择活动状态" @change="query" style="margin-left:15px;">
        <el-option
          v-for="item in tmpOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select> -->
      <el-button icon="el-icon-refresh" plain circle title="刷新" @click="query" style="margin-left: 12px;"></el-button>
      <div class="right-btns">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="$emit('toggleMode', '1')">新建活动</el-button>
      </div>
    </div>

    <leaflet-list v-if="currentType === 0" ref="leaflet" :name="name" @edit="editTemplate" @show="showTemplateDetail"></leaflet-list>
    <bargain-list v-else-if="currentType === 1" ref="bargain" :name="name" @edit="editTemplate" @show="showTemplateDetail"></bargain-list>
    <group-list v-else-if="currentType === 3" ref="group" :name="name" @edit="editTemplate" @show="showTemplateDetail"></group-list>
    <groupv2-list v-else-if="currentType === 5" ref="groupv2" :name="name" @edit="editTemplate" @show="showTemplateDetail"></groupv2-list>

    <template-dialog
      v-if="mode === '0'"
      v-model="showTemplate"
      :activityId="currentActivity && currentActivity.id"
      :templateId="currentActivity && currentActivity.templateId"
      :type="currentType"
      :isShowMode="isShowMode"
      @toggle="isShowMode = false"
      @refresh="query">
    </template-dialog>
  </div>
</template>

<script>
import LeafletList from './LeafletList'
import BargainList from './BargainList'
import GroupList from './GroupList'
import Groupv2List from './Groupv2List'
import TemplateDialog from '../TemplateDialog'

export default {
  name: 'OrgActivity',
  props: {
    mode: String,
    typeList: Array
  },
  data() {
    return {
      currentType: 0,
      name: '',
      status: null,
      showTemplate: false,
      isShowMode: false,
      currentActivity: null,
      microWebOptions: [
        { value: 0, label: '未上架' },
        { value: 1, label: '已上架' },
        { value: 2, label: '已下架' }
      ],
      reduceWebOptions: [
        { value: 0, label: '未上架' },
        { value: 1, label: '已上架' },
        { value: 2, label: '已下架' },
        { value: 3, label: '已结算' }
      ],
      groupPurchaseWebOptions: [
        { value: 0, label: '未上架' },
        { value: 1, label: '已上架' },
        { value: 2, label: '已下架' },
        { value: 3, label: '已结算' }
      ],
      commonGroupPurchaseWebOptions: [
        { value: 0, label: '未上架' },
        { value: 1, label: '已上架' },
        { value: 2, label: '已下架' },
        { value: 3, label: '已结算' }
      ],
      // 默认为微传单
      tmpOptions: [
        { value: 0, label: '未上架' },
        { value: 1, label: '已上架' },
        { value: 2, label: '已下架' }
      ]
    }
  },
  components: {
    LeafletList,
    BargainList,
    GroupList,
    Groupv2List,
    TemplateDialog
  },
  methods: {
    query() {
      switch (this.currentType) {
        case 0:
          this.tmpOptions = this.microWebOptions
          this.$refs.leaflet && this.$refs.leaflet.query()
          break
        case 1:
          this.tmpOptions = this.reduceWebOptions
          this.$refs.bargain && this.$refs.bargain.query()
          break
        case 3:
          this.tmpOptions = this.groupPurchaseWebOptions
          this.$refs.group && this.$refs.group.query()
          break
        case 5:
          this.tmpOptions = this.commonGroupPurchaseWebOptions
          this.$refs.groupv2 && this.$refs.groupv2.query()
          break
      }
    },
    showTemplateDetail(activity) {
      this.isShowMode = true
      this.showTemplate = true
      this.currentActivity = activity
    },
    editTemplate(activity) {
      this.isShowMode = false
      this.showTemplate = true
      this.currentActivity = activity
    }
  },
  watch: {
    currentType() {
      this.query()
    }
  }
}
</script>

<style lang="stylus">
.org-activity
  .type-radio .el-radio-button__inner
    width 80px
    font-size 14px
</style>
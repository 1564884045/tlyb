<!--  -->
<template>
  <el-dialog :title="'版本权益'" top="6vh" :visible.sync="showPersonInfo" :close-on-click-modal="false" append-to-body width="600px" @close="toggle(false)">
    <div style="margin-bottom: 10px">
      <span class="title">版本名称：</span>
      {{systemAuthInfo.versionsName}}
    </div>
    <div class="system">
      <div style="width: 300px; max-width: 300px">
        <div style="margin-bottom: 10px">
          <span class="title">最大员工数：</span>
          {{systemAuthInfo.versionsTeacherLimit}}人
        </div>
        <div style="margin-bottom: 10px">
          <span class="title">最大分校数：</span>
          {{systemAuthInfo.versionsBranchLimit}}家
        </div>
      </div>

      <div>
        <div style="margin-bottom: 10px">
          <span class="title">最大学员数：</span>
          {{systemAuthInfo.versionsStudentLimit}}人
        </div>
        <div style="margin-bottom: 10px">
          <span class="title">有效期至：</span>
          <span style="color: #ff6600; font-size: 17px">{{systemAuthInfo.endValidateTime ? systemAuthInfo.endValidateTime.slice(0, 10) : '--'}}</span>
        </div>
      </div>
    </div>

    <div>
        <span style="color: #ff6600;" class="title">版本特权：</span>
        <div style="padding: 10px 10px 10px 30px; line-height: 28px;">
          <div v-if="!systemAuthInfo.rights">~~</div>
          <div v-for="item in systemAuthInfo.rights" v-else :key="item.id">
            <span style="color: #ff6600; margin-right: 10px">{{item.name}}</span>
            <span>{{item.remark}}</span>
          </div>
        </div>
    </div>
    <div>
      <span class="title">版本介绍：</span>
      {{systemAuthInfo.versionsRemark || '~~'}}
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { SystemAuthInfo } from '@/utils/user'

export default {
  name: 'VersionsRight',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  computed: {
    ...mapGetters(['userInfo', 'organizationInfo', 'currentBranch'])
  },
  watch: {
    value(val) {
      this.showPersonInfo = val
      if (val) {
        this.systemAuthInfo = SystemAuthInfo.get()
        if (this.systemAuthInfo.rights) {
          this.systemAuthInfo.rights = JSON.parse(this.systemAuthInfo.rights)
        }
      }
    }
  },
  data() {
    return {
      showPersonInfo: this.value,
      systemAuthInfo: {}
    }
  },
  methods: {
    toggle(val) {
      this.$emit('toggle', val)
    }
  }
}
</script>

<style lang='stylus' scoped>
.system
  display flex
.title
  font-weight bold
  // color #ff6600
>>>.el-dialog__header
  background-color #eeeeee
</style>

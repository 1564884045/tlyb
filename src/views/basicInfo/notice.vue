<!-- 通知 -->
<template>
  <div class="notify-content" v-loading="queryLoading">
    <p class="title">老师端</p>
    <el-table
      :data="teacherNotifies"
      stripe>
      <el-table-column
        prop="notificationName"
        label="触发条件"
        width="160">
      </el-table-column>
      <el-table-column
        prop="notificationDesc"
        label="通知描述"
        min-width="220">
      </el-table-column>
      <el-table-column
        prop="defaultRemark"
        label="描述"
        min-width="220">
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{scope.row.remark}}</span>
          <span v-else>{{scope.row.defaultRemark}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatTitle"
        align="center"
        width="140"
        label="微信标题">
        <div slot-scope="scope">{{scope.row.wechatTitle ? scope.row.wechatTitle : '-'}}</div>
      </el-table-column>
      <!-- <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatNumber"
        align="center"
        width="140"
        label="微信编号">
        <div slot-scope="scope">{{scope.row.wechatNumber ? scope.row.wechatNumber : '-'}}</div>
      </el-table-column>
      <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatTemplateId"
        align="center"
        min-width="325"
        label="微信模板id">
        <div slot-scope="scope">{{scope.row.wechatTemplateId ? scope.row.wechatTemplateId : '-'}}</div>
      </el-table-column> -->
      <el-table-column
        prop="appStr"
        label="微信通知"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-switch v-if="scope.row.hasAppNotification" class="el-switch-cutomer" :value="scope.row.appNotificationStatus" :width="62" size="mini" :active-value="1" :inactive-value="0" @click.native="handleToggleStatus(scope.row, 'appNotificationStatus')"></el-switch>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column
        prop="smsStr"
        label="短信通知"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-switch v-if="scope.row.hasSmsNotification" class="el-switch-cutomer" :value="scope.row.smsNotificationStatus" :width="62" size="mini" :active-value="1" :inactive-value="0" @click.native="handleToggleStatus(scope.row, 'smsNotificationStatus')"></el-switch>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="220"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="handlePreviewImage(scope.row)">查看效果图</el-button>
          <el-button v-if="organizationInfo.openWechatDeploy === 1" type="text" @click="handleUpdateRemark(scope.row)">更改描述</el-button>
          <!-- <el-button  v-if="organizationInfo.openWechatDeploy === 1" type="text" @click="setWechatTemplateId(scope.row)">设置微信模板id</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <p class="title">家长端 </p>
    <el-table
      :data="parentNotifies"
      stripe>
      <el-table-column
        prop="notificationName"
        label="触发条件"
        width="160">
      </el-table-column>
      <el-table-column
        prop="notificationDesc"
        label="通知描述"
        min-width="325">
      </el-table-column>
      <el-table-column
        prop="defaultRemark"
        label="描述"
        min-width="220">
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{scope.row.remark}}</span>
          <span v-else>{{scope.row.defaultRemark}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatTitle"
        align="center"
        width="140"
        label="微信标题">
        <div slot-scope="scope">{{scope.row.wechatTitle ? scope.row.wechatTitle : '-'}}</div>
      </el-table-column>
      <!-- <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatNumber"
        align="center"
        width="140"
        label="微信编号">
        <div slot-scope="scope">{{scope.row.wechatNumber ? scope.row.wechatNumber : '-'}}</div>
      </el-table-column>
      <el-table-column
        v-if="organizationInfo.openWechatDeploy === 1"
        prop="wechatTemplateId"
        align="center"
        min-width="320"
        label="微信模板id">
        <div slot-scope="scope">{{scope.row.wechatTemplateId ? scope.row.wechatTemplateId : '-'}}</div>
      </el-table-column> -->
      <el-table-column
        prop="appStr"
        label="微信通知"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-switch v-if="scope.row.hasAppNotification" class="el-switch-cutomer" :value="scope.row.appNotificationStatus" :width="62" size="mini" :active-value="1" :inactive-value="0" @click.native="handleToggleStatus(scope.row, 'appNotificationStatus')"></el-switch>
          <template v-else>--</template>
        </template>
      </el-table-column>
      <el-table-column
        prop="smsStr"
        label="短信通知"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-switch v-if="scope.row.hasSmsNotification" class="el-switch-cutomer" :value="scope.row.smsNotificationStatus" :width="62" size="mini" :active-value="1" :inactive-value="0" @click.native="handleToggleStatus(scope.row, 'smsNotificationStatus')"></el-switch>
          <template v-else>--</template>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="220"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="handlePreviewImage(scope.row)">查看效果图</el-button>
          <el-button v-if="organizationInfo.openWechatDeploy === 1" type="text" @click="handleUpdateRemark(scope.row)">更改描述</el-button>
          <!-- <el-button v-if="organizationInfo.openWechatDeploy === 1" type="text" @click="setWechatTemplateId(scope.row)">设置微信模板id</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 图片预览 -->
    <photo-preview ref="photoPreview" :list="imgs"></photo-preview>
    <!-- 更改描述弹框 -->
    <el-dialog
      title="描述内容"
      :visible.sync="noticeDialogVisible"
      width="30%"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="handleRemarkClose">
      <el-input type="textarea" placeholder="请输入通知内容" v-model.trim="remark" maxlength="50" show-word-limit ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleRemarkClose">取 消</el-button>
        <el-button type="primary" @click="handleRemarkSubmit" :loading="remarkSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 微信模板id -->
    <el-dialog
      title="设置微信模板id"
      :visible.sync="setWechatTemplateIdShow"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="30%">
      <el-input type="text" placeholder="请输入模板id" v-model="wechatTemplateId" maxlength="120" show-word-limit ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setWechatTemplateIdShow = false">取 消</el-button>
        <el-button type="primary" @click="sureWechatTemplateId">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PhotoPreview from '../../components/PhotoPreview'
import { mapGetters } from 'vuex'

export default {
  name: 'Notice',
  data () {
    return {
      remarkSubmitLoading: false,
      queryLoading: false,
      noticeDialogVisible: false,
      teacherNotifies: [],
      parentNotifies: [],
      imgs: [],
      setWechatTemplateIdShow: false,
      wechatTemplateId: '',
      currentNotificationId: '',
      remark: null
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo'
    ])
  },
  components: {
    PhotoPreview
  },
  created () {
    this._getNotificationList()
  },
  methods: {
    _getNotificationList() {
      this.queryLoading = true
      this.$http.get('/v1/OrganizationNotification/getOrganizationNotificationList', {
        orgId: this.$store.getters.organizationInfo.id
      }).then(res => {
        res.data.forEach(item => {
          item.defaultRemark = item.defaultRemark ? item.defaultRemark.replace('#orgName#', this.organizationInfo.name) : ''
        })
        this.parentNotifies = res.data.filter(o => o.notificationType === 1)
        this.teacherNotifies = res.data.filter(o => o.notificationType === 0)
      }).finally(() => {
        this.queryLoading = false
      })
    },
    handleToggleStatus(row, key) {
      const params = {
        organizationId: row.organizationId,
        notificationId: row.notificationId
      }
      params[key] = row[key] ? 0 : 1

      this.$confirm(`是否${params[key] ? '启用' : '禁用'}【${row.notificationName}】${key === 'smsNotificationStatus' ? '短信' : '应用内'}通知`, '提示').then(() => {
        this.$http.put('/v1/OrganizationNotification/updateOrganizationNotification', params).then(() => {
          this.$message.success(`${params[key] ? '启用' : '禁用'}${key === 'smsNotificationStatus' ? '短信' : '应用内'}通知成功！`)
          this._getNotificationList()
        })
      })
    },
    // 更改描述弹框
    handleUpdateRemark(row) {
      this.currentNotificationId = row.notificationId
      this.remark = row.remark ? row.remark : row.defaultRemark.split('-')[1]
      this.noticeDialogVisible = true
    },
    // 通知内容取消
    handleRemarkClose() {
      this.noticeDialogVisible = false
      this.remark = null
    },
    // 通知内容确定
    handleRemarkSubmit() {
      if (this.remark !== null) {
        this.remarkSubmitLoading = true
        const param = {
          organizationId: this.organizationInfo.id,
          notificationId: this.currentNotificationId,
          remark: this.remark
        }
        this.$http.put('/v1/OrganizationNotification/updateOrganizationNotification', param).then(res => {
          this.$message({ type: 'success', message: '更改描述内容成功' })
          this.handleRemarkClose()
          this._getNotificationList()
        }).finally(() => {
          this.remarkSubmitLoading = false
        })
      } else {
        return this.$message({ type: 'warning', message: '请先输入通知内容' })
      }
    },
    handlePreviewImage(row) {
      const temp = []
      if (row.hasAppNotification) {
        temp.push({
          title: row.notificationName + ' - 应用端效果图',
          src: row.appPreviewPictureTemp || row.appPreviewPicture
        })
      }
      if (row.hasSmsNotification) {
        temp.push({
          title: row.notificationName + ' - 短信效果图',
          src: row.smsPreviewPictureTemp || row.smsPreviewPicture
        })
      }
      this.imgs = temp
      this.$refs.photoPreview.show()
    },
    /**
     * 打开设置微信模板id的对话框
     */
    setWechatTemplateId(row) {
      this.currentNotificationId = row.notificationId
      this.wechatTemplateId = row.wechatTemplateId ? row.wechatTemplateId : ''
      this.setWechatTemplateIdShow = true
    },
    /**
     * 设置微信模板id
     */
    sureWechatTemplateId() {
      if (!this.wechatTemplateId) {
        this.$message.error(`微信模板id不能为空！`)
        return
      }
      const params = {
        organizationId: this.organizationInfo.id,
        notificationId: this.currentNotificationId,
        wechatTemplateId: this.wechatTemplateId
      }
      this.$http.put('/v1/OrganizationNotification/updateOrganizationNotification', params).then(() => {
        this.$message.success(`设置微信模板id通知成功！`)
        this.setWechatTemplateIdShow = false
        this._getNotificationList()
      })
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.notify-content
  padding 12px
  background #ffffff
  .title
    font-size 16px
    color $color-primary
    line-height 40px
    margin-top 30px
    &:first-child
      margin-top -8px
    .el-button
      margin-left 40px
  .el-table
    border 1px solid $color-border-1
    &:before
      display none
</style>

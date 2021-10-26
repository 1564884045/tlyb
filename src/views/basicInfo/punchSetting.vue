<!-- 考勤设置 -->
<template>
  <div class="container" :loading="loading">
    <div class="content-top">
      <div class="info">
        <p>考勤说明：</p>
        <ol>
          <li>若未设置考勤时间，那么所有考勤都默认为正常考勤，不会被标识为迟到或早退。</li>
          <li>目前系统默认考勤机制为：第一次考勤为上班打卡，第二次为下班打卡，所以员工考勤时，请务必给员工说明清楚，系统考勤机制与是否设置了考勤时间无关。</li>
          <li>若设置了考勤时间的，是否迟到或早退则会以设置的考勤时间为基准。</li>
          <li>由于不同的机构考勤不一样，且有的老师可能实行的是不定时间考勤机制，所以目前桃李云帮的考勤时间设置机制为覆盖每一天，只为机构提供考勤参考记录。</li>
        </ol>
      </div>
      <el-form class="form" ref="form" :rules="rules" :model="punchSettingForm" label-width="80px">
        <el-form-item label="上班时间" prop="startPunchTime">
          <el-time-select
            placeholder="请选择上班时间"
            v-model="punchSettingForm.startPunchTime"
            value-format="HH:mm"
            :picker-options="{
                start: '06:00',
                step: '00:05',
                end: '23:30'
                }"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="下班时间" prop="endPunchTime">
          <el-time-select
            placeholder="请选择下班时间"
            v-model="punchSettingForm.endPunchTime"
            value-format="HH:mm"
            :picker-options="{
                start: '12:00',
                step: '00:05',
                end: '23:30',
                minTime: punchSettingForm.startPunchTime
                }"
          ></el-time-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="submitPunchSetting">提交设置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="course-switch" v-if="false">
      <p class="title">设置机构设备权限</p>
      <el-form label-width="100px" style="width: 560px">
        <el-form-item label="刷卡课消">
          <el-switch @change="upEnableCardCourseMinus(0)" v-model="courseMinus[0]" :disabled="switchDisabled[0]" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭"></el-switch>
        </el-form-item>
        <el-form-item label="人脸课消">
          <el-switch @change="upEnableCardCourseMinus(1)" v-model="courseMinus[1]" :disabled="switchDisabled[1]" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭"></el-switch>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PunchSetting',
  data() {
    return {
      switchDisabled: [false, false],
      courseMinus: [0, 0],
      openCourseMinusTime: [new Date().getTime(), new Date().getTime()],
      minusTimeNum: true,
      loading: false,
      submitLoading: false,
      punchSettingForm: {
        startPunchTime: null,
        endPunchTime: null
      },
      rules: {
        startPunchTime: [
          { required: true, message: '请填选择上班时间', trigger: 'blur' }
        ],
        endPunchTime: [
          { required: true, message: '请填选择下班时间', trigger: 'blur' }
        ]
      }
    }
  },
  // 生命周期 - 创建完成
  created() {
    this.getPunchSetting()
  },
  // 相关方法
  methods: {
    getPunchSetting() {
      this.loading = true
      this.$http
        .get('/v1/SettingUserPunch/getSettingUserPunchById', {
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id
        })
        .then((res) => {
          if (res.data) {
            if (res.data.startPunchTime) {
              res.data.startPunchTime = res.data.startPunchTime.substring(0, 5)
            }
            if (res.data.endPunchTime) {
              res.data.endPunchTime = res.data.endPunchTime.substring(0, 5)
            }
            this.punchSettingForm = res.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 提交考勤设置
    submitPunchSetting() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          if (this.punchSettingForm.organizationId) {
            // 更新
            const params = {
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              startPunchTime: this.punchSettingForm.startPunchTime + ':00',
              endPunchTime: this.punchSettingForm.endPunchTime + ':00'
            }
            this.$http
              .put('/v1/SettingUserPunch/updateSettingUserPunch', params)
              .then((res) => {
                this.punchSettingForm.organizationId = params.organizationId
                this.punchSettingForm.departmentId = params.departmentId
                this.$message.success('更改设置成功')
              })
              .finally(() => {
                this.submitLoading = false
              })
          } else {
            const params = {
              organizationId: this.organizationInfo.id,
              departmentId: this.currentBranch.id,
              startPunchTime: this.punchSettingForm.startPunchTime + ':00',
              endPunchTime: this.punchSettingForm.endPunchTime + ':00'
            }
            this.$http
              .post('/v1/SettingUserPunch/addSettingUserPunch', params)
              .then((res) => {
                this.punchSettingForm.organizationId = params.organizationId
                this.punchSettingForm.departmentId = params.departmentId
                this.$message.success('设置成功')
              })
              .finally(() => {
                this.submitLoading = false
              })
          }
        }
      })
    },
    // 刷卡扣课时开关
    upEnableCardCourseMinus(item) {
      if (this.minusTimeNum) {
        this.minusTimeNum = false
      } else if (new Date().getTime() - this.openCourseMinusTime[item] < 3000) {
        this.$message.warning('请勿频繁操作，3秒后再次尝试')
        this.courseMinus[item] = this.courseMinus[item] ? 0 : 1
        return
      }
      let param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      switch (item) {
        case 0:
          // 是否开启刷卡课消(0-否，1-是)
          param.enableCardCourseMinus = this.courseMinus[0]
          sessionStorage.setItem(
            'enableCardCourseMinus',
            param.enableCardCourseMinus
          )
          break
        default:
          // 是否开启人脸课消(0-否，1-是)
          param.enableFaceCourseMinus = this.courseMinus[1]
          sessionStorage.setItem(
            'enableFaceCourseMinus',
            param.enableFaceCourseMinus
          )
      }
      this.$http
        .put('/v1/DeviceAuth/openOrCloseAutoCourseMinus', param)
        .then((res) => {
          if (this.courseMinus[item]) {
            this.$message.success(
              `${item ? '【人脸课消】' : '【刷卡课消】'}已开启`
            )
          } else {
            this.$message.warning(
              `${item ? '【人脸课消】' : '【刷卡课消】'}已关闭`
            )
          }
        })
      this.openCourseMinusTime[item] = new Date().getTime()
    }
  },
  computed: {
    ...mapGetters(['organizationInfo', 'currentBranch'])
  },
  // 生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
}
</script>
<style lang="stylus" scoped>
/* @import url(); 引入css类 */
.container
  .content-top
    background-color #ffffff
    padding 20px
  .info
    border 1px dashed $color-primary
    border-radius 5px
    margin 0 0 20px 0
    p
      color $color-primary
      margin 10px 0 0 25px
      font-weight bold
      font-size 15px
    ol
      li
        color $color-primary
        margin-bottom 5px
  .course-switch
    margin-top 30px
    background-color #ffffff
    padding 20px
    p
      height 40px
      line-height 40px
      margin-bottom 10px
      font-size 15px
      font-weight bold
      padding-left 15px
      border-bottom 1px dashed #ddd
</style>

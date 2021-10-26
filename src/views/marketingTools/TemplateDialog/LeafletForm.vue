<template>
  <el-form ref="templateForm" :model="templateForm" :rules="rules" label-width="88px" class="leafleft-form">
    <div class="form-title">
      <span class="color-primary">基础信息</span>
    </div>
    <el-form-item label="活动名称" prop="activityName">
      <el-input v-model="templateForm.activityName" :maxlength="50" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="活动时间" prop="activityTimeRange">
      <el-date-picker
        v-model="templateForm.activityTimeRange"
        type="daterange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="封面图" prop="backImageUrl">
      <div class="img-con">
        <img v-if="templateForm.backImageUrl" :src="templateForm.backImageUrlTemp || templateForm.backImageUrl" alt="活动封面"/>
        <div class="img-layer">
          <span @click="cropperBg">添加图片</span>
        </div>
      </div>
      <p class="form-tip">(建议图片尺寸800:600，大小1M)</p>
    </el-form-item>
    <el-form-item label="背景音乐">
      <el-radio-group v-model="templateForm.musicType" @change="handleMusicTypeChange">
        <el-radio :label="0">音乐库</el-radio>
        <el-radio :label="1">其他</el-radio>
      </el-radio-group>
      <div>
        <template v-if="templateForm.musicType === 0">
          <el-select v-model="templateForm.musicId" @change="handleMusicChange">
            <el-option v-for="item in musicList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
          <el-button
            @click="playMusic"
            :type="templateForm.activityMusic ? 'primary' : ''" :icon="playing ? 'el-icon-video-pause' : 'el-icon-video-play'"
            :disabled="!templateForm.activityMusic"
            plain
            style="margin-left: 6px; font-size: 18px; padding: 0 15px; line-height: 30px;">
          </el-button>
        </template>
        <template v-else>
          <el-input v-model="templateForm.activityMusic" :maxlength="80" style="width: 260px"></el-input>
          <el-button
            @click="playMusic"
            :type="templateForm.activityMusic ? 'primary' : ''" :icon="playing ? 'el-icon-video-pause' : 'el-icon-video-play'"
            :disabled="!templateForm.activityMusic"
            plain
            style="margin-left: 6px; font-size: 18px; padding: 0 15px; line-height: 30px;">
          </el-button>
        </template>
      </div>
    </el-form-item>
    <el-form-item label="机构电话">
      <el-input v-model.trim="templateForm.telephone" :maxlength="20" style="width: 260px"></el-input>
      <p class="form-tip">设置机构电话后，学员可快速拨打电话进行咨询。不设置，则不显示</p>
    </el-form-item>
    <div class='form-title' style="margin-bottom: 0;">
      <span class="color-primary">活动信息</span>
    </div>
    <p class="form-tip">可自由添加和删除模块，自定义模块中的标题和内容描述</p>
    <el-button type="primary" plain size="small" icon="el-icon-plus" @click="addBlock">添加模块</el-button>
    <el-tabs v-model="cucrentBlock" type="card" closable @tab-remove="removeBlock" style="margin-top: 12px; margin-bottom: 16px;">
      <el-tab-pane
        v-for="(mode, index) in templateForm.block"
        :key="index"
        :label="'模块' + (index + 1)"
        :name="index + ''"
      >
        <el-form-item label="标题" :prop="'block.' + index + '.title'" :rules="{required: true, message: '请填写标题', trigger: 'blur'}">
          <el-input v-model="mode.title" :maxlength="10" style="width: 240px" placeholder="建议3~5个字"></el-input>
        </el-form-item>
        <el-form-item label="内容描述" :prop="'block.' + index + '.auxiliaries'" :rules="{type: 'array', required: true, message: '请填写标题', trigger: 'blur'}">
          <template v-for="(item, index1) in mode.auxiliaries">
            <el-input :key="'content' + index1" v-if="item.type === 0" v-model="item.value" type="textarea" :rows="6" :maxlength="200" show-word-limit style="width: 320px; margin-bottom: 12px" placeholder="内容描述，最多两百个字"></el-input>
            <div :key="'image' + index1" v-else-if="item.type === 1" class="block-img-con"  style="width: 320px; margin-bottom: 12px">
              <img :src="item.value"/>
              <div class="img-layer">
                <span @click="addBlockImage(index, index1)">添加图片</span>
              </div>
            </div>
            <div :key="'tool' + index1" class="block-tools">
              <el-tooltip class="item" effect="dark" content="删除" placement="left">
                <el-button size="mini" icon="el-icon-delete" @click="removeAuxiliary(index, index1)"></el-button>
              </el-tooltip>
              <el-button v-if="index1 === 0" disabled size="mini" icon="el-icon-top"></el-button>
              <el-tooltip v-else class="item" effect="dark" content="上移" placement="left">
                <el-button size="mini" icon="el-icon-top" @click="moveUpAuxiliary(index, index1)"></el-button>
              </el-tooltip>
              <el-button v-if="index1 === (mode.auxiliaries.length - 1)" disabled size="mini" icon="el-icon-bottom"></el-button>
              <el-tooltip v-else class="item" effect="dark" content="下移" placement="left">
                <el-button size="mini" icon="el-icon-bottom" @click="moveDownAuxiliary(index, index1)"></el-button>
              </el-tooltip>
            </div>
          </template>
          <div>
            <el-button size="mini" icon="el-icon-plus" @click="mode.auxiliaries.push({type: 0, value: ''})">添加文字</el-button>
            <el-button size="mini" icon="el-icon-plus" @click="addBlockImage(index)">添加图片</el-button>
          </div>
        </el-form-item>
      </el-tab-pane>
    </el-tabs>
    <div class='form-title'>
      <span class="color-primary">报名信息</span>
    </div>
    <div style="margin: 12px 0">
      <label class="required-label">学员姓名</label>
      <label class="required-label">联系电话</label>
    </div>
    <el-checkbox-group v-model="templateForm.reservationInfo">
      <el-checkbox label="sex">性别</el-checkbox>
      <el-checkbox label="age">年龄</el-checkbox>
      <el-checkbox label="school">就读学校</el-checkbox>
      <el-checkbox label="gradle">年级</el-checkbox>
      <el-checkbox label="address">联系地址</el-checkbox>
    </el-checkbox-group>
    <p class="form-tip" style="margin-bottom: 16px;">勾选的字段为学员报名时必填的内容，填写项过多可能会影响学员报名，最多设置5项。</p>
    <div class='form-title'>
      <span class="color-primary">分享信息</span>
    </div>
    <el-form-item label="分享封面" prop="shareImageUrl">
      <div class="img-con">
        <img v-if="templateForm.shareImageUrl" :src="templateForm.shareImageUrlTemp || templateForm.shareImageUrl" alt="分享封面"/>
        <div class="img-layer">
          <span @click="cropperShareBg">添加图片</span>
        </div>
      </div>
      <p class="form-tip">(建议图片尺寸200:200)</p>
    </el-form-item>
    <el-form-item label="分享标题" prop="shareTitle">
      <el-input v-model="templateForm.shareTitle" :maxlength="50" placeholder="分享标题，最多50个字" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="分享描述" prop="shareDesc">
      <el-input v-model="templateForm.shareDesc" type="textarea" :maxlength="120" show-word-limit :rows="5" placeholder="分享描述，最多120个字" style="width: 320px"></el-input>
    </el-form-item>

    <!-- 封面 -->
    <cropper-dialog
      :options="{aspectRatio: 800 / 600}"
      title="裁剪活动封面图"
      ref="cropperBg"
      v-model="showCropperBg"
      :croppedOptions="{
        maxWidth: 1200,
        maxHeight: 900
      }"
      @uploadComplete="handleUploadCompleteBg"/>

    <!-- 分享图 -->
    <cropper-dialog :options="{aspectRatio: 200 / 200}" title="裁剪分享封面图" ref="cropperShareBg" v-model="showCropperShareBg" @uploadComplete="handleUploadCompleteShareBg"/>

    <input ref="imageInput" type="file" accept="image/*" @change="handleSelectImage" style="display: none;"/>
  </el-form>
</template>

<script>
import CropperDialog from '@/components/CropperDialog'

import moment from 'moment'
import { addClass, removeClass } from '@/utils/dom'

export default {
  props: {
    templateId: String,
    templateData: Object,
    activityId: String,
    musicList: Array
  },
  data() {
    return {
      showCropperBg: false, // 裁剪背景
      showCropperShareBg: false, // 裁剪分享图
      pickerOptions: {
        shortcuts: [{
          text: '一周',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '一个月',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '三个月',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      templateForm: {
        activityName: '暑期班开班啦，限时优惠', // 活动名称
        activityTimeRange: [],
        beginTime: '', // 活动开始时间
        endTime: '', // 活动结束时间
        backImageUrl: 'http://tmpcdn.tlybond.com/h5/leaflet/summer_class/img/thumb.png', // 封面图
        musicType: 0, // 0 音乐库     1 自上传音乐
        musicId: '', // 音乐库ID
        activityMusic: 'https://cdn.yizhiniao.com/activity/%E6%AC%A2%E5%BF%AB.mp3', // 音乐
        telephone: '1889871234', // 机构电话
        block: [
          {
            title: '活动介绍', // 标题。
            auxiliaries: [ // 辅助内容。 type  0-内容    1-图片
              { type: 0, value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n1.早鸟价限时优惠\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n2.老带新活动\n6月1日-6月10日，活动期间，每邀请一位新生报名成功，双方报名都可立减200元，邀请人数不限，可任意叠加。' }
            ]
          },
          {
            title: '报名方式', // 标题。
            auxiliaries: [ // 辅助内容。 type  0-内容    1-图片
              { type: 0, value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' }
            ]
          },
          {
            title: '机构介绍', // 标题。
            auxiliaries: [ // 辅助内容。 type  0-内容    1-图片
              { type: 0, value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
              { type: 1, value: 'http://tmpcdn.tlybond.com/h5/leaflet/summer_class/img/organ_lis.png' }
            ]
          }
        ], // 模块
        reservationInfo: ['age', 'birthday'], // 预留的报名信息。默认姓名、手机号必填
        shareTitle: '', // 分享标题
        shareDesc: '', // 分享描述
        shareImageUrl: '' // 分享的图片
      },
      rules: {
        activityName: { required: true, message: '请填写活动名称', trigger: 'blur' },
        activityTimeRange: { type: 'array', required: true, message: '请选择活动时间', trigger: 'blur' },
        backImageUrl: { required: true, message: '请选择活动封面图', trigger: 'blur' },
        shareTitle: { required: true, message: '请填写分享标题', trigger: 'blur' },
        shareDesc: { required: true, message: '请填写分享内容', trigger: 'blur' },
        shareImageUrl: { required: true, message: '请选择分享封面', trigger: 'blur' }
      },
      cucrentBlock: '',
      playing: false
    }
  },
  components: {
    CropperDialog
  },
  mounted() {
    if (this.templateData != null) {
      const temp = Object.assign({}, this.templateData)
      temp.activityTimeRange = [temp.beginTime ? moment(temp.beginTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        temp.endTime ? moment(temp.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
      if (temp.musicType == null || temp.musicType === '') {
        temp.musicType = 1
      }
      this.templateForm = temp
    }
  },
  methods: {
    publish() {
      // 发布活动
      this.$http.put('/v1/OrganizationMicroWeb/putaway?id=' + this.activityId).then(() => {
        this.$message.success('上架成功')
        this.$emit('publishSuccess')
      })
    },
    handleMusicTypeChange() {
      this.templateForm.musicId = ''
      this.templateForm.activityMusic = ''
    },
    handleMusicChange() {
      const item = this.musicList.find(o => o.id === this.templateForm.musicId)
      if (item) {
        this.playing = false
        this.templateForm.activityMusic = item.url
      }
    },
    playMusic() {
      const musicBtn = document.getElementById('bacMusicBtn')
      const musicPlayer = document.getElementById('bacMusic')
      musicPlayer.src = this.templateForm.activityMusic
      if (this.playing) {
        // 去暂停
        musicPlayer.pause()
        removeClass(musicBtn, 'music_rotate')
      } else {
        // 去播放
        musicPlayer.play()
        addClass(musicBtn, 'music_rotate')
      }
      this.playing = !this.playing
    },
    // 添加模块
    addBlock() {
      this.templateForm.block.push({
        title: '',
        auxiliaries: [
          {
            type: 0,
            value: ''
          }
        ]
      })
      this.cucrentBlock = (this.templateForm.block.length - 1) + ''
    },
    // 删除模块
    removeBlock(index) {
      if (this.templateForm.block.length <= 1) return
      // 删除内容
      this.$confirm('确认删除？', '提示').then(() => {
        this.templateForm.block.splice(index, 1)
      })
    },
    // 删除内容
    removeAuxiliary(index, index1) {
      this.templateForm.block[index].auxiliaries.splice(index1, 1)
    },
    // 上移内容
    moveUpAuxiliary(index, index1) {
      const temp = Object.assign({}, this.templateForm.block[index].auxiliaries[index1 - 1])
      this.$set(this.templateForm.block[index].auxiliaries, index1 - 1, Object.assign({}, this.templateForm.block[index].auxiliaries[index1]))
      this.$set(this.templateForm.block[index].auxiliaries, index1, temp)
    },
    // 下移内容
    moveDownAuxiliary(index, index1) {
      const temp = Object.assign({}, this.templateForm.block[index].auxiliaries[index1])
      this.$set(this.templateForm.block[index].auxiliaries, index1, Object.assign({}, this.templateForm.block[index].auxiliaries[index1 + 1]))
      this.$set(this.templateForm.block[index].auxiliaries, index1 + 1, temp)
    },
    // 裁剪封面图
    cropperBg() {
      this.$refs.cropperBg.select()
    },
    // 裁剪背景图完成
    handleUploadCompleteBg(res) {
      this.templateForm.backImageUrl = res.url
      this.templateForm.backImageUrlTemp = res.tempUrl
    },
    // 裁剪分享封面图
    cropperShareBg() {
      this.$refs.cropperShareBg.select()
    },
    // 裁剪背景图完成
    handleUploadCompleteShareBg(res) {
      this.templateForm.shareImageUrl = res.url
      this.templateForm.shareImageUrlTemp = res.tempUrl
    },
    // 添加模块图片
    addBlockImage(blockIndex, imageIndex) {
      this.blockIndex = blockIndex
      this.imageIndex = imageIndex
      this.$refs.imageInput.click()
    },
    // 上传选择的图片
    handleSelectImage() {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return
      this.uploadLoading = false
      this.$http.upload(files[0]).then((res) => {
        const temp = {
          type: 1,
          value: res.url,
          temp: res.tempUrl
        }
        if (this.imageIndex == null) {
          // 新增图片
          this.templateForm.block[this.blockIndex].auxiliaries.push(temp)
        } else {
          this.$set(this.templateForm.block[this.blockIndex].auxiliaries, this.imageIndex, temp)
        }
      }).finally(() => {
        this.blockIndex = null
        this.imageIndex = null
        this.uploadLoading = false
      })
    },
    setShowData() {
      const data = JSON.parse(JSON.stringify(this.templateForm))
      window.setShowData && window.setShowData(data)
    },
    // 提交保存
    save() {
      return new Promise((resolve, reject) => {
        this.$refs.templateForm.validate(valid => {
          if (valid) {
            const tempTemplateForm = Object.assign({}, this.templateForm)
            tempTemplateForm.beginTime = tempTemplateForm.activityTimeRange[0]
            tempTemplateForm.endTime = tempTemplateForm.activityTimeRange[1]
            // 删除临时数据
            delete tempTemplateForm.activityTimeRange
            if (tempTemplateForm.backImageUrlTemp) {
              delete tempTemplateForm.backImageUrlTemp
            }
            if (tempTemplateForm.shareImageUrlTemp) {
              delete tempTemplateForm.shareImageUrlTemp
            }
            const params = {
              data: JSON.stringify(tempTemplateForm)
            }
            if (this.activityId) {
              // 修改
              params.id = this.activityId
              params.name = tempTemplateForm.activityName
              params.startTime = tempTemplateForm.beginTime + ' 00:00:00'
              params.endTime = tempTemplateForm.endTime + ' 23:59:59'
              this.$http.put('/v1/OrganizationMicroWeb/updateOrganizationMicroWeb', params).then(res => {
                // 提示
                this.$message.success('修改微传单成功。')
                resolve()
              }).catch(() => {
                reject()
              })
            } else {
              // 新增
              params.name = tempTemplateForm.activityName
              params.startTime = tempTemplateForm.beginTime + ' 00:00:00'
              params.endTime = tempTemplateForm.endTime + ' 23:59:59'
              params.templateId = this.templateId
              params.organizationId = this.$store.getters.organizationInfo.id
              params.departmentId = this.$store.getters.currentBranch.id
              params.status = 0
              this.$http.post('/v1/OrganizationMicroWeb/addOrganizationMicroWeb', params).then(res => {
                // 提示
                this.$message.success('已保存到我的作品。点击【发布】后可查看修改的模板！')
                resolve()
              }).catch(() => {
                reject()
              })
            }
          } else {
            this.$message.error('请完善数据内容！')
            reject()
          }
        })
      })
    }
  },
  watch: {
    templateData(val) {
      if (val != null) {
        const temp = Object.assign({}, val)
        temp.activityTimeRange = [temp.beginTime ? moment(temp.beginTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          temp.endTime ? moment(temp.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
        if (temp.musicType == null || temp.musicType === '') {
          temp.musicType = 1
        }
        this.templateForm = temp
      }
    },
    templateForm: {
      handler: function() {
        this.setShowData()
      },
      deep: true
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.img-con, .block-img-con
  width 160px
  height 120px
  line-height 120px
  position relative
  border 1px solid $color-border-1
  border-radius 3px
  overflow hidden
  img
    width 100%
    height 100%
  &:hover
    .img-layer
      display block
  .img-layer
    background rgba(0, 0, 0, 0.5)
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    display none
    span
      display inline-block
      line-height 30px
      padding 0 12px
      border 1px solid #fff
      color #fff
      cursor pointer
      font-size 13px
      margin-left 43px
      &:hover
        background rgba($color-danger, 0.8)
        border-color rgba($color-danger, 0.8)
.block-img-con
  display inline-block
  width 320px
  height 138px
  line-height 138px
  span
    margin-left 113px !important
.form-tip
  line-height 26px
  font-size 13px
  color $color-text-3
.block-tools
  width 45px
  display inline-block
  margin-left 12px
  vertical-align top
  .el-button
    &+.el-button
      margin-left 0
      margin-top 8px
.required-label
  display inline-block
  &::before
    content '*'
    color $color-danger
    margin-right 4px
    display inline-block
  &+.required-label
    margin-left 20px
.form-title
  font-size 14px
  padding 10px 20px
  margin 0 0 10px
  // border-top 1px solid #ddd
  background #f2f2f2
  color $color-primary
  box-sizing border-box
</style>

<style lang="stylus">
.leafleft-form
  .el-tabs__header
    padding 0
    margin 0
    position relative
    z-index 11
  .el-tabs__content
    padding 12px
    border 1px solid $color-border-2
    margin-top -1px
    box-sizing border-box
</style>
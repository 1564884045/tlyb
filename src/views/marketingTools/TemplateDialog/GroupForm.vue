<template>
  <el-form ref="templateForm" :model="templateForm" :rules="rules" label-width="88px" class="bargain-form">
    <!-- 基础信息 -板块 -->
    <div class="form-title">
      <span class="color-primary">基础信息</span>
    </div>
    <el-form-item label="活动名称" prop="basicInfo.activityName">
      <el-input v-model="templateForm.basicInfo.activityName" :maxlength="50" style="width: 260px"></el-input>
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
    <el-form-item label="背景音乐">
      <el-radio-group v-model="templateForm.basicInfo.musicType" @change="handleMusicTypeChange">
        <el-radio :label="0">音乐库</el-radio>
        <el-radio :label="1">其他</el-radio>
      </el-radio-group>
      <div>
        <template v-if="templateForm.basicInfo.musicType === 0">
          <el-select v-model="templateForm.basicInfo.musicId" @change="handleMusicChange">
            <el-option v-for="item in musicList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
          <el-button
            @click="playMusic"
            :type="templateForm.basicInfo.musicSrc ? 'primary' : ''" :icon="playing ? 'el-icon-video-pause' : 'el-icon-video-play'"
            :disabled="!templateForm.basicInfo.musicSrc"
            plain
            style="margin-left: 6px; font-size: 18px; padding: 0 15px; line-height: 30px;">
          </el-button>
        </template>
        <template v-else>
          <el-input v-model="templateForm.basicInfo.musicSrc" :maxlength="80" style="width: 260px"></el-input>
          <el-button
            @click="playMusic"
            :type="templateForm.basicInfo.musicSrc ? 'primary' : ''" :icon="playing ? 'el-icon-video-pause' : 'el-icon-video-play'"
            :disabled="!templateForm.basicInfo.musicSrc"
            plain
            style="margin-left: 6px; font-size: 18px; padding: 0 15px; line-height: 30px;">
          </el-button>
        </template>
      </div>
    </el-form-item>
    <!-- <el-form-item label="机构电话">
      <el-input v-model="templateForm.basicInfo.telephone" :maxlength="20" style="width: 260px"></el-input>
      <p class="form-tip">设置机构电话后，学员可快速拨打电话进行咨询。不设置，则不显示</p>
    </el-form-item> -->
    <!-- 活动信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">活动信息</span>
    </div>
    <!-- <div class="el-form-item el-form-item--small">
      <label class="el-form-item__label" style="width: 88px;">活动课程</label>
      <div class="el-form-item__content" style="margin-left: 88px;">
        <el-button icon="el-icon-circle-plus-outline" type="text" size="medium" @click="showSelectCourse = true">添加活动课程</el-button>
        <div v-for="(item, index) in templateForm.prizeInfo.courses" :key="item.id" class="course-item">
          <el-form-item label="课程名称">
            <span class="color-danger">{{item.name}}</span>
          </el-form-item>
          <el-form-item label="收费套餐">
            <el-select v-model="item.priceId" placeholder="选择套餐" @change="handlePriceChange(item)">
              <el-option v-for="item in item.priceEntityList" :key="item.id" :value="item.id" :label="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="购买课时">
            <el-input-number v-model="item.classHour" :controls="false" step-strictly class="left-number" style="width: 203px;"></el-input-number>
          </el-form-item>
          <el-form-item label="总价格(元)">
            <el-input-number v-model="item.price" :controls="false" :precision="2" @change="calcSinglePrice(item)" class="left-number" style="width: 203px;"></el-input-number>
          </el-form-item>
          <el-form-item label="课单价(元)">
            <span class="color-danger">{{item.classHour ? (item.price / item.classHour) : 0}}元/课时</span>
          </el-form-item>
          <el-button type="danger" icon="el-icon-delete" plain circle @click="removeCourse(index)" class="delete-btn" title="删除课程"></el-button>
        </div>
        <el-button v-show="isSelectedCourse"  icon="el-icon-circle-plus-outline" type="text" size="medium" @click="showSelectTuition = true">添加物品(学杂)</el-button>
        <div v-for="(item, index) in templateForm.prizeInfo.tuitions" :key="item.id" class="course-item">
          <el-form-item label="课程名称">
            <span class="color-danger">{{item.name}}</span>
          </el-form-item>
          <el-form-item label="单价(元)">
            <span class="color-danger">{{item.singlePrice || 0}}元</span>
          </el-form-item>
          <el-form-item label="购买数量">
            <el-input-number v-model="item.tuitionNum" :controls="false" step-strictly @change="calcTuitionPrice(item)" class="left-number" style="width: 203px;"></el-input-number>
          </el-form-item>
          <el-form-item label="总价格(元)">
            <el-input-number v-model="item.price" :controls="false" :precision="2" class="left-number" style="width: 203px;"></el-input-number>
          </el-form-item>
          <el-button type="danger" icon="el-icon-delete" plain circle @click="removeTuition(index)" class="delete-btn" title="删除课程"></el-button>
        </div>
      </div>
    </div> -->
    <!-- 课程详情 -->
    <div class="el-form-item is-required el-form-item--small">
      <label class="el-form-item__label" style="width: 88px;">课程详情</label>
      <el-form-item
        v-for="(item, index) in templateForm.prizeInfo.describeList"
        :key="index"
        :prop="'prizeInfo.describeList.' + index + '.value'"
        :rules="{required: true, message: item.type === 0 ? '请填写内容' : '请上传图片', trigger: 'blur'}"
        label-width="0"
        style="margin-bottom: 12px; margin-left: 88px;">
        <el-input :key="'content' + index" v-if="item.type === 0" v-model="item.value" type="textarea" :rows="6" :maxlength="200" show-word-limit style="width: 434px;" placeholder="内容描述，最多两百个字"></el-input>
        <div :key="'image' + index" v-else-if="item.type === 1" class="block-img-con"  style="width: 434px;">
          <img :src="item.value"/>
          <div class="img-layer">
            <span @click="addBlockImage(index, 1)">添加图片</span>
          </div>
        </div>
        <div :key="'tool' + index" class="block-tools">
          <el-tooltip class="item" effect="dark" content="删除" placement="left">
            <el-button size="mini" icon="el-icon-delete" @click="removeBlock(index, templateForm.prizeInfo.describeList)"></el-button>
          </el-tooltip>
          <el-button v-if="index === 0" disabled size="mini" icon="el-icon-top"></el-button>
          <el-tooltip v-else class="item" effect="dark" content="上移" placement="left">
            <el-button size="mini" icon="el-icon-top" @click="moveUp(index, templateForm.prizeInfo.describeList)"></el-button>
          </el-tooltip>
          <el-button v-if="index === (templateForm.prizeInfo.describeList.length - 1)" disabled size="mini" icon="el-icon-bottom"></el-button>
          <el-tooltip v-else class="item" effect="dark" content="下移" placement="left">
            <el-button size="mini" icon="el-icon-bottom" @click="moveDown(index, templateForm.prizeInfo.describeList)"></el-button>
          </el-tooltip>
        </div>
      </el-form-item>
      <div style="margin-left: 88px;">
        <el-button size="mini" icon="el-icon-plus" @click="templateForm.prizeInfo.describeList.push({type: 0, value: ''})">添加文字</el-button>
        <el-button size="mini" icon="el-icon-plus" @click="addBlockImage(null, 1)">添加图片</el-button>
      </div>
    </div>
    <el-form-item label="活动原价" prop="prizeInfo.originalPrice">
      <el-input-number v-if="activityInfo && activityInfo.status != 0" :value="templateForm.prizeInfo.originalPrice" disabled :controls="false" :precision="2" class="left-number" style="width: 203px;"></el-input-number>
      <el-input-number v-else-if="isSelectedCourse" :value="totalPrice" disabled :controls="false" :precision="2" class="left-number" style="width: 203px;"></el-input-number>
      <el-input-number v-else v-model="templateForm.prizeInfo.originalPrice" :min="0" :max="99999999" :controls="false" :precision="2" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">活动发布后，原价不可更改</p>
    </el-form-item>
    <el-form-item label="拼团价" prop="prizeInfo.floorPrice">
      <el-input-number v-model="templateForm.prizeInfo.floorPrice" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :precision="2" :min="0" :max="99999999" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">活动发布后，底价不可更改</p>
    </el-form-item>
    <el-form-item label="发起预付" prop="prizeInfo.launchPreFee">
      <el-input-number v-model="templateForm.prizeInfo.launchPreFee" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :precision="2" :min="0" :max="99999999" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">发起拼团需要预付的金额，为0则不收取费用</p>
    </el-form-item>
    <el-form-item label="参与预付" prop="prizeInfo.attendPreFee">
      <el-input-number v-model="templateForm.prizeInfo.attendPreFee" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :precision="2" :min="0" :max="99999999" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">参与拼团需要预付的金额，为0则不收取费用</p>
    </el-form-item>
    <el-form-item label="几人成团" prop="prizeInfo.groupUserNumber">
      <el-input-number v-model="templateForm.prizeInfo.groupUserNumber" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :min="2" :max="999" step-strictly class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">可设置2人以上成团。活动发布后，不可更改。建议2-3人成团，提高成团率</p>
    </el-form-item>
    <el-form-item label="成团数量" prop="prizeInfo.groupNumber">
      <el-input-number v-model="templateForm.prizeInfo.groupNumber" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :min="1" :max="9999" step-strictly class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">成团数达到上限后，活动结束</p>
    </el-form-item>
    <el-form-item label="参与次数" prop="prizeInfo.userAttendLimit">
      <el-input-number v-model="templateForm.prizeInfo.userAttendLimit" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :min="1" :max="9999" step-strictly class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">每个用户可参与该活动的拼团次数</p>
    </el-form-item>
    <el-form-item label="活动名额" >
      <el-input-number :value="templateForm.prizeInfo.groupUserNumber * templateForm.prizeInfo.groupNumber" disabled :controls="false" :min="0" :max="9999" class="left-number" style="width: 203px;"></el-input-number>
    </el-form-item>
    <!-- 活动规则 -板块 -->
    <div class='form-title'>
      <span class="color-primary">活动规则</span>
    </div>
    <el-form-item prop="prizeInfo.activityRule" label-width="20px">
      <el-input v-model="templateForm.prizeInfo.activityRule" type="textarea" :rows="8" :maxlength="1000" placeholder="活动规则内容"></el-input>
    </el-form-item>
    <!-- 机构介绍-板块 -->
    <div class='form-title'>
      <span class="color-primary">机构介绍</span>
    </div>
    <el-form-item
      v-for="(item, index) in templateForm.organInfo"
      :key="index"
      :prop="'organInfo.' + index + '.value'"
      :rules="{required: true, message: item.type === 0 ? '请填写内容' : '请上传图片', trigger: 'blur'}"
      label-width="20px"
      style="margin-bottom: 12px;">
      <el-input :key="'content' + index" v-if="item.type === 0" v-model="item.value" type="textarea" :rows="6" :maxlength="200" show-word-limit style="width: 480px;" placeholder="内容描述，最多两百个字"></el-input>
      <div :key="'image' + index" v-else-if="item.type === 1" class="block-img-con"  style="width: 480px;">
        <img :src="item.value"/>
        <div class="img-layer">
          <span @click="addBlockImage(index, 0)">添加图片</span>
        </div>
      </div>
      <div :key="'tool' + index" class="block-tools">
        <el-tooltip class="item" effect="dark" content="删除" placement="left">
          <el-button size="mini" icon="el-icon-delete" @click="removeBlock(index, templateForm.organInfo)"></el-button>
        </el-tooltip>
        <el-button v-if="index === 0" disabled size="mini" icon="el-icon-top"></el-button>
        <el-tooltip v-else class="item" effect="dark" content="上移" placement="left">
          <el-button size="mini" icon="el-icon-top" @click="moveUp(index, templateForm.organInfo)"></el-button>
        </el-tooltip>
        <el-button v-if="index === (templateForm.organInfo.length - 1)" disabled size="mini" icon="el-icon-bottom"></el-button>
        <el-tooltip v-else class="item" effect="dark" content="下移" placement="left">
          <el-button size="mini" icon="el-icon-bottom" @click="moveDown(index, templateForm.organInfo)"></el-button>
        </el-tooltip>
      </div>
    </el-form-item>
    <div style="margin-left: 20px; margin-bottom: 20px; margin-top: -8px;">
      <el-button size="mini" icon="el-icon-plus" @click="templateForm.organInfo.push({type: 0, value: ''})">添加文字</el-button>
      <el-button size="mini" icon="el-icon-plus" @click="addBlockImage(index, 0)">添加图片</el-button>
    </div>
    <!-- 校区信息 -->
    <div class='form-title'>
      <span class="color-primary">校区信息</span>
    </div>
    <el-form-item label="校区名称" prop="organ.name">
      <el-input v-model="templateForm.organ.name" :maxlength="50" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="校区电话" prop="organ.phone">
      <el-input v-model="templateForm.organ.phone" :maxlength="50" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="校区地址" prop="organ.address">
      <el-input v-model="templateForm.organ.address" type="textarea" :maxlength="120" style="width: 260px"></el-input>
    </el-form-item>
    <!-- 报名信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">报名信息</span>
    </div>
    <div style="margin: 12px 20px">
      <label class="required-label">学员姓名</label>
      <label class="required-label">联系电话</label>
    </div>
    <el-form-item prop="reservationInfo" label-width="20px">
      <el-checkbox-group v-model="templateForm.reservationInfo">
        <el-checkbox label="sex">性别</el-checkbox>
        <el-checkbox label="age">年龄</el-checkbox>
        <el-checkbox label="school">就读学校</el-checkbox>
        <el-checkbox label="parentname">家长姓名</el-checkbox>
        <el-checkbox label="address">联系地址</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <!-- 分享信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">分享信息</span>
    </div>
    <el-form-item label="分享封面" prop="shareInfo.imageUrl">
      <div class="img-con">
        <img v-if="templateForm.shareInfo.imageUrl" :src="templateForm.shareInfo.imageUrlTemp || templateForm.shareInfo.imageUrl" alt="分享封面"/>
        <div class="img-layer">
          <span @click="cropperShareBg">添加图片</span>
        </div>
      </div>
      <p class="form-tip">(建议图片尺寸200:200)</p>
    </el-form-item>
    <el-form-item label="分享标题" prop="shareInfo.title">
      <el-input v-model="templateForm.shareInfo.title" :maxlength="50" placeholder="分享标题，最多50个字" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="分享描述" prop="shareInfo.desc">
      <el-input v-model="templateForm.shareInfo.desc" type="textarea" :maxlength="120" show-word-limit :rows="5" placeholder="分享描述，最多120个字" style="width: 320px"></el-input>
    </el-form-item>

    <!-- 分享图 -->
    <cropper-dialog :options="{aspectRatio: 200 / 200}" title="裁剪分享封面图" ref="cropperShareBg" v-model="showCropperShareBg" @uploadComplete="handleUploadCompleteShareBg"/>

    <input ref="imageInput" type="file" accept="image/*" @change="handleSelectImage" style="display: none;"/>

    <select-course-dialog v-model="showSelectCourse" @submit="selectCourse"></select-course-dialog>
    <select-tuition-dialog v-model="showSelectTuition" @submit="selectTuition"></select-tuition-dialog>

  </el-form>
</template>

<script>
import CropperDialog from '@/components/CropperDialog'
import SelectCourseDialog from '../../educational/components/SelectCourseDialog'
import SelectTuitionDialog from '../../educational/components/SelectTuitionDialog'

import moment from 'moment'
import { addClass, removeClass } from '@/utils/dom'

export default {
  props: {
    templateId: String,
    templateData: Object,
    activityId: String,
    musicList: Array,
    activityInfo: Object
  },
  data() {
    return {
      showCropperShareBg: false,
      showSelectCourse: false,
      showSelectTuition: false,
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
        'activityTimeRange': [],
        'basicInfo': {
          'activityName': '抢暑期芭蕾舞课程，最低仅需600元',
          'startTime': '',
          'endTime': '',
          'musicType': 0,
          'musicSrc': ''
        },
        'prizeInfo': {
          'courses': [],
          'tuitions': [],
          'describeList': [{
            'type': 0,
            'value': '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30'
          },
          {
            'type': 1,
            'value': 'http://tmpcdn.tlybond.com/h5/group/write_class/img/course-intro.png'
          }
          ],
          'originalPrice': 880, // 原价
          'floorPrice': 9.9, // 拼团价
          'launchPreFee': 2, // 发起预付款
          'attendPreFee': 1, // 参与预付款
          'groupUserNumber': 8, // 成团人数上限
          'groupNumber': 40, // 多少个团
          'userAttendLimit': 1, // 每个人能参与拼团次数
          'activityRule': '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。\n2. 提交报名信息并在线支付。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败。款项将退还到机构学员账户，请联系机构线下退款。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老会员不限。\n7. 每个活动一个用户只能开团/参团一次。\n8. （注意此条：是否开启预付金额设置）该活动付款金额为预付金额，线上先预付一定的费用，剩余费用线下补缴。'
        },
        'organInfo': [{
          'type': 0,
          'value': 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。'
        }, {
          'type': 1,
          'value': 'https://www.yizhiniao.com/templates/show_template/group/goodStart/img/organ_lis.png'
        }],
        'organ': {
          'name': '桃李云帮培训学校',
          'phone': '0571-85789582',
          'address': '贵阳市贵安新区数字经济产业园D栋'
        },
        'shareInfo': {
          'imageUrl': 'http://cdntest.yizhiniao.com/oa_37_1537251030779_picture',
          'title': 'XX教育培训大促',
          'desc': 'XX招生优惠不断，赶快来报名吧'
        },
        reservationInfo: []
      },
      rules: {
        'basicInfo.activityName': { required: true, message: '请填写活动名称', trigger: 'blur' },
        'activityTimeRange': { type: 'array', required: true, message: '请选择活动时间', trigger: 'blur' },
        'shareInfo.title': { required: true, message: '请填写分享标题', trigger: 'blur' },
        'shareInfo.desc': { required: true, message: '请填写分享内容', trigger: 'blur' },
        'shareInfo.imageUrl': { required: true, message: '请选择分享封面', trigger: 'blur' },
        'prizeInfo.activityRule': { required: true, message: '请填写活动规则', trigger: 'blur' },
        'prizeInfo.num': { required: true, message: '请填写活动名额', trigger: 'blur' },
        'prizeInfo.originalPrice': { required: true, message: '请填写活动原价', trigger: 'blur' },
        'prizeInfo.floorPrice': { required: true, message: '请填写拼团价格', trigger: 'blur' },
        'prizeInfo.launchPreFee': { required: true, message: '请填写发起预付金额', trigger: 'blur' },
        'prizeInfo.attendPreFee': { required: true, message: '请填写参与预付金额', trigger: 'blur' },
        'prizeInfo.groupUserNumber': { required: true, message: '请填写成团人数上限', trigger: 'blur' },
        'prizeInfo.groupNumber': { required: true, message: '请填写多少个团', trigger: 'blur' },
        'prizeInfo.userAttendLimit': { required: true, message: '请填写每个人能参与拼团次数', trigger: 'blur' }
      },
      playing: false,
      timeTypeList: [
        {
          value: 0,
          label: '天'
        },
        {
          value: 1,
          label: '月'
        },
        {
          value: 2,
          label: '季度'
        },
        {
          value: 3,
          label: '半年'
        },
        {
          value: 4,
          label: '年'
        }
      ]
    }
  },
  components: {
    CropperDialog,
    SelectCourseDialog,
    SelectTuitionDialog
  },
  computed: {
    isSelectedCourse() {
      return (this.templateForm.prizeInfo.courses && this.templateForm.prizeInfo.courses.length > 0) ||
              (this.templateForm.prizeInfo.tuitions && this.templateForm.prizeInfo.tuitions.length > 0)
    },
    totalPrice() {
      if (!this.isSelectedCourse) {
        return 0
      }
      let price = 0
      this.templateForm.prizeInfo.courses.forEach(item => {
        price += item.price
      })
      this.templateForm.prizeInfo.tuitions.forEach(item => {
        price += item.price
      })
      return Number(price.toFixed(2))
    }
  },
  mounted() {
    if (this.templateData != null) {
      const temp = Object.assign({}, this.templateData)
      temp.activityTimeRange = [temp.basicInfo.startTime ? moment(temp.basicInfo.startTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        temp.basicInfo.endTime ? moment(temp.basicInfo.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
      if (temp.basicInfo.musicType == null || temp.basicInfo.musicType === '') {
        temp.basicInfo.musicType = 1
      }
      this.templateForm = temp
    }
  },
  methods: {
    publish() {
      // 发布活动
      this.$http.put('/v1/OrganizationGroupPurchase/putawayOrSoudOut?status=1&id=' + this.activityId).then(() => {
        this.$message.success('上架成功')
        this.$emit('publishSuccess')
      })
    },
    handleMusicTypeChange() {
      this.templateForm.basicInfo.musicId = ''
      this.templateForm.basicInfo.musicSrc = ''
    },
    handleMusicChange() {
      const item = this.musicList.find(o => o.id === this.templateForm.basicInfo.musicId)
      if (item) {
        this.playing = false
        this.templateForm.basicInfo.musicSrc = item.url
      }
    },
    playMusic() {
      const musicBtn = document.getElementById('bacMusicBtn')
      const musicPlayer = document.getElementById('bacMusic')
      musicPlayer.src = this.templateForm.basicInfo.musicSrc
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
    // 删除内容
    removeCourse(index) {
      this.$confirm('确认删除？', '提示').then(() => {
        this.templateForm.prizeInfo.courses.splice(index, 1)
      })
    },
    // 删除内容
    removeTuition(index) {
      this.$confirm('确认删除？', '提示').then(() => {
        this.templateForm.prizeInfo.tuitions.splice(index, 1)
      })
    },
    // 删除内容
    removeBlock(index, list) {
      this.$confirm('确认删除？', '提示').then(() => {
        list.splice(index, 1)
      })
    },
    // 上移内容
    moveUp(index, list) {
      const temp = Object.assign({}, list[index - 1])
      this.$set(list, index - 1, Object.assign({}, list[index]))
      this.$set(list, index, temp)
    },
    // 下移内容
    moveDown(index, list) {
      const temp = Object.assign({}, list[index])
      this.$set(list, index, Object.assign({}, list[index + 1]))
      this.$set(list, index + 1, temp)
    },
    // 裁剪封面图
    cropperBg() {
      this.$refs.cropperBg.select()
    },
    // 裁剪分享封面图
    cropperShareBg() {
      this.$refs.cropperShareBg.select()
    },
    // 裁剪分享封面完成
    handleUploadCompleteShareBg(res) {
      this.templateForm.shareInfo.imageUrl = res.url
      this.templateForm.shareInfo.imageUrlTemp = res.tempUrl
    },
    // 添加模块图片.  0-机构信息的图片     1-课程描述的图片
    addBlockImage(index, type) {
      this.imageType = type
      this.imageIndex = index
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
          // 新增图片 0-机构信息的图片     1-课程描述的图片
          if (this.imageType === 1) {
            this.templateForm.prizeInfo.describeList.push(temp)
          } else {
            this.templateForm.organInfo.push(temp)
          }
        } else {
          if (this.imageType === 1) {
            this.$set(this.templateForm.prizeInfo.describeList, this.imageIndex, temp)
          } else {
            this.$set(this.templateForm.organInfo, this.imageIndex, temp)
          }
        }
      }).finally(() => {
        this.imageType = null
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
            if (this.isSelectedCourse) {
              tempTemplateForm.prizeInfo.originalPrice = this.totalPrice
            }
            if (tempTemplateForm.prizeInfo.originalPrice <= tempTemplateForm.prizeInfo.floorPrice) {
              this.$message.warning('活动原价不能低于拼团价格！')
              reject()
              return
            }
            const startTime = tempTemplateForm.activityTimeRange[0]
            const endTime = tempTemplateForm.activityTimeRange[1]
            tempTemplateForm.basicInfo.startTime = startTime.indexOf(' ') > -1 ? startTime : (startTime + ' 00:00:00')
            tempTemplateForm.basicInfo.endTime = endTime.indexOf(' ') > -1 ? endTime : (endTime + ' 23:59:59')
            // 删除临时数据
            delete tempTemplateForm.activityTimeRange
            if (tempTemplateForm.shareImageUrlTemp) {
              delete tempTemplateForm.shareImageUrlTemp
            }
            const params = {
              data: JSON.stringify(tempTemplateForm)
            }
            if (this.activityId) {
              // 修改
              params.id = this.activityId
              params.name = tempTemplateForm.basicInfo.activityName
              params.startTime = tempTemplateForm.basicInfo.startTime
              params.endTime = tempTemplateForm.basicInfo.endTime
              this.$http.put('/v1/OrganizationGroupPurchase/updateOrganizationGroupPurchase', params).then(res => {
                // 提示
                this.$message.success('修改拼团模板成功。')
                resolve()
              }).catch(() => {
                reject()
              })
            } else {
              // 新增
              params.name = tempTemplateForm.basicInfo.activityName
              params.startTime = tempTemplateForm.basicInfo.startTime
              params.endTime = tempTemplateForm.basicInfo.endTime
              params.templateId = this.templateId
              params.organizationId = this.$store.getters.organizationInfo.id
              params.departmentId = this.$store.getters.currentBranch.id
              params.status = 0
              params.maxAttendUserCount = tempTemplateForm.prizeInfo.groupNumber * tempTemplateForm.prizeInfo.groupUserNumber // 人数上限
              params.perGroupAttendUserCount = tempTemplateForm.prizeInfo.groupUserNumber // 几人成团
              params.maxGroupCount = tempTemplateForm.prizeInfo.groupNumber // 最大成团数
              params.launchPreFee = tempTemplateForm.prizeInfo.launchPreFee // 发起拼团预付费用
              params.attendFee = tempTemplateForm.prizeInfo.attendPreFee // 参与拼团预付费用
              params.launchFee = tempTemplateForm.prizeInfo.launchPreFee // 发起拼团预付费用
              params.userLaunchLimit = 1 // 允许用户发起拼团最大次数
              params.userAttendLimit = tempTemplateForm.prizeInfo.userAttendLimit // 允许用户参与拼团最大次数

              // params.reduceCourses = tempTemplateForm.prizeInfo.courses.map(item => {
              //   return {
              //     courseId: item.courseId,
              //     courseNum: item.classHour,
              //     price: item.price,
              //     priceId: item.priceId
              //   }
              // }) // 拼团课程列表
              // params.reduceTuitionFees = tempTemplateForm.prizeInfo.tuitions.map(item => {
              //   return {
              //     tuitionFeeId: item.tuitionId,
              //     tuitionNum: item.tuitionNum,
              //     price: item.price
              //   }
              // }) // 拼团学杂列表

              this.$http.post('/v1/OrganizationGroupPurchase/addOrganizationGroupPurchase', params).then(res => {
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
    },
    selectCourse(courses) {
      if (courses == null || courses.length === 0) return
      this.courseLoading = true
      const ids = courses.map(o => o.id)
      this.$http.get('/v1/Course/getCourseByIdList', {
        ids: ids.join(';'),
        status: 1
      }).then(res => {
        const tempCourses = []
        res.data.forEach(item => {
          // 处理价格标准
          item.priceEntityList.forEach(price => {
            switch (price.valuationType) {
              case 0:
                price.valuationTypeStr = '课时计费'
                price.name = price.classHour + '课时'
                break
              case 1:
                price.valuationTypeStr = '按期计费'
                price.name = price.periodName
                break
              case 2:
                price.valuationTypeStr = '按时间计费'
                const temp = this.timeTypeList.find(o => o.value === price.timeType)
                if (temp) {
                  price.name = price.timeCount + temp.label
                } else {
                  // 默认单位 “天”
                  price.name = price.timeCount + '天'
                }
                break
            }

            if (price.priceName) {
              price.name = price.priceName
            }
          })
          // 处理学杂。  包含学杂才处理
          if (item.containTuition && item.tuitionFeeEntityList && item.tuitionFeeEntityList.length > 0) {
            const temp = []
            item.tuitionFeeEntityList.forEach(tuition => {
              temp.push({
                courseId: item.id, // 所属课程的ID
                courseName: item.name, // 所属课程名称
                tuitionId: tuition.id, // 学杂ID
                name: tuition.name, // 学杂名称
                tuitionNum: tuition.tuitionNum || 0, // 学杂数量
                price: (tuition.tuitionNum || 0) * tuition.price, // 学杂价格
                inventory: tuition.inventory, // 学杂库存剩余
                singlePrice: tuition.price, // 学杂单价
                mustTuition: item.mustTuition, // 为1时，选择课程时，必须包含学杂
                containTuition: item.containTuition // 是否包含学杂。  1-是   0-否
              })
            })
            this.templateForm.prizeInfo.tuitions = this.templateForm.prizeInfo.tuitions.concat(temp)
          }
          // 组装数据
          tempCourses.push({
            courseId: item.id,
            addCourseStatus: item.addCourseStatus, // 0-新报    1-续报
            name: item.name, // 课程名称
            classHour: '', // 课时数
            classHourSignalPrice: '', // 课时单价
            periodId: '', // 按期收费
            periodPrice: '', // 每期价格
            periodName: '', // 每期名称
            timeCount: '', // 总时间数。
            timeSinglePrice: '', // 时间单价
            timeType: '', // 天、月、年...
            timeTypeStr: '', // 转义
            valuationType: 0, // 计价方式。默认课时计价
            valuationTypeStr: '',
            mustTuition: item.mustTuition, // 为1时，选择课程时，必须包含学杂
            containTuition: item.containTuition, // 是否包含学杂。  1-是   0-否
            priceId: '', // 价格标准ID
            price: 0, // 课程总价
            priceEntityList: item.priceEntityList // 价格列表
          })
        })
        this.templateForm.prizeInfo.courses = this.templateForm.prizeInfo.courses.concat(tempCourses)
      }).finally(() => {
        this.courseLoading = false
      })
    },
    selectTuition(tuitions) {
      if (tuitions == null || tuitions.length === 0) return
      const temp = []
      tuitions.forEach(item => {
        temp.push({
          tuitionId: item.id, // 学杂ID
          name: item.name, // 学杂名称
          tuitionNum: '', // 学杂数量
          price: 0, // 学杂价格
          inventory: item.inventory, // 学杂库存剩余
          singlePrice: item.price // 学杂单价
        })
      })
      this.templateForm.prizeInfo.tuitions = this.templateForm.prizeInfo.tuitions.concat(temp)
    },
    // 课程价格标准发生变化
    handlePriceChange(row) {
      const priceObj = row.priceEntityList.find(o => o.id === row.priceId)
      if (priceObj) {
        // 选择了价格标准
        row.valuationType = priceObj.valuationType
        row.valuationTypeStr = priceObj.valuationTypeStr
        row.valuationTypeName = priceObj.name
        row.classHour = priceObj.classHour
        row.classHourSignalPrice = priceObj.classHourSignalPrice
        row.price = row.classHour * row.classHourSignalPrice
        switch (priceObj.valuationType) {
          case 0:
            // row.classHour = priceObj.classHour
            // row.classHourSignalPrice = priceObj.classHourSignalPrice
            // row.price = row.classHour * row.classHourSignalPrice
            break
          case 1:
            row.periodId = priceObj.periodId
            row.periodPrice = priceObj.periodPrice
            row.periodName = priceObj.periodName
            row.price = priceObj.periodPrice
            break
          case 2:
            row.timeCount = priceObj.timeCount
            row.timeSinglePrice = priceObj.timeSinglePrice
            row.timeType = priceObj.timeType
            const timeTypeObj = this.timeTypeList.find(o => o.value === priceObj.timeType)
            if (timeTypeObj) row.timeTypeStr = timeTypeObj.label
            row.price = row.timeCount * row.timeSinglePrice
            break
        }
      } else {
        // 默认课时计价
        row.priceId = ''
        row.valuationType = 0
      }
    },
    // 计算单课总价
    calcSinglePrice(row) {
      row.classHourSignalPrice = Number((row.price / row.classHour).toFixed(2))
    },
    calcTuitionPrice(row) {
      row.price = row.tuitionNum * row.singlePrice
    }
  },
  watch: {
    templateData(val) {
      if (val != null) {
        const temp = Object.assign({}, val)
        temp.activityTimeRange = [temp.basicInfo.startTime ? moment(temp.basicInfo.startTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          temp.basicInfo.endTime ? moment(temp.basicInfo.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
        if (temp.basicInfo.musicType == null || temp.basicInfo.musicType === '') {
          temp.basicInfo.musicType = 1
        }
        this.templateForm = temp
      }
    },
    templateForm: {
      handler: function(val, oldVal) {
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
    margin-left 193px !important

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

.course-item
  border 1px solid $color-border-2
  border-radius 5px
  padding 10px 0 0 12px
  position relative
  margin-right 30px
  &+.course-item
    margin-top 20px
  .el-form-item
    margin-bottom 10px
  .delete-btn
    position absolute
    top 0
    right 0
    transform translate(50%,  -50%)
</style>

<style lang="stylus">
.bargain-form
  .left-number
      .el-input__inner
        text-align left
</style>

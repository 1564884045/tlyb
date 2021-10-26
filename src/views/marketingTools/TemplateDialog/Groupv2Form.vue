<template>
  <el-form ref="templateForm" :model="templateForm" :rules="rules" label-width="88px" class="groupv2-form">
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
    <el-form-item label="封面图">
      <el-radio-group v-model="templateForm.basicInfo.headType" @change="handleMusicTypeChange">
        <el-radio :label="1">单图</el-radio>
        <el-radio :label="2" disabled>多图</el-radio>
      </el-radio-group>
      <div>
        <template v-if="templateForm.basicInfo.headType === 1">
          <div class="img-con">
            <img v-if="templateForm.basicInfo.headImgs" :src="templateForm.basicInfo.headImgs[0]" alt="活动封面"/>
            <div class="img-layer">
              <span @click="cropperBg(0)">添加图片</span>
            </div>
          </div>
          <p class="form-tip">(建议图片尺寸745:500，大小1M)</p>
        </template>
        <template v-else>
          <!-- 多图 -->
        </template>
      </div>
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
    <el-form-item label="是否启用弹幕" prop="basicInfo.isBarrager" label-width="120">
      <el-checkbox v-model="templateForm.basicInfo.isBarrager"></el-checkbox>
      <span class="form-tip">开启后，将显示获取分佣、参团的弹幕信息</span>
    </el-form-item>
    <el-form-item label="发起预付" prop="prizeInfo.launchPreFee">
      <el-input-number v-model="templateForm.prizeInfo.launchPreFee" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :precision="2" :min="0" :max="99999999" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">发起拼团需要预付的金额，为0则不收取费用。(发布后不能修改)</p>
    </el-form-item>
    <el-form-item label="参与预付" prop="prizeInfo.attendPreFee">
      <el-input-number v-model="templateForm.prizeInfo.attendPreFee" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :precision="2" :min="0" :max="99999999" class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">参与拼团需要预付的金额，为0则不收取费用。(发布后不能修改)</p>
    </el-form-item>
    <el-form-item label="参与次数" prop="prizeInfo.userAttendLimit">
      <el-input-number v-model="templateForm.prizeInfo.userAttendLimit" :disabled="activityInfo && activityInfo.status != 0" :controls="false" :min="1" :max="9999" step-strictly class="left-number" style="width: 203px;"></el-input-number>
      <p class="form-tip">每个用户可参与该活动的拼团次数。(发布后不能修改)</p>
    </el-form-item>
    <el-form-item label="是否分佣" prop="prizeInfo.posterShareKickback">
      <el-checkbox v-model="templateForm.prizeInfo.posterShareKickback" :disabled="activityInfo && activityInfo.status != 0" :true-label="1" :false-label="0"></el-checkbox>
      <span class="form-tip">开启后，可通过分享海报，赚取佣金。(发布后不能修改)</span>
    </el-form-item>
    <!-- 商品列表 -->
    <div class='form-title'>
      <span class="color-primary">商品列表</span>
    </div>
    <div>
      <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addGoods" :disabled="templateForm.goodsList.length >= 10">添加商品</el-button>
      <span class="form-tip" style="margin-left: 16px;">活动发布后，只能增加，不能减少</span>
    </div>
    <el-tabs v-model="currentGoods" type="card" :closable="activityInfo == null || activityInfo.status == 0" @tab-remove="removeGoods" style="margin-top: 12px; margin-bottom: 16px;">
      <el-tab-pane
        v-for="(goods, index) in templateForm.goodsList"
        :key="index"
        :label="'商品' + (index + 1)"
        :name="index + ''"
      >
        <el-form-item label="商品名称" :prop="'goodsList.' + index + '.name'" :rules="{required: true, message: '请填写商品名称', trigger: 'blur'}">
          <el-input v-model="goods.name" :maxlength="16" style="width: 240px" placeholder="请填写商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" :prop="'goodsList.' + index + '.quantity'" required>
          <el-input-number v-model="goods.quantity" :min="goods.originalQuantity || 1" :max="9999999" :controls="false" step-strictly class="left-number" style="width: 203px;"></el-input-number>
          <span class="form-tip" style="margin-left: 16px;">活动发布后，只能增加，不能减少</span>
        </el-form-item>
        <el-form-item label="商品原价" :prop="'goodsList.' + index + '.originalPrice'" required>
          <el-input-number v-model="goods.originalPrice" :min="0" :max="9999999" :controls="false" step-strictly class="left-number" style="width: 203px;"></el-input-number>
        </el-form-item>
        <el-form-item label="团长福利" :prop="'goodsList.' + index + '.isUseGroupMasterWelfare'" required>
          <el-switch v-model="goods.isUseGroupMasterWelfare" active-text="开启" inactive-text="关闭" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item v-if="goods.isUseGroupMasterWelfare" label="福利内容" :prop="'goodsList.' + index + '.isUseGroupMasterWelfare'" required>
          <el-input v-model="goods.groupMasterWelfareData" type="textarea" :rows="3" :maxlength="80" show-word-limit style="width: 320px; margin-bottom: 12px" placeholder="内容描述，最多80个字"></el-input>
        </el-form-item>
        <el-form-item label="价格阶梯" :prop="'goodsList.' + index + '.ladderData'" required>
          <div v-for="(item, index) in goods.ladderData" :key="index" style="margin-bottom: 12px;">
            <el-input-number v-model="item.num" :min="0" :max="9999" step-strictly :controls="false" style="width: 68px; margin-right: 6px;"></el-input-number>人成团，价格<el-input-number v-model="item.price" :min="0" :max="999999" :controls="false" step-strictly style="width: 80px; margin: 0 6px;"></el-input-number>元
            <el-button icon="el-icon-delete" @click="goods.ladderData.splice(index, 1)" style="margin-left: 64px;"></el-button>
          </div>
          <el-button icon="el-icon-plus" @click="goods.ladderData.push({ num: 0, price: 0 })">添加阶梯</el-button>
        </el-form-item>
        <el-form-item v-if="templateForm.prizeInfo.posterShareKickback" label="佣金范围" :prop="'goodsList.' + index + '.maxShareKickback'" required>
          <el-input-number v-model="goods.minShareKickback" :min="0" :max="999999" :controls="false" :precision="2" style="width: 68px; "></el-input-number>元
          <span style="margin: 0 24px;">至</span>
          <el-input-number v-model="goods.maxShareKickback" :min="goods.minShareKickback" :max="999999" :controls="false" :precision="2" style="width: 68px;"></el-input-number>元
          <p class="form-tip">通过分享海报获取的佣金，不能大于发起/参与拼团所支付的金额。</p>
        </el-form-item>
      </el-tab-pane>
    </el-tabs>
    <!-- 活动信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">活动信息</span>
    </div>
    <p class="form-tip">可自由添加和删除模块，自定义模块中的标题和内容描述。最多5个模块</p>
    <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addBlock" :disabled="templateForm.block.length >= 5">添加模块</el-button>
    <el-tabs v-model="currentBlock" type="card" closable @tab-remove="removeBlock" style="margin-top: 12px; margin-bottom: 16px;">
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
              <el-tooltip class="item" effect="dark" content="删除" placement="right">
                <el-button size="mini" icon="el-icon-delete" @click="removeAuxiliary(index, index1)"></el-button>
              </el-tooltip>
              <el-button v-if="index1 === 0" disabled size="mini" icon="el-icon-top"></el-button>
              <el-tooltip v-else class="item" effect="dark" content="上移" placement="right">
                <el-button size="mini" icon="el-icon-top" @click="moveUpAuxiliary(index, index1)"></el-button>
              </el-tooltip>
              <el-button v-if="index1 === (mode.auxiliaries.length - 1)" disabled size="mini" icon="el-icon-bottom"></el-button>
              <el-tooltip v-else class="item" effect="dark" content="下移" placement="right">
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
    <!-- 校区信息 -->
    <div class='form-title'>
      <span class="color-primary">校区信息</span>
    </div>
    <el-form-item label="校区名称" prop="orgInfo.name">
      <el-input v-model="templateForm.orgInfo.name" :maxlength="50" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="校区电话" prop="orgInfo.phone">
      <el-input v-model="templateForm.orgInfo.phone" :maxlength="50" style="width: 260px"></el-input>
    </el-form-item>
    <el-form-item label="校区地址" prop="orgInfo.address">
      <el-input v-model="templateForm.orgInfo.address" type="textarea" :maxlength="120" style="width: 260px"></el-input>
    </el-form-item>
    <!-- 报名信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">报名信息</span>
    </div>
    <div style="margin: 12px 20px">
    </div>
    <el-form-item prop="reservationInfo" label-width="20px">
      <p class="form-tip">勾选的字段为学员报名时必填的内容，填写项过多可能会影响学员报名，最多设置5项。</p>
      <label class="required-label">学员姓名</label>
      <label class="required-label">联系电话</label>
      <el-checkbox-group v-model="templateForm.reservationInfo" :max="3" style="display: inline-block;margin-left: 20px;">
        <el-checkbox label="sex">性别</el-checkbox>
        <el-checkbox label="age">年龄</el-checkbox>
        <el-checkbox label="school">学校</el-checkbox>
        <el-checkbox label="grade">年级</el-checkbox>
        <el-checkbox label="address">联系地址</el-checkbox>
      </el-checkbox-group>
      <div class="reservation-box">
        <div class="reservation-title">扩展字段： <el-button icon="el-icon-plus" size="mini" @click="handleAddReservation(0)">简单文本</el-button> <el-button icon="el-icon-plus" size="mini" @click="handleAddReservation(1)">下拉选择</el-button></div>
        <template v-for="(item, index) in templateForm.reservationInfo">
          <div class="reservation-item" :key="index" v-if="item.type === 0">
            <label class="required-label">文本标签:</label> <el-input v-model="item.label" :maxlength="12" style="width: 130px"/>
            <el-button title="删除该行" size="mini" icon="el-icon-delete" @click="templateForm.reservationInfo.splice(index, 1)" style="float: right;"></el-button>
          </div>
          <div class="reservation-item" :key="index" v-else-if="item.type === 1">
            <label class="required-label">下拉标签:</label>
            <el-input v-model="item.label" :maxlength="12"  style="width: 130px"></el-input>
            <el-checkbox v-model="item.multiple" @change="item.max = 1">多选</el-checkbox>
            <template v-if="item.multiple">最多选择<el-input-number v-model="item.max" :min="1" :max="99" :controls="false" step-strictly style="width: 48px;"></el-input-number>项</template>
            <div style="float: right;">
              <el-button title="展开选项" size="mini" icon="el-icon-arrow-down" :type="item.open ? 'primary' : ''" @click="item.open = !item.open"></el-button>
              <el-button title="删除该行" size="mini" icon="el-icon-delete" @click="templateForm.reservationInfo.splice(index, 1)"></el-button>
            </div>
            <el-input v-show="item.open" v-model="item.optionsStr" @blur="handleConvertOptions($event, item)" type="textarea" :rows="5" style="margin-top: 8px;" placeholder="英文逗号分隔，如果需要分组，使用英文分号分隔。分组名和选项用冒号分隔。             比如： 文化课:语文,数学,英语;兴趣课:写字,舞蹈,绘画"></el-input>
          </div>
        </template>
      </div>
    </el-form-item>
    <!-- 分享信息 -板块 -->
    <div class='form-title'>
      <span class="color-primary">分享信息</span>
    </div>
    <el-form-item label="分享封面" prop="shareInfo.imageUrl">
      <div class="img-con">
        <img v-if="templateForm.shareInfo.imageUrl" :src="templateForm.shareInfo.imageUrlTemp || templateForm.shareInfo.imageUrl" alt="分享封面"/>
        <div class="img-layer">
          <span @click="cropperBg(1)">添加图片</span>
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
    <cropper-dialog v-model="showCropperBg" ref="cropperBg" :options="{aspectRatio: 745 / 500}" title="裁剪分享封面图" @uploadComplete="handleUploadCompleteBg"/>

    <input ref="imageInput" type="file" accept="image/*" @change="handleSelectImage" style="display: none;"/>

    <audio ref="bacMusic" :src="templateForm.basicInfo.musicSrc" loop></audio>
  </el-form>
</template>

<script>
import CropperDialog from '@/components/CropperDialog'

import moment from 'moment'

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
      showCropperBg: false,
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
      currentGoods: '0',
      currentBlock: '0',
      templateForm: {
        activityTimeRange: [],
        basicInfo: {
          activityName: '抢暑期芭蕾舞课程，最低仅需600元',
          startTime: '',
          endTime: '',
          musicType: 0,
          musicSrc: '',
          headType: 1, // 头图类型   0-无   1-单图   2-轮播图
          headImgs: [
            'http://tmpcdn.tlybond.com/template/groupv2/recruit_student/img/header_img.png'
          ],
          specialEffect: {
            direction: 'down',
            type: 0
          },
          isBarrager: true
        },
        prizeInfo: {
          launchPreFee: 2,
          attendPreFee: 1,
          userAttendLimit: 1,
          posterShareKickback: 1
        },
        block: [{
          'type': 0,
          'value': 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。'
        }, {
          'type': 1,
          'value': 'https://www.yizhiniao.com/templates/show_template/group/goodStart/img/organ_lis.png'
        }],
        goodsList: [
          {
            name: '观山湖第一届教育博览会',
            quantity: 444,
            buyGoodsLimit: 1,
            originalPrice: 899,
            isUseGroupMasterWelfare: 1,
            groupMasterWelfareData: '成团成功，三人团多选一门课程，五人团多远两门课程',
            minShareKickback: 1,
            maxShareKickback: 2,
            ladderData: [
              { num: 3, price: 288 },
              { num: 5, price: 188 }
            ]
          },
          {
            name: '书法课超级大优惠',
            quantity: 108,
            buyGoodsLimit: 1,
            originalPrice: 1299,
            isUseGroupMasterWelfare: 1,
            groupMasterWelfareData: '成团成功，三人团多选一门课程，五人团多远两门课程',
            minShareKickback: 1,
            maxShareKickback: 2,
            ladderData: [
              { num: 3, price: 499 },
              { num: 5, price: 399 },
              { num: 8, price: 299 }
            ]
          }
        ],
        orgInfo: {
          'name': '桃李云帮培训学校',
          'phone': '0571-85789582',
          'address': '贵阳市贵安新区数字经济产业园D栋'
        },
        shareInfo: {
          'imageUrl': 'http://tmpcdn.tlybond.com/template/groupv2/recruit_student/img/header_img.png',
          'title': 'XX教育双12拼团活动',
          'desc': 'XX招生优惠不断，人越多，优惠越大。'
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
        'prizeInfo.userAttendLimit': { required: true, message: '请填写每个人能参与拼团次数', trigger: 'blur' },
        'prizeInfo.posterShareKickback': { required: true, message: '请选择是否分佣', trigger: 'blur' }
      },
      playing: false
    }
  },
  components: {
    CropperDialog
  },
  mounted() {
    if (this.templateData != null) {
      const temp = Object.assign({}, this.templateData)
      temp.activityTimeRange = [temp.basicInfo.startTime ? moment(temp.basicInfo.startTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        temp.basicInfo.endTime ? moment(temp.basicInfo.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
      if (temp.basicInfo.musicType == null || temp.basicInfo.musicType === '') {
        temp.basicInfo.musicType = 1
      }
      // 同步后端的商品ID
      try {
        if (temp.goodsList && this.activityInfo && this.activityInfo.goodsInfo) {
          temp.goodsList.forEach((item, index) => {
            item.id = this.activityInfo.goodsInfo[index].id
          })
        }
      } catch (error) {
        console.error('同步商品的ID失败')
      }
      // 发布后商品数量只能增加，不能减少
      if (this.activityInfo && this.activityInfo.status !== 0 && temp.goodsList) {
        temp.goodsList.forEach(item => {
          item.originalQuantity = item.quantity
        })
      }
      this.templateForm = temp
    }
  },
  methods: {
    publish() {
      // 发布活动
      this.$http.put('/v1/ActivityGroupPurchase/updateStatus?status=1&id=' + this.activityId).then(() => {
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
      if (this.playing) {
        this.$refs.bacMusic.pause()
      } else {
        this.$refs.bacMusic.play()
      }
      this.playing = !this.playing
    },
    // 添加商品
    addGoods() {
      if (this.templateForm.goodsList.length >= 10) return
      this.templateForm.goodsList.push({
        name: '',
        quantity: 1,
        buyGoodsLimit: 1,
        originalPrice: 999,
        isUseGroupMasterWelfare: 1,
        groupMasterWelfareData: '成团成功，三人团多选一门课程，五人团多选两门课程',
        minShareKickback: 1,
        maxShareKickback: 2,
        ladderData: [
          { num: 3, price: 288 }
        ]
      })
      this.currentGoods = (this.templateForm.goodsList.length - 1) + ''
    },
    // 删除商品
    removeGoods(index) {
      if (this.templateForm.goodsList.length <= 1) return
      // 删除内容
      this.$confirm('确认删除该商品信息？', '提示').then(() => {
        this.templateForm.goodsList.splice(index, 1)
      })
      let current = parseInt(this.currentGoods)
      if (current >= (this.templateForm.goodsList.length - 1)) {
        this.currentGoods = (this.templateForm.goodsList.length - 1) + ''
      }
    },
    // 添加模块
    addBlock() {
      if (this.templateForm.block.length >= 5) return
      this.templateForm.block.push({
        title: '',
        auxiliaries: [
          {
            type: 0,
            value: ''
          }
        ]
      })
      this.currentBlock = (this.templateForm.block.length - 1) + ''
    },
    // 删除模块
    removeBlock(index) {
      if (this.templateForm.block.length <= 1) return
      // 删除内容
      this.$confirm('确认删除？', '提示').then(() => {
        this.templateForm.block.splice(index, 1)
      })

      let current = parseInt(this.currentBlock)
      if (current >= (this.templateForm.block.length - 1)) {
        this.currentBlock = (this.templateForm.block.length - 1) + ''
      }
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
    // 裁剪图片   0-封面图
    cropperBg(type) {
      this.cropperType = type
      this.$refs.cropperBg.select()
    },
    // 裁剪完成
    handleUploadCompleteBg(res) {
      if (this.cropperType === 0) {
        // 封面图
        this.templateForm.basicInfo.headImgs = [res.url]
      } else {
        // 分享图
        this.templateForm.shareInfo.imageUrl = res.url
        this.templateForm.shareInfo.imageUrlTemp = res.tempUrl
      }
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
    // 添加预留的扩展字段。  0-简单文本    1-下拉选择
    handleAddReservation(type) {
      if (this.templateForm.reservationInfo.length >= 3) {
        this.$message.warning('最多选择5项')
        return
      }
      if (type === 0) {
        this.templateForm.reservationInfo.push({
          type: 0,
          label: '简单文本',
          value: ''
        })
      } else if (type === 1) {
        this.templateForm.reservationInfo.push({
          type: 1,
          label: '下拉选择',
          value: '',
          multiple: false,
          open: true,
          max: 1,
          optionsStr: '',
          options: []
        })
      }
    },
    // 字符串转化
    handleConvertOptions(event, item) {
      let res = {}
      try {
        if (item.optionsStr.indexOf(';') > -1) {
          // 分组
          const temp = item.optionsStr.split(';')
          for (let i = 0; i < temp.length; i++) {
            if (temp[i].indexOf(':') === -1) {
              this.$message.warning('分组中必须包含分组标题')
              event.target.focus()
              return
            } else {
              res[temp[i].split(':')[0]] = temp[i].split(':')[1].split(',')
            }
          }
        } else {
          res = item.optionsStr.split(',')
        }
        item.options = res
        this.$message.success('数据解析正常')
      } catch (error) {
        console.error(error)
        this.$message.error('数据解析报错！')
        event.target.focus()
      }
    },
    setShowData() {
      const data = JSON.parse(JSON.stringify(this.templateForm))
      this.$emit('postMessage', {
        type: 'setData',
        data: data
      })
    },
    // 提交保存
    save() {
      return new Promise((resolve, reject) => {
        this.$refs.templateForm.validate(valid => {
          if (valid) {
            const tempTemplateForm = JSON.parse(JSON.stringify(this.templateForm))
            const startTime = tempTemplateForm.activityTimeRange[0]
            const endTime = tempTemplateForm.activityTimeRange[1]
            tempTemplateForm.basicInfo.startTime = startTime.indexOf(' ') > -1 ? startTime : (startTime + ' 00:00:00')
            tempTemplateForm.basicInfo.endTime = endTime.indexOf(' ') > -1 ? endTime : (endTime + ' 23:59:59')
            // 删除临时数据
            delete tempTemplateForm.activityTimeRange
            if (tempTemplateForm.shareInfo.imageUrlTemp) {
              delete tempTemplateForm.shareInfo.imageUrlTemp
            }
            tempTemplateForm.block.forEach(item => {
              if (item.auxiliaries) {
                item.auxiliaries.forEach(o => {
                  if (o.temp) delete o.temp
                })
              }
            })
            // 处理商品信息
            let goodsList = []
            tempTemplateForm.goodsList.forEach((item, index) => {
              let fullGroupLimit = 0
              item.ladderData.forEach(d => {
                if (d.num > fullGroupLimit) fullGroupLimit = d.num
              })
              goodsList.push(Object.assign({}, item, {
                sort: index,
                fullGroupLimit: fullGroupLimit,
                ladderData: JSON.stringify(item.ladderData)
              }))
            })
            // 组装数据
            const params = {
              basicInfo: {
                name: tempTemplateForm.basicInfo.activityName,
                startTime: tempTemplateForm.basicInfo.startTime,
                endTime: tempTemplateForm.basicInfo.endTime,
                launchFee: tempTemplateForm.prizeInfo.launchPreFee,
                launchLimit: 1,
                attendFee: tempTemplateForm.prizeInfo.attendPreFee,
                attendLimit: tempTemplateForm.prizeInfo.userAttendLimit,
                posterShareKickback: tempTemplateForm.prizeInfo.posterShareKickback,
                organizationId: this.$store.getters.organizationInfo.id,
                departmentId: this.$store.getters.currentBranch.id,
                templateId: this.templateId,
                data: JSON.stringify(tempTemplateForm)
              },
              goodsInfo: goodsList
            }
            if (this.activityId) {
              // 修改
              params.basicInfo.id = this.activityId
              this.$http.put('/v1/ActivityGroupPurchase/updateActivityGroupPurchase', params).then(res => {
                // 提示
                this.$message.success('修改拼团模板成功。')
                resolve()
              }).catch(() => {
                reject()
              })
            } else {
              this.$http.post('/v1/ActivityGroupPurchase/addActivityGroupPurchase', params).then(res => {
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
        temp.activityTimeRange = [temp.basicInfo.startTime ? moment(temp.basicInfo.startTime).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          temp.basicInfo.endTime ? moment(temp.basicInfo.endTime).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD')]
        if (temp.basicInfo.musicType == null || temp.basicInfo.musicType === '') {
          temp.basicInfo.musicType = 1
        }
        setTimeout(() => {
          // 同步后端的商品ID
          try {
            if (temp.goodsList && this.activityInfo && this.activityInfo.goodsInfo) {
              temp.goodsList.forEach((item, index) => {
                item.id = this.activityInfo.goodsInfo[index].id
              })
            }
          } catch (error) {
            console.error('同步商品的ID失败')
          }
          // 发布后商品数量只能增加，不能减少
          if (this.activityInfo && this.activityInfo.status !== 0 && temp.goodsList) {
            temp.goodsList.forEach(item => {
              item.originalQuantity = item.quantity
            })
          }
          this.templateForm = temp
        }, 200)
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
    margin-left 123px !important

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
  margin-right 16px
  &::before
    content '*'
    color $color-danger
    margin-right 4px
    display inline-block
.form-title
  font-size 14px
  padding 10px 20px
  margin 0 0 10px
  // border-top 1px solid #ddd
  background #f2f2f2
  color $color-primary
  box-sizing border-box

.reservation-box
  border 1px solid $color-border-3
  padding 8px 12px
  border-radius 3px
  .reservation-title
    margin-bottom 12px
  .reservation-item
    padding 6px 0
  .reservation-item+.reservation-item
    border-top 1px dashed $color-border-1
  .el-checkbox
    margin 0 16px
</style>

<style lang="stylus">
.groupv2-form
  .left-number
    .el-input__inner
      text-align left
  .el-checkbox
    margin-right 16px
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
  .reservation-box
    .el-input-group__append
      padding 0 12px
</style>

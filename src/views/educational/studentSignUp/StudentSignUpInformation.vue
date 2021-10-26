// 学生扫码报名信息
<template>
  <div class="container">
    <div class="item">
      <div class="head">
        <div class="circular"></div>
        <span>学员信息</span>
      </div>
      <div class="main">
        <el-form :model="studentInfo" ref="studentInfo" class="enroll-form" :rules="studentRules" inline label-width="100px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model.trim="studentInfo.name" placeholder="请填写学员姓名" :maxlength="20" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="studentInfo.nickName" placeholder="请填写学员昵称" :maxlength="20" />
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="studentInfo.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">未知</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年龄" prop="birthday">
            <el-input-number v-model="studentInfo.age" @change="handleAgeChange" :controls="false" placeholder="年龄" :min="0" :max="128" style="width: 80px; margin-right: 12px;" />
            <el-date-picker v-model="studentInfo.birthday" value-format="yyyy-MM-dd" placeholder="生日" @change="handleBirthdayChange" style="width: 210px;"></el-date-picker>
          </el-form-item>
          <el-form-item label="来源渠道" prop="provenanceId">
            <el-select v-model="studentInfo.provenanceId" placeholder="请选择渠道类型">
              <el-option v-for="item in sourceList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="主要联系人">
            <el-form-item prop="primaryContactName" style="margin-bottom: 0;">
              <el-input v-model="studentInfo.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20" style="width: 180px;" />
            </el-form-item>
            <el-form-item prop="relationId" style="margin-bottom: 0;">
              <el-select v-model="studentInfo.relationId" placeholder="选择关系" style="width: 100px;">
                <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="primaryContactPhone" style="margin-bottom: 0;">
              <el-input :maxlength="11" v-model="studentInfo.primaryContactPhone" placeholder="手机号码" />
            </el-form-item>
          </el-form-item>
          <div class="divider-line"></div>
          <el-form-item label="身份证号" prop="idCard">
            <el-input :maxlength="18" v-model="studentInfo.idCard" placeholder="学员身份证号码" />
          </el-form-item>
          <el-form-item label="推荐人" prop="recommendUser">
            <el-input v-model="studentInfo.recommendUser" placeholder="学员推荐人" :maxlength="20" />
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-autocomplete :maxlength="20" v-model="studentInfo.school" @focus="_getSchoolList" value-key="name" :fetch-suggestions="filterSchool" placeholder="请填写学校名称（可快捷搜索）" />
          </el-form-item>
          <el-form-item label="年级" prop="gradle">
            <el-select v-model="studentInfo.gradle" placeholder="学员所在年级" clearable>
              <el-option v-for="item in gradeList" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="家庭住址" prop="address">
            <el-input v-model="studentInfo.address" placeholder="学员家庭住址(最多50个字)" :maxlength="50" style="width: 624px;" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="studentInfo.remark" :rows="4" placeholder="备注信息(最多120个字)" :maxlength="120" show-word-limit style="width: 624px;" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="item">
      <div class="head-item">
        <div class="title">
          <div class="circular"></div>
          <span>订单信息</span>
        </div>
        <span style="float: right; font-weight: normal;">
          总计金额：
          <span class="color-danger">{{totalCoursePrice}}元</span>
        </span>
      </div>
      <div class="main">
        <div class="course-container">
          <template>
            <el-table :data="selectedCourseList" class="course-table">
              <el-table-column prop="name" label="课程名称" fixed>
              </el-table-column>
              <el-table-column prop="valuationTypeStr" label="收费套餐" width="120" align="center">
                <el-select slot-scope="scope" v-model="scope.row.priceId" placeholder="选择套餐" @change="handlePriceEntityChange(scope.row)">
                  <el-option v-for="item in scope.row.priceEntityList" :key="item.id" :value="item.id" :label="item.name">
                  </el-option>
                </el-select>
              </el-table-column>
              <el-table-column prop="classHourSignalPrice" label="课程单价" width="140" align="center">
                <template slot-scope="scope">
                  <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                    <el-input-number v-model="scope.row.classHourSignalPrice" @change="handlePriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                    <span class="append-unit">元/课时</span>
                  </div>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元/期</span>
                    <span v-if="scope.row.valuationType === 2">
                      <el-input-number v-model="scope.row.timeSinglePrice" @change="handlePriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                      <span class="append-unit">元/{{sendTimeType[scope.row.timeType].date}}</span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="classHour" label="购买课程" width="80" align="center">
                <template slot-scope="scope">
                  <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                    <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.classHour" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                    <span class="append-unit">课时</span>
                  </div>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">一期</span>
                    <span v-if="scope.row.valuationType === 2">
                      <el-input-number v-model="scope.row.timeCount" @change="handlePriceChange(scope.row)" :precision="0" :min="0" :max="99999999" :controls="false"></el-input-number>
                      <span class="append-unit">{{scope.row.timeTypeStr}}</span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sendClassHour" label="赠送课程" width="100" align="center">
                <template slot-scope="scope">
                  <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                    <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.sendClassHour" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                    <span class="append-unit">课时</span>
                  </div>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">--</span>
                    <div class="send-class-box" v-if="scope.row.valuationType === 2">
                      <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.sendTimeCount" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                      <el-select style="width: 60%" v-model="scope.row.sendTimeUnit" placeholder="选择类型" @change="computeDeadline(scope.row)">
                        <el-option style="width: 100%" v-for="item in timeTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sendClassHour" label="总时间" width="80" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour + scope.row.classHour}}课时</span>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">--</span>
                    <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time}} 天</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="validTime" label="截止日期" width="140" align="center">
                <template slot-scope="scope">
                  <el-date-picker
                    v-if="scope.row.valuationType !== 1"
                    v-model="scope.row.validTime"
                    type="date"
                    style="width: 130px"
                    :picker-options="pickerOptions"
                    value-format="yyyy-MM-dd"
                    placeholder="选择日期">
                  </el-date-picker>
                  <span v-if="scope.row.valuationType === 1">{{scope.row.periodStartDate}}- <br> -{{scope.row.periodEndDate || '- -'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="课程均价" width="120" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.enableClassHour !== 0">{{Number((scope.row.price/(scope.row.sendClassHour + scope.row.classHour)).toFixed(2)) || 0}}元/课时</span>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元/期</span>
                    <span
                      v-if="scope.row.valuationType === 2"
                    >{{(scope.row.price / (scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time)).toFixed(2)}} 元/天</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="originPrice" label="课程价格" width="120" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.enableClassHour !== 0" class="append-unit">
                    {{Number(scope.row.originPrice) || 0}}元
                  </span>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元</span>
                    <span v-if="scope.row.valuationType === 2">
                      {{scope.row.timeCount * scope.row.timeSinglePrice}}元
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="优惠" width="160" align="center">
                <div class="customer-input" slot-scope="scope">
                  <el-select v-model="scope.row.discountType" @change="handlePriceChange(scope.row)" placeholder="请选择">
                    <el-option label="优惠" :value="1"></el-option>
                    <el-option label="折扣" :value="0"></el-option>
                  </el-select>
                  <!-- 优惠价格 -->
                  <template v-if="scope.row.discountType === 1">
                    <el-input-number v-model="scope.row.discountPrice" @change="handlePriceChange(scope.row)" :precision="2" :controls="false" :min="0" :max="scope.row.originPrice" class="left-number"></el-input-number>
                    <span class="append-unit">元</span>
                  </template>
                  <!-- 优惠折扣 -->
                  <template v-else>
                    <el-input-number v-model="scope.row.discountFolding" @change="handlePriceChange(scope.row)" :precision="1" :controls="false" :min="0" :max="10" class="left-number"></el-input-number>
                    <span class="append-unit">折</span>
                  </template>
                </div>
              </el-table-column>
              <el-table-column prop="price" label="应付金额" width="120" align="center">
                <div class="right-unit-number" slot-scope="scope">
                  <el-input-number v-model="scope.row.price" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                  <span class="append-unit">元</span>
                </div>
              </el-table-column>
              <el-table-column label="操作" width="54" align="center" fixed="right">
                <el-button slot-scope="scope" type="text" icon="el-icon-delete" @click="deleteCourse(scope.row, scope.$index)" size="normal" title="删除课程"></el-button>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="head-item">
        <div class="title">
          <div class="circular"></div>
          <span>学杂信息</span>
        </div>
        <span style="float: right; font-weight: normal;">
          总计金额：
          <span class="color-danger">{{totalTuitionPrice}}元</span>
        </span>
      </div>
      <div>
        <el-table :data="selectedTuitionList">
          <el-table-column prop="name" label="学杂名称">
            <template slot-scope="scope">
              <span>{{scope.row.name}}</span>
              <span v-if="scope.row.courseName" class="color-primary" style="font-size: 10px; margin-left: 12px">({{scope.row.courseName}})</span>
            </template>
          </el-table-column>
          <el-table-column prop="originPrice" label="学杂原价" width="160">
            <template slot-scope="scope">{{ scope.row.originPrice }}元</template>
          </el-table-column>
          <el-table-column prop="singlePrice" label="购买单价" width="160" align="center">
            <div class="right-unit-number" slot-scope="scope">
              <el-input-number v-model="scope.row.singlePrice" @change="handleTuitionPriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
              <span class="append-unit">元</span>
            </div>
          </el-table-column>
          <el-table-column prop="tuitionNum" label="购买数量" align="center" width="140">
            <el-input-number slot-scope="scope" v-model="scope.row.tuitionNum" @change="handleTuitionPriceChange(scope.row)" :min="1" :max="99999" :controls="false" :step-strictly="true" />
          </el-table-column>
          <el-table-column prop="price" label="应付金额" width="144" align="center">
            <template slot-scope="scope">{{scope.row.price}}元</template>
          </el-table-column>
          <el-table-column label="操作" width="84" align="center">
            <el-button
              slot-scope="scope"
              type="text"
              icon="el-icon-delete"
              @click="deleteTuition(scope.row, scope.$index)"
              size="normal"
            ></el-button>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="item">
      <div class="head">
        <div class="circular"></div>
        <span>支付信息</span>
      </div>
      <div>
        <el-form ref="orderInfo" :model="orderInfo" :rules="orderRules" label-width="80px" size="small">
          <p class="custom-form-item">
            <label>学员姓名</label>
            <span>{{studentInfo.name}}</span>
          </p>
          <p class="custom-form-item">
            <label>应付价格</label>
            <span class="color-danger">{{shouldTotalFee}}元</span>
          </p>
          <el-form-item prop="recommendUserId" label="经办人" class="recommend-user-item">
            <el-select v-model="orderInfo.recommendUserId" filterable placeholder="请选择经办人">
              <el-option v-for="item in teacherList" :key="item.id" :value="item.id" :label="item.username"></el-option>
            </el-select>
          </el-form-item>
          <p class="recommend-men">
            如没有符合的经办人，
            <font class="recommend-tap" @click="recommendMen">点击此处</font>进行添加
          </p>
          <el-form-item prop="payType" label="支付方式">
            <pay-type v-model="orderInfo.payType"></pay-type>
          </el-form-item>
          <el-form-item prop="totalFee" label="支付金额">
            <el-input-number v-model="orderInfo.totalFee" :controls="false" :min="-99999999" :max="99999999" class="right-number" style="width: 140px;"></el-input-number>
              <span style="margin-right: 20px;">元</span>
            <el-button type="primary" plain @click="orderInfo.totalFee = shouldTotalFee">全额付款</el-button>
          </el-form-item>
          <el-form-item prop="payTime" label="支付时间">
            <el-date-picker v-model="orderInfo.payTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择支付时间"></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="bottom">
      <el-button @click="cancelForm" >取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确认提交</el-button>
    </div>
    <!-- 订单详情 -->
    <order-detail-dialog ref="orderDetailDialog" :closeOnModal="false" @close="$router.go(-1)"></order-detail-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { idCardValidator } from '@/utils/validate.js'
import PayType from '@/components/PayType'
import OrderDetailDialog from '@/views/salesManagement/OrderDetailDialog'
export default {
  name: 'StudentSignUpInformation',
  components: {
    PayType,
    OrderDetailDialog
  },
  data () {
    return {
      submitLoading: false, // 提交登录
      studentId: 0,
      checkStudentsignUpInfoId: 0, // 查看学员报名信息
      sourceList: [], // 来源渠道
      relationList: [], // 选择与联系人关系
      studentInfo: {
        id: null,
        name: '',
        nickName: '',
        sex: 1,
        birthday: '',
        age: '',
        idCard: '',
        recommendUser: '',
        remark: '',
        school: '',
        gradle: '',
        address: '',
        provenanceId: '',
        relationId: '',
        primaryContactName: '',
        primaryContactPhone: ''
      },
      gradeList: [
        '托管',
        '小班',
        '中班',
        '大班',
        '一年级',
        '二年级',
        '三年级',
        '四年级',
        '五年级',
        '六年级',
        '初一',
        '初二',
        '初三',
        '高一',
        '高二',
        '高三'
      ],
      // 选择的课程列表
      selectedCourseList: [], // 课程信息
      courses: [], // 回显数据
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
      ],
      sendTimeType: [
        { date: '天', time: 1 },
        { date: '月', time: 30 },
        { date: '季度', time: 90 },
        { date: '半年', time: 180 },
        { date: '年', time: 365 }
      ],
      selectedTuitionList: [], // 学杂信息
      submitTuitionList: [],
      // 支付信息
      orderInfo: {
        payTime: '', // 支付时间
        payType: '', // 支付方式
        totalFee: '', // 实收总价格
        recommendUserId: '' // 订单经办人
      },
      // 经办人
      teacherList: [],
      studentRules: {
        name: { required: true, message: '请填写学员姓名', trgger: 'blur' },
        sex: {
          type: 'number',
          required: true,
          message: '请选择性别',
          trgger: ['blur', 'change']
        },
        provenanceId: {
          required: true,
          message: '请选择渠道类型',
          trgger: 'blur'
        },
        idCard: {
          validator: idCardValidator,
          message: '请填写正确的身份证号码',
          trgger: ['change', 'blur']
        }
      },
      orderRules: {
        payTime: {
          required: true,
          message: '请选择支付时间',
          trigger: 'change'
        },
        payType: {
          required: true,
          message: '请选择支付方式',
          trigger: ['change', 'blur']
        },
        recommendUserId: {
          required: true,
          message: '请选择经办人',
          trigger: 'blur'
        },
        totalFee: { required: true, message: '请填写支付金额', trigger: 'blur' }
      },
      // 允许选择时间
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  created () {
    // console.log(this.$route.query, '获取query')
    this.studentId = this.$route.query.studentId
    this._getPreSignUp() // 获取学员的详情信息
    this._getSourceList() // 学员来源渠道
    this._getRelationList() // 学员与联系人关系
    this._getTeacherList() // 经办人
  },
  computed: {
    ...mapGetters(['userInfo', 'organizationInfo', 'currentBranch']),
    // 计算订单总价
    totalCoursePrice() {
      let countPrice = 0
      this.selectedCourseList.forEach((item) => {
        countPrice += Number(item.price) || 0
      })
      return Number(countPrice.toFixed(2))
    },
    // 计算学杂总价
    totalTuitionPrice() {
      let countPrice = 0
      this.selectedTuitionList.forEach((item) => {
        countPrice += Number(item.price)
      })
      return Number(countPrice.toFixed(2))
    },
    // 计算应支付总价
    shouldTotalFee() {
      return Number((this.totalCoursePrice + this.totalTuitionPrice).toFixed(2))
    }
  },
  watch: {
    // 根据学员的生日计算出学员的年龄
    'studentInfo.birthday': {
      handler: function() {
        this.studentInfo.age = Math.abs(moment(this.studentInfo.birthday).diff(moment(), 'year'))
      }
    },
    // 第一次加载学杂数据时，计算出学杂总价
    selectedTuitionList: { // 深度监听
      handler(val, oldVal) {
        this.selectedTuitionList.forEach(item => {
          item.price = Number((item.tuitionNum * item.singlePrice).toFixed(2))
        })
      },
      deep: true
    }
  },
  methods: {
    // 获取学生扫码报名详情信息
    _getPreSignUp() {
      // 最初进入页面时，等待加载数据
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http.get(`/v1/preSign/getPreSignUp/${this.studentId}`).then(res => {
        // 学员基本信息
        res.data.preSignUpStudentEntity.birthday = res.data.preSignUpStudentEntity.birthday.split(' ')[0]
        res.data.preSignUpStudentEntity.provenanceId = '扫码报名'
        this.studentInfo = res.data.preSignUpStudentEntity
        // 学员订单信息
        const courseTemp = []
        res.data.preStudentCourseEntityList.forEach((item) => {
          // 处理价格标准
          item.priceEntityList.forEach((price) => {
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
                const temp = this.timeTypeList.find(
                  (o) => o.value === price.timeType
                )
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
            courseTemp.push({
              validTime: '', // 课程截止日期
              sendTimeUnit: 0, // 赠送课程类型天、月、季度、半年、年
              courseId: item.id,
              addCourseStatus: item.addCourseStatus, // 0-新报    1-续报
              name: item.name, // 课程名称 1
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
              priceEntityList: item.priceEntityList, // 价格列表
              discountType: 1, // 0-折扣    1-优惠价
              discountPrice: 0, // 优惠价格
              discountFolding: 10, // 折扣
              sendClassHour: 0, // 赠送课时
              sendTimeCount: 0, // 赠送时间
              originPrice: 0 // 课程原价
            })
          })
        })
        this.selectedCourseList = courseTemp
        // 学杂信息
        // 课程必选学杂未做禁止删除限制
        res.data.preStudentTuitionEntities.forEach(item => {
          item.originPrice = item.price
          item.singlePrice = item.price
        })
        this.selectedTuitionList = res.data.preStudentTuitionEntities
      }).finally(() => {
        loading.close()
      })
    },
    // 动态计算截止日期
    computeDeadline(item) {
      this.$nextTick(() => {
        if (item.valuationType === 2) {
          /**
             * (row.timeCount, '购买数量')
             * (row.timeType, '购买类型')
             * (row.sendClassHour, '赠送时间')
             * (row.sendTimeUnit, '赠送时间类型')
             * (this.sendTimeType[row.timeType].time, '购买时间天数')
             * (this.sendTimeType[row.sendTimeUnit].time, '赠送时间天数')
             */
          let addTime = item.enableClassHour
            ? item.timeCount * this.sendTimeType[item.timeType].time
            : item.timeCount * this.sendTimeType[item.timeType].time + item.sendTimeCount * this.sendTimeType[item.sendTimeUnit].time
          item.validTime = (new Date(new Date().setDate(new Date().getDate() + Number(addTime)))).toLocaleDateString().replace(/\//g, '-')
        }
      })
    },
    // 课程价格标准发生变化
    handlePriceEntityChange(row) {
      // 动态计算截止日期
      this.computeDeadline(row)
      const priceObj = row.priceEntityList.find((o) => o.id === row.priceId)
      if (priceObj) {
        // 选择了价格标准
        row.valuationType = priceObj.valuationType
        row.valuationTypeStr = priceObj.valuationTypeStr
        row.valuationTypeName = priceObj.name
        row.classHour = priceObj.classHour
        // row.classHourSignalPrice = priceObj.classHourSignalPrice
        // row.price = row.classHour * row.classHourSignalPrice
        switch (priceObj.valuationType) {
          case 0:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.classHour = priceObj.classHour
            row.classHourSignalPrice = priceObj.classHourSignalPrice
            row.price = row.classHour * row.classHourSignalPrice
            row.originPrice = Number(
              (row.classHour * row.classHourSignalPrice).toFixed(2)
            )
            break
          case 1:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.periodStartDate = priceObj.periodStartDate // 课程开始日期
            row.periodEndDate = priceObj.periodEndDate // 课程预计结束时间
            row.classHour = priceObj.classHour
            // 按期计费数据并未有课时单价数据，通过计算赋予
            row.classHourSignalPrice = priceObj.enableClassHour === 1 ? Number((priceObj.periodPrice / priceObj.classHour).toFixed(2)) : Number(priceObj.periodPrice)
            row.periodId = priceObj.periodId
            row.periodPrice = Number(priceObj.periodPrice)
            row.periodName = priceObj.periodName
            row.price = Number(priceObj.periodPrice)
            row.originPrice = Number(priceObj.periodPrice)
            break
          case 2:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.classHour = priceObj.classHour
            // 按天计费数据并未有课时单价数据，通过计算赋予
            row.classHourSignalPrice = priceObj.enableClassHour === 1 ? (Number((priceObj.timeSinglePrice * priceObj.timeCount) / priceObj.classHour).toFixed(2)) : Number(priceObj.timeSinglePrice)
            row.timeCount = priceObj.timeCount
            row.timeSinglePrice = priceObj.timeSinglePrice
            row.timeType = priceObj.timeType
            const timeTypeObj = this.timeTypeList.find(
              (o) => o.value === priceObj.timeType
            )
            if (timeTypeObj) row.timeTypeStr = timeTypeObj.label
            row.price = Number(row.timeCount * row.timeSinglePrice)
            row.originPrice = Number(
              (row.timeCount * row.timeSinglePrice).toFixed(2)
            )
            break
        }
      } else {
        // 默认课时计价
        row.priceId = ''
        row.valuationType = 0
      }
    },
    // 课程价格发生变化
    handlePriceChange(row) {
      // 动态计算截止日期
      this.computeDeadline(row)
      if (row.valuationType === 2 && row.enableClassHour === 0) {
        row.originPrice = Number((row.timeSinglePrice * row.timeCount).toFixed(0))
      } else {
        row.originPrice = Number((row.classHour * row.classHourSignalPrice).toFixed(0))
      }
      if (row.discountType === 1) {
        // 优惠价格
        row.price = row.originPrice ? Number(row.originPrice - row.discountPrice) : Number(row.periodPrice - row.discountPrice)
      } else {
        // 折扣
        row.price = ((Number(row.originPrice || row.periodPrice).toFixed(0) * row.discountFolding) / 10).toFixed(2)
      }
    },
    // 删除课程
    deleteCourse(course, index) {
      this.$confirm(`确定删除课程【${course.name}】吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        // 包含学杂，删除课程携带的学杂
        if (course.containTuition === 1) {
          for (let i = this.selectedTuitionList.length - 1; i >= 0; i--) {
            if (this.selectedTuitionList[i].courseId === course.courseId) {
              this.selectedTuitionList.splice(i, 1)
            }
          }
        }

        this.selectedCourseList.splice(index, 1)
      })
    },
    // 与联系人关系
    _getRelationList() {
      this.$http.get('/v1/dictionary/DicRelation/getAll').then((res) => {
        this.relationList = res.data
      })
    },
    // 来源渠道
    _getSourceList() {
      const param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      this.$http.get('/v1/dictionary/DicStudentSource/getAll', param).then((res) => {
        this.sourceList = res.data
      })
    },
    _getSchoolList() {
      // 确保只请求一次
      if (this.isRequestSchool) return
      this.isRequestSchool = true
      this.$http
        .get('/v1/SurroundSchool/getSurroundSchoolList', {
          departmentId: this.currentBranch && this.currentBranch.id
        })
        .then((res) => {
          this.schoolList = res.data
        })
    },
    // 年龄发生变化
    handleAgeChange(age) {
      this.studentInfo.birthday = moment()
        .subtract('years', age)
        .format('YYYY-MM-DD')
    },
    // 生日变化
    handleBirthdayChange(birthday) {
      this.studentInfo.age = Math.abs(moment(birthday).diff(moment(), 'year'))
    },
    // 过滤学校
    filterSchool(query, cb) {
      cb(
        this.schoolList.filter((item) => {
          return item.name.indexOf(query) > -1
        })
      )
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.$http
        .get('/v1/User/getUserList', { departmentId: this.currentBranch.id })
        .then((res) => {
          this.teacherList = res.data
        })
    },
    // 学杂价格变化
    handleTuitionPriceChange(row) {
      row.price = Number((row.tuitionNum * row.singlePrice).toFixed(2))
    },
    // 删除学杂数据
    deleteTuition(row, index) {
      this.$confirm(`确定删除学杂【${row.name}】吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.selectedTuitionList.splice(index, 1)
      })
    },
    // 调转到经办人
    recommendMen() {
      // 打开对话框提示,确认再跳转
      this.$confirm(
        '将跳转到员工管理页面新增员工,已填写数据将丢失! 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$router.push({
            path: '/executive/staff',
            query: {
              recommend: 1
            }
          })
        })
        .catch(() => {})
    },
    // 过滤报名参数中空的字符串
    filterNull(o) {
      for (var key in o) {
        if (o[key] === null || (typeof o[key] === 'string' && o[key] === '')) {
          delete o[key]
        }
        if (typeof o[key] === 'object') {
          o[key] = this.filterNull(o[key])
        }
      }
      return o
    },
    // 取消表单提交
    cancelForm() {
      this.$confirm('此操作退出报名,所修改的报名信息将会恢复原始数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.go(-1)
      })
    },
    // 提交表单
    submitForm() {
      // 学员信息校验
      console.log(this.studentInfo, '打印出学员的信息数据')
      if (!this.studentInfo.name) {
        return this.$message({ message: '学员名字不能为空', type: 'warning' })
      }
      this.studentInfo.organizationId = this.organizationInfo.id
      // 订单校验
      if (this.selectedCourseList.length === 0) {
        return this.$message({ message: '请选择课程', type: 'warning' })
      } else {
        if (!this.selectedCourseList.every(item => item.priceId !== '')) {
          return this.$message({ message: '请选择课程收费套餐', type: 'warning' })
        } else if (!this.selectedCourseList.every(item => item.classHour !== 0)) {
          return this.$message({ message: '请填写购买课程的课时数', type: 'warning' })
        }
      }
      // 订单数据处理
      this.submitTuitionList = this.selectedTuitionList.map(item => {
        item = {
          tuitionId: item.id,
          studentId: this.studentId,
          tuitionName: item.name,
          price: item.price,
          tuitionNum: item.tuitionNum,
          tuitionSinglePrice: item.singlePrice, // 可设置的单价
          valid: 1,
          originPrice: item.originPrice // 原价格
        }
        return item
      })
      this.$refs.orderInfo.validate((valid) => {
        if (valid) {
          let tip = '请确认报名信息无误，是否继续？'
          if (this.orderInfo.totalFee === 0) {
            tip = '当前支付金额为0。' + tip
          } else if (this.orderInfo.totalFee < this.shouldTotalFee) {
            tip = '支付金额小于应付金额。' + tip
          }
          this.$confirm(tip, '提示', {
            type: 'warning'
          }).then(() => {
            this.enroll()
          })
        }
      })
    },
    // 报名
    enroll() {
      this.submitLoading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        studentInfo: this.studentInfo,
        studentCourses: this.selectedCourseList,
        studentTuitions: this.submitTuitionList,
        order: Object.assign({}, this.orderInfo, {
          goodsName: `学员【${this.studentInfo.name}】报名`,
          shouldTotalFee: this.shouldTotalFee
        })
      }
      // 过滤空的字符串
      this.filterNull(params)
      this.$http.post(`/v1/SignUp/addSignUpInfo?preSignUpId=${this.studentId}`, params).then(res => {
        console.log(res, '学员报名成功的数据')
        this.$message.success('报名成功！')
        // 显示订单信息
        this.toShowOrderDetail(res.data.orderId)
      }).finally(() => {
        this.submitLoading = false
      })
    },
    toShowOrderDetail(orderId) {
      this.$refs.orderDetailDialog.open(orderId)
    }
  }
}
</script>

<style scoped lang="stylus">
.container
  width 100%
  height 100%
  background-color #fff
  .item
    padding 0 18px 0 12px
    max-width 1200px
    margin 0 auto 20px
    .head
      display flex
      justify-content flex-start
      align-items center
      margin-bottom 20px
      .circular
        width 12px
        height 12px
        border-radius 12px
        background-color $color-primary
        margin-right 12px
    .head-item
      display flex
      justify-content space-between
      align-items center
      margin-bottom 20px
      .title
        display flex
        justify-content flex-start
        align-items center
        .circular
          width 12px
          height 12px
          border-radius 12px
          background-color $color-primary
          margin-right 12px
    .main
      .enroll-form
        width 10px
        margin 20px auto 0 auto
        min-height 480px
        width 838px
      .el-step__head
        display none
      .el-step__title.is-process
        color $color-primary
        border-color $color-primary
      .left-number
        .el-input__inner
          text-align left
      .right-number
        .el-input__inner
          text-align right
      .course-table
        .inline-select
          padding-left 0
          padding-right 12px
          margin 0
        .inline-select-right
          top 4px
          right -2px
        .cell
          padding 0 6px
      .el-input-number
        width 100%
        .el-input__inner
          padding 0 8px
    .right-unit-number
      position relative
      >>>.el-input__inner
        padding-left 8px !important
        padding-right 8px !important
        text-align left
      .append-unit
        font-size 13px
        position absolute
        height 100%
        line-height 32px
        right 8px
        top 0
        color $color-text-3
    .customer-input
      position relative
      display inline-table
      >>>.el-select
        display table-cell
        .el-input__inner
          padding-left 8px
          padding-right 16px
          width 56px
          border-right none
          border-top-right-radius 0
          border-bottom-right-radius 0
        .el-input__suffix
          right 4px
          width 18px
      .el-input-number
        display table-cell
        .el-input__inner
          border-top-left-radius 0
          border-bottom-left-radius 0
          padding-left 8px
          padding-right 22px
      .append-unit
        font-size 13px
        position absolute
        height 100%
        line-height 32px
        right 6px
        top 0
        color $color-text-3
  .bottom
    text-align center
    padding-bottom 20px
  .custom-form-item
    display inline-block
    min-width 160px
    margin-bottom 12px
    &+.custom-form-item
      margin-left 20px
    label
      font-size 14px
      color #606266
      padding-right 12px
      width 80px
      text-align right
      display inline-block
      line-height 32px
      box-sizing border-box
    span
      line-height 32px
  .recommend-men
    display inline-block
    margin 0px 0 15px 80px
    font-size 12px
    color #999999
    margin-top 5px
    .recommend-tap
      color #ff7e00
      cursor pointer
</style>

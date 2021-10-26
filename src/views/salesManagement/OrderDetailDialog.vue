<template>
  <el-dialog
    :visible.sync="showOrderDetail"
    :show-close="false"
    width="920px"
    top="6vh"
    custom-class="order-detail-dialog"
    :close-on-click-modal="closeOnModal"
    @close="$emit('close')"
    append-to-body>
    <p slot="title" class="dialog-title">
      订单详情<span class="status" v-if="orderDetail && orderDetail.valid === 0">(已作废)</span>
      <i class="close-btn el-icon-close" @click="showOrderDetail = false"/>
    </p>

    <div v-if="orderDetail" v-loading="loading">
      <div class="base-info">
        <div class="order-btns">
          <el-button v-if="orderDetail.orderType === 0 && orderDetail.valid === 1" type="danger" plain icon="el-icon-delete" :loading="cancelLoading" @click="validateCancelOrder(orderDetail.id, orderDetail.outTradeNo)">作废</el-button>
          <el-button type="primary" icon="el-icon-printer" @click="printOrder">打印订单</el-button>
        </div>
        <p class="form-line">
          <label class="form-label">订单号:</label>
          <span class="form-value">{{orderDetail.outTradeNo}}</span>
          <label class="form-label">类型:</label>
          <span class="form-value">{{orderDetail.orderTypeStr}}</span>
          <label class="form-label">订单时间:</label>
          <span class="form-value">{{orderDetail.payTime}}</span>
        </p>
        <p class="form-line">
          <label class="form-label">学员姓名:</label>
          <span class="form-value" style="width: 161px">{{orderDetail.studentName}}</span>
          <label class="form-label">家长:</label>
          <span class="form-value">{{orderDetail.primaryContactName ? orderDetail.primaryContactName : ''}} -  {{orderDetail.primaryContactPhone ? orderDetail.primaryContactPhone : ''}}</span>
        </p>
        <p class="form-line">
          <label class="form-label">订单信息:</label>
          <span class="form-value">{{orderDetail.goodsName}}</span>
        </p>
        <!-- <p class="form-line"> todo 暂无录入地方,所以先去掉
          <label class="form-label">备注:</label>
          <span class="form-value">{{orderDetail.remark}}</span>
        </p> -->
        <p class="form-line" v-if="orderDetail.remark">
          <label class="form-label">备注:</label>
          <span class="form-value">{{orderDetail.remark}}</span>
        </p>
      </div>
      <!-- 订单内容 -->
      <div class="order-goods-info">
        <p class="title">订单内容</p>
        <!-- 报名课程 -->
        <template v-if="orderDetail.orderType === 0 && orderDetail.courseList && orderDetail.courseList.length > 0">
          <el-table
            :data="orderDetail.courseList"
            border>
            <el-table-column
              prop="courseName"
              label="课程名称"
            >
            </el-table-column>
            <el-table-column
              prop="valuationTypeName"
              label="收费套餐"
              width="110"
              align="center"
            >
            </el-table-column>
            <el-table-column
              prop="validTime"
              label="截止日期"
              width="110"
              align="center"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType !== 1"> {{scope.row.validTime ? scope.row.validTime.slice(0, 10) : '-'}} </span>
                <span v-if="scope.row.valuationType === 1"> {{scope.row.periodEndDate ? scope.row.periodEndDate.slice(0, 10) : '-'}} </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="classHourSignalPrice"
              label="课程单价"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">
                  {{Number((scope.row.price/scope.row.classHour).toFixed(2)) || 0}}元/课时
                </span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">
                    {{scope.row.periodPrice}}元/期
                  </span>
                  <span v-if="scope.row.valuationType === 2">
                    {{scope.row.timeSinglePrice}}元/{{sendTimeType[scope.row.timeType].date}}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="classHour"
              label="购买课程"
              width="80"
              align="center"
            >
            <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.classHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.timeCount + sendTimeType[scope.row.timeType].date}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="sendClassHour"
              label="赠送课程"
              width="80"
              align="center"
            >
            <template slot-scope="scope">
                  <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour || 0}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">-</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount + sendTimeType[scope.row.sendTimeUnit].date}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="课程均价"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <!-- <span>{{scope.row.enableClassHour}}</span> -->
                <span v-if="scope.row.enableClassHour !== 0">{{Number((scope.row.price/(scope.row.sendClassHour + scope.row.classHour)).toFixed(2)) || 0}}元/课时</span>
                <span v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">{{scope.row.price}}元/期</span>
                  <span v-if="scope.row.valuationType === 2">{{(scope.row.price / (scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time)).toFixed(2)}} 元/天</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="课程价格"
              width="120"
              align="center"
            >
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
            <el-table-column
              label="优惠"
              width="100"
              align="center"
            >
              <template slot-scope="scope">
                {{scope.row.discountType === 0 ? ((scope.row.discountFolding || 0) + '折') : (scope.row.discountPrice == null ? '' : (scope.row.discountPrice + '元')) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="应付金额"
              width="120"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}} 元</template>
            </el-table-column>
          </el-table>
        </template>
        <!-- 报名学杂 -->
        <template v-if="orderDetail.orderType === 0 && orderDetail.tuitionList && orderDetail.tuitionList.length > 0">
          <el-table
            :data="orderDetail.tuitionList"
            border>
            <el-table-column
              prop="tuitionName"
              label="学杂名称"
            >
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="学杂原价"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.originPrice == null ? '' : (scope.row.originPrice + '元')}}</template>
            </el-table-column>
            <el-table-column
              prop="singlePrice"
              label="购买单价"
              align="center"
            >
              <template slot-scope="scope">{{Number((scope.row.price / scope.row.tuitionNum).toFixed(2)) || 0}}元</template>
            </el-table-column>
            <el-table-column
              prop="tuitionNum"
              label="购买数量"
              align="center"
            >
            </el-table-column>
            <el-table-column
              prop="price"
              label="应付金额"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}}元</template>
            </el-table-column>
          </el-table>
        </template>
        <!-- 退课课程 -->
        <template v-if="orderDetail.orderType === 1 && orderDetail.courseList && orderDetail.courseList.length > 0">
          <el-table
            :data="orderDetail.courseList"
            border>
            <el-table-column
              prop="courseName"
              label="课程名称"
            >
            </el-table-column>
            <el-table-column
              prop="classHourSignalPrice"
              label="退课单价"
              align="center"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.classHourSignalPrice">{{Number((scope.row.price / scope.row.classHour).toFixed(2)) || 0}}元/课时</span>
                <span v-else>{{scope.row.price}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="classHour"
              label="退课课时数"
              align="center"
            >
             <template slot-scope="scope">{{scope.row.classHour}}</template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="退课金额"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}} 元</template>
            </el-table-column>
          </el-table>

        </template>

        <!--转课课程 -->
        <template v-if="orderDetail.orderType === 2 && orderDetail.transferOutCourseList && orderDetail.transferOutCourseList.length > 0">
          <el-table
            :data="orderDetail.transferOutCourseList"
            border>
            <el-table-column
              prop="courseName"
              label="转出课程名称"
            >
            </el-table-column>
            <el-table-column
              prop=""
              label="转出课程单价"
              align="center"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.timeCount">{{Number((scope.row.price / scope.row.timeCount).toFixed(2)) || 0}}元/课时</span>
                <span v-if="scope.row.classHour">{{Number((scope.row.price / scope.row.classHour).toFixed(2)) || 0}}元/课时</span>
                <span v-if="scope.row.valuationType === 1">{{scope.row.originPrice}}元/期</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="timeCount"
              label="转出数"
              align="center"
            >
            <template slot-scope="scope">
              <span v-if="scope.row.timeCount">{{scope.row.timeCount}}天</span>
              <span v-if="scope.row.classHour">{{scope.row.classHour}}课时</span>
              <span v-if="scope.row.valuationType === 1">一期({{scope.row.periodName}})</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="应转金额"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.originPrice}} 元</template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="实转金额"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}} 元</template>
            </el-table-column>
          </el-table>
        </template>
        <!-- 转课：报名课程 -->
        <template v-if="orderDetail.orderType === 2 && orderDetail.transferInCourseList && orderDetail.transferInCourseList.length > 0">
          <el-table
            :data="orderDetail.transferInCourseList"
            border>
            <el-table-column
              prop="courseName"
              label="课程名称"
            >
            </el-table-column>
            <el-table-column
              prop="valuationTypeName"
              label="收费套餐"
              width="110"
              align="center"
            >
            </el-table-column>
            <el-table-column
              prop="validTime"
              label="截止日期"
              width="110"
              align="center"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType !== 1"> {{scope.row.validTime ? scope.row.validTime.slice(0, 10) : '-'}} </span>
                <span v-if="scope.row.valuationType === 1"> {{scope.row.periodEndDate ? scope.row.periodEndDate.slice(0, 10) : '-'}} </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="classHourSignalPrice"
              label="课程单价"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">
                  {{Number((scope.row.price/scope.row.classHour).toFixed(2)) || 0}}元/课时
                </span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">
                    {{scope.row.periodPrice}}元/期
                  </span>
                  <span v-if="scope.row.valuationType === 2">
                    {{scope.row.timeSinglePrice}}元/{{sendTimeType[scope.row.timeType].date}}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="classHour"
              label="购买课程"
              width="80"
              align="center"
            >
            <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.classHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.timeCount + sendTimeType[scope.row.timeType].date}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="sendClassHour"
              label="赠送课程"
              width="80"
              align="center"
            >
            <template slot-scope="scope">
                  <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour || 0}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">-</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount + sendTimeType[scope.row.sendTimeUnit].date}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="课程均价"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <!-- <span>{{scope.row.enableClassHour}}</span> -->
                <span v-if="scope.row.enableClassHour !== 0">{{Number((scope.row.price/(scope.row.sendClassHour + scope.row.classHour)).toFixed(2)) || 0}}元/课时</span>
                <span v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">{{scope.row.price}}元/期</span>
                  <span v-if="scope.row.valuationType === 2">{{(scope.row.price / (scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time)).toFixed(2)}} 元/天</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="originPrice"
              label="课程价格"
              width="120"
              align="center"
            >
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
            <el-table-column
              label="优惠"
              width="100"
              align="center"
            >
              <template slot-scope="scope">
                {{scope.row.discountType === 0 ? ((scope.row.discountFolding || 0) + '折') : (scope.row.discountPrice == null ? '' : (scope.row.discountPrice + '元')) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="应付金额"
              width="120"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}} 元</template>
            </el-table-column>
          </el-table>
        </template>
        <!-- 转课报名学杂 -->
        <template v-if="orderDetail.orderType === 2 && orderDetail.tuitionList && orderDetail.tuitionList.length > 0">
          <el-table
            :data="orderDetail.tuitionList"
            border>
            <el-table-column
              prop="tuitionName"
              label="学杂名称"
            >
            </el-table-column>
            <!-- <el-table-column
              prop="originPrice"
              label="学杂原价"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.originPrice == null ? '' : (scope.row.originPrice + '元')}}</template>
            </el-table-column> -->
            <el-table-column
              prop="singlePrice"
              label="购买单价"
              align="center"
            >
              <template slot-scope="scope">{{Number((scope.row.price / scope.row.tuitionNum).toFixed(2)) || 0}}元</template>
            </el-table-column>
            <el-table-column
              prop="tuitionNum"
              label="购买数量"
              align="center"
            >
            </el-table-column>
            <el-table-column
              prop="price"
              label="应付金额"
              align="center"
            >
              <template slot-scope="scope">{{scope.row.price}}元</template>
            </el-table-column>
          </el-table>
        </template>
      </div>

      <!-- 结算信息 交费记录 -->
      <div class="order-fee">
        <div class="order-pay-info">
          <p class="title">结算信息</p>
          <ul class="pay-info-desc">
            <li>
              <label>{{orderDetail.orderType === 0 ? '应&nbsp;&nbsp;&nbsp;收' : '应&nbsp;&nbsp;&nbsp;退'}}：</label><span>￥{{orderDetail.shouldTotalFee}}</span>
            </li>
            <li>
              <label>{{orderDetail.orderType === 0 ? '实&nbsp;&nbsp;&nbsp;收' : '实&nbsp;&nbsp;&nbsp;退'}}：</label><span>￥{{orderDetail.totalFee}}</span>
            </li>
            <li v-if="orderDetail.totalFee < orderDetail.shouldTotalFee">
              <label>剩余未收：</label><span class="color-danger">￥{{(orderDetail.shouldTotalFee - orderDetail.totalFee).toFixed(2)}}</span>
              <el-button v-if="orderDetail.orderType === 0 && orderDetail.valid === 1" @click="handlePayBack" type="primary" plain class="link" style="margin-left: 16px; padding: 4px 12px;">补交</el-button>
            </li>
            <li>
              <label>支付时间：</label><span>{{orderDetail.payTime}}</span>
            </li>
            <li>
              <label>支付方式：</label><span>{{orderDetail.payTypeStr}}</span>
            </li>
            <li>
              <label>经办人：</label><span>{{orderDetail.recommendUsername}}</span>
            </li>
            <li v-if="orderDetail.cancelUserId">
              <label>作废人：</label><span class="color-danger">{{orderDetail.cancelUsername}}</span>
            </li>
          </ul>
        </div>
        <div style="width: 100%;">
          <p class="title">交费记录</p>
          <template v-if="orderDetail.payRecordEntityList && orderDetail.payRecordEntityList.length > 0">
            <el-table
              :data="orderDetail.payRecordEntityList"
              border>
              <el-table-column
                prop="payTypeStr"
                label="支付方式"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="payFee"
                label="支付金额"
                align="center"
              >
                <template slot-scope="scope">{{scope.row.payFee}}元</template>
              </el-table-column>
              <el-table-column
                prop="operatorUserName"
                label="经办人"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="payTime"
                label="支付时间"
                align="center"
              >
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>

      <div class='followXBond'>
        <div class='follow-con'>
          <img :src="wechatQrCode" class="codeImg" alt="">
          <span style='margin-top: -5px'>{{this.organizationInfo.openWechatDeploy === 1 ? '关注公众号' : '关注校讯帮'}}</span>
        </div>

        <div class='follow-con'>
          <qrcode :value="parentQrCode" tag="img" :options="{ width: 175, margin: 0 }" style="margin-top: 15px"/>
          <span style='margin-top: 10px'>绑定当前学员</span>
        </div>
      </div>
    </div>
    <!-- 打印弹窗 -->
    <print-dialog v-model="showPrint" :orderInfo="orderDetail"></print-dialog>
    <!-- 补交弹窗 -->
    <el-dialog
      v-if="orderDetail"
      :visible.sync="showPayBack"
      :show-close="false"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      width="640px"
      custom-class="order-detail-dialog">
      <p slot="title" class="dialog-title">
        补交学费
        <i class="close-btn el-icon-close" @click="showPayBack = false"/>
      </p>
      <el-form ref="orderpayBackInfoInfo" :model="payBackInfo" :rules="orderRules" label-width="80px" size="small">
        <p class="custom-form-item">
          <label>应收</label>
          <span>{{orderDetail.shouldTotalFee}}元</span>
        </p>
        <p class="custom-form-item">
          <label>现已收</label>
          <span>{{orderDetail.totalFee}}元</span>
        </p>
        <p class="custom-form-item">
          <label>还欠费</label>
          <span class="color-danger">{{orderDetail.shouldTotalFee - orderDetail.totalFee - payBackInfo.price}}元</span>
        </p>
        <el-form-item prop="recommendUserId" label="经办人">
          <el-select v-model="payBackInfo.recommendUserId">
            <el-option v-for="item in teacherList" :key="item.id" :value="item.id" :label="item.username"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="payType" label="支付方式">
          <pay-type v-model="payBackInfo.payType"></pay-type>
        </el-form-item>
        <el-form-item prop="price" label="支付金额">
          <el-input-number v-model="payBackInfo.price" :controls="false" :min="-99999999" :max="99999999" class="right-number" style="width: 140px;"></el-input-number>
          <span style="margin-right: 20px;">元</span>
        </el-form-item>
        <el-form-item prop="payTime" label="支付时间">
          <el-date-picker
            v-model="payBackInfo.payTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择支付时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 0;">
          <el-button @click="showPayBack = false" style="width: 100px;">取消</el-button>
          <el-button type="primary" @click="handleSubmitPayBack" style="width: 100px;">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </el-dialog>
</template>

<script>
import PrintDialog from '../../components/PrintDialog'
import PayType from '../../components/PayType'

import { mapGetters } from 'vuex'
import moment from 'moment'

import QRCode from '../../components/QRCode'

export default {
  props: {
    closeOnModal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sendTimeType: [
        { date: '天', time: 1 },
        { date: '月', time: 30 },
        { date: '季度', time: 90 },
        { date: '半年', time: 180 },
        { date: '年', time: 365 }
      ],
      showOrderDetail: false,
      showPrint: false,
      showPayBack: false,
      loading: false,
      cancelLoading: false,
      payBackLoading: false,
      orderDetail: null,
      payTypeList: [
        { value: 0, label: '微信' },
        { value: 1, label: '支付宝' },
        { value: 2, label: '现金' },
        { value: 3, label: '刷卡' }
      ],
      orderTypeList: [
        { value: 0, label: '报名' },
        { value: 1, label: '退课' },
        { value: 2, label: '转课' }
      ],
      payBackInfo: {
        price: 0, // 补交金额
        payTime: '', // 支付时间
        payType: '', // 支付方式
        recommendUserId: '' // 订单经办人
      },
      orderRules: {
        payTime: { required: true, message: '请选择支付时间', trigger: 'change' },
        payType: { required: true, message: '请选择支付方式', trigger: ['change', 'blur'] },
        recommendUserId: { required: true, message: '请选择经办人', trigger: 'blur' },
        price: { required: true, message: '请填写支付金额', trigger: 'blur' }
      },
      teacherList: [],
      wechatQrCode: ''
      // recodeXBond: false
    }
  },
  created() {
    this._getWechatQrCode()
  },
  components: {
    PrintDialog,
    PayType,
    [QRCode.name]: QRCode
  },
  computed: {
    ...mapGetters([
      'currentBranch',
      'userInfo',
      'organizationInfo'
    ]),
    parentQrCode() {
      if (this.orderDetail && this.orderDetail.studentId) {
        if (this.organizationInfo.openWechatDeploy === 1) {
          // todo 暂时先处理墨蕊阅读为单独的链接
          // if (this.organizationInfo.id === '3aabbf6b42bc4697b7facae1fbd7ec1b') {
          //   return `http://wechat.tlybond.com/parent/#/bindStudent/${
          //     this.orderDetail.studentId
          //   }?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
          // }
          return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${this.orderDetail.studentId}?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
        }
        return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${this.orderDetail.studentId}?_t=${Date.now()}`
      }
      return ''
    }
  },
  methods: {
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.$http.get('/v1/User/getUserList', { departmentId: this.currentBranch.id, userLogo: 1 }).then(res => {
        this.teacherList = res.data
      })
    },
    _getOrderDetail(orderId) {
      this.loading = true
      this.orderDetail = null
      this.$http.get('/v1/order/getOrder/' + orderId).then(res => {
        if (res.data) {
          const item = res.data
          const payTypeObj = this.payTypeList.find(o => o.value === item.payType)
          if (payTypeObj) item.payTypeStr = payTypeObj.label

          const orderTypeObj = this.orderTypeList.find(o => o.value === item.orderType)
          if (orderTypeObj) item.orderTypeStr = orderTypeObj.label

          if (item.orderGoodss) {
            item.courseList = item.orderGoodss.filter(o => o.goodsType === 0)
            item.transferOutCourseList = item.orderGoodss.filter(o => o.goodsType === 0 && o.transferType === 0)
            item.transferInCourseList = item.orderGoodss.filter(o => o.goodsType === 0 && o.transferType === 1)
            item.tuitionList = item.orderGoodss.filter(o => o.goodsType === 1)
            delete item.orderGoodss

            item.courseList.forEach(course => {
              switch (course.valuationType) {
                case 0:
                  course.valuationTypeName = '课时计费'
                  break
                case 1:
                  course.valuationTypeName = '按期计费'
                  break
                case 2:
                  course.valuationTypeName = '按时间计费'
                  break
              }
            })

            // 把金额转成正数
            item.shouldTotalFee = Math.abs(item.shouldTotalFee)
            item.totalFee = Math.abs(item.totalFee)
          }

          if (item.payRecordEntityList) {
            item.payRecordEntityList.forEach(record => {
              const payTypeObj1 = this.payTypeList.find(o => o.value === record.payType)
              if (payTypeObj1) record.payTypeStr = payTypeObj1.label
            })
          }
          this.orderDetail = item
        }
      }).finally(() => {
        this.loading = false
      })
    },
    open(orderId) {
      this.showOrderDetail = true

      this._getOrderDetail(orderId)
    },
    // 验证作废订单会影响的数据
    validateCancelOrder(orderId, outTradeNo) {
      if (this.cancelLoading) return

      this.cancelLoading = true
      this.$http.get('/v1/order/cancelOrderInfluence', {
        orderId: orderId
      }).then(res => {
        const h = this.$createElement
        const children = [
          h('p', null, [
            h('label', { style: { color: '#909399' } }, '订单号：'),
            h('span', {
              style: { color: '#ff7e00', marginRight: '20px' }
            }, outTradeNo)
          ]),
          h('p', null, [
            h('label', { style: { color: '#909399' } }, '温馨提示：'),
            h('span', {
              style: { color: '#F56C6C', marginRight: '20px' }
            }, '作废订单会删除该订单中学员的报读课程、购买的学杂信息，如已分班，学员会退出班级。操作不可逆，是否继续作废订单？')
          ])
        ]
        let index = 1 // 插入的位置
        // 会删除的课程
        if (res.data.influenceCourse && res.data.influenceCourse.length > 0) {
          children.splice(index, 0, h('p', null, [
            h('label', { style: { color: '#909399' } }, '会删除的课程：'),
            h('span', {
              style: { color: '#333', marginRight: '20px' }
            }, res.data.influenceCourse.map(o => o.name).join('、'))
          ]))
          index++
        }
        // 会删除的学杂
        if (res.data.influenceTuitionFee && res.data.influenceTuitionFee.length > 0) {
          children.splice(index, 0, h('p', null, [
            h('label', { style: { color: '#909399' } }, '会删除的学杂：'),
            h('span', {
              style: { color: '#333', marginRight: '20px' }
            }, res.data.influenceTuitionFee.map(o => o.name).join('、'))
          ]))
          index++
        }
        if (res.data.influenceClass && res.data.influenceClass.length > 0) {
          children.splice(index, 0, h('p', null, [
            h('label', { style: { color: '#909399' } }, '会退出的班级：'),
            h('span', {
              style: { color: '#333', marginRight: '20px' }
            }, res.data.influenceClass.map(o => o.name).join('、'))
          ]))
          index++
        }
        this.$msgbox({
          title: '作废订单',
          message: h('div', null, children),
          showCancelButton: true,
          cancelButtonText: '取消',
          closeOnClickModal: false,
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '执行中...'

              this.$http.put('/v1/order/cancelOrder', null, {
                params: {
                  orderId: orderId
                }
              }).then(() => {
                this.$message.success('作废订单成功！')
                this.showOrderDetail = false
                this.$emit('cancelSuccess')
              }).finally(() => {
                instance.confirmButtonLoading = false
                done()
              })
            } else {
              done()
            }
          }
        })
      }).finally(() => {
        this.cancelLoading = false
      })
    },
    // 打印订单
    printOrder() {
      if (Number(sessionStorage.getItem('enableUsePrintDevice'))) {
        this.showPrint = true
      } else {
        this.$message({
          message: '打印设备未授权',
          type: 'warning'
        })
      }
    },
    // 打开补交弹窗
    handlePayBack() {
      this.showPayBack = true

      if (this.payBackInfo.payTime == null || this.payBackInfo.payTime === '') {
        this.payBackInfo.payTime = moment().format('YYYY-MM-DD HH:mm:ss')
      }
      this._getTeacherList()
      if (this.userInfo.userLogo) {
        this.payBackInfo.recommendUserId = this.userInfo.id
      }
      this.payBackInfo.price = this.orderDetail.shouldTotalFee - this.orderDetail.totalFee
    },
    // 提交补交信息
    handleSubmitPayBack() {
      this.$refs.orderpayBackInfoInfo.validate(valid => {
        if (valid) {
          if (this.payBackInfo.price <= 0 || this.payBackInfo.price > (this.orderDetail.shouldTotalFee - this.orderDetail.totalFee)) {
            this.$message.error(`补缴金额必须大于0且小于等于${this.orderDetail.shouldTotalFee - this.orderDetail.totalFee}`)
            return
          }
          this.payBackLoading = true
          this.$http.put('/v1/order/supplementFee', null, {
            params: {
              operatorUserId: this.payBackInfo.recommendUserId,
              orderId: this.orderDetail.id,
              payFee: this.payBackInfo.price,
              payTime: this.payBackInfo.payTime,
              payType: this.payBackInfo.payType
            }
          }).then(() => {
            this.$message.success('补交学费成功！')
            this.showPayBack = false
            this._getOrderDetail(this.orderDetail.id)
          }).finally(() => {
            this.payBackLoading = false
          })
        }
      })
    },
    _getWechatQrCode() {
      if (this.organizationInfo.openWechatDeploy) {
        this.wechatQrCode = this.organizationInfo.wechatQrCode ? this.organizationInfo.wechatQrCode : '../../assets/qrcode.jpeg'
      } else {
        this.wechatQrCode = require('../../assets/qrcode.jpeg')
      }
    }
    // followBtn() {
    // this.showOrderDetail = false
    // this.recodeXBond = true
    // }
  }
}
</script>

<style lang="stylus">
.order-detail-dialog
  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    font-size 14px
    color $color-text-1
    line-height 36px
    height 36px
    position relative
    font-weight bold
    no-wrap()
    .status
      font-size 13px
      color $color-danger
      margin-left 6px
  .el-dialog__body
    padding 20px 16px
    box-sizing border-box
  .close-btn
    position absolute
    right 16px
    top 10px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
  .el-table+.el-table
    margin-top 16px
  .order-btns
    float right
  .title
    height 28px
    line-height 28px
    padding-left 14px
    margin-bottom 6px
    position relative
    font-size 16px
    &:before
      content ''
      display block
      width 3px
      border-radius 3px
      background-color $color-danger
      position absolute
      left 1px
      top 5px
      bottom 5px
  .base-info
    border-bottom 1px solid $color-border-1
    padding-bottom 16px
    margin-bottom 16px
    .form-line+.form-line
      margin-top 12px
      line-height 1.5
    .form-label
      width 72px
      text-align right
      margin-right 12px
      display inline-block
      color $color-text-3
    .form-value
      color $color-text-1
      display inline-block
      min-width 58px
      &+.form-value
        margin-right 12px

  .order-fee
    display flex
    margin-top 20px
    .order-pay-info
      width 250px
      margin-right 16px
      flex-shrink 0

  .pay-info-desc
    border 1px solid $color-border-2
    border-radius 3px
    padding 12px 6px
    li
      line-height 1.6
      &+li
        margin-top 6px
    label
      display inline-block
      width 78px
      text-align right
      color $color-text-3
    span
      color $coloe-text-1

  .custom-form-item
    display inline-block
    min-width 120px
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

.followXBond {
  margin 0px 0px 20px 250px
  display flex
  justify-content center
  button {
    width 200px
    height 40px
    background #FF6600
    border transparent
    border-radius 20px
    color #fff
  }
}

.follow-con {
  display inline-block
  display flex
  justify-content center
  flex-direction column
  align-items center
}

.codeImg {
  width 200px
  height 200px
  margin 0 20px
}
</style>

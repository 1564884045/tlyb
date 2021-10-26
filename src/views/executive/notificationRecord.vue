<template>
  <div>
    <div style="margin-bottom:10px;" v-if="currentTab === '2'">
      <el-alert
        title="使用提示"
        type="warning">
        <template>
          <ul>
            <li>由于微信消息推送政策变更,该功能暂时下架</li>
          </ul>
        </template>
      </el-alert>
    </div>
    <el-tabs v-model="currentTab">
      <el-tab-pane label="微信通知" name="0"></el-tab-pane>
      <el-tab-pane label="短信通知" name="1"></el-tab-pane>
      <el-tab-pane label="自定义通知" name="2"></el-tab-pane>
    </el-tabs>
    <div class="query-form">
      <el-input v-if="currentTab === '0'" v-model.trim="queryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select" style="width: 300px; margin-right: 16px;">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="dateOptions"
        @change="query"
        style="margin-right: 16px; width: 250px;">
      </el-date-picker>
      <span v-if="currentTab !== '2'">
        <inline-select v-if="currentTab === '0'" v-model="queryForm.type" @change="query" label="通知类型" :options="[
        { value: 1, label: '老师通知' },
        { value: 0, label: '家长通知' }
      ]" @show="_getNotifitionList" clearable/>
        <inline-select v-model="queryForm.notificationId" @change="query" label="通知模板" valueAttr="notificationId" labelAttr="notificationName" :loading="notifitionLoading" :options="visiableNotifitionList" @show="_getNotifitionList" filterable clearable/>
      </span>
      <span v-if="currentTab !== '2'" style="margin-right: 12px"><el-checkbox v-model="queryForm.onlyValid" @change="query">只查有效</el-checkbox></span>
      <span v-if="currentTab === '2'">
        <inline-select v-model="queryForm.customizeType" @change="query" label="通知类型" :options="[
          { value: 0, label: '学生通知' },
          { value: 1, label: '老师通知' }
        ]" @show="_getNotifitionList" clearable/>
      </span>
      <el-button :disabled="!(customizeLoading || queryLoading) ? false : true" type="text" @click="reset" size="medium" style="margin: 0 10px;">重&nbsp;置</el-button>

      <div class="right-btns" v-if="currentTab === '1'">
        <span v-if="chargeInfo.left !== ''" style="margin-right: 16px;">当前剩余<span class="color-danger"> {{chargeInfo.left}}条</span></span>
        <el-button type="primary" icon="el-icon-tickets" @click="openMessageForm">短信充值</el-button>
        <!-- FIXME 临时暂时，后面和VIP等充值记录放在一起 -->
        <el-button type="text" @click="openChargeRecordDialog">充值记录</el-button>
      </div>
      <!-- 自定义通知 -->
      <div class="right-btns" v-if="currentTab === '2'">
        <el-button type="primary" @click="openNewTemplate" class="newTemplate" disabled>新建通知</el-button>
      </div>
    </div>
    <!-- 自定义通知table表 -->
    <div class="showTableData" v-if="currentTab === '2'">
      <el-table
        key="2"
        v-loading="customizeLoading"
        :data="selfNotificationList"
        >
        <el-table-column
          prop="notificationTitle"
          label="标题"
          width="148"
          show-overflow-tooltip
          align="center">
        </el-table-column>
        <el-table-column
          prop="notificationContent"
          width="140"
          align="center"
          label="通知内容">
          <template slot-scope="scope">
            <el-button v-if="scope.row.notificationContent" @click="handleViewContent(scope.row)" type="text">预览</el-button>
            <label v-else>-</label>
          </template>
        </el-table-column>
        <el-table-column
          prop="notificationDesc"
          label="描述"
          show-overflow-tooltip
          min-width="120"
          >
          <template slot-scope="scope">
            <span>{{scope.row.notificationDesc || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="notificationRemark"
          label="备注"
          width="160"
          show-overflow-tooltip
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.notificationRemark || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sendStatus"
          label="状态"
          width="140"
          align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.sendStatus">发送成功</el-tag>
            <el-tag type="danger" v-else>未发送</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="发送时间"
          width="148"
          align="center">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenEdit(scope.row)" size="mini">编辑</el-button>
            <el-button v-if="!scope.row.sendStatus" @click="handleOpenSend(scope.row)" type="text" size="mini" disabled>发送</el-button>
            <el-button type="text" size="mini" @click="handleDeleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          v-if="currentTab === '2'"
          @size-change="customizeQuery"
          @current-change="_getNotification"
          :current-page.sync="customizePagination.pageNum"
          :page-size.sync="customizePagination.pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="customizePagination.total">
        </el-pagination>
      </div>
    </div>
    <!-- 新建模板弹框 -->
    <el-dialog
      :title="newTitle ? '新建通知' : '编辑'"
      :visible.sync="newDialogFormVisible"
      custom-class="custom-dialog"
      width="800px"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      @close="cancelNewTemplate"
      >
      <el-form :model="newForm" status-icon ref="newForm" :rules="newFormrules" label-width="80px" class="demo-ruleForm">
        <el-form-item label="接收人" prop="selectContact">
          <el-radio-group v-model="newForm.selectContact" @change='changeRadio' :disabled="formDisabled">
            <el-radio label="老师"></el-radio>
            <el-radio label="学生"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" v-if="!formDisabled" :disabled="formDisabled" :loading="selectLoading" @click="getSelect(true)">选择</el-button>
          <el-button type="primary" v-else :disabled="formDisabled" :loading="selectLoading" @click="getSelect(true)">已选择</el-button>
          <el-button v-if="this.newForm.selectedContact.length > 5 || showSelectDisabled || !formDisabled" plain  @click="showSelectContact" class="selectd" :disabled="showSelectDisabled" type="primary">已选：{{this.newForm.selectedContact.length}}人</el-button>
          <span v-if="this.newForm.selectedContact.length <= 5 && !showSelectDisabled && formDisabled">
            <!-- 联系人人数小于等于5，选择按钮被禁用，表单禁用 -->
            <div v-for="item in selectedName" :key="item.id" class="showSelectedName">
              {{item.studentName}}{{item.username}}
              <img src="@/assets/icon_subscript.png" alt="">
            </div>
          </span>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input
            :disabled="formDisabled"
            type="text"
            maxlength="60"
            v-model="newForm.title"
            placeholder="请输入标题"
            :show-word-limit="true"
            >
          </el-input>
        </el-form-item>
        <div class="tips-info">
          <p>为什么【描述】和【备注】必填？原因是发送通知到微信，用户接收到微信通知时，在【微信首页消息】点击后看到的是微信的模板信息而非【桃李云帮】的页面，此时用户可以看到大概的信息描述，所以必填是为了给用户展示通知的时候能全面一些。</p>
        </div>
        <el-form-item label="描述" prop="desc">
          <el-input
            :disabled="formDisabled"
            v-model="newForm.desc"
            maxlength="60"
            show-word-limit
            placeholder="请输入描述">
          </el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            :disabled="formDisabled"
            type="textarea"
            :clearable="true"
            placeholder="请输入备注"
            :rows="3"
            v-model="newForm.remarks"
            maxlength="60"
            show-word-limit
          >
          </el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <editor-bar
            v-model="newForm.content"
            ref="editors"
            @onSuccess="editorUploadImgSuccess"
            @onChange="editorContentChange">
          </editor-bar>
        </el-form-item>
        <el-form-item class="form-button">
          <el-button @click="cancelNewTemplate">取 消</el-button>
          <span v-if="newTitle">
            <!-- 新建通知 -->
            <el-button type="primary" :disabled="sendButtonLoading" :loading="keepButtonLoading" @click="sendNewNotification('preserve')">保 存</el-button>
            <el-button type="primary" :disabled="keepButtonLoading" :loading="sendButtonLoading" @click="sendNewNotification('send')">保存并发送</el-button>
          </span>
          <span v-else >
            <!-- 详情 -->
            <el-button v-if="newForm.sendStatus" :loading="updateContentLoading" type="primary" @click="updateContent">更新内容</el-button>
            <el-button v-else type="primary" :loading="updateNotificationLoading" @click="updateNotification('newForm')">更 新</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 选择发送对象 -->
    <el-dialog
    :title="newForm.selectContact"
    :visible.sync="selectContactVisible"
    custom-class="custom-dialog"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :before-close="cancelSelectlist"
    width="800px"
    >
      <div style="display:flex;justify-content:center">
        <el-transfer
          style="text-align: left; display: inline-block;"
          class="receiverTransfer"
          v-model="newForm.selectedContact"
          filterable
          :titles="['可选', '已选']"
          :button-texts="['', '']"
          :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}'
          }"
          :data="selectContactList">
          <div v-if="option.phone" slot-scope="{ option }"> {{option.label}} ({{ option.phone }}) </div>
          <div v-else slot-scope="{ option }">{{option.label}}</div>
        </el-transfer>
      </div>
      <div class="transfer-button">
        <!-- <el-button @click="selectContactVisible = false" class="cancelButton" size="small">取 消</el-button> -->
        <el-button @click="getSelectedList" type="primary" size="small">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 显示联系名字弹框 -->
    <el-dialog
      :title="'已选'+newForm.selectContact"
      :visible.sync="showSelectContactVisible"
      custom-class="custom-dialog"
      width="800px">
      <div v-for="item in selectedName" :key="item.id" class="showSelectedName selectedName">
        {{item.studentName}}{{item.username}}
        <img src="@/assets/icon_subscript.png" alt="">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSelectContactVisible = false">取 消</el-button>
        <el-button type="primary" @click="showSelectContactVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看图文 -->
    <el-dialog
      title="预览效果"
      custom-class="custom-dialog"
      :visible.sync="viewContentDialogVisible"
      :center="true"
      width="350px">
      <div class="content-wrapper">
        <div class="body">
          <img class="header" :src="require('@/assets/bg-phone-header.jpg')"/>
          <div class="title">
            <h1 v-html="preview.rowTitle"></h1>
          </div>
          <div class="wrapper-content" v-html="preview.rowContent"></div>
          <div class="remarks">
            <div class="remarks-item">
              <span v-html="preview.rowCreateAt"></span>
              <span class="userName">{{this.$store.getters.userInfo.username}}</span>
            </div>
            <div class="remarks-item">
              <span>[备 注]:</span><span v-html="preview.rowremarks"></span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <div class="showTableData" v-if="currentTab !== '2'">
      <el-table
        key="0"
        v-if="currentTab === '0'"
        :data="recordList"
        v-loading="queryLoading">
        <el-table-column
          prop="targetName"
          label="接收人"
          width="120">
          <span slot-scope="scope">{{scope.row.targetName ? scope.row.targetName : scope.row.targetWechatName ? scope.row.targetWechatName: '-'}}</span>
        </el-table-column>
        <el-table-column
          prop="targetPhone"
          label="手机号"
          width="120">
          <span slot-scope="scope">{{scope.row.targetPhone ? scope.row.targetPhone : scope.row.targetWechatPhone ? scope.row.targetWechatPhone: '-'}}</span>
        </el-table-column>
        <el-table-column
          prop="notificationName"
          label="通知模板"
          width="188">
        </el-table-column>
        <el-table-column
          prop="content"
          label="通知内容">
        </el-table-column>
        <el-table-column
          prop="responseMessage"
          label="通知反馈">
          <span slot-scope="scope" :class="scope.row.sendStatus === 0 ? '' : 'color-danger'">{{scope.row.responseMessage}}</span>
        </el-table-column>
        <el-table-column
          prop="sendStatus"
          label="状态"
          width="108"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.sendStatus === 0 ? 'success' : 'error'">{{scope.row.sendStatus === 0 ? '发送成功' : '发送失败'}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="发送时间"
          width="148"
          align="center">
        </el-table-column>
      </el-table>

      <el-table
        key="1"
        v-if="currentTab === '1'"
        :data="recordList"
        v-loading="queryLoading">
        <el-table-column
          prop="phone"
          label="手机号"
          width="120">
        </el-table-column>
        <el-table-column
          prop="notificationName"
          label="通知模板"
          width="180">
          <template slot-scope="scope">{{scope.row.notificationName || scope.row.notificationId}}</template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="短信内容">
        </el-table-column>
        <el-table-column
          prop="sendStatus"
          label="发送状态"
          width="120"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.sendStatus === 0 ? 'success' : 'info'">{{scope.row.sendStatus === 0 ? '发送成功' : '发送失败'}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="发送时间"
          width="148"
          align="center">
        </el-table-column>
        <el-table-column
          prop="residueNum"
          label="当前剩余"
          width="144"
          align="center">
          <span slot-scope="scope" class="color-danger">{{scope.row.residueNum}}</span>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          v-if="currentTab !== '2'"
          @size-change="query"
          @current-change="_getRecordList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <el-dialog
      :visible.sync="showMessageForm"
      title="短信充值"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      width="420px">
      <el-form ref="chargeInfo" :model="chargeInfo" label-width="108px">
        <el-form-item prop="unitPrice" label="单价">
          <p class="color-warning">{{chargeInfo.unitPrice}}元/条</p>
        </el-form-item>
        <el-form-item prop="rechargeNum" label="充值条数" :rules="[
          { required: true, message: '请填写充值条数', trigger: 'blur'},
          { type: 'number', min: 100, message: '100条起充', trigger: 'blur'},
          { type: 'number',max: 1000000, message: '最多充值100万条', trigger: 'blur'},
        ]">
          <el-input v-model.number="chargeInfo.rechargeNum" placeholder="100条起充" style="width: 140px"></el-input> 条
          <span class="form-tip" v-if="chargeInfo.rechargeNum">{{(chargeInfo.unitPrice * chargeInfo.rechargeNum).toFixed(2)}}元</span>
        </el-form-item>
        <el-form-item>
          <el-button @click="showMessageForm = false">取消</el-button>
          <el-button type="primary" :loading="orderLoading" @click="toOrder">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      :visible.sync="showConfirmCharge"
      custom-class="custom-dialog"
      title="短信充值确认"
      :close-on-click-modal="false"
      width="420px"
      destroy-on-close>
      <ul class="confirm-info">
        <li>
          <label>机构名称：</label><span>{{organizationInfo.name}}</span>
        </li>
        <li>
          <label>单价：</label><span>{{chargeInfo.unitPrice}}元/条</span>
        </li>
        <li>
          <label>充值条数：</label><span>{{chargeInfo.rechargeNum}}条</span>
        </li>
        <li>
          <label>总计金额：</label><span class="color-danger">{{(chargeInfo.unitPrice * chargeInfo.rechargeNum).toFixed(2)}}元</span>
        </li>
      </ul>
      <div style="text-align: center; margin-top: 32px;">
        <el-button type="primary" @click="toPay">确认充值</el-button>
      </div>
    </el-dialog>

    <wx-pay-dialog
      v-model="showPayCode"
      :outTradeNo="wxPayObj.outTradeNo"
      :codeUrl="wxPayObj.codeUrl"
      @refresh="toPay()"
      @paySuccess="paySuccess()">
      <p style="margin-bottom: 12px">
        需支付<span class="color-danger" style="font-weight: bold;">{{(chargeInfo.unitPrice * chargeInfo.rechargeNum).toFixed(2)}}元</span>
      </p>
    </wx-pay-dialog>

    <el-dialog
      :visible.sync="showChargeRecord"
      title="短信充值记录"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      destroy-on-close>
      <el-table
        :data="chargeRecord"
        v-loading="chargeRecordLoading">
        <el-table-column
          prop="phone"
          label="手机号">
        </el-table-column>
        <el-table-column
          prop="goodsCount"
          label="充值条数"
          width="140"
          align="center">
        </el-table-column>
        <el-table-column
          prop="totalFee"
          label="充值金额"
          width="140"
          align="center">
          <template slot-scope="scope">{{(scope.row.totalFee / 100).toFixed(2)}}元</template>
        </el-table-column>
        <el-table-column
          prop="payStatus"
          label="充值状态"
          width="140"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.payStatusClass">{{scope.row.payStatusStr}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="充值时间"
          width="148"
          align="center">
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="openChargeRecordDialog"
          @current-change="_getChargeRecord"
          :current-page.sync="chargePagination.pageNum"
          :page-size.sync="chargePagination.pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="chargePagination.total">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import WxPayDialog from '@/components/WxPayDialog'
import EditorBar from '../../components/WangEditor'

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      currentTab: '0',
      queryLoading: false,
      notifitionLoading: false,
      orderLoading: false,
      payLoading: false,
      chargeRecordLoading: false,
      showMessageForm: false, // 显示充值表单
      showConfirmCharge: false, // 显示确认充值
      showPayCode: false, // 显示支付二维码
      showChargeRecord: false, // 显示充值记录
      newDialogFormVisible: false, // 新建通知
      sendButtonLoading: false, // 保存并发送
      keepButtonLoading: false, // 保存
      selectContactVisible: false, // 选择联系人弹框
      selectLoading: false, // 选择按钮
      viewContentDialogVisible: false, // 文图
      showSelectContactVisible: false, // 显示联系名字弹框
      showSelectDisabled: false, // 已选按钮是否禁用
      formDisabled: false, // form表单是否可以编辑
      updateNotificationLoading: false, // 更新
      updateContentLoading: false, // 更新内容
      newTitle: true,
      customizeLoading: false,
      searchTypeList: [
        {
          value: 'teacherName',
          label: '老师姓名',
          placeholder: '请输入老师姓名搜索'
        },
        {
          value: 'teacherPhone',
          label: '老师电话',
          placeholder: '请输入老师的手机号码'
        },
        {
          value: 'parentPhone',
          label: '家长电话',
          placeholder: '请输入家长的手机号码'
        }
      ],
      queryForm: {
        searchType: 'teacherName',
        searchInput: '',
        dateRange: [],
        type: '',
        customizeType: '',
        notificationId: '',
        onlyValid: true
      },
      // 自定义通知分页参数
      customizePagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      recordList: [],
      selfNotificationList: [],
      notifitionList: [],
      dateOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      chargeInfo: {
        left: '', // 剩余条数
        unitPrice: 0.08, // 单价0.08元/条
        type: 0, // 充值方式
        rechargeNum: '' // 充值条数
      }, // 充值信息
      chargePagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      chargeRecord: [], // 充值记录
      wxPayObj: {
        outTradeNo: '',
        codeUrl: ''
      },
      // 发送对象
      selectContactList: [], // 穿梭框数据源
      renderFunc(h, option) {
        return <span>{ option.key } {option.label} - { option.phone }</span>
      },
      newForm: {
        selectContact: '老师', // 接收人类
        content: null, // 内容
        title: null, // 标题
        desc: null, // 描述
        remarks: null, // 备注
        receiverType: 0, // 发送对象 0学生 1老师
        selectedContact: [], // 穿梭框选中具体发送对象
        sendStatus: 0 // 0：保存 1：保存并发送
      },
      selectedName: [], // 已经选择对象的名字(点击详情)
      newFormrules: {
        title: [{ required: true, message: '请输入60字符以内的标题名称', minlength: 3, trigger: 'blur' }],
        selectContact: [{ required: true, message: '请选中具体发送对象', trigger: 'blur' }],
        desc: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        remarks: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
      },
      // 通知效果预览
      preview: {
        rowTitle: null,
        rowContent: null,
        rowCreateAt: null,
        rowremarks: null,
        notificationID: 0
      }
    }
  },
  components: {
    InlineSelect, WxPayDialog, EditorBar
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    visiableNotifitionList() {
      let list = this.notifitionList.concat([])
      if (this.queryForm.type != null && this.queryForm.type !== '') {
        list = list.filter(o => this.queryForm.type === o.notificationType)
      }
      if (this.currentTab === '1') {
        // 只查短信通知的
        return list.filter(o => {
          return o.hasSmsNotification === 1 && o.smsNotificationStatus === 1
        })
      } else {
        // 只查微信通知的
        return list.filter(o => {
          return o.hasAppNotification === 1 && o.appNotificationStatus === 1
        })
      }
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  created() {
    this.query()
  },
  methods: {
    // 获取通知记录
    _getRecordList() {
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        notificationId: this.queryForm.notificationId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      params.type = this.queryForm.type
      this.queryLoading = true
      let url = '/v1/OrganizationWechatNoticeRecord/getOrganizationWechatNoticeRecordList'
      if (this.currentTab === '1') {
        url = '/v1/OrganizationSmsRecord/getOrganizationSmsRecordList'
      }
      if (this.queryForm.onlyValid) {
        params.sendStatus = 0
      }
      this.$http.get(url, params).then(res => {
        if (this.currentTab === '0') {
          res.data.forEach(item => {
            try {
              const obj = JSON.parse(item.content)
              if (obj && obj.data && obj.data.first) {
                item.content = obj.data.first.value
              }
            } catch (error) {
            }
          })
        }
        this.recordList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    customizeQuery() {
      this.customizePagination.pageNum = 1
      this._getNotification()
    },
    // 获取自定义通知
    _getNotification() {
      this.customizeLoading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        notificationId: this.queryForm.notificationId,
        pageNum: this.customizePagination.pageNum,
        pageSize: this.customizePagination.pageSize
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        // 自定义通知中的事件参数
        params.startDate = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endDate = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      params.receiverType = this.queryForm.customizeType
      this.$http.get('/v1/customNotification/getNotification', params).then(res => {
        this.selfNotificationList = res.data
        this.customizePagination.total = res.total
      }).finally(() => {
        this.customizeLoading = false
      })
    },
    // 获取通知类型
    _getNotifitionList() {
      if (this.notifitionList.length > 0) return

      this.notifitionLoading = true
      this.$http.get('/v1/OrganizationNotification/getOrganizationNotificationList', {
        orgId: this.organizationInfo.id
      }).then(res => {
        this.notifitionList = res.data
      }).finally(() => {
        this.notifitionLoading = false
      })
    },
    // 获取剩余短信信息
    _getMessageInfo() {
      this.$http.get('/v1/OrganizationSmsRecord/getOrganizationResidueNum', {
        orgId: this.organizationInfo.id
      }).then(res => {
        if (res.data && res.data.length >= 2) {
          this.$set(this.chargeInfo, 'left', res.data[0])
          this.$set(this.chargeInfo, 'unitPrice', res.data[1] / 100)
        }
      })
    },
    // 获取短信充值记录
    _getChargeRecord() {
      this.chargeRecordLoading = true
      this.$http.get('/v1/Recharge/getRecord', {
        orgId: this.organizationInfo.id,
        pageNum: this.chargePagination.pageNum,
        pageSize: this.chargePagination.pageSize
      }).then(res => {
        res.data.forEach(item => {
          switch (item.payStatus) {
            case 0:
              item.payStatusClass = 'info'
              item.payStatusStr = '待支付'
              break
            case 1:
              item.payStatusClass = 'success'
              item.payStatusStr = '已支付'
              break
            case 2:
              item.payStatusClass = 'warning'
              item.payStatusStr = '已取消'
              break
            case 3:
              item.payStatusClass = 'success'
              item.payStatusStr = '已完成'
              break
            default:
              item.payStatusClass = 'danger'
              item.payStatusStr = '未知状态'
          }
        })
        this.chargeRecord = res.data
        this.chargePagination.total = res.total
      }).finally(() => {
        this.chargeRecordLoading = false
      })
    },
    query() {
      if (this.currentTab !== '2') {
        this.pageNum = 1
        this._getRecordList()
      } else if (this.currentTab === '2') {
        this.customizePagination.pageNum = 1
        this._getNotification()
      }
    },
    reset() {
      this.queryForm = {
        searchType: 'teacherName',
        searchInput: '',
        dateRange: [],
        type: '',
        customizeType: '',
        notificationId: '',
        onlyValid: true
      }
      this.query()
    },
    async openMessageForm() {
      // 获取机构短信信息

      // 获取最近几条充值记录

      this.rechargeNum = ''
      this.showMessageForm = true
    },
    toOrder() {
      // 生成订单
      this.$refs.chargeInfo.validate(valid => {
        if (valid) {
          this.orderLoading = true
          this.$http.post('/v1/Recharge/smsRecharge', null, {
            params: {
              number: this.chargeInfo.rechargeNum,
              orgId: this.organizationInfo.id
            }
          }).then((res) => {
            this.$set(this.wxPayObj, 'outTradeNo', res.data)
            this.showConfirmCharge = true
          }).finally(() => {
            this.orderLoading = false
          })
        }
      })
    },
    toPay() {
      this.$http.get('/v1/pay/wxSmsRecharge', {
        outTradeNo: this.wxPayObj.outTradeNo
      }).then(res => {
        this.$set(this.wxPayObj, 'codeUrl', res.data)
        this.showPayCode = true
      })
    },
    paySuccess() {
      this.showPayCode = false
      this.showConfirmCharge = false
      this.showMessageForm = false
      this.pageNum = 1
      this._getRecordList()
      this._getMessageInfo()
    },
    openChargeRecordDialog() {
      this.showChargeRecord = true
      this.chargePagination.pageNum = 1
      this._getChargeRecord()
    },
    // 自定义通知中的table
    // table中的编辑
    handleOpenEdit(row, value) {
      this.newTitle = false
      this.showSelectDisabled = row.sendStatus === 0 // 已选按钮
      this.notificationID = row.id
      this.formDisabled = row.sendStatus === 1 // 表单是否禁用
      this.$http.get('/v1/customNotification/getNotification/' + row.id).then(res => {
        this.selectedName = res.data.customNotificationSenderEntityList // 保存列表详情已经选择对象的名字
        let alreadySelectedContact = res.data.customNotificationSenderEntityList.map((item) => {
          return item.receiverId
        })
        this.newForm = { // 初始化数据
          title: res.data.notificationTitle, // 标题
          content: res.data.notificationContent, // 内容
          selectContact: res.data.receiverType ? '老师' : '学生', // 接收人类
          desc: res.data.notificationDesc, // 描述
          remarks: res.data.notificationRemark, // 备注
          selectedContact: alreadySelectedContact, // tabel表中选中具体发送对象
          sendStatus: res.data.sendStatus // 发送状态
        }
        this.getSelect(false)
      }).finally(() => {
        this.newDialogFormVisible = true
      })
    },
    // 更新内容：已经发送的通知
    updateContent() {
      if (this.newForm.content.length !== 0 && this.newForm.content !== '<p><br></p>') {
        this.updateContentLoading = true
        this.$http.put(`/v1/customNotification/updateContent?id=${this.notificationID}`, this.newForm.content).then(() => {
          this._getNotification()
          this.$message({ message: '内容更新成功', type: 'success' })
          this.newDialogFormVisible = false
          this.$refs.editors.clearTxt()
        }).finally(() => {
          this.updateContentLoading = false
        })
      } else {
        this.$message({ message: '请输入内容', type: 'warning' })
      }
    },
    // 更新：未发送的通知
    updateNotification() {
      this.sendNewNotification('') // 传入空字符串调用更新接口
    },
    // 自定义table表中的发送
    handleOpenSend(row) {
      this.$confirm('此操作将会发送通知, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$http.put('/v1/customNotification/sendNotification/' + row.id).then((res) => {
          this.$message({ message: '发送成功', type: 'success' })
          this._getNotification()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消发送'
        })
      })
    },
    // 自定义table表中删除
    handleDeleteRow(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/customNotification/deleteNotification', { ids: row.id }).then((res) => {
          this.$message({ message: '删除数据成功', type: 'success' })
          this._getNotification()
        })
      })
    },
    // 新建模板：打开新建通知弹框
    openNewTemplate() {
      this.newDialogFormVisible = true
      this.showSelectDisabled = true // 已选按钮禁用
      this.newTitle = true
      this.formDisabled = false // 表单禁止
      this.resetForm()
    },
    // 选择按钮: 打开联系人信息弹框
    getSelect(isShow) {
      let url = null
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      if (this.newForm.selectContact === '老师') {
        this.newForm.receiverType = 1
        params.userLogo = 1
        url = '/v1/User/getByUserLogo'
      } else {
        this.newForm.receiverType = 0
        url = '/v1/Student/getAllByOrganizationIdAndDepartmentId'
      }
      this.selectLoading = true // 选择按钮
      this.$http.get(url, params).then(res => {
        // 获取联系人信息作为穿梭框的数据源
        this.selectContactList = res.data.map((item) => {
          if (this.newForm.selectContact === '学生') { // 判断是否是学生
            return { key: item.id, label: item.name, phone: item.primaryContactPhone }
          } else {
            return { key: item.id, label: item.username, phone: item.phone }
          }
        })
      }).finally(() => {
        // 获取发送人数据时,按钮等待消失,出现弹框显示数据
        this.selectContactVisible = isShow
        this.selectLoading = false
      })
    },
    // 已选按钮
    showSelectContact () {
      // 点击编辑以后才能出现弹框显示已经选择的联系人
      this.showSelectContactVisible = this.selectedName.length >= 1
    },
    // 切换老师类或者学生类：清空已经选中的对象
    changeRadio () {
      this.newForm.selectedContact = []
    },
    // 穿梭框中的取消按钮：清空已经选择的对象
    cancelSelectlist () {
      this.newForm.selectedContact = []
      this.selectContactVisible = false
    },
    // 穿梭框中的确定按钮：获取已经选择的对象
    getSelectedList () {
      this.selectContactVisible = false
    },
    // 富文本编辑器上传成功事件
    editorUploadImgSuccess(xhr, editor, result) {
      this.$message({
        type: 'success',
        message: '上传成功'
      })
    },
    // 富文本数据
    editorContentChange(data) {
      this.newForm.content = data
    },
    // 取消按钮
    cancelNewTemplate() {
      this.newDialogFormVisible = false
      this.$refs['newForm'].resetFields()
      this.resetForm()
      this.$refs.editors.clearTxt()
    },
    // 新建通知的保存或保存并发送按钮
    sendNewNotification(value) {
      this.$refs['newForm'].validate((valid) => {
        if (valid) {
          // 判断是否选择联系人
          if (this.newForm.selectedContact.length === 0 || this.newForm.content === '<p><br></p>' || this.newForm.content.length === 0) {
            this.$message({ message: '请选中发送联系人或添加通知内容', type: 'warning' })
          } else {
            this.newForm.selectedContact = this.newForm.selectedContact.map((item) => {
              return {
                receiverId: item
              }
            })
            const params = {
              departmentId: this.currentBranch.id, // 校区id
              organizationId: this.organizationInfo.id, // 机构id
              notificationContent: this.newForm.content, // 通知内容
              notificationDesc: this.newForm.desc, // 描述
              notificationRemark: this.newForm.remarks, // 备注
              notificationTitle: this.newForm.title, // 通知标题
              customNotificationSenderEntityList: this.newForm.selectedContact // 接收人的id
            }
            // 保存或保存并发送
            if (value === 'preserve' || value === 'send') {
              if (value === 'preserve') {
                this.newForm.sendStatus = 0
                this.keepButtonLoading = true
              }
              if (value === 'send') {
                this.newForm.sendStatus = 1
                this.sendButtonLoading = true
              }
              params.sendStatus = this.newForm.sendStatus // 发送状态 0否 1是
              params.receiverType = this.newForm.receiverType // 接收人类型 0学生 1老师
              this.$http.post('/v1/customNotification/addCustomNotification', params).then(res => {
                if (params.sendStatus) {
                  this.$message({ message: '成功发送通知', type: 'success' })
                } else {
                  this.$message({ message: '成功添加通知', type: 'success' })
                }
                this._getNotification()
                this.resetForm() // 重置表单
              }).finally(() => {
                this.newDialogFormVisible = false
                this.sendButtonLoading = false
                this.keepButtonLoading = false
              })
            } else {
              // 更新：未发送通知
              this.updateNotificationLoading = true
              params.sendStatus = this.newForm.sendStatus // 发送状态 0否 1是
              params.id = this.notificationID // 通知id
              params.receiverType = this.newForm.receiverType === '老师' ? 1 : 0 // 接收人类型 0学生 1老师
              this.$http.put('/v1/customNotification/updateCustomNotification', params).then(() => {
                this.$message({ message: '更新成功', type: 'success' })
                this._getNotification()
              }).finally(() => {
                this.newDialogFormVisible = false
                this.updateNotificationLoading = false
              })
            }
            this.$refs.editors.clearTxt()
          }
        }
      })
    },
    // 重置表单
    resetForm() {
      this.newForm = {
        selectContact: '老师', // 接收人类
        content: null, // 内容
        title: null, // 标题
        desc: null, // 描述
        remarks: null, // 备注
        receiverType: 0, // 发送对象
        selectedContact: [], // 穿梭框选中具体发送对象
        sendStatus: 0, // 0：保存 1：保存并发送
        selectedName: []
      }
    },
    // 文图
    handleViewContent(row) {
      this.preview.rowTitle = row.notificationTitle
      this.preview.rowContent = row.notificationContent.replace(/<img/gi, '<img style="width:100%;height:auto"')
      this.preview.rowCreateAt = row.createAt.split(' ')[0]
      this.preview.rowremarks = row.notificationRemark
      this.viewContentDialogVisible = true
    }
  },
  watch: {
    currentTab(val) {
      if (this.currentTab === '1') {
        this._getMessageInfo()
      }
      this.reset()
      // if (this.currentTab === '2') {
      //   this._getNotification()
      // }
    }
  }
}
</script>

<style lang="stylus" scoped>
// 覆盖原ui组件中的样式
>>>.el-transfer-panel
  width 250px
.receiverTransfer
  >>>.el-transfer__buttons
    .el-button
      height 32px
      width 33px
      display flex
      justify-content center
      align-items center
      border-radius 32px
// 穿梭框内的内容
>>>.el-checkbox
  display block
.showSelectedName
  max-width 80px
  display inline-block
  border 1px solid #eeeeee
  padding 1px 30px
  margin 8px
  color #FF6600
  position relative
  border-radius 6px
  border 1px solid red
  img
    position: absolute;
    color: #FFF
    top 0px
    right 0px
    width 28px
    height 28px
.selectedName
  padding 10px 30px
.transfer-button
  box-sizing content-box
  display flex
  justify-content flex-end
  align-items center
  margin 20px 20px 0 0
  .cancelButton
    margin 0 10px 0 0
.newTemplate
  margin 0 20px 0 0
.form-button
  display flex
  justify-content flex-end
  .el-button
    margin 0 0 0 10px
.selectd
  margin 0 0 0 10px
// 文图
.content-wrapper
  height 670px
  overflow hidden
  background-image url(../../assets/iphoneBorder.png)
  background-size 100% 100%
  background-repeat no-repeat
  .body
    height 590px
    margin-top 38px
    margin-left 6px
    margin-right 6px
    margin-bottom 108px
    border-radius 7px
    overflow-y auto
    .header
      width 100%
      height 50px
      border-top-left-radius 7px
      border-top-right-radius 7px
    .title
      text-align center
    .remarks
      border 1px dashed #ccc
      padding 10px 0
      margin 10px
      .remarks-item
        width 220px
        text-align center
        margin 0 auto
        .userName
          margin 0 0 0 10px
    .wrapper-content
      background-color #ffffff
      padding 5px
      border-bottom-left-radius 7px
      border-bottom-right-radius 7px
      img
        width 100%
.form-tip
  color $color-text-3
  font-size 13px
  line-height 1
  margin-left 12px

.confirm-info
  li
    margin-bottom 16px
  label
    display inline-block
    min-width 120px
    text-align right
    color $color-text-3
    margin-right 6px
  span
    color $color-text-1
.tips-info
  border 1px dashed #ff6600
  border-radius 5px
  padding 7px
  margin-left 80px
  margin-bottom 15px
  color #ff6600
.showTableData
  background #fff
  padding 14px
</style>

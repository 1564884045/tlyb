<template>
  <div>
    <el-tabs v-model="currentTab">
      <el-tab-pane label="已签到学员" name="0"></el-tab-pane>
      <el-tab-pane label="未签到学员" name="1"></el-tab-pane>
    </el-tabs>
    <div v-show="currentTab === '0'">
      <div class="query-form">
        <el-input v-model.trim="queryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select" style="width: 320px; margin-right: 16px;">
          <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
            <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
        </el-input>
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="打卡开始日期"
          end-placeholder="打卡结束日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="query">
        </el-date-picker>
        <!-- <el-button type="primary" plain @click="handleQuickSign()" icon="el-icon-bank-card" style="margin-left:20px;">学员刷卡快速签到</el-button> -->
        <div class="query-select-list">
          <inline-select v-model="queryForm.classId" @change="query" label="所在班级" valueAttr="id" labelAttr="name" :loading="classLoading" :options="classList" @show="_getClassList" filterable clearable/>
          <inline-select v-model="queryForm.type" @change="query" label="打卡类型" :options="typeList" filterable clearable/>
          <inline-select v-model="queryForm.deviceType" @change="query" label="考勤来源" :options="deviceTypeList" filterable clearable/>
          <el-button :disabled="!queryLoading ? false : true" type="text" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
          <div class="right-btns">
            <el-button type="primary" @click="openAddisible" class="AddAttendance" icon="el-icon-plus">新增考勤</el-button>
          </div>
        </div>
      </div>
      <div class="showTableData">
        <el-table
          :data="recordList"
          stripe
          v-loading="queryLoading">
          <el-table-column
            prop="studentName"
            label="学员姓名">
            <p class="username" slot-scope="scope" >
              <span>{{scope.row.studentName}}</span>
              <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
            </p>
          </el-table-column>
          <el-table-column
            prop="primaryContactPhone"
            label="联系方式">
          </el-table-column>
          <el-table-column
            prop="createAt"
            label="打卡时间">
          </el-table-column>
          <el-table-column
            prop="deviceType"
            label="考勤来源"
            align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.deviceType == 0" type="success">人脸识别</el-tag>
              <el-tag v-if="scope.row.deviceType == 1" type="warning">刷卡设备</el-tag>
              <el-tag v-if="scope.row.deviceType == 2" type="warning">手动录入</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="typeStr"
            label="打卡类型"
            width="160"
            align="center">
            <el-tag slot-scope="scope" :type="scope.row.typeClass">{{scope.row.typeStr}}</el-tag>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="160">
            <template slot-scope="scope">
              <el-tooltip content="仅人脸识别打卡可查看照片" placement="bottom" effect="light">
                <el-button type="text" @click="handleOpenPhoto(scope.row)">查看照片</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加考勤弹框 -->
        <el-dialog
          title="新增考勤"
          custom-class="custom-dialog"
          :visible.sync="AddAttendanceVisible"
          width="700px"
          :close-on-press-escape="false"
          :close-on-click-modal="false"
          @close="closeAddvisible"
        >
          <el-form :model="attendanceForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="选择班级" prop="classNameID">
              <el-select
              v-model="attendanceForm.classNameID"
              :multiple = "false"
              placeholder="请选择学生所在班级"
              >
                <el-option
                    v-for="item in DropDownclassList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
              </el-select>
            </el-form-item>
            <div class="transfer">
              <el-transfer
                style="text-align: left; display: inline-block"
                v-model="attendanceForm.selectedStudent"
                class="receiverTransfer"
                filterable
                :titles="['可选', '已选']"
                :format="{
                  noChecked: '${total}',
                  hasChecked: '${checked}/${total}'
                }"
                :data="allStudent">
                <span slot-scope="{ option }">{{ option.label }}({{ option.phone }})</span>
              </el-transfer>
            </div>
            <el-form-item label="打卡类型" prop="type">
              <el-select v-model="attendanceForm.type" placeholder="请选择打卡类型">
                <el-option label="到校打卡" value="0"></el-option>
                <el-option label="普通打卡" value="1"></el-option>
                <el-option label="离校打卡" value="2"></el-option>
                <el-option label="刷卡课消" value="3"></el-option>
                <el-option label="刷脸课消" value="4"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="打卡日期" prop="createAt">
              <el-date-picker
                v-model="attendanceForm.createAt"
                type="datetime"
                placeholder="选择日期时间"
                :picker-options="createAtPickerOptions"
                :default-value="new Date()"
                value-format="yyyy-MM-dd HH:mm:ss"
                >
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <div class="item-buttons">
                <el-button @click="closeAddvisible">取 消</el-button>
                <el-button type="primary" @click="submitForm" :loading="submitFormLoading" :disabled="submitFormDisabled">提 交</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-dialog>

        <div class="bottom-pagination">
          <el-pagination
            @size-change="query"
            @current-change="_getStudentSign"
            :current-page.sync="pageNum"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>

      <!-- 图片预览 -->
      <photo-preview ref="photoPreview" :list="imgs"></photo-preview>

      <el-dialog
        title="学员卡快速签到"
        :visible.sync="signDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        custom-class="custom-dialog"
        center
        @close="_getStudentSign()"
        width="400px">
        <div class="sign-container">
          <img class="logo" :src="signCardLogo"/>
          <el-input ref="bindICCardFormInput" v-model="icCardNo" maxlength="20" @keyup.native.enter="handleSignAction()" clearable placeholder="请刷卡读取卡号"></el-input>
          <h4>使用说明:</h4>
          <ul>
            <li>1. 先将卡贴合到刷卡机刷卡处；</li>
            <li>2. 系统读取到卡号会自动进行打卡操作；</li>
            <li>3. 切勿人为随意输入无效的卡号；</li>
            <li>4. 当卡失效且需人为输入卡号时，需在输入完毕按回车键才能打卡；</li>
          </ul>
        </div>
      </el-dialog>
    </div>
    <!-- 未签到学员 -->
    <div v-show="currentTab === '1'">
      <div class="query-form">
        <el-input v-model.trim="noRecordQueryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder" @keyup.native.enter="noRecordQuery" class="input-with-select" style="width: 220px; margin-right: 16px;">
          <!-- <el-select v-model="noRecordQueryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
            <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
          <el-button slot="append" icon="el-icon-search" @click="noRecordQuery"></el-button>
        </el-input>
        <el-date-picker
          v-model="noRecordQueryForm.dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="打卡开始日期"
          end-placeholder="打卡结束日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="noRecordPickerOptions"
          @change="noRecordQuery">
        </el-date-picker>
        <inline-select style="margin-left:20px" v-model="noRecordQueryForm.classId" @change="noRecordQuery" label="所在班级" valueAttr="id" labelAttr="name" :loading="classLoading" :options="classList" @show="_getClassList" filterable clearable/>
        <el-button type="text" :disabled="!noRecordQueryLoading ? false : true" @click="noRecordReset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
      </div>
      <div class="showTableData">
        <el-table
          :data="noRecordList"
          stripe
          v-loading="noRecordQueryLoading">
          <el-table-column
            prop="studentName"
            label="学员姓名">
            <p class="username" slot-scope="scope" >
              <span>{{scope.row.studentName}}</span>
              <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
            </p>
          </el-table-column>
          <el-table-column
            prop="primaryContactPhone"
            label="主要联系人号码">
            <template slot-scope="scope">
              <span v-if="scope.row.primaryContactPhone">{{scope.row.primaryContactPhone}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="punchDate"
            label="应签到日期">
          </el-table-column>
        </el-table>
        <div class="bottom-pagination">
          <el-pagination
            @size-change="noRecordQuery"
            @current-change="_getUnPunchStuddentInfo"
            :current-page.sync="noRecordPageNum"
            :page-size.sync="noRecordPageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="noRecordTotal"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import InlineSelect from '../../components/InlineSelect'
import PhotoPreview from '../../components/PhotoPreview'
import SignCardLogo from '../../assets/sign-card-logo.png'

export default {
  name: 'StudentSign',
  data() {
    return {
      signCardLogo: SignCardLogo,
      queryLoading: false,
      classLoading: false,
      AddAttendanceVisible: false, // 添加考勤
      submitFormLoading: false, // 添加考勤提交
      submitFormDisabled: true,
      noRecordQueryLoading: false, // 未签到table
      currentTab: 0, // 0:已签到 1:未签到
      searchTypeList: [
        {
          value: 'studentName',
          label: '学员姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'primaryContactPhone',
          label: '家长号码',
          placeholder: '请输入家长手机号码'
        }
      ],
      queryForm: {
        searchType: 'studentName',
        searchInput: '',
        type: '',
        classId: '',
        dateRange: [],
        deviceType: null // 设备类型
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      // 未签到查询参数
      noRecordQueryForm: {
        searchInput: '',
        type: '',
        classId: '',
        dateRange: []
      },
      noRecordPageNum: 1, // 未签到
      noRecordPageSize: 10,
      noRecordTotal: 0,
      noRecordList: [], // 未签到table表
      recordList: [],
      classList: [],
      typeList: [
        { value: 0, label: '到校打卡', class: 'success' },
        { value: 1, label: '普通打卡', class: 'info' },
        { value: 2, label: '离校打卡', class: 'warning' },
        { value: 3, label: '刷卡课消', class: 'success' },
        { value: 4, label: '刷脸课消', class: 'warning' }
      ],
      deviceTypeList: [
        { value: 0, label: '人脸识别', class: 'success' },
        { value: 1, label: '刷卡设备', class: 'warning' },
        { value: 2, label: '手动录入', class: 'warning' }
      ], // 设备类型
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'weeks').toDate(), new Date()])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'months').toDate(), new Date()])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(3, 'months').toDate(), new Date()])
          }
        }]
      },
      noRecordPickerOptions: {
        disabledDate(time) {
          // if (time.getTime() > Date.now() || time.getMonth() < new Date().getMonth() - 1) {
          //   return true
          // }
          if (time.getTime() > Date.now() || time.getTime() < new Date(new Date().getTime() - 31 * 24 * 3600 * 1000)) {
            return true
          }
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'weeks').toDate(), new Date()])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            picker.$emit('pick', [moment().subtract(1, 'months').toDate(), new Date()])
          }
        }]
      },
      imgs: [],
      signDialogVisible: false,
      icCardNo: null,
      // 考勤表单
      DropDownclassList: [], // 下拉班级
      createAtPickerOptions: {
        disabledDate(value) {
          // 限制选择日期小于等于当前日期到一年前的日期
          if (value > new Date() || value < new Date().setFullYear(new Date().getFullYear() - 1)) {
            return true
          }
        }
        // 限制只能选择当前时间之前
        // selectableRange: [`00:00:00 - ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`]
      },
      attendanceForm: {
        classNameID: null, // 学生班级
        selectedStudent: [], // 已经选中的学生
        type: null, // 0:到校打卡,1:普通打卡,2:离校打卡
        createAt: null // 打卡日期
      },
      // 考勤表单规则
      rules: {
        classNameID: [ { required: true, message: '请选择班级', trigger: 'blur' } ],
        type: [ { required: true, message: '请选择打卡的类型', trigger: 'blur' } ],
        createAt: [ { required: true, message: '请选择打卡日期', trigger: 'blur' } ]
      },
      // 学生穿梭框
      allStudent: [], // 学生数据源
      renderFunc(h, option) {
        return <span>{ option.key } -{ option.lable1 } - { option.phone }</span>
      }
    }
  },
  components: {
    InlineSelect,
    PhotoPreview
  },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    ...mapGetters([
      'currentBranch',
      'organizationInfo'
    ])
  },
  created() {
    this.queryForm.classId = this.$route.query.classId
    // 默认查本周
    this.queryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this.noRecordQueryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this._getStudentSign()
    this._getForDropDown() // 获取下拉框的班级
  },
  methods: {
    _getStudentSign() {
      this.queryLoading = true
      const params = {
        departmentId: this.currentBranch.id, // 所属分校ID
        organizationId: this.organizationInfo.id, // 所属机构ID
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        classId: this.queryForm.classId, // 班级ID
        type: this.queryForm.type, // 打卡类型(0-到校，1-普通记录，2-离校)
        deviceType: this.queryForm.deviceType // 考勤来源(0-人脸识别设备，1-IC卡 2-手动录入)
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startDate = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endDate = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      // this.recordList = []
      this.$http.get('/v1/StudentPunchRecord/getStudentPunchRecordList', params).then(res => {
        if (res.data.length === 0 && this.pageNum <= 1) {
          // this._hasDevice()
          this.recordList = res.data
          this.total = res.total
          return
        }
        res.data.forEach(item => {
          switch (item.sex) {
            case 1:
              item.sexIcon = require('../../assets/icon_male.png')
              break
            case 2:
              item.sexIcon = require('../../assets/icon_famale.png')
          }
          const typeObj = this.typeList.find(o => o.value === item.type)
          if (typeObj) {
            item.typeStr = typeObj.label
            item.typeClass = typeObj.class
          }
        })
        this.recordList = res.data
        this.total = res.total
      }).finally(() => {
        this.queryLoading = false
      })
    },
    // 判断是否配置购买设备
    _hasDevice() {
      this.$http.get('/v1/BindFaceDevice/getBindFaceDeviceList', {
        organizationId: this.$store.getters.organizationInfo.id
      }).then(res => {
        if (res.data.length === 0) {
          this.$alert('您当前还没配置人脸识别设备。如果需要购买，请联系客服: 0851-38157629 。', '温馨提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
      })
    },
    // 获取班级列表
    _getClassList() {
      if (this.classList.length > 0) return
      this.classLoading = true
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id }).then(res => {
        this.classList = res.data
      }).finally(() => {
        this.classLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getStudentSign()
    },
    // 未签到学员查询条件
    noRecordQuery () {
      this.noRecordPageNum = 1
      this._getUnPunchStuddentInfo()
    },
    // 获取未签到学员
    _getUnPunchStuddentInfo() {
      this.noRecordQueryLoading = true
      const params = {
        departmentId: this.currentBranch.id, // 所属分校ID
        pageNum: this.noRecordPageNum,
        pageSize: this.noRecordPageSize,
        startDate: this.noRecordQueryForm.dateRange[0] + ' 00:00:00',
        endDate: this.noRecordQueryForm.dateRange[1] + ' 23:59:59'
      }
      if (this.noRecordQueryForm.searchInput) {
        params.studentName = this.noRecordQueryForm.searchInput
      }
      if (this.noRecordQueryForm.classId) {
        params.classId = this.noRecordQueryForm.classId
      }
      this.$http.get('/v1/UnPunchInfo/getUnPunchStuddentInfo', params).then(res => {
        res.data.forEach(item => {
          if (item.punchDate) {
            item.punchDate = item.punchDate.split(' ')[0]
          }
        })
        this.noRecordList = res.data
        this.noRecordTotal = res.total
      }).finally(() => {
        this.noRecordQueryLoading = false
      })
    },
    noRecordReset() {
      this.noRecordQueryForm = {
        searchInput: '',
        type: '',
        classId: '',
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      }
      this._getUnPunchStuddentInfo()
    },
    reset() {
      this.queryForm = {
        searchType: 'studentName',
        searchInput: '',
        type: '',
        classId: '',
        dateRange: [],
        deviceType: null // 设备类型
      }
      // this.queryForm = {}
      this.query()
    },
    // 学员快速签到入口方法
    handleQuickSign() {
      this.icCardNo = null
      this.signDialogVisible = true
    },
    // 快速签到方法
    handleSignAction() {
      if (!this.icCardNo || this.icCardNo.length < 10) {
        this.$message.warning('无效卡号')
        return
      } else {
        const param = {
          deviceId: this.icCardNo,
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id
        }
        this.$http.post('/v1/StudentPunchRecord/quickAddStudentPunchRecord', param).then(res => {
          let type = ''
          switch (res.data.type) {
            case 0:
              type = '到校打卡'
              break
            case 1:
              type = '普通打卡'
              break
            case 2:
              type = '离校打卡'
              break
            default:
              type = '到校打卡'
              break
          }
          const msg = `<p>学员【<label style="color:#ff6600;">${res.data.studentName}</label>】打卡成功</p><p>打卡类型：${type}</p><p>打卡时间：${res.data.createAt}</p>`
          this.$notify({
            title: '签到成功',
            dangerouslyUseHTMLString: true,
            type: 'success',
            message: msg
          })
          this.icCardNo = null
        })
      }
      this.icCardNo = null
    },
    handleOpenPhoto(row) {
      if (row.deviceType === 1) {
        return
      }
      if (!row.imageUrl) {
        this.$message.warning('暂无图片')
      } else {
        this.imgs = [{
          title: row.studentName + ' ' + row.createAt + ' ' + row.typeStr,
          src: row.imageUrl
        }]
        this.$refs.photoPreview.show()
      }
    },
    // 月份，日期，分钟小于10加0显示
    standardDate(s) {
      return s < 10 ? '0' + s : s
    },
    // 打开新增考勤弹框
    openAddisible() {
      this.AddAttendanceVisible = true
    },
    closeAddvisible() {
      this.AddAttendanceVisible = false
      this.resetForm()
    },
    submitForm() {
      if (new Date(this.attendanceForm.createAt) > new Date()) {
        this.$message({ message: '请选择此时间段之前的时间', type: 'warning' })
      } else {
        this.submitFormLoading = true
        const params = this.attendanceForm.selectedStudent.map((item) => {
          return {
            studentId: item,
            deviceType: 2, // 默认为手动录入
            punchDate: this.attendanceForm.createAt.split(' ')[0], // 打卡日期
            createAt: this.attendanceForm.createAt, // 打卡具体时间
            type: this.attendanceForm.type, // 0:到校打卡,1:普通打卡,2:离校打卡
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id
          }
        })
        this.$http.post('/v1/StudentPunchRecord/addStudentPunchRecords', params).then((res) => {
          this.$message({ message: '成功添加学生考勤', type: 'success' })
          this.AddAttendanceVisible = false
          this.resetForm()
          this._getStudentSign()
        }).finally(() => {
          this.submitFormLoading = false
        })
      }
    },
    resetForm() {
      this.attendanceForm = {
        classNameID: null, // 学生班级
        selectedStudent: [], // 已经选中的学生
        type: null, // 0:到校打卡,1:普通打卡,2:离校打卡
        createAt: null // 打卡日期
      }
      this.$refs.ruleForm.resetFields()
    },
    // 弹出框内获取下拉框获取班级
    _getForDropDown() {
      this.$http.get('/v1/Class/getForDropDown', { departmentId: this.currentBranch.id }).then(res => {
        this.DropDownclassList = res.data
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  },
  watch: {
    currentTab() {
      if (this.currentTab === '0') {
      } else {
        this._getUnPunchStuddentInfo()
      }
    },
    signDialogVisible() {
      if (this.signDialogVisible) {
        this.$nextTick(() => {
          this.$refs.bindICCardFormInput.focus()
        })
      }
    },
    // 选择的班级发生变化
    'attendanceForm.classNameID': {
      handler: function() {
        this.$http.get(`/v1/Student/getStudentInfoByClassId/${this.attendanceForm.classNameID}`).then((res) => {
          this.allStudent = res.data.map((item) => {
            return { key: item.id, label: item.name, phone: item.primaryContactPhone }
          })
        })
      }
    },
    // 选中的学生变化
    'attendanceForm': {
      handler: function() {
        if (this.attendanceForm.selectedStudent.length >= 1 && this.attendanceForm.type && this.attendanceForm.createAt) {
          this.submitFormDisabled = false
        } else {
          this.submitFormDisabled = true
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.transfer
  display flex
  justify-content center
  margin 0 0 20px 0
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
    // .el-button--primary
    //   background-color $color-success
    //   border 1px solid $color-success
    // .is-disabled
    //   background-color #eeeeee
    //   border 1px solid #eeeeee
.item-buttons
  display flex
  justify-content flex-end
  align-items center
  margin 10px 30px 0 0
.username
  span
    font-size 13px
    color $color-text-2
    margin 0 6px
  img
    vertical-align middle
.sign-container
  width 300px
  height 470px
  margin 0 auto
  overflow hidden
  .logo
    width 250px
    height 250px
    margin-left 25px
  ul
    li
      color #ff6600
      margin-bottom 5px
.showTableData
  background #fff
  padding 14px
</style>

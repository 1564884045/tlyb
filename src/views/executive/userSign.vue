<template>
  <div>
    <div class="query-form">
      <el-input v-model.trim="queryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select" style="width: 280px;">
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
        :picker-options="pickerOptions"
        @change="query"
        :clearable="false"
        style="width: 260px;margin: 0 16px;">
      </el-date-picker>
      <inline-select v-model="queryForm.type" @change="query" label="打卡类型" :options="typeList" clearable/>
      <inline-select v-model="queryForm.flag" @change="query" label="考勤标识" :options="punchFlagList" clearable/>
      <inline-select v-model="queryForm.deviceType" @change="query" label="考勤来源" :options="deviceTypeList" clearable/>
      <el-button type="text" :disabled="!queryLoading ? false : true" @click="reset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
    </div>
    <div class="showTableData">
      <el-table
        :data="recordList"
        stripe
        v-loading="queryLoading">
        <el-table-column
          prop="userName"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="联系方式">
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="打卡时间">
        </el-table-column>
        <el-table-column
          prop="flag"
          label="考勤标识"
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.flag == 0" type="success">正常</el-tag>
            <el-tag v-if="scope.row.flag == 1" type="warning">迟到</el-tag>
            <el-tag v-if="scope.row.flag == 2" type="danger">早退</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="typeStr"
          label="打卡类型"
          width="160"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.typeClass">{{scope.row.typeStr}}</el-tag>
        </el-table-column>
        <!-- deviceType -->
        <el-table-column
          prop="deviceType"
          label="考勤来源"
          width="160"
          align="center">
          <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.deviceType === 0">人脸识别</el-tag>
            <el-tag type="info" v-else>刷卡设备</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="160">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.deviceType === 0 ? false : true" @click="handleOpenPhoto(scope.row)">查看照片</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getUserSign"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 提醒机构购买设备 -->
    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      custom-class="custom-dialog"
      :center="true"
      width="30%">
      <div class="mini-program">
        <span><i class="el-icon-warning"></i> 当前尚未配置人脸识别设备。如果需要购买，请使用微信扫描下方小程序二维码进行购买。</span>
        <img src="../../assets/mini_program.jpg" alt="图片加载中">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">好的，我知道啦！~</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览 -->
    <photo-preview ref="photoPreview" :list="imgs"></photo-preview>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import InlineSelect from '../../components/InlineSelect'
import PhotoPreview from '../../components/PhotoPreview'

export default {
  name: 'StudentSign',
  data() {
    return {
      dialogVisible: false,
      queryLoading: false,
      classLoading: false,
      searchTypeList: [
        {
          value: 'userName',
          label: '员工姓名',
          placeholder: '请输入用户姓名'
        },
        {
          value: 'phone',
          label: '联系电话',
          placeholder: '请输入联系电话'
        }
      ],
      queryForm: {
        searchType: 'userName',
        searchInput: '',
        type: '',
        deviceType: '', // 考勤来源
        flag: null,
        dateRange: []
      },
      punchFlagList: [
        { value: 0, label: '正常打卡' },
        { value: 1, label: '迟到打卡' },
        { value: 2, label: '早退打卡' }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      recordList: [],
      classList: [],
      typeList: [
        { value: 0, label: '上班打卡', class: 'success' },
        { value: 1, label: '其他打卡', class: 'info' },
        { value: 2, label: '下班打卡', class: 'warning' }
      ],
      deviceTypeList: [
        { value: 0, label: '人脸识别', class: 'success' },
        { value: 1, label: '刷卡设备', class: 'warning' }
      ],
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
      imgs: []
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
    // 默认查本周
    this.queryForm.dateRange = [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    this._getUserSign()
    this._hasDevice()
  },
  methods: {
    // 获取考勤列表
    _getUserSign() {
      this.queryLoading = true
      const params = {
        departmentId: this.currentBranch.id,
        organizationId: this.organizationInfo.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        type: this.queryForm.type,
        flag: this.queryForm.flag,
        deviceType: this.queryForm.deviceType
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startDate = this.queryForm.dateRange[0]
        params.endDate = this.queryForm.dateRange[1]
      }
      this.$http.get('/v1/UserPunchRecord/getUserPunchRecordList', params).then(res => {
        if (res.data.length === 0 && this.pageNum <= 1) {
          this.recordList = res.data
          return
        }
        res.data.forEach(item => {
          if (!item.userName) {
            item.userName = '--'
          }
          if (!item.phone) {
            item.phone = '--'
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
          this.dialogVisible = true
        }
      })
    },
    query() {
      this.pageNum = 1
      this._getUserSign()
    },
    reset() {
      this.queryForm = {
        searchType: 'userName',
        searchInput: '',
        type: '',
        deviceType: '', // 考勤来源
        dateRange: [moment().subtract(1, 'weeks').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
      }
      this.query()
    },
    handleOpenPhoto(row) {
      this.imgs = [{
        title: row.userName + ' ' + row.createAt + ' ' + row.typeStr,
        src: row.imageUrl
      }]
      this.$refs.photoPreview.show()
    }
  }
}
</script>

<style lang="stylus" scoped>
>>>.el-dialog__body
  padding 0px 20px
.mini-program
  span
    line-height 30px
    padding 12px
    display inline-block
    color #E6A23C
    background-color: #fdf6ec
  img
    width 280px
    margin-left 50%
    transform translateX(-50%)
.username
  span
    font-size 13px
    color $color-text-2
    margin 0 6px
  img
    vertical-align middle
.showTableData
  background #fff
  padding 14px
</style>

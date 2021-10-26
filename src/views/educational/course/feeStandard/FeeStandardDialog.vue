<!-- 收费套餐 "新增" 弹框 -->
<template>
  <el-dialog :title="feeId ? '编辑收费套餐' : '新增收费套餐'" custom-class="custom-dialog" :visible="value" :close-on-click-modal="false" append-to-body top="8vh" width="790px" @close="$emit('toggle', false)" class="feeStandard-dialog">
    <el-form :model="feeForm" :rules="feeRules" ref="feeForm" label-width="96px" size="mini" inline :disabled="disabled">
      <el-form-item label="收费套餐:" prop="name">
        <el-input v-model="feeForm.name" :maxlength="30" autocomplete="off" placeholder="请填写收费套餐名称" style="width: 260px;"></el-input>
      </el-form-item>

      <el-form-item label="收费方式:" prop="valuationType" style="display: block; width: 100%;">
        <el-radio-group v-model="feeForm.valuationType" @change="handleTypeChange">
          <el-radio label="0">课时计费</el-radio>
          <el-radio label="1">按期计费</el-radio>
          <el-radio label="2">按时间计费</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="fee-panel">
        <div class="panel-title">
          <span>{{valuationTypeLabel}}</span>
          <el-popover placement="top-start" width="200" trigger="hover" :content="valuationTypeDesc">
            <i slot="reference" class="el-icon-question"></i>
          </el-popover>
        </div>
        <div v-for="(item, index) in  feeForm.priceEntityList" :key="index" class="panel-con">
          <el-form-item label="套餐名称:" :prop="'priceEntityList.' + index + '.priceName'" :rules="priceNameRule" style="display: block; width: 100%;">
            <el-input v-model="item.priceName" :maxlength="20" placeholder="请填写套餐名称" style="width: 160px;"></el-input>
          </el-form-item>
          <template v-if="item.valuationType == '0'">
            <el-form-item label="课时单价:" :prop="'priceEntityList.' + index + '.classHourSignalPrice'" :rules="feeRules.classHourSignalPrice" style="display: block; width: 100%;">
              <el-input-number :min="1" v-model="item.classHourSignalPrice" :max="99999999" :precision="2" :controls="false" class="left-number"></el-input-number>
              <span style="color: #666;width: 50px; display: inline-block">元/节课</span>
              <span class="color-danger" style="margin-left: 70px;">总价：{{(item.classHourSignalPrice * item.classHour).toFixed(2)}}元</span>
            </el-form-item>
          </template>
          <template v-else-if="item.valuationType == '1'">
            <el-form-item label="学期选择" :prop="'priceEntityList.' + index + '.periodId'" :rules="feeRules.periodId">
              <el-select v-model="item.periodId" placeholder="请选择" style="width: 160px;">
                <el-option v-for="item in periodList" :key="item.key" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="每期价格:" :prop="'priceEntityList.' + index + '.periodPrice'" :rules="feeRules.periodPrice">
              <el-input-number :controls="false" :min="1" :max="99999999" :precision="2" v-model="item.periodPrice"></el-input-number>
              <span>元</span>
            </el-form-item>
          </template>
          <template v-else-if="item.valuationType == '2'">
            <el-form-item label="时间类型:" :prop="'priceEntityList.' + index + '.timeType'" :rules="feeRules.timeType">
              <el-input-number :controls="false" :min="1" :max="99999999" v-model="item.timeCount" class="left-number"></el-input-number>
              <el-select v-model="item.timeType" placeholder="单位" style="width: 75px; marginLeft: 10px">
                <el-option v-for="item in timeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="计费单价:" :prop="'priceEntityList.' + index + '.timeSinglePrice'" :rules="feeRules.timeSinglePrice">
              <el-input-number :controls="false" :min="1" :max="99999999" :precision="2" v-model="item.timeSinglePrice"></el-input-number>
              <span>元</span>
            </el-form-item>
          </template>

          <el-form-item v-if="item.valuationType != '0'" label="沿用课时:" :prop="'priceEntityList.' + index + '.enableClassHour'" style="display: block; width: 100%;">
            <el-switch :inactive-value="0" :active-value="1" v-model="item.enableClassHour"></el-switch>
            <el-popover placement="top-start" width="200" trigger="hover" content="关闭状态为以截止时间结课，不以课时计算课程">
              <i slot="reference" class="el-icon-question"></i>
            </el-popover>
          </el-form-item>
          <el-form-item label="课时数量:" v-if="item.enableClassHour" :rules="feeRules.classHour" :prop="'priceEntityList.' + index + '.classHour'" style="display: block; width: 100%;">
            <el-input-number controls-position="right" :min="1" :max="99999999" step-strictly v-model="item.classHour" :controls="false" class="left-number"></el-input-number>
            <span v-if="item.valuationType != '0'">
                (均价为: <span style="color: #FF6600">{{(item.valuationType === '1' || item.valuationType === 1) ? (item.periodPrice / item.classHour).toFixed(2) : (item.timeCount * item.timeSinglePrice / item.classHour).toFixed(2)}}</span> 元/课时)
            </span>
          </el-form-item>

          <el-form-item v-if="item.valuationType != '0' ? item.enableClassHour : true" label="动态课消:" :prop="'priceEntityList.' + index + '.supportDynamicSubClassHour'" style="display: block; width: 100%;">
            <el-radio-group v-model="item.supportDynamicSubClassHour">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
            <el-popover placement="top-start" width="200" trigger="hover" content="支持动态课消。系统将自动根据点名考勤进行课消">
              <i slot="reference" class="el-icon-question"></i>
            </el-popover>
          </el-form-item>

          <template v-if="item.valuationType != '0' ? item.enableClassHour && item.supportDynamicSubClassHour == 1 : item.supportDynamicSubClassHour == 1">
            <el-form-item label="缺勤扣课时:">
              <el-radio-group v-model="item.absenteeismSub">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="请假扣课时:">
              <el-radio-group v-model="item.leaveSub">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <el-form-item v-if="item.valuationType == '0'" label="课时说明:" style="display: block; width: 100%;">
            <el-input type="textarea" :rows="2" v-model="item.classHourExplain" placeholder="输入数字限制在60字以内" :maxlength="60" show-word-limit style="width: 550px;"></el-input>
          </el-form-item>

          <el-button
            class="fee-standard-delete"
            type="danger"
            plain
            circle
            icon="el-icon-delete"
            title="删除"
            :disabled="feeForm.priceEntityList.length <= 1"
            @click.prevent="removePriceEntity(index, item)"
          ></el-button>
        </div>

        <div class="add-opt" v-if="!disabled">
          <el-button type="text" icon="el-icon-circle-plus-outline" @click="addPriceEntity" size="medium">添加套餐</el-button>
        </div>
      </div>
    </el-form>

    <div slot="footer" v-if="!disabled" class="bottom-bar">
      <p class="danger-tip">{{feeId ? '注意：修改收费套餐，可能会影响到之前的课程价格数据，以及动态课消的计算规则。' : ''}}</p>
      <div>
        <el-button @click="$emit('toggle', false)">取 消</el-button>
        <el-button :loading="loadingSubmit" type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    feeId: String,
    disabled: Boolean,
    noSave: Boolean
  },
  data() {
    return {
      courseSwitch: false,
      loadingSubmit: false, // 新增loading
      feeForm: {
        id: null,
        name: '',
        valuationType: '0',
        description: '',
        priceEntityList: [],
        deletePriceEntityList: []
      },
      feeRules: {
        name: {
          required: true,
          message: '请填写收费套餐名称',
          trigger: 'blur'
        },
        valuationType: {
          required: true,
          message: '请选择收费方式',
          trigger: 'blur'
        },
        classHour: [
          { required: true, message: '请输入课时数量', trigger: 'blur' }
        ],
        classHourSignalPrice: [
          { required: true, message: '请输入减课时数', trigger: 'blur' }
        ],
        periodId: [
          { required: true, message: '请选择套餐名称', trigger: 'blur' }
        ],
        periodPrice: [
          { required: true, message: '请输入课程单价', trigger: 'blur' }
        ],
        timeCount: [
          { required: true, message: '请输选择学期选择', trigger: 'blur' }
        ],
        timeType: [
          { required: true, message: '请选择时间单位', trigger: 'blur' }
        ],
        timeSinglePrice: [
          { required: true, message: '请输入计费单价', trigger: 'blur' }
        ],
        supportDynamicSubClassHour: [
          { required: true, message: '请输选择动态课消', trigger: 'blur' }
        ],
        absenteeismSub: [
          { required: true, message: '请选择缺勤扣课时', trigger: 'blur' }
        ],
        leaveSub: [
          { required: true, message: '请选择请假扣课时', trigger: 'blur' }
        ]
      },
      priceNameRule: {
        required: true,
        trigger: 'blur',
        validator: (rule, value, callback) => {
          if (value == null || value.replace(/(^s*)|(s*$)/g, '').length === 0) {
            callback(new Error('请填写课程套餐名称'))
          } else {
            const row = parseInt(rule.field.split('.')[1])
            if (
              this.feeForm.priceEntityList.find(
                (o, i) => i !== row && o.priceName === value
              )
            ) {
              callback(new Error('重复的收费套餐名称，请修改'))
            } else {
              callback()
            }
          }
        }
      },
      periodList: [],
      valuationTypeList: [
        {
          value: '0',
          label: '课时计费',
          desc: '适用于按照课时单价计费的课程，如一对一、VIP等'
        },
        {
          value: '1',
          label: '按期计费',
          desc: '适用于按期计费的课程，如暑假班等'
        },
        {
          value: '2',
          label: '按时间计费',
          desc: '适用于按照时间计费的课程，如托管、幼儿园等'
        }
      ],
      timeList: [
        {
          id: 0,
          name: '天'
        },
        {
          id: 1,
          name: '月'
        },
        {
          id: 2,
          name: '季度'
        },
        {
          id: 3,
          name: '半年'
        },
        {
          id: 4,
          name: '年'
        }
      ]
    }
  },
  computed: {
    valuationTypeLabel() {
      let obj = this.valuationTypeList.find(
        (o) => o.value === this.feeForm.valuationType
      )
      if (obj) {
        return obj.label
      }
      return ''
    },
    valuationTypeDesc() {
      let obj = this.valuationTypeList.find(
        (o) => o.value === this.feeForm.valuationType
      )
      if (obj) {
        return obj.desc
      }
      return ''
    },
    ...mapGetters(['organizationInfo', 'currentBranch'])
  },
  methods: {
    // 获取学期
    _getPeriodList() {
      if (this.periodList.length > 0) return
      this.$http
        .get(`/v1/Period/getPeriodList/${this.currentBranch.id}`)
        .then((res) => {
          this.periodList = res.data
        })
    },
    // 获取数据
    _getFeeTemplateById() {
      this.$http
        .get('/v1/FeeTemplate/getFeeTemplateById', {
          id: this.feeId
        })
        .then((res) => {
          for (const key in this.feeForm) {
            if (res.data.hasOwnProperty(key)) {
              this.feeForm[key] = res.data[key]
            }
          }
        })
    },
    // 添加价格项
    addPriceEntity() {
      const entity = {
        enableClassHour: 0,
        priceName: '',
        classHour: 1, // 课时数量
        supportDynamicSubClassHour: 1, // 动态课消
        absenteeismSub: 1, // 缺勤扣课时
        leaveSub: 0, // 请假扣课时
        valuationType: this.feeForm.valuationType // 课程计价方式 0课时计价 1按期计费 2按时间计费 3日历计价
      }
      switch (this.feeForm.valuationType) {
        case '0':
          entity.enableClassHour = 1
          entity.classHour = ''
          entity.classHourSignalPrice = ''
          entity.classHourExplain = ''
          break
        case '1':
          // 按学期
          entity.periodPrice = ''
          entity.periodId = ''
          break
        case '2':
          // 按时间
          entity.timeType = 1
          entity.timeCount = ''
          entity.timeSinglePrice = ''
          break
      }
      this.feeForm.priceEntityList.push(entity)
    },
    // 删除价格项
    removePriceEntity(index, item) {
      if (item.id) {
        this.feeForm.deletePriceEntityList.push(item)
      }
      this.feeForm.priceEntityList.splice(index, 1)
    },
    handleTypeChange() {
      this.feeForm.priceEntityList.forEach((item) => {
        if (item.id) {
          this.feeForm.deletePriceEntityList.push(item)
        }
      })
      this.feeForm.priceEntityList = []
      this.addPriceEntity()
    },
    // 提交保存
    submit() {
      if (!this.value || this.loadingSubmit) return
      if (this.noSave) {
        // 不需要提交数据
        this.$emit('success', Object.assign({}, this.feeForm))
        return
      }
      this.$refs.feeForm.validate((valid) => {
        if (valid) {
          // 新增提交
          // const params = Object.assign({}, this.feeForm)
          const params = {
            id: this.feeForm.id,
            name: this.feeForm.name,
            valuationType: this.feeForm.valuationType,
            description: this.feeForm.description,
            deletePriceEntityList: this.feeForm.deletePriceEntityList,
            priceEntityList: []
          }
          for (let i = 0; i < this.feeForm.priceEntityList.length; i++) {
            if (this.feeForm.priceEntityList[i].enableClassHour === 1) {
              params.priceEntityList.push(this.feeForm.priceEntityList[i])
            } else {
              this.feeForm.valuationType === '1'
                ? params.priceEntityList.push({
                  id: this.feeForm.priceEntityList[i].id,
                  valuationType: this.feeForm.priceEntityList[i]
                    .valuationType, // 收费方式
                  priceName: this.feeForm.priceEntityList[i].priceName, // 价格名称
                  periodPrice: this.feeForm.priceEntityList[i].periodPrice, // 按期计费价格
                  periodId: this.feeForm.priceEntityList[i].periodId, // 按期计费描述:春季、秋季、暑假、寒假、全年、假期
                  enableClassHour: this.feeForm.priceEntityList[i].enableClassHour // 是否沿用课时
                })
                : params.priceEntityList.push({
                  id: this.feeForm.priceEntityList[i].id,
                  valuationType: this.feeForm.priceEntityList[i].valuationType, // 收费方式
                  priceName: this.feeForm.priceEntityList[i].priceName, // 价格名称
                  timeCount: this.feeForm.priceEntityList[i].timeCount, // 总天数/月数/季度数/半年数/年数
                  timeType: this.feeForm.priceEntityList[i].timeType, // 按时间计费方式:天、月、季度、半年、年
                  timeSinglePrice: this.feeForm.priceEntityList[i].timeSinglePrice, // 时间计费单价
                  enableClassHour: this.feeForm.priceEntityList[i].enableClassHour // 是否沿用课时
                })
            }
          }
          if (this.feeId) {
            // 修改
            this.$confirm(
              '修改收费套餐，可能会影响到之前的课程价格数据，以及动态课消的计算规则。确认修改价格标准？',
              '提示'
            ).then(() => {
              this.loadingSubmit = true
              this.$http
                .put('/v1/FeeTemplate/updateFeeTemplate', params)
                .then((res) => {
                  this.$emit('toggle', false)
                  this.$emit('success', params)
                })
                .finally(() => {
                  this.loadingSubmit = false
                })
            })
          } else {
            // 新增
            this.loadingSubmit = true
            params.belongDepartment = this.currentBranch.id
            this.$http
              .post('/v1/FeeTemplate/addFeeTemplate', params)
              .then((res) => {
                this.$emit('toggle', false)
                this.$emit('success', params)
              })
              .finally(() => {
                this.loadingSubmit = false
              })
          }
        } else {
          return false
        }
      })
    }
  },
  watch: {
    value() {
      if (this.value) {
        this.feeForm = {
          id: null,
          name: '',
          valuationType: '0',
          description: '',
          priceEntityList: [],
          deletePriceEntityList: []
        }
        this._getPeriodList()
        this.addPriceEntity()
        // 去获取数据
        if (this.feeId) {
          this._getFeeTemplateById()
        }
      }
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.fee-panel
  background #f2f2f2
  border-top 1px solid $color-border-1
  .el-icon-question
    font-size 16px
    cursor pointer
    margin-left 12px
    color $color-primary
.bottom-bar
  display flex
  justify-content space-between
  align-items center
  .danger-tip
    color $color-danger
    font-size 14px

.panel-title
  height 36px
  line-height 36px
  padding 0 20px
  font-size 14px
  color $color-primary
  .el-icon-question
    margin-left 20px

.panel-con
  position relative
  border-top 1px solid #fff
  padding 10px
  .fee-standard-delete
    position absolute
    top 8px
    right 10px
.fee-stardrd-add
  color $color-primary
  cursor default
.add-opt
  padding-left 20px
  border-top 1px solid #fff
.el-form-item
  width 48%
  .el-input-number
    width 160px
.el-form-item
  .el-switch
    margin-left 12px
</style>

<style lang="stylus">
.feeStandard-dialog
  .left-number
    .el-input__inner
      text-align left
  .right-number
    .el-input__inner
      text-align right
</style>

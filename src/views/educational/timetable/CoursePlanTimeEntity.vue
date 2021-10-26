<template>
  <div class="entity">
    <el-button type="danger" v-show="!deleteDisabled" icon="el-icon-delete" class="btn-delete" @click="$emit('remove')" circle></el-button>
    <el-form
      ref="coursePlanTimeEntity"
      :model="coursePlanTimeEntity"
      label-width="95px"
      :rules="rules">
      <el-form-item prop="week" label="周几上课：">
        <el-checkbox-group v-model="coursePlanTimeEntity.week" @change="handleChange">
          <el-checkbox v-for="it of dayList" :key="it.k" :label="it.k" style="margin-right: 20px;">{{it.v}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item prop="endTime" label="上课时间：">
        <el-time-select
          placeholder="起始时间"
          v-model="coursePlanTimeEntity.startTime"
          :picker-options="{
            start: startTime,
            step: '00:05',
            end: endTime
          }"
          @change="handleChange"
          :clearable="false"
          style="width: 120px">
        </el-time-select>
        <span style="margin: 0 12px;">~</span>
        <el-time-select
          placeholder="结束时间"
          v-model="coursePlanTimeEntity.endTime"
          :picker-options="{
            start: startTime,
            step: '00:05',
            end: endTime,
            minTime: coursePlanTimeEntity.startTime
          }"
          @change="handleChange"
          :clearable="false"
          style="width: 120px">
        </el-time-select>
        <el-popover
          placement="top-start"
          width="200"
          trigger="hover">
          <i slot="reference" class="el-icon-question color-primary" style="margin-left: 12px; font-size: 14px;"></i>
          <p>上课时间范围来自于校区的营业时间！</p>
        </el-popover>
      </el-form-item>
      <el-form-item prop="classHour" label="授课课时：">
        <el-input-number @change="handleChange" v-model.number="coursePlanTimeEntity.classHour" controls-position="right" :min="0" :max="1000"></el-input-number>
        <span class="form-tip">(每次上课消耗的课时数，无课时课程授课课时应设置为0)</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import lodash from 'lodash'
import { mapGetters } from 'vuex'

const dayList = [{ k: 2, v: '周一' }, { k: 3, v: '周二' }, { k: 4, v: '周三' }, { k: 5, v: '周四' }, { k: 6, v: '周五' }, { k: 7, v: '周六' }, { k: 1, v: '周日' }]
const entity = {
  classHour: 0, // 授课课时
  endTime: '', // 上课结束时间(时间格式为：yyyy-MM-dd HH:mm:ss)
  startTime: '', // 上课开始时间(时间格式为：yyyy-MM-dd HH:mm:ss)
  week: [] // 星期 1 2 3 4 5 6 7
}

export default {
  name: 'CoursePlanTimeEntity',
  model: {
    prop: 'entityValue',
    event: 'change'
  },
  props: {
    entityValue: {
      type: Object,
      default: () => lodash.cloneDeep(entity)
    },
    deleteDisabled: {
      type: Boolean,
      default: false
    }
  },
  volume: [
    { type: 'number',
      required: true,
      validator: (rule, value, callback) => {
        if (value < 1) {
          callback(new Error('最大人数不能小于1'))
        } else {
          callback()
        }
      },
      trigger: 'blur' }
  ],
  data () {
    return {
      checkedCities: [],
      rules: {
        week: [
          { type: 'array', required: true, message: '请至少选择一天', trigger: 'blur' }
        ],
        endTime: [
          { trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!this.coursePlanTimeEntity.startTime) {
                callback(new Error('请选择上课开始时间'))
              } else if (this.coursePlanTimeEntity.startTime && this.coursePlanTimeEntity.endTime && this.coursePlanTimeEntity.startTime >= this.coursePlanTimeEntity.endTime) {
                callback(new Error('上课的开始时间必须小于上课的结束时间'))
              } else {
                callback()
              }
            }
          },
          { required: true, message: '请选择上课结束时间', trigger: 'blur' }

        ],
        classHour: [
          { type: 'number', min: 0, required: true, message: '授课课时不能为负', trigger: 'change' }
        ]
      },
      dayList,
      coursePlanTimeEntity: JSON.parse(JSON.stringify(entity))
    }
  },
  computed: {
    startTime() {
      if (this.currentBranch && this.currentBranch.businessStartDate) {
        return this.currentBranch.businessStartDate
      }
      return '06:00'
    },
    endTime() {
      if (this.currentBranch && this.currentBranch.businessEndDate) {
        return this.currentBranch.businessEndDate
      }
      return '21:00'
    },
    ...mapGetters([
      'currentBranch'
    ])
  },
  mounted () {
    // 在mounted中赋值便于重置
    const val = JSON.parse(JSON.stringify(this.entityValue))
    if (val != null && Object.keys(val).length > 0) {
      this.coursePlanTimeEntity.classHour = val.classHour
      this.coursePlanTimeEntity.week = Array.isArray(val.week) ? val.week : []
      this.coursePlanTimeEntity.startTime = val.startTime
      this.coursePlanTimeEntity.endTime = val.endTime
    }
    this.clearValidate()
  },
  watch: {
    entityValue: {
      handler: function(value) {
        const val = JSON.parse(JSON.stringify(value))
        if (val != null && Object.keys(val).length > 0) {
          this.coursePlanTimeEntity.classHour = val.classHour
          this.coursePlanTimeEntity.week = Array.isArray(val.week) ? val.week : []
          this.coursePlanTimeEntity.startTime = val.startTime
          this.coursePlanTimeEntity.endTime = val.endTime
        }
      },
      immediate: true
    }
  },
  methods: {
    handleChange() {
      let temp = {
        classHour: this.coursePlanTimeEntity.classHour,
        startTime: this.coursePlanTimeEntity.startTime,
        endTime: this.coursePlanTimeEntity.endTime,
        week: JSON.parse(JSON.stringify(this.coursePlanTimeEntity.week))
      }
      this.$emit('change', temp)
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs['coursePlanTimeEntity'] && this.$refs['coursePlanTimeEntity'].clearValidate()
      })
    },
    resetFields() {
      this.$nextTick(() => {
        this.$refs['coursePlanTimeEntity'] && this.$refs['coursePlanTimeEntity'].resetFields()
      })
    },
    validate(func) {
      this.$refs['coursePlanTimeEntity'] && this.$refs['coursePlanTimeEntity'].validate(func)
    }
  }
}
</script>

<style lang="stylus" scoped>
.entity
  width 600px
  position relative
  border 1px solid #e8e8e8
  padding 10px 15px
  border-radius 4px
  display inline-block
  .btn-delete
    margin 0px
    position absolute
    right 16px
    top -13px
    z-index 2001
    padding 6px
.form-tip
  font-size 13px
  color $color-info
  margin-left 20px
</style>

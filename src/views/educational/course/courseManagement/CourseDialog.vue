<template>
  <el-dialog :title="courseId ? '课程编辑' : '课程新增'"
    :visible="value"
    custom-class="custom-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('toggle', false)"
    top="6vh"
    width="840px">
    <el-form :model="courseForm" :rules="rules" ref="courseForm" label-width="88px" v-loading="queryLoading">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="课程名称:" prop="name">
            <el-input v-model="courseForm.name" style="width: 236px" placeholder="请输入课程名称" :maxlength="20"></el-input>
          </el-form-item>

          <el-form-item label="适龄:">
            <el-input-number v-model="courseForm.applyAge0" controls-position="right" :min="1" :max="999" style="width: 110px"></el-input-number>  ~
            <el-input-number v-model="courseForm.applyAge1" controls-position="right" :min="courseForm.applyAge0" :max="999" style="width: 110px"></el-input-number>
          </el-form-item>

          <el-form-item label="课程类别:" prop="courseCategoryId">
            <el-select v-model="courseForm.courseCategoryId" clearable placeholder="请选择" style="width: 236px;">
              <el-option
                v-for="item in courseCategoryList"
                :key="item.key"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
            <p class="form-tip">如未有合适分类，可至<span class="link" @click="showCategory = true"> 课程类别 </span>新增</p>
          </el-form-item>

          <el-form-item v-if="courseForm.supportPrepaid === 1" label="预付款金额:" prop="prepaidPrice">
            <el-input-number controls-position="right" :min="1" :max="99999999" v-model="courseForm.prepaidPrice" style="width: 236px;"></el-input-number>
          </el-form-item>

          <el-form-item label="收费套餐:" prop="templateId">
            <el-select @change="setvaluationType()" v-model="courseForm.templateId" placeholder="请选择" style="width: 236px;">
              <el-option
                v-for="item in feeStandardList"
                :key="item.key"
                :label="item.name"
                :value="item.id"
                >
              </el-option>
            </el-select>

            <span v-if="courseForm.templateId !== ''" class="link" @click="handleOpenFee(courseForm.templateId, true)">
              查看
            </span>
            <p class="form-tip">如未有合适收费套餐，可至<span class="link" @click="handleOpenFee(null, false)"> 收费套餐 </span>新增</p>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="授课方式:" prop="giveLessonsWay">
            <el-radio v-model="courseForm.giveLessonsWay" :label="0" style='width: 50px'>一对一</el-radio>
            <el-radio v-model="courseForm.giveLessonsWay" :label="1" style='width: 50px'>一对多</el-radio>
          </el-form-item>

          <el-form-item label="是否已开班:" prop="saleStatus">
            <el-radio v-model="courseForm.saleStatus" :label="1" style='width: 50px'>是</el-radio>
            <el-radio v-model="courseForm.saleStatus" :label="0" style='width: 50px'>否</el-radio>
          </el-form-item>

          <el-form-item label="类型:" prop="type" style="marginRight: 10px">
            <el-radio v-model="courseForm.type" :label="0" style='width: 50px'>标准课</el-radio>
            <el-radio v-model="courseForm.type" :label="1" style='width: 50px'>体验课</el-radio>
            <el-radio v-model="courseForm.type" :label="2" style='width: 50px'>优惠课</el-radio>
          </el-form-item>

          <el-form-item label="课程描述:">
            <el-input type="textarea" :rows="3" v-model="courseForm.description" placeholder='输入数字限制在60字以内' :maxlength="60" show-word-limit style="width: 260px"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div>
        <el-form-item label="包含学杂:" prop="containTuition" style='width: 407px; display: inline-block;'>
          <el-radio v-model="courseForm.containTuition" :label="1">是</el-radio>
          <el-radio v-model="courseForm.containTuition" :label="0">否</el-radio>
        </el-form-item>

        <el-form-item label="是否必须购买学杂:" prop="mustTuition" label-width="130px" v-if="courseForm.containTuition === 1" style="display: inline-block;">
          <el-radio v-model="courseForm.mustTuition" :label="1">是</el-radio>
          <el-radio v-model="courseForm.mustTuition" :label="0">否</el-radio>
        </el-form-item>
      </div>

      <div v-if="courseForm.containTuition === 1">
        <el-table
          :data="selectedTuition"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="学杂名称">
          </el-table-column>

          <el-table-column
            prop="inventory"
            label="库存">
          </el-table-column>
          <el-table-column
            prop="price"
            label="单价">
          </el-table-column>
          <el-table-column prop="tuitionNum" label="数量" width="160">
            <template slot-scope="scope">
              <el-input-number controls-position="right" :min="1" :max="99999999" v-model="scope.row.tuitionNum" placeholder="请输入"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="50" align="center">
            <template slot-scope="scope">
              <el-button icon="el-icon-delete" type="text" @click="handleRemoveTuition(scope.row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="el-icon-circle-plus-outline" type="text" size="medium" style="margin-top: 6px" @click="handleOpenTuition"> 选择学杂</el-button>
      </div>

      <div style="textAlign: center;">
        <el-button :loading='submitLoading' type="primary" @click="handleSubmitCourse">确 定</el-button>
      </div>
    </el-form>

    <!-- 新增课程类别弹窗 -->
    <el-dialog title="添加课程类别"
      :visible.sync="showCategory"
      append-to-body
      width="400px"
      destroy-on-close>
      <el-form ref="categoryForm" label-width="114px">
        <el-form-item label="课程类别名称" prop="categoryName" :rules="{
          required: true, message: '请填写课程类别名称', trigger: 'blur'
        }">
          <el-input v-model="categoryName" autocomplete="off"></el-input>
        </el-form-item>
        <div style="textAlign: center; marginTop: 30px">
          <el-button :loading="loadingCategory" type="primary" @click="handleAddCategory">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 收费套餐 feeId有则是编辑，无则是新增 -->
    <fee-standard-dialog v-model="showFeeStandard" :feeId="currentFeeId" :disabled="feeDisabled" @success="handleFeeSuccess"></fee-standard-dialog>

    <!-- 选择学杂的列表 -->
    <el-dialog title="选择学杂"
      :visible.sync="showTuition"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close>
      <el-table
        ref="tuitionTable"
        :data="tuitionFeeList"
        v-loading="tuitionLoading"
        @selection-change="handleTuitionSelection">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          label="学杂名称">
        </el-table-column>
        <el-table-column
          prop="inventory"
          label="库存">
        </el-table-column>
        <el-table-column
          prop="price"
          label="单价">
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @current-change="_getTuitionFeeList"
          :current-page.sync="tuitionPageNum"
          :page-size.sync="tuitionPageSize"
          layout="total, prev, pager, next, jumper"
          :total="tuitionTotal">
        </el-pagination>
      </div>

      <div style="textAlign: center; paddingTop: 15px">
        <el-button type="primary" @click="handleSubmitTuition">确 定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FeeStandardDialog from '../feeStandard/FeeStandardDialog'

export default {
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean,
    courseId: String // 用于区分新增、编辑
  },
  data() {
    return {
      submitLoading: false,
      queryLoading: false,
      tuitionLoading: false,
      loadingCategory: false,
      showCategory: false,
      showFeeStandard: false,
      showTuition: false,
      courseForm: {
        name: '', // 课程名称
        applyAge0: 0, // 适龄
        applyAge1: 1, // 适龄
        useTemplate: 1, // 使用模板价格
        valuationType: 0, // 计价方式
        containTuition: 0, // 包括学杂
        mustTuition: 1, // 购买必须包含学杂
        giveLessonsWay: 1, // 授课方式
        saleStatus: 1, // 开始授课
        type: 0, // 类型
        supportPrepaid: 0, // 支付预付款
        prepaidPrice: null, // 预付金金额
        description: '', // 课程描述
        tuitionNum: '', // 学杂数量
        templateId: '', // 收费套餐Id
        courseCategoryId: '' // 课程分类Id
      },
      rules: {
        name: {
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (value == null || value.replace(/(^s*)|(s*$)/g, '').length === 0) {
              callback(new Error('请填写课程名称'))
            } else if (value.length > 20) {
              callback(new Error('课程名称不能超过20个字'))
            } else {
              this.validateOnlyName(value, callback)
            }
          }
        },
        prepaidPrice: [
          { required: true, message: '请输入预付金金额', trigger: 'blur' },
          { type: 'number', message: '只能输入数字', trigger: 'blur' }
        ],
        templateId: { required: true, message: '请选择收费套餐', trigger: 'blur' }
      },
      feeStandardList: [], // 收费套餐
      courseCategoryList: [], // 课程分类
      tuitionFeeList: [], // 学杂列表
      selectedTuition: [], // 选择的学杂
      selectedTuitionTemp: [], // 临时存储的学杂数据
      categoryName: '',
      currentFeeId: null, // 当前收费套餐
      feeDisabled: false, // 是否禁用
      tuitionPageNum: 1,
      tuitionPageSize: 20,
      tuitionTotal: 0
    }
  },
  components: {
    FeeStandardDialog
  },
  computed: {
    ...mapGetters([
      'currentBranch'
    ])
  },
  methods: {
    setvaluationType() {
      for (let i = 0; i < this.feeStandardList.length; i++) {
        if (this.feeStandardList[i].id === this.courseForm.templateId) {
          this.courseForm.valuationType = this.feeStandardList[i].valuationType
          break
        }
      }
    },
    // 价格模板数据
    _getFeeTemplateList(refresh) {
      if (!refresh && this.feeStandardList.length > 0) return

      this.$http.get('/v1/FeeTemplate/getFeeTemplateList', {
        belongDepartment: this.currentBranch.id,
        cancel: 0
      }).then(res => {
        this.feeStandardList = res.data
      })
    },
    // 课程类别数据
    _getCourseCategoryList(refresh) {
      if (!refresh && this.courseCategoryList.length > 0) return

      this.$http.get(`/v1/CourseCategory/getCourseCategoryList/${this.currentBranch.id}`)
        .then(res => {
          this.courseCategoryList = res.data
        })
    },
    // 获取学杂列表
    _getTuitionFeeList() {
      this.tuitionLoading = true
      this.$http.get('/v1/TuitionFee/getTuitionFeeList', {
        belongDepartment: this.currentBranch.id,
        pageNum: this.tuitionPageNum,
        pageSize: this.tuitionPageSize
      }).then(res => {
        if (res.data) {
          this.tuitionFeeList = res.data
          this.tuitionTotal = res.total
        } else {
          this.tuitionFeeList = []
        }
      }).finally(() => {
        this.tuitionLoading = false
      })
    },
    _getCourseById() {
      this.queryLoading = true
      this.$http.get('/v1/Course/getCourseById', {
        id: this.courseId
      }).then(res => {
        if (res.data) {
          for (const key in this.courseForm) {
            if (res.data.hasOwnProperty(key)) {
              this.courseForm[key] = res.data[key]
            }
          }
          if (res.data.tuitionFeeEntityList) {
            this.selectedTuition = res.data.tuitionFeeEntityList
          }
          if (res.data.applyAge && res.data.applyAge.indexOf('~') > -1) {
            let applyAge0 = res.data.applyAge.split('~')[0]
            let applyAge1 = res.data.applyAge.split('~')[1]
            this.courseForm.applyAge0 = parseInt(applyAge0) || 0
            this.courseForm.applyAge1 = parseInt(applyAge1) || 0
          }
        } else {
          this.$message.error('没有找到课程数据！')
        }
      }).finally(() => {
        this.queryLoading = false
      })
    },
    resetForm() {
      this.courseForm = {
        name: '', // 课程名称
        applyAge0: 0, // 适龄
        applyAge1: 1, // 适龄
        useTemplate: 1, // 使用模板价格
        valuationType: 0, // 计价方式
        containTuition: 0, // 包括学杂
        mustTuition: 1, // 购买必须包含学杂
        giveLessonsWay: 1, // 授课方式
        saleStatus: 1, // 开始授课
        type: 0, // 类型
        supportPrepaid: 0, // 支付预付款
        prepaidPrice: null, // 预付金金额
        description: '', // 课程描述
        tuitionNum: '', // 学杂数量
        templateId: '', // 收费套餐Id
        courseCategoryId: '' // 课程分类Id
      }
      this.selectedTuition = []

      this.$refs.courseForm && this.$refs.courseForm.clearValidate()
    },
    // 课程名字唯一验证
    validateOnlyName(value, callback) {
      this.$http.get(`/v1/Course/getCourseNameRepeatStatus/${this.currentBranch.id}/${value}`, this.courseId ? { currentCourseId: this.courseId } : {}).then(res => {
        if (res.data && res.data.repeat === true) {
          if (res.data.status !== 0) {
            callback(new Error('课程名称重复，请修改'))
          } else {
            callback(new Error('【已下架】课程名称重复，请修改'))
          }
        } else {
          callback()
        }
      })
    },
    handleAddCategory() {
      if (!this.categoryName) {
        this.$message.warning('请填写课程类别名称！')
        return
      }
      this.$refs.categoryForm.clearValidate()
      this.loadingCategory = true
      this.$http.post('/v1/CourseCategory/addCourseCategory', {
        name: this.categoryName,
        belongDepartment: this.currentBranch.id
      }).then(res => {
        this.showCategory = false
        // 刷新课程类别数据
        this._getCourseCategoryList(true)
        // 默认选上该条数据
        this.courseForm.courseCategoryId = res.data
      }).finally(() => {
        this.loadingCategory = false
      })
    },
    handleOpenFee(feeId, onlyLook) {
      this.currentFeeId = feeId
      this.feeDisabled = onlyLook
      this.showFeeStandard = true
    },
    handleFeeSuccess() {
      this._getFeeTemplateList(true)
    },
    handleTuitionSelection(val) {
      this.selectedTuitionTemp = val
    },
    handleOpenTuition() {
      this.showTuition = true
      this.tuitionPageNum = 1
      this.tuitionPageSize = 20
      this._getTuitionFeeList()
    },
    handleRemoveTuition(row) {
      const index = this.selectedTuition.findIndex(o => o.id === row.id)
      this.selectedTuition.splice(index, 1)
    },
    handleSubmitTuition() {
      if (this.selectedTuitionTemp.length === 0) {
        this.$message.warning('请选择需要包含的学杂！')
        return
      }
      this.selectedTuitionTemp.forEach(item => {
        item.tuitionNum = ''
        if (!this.selectedTuition.find(o => o.id === item.id)) {
          this.selectedTuition.push(item)
        }
      })
      this.showTuition = false
    },
    handleSubmitCourse() {
      this.setvaluationType()
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.courseForm)
          if (!params.applyAge0) {
            params.applyAge0 = 1
          }
          if (!params.applyAge1) {
            params.applyAge1 = 1
          }
          params.applyAge = params.applyAge0 + '~' + params.applyAge1
          if (params.containTuition) {
            params.courseTuitionEntityList = this.selectedTuition.map(o => {
              o.tuitionId = o.id
              return o
            })
          }
          params.belongDepartment = this.currentBranch.id
          this.submitLoading = true
          if (this.courseId) {
            // 编辑
            params.id = this.courseId
            this.$http.put('/v1/Course/updateCourse', params).then(res => {
              this.$emit('toggle', false)
              this.$emit('success')
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 新增
            params.status = 1 // 默认是已上架
            this.$http.post('/v1/Course/addCourse', params).then(res => {
              this.$emit('toggle', false)
              this.$emit('success')
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    }
  },
  watch: {
    value(val) {
      if (val) {
        // 获取页面基础数据
        this._getFeeTemplateList()
        this._getCourseCategoryList()

        // 重置表单数据
        this.resetForm()
        if (this.courseId) {
          this._getCourseById()
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.form-tip
  font-size 13px
  color $color-text-3
  line-height 1
  margin-top 6px
</style>

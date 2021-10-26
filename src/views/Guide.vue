<template>
  <div class="guide-wrapper">
    <header class="guide-header">
      <img class="logo" src="@/assets/logo.png" alt="桃李云帮"/>
      <p class="title">创建学校</p>
      <div class="header-right">
        <span class="username">{{userInfo && userInfo.username}}</span>
        <span class="exit-btn" @click="$store.dispatch('logout')">退出</span>
      </div>
    </header>

    <el-steps :active="currentStep" finish-status="success" align-center>
      <template v-if="schoolType === 2">
        <el-step title="选择学校类型"></el-step>
        <el-step title="填写机构信息"></el-step>
        <el-step title="添加校区"></el-step>
        <el-step title="完成"></el-step>
      </template>
      <template v-else>
        <el-step title="选择学校类型"></el-step>
        <el-step title="填写机构信息"></el-step>
        <el-step title="完成"></el-step>
      </template>
    </el-steps>

    <transition name="el-fade-in">
      <div v-if="currentStep === 0" class="step0">
        <div class="step-card">
          <div class="card-top">
            <p class="card-title">单个校区</p>
            <p class="card-desc">适用于有<span>一家校区</span>的教育机构<br>支持升级为多个连锁校区</p>
            <el-button type="primary" @click="nextStep(1)" :loading="nextLoading">单个校区</el-button>
          </div>
          <ul class="function-list">
            <li>
              <img src="@/assets/guide_goods.png"/>
              <p>校区数据独立配置</p>
            </li>
            <li>
              <img src="@/assets/guide_orders.png"/>
              <p>校区收入直接入账</p>
            </li>
          </ul>
        </div>
        <div class="step-card">
          <div class="card-top">
            <p class="card-title">多个校区</p>
            <p class="card-desc">适用于有<span>多个校区</span>的连锁教育机构</p>
            <el-button type="primary" @click="nextStep(2)" :loading="nextLoading">多个校区</el-button>
          </div>
          <ul class="function-list">
            <li>
              <img src="@/assets/guide_goods.png"/>
              <p>总部统一管理查看各校区数据，校区可独立管理</p>
            </li>
            <li>
              <img src="@/assets/guide_orders.png"/>
              <p>校区收入统一入账，归集到总部账户</p>
            </li>
          </ul>
        </div>
      </div>
      <el-form v-else-if="currentStep === 1" :model="orgForm" :rules="orgRules" ref="orgForm" hide-required-asterisk label-width="100px" class="step1">
        <el-form-item prop="name" label="机构名称">
          <el-input v-model="orgForm.name" placeholder="请填写机构名称"/>
        </el-form-item>
        <el-form-item prop="username" label="负责人姓名">
          <el-input v-model="orgForm.username" placeholder="请填写负责人姓名"/>
        </el-form-item>
        <el-form-item prop="phone" label="负责人电话">
          <el-input v-model="orgForm.phone" placeholder="请填写负责人电话"/>
        </el-form-item>
        <template v-if="schoolType === 1">
          <!-- 单校区的校区信息 -->
          <el-form-item prop="province" label="机构地址">
            <area-select v-model="orgForm.province" placeholder="请选择机构总部所在省市区"/>
          </el-form-item>
          <el-form-item prop="address">
            <el-input v-model="orgForm.address" placeholder="请填写详细地址"/>
            <el-button @click="toPOISelect" style="margin-left: 12px;">地图检索</el-button>
          </el-form-item>
          <el-form-item prop="longitude">
            <el-input :value="orgForm.longitude ? orgForm.longitude + ',' + orgForm.latitude : ''" placeholder="机构总部经纬度" disabled/>
          </el-form-item>
        </template>
        <el-form-item >
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :loading="nextLoading">确定提交</el-button>
        </el-form-item>
      </el-form>
      <div v-else-if="schoolType === 2 && currentStep === 2" class="step2">
        <ul class="branch-list">
          <li class="branch-title">校区列表</li>
          <li v-for="item in branchList" :key="item.id" class="branch-item" :class="{active: currentBranch === item.id}" @click="handleUpdateBranch(item)">{{item.name}}</li>
          <li class="branch-item empty-branch" :class="{active: currentBranch == null}" @click="handleNewBranch">
            <i class="el-icon-plus" />
          </li>
        </ul>
        <el-form :model="branchForm" :rules="orgRules" ref="branchForm" hide-required-asterisk label-width="100px">
          <el-form-item prop="name" label="校区名称">
            <el-input v-model="branchForm.name" placeholder="请填写校区名称"/>
          </el-form-item>
          <el-form-item prop="username" label="负责人姓名">
            <el-input v-model="branchForm.username" placeholder="请填写负责人姓名"/>
          </el-form-item>
          <el-form-item prop="phone" label="负责人电话">
            <el-input v-model="branchForm.phone" placeholder="请填写负责人电话" :disabled="branchForm.id"/>
            <el-popover
              v-show="branchForm.id"
              width="200"
              trigger="hover"
              content="校区负责人不允许在引导页修改。进去系统过后，可在【基础信息】 -> 【校区信息】里面修改。"
            >
              <i slot="reference" class="el-icon-question color-warning" style="font-size: 18px; margin-left: 12px;"/>
            </el-popover>
          </el-form-item>
          <el-form-item prop="servicePhone" label="服务电话">
            <el-input v-model="branchForm.servicePhone" placeholder="请填写服务电话"/>
          </el-form-item>
          <el-form-item prop="category" label="校区类型">
            <el-select v-model="branchForm.category" placeholder="请选择校区类型">
              <el-option
                v-for="item in branchCategory"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="province" label="机构地址">
            <area-select v-model="branchForm.province" placeholder="请选择校区所在省市区"/>
          </el-form-item>
          <el-form-item prop="address">
            <el-input v-model="branchForm.address" placeholder="请填写详细地址"/>
            <el-button @click="toPOISelect" style="margin-left: 12px;">地图检索</el-button>
          </el-form-item>
          <el-form-item prop="longitude">
            <el-input :value="branchForm.longitude ? branchForm.longitude + ',' + branchForm.latitude : ''" placeholder="校区经纬度" disabled/>
          </el-form-item>
          <el-form-item style="text-align: center;">
            <el-button type="primary" @click="handleSubmitBranch" :loading="nextLoading" style="margin-left: -88px;">保存该校区</el-button>
          </el-form-item>
          <el-form-item style="text-align: center;">
            <el-button @click="prevStep" style="margin-left: -88px;">上一步</el-button>
            <el-button @click="nextStep" :loading="nextLoading">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="(schoolType === 1 && currentStep === 2) || (schoolType === 2 && currentStep === 3)" class="step3">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="submitProgress" status="success"></el-progress>
      </div>
    </transition>

    <poi-select v-model="showPOISelect" @select="handlePOISelect" :address="orgForm.address" :city="orgForm.province[1]"/>
  </div>
</template>

<script>
import AreaSelect from '../components/AreaSelect'
import POISelect from '../components/POISelect'

import { phoneValidator } from '../utils/validate'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      nextLoading: false,
      currentStep: 0,
      schoolType: null,
      showPOISelect: false,
      branchCategory: [],
      currentBranch: null,
      orgForm: {
        name: '',
        username: '',
        phone: '',
        province: [],
        address: '',
        latitude: '',
        longitude: ''
      },
      orgRules: {
        name: [
          { required: true, message: '请填写机构/校区名称', trigger: 'blur' },
          { max: 20, message: '机构/校区名称太长', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请填写负责人姓名', trigger: 'blur' },
          { max: 12, message: '负责人姓名太长', trigger: ['blur', 'change'] }
        ],
        phone: [
          { required: true, message: '请填写负责人电话号码', trigger: 'blur' },
          { validator: phoneValidator, message: '请填写正确的电话号码', trigger: 'blur' }
        ],
        servicePhone: [
          { required: true, message: '请填写服务电话', trigger: 'blur' },
          { max: 20, message: '服务电话最多20位', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择校区类型', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请选择省市区', trigger: ['blur', 'change'] }
        ],
        address: [
          { required: true, message: '请填写机构详细地址', trigger: ['blur', 'change'] }
        ],
        latitude: [
          { required: true, message: '请填写机构经纬度', trigger: ['blur', 'change'] }
        ]
      },
      branchForm: {
        name: '',
        username: '',
        phone: '',
        servicePhone: '',
        category: '',
        province: [],
        address: '',
        latitude: '',
        longitude: ''
      },
      branchList: [], // 分校列表
      submitProgress: 0 // 提交进度
    }
  },
  components: {
    AreaSelect,
    [POISelect.name]: POISelect
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  created() {
    this._getCurrentStep()
    this.orgForm.phone = this.userInfo && this.userInfo.phone
    // this.orgForm.username = this.userInfo.username
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    _getCurrentStep() {
      this.$http.get('/v1/RegisterStep/getCurrentUserStep').then(async (res) => {
        if (res.data) {
          if (res.data.finish) {
            // 跳转首页
            const redirect = this.$route.query && this.$route.query.redirect
            this.$router.replace({
              path: redirect || '/'
            })
            return
          }
          this.currentStep = res.data.currentStep
          this.schoolType = res.data.type
          if (this.currentStep >= 2) {
            // 获取机构信息
            await this._getOrgInfo()
            if (this.currentStep === 2) {
              // 获取所有分校
              await this._getBranchList()
              await this._getBranchCategory()
            }
          }
        }
      })
    },
    _getBranchCategory() {
      this.$http.get('/v1/dictionary/DicOrganizationCategory/getAll', {
        type: 0
      }).then(res => {
        this.branchCategory = res.data
      })
    },
    _getBranchList() {
      this.$http.get('/v1/Department/getDepartmentList', {
        type: 1,
        organizationId: this.orgForm.id
      }).then(res => {
        res.data.forEach(item => {
          if (item.province) {
            item.province = item.province ? item.province.split(';') : []
          }
        })
        this.branchList = res.data
      })
    },
    _getOrgInfo() {
      return new Promise((resolve, reject) => {
        this.$http.get('/v1/Organization/organizationByUser').then(res => {
          resolve(res.data)
          if (res.data) {
            res.data.province = res.data.province ? res.data.province.split(';') : []
            this.orgForm = res.data
          }
        })
      })
    },
    _nextStep(params) {
      return this.$http.post('/v1/RegisterStep/updateCurrentStep', null, {
        params: {
          currentStep: this.currentStep + 1,
          type: params
        }
      })
    },
    prevStep() {
      this.currentStep--
    },
    async nextStep(type) {
      this.nextLoading = true
      try {
        switch (this.currentStep) {
          case 0:
            // 选择单/多校区
            this.schoolType = type
            await this._nextStep(type)
            break
          case 1:
            // 填写机构信息
            const valid = await new Promise((resolve, reject) => {
              this.$refs.orgForm.validate(valid => {
                resolve(valid)
              })
            })
            if (!valid) {
              this.nextLoading = false
              return
            }
            const params = {
              type: this.schoolType,
              name: this.orgForm.name,
              username: this.orgForm.username,
              phone: this.orgForm.phone
            }
            // 单校区时，把地址信息传过去
            if (this.schoolType === 1) {
              params.address = this.orgForm.address
              params.longitude = this.orgForm.longitude
              params.latitude = this.orgForm.latitude
              params.province = this.orgForm.province.join(';')
            }
            if (this.orgForm.id) {
              // 修改
              params.id = this.orgForm.id
              await this.$http.put('/v1/Organization/updateOrganization', params)
            } else {
              // 新增
              const res = await this.$http.post('/v1/Organization/addOrganization', params)
              this.orgForm.id = res.data
            }
            await this._nextStep()
            if (this.schoolType === 2) {
              // 多校区的时候，查询校区分类
              this._getBranchCategory()
            }
            break
          case 2:
            // 点击校区下一步
            this.nextLoading = false
            if (this.orgForm.id == null) {
              this.$message.warning('系统错误，请刷新页面！')
              return
            }
            if (this.branchList.length === 0) {
              this.$message.warning('您当前还未添加任何校区')
              return
            }
            if (this.branchForm.id == null && this.branchForm.name !== '') {
              this.$message.warning('您当前校区还未保存，请先提交保存！')
              return
            }
            break
          case 3:
            return
        }
        this.currentStep++
        // 去完成
        if ((this.schoolType === 1 && this.currentStep === 2) || (this.schoolType === 2 && this.currentStep === 3)) {
          // 假的进度
          this.timer = setInterval(() => {
            const num = Number((5 + Math.random() * 10).toFixed(1))
            if (this.submitProgress + num >= 100) {
              this.submitProgress = 99
            } else {
              this.submitProgress = Number((this.submitProgress + num).toFixed(1))
            }
          }, 800)

          // 完成时，返回机构、校区信息
          const finishInfo = await this.$http.get('/v1/RegisterStep/finishedRegister', null, { timeout: 45 * 1000 })
          clearInterval(this.timer)
          this.submitProgress = 100
          setTimeout(() => {
            this.$store.dispatch('setInitInfo', finishInfo.data)
            // 跳转首页
            const redirect = this.$route.query && this.$route.query.redirect
            this.$router.replace({
              path: redirect || '/'
            })
          }, 500)
        }
      } catch (error) {

      }
      this.nextLoading = false
    },
    toPOISelect() {
      if ((this.currentStep === 1 && this.orgForm.province.length === 0) || (this.currentStep !== 1 && this.branchForm.province.length === 0)) {
        this.$message.warning('请先选择省市区')
        return
      }
      this.showPOISelect = true
    },
    handlePOISelect(res) {
      if (res) {
        let address = res.address
        if (this.currentStep === 1) {
          if (this.orgForm.province.length > 0 && res.address.indexOf(this.orgForm.province.join('')) > -1) {
            address = res.address.split(this.orgForm.province.join(''))[1]
          }
          this.orgForm.address = address
          this.orgForm.latitude = res.latitude
          this.orgForm.longitude = res.longitude
        } else {
          if (this.branchForm.province.length > 0 && res.address.indexOf(this.branchForm.province.join('')) > -1) {
            address = res.address.split(this.branchForm.province.join(''))[1]
          }
          this.branchForm.address = address
          this.branchForm.latitude = res.latitude
          this.branchForm.longitude = res.longitude
        }
      }
    },
    handleSubmitBranch() {
      // 添加校区
      this.$refs.branchForm.validate(async (valid) => {
        if (valid) {
          const params = {
            type: 1,
            organizationId: this.orgForm.id,
            pid: this.orgForm.id,
            name: this.branchForm.name,
            username: this.branchForm.username,
            phone: this.branchForm.phone,
            servicePhone: this.branchForm.servicePhone,
            category: this.branchForm.category,
            address: this.branchForm.address,
            longitude: this.branchForm.longitude,
            latitude: this.branchForm.latitude,
            province: this.branchForm.province.join(';')
          }
          try {
            if (this.branchForm.id) {
              // 修改校区信息
              params.id = this.branchForm.id
              await this.$http.put('/v1/Department/naviPageUpdateDepartment', params)
              const index = this.branchList.findIndex(o => o.id === params.id)
              this.branchList.splice(index, 1, this.branchForm)
              this.$message.success('修改校区成功！')
            } else {
              // 添加校区信息
              const res = await this.$http.post('/v1/Department/naviPageAddDepartment', params)
              this.branchList.push(Object.assign({}, this.branchForm, { id: res.data }))
              this.$message.success('添加校区成功！')
            }
            this.handleNewBranch()
          } catch (error) {
          }
        }
      })
    },
    handleUpdateBranch(item) {
      this.branchForm = JSON.parse(JSON.stringify(item))
      this.currentBranch = item.id
    },
    handleNewBranch() {
      this.branchForm = {
        name: '',
        username: '',
        phone: '',
        servicePhone: '',
        category: '',
        province: [],
        address: '',
        latitude: '',
        longitude: ''
      }
      this.$refs.branchForm && this.$refs.branchForm.resetFields()
      this.currentBranch = null
    }
  }
}
</script>

<style lang="stylus" scoped>
.guide-wrapper
  width 1000px
  margin 0 auto

.guide-header
  font-size 16px
  padding 16px 10px 0
  border-bottom 1px solid #dddddd
  margin-bottom 32px
  .logo
    height 45px
    vertical-align bottom
  .title
    display inline-block
    margin 0
    margin-left 50px
    height 40px
    line-height 40px
    color #333
    border-bottom 2px solid $color-primary
  .header-right
    float right
    font-size 14px
    color #666
    height 40px
    line-height 52px
    .exit-btn
      display inline-block
      height 100%
      color $color-primary
      padding-left 12px
      cursor pointer

.el-steps
  margin-bottom 32px

.step0
  display flex
  justify-content center
.step-card
  width 288px
  border-radius 3px
  border 1px solid $color-border-2
  box-sizing border-box
  overflow hidden
  box-shadow 0 0 6px $color-border-1
  &+.step-card
    margin-left 70px
  .card-top
    background $color-background
    text-align center
    padding 32px 16px
  .card-title
    font-size 16px
    color $color-text-1
    font-weight bold
    margin-bottom 24px
  .card-desc
    font-size 14px
    color $color-text-1
    line-height 1.5
    height 42px
    span
      color $color-warning
      margin 0 6px
  .el-button
    width 140px
    margin-top 16px
  .function-list
    padding 20px 24px
    background #ffffff
    min-height 180px
    li
      display flex
      align-items flex-start
      align-items center
      height 63px
      &+li
        margin-top 16px
    img
      width 32px
      margin-right 20px
    p
      font-size 14px
      width 100%
      line-height 1.5

.step1
  width 480px
  margin 0 auto
  .el-input, .el-cascader, .el-select
    width 280px !important

.step2
  position relative
  .branch-list
    width 180px
    margin 0
    padding 0
    position absolute
    left 80px
    top 0
  .branch-title
    font-size 16px
    color $color-primary
    text-align center
    margin-bottom 16px
  .branch-item
    border 1px solid $color-border-2
    height 32px
    line-height 32px
    padding 0 12px
    cursor pointer
    background #fff
    no-wrap()
    &+.branch-item
      border-top none
  .empty-branch
    text-align center
  .active
      background rgba($color-primary, 0.15)
  .el-form
    width 480px
    margin 0 auto
    padding-left 60px
  .el-input, .el-cascader, .el-select
    width 280px !important

.step3
  width 480px
  margin 0 auto
  padding-top 140px
</style>

<style lang="stylus">
.guide-wrapper
  .el-step__title
    font-size 14px
  .is-process
    color $color-primary
    border-color $color-primary
</style>

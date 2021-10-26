<!-- 学杂管理 -->
<template>
  <div class="tuition-wrapper">
    <el-button style="float: right" icon="el-icon-plus" type="primary" class="semester-table-btn" @click="handleOpenTuitionForm()">添加学杂</el-button>

    <el-table
      :data="tuitionList"
      v-loading="loadingQuery"
      style="width: 100%">
      <el-table-column
        prop="name"
        label="学杂名称">
      </el-table-column>
      <el-table-column
        prop="inventory"
        label="库存剩余">
      </el-table-column>
      <el-table-column
        prop="price"
        label="单价">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="180"
        align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleOpenRecord(scope.row)">变更记录</el-button>
          <el-button type="text" @click="handleOpenInventory(scope.row)">入库</el-button>
          <el-button type="text" @click="handleOpenTuitionForm(scope.row)">编辑</el-button>
          <el-button type="text" @click="deleteTuition(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="bottom-pagination">
      <el-pagination
        @size-change="query"
        @current-change="_getTuitionList"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>

    <!-- 新增、编辑 -->
    <el-dialog :title="tuitionForm.id ? '编辑学杂信息' : '添加学杂'" custom-class="custom-dialog" :visible.sync="showTuitionForm" width='400px'>
      <el-form :model="tuitionForm" :rules="rules" ref="tuitionForm" label-width="100px" style="width: 340px">
        <el-form-item label="学杂名称" prop="name">
          <el-input v-model="tuitionForm.name" placeholder="请输入学杂名称" :maxlength="30" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="出售单价" prop="price">
          <el-input-number  v-model="tuitionForm.price" controls-position="right" :min="1"  :max="99999999" :precision="2" style="width: 210px"></el-input-number>
          元
        </el-form-item>
        <template v-if="tuitionForm.id == null">
          <el-form-item label="库存数量" prop="inventory">
            <el-input-number v-model="tuitionForm.inventory" controls-position="right" :min="1"  :max="99999999" :precision="0" style="width: 210px"></el-input-number>
          </el-form-item>
          <el-form-item label="购买总价" prop="totalAmount">
            <el-input-number v-model="tuitionForm.totalAmount" controls-position="right" :min="1"  :max="99999999" :precision="2" style="width: 210px"></el-input-number>
            元
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="tuitionForm.remark" type="textarea" placeholder="请输入备注。(最多30个字)" :maxlength="30"></el-input>
          </el-form-item>
        </template>
        <div style="text-align: center;">
          <el-button :loading='loadingSubmit' type="primary" @click="handleSubmit()">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 入库 -->
    <el-dialog title="入库" custom-class="custom-dialog" :visible.sync="showAddInventory" width='400px'>
      <el-form :model="inventoryForm" :rules="inventoryRules" ref="inventoryForm" label-width="100px" style="width: 340px">
        <el-form-item label="学杂名称" prop="tuitionName">
          <el-input v-model="inventoryForm.tuitionName" disabled  autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="入库数量" prop="inventory">
          <el-input-number v-model="inventoryForm.inventory" controls-position="right" :min="1"  :max="99999999" :precision="0" style="width: 210px"></el-input-number>
        </el-form-item>
        <el-form-item label="购买总价" prop="price">
          <el-input-number v-model="inventoryForm.price" controls-position="right" :min="1"  :max="99999999" :precision="2" style="width: 210px"></el-input-number>
          元
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="inventoryForm.remark" type="textarea" placeholder="请输入备注。(最多30个字)" :maxlength="30"></el-input>
        </el-form-item>
        <div style="text-align: center;">
          <el-button :loading='loadingSubmit' type="primary" @click="handleAddInventory()">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 变更记录 -->
    <el-dialog title="变更记录" custom-class="custom-dialog" :visible.sync="showRecord" top="6vh">
      <el-table
        :data="tuitionRecord"
        v-loading="loadingQueryRecord"
        style="width: 100%">
        <el-table-column
          prop="type"
          label="类型"
          width="80"
          align="center">
          <el-tag slot-scope="scope" :type="scope.row.type === 1 ? 'danger' : 'success'">{{scope.row.type === 1 ? '出库' : '入库'}}</el-tag>
        </el-table-column>
        <el-table-column
          prop="num"
          label="数量"
          width="100"
          align="center">
        </el-table-column>
        <el-table-column
          prop="price"
          label="总计价格"
          width="120">
          <template slot-scope="scope">{{scope.row.price}}元</template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注">
          <template slot-scope="scope">{{scope.row.remark || '---'}}</template>
        </el-table-column>
        <el-table-column
          prop="createAt"
          label="变更时间"
          width="148"
          align="center">
        </el-table-column>
      </el-table>

      <div class="bottom-pagination">
        <el-pagination
          @size-change="queryRecord"
          @current-change="_getRecordList"
          :current-page.sync="recordPageNum"
          :page-size.sync="recordPageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next"
          :total="recordTotal">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TuitionFee',
  data () {
    return {
      showTuitionForm: false, // 学杂表单
      showAddInventory: false, // 入库表单
      showRecord: false,
      loadingQuery: false,
      loadingSubmit: false,
      loadingQueryRecord: false,
      tuitionList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      tuitionForm: {
        id: null,
        name: '', // 分类名称
        price: '', // 单价
        inventory: 0,
        totalAmount: 0, // 入库总价
        remark: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入学杂名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        inventory: { required: true, message: '请填写库存数量', trigger: 'blur' },
        price: { required: true, message: '请输入出售单价', trigger: 'blur' },
        totalAmount: { required: true, message: '请输入入库总价', trigger: 'blur' }
      },
      inventoryForm: {
        tuitionId: null,
        tuitionName: '',
        inventory: 0,
        price: '',
        remark: ''
      },
      inventoryRules: {
        inventory: { required: true, message: '请填写库存数量', trigger: 'blur' },
        price: { required: true, message: '请输入总入库价格', trigger: 'blur' }
      },
      // 变更记录
      tuitionRecord: [],
      recordPageNum: 1,
      recordPageSize: 10,
      recordTotal: 0
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo', // 机构信息
      'currentBranch' // 当前切换学校
    ])
  },
  created () {
    this._getTuitionList()
  },
  mounted () {},
  methods: {
    // 获取信息
    _getTuitionList() {
      if (this.currentBranch == null) {
        this.$message.warning('请选择校区')
        return
      }
      this.loadingQuery = true
      this.$http.get('/v1/TuitionFee/getTuitionFeeList', {
        belongDepartment: this.currentBranch.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(res => {
        this.tuitionList = res.data
        this.total = res.total
      }).finally(() => {
        this.loadingQuery = false
      })
    },
    // 获取学杂变更记录
    _getRecordList() {
      this.loadingQueryRecord = true
      this.$http.get('/v1/tuitionInventoryRecord/tuitionInventoryRecord/' + this.selectTuition.id, {
        pageNum: this.recordPageNum,
        pageSize: this.recordPageSize
      }).then(res => {
        this.tuitionRecord = res.data
        this.recordTotal = res.total
      }).finally(() => {
        this.loadingQueryRecord = false
      })
    },
    query() {
      this.pageNum = 1
      this._getTuitionList()
    },
    queryRecord() {
      this.recordPageNum = 1
      this._getRecordList()
    },
    handleOpenTuitionForm(row) {
      this.showTuitionForm = true
      this.tuitionForm = {
        id: null,
        name: '', // 分类名称
        price: '', // 单价
        inventory: 0,
        totalAmount: 0, // 入库总价
        remark: ''
      }
      if (row) {
        this.tuitionForm.id = row.id
        this.tuitionForm.name = row.name
        this.tuitionForm.price = row.price
      }
    },
    // 删除学杂
    deleteTuition(row) {
      this.$confirm('删除 【' + row.name + '】学杂，使用【' + row.name + '】学杂的“课程管理”等板块都将受到影响，是否确定删除?', '删除', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        this.$http.delete('/v1/TuitionFee/deleteByIds', {
          ids: row.id
        }).then(res => {
          this.$message.success('删除成功~')
          this._getTuitionList()
        })
      })
    },
    // 编辑/新增提交
    handleSubmit() {
      this.$refs.tuitionForm.validate((valid) => {
        if (valid) {
          this.loadingSubmit = true
          if (this.tuitionForm.id) {
            // 编辑
            this.$http.put('/v1/TuitionFee/updateTuitionFee', {
              id: this.tuitionForm.id,
              name: this.tuitionForm.name,
              price: this.tuitionForm.price
            }).then(res => {
              this._getTuitionList()
              this.showTuitionForm = false
            }).finally(() => {
              this.loadingSubmit = false
            })
          } else {
            // 添加
            let params = Object.assign({}, this.tuitionForm)
            params.belongDepartment = this.currentBranch.id
            this.$http.post('/v1/TuitionFee/addTuitionFee', params).then(res => {
              this.showTuitionForm = false
              this._getTuitionList()
            }).finally(() => {
              this.loadingSubmit = false
            })
          }
        }
      })
    },
    handleOpenInventory(row) {
      this.inventoryForm = {
        tuitionName: '',
        tuitionId: null,
        inventory: 0,
        price: '',
        remark: ''
      }
      this.inventoryForm.tuitionId = row.id
      this.inventoryForm.tuitionName = row.name
      this.showAddInventory = true
    },
    // 入库提交
    handleAddInventory() {
      this.$refs.inventoryForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          this.$http.put('/v1/TuitionFee/addTuitionInventory', null, { params: this.inventoryForm }).then(() => {
            this.$message.success('入库成功！')
            this._getTuitionList()
            this.showAddInventory = false
          }).finally(() => {
            this.loadingSubmit = false
          })
        }
      })
    },
    handleOpenRecord(row) {
      this.recordPageNum = 1
      this.recordPageSize = 10
      this.recordTotal = 0
      this.tuitionRecord = []
      this.selectTuition = Object.assign({}, row)
      this._getRecordList()
      this.showRecord = true
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.tuition-wrapper {
  background #fff
  padding 15px
  .semester-table-btn {
    margin-bottom 10px
    // color #ff6600
    display inline-block
    // font-weight bold
    cursor default
  }
}
</style>

<style lang="stylus">

</style>

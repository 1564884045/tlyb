<template>
  <el-dialog
    title="选择学杂"
    :visible="value"
    :close-on-click-modal="false"
    @open="reset"
    @close="$emit('toggle', false)"
    top="8vh"
    append-to-body
    custom-class="select-tuition-dialog">
    <div class="query-form">
      <el-input v-model="name" :max="30" placeholder="请输入学杂名称" @keyup.native.enter="query" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
    </div>
    <el-table
      ref="table"
      :data="tuitionList"
      v-loading="loading"
      height="360px"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
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
        label="库存余量">
      </el-table-column>
      <el-table-column
        prop="price"
        label="单价">
        <span slot-scope="scope">{{'￥' + scope.row.price}}</span>
      </el-table-column>
      <p slot="empty">暂无数据，去<router-link class="link" to="/educational/course" style="margin-left: 6px;">添加学杂</router-link></p>
    </el-table>
    <div class="bottom-pagination">
      <el-pagination
        @size-change="query"
        @current-change="_getTuitionList"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <div class="footer-btns" slot="footer">
      <p>已选中 <span>{{selectedTuition.length}}</span> 个</p>
      <div>
        <el-button @click="$emit('toggle', false)">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SelectTuitionDialog',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: Boolean
  },
  data() {
    return {
      loading: false,
      name: '',
      tuitionList: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      selectedTuition: []
    }
  },
  computed: {
    ...mapGetters([
      'currentBranch'
    ])
  },
  created() {
    this._getTuitionList()
  },
  methods: {
    _getTuitionList() {
      this.loading = true
      this.$http.get('/v1/TuitionFee/getTuitionFeeList', {
        belongDepartment: this.currentBranch.id,
        name: this.name,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(res => {
        this.tuitionList = res.data
        this.total = res.total
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getTuitionList()
    },
    reset() {
      this.name = ''
      this.$refs.table && this.$refs.table.clearSelection()
      // this.query()
    },
    handleSelectionChange(val) {
      this.selectedTuition = val
    },
    submit() {
      if (this.selectedTuition.length === 0) {
        this.$message.warning('请选择学杂！')
        return
      }
      this.$emit('submit', this.selectedTuition.concat([]))
      this.$emit('toggle', false)
    }
  }
}
</script>

<style lang='stylus'>
.select-tuition-dialog
  .el-dialog__body, .el-dialog__footer
    padding 0 20px
  .query-form
    padding 0
    .input-with-select
      width 180px
      margin-right 16px
    .inline-select
      margin-right 16px
    .el-radio-group
      margin 0
  .footer-btns
    display flex
    justify-content space-between
    border-top 1px solid $color-border-1
    padding 12px 0
    margin-top 16px
    align-items center
    p span
      color $color-primary
</style>
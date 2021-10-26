// 意见反馈
<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <!-- 类型下拉菜单 -->
      <div class="head">
        <el-dropdown>
          <span class="el-dropdown-link">
            类型<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>新需求</el-dropdown-item>
            <el-dropdown-item>系统bug</el-dropdown-item>
            <el-dropdown-item>建议</el-dropdown-item>
            <el-dropdown-item>其他</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- 新增对话框 -->
        <el-button type="primary" @click="showDialog" class="position" icon="el-icon-plus">新增</el-button>
      </div>
      <!-- 对话框主体区域 -->
      <el-dialog title="新增" :visible.sync="dialogVisible" width="580px">
        <el-form :model="adviceForm" :rules="rules" ref="adviceForm" label-width="100px">
          <el-form-item label="反馈类型">
            <el-select v-model="Form.region">
              <el-option label="新需求" value="0"></el-option>
              <el-option label="系统bug" value="1"></el-option>
              <el-option label="建议" value="2"></el-option>
              <el-option label="其他" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form :model="addUserAdvice" :rules="addUserAdviceRules" ref="addUserAdviceRef" label-width="100px" class="demo-ruleForm">
            <el-form-item label="反馈">
              <el-input v-model="addUserAdvice.cat_name" type="textarea" rows="5" placeholder="请输入反馈内容" maxlength="120" show-word-limit></el-input>
            </el-form-item>
          </el-form>
        </el-form>
      </el-dialog>     
    </el-header>
    <el-main>Main</el-main>
    <!-- 实现分页效果 -->
    <el-footer>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      dialogFormVisible: false,
      form: {
        name: null,
        region: null
      },
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize:2
      },
      userlist: [],
      total: 0,
      // 控制添加分类对话框的显示与隐藏
      dialogVisible: false,
      // 添加用户建议的验证规则对象
      addUserAdviceRules: {
        cat_name: [
          { required: true, message: '请输入反馈内容', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 监听 pageSizeChange 改变的事件
    handleSizeChange() {
      console.log(newSize)
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
    },
    // 点击按钮，展示 新增 对话框
    showDialog() {
      this.dialogVisible = true
    },
  }
}
</script>

<style lang="stylus" scoped>
.head
  background-color #fff
  padding 12px
  display flex
  justify-content space-between
  align-items center
</style>
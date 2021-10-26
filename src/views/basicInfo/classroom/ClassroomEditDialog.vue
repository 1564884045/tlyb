<template>
  <el-dialog
    :title="formData.id ? '修改教室' : '新增教室'"
    width="480px"
    :visible="visible"
    @close="toggle(false)"
    :close-on-click-modal="false"
    append-to-body
    top="5vh">
    <div style="display: flex; justify-content: center;">
      <el-form :model="formData" ref="formEdit" :rules="editFormRules" label-width="80px">
        <el-form-item label="教室名称" prop="name" >
          <el-input v-model="formData.name" :maxlength="30" autocomplete="off" :style="{ width: formInputWidth }" placeholder="请输入教室名称"></el-input>
        </el-form-item>
        <el-form-item label="教室容量" prop="volume" >
          <el-input-number v-model="formData.volume" controls-position="right" :min="0" :max="5000" :style="{ width: formInputWidth }"></el-input-number>
          <el-popover
              width="200"
              trigger="hover"
            >
            <span>教室可容纳的学生人数，将用于排课。</span>
            <i slot="reference" class="el-icon-question color-warning" style="font-size: 18px; margin-left: 12px;"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="教室状态" prop="status" >
          <el-select v-model="formData.status" placeholder="请选择教室状态" :style="{ width: formInputWidth }">
            <el-option label="可用" :value="0"></el-option>
            <el-option label="装修" :value="1"></el-option>
            <el-option label="废弃" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer" style="text-align: center">
      <el-button @click="handleCancel">取&nbsp;消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提&nbsp;交</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import lodash from 'lodash'
const rules = {
  name: [
    { required: true, message: '请输入教室名称', trigger: 'blur' },
    { type: 'string', min: 2, max: 16, message: '长度在2至16位', trigger: 'blur' }
  ],
  volume: [
    { required: true, message: '请输入教室容量', trigger: 'blur' },
    { type: 'number',
      required: true,
      validator: (rule, value, callback) => {
        if (value < 1) {
          callback(new Error('教室容量不能小于1'))
        } else {
          callback()
        }
      },
      trigger: 'blur' }
  ],
  status: [
    { type: 'number', required: true, message: '请选择教室状态', tigger: 'blur' }
  ]
}

const dataMold = {
  id: '',
  name: '',
  status: null,
  volume: 0
}

export default {
  name: 'ClassroomEditDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: Object
  },
  watch: {
    visible(val) {
      // 弹进修改页面的时候，清除验证状态, 弹进新增页面的时候，重置表单
      if (val && this.data && this.$refs['formEdit']) {
        this.data.id
          ? this.$refs['formEdit'].clearValidate()
          : this.$refs['formEdit'].resetFields()
      }
    },
    data: {
      handler: function(val) {
        if (val && val.id) {
          let tmpData = lodash.cloneDeep(val)
          Object.keys(dataMold).forEach(item => {
            this.formData[item] = tmpData[item]
          })
        } else {
          this.formData = lodash.cloneDeep(dataMold)
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      submitLoading: false,
      formInputWidth: '200px',
      formData: lodash.cloneDeep(dataMold),
      editFormRules: rules
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  methods: {
    addData(formData) {
      let params = Object.assign({}, formData, { departmentId: this.currentBranch.id })
      this.submitLoading = true
      this.$http.post('/v1/Classroom/addClassroom', params)
        .then(res => {
          this.$message.success('教室数据新增成功')
          this.$emit('success')
        })
        .finally(() => {
          this.$emit('toggle', false)
          this.submitLoading = false
        })
    },
    updateData(formData) {
      let params = Object.assign({}, formData, { departmentId: this.currentBranch.id })
      this.submitLoading = true
      this.$http.put('/v1/Classroom/updateClassroom', params)
        .then(res => {
          this.$message.success('教室数据修改成功')
          this.$emit('success')
        })
        .finally(() => {
          this.$emit('toggle', false)
          this.submitLoading = false
        })
    },
    handleReset(formName) {
      this.$refs[formName].resetFields()
    },
    handleSubmit() {
      if (!this.visible || this.submitLoading) return // 防止重复提交
      this.$refs['formEdit'].validate(valid => {
        if (valid) {
          if (this.formData.id) {
            this.updateData(this.formData)
          } else {
            this.addData(this.formData)
          }
        } else {
          return false
        }
      })
    },
    toggle(flag) {
      this.$emit('toggle', flag)
    },
    handleCancel() {
      this.$emit('toggle', false)
    }
  }
}
</script>

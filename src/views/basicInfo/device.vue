<template>
  <div>
    <div style="margin-bottom:16px">
      <el-button type="primary" @click="handleOpenForm()" >绑定新设备</el-button>
      <p class="tip">(技术人员安装设备后，再绑定设备。)</p>
    </div>
    <el-table
      :data="deviceList"
      v-loading="queryLoading">
      <el-table-column
        label="设备ID"
        prop="deviceId"
        width="280"
      ></el-table-column>
      <el-table-column
        prop="password"
        label="设备密码"
        width="180"
      ></el-table-column>
      <el-table-column
        label="校区"
        prop="departmentName"
        width="180"
      ></el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
      ></el-table-column>
      <el-table-column
        label="添加时间"
        prop="createAt"
        align="center"
        width="160"
      ></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            title="同步提示"
            width="200"
            trigger="hover"
            style="margin-right:10px;"
            content="同步人脸数据为将系统中的人脸数据同步到人脸识别设备中，实现系统人脸库数据和人脸识别设备中的人脸库数据统一。">
            <el-button slot="reference" type="text" @click="handleSyncData(scope.row)">同步人脸</el-button>
          </el-popover>
          <el-button type="text" @click="handleOpenForm(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="deviceForm.id ? '修改设备信息' : '添加设备'"
      :visible.sync="showForm"
      :close-on-click-modal="false"
      width="496px">
      <el-form ref="deviceForm" :model="deviceForm" :rules="rules" label-width="88px">
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="deviceForm.deviceId" placeholder="请填写设备ID" @change="handleDeviceIdChange" autocomplete="off" :disabled="this.isEdit" :maxlength="64" style="width: 320px;"></el-input>
        </el-form-item>
        <el-form-item label="校区" prop="departmentId">
          <el-select v-model="deviceForm.departmentId" placeholder="请选择校区" :disabled="this.isEdit">
            <el-option v-for="item in branchList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备密码" prop="password">
          <el-input v-model.trim="deviceForm.password" placeholder="请填写设备密码" autocomplete="off" :maxlength="16" style="width: 205px;"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="deviceForm.remark" :rows="4" maxlength="200" placeholder="备注。（最多200个字）" show-word-limit></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 提醒机构购买设备 -->
    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      width="30%">
      <div class="mini-program">
        <span><i class="el-icon-warning"></i> 您当前还没配置人脸识别设备。如果需要购买，请使用微信扫描下方小程序二维码进行购买。</span>
        <img src="../../assets/mini_program.jpg" alt="图片加载中">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      queryLoading: false,
      submitLoading: false,
      showForm: false,
      isEdit: false,
      deviceList: [],
      branchList: [], // 校区列表
      deviceForm: {
        deviceId: '',
        departmentId: '',
        remark: '',
        password: ''
      },
      rules: {
        deviceId: [
          { required: true, message: '请填写设备ID', trigger: 'blur' },
          { pattern: /^[0-9A-Z]{1,}$/, message: '请填写正确的设备ID', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请填写设备密码', trigger: 'blur' },
          { pattern: /^[0-9A-Za-z]{1,}$/, message: '请填写正确的设备密码', trigger: 'blur' }
        ],
        departmentId: { required: true, message: '请选择校区', trigger: 'blur' }
      }
    }
  },
  created() {
    this._getDeviceList()
  },
  methods: {
    _getDeviceList() {
      this.queryLoading = true
      this.$http.get('/v1/BindFaceDevice/getBindFaceDeviceList', {
        organizationId: this.$store.getters.organizationInfo.id
      }).then(res => {
        this.deviceList = res.data
        if (res.data.length === 0) {
          this.dialogVisible = true
        }
      }).finally(() => {
        this.queryLoading = false
      })
    },
    _getBranchList() {
      if (this.branchList.length > 0) return
      this.$http.get('/v1/Department/getDepartmentList', {
        organizationId: this.$store.getters.organizationInfo.id,
        type: 1
      }).then(res => {
        this.branchList = res.data
      })
    },
    handleDeviceIdChange(val) {
      this.deviceForm.deviceId = val.toUpperCase()
    },
    handleOpenForm(row) {
      this.deviceForm = {
        deviceId: '',
        departmentId: '',
        remark: '',
        password: ''
      }
      this.isEdit = false
      if (row) {
        for (const key in this.deviceForm) {
          if (row.hasOwnProperty(key)) {
            this.deviceForm[key] = row[key]
          }
        }
        this.isEdit = true
      }
      this._getBranchList()
      this.showForm = true
      this.$refs.deviceForm && this.$refs.deviceForm.clearValidate()
    },
    handleSyncData(row) {
      this.$confirm('是否确认将服务器上的人脸数据同步到该设备上？', '提示').then(() => {
        this.$http.post(`/v1/FaceDill/asyncTargetFaceDevice/${row.departmentId}/${row.deviceId}`).then(() => {
          this.$message.success('同步人脸数据成功！')
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除该设备的信息吗？', '提示').then(() => {
        this.$http.delete('/v1/BindFaceDevice/deleteById/' + row.deviceId).then(() => {
          this.$message.success('删除设备信息成功！')
          this._getDeviceList()
        })
      })
    },
    handleSubmit() {
      this.$refs.deviceForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.deviceForm)
          this.submitLoading = true
          if (this.isEdit) {
            // 修改
            params.organizationId = this.$store.getters.organizationInfo.id
            this.$http.put('/v1/BindFaceDevice/updateBindFaceDevice', params).then(() => {
              this.$message.success('修改设备信息成功！')
              this.showForm = false
              this._getDeviceList()
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 新增
            params.organizationId = this.$store.getters.organizationInfo.id
            this.$http.post('/v1/BindFaceDevice/addBindFaceDevice', params).then(() => {
              this.$message.success('绑定设备成功！')
              this.showForm = false
              this._getDeviceList()
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
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
.tip
  font-size 13px
  color $color-warning
  margin-left 12px
  display inline-block
</style>

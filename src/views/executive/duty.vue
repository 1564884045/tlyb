<template>
  <div class="duty-wrapper">
    <div class="duty-container">
      <div class="duty-list">
        <div class="query-form" style="padding: 0; margin: 0;">
          <el-input
            v-model="dutyName"
            placeholder="请填写岗位名称搜索"
            :maxlength="20"
            clearable
            @keyup.native.enter="query"
            class="input-with-select"
            style="width: 210px;" >
            <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
          </el-input>
          <el-button type="primary" @click="handleAddDuty()" style="margin-bottom: 12px; float: right;">新建岗位</el-button>
        </div>
        <el-table
          :data="dutyList"
          stripe
          highlight-current-row
          @row-click="handleSelectRole">
          <el-table-column
            prop="name"
            label="岗位">
          </el-table-column>
          <el-table-column
            prop="count"
            label="员工数">
          </el-table-column>
          <el-table-column
            prop="desc"
            label="岗位说明">
            <template slot-scope="scope">
              <span>{{scope.row.desc || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="handleAddDuty(scope.row)">编辑</el-button>
              <el-button type="text" @click="handleDeleteDuty(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="bottom-pagination">
          <el-pagination
            @size-change="query"
            @current-change="_getDutyList"
            :current-page.sync="pageNum"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>
      <div class="permission-list">
        <p class="permission-header">
          权限设置：
          <el-tag v-if="currentDuty.id" type="primary">{{currentDuty.name}}</el-tag>
        </p>
        <el-tree
          ref="permissionTree"
          v-loading="permissionLoading"
          :data="permissionList"
          node-key="id"
          :props="{
            label: 'name'
          }"
          show-checkbox
          class="permission-main">
        </el-tree>
        <div class="bottom-btns">
          <el-button type="primary" @click="savePermission" :loading="saveLoading">保存</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      :visible.sync="showForm"
      :title="currentDuty.id ? '修改岗位' : '添加岗位'"
      :close-on-click-modal="false"
      custom-class="custom-dialog"
      width="420px">
      <el-form ref="dutyForm" :model="currentDuty" label-width="88px">
        <el-form-item label="岗位名称" prop="name" :rules="[
          {required: true, message: '请填写岗位名称', trigger: 'blur'},
          {max: 10, message: '长度最多为10', trigger: 'blur'}
        ]">
          <el-input v-model="currentDuty.name" :maxlength="20" placeholder="请填写部门名称" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="岗位说明" prop="desc">
          <el-input type="textarea" v-model="currentDuty.desc" placeholder="最多30个字" :maxlength="30"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showForm = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import { SystemAuthInfo } from '@/utils/user'

export default {
  name: 'Duty',
  data() {
    return {
      saveLoading: false,
      submitLoading: false,
      permissionLoading: false,
      showForm: false,
      dutyName: '',
      currentDuty: {
        name: ''
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      dutyList: [],
      permissionList: []
    }
  },
  computed: {
    ...mapGetters([
      'organizationInfo'
    ])
  },
  created() {
    this._getDutyList()

    this._getPermissionList()
  },
  methods: {
    // 获取该机构下的角色列表
    _getDutyList() {
      this.$http.get('/v1/Role/getRoleList', {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        organizationId: this.organizationInfo.id,
        name: this.dutyName
      }).then(res => {
        // if (this.currentDuty.id == null && res.data.length > 0) {
        //   this.currentDuty = res.data[0]
        // }
        this.dutyList = res.data
        this.total = res.total
      })
    },
    // 获取能够操作的所有权限菜单
    _getPermissionList() {
      this.permissionLoading = true
      this.$http.get('/v1/Menu/getMenuByPid', {
        pid: '0'
      }).then((res) => {
        this.permissionList = res.data
      }).finally(() => {
        this.permissionLoading = false
      })
    },
    // 获取能够操作的所有权限菜单
    // _getPermissionList() {
    //   this.permissionLoading = true
    //   this.$http.get('/v1/Menu/getMenuByVersions', {
    //     versionsId: SystemAuthInfo.get().versionsId
    //   }).then((res) => {
    //     this.permissionList = res.data
    //   }).finally(() => {
    //     this.permissionLoading = false
    //   })
    // },
    _getRolePermissionList(roleId) {
      this.permissionLoading = false
      this.$http.get('/v1/Menu/getMenuListByRoleIds', {
        roleIds: roleId
        // versionsId: SystemAuthInfo.get().versionsId
      }).then((res) => {
        // 先清空选中
        this.$refs.permissionTree.setCheckedKeys([])
        // 再选中已选
        if (res.data && res.data.length > 0) {
          const leafList = []
          // 查找叶子节点
          res.data.forEach(item => {
            // 找不到子节点的就是叶子节点
            if (!res.data.find(o => o.pid === item.id)) {
              leafList.push(item.id)
            }
          })
          this.$refs.permissionTree.setCheckedKeys(leafList, true)
        }
      }).finally(() => {
        this.permissionLoading = false
      })
    },
    query() {
      this.pageNum = 1
      this._getDutyList()
    },
    handleSelectRole(row) {
      this.currentDuty = row
      this._getRolePermissionList(this.currentDuty.id)
    },
    handleAddDuty(duty) {
      if (duty) {
        this.currentDuty = duty
        // 获取权限列表
      } else {
        this.currentDuty = {
          name: ''
        }
      }
      this.showForm = true
    },
    handleDeleteDuty(duty) {
      if (duty.id == null) return
      this.$confirm(`删除岗位，拥有该角色的员工的相应权限也将被删除，是否确认删除岗位【${duty.name}】?`, '提示').then(() => {
        this.$http.delete('/v1/Role/delete/' + duty.id).then(() => {
          this.currentDuty = {
            name: ''
          }
          this.$message.success('删除岗位成功！')
          this._getDutyList()
        })
      })
    },
    saveRole() {
      if (!this.showForm || this.submitLoading) return

      this.$refs.dutyForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          if (this.currentDuty.id) {
            // 修改角色
            this.$http.put('/v1/Role/updateRole', {
              id: this.currentDuty.id,
              name: this.currentDuty.name,
              desc: this.currentDuty.desc
            }).then(() => {
              this.$message.success('修改岗位成功')
              this._getDutyList()
              this.showForm = false
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            // 增加角色
            this.$http.post('/v1/Role/addRole', {
              name: this.currentDuty.name,
              organizationId: this.organizationInfo.id,
              desc: this.currentDuty.desc
            }).then(() => {
              this.$message.success('新增岗位成功。请勾选岗位对应的权限')
              this._getDutyList()
            }).finally(() => {
              this.submitLoading = false
              this.showForm = false
            })
          }
        }
      })
    },
    savePermission() {
      if (this.currentDuty == null || this.currentDuty.id == null) {
        this.$message.warning('请先选择一个岗位！')
        return
      }
      // 添加角色、权限中间数据
      const checkedPermission = this.$refs.permissionTree.getCheckedNodes(false, true).map(o => {
        return {
          menuId: o.id,
          roleId: this.currentDuty.id
        }
      })
      if (checkedPermission && checkedPermission.length > 0) {
        this.saveLoading = true
        this.$http.post('/v1/RoleMenu/addRoleMenus', checkedPermission).then(() => {
          this.$message.success('保存权限成功')
        }).finally(() => {
          this.saveLoading = false
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.duty-container
  display flex
  align-items flex-start

.duty-list
  width 100%
  background #ffffff
  padding 12px 16px
  overflow hidden

.permission-list
  flex-shrink 0
  margin-left 20px
  width 260px
  background #ffffff
  border 1px solid $color-border-2
  .permission-header
    height 42px
    line-height 42px
    background $color-background
    padding 0 16px
    border-bottom 1px solid $color-border-2
    .el-tag
      vertical-align middle
  .permission-main
    min-height 450px
    box-sizing border-box
    padding 20px 12px
  .bottom-btns
    margin 16px 0
    text-align center
    .el-button
      width 80px
      &+.el-button
        margin-left 16px
</style>

<style lang="stylus">
.duty-wrapper
  .el-tree-node__content
    height 34px
</style>

<template>
  <!-- 行内部门选择 -->
  <el-popover
    v-if="inline"
    v-model="visible"
    placement="bottom"
    trigger="click"
    popper-class="inline-select-popover">
    <p slot="reference"
      class="inline-select"
      @mousemove="handleMouseover"
      @mouseleave="handleMouseout">
      <span :class="{'color-primary': isSelected}">{{visibleLabel}}</span>
      <i v-show="!showClear" class="inline-select-right el-icon-caret-bottom" :class="{'rotate-icon': visible}"/>
      <i v-show="showClear" class="inline-select-right el-icon-circle-close" @click.stop="clearValue"/>
    </p>
    <el-cascader-panel :options="visibleDepartmentList" :props="{
        value: 'id',
        label: 'name',
        checkStrictly: true
      }"
      @change="handleCascaderChange">
    </el-cascader-panel>
  </el-popover>
  <!-- 标准的部门选择 -->
  <el-cascader
    v-else
    :value="value"
    placeholder="所属部门"
    :options="visibleDepartmentList"
    :props="{
      value: 'id',
      label: 'name',
      multiple: false,
      checkStrictly: true
    }"
    @change="change"
    filterable
    :clearable="clearable && !disabled"
    :disabled="disabled"
    :show-all-levels="showAllLevels"
  ></el-cascader>
</template>

<script>
import { getTrees, findTreeNode, treeToList } from '../../utils/tree'
import { mapGetters } from 'vuex'

export default {
  name: 'DepartmentSelect',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    /**
     * 为字符串时，会自动去查找所属部门的层级关系
     */
    value: [Array, String],
    /**
     * 根节点ID。
     */
    rootId: String,
    /**
     * 是否行内表示方式
     */
    inline: Boolean,
    /**
     * 显示所有层级
     */
    showAllLevels: {
      type: Boolean,
      default: true
    },
    /**
     * 是否可清除
     */
    clearable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    /** 可见的部门数据 */
    visibleDepartmentList() {
      if (this.rootId) {
        // 只查指定部门以下的
        const node = findTreeNode(this.rootId, this.departmentList)

        if (node && node.children) {
          return [node]
        }
        return []
      }
      return this.departmentList
    },
    /** 扁平的部门数据 */
    flatDepartmentList() {
      return treeToList(this.visibleDepartmentList)
    },
    /** 是否已选 */
    isSelected() {
      return this.value && this.value.length > 0
    },
    /** 显示的值 */
    visibleLabel() {
      if (this.isSelected) {
        const list = this.value.map(o => {
          const find = this.flatDepartmentList.find(n => n.id === o)
          return find ? find.name : undefined
        })
        return list.join(' / ')
      }
      return '所属部门'
    },
    ...mapGetters([
      'userInfo',
      'organizationInfo',
      'departmentList'
    ])
  },
  data() {
    return {
      disabled: false,
      visible: false, // 弹窗显示控制
      showClear: false // 显示清除图标
    }
  },
  created() {
    if (this.departmentList.length === 0) {
      this._getDepartmentList()
    }
  },
  methods: {
    _getDepartmentList() {
      this.$http.get('/v1/Department/getByOrganizationId', {
        organizationId: this.organizationInfo.id,
        pid: this.organizationInfo.id
      }).then(res => {
        this.$store.commit('setDepartmentList', getTrees(res.data, this.organizationInfo.id, 'pid', 'id', true))
      })
    },
    change(res) {
      this.$emit('change', res)
    },
    // CascaderPanel发生变化
    handleCascaderChange(e) {
      this.change(e)
      this.visible = false
    },
    handleMouseover() {
      if (!this.clearable) return
      if (this.value == null || this.value.length === 0) return
      this.showClear = true
    },
    handleMouseout() {
      if (!this.clearable) return
      this.showClear = false
    },
    /** 清空选中的值 */
    clearValue() {
      this.$emit('change', '')
      this.showClear = false
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible="visible"
      :close-on-click-modal="false"
      @close="toggle(false)"
      width="1000px"
      top="5vh">
      <div class="base-info-wrapper">
        <div class="container">
          <el-tabs v-model="currentTab">
            <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
          </el-tabs>
          <class-student-table ref="refClassStudentTable" :key="classData.id + updateFlag"  v-if="currentTab === 'classStudentTable'" :currentClass="classData" class="tab-panel-wrapper" @studentAllocate="handleStudentAllocate"/>
          <class-time-table  :key="classData.id" v-if="currentTab === 'classTimeTable'" :currentClass="classData" class="tab-panel-wrapper"/>
        </div>
      </div>
    </el-dialog>
    <student-allocation-dialog
      v-model="studentAllocationVisible"
      :currentClass="classData"
      :key="classData.id"
      @success="handleStudentAllocationSuccess"
    />
  </div>
</template>

<script>
import ClassStudentTable from './ClassStudentTable'
import ClassTimeTable from './ClassTimeTable'
import StudentAllocationDialog from './StudentAllocationDialog'
export default {
  name: 'ClassDetailDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  components: {
    ClassStudentTable,
    ClassTimeTable,
    StudentAllocationDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    activeTab: {
      type: String,
      validator: value => {
        return ['classStudentTable', 'classTimeTable'].indexOf(value) !== -1
      }
    },
    classData: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      updateFlag: 0,
      studentAllocationVisible: false,
      currentTab: '',
      tabList: [
        {
          name: 'classStudentTable',
          label: '本班学员'
        },
        {
          name: 'classTimeTable',
          label: '课表信息'
        }
      ]
    }
  },
  computed: {
    dialogTitle() {
      return `班级详情（${this.classData.name || ''}）`
    }
  },
  watch: {
    activeTab: {
      handler(val) {
        this.currentTab = val
      },
      immediate: true
    },
    studentAllocationVisible(flag) {
      if (!flag) {
        this.$refs['refClassStudentTable'] && this.$refs['refClassStudentTable']._getClassStudentList()
      }
    }
  },
  methods: {
    handleStudentAllocate() {
      this.studentAllocationVisible = true
    },
    toggle(flag) {
      this.$emit('toggle', flag)
    },
    handleStudentAllocationSuccess() {
      this.updateFlag++
    }
  }
}
</script>

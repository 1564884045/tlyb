<template>
  <el-dialog
    title="学员分班"
    :visible="visible"
    :close-on-click-modal="false"
    @close="toggle(false)"
    width="1170px"
    top="5vh">
    <student-allocation :classId="currentClass.id"></student-allocation>
  </el-dialog>
</template>

<script>
import StudentAllocation from './StudentAllocation'
export default {
  name: 'StudentAllocationDialog',
  model: {
    prop: 'visible',
    event: 'toggle'
  },
  components: {
    StudentAllocation
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentClass: {
      type: Object,
      require: true
    }
  },
  methods: {
    toggle(flag) {
      this.$emit('toggle', flag)
    },
    handleFinish() {
      this.$emit('toggle', false)
      this.$emit('success')
    }
  }
}
</script>
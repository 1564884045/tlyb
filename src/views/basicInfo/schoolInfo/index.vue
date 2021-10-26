<!-- 校区信息 -->
<template>
  <div>
    <schoolInfo-many></schoolInfo-many>
    <!-- <schoolInfo-single v-else-if='branchList.length === 1'></schoolInfo-single> -->
  </div>
</template>

<script>
// import schoolInfoSingle from './schoolInfoSingle'
import schoolInfoMany from './schoolInfoMany'
import { mapGetters } from 'vuex'

export default {
  props: {},
  data () {
    return {
    }
  },
  components: {
    schoolInfoMany
    // schoolInfoSingle
  },
  computed: {
    ...mapGetters([
      'branchList'
    ])
  },
  created () {},
  mounted () {},
  methods: {}
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>

</style>

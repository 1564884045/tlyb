<template>
  <el-breadcrumb class="app-breadcrumb" separator="/" separator-class="el-icon-arrow-right">
    <transition-group name="breadcrumb">
      <!-- v-if="item.meta.title"  noredirect -->
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.name == null || index==levelList.length-1 || item.redirect === $route.path" class="no-redirect">{{ item.meta.title || item.name }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title || item.name }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'

export default {
  name: 'Breadcrumb',
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => {
        if (item.meta.title) {
          return true
        }
      })
      const first = matched[0]
      if (first && (first.name == null || first.name.trim().toLocaleLowerCase() !== 'Dashboard'.toLocaleLowerCase())) {
        matched = [{ name: 'Dashboard', path: '/dashboard', meta: { title: '首页' } }].concat(matched)
      }
      this.levelList = matched
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.replace(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="stylus" scoped>
.app-breadcrumb.el-breadcrumb
  display inline-block
  font-size 14px
  line-height 50px
  margin-left 10px
  .no-redirect
    color #97a8be
    cursor text

/*breadcrumb transition*/
.breadcrumb-enter-active,
.breadcrumb-leave-active
  transition all .5s

.breadcrumb-enter,
.breadcrumb-leave-active
  opacity 0
  transform translateX(20px)

.breadcrumb-move
  transition: all .5s

.breadcrumb-leave-active
  position absolute

</style>

// 新闻资讯组件
<template>
  <div>
    <div class="title" :style="{fontSize: newsData.titleFontSize}">{{newsData.title}}</div>
    <div class="content">
      <div :class="isShowHover ? 'content-box' : 'content-box-no-hover'" v-for="(item, index) in newsData.content.contentValue" :key="`item${index}`">
        <p class="item-content" v-if="item.slice(0, 13) === 'contentVallue'">{{item.slice(13, item.length)}}
          <span v-if="isShowHover" class="content-span">
            <a href="#content"><i @click="handleUpdataContent(index)" class="el-icon-edit edits"></i></a>
            <i @click="handleDeleteContent(index)" class="el-icon-delete"></i>
          </span>
        </p>
        <div v-else class="img-box">
          <div class="item" :class="val.styleName" v-for="(val, ind) in item" :key="`img${ind}`">
            <img :src="val.url"  alt="图片加载中......">
            <div v-if="isShowHover" class="icon-btn">
              <!-- 修改 -->
              <a href="#resources" style="color: #FF6600"><i class="el-icon-edit icon" @click="handleUpdataImg(index, val, ind)"></i></a>
              <!-- 删除 -->
              <i class="el-icon-delete icon" @click="handleDeleteImg(index, ind)"></i>
            </div>
          </div>
        </div>
        <div v-if="isShowHover" class="icon-box">
          <!-- 向上添加 -->
          <i class="el-icon-circle-plus" @click="addInfo(true, index)"></i>
          <!-- 向下添加 -->
          <i class="el-icon-circle-plus" @click="addInfo(false, index)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'News',
  props: {
    newsData: {
      type: Object,
      default: null
    },
    // 是否显示移入效果
    isShowHover: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      pInd: 0,
      imgInd: 0,
      contentList: []
    }
  },
  methods: {
    /**
     * 删除指定图片
     * index: 图片数组所在newsData里的索引位置
     * ind:即将删除的图片的索引
     */
    handleDeleteImg(index, ind) {
      this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.newsData.content.contentValue[index].splice(ind, 1)
        if (this.newsData.content.contentValue[index].length === 0) {
          this.newsData.content.contentValue.splice(index, 1)
        }
      })
      this.delData(false)
    },
    // 删除文本
    handleDeleteContent(index) {
      this.$confirm('此操作将永久删除该文本数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.newsData.content.contentValue.splice(index, 1)
      })
      this.delData(true)
    },
    // 删除文本或图时若以点击修改为提交则清空表单数据
    delData(type) {
      this.$emit('emptyData', type)
    },
    // 修改图片
    handleUpdataImg(index, val, ind) {
      this.$emit('child-event', index, val, ind)
    },
    // 修改文本
    handleUpdataContent(index) {
      this.$emit('child-content', index)
    },
    /**
     * 指定位置添加数据
     * type: 数据添加方向，true--向上，false--向下
     * index：点击是所选择的位置索引
     * 确认时添加图片数据
     * 取消时添加文本段落
     */
    addInfo(type, index) {
      this.$confirm(`请选择添加的数据类型`, `向${type ? '上' : '下'}添加数据`, {
        distinguishCancelAndClose: true,
        confirmButtonText: '图片',
        cancelButtonText: '段落',
        type: 'warning'
      })
        .then(() => {
          this.$emit('child-addPushData', false, index, type)
        })
        .catch((action) => {
          if (action === 'cancel') {
            this.$emit('child-addPushData', true, index, type)
          }
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  padding 5px
.img-box
  display flex
  flex-wrap: wrap
  .single
    width 100%
    img
      width 100%
  .most
    width 30%
    margin 5px 1.6%
    height 80px
    img
      width 100%
      height 80px
  .item
    position relative
    .icon-btn
      position absolute
      width 100%
      height 100%
      background-color rgba(0,0,0,0.5)
      top 0
      opacity 0
      display flex
      transition 1s
      color #FF6600
      left 0
      justify-content center
      align-items center
      font-size 18px
      z-index 2020
      &:hover
        opacity 1
      i
        opacity 1
        margin-left 5px
        &:hover
          color red
.content-box
  padding 0
  transition 0.5s
  &:hover
    padding 20px 0
.content-box-no-hover
  padding 0
.item-content
  margin 5px 0
  padding 5px
  text-indent 1em
  position relative
  .content-span
    position absolute
    right 5px
    bottom -20px
    .edits
      margin-right -6px
  i
    color #FF6600
    opacity 0
    &:hover
      color red
      font-weight bold
i
  cursor pointer
.content-box
  border 1px dashed rgba(0, 0, 0, 0)
  border-radius 2px
  position relative
  margin 2px 0
  .icon-box
    width 20px
    height 100%
    text-align center
    display flex
    flex-flow column nowrap
    position absolute
    right 104px
    top 0
    opacity 0
    justify-content space-between
    i
      color #ff6600
      font-size 20px
      &:hover
        color red
        font-weight bold
  &:hover
    border 1px dashed #FF6600
    .icon-box
      opacity 1
    i
      opacity 1
</style>
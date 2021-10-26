<template lang="html">
  <div class="editor">
    <div ref="toolbar" class="toolbar">
    </div>
    <div ref="editor" class="text">
    </div>
  </div>
</template>

<script>
import E from 'wangeditor'
export default {
  name: 'Editorbar',
  data () {
    return {
      editor: null,
      uploadFilePath: process.env.VUE_APP_UPLOAD_URL
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '300px;'
    },
    uploadImgMaxSize: Number
  },
  watch: {
    value (val, oldVal) {
      // 第一次加载
      if (oldVal == null) {
        this.editor.txt.html(val)
      }
    }
  },
  mounted () {
    this.initEditor()
  },
  methods: {
    initEditor () {
      this.editor = new E(this.$refs.toolbar, this.$refs.editor)
      this.editor.customConfig.uploadImgShowBase64 = false // base 64 存储图片
      this.editor.customConfig.uploadImgServer = this.uploadFilePath // 配置服务器端地址
      this.editor.customConfig.uploadImgHeaders = {} // 自定义 header
      this.editor.customConfig.uploadFileName = 'file' // 后端接受上传文件的参数名
      if (this.uploadImgMaxSize) {
        this.editor.customConfig.uploadImgMaxSize = this.uploadImgMaxSize
      } else {
        this.editor.customConfig.uploadImgMaxSize = 1 * 1024 * 1024 // 将图片大小限制为 1M
      }
      this.editor.customConfig.uploadImgMaxLength = 6 // 限制一次最多上传 6 张图片
      this.editor.customConfig.uploadImgTimeout = 3 * 60 * 1000 // 设置超时时间
      this.editor.customConfig.zIndex = 5
      // 配置菜单
      this.editor.customConfig.menus = [
        'head', // 标题
        'bold', // 粗体
        'fontSize', // 字号
        'fontName', // 字体
        'italic', // 斜体
        'underline', // 下划线
        'strikeThrough', // 删除线
        'foreColor', // 文字颜色
        'backColor', // 背景颜色
        'link', // 插入链接
        'list', // 列表
        'justify', // 对齐方式
        'quote', // 引用
        'emoticon', // 表情
        'image', // 插入图片
        'table' // 表格
      ]
      this.editor.customConfig.uploadImgHooks = {
        fail: (xhr, editor, result) => {
          // 插入图片失败回调
          this.uploadImgFail(xhr, editor, result)
        },
        success: (xhr, editor, result) => {
          // 图片上传成功回调
          // this.uploadImgSuccess(xhr, editor, result)
        },
        timeout: (xhr, editor) => {
          // 网络超时的回调
        },
        error: (xhr, editor) => {
          // 图片上传错误的回调
        },
        customInsert: (insertImg, result, editor) => {
          // 图片上传成功，插入图片的回调
          if (result.code === '000000') {
            if (result.data !== null) {
              insertImg(result.data[0].downloadPath)
            }
            this.uploadImgSuccess(null, editor, result)
          } else {
            this.uploadImgFail(null, editor, result)
          }
        }
      }
      this.editor.customConfig.onchange = (html) => {
        this.$emit('onChange', html) // 将内容同步到父组件中
      }
      // 创建富文本编辑器
      this.editor.create()
      this.editor.txt.html(this.value)
    },
    uploadImgFail(xhr, editor, result) {
      this.$emit('onFailure', xhr, editor, result)
    },
    uploadImgSuccess(xhr, editor, result) {
      this.$emit('onSuccess', xhr, editor, result)
    },
    uploadImgTimeOut(xhr, editor) {
      this.$emit('onTimeOut', xhr, editor)
    },
    uploadImgError(xhr, editor) {
      this.$emit('onError', xhr, editor)
    },
    clearTxt() {
      this.editor.txt.clear()
    }
  }
}
</script>

<style lang="css">
.editor {
  width: 100%;
  margin: 0 auto;
  min-height: 500px;
}
.toolbar {
  width: 100%;
  border: 1px solid #ccc;
}
.text {
  width: 100%;
  border: 1px solid #ccc;
  height: 500px;
}
</style>

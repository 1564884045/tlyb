<template>
  <!-- 下载二维码 -->
  <el-dialog title="员工名单" width="500px" :visible="value" :show-close="false">
    <!-- 下载名单 -->
    <div class="download-list">
      <!-- 搜索框 -->
      <el-input v-model.trim="queryForm.leble" :placeholder="placeholder" :maxlength="11" @keyup.native.enter="query" class="input-with-select">
        <el-select v-model="queryForm.username" slot="prepend" placeholder="请选择" style="width: 98px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query" id="find-btn"></el-button>
      </el-input>
    </div>

    <el-table
      empty-text="暂无数据"
      min-height="250"
      max-height="450"
      ref="multipleTable"
      :data="userList"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      v-loading="queryLoading"
    >
      <el-table-column type="selection" width="60"></el-table-column>
      <el-table-column prop="username" label="姓名" width="100"></el-table-column>
      <el-table-column prop="phone" label="电话" show-overflow-tooltip></el-table-column>
      <el-table-column prop="departmentName" label="岗位" show-overflow-tooltip></el-table-column>
    </el-table>
    <!-- 提示 -->
    <div class="download-list-title" v-show="!showTable">
      <span>使用说明:</span>
      <li>1、可搜索【员工姓名】筛选员工（姓名含有搜索内容、完整姓名均可）</li>
    </div>

    <div id="canvas-box">
      <!-- 员工二维码 -->
      <div id="student-qrcode">
        <canvas id="tutorial" width="240" height="320"></canvas>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose()">取消</el-button>
      <el-button type="primary" @click="openConfirmDownloadTips()" :loading="downLoading">下载</el-button>
    </span>
  </el-dialog>
</template>

<script>
import QRCode from 'qrcode'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import { mapGetters } from 'vuex'

export default {
  name: 'DownloadTeacherInfo',
  model: {
    prop: 'value'
  },
  props: {
    value: Boolean
  },
  data() {
    return {
      showTable: false,
      downLoading: false,
      classLoading: false,
      userList: [],
      queryLoading: false,
      multipleSelection: [], // 勾选员工信息
      downloadStudentInfoSrc: [], // 二维码src存放处
      downloadStudentInfoUrl: [], // 下载地址
      placeholder: '请输入员工姓名',
      searchTypeList: [
        {
          value: '',
          label: '员工姓名',
          placeholder: '请输入员工姓名'
        }
      ],
      queryForm: {
        username: ''
      }
    }
  },
  components: {
  },
  computed: {
    ...mapGetters(['organizationInfo', 'userInfo', 'currentBranch'])
  },
  created() {
  },
  methods: {
    // 查询
    query() {
      console.log(this.queryForm)
      this._getUserList()
    },
    // 确认下载
    downloadZip() {
      // 下载文件名
      const blogTitle = '员工二维码'
      const zip = new JSZip()
      let imgs = zip.folder(blogTitle)
      let baseList = []
      this.downLoading = true
      this.$nextTick(() => {
        const _this = this
        // 有数据才能下
        let canvas = document.getElementById('tutorial')
        canvas.innerHTML = ''
        const ctx = canvas.getContext('2d')
        for (let i = 0; i < this.multipleSelection.length; i++) {
          // 生成组合图片
          ctx.font = '24px serif'
          let img = new Image()
          let imgName =
            _this.multipleSelection[i].username +
            '-' +
            _this.multipleSelection[i].phone // 每张图的名称
          img.src = this.downloadStudentInfoSrc[i]
          img.onload = function () {
            // 填充背景色
            ctx.fillStyle = '#eeeeee'
            ctx.clearRect(0, 0, 240, 330)
            ctx.fillRect(0, 0, 240, 320)
            // 填充字体色
            ctx.fillStyle = '#000000'
            ctx.fillText('姓名:' + _this.multipleSelection[i].username, 20, 270)
            ctx.font = '24px serif red'
            ctx.fillText(
              '电话:' + _this.multipleSelection[i].phone,
              20,
              310
            )
            // 图片位置
            ctx.drawImage(img, 0, 0)
            _this.downloadStudentInfoUrl.push(`url: ${canvas.toDataURL()}`)
            // 图片base64编码数据
            let qrcodeurl = canvas.toDataURL()
            // 当所有图片生成完成后打包存储base64编码数据
            baseList.push({ name: imgName, img: qrcodeurl.substring(22) })
            if (baseList.length === _this.multipleSelection.length) {
              if (baseList.length > 0) {
                for (let k = 0; k < baseList.length; k++) {
                  imgs.file(baseList[k].name + '.png', baseList[k].img, {
                    base64: true
                  })
                }
                zip.generateAsync({ type: 'blob' }).then((content) => {
                  // 文件名
                  FileSaver.saveAs(content, blogTitle + '.zip')
                })
              }
              _this.$nextTick(() => {
                // 关闭窗口
                _this.handleClose()
                _this.downLoading = false
              })
            }
            // 用完释放内存
            URL.revokeObjectURL(qrcodeurl)
          }
        }
      })
    },

    // 获取老师列表
    _getUserList() {
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        username: this.queryForm.username || null
      }
      this.queryLoading = true
      this.$http
        .get('v1/User/getUserList', params)
        .then((res) => {
          this.userList = res.data
          this.total = res.total
        })
        .finally(() => {
          this.queryLoading = false
        })
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    // 勾选员工
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 1、获取远端数据
     * 2、根据信息生成二维码
     * 3、获取二维码bas64 src
     * 4、通过src下载图片
     */
    // 生成二维码
    produceQrcode() {
      for (let i = 0; i < this.multipleSelection.length; i++) {
        // 处理下载链接
        let dowloadInfoUrl = null //
        dowloadInfoUrl = `${process.env.VUE_APP_PARENT_URL}/#/scanCode?teacherId=${this.multipleSelection[i].id}&organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
        QRCode.toDataURL(dowloadInfoUrl, {
          // 生成二维码的数据
          width: 240, // 宽
          height: 240, // 高
          colorLight: '#eeeeee' // 二维码背景色
        }).then((url) => {
          this.downloadStudentInfoSrc.push(url)
        })
      }
    },
    // 下载提示
    openConfirmDownloadTips() {
      if (this.organizationInfo.openWechatDeploy !== 1) {
        this.$notify({
          title: '警告',
          message: '机构未嫁接公众号，暂无下载老师二维码功能权限',
          type: 'warning'
        })
        return
      }
      if (this.multipleSelection.length) {
        // 生成
        this.produceQrcode()
        const h = this.$createElement
        this.$msgbox({
          title: '下载确认',
          message: h('p', null, [h('span', null, '请确认是否下载 ')]),
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '执行中...'
              // 下载
              this.downloadZip()
              setTimeout(() => {
                done()
                setTimeout(() => {
                  instance.confirmButtonLoading = false
                }, 300)
              }, 1000)
            } else {
              done()
            }
          }
        }).then((action) => {
          this.$message({
            type: 'success',
            message: '下载成功'
          })
        })
      } else {
        this.$message({
          message: '请勾选员工',
          type: 'warning'
        })
      }
    },
    // 关闭窗口
    handleClose() {
      // 清空数据
      this.downloadStudentInfoSrc = []
      this.downloadStudentInfoUrl = []
      this.multipleSelection = []
      this.$emit('clsoeDownloadUserQrCode')
      this.showTable = false
      this.queryForm = {
        username: ''
      }
    }
  }
}
</script>

<style scoped lang='stylus'>
#canvas-box
  width 0
  height 0
  overflow hidden
  background-color #eee
canvas
  border 1px solid #000
.input-with-select
  width 270px
  height 32px
.download-list
  display flex
  justify-content space-between
  .query-select-list
    margin-left 15px
    margin-bottom 25px
    margin-top 7px
#find-btn
  background-color #ff6600
  color #ffffff
  border-color #ff6600
  border-top-left-radius 0px 0px
  border-bottom-left-radius 0px 0px
.download-list-title
  margin-top 10px
  border-top 1px solid #eeeeee
  border-bottom 1px solid #eeeeee
  padding-bottom 18px
  span
    margin 10px 0
    display inline-block
    color #ff7e00
    margin-left 4px
  li
    list-style-type none
    margin-bottom 4px
    font-size 14px
    color #909399
    margin-left 15px
.el-select
  color #ff7e00
</style>

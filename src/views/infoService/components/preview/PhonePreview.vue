// 手机预览效果
<template>
  <div class="contianer">
    <div :class="cardStyle">
      <div class="content-box">
        <!-- 机构logo图 -->
        <img :src="previewData.logoUrl" alt />
        <div class="about-environment public-item-style">
          <!-- 关于我们 -->
          <div class="about">
            <h3 class="public-head-style">关于我们</h3>
            <p>{{previewData.about}}</p>
          </div>
          <!-- 教学环境 -->
          <div class="teaching-environment-item" v-show="previewData.educationEnvironment.length > 0">
            <h3 class="public-head-style">教学环境</h3>
            <div class="teaching-environment">
              <div class="teaching-environment-box" v-for="(item, index) in previewData.educationEnvironment" :key="'educationEnvironment' + index + 'a1'">
                <img :src="item.imgUrl" alt />
                <span>{{item.title}}</span>
                <!-- 修饰样式添加 -->
                <div v-if="cardStyle === 'newsinformation03'" class="round-dot">0{{index + 1}}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 办学理念 -->
        <div class="educationPurpose-item public-item-style">
          <h3 class="public-head-style">办学理念</h3>
          <hr />
          <div>
            <div class="idea-title">
              <img :src="previewData.educationPurpose.url" alt />
              <h4>{{previewData.educationPurpose.title}}</h4>
            </div>
            <div class="content">
              <p>{{previewData.educationPurpose.content}}</p>
            </div>
            <div class="publicity" :style="{backgroundImage: 'url(' + previewData.educationPurpose.bgUrl + ')'}">
              <h4>{{previewData.educationPurpose.publicityIdea}}</h4>
              <span>{{previewData.educationPurpose.publicityContent}}</span>
            </div>
          </div>
        </div>
        <!-- 信息普及 -->
        <div class="popularization-item public-item-style" v-if="previewData.popularizationInfo.content.length > 0">
          <h3 class="public-head-style">信息普及</h3>
          <div class="popularization" :style="{backgroundImage: 'url('+ previewData.popularizationInfo.url +')'}">
            <h2>{{previewData.popularizationInfo.title}}</h2>
            <p>{{previewData.popularizationInfo.subTitle}}</p>
          </div>
          <div class="popularization-content" v-for="(item, index) in previewData.popularizationInfo.content" :key="'popularizationInfo' + index + 'a1'">
            <h3>{{item.title}}</h3>
            <div>
              <h5>{{item.subTitle}}</h5>
              <p>{{item.content}}</p>
            </div>
          </div>
        </div>
        <!-- 机构使命 -->
        <div class="mission-item public-item-style">
          <h3 class="public-head-style">机构使命</h3>
          <div class="mission" :style="{backgroundImage: 'url('+ previewData.mission.imgUrl +')'}">
            <h3>{{previewData.mission.title}}</h3>
            <p>{{previewData.mission.content}}</p>
            <div>
              <span v-for="(item, index) in previewData.mission.cultivateAbility" :key="'cultivateAbility' + index + 'a2'">{{item}}</span>
            </div>
          </div>
        </div>
        <!-- 教学态度 -->
        <div class="teaching-attitude-item public-item-style" v-if="previewData.teachingAttitude.length > 0">
          <h3 class="public-head-style">教学态度</h3>
          <div class="teaching-attitude">
            <div class="teaching-attitude-info" v-for="(item, index) in previewData.teachingAttitude" :key="'teachingAttitude' + index + 'a1'" :style="{backgroundImage: 'url('+ item.url +')'}">
              <div class="info-word">
                <span>
                  <b>{{item.title}}</b>
                </span>
                <span>{{item.content}}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 课程介绍 -->
        <div class="course-introduction-item public-item-style" v-if="previewData.courseIntroduction.length > 0">
          <h3 class="public-head-style">课程介绍</h3>
          <div class="course-introduction" v-for="(item, index) in previewData.courseIntroduction" :key="'courseIntroduction' + index + 'a1'">
            <div class="img-box">
              <img :src="item.courseImgUrl" alt />
            </div>
            <div class="content">
              <h3>{{item.title}}</h3>
              <p>{{item.content}}</p>
            </div>
          </div>
        </div>
        <!-- 师资力量 -->
        <div class="teacher-introduction-item public-item-style" v-if="previewData.teacherResource.length > 0">
          <h3 class="public-head-style">师资力量</h3>
          <div class="item">
            <div class="teacher-introduction" v-for="(item, index) in previewData.teacherResource" :key="'teacherResource' + index + 'a1'">
              <div class="img-box">
                <img :src="item.headerUrl" alt />
              </div>
              <div class="content">
                <h3>{{item.post}}</h3>
                <span>{{item.name}}</span>
                <p>{{item.profile}}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- 明星学员 -->
        <div class="student-item public-item-style" v-if="previewData.students.length > 0">
          <h3 class="public-head-style">明星学员</h3>
          <div class="student-box" v-for="(item, index) in previewData.students" :key="'students' + index + 'a1'">
            <img :src="item.headerUrl" alt />
            <div class="student-info">
              <h3>{{item.name}}</h3>
              <p>{{item.info}}</p>
            </div>
            <!-- 此标签修饰样式排版 -->
            <div class="box"></div>
          </div>
        </div>
        <!-- 快速报名 -->
        <div class="rapid-apply public-item-style">
          <h3 class="public-head-style">快速报名</h3>
          <hr />
          <div class="item-info">
            <h3>{{previewData.rapidApply.title}}</h3>
            <div v-if="organizationInfo.openWechatDeploy === 1">
              <img v-if="imgSrc" :src="imgSrc" alt="">
              <qrcode ref="qrcode" v-else :value="previewData.rapidApply.url" class="qrcode" tag="img" :options="{ width: 120, margin: 0 }" />
            </div>
            <p>{{previewData.rapidApply.tips}}</p>
            <p>咨询电话: {{previewData.rapidApply.phone}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import QRCode from '@/components/QRCode'
export default {
  name: 'MobilePreview',
  props: {
    // 模板样式
    cardStyle: {
      type: String,
      default: ''
    },
    previewData: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return {}
      }
    }
  },
  components: {
    [QRCode.name]: QRCode
  },
  data () {
    return {
      imgSrc: null
    }
  },
  created() {
    this.createQrCode()
  },
  mounted() {
    this.$nextTick(() => {
      if (this.organizationInfo.openWechatDeploy === 1) {
        this.imgSrc = this.$refs.qrcode.$el.src
        this.previewData.rapidApply.url = this.imgSrc
      }
    })
  },
  methods: {
    // 生成报名二位码
    createQrCode() {
      if (this.organizationInfo.openWechatDeploy === 1) {
        // 已嫁接公众号
        this.previewData.rapidApply.url = `${process.env.VUE_APP_PARENT_URL}/#/scanCode?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
      }
    }
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  }
}
</script>

<style lang="stylus" scoped>
</style>
<style src="../style/newsInformation.css" scoped></style>
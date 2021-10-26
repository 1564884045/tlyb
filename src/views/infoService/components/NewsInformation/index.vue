<template>
  <div class="container">
    <!-- 手机预览 -->
    <div class="phone">
      <div class="phone-template">
        <phone-preview class="phone-preview" :cardStyle="cardStyle" :previewData="formData" />
      </div>
    </div>
    <div class="form">
      <slot></slot>
      <el-form :model="formData" ref="ruleForm" class="demo-ruleForm">
        <el-form-item>
          <h4 class="title">机构logo图</h4>
          <div @click="uptype(0)" style="margin-left: 20px">
            <el-upload :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="formData.logoUrl" :src="formData.logoUrl" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item>
          <h4 class="title">关于我们</h4>
          <el-input v-model="formData.about" type="textarea" :autosize="{minRows: 4, maxRows: 6}" :maxlength="120" show-word-limit></el-input>
        </el-form-item>
        <el-form-item>
          <h4 class="title">教学环境</h4>
          <div @click="deltype(0)" v-if="formData.educationEnvironment.length > 0">
            <el-tabs v-model="activeName[0]" type="border-card" editable @edit="handleeducationEnvironmentTabsEdit">
              <el-tab-pane v-for="(item, index) in formData.educationEnvironment" :name="`${index}`" :key="'educationEnvironment' + index" :label="'环境' + (index + 1)">
                标题:
                <el-input class="input-title" placeholder="标题" v-model="item.title" :maxlength="14" show-word-limit></el-input>
                <div @click="uptype(1, index)">
                  图片：
                  <el-upload
                    :class="item.imgUrl ? 'avatar-uploader' : 'basic-avatar-uploader-tyle'"
                    :action="imgUploadPath"
                    accept="image/*"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload">
                    <img v-if="item.imgUrl" :src="item.imgUrl" class="avatar" />
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
                  </el-upload>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-button type="primary" plain v-else @click="addModules(0)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">办学理念</h4>
          <div class="form-item-border">
            标题:
            <el-input class="input-title" placeholder="理念标题" :maxlength="33" show-word-limit v-model="formData.educationPurpose.title"></el-input><br>
            内容:
            <el-input class="input-content-lable" v-model="formData.educationPurpose.content" type="textarea" placeholder="理念内容" :autosize="{minRows: 4, maxRows: 6}" :maxlength="120" show-word-limit></el-input>
            <div @click="uptype(2)">
              图片:
              <el-upload class="avatar-uploader" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="formData.educationPurpose.url" :src="formData.educationPurpose.url" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
              </el-upload>
            </div>
            宣传标题:
            <el-input class="input-title" placeholder="宣传标题" :maxlength="17" show-word-limit v-model="formData.educationPurpose.publicityIdea"></el-input>
            <br>宣传内容:
            <el-input style="width: 360px; margin-left: 30px" v-model="formData.educationPurpose.publicityContent" type="textarea" placeholder="宣传内容" :autosize="{minRows: 2, maxRows: 6}" :maxlength="40" show-word-limit></el-input>
            <div @click="uptype(3)">
              宣传图:
              <el-upload class="secondary-img" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="formData.educationPurpose.bgUrl" :src="formData.educationPurpose.bgUrl" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <h4 class="title">信息普及</h4>
          <div v-if="formData.popularizationInfo.content.length > 0" class="form-item-border">
            标 &nbsp; 题:
            <el-input placeholder="标题" class="input-title" :maxlength="12" show-word-limit v-model="formData.popularizationInfo.title"></el-input>
            <br>副标题:
            <el-input placeholder="副标题" class="input-title" :maxlength="30" show-word-limit v-model="formData.popularizationInfo.subTitle"></el-input>
            <div @click="uptype(4)">
              标题背景:
              <el-upload class="popularization-info-img" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="formData.popularizationInfo.url" :src="formData.popularizationInfo.url" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
              </el-upload>
            </div>
            <el-tabs v-model="activeName[1]" type="border-card" editable @edit="handlePopularizationInfoTabsEdit" style="margin-left:-14px">
              <el-tab-pane v-for="(item, index) in formData.popularizationInfo.content" :name="`${index}`" :key="index" :label="'知识点' + (index + 1)">
                标 &nbsp; 题:
                <el-input v-model="item.title" class="input-title" placeholder="标题" :maxlength="16" show-word-limit></el-input>
                <br>副标题:
                <el-input v-model="item.subTitle" type="textarea" class="input-secondary-content" placeholder="副标题" :autosize="{minRows: 4, maxRows: 6}" :maxlength="120" show-word-limit></el-input>
                <br>内 &nbsp; 容:
                <el-input v-model="item.content" type="textarea" class="input-secondary-content" placeholder="内容" :autosize="{minRows: 4, maxRows: 6}" :maxlength="120" show-word-limit></el-input>
              </el-tab-pane>
            </el-tabs>
          </div>
          <el-button type="primary" plain v-else @click="addModules(1)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">机构使命</h4>
          <div class="form-item-border">
            标题:
            <el-input placeholder="标题" class="input-title" v-model="formData.mission.title" :maxlength="16" show-word-limit></el-input>
            <br>内容:
            <el-input v-model="formData.mission.content" class="input-content-lable" type="textarea" placeholder="内容" :autosize="{minRows: 2, maxRows: 6}" :maxlength="100" show-word-limit></el-input>
            <div @click="uptype(5)">
              图片:
              <el-upload class="mission-img" :action="imgUploadPath" accept="image/*" style="margin:10px 0" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="formData.mission.imgUrl" :src="formData.mission.imgUrl" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
              </el-upload>
            </div>
            <div class="add-ability">
              <el-input v-model="ability" :maxlength="8" show-word-limit placeholder="添加能力"></el-input>
              <el-button type="text" @click="addAbility">添 加</el-button>
            </div>
            <el-tag
              v-for="(item,index) in formData.mission.cultivateAbility"
              :key="index"
              closable
              type="primary"
              @close="handleCloseTag(item)"
              style="margin-right: 14px">
              {{item}}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item>
          <h4 class="title">教学态度</h4>
          <el-tabs v-if="formData.teachingAttitude.length > 0" v-model="activeName[2]" type="border-card" editable @edit="handleTeachingAttitudeTabsEdit">
            <el-tab-pane v-for="(item, index) in formData.teachingAttitude" :name="`${index}`" :key="'teaching' + index" :label="'态度' + (index + 1)">
              标题:
              <el-input placeholder="标题" class="input-title" v-model="item.title" :maxlength="16" show-word-limit></el-input>
              <br>内容:
              <el-input placeholder="内容" class="input-secondary-content" v-model="item.content" :maxlength="16" show-word-limit></el-input>
              <div @click="uptype(6, index)">
                图片:
                <el-upload :class="item.url ? 'avatar-uploader' : 'basic-avatar-uploader-tyle'" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                  <img v-if="item.url" :src="item.url" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
                </el-upload>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-button type="primary" plain v-else @click="addModules(2)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">课程介绍</h4>
          <el-tabs v-if="formData.courseIntroduction.length > 0" v-model="activeName[3]" type="border-card" editable @edit="handleCourseIntroductionTabsEdit">
            <el-tab-pane v-for="(item, index) in formData.courseIntroduction" :name="`${index}`" :key="'courseIntroduction' + index" :label="'课程' + (index + 1)">
              标题:
              <el-input placeholder="标题" class="input-title" v-model="item.title" :maxlength="16" show-word-limit></el-input>
              <br>内容:
              <el-input v-model="item.content" class="input-secondary-content" type="textarea" placeholder="内容" :autosize="{minRows: 4, maxRows: 6}" :maxlength="120" show-word-limit></el-input>
              <div @click="uptype(7, index)">
                图片:
                <el-upload :class="item.courseImgUrl ? 'avatar-uploader' : 'basic-avatar-uploader-tyle'" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                  <img v-if="item.courseImgUrl" :src="item.courseImgUrl" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
                </el-upload>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-button type="primary" plain v-else @click="addModules(3)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">师资力量</h4>
          <el-tabs v-if="formData.teacherResource.length > 0" v-model="activeName[4]" type="border-card" editable @edit="handleTeacherResourceTabsEdit">
            <el-tab-pane v-for="(item, index) in formData.teacherResource" :name="`${index}`" :key="'teacherResource' + index" :label="'老师' + (index + 1)">
              职位:
              <el-input placeholder="职位" class="input-title" :maxlength="16" show-word-limit v-model="item.post"></el-input>
              <br>姓名:
              <el-input placeholder="姓名" class="input-title" :maxlength="16" show-word-limit v-model="item.name"></el-input>
              <br>简介:
              <el-input v-model="item.profile" class="input-secondary-content" type="textarea" placeholder="简介" :autosize="{minRows: 2, maxRows: 6}" :maxlength="60" show-word-limit></el-input>
              <div @click="uptype(8, index)">
                头像:
                <el-upload :class="item.headerUrl ? 'avatar-uploader' : 'basic-avatar-uploader-tyle'" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                  <img v-if="item.headerUrl" :src="item.headerUrl" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
                </el-upload>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-button type="primary" plain v-else @click="addModules(4)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">明星学员</h4>
          <el-tabs v-if="formData.students.length > 0" v-model="activeName[5]" type="border-card" editable @edit="handleStudentTabsEdit">
            <el-tab-pane v-for="(item, index) in formData.students" :name="`${index}`" :key="'students' + index" :label="'学员' + (index + 1)">
              姓名:
              <el-input placeholder="姓名" class="input-title" :maxlength="16" show-word-limit v-model="item.name"></el-input>
              <br>简介:
              <el-input v-model="item.info" class="input-secondary-content" type="textarea" placeholder="简介" :autosize="{minRows: 2, maxRows: 6}" :maxlength="60" show-word-limit></el-input>
              <div @click="uptype(9, index)">
                头像:
                <el-upload :class="item.headerUrl ? 'avatar-uploader' : 'basic-avatar-uploader-tyle'" :action="imgUploadPath" accept="image/*" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                  <img v-if="item.headerUrl" :src="item.headerUrl" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
                </el-upload>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-button type="primary" plain v-else @click="addModules(5)"><i class="el-icon-plus"></i>添加模块</el-button>
        </el-form-item>
        <el-form-item>
          <h4 class="title">快速报名</h4>
          <el-input placeholder="标题" v-model="formData.rapidApply.title" :maxlength="15" show-word-limit></el-input>
          <el-input placeholder="电话" :maxlength="16" show-word-limit v-model="formData.rapidApply.phone"></el-input>
          <el-input placeholder="提示语" :maxlength="30" show-word-limit v-model="formData.rapidApply.tips"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PhonePreview from '@/views/infoService/components/preview/PhonePreview'
export default {
  name: 'NewsInformation',
  components: {
    PhonePreview
  },
  props: {
    // 编辑后的数据
    updateFormData: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return {}
      }
    },
    // 模板样式
    cardStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imgUploadPath: process.env.VUE_APP_UPLOAD_URL, // 上传图片地址
      imgType: [null, 0],
      delImgTtpe: null,
      activeName: ['0', '0', '0', '0', '0', '0'],
      ability: '', // 机构使命： 能力
      formData: {}
    }
  },
  created() {
    if (this.updateFormData.logoUrl) {
    // 保存至作品后的数据
      this.formData = this.updateFormData
    }
    this.createQrCode()
    this.cardStyle = this.cardStyle.toLocaleLowerCase()
  },
  methods: {
    // 删除的数据类型
    deltype(item) {
      this.delImgTtpe = item
    },
    // 上传的图片类型
    uptype(item, index) {
      this.imgType = [item, index]
    },
    // 上传图片（上传成功后执行）
    handleAvatarSuccess(res, file, files) {
      if (file.response) {
        console.log(this.imgType, '判断更换的图片')
        switch (this.imgType[0]) {
          case 0:
            // logo图
            this.formData.logoUrl = null
            this.formData.logoUrl = file.response.data[0].downloadPath
            break
          // 教学环境图
          case 1:
            this.formData.educationEnvironment[this.imgType[1]].imgUrl = null
            this.formData.educationEnvironment[this.imgType[1]].imgUrl =
              file.response.data[0].downloadPath
            break
          // 办学理念图
          case 2:
            this.formData.educationPurpose.url = null
            this.formData.educationPurpose.url = file.response.data[0].downloadPath
            break
          case 3:
            // 办学理念宣传图
            this.formData.educationPurpose.bgUrl = null
            this.formData.educationPurpose.bgUrl = file.response.data[0].downloadPath
            break
          case 4:
            // 信息普及图
            this.formData.popularizationInfo.url = null
            this.formData.popularizationInfo.url =
              file.response.data[0].downloadPath
            break
          // 机构使命图
          case 5:
            this.formData.mission.imgUrl = null
            this.formData.mission.imgUrl = file.response.data[0].downloadPath
            break
          // 教学态度图
          case 6:
            this.formData.teachingAttitude[this.imgType[1]].url = null
            this.formData.teachingAttitude[this.imgType[1]].url =
              file.response.data[0].downloadPath
            break
          // 课程介绍图
          case 7:
            this.formData.courseIntroduction[this.imgType[1]].courseImgUrl = null
            this.formData.courseIntroduction[this.imgType[1]].courseImgUrl =
              file.response.data[0].downloadPath
            break
          // 师资介绍图
          case 8:
            this.formData.teacherResource[this.imgType[1]].headerUrl = null
            this.formData.teacherResource[this.imgType[1]].headerUrl =
              file.response.data[0].downloadPath
            break
          // 明星学员图
          default:
            this.formData.students[this.imgType[1]].headerUrl = null
            this.formData.students[this.imgType[1]].headerUrl =
              file.response.data[0].downloadPath
        }
      }
    },
    // 限制图片大小(上传之前的判断)
    beforeAvatarUpload(file) {
      const imageStyleJPG = file.type === 'image/jpeg'
      const imageStylePNG = file.type === 'image/png'
      const imageStyleJPEG = file.type === 'image/jpeg'
      const imageSize = file.size / 1024 / 1024 < 1
      if (!imageStyleJPG && !imageStylePNG && !imageStyleJPEG) {
        this.$message.error('上传头像图片只能是 JEPG、JPG、PNG格式!')
      }
      if (!imageSize) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      this.loading = true
      return (imageStyleJPG || imageStylePNG || imageStyleJPEG) && imageSize
    },
    // 添加模块
    addModules(item) {
      switch (item) {
        case 0:
          this.formData.educationEnvironment.push({
            imgUrl: '',
            title: '教学环境'
          })
          break
        case 1:
          this.formData.popularizationInfo.content.push({
            title: '知识点普及',
            subTitle:
              '我们是一所专门为0-3岁孩子开设的全日制托育学校，以培养“又幸福能力的人”为目标，务实孩子成长基石',
            content:
              '科学证明，在婴儿时期的学习效率比其他年龄短更高的，蒙台梭利曾表明：“人出生头三年的教育胜过以后发展的各个阶段，胜过三岁直到死亡的总和”。0-3岁是人一生教育的黄金阶段。欧美等发达国家的0-3岁托育率远高于中国'
          })
          break
        case 2:
          this.formData.teachingAttitude.push({
            title: '尊重',
            content: '尊重孩子的意愿',
            url: ''
          })
          break
        case 3:
          this.formData.courseIntroduction.push({
            courseImgUrl: '',
            title: '适合学龄前学员',
            content: '以培养听说能力为主，让孩子爱上学习'
          })
          break
        case 4:
          this.formData.teacherResource.push({
            headerUrl: '',
            name: '贝多芬',
            post: '音乐老师',
            profile: '以培养听说能力为主，让孩子爱上学习'
          })
          break
        default:
          this.formData.students.push({
            headerUrl: '',
            name: '小明',
            info: '这是我们最优秀的学员了'
          })
      }
    },
    // 教学环境（删除/添加）
    handleeducationEnvironmentTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.educationEnvironment.length < 4) {
          this.formData.educationEnvironment.push({
            imgUrl: '',
            title: '教学环境'
          })
        } else {
          this.$message({
            message: '[教学环境]最多允许上传4条数据',
            type: 'warning'
          })
        }
      } else {
        this.activeName[0] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.educationEnvironment.splice(targetName, 1)
      }
    },
    // 信息普及（删除/添加）
    handlePopularizationInfoTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.popularizationInfo.content.length < 4) {
          this.formData.popularizationInfo.content.push({
            title: '知识点普及',
            subTitle:
              '我们是一所专门为0-3岁孩子开设的全日制托育学校，以培养“又幸福能力的人”为目标，务实孩子成长基石',
            content:
              '科学证明，在婴儿时期的学习效率比其他年龄短更高的，蒙台梭利曾表明：“人出生头三年的教育胜过以后发展的各个阶段，胜过三岁直到死亡的总和”。0-3岁是人一生教育的黄金阶段。欧美等发达国家的0-3岁托育率远高于中国'
          })
        } else {
          this.$message({
            message: '[信息普及]最多允许上传4条数据',
            type: 'warning'
          })
        }
      } else {
        this.activeName[1] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.popularizationInfo.content.splice(targetName, 1)
      }
    },
    // 教学态度（删除/添加）
    handleTeachingAttitudeTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.teachingAttitude.length < 4) {
          this.formData.teachingAttitude.push({
            title: '尊重',
            content: '尊重孩子的意愿',
            url: ''
          })
        } else {
          this.$message({
            message: '[教学态度]最多允许上传4条数据',
            type: 'warning'
          })
        }
      } else {
        this.activeName[2] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.teachingAttitude.splice(targetName, 1)
      }
    },
    // 课程介绍（删除/添加）
    handleCourseIntroductionTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.courseIntroduction.length < 10) {
          this.formData.courseIntroduction.push({
            courseImgUrl: '',
            title: '适合学龄前学员',
            content: '以培养听说能力为主，让孩子爱上学习'
          })
        } else {
          this.$message({
            message: '[课程介绍]最多允许上传10条课程数据',
            type: 'warning'
          })
        }
      } else {
        this.activeName[3] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.courseIntroduction.splice(targetName, 1)
      }
    },
    // 师资（删除/添加）
    handleTeacherResourceTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.teacherResource.length < 10) {
          this.formData.teacherResource.push({
            headerUrl: '',
            name: '贝多芬',
            post: '音乐老师',
            profile: '以培养听说能力为主，让孩子爱上学习'
          })
        } else {
          this.$message({
            message: '最多允许添加10位老师',
            type: 'warning'
          })
        }
      } else {
        this.activeName[4] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.teacherResource.splice(targetName, 1)
      }
    },
    // 明星学员（删除/添加）
    handleStudentTabsEdit(targetName, action) {
      if (action === 'add') {
        if (this.formData.students.length < 10) {
          this.formData.students.push({
            headerUrl: '',
            name: '小明',
            info: '这是我们最优秀的学员了'
          })
        } else {
          this.$message({
            message: '最多添加上传10位学员',
            type: 'warning'
          })
        }
      } else {
        this.activeName[5] = Number(targetName) ? `${targetName - 1}` : `${targetName}`
        this.formData.students.splice(targetName, 1)
      }
    },
    // 机构使命： 添加新能力
    addAbility() {
      if (this.ability) {
        // 去除默认数据
        this.formData.mission.cultivateAbility = this.formData.mission.cultivateAbility.filter(item => item !== '新能力')
        if (this.formData.mission.cultivateAbility.find(item => item === this.ability)) {
          this.$message({ message: '已添加了该能力，请勿再次添加', type: 'warning' })
        } else {
          this.formData.mission.cultivateAbility.push(this.ability)
        }
      } else {
        this.$message({ message: '请先输入您的能力', type: 'warning' })
      }
      this.ability = ''
    },
    // 删除能力
    handleCloseTag(value) {
      this.formData.mission.cultivateAbility = this.formData.mission.cultivateAbility.filter(item => item !== value)
    },
    // 生成报名二位码
    createQrCode() {
      if (this.organizationInfo.openWechatDeploy) {
        // 已嫁接公众号
        this.formData.rapidApply.url = `${process.env.VUE_APP_PARENT_URL}/#/scanCode?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
      }
    }
  },
  computed: {
    ...mapGetters(['currentBranch', 'organizationInfo'])
  }
}
</script>

<style lang="stylus" scoped>
.container
  display flex
  .form
    border 1px solid #DCDFE6
    box-sizing border-box
    margin-left 14px
    // height 640px
    overflow-y auto
    .el-form
      .avatar-uploader
        margin-left 62px
        width 190px
      .basic-avatar-uploader-tyle
        border 1px dashed #ccc
        width 148px
        height 128px
        display flex
        justify-content center
        flex-wrap wrap
        align-items center
        margin 10px 0 30px 0
        position relative
        >>>.el-upload
          width 100%
        >>>.el-upload__tip
          width 200px
          position absolute
          top 122px
          left -3px
      .title
        color #f60
        background #f2f2f2
        margin-top 0
        padding 6px 14px
  .avatar
    width 140px
    max-height 160px
    display block
@media screen and (min-width: 1400px)
  .container
    .form
      height 70vh
@media screen and (max-width: 1400px)
  .container
    .form
      height 96vh
>>>.el-tabs__header
  background #fff
  .el-tabs__new-tab
    // float none
    width 60px
    margin -1px
    border 1px solid #ccc
    color #909399
    padding 10px
    background #fff
    outline-color $color-border-1
    &::after
      content '添加模板'
    &:hover
      color $color-primary
  .el-tabs__nav-wrap
    .el-tabs__item
      border 1px solid #DCDFE6
      .el-icon-close
        display none
        &:hover
          background $color-primary
          display inline-block
>>>.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active
  border-bottom 1px solid #fff
  .el-icon-close
    display inline-block
>>>.el-input
  margin 6px 0
// 添加能力
.add-ability
  display flex
  justify-content space-between
  align-items center
  .el-input
    width 480px
  .el-button
    margin 0 20px
.el-upload__tip
  color #ff6600
.input-title
  width 280px
  margin-left 30px
.input-content-lable
  width 390px
  margin-left 30px
.input-secondary-content
  width 344px
  margin-left 30px
  margin-top 10px
.form-item-border
  border 1px solid #eeeeee
  padding 5px 0px 0px 14px
  box-shadow -3px 3px 3px #eeeeee
.secondary-img
  margin-left 92px
.popularization-info-img
  margin-left 78px
.mission-img
  margin-left 62px !important
// 模板预览
.phone
  .phone-template
    width 310px
    height 580px
    background-image url("../../../../assets/iphoneBorder.png")
    background-size 100% 100%
    box-sizing border-box
    padding 30px 10px 0px 10px
    position relative
    .phone-preview
      width 290px
      height 300px
      background-color #fff
@media screen and (min-width: 1300px)
  .phone
    .phone-template
      width 310px
      height 640px
      background-image url("../../../../assets/iphoneBorder.png")
      background-size 100% 100%
      box-sizing border-box
      padding 30px 10px 0px 10px
      .phone-preview
        width 290px
        height 580px
        overflow-y auto
        background-color #fff
</style>
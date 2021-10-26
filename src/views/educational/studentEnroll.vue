<template>
  <div class="student-enroll-wrapper">
    <el-steps :active="currentStep" finish-status="success" simple>
      <el-step title="1. 确认学员基本信息"></el-step>
      <el-step title="2. 选择报名课程"></el-step>
      <el-step title="3. 支付信息"></el-step>
    </el-steps>
    <el-form v-if="currentStep === 0" ref="studentInfo" class="enroll-form form-wrapper" style="max-width: 950px;" :model="studentInfo" :rules="studentRules" inline label-width="100px">
      <p class="title stu-info-title">基础信息</p>
      <transition name="el-fade-in">
        <p v-show="duplicateNameList.length > 0" class="warning-tip">
          <i class="el-icon-warning" />
          <span>本校区已有该信息的学员，点击</span>
          <a @click="showDuplicate = true">查看学员</a>
        </p>
      </transition>
      <el-form-item label="姓名" prop="name">
        <el-input v-model.trim="studentInfo.name" @blur="validateUserName" placeholder="请填写学员姓名" :maxlength="20" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="studentInfo.nickName" placeholder="请填写学员昵称" :maxlength="20" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="studentInfo.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
          <el-radio :label="0">未知</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="年龄" prop="birthday">
        <el-input-number v-model="studentInfo.age" @change="handleAgeChange" :controls="false" placeholder="年龄" :min="0" :max="128" style="width: 80px; margin-right: 12px;" />
        <el-date-picker v-model="studentInfo.birthday" value-format="yyyy-MM-dd" placeholder="生日" @change="handleBirthdayChange" style="width: 210px;"></el-date-picker>
      </el-form-item>
      <el-form-item label="来源渠道" prop="provenanceId">
        <el-select v-model="studentInfo.provenanceId" placeholder="请选择渠道类型">
          <el-option v-for="item in sourceList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="主要联系人" required>
        <el-form-item
          prop="primaryContactName"
          :rules="{ required: true, message: '请填写家长/联系人姓名', trigger: ['change', 'blur'] }"
          style="margin-bottom: 0;">
          <el-input v-model="studentInfo.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20" style="width: 180px;"/>
        </el-form-item>
        <el-form-item
          prop="relationId"
          :rules="{ required: true, message: '请选择关系', trigger: ['change', 'blur'] }"
          style="margin-bottom: 0;">
          <el-select v-model="studentInfo.relationId" placeholder="选择关系" style="width: 100px;">
            <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="primaryContactPhone"
          :rules="[
            { required: true, message: '请填写主要联系人的手机号码', trigger: 'blur' },
            { validator: phoneValidator, message: '请填写正确的手机号码', trigger: ['change', 'blur'] },
          ]"
          style="margin-bottom: 0;">
          <el-input v-model="studentInfo.primaryContactPhone" placeholder="手机号码"/>
        </el-form-item>
      </el-form-item>-->
      <el-form-item label="主要联系人">
        <el-form-item prop="primaryContactName" style="margin-bottom: 0;">
          <el-input v-model="studentInfo.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20" style="width: 180px;" />
        </el-form-item>
        <el-form-item prop="relationId" style="margin-bottom: 0;">
          <el-select v-model="studentInfo.relationId" placeholder="选择关系" style="width: 100px;">
            <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="primaryContactPhone" style="margin-bottom: 0;">
          <AreaCode ref="mychild" @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
          <el-input v-model="studentInfo.primaryContactPhone" placeholder="手机号码" />
        </el-form-item>
      </el-form-item>
      <p class="title stu-info-title">其他信息</p>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="studentInfo.idCard" placeholder="学员身份证号码" />
      </el-form-item>
      <el-form-item label="推荐人" prop="referrer">
        <el-input v-model="studentInfo.referrer" placeholder="学员推荐人" :maxlength="20" />
      </el-form-item>
      <el-form-item label="学校" prop="school">
        <el-autocomplete v-model="studentInfo.school" @focus="_getSchoolList" value-key="name" :fetch-suggestions="filterSchool" placeholder="请填写学校名称（可快捷搜索）" />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-select v-model="studentInfo.grade" placeholder="学员所在年级" clearable>
          <el-option v-for="item in gradeList" :key="item" :value="item" :label="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="家庭住址" prop="address">
        <el-input v-model="studentInfo.address" placeholder="学员家庭住址(最多50个字)" :maxlength="50" style="width: 624px;" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="studentInfo.remark" :rows="4" placeholder="备注信息(最多120个字)" :maxlength="120" show-word-limit style="width: 624px;" />
      </el-form-item>
      <div class="bottom-btns">
        <el-button @click="prevStep">取消</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </el-form>
    <div v-else-if="currentStep === 1" class="enroll-form " style="padding: 10px;" v-loading="courseLoading">
      <div class="option-btns">
        <label>报名方式</label>
        <el-button icon="el-icon-circle-plus-outline" type="text" size="default" @click="showSelectCourse= true">选课报名</el-button>
        <el-button icon="el-icon-circle-plus-outline" type="text" size="default" @click="showSelectTuition = true">选择学杂</el-button>
      </div>
      <div class="course-container">
        <template v-if="selectedCourseList.length > 0">
          <p class="title">
            选择的课程
            <span style="float: right; font-weight: normal;" v-if="totalCoursePrice > 0">
              总计金额：
              <span class="color-danger">{{totalCoursePrice}}元</span>
            </span>
          </p>
          <el-table :data="selectedCourseList" class="course-table left-right-boder">
            <el-table-column prop="name" label="课程名称">
              <template slot-scope="scope">
                <inline-select v-if="studentInfo.id" v-model="scope.row.addCourseStatus" :options="[ { value: 0, label: '新报' }, { value: 1, label: '续报' } ]" class="el-tag el-tag--small" :class="scope.row.addCourseStatus ? 'el-tag--warning' : 'el-tag--success'" style="margin-right: 6px;" />
                {{scope.row.name}}
              </template>
            </el-table-column>
            <el-table-column prop="valuationTypeStr" label="收费套餐" width="120" align="center">
              <el-select slot-scope="scope" v-model="scope.row.priceId" placeholder="选择套餐" @change="handlePriceEntityChange(scope.row)">
                <el-option v-for="item in scope.row.priceEntityList" :key="item.id" :value="item.id" :label="item.name">
                  <!-- <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.valuationTypeStr }}</span>-->
                </el-option>
              </el-select>
            </el-table-column>
            <el-table-column prop="classHourSignalPrice" label="课程单价" width="120" align="center">
              <template slot-scope="scope">
                <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                  <el-input-number v-model="scope.row.classHourSignalPrice" @change="handlePriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                  <span class="append-unit">元/课时</span>
                </div>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元/期</span>
                  <span v-if="scope.row.valuationType === 2">
                    <el-input-number v-model="scope.row.timeSinglePrice" @change="handlePriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                    <span class="append-unit">元/{{sendTimeType[scope.row.timeType].date}}</span>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="classHour" label="购买课程" width="80" align="center">
              <template slot-scope="scope">
                <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                  <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.classHour" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                  <span class="append-unit">课时</span>
                </div>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span v-if="scope.row.valuationType === 2">
                    <el-input-number v-model="scope.row.timeCount" @change="handlePriceChange(scope.row)" :precision="0" :min="0" :max="99999999" :controls="false"></el-input-number>
                    <span class="append-unit">{{scope.row.timeTypeStr}}</span>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sendClassHour" label="赠送课程" width="100" align="center">
              <template slot-scope="scope">
                <div class="right-unit-number" v-if="scope.row.enableClassHour !== 0">
                  <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.sendClassHour" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                  <span class="append-unit">课时</span>
                </div>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">--</span>
                  <div class="send-class-box" v-if="scope.row.valuationType === 2">
                    <el-input-number @change="handlePriceChange(scope.row)" v-model="scope.row.sendTimeCount" :min="0" :max="99999" :controls="false" :step-strictly="true"></el-input-number>
                    <el-select style="width: 60%" v-model="scope.row.sendTimeUnit" placeholder="选择类型" @change="computeDeadline(scope.row)">
                      <el-option style="width: 100%" v-for="item in timeTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                    </el-select>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sendClassHour" label="总时间" width="80" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour + scope.row.classHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">--</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time}} 天</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="validTime" label="截止日期" width="150" align="center">
              <template slot-scope="scope">
                <el-date-picker
                  v-if="scope.row.valuationType !== 1"
                  v-model="scope.row.validTime"
                  type="date"
                  style="width: 130px"
                  :picker-options="pickerOptions"
                  value-format="yyyy-MM-dd"
                  placeholder="选择日期">
                </el-date-picker>
                <span v-if="scope.row.valuationType === 1">{{scope.row.periodStartDate ? scope.row.periodStartDate + '--' + scope.row.periodEndDate : '- -'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="课程均价" width="120" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.enableClassHour !== 0">{{Number((scope.row.price/(scope.row.sendClassHour + scope.row.classHour)).toFixed(2)) || 0}}元/课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元/期</span>
                  <span
                    v-if="scope.row.valuationType === 2"
                  >{{(scope.row.price / (scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time)).toFixed(2)}} 元/天</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="originPrice" label="课程价格" width="120" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.enableClassHour !== 0" class="append-unit">
                  {{Number(scope.row.originPrice) || 0}}元
                </span>
              <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元</span>
                <span v-if="scope.row.valuationType === 2">
                  {{scope.row.timeCount * scope.row.timeSinglePrice}}元
                </span>
              </div>
            </template>
            </el-table-column>
            <el-table-column label="优惠" width="160" align="center">
              <div class="customer-input" slot-scope="scope">
                <el-select v-model="scope.row.discountType" @change="handlePriceChange(scope.row)" placeholder="请选择">
                  <el-option label="优惠" :value="1"></el-option>
                  <el-option label="折扣" :value="0"></el-option>
                </el-select>
                <!-- 优惠价格 -->
                <template v-if="scope.row.discountType === 1">
                  <el-input-number v-model="scope.row.discountPrice" @change="handlePriceChange(scope.row)" :precision="2" :controls="false" :min="0" :max="scope.row.originPrice" class="left-number"></el-input-number>
                  <span class="append-unit">元</span>
                </template>
                <!-- 优惠折扣 -->
                <template v-else>
                  <el-input-number v-model="scope.row.discountFolding" @change="handlePriceChange(scope.row)" :precision="1" :controls="false" :min="0" :max="10" class="left-number"></el-input-number>
                  <span class="append-unit">折</span>
                </template>
              </div>
            </el-table-column>
            <el-table-column prop="price" label="应付金额" width="120" align="center">
              <div class="right-unit-number" slot-scope="scope">
                <el-input-number v-model="scope.row.price" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                <span class="append-unit">元</span>
              </div>
            </el-table-column>
            <el-table-column label="操作" width="54" align="center" fixed="right">
              <el-button slot-scope="scope" type="text" icon="el-icon-delete" @click="deleteCourse(scope.row, scope.$index)" size="normal" title="删除课程"></el-button>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="selectedTuitionList.length > 0">
          <p class="title">
            选择的学杂
            <span style="float: right; font-weight: normal;" v-if="totalTuitionPrice > 0">
              总计金额：
              <span class="color-danger">{{totalTuitionPrice}}元</span>
            </span>
          </p>
          <el-table :data="selectedTuitionList" class="left-right-boder">
            <el-table-column prop="name" label="学杂名称">
              <template slot-scope="scope">
                <span>{{scope.row.name}}</span>
                <span v-if="scope.row.courseName" class="color-primary" style="font-size: 10px; margin-left: 12px">({{scope.row.courseName}})</span>
              </template>
            </el-table-column>
            <el-table-column prop="originPrice" label="学杂原价" width="160">
              <template slot-scope="scope">{{ scope.row.originPrice }}元</template>
            </el-table-column>
            <el-table-column prop="singlePrice" label="购买单价" width="160" align="center">
              <div class="right-unit-number" slot-scope="scope">
                <el-input-number v-model="scope.row.singlePrice" @change="handleTuitionPriceChange(scope.row)" :precision="2" :min="0" :max="99999999" :controls="false"></el-input-number>
                <span class="append-unit">元</span>
              </div>
            </el-table-column>
            <el-table-column prop="tuitionNum" label="购买数量" align="center" width="120">
              <el-input-number slot-scope="scope" v-model="scope.row.tuitionNum" @change="handleTuitionPriceChange(scope.row)" :min="1" :max="99999" :controls="false" :step-strictly="true" />
            </el-table-column>
            <el-table-column prop="price" label="应付金额" width="144" align="center">
              <template slot-scope="scope">{{scope.row.price}}元</template>
            </el-table-column>
            <el-table-column label="操作" width="84" align="center">
              <el-button
                slot-scope="scope"
                type="text"
                icon="el-icon-delete"
                :disabled="scope.row.mustTuition === 1"
                @click="deleteTuition(scope.row, scope.$index)"
                size="normal"
                :title="scope.row.mustTuition === 1 ? '已选课程中必须包含该学杂' : '删除学杂'"
              ></el-button>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="selectedCourseList.length == 0 && selectedTuitionList.length == 0">
          <div class="no-select-data">
            <img :src="require('@/assets/icon_no_data.svg')" alt=""/>
            <span>请选择课程或学杂</span>
          </div>
        </template>
      </div>
      <div class="bottom-btns">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>
    <div v-else-if="currentStep === 2" class="enroll-form">
      <p class="title">订单信息</p>
      <template v-if="selectedCourseList.length > 0">
        <el-table :data="selectedCourseList" border>
          <el-table-column prop="name" label="课程名称">
            <template slot-scope="scope">
              <el-tag :type="scope.row.addCourseStatus ? 'warning' : 'success'">{{scope.row.addCourseStatu ? '续报' : '新报'}}</el-tag>
              {{scope.row.name}}
            </template>
          </el-table-column>
          <el-table-column prop="valuationTypeName" label="收费套餐" width="110" align="center"></el-table-column>
          <el-table-column prop="classHourSignalPrice" label="课程单价" width="110" align="center">
              <template slot-scope="scope">
                  <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.classHourSignalPrice}}元/课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">
                    {{scope.row.periodPrice}}元/期
                  </span>
                  <span v-if="scope.row.valuationType === 2">
                    {{scope.row.timeSinglePrice}}元/{{sendTimeType[scope.row.timeType].date}}
                  </span>
                </div>
              </template>
            </el-table-column>
          <el-table-column prop="classHour" label="购买课程" width="80" align="center">
            <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.classHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.timeCount + scope.row.timeTypeStr}}</span>
                </div>
              </template>
          </el-table-column>
          <el-table-column prop="sendClassHour" label="赠送课程" width="80" align="center">
            <template slot-scope="scope">
                  <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">--</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount + sendTimeType[scope.row.sendTimeUnit].date}}</span>
                </div>
              </template>
          </el-table-column>

          <el-table-column prop="originPrice" label="总时间" width="80" align="center">
            <template slot-scope="scope">
                <span v-if="scope.row.enableClassHour !== 0">{{scope.row.sendClassHour + scope.row.classHour}}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">--</span>
                  <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time}} 天</span>
                </div>
              </template>
          </el-table-column>
          <el-table-column prop="validTime" label="截止日期" width="100" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType !== 1">{{scope.row.validTime || '--'}}</span>
                <span v-if="scope.row.valuationType === 1">{{scope.row.periodStartDate ? scope.row.periodStartDate + '- -' + scope.row.periodEndDate : '- -'}}</span>
              </template>
            </el-table-column>
          <el-table-column prop="originPrice" label="课程均价" width="110" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.enableClassHour !== 0">{{Number((scope.row.price/(scope.row.sendClassHour + scope.row.classHour)).toFixed(2)) || 0}}元/课时</span>
              <span v-if="scope.row.enableClassHour === 0">
                <span v-if="scope.row.valuationType === 1">{{scope.row.price}}元/期</span>
                <span v-if="scope.row.valuationType === 2">{{(scope.row.price / (scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time)).toFixed(2)}} 元/天</span>
              </span>
              </template>
          </el-table-column>
          <el-table-column prop="originPrice" label="课程价格" width="100" align="center">
            <template slot-scope="scope">
                <span v-if="scope.row.enableClassHour !== 0" class="append-unit">
                  {{Number(scope.row.originPrice).toFixed(0) || 0}}元
                </span>
              <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                <span v-if="scope.row.valuationType === 1">{{scope.row.periodPrice}}元</span>
                <span v-if="scope.row.valuationType === 2">
                  {{scope.row.timeCount * scope.row.timeSinglePrice}}元
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优惠" width="80" align="center">
            <template slot-scope="scope">{{scope.row.discountType === 1 ? (scope.row.discountPrice + '元') : (scope.row.discountFolding + '折')}}</template>
          </el-table-column>
          <el-table-column prop="price" label="应付金额" width="120" align="center">
            <template slot-scope="scope">{{scope.row.price}} 元</template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="selectedTuitionList.length > 0">
        <el-table :data="selectedTuitionList" border>
          <el-table-column prop="name" label="学杂名称"></el-table-column>
          <el-table-column prop="originPrice" label="学杂原价" align="center">
            <template slot-scope="scope">{{ scope.row.originPrice}}元</template>
          </el-table-column>
          <el-table-column prop="singlePrice" label="购买单价" align="center">
            <template slot-scope="scope">{{ scope.row.singlePrice}}元</template>
          </el-table-column>
          <el-table-column prop="tuitionNum" label="购买数量" align="center"></el-table-column>
          <el-table-column prop="price" label="应付金额" align="center">
            <template slot-scope="scope">{{scope.row.price}}元</template>
          </el-table-column>
        </el-table>
      </template>

      <p class="title">支付信息</p>
      <el-form ref="orderInfo" :model="orderInfo" :rules="orderRules" label-width="80px" size="small" class="form-wrapper" style="padding-left: 10px;">
        <p class="custom-form-item">
          <label>学员姓名</label>
          <span>{{studentInfo.name}}</span>
        </p>
        <p class="custom-form-item">
          <label>应付价格</label>
          <span class="color-danger">￥ {{shouldTotalFee}} 元</span>
        </p>
        <el-form-item prop="recommendUserId" label="经办人" class="recommend-user-item">
          <el-select v-model="orderInfo.recommendUserId" filterable placeholder="请选择经办人">
            <el-option v-for="item in teacherList" :key="item.id" :value="item.id" :label="item.username"></el-option>
          </el-select>
        </el-form-item>
        <p class="recommend-men">
          如没有符合的经办人，
          <font class="recommend-tap" @click="recommendMen">点击此处</font>进行添加
        </p>
        <el-form-item prop="payType" label="支付方式">
          <pay-type v-model="orderInfo.payType"></pay-type>
        </el-form-item>
        <el-form-item prop="totalFee" label="支付金额">
          <el-input-number v-model="orderInfo.totalFee" :controls="false" :min="-99999999" :max="99999999" class="right-number" style="width: 140px;"></el-input-number>
          <span style="margin-right: 20px;">元</span>
          <el-button type="primary" plain @click="orderInfo.totalFee = shouldTotalFee">全额付款</el-button>
        </el-form-item>
        <el-form-item prop="payTime" label="支付时间">
          <el-date-picker v-model="orderInfo.payTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择支付时间"></el-date-picker>
        </el-form-item>
      </el-form>

      <div class="bottom-btns">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep" :loading="submitLoading">确认提交</el-button>
      </div>
    </div>

    <el-dialog title="重复学员" :visible.sync="showDuplicate" :close-on-click-modal="false" class="duplicate-dialog" width="820px">
      <el-table :data="duplicateNameList">
        <el-table-column prop="name" label="姓名" width="120px">
          <p class="username" slot-scope="scope">
            <a class="link" @click="selectDuplicate(scope.row)">{{scope.row.name}}</a>
            <span v-if="scope.row.nickName">({{scope.row.nickName}})</span>
            <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px" />
          </p>
        </el-table-column>
        <el-table-column
          prop="birthday"
          label="年龄"
          width="130px">
          <span slot-scope="scope">{{scope.row.birthday ? (scope.row.age + '岁 (' + scope.row.birthday + ')') : '未填写'}}</span>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="主要联系人"
          width="240">
          <template slot-scope="scope">
            <span v-if="scope.row.primaryContactPhone || scope.row.relation || scope.row.primaryContactName">
              <span v-if="scope.row.primaryContactPhone">{{scope.row.primaryContactPhone + '-'}}</span>
              <span v-if="scope.row.relation">{{scope.row.relation + '-'}}</span>
              <span v-if="scope.row.primaryContactName">{{scope.row.primaryContactName}}</span>
            </span>
            <span v-else>未填写</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注">
          <template slot-scope="scope">
            <span>{{scope.row.remark ? scope.row.remark : '未填写'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="80">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="selectDuplicate(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 选择课程弹窗 -->
    <select-course-dialog v-model="showSelectCourse" @submit="selectCourse" :studentId="studentInfo && studentInfo.id"></select-course-dialog>
    <!-- 选择学杂弹窗 -->
    <select-tuition-dialog v-model="showSelectTuition" @submit="selectTuition"></select-tuition-dialog>
    <!-- 订单详情 -->
    <order-detail-dialog ref="orderDetailDialog" :closeOnModal="false" @close="$router.go(-1)"></order-detail-dialog>
  </div>
</template>

<script>
import SelectCourseDialog from './components/SelectCourseDialog'
import SelectTuitionDialog from './components/SelectTuitionDialog'
import InlineSelect from '@/components/InlineSelect'
import PayType from '@/components/PayType'
import OrderDetailDialog from '../salesManagement/OrderDetailDialog'

import { phoneValidator, idCardValidator } from '../../utils/validate.js'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { PhoneAreaCode } from '@/utils/storage'
import AreaCode from '@/components/PhoneAreaCode'

export default {
  name: 'StudentEnroll',
  data() {
    return {
      /**
       * sendTimeType.date赠送时间类型
       * sendTimeType.time: 对应天、月、季度、半年、年
       */
      sendTimeType: [
        { date: '天', time: 1 },
        { date: '月', time: 30 },
        { date: '季度', time: 90 },
        { date: '半年', time: 180 },
        { date: '年', time: 365 }
      ],
      courses: [], // 回显数据
      showDuplicate: false, // 展示重复学员
      showSelectCourse: false, // 展示选择课程
      showSelectTuition: false, // 展示选择学杂
      submitLoading: false, // 提交加载
      courseLoading: false,
      phoneValidator,
      currentStep: 0,
      relationList: [], // 与学员关系列表
      sourceList: [], // 来源列表
      schoolList: [], // 周边学校列表
      teacherList: [],
      gradeList: [
        '托管',
        '小班',
        '中班',
        '大班',
        '一年级',
        '二年级',
        '三年级',
        '四年级',
        '五年级',
        '六年级',
        '初一',
        '初二',
        '初三',
        '高一',
        '高二',
        '高三'
      ], // 年级列表
      timeTypeList: [
        {
          value: 0,
          label: '天'
        },
        {
          value: 1,
          label: '月'
        },
        {
          value: 2,
          label: '季度'
        },
        {
          value: 3,
          label: '半年'
        },
        {
          value: 4,
          label: '年'
        }
      ],
      duplicateNameList: [], // 重名学员
      // 学员信息
      studentInfo: {
        id: null,
        name: '',
        nickName: '',
        sex: 1,
        birthday: '',
        age: '',
        idCard: '',
        referrer: '',
        remark: '',
        school: '',
        grade: '',
        address: '',
        provenanceId: '',
        relationId: '',
        primaryContactName: '',
        primaryContactPhone: '',
        primaryContactPhoneAreaCode: '+86'
      },
      studentRules: {
        name: { required: true, message: '请填写学员姓名', trgger: 'blur' },
        sex: {
          type: 'number',
          required: true,
          message: '请选择性别',
          trgger: ['blur', 'change']
        },
        provenanceId: {
          required: true,
          message: '请选择渠道类型',
          trgger: 'blur'
        },
        idCard: {
          validator: idCardValidator,
          message: '请填写正确的身份证号码',
          trgger: ['change', 'blur']
        }
      },
      // 选择的课程列表
      selectedCourseList: [],
      // 选择的学杂列表
      selectedTuitionList: [],
      // 支付信息
      orderInfo: {
        payTime: '', // 支付时间
        payType: '', // 支付方式
        totalFee: '', // 实收总价格
        recommendUserId: '' // 订单经办人
      },
      orderRules: {
        payTime: {
          required: true,
          message: '请选择支付时间',
          trigger: 'change'
        },
        payType: {
          required: true,
          message: '请选择支付方式',
          trigger: ['change', 'blur']
        },
        recommendUserId: {
          required: true,
          message: '请选择经办人',
          trigger: 'blur'
        },
        totalFee: { required: true, message: '请填写支付金额', trigger: 'blur' }
      },
      // 允许选择时间
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  components: {
    SelectCourseDialog,
    SelectTuitionDialog,
    InlineSelect,
    PayType,
    OrderDetailDialog,
    AreaCode
  },
  computed: {
    totalCoursePrice() {
      let countPrice = 0
      this.selectedCourseList.forEach((item) => {
        countPrice += Number(item.price) || 0
      })
      return Number(countPrice.toFixed(2))
    },
    totalTuitionPrice() {
      let countPrice = 0
      this.selectedTuitionList.forEach((item) => {
        countPrice += Number(item.price)
      })
      return Number(countPrice.toFixed(2))
    },
    shouldTotalFee() {
      return Number((this.totalCoursePrice + this.totalTuitionPrice).toFixed(2))
    },
    ...mapGetters(['userInfo', 'organizationInfo', 'currentBranch'])
  },
  created() {
    this._getRelationList()
    this._getSourceList()

    if (this.$route.query.studentId) {
      this._getStudentInfo(this.$route.query.studentId)
    } else if (this.$route.query.customerId) {
      this._getCustomerInfo(this.$route.query.customerId)
    }
    this.studentInfo.primaryContactPhoneAreaCode = PhoneAreaCode.getCheck()
  },
  methods: {
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.studentInfo.primaryContactPhoneAreaCode = info
    },
    _getRelationList() {
      this.$http.get('/v1/dictionary/DicRelation/getAll').then((res) => {
        this.relationList = res.data
      })
    },
    _getSourceList() {
      const param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      this.$http
        .get('/v1/dictionary/DicStudentSource/getAll', param)
        .then((res) => {
          this.sourceList = res.data
        })
    },
    _getSchoolList() {
      // 确保只请求一次
      if (this.isRequestSchool) return
      this.isRequestSchool = true
      this.$http
        .get('/v1/SurroundSchool/getSurroundSchoolList', {
          departmentId: this.currentBranch && this.currentBranch.id
        })
        .then((res) => {
          this.schoolList = res.data
        })
    },
    _getStudentInfo(id) {
      this.$http.get('/v1/Student/getStudentById', { id: id }).then((res) => {
        if (res.data) {
          for (const key in this.studentInfo) {
            if (this.studentInfo.hasOwnProperty(key) && res.data[key] != null) {
              this.studentInfo[key] = res.data[key]
            }
          }
          if (res.data.birthday) {
            this.studentInfo.age = Math.abs(
              moment(res.data.birthday).diff(moment(), 'year')
            )
          }
        }
      })
    },
    _getCustomerInfo(id) {
      const that = this
      this.$http
        .get('/v1/PotentialCustomer/getPotentialCustomerById', { id: id })
        .then((res) => {
          if (res.data) {
            setTimeout(function () { that.$refs.mychild.setAreaCode(res.data.phoneAreaCode) }, 100)
            for (const key in this.studentInfo) {
              if (
                this.studentInfo.hasOwnProperty(key) &&
                res.data[key] != null
              ) {
                this.studentInfo[key] = res.data[key]
              }
            }
            this.studentInfo.id = null
            // 计算生日
            this.handleAgeChange(res.data.age)
            // 处理来源
            this.studentInfo.provenanceId = res.data.studentResourceId
          }
        })
    },
    // 获取教师列表
    _getTeacherList() {
      if (this.teacherList.length > 0) return
      this.$http
        .get('/v1/User/getUserList', { departmentId: this.currentBranch.id })
        .then((res) => {
          this.teacherList = res.data
        })
    },
    // 校验学员姓名
    validateUserName() {
      if (this.studentInfo.id) {
        this.duplicateNameList = []
        return
      }
      if (this.studentInfo.name) {
        this.$http
          .get('/v1/Student/getByName', {
            name: this.studentInfo.name,
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id
          })
          .then((res) => {
            res.data.forEach((item) => {
              if (item.birthday) {
                item.birthday = moment(item.birthday).format('YYYY-MM-DD')
                item.age = Math.abs(
                  moment(item.birthday).diff(moment(), 'year')
                )
              }
              switch (item.sex) {
                case 1:
                  item.sexIcon = require('../../assets/icon_male.png')
                  break
                case 2:
                  item.sexIcon = require('../../assets/icon_famale.png')
              }
            })
            this.duplicateNameList = res.data
          })
      }
    },
    // 确定选择学员
    selectDuplicate(row) {
      this._getStudentInfo(row.id)
      this.showDuplicate = false
      this.duplicateNameList = []
    },
    // 年龄发生变化
    handleAgeChange(age) {
      this.studentInfo.birthday = moment()
        .subtract('years', age)
        .format('YYYY-MM-DD')
    },
    // 生日变化
    handleBirthdayChange(birthday) {
      this.studentInfo.age = Math.abs(moment(birthday).diff(moment(), 'year'))
    },
    // 过滤学校
    filterSchool(query, cb) {
      cb(
        this.schoolList.filter((item) => {
          return item.name.indexOf(query) > -1
        })
      )
    },
    // 上一步
    prevStep() {
      if (this.currentStep === 0) {
        if (this.studentInfo.name !== '') {
          this.$confirm('您正在编辑学员的报名信息，是否确定返回？', '提示', {
            type: 'warning'
          }).then(() => {
            this.$router.go(-1)
          })
        } else {
          this.$router.go(-1)
        }
      } else {
        this.currentStep--
      }
    },
    // 下一步
    nextStep() {
      switch (this.currentStep) {
        case 0:
          console.log(this.studentInfo)
          this.$refs.studentInfo.validate((valid) => {
            if (valid) {
              // 如果填写了手机号,则进行手机号正则校验
              // eslint-disable-next-line no-eval
              if (this.studentInfo.primaryContactPhone && !eval(PhoneAreaCode.getCurrentValidate()).test(this.studentInfo.primaryContactPhone)) {
                this.$message.error('请填写正确的主要联系人手机号')
                return
              }
              this.currentStep++
            }
          })
          break
        case 1:
          if (
            this.selectedCourseList.length === 0 &&
            this.selectedTuitionList.length === 0
          ) {
            this.$message.warning('请选择课程或者学杂！')
            return
          }
          if (this.selectedCourseList.length > 0) {
            for (let i = 0; i < this.selectedCourseList.length; i++) {
              const item = this.selectedCourseList[i]
              if (item.priceId == null || item.priceId === '') {
                this.$message.warning('请选择课程收费套餐')
                return
              }
              switch (item.valuationType) {
                case 0:
                  if (item.classHour <= 0) {
                    this.$message.warning('请填写课程课时数')
                    return
                  }
                  break
                case 1:
                  break
                case 2:
                  if (item.timeCount <= 0) {
                    this.$message.warning('请填写课程时间数')
                    return
                  }
                  break
              }
              // 课时情况
              if (item.valuationType === 0 || (item.valuationType === 1 && item.enableClassHour) || (item.valuationType === 2 && item.enableClassHour)) {
                if (item.classHour === 0 || item.classHour === undefined) {
                  return this.$message.warning('请输入购买课时数')
                } else if (item.sendClassHour === undefined) {
                  return this.$message.warning('赠送课程数不能为空')
                }
              } else if (item.valuationType === 2 && item.enableClassHour === 0) {
                if (item.timeCount === 0 || item.timeCount === undefined) {
                  return this.$message.warning('请输入购买课程数')
                } else if (item.sendTimeCount === undefined) {
                  return this.$message.warning('赠送课程数不能为空')
                }
              }
            }
          }
          if (this.selectedTuitionList.length > 0) {
            for (let i = 0; i < this.selectedTuitionList.length; i++) {
              if (this.selectedTuitionList[i].tuitionNum <= 0) {
                this.$message.warning('请填写学杂购买数量')
                return
              }
            }
          }
          this.currentStep++
          if (this.orderInfo.payTime == null || this.orderInfo.payTime === '') {
            this.orderInfo.payTime = moment().format('YYYY-MM-DD HH:mm:ss')
          }
          this._getTeacherList()
          if (this.userInfo.userLogo) {
            this.orderInfo.recommendUserId = this.userInfo.id
          }
          break
        case 2:
          this.$refs.orderInfo.validate((valid) => {
            if (valid) {
              let tip = '请确认报名信息无误，是否继续？'
              if (this.orderInfo.totalFee === 0) {
                tip = '当前支付金额为0。' + tip
              } else if (this.orderInfo.totalFee < this.shouldTotalFee) {
                tip = '支付金额小于应付金额。' + tip
              }
              this.$confirm(tip, '提示', {
                type: 'warning'
              }).then(() => {
                this.enroll()
              })
            }
          })
          break
      }
    },
    filterNull(o) {
      for (var key in o) {
        if (o[key] === null || (typeof o[key] === 'string' && o[key] === '')) {
          delete o[key]
        }
        if (typeof o[key] === 'object') {
          o[key] = this.filterNull(o[key])
        }
      }
      return o
    },
    // 报名
    enroll() {
      // 处理参数
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        studentInfo: this.studentInfo,
        studentCourses: this.selectedCourseList,
        studentTuitions: this.selectedTuitionList,
        order: Object.assign({}, this.orderInfo, {
          goodsName: `学员【${this.studentInfo.name}】报名`,
          shouldTotalFee: this.shouldTotalFee
        })
      }
      if (this.$route.query.customerId) {
        params.potentialCustomerId = this.$route.query.customerId
      }
      this.filterNull(params)
      // 过滤空字符串
      this.submitLoading = true
      this.$http
        .post('/v1/SignUp/addSignUpInfo', params)
        .then((res) => {
          this.$message.success('报名成功！')
          // 显示订单信息
          this.toShowOrderDetail(res.data.orderId)
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    toShowOrderDetail(orderId) {
      this.$refs.orderDetailDialog.open(orderId)
    },
    // 选择了课程
    selectCourse(courses) {
      this.courses = courses
      if (courses == null || courses.length === 0) return
      this.courseLoading = true
      // 从selectedCourseList中移除不在courses中的数据,表示已取消勾选
      for (let i = this.selectedCourseList.length - 1; i >= 0; i--) {
        let hasCourse = courses.find(
          (c) => this.selectedCourseList[i].courseId === c.id
        )
        if (!hasCourse) {
          this.selectedCourseList.splice(i, 1)
        }
      }
      // 移除courses中已存在的课程,以防重复添加
      courses = courses.filter(
        (c) => this.selectedCourseList.find((s) => s.courseId === c.id) == null
      )
      if (courses.length > 0) {
        const ids = courses.map((o) => o.id)
        this.$http
          .get('/v1/Course/getCourseByIdList', {
            ids: ids.join(';'),
            status: 1
          })
          .then((res) => {
            const courseTemp = []
            res.data.forEach((item) => {
              // 处理价格标准
              item.priceEntityList.forEach((price) => {
                switch (price.valuationType) {
                  case 0:
                    price.valuationTypeStr = '课时计费'
                    price.name = price.classHour + '课时'
                    break
                  case 1:
                    price.valuationTypeStr = '按期计费'
                    price.name = price.periodName
                    break
                  case 2:
                    price.valuationTypeStr = '按时间计费'
                    const temp = this.timeTypeList.find(
                      (o) => o.value === price.timeType
                    )
                    if (temp) {
                      price.name = price.timeCount + temp.label
                    } else {
                      // 默认单位 “天”
                      price.name = price.timeCount + '天'
                    }
                    break
                }
                if (price.priceName) {
                  price.name = price.priceName
                }
              })
              // 处理学杂。  包含学杂才处理
              if (
                item.containTuition &&
                item.tuitionFeeEntityList &&
                item.tuitionFeeEntityList.length > 0
              ) {
                const temp = []
                item.tuitionFeeEntityList.forEach((tuition) => {
                  temp.push({
                    courseId: item.id, // 所属课程的ID
                    courseName: item.name, // 所属课程名称
                    tuitionId: tuition.id, // 学杂ID
                    name: tuition.name, // 学杂名称
                    tuitionNum: tuition.tuitionNum || 0, // 学杂数量
                    price: (tuition.tuitionNum || 0) * tuition.price, // 学杂价格
                    inventory: tuition.inventory, // 学杂库存剩余
                    singlePrice: tuition.price, // 学杂单价
                    mustTuition: item.mustTuition, // 为1时，选择课程时，必须包含学杂
                    containTuition: item.containTuition, // 是否包含学杂。  1-是   0-否
                    originPrice: (
                      (tuition.tuitionNum || 0) * tuition.price
                    ).toFixed(2) // 课程原价
                  })
                })
                this.selectedTuitionList = this.selectedTuitionList.concat(temp)
              }
              // 判断有没有已经报过名
              const courseObj = courses.find((o) => o.id === item.id)
              if (courseObj) {
                item.addCourseStatus = courseObj.addCourseStatus
              } else {
                item.addCourseStatus = 0
              }
              // 组装数据
              courseTemp.push({
                validTime: '', // 课程截止日期
                sendTimeUnit: 0, // 赠送课程类型天、月、季度、半年、年
                courseId: item.id,
                addCourseStatus: item.addCourseStatus, // 0-新报    1-续报
                name: item.name, // 课程名称
                classHour: '', // 课时数
                classHourSignalPrice: '', // 课时单价
                periodId: '', // 按期收费
                periodPrice: '', // 每期价格
                periodName: '', // 每期名称
                timeCount: '', // 总时间数。
                timeSinglePrice: '', // 时间单价
                timeType: '', // 天、月、年...
                timeTypeStr: '', // 转义
                valuationType: 0, // 计价方式。默认课时计价
                valuationTypeStr: '',
                mustTuition: item.mustTuition, // 为1时，选择课程时，必须包含学杂
                containTuition: item.containTuition, // 是否包含学杂。  1-是   0-否
                priceId: '', // 价格标准ID
                price: 0, // 课程总价
                priceEntityList: item.priceEntityList, // 价格列表
                discountType: 1, // 0-折扣    1-优惠价
                discountPrice: 0, // 优惠价格
                discountFolding: 10, // 折扣
                sendClassHour: 0, // 赠送课时
                sendTimeCount: 0, // 赠送时间
                originPrice: 0 // 课程原价
              })
            })
            this.selectedCourseList = this.selectedCourseList.concat(courseTemp)
          })
          .finally(() => {
            this.courseLoading = false
          })
      } else {
        this.courseLoading = false
      }
    },
    // 选择了学杂
    selectTuition(tuitions) {
      if (tuitions == null || tuitions.length === 0) return
      const temp = []
      tuitions.forEach((item) => {
        temp.push({
          tuitionId: item.id, // 学杂ID
          name: item.name, // 学杂名称
          tuitionNum: 1, // 学杂数量
          price: (1 * item.price).toFixed(2), // 学杂价格
          inventory: item.inventory, // 学杂库存剩余
          singlePrice: item.price, // 学杂单价
          originPrice: (1 * item.price).toFixed(2) // 课程原价
        })
      })
      this.selectedTuitionList = this.selectedTuitionList.concat(temp)
    },
    // 课程价格标准发生变化
    handlePriceEntityChange(row) {
      // 动态计算截止日期
      this.computeDeadline(row)
      const priceObj = row.priceEntityList.find((o) => o.id === row.priceId)
      if (priceObj) {
        // 选择了价格标准
        row.valuationType = priceObj.valuationType
        row.valuationTypeStr = priceObj.valuationTypeStr
        row.valuationTypeName = priceObj.name
        row.classHour = priceObj.classHour
        // row.classHourSignalPrice = priceObj.classHourSignalPrice
        // row.price = row.classHour * row.classHourSignalPrice
        switch (priceObj.valuationType) {
          case 0:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.classHour = priceObj.classHour
            row.classHourSignalPrice = priceObj.classHourSignalPrice
            row.price = row.classHour * row.classHourSignalPrice
            row.originPrice = Number(
              (row.classHour * row.classHourSignalPrice).toFixed(2)
            )
            break
          case 1:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.periodStartDate = priceObj.periodStartDate // 课程开始日期
            row.periodEndDate = priceObj.periodEndDate // 课程预计结束时间
            row.classHour = priceObj.classHour
            // 按期计费数据并未有课时单价数据，通过计算赋予
            row.classHourSignalPrice = priceObj.enableClassHour === 1 ? Number((priceObj.periodPrice / priceObj.classHour).toFixed(2)) : Number(priceObj.periodPrice)
            row.periodId = priceObj.periodId
            row.periodPrice = Number(priceObj.periodPrice)
            row.periodName = priceObj.periodName
            row.price = Number(priceObj.periodPrice)
            row.originPrice = Number(priceObj.periodPrice)
            break
          case 2:
            row.enableClassHour = priceObj.enableClassHour // 是否启用课时计费1启用 0 不启用
            row.classHour = priceObj.classHour
            // 按天计费数据并未有课时单价数据，通过计算赋予
            row.classHourSignalPrice = priceObj.enableClassHour === 1 ? (Number((priceObj.timeSinglePrice * priceObj.timeCount) / priceObj.classHour).toFixed(2)) : Number(priceObj.timeSinglePrice)
            row.timeCount = priceObj.timeCount
            row.timeSinglePrice = priceObj.timeSinglePrice
            row.timeType = priceObj.timeType
            const timeTypeObj = this.timeTypeList.find(
              (o) => o.value === priceObj.timeType
            )
            if (timeTypeObj) row.timeTypeStr = timeTypeObj.label
            row.price = Number(row.timeCount * row.timeSinglePrice)
            row.originPrice = Number(
              (row.timeCount * row.timeSinglePrice).toFixed(2)
            )
            break
        }
      } else {
        // 默认课时计价
        row.priceId = ''
        row.valuationType = 0
      }
    },
    // 课程价格发生变化
    handlePriceChange(row) {
      // 动态计算截止日期
      this.computeDeadline(row)
      if (row.valuationType === 2 && row.enableClassHour === 0) {
        row.originPrice = Number((row.timeSinglePrice * row.timeCount).toFixed(0))
      } else if (row.valuationType === 1 && row.enableClassHour === 0) { // 解决按期沿用课时后，课程最后还是按期收费出现的问题
        row.originPrice = Number((row.classHourSignalPrice).toFixed(0))
      } else {
        row.originPrice = Number((row.classHour * row.classHourSignalPrice).toFixed(0))
      }
      if (row.discountType === 1) {
        // 优惠价格
        row.price = row.originPrice ? Number(row.originPrice - row.discountPrice) : Number(row.periodPrice - row.discountPrice)
      } else {
        // 折扣
        row.price = ((Number(row.originPrice || row.periodPrice).toFixed(0) * row.discountFolding) / 10).toFixed(2)
      }
    },
    // 学杂价格变化
    handleTuitionPriceChange(row) {
      row.price = Number((row.tuitionNum * row.singlePrice).toFixed(2))
    },
    // 删除课程
    deleteCourse(course, index) {
      this.$confirm(`确定删除课程【${course.name}】吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        // 包含学杂，删除课程携带的学杂
        if (course.containTuition === 1) {
          for (let i = this.selectedTuitionList.length - 1; i >= 0; i--) {
            if (this.selectedTuitionList[i].courseId === course.courseId) {
              this.selectedTuitionList.splice(i, 1)
            }
          }
        }

        this.selectedCourseList.splice(index, 1)
      })
    },
    // 删除学杂
    deleteTuition(tuition, index) {
      if (tuition.mustTuition === 1) {
        return
      }
      this.$confirm(`确定删除学杂【${tuition.name}】吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.selectedTuitionList.splice(index, 1)
      })
    },
    // 继续报名
    againEnroll() {
      this.currentStep = 0
      // 学员信息
      this.studentInfo = {
        id: null,
        name: '',
        nickName: '',
        sex: 1,
        birthday: '',
        age: '',
        idCard: '',
        referrer: '',
        remark: '',
        school: '',
        grade: '',
        address: '',
        provenanceId: '',
        relationId: '',
        primaryContactName: '',
        primaryContactPhone: ''
      }
      // 选择的课程列表
      this.selectedCourseList = []
      // 选择的学杂列表
      this.selectedTuitionList = []
      // 支付信息
      this.orderInfo = {
        payTime: '', // 支付时间
        payType: '', // 支付方式
        totalFee: '', // 实收总价格
        recommendUserId: '' // 订单经办人
      }
      if (this.$route.query.studentId) {
        this._getStudentInfo(this.$route.query.studentId)
      } else if (this.$route.query.customerId) {
        this._getCustomerInfo(this.$route.query.customerId)
      }

      this.showDetail = false
    },
    // 调转到经办人
    recommendMen() {
      // 打开对话框提示,确认再跳转
      this.$confirm(
        '将跳转到员工管理页面新增员工,已填写数据将丢失! 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$router.push({
            path: '/executive/staff',
            query: {
              recommend: 1
            }
          })
        })
        .catch(() => {})
    },
    // 动态计算截止日期
    computeDeadline(item) {
      this.$nextTick(() => {
        if (item.valuationType === 2) {
          /**
             * (row.timeCount, '购买数量')
             * (row.timeType, '购买类型')
             * (row.sendClassHour, '赠送时间')
             * (row.sendTimeUnit, '赠送时间类型')
             * (this.sendTimeType[row.timeType].time, '购买时间天数')
             * (this.sendTimeType[row.sendTimeUnit].time, '赠送时间天数')
             */
          let addTime = item.enableClassHour
            ? item.timeCount * this.sendTimeType[item.timeType].time
            : item.timeCount * this.sendTimeType[item.timeType].time + item.sendTimeCount * this.sendTimeType[item.sendTimeUnit].time
          item.validTime = (new Date(new Date().setDate(new Date().getDate() + Number(addTime)))).toLocaleDateString().replace(/\//g, '-')
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.student-enroll-wrapper
  background #ffffff
  padding 12px
  box-sizing border-box
  min-height calc(100vh - 108px)
.el-steps
  padding-top 9px
  padding-bottom 9px
  border-radius 40px
  background #eff3fa
  width 724px
  margin 0 auto
  .el-step__head.is-process
    color $color-primary
    border-color $color-primary
.el-form
  .el-input, .el-select, .el-radio-group, .el-autocomplete
    width 256px
.el-table
  &+.el-table
    margin-top 16px
.warning-tip
  background-color #fdf6ec
  color $color-warning
  text-align center
  padding 8px 16px
  margin 0
  border-radius 4px
  box-sizing border-box
  margin-bottom 20px
  i
    font-size 16px
    vertical-align middle
    margin-right 4px
  a
    color #409EFF
    margin 0 12px
.divider-line
  height 1px
  background $color-border-2
  margin-bottom 16px
.stu-info-title
  border-bottom 1px solid #eeeeee
  margin-bottom 20px
.enroll-form
  margin 20px auto 0 auto
  min-height 480px
  min-width 950px
  max-width 1500px
.form-wrapper
  border 1px solid #eeeeee
  border-radius 5px
.course-container
  min-height 400px
.title
  position relative
  padding-left 14px
  height 32px
  line-height 32px
  font-weight bold
  margin-top 20px
  &:before
    content ''
    display block
    width 3px
    height 18px
    border-radius 3px
    background-color $color-primary
    position absolute
    left 0
    top 7px
.left-right-boder
  border-left 1px solid #eeeeee
  border-right 1px solid #eeeeee
.option-btns
  padding-left 10px
  border-bottom 1px solid #eeeeee
  label
    margin-right 16px
    position relative
    &:before
      content '*'
      display block
      color $color-danger
      position absolute
      left -8px
      top 4px
  .el-button
    &+.el-button
      margin-left 12px
.bottom-btns
  text-align center
  margin-top 20px
  margin-bottom 20px
  .el-button
    width 120px
    &+.el-button
      margin-left 50px
.custom-form-item
  display inline-block
  min-width 160px
  margin 12px 0
  &+.custom-form-item
    margin-left 20px
  label
    font-size 14px
    color #606266
    padding-right 12px
    width 80px
    text-align right
    display inline-block
    line-height 32px
    box-sizing border-box
  span
    line-height 32px
.duplicate-dialog
  .username
    span
      font-size 13px
      color $color-text-2
      margin 0 6px
    img
      vertical-align middle
.base-info
  border-bottom 1px dashed $color-border-1
  padding-bottom 16px
  margin-bottom 16px
  .form-line+.form-line
    margin-top 12px
    line-height 1.5
  .form-label
    width 72px
    text-align right
    margin-right 12px
    display inline-block
    color $color-text-3
  .form-value
    color $color-text-1
    display inline-block
    min-width 58px
    &+.form-value
      margin-right 12px
.no-select-data
  width 100%
  height 100%
  display flex
  flex-direction column
  justify-content center
  align-items center
  padding-bottom 50px
  border-left 1px solid #eeeeee
  border-right 1px solid #eeeeee
  border-bottom 1px solid #eeeeee
  img
    width 250px
    height 250px
    margin-top 50px
  span
    color #bbbbbb
    font-size 16px
.order-btns
  float right
.order-goods
  display flex
  .title
    height 28px
    line-height 28px
    padding-left 14px
    margin-bottom 6px
    position relative
    font-size 16px
    &:before
      content ''
      display block
      width 3px
      border-radius 3px
      background-color $color-primary
      position absolute
      left 1px
      top 5px
      bottom 5px
  .order-pay-info
    width 250px
    margin-right 16px
    flex-shrink 0
  .order-goods-info
    width 100%
    flex-shrink 1
    overflow hidden
    .el-table+.el-table
      margin-top 16px
.pay-info-desc
  border 1px solid $color-border-2
  border-radius 3px
  padding 12px 6px
  li
    line-height 1.6
    &+li
      margin-top 6px
  label
    display inline-block
    width 78px
    text-align right
    color $color-text-3
  span
    color $coloe-text-1
</style>

<style lang="stylus">
.student-enroll-wrapper
  .el-step__head
    display none
  .el-step__title.is-process
    color $color-primary
    border-color $color-primary
  .left-number
    .el-input__inner
      text-align left
  .right-number
    .el-input__inner
      text-align right
  .course-table
    .inline-select
      padding-left 0
      padding-right 12px
      margin 0
    .inline-select-right
      top 4px
      right -2px
    .cell
      padding 0 6px
  .el-input-number
    width 100%
    .el-input__inner
      padding 0 8px
.customer-input
  position relative
  display inline-table
  .el-select
    display table-cell
    .el-input__inner
      padding-left 8px
      padding-right 16px
      width 56px
      border-right none
      border-top-right-radius 0
      border-bottom-right-radius 0
    .el-input__suffix
      right 4px
      width 18px
  .el-input-number
    display table-cell
    .el-input__inner
      border-top-left-radius 0
      border-bottom-left-radius 0
      padding-left 8px
      padding-right 22px
  .append-unit
    font-size 13px
    position absolute
    height 100%
    line-height 32px
    right 6px
    top 0
    color $color-text-3
.right-unit-number
  position relative
  .el-input__inner
    padding-left 8px !important
    padding-right 8px !important
    text-align left
  .append-unit
    font-size 13px
    position absolute
    height 100%
    line-height 32px
    right 8px
    top 0
    color $color-text-3
.send-class-box
  display flex
  .el-input-number
    width 40%
.recommend-men
  display inline-block
  margin 0px 0 15px 80px
  font-size 12px
  color #999999
  margin-top 5px
  .recommend-tap
    color #ff7e00
    cursor pointer
.recommend-user-item
  margin-bottom 0px !important
</style>

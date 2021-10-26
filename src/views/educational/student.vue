<!-- 学生管理 -->
<template>
  <div class="student-wrapper">
    <el-tabs v-model="currentTab">
      <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
    </el-tabs>
    <div class="query-form">
      <el-input v-model.trim="queryForm.searchInput" :maxlength="30" :placeholder="searchTypePlaceholder"
                @keyup.native.enter="query" class="input-with-select">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <div class="right-btns">
        <el-button type="primary" icon="el-icon-tickets" @click="toStudentEnroll()">新生报名</el-button>
        <el-button type="primary" icon="icon iconfont icon-import" @click="handleOpenImport">导入学员</el-button>
        <el-button type="primary" icon="icon iconfont icon-export" :loading="exportLoading" @click="exportStudent()">
          导出学员
        </el-button>
        <el-button type="primary" icon="el-icon-download" @click="studentQrCodeVisible = true">二维码下载</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="reviseStudents">批量修改课时</el-button>
      </div>
      <el-button type="text" :disabled="!queryLoading ? false : true" @click="reset" size="medium"
                 style="margin-left: 12px;">重&nbsp;置
      </el-button>
      <el-button type="text" :disabled="!queryLoading ? false : true" @click="query" size="medium"
                 style="margin-left: 12px;">刷&nbsp;新
      </el-button>
      <div class="query-select-list">
        <inline-select
          v-model="queryForm.courseId"
          @change="query"
          label="报读课程"
          valueAttr="id"
          labelAttr="name"
          :loading="courseLoading"
          :options="courseList"
          @show="_getCourseList"
          filterable
          clearable
        />
        <inline-select
          v-model="queryForm.classId"
          @change="query"
          label="所在班级"
          valueAttr="id"
          labelAttr="name"
          :loading="classLoading"
          :options="classList"
          @show="_getClassList"
          filterable
          clearable
        />
        <inline-select v-model="queryForm.grade" @change="query" label="所在年级" valueAttr="id" labelAttr="name"
                       :options="gradeListForInlineSelect" filterable clearable/>
        <el-checkbox v-model="queryForm.noClass" @change="handleNoClassChange" size="small" title="选课并且未分班的学员">未分班
        </el-checkbox>
        <el-checkbox v-model="queryForm.onCourseTime" @change="handleOnCourseChange" size="small" title="已排课的学员">在课学员
        </el-checkbox>
      </div>
    </div>
    <div class="showTableData">
      <!-- 在读学员列表 -->
      <el-table key="0" :default-sort = "{prop: 'date', order: 'descending'}" v-if="currentTab === '0'" :data="studentList.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="queryLoading">
        <el-table-column prop="name" label="姓名(昵称)" width="150">
          <p class="username" slot-scope="scope" @click="handleOpenDetail(scope.row)">
            <a class="link">{{ scope.row.name }}</a>
            <span v-if="scope.row.nickName">({{ scope.row.nickName }})</span>
            <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
          </p>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80">
          <template slot-scope="scope">{{ (scope.row.age || 0) + '岁' }}</template>
        </el-table-column>
        <el-table-column prop="icCardNo" label="IC卡号" width="110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.icCardNo && scope.row.icCardNo.length !== 0" type="success">
              {{ scope.row.icCardNo }}
            </el-tag>
            <el-tag v-else type="warning">未绑定</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="剩余课时" sortable :filters="filters" :filter-method="filterHandler" width="120" prop="remainingClassHour" align="center"></el-table-column>
        <el-table-column label="联系方式" width="140" align="center">
          <template slot-scope="scope">
            <el-popover v-if="scope.row.patriarchInfos && scope.row.patriarchInfos.length > 0" width="178"
                        trigger="hover">
              <ul class="patriarch-infos">
                <li v-for="item in scope.row.patriarchInfos" :key="item.id">
                  <span>{{ item.phone ? item.phone : '-' }}</span>
                  <span>{{ item.relation ? item.relation : '-' }}</span>
                  <span>{{ item.name ? item.name : '-' }}</span>
                </li>
              </ul>
              <span slot="reference"
                    style="cursor: pointer;">{{ scope.row.relation + '：' + scope.row.primaryContactPhone }}</span>
            </el-popover>
            <template v-else>
              {{ (scope.row.relation ? scope.row.relation + ':' : '') + (scope.row.primaryContactPhone || '-') }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="就读年级" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.grade ? scope.row.grade : '-' }}</template>
        </el-table-column>
        <el-table-column label="备注">
          <div class="remark-wrapper" slot-scope="scope" :ref="'remarkHack' + scope.$index">
            <span :title="scope.row.remark">{{ scope.row.remark }}</span>
            <el-popover width="440" trigger="click" popper-class="remark-edit-popver">
              <p style="margin-bottom:10px;font-size:15px;text-align:center;">备注信息</p>
              <div class="remark-edit-form">
                <el-input type="textarea" v-model="scope.row.remarkCopy" :rows="8" :maxlength="120" show-word-limit
                          placeholder="学员备注(最多120个字)"/>
              </div>
              <div class="remark-edit-btns">
                <el-button size="mini" @click="$refs['remarkHack' + scope.$index].click()">取消</el-button>
                <el-button size="mini" type="primary" @click="editRemark(scope.row, scope.$index)">确认</el-button>
              </div>
              <i slot="reference" class="el-icon-edit-outline" title="编辑备注"/>
            </el-popover>
          </div>
        </el-table-column>
        <el-table-column prop="bindWechatStatus" label="家长绑定微信" width="140" align="center">
          <el-tag slot-scope="scope" :type="scope.row.bindWechatStatus == 1 ? 'success' : 'info'">
            {{ scope.row.bindWechatStatus ? '是' : '否' }}
          </el-tag>
        </el-table-column>
        <el-table-column prop="faceLibUrl" label="录入人脸" width="80" align="center">
          <el-tag slot-scope="scope" :type="scope.row.faceLibUrl ? 'success' : 'info'">
            {{ scope.row.faceLibUrl ? '是' : '否' }}
          </el-tag>
        </el-table-column>
        <el-table-column prop="totalClassHour" label="总课时数" width="80" align="center">
          <template slot-scope="scope">
            {{scope.row.totalClassHour ? scope.row.totalClassHour : 0}}
          </template>
        </el-table-column>
        <el-table-column prop="totalAlreadyUseClassHour" label="消课课时" width="80" align="center">
          <template slot-scope="scope">
            {{scope.row.totalAlreadyUseClassHour ? scope.row.totalAlreadyUseClassHour : 0}}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190" fixed="right">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入剩余课时数搜索"/>
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="toStudentEnroll(scope.row.id)">续报</el-button>
            <el-button type="text" @click="handleOpenEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleNaviToOrder(scope.row)">订单</el-button>
            <el-button v-if="isAdmin === true" type="text" @click="handleStudentDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 节课学员 -->
      <el-table key="1" v-else-if="currentTab === '1'" :data="studentList" stripe v-loading="queryLoading">
        <el-table-column prop="name" label="姓名(昵称)" width="160">
          <p class="username" slot-scope="scope" @click="handleOpenDetail(scope.row)">
            <a class="link">{{ scope.row.name }}</a>
            <span v-if="scope.row.nickName">({{ scope.row.nickName }})</span>
            <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
          </p>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="64">
          <template slot-scope="scope">{{ (scope.row.age || 0) + '岁' }}</template>
        </el-table-column>
        <el-table-column label="联系方式" width="180">
          <template slot-scope="scope">
            <el-popover v-if="scope.row.patriarchInfos && scope.row.patriarchInfos.length > 0" width="178"
                        trigger="hover">
              <ul class="patriarch-infos">
                <li v-for="item in scope.row.patriarchInfos" :key="item.id">
                  <span>{{ item.phone }}</span>
                  <span>{{ item.relation }}</span>
                  <span>{{ item.name }}</span>
                </li>
              </ul>
              <span slot="reference"
                    style="cursor: pointer;">{{ scope.row.relation + '：' + scope.row.primaryContactPhone }}</span>
            </el-popover>
            <template v-else>
              {{ (scope.row.relation ? scope.row.relation + ':' : '') + (scope.row.primaryContactPhone || '-') }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="就读年级" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.grade ? scope.row.grade : '-' }}</template>
        </el-table-column>
        <el-table-column label="备注">
          <div class="remark-wrapper" slot-scope="scope" :ref="'remarkHack' + scope.$index" :title="scope.row.remark">
            <span>{{ scope.row.remark }}</span>
            <el-popover width="240" trigger="click" popper-class="remark-edit-popver">
              <div class="remark-edit-form">
                <label>备注：</label>
                <el-input type="textarea" v-model="scope.row.remarkCopy" :maxlength="120" show-word-limit
                          placeholder="学员备注(最多120个字)"/>
              </div>
              <div class="remark-edit-btns">
                <el-button size="mini" @click="$refs['remarkHack' + scope.$index].click()">取消</el-button>
                <el-button size="mini" type="primary" @click="editRemark(scope.row, scope.$index)">确认</el-button>
              </div>
              <i slot="reference" class="el-icon-edit-outline"/>
            </el-popover>
          </div>
        </el-table-column>
        <el-table-column prop="endCourseTime" label="结业时间" width="160"></el-table-column>
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="toStudentEnroll(scope.row.id)">报名</el-button>
            <el-button type="text" @click="handleOpenEdit(scope.row)">编辑</el-button>
            <el-button v-if="isAdmin === true" type="text" @click="handleStudentDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getStudentList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑学员信息 -->
    <el-dialog :visible.sync="showEditStudent" custom-class="custom-dialog" title="编辑学员信息"
               :close-on-click-modal="false">
      <el-form ref="studentForm" :model="studentForm" :rules="studentRules" inline label-width="100px"
               class="student-form">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请填写学员姓名" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="studentForm.nickName" placeholder="请填写学员昵称" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="studentForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="birthday">
          <el-input type="number" v-model="studentForm.age" @change="handleAgeChange" :controls="false" :max="128"
                    placeholder="年龄" style="width: 80px; margin-right: 12px;"/>
          <el-date-picker v-model="studentForm.birthday" value-format="yyyy-MM-dd" placeholder="生日"
                          @change="handleBirthdayChange" style="width: 180px;"></el-date-picker>
        </el-form-item>
        <el-form-item label="来源渠道" prop="provenanceId">
          <el-select v-model="studentForm.provenanceId" placeholder="请选择渠道类型">
            <el-option v-for="item in sourceList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="主要联系人" prop="primaryContactPhone">
          <el-form-item prop="primaryContactName" style="margin-bottom: 0;">
            <el-input v-model="studentForm.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20" style="width: 180px;" />
          </el-form-item>
          <el-form-item prop="relationId" :rules="{ required: true, message: '请选择关系', trigger: 'blur' }" style="margin-bottom: 0;">
            <el-select v-model="studentForm.relationId" placeholder="选择关系" style="width: 100px;">
              <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="primaryContactPhone"
            :rules="[
              { required: true, message: '请填写手机号码', trigger: 'blur' },
              { validator: phoneValidator, message: '请填写正确的手机号码', trigger: ['change', 'blur'] },
            ]"
            style="margin-bottom: 0;"
          >
            <el-input v-model="studentForm.primaryContactPhone" placeholder="手机号" />
          </el-form-item>
        </el-form-item> -->
        <el-form-item label="主要联系人">
          <el-form-item style="margin-bottom: 0;">
            <el-input v-model="studentForm.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20"
                      style="width: 180px;"/>
          </el-form-item>
          <el-form-item style="margin-bottom: 0;">
            <el-select v-model="studentForm.relationId" placeholder="选择关系" style="width: 100px;">
              <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 0;">
            <AreaCode ref="mychild" @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
            <el-input v-model="studentForm.primaryContactPhone" placeholder="手机号"/>
          </el-form-item>
        </el-form-item>
        <div class="divider-line"></div>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="studentForm.idCard" placeholder="学员身份证号码"/>
        </el-form-item>
        <el-form-item label="推荐人" prop="referrer">
          <el-input v-model="studentForm.referrer" placeholder="学员推荐人" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-autocomplete v-model="studentForm.school" @focus="_getSchoolList" value-key="name"
                           :fetch-suggestions="filterSchool" placeholder="学员所在学校名称"/>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="studentForm.grade" placeholder="学员所在年级" clearable>
            <el-option v-for="item in gradeList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="studentForm.address" placeholder="学员家庭住址(最多50个字)" :maxlength="50" style="width: 524px;"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="studentForm.remark" :rows="4" placeholder="备注信息(最多120个字)" :maxlength="120"
                    show-word-limit style="width: 524px;"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showEditStudent = false">取 消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 学员详情信息 -->
    <el-dialog :visible.sync="showDetail" @close="handleStudentDetailClose" width="1100px" top="8vh"
               :close-on-click-modal="false" class="student-detail-dialog">
      <template slot="title">
        学员详情
        <span class="color-danger">【{{ studentDetail && studentDetail.name }}】</span>
      </template>
      <el-tabs v-model="detailTab">
        <el-tab-pane label="基本信息" name="0"></el-tab-pane>
        <el-tab-pane label="报读课程" name="1"></el-tab-pane>
        <el-tab-pane label="最近课表" name="2"></el-tab-pane>
        <el-tab-pane label="上课记录" name="3"></el-tab-pane>
        <el-tab-pane label="已绑定微信家长" name="4"></el-tab-pane>
        <el-tab-pane label="课时修正记录" name="5"></el-tab-pane>
        <el-tab-pane label="订单信息" name="6"></el-tab-pane>
      </el-tabs>
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 69vh;">
        <div v-if="detailTab === '0'" class="student-detail">
          <template v-if="studentDetail">
            <div class="main-info">
              <img class="avatar" :src="studentDetail.avatar" width="100px"/>
              <p class="username">
                {{ studentDetail.name }}
                <span v-if="studentDetail.nickName">({{ studentDetail.nickName }})</span>
              </p>
              <el-button type="primary" plain icon="el-icon-edit" @click="handleOpenEdit(studentDetail)">编辑</el-button>
              <el-button type="primary" plain icon="el-icon-camera" @click="faceIdentification">录入人脸</el-button>
              <el-button type="primary" plain icon="el-icon-bank-card" @click="handleBindIcCard(studentDetail)"
                         style="margin-top:20px;">{{ studentDetail.icCardNo ? '更改绑定' : '绑定IC卡' }}
              </el-button>
            </div>
            <ul class="more-info">
              <li>
                <label>年龄：</label>
                <span>
                  {{ (studentDetail.age || 0) + '岁' }}
                  <span style="margin-left: 12px;">{{ studentDetail.birthday }}</span>
                </span>
              </li>
              <li>
                <label>性别：</label>
                <span>{{ studentDetail.sex === 0 ? '未知' : studentDetail.sex === 1 ? '男' : '女' }}</span>
              </li>
              <li>
                <label>身份证号：</label>
                <span>{{ studentDetail.idCard ? studentDetail.idCard : '-' }}</span>
              </li>
              <li>
                <label>主要联系人：</label>
                <span>
                  <span class="color-danger"
                        style="margin-right: 12px">{{ studentDetail.primaryContactPhone || '' }}</span>
                  {{ studentDetail.relation || '-' + '：' + (studentDetail.primaryContactName || '-') }}
                </span>
              </li>
              <li>
                <label>学校：</label>
                <span>{{ studentDetail.school ? studentDetail.school : '-' }}</span>
              </li>
              <li>
                <label>年级：</label>
                <span>{{ studentDetail.grade ? studentDetail.grade : '-' }}</span>
              </li>
              <li>
                <label>人脸：</label>
                <a
                  :class="{'link': studentDetail.faceLibUrl}"
                  :href="studentDetail.faceLibUrl || 'javascript:void(0);'"
                  :target="studentDetail.faceLibUrl ? '_blank' : ''"
                >{{ studentDetail.faceLibUrl ? '点击查看' : '未录入' }}</a>
              </li>
              <li>
                <label>IC卡号：</label>
                <span v-if="studentDetail.icCardNo">{{ studentDetail.icCardNo }}</span>
                <span v-else>
                  <label style="color:#ff6600;">
                    未绑定（刷卡设备购买请联系客服：
                    <i style="font-weiht:bold;font-size:20px;">0851-38157629</i>）
                  </label>
                </span>
                <el-button v-if="studentDetail.icCardNo" type="text" @click="handleUnbindICCard(studentDetail)"
                           :loading="unBindICCardLoading" style="margin-left:20px;">解除IC卡绑定
                </el-button>
              </li>
              <li>
                <label>住址：</label>
                <span>{{ studentDetail.address ? studentDetail.address : '-' }}</span>
              </li>
              <li>
                <label>推荐人：</label>
                <span>{{ studentDetail.referrer ? studentDetail.referrer : '-' }}</span>
              </li>
              <li>
                <label>备注：</label>
                <span>{{ studentDetail.remark ? studentDetail.remark : '-' }}</span>
              </li>
              <li>
                <label>学员档案：</label>
                <span><el-button type="text" :disabled="toStudentFileDisabled" @click="toStudentFile(studentDetail)"
                                 style="margin: 0 10px;">点击查看</el-button></span>
                <el-popover v-if="toStudentFileDisabled" placement="top-start" width="200" trigger="hover"
                            content="该学员无档案">
                  <i slot="reference" style="color: #f60" class="el-icon-question"></i>
                </el-popover>
              </li>
            </ul>
            <div class="qr-code" v-if="studentDetail && studentDetail.id">
              <qrcode :value="parentQrCode" :options="{ width: 120, margin: 0 }"/>
              <p class="tip">家长微信扫码绑定</p>
            </div>
          </template>
        </div>
        <div v-else-if="detailTab === '1'">
          <div style="margin-bottom: 16px; margin-top: 6px;">
            <el-radio-group v-model="enrollDataTab" size="mini">
              <el-radio-button label="0">在读课程</el-radio-button>
              <el-radio-button label="1">历史报读</el-radio-button>
              <el-radio-button label="2">购买学杂</el-radio-button>
            </el-radio-group>
            <el-button type="primary" icon="el-icon-tickets" size="mini" @click="toStudentEnroll(studentDetail.id)"
                       style="float: right;">报名
            </el-button>
          </div>
          <div v-if="enrollDataTab == '0'" class="query-form my-course-query-form">
            <el-input v-model="myCourseListQueryForm.courseName" :maxlength="30" :placeholder="'请输入课程名称'" clearable @keyup.native.enter="handlecourseNameSearch" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="handlecourseNameSearch"></el-button>
            </el-input>
            <el-button type="text" @click="handleCourseNameSearchReset" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
          </div>
          <el-table v-if="enrollDataTab == '0'" :key="enrollDataTab" :data="myCourseList" border style="width: 100%">
            <el-table-column prop="courseName" label="课程名称">
              <template slot-scope="scope">
                {{ scope.row.courseName }}
                <el-tag size="mini" style="margin-left: 6px;">
                  {{ scope.row.courseGiveLessonsWay === 0 ? '一对一' : '一对多' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="就读状态">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.stopCourse === 0 ? 'success' : 'info'" style="margin-left: 6px;">
                  {{ scope.row.stopCourse === 0 ? '在读' : '停课' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="className" label="班级名称" align="center" width="160">
              <template slot-scope="scope">
                <template v-if="scope.row.classId">
                  {{ scope.row.className }}
                  <el-tag type="primary" size="mini" style="margin-left: 3px;cursor: pointer;"
                          @click="handleTransferClass(scope.row)">转班<i class="el-icon-sort"></i></el-tag>
                </template>
                <el-popover
                  v-else
                  placement="right"
                  title="未分班提示"
                  width="200"
                  trigger="hover"
                  content="尚未给该课程分班，是否进行插班？">
                  <el-button slot="reference" type="primary" plain @click="insertClass(scope.row)" size="mini">插班
                  </el-button>
                </el-popover>
              </template>
            </el-table-column>

            <el-table-column prop="classHour" label="购买课时" align="center" width="88">
              <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{ scope.row.classHour }}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span
                    v-if="scope.row.valuationType === 2">{{
                      scope.row.timeCount + sendTimeType[scope.row.timeType].date
                    }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="alreadyUseClassHour" label="消课课时" align="center" width="88">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 0">{{ scope.row.alreadyUseClassHour }} 课时</span>
                <span v-else> {{ scope.row.enableClassHour ? scope.row.alreadyUseClassHour + '课时' : '-' }} </span>
              </template>
            </el-table-column>
            <el-table-column label="剩余课时" align="center" width="88">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 0 || (scope.row.valuationType === 1 && scope.row.enableClassHour) || (scope.row.valuationType === 2 && scope.row.enableClassHour)">
                  {{calcSurplusClassHour(scope.row.valuationType, scope.row.enableClassHour, scope.row.classHour, scope.row.alreadyUseClassHour)}} 课时
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="validTime" label="截止日期" align="center" width="108">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.valuationType !== 1">{{
                    scope.row.validTime ? scope.row.validTime.slice(0, 10) : '-'
                  }}</span>
                <span v-else>{{ scope.row.periodEndDate ? scope.row.periodEndDate.slice(0, 10) : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="购买价格" align="center" width="108">
              <template slot-scope="scope">{{ scope.row.price + '元' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template slot-scope="scope">
                <el-button v-if="scope.row.classId" type="text" @click="quitClass(scope.row)" size="mini">立即退班
                </el-button>
                <el-button type="text" v-if="scope.row.enableClassHour === 1 && calcSurplusClassHour(scope.row.valuationType, scope.row.enableClassHour, scope.row.classHour, scope.row.alreadyUseClassHour) !== 0" @click="handleTransfer(scope.row)" size="mini">转课</el-button>
                <el-button type="text" v-else-if="scope.row.enableClassHour === 0" @click="handleTransfer(scope.row)" size="mini">转课</el-button>
                <el-button v-if="scope.row.enableClassHour" type="text" @click="fixClassHour(scope.row)" size="mini" title="退课会退费。删除该课的报名记录">修正课时
                </el-button>
                <!-- <el-button type="text" @click="quitCourse(scope.row)" size="mini" title="退课会退费。删除该课的报名记录">退课</el-button>
                <el-button type="text" @click="endCourse(scope.row)" size="mini" title="结课。学员课程已上完">结课</el-button>-->
                <el-dropdown type="text" @command="com => handleOperationCommand(com, scope.row, scope.$index)" style="margin-left: 10px">
                  <el-button type="text" size="mini">更多</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="scope.row.stopCourse === 0" command="stopCourse">停 &nbsp;&nbsp; 课
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.stopCourse === 1" command="cancelStopCourse">取消停课
                    </el-dropdown-item>
                    <el-dropdown-item command="quitCourse">退 &nbsp;&nbsp; 课</el-dropdown-item>
                    <el-dropdown-item command="endCourse">结 &nbsp;&nbsp; 课</el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.valuationType !== 1" command="endCourseTimes">修正截止时间
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <el-table v-if="enrollDataTab == '1'" :key="enrollDataTab" :data="historyCourseList" border
                    style="width: 100%">
            <el-table-column prop="courseName" label="课程名称">
              <template slot-scope="scope">
                {{ scope.row.courseName }}
                <el-tag size="mini" style="margin-left: 6px;">
                  {{ scope.row.courseGiveLessonsWay === 0 ? '一对一' : '一对多' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="className" label="班级名称" align="center" width="160"></el-table-column>
            <el-table-column prop="classHour" label="购买课时" align="center" width="88">
              <template slot-scope="scope">
                <span>{{ scope.row.enableClassHour ? scope.row.classHour : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="alreadyUseClassHour" label="消课课时" align="center" width="88">
              <template slot-scope="scope">
                <span>{{ scope.row.enableClassHour ? scope.row.alreadyUseClassHour : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="剩余课时" align="center" width="88">
              <template slot-scope="scope">
                {{ scope.row.enableClassHour ? scope.row.classHour - scope.row.alreadyUseClassHour : '-' }}
              </template>
            </el-table-column>

            <el-table-column prop="endCourseTime" label="结业时间" align="center" width="144"></el-table-column>

            <el-table-column prop="endStatusStr" label="状态" width="160" align="center">
              <el-tag slot-scope="scope" type="info">{{ scope.row.endStatusStr }}</el-tag>
            </el-table-column>
          </el-table>
          <el-table v-else-if="enrollDataTab == '2'" :key="enrollDataTab" :data="myTuitionList" border
                    style="width: 100%">
            <el-table-column prop="name" label="学杂名称"></el-table-column>
            <el-table-column prop="tuitionNum" label="购买数量" align="center"></el-table-column>
            <el-table-column prop="price" label="购买总价" align="center"></el-table-column>
            <el-table-column prop="singlePrice" label="单价" align="center"></el-table-column>
          </el-table>
        </div>
        <div v-else-if="detailTab === '2'">
          <el-date-picker
            v-model="timetableDate"
            type="datetimerange"
            align="right"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
            @change="handleTimetableDateTimeSelectChange"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
          <label style="font-size: 13px; color: #999; margin-bottom: 12px;margin-left:10px;">（ 默认查询为未来30天的课表 ）</label>
          <el-table ref="tableRef" :key="detailTab" :data="timetableList" border style="width:100%;margin-top:15px;">
            <el-table-column prop="courseTimeStr" label="上课时间" width="200" align="center"></el-table-column>
            <el-table-column prop="className" label="班级" width="160" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.className || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="courseName" label="课程" min-width="160" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.courseName || scope.row.oneCourseName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="classRoomName" label="教室" width="160" align="center"></el-table-column>
            <el-table-column prop="teacherName" label="上课老师" min-width="100" align="center"></el-table-column>
            <el-table-column prop="classHour" label="授课课时" width="80" align="center"></el-table-column>
          </el-table>
        </div>
        <div v-else-if="detailTab === '3'">
          <el-date-picker
            v-model="attendanceDate"
            type="datetimerange"
            align="right"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
            @change="handleAttendDateTimeSelectChange"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
          <label style="font-size: 13px; color: #999; margin-bottom: 12px;margin-left:10px;">（ 默认查询为最近30天的上课记录 ）</label>
          <el-table ref="tableRef" :key="detailTab" :data="attendanceList" border style="width: 100%;margin-top:15px;">
            <el-table-column prop="courseTimeStr" label="上课时间" width="210" align="center">
              <template slot-scope="scope">
                <div>{{ scope.row.courseTimeStr }}</div>
                <div v-if="scope.row.makeUpMissedLessonsTime" style="color: #ff6600">补课时间: {{ scope.row.makeUpMissedLessonsTime }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="className" label="班级" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.className || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="courseName" label="课程" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.courseName || scope.row.oneCourseName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="classRoomName" label="教室" align="center"></el-table-column>
            <el-table-column prop="teacherName" label="上课老师" min-width="80" align="center"></el-table-column>
            <el-table-column prop="statusStr" label="上课情况" width="90" align="center">
              <el-tag slot-scope="scope" :type="scope.row.statusType">{{ scope.row.statusStr }}</el-tag>
            </el-table-column>
            <el-table-column prop="realSubClassHour" label="扣除课时数" width="110" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.realSubClassHour ? scope.row.realSubClassHour : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="residueClassHour" label="剩余课时数" width="110" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.residueClassHour ? scope.row.residueClassHour : '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else-if="detailTab === '4'">
          <el-table ref="tableRef" :key="detailTab" :data="studentPartriarchsList" border style="width: 100%">
            <el-table-column prop="patriarchName" label="家长姓名" width="200" align="center"></el-table-column>
            <el-table-column prop="relationName" label="关系" align="center"></el-table-column>
            <el-table-column prop="patriarchPhone" label="联系电话" align="center"></el-table-column>
            <!-- <el-table-column
              prop="primary"
              label="是否主要联系人"
              width="180"
              align="center"
            >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.primary === 1" type="success">是</el-tag>
                <el-tag v-else>否</el-tag>
              </template>
            </el-table-column>-->
            <el-table-column prop="createAt" label="绑定时间" align="center"></el-table-column>
            <el-table-column prop label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button type="text" @click="handleResolveBindClick(scope.$index, scope.row)" size="mini">解除微信绑定
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else-if="detailTab === '5'">
          <el-table ref="fixTableRef" :key="detailTab" :data="fixClassHourRecordList" border style="width: 100%">
            <el-table-column prop="courseName" label="课程名称" width="200" align="center"></el-table-column>
            <el-table-column prop="originalClassHour" label="修改前课剩余时数" width="160" align="center"></el-table-column>
            <el-table-column prop="newClassHour" label="修改后剩余课时数" width="160" align="center"></el-table-column>
            <el-table-column prop label="修改备注" align="center">
              <template slot-scope="scope">
                <div>{{ scope.row.remark ? scope.row.remark : '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="createAt" label="修改时间" align="center"></el-table-column>
            <el-table-column prop width="150" label="操作人" align="center">
              <template slot-scope="scope">
                <div>{{ scope.row.operateUserCurrentName ? scope.row.operateUserCurrentName : scope.row.operateUser }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else-if="detailTab === '6'">
          <el-table :data="selectedCourseList" border v-loading="detailTab6Loading">
            <el-table-column label="订单编号" width="210" align="center" prop="outTradeNo">
              <template slot-scope="scope">
                <span class="out-trade-no" @click="handleOpenOrderDetail(scope.row.id)"> {{
                    scope.row.outTradeNo
                  }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="orderType" label="订单类型" width="110" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.orderType === 0" type="success">报名</el-tag>
                <el-tag v-if="scope.row.orderType === 1">退课</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="payType" label="支付方式" width="110" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.payType === 0">微信</el-tag>
                <el-tag v-if="scope.row.payType === 1" type="success">支付宝</el-tag>
                <el-tag v-if="scope.row.payType === 2" type="info">现金</el-tag>
                <el-tag v-if="scope.row.payType === 3">刷卡</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="goodsName" label="订单信息" align="center"></el-table-column>
            <el-table-column prop="shouldTotalFee" label="应付金额" width="120" align="center">
              <template slot-scope="scope">￥{{ scope.row.shouldTotalFee }}</template>
            </el-table-column>
            <el-table-column prop="totalFee" label="实付金额" width="120" align="center">
              <template slot-scope="scope">￥{{ scope.row.totalFee }}</template>
            </el-table-column>
            <el-table-column prop="payTime" label="支付时间" align="center"></el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryParam.pageNum"
            :page-sizes="[10, 20, 30, 40, 50]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="selectedTotal"
          ></el-pagination>
          <!-- 订单详情 -->
          <order-detail-dialog ref="orderDetailDialog"></order-detail-dialog>
        </div>
      </el-scrollbar>
    </el-dialog>

    <!-- 批量修改学员剩余课时 -->
    <el-dialog title="批量修改学员剩余课时" custom-class="custom-dialog" :visible.sync="reviseClassHourDialog" width="1000px"
               :close-on-press-escape="false"
               :close-on-click-modal="false" :before-close="cancelSelection">
      <!-- 搜索框 -->
      <div class="query-form" id="search-button">
        <el-input v-model.trim="reviseSearchName" :maxlength="30" :clearable="true" placeholder="请输入学员姓名"
                  @keyup.native.enter="query" class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="reviseSearch"
                     :loading="reviseSearchLoading"></el-button>
        </el-input>
        <el-button type="text" :disabled="!tableLoading ? false : true" @click="reviseQuery('reset')" size="medium"
                   :loading="reviseResetLoading"
                   style="margin-left: 12px;">重&nbsp;置
        </el-button>
        <el-button type="text" :disabled="!tableLoading ? false : true" @click="reviseQuery('refresh')" size="medium"
                   :loading="reviseQueryLoading"
                   style="margin-left: 12px;">刷&nbsp;新
        </el-button>
      </div>
      <div style="margin-bottom:10px;">
        <el-alert title="使用提示" description="只有在勾选状态下变更的行的课时才会保存，否则不存储变更记录，您切换页码后变更会丢失，需要变更课时您务必勾选。"
                  type="warning"></el-alert>
      </div>
      <div>
        <el-table ref="multipleTable" :data="studentCourseInfo" v-loading="tableLoading" tooltip-effect="dark"
                  style="width: 100%" @select-all="allSelection" @select="handleSelectionChange">
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="name" label="学生姓名" width="120"></el-table-column>
          <el-table-column prop="courseName" label="课程名称" width="140" show-overflow-tooltip></el-table-column>
          <el-table-column prop="className" label="班级名称" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <div v-if="scope.row.className=== undefined" class="notDispatch">未分班</div>
              <div v-else>{{ scope.row.className }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="classHour" align="center" label="购买课时" width="140"
                           show-overflow-tooltip></el-table-column>
          <el-table-column prop="alreadyUseClassHour" label="消费课时" width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              <div v-if="scope.row.classHour - scope.row.alreadyUseClassHour >= 0">
                <el-input-number v-model="scope.row.alreadyUseClassHour" :min="0" size="small"
                                 :max="scope.row.classHour" label="消费课时"></el-input-number>
                <span class="el-icon-top dirIectionIcon"
                      v-if="scope.row.alreadyUseClassHour - scope.row.oldClasshuors > 0">{{
                    scope.row.alreadyUseClassHour - scope.row.oldClasshuors
                  }}</span>
                <span class="el-icon-bottom dirIectionIcon"
                      v-if="scope.row.alreadyUseClassHour - scope.row.oldClasshuors < 0">{{
                    Math.abs(scope.row.alreadyUseClassHour - scope.row.oldClasshuors)
                  }}</span>
              </div>
              <div v-else>
                <el-input-number v-model="scope.row.alreadyUseClassHour" :min="0" size="small"
                                 label="消费课时"></el-input-number>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="剩余课时" align="center" width="140" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.reduseClassHour >= 0">{{ scope.row.reduseClassHour }}</el-tag>
              <div v-else>
                <!-- 对还未购买课时情况作出判断 -->
                <el-tag type="info" v-if="!scope.row.classHour">0</el-tag>
                <el-tag type="warning" v-else color="red">
                  超出：{{ scope.row.classHour ? Math.abs(scope.row.reduseClassHour) : 0 }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- studentCourseInfo -->
      <el-pagination
        class="revise-page"
        @size-change="studentCourseInfoSizeChange"
        @current-change="_getStudentCourseInfo"
        :current-page.sync="pageNum"
        :page-size.sync="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="studentCourseInfoTotal"
      ></el-pagination>
      <div id="buttonBox">
        <el-button class="removeButton" @click="cancelSelection">取 消</el-button>
        <el-button type="primary" :disabled="sureResviseDisabled" @click="sureResvise">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 批量修改课时添加备注确定提交弹框 -->
    <el-dialog title="添加批量修改课时备注" custom-class="custom-dialog" :visible.sync="reviseDialogTableVisible" width="600px"
               :close-on-click-modal="false"
               :before-close="reviseCancel">
      <el-input type="textarea" placeholder="请输入修正课的备注,以便回溯" v-model="reviseRemarks" maxlength="120" minlength="1"
                :rows="3" show-word-limit></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reviseCancel">取 消</el-button>
        <el-button :loading="reviseSubmitLoading" type="primary" @click="reviseSubmit">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="showImport" :close-on-click-modal="false" :show-close="false"
               custom-class="import-student-dialog">
      <p slot="title" class="title">
        学员导入
        <i class="close-btn el-icon-close" @click="showImport = false"/>
      </p>
      <div class="upload-file">
        <el-input :value="uploadFileName" @click.native.stop="selectExcelFile" :readonly="true" placeholder="请选择上传文件"
                  style="width: 340px;">
          <el-button slot="append" type="primary" @click.stop="selectExcelFile">选择文件</el-button>
        </el-input>
        <el-tooltip class="item" effect="light" content="下载之前请您务必阅读下面的说明" placement="right">
          <span class="link" @click="downloadTemplate(true)">下载导入模板</span>
        </el-tooltip>
        <input ref="fileInput" @change="handleExcelChange" class="file-input" type="file"
               accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      </div>
      <template v-if="uploadErrList.length > 0">
        <p class="upload-err-tip">数据有误，请检查数据后上传！错误信息如下：</p>
        <el-table :data="uploadErrList" style="margin-top: 16px;">
          <el-table-column prop="row" label="行数" cennter width="100">
            <template slot-scope="scope">第{{ scope.row.row }}行</template>
          </el-table-column>
          <el-table-column prop="column" label="标签" cennter width="160"></el-table-column>
          <el-table-column prop="errorMsg" label="错误信息"></el-table-column>
        </el-table>
      </template>
      <ul class="upload-tip" v-if="uploadErrList.length === 0">
        <el-alert title="请您务必阅读，否则可能存在导入学生数据失败！！！" type="error" style="margin-bottom:10px;"></el-alert>
        <li class="color-warning">一、必须注意事项：</li>
        <li style="color:red;">1. 导出的excel表格为下拉选择的，千万不要自己手动去更改数据或填写或者从其他地方复制整行数据将其覆盖，这样的操作方式会导致导入数据失败。</li>
        <li style="color:red;">2. 课程名称、报名方式、收费套餐、支付方式(只要excel中为下拉选择的数据)等数据务必先在系统中先行录入完毕再导出，切不可自己导出excel后再私自更改表格规则。</li>
        <li style="color:red;">3. 目前只支持从系统中下载的excel模板填写数据提交，不支持随意填写的excel，否则会导致导入学生数据失败。</li>
        <li class="color-warning" style="margin-top:20px;">二、学员导入须知：</li>
        <li>1. 导入前需要下载最新导入模板，否则课程信息可能有误</li>
        <li>2. 必填项不能为空</li>
        <li>3. 如果需要导入课程信息，则课程名称、报名方式、收费套餐、购买课时、课程价格、应付价格、支付方式、支付金额、支付时间不能为空</li>
        <li>4. 不填入课程信息，则只导入学员基础信息</li>
        <li>5. 如果学员姓名和主要联系手机号一致，将视为同一学员。报课课程将按照新报、续报规则报名。</li>
        <li>6. 一次最多导入500条数据</li>
      </ul>
    </el-dialog>

    <el-dialog :visible.sync="showImportFileTip" :close-on-click-modal="false" :show-close="false" destroy-on-close
               custom-class="import-student-dialog" top="20vh">
      <p slot="title" class="title">
        下载导入模板提示
        <i class="close-btn el-icon-close" @click="showImportFileTip = false"/>
      </p>
      <template v-if="importErrRepeat.length > 0">
        <p class="import-err-tip">下列课程名称重复：</p>
        <div class="float-tags clearfix">
          <span v-for="(item, index) in importErrRepeat" :key="index">{{ item }}</span>
        </div>
      </template>
      <template v-if="importErrInvalide.length > 0">
        <p class="import-err-tip">下列课程名称中包含特殊字符：</p>
        <div class="float-tags clearfix">
          <span v-for="(item, index) in importErrInvalide" :key="index">{{ item }}</span>
        </div>
      </template>
      <ul class="upload-tip">
        <li class="color-danger">因重复的课程名称、或者课程名称中包含特殊字符，将不能正常导入课程。</li>
        <li style="color: #333">
          请修改课程名称后，再
          <b>重新下载</b>导入模板。(导入完成后，课程名称仍然可以修改成包含特殊符号的名称)
        </li>
        <li style="color: #333; margin-top: 40px;">如果仍要继续导出，导入学员模板中的课程将过滤重复的、包含特殊字符的课程。是否继续？</li>
      </ul>
      <div style="text-align: right; margin-top: 20px;">
        <el-button @click="showImportFileTip = false">取消</el-button>
        <el-button type="warning" @click="downloadTemplate()">仍要下载</el-button>
      </div>
    </el-dialog>

    <select-class-dialog v-model="showSelectClass" :courseId="currentCourse" :alreadyClassId="currentClass"
                         :alreadyClassName="currentClassName" @toClass="handleToClass"
                         @submit="selectClass"></select-class-dialog>

    <screen-capture v-model="showCapture" title="学员人脸录入" @submit="handleCaptureSubmit"/>

    <el-dialog title="修正课时" :visible.sync="fixClassHourShow" width="420px" top="30vh"
               custom-class="fix-class-hour-dialog custom-dialog" :close-on-click-modal="false">
      <div class="fix-class-hour-student">
        <label>确定修正学员</label>
        <span>{{ studentDetail && studentDetail.name }}</span>
        <label>的</label>
        <span>{{ fixCourseName }}</span>
        <label>的剩余课时数？</label>
      </div>
      <div class="fix-class-hour-info">
        <label>当前剩余课时数：</label>
        <span>{{ fixOriginalClassHour }}</span>
      </div>
      <div class="fix-class-hour-num">
        <span>剩余课时：</span>
        <el-input-number v-model="fixNewClassHour" controls-position="right" :min="0"
                         :max="fixTotalClassHour"></el-input-number>
      </div>
      <div class="fix-class-hour-remark">
        <span>备注：</span>
        <el-input class="fix-class-hour-input" type="textarea" autosize placeholder="请输入修正课的备注,以便回溯"
                  v-model="fixRemark"></el-input>
      </div>
      <div class="fix-class-hour-tips">
        <label>温馨提示：</label>
        <span>修正课时后会产生修正记录,在修正记录中可以查询到课时修正的历史记录。</span>
      </div>
      <div class="custom-dialog-button">
        <el-button @click="cancelFixClassHour">取消</el-button>
        <el-button @click="sureFixClassHour" type="primary">确定</el-button>
      </div>
    </el-dialog>

    <!-- 学生绑定IC卡 -->
    <el-dialog title="绑定IC卡" :visible.sync="bindIcCardDialogVisible" width="30%">
      <el-form ref="bindICCardForm" :model="studentIcForm" label-width="80px">
        <el-form-item v-if="studentIcForm.originalIcCardNo" label="原卡号">
          <p>{{ studentIcForm.originalIcCardNo }}</p>
        </el-form-item>
        <el-form-item label="学生卡号">
          <el-input ref="bindICCardFormInput" v-model="studentIcForm.icCardNo" @change="handleCardInputChange" clearable
                    placeholder="请刷卡读取卡号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bindIcCardDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddOrUpdateIcCard()"
                   :loading="studentIcFormSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 预览下载二维码 -->
    <download-student-info v-model="studentQrCodeVisible"></download-student-info>

    <!-- 导出学员弹框 -->
    <el-dialog title="正在导出中" :visible.sync="exportStudentsDialog" width="300px" :show-close="false" :center="true"
               :close-on-press-escape="false" :close-on-click-modal="false">
      <div class="progress">
        <el-progress v-if="processStatus === 0" type="circle" :percentage="percentage"
                     :color="percentageColor"></el-progress>
        <el-progress v-else type="circle" :percentage="percentage" status="exception"></el-progress>
      </div>
      <div slot="footer" class="dialog-footer cancelExprot">
        <el-button @click="cancelExportStudent">取消导出</el-button>
      </div>
    </el-dialog>

    <!-- 修正截止时间 -->
    <el-dialog title="修正截止日期" :visible.sync="dialogEndCourseTimesVisible" width="300px">
      <el-form ref="validTimeForm" :model="endCourseForm" :rules="validTimeRules">
        <el-form-item label="原截止日期:" label-width="100px">
          <span>{{ oldTime ? oldTime.slice(0, 10) : '  - - ' }}</span>
        </el-form-item>
        <el-form-item label="新截止日期:" label-width="100px" prop="validTime">
          <el-date-picker
            v-model="endCourseForm.validTime"
            type="date"
            style="width: 130px"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="offEndCourseValidTime">取 消</el-button>
        <el-button type="primary" :loading="setEndCourseValidTimeLoading" @click="setEndCourseValidTime">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 转课弹框 -->
    <el-dialog
      title="转课"
      :visible.sync="transferDialogVisible"
      width="1200px"
      class="student-detail-dialog"
      :modal-append-to-body='false'
      :append-to-body="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="handleTransferClose">
      <div class="transfer-info">
        <!-- 转出信息 -->
        <div>
          <h3 class="title">转出信息</h3>
          <div class="course">
            <span>转课课程：</span>
            <el-select v-model="selectTransferCourseList" @change="changeTransferCourse" collapse-tags multiple  clearable placeholder="请选择转课课程">
              <el-option
                v-for="item in filterMyCourseList"
                :key="item.courseId"
                :label="item.courseName"
                :value="item.courseId"
                >
              </el-option>
            </el-select>
          </div>
          <el-alert
          style="margin-bottom: 10px"
            title="按期收费（不沿用课时）课程，如不勾选是否退课或是否结课，该课程将不做任何处理"
            :closable="false"
            type="warning">
          </el-alert>
          <el-table :data="transferCourseList" border style="width: 100%">
            <el-table-column prop="courseName" fixed label="课程名称" min-width="120" >
              <template slot-scope="scope">
                {{ scope.row.courseName }}
                <el-tag size="mini" style="margin-left: 6px;">
                  {{ scope.row.courseGiveLessonsWay === 0 ? '一对一' : '一对多' }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- <el-table-column label="就读状态" width="88">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.stopCourse === 0 ? 'success' : 'info'" style="margin-left: 6px;">
                  {{ scope.row.stopCourse === 0 ? '在读' : '停课' }}
                </el-tag>
              </template>
            </el-table-column> -->
            <!-- <el-table-column prop="className" label="班级名称" align="center" width="160">
              <template slot-scope="scope">
                <template v-if="scope.row.classId">
                  {{ scope.row.className }}
                  <el-tag type="primary" size="mini" style="margin-left: 3px;cursor: pointer;"
                          @click="handleTransferClass(scope.row)">转班<i class="el-icon-sort"></i></el-tag>
                </template>
                <el-popover
                  v-else
                  placement="right"
                  title="未分班提示"
                  width="200"
                  trigger="hover"
                  content="尚未给该课程分班，是否进行插班？">
                  <el-button slot="reference" type="primary" plain @click="insertClass(scope.row)" size="mini">插班
                  </el-button>
                </el-popover>
              </template>
            </el-table-column> -->

            <el-table-column prop="classHour" label="购买课时" align="center" width="78">
              <template slot-scope="scope">
                <span class="append-unit" v-if="scope.row.enableClassHour !== 0">{{ scope.row.classHour }}课时</span>
                <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                  <span v-if="scope.row.valuationType === 1">一期</span>
                  <span
                    v-if="scope.row.valuationType === 2">{{
                      scope.row.timeCount + sendTimeType[scope.row.timeType].date
                    }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="alreadyUseClassHour" label="消课课时" align="center" width="78">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 0">{{ scope.row.alreadyUseClassHour }} 课时</span>
                <span v-else> {{ scope.row.enableClassHour ? scope.row.alreadyUseClassHour + '课时' : '-' }} </span>
              </template>
            </el-table-column>
            <el-table-column label="剩余课时" align="center" width="78">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 0 || (scope.row.valuationType === 1 && scope.row.enableClassHour) || (scope.row.valuationType === 2 && scope.row.enableClassHour)">
                  {{calcSurplusClassHour(scope.row.valuationType, scope.row.enableClassHour, scope.row.classHour, scope.row.alreadyUseClassHour)}} 课时
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="periodStartDate" label="开始日期" align="center" width="84">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.valuationType === 1">
                    {{ scope.row.periodStartDate ? scope.row.periodStartDate.slice(0, 10) : '-' }}
                  </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="validTime" label="截止日期" align="center" width="84">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.valuationType !== 1">{{
                    scope.row.validTime ? scope.row.validTime.slice(0, 10) : '-'
                  }}</span>
                <span v-else>{{ scope.row.periodEndDate ? scope.row.periodEndDate.slice(0, 10) : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="validTime" label="总天数" align="center" width="78">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0">{{getNumberOfDays(scope.row.periodStartDate, scope.row.periodEndDate)}}天</span>
                <span v-else-if="scope.row.valuationType === 2 && scope.row.enableClassHour === 0">{{scope.row.allTime}}天</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="validTime" label="剩余天数" align="center" width="78">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0">
                  <span v-if="new Date() > new Date(scope.row.periodStartDate) && new Date() < new Date(scope.row.periodEndDate)">{{getNumberOfDays(getNowFormatDate(new Date()), scope.row.periodEndDate) + '天'}}</span>
                  <span v-else-if="new Date() < new Date(scope.row.periodStartDate)">未开始</span>
                  <span v-else>已结束</span>
                  <!-- {{new Date() > new Date(scope.row.periodStartDate) ? getNumberOfDays(getNowFormatDate(new Date()), scope.row.periodEndDate) + '天' : '未开始'}} -->
                </span>
                <span v-else-if="scope.row.valuationType === 2 && scope.row.enableClassHour === 0">
                  {{getNumberOfDays(getNowFormatDate(new Date()), scope.row.validTime)}}天
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="classHourSignalPrice" label="课程单价" align="center" width="88">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 2 && scope.row.enableClassHour === 0">{{scope.row.newTimeSinglePrice + '元'}}</span>
                <span v-else-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0">{{scope.row.periodSinglePrice + '元'}}</span>
                <span v-else>{{ scope.row.classHourSignalPrice + '元' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="购买价格" align="center" width="88">
              <template slot-scope="scope">{{ scope.row.price + '元' }}</template>
            </el-table-column>
            <el-table-column prop="transferOutNum" fixed="right" label="转出数量" align="center" width="140">
              <template slot-scope="scope">
                <el-input-number
                  v-if="scope.row.valuationType === 0 || (scope.row.valuationType === 1 && scope.row.enableClassHour) || (scope.row.valuationType === 2 && scope.row.enableClassHour)"
                  v-model="scope.row.transferOutNum"
                  :min="0"
                  :precision="2"
                  :max="calcSurplusClassHour(scope.row.valuationType, scope.row.enableClassHour, scope.row.classHour, scope.row.alreadyUseClassHour)"
                  >
                </el-input-number>
                <span v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0">-</span>
                <!-- <el-input-number
                  v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0 && (new Date() > new Date(scope.row.periodStartDate) && new Date() < new Date(scope.row.periodEndDate))"
                  v-model="scope.row.transferOutNum"
                  :min="0"
                  :max="getNumberOfDays(getNowFormatDate(new Date()), scope.row.periodEndDate)"
                  :step="1"
                  step-strictly
                  >
                </el-input-number>
                <el-input-number
                  v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0 && (new Date() < new Date(scope.row.periodStartDate))"
                  v-model="scope.row.transferOutNum"
                  :min="0"
                  :max="getNumberOfDays(scope.row.periodStartDate, scope.row.periodEndDate)"
                  :step="1"
                  step-strictly
                  >
                </el-input-number>
                <el-input-number
                  v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0 && (new Date() > new Date(scope.row.periodEndDate))"
                  v-model="scope.row.transferOutNum"
                  :min="0"
                  :max="0"
                  :step="1"
                  step-strictly
                  >
                </el-input-number> -->
                <el-input-number
                  v-if="scope.row.valuationType === 2 && scope.row.enableClassHour === 0"
                  v-model="scope.row.transferOutNum"
                  :min="0"
                  :max="getNumberOfDays(getNowFormatDate(new Date()), scope.row.validTime)"
                  :step="1"
                  step-strictly
                  >
                </el-input-number>
              </template>
            </el-table-column>
            <el-table-column fixed="right" prop="" label="应转金额/元" align="center" width="98">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0">
                  <!-- ￥<el-input v-model="scope.row.transferPeriodPrice" @blur="handleTransferPeriodPrice(scope.row)" placeholder="请输入金额"></el-input> -->
                  ￥{{scope.row.transferPeriodPrice}}
                </span>
                <span v-else>￥{{scope.row.transferOutPrice > 0 ? scope.row.transferOutPrice : 0}}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" prop="" label="实转金额/元" align="center" width="108">
              <template slot-scope="scope">
                <span v-if="scope.row.valuationType === 1 && scope.row.enableClassHour === 0" class="transfer-period-price">
                  ￥<el-input :disabled="scope.row.needBowOut || scope.row.needEndCourse ? false : true" v-model="scope.row.transferActualPrice" placeholder="请输入金额" @blur="handleInputActualPrice(scope.row)" ></el-input>
                </span>
                <span v-else class="transfer-period-price">
                  ￥<el-input :disabled="scope.row.transferOutNum || scope.row.transferPeriodPrice ? false : true" v-model="scope.row.transferActualPrice" @blur="handleInputActualPrice(scope.row)" placeholder="请输入金额"></el-input>
                </span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" prop="needBowOut" label="是否退课" align="center" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.needBowOut" :disabled="scope.row.needEndCourse ? true : false"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column fixed="right" prop="needEndCourse" label="是否结课" align="center" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.needEndCourse" :disabled="scope.row.needBowOut ? true : false"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="48">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleDeleteTransferCourse(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="transfers-total">
            转出金额：<span class="transfers-price">￥{{transfersTotal}}元</span>
          </div>
        </div>
        <!-- 转入信息 -->
        <div>
          <h3 class="title">转入信息</h3>
          <div class="add-course-button">
            <el-button icon="el-icon-circle-plus-outline" type="text" size="default" @click="showSelectCourse= true">选择课程</el-button>
          </div>
          <div>
            <div class="new-buy">
              <h4 class="title">
                选择的课程
              </h4>
              <div class="total">课程总计: <span class="new-price">￥{{totalCoursePrice}}元</span></div>
            </div>
            <el-table :data="selectedNewBuyCourseList" class="course-table left-right-boder">
              <el-table-column prop="name" fixed="left" min-width="120" label="课程名称">
                <template slot-scope="scope">
                  <span>{{scope.row.name}}</span>
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
                  <span v-if="scope.row.enableClassHour !== 0">
                    <!-- <span v-if="scope.row.sendClassHour !== undefined && scope.row.classHour !== undefined && scope.row.classHour > 0">{{scope.row.sendClassHour + scope.row.classHour}}课时</span> -->
                    <span>{{scope.row.sendClassHour + scope.row.classHour}}课时</span>
                  </span>
                  <div class="right-unit-number" v-if="scope.row.enableClassHour === 0">
                    <span v-if="scope.row.valuationType === 1">--</span>
                    <span v-if="scope.row.valuationType === 2">{{scope.row.sendTimeCount * sendTimeType[scope.row.sendTimeUnit].time + scope.row.timeCount * sendTimeType[scope.row.timeType].time}} 天</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="validTime" label="截止日期" width="160" align="center">
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
          </div>
          <!-- 学杂 -->
          <div>
            <div class="add-course-button course-button">
              <el-button icon="el-icon-circle-plus-outline" type="text" size="default" @click="showSelectTuition = true">选择学杂</el-button>
            </div>
            <div class="new-buy">
              <h4 class="title">
                选择的学杂
              </h4>
              <div class="total">学杂总计: <span class="new-price">￥{{totalTuitionPrice}}元</span></div>
            </div>
            <el-table :data="selectedNewBuyTuitionList" class="left-right-boder">
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
            <div class="transfers-total">
              转入金额：<span class="transfers-price">￥{{shouldTotalFee}}元</span>
            </div>
          </div>
        </div>
        <!-- 支付信息 -->
        <div>
          <h3 class="title">{{ transfersTotalPrice >= 0 ? '支付信息' : '退款信息' }}</h3>
          <el-form ref="orderInfo" :model="orderInfo" :rules="orderRules" label-width="80px" size="small" class="form-wrapper" style="padding-left: 10px;">
            <p class="custom-form-item">
              <label>学员姓名</label>
              <span>{{studentDetail ? studentDetail.name : ''}}</span>
            </p>
            <p class="custom-form-item">
              <label>{{shouldTotalFee - transfersTotal >= 0 ? '应付价格' : '应退价格'}}</label>
              <span class="color-danger">￥ {{Math.abs(transfersTotalPrice)}} 元</span>
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
              <el-button type="primary" plain @click="orderInfo.totalFee = Math.abs(transfersTotalPrice)">全额付款</el-button>
            </el-form-item>
            <el-form-item prop="payTime" label="支付时间">
              <el-date-picker v-model="orderInfo.payTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择支付时间"></el-date-picker>
            </el-form-item>
            <el-form-item prop="remark" label="备注信息">
              <el-input v-model="orderInfo.remark" style="width: 500px" type="textarea" :rows="4" placeholder="请输入备注信息(最多120个字)" :maxlength="120"
                show-word-limit></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleTransferClose">取 消</el-button>
        <el-button type="primary" @click="handleTransferSubmit" :loading="transferSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="退课"
      :visible.sync="dropOutdialogFormVisible"
      width="500px"
      class="student-detail-dialog"
      :modal-append-to-body='false'
      :append-to-body="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="handleDropOutClose"
    >
      <div class="drop-out">
        <div class="item">
          <div class="student">
            <span>学员：</span>
            <span class="student-info">{{this.studentDetail ? this.studentDetail.name : ''}}</span>
          </div>
          <div>
            <span>课程：</span>
            <span class="student-info">{{quitCourseName}}</span>
          </div>
        </div>
        <div class="item">
          退课金额：<el-input style="width: 200px" v-model="quitMoney" placeholder="请输入退课金额"></el-input>
        </div>
        <div class="item">
          退款方式： <pay-type v-model="quitPayType"></pay-type>
        </div>
        <div class="item">
          温馨提示： <span style="color: #F56C6C">退课会退费，并删除该课的报名记录！是否确定退课？</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDropOutClose">取 消</el-button>
        <el-button type="primary" @click="handleDropOutSubmit" :loading="dropOutSubmitLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 选择课程弹窗 -->
    <select-course-dialog v-model="showSelectCourse" :transferCourseList="transferCourseList" @submit="selectCourse"></select-course-dialog>
    <!-- 选择学杂弹窗 -->
    <select-tuition-dialog v-model="showSelectTuition" @submit="selectTuition"></select-tuition-dialog>
    <!-- 订单详情 -->
    <order-detail-dialog ref="transferOrderDetailDialog"></order-detail-dialog>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import QRCode from '../../components/QRCode'
import { mapGetters } from 'vuex'
import moment from 'moment'
import { phoneValidator, idCardValidator } from '../../utils/validate.js'
import OrderDetailDialog from '../salesManagement/OrderDetailDialog'

import SelectClassDialog from './components/SelectClassDialog'
import { saveAs } from 'file-saver'
// import { exportExcel, importExcel } from '../../utils/xlsxUtils.js'
import { importExcel } from '../../utils/xlsxUtils.js'
import ScreenCapture from '../../components/ScreenCapture'
import PayType from '../../components/PayType'
import { ImortRecord, PhoneAreaCode } from '../../utils/storage'
import store from '../../store'

import DownloadStudentInfo from './components/DownloadStudentInfo'
import AreaCode from '@/components/PhoneAreaCode'

// import { SystemAuthInfo } from '@/utils/user'

import SelectCourseDialog from './components/SelectCourseDialog'
import SelectTuitionDialog from './components/SelectTuitionDialog'
moment.locale('zh-cn')

export default {
  name: 'Student',
  data() {
    return {
      showSelectCourse: false,
      showSelectTuition: false,
      toStudentFileDisabled: true,
      setEndCourseValidTimeLoading: false,
      dropOutdialogFormVisible: false, // 退课弹框
      dropOutSubmitLoading: false, // 退课提交
      // 允许选择时间
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      dialogEndCourseTimesVisible: false, // 修正截止时间弹窗
      oldTime: '',
      endCourseForm: {
        id: '',
        validTime: ''
      },
      validTimeRules: {
        validTime: { required: true, message: '请选择新的截止日期', trgger: 'blur' }
      },
      sendTimeType: [
        { date: '天', time: 1 },
        { date: '月', time: 30 },
        { date: '季度', time: 90 },
        { date: '半年', time: 180 },
        { date: '年', time: 365 }
      ],
      selectedTotal: 0,
      detailTab6Loading: false,
      selectedCourseList: [], // 订单信息-课程信息
      selectedTuitionList: [], // 订单信息-学杂列表
      selectedStudentID: '',
      studentQrCodeVisible: false, // 下载预览
      isAdmin: false,
      showEditStudent: false,
      showDetail: false,
      showSelectClass: false,
      showCapture: false,
      showImport: false,
      showImportFileTip: false,
      queryLoading: false,
      editLoading: false,
      courseLoading: false,
      classLoading: false,
      exportLoading: false,
      importLoading: false,
      reviseClassHourDialog: false,
      reviseSearchLoading: false, // 批量修改中的搜索
      reviseResetLoading: false,
      reviseQueryLoading: false,
      reviseDialogTableVisible: false, // 批量修改确定提交弹框
      reviseSubmitLoading: false, // 批量修改学生剩余课时
      sureResviseDisabled: true, // 修改学员剩余课时确定按钮
      exportStudentsDialog: false, // 导出学员信息弹框
      transferSubmitLoading: false,
      currentTab: '0',
      detailTab: '0',
      tabList: [
        {
          name: '0',
          label: '在读学员'
        },
        {
          name: '1',
          label: '历史学员'
        }
      ],
      percentage: 0, // 导出学员进度
      percentageColor: '#67c23a', // 进度条颜色
      processStatus: 0, // 进度条状态
      courseList: [], // 所有课程列表
      classList: [], // 所有班级列表
      relationList: [], // 与学员关系列表
      sourceList: [], // 来源列表
      schoolList: [], // 周边学校列表
      gradeListForInlineSelect: [
        { id: '托管', name: '托管' },
        { id: '小班', name: '小班' },
        { id: '中班', name: '中班' },
        { id: '大班', name: '大班' },
        { id: '一年级', name: '一年级' },
        { id: '二年级', name: '二年级' },
        { id: '三年级', name: '三年级' },
        { id: '四年级', name: '四年级' },
        { id: '五年级', name: '五年级' },
        { id: '六年级', name: '六年级' },
        { id: '初一', name: '初一' },
        { id: '初二', name: '初二' },
        { id: '初三', name: '初三' },
        { id: '高一', name: '高一' },
        { id: '高二', name: '高二' },
        { id: '高三', name: '高三' }
      ], // table查询列表下拉选择
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
      searchTypeList: [
        {
          value: 'name',
          label: '学员姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'primaryContactPhone',
          label: '家长号码',
          placeholder: '请输入家长手机号码'
        }
      ],
      queryForm: {
        searchType: 'name',
        searchInput: '',
        courseId: '',
        classId: '',
        grade: null,
        provenanceId: null, // 来源渠道
        noClass: false,
        onCourseTime: false
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      studentList: [],
      filters: [],
      search: '',
      historyStudent: [],
      phoneValidator,
      studentDetail: null,
      studentForm: {
        id: null,
        name: '',
        nickName: '',
        sex: '',
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
        primaryContactPhone: { required: true, message: '', trgger: 'blur' },
        idCard: {
          validator: idCardValidator,
          message: '请填写正确的身份证号码',
          trgger: ['change', 'blur']
        }
      },
      /** 学员详情相关 */
      enrollDataTab: '0', // 报名操作栏的选中
      currentCourse: null, // 当前选中的课程
      currentClass: null, // 当前选中的班级
      currentClassName: null, // 当前选中的班级名称
      myCourseList: [], // 在读课程
      myCourseListQueryForm: { // 所报课程检索条件
        courseName: null
      },
      historyCourseList: [], // 历史课程
      myTuitionList: [], // 学杂列表
      // 分页数据
      queryParam: {
        // 默认初始页
        pageNum: 1,
        // 默认每页数据条数
        pageSize: 10,
        type: null,
        status: null
      },
      timetableDate: [
        moment().format('YYYY-MM-DD') + ' 00:00:00',
        moment().add(30, 'days').format('YYYY-MM-DD') + ' 23:59:59'
      ], // 课表列表时间选择
      timetablePickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      timetableList: [], // 课表列表
      attendanceDate: [
        moment().subtract(29, 'days').format('YYYY-MM-DD') + ' 00:00:00',
        moment().format('YYYY-MM-DD') + ' 23:59:59'
      ], // 点名签到列表时间选择
      attendanePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      },
      orderDetail: [], // 订单详情
      attendanceList: [], // 点名签到列表
      studentPartriarchsList: [], // 绑定家长列表
      fixClassHourRecordList: [], // 修正课时数记录
      quitMoney: 0, // 退课金额
      quitPayType: 0, // 退课的支付方式
      quitCourseName: 0, // 退课课程名称
      quitCourseId: null, // 退课课程id
      uploadFileName: '',
      uploadErrList: [], // 上传过程中错误信息
      importErrRepeat: [], // 下载导入模板时，有重复的课程名称
      importErrInvalide: [], // 下载导入模板时，有特殊字符的课程名称
      fixClassHourShow: false, // 显示修正课时数量dialog
      fixNewClassHour: 0, // 修正课时数 数量
      fixRemark: '', // 修正课时数备注
      fixCourseName: '', // 待修正的课时数名称
      fixCourseId: '', // 待修正的课时数名称
      fixOriginalClassHour: 0, // 待修正课时数的原课时数
      fixTotalClassHour: 0, // 待修正课程的总课时数
      bindIcCardDialogVisible: false,
      // 批量修改学生剩余课时
      tableLoading: true, // 表单加载数据时出现loading
      studentCourseInfo: [], // 批量修改中的数据
      studentCourseInfoTotal: 0, // 批量修改中的分页的total
      desc: '', // 批量修改中的描述
      reviseSearchName: '', // 批量修改中搜索输入框输入的名字
      selectedStudentName: [], // 批量修改中选中的学生名字
      reviseRemarks: '', // 批量修改中的修改备注
      studentIcForm: {
        // 学生IC卡信息
        id: null,
        icCardNo: null,
        originalIcCardNo: null
      },
      studentIcFormSubmitLoading: false,
      unBindICCardLoading: false,
      // 转课
      filterMyCourseList: [], // 我的课程中有剩余课时/时间还未到期的可选课程
      transferDialogVisible: false,
      selectTransferCourseList: [], // 转出课程
      transferCourseList: [], // 转出课程信息
      transfersTotal: 0, // 转出金额
      courses: [], // 新报名课程回显数据
      selectedNewBuyCourseList: [], // 选择新买的课程列表
      selectedNewBuyTuitionList: [], // 选择新买的课程学杂
      selectedNewcourseLoading: false,
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
      teacherList: [], // 员工列表
      orderInfo: {
        payTime: '', // 支付时间
        payType: '', // 支付方式
        totalFee: '', // 实收总价格
        recommendUserId: '', // 订单经办人
        remark: null // 备注
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
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.name === 'StudentEnroll') {
        // 下面的请求暂时注释掉，不知道会不会有影响
        // vm._getStudentList()
      }
    })
  },
  components: {
    SelectClassDialog,
    InlineSelect,
    ScreenCapture,
    [QRCode.name]: QRCode,
    DownloadStudentInfo,
    OrderDetailDialog,
    AreaCode,
    SelectCourseDialog,
    SelectTuitionDialog,
    PayType
  },
  computed: {
    parentQrCode() {
      if (this.studentDetail && this.studentDetail.id) {
        if (this.organizationInfo.openWechatDeploy === 1) {
          // todo 暂时先处理墨蕊阅读为单独的链接
          // if (this.organizationInfo.id === '3aabbf6b42bc4697b7facae1fbd7ec1b') {
          //   return `http://wechat.tlybond.com/parent/#/bindStudent/${
          //     this.studentDetail.id
          //   }?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
          // }
          return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${
            this.studentDetail.id
          }?_t=${Date.now()}&organizationId=${this.organizationInfo.id}`
        }
        return `${process.env.VUE_APP_PARENT_URL}/#/bindStudent/${
          this.studentDetail.id
        }?_t=${Date.now()}`
      }
      return ''
    },
    searchTypePlaceholder() {
      return this.searchTypeList.find(
        (o) => o.value === this.queryForm.searchType
      ).placeholder
    },
    // 转入：课程价格总计
    totalCoursePrice() {
      let countPrice = 0
      this.selectedNewBuyCourseList.forEach((item) => {
        countPrice += Number(item.price) || 0
      })
      return Number(countPrice.toFixed(2))
    },
    // 转入： 学杂价格总计
    totalTuitionPrice() {
      let countPrice = 0
      this.selectedNewBuyTuitionList.forEach((item) => {
        countPrice += Number(item.price)
      })
      return Number(countPrice.toFixed(2))
    },
    // 转入：总价格
    shouldTotalFee() {
      return Number((this.totalCoursePrice + this.totalTuitionPrice).toFixed(2))
    },
    // 支付/退款价格
    transfersTotalPrice() {
      return (this.shouldTotalFee - this.transfersTotal).toFixed(2)
    },
    transferCourseListJSON() {
      return JSON.stringify(this.transferCourseList)
    },
    ...mapGetters(['organizationInfo', 'currentBranch', 'userInfo'])
  },
  created() {
    // 校验当前登录用户是否是超级管理员，只有超级管理员才能删除学生数据
    if (this.userInfo && this.userInfo.roles) {
      for (let i = 0; i < this.userInfo.roles.length; i++) {
        if (this.userInfo.roles[i].id === '0') {
          this.isAdmin = true
          break
        }
      }
    }
    this._getStudentList()
    this.studentForm.primaryContactPhoneAreaCode = PhoneAreaCode.getCheck()
  },
  methods: {
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.studentForm.primaryContactPhoneAreaCode = info
    },
    toStudentFile(item) {
      this.$router.push({
        path: `studentFile`,
        query: {
          id: item.id
        }
      })
    },
    handleCardInputChange(value) {
      let cardReg = /^\d{10}/
      if (cardReg.test(value)) {
        this.icCardNo = value
        this.handleAddOrUpdateIcCard()
      }
    },
    // 打开修正课时页面
    endCourseTimes(row) {
      this.dialogEndCourseTimesVisible = true
      this.oldTime = row.validTime
      this.endCourseForm.id = row.id
    },
    // 提交修正课时
    setEndCourseValidTime() {
      this.$refs.validTimeForm.validate((valid) => {
        if (valid) {
          this.setEndCourseValidTimeLoading = true
          this.$http.post(`/v1/studentCourse/fixCourseValidTime?id=${this.endCourseForm.id}&validTime=${this.endCourseForm.validTime}`).then(res => {
            // 清除表单数据
            this.offEndCourseValidTime()
            this.$message({
              message: '截止日期修改成功',
              type: 'success'
            })
            // 重新获取列表数据
            this._getMyCourseList()
          }).finally(() => {
            this.setEndCourseValidTimeLoading = false
          })
        }
      })
    },
    offEndCourseValidTime() {
      this.dialogEndCourseTimesVisible = false
      this.endCourseForm = {
        id: '',
        validTime: ''
      }
    },
    // 打开订单详情
    handleOpenOrderDetail(orderId) {
      this.$refs.orderDetailDialog.open(orderId)
    },
    // 学员订单每页数据条数
    handleSizeChange(pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNum = 1
      this._etStudentPrdeList(this.selectedStudentID)
    },
    // 当前页
    handleCurrentChange(currentPage) {
      this.queryParam.pageNum = currentPage
      this._etStudentPrdeList()
    },
    // 获取学生列表
    _getStudentList() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        grade: this.queryForm.grade,
        provenanceId: this.queryForm.provenanceId,
        status: this.currentTab,
        classId: this.queryForm.classId,
        courseId: this.queryForm.courseId,
        noClass: this.queryForm.noClass ? 1 : null,
        onCourseTime: this.queryForm.onCourseTime ? 1 : null
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      this.queryLoading = true
      this.$http
        .get('/v1/Student/getStudentList', params)
        .then((res) => {
          this.filters = []
          let arr = []
          res.data.forEach((item) => {
            item.remainingClassHour = this.calcSurplusClassHour(0, true, item.totalClassHour, item.totalAlreadyUseClassHour)
            arr.push(item.remainingClassHour)
            if (item.birthday) {
              item.birthday = item.birthday.split(' ')[0]
              item.age = Math.abs(moment(item.birthday).diff(moment(), 'year'))
            }
            switch (item.sex) {
              case 1:
                item.sexIcon = require('../../assets/icon_male.png')
                break
              case 2:
                item.sexIcon = require('../../assets/icon_famale.png')
            }
            if (item.remark == null) item.remark = ''
            item.remarkCopy = item.remark
          })
          let filterList = [...new Set(arr)]
          filterList.forEach((item) => {
            this.filters.push({
              value: item,
              text: item
            })
          })
          this.studentList = res.data
          this.total = res.total
        })
        .finally(() => {
          this.queryLoading = false
        })
    },
    // 获取班级列表
    _getClassList() {
      if (this.classList.length > 0) return
      this.classLoading = true
      this.$http
        .get('/v1/Class/getForDropDown', {
          departmentId: this.currentBranch.id
        })
        .then((res) => {
          this.classList = res.data
        })
        .finally(() => {
          this.classLoading = false
        })
    },
    // 获取课程列表
    _getCourseList() {
      if (this.courseList.length > 0) return
      this.courseLoading = true
      this.$http
        .get(`/v1/Course/getAllByDepartmentId`, {
          departmentId: this.currentBranch.id
        })
        .then((res) => {
          this.courseList = res.data
        })
        .finally(() => {
          this.courseLoading = false
        })
    },
    // 获取关系列表
    _getRelationList() {
      if (this.relationList.length > 0) return
      this.$http.get('/v1/dictionary/DicRelation/getAll').then((res) => {
        this.relationList = res.data
      })
    },
    // 获取来源渠道列表
    _getSourceList() {
      if (this.sourceList.length > 0) return
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
    // 获取周边学校列表
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
    // 学员所报课程名检索
    handlecourseNameSearch() {
      this._getMyCourseList()
    },
    // 重置筛选条件
    handleCourseNameSearchReset() {
      this.myCourseListQueryForm = {
        courseName: null
      }
      this._getMyCourseList()
    },
    // 获取学员在读课程
    _getMyCourseList() {
      this.myCourseList = []
      this.$http
        .get('/v1/Course/getStudentCourse/' + this.studentDetail.id, {
          endStatus: 0,
          courseName: this.myCourseListQueryForm.courseName
        })
        .then((res) => {
          res.data.forEach(item => {
            Object.assign(item, { transferOutNum: 0, transferOutPrice: 0, transferActualPrice: 0, transferPeriodPrice: 0, needBowOut: false, needEndCourse: false })
          })
          this.myCourseList = res.data
        })
    },
    // 获取学员历史课程
    _getHistoryCourseList() {
      this.historyCourseList = []
      this.$http
        .get('/v1/Course/getStudentCourse/' + this.studentDetail.id, {
          endStatus: 1
        })
        .then((res) => {
          res.data.forEach((item) => {
            item.endStatusStr = '已结课'
          })
          this.historyCourseList = res.data
        })
    },
    // 获取学员学杂列表
    _getMyTuitionList() {
      this.myTuitionList = []
      this.$http
        .get('/v1/TuitionFee/getStudentTuitionFeeList/' + this.studentDetail.id)
        .then((res) => {
          res.data.forEach((item) => {
            item.singlePrice = Number((item.price / item.tuitionNum).toFixed(2))
          })
          this.myTuitionList = res.data
        })
    },
    // 获取学员最近课表。未来一月
    _getTimetableList() {
      this.timetableList = []
      if (!this.timetableDate || this.timetableDate.length === 0) {
        this.timetableDate = [
          moment().format('YYYY-MM-DD') + ' 00:00:00',
          moment().add(30, 'days').format('YYYY-MM-DD') + ' 00:00:00'
        ]
      }
      this.$http
        .get('/v1/CoursePlan/getStudentCourseTime/' + this.studentDetail.id, {
          startDate: this.timetableDate[0],
          endDate: this.timetableDate[1]
        })
        .then((res) => {
          res.data.forEach((item) => {
            item.courseTimeStr =
              moment(item.goToClassDate).format('YYYY-MM-DD') +
              ' ' +
              moment(item.goToClassDate).format('dddd') +
              ' ' +
              moment('2019-09-03 ' + item.goToClassStartTime).format('HH:mm') +
              '~' +
              moment('2019-09-03 ' + item.goToClassEndTime).format('HH:mm')
          })
          this.timetableList = res.data
        })
    },
    // 获取学员最近考情。最近一周
    _getAttendanceList() {
      this.attendanceList = []
      if (!this.attendanceDate || this.attendanceDate.length === 0) {
        this.attendanceDate = [
          moment().subtract(29, 'days').format('YYYY-MM-DD') + ' 00:00:00',
          moment().format('YYYY-MM-DD') + ' 23:59:59'
        ]
      }
      this.$http
        .get(
          '/v1/CourseCheckingIn/getStudentCourseCheckingIn/' +
          this.studentDetail.id,
          {
            startDate: this.attendanceDate[0],
            endDate: this.attendanceDate[1]
          }
        )
        .then((res) => {
          res.data.forEach((item) => {
            item.courseTimeStr =
              moment(item.goToClassDate).format('YYYY-MM-DD') +
              ' ' +
              moment(item.goToClassDate).format('dddd') +
              ' ' +
              moment('2019-09-03 ' + item.goToClassStartTime).format('HH:mm') +
              '~' +
              moment('2019-09-03 ' + item.goToClassEndTime).format('HH:mm')

            // makeUpMissedLessonsStatus 补课处理状态 0未处理 1已补课 2已忽略
            // makeUpMissedLessonsTime 补课时间
            switch (item.callRollStatus) {
              case 0:
                item.statusType = 'success'
                item.statusStr = '到课'
                break
              case 1:
                if (item.makeUpMissedLessonsTime != null) {
                  if (item.makeUpMissedLessonsStatus === 1) {
                    item.statusStr = '缺勤(已补课)'
                  } else {
                    item.statusStr = '缺勤(已忽略)'
                  }
                } else {
                  item.statusStr = '缺勤'
                }
                item.statusType = 'danger'
                break
              case 2:
                if (item.makeUpMissedLessonsTime != null) {
                  if (item.makeUpMissedLessonsStatus === 1) {
                    item.statusStr = '请假(已补课)'
                  } else {
                    item.statusStr = '请假(已忽略)'
                  }
                } else {
                  item.statusStr = '请假'
                }
                item.statusType = 'warning'
                break
              case 3:
                item.statusType = 'danger'
                item.statusStr = '未点名'
                break
            }
          })
          this.attendanceList = res.data
        })
    },
    // 获取学员家长列表
    _getStudentPartriarchsList() {
      this.studentPartriarchsList = []
      this.$http
        .get('/v1/SudentPatriarch/getPatriarchsInfo', {
          studentId: this.studentDetail.id,
          organizationId: this.organizationInfo.id
        })
        .then((res) => {
          this.studentPartriarchsList = res.data
        })
    },
    _getFixClassHourRecordList() {
      this.fixClassHourRecordList = []
      this.$http
        .get('/v1/fixClassRecord', {
          studentId: this.studentDetail.id
        })
        .then((res) => {
          this.fixClassHourRecordList = res.data.reverse()
        })
    },
    // 学员详情弹出框关闭事件
    handleStudentDetailClose() {
      this.timetableDate = [
        moment().format('YYYY-MM-DD') + ' 00:00:00',
        moment().add(30, 'days').format('YYYY-MM-DD') + ' 23:59:59'
      ]
      this.attendanceDate = [
        moment().subtract(29, 'days').format('YYYY-MM-DD') + ' 00:00:00',
        moment().format('YYYY-MM-DD') + ' 23:59:59'
      ]
    },
    // 未来课表时间变化事件处理
    handleTimetableDateTimeSelectChange() {
      this._getTimetableList()
    },
    // 上课记录时间选择变化事件处理
    handleAttendDateTimeSelectChange() {
      this._getAttendanceList()
    },
    // 未分班发生变化
    handleNoClassChange(val) {
      if (val) {
        this.queryForm.onCourseTime = false
      }
      this.query()
    },
    // 在课发生变化
    handleOnCourseChange(val) {
      if (val) {
        this.queryForm.noClass = false
      }
      this.query()
    },
    // 年龄发生变化
    handleAgeChange(age) {
      this.studentForm.birthday = moment()
        .subtract('years', age)
        .format('YYYY-MM-DD')
    },
    // 生日变化
    handleBirthdayChange(birthday) {
      this.studentForm.age = Math.abs(moment(birthday).diff(moment(), 'year'))
    },
    // 过滤学校
    filterSchool(query, cb) {
      cb(
        this.schoolList.filter((item) => {
          return item.name.indexOf(query) > -1
        })
      )
    },
    // 重置
    reset() {
      this.queryForm = {
        searchType: 'name',
        searchInput: '',
        courseId: '',
        classId: '',
        noClass: false,
        onCourseTime: false
      }
      this.query()
    },
    // 查询
    query() {
      this.pageNum = 1
      this._getStudentList()
    },
    editRemark(row, index) {
      this.$http
        .put('/v1/Student/updateStudent', {
          id: row.id,
          remark: row.remarkCopy
        })
        .then((res) => {
          row.remark = row.remarkCopy + ''
          this.$refs['remarkHack' + index].click()
        })
    },
    // 打开学员详细
    handleOpenDetail(row) {
      this.$http.get('/v1/StudentCover/getStudentDetailInfoByStudentId', { studentId: row.id }).then((res) => {
        if (res.data) {
          this.toStudentFileDisabled = false
        } else {
          this.toStudentFileDisabled = true
        }
      })
      this.studentDetail = Object.assign({}, row)
      this.selectedStudentID = row.id
      if (!this.studentDetail.avatar) {
        this.studentDetail.avatar = this.studentDetail.sex === 2 ? require('../../assets/famale-small.jpg') : require('../../assets/male-small.jpg')
      }
      // 重置数据
      this.detailTab = '0'
      this.myCourseList = []
      this.historyCourseList = []
      this.myTuitionList = []
      this.showDetail = true
    },
    _etStudentPrdeList() {
      // 获取学生订单信息列表
      this.detailTab6Loading = true
      this.$http.get('/v1/order/getOrderList', {
        studentId: this.selectedStudentID,
        pageNum: this.queryParam.pageNum, // 当前页
        pageSize: this.queryParam.pageSize, // 每页条数
        departmentId: this.currentBranch.id, // 校区id
        organizationId: this.organizationInfo.id // 机构id
      }).then((res) => {
        this.selectedCourseList = res.data
        this.selectedTotal = res.total
      }).finally(() => {
        this.detailTab6Loading = false
      })
    },
    // 编辑学生信息
    handleOpenEdit(row) {
      // 先重置数据
      this.studentForm = {
        id: null,
        name: '',
        nickName: '',
        sex: '',
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
        avatar: row.avatar,
        primaryContactPhoneAreaCode: '+86'
      }
      this._getRelationList()
      this._getSourceList()
      for (const key in this.studentForm) {
        if (this.studentForm.hasOwnProperty(key) && row[key] != null) {
          this.studentForm[key] = row[key]
        }
      }
      // 重置属性
      this.showEditStudent = true
      const that = this
      setTimeout(function () { that.$refs.mychild.setAreaCode(that.studentForm.primaryContactPhoneAreaCode) }, 100)
    },
    // 导航到订单页面
    handleNaviToOrder(row) {
      this.$router.push({
        path: '/sales/order',
        query: {
          studentId: row.id
        }
      })
    },
    // 给学生绑定磁卡
    handleBindIcCard(studenInfo) {
      if (Number(sessionStorage.getItem('enableUseCardDevice'))) {
        this.studentIcForm = {
          id: this.studentDetail.id,
          originalIcCardNo: studenInfo.icCardNo
        }
        this.bindIcCardDialogVisible = true
      } else {
        this.$message({
          message: '刷卡设备未授权',
          type: 'warning'
        })
      }
    },
    // 提交IC卡绑定信息
    handleAddOrUpdateIcCard() {
      if (!this.studentIcForm.icCardNo) {
        this.$message.warning('卡号不能为空')
        return
      }
      if (
        this.studentDetail.icCardNo &&
        this.studentIcForm.originalIcCardNo === this.studentIcForm.icCardNo
      ) {
        this.studentIcForm.icCardNo = null
        return this.$message.warning('待绑定的卡号与原卡号一致，无需再绑定')
      }
      this.studentIcFormSubmitLoading = true
      // const param = {
      //   studentId: this.studentIcForm.id,
      //   icCardNo: this.studentIcForm.icCardNo,
      //   organizationId: this.organizationInfo.id,
      //   departmentId: this.currentBranch.id
      // }
      // /v1/Student/studentBindICCard
      const param = {
        icCardNo: this.studentIcForm.icCardNo,
        organizationId: this.organizationInfo.id,
        targetId: this.studentIcForm.id,
        departmentId: this.currentBranch.id,
        type: 1
      }
      this.$http
        .put('/v1/IcCard/updateIcCardNoByTargetId', param)
        .then((res) => {
          this.$message.success(res.message)
          this.bindIcCardDialogVisible = false
          this.showDetail = false
          this.studentIcForm = {
            id: null,
            icCardNo: null,
            originalIcCardNo: null
          }
          this._getStudentList()
        }).finally(() => {
          this.studentIcFormSubmitLoading = false
          this.studentIcForm.icCardNo = null
        })
    },
    // 解除绑定IC卡操作
    handleUnbindICCard(studentInfo) {
      this.$confirm(
        `此操作将解除学生【${studentInfo.name}】对IC卡【${studentInfo.icCardNo}】的绑定, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.unBindICCardLoading = true
          // const param = {
          //   id: studentInfo.id,
          //   icCardNo: null
          // }
          // /v1/Student/updateICCardNo
          // /v1/IcCard/updateIcCardNoByTargetId
          const param = {
            icCardNo: '',
            organizationId: this.organizationInfo.id,
            targetId: studentInfo.id,
            departmentId: this.currentBranch.id,
            type: 1
          }
          this.$http
            .put('/v1/IcCard/updateIcCardNoByTargetId', param)
            .then((res) => {
              this.$message({
                type: 'success',
                message: '解除绑定成功!'
              })
              // 重新拉取学生数据
              this.showDetail = false
              this._getStudentList()
            })
            .finally(() => {
              this.unBindICCardLoading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消解绑操作'
          })
        })
    },
    // 删除学员信息
    handleStudentDelete(row) {
      this.$confirm(
        `此操作将永久删除学员【${row.name}】的个人信息及其关联的家长、课程、考勤、报名信息、点名记录、请假等的所有信息, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$http
          .delete('/v1/Student/deleteStudent', { studentId: row.id })
          .then((res) => {
            this.$message.success(`删除学员【${row.name}】成功`)
          })
          .catch(() => {
            this.$message.warning(`删除学员【${row.name}】失败`)
          })
          .finally(() => {
            this._getStudentList()
          })
      })
    },
    // 跳转学生报名
    toStudentEnroll(id) {
      // 当前学员数大于或等于机构购买系统版本限制学员人数时不允许新增员,允许续报
      // if (SystemAuthInfo.get().versionsStudentLimit <= this.total && !id) {
      //   this.$notify({
      //     title: '学员已达上限',
      //     message: `当前系统版本为【${SystemAuthInfo.get().versionsName}】,最大学员人数为${SystemAuthInfo.get().versionsStudentLimit}人，已有学员数为${this.total}人`,
      //     type: 'warning'
      //   })
      //   return
      // }
      // if (id) {
      //   this.$message.info('待开发~')
      //   return
      // }
      this.showDetail = false
      this.showEditStudent = false
      this.$router.push({
        path: '/educational/studentEnroll',
        query: {
          studentId: id
        }
      })
    },
    // 过滤为空
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
    // 解除家长绑定学生
    handleResolveBindClick(index, row) {
      this.$confirm(
        `此操作将永久删除该学生与家长【${row.patriarchName}】关联关系, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$http
            .delete('/v1/SudentPatriarch/delete', {
              studentId: row.studentId,
              patriarchId: row.patriarchId,
              organizationId: this.organizationInfo.id
            })
            .then((res) => {
              this.$message.success('解除绑定成功')
              this._getStudentPartriarchsList()
              this._getStudentList()
            })
        })
        .catch(() => {
          this.$message.info('已取消解除绑定')
        })
    },
    // 提交编辑学生信息
    handleEditSubmit() {
      if (!this.showEditStudent || this.editLoading) return

      this.$refs.studentForm.validate((valid) => {
        if (valid) {
          // 如果填写了手机号,则进行手机号正则校验
          // eslint-disable-next-line no-eval
          if (this.studentForm.primaryContactPhone && !eval(PhoneAreaCode.getCurrentValidate()).test(this.studentForm.primaryContactPhone)) {
            this.$message.error('请填写正确的主要联系人手机号')
            return
          }
          // 处理参数
          const params = Object.assign({}, this.studentForm)
          // 过滤空字符串
          this.filterNull(params)
          this.editLoading = true
          this.$http
            .put('/v1/Student/updateStudent', params)
            .then((res) => {
              this.$message.success('修改学员信息成功！')
              this._getStudentList()
              this.showEditStudent = false
            })
            .finally(() => {
              this.editLoading = false
            })
        }
      })
    },
    // 插班
    insertClass(row) {
      this.currentCourse = row.courseId
      this.currentClass = null
      this.currentClassName = null
      this.showSelectClass = true
    },
    // 退班
    quitClass(row) {
      this.$confirm('是否立即退班？', '提示').then(() => {
        this.$http
          .delete('/v1/StudentClass/deleteBatch', {
            classId: row.classId,
            studentIds: this.studentDetail.id
          })
          .then(() => {
            this.$message.success('退班成功！')
            this._getMyCourseList()
          })
      })
    },
    // 按期时间段：计算天数
    getNumberOfDays(start, end) {
      let startTime = Date.parse(new Date(start))
      let endtime = Date.parse(new Date(end))
      let day = parseInt((endtime - startTime) / (1000 * 60 * 60 * 24))
      return day + 1
    },
    // 获取当前年月日
    getNowFormatDate(date) {
      let seperator1 = '-'
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let strDate = date.getDate()
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate
      }
      let currentdate = year + seperator1 + month + seperator1 + strDate
      return currentdate
    },
    // 转课
    async handleTransfer(row) {
      // await this._getCourseList()
      await this._getTeacherList()
      this.transferDialogVisible = true
      // 从我所报的课程中处理掉没有剩余课时/已过截止日期的课程
      this.filterMyCourseList = this.myCourseList.map(item => {
        if (item.enableClassHour !== 0) {
          if (item.classHour !== item.alreadyUseClassHour) {
            return item
          }
        } else if (item.valuationType === 1 && item.enableClassHour === 0) {
          if (new Date() < new Date(item.periodEndDate)) {
            return item
          }
        } else if (item.valuationType === 2 && item.enableClassHour === 0) {
          if (new Date() < new Date(item.validTime)) {
            return item
          }
        }
      })
      // 过滤掉数组元素为undefined的元素
      this.filterMyCourseList = this.filterMyCourseList.filter(item => item !== undefined)
      this.selectTransferCourseList.push(row.courseId)
      this.changeTransferCourse(this.selectTransferCourseList)
    },
    // 切换转课课程
    changeTransferCourse(list) {
      this.transferCourseList = list.map(item => {
        return this.filterMyCourseList.find(val => val.courseId === item)
      })
      this.transferCourseList.forEach(item => {
        // 课时/沿用课时
        if (item.valuationType === 0 || (item.valuationType === 2 && item.enableClassHour)) {
          item.classHourSignalPrice = (item.price / item.classHour).toFixed(2)
        }
        // 按时间计算每天课程单价
        if (item.valuationType === 2 && item.enableClassHour === 0) {
          switch (item.timeType) {
            case 0:
              item.allTime = item.timeCount
              break
            case 1:
              item.allTime = 30
              break
            case 2:
              item.allTime = 90
              break
            case 3:
              item.allTime = 180
              break
            case 4:
              item.allTime = 365
              break
          }
          item.newTimeSinglePrice = (item.price / item.allTime).toFixed(2)
        }
        // 按期计算每天课程单价
        if (item.valuationType === 1 && item.enableClassHour === 0) {
          item.periodSinglePrice = (item.price / this.getNumberOfDays(item.periodStartDate, item.periodEndDate)).toFixed(2)
          if (new Date() > new Date(item.periodStartDate) && new Date() < new Date(item.periodEndDate)) {
            item.transferPeriodPrice = Number(this.getNumberOfDays(this.getNowFormatDate(new Date()), item.periodEndDate) * item.periodSinglePrice).toFixed(2)
          } else if (new Date() < new Date(item.periodStartDate)) {
            item.transferPeriodPrice = item.price
          } else if (new Date() > new Date(item.periodEndDate)) {
            item.transferPeriodPrice = 0
          }
        }
      })
    },
    // 删除选中的转课课程
    handleDeleteTransferCourse(row) {
      this.selectTransferCourseList = this.selectTransferCourseList.filter(item => item !== row.courseId)
      this.transferCourseList = this.transferCourseList.filter(item => item.courseId !== row.courseId)
    },
    // 转课弹框：取消
    handleTransferClose() {
      this.transferDialogVisible = false
      this.$refs.orderInfo.clearValidate()
      this.selectTransferCourseList = [] // 转出课程
      this.transferCourseList = [] // 转出课程信息
      this.transfersTotal = 0 // 转出金额
      this.courses = [] // 新报名课程回显数据
      this.selectedNewBuyCourseList = [] // 选择新买的课程列表
      this.selectedNewBuyTuitionList = [] // 选择新买的课程学杂
      // 支付信息
      this.orderInfo = {
        payTime: '', // 支付时间
        payType: '', // 支付方式
        totalFee: '', // 实收总价格
        recommendUserId: '', // 订单经办人
        remark: null
      }
    },
    // 判断转出课程的类型
    getOutClassType(valuationType, enableClassHour) {
      if (valuationType === 0 || (valuationType === 1 && enableClassHour) || (valuationType === 2 && enableClassHour)) {
        return 0
      } else if (valuationType === 1 && enableClassHour === 0) {
        return 1
      } else if (valuationType === 2 && enableClassHour === 0) {
        return 1
      }
    },
    // 手动修改转课的实际金额
    handleInputActualPrice(row) {
      if (!Number(row.transferActualPrice)) {
        return this.$message.warning('请正确输入价格')
      }
    },
    // 转课弹框： 确定
    handleTransferSubmit() {
      // 判断转出的课程是否填写转出数量
      if (this.transferCourseList.some(item => {
        if (item.valuationType !== 1 && item.enableClassHour !== 0) {
          return item.transferOutNum === 0 || item.transferOutNum === undefined
        }
      })) {
        return this.$message.warning('请选择转出课程数量')
      }
      // 判断转入的课程
      if (this.selectedNewBuyCourseList.length > 0) {
        for (let i = 0; i < this.selectedNewBuyCourseList.length; i++) {
          const item = this.selectedNewBuyCourseList[i]
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
      // 判断学杂购买数量
      if (this.selectedNewBuyTuitionList.some(item => item.tuitionNum === undefined)) {
        return this.$message.warning('请正确输入学杂数量')
      }
      // 支付信息/退款信息
      this.$refs.orderInfo.validate((valid) => {
        if (valid) {
          if (this.orderInfo.totalFee > Math.abs(this.transfersTotalPrice) || this.orderInfo.totalFee < 0) {
            return this.$message.warning('请正确输入支付金额')
          } else {
            let tip = '请确认报名信息无误，是否继续？'
            this.$confirm(tip, '提示', {
              type: 'warning'
            }).then(() => {
              this.submitOrder()
            })
          }
        } else {
          return false
        }
      })
    },
    submitOrder() {
      this.transferSubmitLoading = true
      // 处理转出课程列表信息
      let newTransferCourseList = this.transferCourseList.map(item => {
        console.log(item, '转出课程列表')
        return {
          courseId: item.courseId,
          needBowOut: item.needBowOut ? 1 : 0, // 是否退课： 0： 否， 1： 是
          needEndCourse: item.needEndCourse ? 1 : 0, // 是否结课 0： 否， 1： 是
          transferOutNum: item.transferOutNum, // 转出数量
          originPrice: (item.valuationType === 1 && item.enableClassHour === 0) ? item.transferPeriodPrice : item.transferOutPrice, // 应付价格
          transferOutPrice: item.transferActualPrice, // 转出实付价格
          transferOutType: this.getOutClassType(item.valuationType, item.enableClassHour), // 转出类型： 0： 课时， 1： 时间
          valuationType: item.valuationType,
          periodId: item.periodId ? item.periodId : ''
        }
      })
      // 处理转入学杂信息
      let newBuyTuitionList = this.selectedNewBuyTuitionList.map(item => {
        return {
          price: item.price, // 学杂价格
          tuitionId: item.tuitionId, // 学杂id
          tuitionName: item.name, // 学杂名称
          tuitionNum: item.tuitionNum, // 学杂数量
          tuitionSinglePrice: item.singlePrice // 学杂单价
        }
      })
      const param = {
        studentId: this.studentDetail.id,
        departmentId: this.currentBranch.id,
        payType: this.orderInfo.payType, // 支付方式 0微信 1支付宝 2现金 3刷卡
        recommendUserId: this.orderInfo.recommendUserId, // 经办人id
        shouldTotalFee: this.transfersTotalPrice, // 应付金额
        totalFee: this.transfersTotalPrice >= 0 ? this.orderInfo.totalFee : `-${this.orderInfo.totalFee}`, // 实付金额
        payTime: this.orderInfo.payTime, // 支付时间
        remark: this.orderInfo.remark, // 支付备注
        transferOutCourseList: newTransferCourseList, // 转课：转出课程列表
        transferInCourseList: this.selectedNewBuyCourseList, // 转课： 转入课程信息
        transferInTuitionList: newBuyTuitionList // 转课： 转入学杂信息
      }
      console.log(param, '传递的参数')
      this.$http.post('/v1/SignUp/transferCourse', param).then(res => {
        this.$message.success('转课成功')
        this.$refs.transferOrderDetailDialog.open(res.data.orderId)
        // this.transferDialogVisible = false
        this.handleTransferClose()
      }).finally(() => {
        this.transferSubmitLoading = false
      })
    },
    // 选课弹框中选择的课程
    selectCourse(courses) {
      this.courses = courses
      if (courses == null || courses.length === 0) return
      this.selectedNewcourseLoading = true
      // 从selectedNewBuyCourseList中移除不在courses中的数据,表示已取消勾选
      for (let i = this.selectedNewBuyCourseList.length - 1; i >= 0; i--) {
        let hasCourse = courses.find(
          (c) => this.selectedNewBuyCourseList[i].courseId === c.id
        )
        if (!hasCourse) {
          this.selectedNewBuyCourseList.splice(i, 1)
        }
      }
      // 移除courses中已存在的课程,以防重复添加
      courses = courses.filter(
        (c) => this.selectedNewBuyCourseList.find((s) => s.courseId === c.id) == null
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
                this.selectedNewBuyTuitionList = this.selectedNewBuyTuitionList.concat(temp)
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
            this.selectedNewBuyCourseList = this.selectedNewBuyCourseList.concat(courseTemp)
          })
          .finally(() => {
            this.selectedNewcourseLoading = false
          })
      } else {
        this.selectedNewcourseLoading = false
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
      // if (row.valuationType === 2 && row.enableClassHour === 0) {
      //   row.originPrice = Number((row.timeSinglePrice * row.timeCount).toFixed(0))
      // } else {
      //   row.originPrice = Number((row.classHour * row.classHourSignalPrice).toFixed(0))
      // }
      if (row.discountType === 1) {
        // 优惠价格
        row.price = row.originPrice ? Number(row.originPrice - row.discountPrice) : Number(row.periodPrice - row.discountPrice)
      } else {
        // 折扣
        row.price = ((Number(row.originPrice || row.periodPrice).toFixed(0) * row.discountFolding) / 10).toFixed(2)
      }
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
          for (let i = this.selectedNewBuyTuitionList.length - 1; i >= 0; i--) {
            if (this.selectedNewBuyTuitionList[i].courseId === course.courseId) {
              this.selectedNewBuyTuitionList.splice(i, 1)
            }
          }
        }

        this.selectedNewBuyCourseList.splice(index, 1)
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
        this.selectedNewBuyTuitionList.splice(index, 1)
      })
    },
    // 选择学杂
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
      this.selectedNewBuyTuitionList = this.selectedNewBuyTuitionList.concat(temp)
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
    // 转班
    handleTransferClass(row) {
      this.currentCourse = row.courseId
      this.currentClass = row.classId
      this.currentClassName = row.className
      this.showSelectClass = true
    },
    // 停课
    stopCourse(row) {
      let tip = '停课后上课点名将自动忽略已停课学员,学员课时不会因上课点名被扣除'
      this.$confirm(tip, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http
          .put('/v1/studentCourse/stopCourse', null, {
            params: {
              courseId: row.courseId,
              studentId: this.studentDetail.id
            }
          })
          .then(() => {
            this.$message.success('停课成功！')
            this._getMyCourseList()
            this._getStudentList()
          })
      })
    },
    // 取消停课
    cancelStopCourse(row) {
      let tip = '学员恢复上课后,点名将继续正常扣除学员剩余课时'
      this.$confirm(tip, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http
          .put('/v1/studentCourse/cancelStopCourse', null, {
            params: {
              courseId: row.courseId,
              studentId: this.studentDetail.id
            }
          })
          .then(() => {
            this.$message.success('恢复上课成功！')
            this._getMyCourseList()
            this._getStudentList()
          })
      })
    },
    // 结课
    endCourse(row) {
      let tip = '是否确认结课？'
      if (row.classId == null) {
        tip = `该课程【${row.courseName}】还未分班，是否确认结课？`
      } else if (row.classHour - row.alreadyUseClassHour > 0) {
        tip = `该课程【${row.courseName}】还剩余  ${
          row.classHour - row.alreadyUseClassHour
        }  个课时，结课会把课时清零，是否确认结课？ `
      }
      this.$confirm(tip, '提示', {
        type: 'warning'
      }).then(() => {
        this.$http
          .put('/v1/SignUp/endCourse', null, {
            params: {
              courseId: row.courseId,
              studentIds: this.studentDetail.id
            }
          })
          .then(() => {
            this.$message.success('结课成功！')
            this._getMyCourseList()
            this._getStudentList()
          })
      })
    },
    // 退课
    quitCourse(row) {
      this.quitPayType = 0
      this.quitCourseName = row.courseName
      this.quitCourseId = row.courseId
      let num
      if (row.valuationType === 2 && row.enableClassHour === 0) {
        num = -1
      } else if (row.valuationType === 1 && row.enableClassHour === 0) {
        num = -1
      } else {
        num = row.classHour - row.alreadyUseClassHour // 剩余课时
      }
      if (num < 0 || row.classHour === 0) {
        this.quitMoney = 0
      } else {
        this.quitMoney = Math.abs(
          ((num / row.classHour) * row.price).toFixed(2)
        )
      }
      this.dropOutdialogFormVisible = true
    },
    // 退课弹框取消
    handleDropOutClose() {
      this.dropOutdialogFormVisible = false
      this.quitMoney = 0 // 退课金额
      this.quitPayType = 0 // 退课的支付方式
      this.quitCourseName = 0 // 退课课程名称
      this.quitCourseId = null // 退课课程id
    },
    // 退课弹框确定
    handleDropOutSubmit() {
      if (Number(this.quitMoney) <= 0 || !Number(this.quitMoney)) {
        return this.$message.warning('请输入有效的退款金额')
      }
      this.$confirm('退课会退费，并删除该课的报名记录！是否确定退课？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dropOutSubmitLoading = true
        this.$http
          .put('/v1/SignUp/outCourse', null, {
            params: {
              courseId: this.quitCourseId,
              studentId: this.studentDetail.id,
              outMoney: this.quitMoney,
              payType: this.quitPayType
            }
          })
          .then(() => {
            this.$message.success('退课成功！')
            this.handleDropOutClose()
            this._getMyCourseList()
          }).finally(() => {
            this.dropOutSubmitLoading = false
          })
      }).catch(() => {
        return false
      })
    },
    // 修正课时
    fixClassHour(row) {
      // 设置待修正课时的信息
      this.fixCourseName = row.courseName
      this.fixCourseId = row.courseId
      this.fixOriginalClassHour = (row.classHour - row.alreadyUseClassHour).toFixed(2)
      this.fixNewClassHour = (row.classHour - row.alreadyUseClassHour).toFixed(2)
      this.fixTotalClassHour = row.classHour
      this.fixRemark = ''
      this.fixClassHourShow = true
    },
    // 取消修正课时
    cancelFixClassHour() {
      this.fixClassHourShow = false
    },
    // 确定修正课时
    sureFixClassHour() {
      if (this.fixNewClassHour === undefined) {
        this.$message.error(`修正课时不能为空`)
      } else {
        this.$http
          .post('/v1/studentCourse/fixClassHour', {
            studentId: this.studentDetail.id,
            courseId: this.fixCourseId,
            originalClassHour: this.fixOriginalClassHour,
            newClassHour: this.fixNewClassHour,
            remark: this.fixRemark
          })
          .then(() => {
            this.$message.success('修正学员课时成功')
            this.fixClassHourShow = false
            this._getMyCourseList()
          })
      }
    },
    // 打开批量修改学生剩余课时的弹框
    reviseStudents() {
      this.reviseClassHourDialog = true
      this._getStudentCourseInfo()
    },
    // 获取批量修正课时学员列表
    _getStudentCourseInfo() {
      let pagesQuery = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      if (this.reviseSearchName) {
        pagesQuery.studentName = this.reviseSearchName
      }
      this.$http
        .get(
          `/v1/Student/studentCourseInfo/${this.currentBranch.id}`,
          pagesQuery
        )
        .then((res) => {
          this.studentCourseInfo = res.data
          this.reviseSearchName = ''
          this.studentCourseInfo.forEach((i) => {
            i.reduseClassHour = i.classHour - i.alreadyUseClassHour
            i.oldClasshuors = i.alreadyUseClassHour // 获取最初的已经使用了的课时
          })
          this.studentCourseInfoTotal = res.total
          this.$nextTick(function () {
            this.selectedStudentName.forEach((s) => {
              this.studentCourseInfo.forEach((c) => {
                if (s.id + s.courseId === c.id + c.courseId) {
                  // 切换分页时，保存勾选列
                  this.$refs.multipleTable.toggleRowSelection(c, true)
                  // 切换分页时，保存修改的数据
                  c.alreadyUseClassHour = s.alreadyUseClassHour
                }
              })
            })
          })
        })
        .finally(() => {
          this.reviseSearchLoading = false
          this.reviseResetLoading = false
          this.reviseQueryLoading = false
          this.tableLoading = false
        })
    },
    // 批量修改中的重置和刷新
    reviseQuery(value) {
      if (value === 'reset') {
        this.reviseSearchName = ''
        this.reviseResetLoading = true
      }
      if (value === 'refresh') {
        this.reviseQueryLoading = true
        this.selectedStudentName = []
      }
      this._getStudentCourseInfo()
    },
    // 批量修改中搜索学生名字
    reviseSearch() {
      this.reviseSearchLoading = true
      this._getStudentCourseInfo()
    },
    // 修改剩余课时弹出框的分页
    studentCourseInfoSizeChange(val) {
      this.pageSize = val
      this.pageNum = 1
      this._getStudentCourseInfo()
    },
    // 确定批量修正
    sureResvise() {
      // 获取选中的剩余课时被修改的学员
      if (this.selectedStudentName && this.selectedStudentName.length !== 0) {
        this.reviseDialogTableVisible = true
      } else {
        this.$message({ message: '您还未选择需要修改的学生', type: 'warning' })
      }
    },
    // 取消批量修正提交
    reviseCancel() {
      this.reviseDialogTableVisible = false
    },
    // 确定批量修正提交
    reviseSubmit() {
      if (this.reviseRemarks.length !== 0) {
        this.$confirm('此操作将修改学生剩余课时, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
          .then(() => {
            this.reviseSubmitLoading = true
            this.selectedStudentName.forEach((item) => {
              item.studentId = item.id
              item.originalClassHour = item.alreadyUseClassHour
              item.newClassHour = item.classHour - item.alreadyUseClassHour
              item.remark = this.reviseRemarks
            })
            this.$http
              .post(
                '/v1/studentCourse/batchFixClassHour',
                this.selectedStudentName
              )
              .then(() => {
                this._getStudentCourseInfo()
                this.$message.success('修正学员课时成功')
                this.reviseRemarks = ''
                this.reviseDialogTableVisible = false
                this.selectedStudentName = []
              })
              .finally(() => {
                this.reviseSubmitLoading = false
              })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '取消修改剩余课时'
            })
          })
      } else {
        this.$message({ message: '请添加备注', type: 'warning' })
      }
    },
    // table表中列表取消选中
    cancelSelection(rows) {
      this.selectedStudentName = []
      this.reviseClassHourDialog = false
    },
    handleSelectionChange(selection, row) {
      let isHaveItem = this.selectedStudentName.find(
        (item) => item.id + item.courseId === row.id + row.courseId
      )
      if (isHaveItem) {
        // 已有,则移除
        this.selectedStudentName = this.selectedStudentName.filter(
          (item) =>
            item.id + item.courseId !== isHaveItem.id + isHaveItem.courseId
        )
      } else {
        // 还没有,则添加
        this.selectedStudentName.push(row)
      }
    },
    // 选择了课程
    selectClass(val) {
      // 判断是否有旧班级id,如果有,则走转班接口,否则直接走插入班级接口
      if (val.oldClassId) {
        // 转班
        this.$http.put(`/v1/StudentClass/transferClass?studentId=${this.studentDetail.id}&oldClassId=${val.oldClassId}&newClassId=${val.id}`).then(() => {
          this.$message.success(`转班到【${val.name}】班级成功！`)
          this._getMyCourseList()
        })
      } else {
        // 插班
        this.$http
          .post('/v1/StudentClass/addStudentClasses', [
            {
              classId: val.id,
              studentId: this.studentDetail.id
            }
          ])
          .then(() => {
            this.$message.success(`插入【${val.name}】班级成功！`)
            this._getMyCourseList()
          })
      }
    },
    async importStudent() {
    },
    async exportStudent() {
      this.exportStudentsDialog = true
      this.processStatus = 0
      this.percentageColor = '#67c23a'
      let setInt = setInterval(() => {
        this.percentage += Math.ceil(Math.random() * 3)
      }, 1000)
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        status: this.currentTab,
        classId: this.queryForm.classId,
        grade: this.queryForm.grade,
        courseId: this.queryForm.courseId,
        noClass: this.queryForm.noClass ? 1 : null,
        onCourseTime: this.queryForm.onCourseTime ? 1 : null
      }
      // 处理下载链接
      let dowloadInfoUrl =
        window.location.origin +
        process.env.VUE_APP_BASE_API +
        '/api/ExportOrImport/downloadStudentInfoFile?'
      for (let i = 0; i < Object.keys(params).length; i++) {
        const key = Object.keys(params)[i]
        if (i === 0) {
          dowloadInfoUrl += key + '=' + params[key]
        } else {
          if (params[key]) {
            dowloadInfoUrl += '&' + key + '=' + params[key]
          }
        }
      }
      this.$http
        .getDownload(dowloadInfoUrl, '学员导出.xls')
        .then((res) => {
          this.percentage = 100
          setTimeout(() => {
            this.$message.success(res)
          }, 500)
        })
        .catch((err) => {
          if (err.code === '-100000') {
            this.percentage = 100
            this.processStatus = 1
            this.$message.warning(err.message)
          } else {
            this.percentageColor = '#f56c6c'
            setTimeout(() => {
              this.$message.error('导出失败')
            }, 1000)
          }
        })
        .finally(() => {
          clearInterval(setInt) // 清除定时器
          setTimeout(() => {
            this.percentage = 0
            this.exportStudentsDialog = false
          }, 1000)
        })
    },
    // 取消导出学员信息
    cancelExportStudent() {
      store.dispatch('handleRequestCancelToken', true)
    },
    handleToClass() {
      this.showSelectClass = false
      this.showDetail = false

      this.$router.push('/educational/class')
    },
    // 打开人脸录入弹窗
    faceIdentification() {
      if (Number(sessionStorage.getItem('enableUseFaceDevice'))) {
        this.showCapture = true
      } else {
        this.$message({
          message: '人脸设备未授权',
          type: 'warning'
        })
      }
    },
    handleCaptureSubmit(res) {
      this.$http
        .post('/v1/FaceDill/addOrUpdateStudentFace', {
          organizationId: this.organizationInfo.id,
          departmentId: this.currentBranch.id,
          userOrStudentId: this.studentDetail.id,
          userOrStudentName: this.studentDetail.name,
          faceImageUrl: res.src,
          desc: `主要联系人：${this.studentDetail.primaryContactName}  联系方式：${this.studentDetail.primaryContactPhone}`
        })
        .then(() => {
          this.$message.success('录入人脸成功！')
          this.showDetail = false
          this._getStudentList()
        })
    },
    handleOpenImport() {
      // 当前学员数大于或等于机构购买系统版本限制学员人数时不允许导入学员
      // if (SystemAuthInfo.get().versionsStudentLimit <= this.total) {
      //   this.$notify({
      //     title: '学员已达上限',
      //     message: `当前系统版本为【${SystemAuthInfo.get().versionsName}】,最大学员人数为${SystemAuthInfo.get().versionsStudentLimit}人，已有学员数为${this.total}人`,
      //     type: 'warning'
      //   })
      //   return
      // }
      this.uploadFileName = ''
      this.uploadErrList = []
      this.showImport = true
    },
    handleOperationCommand(com, row, index) {
      switch (com) {
        case 'stopCourse':
          this.stopCourse(row)
          break
        case 'cancelStopCourse':
          this.cancelStopCourse(row)
          break
        case 'quitCourse':
          this.quitCourse(row)
          break
        case 'endCourse':
          this.endCourse(row)
          break
        case 'endCourseTimes':
          this.endCourseTimes(row)
          break
        default:
      }
    },
    allSelection() {
      this.selectedStudentName = this.studentCourseInfo
    },
    async downloadTemplate(validate) {
      let loading
      try {
        // 先验证包含特殊字符的课程名称。Excel关联不能包含特殊字符
        if (validate) {
          loading = this.$loading({
            lock: true,
            text: '模板生成中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const res = await this.$http.get(
            '/api/ExportOrImport/judgeCourseNameValidity',
            {
              departmentId: this.currentBranch.id
            }
          )
          loading.close()
          loading = null
          if (
            res.data.repeatCourseName.length > 0 ||
            res.data.inValidityCourseName.length > 0
          ) {
            this.showImportFileTip = true
            this.importErrRepeat = res.data.repeatCourseName
            this.importErrInvalide = res.data.inValidityCourseName
            return
          }
        } else {
          this.showImportFileTip = false
        }

        const downloadPath =
          window.location.origin +
          process.env.VUE_APP_BASE_API +
          `/api/ExportOrImport/downloadImportStudentExcelTemplate?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}&userId=${this.userInfo.id}`
        saveAs(downloadPath)
      } catch (error) {
        if (loading) {
          loading.close()
          loading = null
        }
      }
    },
    selectExcelFile() {
      this.$refs.fileInput.click()
    },
    handleExcelChange(event) {
      const files = event.target.files
      if (files.length === 0 || files[0].size === 0) return
      const file = files[0]
      this.uploadFileName = file.name || file.filename

      const loading = this.$loading({
        lock: true,
        text: '正在解析Excel文档...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      importExcel(file)
        .then((res) => {
          loading.text = '正在上传学员信息...'
          const excelConf = res.excelConf
          res.data.forEach(item => {
            item.primaryContactPhoneAreaCode = item.primaryContactPhoneAreaCode.split('-')[0]
          })
          this.$http
            .post('/v1/ExportOrImport/importStudent', res.data, {
              params: {
                organizationId: this.organizationInfo.id,
                departmentId: this.currentBranch.id
              }
            })
            .then(() => {
              this.$message.success(
                '已成功导入' + res.data.length + '条学生数据！'
              )
              this.query()
              this.showImport = false
              ImortRecord.push({
                filename: excelConf.filename,
                CreatedDate: excelConf.CreatedDate,
                ModifiedDate: excelConf.ModifiedDate
              })
            })
            .catch((err) => {
              if (err.code === '000001' && err.data) {
                err.data.forEach((item) => {
                  item.row = item.row + excelConf.dataStartIndex
                  const obj = excelConf.rules.find((o) => o.key === item.column)
                  if (obj) {
                    item.column = obj.value
                  }
                })
                this.uploadErrList = err.data
              }
            })
            .finally(() => {
              // 前端校验
              loading.close()
            })
        })
        .catch((err) => {
          switch (err.code) {
            case 1:
            case 2:
              this.$message.error(err.message)
              break
            case 3:
              this.uploadErrList = err.data
              break
          }
          loading.close()
        })
      // 重置为空
      this.$refs.fileInput.value = ''
    },
    calcSurplusClassHour(valuationType, enableClassHour, totalClassHour, alreadyUseClassHour) {
      if (valuationType === 0 || enableClassHour) {
        return (((totalClassHour ? totalClassHour.toString().split('.').length > 1 : false) || (alreadyUseClassHour ? alreadyUseClassHour.toString().split('.').length > 1 : false)) ? (totalClassHour - alreadyUseClassHour).toFixed(2) : (totalClassHour - alreadyUseClassHour) ? (totalClassHour - alreadyUseClassHour) : 0)
      }
      return '-'
    },
    filterHandler(value, row, column) {
      const property = column['property']
      return row[property] === value
    }
  },
  watch: {
    selectedStudentName() {
      this.sureResviseDisabled = this.selectedStudentName.length === 0
    },
    currentTab(val) {
      this.reset()
    },
    detailTab(val) {
      // 学员详情的tab切换
      switch (val) {
        case '0':
          break
        case '1':
          this.enrollDataTab = '0'
          this._getMyCourseList()
          break
        case '2':
          this._getTimetableList()
          break
        case '3':
          this._getAttendanceList()
          break
        case '4':
          this._getStudentPartriarchsList()
          break
        case '5':
          this._getFixClassHourRecordList()
          break
        case '6':
          this._etStudentPrdeList()
          break
      }
    },
    enrollDataTab(val) {
      switch (val) {
        case '0':
          // 在读课程
          this._getMyCourseList()
          break
        case '1':
          // 历史课程
          this._getHistoryCourseList()
          break
        case '2':
          // 学杂
          this._getMyTuitionList()
          break
      }
    },
    bindIcCardDialogVisible() {
      if (this.bindIcCardDialogVisible) {
        this.$nextTick(() => {
          this.$refs.bindICCardFormInput.focus()
        })
      }
    },
    // 计算每门课程的金额/转出总的金额
    transferCourseListJSON: {
      handler(newValue, oldValue) {
        // 解决监听数组,input框值无法修改问题
        oldValue = JSON.parse(oldValue)
        newValue = JSON.parse(newValue)
        let transferActPrice = false
        let totalPrice = 0
        newValue.forEach(item => {
          totalPrice = (Number(totalPrice) + Number(item.transferActualPrice)).toFixed(2)
        })
        this.transfersTotal = totalPrice
        oldValue.forEach(o => {
          newValue.forEach(n => {
            if (o.id === n.id && o.transferActualPrice !== n.transferActualPrice) {
              transferActPrice = true
            }
          })
        })
        if (transferActPrice) {
          return null
        }
        if (this.transferCourseList.length > 0) {
          this.transferCourseList.forEach(item => {
            if (item.transferOutNum || item.transferPeriodPrice) { // 解决转出数量为空时出现NaN问题
              if (item.valuationType === 2 && item.enableClassHour === 0) { // 按时间不沿用课时
                item.transferOutPrice = Number((item.transferOutNum * item.newTimeSinglePrice).toFixed(2))
              } else if (item.enableClassHour !== 0) { // 课时计费/按期沿用课时/按时间沿用课时
                item.transferOutPrice = Number((item.transferOutNum * item.classHourSignalPrice).toFixed(2))
              } else if (item.valuationType === 1 && item.enableClassHour === 0) {
                if (item.needBowOut || item.needEndCourse) {
                  item.transferOutPrice = Number(item.transferPeriodPrice)
                } else {
                  item.transferOutPrice = 0
                }
              }
              item.transferActualPrice = item.transferOutPrice
              // return Number(item.transferActualPrice)
            } else {
              item.transferOutPrice = 0 * item.classHourSignalPrice
              item.transferActualPrice = 0
              // return item.transferActualPrice
            }
          })
        }
      },
      deep: true
    },
    // 全额付款显示
    transfersTotalPrice() {
      this.orderInfo.totalFee = 0
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.username
  span
    font-size 13px
    color $color-text-2
    margin 0 6px

  img
    vertical-align middle

.patriarch-infos
  font-size 13px
  color $color-text-2

  li
    line-height 24px

    span
      & + span
        margin-left 8px

.remark-wrapper
  padding-right 30px
  position relative
  min-height 22px
  no-wrap()

  i
    position absolute
    right 12px
    top 4px
    font-size 14px
    cursor pointer

.student-form
  .el-input, .el-select, .el-radio-group, .el-autocomplete
    width 216px

  .divider-line
    height 1px
    background $color-border-2
    margin-bottom 16px

  .bottom-btns
    text-align center

    .el-button
      width 120px

      & + .el-button
        margin-left 50px

/* * 学员详情 */
.student-detail
  display flex
  padding 20px 0

  .main-info
    text-align center
    width 210px
    flex-shrink 0
    border-right 1px solid $color-border-3
    min-height 320px

    .avatar
      border-radius 5px

    .username
      margin 12px 0
      font-size 18px
      font-weight bold

  .more-info
    width 100%
    padding 0 30px
    margin 0
    position relative

    li
      margin-bottom 12px

      & > span, a
        color $color-text-1

    label
      display inline-block
      min-width 80px
      color $color-text-3
      margin-right 6px
      text-align right

    .link
      color $color-primary

  .qr-code
    position absolute
    top 12px
    right 36px

  .tip
    font-size 13px
    color $color-info
    text-align center
.my-course-query-form
  padding 0px
.import-student-dialog
  color #333

  .upload-file
    .file-input
      display none
      visibility hidden

    .link
      margin-left 20px

    .el-input
      cursor pointer

  .upload-err-tip
    margin-top 16px
    margin-bottom 16px
    color $color-warning

  .upload-tip
    font-size 14px
    color $color-text-3
    padding-top 16px
    margin-top 20px
    border-top 1px dashed $color-border-1

    li
      line-height 1.5
      margin-bottom 4px

  .import-err-tip
    // text-align center
    color $color-warning
    margin-top 24px

    &:nth-of-type(1)
      margin-top 0

  .float-tags
    span
      float left
      font-weight bold
      margin-top 12px
      margin-left 36px
</style>

<style lang="stylus" scoped>
// 批量修改学员剩余课时
#buttonBox
  margin 20px 0px 10px 0
  display flex
  justify-content center
  align-items center

  .removeButton
    margin 0 10px 0 0

.revise-page
  margin 10px 0 0 0

.notDispatch
  color red
</style>

<style lang="stylus">
.progress
  display flex
  justify-content center
  align-items center

.cancelExprot
  display flex
  justify-content center

.dirIectionIcon
  color $color-primary
  margin 0 0 0 4px

.remark-edit-popver
  .remark-edit-form
    display flex

    label
      flex-shrink 0
      width 46px

  .remark-edit-btns
    text-align center
    margin-top 16px

.student-detail-dialog
  .el-dialog__header
    font-weight bold
    line-height 40px
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background

    span
      color $color-danger
      margin-left 12px

  .el-dialog__headerbtn
    top 14px

  .el-dialog__body
    padding 0 16px

  .el-tabs__header
    padding 0

.import-student-dialog
  min-height 48vh

  .el-dialog__header
    border 1px solid $color-border-2
    padding 0 20px
    background $color-background
    font-size 16px
    color $color-text-1
    line-height 36px
    font-weight bold

  .close-btn
    position absolute
    right 16px
    top 9px
    cursor pointer
    font-size 18px
    color $color-info

    &:hover
      color $color-primary

  .el-dialog__body
    padding 20px 16px

.del-stu-container
  height 150px

  .content
    margin-top 20px
    color #606266

  .item
    margin-top 30px

  label
    color #FF6600

/* 自定义dialog样式 start */
.el-dialog__header
  padding 15px 15px 10px

.el-dialog__body
  padding 10px 15px 10px

.custom-dialog-button
  box-sizing border-box
  width 100%
  padding 15px 15px 0px
  text-align right

/* 自定义dialog样式 end */
.fix-class-hour-student
  label
    color #909399

  span
    color #ff7e00
    margin-left 5px
    margin-right 5px

.fix-class-hour-info
  margin-top 5px

  label
    color #909399

  span
    color #ff7e00

.fix-class-hour-num
  display flex
  flex-direction row
  align-items center
  margin-top 10px
  color #909399

  span
    width 90px

.fix-class-hour-remark
  margin-top 10px
  color #909399
  display flex
  flex-direction row
  align-items center

  span
    width 90px

  .fix-class-hour-input
    width 250px

.fix-class-hour-tips
  margin-top 10px

  label
    color #909399

  span
    color #F56C6C

.out-trade-no
  color #ff6600
  cursor pointer

.showTableData
  background #fff
  padding 14px

// 转课：
.transfer-info
  .transfer-period-price
    display flex
    justify-content space-between
    align-items center
  .title
    padding 8px 0px
    margin 0px
    border-bottom 1px solid #EEE7ED
  .course
    margin 10px 0px
  .add-course-button
    height 34px
  .course-button
    padding-top 6px
  .transfers-total
    text-align right
    padding 16px 10px 0px 0px
    font-weight bold
    .transfers-price
      font-weight bold
      color $color-warning
      font-size 18px
  .new-buy
    display flex
    justify-content space-between
    align-items center
    .title
      border-bottom none
      margin 6px 0px
    .total
      padding-right 10px
      .new-price
        color $color-warning
.left-right-boder
  border-left 1px solid #eeeeee
  border-right 1px solid #eeeeee
// 转出课程列表数据样式
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
.drop-out
  .item
    display flex
    align-items center
    margin-top 10px
    .student
      margin-right 30px
    .student-info
      color #ff7e00
</style>

<template>
  <div class="potential-customer">
    <div class="query-form">
      <el-input v-model.trim="queryForm.searchInput" :maxlength="15" :placeholder="searchTypePlaceholder" @keyup.native.enter="query" class="input-with-select">
        <el-select v-model="queryForm.searchType" slot="prepend" placeholder="请选择" style="width: 98px;">
          <el-option v-for="item in searchTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
      </el-input>
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始录入日期"
        end-placeholder="结束录入日期"
        :picker-options="dataOptions"
        @change="query"
        style="margin-left: 16px; width: 250px;">
      </el-date-picker>
      <div class="right-btns">
        <el-button type="primary" icon="el-icon-plus" @click="handleOpenEdit()">新增潜客</el-button>
        <el-button type="primary" @click="dialogVisible = true" icon="icon iconfont icon-import">批量导入</el-button>
        <el-button type="primary" icon="icon iconfont icon-export" :loading="exportLoading" @click="exportPotential()">导出潜客</el-button>
        <el-button type="primary" plain @click="handleOpenAssign(true)" icon="el-icon-document-checked">批量分配</el-button>
      </div>
      <el-button type="text" @click="reset" :disabled="!loadingQuery ? false : true" size="medium" style="margin-left: 12px;">重&nbsp;置</el-button>
      <div class="query-select-list">
        <inline-select v-model="queryForm.status" @change="query" label="潜客状态" :options="statusList" clearable/>
        <inline-select v-model="queryForm.studentResourceId" @change="query" label="来源渠道" valueAttr="id" labelAttr="name" :loading="loadingSource" :options="sourceList" @show="_getSourceList" clearable/>
        <inline-select v-model="queryForm.courseIds" @change="query" label="意向课程" valueAttr="id" labelAttr="name" :loading="loadingCourse" :options="courseList" @show="_getCourseList" filterable clearable/>
        <inline-select v-model="queryForm.traceUserId" @change="query" label="跟进人" valueAttr="id" labelAttr="username" :loading="loadingTraceUser" :options="traceUserList" @show="_getTraceUserList" filterable clearable/>
        <inline-select v-model="queryForm.intention" @change="query" label="意向度" :options="intentionList" clearable/>
        <el-checkbox v-model="queryForm.signStatus" @change="query">已签约</el-checkbox>
      </div>
    </div>

      <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :show-close="false"
      custom-class="import-student-dialog custom-dialog">
      <p slot="title" class="title">导入潜客
        <i  class="close-btn el-icon-close" @click="dialogVisible = false"/>
      </p>
      <div class="upload-file">
        <el-input :value="uploadFileName" @click.native.stop="selectExcelFile" :readonly="true" placeholder="请选择上传文件" style="width: 340px;">
          <el-button slot="append" type="primary" @click.stop="selectExcelFile">选择文件</el-button>
        </el-input>
        <el-tooltip class="item" effect="light" content="下载之前请您务必阅读下面的说明" placement="right">
          <span class="link" @click="downloadTemplate()">下载导入模板</span>
        </el-tooltip>
        <input v-show="false" ref="fileInput" @change="handleExcelChange" class="file-input" type="file" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      </div>
      <template v-if="uploadErrList.length > 0">
        <p class="upload-err-tip">数据有误，请检查数据后上传！错误信息如下：</p>
        <el-table
          :data="uploadErrList"
          style="margin-top: 16px;">
          <el-table-column
            prop="row"
            label="行数"
            cennter
            width="100">
            <template slot-scope="scope">第{{scope.row.row}}行</template>
          </el-table-column>
          <el-table-column
            prop="column"
            label="标签"
            cennter
            width="160">
          </el-table-column>
          <el-table-column
            prop="errorMsg"
            label="错误信息">
          </el-table-column>
        </el-table>
      </template>
      <ul class="upload-tip" v-if="uploadErrList.length === 0">
        <el-alert title="请您务必阅读，否则可能存在导入潜在客户数据失败！！！" type="error" style="margin-bottom:10px;"></el-alert>
        <li class="color-warning">一、必须注意事项：</li>
        <li style="color:red;">1. 导出的excel表格为下拉选择的，千万不要自己手动去更改数据或填写或者从其他地方复制整行数据将其覆盖，这样的操作方式会导致导入数据失败。</li>
        <li style="color:red;">2. 导出excel后不能再私自更改表格规则，否则会导致上传失败。</li>
        <li style="color:red;">3.姓名、性别、来源渠道、主要联系人、关系和联系方式为必填项。</li>
        <li style="color:red;">4. 目前只支持从系统中下载的excel模板填写数据提交，不支持随意填写的excel，否则会导致导入潜在客户数据失败。</li>
        <li class="color-warning" style="margin-top:20px;">二、批量导入须知：</li>
        <li>1. 导入前需要下载最新导入模板，否则潜在客户信息可能有误</li>
        <li>2. 必填项不能为空</li>
        <li>3. 一次最多导入500条数据</li>
      </ul>
    </el-dialog>

    <div class="showTableData">
      <el-table
        ref="table"
        :data="customerList"
        v-loading="loadingQuery"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="52"
          >
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="120"
          fixed="left">
          <p class="username" slot-scope="scope" @click="handleOpenDetail(scope.row, '0')">
            <a class="link">{{scope.row.name}}</a>
            <img v-if="scope.row.sexIcon" :src="scope.row.sexIcon" width="16px" height="16px"/>
          </p>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          width="72">
          <template slot-scope="scope">
            {{(scope.row.age || 0) + '岁'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="联系方式"
          width="130">
        </el-table-column>
        <el-table-column
          prop="intentionStr"
          label="意向度"
          align="center"
          width="100">
        </el-table-column>
        <el-table-column
          label="意向课程"
          align="center"
          width="100">
          <template slot-scope="scope">
              <div v-if="scope.row.courses">
                <div v-if="scope.row.courses.length === 1">
                  <el-tag>
                    {{ scope.row.courses[0].name }}
                  </el-tag>
                </div>
                <div v-else>
                  <el-popover
                    placement="right-end"
                    width="200"
                    trigger="hover"
                    >
                    <slot>
                      <el-tag
                        style="margin: 4px"
                        v-for="item in scope.row.courses"
                        :key="item.id">
                        {{ item.name }}
                      </el-tag>
                    </slot>
                    <span slot="reference" class="more-course-info">更多课程</span>
                  </el-popover>
                </div>
              </div>
              <div v-else>
                -
              </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="traceUserName"
          label="跟进人"
          width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.traceUserName">{{scope.row.traceUserName}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="latestTraceTimeStr"
          label="最近跟进"
          width="144">
        </el-table-column>
        <el-table-column
          prop="studentResourceName"
          label="来源渠道"
          width="140"
          align="center">
        </el-table-column>
        <!-- <el-table-column
          prop="callbackTimeStr"
          label="回访时间"
          width="120">
          <span slot-scope="scope">{{scope.row.callbackTimeStr}}</span>
        </el-table-column> -->
        <el-table-column
          prop="remark"
          label="备注"
          min-width="260px">
          <div class="remark-wrapper" slot-scope="scope" v-if="scope.row.remark" :ref="'remarkHack' + scope.$index" :title="scope.row.remark">
            <span>{{scope.row.remark}}</span>
            <el-popover
              width="440"
              trigger="click"
              popper-class="remark-edit-popver">
              <p style="margin-bottom:10px;font-size:15px;text-align:center;">备注信息</p>
              <div class="remark-edit-form">
                <el-input type="textarea" v-model="scope.row.remarkCopy" :rows="8" :maxlength="200" show-word-limit placeholder="潜客备注(最多200个字)"/>
              </div>
              <div class="remark-edit-btns">
                <el-button size="mini" @click="$refs['remarkHack' + scope.$index].click()">取消</el-button>
                <el-button size="mini" type="primary" @click="editRemark(scope.row, scope.$index)">确认</el-button>
              </div>
              <i slot="reference" class="el-icon-edit-outline"/>
            </el-popover>
          </div>
          <span v-else>-</span>
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="状态"
          width="100"
          align="center"
          fixed="right">
          <template slot-scope="scope">
            <span v-if="scope.row.status === 5" class="color-primary">已流失</span>
            <el-dropdown v-else @command="(e) => handleSelectStatus(scope.row, e)" size="small" trigger="click">
              <span class="el-dropdown-link">
                {{scope.row.statusStr || '状态'}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in canOptStatusList" :key="item.value" :command="item.value">{{item.label}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="180"
          fixed="right">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 5">
              <el-button type="text" @click="handleSelectStatus(scope.row, 0)">激活潜客</el-button>
              <el-button type="text" @click="handleOpenDetail(scope.row, '1')">跟进记录</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="handleStudentEnroll(scope.row)">报名</el-button>
              <el-button type="text" @click="handleAddTrace(scope.row)">添加跟进</el-button>
              <el-dropdown @command="(e) => handleMoreOption(scope.row, e)" size="small" trigger="hover" :show-timeout="0">
                <span class="el-dropdown-link" style="margin-left: 10px;">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="record">跟进记录</el-dropdown-item>
                  <el-dropdown-item command="assign">跟进分配</el-dropdown-item>
                  <el-dropdown-item command="loss">流失</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="query"
          @current-change="_getCustomerList"
          :current-page.sync="pageNum"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 编辑潜客信息 -->
    <el-dialog :visible.sync="showEditCustomer" :title="(customerInfo.id ? '编辑' : '新增') + '潜客信息'" custom-class="custom-dialog" top="6vh" :close-on-click-modal="false">
      <el-form ref="customerForm" :model="customerForm" :rules="customerRules" inline label-width="100px" class="customer-form">
        <el-form-item label="姓名" prop="name" style="width: 100%;">
          <el-input v-model="customerForm.name" placeholder="请填写学员姓名" :maxlength="20"/>
          <el-button v-if="customerForm.name" @click="validateIfExists"  type="primary" style="margin-left:14px">撞单检测</el-button>
        </el-form-item>
        <!-- <el-form-item label="昵称" prop="nickName">
          <el-input v-model="customerForm.nickName" placeholder="请填写学员昵称" :maxlength="20"/>
        </el-form-item> -->
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="customerForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="birthday">
          <el-input-number v-model="customerForm.age" @change="handleAgeChange" :controls="false" :min="0" :max="128" placeholder="年龄" style="width: 80px; margin-right: 12px;"/>
          <el-date-picker
            v-model="customerForm.birthday"
            value-format="yyyy-MM-dd"
            placeholder="生日"
            @change="handleBirthdayChange"
            style="width: 180px;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="来源渠道" prop="studentResourceId">
          <el-select v-model="customerForm.studentResourceId" placeholder="请选择渠道类型">
            <el-option v-for="item in sourceList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主要联系人" prop="primaryContactPhone">
          <el-form-item
            prop="primaryContactName"
            style="margin-bottom: 0;">
            <el-input v-model="customerForm.primaryContactName" placeholder="家长/联系人姓名" :maxlength="20" style="width: 180px;"/>
          </el-form-item>
          <el-form-item
            prop="relationId"
            :rules="{ required: true, message: '请选择关系', trigger: 'blur' }"
            style="margin-bottom: 0;">
            <el-select v-model="customerForm.relationId" placeholder="选择关系" style="width: 100px;">
              <el-option v-for="item in relationList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="primaryContactPhone"
            :rules="[
              { required: true, message: '请填写手机号码', trigger: 'blur' },
              { validator: require('@/utils/validate.js').phoneValidator, message: '请填写正确的手机号码', trigger: ['change', 'blur'] },
            ]"
            style="margin-bottom: 0;">
            <AreaCode ref="mychild" @getPhoneAreaCode="getPhoneAreaCode"></AreaCode>
            <el-input v-model="customerForm.primaryContactPhone" placeholder="手机号"/>
          </el-form-item>
        </el-form-item>
        <div class="divider-line"></div>
        <el-form-item label="意向课程" prop="courseIds" style="width: 100%;">
          <el-select v-model="customerForm.courseIds" placeholder="请选择意向课程" multiple :loading="loadingCourse">
            <el-option v-for="item in courseList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="意向度" prop="intention" style="width: 100%;">
          <ul class="intention-icons">
            <li @click="customerForm.intention = 0">
              <i class="icon iconfont icon-face-yiban" :class="{'active-icon': customerForm.intention === 0}"/>
            </li>
            <li @click="customerForm.intention = 1">
              <i class="icon iconfont icon-face-zhongdeng" :class="{'active-icon': customerForm.intention === 1}"/>
            </li>
            <li @click="customerForm.intention = 2">
              <i class="icon iconfont icon-face-qianglie" :class="{'active-icon': customerForm.intention === 2}"/>
            </li>
            <li>
              {{intentionStr}}
            </li>
          </ul>
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-autocomplete v-model="customerForm.school" @focus="_getSchoolList" value-key="name" :fetch-suggestions="filterSchool" placeholder="学员所在学校名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="customerForm.grade" placeholder="学员所在年级" clearable>
            <el-option v-for="item in gradeList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="customerForm.address" placeholder="学员家庭住址(最多50个字)" :maxlength="50" style="width: 524px;"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="customerForm.remark" :rows="4" placeholder="备注信息(最多200个字)" :maxlength="200" show-word-limit style="width: 524px;"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showEditCustomer = false">取 消</el-button>
        <el-button type="primary" :loading="loadingEdit" @click="handleEditSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 同名潜客 -->
    <el-dialog title="同名潜客" custom-class="custom-dialog" :visible.sync="validateIfExistsDialog">
      <el-table
        :data="validateIfExistsList"
        border
        v-loading="validateIfExistsTableLoading"
        style="width: 100%">
        <el-table-column
          fixed
          prop="name"
          label="姓名"
          width="100">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="电话号码"
          align="center"
          width="120">
        </el-table-column>
        <el-table-column
          prop="primaryContactName"
          label="主要联系人姓名"
          width="120"
          align="center"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.primaryContactName">{{scope.row.primaryContactName}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="primaryContactPhone"
          label="主要联系人电话"
          width="120"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{scope.row.primaryContactPhone ? scope.row.primaryContactPhone : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sex"
          label="性别"
          align="center"
          width="100">
          <template slot-scope="scope">
            <span>{{scope.row.sex === 1 ? '男' : (scope.row.sex === 2 ? '女' : '未知')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          width="100"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{scope.row.age ? scope.row.age + '岁' : '-' }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="address"
          label="住址"
          width="160"
          align="center"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.address">{{scope.row.address}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="school"
          label="就读学校"
          width="160"
          align="center"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.school">{{scope.row.school}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="grade"
          label="就读年级"
          width="160"
          align="center"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.grade">{{scope.row.grade}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-pagination">
        <el-pagination
          @size-change="validatePagesQuery"
          @current-change="_getConflictByName"
          :current-page.sync="validateIfExistsQuery.pageNum"
          :page-size.sync="validateIfExistsQuery.pageSize"
          :page-sizes="[10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="validateIfExistsQuery.total"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 潜客详情信息 -->
    <el-dialog :visible.sync="showDetail" width="942px" top="8vh" :close-on-click-modal="false" class="customer-detail-dialog">
      <template slot="title">潜客详情<span class="color-danger">({{customerInfo.name}})</span></template>
      <el-tabs v-model="detailTab" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="0"></el-tab-pane>
        <el-tab-pane label="跟进记录" name="1"></el-tab-pane>
      </el-tabs>
      <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 69vh;">
        <div v-if="detailTab === '0'" class="customer-detail">
          <div class="main-info">
            <p class="username">
              {{customerInfo.name}}
              <img v-if="customerInfo.sexIcon" :src="customerInfo.sexIcon" width="20px" height="20px"/>
            </p>
            <el-button type="primary" plain icon="el-icon-edit" @click="handleOpenEdit(customerInfo)">编辑</el-button>
            <el-button type="danger" plain icon="el-icon-delete" @click="handleMoreOption(customerInfo, 'delete')">删除</el-button>
            <p class="color-primary" style="margin-top: 80px; font-size: 18px;">{{customerInfo.statusStr}}</p>
          </div>
          <ul class="more-info">
            <li>
              <label>年龄：</label>
              <span>{{(customerInfo.age || 0) + '岁'}} <span style="margin-left: 12px;">{{customerInfo.birthday}}</span></span>
            </li>
            <li>
              <label>主要联系人：</label>
              <span v-if="customerInfo.primaryContactPhone"><span class="color-danger" style="margin-right: 12px">{{customerInfo.primaryContactPhone}}</span>{{customerInfo.relationName + '：' + (customerInfo.primaryContactName || '')}}</span>
            </li>
            <li>
              <label>学校：</label>
              <span>{{customerInfo.school}}</span>
            </li>
            <li>
              <label>年级：</label>
              <span>{{customerInfo.grade}}</span>
            </li>
            <li>
              <label>住址：</label>
              <span>{{customerInfo.address}}</span>
            </li>
            <li>
              <label>备注：</label>
              <span>{{customerInfo.remark}}</span>
            </li>
            <li>
              <label>渠道来源：</label>
              <span>{{customerInfo.studentResourceName}}</span>
            </li>
            <li>
              <label>意向课程：</label>
              <span v-if="customerInfo.courses">
                <el-tag v-for="item in customerInfo.courses" :key="item.id">{{item.name}}</el-tag>
              </span>
            </li>
            <li>
              <label>意向度：</label>
              <span>{{customerInfo.intentionStr}}</span>
            </li>
            <li>
              <label>最近跟进时间：</label>
              <span>{{customerInfo.latestTraceTime}}</span>
            </li>
          </ul>
        </div>
        <div v-else-if="detailTab === '1'" v-loading="loadingTraceList">
          <div style="text-align: right;padding: 0 20px">
            <el-button type="primary" plain @click="handleAddTrace(customerInfo)">添加跟进</el-button>
          </div>
          <el-timeline v-if="traceList.length > 0" style="width: 80%; margin: 0 auto;">
            <el-timeline-item
              v-for="item in traceList"
              :key="item.id"
              :timestamp="item.traceTime"
              :type="item.typeClass"
              placement="top">
              <p class="trace-row"><label>跟进人：</label>{{item.createUserName}}</p>
              <p class="trace-row"><label>方式：</label><span class="color-primary">{{item.typeStr}}</span></p>
              <p class="trace-row"><label>内容：</label>{{item.remark}}</p>
              <img v-if="item.traceImgUrls" :src="item.traceImgUrls" width="200px" style="margin-top: 12px;"/>
            </el-timeline-item>
          </el-timeline>
          <p v-else class="not-data-tip">暂无跟进记录~</p>
        </div>
      </el-scrollbar>
    </el-dialog>

    <!-- 跟进人分配 -->
    <el-dialog :visible.sync="showAssign" :close-on-click-modal="false" class="customer-detail-dialog" width="600px" @close="handleCloseAssign">
      <template slot="title">分配跟进人</template>
      <el-form label-width="88px" style="margin-top: 20px;">
        <el-form-item label="潜客：" required>
          <el-tag v-for="item in selectedCustomer" :key="item.id">{{item.name}}</el-tag>
        </el-form-item>
        <el-form-item label="跟进人：" required>
          <el-select v-model="selectedFollowId" placeholder="请选择跟进人">
            <el-option v-for="item in traceUserList" :key="item.id" :value="item.id" :label="item.username"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="showAssign = false">取消</el-button>
        <el-button type="primary" :loading="loadingAssign" @click="handleSubmitAssign">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加跟进 -->
    <el-dialog :visible.sync="showAddTrace" :close-on-click-modal="false" class="customer-detail-dialog" width="600px" @close="handleCloseAssign">
      <template slot="title">添加跟进</template>
      <el-form ref="traceForm" :model="traceForm" :rules="traceRules" label-width="120px" style="margin-top: 20px; margin-right: 30px;">
        <el-form-item label="跟进时间：" prop="traceTime">
          <el-date-picker
            v-model="traceForm.traceTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期时间"
            :clearable="false">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="类型：" prop="type">
          <el-radio-group v-model="traceForm.type">
            <el-radio :label="0">电话跟进</el-radio>
            <el-radio :label="1">实地跟进</el-radio>
            <el-radio :label="2">对方来访</el-radio>
            <el-radio :label="3">线上跟进</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容：" prop="remark">
          <el-input v-model="traceForm.remark" type="textarea" :rows="5" :maxlength="120" show-word-limit placeholder="最多120个字"></el-input>
        </el-form-item>
        <el-form-item label="附属图片：" prop="traceImgUrls">
          <div class="img-con">
            <img v-if="traceForm.traceImgUrls" :src="traceForm.traceImgUrlsTemp || traceForm.traceImgUrls" alt="活动封面"/>
            <div class="img-layer">
              <span @click="cropperImage">添加图片</span>
            </div>
          </div>
          <p class="form-tip">(建议图片尺寸800:600，大小1M)</p>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="showAddTrace = false">取消</el-button>
        <el-button type="primary" :loading="loadingAddTrace" @click="handleSubmitAddTrace">确定</el-button>
      </template>
    </el-dialog>

    <!-- 跟进图片 -->
    <cropper-dialog
      :options="{aspectRatio: 800 / 600}"
      title="裁剪跟进图片"
      ref="cropperImage"
      v-model="showCropperImage"
      :croppedOptions="{
        maxWidth: 1200,
        maxHeight: 900
      }"
      @uploadComplete="handleUploadCompleteImage"/>
    <!-- 导出潜客弹框 -->
   <el-dialog title="正在导出中" :visible.sync="exportPotentialDialog" width="300px" :show-close="false" :center="true"
              :close-on-press-escape="false" :close-on-click-modal="false">
     <div class="progress">
       <el-progress v-if="processStatus === 0" type="circle" :percentage="percentage"
                    :color="percentageColor"></el-progress>
       <el-progress v-else type="circle" :percentage="percentage" status="exception"></el-progress>
     </div>
     <div slot="footer" class="dialog-footer cancelExprot">
       <el-button @click="cancelExportPotential">取消导出</el-button>
     </div>
   </el-dialog>
  </div>
</template>

<script>
import InlineSelect from '../../components/InlineSelect'
import CropperDialog from '@/components/CropperDialog'

import moment from 'moment'
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'
import { ImortRecord } from '../../utils/storage'
import { importExcel } from '../../utils/xlsxUtils.js'
import store from '@/store'
import AreaCode from '../../components/PhoneAreaCode'
import { PhoneAreaCode } from '@/utils/storage'

moment.locale('zh-cn')

export default {
  name: 'PotentialCustomer',
  data() {
    return {
      dialogVisible: false, // 批量新增窗口判断显隐
      exportLoading: false, // 潜客导出loading
      exportPotentialDialog: false, // 导出潜客对话框
      percentage: 0, // 导出潜客进度
      percentageColor: '#67c23a', // 进度条颜色
      processStatus: 0, // 进度条状态
      uploadFileName: '', // 上传文件input框显示内容
      uploadErrList: [], // 上传过程中错误信息
      loadingQuery: false,
      loadingCourse: false,
      loadingSource: false,
      loadingTraceUser: false,
      loadingAssign: false,
      loadingEdit: false,
      loadingAddTrace: false,
      loadingTraceList: false,
      showCropperImage: false,
      showEditCustomer: false,
      showDetail: false,
      showAssign: false,
      showAddTrace: false,
      validateIfExistsDialog: false, // 同名潜客
      validateIfExistsTableLoading: false, // 同名潜客table
      detailTab: '0',
      searchTypeList: [
        {
          value: 'name',
          label: '学员姓名',
          placeholder: '请输入学员姓名'
        },
        {
          value: 'phone',
          label: '联系方式',
          placeholder: '请输入联系方式'
        },
        {
          value: 'primaryContactName',
          label: '家长姓名',
          placeholder: '请输入家长姓名'
        }
      ],
      queryForm: {
        searchType: 'name',
        searchInput: '',
        dateRange: [],
        status: '',
        studentResourceId: '',
        courseIds: '',
        traceUserId: '',
        intention: '',
        signStatus: false
      },
      dataOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate: function (time) {
          return time.getTime() > Date.now()
        }
      },
      statusList: [
        { value: 0, label: '待跟进' },
        { value: 1, label: '跟进中' },
        { value: 2, label: '已预约' },
        { value: 3, label: '已来访' },
        { value: 4, label: '已试听' },
        { value: 5, label: '已流失', canOpt: false }
      ],
      intentionList: [
        { value: 0, label: '一般' },
        { value: 1, label: '中等' },
        { value: 2, label: '强烈' }
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      courseList: [], // 意向课程
      sourceList: [], // 来源渠道
      traceUserList: [], // 跟进人列表
      relationList: [], // 与学员关系列表
      schoolList: [], // 周边学校列表
      traceList: [], // 跟进列表
      gradeList: ['托管', '小班', '中班', '大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'], // 年级列表
      customerList: [], // 潜客列表
      validateIfExistsList: [], // 同名潜客
      selectName: '', // 搜索同名
      customerForm: {
        id: null,
        name: '',
        sex: 1,
        birthday: '',
        age: '',
        remark: '',
        school: '',
        grade: '',
        address: '',
        studentResourceId: '',
        relationId: '',
        primaryContactName: '',
        primaryContactPhone: '',
        courseIds: [],
        intention: 0,
        phoneAreaCode: '+86'
      }, // 潜客表单
      customerInfo: {}, // 潜客详情对象
      customerRules: {
        name: { required: true, message: '请填写学员姓名', trgger: 'blur' },
        sex: { type: 'number', required: true, message: '请选择性别', trgger: ['blur', 'change'] },
        studentResourceId: { required: true, message: '请选择渠道类型', trgger: 'blur' },
        primaryContactPhone: { required: true, message: '请添加主要联系人', trgger: 'blur' }
      },
      selectedCustomer: [], // 选择的潜客
      selectedFollowId: '', // 选择的跟进人
      isAssignMany: false, // 是否批量分配
      traceForm: {
        potentialCustomerId: null,
        traceTime: '',
        type: 0,
        remark: '',
        traceImgUrls: ''
      },
      traceRules: {
        traceTime: {
          required: true, message: '请选择跟进时间!', trigger: ['change', 'blur']
        },
        type: {
          required: true, message: '请选择类型!', trigger: ['change', 'blur']
        },
        remark: {
          required: true, message: '请填写跟进类容!', trigger: ['change', 'blur']
        }
      },
      //  同名潜客匹配
      validateIfExistsQuery: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  components: {
    InlineSelect, CropperDialog, AreaCode
  },
  // beforeRouteEnter (to, from, next) {
  //   next(vm => {
  //     if (from.name === 'StudentEnroll') {
  //       vm.query()
  //     }
  //   })
  // },
  computed: {
    searchTypePlaceholder() {
      return this.searchTypeList.find(o => o.value === this.queryForm.searchType).placeholder
    },
    canOptStatusList() {
      return this.statusList.filter(o => o.canOpt !== false)
    },
    intentionStr() {
      let str = ''
      switch (this.customerForm.intention) {
        case 0:
          str = '意向一般'
          break
        case 1:
          str = '意向中等'
          break
        case 2:
          str = '意向强烈'
          break
      }
      return str
    },
    ...mapGetters([
      'organizationInfo',
      'currentBranch'
    ])
  },
  created() {
    this._getCustomerList()
  },
  methods: {
    // 存储手机地区码
    getPhoneAreaCode(info) {
      this.customerForm.phoneAreaCode = info
    },
    // 获取潜客列表
    _getCustomerList() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        status: this.queryForm.status !== '' ? this.queryForm.status : null,
        studentResourceId: this.queryForm.studentResourceId || null,
        courseIds: this.queryForm.courseIds || null,
        traceUserId: this.queryForm.traceUserId || null,
        intention: this.queryForm.intention !== '' ? this.queryForm.intention : null
      }
      params[this.queryForm.searchType] = this.queryForm.searchInput
      if (this.queryForm.dateRange && this.queryForm.dateRange.length > 0) {
        params.startTime = this.queryForm.dateRange[0] + ' 00:00:00'
        params.endTime = this.queryForm.dateRange[1] + ' 23:59:59'
      }
      if (this.queryForm.signStatus) {
        params.signStatus = 1
      }
      this.loadingQuery = true
      this.$http.get('/v1/PotentialCustomer/getPotentialCustomerList', params).then((res) => {
        res.data.forEach(item => {
          // 生日
          if (item.birthday) {
            item.birthday = item.birthday.split(' ')[0]
            item.age = Math.abs(moment(item.birthday).diff(moment(), 'year'))
          }
          // 性别
          switch (item.sex) {
            case 1:
              item.sexIcon = require('@/assets/icon_male.png')
              break
            case 2:
              item.sexIcon = require('@/assets/icon_famale.png')
          }
          // 意向度
          const intentionObj = this.intentionList.find(o => o.value === item.intention)
          if (intentionObj) {
            item.intentionStr = intentionObj.label
          }
          // 状态
          if (item.signStatus) {
            item.statusStr = '已签约'
          } else {
            const statusObj = this.statusList.find(o => o.value === item.status)
            if (statusObj) {
              item.statusStr = statusObj.label
            }
          }
          // 意向课程
          if (item.courseIds) {
            item.courseIds = item.courseIds.split(';')
          }
          // 最近跟进时间
          if (item.latestTraceTime && moment().diff(item.latestTraceTime, 'days') <= 10) {
            item.latestTraceTimeStr = moment(item.latestTraceTime).fromNow()
          } else {
            item.latestTraceTimeStr = item.latestTraceTime
          }
          if (item.remark == null) item.remark = ''
          item.remarkCopy = item.remark
        })
        this.customerList = res.data
        this.total = res.total
      }).finally(() => {
        this.loadingQuery = false
      })
    },
    // 获取课程列表
    _getCourseList() {
      if (this.courseList.length > 0) return
      this.loadingCourse = true
      this.$http.get(`/v1/Course/getCourseList/${this.currentBranch.id}`, { status: 1 }).then(res => {
        this.courseList = res.data
      }).finally(() => {
        this.loadingCourse = false
      })
    },
    // 获取来源渠道列表
    _getSourceList() {
      if (this.sourceList.length > 0) return
      this.loadingSource = true
      const param = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      this.$http.get('/v1/dictionary/DicStudentSource/getAll', param).then(res => {
        this.sourceList = res.data
      }).finally(() => {
        this.loadingSource = false
      })
    },
    // 获取来源渠道列表
    _getTraceUserList() {
      if (this.traceUserList.length > 0) return
      this.loadingTraceUser = true
      this.$http.get('/v1/User/getByUserLogo', { userLogo: 1, departmentId: this.currentBranch.id, organizationId: this.organizationInfo.id }).then(res => {
        this.traceUserList = res.data
      }).finally(() => {
        this.loadingTraceUser = false
      })
    },
    // 获取周边学校列表
    _getSchoolList() {
      // 确保只请求一次
      if (this.isRequestSchool) return
      this.isRequestSchool = true
      this.$http.get('/v1/SurroundSchool/getSurroundSchoolList', {
        departmentId: this.currentBranch && this.currentBranch.id
      }).then(res => {
        this.schoolList = res.data
      })
    },
    // 获取关系列表
    _getRelationList() {
      if (this.relationList.length > 0) return
      this.$http.get('/v1/dictionary/DicRelation/getAll').then(res => {
        this.relationList = res.data
      })
    },
    _toggleCustomerStatus(id, status) {
      this.$http.put('/v1/PotentialCustomer/updateStatusById', null, {
        params: {
          id: id,
          status: status
        }
      }).then(() => {
        this.$message.success('更新状态成功！')
        this._getCustomerList()
      })
    },
    // 获取跟进详情
    _getCustomerDetail(id) {
      this.$http.get('/v1/PotentialCustomer/getPotentialCustomerById', { id: id }).then(res => {
        if (res.data) {
          const item = res.data
          // 生日
          if (item.birthday) {
            item.birthday = item.birthday.split(' ')[0]
            item.age = Math.abs(moment(item.birthday).diff(moment(), 'year'))
          }
          // 性别
          switch (item.sex) {
            case 1:
              item.sexIcon = require('@/assets/icon_male.png')
              break
            case 2:
              item.sexIcon = require('@/assets/icon_famale.png')
          }
          // 意向度
          const intentionObj = this.intentionList.find(o => o.value === item.intention)
          if (intentionObj) {
            item.intentionStr = intentionObj.label
          }
          // 状态
          if (item.signStatus) {
            item.statusStr = '已签约'
          } else {
            const statusObj = this.statusList.find(o => o.value === item.status)
            if (statusObj) {
              item.statusStr = statusObj.label
            }
          }
          // 最近跟进时间
          if (item.latestTraceTime && moment().diff(item.latestTraceTime, 'days') <= 10) {
            item.latestTraceTimeStr = moment(item.latestTraceTime).fromNow()
          } else {
            item.latestTraceTimeStr = item.latestTraceTime
          }
          // 意向课程id
          if (item.courseIds) {
            item.courseIds = item.courseIds.split(';')
          }
          this.customerInfo = item
        }
      })
    },
    // 获取潜客的跟进记录
    _getTraceList(id) {
      this.loadingTraceList = true
      this.$http.get('/v1/PotentialCustomerTraceRecord/getPotentialCustomerTraceRecordList', {
        potentialCustomerId: id
      }).then(res => {
        res.data.forEach(item => {
          switch (item.type) {
            case 0:
              item.typeClass = 'primary'
              item.typeStr = '电话跟进'
              break
            case 1:
              item.typeClass = 'warning'
              item.typeStr = '实地跟进'
              break
            case 2:
              item.typeClass = 'success'
              item.typeStr = '对方来访'
              break
            case 3:
              item.typeClass = 'danger'
              item.typeStr = '线上跟进'
              break
          }
        })
        this.traceList = res.data
      }).finally(() => {
        this.loadingTraceList = false
      })
    },
    query() {
      this.pageNum = 1
      this._getCustomerList()
    },
    reset() {
      this.queryForm = {
        searchType: 'name',
        searchInput: '',
        dateRange: [],
        status: '',
        studentResourceId: '',
        courseIds: '',
        traceUserId: '',
        intention: '',
        signStatus: ''
      }
      this.query()
    },
    handleTabClick() {
      if (this.detailTab === '0') {
        this._getCustomerDetail(this.customerInfo.id)
      } else if (this.detailTab === '1') {
        this._getTraceList(this.customerInfo.id)
      }
    },
    // 打开潜客详情
    handleOpenDetail(row, tab) {
      this.detailTab = tab
      this.customerInfo = Object.assign({}, row)
      if (tab === '0') {
        this._getCustomerDetail(row.id)
      } else if (tab === '1') {
        this._getTraceList(row.id)
      }
      this.showDetail = true
    },
    // 编辑潜客信息
    handleOpenEdit(row) {
      // 先重置数据
      this.customerForm = {
        id: null,
        name: '',
        sex: 1,
        birthday: '',
        age: '',
        remark: '',
        school: '',
        grade: '',
        address: '',
        studentResourceId: '',
        relationId: '',
        primaryContactName: '',
        primaryContactPhone: '',
        courseIds: [],
        intention: 0,
        phoneAreaCode: PhoneAreaCode.getCheck()
      }
      this.$refs.customerForm && this.$refs.customerForm.resetFields()
      this._getRelationList()
      this._getSourceList()
      this._getCourseList()
      if (row) {
        // 重新绑定数据
        for (const key in this.customerForm) {
          if (this.customerForm.hasOwnProperty(key) && row[key] != null) {
            this.customerForm[key] = row[key]
          }
        }
      }
      this.showEditCustomer = true
      const that = this
      setTimeout(function () { that.$refs.mychild.setAreaCode(that.customerForm.phoneAreaCode) }, 100)
    },
    // 切换状态
    handleSelectStatus(row, status) {
      if (row.status === 5) {
        // 激活
        this.$confirm('确定激活该潜客？').then(() => {
          // 默认状态0
          this._toggleCustomerStatus(row.id, 0)
        })
      } else if (status === 5) {
        // 流失
        this.$confirm('确定该潜客已流失？').then(() => {
          this._toggleCustomerStatus(row.id, status)
        })
      } else {
        // 普通切换状态
        this._toggleCustomerStatus(row.id, status)
      }
    },
    // 年龄发生变化
    handleAgeChange(age) {
      this.customerForm.birthday = moment().subtract('years', age).format('YYYY-MM-DD')
    },
    // 生日变化
    handleBirthdayChange(birthday) {
      this.customerForm.age = Math.abs(moment(birthday).diff(moment(), 'year'))
    },
    // 过滤学校
    filterSchool(query, cb) {
      cb(this.schoolList.filter(item => {
        return item.name.indexOf(query) > -1
      }))
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
    // 提交新增、编辑
    handleEditSubmit() {
      this.$refs.customerForm.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.customerForm)
          params.phone = params.primaryContactPhone
          params.courseIds = params.courseIds.join(';')
          // 过滤空字符串
          this.filterNull(params)
          this.editLoading = true
          if (this.customerForm.id) {
            // 编辑
            this.$http.put('/v1/PotentialCustomer/updatePotentialCustomer', params).then(res => {
              this.$message.success('修改潜客信息成功！')
              this._getCustomerList()
              this.showEditCustomer = false
              this.showDetail = false
            }).finally(() => {
              this.editLoading = false
            })
          } else {
            // 新增
            params.organizationId = this.organizationInfo.id
            params.departmentId = this.currentBranch.id
            this.$http.post('/v1/PotentialCustomer/addPotentialCustomer', params).then(res => {
              this.$message.success('新增潜客信息成功！')
              this._getCustomerList()
              this.showEditCustomer = false
            }).finally(() => {
              this.editLoading = false
            })
          }
        }
      })
    },
    // 报名
    handleStudentEnroll(row) {
      this.$router.push({
        path: '/educational/studentEnroll',
        query: {
          customerId: row.id
        }
      })
    },
    // 添加跟进
    handleAddTrace(row) {
      this.traceForm = {
        potentialCustomerId: row.id,
        traceTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 0,
        remark: '',
        traceImgUrls: '',
        traceImgUrlsTemp: ''
      }
      this.showAddTrace = true
    },
    // 更多操作
    handleMoreOption(row, command) {
      switch (command) {
        case 'record':
          // 跟进记录
          this.handleOpenDetail(row, '1')
          break
        case 'assign':
          // 分配
          this.handleOpenAssign(false, row)
          break
        case 'loss':
          // 流失潜客
          this.handleSelectStatus(row, 5)
          break
        case 'edit':
          // 编辑
          this.handleOpenEdit(row)
          break
        case 'delete':
          // 删除
          this.$confirm(`确定删除该潜客【${row.name}】？`, '提示', {
            type: 'warning'
          }).then(() => {
            this.$http.delete('/v1/PotentialCustomer/delete/' + row.id).then(res => {
              this.$message.success('删除成功！')
              this.query()
              this.showDetail = false
            })
          })
          break
      }
    },
    // 表格选中切换
    handleSelectionChange(val) {
      this.selectedCustomer = val
    },
    // 打开跟进人分配
    handleOpenAssign(isAssignMany, val) {
      if (!isAssignMany) {
        this.selectedCustomer = [val]
        if (val && val.traceUserId) {
          this.selectedFollowId = val.traceUserId
        }
      } else {
        if (this.selectedCustomer.length === 0) {
          this.$message.warning('请选择需要分配跟进人的潜客')
          return
        }
      }
      this._getTraceUserList()
      this.showAssign = true
      this.isAssignMany = isAssignMany
    },
    // 关闭
    handleCloseAssign() {
      this.selectedCustomer = []
      this.$refs.table.clearSelection()
      this.selectedFollowId = ''
    },
    // 提交分配
    handleSubmitAssign() {
      if (this.selectedCustomer.length === 0) {
        this.$message.warning('请选择需要分配跟进人的潜客')
        return
      }
      if (!this.selectedFollowId) {
        this.$message.warning('请选择跟进人')
        return
      }
      this.loadingAssign = true
      this.$http.put('/v1/PotentialCustomer/updateTraceUserByIds', null, {
        params: {
          ids: this.selectedCustomer.map(o => o.id).join(';'),
          traceUserId: this.selectedFollowId
        }
      }).then(() => {
        this.$message.success('分配跟进人成功！')
        this._getCustomerList()
        this.showAssign = false
      }).finally(() => {
        this.loadingAssign = false
      })
    },
    // 裁剪图片
    cropperImage() {
      this.$refs.cropperImage.select()
    },
    // 裁剪完成
    handleUploadCompleteImage(res) {
      this.traceForm.traceImgUrls = res.url
      this.traceForm.traceImgUrlsTemp = res.tempUrl
    },
    // 提交新增跟进
    handleSubmitAddTrace() {
      this.$refs.traceForm.validate(valid => {
        if (valid) {
          this.loadingAddTrace = true
          this.$http.post('/v1/PotentialCustomerTraceRecord/addPotentialCustomerTraceRecord', Object.assign({}, this.traceForm)).then(() => {
            this.$message.success('添加跟进成功！')
            if (this.showDetail) {
              this._getTraceList(this.customerInfo.id)
            } else {
              this._getCustomerList()
            }
            this.showAddTrace = false
          }).finally(() => {
            this.loadingAddTrace = false
          })
        }
      })
    },
    // 编辑备注
    editRemark(row, index) {
      this.$http.put('/v1/PotentialCustomer/updatePotentialCustomer', {
        id: row.id,
        remark: row.remarkCopy
      }).then(res => {
        row.remark = row.remarkCopy + ''
        this.$refs['remarkHack' + index].click()
      })
    },
    // 下载导入模板
    downloadTemplate() {
      let loading
      loading = this.$loading({
        lock: true,
        text: '模板生成中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const downloadPath = window.location.origin + process.env.VUE_APP_BASE_API + `/api/ExportOrImport/downloadImportPotentialCustomerTemplate?organizationId=${this.organizationInfo.id}&departmentId=${this.currentBranch.id}`
      saveAs(downloadPath)
      loading.close()
      loading = null
    },
    // 选取文件
    selectExcelFile() {
      this.$refs.fileInput.click()
    },
    // 上传文件
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
      importExcel(file).then(res => {
        loading.text = '正在上传潜在客户信息...'
        res.data.forEach(item => {
          item.primaryContactPhoneAreaCode = item.primaryContactPhoneAreaCode.split('-')[0]
        })
        const excelConf = res.excelConf
        this.$http.post('/v1/ExportOrImport/importPotentialCustomer', res.data, {
          params: {
            organizationId: this.organizationInfo.id,
            departmentId: this.currentBranch.id
          }
        }).then(() => {
          this.$message.success('已成功导入' + res.data.length + '条潜在客户数据！')
          this.query()
          this.dialogVisible = false
          ImortRecord.push({
            filename: excelConf.filename,
            CreatedDate: excelConf.CreatedDate,
            ModifiedDate: excelConf.ModifiedDate
          })
        }).catch((err) => {
          if (err.code === '000001' && err.data) {
            err.data.forEach(item => {
              item.row = item.row + excelConf.dataStartIndex
              const obj = excelConf.rules.find(o => o.key === item.column)
              if (obj) {
                item.column = obj.value
              }
            })
            this.uploadErrList = err.data
          }
        }).finally(() => {
          // 前端校验
          loading.close()
        })
      }).catch(err => {
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
      this.uploadFileName = ''
      this.$refs.fileInput.value = ''
      this.uploadErrList = []
    },
    // 关闭提示、清除提示内容
    fscommand() {
      this.uploadErrList = []
    },
    // 新增潜客时匹配已经存在的联系人
    validateIfExists() {
      this.selectName = this.customerForm.name
      this.validateIfExistsQuery = {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
      this._getConflictByName()
    },
    // 获取同名潜客
    _getConflictByName() {
      this.validateIfExistsTableLoading = true
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id,
        name: this.selectName,
        pageNum: this.validateIfExistsQuery.pageNum,
        pageSize: this.validateIfExistsQuery.pageSize
      }
      this.$http.get('/v1/PotentialCustomer/getConflictByName', params).then(res => {
        this.validateIfExistsDialog = true
        if (res.total !== 0) {
          this.validateIfExistsList = res.data
        } else {
          this.validateIfExistsList = []
        }
        this.validateIfExistsQuery.total = res.total
      }).finally(() => {
        this.validateIfExistsTableLoading = false
      })
    },
    // 同名潜客分页
    validatePagesQuery() {
      this.validateIfExistsQuery.pageNum = 1
      this._getConflictByName()
    },
    exportPotential() {
      this.exportPotentialDialog = true
      this.processStatus = 0
      this.percentageColor = '#67c23a'
      let setInt = setInterval(() => {
        this.percentage += Math.ceil(Math.random() * 3)
      }, 1000)
      const params = {
        organizationId: this.organizationInfo.id,
        departmentId: this.currentBranch.id
      }
      // 处理下载链接
      let downloadInfoUrl =
        window.location.origin +
        process.env.VUE_APP_BASE_API +
        '/api/ExportOrImport/downloadPotentialInfoFile?'
      for (let i = 0; i < Object.keys(params).length; i++) {
        const key = Object.keys(params)[i]
        if (i === 0) {
          downloadInfoUrl += key + '=' + params[key]
        } else {
          if (params[key]) {
            downloadInfoUrl += '&' + key + '=' + params[key]
          }
        }
      }
      this.$http
        .getDownload(downloadInfoUrl, '潜客信息表.xls')
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
            this.exportPotentialDialog = false
          }, 1000)
        })
    },
    // 取消导出潜客信息
    cancelExportPotential() {
      store.dispatch('handleRequestCancelToken', true)
    }
  }
}
</script>

<style lang="stylus" scoped>
.import-student-dialog
  .el-dialog__header
    border 1px solid #e4e7ed
    padding 0 20px
    background #f5f7fa
    font-size 16px
    color #303133
    line-height 36px
    font-weight bold
    color #333
  .close-btn
    position absolute
    right 16px
    top 9px
    cursor pointer
    font-size 18px
    color $color-info
    &:hover
      color $color-primary
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

.el-dropdown-link
  cursor pointer
  color $color-primary
  font-size 12px
.el-icon-arrow-down
  font-size 12px

.more-course-info
  color #ff6600

.not-data-tip
  margin-top 120px
  text-align center
  font-size 14px
  color $color-info

.customer-form
  .el-input, .el-select, .el-radio-group, .el-autocomplete
    width 216px
  .divider-line
    height 0.5px
    background $color-border-2
    margin-bottom 16px
  .bottom-btns
    text-align center
    .el-button
      width 120px
      &+.el-button
        margin-left 50px
  .intention-icons
    display flex
    align-items center
    li
      color $color-info
      font-size 26px
      cursor pointer
      &+li
        margin-left 8px
      &:last-child
        margin-left 24px
        font-size 14px
        color $color-primary
        cursor default
      .active-icon
        color $color-primary

.username
  span
    font-size 13px
    color $color-text-2
    margin 0 6px
  img
    vertical-align middle

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

/** 学员详情 */
.customer-detail
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
    li
      margin-bottom 12px
      display flex
      &>span
        color $color-text-1
    label
      flex-shrink 0
      min-width 80px
      color $color-text-3
      margin-right 6px
      text-align right

.el-tag
  &+.el-tag
    margin-left 12px

.form-tip
  line-height 26px
  font-size 13px
  color $color-text-3

.img-con
  width 160px
  height 120px
  line-height 120px
  position relative
  border 1px solid $color-border-1
  border-radius 3px
  overflow hidden
  img
    width 100%
    height 100%
  &:hover
    .img-layer
      display block
  .img-layer
    background rgba(0, 0, 0, 0.5)
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    display none
    span
      display inline-block
      line-height 30px
      padding 0 12px
      border 1px solid #fff
      color #fff
      cursor pointer
      font-size 13px
      margin-left 43px
      &:hover
        background rgba($color-danger, 0.8)
        border-color rgba($color-danger, 0.8)

.trace-row
  line-height 1.4
  label
    display inline-block
    color $color-info
    margin-right 6px
    min-width 68px
    text-align left
</style>

<style lang="stylus">
.remark-edit-popver
  .remark-edit-form
    display flex
    label
      flex-shrink 0
      width 46px
  .remark-edit-btns
    text-align center
    margin-top 16px

.customer-detail-dialog
  .el-dialog__header
    font-weight bold
    line-height 40px
    border 1px solid $color-border-1
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
.showTableData
  background #fff
  padding 14px
</style>

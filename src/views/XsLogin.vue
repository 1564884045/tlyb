<template>
  <el-dialog style="width: 1000px" custom-class="login-box" :visible.sync="showBox" @close="closeBox" lock-scroll>
    <el-form ref="form" :model="form" :rules="rules" class="login-form" auto-complete="on" label-position="left">
      <div v-if="type === 'pwd'">
        <el-form-item prop="account">
          <el-input ref="name" v-model="form.account" placeholder="用户名" type="text" tabindex="1"
                    auto-complete="on">
            <svg-icon slot="prefix" name="user"/>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input ref="password" v-model="form.password" :type="passwordType" placeholder="密码"
                    tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin">
            <svg-icon slot="prefix" name="password"/>
            <svg-icon slot="suffix" :name="passwordType === 'password' ? 'eye' : 'eye-open'"
                      @click="showPassword"/>
          </el-input>
        </el-form-item>
      </div>
      <div v-else-if="type==='code'">
        <el-form-item prop="account">
          <el-input ref="phone"
                    v-model="form.phone"
                    placeholder="手机号码"
                    type="number"
                    :max="11"
                    auto-complete="on">
            <svg-icon slot="prefix" name="user"/>
          </el-input>
        </el-form-item>
        <!-- 验证码  -->
        <el-form-item prop="password">
          <el-input ref="phone" v-model="form.phone" placeholder="请输入验证码" type="number" :max="11" auto-complete="on">
            <svg-icon slot="prefix" name="password"/>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="remark">
          <el-input placeholder="请输入短信验证码" v-model="ruleForm.yzm">
            <el-button slot="append" v-if="setCode" @click="getYzm">{{setCode}}</el-button>
          </el-input>
        </el-form-item>
      </div>
<!--      密码登陆和验证码登陆的切换-->
      <div style="display: flex; justify-content: space-between">
        <div v-if="type === 'pwd'" @click="type = 'code'" style="font-size: 8px">手机验证码登录</div>
        <div v-else-if="type === 'code'" @click="type = 'pwd'" style="font-size: 8px">密码登陆</div>
<!--        注册(弹窗)-->
        <el-button type="text" @click="dialogFormVisible = true" size="mini" name="register" style="font-size: 8px;">注册</el-button>
        <el-dialog append-to-body title="注册用户" :visible.sync="dialogFormVisible">
          <el-form  :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-radio-group v-model="radio" style="margin-bottom: 15px">
              <el-radio :label="3">注册学员</el-radio>
              <el-radio :label="6">注册老师</el-radio>
              <el-radio :label="9">注册机构</el-radio>
            </el-radio-group>
            <el-form-item label="手机号码" :model="form">
              <el-input ref="phone" v-model="form.phone" placeholder="请输入手机号码" type="number" :max="11" auto-complete="on">
                <svg-icon slot="prefix" name="user"/>
              </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="pass">
              <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取消注册</el-button>
            <el-button type="primary" @click="dialogFormVisible = false">确认注册</el-button>
          </div>
        </el-dialog>
      </div>
      <br>
      <el-checkbox v-model="form.remember" style="margin-bottom: 15px">记住我</el-checkbox>
      <el-button :loading="loading" type="primary" style="width: 100%;" @click.native.prevent="handleLogin">登
        录
      </el-button>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  name: "LoginBox",
  data() {
    return {
      radio: 3,
      showBox:false,
      dialogFormVisible: false,
      type: 'pwd', // pwd->密码登录 code->验证码   register->注册
      // 引入InputGroup组件的值
      phone:"", //手机号
      disabled:false,  //是否可点击

      form: {
        account: localStorage.login_account || '',
        password: '',
        remember: !!localStorage.login_account,

        phone: '',
        code: '',
        register: ''
      },
      rules: {
        account: [
          {required: true, trigger: 'blur', message: '请输入用户名'}
        ],
        password: [
          {required: true, trigger: 'blur', message: '请输入密码'},
          {min: 6, max: 18, trigger: 'blur', message: '密码长度为6到18位'}
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
      },
      // loading: false,
      passwordType: 'password',
      redirect: undefined,
    //  注册
      ruleForm: {
        pass: '',
        checkPass: '',
      },
    };
  },
  watch:{
    // 显示状态的改变
    '$store.state.settings.loginBox': {
      handler() {
        console.log("修改",this.$store.state.settings.loginBox)
        this.showBox = this.$store.state.settings.loginBox
      },
      immediate: true
    },
  },
  methods:{
    showPassword() {
      this.passwordType = this.passwordType === 'password' ? '' : 'password'
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    testAccount(account) {
      this.form.account = account
      this.form.password = '123456'
      this.handleLogin()
    },
    closeBox(){
      this.$store.dispatch("settings/showLoginBox", false);
    },
    //  注册
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!');
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleLogin() {
      this.$store.dispatch("user/login",{
        account: '15885911727',
        password: '123456',
      })
    }
  },

}
</script>
<style lang="scss" scoped>
.login-form {
  width: 400px;
  padding: 10px 30px 10px;
  overflow: hidden;

  .svg-icon {
    vertical-align: -0.35em;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 22px;
      color: #666;
      margin: 0 auto 30px;
      text-align: center;
      font-weight: bold;
      @include text-overflow;
    }
  }
}
</style>
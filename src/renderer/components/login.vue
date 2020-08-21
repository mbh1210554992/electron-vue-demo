<style>
@import '../assets/css/login.css';  /*单个页面样式*/
</style>
<template>
  <div class="login-main">
    <!--登录页头部内容-->
    <div class="login-head drag">
      <div class="login-head-btn">
        <ul>
          <li class="close" @click="closeLogin()"></li>
        </ul>
      </div>
      <div class="login-head-company-logo">
        <img src="../assets/img/login/logo_company.png">
      </div>
      <div class="login-head-logo">
        <img src="../assets/img/login/login_logo.png">
      </div>
    </div>
    <!--登录页内容部分-->
    <div class="login-content">
      <div class="error-message">{{errMsg}}</div>
      <ul>
        <li>
          <span class="user"></span>
          <input type="text" placeholder="请输入用户名" id="userInput" v-model="username"/>
        </li>
        <li>
          <span class="pwd"></span>
          <input type="password" placeholder="请输入密码" id="lockedInput" v-model="password"/>
        </li>
      </ul>
      <div class="clearfix">
        <div class="remember-mima fl">
          <input type="checkbox" id="keepPwd" v-model="isChecked"/>
          <span>记住密码</span>
        </div>
      </div>
      <div class="login-btn" @click="login()">
        <span v-show="!isLogin">登录</span>
        <span v-show="isLogin"><i class="el-icon-loading"></i>正在登录...</span>
      </div>
    </div>
  </div>
</template>
<script>
const $ = document.querySelector.bind(document);
import { ipcRenderer as ipc } from 'electron'
import http from '../api/axios'
import {baseUrl,upgradeUrl} from '../api/config'
export default {
  name: 'index',
  components: {},
  data() {
    return {
      errMsg:"",
      username:"",
      password:"",
      isChecked:false,
      isLogin:false

    }
  },
  methods: {
    // 关闭当前页
    closeLogin: function () {
      ipc.send('login-window-close');
    },

    //用户名密码不能为空墨盒
    checkLogin: function() {
      if (this.utils.isEmpty(this.username)) {
        this.errMsg = '用户名不能为空';
        return false;
      }
      if (this.utils.isEmpty(this.password)) {
        this.errMsg = '密码不能为空';
        return false;
      }
      return true;
    },
    //登录
    login: function () {
      let thisObject = this;
      if(!this.checkLogin()) return;
      this.isLogin = true; //切换登录按钮为登录中状态
      http.post('/platform/system/sysUser/preLogin.ht', {
          username: this.username,
          password: this.password
        }
      ).then((response) => {
        let data = response.data;
        //登录成功
        if(data.code == 1){
          localStorage.userId = data.id;
          localStorage.name = data.name;
          localStorage.username = this.username;
          if(this.isChecked){
            localStorage.password = this.password;
            localStorage.isKeepPwd = true;
          }else{
            this.password = '';
            localStorage.password = this.password;
            localStorage.isKeepPwd = false;
          }
          ipc.send('user-login-success'); //登陆成功，与主进程通信，跳转到相应页面
        }else{
          this.errMsg = data.msg;
          this.isLogin = false;
        }
      }).catch((err) => {
        this.isLogin = false;
        this.errMsg = "系统繁忙，请稍后重试！";
        console.log(err);
      });
    },

  },
  mounted() {
    if (localStorage.username != 'undefined' && localStorage.username != null) {
      this.username = localStorage.username;
    }

    if (localStorage.isKeepPwd == 'true' && localStorage.password != null) {
      this.password = localStorage.password;
      this.isChecked = true;
    }

  }

}


</script>

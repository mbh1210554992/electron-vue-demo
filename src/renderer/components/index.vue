<style>
  @import '../assets/css/index.css';  /*单个页面样式*/
</style>

<template>
  <div class="crawlerClient-main">
    <!--头部-->
    <div class="head" style="-webkit-app-region: drag;">
      <div class="head-data">
        <img class="head-data-logo" src="../assets/img/data.png">
        <span class="data-name">数据采集</span>
        <span>v{{version}}</span>
        <p>hi，<span class="user" >{{userName}}</span>，欢迎您！ <span class="user"@click="logout()" >注销</span></p>
        <div class="head-btn" style="-webkit-app-region: no-drag;">
          <ul>
            <li @click="minWindow();"><i class="el-icon-minus"></i></li>
            <li @click="maxWindow();"><i class="el-icon-copy-document"></i></li>
            <li @click="closeWin();" class="close"><i class="el-icon-close"></i></li>
          </ul>
        </div>
      </div>
      <div class="head-location clearfix">
        <!-- v-model绑定的值与<el-tabs-pane>中的name属性对应-->
        <el-tabs v-model="editableTabsValue" type="card" @tab-remove="removeTab">
          <el-tab-pane v-for="(item,index) in editableTabs" :key="item.name" :label="item.title" :name="item.name" :closable="item.canClose">
            <!--<component :is="item.component" v-on:addTab="addTab" v-on:deleteTab="deleteTab" v-on:updateTab="updateTab" :key="index"></component>-->
            <!--<webview id="webviewTab" allowpopups
                     style="display: inline-flex;width: 100%;height: 100%;"
                     src="http://localhost:9080/#/editTask"
                     nodeintegration disablewebsecurity>
            </webview>-->
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="index-content">
      <keep-alive include="taskDetail">
        <router-view v-on:emitMsg = "emitMsg" :key="editableTabsValue"></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import {ipcRenderer as ipc} from 'electron'
const $ = document.querySelector.bind(document);
export default {
  name: 'index',
  data () {
    return {
      version: '',
      userName: '',
      editableTabs: [{   //当所有标签都关闭时，显示任务列表界面
        title: '任务列表',
        name: '1',
        path: '/index',
        taskId: -1,
        canClose:false
      }],
      editableTabsValue: '',
      editableTab:{}

    }
  },
  watch: {
    'editableTabsValue' : function (newVal) {  //当被选中的标签改变时，跳转至相应的界面
      this.editableTabs.forEach((tab,index) => {
        if(tab.name === newVal){
          this.editableTab = tab
          this.$router.push({path:tab.path, query: tab})
        }
      });
    }

  },
  methods: {
    closeWin: function () {
      this.$confirm('确认要关闭系统吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        ipc.send('window-close')
      }).catch(() => {

      })
    },
    //最小化窗口
    minWindow: function (){
      ipc.send('window-min');
    },
    maxWindow: function () {
      ipc.send('window-max');
    },
    //退出登录
    logout: function(){
      this.$confirm('确定要注销当前用户吗?', '提示', {
        confirmButtonText:"确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then( () => {
        ipc.send('logout');
      });

    },
    //接收子页面传递的数据
    emitMsg: function (data) {
      switch (data.tabType){
        case 1: //增加tab
          this.addTab(data);
          break;
      }
    },
    //添加页面标签
    addTab: function (data) {
      let newTabName = data.taskId + data.path;
      let tabs = this.editableTabs;
      //当前任务页面的标签是否已经存在
      let hasTabs = false;
      tabs.forEach((tab,index) => {
        let subIndex = tab.name.lastIndexOf('/');
        if(tab.name.substring(0,subIndex) === newTabName){
          this.editableTabsValue = tab.name;
          hasTabs = true;
        }
      });
      if(hasTabs) return; //若已存在任务页面的标签，就直接通过editableTabsValue变量改变页面跳转

      newTabName = newTabName + "/" + new Date().getTime();
      data.name = newTabName;
      this.editableTabs.push(data);
      this.editableTabsValue = newTabName;
    },

    //移除标签
    removeTab: function (targetName) {
      let tabs = this.editableTabs;
      let closeTab = null;
      let closeIndex = -1;
      for(let i in tabs){
        let tab = tabs[i];
        if(tab.name == targetName){
          closeTab = tab;
          closeIndex = i;
          break;
        }
      }

      let activeName = this.editableTabsValue;
      if(activeName == targetName){
        tabs.forEach((tab,index) => {
          //删除标签后。显示标签后面页面或者前面的页面
          let nextTab = tabs[index + 1] || tabs[index - 1];
          if(nextTab){
            activeName = nextTab.name;
          }
        });
      }
      this.editableTabsValue = activeName;
      //删除tab数组中当前页
      this.editableTabs.splice(closeIndex, 1);

    }
  },
  mounted () {
    this.userName = localStorage.name;
    this.$router.push({path:'/index/list'});
    //清除任务缓存数据
    localStorage.removeItem('taskList');
  }
}
</script>

<style scoped>

</style>

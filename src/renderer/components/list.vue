<style>
  @import '../assets/css/index.css';
</style>

<template>
  <div class="list-main">
    <!--侧边栏-->
    <div class="left-menu">
      <div class="task-group">
        <span>任务分组</span>
        <div class="add-group tooltip-list" @click="dialogCreatGroup = true"><span class="tooltiptext">新建分组</span></div>
      </div>
      <div class="task-group-list">
        <div class="group" v-for="(group,index) in taskGroups" :class="{'active':group.group_id == groupId}" @click="selectGroup(group)">
          <i class="el-icon-folder"></i>
          <span>{{ group.group_name }}</span>
          <!--<span class="group-del-btn" @click="deleteGroup(group)"><i class="el-icon-delete"></i></span>-->
          <span class="group-del-btn" v-if="group.group_id != 1">
              <el-dropdown>
                  <span class="el-dropdown-link">
                      <i class="el-icon-more"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="dialogUpdateGroup = true">编辑分组</el-dropdown-item>
                      <el-dropdown-item @click.native="deleteGroup(group)">删除分组</el-dropdown-item>
                  </el-dropdown-menu>
              </el-dropdown>
          </span>
        </div>
      </div>
    </div>
    <div class="list-main-content">
      <!--按钮与查询-->
      <div class="list-main-btn clearfix">
        <div class="del-btn fl" @click="dialogCreatTask = true" style="width: 80px;"><i class="iconfont icon-tianjia"></i>新建任务</div>
        <div class="del-btn fl"  @click="deleteBatch()" style="width: 50px;"><i class="iconfont icon-picture-delet"></i>删除</div>
        <div class="list-search fr">
          <input class="el-input__inner search-input" placeholder="搜索任务" v-model="searchText" @keyup.enter="handleText();"/>
          <i class="el-icon-search search-input-btn" @click="handleText();"></i>
        </div>
        <div class="list-state fr">
          <span class="task-state">采集状态：</span>
          <el-dropdown trigger="click" style="width: 80px;" @command="handleCommand">
            <span class="state-dropdown">
              {{taskState | dictionary}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command= "0">全部</el-dropdown-item>
              <el-dropdown-item command="1">未运行</el-dropdown-item>
              <el-dropdown-item command="2">正在运行</el-dropdown-item>
              <el-dropdown-item command="3">已停止</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="list-state fr">
          <span class="task-state">采集类型：</span>
          <el-dropdown trigger="click" style="width: 80px" @command="handleTaskType">
            <span class="state-dropdown">
              <span v-show="searchTaskType == -1">全部</span>
              <span v-show="searchTaskType == 0">WEB网站</span>
              <span v-show="searchTaskType == 1">公众号</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="-1">全部</el-dropdown-item>
              <el-dropdown-item command="0">WEB网站</el-dropdown-item>
              <el-dropdown-item command="1">公众号</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!--列表-->
      <div class="list-table">
        <el-table :data="taskList" :row-style="{height:'40px'}" style="height: 600px;" @selection-change="selectGroupChange">
          <el-table-column type="selection"></el-table-column>
          <el-table-column label="任务名称" prop="task_name">
            <template slot-scope="scope">
              <i class="el-icon-s-order icon-file"></i>
              <el-tooltip effect="light" :content="scope.row.task_name" placement="bottom-start" :open-delay="500" :enterable="false">
                <span @click="editTask(scope.row)" class="task-name">{{scope.row.task_name}}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="采集状态" >
            <template slot-scope="scope">
              <i v-if="scope.row.task_state!=2 && scope.row.task_state != -1" class="el-icon-video-play icon-play" @click="startTask(scope.row)"></i>
              <i v-if="scope.row.task_state==2 || scope.row.task_state==-1" class="el-icon-video-pause" @click="stopTask(scope.row)"></i>
              <span>{{scope.row.task_state | dictionary}}</span>
            </template>
          </el-table-column>
          <el-table-column label="任务类型" >
            <template slot-scope="scope">
              <span v-if="scope.row.task_type == 0">WEB网站</span>
              <span v-if="scope.row.task_type == 1">公众号</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{scope.row.create_time | dateFormat('yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="运行状态">
            <template slot-scope="scope">
              <span v-if="scope.row.run_state == 1" style="color: green">正常</span>
              <span v-if="scope.row.run_state == 2" style="color: red">异常</span>
              <span v-if="scope.row.run_state == 3" style="color: red">错误</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span class="operate-daochu" @click="editTask(scope.row)">查看</span>
              <span class="operate-daochu" @click="getTask(scope.row.task_id)">修改</span>
              <span class="operate-daochu" @click="deleteOne(scope.row.task_id)">删除</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5,10,15,20,30]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalCount">
        </el-pagination>
      </div>
    </div>

    <!--新建任务-->
    <el-dialog title="新建任务" :visible.sync="dialogCreatTask" class="create-task">
      <el-form>
        <el-form-item label="任务名称" :label-width="formLabelWidth">
          <el-input v-model="taskName" style="width: 96%;" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" :label-width="formLabelWidth">
          <el-radio-group v-model="taskType">
            <el-radio v-for="type in crawlerType" :key="type.value" :label="type.value">{{type.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="网址" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="taskUrl" rows=5 placeholder="例如：http://www.jinmingyuan.com/"></el-input>
        </el-form-item>
        <el-form-item label="任务组" :label-width="formLabelWidth">
          <el-select v-model="groupId" placeholder="请选择" clearable>
            <el-option  v-for="item in taskGroups" :label="item.group_name" :value="item.group_id" :key="item.group_id"></el-option>
          </el-select>
<!--          <el-input v-model="groupName" readonly></el-input>-->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="initTaskFromData()">取消</el-button>
        <el-button type="primary" @click="createTask()">保存</el-button>
      </div>
    </el-dialog>
    <!--编辑任务-->
    <el-dialog title="编辑任务" :visible.sync="dialogEditTask" class="create-task">
      <el-form>
        <el-form-item label="任务名称" :label-width="formLabelWidth">
          <el-input v-model="taskName" style="width: 96%;" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" :label-width="formLabelWidth">
          <el-radio-group v-model="taskType">
            <el-radio v-for="type in crawlerType" :key="type.value" :label="type.value">{{type.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="网址" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="taskUrl" rows=5 placeholder="例如：http://www.jinmingyuan.com/"></el-input>
        </el-form-item>
        <el-form-item label="任务组" :label-width="formLabelWidth">
          <el-select v-model="groupId" placeholder="请选择" clearable>
            <el-option  v-for="item in taskGroups" :label="item.group_name" :value="item.group_id" :key="item.group_id"></el-option>
          </el-select>
          <!--          <el-input v-model="groupName" readonly></el-input>-->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="initTaskFromData()">取消</el-button>
        <el-button type="primary" @click="updateTask()">保存</el-button>
      </div>
    </el-dialog>
    <!--新建分组-->
    <el-dialog title="新建分组" :visible.sync="dialogCreatGroup" class="create-group">
      <el-form>
        <el-form-item label="新组名" :label-width="formLabelWidth">
          <el-input v-model="newGroupName" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCreatGroup = false">取消</el-button>
        <el-button type="primary" @click="createGroup()">保存</el-button>
      </div>
    </el-dialog>
    <!--编辑分组-->
    <el-dialog title="编辑分组" :visible.sync="dialogUpdateGroup" class="update-group">
      <el-form>
        <el-form-item label="新组名" :label-width="formLabelWidth">
          <el-input v-model="groupName" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUpdateGroup = false">取消</el-button>
        <el-button type="primary" @click="updateGroup()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import http from '../api/axios.js';
const sqliteDB = require('electron').remote.app.sqliteDB
export default {
  name: 'list',
  components: {},
  data () {
    return {
      taskGroups: [],
      taskList: [],
      dialogCreatTask: false,
      dialogEditTask: false,
      dialogCreatGroup: false,
      dialogUpdateGroup: false,
      formLabelWidth: '80px',
      taskName: '',
      taskType: 0,
      taskUrl: '',
      groupName: '',
      taskId: '',
      groupId: '',
      taskGroup: '',
      group:{},
      newGroupName: '',
      searchText: '',
      taskState: 0,
      searchTaskType: -1,
      crawlerType: [
        {value: 0,label: 'WEB网站'}, {value: 1,label: '微信公众号'}
      ],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      totalCount:0


    }
  },
  watch: {
    'dialogCreatTask': function (newVal) {
      if(newVal == false) this.initTaskFromData();
    },
    'dialogEditTask': function (newVal) {
      if(newVal == false) this.initTaskFromData();
    },
    'dialogUpdateGroup': function (newVal) {
      if(newVal == false) this.initGroupFromData();
    },
    'dialogCreatGroup': function (newVal) {
      if(newVal == false) this.initGroupFromData();
    }
  },
  methods: {
    //获取当前页面
    handleCurrentChange: function(cpage){
      this.currentPage = cpage;
      this.selectGroup(this.group);
    },
    //当前页面显示个数
    handleSizeChange(psize) {
      this.pageSize = psize;
      this.selectGroup(this.group);
    },

    editTask: function (task){
      this.$emit('emitMsg',{
        tabType: 1,
        path:'/index/taskDetail',
        taskId:task.task_id,
        title:task.task_name,
        canClose: true
      })
    },

    //查询所有分组
    initGroup: function () {
      var thisObject = this;
      var params = [];
      var sql = 'select * from crawler_task_group order by create_time desc'
      sqliteDB.queryData(sql,params,function (err, data) {
        thisObject.taskGroups = data;
        if(!thisObject.utils.isEmpty(data)){
          if(thisObject.utils.isEmpty(thisObject.group)){
            thisObject.groupId = data[0].group_id;
            thisObject.groupName = data[0].group_name;
            thisObject.selectGroup(data[0]);
          }else{
            thisObject.groupId = thisObject.group.group_id;
            thisObject.groupName = thisObject.group.group_name;
            thisObject.selectGroup(thisObject.group)
          }

        }
      })
    },

    //获取下拉框的值
    handleCommand: function (command){
      this.taskState = Number(command);
      this.currentPage = 1;
      this.selectGroup(this.group);
    },

    //获取下拉框的值
    handleTaskType: function (command){
      this.searchTaskType = Number(command);
      this.currentPage = 1;
      this.selectGroup(this.group);
    },

    //获取搜索框中的值
    handleText: function (){
      this.currentPage = 1;
      this.selectGroup(this.group);
    },

    //查看分组下的任务
    selectGroup: function (group) {
      localStorage.setItem("group",JSON.stringify(group));
      var thisObject = this;
      this.group = group;
      var groupId = group.group_id;
      this.groupName = group.group_name;
      this.groupId = groupId;
      var params = [];
      var countSql = 'select count(1) as count from crawler_task where task_group_id = ? ';
      var sql = 'select * from crawler_task where task_group_id = ? ';
      params.push(groupId);
      //判断查询条件
      if(!this.utils.isEmpty(this.taskState)){
        sql = sql.concat('and task_state = ? ');
        countSql = countSql.concat('and task_state = ? ');
        params.push(this.taskState)
      }
      if(this.searchTaskType != -1){
        sql = sql.concat('and task_type = ? ');
        countSql = countSql.concat('and task_type = ? ');
        params.push(this.searchTaskType);
      }
      if(!this.utils.isEmpty(this.searchText)){
        sql = sql.concat("and task_name like '%").concat(this.searchText).concat("%' ");
        countSql = countSql.concat("and task_name like '%").concat(this.searchText).concat("%' ");
      }
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.pageSize;
      sql = sql.concat('order by create_time desc limit ?,?');

      //获取任务总条数
      sqliteDB.getOne(countSql,params, function (err, data){
        if(err){
          console.log('获取任务总数失败');
          return;
        }
        thisObject.totalCount = data.count;
      })
      console.log('sql语句为：'+sql);

      params.push(start);
      params.push(end);
      //查询当前页的任务
      sqliteDB.queryData(sql,params,function (err, data) {
        thisObject.taskList = data;
        localStorage.setItem('taskList',JSON.stringify(data));
      })
    },

    getTask: function (taskId){
      let thisObject = this;
      this.taskId = taskId
      let sql = 'select * from crawler_task where task_id = ?'
      sqliteDB.getOne(sql, taskId,function (err, data) {
        thisObject.taskName = data.task_name;
        thisObject.taskUrl = data.task_url;
        thisObject.taskType = data.task_type;
        thisObject.dialogEditTask = true;
      });
    },

    //创建任务
    createTask: function (){
      if(this.utils.isEmpty(this.taskName)){
        this.dailogMsg('请输入任务名','warning');
        return;
      }
      if(this.utils.isEmpty(this.groupId)){
        this.dailogMsg('请选择任务分组', 'warning');
        return;
      }
      if(this.utils.isEmpty(this.taskUrl)){
        this.dailogMsg('请输入网址','warning');
      }
      var id = this.utils.createRandomIdExt();
      var createTime = Date.now();
      var runState = 1;
      var taskState = 1;
      var sql = 'insert into crawler_task' +
          '(task_id, task_name, task_group_id, task_url, create_time, task_type,task_state,run_state) ' +
          'values(?,?,?,?,?,?,?,?);'
      var params = [];
      params.push(id);
      params.push(this.taskName);
      params.push(this.groupId);
      params.push(this.taskUrl);
      params.push(createTime);
      params.push(this.taskType);
      params.push(taskState);
      params.push(runState);
      var thisObject = this;
      sqliteDB.insertData(sql,params,function (err,data) {
        if(err){
          console.log("保存任务失败:"+err);
          return;
        }

        thisObject.$alert('保存成功', '提示', {
          confirmButtonText: '确定',
          type: 'success',
          callback: action => {
            //window.location.href="taskList.html";
            thisObject.selectGroup(thisObject.group);
            thisObject.initTaskFromData();
          }
        });
      });

    },

    //更新任务
    updateTask: function (){
      if(this.utils.isEmpty(this.taskName)){
        this.dailogMsg('请输入任务名','warning');
        return;
      }
      if(this.utils.isEmpty(this.groupId)){
        this.dailogMsg('请选择任务分组', 'warning');
        return;
      }
      if(this.utils.isEmpty(this.taskUrl)){
        this.dailogMsg('请输入网址','warning');
      }
      let thisObject = this;
      let sql = 'update crawler_task set task_name = ?, task_type = ?, task_url = ? , task_group_id = ? where task_id = ?';
      let params = [];
      params.push(this.taskName);
      params.push(this.taskType);
      params.push(this.taskUrl);
      params.push(this.groupId);
      params.push(this.taskId);
      sqliteDB.updateData(sql,params,function (err, data) {
        if(err){
          thisObject.dailogMsg('保存任务失败！','warning');
          return;
        }
        thisObject.$alert('保存成功！','提示',{
          confirmButtonText:'确定',
          type:'success',
          callback: action => {
            thisObject.selectGroup(thisObject.group);
            thisObject.initTaskFromData();
          }
        })
      });

    },

    //增加分组
    createGroup: function (){
      var thisObject = this;
      var id = this.utils.createRandomIdExt();
      var createTime = Date.now();
      var sql = 'insert into crawler_task_group(group_id,group_name,create_time)' +
          'values(?,?,?)';
      var params = [];
      params.push(id);
      params.push(this.newGroupName);
      params.push(createTime);
      sqliteDB.insertData(sql, params, function (err) {
        if(err){
          console.log("保存分组失败:"+err);
          return;
        }

        thisObject.$alert('保存成功', '提示', {
          confirmButtonText: '确定',
          type: 'success',
          callback: action => {
            //window.location.href="taskList.html";
            thisObject.groupName = '';
            thisObject.dialogCreatGroup = false;
            thisObject.initGroup();
          }
        });
      });
    },

    //更新分组
    updateGroup: function (){
      var thisObject = this;
        this.$confirm('确认要修改任务组名？','提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type:'warning'
        }).then(() => {
          let id = this.groupId;
          let name = this.groupName;
          let time = Date.now();
          let sql = 'update crawler_task_group set group_name = ?,update_time = ? where group_id = ?';
          sqliteDB.updateData(sql,[name,time,id],function (err,data) {
            if(err){
              thisObject.dailogMsg('修改失败','warning');
              thisObject.dialogUpdateGroup = false;
              return;
            }
            thisObject.dailogMsg('修改成功','warning');
            thisObject.dialogUpdateGroup = false;
            thisObject.initGroup();
          })
        })
    },

    //删除某个任务
    deleteOne: function (taskId){
      var thisObject = this;
      this.$confirm('此操作将永久删除任务，是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var sql="delete from crawler_task where task_id = '"+taskId+"'";
        sqliteDB.execSql(sql, function (err) {
          if(err){
            thisObject.dailogMsg('删除任务失败！','error');
            return;
          }
          thisObject.dailogMsg('删除任务成功！','success');
          thisObject.selectGroup(thisObject.group);

        })
      });

    },

    //删除多个任务
    deleteTask: function(taskIdList){
      let thisObject = this;
      taskIdList.forEach((taskId,index) => {
        let sql = "delete from crawler_task where task_id = '"+taskId+"'";
        sqliteDB.execSql(sql,function (err) {
          if(err){
            thisObject.dailogMsg('删除失败！','error');
          }
        });
      })
      this.dailogMsg('删除成功！','success');
      this.selectGroup(this.group);
    },

    //删除分组
    deleteGroup: function (group){
      var thisObject = this;
      var taskNum = 0;
      this.$confirm('确定要删除任务分组吗','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let id = group.group_id;
        let sql = 'select count(*) as count from crawler_task where task_group_id = ?';
        sqliteDB.getOne(sql,id,function (err,data){
          if(data.count > 0){
            thisObject.dailogMsg('该分组下存在任务，不能删除！','warning')
            return;
          }
          sql = "delete from crawler_task_group where group_id = '"+id+"'";
          sqliteDB.execSql(sql, function (err) {
            if(err){
              thisObject.dailogMsg('分组删除失败','error');
              return;
            }
            thisObject.dailogMsg('分组删除成功','success');
            thisObject.initGroup();
          })
        })


      });
    },

    //提示框
    dailogMsg: function (msg,type){
      this.$alert(msg,'提示',{
        confirmButtonText: '确定',
        type: type,
        callback: action => {}
      });
    },

    // 获取row的key值
    getRowKeys(row) {
      return row.id;
    },

    //选中行
    selectGroupChange:function (val) {
      this.multipleSelection = val;
      //console.log(val);
    },

    //批量删除任务
    deleteBatch: function () {
      let taskIdList = [];
      let thisObject = this;
      //获取选中任务的id
      this.multipleSelection.forEach((task,index) => {
        taskIdList.push(task.task_id);
      })

      if(taskIdList.length == 0){
        this.dailogMsg('请先选择要删除的任务！','warning');
        return;
      }

      this.$confirm('此操作将永久删除选择的任务， 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        thisObject.deleteTask(taskIdList);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    //模拟启动任务
    startTask: function (task) {
      let thisObject = this;
      let taskId = task.task_id;
      let sql = 'update crawler_task set task_state = 2 where task_id = ?';
      sqliteDB.updateData(sql,taskId,function(err,data){
        if(err){
          thisObject.dailogMsg('启动任务失败！','error');
          return ;
        }
        thisObject.dailogMsg('启动任务成功！','success');
        thisObject.selectGroup(thisObject.group);
      })
    },

    //模拟停止任务
    stopTask: function (task) {
      let thisObject = this;
      let taskId = task.task_id;
      let sql = 'update crawler_task set task_state = 3 where task_id = ?';
      sqliteDB.updateData(sql, taskId, function (err) {
        if(err){
          thisObject.dailogMsg('停止任务失败！','error');
          return ;
        }
        thisObject.dailogMsg('停止任务成功！','success');
        thisObject.selectGroup(thisObject.group);
      });
    },

    //清空表单中的数据
    initTaskFromData: function () {
      this.taskName = '';
      this.taskType = 0;
      this.taskUrl = '';
      this.dialogCreatTask = false;
      this.dialogEditTask = false;
    },
    //清空表单中的数据
    initGroupFromData: function () {
      this.newGroupName = '';
      this.dialogUpdateGroup = false;
      this.dialogCreatGroup = false;
    }

  },
  mounted () {
    if(localStorage.getItem("group")){
      this.group = JSON.parse(localStorage.getItem("group"));
    }
    this.initGroup()
  }
}
</script>

<style scoped>
</style>

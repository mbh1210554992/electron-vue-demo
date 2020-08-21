var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var DB = DB || {};

DB.SqliteDB = function (file) {
  DB.db = new sqlite3.Database(file);
  DB.exist = fs.existsSync(file);
  if(!DB.exist){
    console.log("创建DB文件");
    fs.openSync(file,'w');
    initTable();
  }
}

function initTable() {
  DB.SqliteDB.prototype.createTable("drop table crawler_task");
  DB.SqliteDB.prototype.createTable("drop table crawler_task_group");
  DB.SqliteDB.prototype.createTable("create table crawler_task" +
    "(" +
    " task_id       TEXT  primary key," +
    " task_name     TEXT," +
    " task_group_id TEXT," +
    " task_state    NUMBER," +
    " create_time   TIMESTAMP," +
    " update_time   TIMESTAMP," +
    " task_type     NUMBER," +
    " run_state     NUMBER," +
    " task_url      TEXT" +
    ");");

  DB.SqliteDB.prototype.createTable('create table crawler_task_group' +
    '(' +
    ' group_id    TEXT primary key,' +
    ' group_name  TEXT,' +
    ' create_time TIMESTAMP,' +
    ' update_time TIMESTAMP,' +
    ' user_id     TEXT' +
    ');');
}

DB.SqliteDB.prototype.createTable = function (sql){
  DB.db.serialize(function () {
    DB.db.run(sql, function (err) {
      if(null != err){
        DB.printErrorInfo(err);
        return;
      }
    })
  })
}

DB.SqliteDB.prototype.insertData = function (sql, object, callback){
  DB.db.serialize(function () {
    var stmt = DB.db.prepare(sql);
    stmt.run(object,callback);
    stmt.finalize();
  });
}

DB.SqliteDB.prototype.updateData = function (sql, object, callback){
  DB.db.serialize(function () {
    var stmt = DB.db.prepare(sql);
    stmt.run(object,callback);
    stmt.finalize();
  });
}

DB.SqliteDB.prototype.queryData = function(sql, object, callback){
  DB.db.all(sql, object, function (err, rows){
    if(null != err){
      DB.printErrorInfo(err);
      return;
    }
    if(callback){
      callback(err, rows);
    }
  });
}

DB.SqliteDB.prototype.getOne = function (sql, object, callback){
  DB.db.get(sql, object, function (err, row) {
    if(null != err ){
      Db.printErrorInfo(err);
    }
    if(callback){
      callback(err, row);
    }
  });
}

DB.SqliteDB.prototype.execSql = function(sql, callback){
  DB.db.exec(sql, function (err) {
    if(null != err){
      DB.printErrorInfo(err);
    }

    if(callback){
      callback(err);
    }

  })
}

DB.SqliteDB.prototype.executeSql = function(sql){
  DB.db.run(sql, function (err) {
    if(null != err){
      DB.printErrorInfo(err);
    }
  })
}

DB.SqliteDB.prototype.close = function(){
  Db.db.close();
}

DB.printErrorInfo = function (err) {
  console.log("Error Message: "+err.message+"ErrorNumber: "+ err);
}

exports.SqliteDB = DB.SqliteDB;



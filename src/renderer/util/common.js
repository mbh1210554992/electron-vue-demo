export default {
  //判断为空
  isEmpty: function(v) {
    switch (typeof v) {
      case 'undefined':
        return true;
      case 'string':
        if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
        break;
      case 'boolean':
        if (!v) return true;
        break;
      case 'number':
        if (0 === v || isNaN(v)) return true;
        break;
      case 'object':
        if (null === v || v.length === 0) return true;
        for (var i in v) {
          return false;
        }
        return true;
    }
    return false;
  },

  // 创建ID
  createRandomIdExt:function() {
    return (Math.random()*10000000).toString(16).substr(0,4)+'-'+(new Date()).getTime()+'-'+Math.random().toString().substr(2,5);
  },
  //去缓存中拿到对应的task
  queryTask: function (taskId) {
    let taskList = localStorage.getItem("taskList")
    taskList = JSON.parse(taskList);
    if(this.isEmpty(taskList)){
      return null;
    }
    for(let i in taskList){
      if(taskList[i].task_id == taskId){
        return taskList[i];
      }
    }
    return null;
  }

}

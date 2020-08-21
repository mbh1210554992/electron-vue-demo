<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import taskDetail from './components/taskDetail'
import index from './components/index'
import list from './components/list'
  export default {
    name: 'demo',
    components: {taskDetail,index,list}
  }
</script>

<style>
  /* CSS */
</style>

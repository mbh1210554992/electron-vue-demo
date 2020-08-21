<template>
  <webview id="webview" allowpopups  style="height: 100%" v-bind:src="url" nodeintegration disablewebsecurity></webview>
</template>

<script>
export default {
  name: "taskDetail",
  components:{},
  data() {
    return {
      url: ""//webview跳转的页面
    }
  },

  methods: {
    initWebView: function () {
      const query = this.$route.query
      let task = this.utils.queryTask(query.taskId);
      this.url = task.task_url;
    }
  },

  mounted () {
    this.initWebView();
  }
}
</script>


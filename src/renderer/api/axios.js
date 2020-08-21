import axios from 'axios'
import querystring from 'querystring';
import {baseUrl} from './config.js'

const http = axios.create({
  baseURL:baseUrl, //服务器地址
  timeout: 30000,
  withCredentials: true
})

// 拦截器
http.interceptors.request.use(config => {
  if(
    config.method === 'post' ||
    config.method === 'put' ||
    config.method === 'delete' ||
    config.method === 'patch'
  ){
    console.log("使用前config的值为："+JSON.stringify(config));
    config.data = querystring.stringify(config.data)
    console.log("使用后config的值为："+JSON.stringify(config));
  }
  return config
}, error => {
  return Promise.reject(error);
})

http.interceptors.response.use(response => {
  return response;
}, error => {
  return Promise.reject(error)
})

export default  http;

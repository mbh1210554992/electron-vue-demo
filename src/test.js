let pro = new Promise(resolve => {
  setTimeout(() => {
    resolve('hello world')
  }, 2000)
})
setTimeout(() => {
  pro.then(value => {
    console.log(value) // hello world
  })
}, 2000)

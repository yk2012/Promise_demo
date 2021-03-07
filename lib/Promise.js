/**
 * 自定义Promise函数模块：IIFE
 */
(function (window) {
  const PENDING = 'pending'
  const RESOLVED = 'fulfilled'
  const REJECTED = 'rejected'

  /**
   * Promise构造函数
   * @param {*} executor 执行器函数（同步执行）(resolve, reject) => {}
   */
  function Promise(executor) {

    const self = this; // 保存当前实例对象的this的值
    // 添加属性
    self.PromiseState = PENDING // 给promise对象指定status属性，初始值为pending
    self.PromiseResult = null // 给promise对象指定一个用于存储结果数据的属性
    self.callbacks = [] // 每个元素的结构：{onResolved() {}, onRejected() {}}

    /**
     * executor内部定义成功时调用的函数
     * @param {*} value 成功的值
     * @returns 
     */
    function resolve(value) {
      // 如果当前状态不是pending，直接结束
      if (self.PromiseState !== PENDING) {
        return
      }
      // 1. 修改对象的状态（promiseState）为 fulfilled
      self.PromiseState = RESOLVED 
      // 2. 设置对象结果值（promiseResult）为 value
      self.PromiseResult = value
      // 如果有待执行的callback函数，立即【异步】执行回调函数onResolved（交到消息队列）
      if (self.callbacks.length > 0) {
        setTimeout(() => { // 放入队列中执行所有成功的回调
          self.callbacks.forEach(callbacksObj => {
            callbacksObj.onResolved(value)
          })
        }, 0)
      }
    }
    
    /**
     * executor内部定义失败时调用的函数
     * @param {*} reason 失败的原因
     * @returns 
     */
    function reject(reason) {
      // 如果当前状态不是pending，直接结束
      if (self.PromiseState !== PENDING) {
        return
      }
      // 1. 修改对象的状态（promiseState）为 rejected
      self.PromiseState = REJECTED
      // 2. 设置对象结果值（promiseResult）为 reason
      self.PromiseResult = reason
      // 如果有待执行的callback函数，立即【异步】执行回调函数onRejected（交到消息队列）
      if (self.callbacks.length > 0) {
        setTimeout(() => { // 放入队列中执行所有失败的回调
          self.callbacks.forEach(callbacksObj => {
            callbacksObj.onRejected(reason)
          })
        }, 0)
      }
    }
    
    // 立即【同步】执行executor函数
    try {
      executor(resolve, reject)
    } catch(error) { // 如果执行器抛出异常，promise对象变成rejected状态
      reject(error)
    }
  }


  /**
   * Promise原型对象then方法 
   * 指定成功和失败的回调函数
   * @param {*} onResolved 成功的回调函数(value) => {}
   * @param {*} onRejected 失败的回调函数(reason) => {}
   * @returns 一个新的promise对象
   */
  Promise.prototype.then = function (onResolved, onRejected) {
    // 指定默认的成功的回调onResolved （向后传递成功的value）
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    // 指定默认的失败的回调onRejected（向后传递失败的reason 实现错误/异常传透的关键点）
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}

    const self = this

    return new Promise((resolve, reject) => {
      /**
       * 调用指定回调函数处理，根据执行的结果改变return的promise的状态
       * @param {*} callback 指定回调函数
       */
      function handle(callback) {
        try {
          const result = callback(self.PromiseResult) // 执行成功的回调 result接收返回值
          if (result instanceof Promise) { // 3. 如果回调函数返回的是promise
            result.then(resolve, reject) // 简洁写法
          } else { // 2. 如果回调函数返回的不是promise
            resolve(result)
          }
        } catch (error) { //1. 如果抛出异常
          reject(error)
        }
      }

      if (self.PromiseState === PENDING) { // 1. 当前状态是pending状态，将回调函数保存起来
        self.callbacks.push({
          onResolved(value) { //执行函数，改promise的状态
            handle(onResolved)
           },
          onRejected(reason) {
            handle(onRejected)
           }
        })
      } else if (self.PromiseState === RESOLVED) { // 2. resolved，异步执行onResolved并改变return的promise的状态
        setTimeout(() => {
          handle(onResolved)
        }, 0)
      } else { // 3. rejected，异步执行onRejected并改变return的promise的状态
        setTimeout(() => {
          handle(onRejected)
        }, 0)
      }
    })
  }


  /**
   * Promise原型对象catch方法
   * 指定失败的回调函数
   * @param {*} onRejected 失败的回调函数(reason) => {}
   * @returns 一个新的promise对象
   */
  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
  }

  /**
   * Promise函数对象resolve方法
   * 返回 一个指定结果的成功的promise
   */
  Promise.resolve = function (value) {

  }

  /**
   * Promise函数对象reject方法
   * 返回 一个指定resaon的失败的promise
   */
  Promise.reject = function (resaon) {

  }

  /**
   * Promise函数对象all方法
   * 返回 一个promise，只有当所有promise都成功时才成功，否则只要有一个失败就失败
   */
  Promise.all = function (promises) {

  }

  /**
   * Promise函数对象race方法
   * 返回 一个promise，其结果由第一个完成的promise决定
   */
  Promise.race = function (promises) {

  }


  // 向外暴露Promise函数
  window.Promise = Promise
})(window)
 

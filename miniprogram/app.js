// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    this.checkLogin();
  },
  
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    } else {
      // 未登录跳转逻辑通常在页面 onLoad 处理，这里只初始化状态
    }
  },

  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://127.0.0.1:5000/api' // 本地后端服务地址
  }
})


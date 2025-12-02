const app = getApp()
const { post } = require('../../utils/request');

Page({
  data: {
    isRegister: false,
    username: '',
    password: '',
    role: 'operator',
    loading: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  
  onRoleChange(e) {
    this.setData({ role: e.detail.value });
  },

  toggleMode() {
    this.setData({
      isRegister: !this.data.isRegister,
      username: '',
      password: ''
    });
  },

  async handleLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await post('/auth/login', { username, password });
      
      // 检查后端返回格式，通常 request.js 会处理 200-300 以外的状态码并 reject
      // 如果成功 resolve，说明是成功响应
      
      // 假设后端直接返回 { token, userInfo } 或 { message }
      // 如果 request.js 直接返回 res.data，则需要根据实际结构调整
      // 这里的 request.js 实现是 resolve(res.data)
      
      if (res.token) {
        wx.setStorageSync('token', res.token);
        wx.setStorageSync('userInfo', res.userInfo);
        app.globalData.token = res.token;
        app.globalData.userInfo = res.userInfo;

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/map/map'
          });
        }, 1500);
      } else {
         wx.showToast({
          title: '登录失败，无Token',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error(error);
      // request.js 已经会弹出 toast 提示错误信息，这里只需处理 loading
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleRegister() {
    const { username, password, role } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      await post('/auth/register', { username, password, role });
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });

      // 注册成功后切换回登录
      setTimeout(() => {
        this.toggleMode();
        // 自动填充刚刚注册的账号
        this.setData({ username: username });
      }, 1500);

    } catch (error) {
      console.error(error);
    } finally {
      this.setData({ loading: false });
    }
  },

  handleForgotPassword() {
    wx.showToast({
      title: '请联系管理员重置密码',
      icon: 'none'
    });
  }
})

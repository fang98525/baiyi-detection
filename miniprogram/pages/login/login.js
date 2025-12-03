const app = getApp()
const { post } = require('../../utils/request');

Page({
  data: {
    isRegister: false,
    username: '',
    password: '',
    role: 'operator',
    remarkName: '',
    phone: '',
    loading: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onRemarkNameInput(e) {
    this.setData({ remarkName: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  
  onRoleChange(e) {
    this.setData({ role: e.detail.value });
  },

  toggleMode() {
    this.setData({
      isRegister: !this.data.isRegister,
      username: '',
      password: '',
      phone: '',
      remarkName: ''
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
    const { username, password, role, remarkName, phone } = this.data;
    if (!username || !password || !remarkName || !phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 真正提交注册
      await post('/auth/register', { username, password, role, remarkName, phone });
      
      // 提交成功后弹窗提示
      wx.showModal({
        title: '提交成功',
        content: '您的注册申请已提交。请联系管理员 zqfang5 (18271587343) 审核并添加账户后即可登录。',
        showCancel: false,
        confirmText: '知道了',
        success: (res) => {
          if (res.confirm) {
            this.toggleMode();
            // 清空表单（可选：保留用户名方便登录）
            this.setData({
              password: '',
              remarkName: ''
            });
          }
        }
      });

    } catch (error) {
      console.error(error);
      // post 方法通常已经处理了错误提示，如果需要在页面特定处理可以在这里加
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

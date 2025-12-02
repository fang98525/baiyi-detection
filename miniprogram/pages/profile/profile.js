const app = getApp();
const request = require('../../utils/request.js');

Page({
  data: {
    userInfo: {},
    showPasswordModal: false,
    showAboutModal: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    // Map role code to text
    const roleMap = {
      'admin': '超级管理员',
      'manager': '项目负责人',
      'operator': '运维人员'
    };
    userInfo.roleText = roleMap[userInfo.role] || userInfo.role;
    
    this.setData({ userInfo });
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          app.globalData.token = null;
          app.globalData.userInfo = null;
          
          wx.reLaunch({
            url: '/pages/login/login',
          });
        }
      }
    });
  },

  // 密码修改相关方法
  showPasswordModal() {
    this.setData({
      showPasswordModal: true,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  },

  hidePasswordModal() {
    this.setData({ showPasswordModal: false });
  },

  inputOldPwd(e) {
    this.setData({ oldPassword: e.detail.value });
  },

  inputNewPwd(e) {
    this.setData({ newPassword: e.detail.value });
  },

  inputConfirmPwd(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  submitPasswordChange() {
    const { oldPassword, newPassword, confirmPassword, userInfo } = this.data;

    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次新密码不一致', icon: 'none' });
      return;
    }

    if (newPassword.length < 6) {
        wx.showToast({ title: '新密码至少6位', icon: 'none' });
        return;
    }

    request.post('/auth/change-password', {
      username: userInfo.username, // 假设 userInfo 中有 username
      oldPassword,
      newPassword
    }).then(res => {
      wx.showToast({ title: '密码修改成功', icon: 'success' });
      this.hidePasswordModal();
    }).catch(err => {
        console.error(err);
        // 错误提示交由 request.js 统一处理
    });
  },

  // 关于我们相关方法
  showAboutModal() {
    this.setData({ showAboutModal: true });
  },

  hideAboutModal() {
    this.setData({ showAboutModal: false });
  },
  
  stopProp() {
    // 阻止冒泡
    //点击此处不关闭弹窗”的占位符。
  }
})

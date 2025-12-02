const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    // 获取最新的 baseUrl (防止 app 未初始化完成)
    const baseUrl = getApp().globalData.baseUrl;
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${baseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token expired or invalid
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/login/login',
          });
          reject(res);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

const get = (url, data) => request(url, 'GET', data);
const post = (url, data) => request(url, 'POST', data);
const put = (url, data) => request(url, 'PUT', data);
const del = (url, data) => request(url, 'DELETE', data);

module.exports = {
  get,
  post,
  put,
  del
};


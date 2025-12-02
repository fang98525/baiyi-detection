const { formatTime } = require('../../utils/util');

Page({
  data: {
    currentTab: 0,
    alerts: [],
    loading: false
  },

  onLoad() {
    this.fetchAlerts();
  },

  onPullDownRefresh() {
    this.fetchAlerts(() => {
      wx.stopPullDownRefresh();
    });
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ currentTab: index });
    this.fetchAlerts();
  },

  fetchAlerts(cb) {
    this.setData({ loading: true });
    // Mock Data
    setTimeout(() => {
      const statusFilter = this.data.currentTab; // 0: pending, 1: handling, 2: history (done)
      
      const mockAlerts = [];
      // Generate some mock data
      for (let i = 0; i < 5; i++) {
        mockAlerts.push({
          id: i + (statusFilter * 10),
          time: formatTime(new Date()),
          sn: `DEV-${2000 + i}`,
          project: '东湖水库监测项目',
          type: '白蚁活动警报',
          level: 'high',
          levelText: '严重',
          status: statusFilter === 0 ? 'pending' : (statusFilter === 1 ? 'handling' : 'done'),
          statusText: statusFilter === 0 ? '待处理' : (statusFilter === 1 ? '处理中' : '已归档')
        });
      }

      this.setData({ 
        alerts: mockAlerts,
        loading: false 
      });
      if (cb) cb();
    }, 500);
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/alert-detail/alert-detail?id=${id}`,
    });
  }
})


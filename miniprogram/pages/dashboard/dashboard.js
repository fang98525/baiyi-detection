Page({
  data: {
    stats: {
      totalDevices: 0,
      onlineDevices: 0,
      todayAlerts: 0,
      pendingAlerts: 0
    },
    trendData: [],
    lowBatteryDevices: []
  },

  onLoad() {
    this.fetchData();
  },

  onPullDownRefresh() {
    this.fetchData(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchData(cb) {
    // Mock Data Loading
    setTimeout(() => {
      this.setData({
        stats: {
          totalDevices: 128,
          onlineDevices: 120,
          todayAlerts: 3,
          pendingAlerts: 5
        },
        trendData: [
          { day: '周一', count: 2 },
          { day: '周二', count: 5 },
          { day: '周三', count: 1 },
          { day: '周四', count: 0 },
          { day: '周五', count: 8 },
          { day: '周六', count: 3 },
          { day: '周日', count: 4 }
        ],
        lowBatteryDevices: [
          { id: 1, sn: 'DEV-1005', project: '东湖水库', battery: 12 },
          { id: 2, sn: 'DEV-1042', project: '汤逊湖', battery: 8 },
          { id: 3, sn: 'DEV-1088', project: '东湖水库', battery: 15 }
        ]
      });
      if (cb) cb();
    }, 500);
  }
})


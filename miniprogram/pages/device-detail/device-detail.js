Page({
  data: {
    id: null,
    device: {},
    markers: [],
    logs: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.fetchDetail(options.id);
    }
  },

  fetchDetail(id) {
    // Mock Data
    const device = {
      id: id,
      sn: `DEV-${id}`,
      status: 'normal',
      statusText: '运行正常',
      lastUpdate: '2023/10/27 15:30:00',
      battery: 92,
      signal: -65,
      latitude: 30.55,
      longitude: 114.36,
      address: '武汉市洪山区东湖风景区'
    };

    const logs = [
      { id: 1, time: '15:30:00', content: '心跳上报: 正常' },
      { id: 2, time: '14:30:00', content: '心跳上报: 正常' },
      { id: 3, time: '13:30:00', content: '心跳上报: 正常' }
    ];

    this.setData({
      device,
      logs,
      markers: [{
        id: 1,
        latitude: device.latitude,
        longitude: device.longitude,
        width: 30,
        height: 30,
        iconPath: '/images/markers/normal.png'
      }]
    });
  },

  openLocation() {
    const { latitude, longitude, address } = this.data.device;
    wx.openLocation({
      latitude,
      longitude,
      address
    });
  }
})


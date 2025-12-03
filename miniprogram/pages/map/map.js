const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    latitude: 30.5728, // Default (Wuhan)
    longitude: 114.292,
    scale: 14,
    markers: [],
    projects: [],
    currentProject: null,
    currentProjectIndex: 0,
    showFilter: false,
    filterStatus: 'all',
    selectedDevice: null,
    allDevices: [] // Cache all devices for filtering
  },

  onLoad() {
    this.fetchProjects();
    this.mapCtx = wx.createMapContext('mainMap');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  async fetchProjects() {
    try {
      wx.showLoading({ title: '加载项目...' });
      
      const userInfo = wx.getStorageSync('userInfo') || {};
      const userId = userInfo.id;
      const role = userInfo.role;

      // 并行获取水库和堤防，传递 userId 和 role
      const [reservoirs, embankments] = await Promise.all([
        get(`/projects?type=reservoir&userId=${userId}&role=${role}`).catch(() => []),
        get(`/projects?type=embankment&userId=${userId}&role=${role}`).catch(() => [])
      ]);
      
      let projects = [...reservoirs, ...embankments];

      if (projects.length === 0) {
        wx.hideLoading();
        // 若无项目，清空地图数据
        this.setData({
             projects: [],
             currentProject: null,
             markers: [],
             allDevices: [],
             selectedDevice: null
        });
        wx.showToast({ title: '暂无相关项目', icon: 'none' });
        return;
      }

      // 格式化数据以适配地图
      projects = projects.map(p => ({
        ...p,
        lat: Number(p.latitude) || 30.5728,
        lng: Number(p.longitude) || 114.292
      }));
      
      this.setData({ 
        projects,
        currentProject: projects[0],
        currentProjectIndex: 0,
        latitude: projects[0].lat,
        longitude: projects[0].lng
      });
      
      this.fetchDevices(projects[0].id);
      wx.hideLoading();
    } catch (err) {
      console.error(err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onProjectChange(e) {
    const index = e.detail.value;
    const project = this.data.projects[index];
    this.setData({
      currentProject: project,
      currentProjectIndex: index,
      latitude: project.lat,
      longitude: project.lng,
      selectedDevice: null
    });
    this.fetchDevices(project.id);
  },

  async fetchDevices(projectId) {
    // Fetch devices from backend for the selected project
    // For now we still use mock data structure but logically we should call API if available
    // To keep consistent with the requested optimization, let's improve the data structure
    // and prepare for real API integration.
    
    // const devices = await get(`/projects/${projectId}/devices`); // Future implementation
    
    // Improved Mock Data that matches 'devices' table structure more closely
    const mockDevices = [];
    const baseLat = this.data.currentProject.lat;
    const baseLng = this.data.currentProject.lng;

    // Deterministic seed based on projectId to keep markers consistent during switch
    const seed = projectId * 100; 

    for (let i = 0; i < 20; i++) {
      const randomVal = Math.sin(seed + i); // pseudo-random
      const isAlert = randomVal > 0.8;
      const isOffline = !isAlert && randomVal < -0.8;
      const status = isAlert ? 'alert' : (isOffline ? 'offline' : 'normal');
      
      mockDevices.push({
        id: seed + i,
        sn: `DEV-${1000 + i}`,
        latitude: baseLat + (randomVal * 0.01), // Spread out
        longitude: baseLng + (Math.cos(seed + i) * 0.01),
        status: status,
        battery: Math.floor(Math.abs(randomVal * 100)) % 100,
        signal: -60 - Math.floor(Math.abs(randomVal * 30)),
        lastUpdate: '10分钟前'
      });
    }

    this.setData({ allDevices: mockDevices });
    this.updateMarkers();
  },

  updateMarkers() {
    const { allDevices, filterStatus } = this.data;
    const filtered = filterStatus === 'all' 
      ? allDevices 
      : allDevices.filter(d => d.status === filterStatus);

    const markers = filtered.map(d => {
      let iconPath = '/images/markers/normal.png'; // fallback
      let color = '#07C160';
      
      if (d.status === 'alert') {
        color = '#FA5151';
        // iconPath = '/images/markers/alert.png';
      } else if (d.status === 'offline') {
        color = '#B2B2B2';
        // iconPath = '/images/markers/offline.png';
      }

      return {
        id: d.id,
        latitude: d.latitude,
        longitude: d.longitude,
        // iconPath: iconPath, // Real app needs real images
        width: 30,
        height: 30,
        callout: {
          content: d.status === 'alert' ? '⚠️' : '',
          display: d.status === 'alert' ? 'ALWAYS' : 'BYCLICK',
          color: '#fff',
          bgColor: color,
          padding: 4,
          borderRadius: 4
        },
        // Using joinCluster for clustering if needed, but requires init
      };
    });

    this.setData({ markers });
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  onFilterSelect(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 
      filterStatus: status,
      showFilter: false,
      selectedDevice: null
    });
    this.updateMarkers();
  },

  onMarkerTap(e) {
    const deviceId = e.markerId;
    const device = this.data.allDevices.find(d => d.id === deviceId);
    
    const statusMap = {
      'normal': '正常',
      'alert': '警报',
      'offline': '离线',
      'warning': '异常'
    };

    this.setData({
      selectedDevice: {
        ...device,
        statusText: statusMap[device.status] || '未知'
      }
    });
  },

  closeDeviceCard() {
    this.setData({ selectedDevice: null });
  },

  navigateToDevice() {
    const { latitude, longitude, sn } = this.data.selectedDevice;
    wx.openLocation({
      latitude,
      longitude,
      name: `设备 ${sn}`,
      scale: 18
    });
  },

  viewDeviceDetail() {
    wx.navigateTo({
      url: `/pages/device-detail/device-detail?id=${this.data.selectedDevice.id}`,
    });
  }
});


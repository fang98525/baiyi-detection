const { formatTime } = require('../../utils/util');

Page({
  data: {
    id: null,
    statusStep: 0,
    alert: {},
    resultOptions: [
      { name: '已更换诱饵', value: 'replaced' },
      { name: '误报', value: 'false_alarm' },
      { name: '环境干扰', value: 'interference' },
      { name: '其他', value: 'other' }
    ],
    formData: {
      result: '',
      remark: ''
    },
    images: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.fetchDetail(options.id);
    }
  },

  fetchDetail(id) {
    // Mock Data - 模拟获取后端详情
    // 实际开发中应调用 await get(`/alerts/${id}`)
    
    const mockData = {
      id: id,
      sn: 'DEV-2002',
      project: '东湖水库监测项目',
      time: '2023/10/27 14:30:00',
      battery: 85,
      signal: -72,
      status: 'pending', // pending, handling, done
      // 记录处理流程
      timeline: [
        { status: 'pending', time: '2023/10/27 14:30:00', desc: '设备触发警报' }
      ]
    };

    // Simulate state based on ID or random
    if (id % 3 === 1) {
      mockData.status = 'handling';
      mockData.handler = '张三'; // 锁定人
      mockData.timeline.push({ status: 'handling', time: '2023/10/27 14:45:00', desc: '张三 开始处理', operator: '张三' });
    } else if (id % 3 === 2) {
      mockData.status = 'done';
      mockData.handler = '张三';
      mockData.finishTime = '2023/10/27 15:00:00';
      mockData.resultText = '已更换诱饵';
      mockData.remark = '现场发现大量白蚁，已处理。';
      mockData.images = ['/images/logo.png']; // placeholder
      mockData.timeline.push({ status: 'handling', time: '2023/10/27 14:45:00', desc: '张三 开始处理', operator: '张三' });
      mockData.timeline.push({ status: 'done', time: '2023/10/27 15:00:00', desc: '张三 完成处理', operator: '张三' });
    }

    this.updateStatusStep(mockData.status);
    this.setData({ alert: mockData });
  },

  updateStatusStep(status) {
    let step = 0;
    if (status === 'handling') step = 1;
    if (status === 'done') step = 2;
    this.setData({ statusStep: step });
  },

  startHandling() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    wx.showModal({
      title: '确认开始处理',
      content: `确定由 ${userInfo.username || '您'} 锁定此警报并开始处理吗？`,
      success: (res) => {
        if (res.confirm) {
          // Mock API Call to lock alert
          const newTimeline = [...this.data.alert.timeline, {
            status: 'handling',
            time: new Date().toLocaleString(), // use util.formatTime in real app
            desc: `${userInfo.username} 开始处理`,
            operator: userInfo.username
          }];

          const newAlert = { 
            ...this.data.alert, 
            status: 'handling',
            handler: userInfo.username,
            timeline: newTimeline
          };
          
          this.setData({ alert: newAlert });
          this.updateStatusStep('handling');
        }
      }
    });
  },

  onResultChange(e) {
    this.setData({ 'formData.result': e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ 'formData.remark': e.detail.value });
  },

  chooseImage() {
    wx.chooseImage({
      count: 3,
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        });
      }
    });
  },

  submitResult() {
    const { formData, images } = this.data;
    const userInfo = wx.getStorageSync('userInfo') || {};

    if (!formData.result) {
      wx.showToast({ title: '请选择处理方式', icon: 'none' });
      return;
    }
    if (images.length === 0) {
      wx.showToast({ title: '请上传现场照片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中' });
    
    // Mock Submit
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '处理完成', icon: 'success' });
      
      const currentTime = new Date().toLocaleString();
      const newTimeline = [...this.data.alert.timeline, {
        status: 'done',
        time: currentTime,
        desc: `${userInfo.username} 完成处理`,
        operator: userInfo.username
      }];

      const newAlert = {
        ...this.data.alert,
        status: 'done',
        handler: userInfo.username, // current user
        finishTime: currentTime,
        resultText: this.data.resultOptions.find(o => o.value === formData.result).name,
        remark: formData.remark,
        images: images,
        timeline: newTimeline
      };
      
      this.setData({ alert: newAlert });
      this.updateStatusStep('done');
    }, 1000);
  }
})


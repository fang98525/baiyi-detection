// miniprogram/pages/projects/projects.js
const { get } = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 'reservoir', // reservoir | embankment
    currentList: [],
    hasEmptyImg: false, // 检查是否有空状态图片
    showModal: false,
    currentProject: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadProjects();
  },
  
  onShow() {
    this.loadProjects();
  },

  /**
   * 加载项目数据
   */
  loadProjects() {
    wx.showLoading({ title: '加载中...' });
    get(`/projects?type=${this.data.currentTab}`)
      .then(res => {
        this.setData({
          currentList: res
        });
        wx.hideLoading();
      })
      .catch(err => {
        console.error(err);
        wx.hideLoading();
        // 如果失败，清空列表
        this.setData({ currentList: [] });
      });
  },

  /**
   * 切换 Tab
   */
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.currentTab) return;
    
    this.setData({
      currentTab: type,
      currentList: [] // 清空列表，展示加载状态或空
    }, () => {
      this.loadProjects();
    });
  },

  /**
   * 跳转新增页面
   */
  onAddProject() {
    wx.navigateTo({
      url: '/pages/project-add/project-add',
    });
  },

  /**
   * 查看档案（包含详情）
   */
  onViewArchives(e) {
    const id = e.currentTarget.dataset.id;
    const project = this.data.currentList.find(item => item.id === id);
    
    if (project) {
      // 模拟档案数据，实际应从后端获取详情
      // 如果后端列表接口没有返回这些字段，这里做一个简单的 fallback 或 mock
      const detailProject = {
        ...project,
        buildDate: project.buildDate || '2020-05-12',
        manager: project.managerName || project.manager || '李四',
        phone: project.phone || '13900139000',
        basin: project.basin || '珠江流域',
        functionType: project.functionType || (this.data.currentTab === 'reservoir' ? '蓄水/灌溉' : '防洪'),
        description: project.description || `该${this.data.currentTab === 'reservoir' ? '水库' : '堤防'}位于${project.region || '本地'}，名称为${project.name}，主要负责${this.data.currentTab === 'reservoir' ? '蓄水与防洪' : '河道防洪'}。坝型为${project.damType || '未知'}，最大坝高${project.maxHeight || 0}米。`
      };

      this.setData({
        currentProject: detailProject,
        showModal: true
      });
    }
  },

  /**
   * 查看详情（复用档案弹窗）
   */
  onViewDetail(e) {
    this.onViewArchives(e);
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    this.setData({
      showModal: false
    });
  },

  /**
   * 防止冒泡
   */
  preventBubble() {
    // do nothing
  },

  /**
   * 导航
   */
  onNavigate(e) {
    const item = e.currentTarget.dataset.item;
    if (item.latitude && item.longitude) {
      wx.openLocation({
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        name: item.name,
        address: item.address
      });
    } else {
      wx.showToast({
        title: '无位置信息',
        icon: 'none'
      });
    }
  },

  /**
   * 修改项目
   */
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/project-add/project-add?id=${id}`,
    });
  },

  /**
   * 从弹窗点击修改
   */
  onEditFromModal() {
    const id = this.data.currentProject.id;
    this.closeModal();
    wx.navigateTo({
      url: `/pages/project-add/project-add?id=${id}`,
    });
  }
})

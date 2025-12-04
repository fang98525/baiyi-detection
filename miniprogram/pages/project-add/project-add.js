const { get, post, put } = require('../../utils/request.js');

Page({
  data: {
    formData: {
      category: 'single',
    },
    projectType: 'reservoir', // reservoir | embankment
    reservoirTypes: ['小（一）型', '小（二）型', '中型', '大型'],
    embankmentTypes: ['1级', '2级', '3级', '4级', '5级', '未定级'],
    typeIndex: 1, // 默认 小（二）型
    
    region: ['浙江省', '杭州市', '余杭区'], // 默认值

    adminList: [], // [{id, name}]
    adminNames: [], // ['name1', 'name2']
    adminIndex: 0,

    managerList: [],
    managerNames: [],
    managerIndex: 0,

    damTypes: ['土坝', '混凝土坝', '堆石坝'],
    damTypeIndex: -1,

    address: '',
    latlng: '',
    
    hazardLevels: ['I级', 'II级', 'III级'],
    hazardIndex: -1,

    checkMethods: ['人工法', '引诱法', '仪器探测法'],
    governanceMethods: ['挖巢法', '诱杀法', '药杀法', '药物灌浆法'],
    
    monitorDevices: [
      { name: '白蚁智能监测装置', checked: true },
      { name: '白蚁监测诱杀箱', checked: false },
      { name: '智能成虫诱杀灯', checked: false },
      { name: '普通成虫诱杀灯', checked: false },
    ]
  },

  onLoad(options) {
    const usersPromise = this.fetchUsers();
    
    if (options.type) {
      this.setData({ projectType: options.type });
      wx.setNavigationBarTitle({ 
        title: options.type === 'reservoir' ? '新增水库' : '新增堤防' 
      });
    }

    if (options.id) {
      wx.setNavigationBarTitle({ title: '修改项目' });
      this.setData({ isEdit: true, projectId: options.id });
      
      // 等待用户列表加载完成后再加载详情，以便正确设置负责人索引
      usersPromise.then(() => {
        this.loadProjectDetail(options.id);
      });
    }
  },

  loadProjectDetail(id) {
    wx.showLoading({ title: '加载数据...' });
    get(`/projects/${id}`).then(res => {
      wx.hideLoading();
      // 填充数据
      const region = [];
      if (res.regionProvince) region.push(res.regionProvince);
      if (res.regionCity) region.push(res.regionCity);
      if (res.regionDistrict) region.push(res.regionDistrict);

      // 查找类型和索引
      let projectType = 'reservoir';
      let typeIndex = this.data.reservoirTypes.indexOf(res.type);
      
      // 如果在水库类型里找不到，尝试在堤防类型里找
      if (typeIndex === -1) {
        const embIndex = this.data.embankmentTypes.indexOf(res.type);
        if (embIndex > -1) {
          projectType = 'embankment';
          typeIndex = embIndex;
        }
      }

      const damTypeIndex = this.data.damTypes.indexOf(res.damType);
      const hazardIndex = this.data.hazardLevels.indexOf(res.hazardLevel);
      
      // 查找管理员和负责人索引
      const adminIndex = this.data.adminList.findIndex(u => u.id === res.admin_id || u.id === res.adminId); // 兼容后端返回字段格式
      const managerIndex = this.data.managerList.findIndex(u => u.id === res.manager_id || u.id === res.managerId);

      // 处理监测装置选中状态
      const selectedDevices = res.monitorDevices || [];
      const monitorDevices = this.data.monitorDevices.map(d => ({
        ...d,
        checked: selectedDevices.includes(d.name)
      }));
      
      this.setData({
        projectType,
        'formData.category': res.category || 'single',
        'formData.name': res.name,
        'formData.crestLength': res.crestLength,
        'formData.toeLength': res.toeLength,
        'formData.slopeLength': res.slopeLength,
        'formData.maxHeight': res.maxHeight,
        'formData.checkMethod': res.checkMethod,
        'formData.governanceMethod': res.governanceMethod,
        
        typeIndex: typeIndex > -1 ? typeIndex : 0,
        region: region,
        address: res.address,
        latlng: (res.latitude && res.longitude) ? `${res.longitude} / ${res.latitude}` : '',
        damTypeIndex: damTypeIndex,
        hazardIndex: hazardIndex,
        adminIndex: adminIndex > -1 ? adminIndex : 0,
        managerIndex: managerIndex > -1 ? managerIndex : 0,
        monitorDevices: monitorDevices
      });
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  fetchUsers() {
    const p1 = get('/projects/users?role=admin').then(res => {
      const names = res.map(u => u.name);
      this.setData({
        adminList: res,
        adminNames: names,
        adminIndex: names.length > 0 ? 0 : -1
      });
    }).catch(err => console.error('获取管理员失败', err));

    const p2 = get('/projects/users?role=manager').then(res => {
      const names = res.map(u => u.name);
      this.setData({
        managerList: res,
        managerNames: names,
        managerIndex: names.length > 0 ? 0 : -1
      });
    }).catch(err => console.error('获取负责人失败', err));

    return Promise.all([p1, p2]);
  },

  onCategoryChange(e) {
    this.setData({ 'formData.category': e.detail.value });
  },

  onTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  onRegionChange(e) {
    this.setData({ region: e.detail.value });
  },

  onAdminChange(e) {
    this.setData({ adminIndex: e.detail.value });
  },
  
  onManagerChange(e) {
    this.setData({ managerIndex: e.detail.value });
  },

  onDamTypeChange(e) {
    this.setData({ damTypeIndex: e.detail.value });
  },

  onHazardLevelChange(e) {
    this.setData({ hazardIndex: e.detail.value });
  },

  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  chooseLocation() {
    const that = this;
    
    // 解析当前已有的经纬度，作为打开地图时的中心点
    let latitude = null;
    let longitude = null;
    
    if (this.data.latlng) {
      const parts = this.data.latlng.split('/');
      if (parts.length === 2) {
        // 格式是 "经度 / 纬度" -> "longitude / latitude"
        longitude = parseFloat(parts[0].trim());
        latitude = parseFloat(parts[1].trim());
      }
    }

    wx.chooseLocation({
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      success(res) {
        const address = res.address; 
        const latlng = `${res.longitude} / ${res.latitude}`;
        
        const updates = {
          address,
          latlng
        };
        
        try {
          const reg = /^(.+?(?:省|自治区|北京市|天津市|上海市|重庆市))(.+?(?:市|自治州|地区|盟|区|县))(.+?(?:区|县|市|旗))/;
          const match = address.match(reg);
          
          if (match) {
            let [full, p, c, d] = match;
            if (['北京市', '天津市', '上海市', '重庆市'].includes(p)) {
               updates.region = [p, p, c];
            } else {
               updates.region = [p, c, d];
            }
          }
        } catch (e) {
          console.log('地址解析失败', e);
        }

        that.setData(updates);
      },
      fail(err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '定位失败', icon: 'none' });
        }
      }
    });
  },
  
  onReset() {
     this.setData({
        typeIndex: 1,
        address: '',
        latlng: '',
        damTypeIndex: -1,
        hazardIndex: -1,
        'formData.category': 'single'
     });
  },

  onSubmit(e) {
    const val = e.detail.value;
    if (!val.name) {
      wx.showToast({ title: `请输入${this.data.projectType === 'reservoir' ? '水库' : '堤防'}名称`, icon: 'none' });
      return;
    }

    // Get selected user IDs safely
    const adminUser = this.data.adminList[this.data.adminIndex];
    const managerUser = this.data.managerList[this.data.managerIndex];
    
    const adminId = adminUser ? adminUser.id : null;
    const managerId = managerUser ? managerUser.id : null;
    
    const typeList = this.data.projectType === 'reservoir' ? this.data.reservoirTypes : this.data.embankmentTypes;
    
    const submitData = {
      ...val,
      projectType: this.data.projectType,
      type: typeList[this.data.typeIndex],
      region: this.data.region,
      adminId: adminId,
      managerId: managerId,
      damType: this.data.damTypeIndex > -1 ? this.data.damTypes[this.data.damTypeIndex] : null,
      hazardLevel: this.data.hazardIndex > -1 ? this.data.hazardLevels[this.data.hazardIndex] : null
    };

    wx.showLoading({ title: '提交中...' });
    
    const requestPromise = this.data.isEdit 
      ? put(`/projects/${this.data.projectId}`, submitData)
      : post('/projects', submitData);

    requestPromise
      .then(res => {
        wx.hideLoading();
        wx.showToast({ title: this.data.isEdit ? '修改成功' : '提交成功' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(err => {
        wx.hideLoading();
        console.error(err);
        wx.showToast({ title: '提交失败', icon: 'none' });
      });
  }
})

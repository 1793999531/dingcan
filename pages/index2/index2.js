var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: "",
    src:""
  },
  onChangeAddress: function (e) {
    wx.navigateTo({
      url: "/pages/position/position"
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*判断是第一次加载还是从position页面返回
    如果从position页面返回，会传递用户选择的地点*/
    if (options.address != null && options.address != '') {
      //设置变量 address 的值
      this.setData({
        address: options.address
      });
    } else {
      // 实例化API核心类
      qqmapsdk = new QQMapWX({
        //此key需要用户自己申请
        key: 'UA5BZ-G3V6D-6HB4M-PW5M4-JBOEE-B7BI6'
      });
      var that = this;
      // 调用接口
      qqmapsdk.reverseGeocoder({
        success: function (res) {
          that.setData({
            address: res.result.address
          });
        },
        fail: function (res) {
          //console.log(res);
        },
        complete: function (res) {
          //console.log(res);
        }
      });
    }
  }
})
//index.js
//获取应用实例
const app = getApp()
var common = require("../../libs/api.js")
import regeneratorRuntime from '../../utils/runtime.js'
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    usersUrl: 'https://www.lpllfd.cn/dingcan?coll=wxDB&doc=users',
    modifyDataAble:true,
    modifyDataButText:'点击编辑资料',
    userAddress: '',
    userPhone: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    address:""
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //获取用户输入的地址
  getAddress: function(e){
    this.setData({
      userAddress:e.detail.value
    })
  },
  //获取用户输入的手机
  getPhone: function(e){
    this.setData({
      userPhone:e.detail.value
    })
  },
  reload: function(){
    console.log("reload")
    this.onReady()
  },
  getLocation: function(){
    let that = this
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log(res)
        that.setData({
          userAddress:res.name
        })
     
        // wx.openLocation({
        //   latitude,
        //   longitude,
        //   scale: 18
        // })
      }
     })

  },
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

    if (app.globalData.userInfo) { 
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.userInfo.nickName)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getMongoData()
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("ready")
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //用户点击修改资料或确定按钮
  modifyData: function () {
    let that = this
    console.log(this.data.modifyDataButText)
    if(this.data.modifyDataButText=='确定'){
      that.setData({
        modifyDataAble:true,
        modifyDataButText:'点击修改资料'
        
      })
      console.log(that.data.userAddress)
      var data={
        name: that.data.userInfo.nickName,
        phone: that.data.userPhone,
        address: that.data.userAddress
      } 
      common.wxRequest("get",this.data.usersUrl+'&userName='+that.data.userInfo.nickName,null,function(res){
        console.log(res.data.length)
        if(res.data.length!=0){
          common.wxRequest("put",that.data.usersUrl+'&userName='+that.data.userInfo.nickName,data,null)
        }else{
          common.wxRequest("post",that.data.usersUrl,data)
        }
      })
      //common.wxRequest("post",this.data.usersUrl+'&userName='+this.data.userInfo.nickName,data)
      wx.showToast({
        title: '修改成功',
        duration: 1500,
        mask: false,
      });
    }else{
      that.setData({
        modifyDataAble:false,
        modifyDataButText:'确定' 
      })
    }
    
    
  },
  getMongoData: function(){
    let that = this
    //获取当前登录的用户信息
    console.log(this.data.usersUrl,'--------a')
    let curUserInfo=common.wxRequest("get",this.data.usersUrl+'&userName='+this.data.userInfo.nickName,null)
    console.log(typeof(curUserInfo))
    console.log('--------')
    curUserInfo.then(function(obj){
      console.log(obj)
      console.log(obj.data.length)
      if(obj.data.length!=0){
        that.setData({
          userAddress:obj.data[0].address,
          userPhone: obj.data[0].phone
        })
      }
    })
    
  }

  
})

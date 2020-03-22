//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    orderUrl:'http://49.235.96.23:5000?coll=wxDB&doc=order',
    orderFlagUrl:'http://49.235.96.23:5000?coll=wxDB&doc=orderFlag',
    usersUrl:'http://49.235.96.23:5000?coll=wxDB&doc=users',
    modifyDataAble:true,
    modifyDataButText:'点击编辑资料',
    userAddress: '',
    userPhone: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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
  onLoad: function () {
    console.log('tttt:'+this.data.canIUse)
    
    console.log('login')
    if (app.globalData.userInfo) {
      console.log('111')
      
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.userInfo.nickName)
    } else if (this.data.canIUse) {
      console.log('222')
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
    console.log(this.data.modifyDataButText)
    if(this.data.modifyDataButText=='确定'){
      this.setData({
        modifyDataAble:true,
        modifyDataButText:'点击修改资料'
        
      })
      console.log(this.data.userAddress)
      var data={
        name: this.data.userInfo.nickName,
        phone: this.data.userPhone,
        address: this.data.userAddress
      } 
      this.wxRequest("post",this.data.orderFlagUrl+'&userName='+this.data.userInfo.nickName,data)
      // wx.request({
      //   url: 'http://49.235.96.23:4000?coll=wxDB&doc=order&username='+this.data.userInfo.nickName,
      //   data: data,
      //   header: {'content-type':'application/json'},
      //   method: 'POST',
      //   dataType: 'json',
      //   responseType: 'text',
      //   success: (result)=>{
           
      //   },
        
      // });
      wx.showToast({
        title: '修改成功',
        duration: 1500,
        mask: false,
      });
    }else{
      this.setData({
        modifyDataAble:false,
        modifyDataButText:'确定' 
      })
    }
    
    
  },
    //wx.request function
    wxRequest: function(method,url,data,callback){
      return new Promise(function(resolve,reject){
        wx.request({
        url: url,
        method: method,
        header: {'content-type':'application/json'},
        dataType: 'json',
        data:data,
        responseType: 'text',
  
        success: (data) => {
        //data2=data
        console.log("----------a")
          console.log(data)
          if(callback!=null){
            callback()
          }
          resolve(data)
        }
      })
    })
    },
  getMongoData: function(){
    let temp=this.wxRequest("get",this.data.usersUrl+'&userName='+this.data.userInfo.nickName,null)
    console.log(temp)
    if(temp.length!=0){
      this.setData({
        userAddress:temp[0].address,
        userPhone: temp[0].phone
      })
    }
    
    // let a='http://www.lpllfd.cn:4000?coll=wxDB&doc=users&username='+this.data.userInfo.nickName

    // wx.request({
    //   url: a,
    //   header: {'content-type':'application/json'},
    //   method: 'GET',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: (res)=>{
    //     console.log(res)
    //     if(res.data.length!=0){
    //       this.setData({
    //         userAddress:res.data[0].address,
    //         userPhone: res.data[0].phone
    //       })
    //     }
    //   },
      
    // });
  }

  
})

//获取应用实例
const app = getApp()
let common = require("../../libs/api.js")
// pages/cart/cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: "",
    userInfo: "",
    URInfo: "",//用户注册时的信息
    userFoodInfo: [],
    orderUrl: 'https://www.lpllfd.cn/dingcan?coll=wxDB&doc=order',
    orderFlagUrl: 'https://www.lpllfd.cn/dingcan?coll=wxDB&doc=orderFlag',
    usersUrl: 'https://www.lpllfd.cn/dingcan?coll=wxDB&doc=users',
  },
  //删除菜品函数
  del: function (e) {
    let that = this
    let curId = e.currentTarget.dataset.id
    console.log(e.currentTarget.dataset.id)
    common.wxRequest("delete", this.data.orderUrl + "&userName=" + this.data.userInfo.nickName + "&id=" + curId, null, function (res) {
      console.log(res.data)
      that.getUserFoodInfo()
    })
  },
  getUserFoodInfo: function () {
    let that = this;
    common.wxRequest("get", this.data.orderUrl + "&userName=" + this.data.userInfo.nickName, null, function (res) {
      console.log(res)
      that.setData({
        userFoodInfo: res.data
      })
      let temp = 0
      for (var i = 0; i < res.data.length; i++) {
        temp += res.data[i].foodNum * res.data[i].price //计算总价
      }
      that.setData({
        total: temp
      })
    })
  },
  //支付
  pay: function () {
    let that = this
    let id;//数据库中已购买的订单长度
    let userFoodInfo = that.data.userFoodInfo;
    console.log("pay-----")
    if (this.data.userInfo) {
      if(that.data.URInfo.length==0){
          wx.showToast({
            title: '你还未填写地址',
            duration: 1500,
          });
        
      }else if(userFoodInfo==""){
        wx.showToast({
          title: '你还未选取菜品',
          duration: 1500,
        });
      }else{
      common.wxRequest("get", "http://49.235.96.23:5000?coll=houtaiOrder&doc=account", null, function (res) {
        console.log(res)
        if(res.data.length!=0){
          id = res.data.length
        }else{
          id=0
        }
        console.log("-------c:"+id)
        console.log(that.data.URInfo)
        var recData = {
          name: that.data.URInfo.name,
          address: that.data.URInfo.address,
          phone: that.data.URInfo.phone,
          priTotal: that.data.total,
          id: id + 1+""
        }
        console.log(recData)
        common.wxRequest("post", "http://49.235.96.23:5000?coll=houtaiOrder&doc=account", recData, function (res) {
          console.log("insert to order")
        })
        console.log("------------aaa")
      
      if (id == 0) {
        id = 1;
      } else {
        id = id + 1;
      }
      console.log("-------b:"+id)
      console.log(userFoodInfo)
      //把所买菜品post进数据库
      for (var i = 0; i < userFoodInfo.length; i++) {
        var recOrder = {
          imgUrl: userFoodInfo[i].imgSrc,
          foodName: userFoodInfo[i].name,
          foodPrice: userFoodInfo[i].price,
          foodNum: userFoodInfo[i].foodNum,
          flag: i + 1,
          id: id+""
        }
        console.log("--------")
        console.log(recOrder)
        common.wxRequest("post", "http://49.235.96.23:5000?coll=houtaiOrder&doc=order", recOrder, function (res) {
          console.log("insert to order")
          common.wxRequest("delete", that.data.orderUrl + "&userName=" + that.data.userInfo.nickName + "&delAll=true", null, function (res) {
            console.log("delete")
          })
          that.getUserFoodInfo()
          wx.showToast({
            title: '支付成功',
            duration: 1500,
          });
        })
      }
      })
    }
    } else {
      wx.showToast({
        title: '你还未登录',
        duration: 1500,
      });
    }

  },
  //取消订单
  cancelOrder: function () {
    console.log(this.data.userInfo)
    if (this.data.userFoodInfo) {
      common.wxRequest("delete", this.data.orderUrl + "&userName=" + this.data.userInfo.nickName + "&delAll=true", null, function (res) {
        console.log(res)
      })
      this.getUserFoodInfo()
      wx.showToast({
        title: '已取消',
        duration: 1500,
      });
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      total: app.globalData.total,
    })

    let that = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
      this.getUserFoodInfo()
      console.log(this.data.userInfo)
    } else {
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: app.globalData.userInfo,
        })
        this.getUserFoodInfo()
        console.log('callback')
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("common:" + app.globalData.total2)
    app.globalData.total2 += 5
    this.getUserFoodInfo()

    let that = this
    //获取用户注册信息
    common.wxRequest("get", this.data.usersUrl + "&userName=" + this.data.userInfo.nickName, null, function (res) {
      console.log(res)
      if(res.data[0].address!=""&&res.data[0].phone!=""){
        that.setData({
          URInfo: res.data[0]
        })

      }
      console.log("1")
      console.log(that.data.URInfo)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
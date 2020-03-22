//获取应用实例
const app = getApp()
import regeneratorRuntime from '../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: [],
    foodNum: [],
    userInfo: "",
    foodSelectRecord:[],
    orderUrl:'http://49.235.96.23:5000?coll=wxDB&doc=order',
    orderFlagUrl:'http://49.235.96.23:5000?coll=wxDB&doc=orderFlag',
    usersUrl:'http://49.235.96.23:5000?coll=wxDB&doc=users'
  },
  //减少菜品数量
  reduce: function (e) {
    let curIndex = e.currentTarget.dataset.index
    if (this.data.foodNum[curIndex].foodNum != 0) {
      let that = this;
      let arrIndex = "foodNum[" + curIndex + "].foodNum"
      this.setData({
        [arrIndex]: that.data.foodNum[curIndex].foodNum - 1
      })
    }
  },

  //增加菜品数量
  plus: function (e) {
    console.log("plus")
    
    let that = this;
    let curIndex = e.currentTarget.dataset.index
    console.log(that.data.foodNum)
    console.log(curIndex)
    console.log(that.data.foodNum[1].foodNum + 1)
    let arrIndex = "foodNum[" + curIndex + "].foodNum"
    that.setData({
      [arrIndex]: that.data.foodNum[curIndex].foodNum + 1
    })
  },
  //获得轮播图列表
  getSwiperList: function () {
    
    wx.request({
      url: "http://www.lpllfd.cn/test/swiperList.json",
      success: (res) => {
        console.log("获得轮播图列表")
        let that = this;
        let swiperList = res.data.swiperList
        let len = res.data.swiperList.length
        console.log(len)
        if (len != 0) {
          if (res.statusCode == 200) {
            that.setData({
              swiperList: res.data.swiperList
            })
          }
          for(var i=0;i<len;i++){
            var temp = {
              id: swiperList[i].id,
              imgSrc: swiperList[i].imgSrc,
              name: swiperList[i].name,
              price: swiperList[i].price,
              foodNum: null,
              userName:this.data.userInfo.nickName
            }
            this.data.foodNum.push(temp)
          }
          console.log(this.data.foodNum)
        }
        console.log("获得轮播图列表结束")
      }
    })
    
  },
  getFoodNum: function(){
    wx.request({
      url: this.data.orderUrl+'&userName='+this.data.userInfo.nickName,
      success: (res) => {
        console.log("获得食物数量信息")
        console.log('getFoodNum:'+this.data.userInfo.nickName)
        console.log(res)
        let that = this;

        let len = res.data.length
        console.log(len)
        if (len != 0) {
         
          for (var i = 0; i < len; i++) {
            let selectedFoodId=res.data[i].id //已选择购买的食物id
            let arrIndex = "foodNum[" + (selectedFoodId-1) + "].foodNum"
            that.setData({
              [arrIndex]:res.data[i].foodNum
            })
          }
        }
        console.log(this.data.foodNum)
        console.log("获得食物数量结束")
      }
    })
  },
  submitOrder: function () {
    var userName=this.data.userInfo.nickName
    console.log("submit")
    let swiperList = this.data.swiperList
    let userNameData = {
       "userName": userName
    }
    this.wxRequest("post",this.data.orderFlagUrl+'&userName='+userName,userNameData)
    // wx.request({
    //   url: this.data.orderFlagUrl+'&username='+userName,
    //   method: "POST",
    //   header: {'content-type':'application/json'},
    //   dataType: 'json',
    //   responseType: 'text',
    //   data: userNameData,
    //   success: (res) => {
    //     console.log('success')
    //   },
    //   error:(res)=>{
    //     console.log(res)
    //   }
      
    // })
    for (var i = 0; i < swiperList.length; i++) {
      let curFoodNum =this.data.foodNum[i].foodNum//当前菜品是否已选择购买数量
      console.log(i+":"+curFoodNum)
      if (curFoodNum!=null) {
        //查询菜品是否已存在

        var foodData = {
          id: swiperList[i].id,
          imgSrc: swiperList[i].imgSrc,
          name: swiperList[i].name,
          price: swiperList[i].price,
          foodNum: curFoodNum,
          userName:this.data.userInfo.nickName
        }
        this.wxRequest("post",this.data.orderUrl+'&userName='+userName,foodData)
        // wx.request({
        //   url: 'http://49.235.96.23:4000?coll=wxDB&doc=order&username='+this.data.userInfo.nickName,
        //   method: "POST",
        //   header: {'content-type':'application/json'},
        //   dataType: 'json',
        //   responseType: 'text',
        //   data: foodData,
        //   success: (res) => {
        //     console.log('success')
        //   }
        // })
      }else if(curFoodNum==0){//查询菜品是否已存在
        //存在就删除
        this.wxRequest("delete",this.data.orderUrl+'&id='+swiperList[i].id,null)
        // wx.request({
        //   url: orderUrl+"&id="+swiperList[i].id,
        //   method: "delete",
        //   responseType: 'text',
          
        //   success: (data) => {
        //     console.log('delete')
            
        //   }
        // })
        //this.wxRequest("delete",orderUrl+"&id="+swiperList[i].id)
        console.log('delete')
      }
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
      console.log(this.data.userInfo)
      this.getFoodNum()
    }else{
      app.userInfoReadyCallback = res =>{
        this.setData({
          userInfo: app.globalData.userInfo,
        })
        console.log('222')
        console.log(this.data.userInfo)
        this.getFoodNum()
      }
    }
    this.getSwiperList()
    let tt=await this.wxRequest("get",'http://49.235.96.23:4000?coll=wxDB&doc=order&userName='+this.data.userInfo.nickName,null)
    
    console.log(tt)
    console.log(this.data.userInfo+"------aaa")
    
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
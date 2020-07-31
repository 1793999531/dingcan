    var total2=10
    //wx.request function
    let wxRequest =function (method, url, data, callback) {
        return new Promise(function (resolve, reject) {
          if(data){
            wx.request({
              url: url,
              method: method,
              header: { 'content-type': 'application/json' },
              dataType: 'json',
              data: data,
              responseType: 'text',
              success: (data) => {
                if (callback) {
                  callback(data)
                }
                resolve(data)
              }
            })
          }else{
            wx.request({
              url: url,
              method: method,
              header: { 'content-type': 'application/json' },
              dataType: 'json',
              responseType: 'text',
              success: (data) => {

                if (callback) {
                  callback(data)
                }
                resolve(data)
              }
            })
          }
         
        })
      }
      let test = () =>{
          console.log("testSuc")
      }
      //对外暴露
      module.exports = {
          test,
          wxRequest
      }
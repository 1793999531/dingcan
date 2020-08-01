const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
var multer = require('multer')
// 创建express实例
const app = express()
var bodyParse = require('body-parser')

var url = "mongodb://admin:123456@49.235.96.23:27017/";
//var router = express.Router()
var opFlag = 0;
var myDate = new Date();
var MongoClient = require('mongodb').MongoClient;


app.use(express.static(__dirname + '/mySite'));
app.use('/static/dingcan',express.static(__dirname + '/dingcan'));
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({ extended: false }))
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})
// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './ssl.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './ssl.pem'), 'utf8')
const credentials = {
  key: privateKey,
  cert: certificate,
}

app.get('/dingcan/', async (req, res,next) => {
  myDate = new Date();
    console.log("操作次数：" + opFlag);
    opFlag++;
    fs.appendFile("./loggerInfo.txt","访问者IP:"+req.ip+", 时间:"+myDate+",操作次数：" + opFlag+"\n",function(err){
        if (err) return console.log("追加文件失败" + err.message);
    })
    var coll = req.query.coll //集合
    var doc = req.query.doc //文档
    var id = req.query.id //id 
    var flag = req.query.flag
    var username = req.query.username
    
    if (coll != null &&typeof coll === 'string') {
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;
        
            var dbo = db.db(coll);
            if (id != null) {
                dbo.collection(doc).find({ "id": id }).toArray(function (err, result) {
                 
                    if (err) throw err;
                    console.log(result);
                    console.log('result---id')
                    res.send(JSON.stringify(result));

                });
            } else {
              
                if (flag != null) {
                    dbo.collection(doc).find({ "flag": flag }).toArray(function (err, result) {
                        if (err) throw err;
                        console.log('result---flag')
                        console.log(result);
                        res.send(JSON.stringify(result));
                        db.close();
                    });
                } else if (username != null) {
                    dbo.collection(doc).find({ "name": username }).toArray(function (err, result) {
                        if (err) throw err;
                        console.log('result---username')
                        console.log(result)
                        res.send(JSON.stringify(result));
                        db.close();
                    });
                } else {
                  console.log("操作次数：a" + opFlag);
                    dbo.collection(doc).find({}).toArray(function (err, result) {
                     
                        if (err) throw err;
                        console.log('result---all')
                        console.log(result);
                        res.send(JSON.stringify(result));
                        db.close();

                    });

                }       
            }
        });
    } else {
        res.send("false")
    }
  //next();
})

app.post('/dingcan/', function (req, res2) {
  myDate = new Date();
  console.log("操作次数：" + opFlag);
  opFlag++;
  myDate.toLocaleString(); //获取日期与时间
  console.log(myDate);
  var coll = req.query.coll //集合
  var doc = req.query.doc //文档
  var zhuce = req.query.zhuce //注册
  var login = req.query.login //登录
  var username = req.query.username //wx是否更新用户信息
  if (coll != null && doc != null && typeof coll==='string') {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
          if (err) throw err;
          var dbo = db.db(coll);
          var data = req.body;
          console.log(data)
          dbo.collection(doc).find({}).toArray(function (err, result) { // 返回集合中所有数据
              if (err) throw err;
              if (login == 'true') {
                  for (var i = 0; i < result.length; i++) {
                      if (data.name == result[i].name && data.passw == result[i].passw) {
                          res2.send('true')
                          db.close();
                          return
                      }
                  }
                  res2.send("false");
                  db.close();
              }
              else if (zhuce == 'true') {
                  for (var i = 0; i < result.length; i++) {
                      if (data.name == result[i].name) {
                          res2.send('false')
                          db.close();
                          return
                      }
                  }
                  console.log('not exist')
                  dbo.collection(doc).insertOne(data, function (err, res) {
                      if (err) throw err;
                      console.log("文档插入成功");
                      res2.send("true");
                      db.close();
                  });
              } else if (username != null) {
                  dbo.collection(doc).find({ "name": username }).toArray(function (err, result) {
                      if (err) throw err;
                      console.log(result);
                      console.log('result---name')
                      console.log(result.length)
                      if (result.length != 0) { //当前用户名是否已存在
                          var whereStr = { "name": username };
                          var updateData = { $set: req.body };
                          dbo.collection(doc).updateOne(whereStr, updateData, function (err, res) {
                              if (err) throw err;
                              console.log("文档更新成功");
                              db.close();
                          });
                      } else {
                          dbo.collection(doc).insertOne(data, function (err, res) {
                              if (err) throw err;
                              console.log("文档插入成功");
                              db.close();
                          });
                      }
                      res2.send('true');
                  });
              } else {

                  dbo.collection(doc).insertOne(data, function (err, res) {
                      if (err) throw err;
                      console.log("文档插入成功");
                      res2.send("true");
                      db.close();
                  });
              }
          });
      });
  } else {
      res2.send('false')
  }
});

app.put('/dingcan/', function (req, res2, next) { //更新数据
  myDate = new Date();
  console.log("操作次数：" + opFlag);
  opFlag++;
  myDate.toLocaleString(); //获取日期与时间
  console.log(myDate);
  //var arg = req.query.arg
  var id = req.query.id
  var coll = req.query.coll //集合
  var doc = req.query.doc //文档
  if (coll != null && doc != null && typeof coll==='string') {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db(coll);
        var whereStr = { "id": id };
        var updateData = { $set: req.body };
        dbo.collection(doc).updateOne(whereStr, updateData, function (err, res) {
            if (err) throw err;
            console.log("文档更新成功");
            res2.send("true");
            db.close();
        });
    });
  }else{
    res2.send("false");
  }

});

app.delete('/dingcan/', function (req, res) {
  myDate = new Date();
  myDate.toLocaleString(); //获取日期与时间
  console.log(myDate);
  var coll = req.query.coll //集合
  var doc = req.query.doc //文档
  var id = req.query.id //id  
  var delAll = req.query.delAll //删除所有
  if (coll != null && doc != null && typeof coll==='string') {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db(coll);
        if (delAll == 'true') {
            dbo.collection(doc).deleteMany({}, function (err, obj) {
                if (err) throw err;
                console.log("清除成功");
                res.send('true')
                db.close();
            });
        } else {
            var whereStr = { "id": id }
            dbo.collection(doc).deleteMany(whereStr, function (err, obj) {
                if (err) throw err;
                console.log("数据删除成功");
                console.log('doc:' + doc + ';where:' + whereStr)
                res.send('true')
                db.close();
            });
        }
  
    });
  }else{
    res2.send("false");
  }


});

//var upload = multer({ dest: 'C:/Users/admin/Desktop/week4/images/' });
var storage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹需要手动创建！！！
  destination: function (req, file, cb) {
      cb(null, './img/')
  },
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
      //var fileFormat = (file.originalname).split(".");
      // cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
      cb(null, file.originalname);
  }
});
//添加配置文件到muler对象。
var upload = multer({
  storage: storage
});
// 单图上传

app.post('/dingcan/upload', upload.single('img'), function (req, res, next) {
  console.log('uoload')
  res.send('aaa');
});


// 创建https服务器实例
const httpsServer = https.createServer(credentials, app)

// 设置https的访问端口号
const SSLPORT = 443

// 启动服务器，监听对应的端口
httpsServer.listen(SSLPORT, () => {
  console.log(`HTTPS Server is running on: https://localhost:${SSLPORT}`)
})
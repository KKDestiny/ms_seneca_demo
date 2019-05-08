# 融入Express的微服务

在本章，我将演示一个可联通的“一个主服务+三个微服务”集群。这四个服务全部在本机，也可部署在不同服务器中。

## 文件结构

在本机的文件结构如下：

```
microservices
     ┝ package.json
     ┝ node_modules
     ┝ config.js   // 主服务配置文件
     ┝ plugins    // 插件文件夹
       ┝ ui.js    // 主服务的UI插件
     ┕ test.js  // 主服务的测试插件
     ┕ app.js   // 主服务启动文件
   ┝ articles   // 文章管理服务
     ┝ node_modules
     ┝ plugins    // 插件文件夹
     ┕ articles.js
     ┝ server.js    // 文章管理启动文件
     ┕ package.json
   ┝ roles      // 角色管理服务
     ┝ node_modules
     ┝ plugins    // 插件文件夹
     ┕ roles.js
     ┝ server.js    // 角色管理启动文件
     ┕ package.json
   ┕ users      // 用户管理服务
     ┝ node_modules
     ┝ plugins    // 插件文件夹
     ┕ users.js
     ┝ server.js  // 用户管理启动文件
     ┕ package.json
```

其中，每一个服务都可以单独放到不同的服务器中部署。github托管地址为：[https://github.com/KKDestiny/ms_seneca_demo](https://github.com/KKDestiny/ms_seneca_demo)


## 主服务

### 文件结构

主服务的文件结构如下：

```
microservices
   ┝ app       // 主服务
     ┝ package.json
     ┝ node_modules
     ┝ config.js   // 主服务配置文件
     ┝ plugins    // 插件文件夹
       ┝ ui.js    // 主服务的UI插件
     ┕ test.js  // 主服务的测试插件
     ┕ app.js   // 主服务启动文件
```

其中，`node_modules` 是Node.js的包文件夹，存放所有的Node.js包。主服务需要Express及其相关的包以及Seneca（含Seneca所需的插件）。

`plugins` 文件夹中存放的是主服务所需的两个插件：UI插件和测试插件，分别用于显示页面和测试其他服务是否连通。插件的具体内容稍后再介绍。

`config.js` 文件存放的是主服务的配置信息，文件内容会在后面介绍。

`app.js` 是主服务的启动文件，如何融入Express、调用不同插件、调用不同的微服务等都在此实现。文件内容会在后面介绍。


### 依赖

主服务的 `package.json` 内容如下：

```
{
  "name": "microservices",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node app"
  },
  "dependencies": {
    "cookie-parser": "~1.4.3",
    "debug": "~2.6.9",
    "express": "~4.16.0",
    "http-errors": "~1.6.2",
    "jade": "~1.11.0",
    "morgan": "~1.9.0",
    "seneca": "^3.8.4",
    "seneca-entity": "^3.3.0",
    "seneca-web": "^2.2.1",
    "seneca-web-adapter-express": "^1.1.2"
  }
}
```

需要关注的主要是两个部分，一个是需要Express，这个可以通过Express安装器来安装；另一个是Seneca，它包括了四个部分：Seneca本身，用户存储管理的 `seneca-entity`，用于Web服务器管理的 `seneca-web` 以及适配Express的 `seneca-web-adapter-express`。


### UI插件

这里先介绍UI插件，因为我只写了一个功能：返回一个JSON字符串给客户端。代码如下：

```javascript
/**
 * 插件ui
 * 用于显示UI
 * @DateTime 2019-05-08
 */
function ui(options) {
  this.add('service:ui,path:home', function (msg, respond) {
    var service = msg.args.params.service;
    var data = msg.args.query.data;

    respond({msg:"This is home page"})
  })

  this.add('init:ui', function (msg, respond) {
    this.act('role:web',{routes:{
      prefix: '/',
      pin:    'service:ui,path:*',
      map: {
        home: { GET:true },
      }
    }}, respond)
  })
}

module.exports = ui
```

上面代码中，我们创建了一个模式 `'service:ui,path:home'`，并提供了这个插件的初始化方法 `'init:ui'`。

在初始化方法中，我们定义了当请求(http)的URL为 `/` 打头，则会进入这个模式。并定义了一个 `GET` 方式的URL：`GET /home`，这个URL将调用 `'service:ui,path:home'` 模式。

在这个模式下，主服务将返回一个JSON字符串：`{msg:"This is home page"}`。

---

这里需要注意的是，`module.exports = ui` 里的 `ui` 的命名必须满足：

- 必须与这个文件的名称相同（`ui.js`）
- 在 app.js 中引用这个插件也必须使用这个名称 `ui`

如果不满足以上两个条件，服务将报错。其他的插件也类似。


### 配置文件

在介绍插件test之前，先介绍配置文件 `config.js`。

```javascript
// 全局定义
const Protocol = 'http';

// 服务列表
const ServiceList = {
  users : {
    name : "users",
    port : 3001,
  },
  roles : {
    name : "roles",
    port : 3002,
  },
  articles : {
    name : "articles",
    port : 3003,
  },
};

const Config = function(){};

Config.prototype.Protocol = Protocol;
Config.prototype.ServiceList = ServiceList;

module.exports = new Config();
```

这个文件非常简单，定义了两个常量：使用的传输协议 `Protocol` 和 支持的业务及信息 `ServiceList`，并提供给外部使用。

从 `ServiceList` 可以看出，我们当前有三个微服务：

- 用户管理服务：名称为 `users`，端口号为 `3001`
- 角色管理服务：名称为 `roles`，端口号为 `3002`
- 文章管理服务：名称为 `articles`，端口号为 `3003`

> 如果此服务部署在其他的服务器，还可以加上 `host` 属性来指定IP或域名。在主服务连接的时候也要对应指定各服务的 `host` 即可。


### 插件test

下面是test插件的源码：

```javascript
/**
 * 插件test
 * 用于测试访问各个微服务
 * @DateTime 2019-05-08
 */

// 引用配置文件、获取配置信息
const Config = require('./../config');
const ServiceList = Config.ServiceList;

// 定义
function test(options) {
  this.add('service:test,path:ping', function (msg, respond) {
    var service = msg.args.params.service;
    var data = msg.args.query.data;

    // 检查是否有此服务
    if(!ServiceList[service]) {
      respond({err:"Sorry, service is not access!"}, null)
      return
    }

    this.act('service:'+service+',cmd:ping', {
      service:   service,
      data:  data,
    }, respond)
  })

  this.add('init:test', function (msg, respond) {
    this.act('role:web',{routes:{
      prefix: '/test',
      pin:    'service:test,path:*',
      map: {
        ping: { GET:true, suffix:'/:service' },
      }
    }}, respond)
  })
}

module.exports = test
```

上面代码中，我们创建了一个模式 `'service:test,path:ping'`，并提供了这个插件的初始化方法 `'init:test'`。

在初始化方法中，我们定义了当请求(http)的URL为 `/test` 打头，则会进入这个模式。并定义了一个 `GET` 方式的URL：`GET /test/ping/:service`，这个URL将调用 `'service:test,path:ping'` 模式。

---

在这个模式下，通过 `service` 的不同，将调用不同微服务的 `cmd:ping` 模式。

- `GET /test/ping/users` 将最终触发 `this.act('service:users,cmd:ping', callback)`，而这个服务正是用户管理服务的（原因会在后面介绍启动文件app.js时说明）。
- `GET /test/ping/roles` 将最终触发 `this.act('service:roles,cmd:ping', callback)`，即角色管理服务
- `GET /test/ping/articles` 将最终触发 `this.act('service:articles,cmd:ping', callback)`，即文章管理服务


### 启动文件

下面是 app.js 的内容：

```javascript
var SenecaWeb = require('seneca-web')
var Express = require('express')
var Router = Express.Router
var context = new Router()

var senecaWebConfig = {
      context: context,
      adapter: require('seneca-web-adapter-express'),
      options: { parseBody: false } // so we can use body-parser
}

var app = Express()
      .use( require('body-parser').json() )
      .use( context )
      .listen(3000)


// 获取配置信息
const Config = require('./config');
const Protocol = Config.Protocol;
const ServiceList = Config.ServiceList;


// 启用Seneca
var seneca = require('seneca')()
      .use(SenecaWeb, senecaWebConfig )
      .use('./plugins/test')
      .use('./plugins/ui')
      .client( { type:Protocol, pin:'service:'+ServiceList.users.name, port:ServiceList.users.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.roles.name, port:ServiceList.roles.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.articles.name, port:ServiceList.articles.port} )
```

关于Seneca如何与Express融合，这里不再介绍，关注 `.use(SenecaWeb, senecaWebConfig )` 即可。

这里要特别说明的有以下内容：

- 引用插件
- 主服务与微服务的连接


#### 引用插件

首先是引用插件，注意到最后一段代码：

```
var seneca = require('seneca')()
      .use('./plugins/test')
      .use('./plugins/ui')
```

引用插件的方式即加载本地文件，如引用test插件的方式是 `use('./plugins/test')`。注意前文提到的，插件名称要与函数名保持一致，与文件名称保持一致。


#### 主服务与微服务的连接

主服务与其他微服务的连接，是通过下面代码实现的：

```javascript
var seneca = require('seneca')()
      .client( { type:Protocol, pin:'service:'+ServiceList.users.name, port:ServiceList.users.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.roles.name, port:ServiceList.roles.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.articles.name, port:ServiceList.articles.port} )
```

上面一段代码看起来很复杂，其实是因为在使用全局配置信息的缘故；我们可以做一些修改，这样看起来更简单一些：

```javascript
var seneca = require('seneca')()
      .client( { type:'http', pin:'service:users', port:3001} )
      .client( { type:'http', pin:'service:roles', port:3002} )
      .client( { type:'http', pin:'service:articles', port:3003} )
```

如果你还不明白其中的关系，没有关系，继续往下看其他微服务的部署，就会清楚了。


## 用户管理服务

用户管理服务的文件结构如下：

```
microservices
   ┝ users       // 用户管理服务
     ┝ package.json
     ┝ node_modules
     ┝ plugins    // 插件文件夹
     ┕ users.js // 用户管理服务的插件
     ┕ server.js    // 用户管理服务启动文件
```

其中，`node_modules` 是Node.js的包文件夹，存放所有的Node.js包。这里主要是Seneca（含Seneca所需的插件）。

`plugins` 文件夹中存放的是用户管理服务所需的插件。

`server.js` 是用户管理服务的启动文件。


### 插件users

下面是用户管理服务的 `users` 插件代码：

```javascript
function Users( options )  {

  // 模式：测试
  this.add({service:'users', cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Users Received Request!!!\n")

    respond(null, {response:"Users Service", data:msg.data})
  })
}

module.exports = Users
```

这个插件定义了一个模式 `{service:'users', cmd:'ping'}`，当Seneca的微服务集群中，触发了这个模式后，将调用这个模式的回调函数。


### 启动微服务

启动服务的文件是 `server.js`，代码如下：

```javascript
require('seneca')()
  .use('./plugins/users')
  .listen({port:3001, type:"http"})
```

可以看到，这个服务的启动代码比主服务的简单很多，它只需要监听来自端口 `3001` 的 `http` 消息即可。如果这个微服务没有部署在主服务所在的服务器，还需要指定主服务的 `host`，如：

```javascript
.listen({port:3001, type:"http"}, host:"主服务所在IP或域名")
```


## 其他微服务

另外两个微服务（角色管理服务和文章管理服务）的代码和内容都与用户管理微服务类似，这里不再赘述。


## 微服务集群的联调

### 启动微服务

首先，分别启动用户管理、角色管理和文章管理微服务（这三个微服务的启动顺序不分先后），然后启动主服务。

启动用户管理微服务：
![upload.png](https://kcms.konkawise.com/upload/201905081636056469.png)

启动角色管理微服务：
![upload.png](https://kcms.konkawise.com/upload/201905081636207504.png)

启动文章管理微服务：
![upload.png](https://kcms.konkawise.com/upload/201905081636357376.png)

启动主服务：
![upload.png](https://kcms.konkawise.com/upload/201905081637138268.png)


### 测试

#### 主服务UI

首先，测试主服务的UI插件。在浏览器中输入：`127.0.0.1:3000/home`。浏览器应显示以下消息：

```
{"msg":"This is home page"}
```

#### 用户管理服务

测试调用用户管理服务。在浏览器中输入：`http://127.0.0.1:3000/test/ping/users`。浏览器应显示以下消息：

```
{"response":"Users Service"}
```

且用户管理微服务的控制台会有如下打印：

```
>>>>>> Service Users Received Request!!! 
```

#### 角色管理服务

测试调用角色管理服务。在浏览器中输入：`http://127.0.0.1:3000/test/ping/roles`。浏览器应显示以下消息：

```
{"response":"Roles Service"}
```

且角色管理微服务的控制台会有如下打印：

```
>>>>>> Service Roles Received Request!!! 
```

#### 文章管理服务

测试调用文章管理服务。在浏览器中输入：`http://127.0.0.1:3000/test/ping/articles`。浏览器应显示以下消息：

```
{"response":"Articles Service"}
```

且文章管理微服务的控制台会有如下打印：

```
>>>>>> Service Articles Received Request!!! 
```


### 代码串联

如果你已经成功运行，那么恭喜你，一个简单的基于Express+Seneca的微服务集群已经成功在你的电脑搭建起来了，你可以在这个基础上做很多有意思的的事情。

在此之前，请再仔细研究一遍整个集群里三个微服务到底是怎么和主服务联系在一起的。如果弄清楚了这一点，会让你在开发和调试过程中，更加顺利；你对微服务Seneca的理解也会更加深入。

#### 主服务的启动

在主服务启动过程中，我们启用了两个自定义的插件：ui 和 test。在这两个插件的初始化代码中，我们定义了两个URL前缀：

- ui：定义了 `/` 开头的URL，并定义了一个路径 `GET /home`，该路径匹配了 `service:ui,path:home` 模式
- test：定义了 `/test` 开头的URL，并定义了一个路径 `GET /test/ping/:service`（其中，`service` 决定了使用哪个微服务），该路径匹配了 `service:test,path:ping` 模式

我们可以把上面的描述转换为表格：

| 主服务插件 | 前缀  | Demo路径 | 对应模式 |
|:---:|:---:|:---|:---|
| **ui** | `/`  | `GET /home` | `service:ui,path:home` |
| **test** | `/test`  | `GET /test/ping/:service` | `service:test,path:ping` |

接下来，我们逐个分析两个插件到底是如何响应浏览器（客户端）的http请求的。



#### 访问主服务的UI

我们先从简单的开始，了解从浏览器输入URL开始，到服务器返回给浏览器数据，这个过程到底经历了什么。（当然，我们不关注http协议本身，只讨论在微服务框架里的走向）

- `GET /home`
- 主服务接收到URL，匹配模式：`service:ui,path:home`
- 调用函数：
```
var service = msg.args.params.service;
var data = msg.args.query.data;
respond({msg:"This is home page"})
```
- 主服务返回JSON字符串给浏览器

可以看到，访问这个URL后，主服务没有调用任何其他微服务，而是直接返回了一个JSON字符串给浏览器。


#### 访问主服务的test

接下来，我们在浏览器输入：`http://127.0.0.1:3000/test/ping/users`

- `GET /test/ping/users`
- 主服务接收到URL，其路径是匹配 `GET /test/ping/:service`，匹配模式 `service:test,path:ping`
- 调用函数（文件位于 `/app/plugins/test`）：
```
this.act('service:users,cmd:ping', {
  service:   service,
  data:  data,
}, respond)
```
- 触发用户管理微服务的 `{service:'users', cmd:'ping'}` 模式，并执行下面代码（文件位于 `/users/plugins/users.js`）：
```
console.log(">>>>>> Service Users Received Request!!!\n")
respond(null, {response:"Users Service", data:msg.data})
```

注意到，这里之所以会触发用户管理微服务，是因为主服务的Seneca调用了 `seneca.act('service:users,cmd:ping')`。

那么为什么主服务的Seneca调用这个模式后，会触发到用户管理微服务呢？注意到这两部分的代码：

```javascript
// 主服务的启动文件 /app/app.js
var seneca = require('seneca')()
      .client( { type:'http', pin:'service:users', port:3001} )

// 用户管理微服务的启动文件 /users/server.js
require('seneca')()
  .listen({port:3001, type:"http"})
```

一方面，用户管理微服务会监听来自端口 `3001` 的 `http` 消息，另一方面，主服务将 `service:users` 模式绑定到了端口 `3001`。绑定后，主服务相当于用户管理微服务的一个客户端，可以在Seneca框架下进行通信。只要主服务需要处理 `service:users` 这个模式，就会调用用户管理微服务了。

同样地，其他的微服务被调用的原理也是一样的。
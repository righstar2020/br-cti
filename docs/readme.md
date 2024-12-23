# 1.backend 端介绍

## 1.1 整体目录结构

```
.
├── configs/                          # 配置文件目录
│   ├── prd/                         # 生产环境配置
│   │   └── config.yaml              # 生产环境配置文件
│   └── tst/                         # 测试环境配置
│       └── config.yaml              # 测试环境配置文件
│
├── global/                          # 全局变量和工具目录
│   ├── db.go                        # 数据库全局变量
│   ├── setting.go                   # 配置全局变量
│   ├── tracer.go                    # 追踪器全局变量
│   └── validator.go                 # 验证器全局变量
│
├── internal/                        # 内部应用代码目录
│   ├── dao/                        # 数据访问层
│   │   ├── admin_link.go           # 友链管理
│   │   ├── admin_menu.go           # 菜单管理
│   │   ├── admin_role.go           # 角色管理
│   │   ├── admin_user.go           # 用户管理
│   │   ├── dao.go                  # DAO基础结构
│   │   ├── dao_cti.go              # CTI数据访问
│   │   ├── dao_cti_onchain.go      # CTI上链数据访问
│   │   └── dao_cti_sale.go         # CTI销售数据访问
│   ├── dto/                        # 数据传输对象
│   │   ├── admin_link.go           # 友链DTO
│   │   ├── admin_login.go          # 登录DTO
│   │   ├── admin_menu.go           # 菜单DTO
│   │   ├── admin_role.go           # 角色DTO
│   │   ├── admin_user.go           # 用户DTO
│   │   ├── common.go               # 通用DTO
│   │   ├── dto_bc_broswer.go       # 区块链浏览器DTO
│   │   ├── dto_cti.go              # CTI DTO
│   │   ├── dto_cti_onchain.go      # CTI上链DTO
│   │   └── dto_cti_sale.go         # CTI销售DTO
│   └── handler/                    # 处理器层
│       └── admin/                  # 管理后台处理器
│           ├── cti.go              # CTI处理器
│           ├── index.go            # 首页处理器
│           ├── link.go             # 友链处理器
│           ├── menu.go             # 菜单处理器
│           ├── public.go           # 公共处理器
│           ├── role.go             # 角色处理器
│           └── sale.go             # 销售处理器
│
├── pkg/                            # 公共包目录
│   ├── app/                        # 应用工具包
│   ├── constant/                   # 常量定义
│   ├── convert/                    # 类型转换工具
│   ├── crypto/                     # 加密工具
│   ├── email/                      # 邮件工具
│   ├── errcode/                    # 错误码定义
│   ├── limiter/                    # 限流器
│   ├── logger/                     # 日志工具
│   ├── network/                    # 网络工具
│   ├── setting/                    # 配置工具
│   ├── tracer/                     # 追踪工具
│   ├── upload/                     # 上传工具
│   └── utils/                      # 通用工具
│       ├── gconv/                  # 转换工具
│       ├── gmd5/                   # MD5工具
│       ├── gregex/                 # 正则工具
│       └── gstr/                   # 字符串工具
│
├── static/                         # 静态资源目录
│   └── admin/                      # 管理后台静态资源
│       └── module/                 # JS模块
│           ├── cti_admin_cti.js    # CTI管理
│           ├── cti_admin_index.js  # 首页
│           ├── cti_admin_link.js   # 友链管理
│           └── ...                 # 其他JS模块
│
├── storage/                        # 存储目录
│   └── logs/                      # 日志文件
│       ├── sql_print_20241015.log # SQL日志
│       └── sql_print_20241016.log # SQL日志
│
└── views/                         # 视图模板目录
    ├── admin/                    # 管理后台视图
    │   ├── includes/             # 页面片段
    │   │   ├── admin_user/      # 用户管理视图
    │   │   ├── cti/             # CTI管理视图
    │   │   ├── link/            # 友链管理视图
    │   │   ├── menu/            # 菜单管理视图
    │   │   ├── role/            # 角色管理视图
    │   │   └── sale/            # 销售管理视图
    │   ├── layouts/             # 布局模板
    │   │   ├── footer.html      # 页脚
    │   │   ├── form.html        # 表单布局
    │   │   ├── header.html      # 页头
    │   │   └── layout.html      # 主布局
    │   └── index.html           # 首页模板
    │
    ├── client/                   # 客户端视图
    │   ├── includes/             # 客户端页面片段
    │   │   ├── local_data/      # 本地数据处理视图
    │   │   └── ml_model/        # 机器学习模型视图
    │   ├── client_local_data.html    # 本地数据管理页面
    │   ├── client_ml_model.html      # 模型管理页面
    │   ├── client_network.html       # 网络配置页面
    │   ├── client_wallet.html        # 钱包管理页面
    │   └── client_wallet_register.html # 钱包注册页面
    │
    └── front/                    # 前端视图
        ├── includes/            # 前端页面公共组件
        │   ├── bc_browser.html     # 区块链浏览器组件
        │   ├── knowledge_plane_normal.html  # 知识图谱-常规视图组件
        │   ├── knowledge_plane_traffic.html # 知识图谱-流量视图组件
        │   ├── knowledge_plane.html  # 知识图谱基础组件
        │   ├── model_market.html     # 模型市场组件
        │   └── front_*.html          # 其他前端公共组件
        ├── layouts/             # 前端页面布局模板
        │   ├── footer.html         # 页脚布局
        │   ├── header.html         # 页头布局
        │   ├── main.html           # 主布局模板
        │   ├── navigation.html     # 导航栏布局
        │   └── sidebar.html        # 侧边栏布局
        ├── cti_detail.html     # CTI详情页面
        ├── cti_onchain.html    # CTI链上信息页面
        ├── cti_own.html        # CTI个人中心页面
        ├── cti_upload.html     # CTI上传页面
        ├── model_detail.html   # 模型详情页面
        ├── model_own.html      # 模型个人中心页面
        └── model_record_detail.html # 模型记录详情页面
```

## 1.2 views/front 目录结构

```
views/front/
├── includes/                      # 页面组件目录
│   ├── bc_browser.html           # 区块链浏览器组件
│   ├── knowledge_plane_normal.html    # 知识图谱-常规视图
│   ├── knowledge_plane_traffic.html   # 知识图谱-流量视图
│   ├── knowledge_plane.html      # 知识图谱基础组件
│   ├── model_market.html         # 模型市场组件
│   └── front_*.html              # 其他前端公共组件
│
├── layouts/                      # 布局模板目录
│   ├── footer.html              # 页脚布局
│   ├── header.html              # 页头布局
│   ├── main.html                # 主布局模板
│   ├── navigation.html          # 导航栏布局
│   └── sidebar.html             # 侧边栏布局
│
├── cti_detail.html              # CTI详情页面
├── cti_onchain.html             # CTI链上信息页面
├── cti_own.html                 # CTI个人中心页面
├── cti_upload.html              # CTI上传页面
├── model_detail.html            # 模型详情页面
├── model_own.html               # 模型个人中心页面
└── model_record_detail.html     # 模型记录详情页面
```

## 1.3 static/client 目录结构

```
static/client/
├── css/
│   ├── client_local_data/
│   │   ├── llm.css          # LLM相关样式
│   │   └── traffic.css      # 流量数据相关样式
│   ├── client_local_data.css    # 本地数据通用样式
│   ├── client_ml_model.css      # 机器学习模型相关样式
│   ├── client_ml_monitor.css    # 模型监控相关样式
│   ├── client_network.css       # 网络相关样式
│   ├── client_wallet.css        # 钱包相关样式
│   └── client_wallet_register.css # 钱包注册相关样式
│
├── js/
│   ├── client_local_data/
│   │   ├── llm/
│   │   │   └── file_upload.js   # LLM文件上传
│   │   ├── traffic/
│   │   │   ├── cti_process.js   # 流量CTI处理
│   │   │   ├── cti_upchain.js   # 流量CTI上链
│   │   │   ├── file_upload.js   # 流量文件上传
│   │   │   └── stix_process.js  # STIX格式处理
│   │   └── data_table.js        # 数据表格相关
│   ├── client_ml_model/
│   │   ├── data_source_table.js # 数据源表格
│   │   ├── data_table.js        # 模型数据表格
│   │   ├── file_upload.js       # 模型文件上传
│   │   ├── info_process.js      # 模型信息处理
│   │   ├── train_monitor.js     # 训练监控
│   │   ├── train_process.js     # 训练过程
│   │   └── upchain_process.js   # 模型上链
│   ├── client_local_data.js     # 本地数据处理
│   ├── client_ml_model.js       # 机器学习模型
│   ├── client_ml_request.js     # ML相关请求
│   └── client_network.js        # 网络相关
```

## 1.4 static/front 目录结构

```
static/front/
├── css/                            # 前端CSS样式目录
│   ├── bc_browser.css             # 区块链浏览器样式
│   ├── cti_detail.css            # CTI详情页样式
│   ├── cti_market.css            # CTI市场页样式
│   ├── custom.css                # 自定义通用样式
│   ├── front_footer.css          # 页脚样式
│   ├── front_index.css           # 首页样式
│   ├── front_login.css           # 登录页样式
│   ├── front_navigation.css      # 导航栏样式
│   ├── front_register.css        # 注册页样式
│   ├── front_sidebar.css         # 侧边栏样式
│   ├── knowledge_plane.css       # 知识图谱页面样式
│   └── model_market.css          # 模型市场页面样式
```



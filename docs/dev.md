# 开发说明

## 1. Go环境
一定要注意Go的版本是```1.14```
否则可能编译报错
## 2. gcc 依赖安装
编译中间件需要GCC环境
安装教程:https://blog.csdn.net/K346K346/article/details/130870292
## 3. MySQL安装
1.下载MySQL(8.0.39)
https://downloads.mysql.com/archives/installer/
2.安装
参考教程:https://blog.csdn.net/qq_39327650/article/details/134088833
3.安装Navicat
参考教程:https://blog.csdn.net/qq_54502508/article/details/137118258
4.初始化数据库
使用navicat创建```br-cti```数据库
执行BR-CTI.sql文件
## 4. 启动
```shell
go run ./main.go
```
访问:http://localhost:8088
## 5. 管理后台
地址:http://localhost:8088/admin
用户名:admin
密码:123456

## 6. git免密
教程:https://blog.csdn.net/super8ayan/article/details/131704316
```
ssh-keygen -t rsa -C "注册账号的邮箱名字"
```
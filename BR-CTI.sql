/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : 127.0.0.1:3306
 Source Schema         : br-cti

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 03/04/2023 16:55:50
*/


SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for br_cti_menu
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_menu`;
CREATE TABLE `br_cti_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `name` varchar(30) NOT NULL DEFAULT '' COMMENT '菜单名称',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标',
  `url` varchar(100) DEFAULT NULL COMMENT 'URL地址',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '上级ID',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '类型：1模块 2导航 3菜单 4节点',
  `permission` varchar(255) DEFAULT '' COMMENT '权限标识',
  `is_show` tinyint(1) DEFAULT '1' COMMENT '是否显示：1显示 2不显示',
  `sort` int(11) DEFAULT NULL COMMENT '显示顺序',
  `remark` varchar(255) DEFAULT NULL COMMENT '菜单备注',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态1-在用 2-禁用',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of br_cti_menu
-- ----------------------------
-- INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (1, 'CTI管理', 'layui-icon-component', NULL, 0, 0, '', 1, 2, NULL, 1, '2023-03-15 07:21:28', '2023-03-24 07:19:18');
-- INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (2, 'CTI数据', 'layui-icon-component', 'cti/index', 1, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-24 07:19:19');


BEGIN;
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (1, '平台管理端', 'layui-icon-component', '/admin', 0, 0, 'sys:sysconfig', 1, 1, '', 1, '2023-03-15 07:20:52', '2023-03-30 14:58:07');

INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (2, 'CTI管理', 'layui-icon-component', NULL, 1, 0, '', 1, 1, NULL, 1, '2023-03-15 07:21:28', '2023-03-24 07:19:18');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (3, 'CTI数据', 'layui-icon-component', 'cti/index', 2, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-24 07:19:19');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (12, 'CTI评估', 'layui-icon-component', 'cti/evaluate', 2, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-24 07:19:19');

INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (4, '权限管理', 'layui-icon-component', NULL, 1, 0, '', 1, 2, NULL, 1, '2023-03-15 07:21:28', '2023-03-24 07:19:18');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (5, '用户管理', 'layui-icon-component', 'user/index', 4, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-24 07:19:19');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (6, '添加用户', 'layui-icon-rate', 'user/add', 5, 1, 'sys:user:add', 1, 2, ' 添加用户', 1, '2023-03-28 15:29:02', '2023-04-03 08:55:18');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (7, '角色管理', 'layui-icon-component', 'role/index', 4, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-27 02:26:41');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (8, '菜单管理', 'layui-icon-component', 'menu/index', 4, 0, '', 1, 3, NULL, 1, '2023-03-15 07:23:02', '2023-03-27 03:28:15');

INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (9, '运营管理', 'layui-icon-component', NULL, 1, 0, '', 1, 3, '', 1, '2023-03-30 15:00:28', '2023-04-03 08:54:27');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (10, '友链管理', 'layui-icon-link', '#', 9, 0, 'sys:link', 1, 3, '', 1, '2023-03-30 14:59:53', '2023-03-30 14:59:53');
INSERT INTO `br_cti_menu` (`id`, `name`, `icon`, `url`, `pid`, `type`, `permission`, `is_show`, `sort`, `remark`, `status`, `created_time`, `updated_time`) VALUES (11, '友链列表', 'layui-icon-util', 'link/index', 10, 0, 'sys:link:index', 1, 3, '', 1, '2023-03-30 15:00:28', '2023-04-03 08:55:21');
COMMIT;


-- ----------------------------
-- Table structure for br_cti_role
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_role`;
CREATE TABLE `br_cti_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '角色名称',
  `code` varchar(50) NOT NULL DEFAULT '' COMMENT '角色编码',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1-启用2-禁用',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of br_cti_role
-- ----------------------------
BEGIN;
INSERT INTO `br_cti_role` (`id`, `name`, `code`, `status`, `sort`, `created_time`, `updated_time`) VALUES (1, '超级管理员', 'super', 1, 3, '2023-03-27 02:01:56', '2023-03-30 16:29:13');
INSERT INTO `br_cti_role` (`id`, `name`, `code`, `status`, `sort`, `created_time`, `updated_time`) VALUES (2, '管理员', 'admin', 1, 0, '2023-03-27 14:46:24', '2023-03-27 18:02:14');
INSERT INTO `br_cti_role` (`id`, `name`, `code`, `status`, `sort`, `created_time`, `updated_time`) VALUES (3, '测试', 'test', 1, 0, '2023-03-27 14:57:33', '2023-03-30 16:53:50');
INSERT INTO `br_cti_role` (`id`, `name`, `code`, `status`, `sort`, `created_time`, `updated_time`) VALUES (4, '用户', 'user', 1, 0, '2023-03-27 14:57:33', '2023-03-30 16:53:50');
COMMIT;

-- ----------------------------
-- Table structure for br_cti_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_role_menu`;
CREATE TABLE `br_cti_role_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `menu_id` int(11) NOT NULL DEFAULT '0' COMMENT '菜单id',
  `role_id` int(11) NOT NULL DEFAULT '0' COMMENT '角色id',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_menu` (`menu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of br_cti_role_menu
-- ----------------------------
BEGIN;
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (40, 1, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (41, 2, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (42, 3, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (43, 4, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (44, 5, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (45, 6, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (46, 7, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (47, 8, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (48, 9, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (49, 10, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (50, 11, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (51, 12, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
INSERT INTO `br_cti_role_menu` (`id`, `menu_id`, `role_id`, `created_time`, `updated_time`) VALUES (52, 13, 1, '2023-03-30 15:00:35', '2023-03-30 15:00:35');
COMMIT;

-- ----------------------------
-- Table structure for br_cti_user
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_user`;
CREATE TABLE `br_cti_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `realname` varchar(50) NOT NULL DEFAULT '' COMMENT '真实姓名',
  `username` varchar(100) NOT NULL DEFAULT '' COMMENT '登录用户名',
  `gender` tinyint(1) NOT NULL DEFAULT '0' COMMENT '性别:1男 2女 3保密',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '头像',
  `mobile` varchar(11) NOT NULL DEFAULT '' COMMENT '手机号',
  `email` varchar(100) NOT NULL DEFAULT '' COMMENT '邮箱地址',
  `address` varchar(255) DEFAULT '' COMMENT '地址',
  `password` varchar(150) NOT NULL DEFAULT '' COMMENT '登录密码',
  `salt` varchar(30) NOT NULL DEFAULT '' COMMENT '盐加密',
  `intro` varchar(255) DEFAULT '' COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1正常 2禁用',
  `login_num` int(11) NOT NULL DEFAULT '0' COMMENT '登录次数',
  `value` int(11) NOT NULL DEFAULT '100' COMMENT '积分值(通过销售获取,默认100积分)',
  `login_ip` varchar(20) NOT NULL DEFAULT '' COMMENT '最近登录ip',
  `login_time` int(11) NOT NULL DEFAULT '0' COMMENT '最近登录时间',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of br_cti_user
-- ----------------------------
BEGIN;
INSERT INTO `br_cti_user` (`id`, `realname`, `username`, `gender`, `avatar`, `mobile`, `email`, `address`, `password`, `salt`, `intro`, `status`, `login_num`,`value`, `login_ip`, `login_time`, `created_time`, `updated_time`) VALUES (1, '管理员', 'admin', 2, '', '123456', 'sd_mwq@163.com', '北京市', '52af3ce8a82f62707789fe00899ed3f0', '123456', 'test', 1, 15,10000, '127.0.0.1', 1680511743, '2023-03-16 09:38:04', '2023-04-03 16:49:03');
COMMIT;
-- ----------------------------
-- Table structure for br_cti_data
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_data`;
CREATE TABLE `br_cti_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '索引ID',
  `cti_id` varchar(255) NOT NULL COMMENT 'CTI的ID',
  `cti_name` varchar(255) NOT NULL COMMENT 'CTI名称',
  `tags` varchar(255) NOT NULL COMMENT '标签',
  `publisher` varchar(255) NOT NULL DEFAULT 'admin' COMMENT '发布者(账号名)',
  `open_source` tinyint(1) NOT NULL COMMENT '开源形式(0:不开源,1:开源,2:部分开源)',
  `type` int(11) NOT NULL DEFAULT '1' COMMENT '类型(1-9)',
  `data` text  COMMENT '数据',
  `data_size` int(11)  COMMENT '数据大小(单位:B)',
  `crypto_pwd` varchar(255) COMMENT '加密密码',
  `download_url` varchar(255)  COMMENT '下载地址',
  `description` text NOT NULL COMMENT '描述',
  `threat_level` int(11) NOT NULL DEFAULT '0' COMMENT '威胁等级',
  `confidence` double NOT NULL DEFAULT '0' COMMENT '可信度分数',
  `need` int(11) NOT NULL DEFAULT '0' COMMENT '需求量',
  `value` double NOT NULL DEFAULT '0' COMMENT '平台评估的价值',
  `compre_value` double NOT NULL DEFAULT '0' COMMENT '综合价值',
  `hash` varchar(32) COMMENT '数据Hash(MD5)',
  `chain_id` varchar(255)  COMMENT '链上ID',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_cti_id` (`cti_id`),
  KEY `idx_publisher` (`publisher`),
  KEY `idx_hash` (`hash`),
  KEY `idx_chain_id` (`chain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for br_cti_sale
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_sale`;
CREATE TABLE `br_cti_sale` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '索引ID',
  `user_id` int(11) NOT NULL COMMENT '购买用户ID',
  `cti_index_id` int(11) NOT NULL COMMENT 'CTI的索引ID',
  `publisher` varchar(255) NOT NULL COMMENT '发布者(realname)',
  `compre_value` double NOT NULL COMMENT '综合价值',
  `hash` varchar(32) NOT NULL COMMENT '数据Hash(MD5)',
  `chain_id` varchar(255) NOT NULL COMMENT '链上ID',
  `crypto_pwd` varchar(255) COMMENT '加密密码',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_cti_id` (`cti_index_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sale_hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Table structure for br_cti_onchain
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_onchain`;
CREATE TABLE `br_cti_onchain` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '索引ID',
  `cti_id` varchar(255) NOT NULL COMMENT 'CTI的编号',
  `publisher` varchar(255) NOT NULL COMMENT '发布者(账号名)',
  `hash` varchar(32) NOT NULL COMMENT '数据Hash(MD5)',
  `chain_id` varchar(255) NOT NULL COMMENT '链上ID(交易ID)',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_cti_id` (`cti_id`),
  KEY `idx_onchain_hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for br_cti_user_role
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_user_role`;
CREATE TABLE `br_cti_user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` int(11) NOT NULL DEFAULT '0' COMMENT '用户id',
  `role_id` int(11) NOT NULL DEFAULT '0' COMMENT '角色id',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_role` (`user_id`,`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of br_cti_user_role
-- ----------------------------
BEGIN;
INSERT INTO `br_cti_user_role` (`id`, `user_id`, `role_id`, `created_time`, `updated_time`) VALUES (1, 1, 1, '2023-03-27 02:02:14', NULL);
COMMIT;

-- ----------------------------
-- Table structure for cti_link
-- ----------------------------
DROP TABLE IF EXISTS `br_cti_link`;
CREATE TABLE `br_cti_link` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '友链名称',
  `url` varchar(255) NOT NULL DEFAULT '' COMMENT '友链地址',
  `image` varchar(255) DEFAULT '' COMMENT 'logo',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态 1-启用 2-禁用',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of cti_link
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

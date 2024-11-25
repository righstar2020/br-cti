/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : PostgreSQL
 Source Server Version : 14
 Source Host           : 127.0.0.1:5432
 Source Schema         : br-cti

 Target Server Type    : PostgreSQL
 Target Server Version : 14
 File Encoding         : UTF8

 Date: 03/04/2023 16:55:50
*/


-- br_cti_menu表转换
DROP TABLE IF EXISTS br_cti_menu;
CREATE TABLE br_cti_menu (
  id SERIAL PRIMARY KEY,
  name varchar(30) NOT NULL DEFAULT '',
  icon varchar(50) DEFAULT NULL,
  url varchar(100) DEFAULT NULL,
  pid integer NOT NULL DEFAULT 0,
  type smallint NOT NULL DEFAULT 0,
  permission varchar(255) DEFAULT '',
  is_show smallint DEFAULT 1,
  sort integer DEFAULT NULL,
  remark varchar(255) DEFAULT NULL,
  status smallint DEFAULT 1,
  created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_time timestamp DEFAULT NULL
);

-- br_cti_role表转换
DROP TABLE IF EXISTS br_cti_role;
CREATE TABLE br_cti_role (
  id SERIAL PRIMARY KEY,
  name varchar(50) NOT NULL DEFAULT '',
  code varchar(50) NOT NULL DEFAULT '',
  status smallint DEFAULT 1,
  sort integer DEFAULT 0,
  created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_time timestamp DEFAULT NULL
);

-- br_cti_role_menu表转换
DROP TABLE IF EXISTS br_cti_role_menu;
CREATE TABLE br_cti_role_menu (
  id SERIAL PRIMARY KEY,
  menu_id integer NOT NULL DEFAULT 0,
  role_id integer NOT NULL DEFAULT 0,
  created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_time timestamp DEFAULT NULL
);
CREATE INDEX idx_role ON br_cti_role_menu(role_id);
CREATE INDEX idx_menu ON br_cti_role_menu(menu_id);

-- br_cti_user表转换
DROP TABLE IF EXISTS br_cti_user;
CREATE TABLE br_cti_user (
  id SERIAL PRIMARY KEY,
  realname varchar(50) NOT NULL DEFAULT '',
  username varchar(100) NOT NULL DEFAULT '',
  gender smallint NOT NULL DEFAULT 0,
  avatar varchar(255) NOT NULL DEFAULT '',
  mobile varchar(11) NOT NULL DEFAULT '',
  email varchar(100) NOT NULL DEFAULT '',
  address varchar(255) DEFAULT '',
  password varchar(150) NOT NULL DEFAULT '',
  salt varchar(30) NOT NULL DEFAULT '',
  intro varchar(255) DEFAULT '',
  status smallint NOT NULL DEFAULT 1,
  login_num integer NOT NULL DEFAULT 0,
  value integer NOT NULL DEFAULT 100,
  login_ip varchar(20) NOT NULL DEFAULT '',
  login_time integer NOT NULL DEFAULT 0,
  created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_time timestamp DEFAULT NULL
);
CREATE INDEX idx_username ON br_cti_user(username);

-- br_cti_data表转换
DROP TABLE IF EXISTS br_cti_data;
CREATE TABLE br_cti_data (
  id SERIAL PRIMARY KEY,
  cti_id varchar(255) NOT NULL,
  cti_name varchar(255) NOT NULL,
  tags varchar(255) NOT NULL,
  publisher varchar(255) NOT NULL DEFAULT 'admin',
  open_source smallint NOT NULL,
  type integer NOT NULL DEFAULT 1,
  data text,
  data_size integer,
  crypto_pwd varchar(255),
  download_url varchar(255),
  description text NOT NULL,
  threat_level integer NOT NULL DEFAULT 0,
  confidence double precision NOT NULL DEFAULT 0,
  need integer NOT NULL DEFAULT 0,
  value double precision NOT NULL DEFAULT 0,
  compre_value double precision NOT NULL DEFAULT 0,
  hash varchar(32),
  chain_id varchar(255),
  created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_time timestamp DEFAULT NULL
);
CREATE INDEX idx_cti_id ON br_cti_data(cti_id);
CREATE INDEX idx_publisher ON br_cti_data(publisher);
CREATE INDEX idx_hash ON br_cti_data(hash);
CREATE INDEX idx_chain_id ON br_cti_data(chain_id);

-- 其他表的转换类似...

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表添加更新时间触发器
CREATE TRIGGER update_br_cti_menu_timestamp BEFORE UPDATE ON br_cti_menu FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_br_cti_role_timestamp BEFORE UPDATE ON br_cti_role FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_br_cti_user_timestamp BEFORE UPDATE ON br_cti_user FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
-- 其他表的触发器...

package service

import (
	"context"
	"errors"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/pkg/convert"
	"github.com/righstar2020/br-cti/pkg/utils"
	"github.com/righstar2020/br-cti/pkg/utils/gconv"
)

//AdminUserLogin 后台系统登录
func (svc *Service) AdminUserLogin(ctx context.Context, params *dto.AdminUserLoginRequest) (*model.AdminUser, error) {
	// 查询用户
	user, err := svc.dao.GetAdminUser(ctx, &model.AdminUser{Username: params.UserName})
	if err != nil && user.Model == nil {
		return nil, errors.New("用户名或者密码不正确")
	}
	// 密码校验
	pwd, _ := utils.EncodeMD5(params.Password + user.Salt)
	if user.Password != pwd {
		return nil, errors.New("密码不正确")
	}
	// 判断当前用户状态
	if user.Status != model.STATE_OPEN {
		return nil, errors.New("您的账号已被禁用,请联系管理员")
	}

	// 更新登录时间、登录IP
	user.LoginIp = params.Ip
	user.LoginTime = time.Now().Unix()
	user.LoginNum++
	svc.dao.UpdateAdminUser(ctx, user)

	return user, nil
}

// AdminUserRegister 后台系统用户注册
func (svc *Service) AdminUserRegister(ctx context.Context, params *dto.AdminUserRegisterRequest) error {
	// 判断该用户是否存在
	isExist, err := svc.dao.GetAdminUser(ctx, &model.AdminUser{Username: params.UserName})
	if err != nil {
		return err
	}
	if isExist.Model != nil {
		return errors.New("该用户已经存在")
	}

	// 设置默认值
	defaultGender := 0 // 假设默认性别为未知
	defaultStatus := 1 // 假设默认状态为启用
	defaultValue := 100 // 默认值
	defaultRoleId := 4 //默认普通用户
	defaultIntro := ""
	defaultAddress := ""

	// 创建用户对象
	adminUser := &model.AdminUser{
		Realname: "",
		Gender:   convert.Int(defaultGender),
		Avatar:   "",
		Mobile:   "",
		Email:    params.Email,
		Username: params.UserName,
		Status:   convert.Int( defaultStatus),
		Value:    convert.Int( defaultValue),
		Intro:    defaultIntro,
		Address:  defaultAddress,
	}

	// 如果没有提供密码，则使用默认值或提示必须提供密码
	if params.Password == "" {
		return errors.New("密码不能为空")
	} else {
		salt := utils.GetRandomString(6)
		pwd, _ := utils.EncodeMD5(params.Password + salt)
		adminUser.Password = pwd
		adminUser.Salt = salt
	}
	// 创建用户
	user, err := svc.dao.CreateAdminUser(ctx, adminUser)
	if err != nil {
		return err
	}

	// 默认为普通用户
	if defaultRoleId != -1 {
		var userRole []*model.AdminUserRole
		userRole = append(userRole, &model.AdminUserRole{
			UserId: user.ID,
			RoleId: int(defaultRoleId),
		})
		svc.dao.BatchCreateAdminUserRole(ctx, userRole)
	}

	return nil
}



//CheckAdminLogin 判断用户登录状态
func (svc *Service) CheckAdminLogin(ctx *gin.Context) bool {
	// 初始化session对象
	session := sessions.Default(ctx)
	// 获取用户ID
	userId := session.Get("adminUserId")
	return userId != nil
}

//AdminLoginOut 退出登录
func (svc *Service) AdminLoginOut(ctx *gin.Context) error {
	// 初始化session对象
	session := sessions.Default(ctx)
	// 清空session
	session.Clear()
	// 保存session数据
	session.Save()
	return nil
}

//GetAdminLoginUid 获取后台登录用户ID
func (svc *Service) GetAdminLoginUid(ctx *gin.Context) int {
	// 初始化session对象
	session := sessions.Default(ctx)
	// 获取用户ID
	userId := gconv.Int(session.Get("adminUserId"))
	// 返回用户ID
	return userId
}

package front_handler

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/pkg/errcode"
	"github.com/righstar2020/br-cti/pkg/utils"
)

type publicHandler struct {
	svc service.Service
}

//PublicHandler Public管理对象
var PublicHandler = new(publicHandler)

//Login 登录
func (c *publicHandler) Login(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	if ctx.Request.Method == http.MethodPost {
		params := &dto.AdminUserLoginRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		svc := service.New(ctx.Request.Context())
		// 校验验证码
		verifyRes := svc.CheckCaptcha(params.IdKey, params.Captcha)
		if !verifyRes {
			response.ToErrorResponse(errcode.CheckCaptchaError.WithDetails(errs.Errors()...))
			return
		}
		//校验登录
		params.Ip = utils.GetClientIp(ctx)
		user, err := svc.AdminUserLogin(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.UnauthorizedAuthNotExist.WithDetails(errs.Errors()...))
			return
		}
		// 初始化session对象
		session := sessions.Default(ctx)
		// 设置session数据
		session.Set("adminUserId", user.ID)
		// 保存session数据
		session.Save()
		response.ToResponse(dto.SuccessResponse{
			Msg: "登录成功",
		})
		return
	} else {
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "front_login.html").WriteTpl()
	}
}

// Register 用户注册
func (c *publicHandler) Register(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	if ctx.Request.Method == http.MethodPost {
		// 绑定请求参数
		params := &dto.AdminUserRegisterRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		svc := service.New(ctx.Request.Context())
		// 校验验证码
		verifyRes := svc.CheckCaptcha(params.IdKey, params.Captcha)
		if !verifyRes {
			response.ToErrorResponse(errcode.CheckCaptchaError.WithDetails("验证码错误"))
			return
		}

		// 调用服务层进行用户注册
		err := svc.AdminUserRegister(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(errs.Errors()...))
			return
		}

		// 注册成功后可以选择返回用户信息或简单的成功消息
		response.ToResponse(dto.SuccessResponse{
			Msg: "注册成功",
		})
		return
	} else {
		// 如果是 GET 请求，则渲染注册页面
		response.BuildTpl(ctx, "front_register.html").WriteTpl()
	}
}



//Captcha 获取验证码
func (c *publicHandler) Captcha(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	captcha, err := svc.GetCaptcha()
	if err != nil {
		response.ToErrorResponse(errcode.GetCaptchaError.WithDetails(err.Error()))
		return
	}
	response.ToResponse(captcha)
	return
}

//LoginOut 退出登录
func (c *publicHandler) LoginOut(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	err := svc.AdminLoginOut(ctx)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	// 跳转登录页,方式：301(永久移动),308(永久重定向),307(临时重定向)
	ctx.Redirect(http.StatusTemporaryRedirect, "/login")
}




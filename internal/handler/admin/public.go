package admin_handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/pkg/errcode"

)

type publicHandler struct {
	svc service.Service
}

//PublicHandler Public管理对象
var PublicHandler = new(publicHandler)

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

//UpdatePwd 修改密码
func (c *publicHandler) UpdatePwd(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	params := &dto.UpdatePwdRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	if params.NewPassword != params.RePassword {
		response.ToErrorResponse(errcode.Fail.WithDetails("两次密码不一致"))
		return
	}
	params.UserId = ctx.GetInt("adminLoginUid")
	svc := service.New(ctx.Request.Context())
	err := svc.UpdatePwd(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(errs.Errors()...))
		return
	}
	response.ToResponse(dto.SuccessResponse{
		Msg: "修改成功",
	})
	return
}

//CheckPwd 校验密码
func (c *publicHandler) CheckPwd(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	params := &dto.CheckPwdRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	params.UserId = ctx.GetInt("adminLoginUid")
	svc := service.New(ctx.Request.Context())
	err := svc.CheckAdminPwd(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponse(dto.SuccessResponse{})
	return
}

//UploadImage 上传图片
func (c *publicHandler) UploadImage(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	// 调用上传方法
	svc := service.New(ctx.Request.Context())
	result, err := svc.UploadImage(ctx)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponse(dto.SuccessResponse{
		Code: 0,
		Msg:  "上传成功",
		Data: result,
	})
}

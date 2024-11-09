package admin_handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/pkg/convert"
	"github.com/righstar2020/br-cti/pkg/errcode"
)

type adminCTISaleHandler struct {
	svc service.Service
}

// AdminCTISaleHandler CTISale管理对象
var AdminCTISaleHandler = new(adminCTISaleHandler)

// Index CTISale列表页
func (c *adminCTISaleHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	// 渲染模板并绑定数据
	response.BuildTpl(ctx, "cti_sale_index.html").WriteTpl()
}
// List CTISale列表(all)
func (c *adminCTISaleHandler) List(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	params := &dto.GetCTISaleListRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	svc := service.New(ctx.Request.Context())
	list, total, err := svc.GetCTISaleList(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponseList(list, int(total))
	return
}
// ListByUserId CTISale列表
func (c *adminCTISaleHandler) ListByUserId(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	params := &dto.GetCTISaleListRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	svc := service.New(ctx.Request.Context())
	//获取用户登录ID
	adminLoginUid := svc.GetAdminLoginUid(ctx)

	// 获取用户信息
	userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
	params.UserId = int64(userInfo.ID)
	list, total, err := svc.GetCTISaleList(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponseList(list, int(total))
	return
}

// SaleInfo CTISale详情
func (c *adminCTISaleHandler) SaleInfo(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	if ctx.Request.Method == http.MethodPost {
		params := &dto.UpdateCTISaleRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		err := svc.UpdateCTISale(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}
		response.ToResponse(dto.SuccessResponse{
			Msg: "修改成功",
		})
		return
	}
	// 获取CTISale信息
	saleId := ctx.Query("sale_id")
	if saleId == "" {
		response.ToErrorResponse(errcode.InvalidParams)
		return
	}
	saleInfo, _ := svc.GetCTISale(svc.GetCtx(), convert.Int(saleId))

	// 渲染模板并绑定数据
	response.BuildTpl(ctx, "cti_sale_info.html").WriteTpl(gin.H{
		"saleInfo": saleInfo,
	})
}

// Buy 购买CTISale
func (c *adminCTISaleHandler) Buy(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())

	if ctx.Request.Method == http.MethodPost {
		params := &dto.CreateCTISaleRequest{}
		valid, errs := app.BindAndValid(ctx, &params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		err := svc.CreateCTISale(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}

		response.ToResponse(dto.SuccessResponse{
			Msg: "购买成功",
		})
		return
	} else {
		// 如果需要展示一些额外的信息，例如类型列表等，可以从服务获取
		// 渲染模板
		response.BuildTpl(ctx, "cti_sale_add.html").WriteTpl(gin.H{})
	}
}

// Edit 编辑CTISale
func (c *adminCTISaleHandler) Edit(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	if ctx.Request.Method == http.MethodPost {
		params := &dto.UpdateCTISaleRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		err := svc.UpdateCTISale(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}

		response.ToResponse(dto.SuccessResponse{
			Msg: "修改成功",
		})
		return
	} else {
		id := ctx.Query("id")
		info, _ := svc.GetCTISale(svc.GetCtx(), convert.Int(id))
		// 渲染模板
		response.BuildTpl(ctx, "cti_sale_edit.html").WriteTpl(gin.H{
			"info": info,
		})
	}
}

// Delete 删除CTISale
func (c *adminCTISaleHandler) Delete(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	id := ctx.Param("id")
	if id == "" {
		response.ToErrorResponse(errcode.InvalidParams)
		return
	}
	svc := service.New(ctx.Request.Context())
	err := svc.DeleteCTISale(svc.GetCtx(), id)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}

	response.ToResponse(dto.SuccessResponse{
		Msg: "删除成功",
	})
	return
}
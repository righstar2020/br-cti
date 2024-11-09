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

type adminCTIHandler struct {
	svc service.Service
}

//AdminCTIHandler CTI管理对象
var AdminCTIHandler = new(adminCTIHandler)

//Index CTI列表页
func (c *adminCTIHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	// 渲染模板并绑定数据
	response.BuildTpl(ctx, "cti_index.html").WriteTpl()
}

//List CTI列表
func (c *adminCTIHandler) List(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	params := &dto.GetCTIListRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}

	svc := service.New(ctx.Request.Context())
	list, total, err := svc.GetCTIDataList(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponseList(list, int(total))
	return
}

//CTIInfo CTI详情
func (c *adminCTIHandler) CTIInfo(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	if ctx.Request.Method == http.MethodPost {
		params := &dto.UpdateCTIRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		svc.UpdateCTIData(svc.GetCtx(), params)
		return
	}
	// 获取CTI信息
	ctiId := ctx.Query("id")
	if ctiId == "" {
		response.ToErrorResponse(errcode.InvalidParams)
		return
	}
	intId := convert.Int(ctiId)
	ctiInfo, _ := svc.GetCTIData(svc.GetCtx(),intId)

	// 渲染模板并绑定数据
	response.BuildTpl(ctx, "cti_info.html").WriteTpl(gin.H{
		"ctiInfo": ctiInfo,
	})
}

//Add 添加CTI
func (c *adminCTIHandler) Add(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())

	if ctx.Request.Method == http.MethodPost {
		params := &dto.CreateCTIRequest{}
		valid, errs := app.BindAndValid(ctx, &params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		err := svc.CreateCTIData(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}

		response.ToResponse(dto.SuccessResponse{
			Msg: "添加成功",
		})
		return
	} else {
		// 如果需要展示一些额外的信息，例如类型列表等，可以从服务获取
		// 渲染模板
		response.BuildTpl(ctx, "cti_add.html").WriteTpl(gin.H{
		})
	}
}



//Edit 编辑CTI
func (c *adminCTIHandler) Edit(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	if ctx.Request.Method == http.MethodPost {
		params := &dto.UpdateCTIRequest{}
		valid, errs := app.BindAndValid(ctx, params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		err := svc.UpdateCTIData(svc.GetCtx(), params)
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
		info, _ := svc.GetCTIData(svc.GetCtx(), convert.Int(id))
		// 渲染模板
		response.BuildTpl(ctx, "cti_edit.html").WriteTpl(gin.H{
			"info":      info,
		})
	}
}

//Delete 删除CTI
func (c *adminCTIHandler) Delete(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	id := ctx.Param("id")
	if id == "" {
		response.ToErrorResponse(errcode.InvalidParams)
		return
	}
	svc := service.New(ctx.Request.Context())
	err := svc.DeleteCTIData(svc.GetCtx(), id)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}

	response.ToResponse(dto.SuccessResponse{
		Msg: "删除成功",
	})
	return
}
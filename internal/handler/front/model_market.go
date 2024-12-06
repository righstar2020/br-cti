package front_handler

import (
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
)

type modelMarketHandler struct {
}

//IndexHandler Public管理对象
var ModelMarketHandler = new(modelMarketHandler)


// Index 处理市场首页请求
func (c *modelMarketHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())


	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "model_market.html").WriteTpl(gin.H{
		})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "model_market.html").WriteTpl(gin.H{
			"userInfo":userInfo,
		})
	}
}


//model详情数据
func (c *modelMarketHandler) Detail(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())

	 adminLoginUid := svc.GetAdminLoginUid(ctx)
	 if adminLoginUid == 0 {
		 //用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "model_detail.html").WriteTpl(gin.H{
		
		})
	} else {
		 // 获取用户信息
		 userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		 response.BuildTpl(ctx, "model_detail.html").WriteTpl(gin.H{
			"userInfo":userInfo,
		})
	 }	
}
//model详情(空页面)
func (c *modelMarketHandler) DetailEmpty(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	 adminLoginUid := svc.GetAdminLoginUid(ctx)
	 if adminLoginUid == 0 {
		 //用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "model_detail.html").WriteTpl(gin.H{
		})
	} else {
		 // 获取用户信息
		 userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		 response.BuildTpl(ctx, "model_detail.html").WriteTpl(gin.H{
			"userInfo":userInfo,
		})
	 }	
}





//查看用户拥有的model
func (c *modelMarketHandler) UserModelList(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	// 渲染模板
	response.BuildTpl(ctx, "model_own.html").WriteTpl(gin.H{
	})
	return
}




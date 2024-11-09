package front_handler

import (
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
)

type bcbrowserHandler struct {
	svc service.Service
}

//IndexHandler Public管理对象
var BCbrowserHandler = new(bcbrowserHandler)

//Index 首页
func (c *bcbrowserHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
		response.BuildTpl(ctx, "bc_browser.html").WriteTpl(gin.H{})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "bc_browser.html").WriteTpl(gin.H{
			"bcSummary": bcSummary,
			"userInfo":  userInfo,
		})
	}

}
//获取区块链数据摘要
func (c *bcbrowserHandler) QueryBCSummary(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
	response.ToResponse(bcSummary)
	return
}
func (c *bcbrowserHandler) QueryCTISaleData(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
	response.ToResponse(bcSummary)
	return
}
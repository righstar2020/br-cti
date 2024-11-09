package front_handler

import (
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
)

type indexHandler struct {
	svc service.Service
}

//IndexHandler Public管理对象
var IndexHandler = new(indexHandler)

//Index 首页
func (c *indexHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
		response.BuildTpl(ctx, "front_index.html").WriteTpl(gin.H{})
	}else{
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "front_index.html").WriteTpl(gin.H{
			"userInfo": userInfo,
		})
	}
	
}




package front_handler

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
)

type knowledgePlaneHandler struct {
	svc service.Service
}

//IndexHandler Public管理对象
var KnowledgePlaneHandler = new(knowledgePlaneHandler)

//Index 首页
func (c *knowledgePlaneHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	log.Println("knowledgePlaneHandler.Index ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓")
	if adminLoginUid == 0 {
		//用户未登录
		response.BuildTpl(ctx, "knowledge_plane_normal.html").WriteTpl(gin.H{})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "knowledge_plane_normal.html").WriteTpl(gin.H{
			"bcSummary": bcSummary,
			"userInfo":  userInfo,
		})
	}

}
//Normal 攻击特征
func (c *knowledgePlaneHandler) Normal(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	log.Println("knowledgePlaneHandler.Normal ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓")
	if adminLoginUid == 0 {
		//用户未登录
		response.BuildTpl(ctx, "knowledge_plane_normal.html").WriteTpl(gin.H{})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "knowledge_plane_normal.html").WriteTpl(gin.H{
			"bcSummary": bcSummary,
			"userInfo":  userInfo,
		})
	}

}
//Traffic 攻击流量
func (c *knowledgePlaneHandler) Traffic(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
		response.BuildTpl(ctx, "knowledge_plane_traffic.html").WriteTpl(gin.H{})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		bcSummary, _ := svc.GetBCSummary(svc.GetCtx()) //获取区块链数据摘要
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "knowledge_plane_traffic.html").WriteTpl(gin.H{
			"bcSummary": bcSummary,
			"userInfo":  userInfo,
		})
	}

}


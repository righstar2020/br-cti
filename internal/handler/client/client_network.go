package client_handler

import (


	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/app"
)

type clientNetworkHandler struct {
	svc service.Service
}

var ClientNetworkHandler = new(clientNetworkHandler)
func (c *clientNetworkHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)	
	response.BuildTpl(ctx, "client_network.html").WriteTpl(gin.H{
	})
	
}

func (c *clientNetworkHandler) Wallet(ctx *gin.Context) {
	response := app.NewResponse(ctx)	
	response.BuildTpl(ctx, "client_wallet.html").WriteTpl(gin.H{
	})
	
}
func (c *clientNetworkHandler) LocalData(ctx *gin.Context) {
	response := app.NewResponse(ctx)	
	response.BuildTpl(ctx, "client_local_data.html").WriteTpl(gin.H{
	})	
}

func (c *clientNetworkHandler) MLModel(ctx *gin.Context) {
	response := app.NewResponse(ctx)	
	response.BuildTpl(ctx, "client_ml_model.html").WriteTpl(gin.H{
	})
	
}
package front_handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/internal/vo"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/pkg/convert"
	"github.com/righstar2020/br-cti/pkg/errcode"
)

type ctiMarketHandler struct {
	svc service.Service
}

//IndexHandler Public管理对象
var CTIMarketHandler = new(ctiMarketHandler)


// Index 处理市场首页请求
func (c *ctiMarketHandler) Index(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	requestParam := &dto.GetCTIListRequest{}
	valid, errs := app.BindAndValid(ctx, &requestParam)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	if requestParam.Page ==0 {
		requestParam.Page =1
	}
	if requestParam.PageSize ==0 {
		requestParam.PageSize =20
	}
	// 获取CTI数据列表
	ctiDataList, total, err := svc.GetCTIDataList(svc.GetCtx(), requestParam)
	// jsonBytes, _ := json.Marshal(ctiDataRawList)
	// var ctiDataList  []interface{}
	// _ = json.Unmarshal(jsonBytes,&ctiDataList)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "cti_market.html").WriteTpl(gin.H{
			"ctiDataList":    ctiDataList,
			"total":   total,
			"page":    requestParam.Page,
			"PageSize": requestParam.PageSize,
		})
	} else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "cti_market.html").WriteTpl(gin.H{
			"ctiDataList":    ctiDataList,
			"total":   total,
			"page":    requestParam.Page,
			"pageSize": requestParam.PageSize,
			"userInfo":userInfo,
		})
	}
}
//CTI查询
func (c *ctiMarketHandler) Query(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())

	// 初始化请求参数
	ctiId := ctx.Query("id")
	print(ctiId)
	if ctiId== "" {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails("ID不能为空"))
		return
	}
	ctiData,err := svc.GetCTIData(svc.GetCtx(), convert.Int(ctiId))
	if err!=nil{
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	// 将 ctiData 转换成 JSON 字符串
	response.ToResponse(ctiData)
}
//分页查询
func (c *ctiMarketHandler) List(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	requestParam := &dto.GetCTIListRequest{}
	valid, errs := app.BindAndValid(ctx, &requestParam)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}
	if requestParam.Page ==0 {
		requestParam.Page =1
	}
	if requestParam.PageSize ==0 {
		requestParam.PageSize =20
	}
	// 获取CTI数据列表
	ctiDataList, total, err := svc.GetCTIDataList(svc.GetCtx(), requestParam)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	response.ToResponseList(ctiDataList, int(total))
}
//CTI详情数据
func (c *ctiMarketHandler) Detail(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())

	// 初始化请求参数
	ctiId := ctx.Query("id")
	if ctiId== "" {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails("ID不能为空"))
		return
	}
	ctiData,err := svc.GetCTIData(svc.GetCtx(), convert.Int(ctiId))
	if err!=nil{
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	// 将 ctiData 转换成 JSON 字符串
	jsonBytes, _ := json.Marshal(ctiData)
	ctiDataMap := make(map[string]interface{})
	_ = json.Unmarshal(jsonBytes,&ctiDataMap)
	// 名称映射
	ctiLabelMap := map[string]string{
		"id":"ID",
		"cti_id":"情报ID",
		"cti_name":"情报名称",
		"open_source":"是否开源",
		"publisher":"发布者",
		"tags":"标签",
		"threat_level":"威胁等级",
		"confidence":"置信度",
		"value":"价值",
		"compre_value":"综合价值",
		"data":"数据",
		"data_size":"数据大小",
		"description":"描述",
		"hash":"哈希值",
		"chain_id":"链上HASH",
		"created_time":"创建时间",
		"updated_time":"更新时间",
 	}
	// 创建一个切片用于保存键的顺序
	keysOrder := []string{
		"id", "cti_id", "cti_name", "open_source", "publisher", "tags", "threat_level", "confidence", "value", "compre_value",
		"data", "data_size", "description", "hash", "chain_id", "created_time", "updated_time",
	}
	var ctiDataResponse []interface{}
	// 使用keysOrder来确定遍历的顺序
	for _, key := range keysOrder {
		value, ok := ctiLabelMap[key]
		if ok {
			ctiObj := map[string]string{
				"label": value,
				"key":   key,
				"value": convert.String(ctiDataMap[key]),
			
			}
			ctiDataResponse = append(ctiDataResponse, ctiObj)
		}
	}
	 adminLoginUid := svc.GetAdminLoginUid(ctx)
	 if adminLoginUid == 0 {
		 //用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "cti_detail.html").WriteTpl(gin.H{
			"ctiData": ctiDataMap,
			"ctiDataRange":ctiDataResponse,

		})
	} else {
		 // 获取用户信息
		 userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		 response.BuildTpl(ctx, "cti_detail.html").WriteTpl(gin.H{
			"ctiData": ctiDataMap,
			"userInfo":userInfo,
			"ctiDataRange":ctiDataResponse,
		})
	 }	
}
//CTI详情(空页面)
func (c *ctiMarketHandler) DetailEmpty(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	 adminLoginUid := svc.GetAdminLoginUid(ctx)
	 if adminLoginUid == 0 {
		 //用户未登录
		// 渲染模板并绑定数据
		response.BuildTpl(ctx, "cti_detail.html").WriteTpl(gin.H{
		})
	} else {
		 // 获取用户信息
		 userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		 response.BuildTpl(ctx, "cti_detail.html").WriteTpl(gin.H{
			"userInfo":userInfo,
		})
	 }	
}



//购买CTI
func (c *ctiMarketHandler) Buy(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	//获取用户登录ID
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	if adminLoginUid == 0 {
		//用户未登录
	   // 跳转登录页,方式：301(永久移动),308(永久重定向),307(临时重定向)
		ctx.Redirect(http.StatusTemporaryRedirect, "/login")
		return
   } else {
		// 获取用户信息
		userInfo, _ := svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
		// 初始化请求参数
		ctiId := ctx.PostForm("id")
		// 去除字符串两端的空白字符
		ctiIdTrimmed := strings.TrimSpace(ctiId)
		if ctiId== "" {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails("ID不能为空"))
			return
		}
		print(ctiId)
		//查询CTI数据
		ctiData,err := svc.GetCTIData(svc.GetCtx(), convert.Int(ctiIdTrimmed))
		if err!=nil{
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}
		//创建CTI交易
		ctiSaleRequest := &dto.CreateCTISaleRequest{
			UserID:       userInfo.ID,
			CTIIndexID:   ctiData.ID,
			Publisher:    ctiData.Publisher,
			CompreValue:  ctiData.CompreValue,
			Hash:         ctiData.Hash,
			ChainID:      ctiData.ChainID,

		}
		err = svc.CreateCTISale(svc.GetCtx(), ctiSaleRequest)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}
		response.ToResponse(dto.SuccessResponse{
			Msg: "购买成功",
		})
	}
}

//上传CTI数据
func (c *ctiMarketHandler) Upload(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	//获取用户登录ID
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	userInfo :=&vo.AdminUserInfoVo{}
	if adminLoginUid == 0 {
		//用户未登录
	   // 跳转登录页,方式：301(永久移动),308(永久重定向),307(临时重定向)
		ctx.Redirect(http.StatusTemporaryRedirect, "/login")
		return
	} else {
		// 获取用户信息
		userInfo, _ = svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
	}
	if ctx.Request.Method == http.MethodPost {
		params := &dto.CreateCTIRequest{}
		valid, errs := app.BindAndValid(ctx, &params)
		if !valid {
			response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
			return
		}
		//设置发布者账号名称
		params.Publisher = userInfo.Username
		//使用默认配置创建CTI
		err := svc.CreateCTIData(svc.GetCtx(), params)
		if err != nil {
			response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
			return
		}

		response.ToResponse(dto.SuccessResponse{
			Msg: "上传成功",
		})
		return
	} else {
		// 如果需要展示一些额外的信息，例如类型列表等，可以从服务获取
		// 渲染模板
		response.BuildTpl(ctx, "cti_upload.html").WriteTpl(gin.H{
			"userInfo":userInfo,
		})
	}
}
//UploadCTIFile 上传CTI文件
func (c *ctiMarketHandler) UploadCTIFile(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	// 调用上传方法
	svc := service.New(ctx.Request.Context())
	result, err := svc.UploadFile(ctx)
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



//查看用户拥有的CTI
func (c *ctiMarketHandler) UserCTIList(ctx *gin.Context) {
	response := app.NewResponse(ctx)
	svc := service.New(ctx.Request.Context())
	//获取用户登录ID
	adminLoginUid := svc.GetAdminLoginUid(ctx)
	userInfo :=&vo.AdminUserInfoVo{}
	if adminLoginUid == 0 {
		//用户未登录
		ctx.Redirect(http.StatusTemporaryRedirect, "/login")
		return
	} else {
		// 获取用户信息
		userInfo, _ = svc.GetAdminUserInfo(svc.GetCtx(), adminLoginUid)
	}
	//获取CTI的购买记录
	params := &dto.GetCTISaleListRequest{}
	valid, errs := app.BindAndValid(ctx, params)
	if !valid {
		response.ToErrorResponse(errcode.InvalidParams.WithDetails(errs.Errors()...))
		return
	}

	//获取特定用户的CTI购买记录
	params.UserId = int64(userInfo.ID)
	buyList, total, err := svc.GetCTISaleListByUserId(svc.GetCtx(), params)
	if err != nil {
		response.ToErrorResponse(errcode.Fail.WithDetails(err.Error()))
		return
	}
	//根据buyList查询CTI数据
	var userCtiDataList []*model.CTIData
	for _, v := range buyList {
		ctiData, _ := svc.GetCTIData(svc.GetCtx(), v.CTIIndexID)
		userCtiDataList = append(userCtiDataList, ctiData)
	}
	// 渲染模板
	response.BuildTpl(ctx, "cti_own.html").WriteTpl(gin.H{
		"userInfo": userInfo,
		"userBuyList": buyList, //购买记录
		"userCtiList":userCtiDataList, //CTI数据
		"total":total,
	})
	return
}




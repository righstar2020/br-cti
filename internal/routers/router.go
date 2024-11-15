package router

import (
	"fmt"
	"html/template"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/multitemplate"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/global"
	adminHandler "github.com/righstar2020/br-cti/internal/handler/admin"
	frontHandler "github.com/righstar2020/br-cti/internal/handler/front"
	clientHandler "github.com/righstar2020/br-cti/internal/handler/client"
	"github.com/righstar2020/br-cti/internal/middleware"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/internal/widget"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/pkg/limiter"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/swaggo/gin-swagger/swaggerFiles"
)

var methodLimiters = limiter.NewMethodLimiter().AddBuckets(
	limiter.LimiterBucketRule{
		Key:          "/auth",
		FillInterval: time.Second,
		Capacity:     10,
		Quantum:      10,
	},
)

func NewRouter() *gin.Engine {
	r := gin.New()
	r.Use(middleware.Cors())
	if global.ServerSetting.RunMode == "debug" {
		r.Use(gin.Logger())
		r.Use(gin.Recovery())
	} else {
		r.Use(middleware.AccessLog())
		r.Use(middleware.Recovery())
	}
	// 创建基于cookie的存储引擎，secret11111 参数是用于加密的密钥
	store := cookie.NewStore([]byte("MsW32dQN2342434I5C43E6"))
	// 设置session中间件，参数mysession，指的是session的名字，也是cookie的名字
	// store是前面创建的存储引擎，我们可以替换成其他存储引擎
	r.Use(sessions.Sessions("cti_admin", store))

	//加载模板
	r.HTMLRender = loadTemplates("views")
	// 设置静态资源路由
	r.Static("/static", "./static")

	r.NoRoute(HandleNotFound)
	r.NoMethod(HandleNotFound)

	r.Use(middleware.RateLimiter(methodLimiters))
	r.Use(middleware.ContextTimeout(global.AppSetting.DefaultContextTimeout))
	//r.Use(middleware.Translations())

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/check", func(c *gin.Context) {
		c.JSON(200, "OK")
		return
	})
	/* 文件上传 */
	upload := r.Group("upload")
	{
		// 上传图片
		upload.POST("/uploadImage", adminHandler.PublicHandler.UploadImage)
	}

	r.Use(middleware.Tracer())
	r.Use(middleware.AdminAuth()) //验证登录

	clientGroup := r.Group("/") //客户端路由
	_ = createClientRouter(clientGroup)
	frontGroup := r.Group("/")
	_ = createFrontRouter(frontGroup)
	adminGroup := r.Group("/") //不单独设置后台路由的后缀(需保证没有路由重复)
	_ = createAdminRouter(adminGroup)
	return r
}
func createClientRouter(r *gin.RouterGroup) *gin.RouterGroup {
	//创建前台路由
	index := r.Group("/client")
	{
		index.GET("/network", clientHandler.ClientNetworkHandler.Index)  
		index.GET("/wallet", clientHandler.ClientNetworkHandler.Wallet) 
		index.GET("/local-data", clientHandler.ClientNetworkHandler.LocalData)  
		index.GET("/ml-model", clientHandler.ClientNetworkHandler.MLModel)
	}
	
	return r
}


func createFrontRouter(r *gin.RouterGroup) *gin.RouterGroup {
	//创建前台路由
	index := r.Group("/")
	{
		index.GET("/", frontHandler.IndexHandler.Index)                    //首页
		index.GET("/index", frontHandler.IndexHandler.Index)               //首页
		index.Any("/login", frontHandler.PublicHandler.Login)              //登录
		index.Any("/register", frontHandler.PublicHandler.Register)           //注册
		index.GET("/captcha", frontHandler.PublicHandler.Captcha)          //获取验证码
		index.GET("/logout", adminHandler.PublicHandler.LoginOut)          //退出

	}
	ctiMarket := r.Group("/cti-market")
	{
		ctiMarket.GET("/", frontHandler.CTIMarketHandler.Index)              //CTI市场
		ctiMarket.GET("/index", frontHandler.CTIMarketHandler.Index)        //CTI市场
		ctiMarket.POST("/query", frontHandler.CTIMarketHandler.Query)       //CTI详情
		ctiMarket.POST("/list", frontHandler.CTIMarketHandler.List)       //CTI详情
		ctiMarket.GET("/detail", frontHandler.CTIMarketHandler.Detail)      //CTI详情
		ctiMarket.POST("/buy", frontHandler.CTIMarketHandler.Buy)           //购买CTI
		ctiMarket.GET("/upload", frontHandler.CTIMarketHandler.Upload)      //CTI上传界面
		ctiMarket.POST("/upload", frontHandler.CTIMarketHandler.Upload)      //CTI上传
		ctiMarket.POST("/uploadCtiFile", frontHandler.CTIMarketHandler.UploadCTIFile)  //CTI文件上传
		ctiMarket.GET("/own", frontHandler.CTIMarketHandler.UserCTIList)      //已拥有的CTI列表
	}
	knowledgePlane := r.Group("/knowledge-plane")
	{
		knowledgePlane.GET("/", frontHandler.KnowledgePlaneHandler.Index)
		knowledgePlane.GET("/index", frontHandler.KnowledgePlaneHandler.Index)			
	}
	BCBrowser := r.Group("/bc-browser")
	{
		BCBrowser.GET("/", frontHandler.BCbrowserHandler.Index)
		BCBrowser.GET("/index", frontHandler.BCbrowserHandler.Index)
		BCBrowser.POST("/query_bc_summary", frontHandler.BCbrowserHandler.QueryBCSummary)
		BCBrowser.POST("/query_cti_sale_data", frontHandler.BCbrowserHandler.QueryCTISaleData)
			
	}
	 

	return r
}
func createAdminRouter(r *gin.RouterGroup) *gin.RouterGroup {
	//创建后台路由
	index := r.Group("/")
	{
		index.GET("/admin", adminHandler.IndexHandler.Index)            //首页
		index.GET("/welcome", adminHandler.IndexHandler.Welcome)        //欢迎页
		index.Any("/user_info", adminHandler.AdminUserHandler.UserInfo) //获取用户信息
		index.POST("/update_pwd", adminHandler.PublicHandler.UpdatePwd) //修改密码
		index.POST("/check_pwd", adminHandler.PublicHandler.CheckPwd)   //校验密码
	}
	/*CTI管理*/
	cti := r.Group("cti")
	{
		cti.GET("/index", adminHandler.AdminCTIHandler.Index)        //cti详情
		cti.GET("/info", adminHandler.AdminCTIHandler.CTIInfo)       //cti详情
		cti.GET("/evaluate", adminHandler.AdminCTIHandler.Index)     //cti评估
		cti.POST("/list", adminHandler.AdminCTIHandler.List)         //cti列表
		cti.Any("/add", adminHandler.AdminCTIHandler.Add)            //添加cti
		cti.Any("/edit", adminHandler.AdminCTIHandler.Edit)          //修改cti
		cti.POST("/delete/:id", adminHandler.AdminCTIHandler.Delete) //删除
	}
	// /*CTI评估*/
	// cti_evaluate := r.Group("cti_evaluate")
	// {
	// 	cti_evaluate.GET("/index", adminHandler.AdminCTIHandler.Index)        //cti详情
	// 	cti_evaluate.GET("/info", adminHandler.AdminCTIHandler.CTIInfo)       //cti详情
	// 	cti_evaluate.POST("/list", adminHandler.AdminCTIHandler.List)         //cti列表
	// 	cti_evaluate.Any("/add", adminHandler.AdminCTIHandler.Add)            //添加cti
	// 	cti_evaluate.Any("/edit", adminHandler.AdminCTIHandler.Edit)          //修改cti
	// 	cti_evaluate.POST("/delete/:id", adminHandler.AdminCTIHandler.Delete) //删除
	// }
	/*CTI销售*/
	sale := r.Group("sale")
	{
		sale.GET("/index", adminHandler.AdminCTISaleHandler.Index)        //cti出售详情
		sale.GET("/info", adminHandler.AdminCTISaleHandler.SaleInfo)       //cti详情
		sale.POST("/list", adminHandler.AdminCTISaleHandler.List)         //cti列表
		sale.POST("/list_by_user_id", adminHandler.AdminCTISaleHandler.ListByUserId)         //cti列表
		sale.Any("/buy", adminHandler.AdminCTISaleHandler.Buy)            //购买cti
		sale.Any("/edit", adminHandler.AdminCTISaleHandler.Edit)          //修改cti
		sale.POST("/delete/:id", adminHandler.AdminCTISaleHandler.Delete) //删除
	}
	
	/* 管理员管理 */
	user := r.Group("user")
	{
		user.GET("/index", adminHandler.AdminUserHandler.Index)          //用户详情
		user.GET("/info", adminHandler.AdminUserHandler.UserInfo)        //用户详情
		user.POST("/list", adminHandler.AdminUserHandler.List)           //用户列表
		user.Any("/add", adminHandler.AdminUserHandler.Add)              //添加用户
		user.POST("/setStatus", adminHandler.AdminUserHandler.SetStatus) //设置状态
		user.Any("/edit", adminHandler.AdminUserHandler.Edit)            //修改用户
		user.POST("/delete/:id", adminHandler.AdminUserHandler.Delete)   //删除
	}
	/* 菜单管理 */
	menu := r.Group("menu")
	{
		menu.GET("/index", adminHandler.MenuHandler.Index)        //菜单首页
		menu.POST("/list", adminHandler.MenuHandler.List)         //菜单列表
		menu.Any("/add", adminHandler.MenuHandler.Add)            //添加菜单
		menu.Any("/edit", adminHandler.MenuHandler.Edit)          //修改菜单
		menu.POST("/delete/:id", adminHandler.MenuHandler.Delete) //删除
	}
	/* 角色管理 */
	role := r.Group("role")
	{
		role.GET("/index", adminHandler.RoleHandler.Index)                      //角色首页
		role.POST("/list", adminHandler.RoleHandler.List)                       //角色列表
		role.Any("/add", adminHandler.RoleHandler.Add)                          //添加角色
		role.Any("/edit", adminHandler.RoleHandler.Edit)                        //修改角色
		role.POST("/delete/:ids", adminHandler.RoleHandler.Delete)              //删除
		role.POST("/setStatus", adminHandler.RoleHandler.SetStatus)             //设置状态
		role.GET("/menu_list/:role_id", adminHandler.RoleHandler.MenuList)      //角色菜单列表
		role.POST("/menu_list/save", adminHandler.RoleHandler.SaveRoleMenuList) //角色菜单列表保存
	}

	/* 友链管理 */
	link := r.Group("link")
	{
		link.GET("/index", adminHandler.LinkHandler.Index)          //友链首页
		link.POST("/list", adminHandler.LinkHandler.List)           //友链列表
		link.Any("/add", adminHandler.LinkHandler.Add)              //添加友链
		link.Any("/edit", adminHandler.LinkHandler.Edit)            //修改友链
		link.POST("/delete/:id", adminHandler.LinkHandler.Delete)   //删除友链
		link.POST("/setStatus", adminHandler.LinkHandler.SetStatus) //设置状态
	}
	return r
}
func HandleNotFound(c *gin.Context) {
	c.JSON(app.CODE_SUCCESS, &app.ResponseCommonStruct{Code: app.CODE_ROUTE_ERROR, Msg: fmt.Sprintf("路由%s不存在或不支持%s请求", c.Request.URL.String(), c.Request.Method)})
	return
}

func loadTemplates(templatesDir string) multitemplate.Renderer {
	r := multitemplate.NewRenderer()
	// template自定义函数
	funcMap := template.FuncMap{
		"getByKey": func(key string, data map[string]string) string {
			if val, ok := data[key]; ok {
				return val
			}
			return key
		},
		"formatTime": func(timestampStr string) string {
			// 尝试将字符串转换为int64类型的时间戳
			timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
			if err != nil {
				return ""
			}
			// 创建time.Time对象
			t := time.Unix(timestamp, 0)
			// 格式化时间
			formattedTime := t.Format("2006-01-02 15:04:05")
			return formattedTime
		},
		"formatMyTime":func (myTime model.MyTime) string {
			tTime := time.Time(myTime)
			return tTime.Format("2006-01-02 15:04:05")
		},
		"StringToLower": func(str string) string {
			return strings.ToLower(str)
		},
		"date2": func() string {
			return time.Now().Format("2006-01-02 15:04:05.00000")
		},
		"safe": func(str string) template.HTML {
			return template.HTML(str)
		},
		"query":    widget.Query,
		"add":      widget.Add,
		"edit":     widget.Edit,
		"delete":   widget.Delete,
		"expand":   widget.Expand,
		"collapse": widget.Collapse,
		"addz":     widget.Addz,
		"in":       widget.In,
	}
	//加载客户端模板
	r = loadClientTemplates(r,funcMap,templatesDir+"/client")
	//加载前台模板
	r = loadFrontTemplates(r,funcMap,templatesDir+"/front")
	//加载后台模板
	r = loadAdminTemplates(r,funcMap, templatesDir+"/admin")
	return r
}
func loadClientTemplates(r multitemplate.Renderer,funcMap template.FuncMap , templatesDir string) multitemplate.Renderer {
	// 非模板嵌套
	adminHtmls, err := filepath.Glob(templatesDir + "/*.html")
	if err != nil {
		panic(err.Error())
	}
	for _, html := range adminHtmls {
		r.AddFromFilesFuncs(filepath.Base(html), funcMap, html)
	}
	return r
}
func loadFrontTemplates(r multitemplate.Renderer,funcMap template.FuncMap , templatesDir string) multitemplate.Renderer {
	// 非模板嵌套
	adminHtmls, err := filepath.Glob(templatesDir + "/*.html")
	if err != nil {
		panic(err.Error())
	}
	for _, html := range adminHtmls {
		r.AddFromFilesFuncs(filepath.Base(html), funcMap, html)
	}

	// 布局模板
	layouts, err := filepath.Glob(templatesDir + "/layouts/*.html")
	if err != nil {
		panic(err.Error())
	}

	// 嵌套的内容模板
	includes, err := filepath.Glob(templatesDir + "/includes/*.html")
	if err != nil {
		panic(err.Error())
	}

	

	// 将主模板，include页面，layout子模板组合成一个完整的html页面
	for _, include := range includes {
		// 文件名称
		baseName := filepath.Base(include)
		files := []string{}
		files = append(files, templatesDir+"/layouts/main.html", include)
		files = append(files, layouts...)
		r.AddFromFilesFuncs(baseName, funcMap, files...)
	}
	return r
}
func loadAdminTemplates(r multitemplate.Renderer,funcMap template.FuncMap ,templatesDir string) multitemplate.Renderer {
	// 非模板嵌套
	adminHtmls, err := filepath.Glob(templatesDir + "/*.html")
	if err != nil {
		panic(err.Error())
	}
	
	for _, html := range adminHtmls {
		r.AddFromFilesFuncs(filepath.Base(html), funcMap, html)
	}

	// 布局模板
	layouts, err := filepath.Glob(templatesDir + "/layouts/*.html")
	if err != nil {
		panic(err.Error())
	}

	// 嵌套的内容模板
	includes, err := filepath.Glob(templatesDir + "/includes/**/*.html")
	if err != nil {
		panic(err.Error())
	}

	

	// 将主模板，include页面，layout子模板组合成一个完整的html页面
	for _, include := range includes {
		// 文件名称
		baseName := filepath.Base(include)
		files := []string{}
		if strings.Contains(baseName, "edit") || strings.Contains(baseName, "add") {
			files = append(files, templatesDir+"/layouts/form.html", include)
		} else {
			files = append(files, templatesDir+"/layouts/layout.html", include)
		}
		files = append(files, layouts...)
		r.AddFromFilesFuncs(baseName, funcMap, files...)
	}
	return r
}

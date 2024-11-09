/**
 * 后台登录验证中间件
 * @author mwq
 * @since 2021/8/20
 * @File : checkauth
 */
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/righstar2020/br-cti/internal/service"
	"github.com/righstar2020/br-cti/pkg/utils"
)

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		//放行设置 不需要登录的url
		loginExceptUrl := map[string]interface{}{
			"/captcha": 0,
			"/login":   1,
			"/register": 2,
			"/":3,
			"/index":4,
			"/introduction":5,
			"/cti-market":6,
			"/bc-browser":7,
			"/cti-market/":8,
			"/bc-browser/":9,
			"/client/":10,
		}
		svc := service.New(c.Request.Context())
		if !utils.InStringArray(c.Request.URL.Path, loginExceptUrl) && !strings.Contains(c.Request.URL.Path, "/static/") {
			if !svc.CheckAdminLogin(c) {
				// 跳转登录页,方式：301(永久移动),308(永久重定向),307(临时重定向)
				c.Redirect(http.StatusTemporaryRedirect, "/login")
				return
			}
		}
		c.Set("adminLoginUid", svc.GetAdminLoginUid(c))
		// 前置中间件
		c.Next()
	}
}

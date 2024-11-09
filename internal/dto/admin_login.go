/**
 * @describe 登录Dto
 * @author mwqnice
 * @since 2023/9/9
 * @File : login
 */
package dto

//AdminUserLoginRequest 系统登录
type AdminUserLoginRequest struct {
	UserName string `form:"username" binding:"required,min=5,max=30" json:"username"`
	Password string `form:"password" binding:"required,min=1,max=12" json:"password"`
	Captcha  string `form:"captcha" binding:"required,min=4,max=6" json:"captcha"`
	IdKey    string `form:"idkey" binding:"required" json:"idkey"`
	Ip       string `json:"ip"`
}
// 注册请求
type AdminUserRegisterRequest struct {
	UserName string `form:"username" binding:"required,min=5,max=30" json:"username"`
	Password string `form:"password" binding:"required,min=1,max=20" json:"password"`
	Email    string `form:"email" binding:"required" json:"email"`
	Captcha  string `form:"captcha" binding:"required" json:"captcha"`
	IdKey    string `form:"idkey" binding:"required" json:"idkey"`
}
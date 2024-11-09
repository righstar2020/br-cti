package vo

import "github.com/righstar2020/br-cti/internal/model"

//AdminUserInfoVo 用户信息Vo
type AdminUserInfoVo struct {
	*model.AdminUser
	GenderName string      `json:"gender_name"` // 性别
	RoleList   interface{} `json:"role_list"`   // 角色列表
	RoleIds    []int       `json:"role_ids"`    // 角色ID
	LoginTimeFormat string `json:"login_time_format"`
}

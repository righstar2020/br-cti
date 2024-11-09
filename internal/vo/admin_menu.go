package vo

import "github.com/righstar2020/br-cti/internal/model"

//MenuTreeNode 菜单Vo
type MenuTreeNode struct {
	*model.AdminMenu
	Children []*MenuTreeNode `json:"children"` // 子菜单
}

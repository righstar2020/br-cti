package dto

// 获取CTI销售列表请求
type GetCTISaleListRequest struct {
	UserId   int64  `form:"user_id" json:"user_id"`
	Page     int64  `form:"page" json:"page"`
	PageSize int64  `form:"page_size" json:"page_size"`
}

// 创建CTI销售记录请求
type CreateCTISaleRequest struct {
	UserID        int       `form:"user_id"  json:"user_id"`           // 购买用户ID
	CTIIndexID    int       `form:"cti_index_id"  json:"cti_index_id"` // CTI的索引ID
	Publisher     string    `form:"publisher"  json:"publisher"`         // 发布者(realname)
	CompreValue   float64   `form:"compre_value"  json:"compre_value"` // 综合价值
	Hash          string    `form:"hash"  json:"hash"`                 // 数据Hash(MD5)
	ChainID       string    `form:"chain_id"  json:"chain_id"`         // 链上ID
}

// 更新CTI销售记录请求
type UpdateCTISaleRequest struct {
	ID            int       `form:"id" binding:"required" json:"id"`                     // 销售记录的ID
	UserID        int       `form:"user_id" binding:"required" json:"user_id"`           // 购买用户ID
	CTIIndexID    int       `form:"cti_index_id" binding:"required" json:"cti_index_id"` // CTI的索引ID
	Publisher     string    `form:"publisher" binding:"required" json:"publisher"`         // 发布者(realname)
	CompreValue   float64   `form:"compre_value" binding:"required" json:"compre_value"` // 综合价值
	Hash          string    `form:"hash" binding:"required" json:"hash"`                 // 数据Hash(MD5)
	ChainID       string    `form:"chain_id" binding:"required" json:"chain_id"`         // 链上ID
}
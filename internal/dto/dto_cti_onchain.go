package dto

// 获取CTI上链记录列表请求
type GetCTIOnchainListRequest struct {
	Publisher string  `form:"publisher" json:"publisher"`     // CTI编号
	Page      int64  `form:"page" json:"page"`          // 当前页码
	PageSize  int64  `form:"page_size" json:"page_size"` // 每页数量
}

// 创建CTI上链记录请求
type CreateCTIOnchainRequest struct {
	CTIId      string      `form:"cti_id" json:"cti_id"`         // CTI编号
	Publisher  string   `form:"publisher" json:"publisher"`    // 发布者(账号名)
	Hash       string   `form:"hash" json:"hash"`             // 数据Hash(MD5)
	ChainID    string   `form:"chain_id" json:"chain_id"`     // 链上ID
}

// 更新CTI上链记录请求
type UpdateCTIOnchainRequest struct {
	ID         int      `form:"id" binding:"required" json:"id"` // 上链记录的ID
	CTIId      string      `form:"cti_id" binding:"required" json:"cti_id"` // CTI编号
	Publisher  string   `form:"publisher" binding:"required" json:"publisher"` // 发布者(账号名)
	Hash       string   `form:"hash" binding:"required" json:"hash"`       // 数据Hash(MD5)
	ChainID    string   `form:"chain_id" binding:"required" json:"chain_id"` // 链上ID
}
package dto

//GetAdminMenuListRequest 获取菜单列表
type GetCTIListRequest struct {
	Name     string `form:"name" json:"name"`
	Page     int64  `form:"page" json:"page"`
	PageSize int64  `form:"page_size" json:"page_size"`
}
type GetCTIDetailRequest struct {
	CTIId string `form:"cti_id" binding:"required" json:"cti_id"` // CTI的ID
}

// 添加CTI
type CreateCTIRequest struct {
	CTIId       string `form:"cti_id"  json:"cti_id"`             // CTI的ID
	CTIName     string `form:"cti_name"  json:"cti_name"`         // CTI名称
	Tags        string `form:"tags" json:"tags"`                  //标签
	Publisher   string `form:"publisher"  json:"publisher"`       //发布者
	OpenSource  int    `form:"open_source"  json:"open_source"`   //开源形式(0:不开源,1:开源,2:部分开源)
	Type        int    `form:"type" json:"type"`                  //类型
	Data        string `form:"data"  json:"data"`                 //数据(原始数据)
	DataSize    int    `form:"data_size"  json:"data_size"`       //数据大小(单位B)
	CryptoPwd   string `form:"crypto_pwd"  json:"crypto_pwd"`     //数据的加密密钥
	DownloadUrl string `form:"download_url"  json:"download_url"` //数据下载地址
	Description string `form:"description"  json:"description"`   //数据描述
	ThreatLevel int    `form:"threat_level"  json:"threat_level"` //威胁等级
}

// 更新CTI
type UpdateCTIRequest struct {
	ID          int     `form:"id" binding:"required" json:"id"`               //数据库索引ID
	CTIId       string  `form:"cti_id"  json:"cti_id"`                         // CTI的ID
	CTIName     string  `form:"cti_name"  json:"cti_name"`                     // CTI名称
	Tags        string  `form:"tags" json:"tags"`                              //标签
	Publisher   string  `form:"publisher"  json:"publisher"` //发布者
	OpenSource  int     `form:"open_source"  json:"open_source"`               //开源形式(0:不开源,1:开源,2:部分开源)
	Type        int     `form:"type" json:"type"`                              //类型
	Data        string  `form:"data"  json:"data"`                             //数据(原始数据)
	DataSize    int     `form:"data_size"  json:"data_size"`                   //数据大小(单位B)
	CryptoPwd   string  `form:"crypto_pwd"  json:"crypto_pwd"`                 //数据的加密密钥
	DownloadUrl string  `form:"download_url"  json:"download_url"`             //数据下载地址
	Description string  `form:"description"  json:"description"`               //数据描述
	ThreatLevel int     `form:"threat_level"  json:"threat_level"`             //威胁等级
	Confidence  float64 `form:"confidence"  json:"confidence"`                 //可信度分数
	Need        int     `form:"need"  json:"need"`                             //需求量
	Value       float64 `form:"value"  json:"value"`                           //平台评估的价值
	CompreValue float64 `form:"compre_value"  json:"compre_value"`             //综合价值
	Hash        string  `form:"hash"  json:"hash"`                             // 数据Hash(MD5)
	ChainID     string  `form:"chain_id"  json:"chain_id"`                     //链上ID
}

// 设置状态
type SetCTIStatusRequest struct {
	Id     string `form:"id" binding:"required"`
	Status string `form:"status" binding:"required"`
}

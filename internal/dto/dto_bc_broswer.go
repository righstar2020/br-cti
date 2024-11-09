package dto

//GetAdminMenuListRequest 获取菜单列表
type GetBCSummaryRequest struct {
	BlockHeight int64  `form:"block_height" json:"block_height"`
	TransactionTotal  int64  `form:"transaction_total" json:"transaction_total"`
	NodeNum   int64  `form:"node_num" json:"node_num"`
	ChaincodeNum int64  `form:"chaincode_num" json:"chaincode_num"`
	CTITotal   int64  `form:"cti_total" json:"cti_total"`
}
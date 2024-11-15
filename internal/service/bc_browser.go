package service

import (
	"context"
	"github.com/righstar2020/br-cti/internal/dto"
	// "encoding/json"
	// "fmt"

	// "github.com/righstar2020/br-cti/global"
	
	// "github.com/righstar2020/br-cti/pkg/convert"
	// network "github.com/righstar2020/br-cti/pkg/network"
)

func (svc *Service) GetBCSummary(ctx context.Context) (*dto.GetBCSummaryRequest, error) {
	// blockchainServerHost := global.BlockchainSetting.ServerHost
	// blockchainInfo,err := network.GetRequest(blockchainServerHost+"/queryChain")
	// if err!=nil {
	// 	return nil,err
	// }
	// fmt.Printf("blockchainInfo:%+v\n",blockchainInfo)
	// // 解析响应体为[]interface{}
	// var BCI map[string]interface{}
	// err = json.Unmarshal(blockchainInfo["BCI"].([]byte), &BCI)
	// if err != nil {
	// 	return nil, err
	// }
	result :=&dto.GetBCSummaryRequest{
		BlockHeight: 12,//convert.Int64(BCI["height"]),
		TransactionTotal: 430,
		ChaincodeNum: 3,
		NodeNum: 3,
		CTITotal: 320,
	}
	return result, nil
}
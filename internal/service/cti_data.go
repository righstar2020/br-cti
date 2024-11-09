package service

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/pkg/convert"
	"github.com/righstar2020/br-cti/pkg/utils"
)

// GetCTIData 根据ID获取一条CTI数据记录
func (svc *Service) GetCTIData(ctx context.Context, id int) (*model.CTIData, error) {
	// 查询信息
	ctiData, err := svc.dao.GetCTIData(ctx, id)
	if err != nil {
		return nil, err
	}
	if ctiData.Model == nil {
		return nil, errors.New("该记录不存在")
	}

	return ctiData, nil
}

// GetCTIByCTIId 根据ID获取一条CTI数据记录
func (svc *Service) GetCTIByCTIId(ctx context.Context, ctiId int) (*model.CTIData, error) {
	// 查询信息
	ctiData, err := svc.dao.GetCTIByCTIId(ctx, ctiId)
	if err != nil {
		return nil, err
	}
	if ctiData.Model == nil {
		return nil, errors.New("该记录不存在")
	}

	return ctiData, nil
}


// GetCTIDataList 获取CTI数据列表
func (svc *Service) GetCTIDataList(ctx context.Context, params *dto.GetCTIListRequest) ([]*model.CTIData, int64, error) {
	list, total, err := svc.dao.GetCTIDataList(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// 数据处理
	var result []*model.CTIData
	for _, v := range list {
		item := &model.CTIData{}
		item= v
		// 加入数组
		result = append(result, item)
	}
	return result, total, nil
}

// UpdateCTIData 更新一条CTI数据记录
func (svc *Service) UpdateCTIData(ctx context.Context, params *dto.UpdateCTIRequest) error {
	// 查询信息
	ctiData, err := svc.dao.GetCTIData(ctx, convert.Int(params.ID))
	if err != nil {
		return err
	}
	if ctiData.Model == nil {
		return errors.New("该记录不存在")
	}

	// 更新数据
	ctiData.CTIId = params.CTIId
	ctiData.CTIName = params.CTIName
	ctiData.Tags = params.Tags
	ctiData.Publisher = params.Publisher
	ctiData.OpenSource = params.OpenSource
	ctiData.Type = params.Type
	ctiData.Data = params.Data
	ctiData.DataSize = params.DataSize
	ctiData.DownloadUrl = params.DownloadUrl
	ctiData.Description = params.Description
	ctiData.ThreatLevel = params.ThreatLevel
	ctiData.Confidence = params.Confidence
	ctiData.Need = params.Need
	ctiData.Value = params.Value
	ctiData.CompreValue = params.CompreValue
	ctiData.Hash = params.Hash
	ctiData.ChainID = params.ChainID

	// 更新记录
	return svc.dao.UpdateCTIData(ctx, ctiData)
}

// CreateCTIData 创建CTI数据记录
func (svc *Service) CreateCTIData(ctx context.Context, params *dto.CreateCTIRequest) error {

	//生成数据MD5
	if params.Data == "" { 
		return errors.New("数据不能为空")
	}
	if params.Publisher==""{
		params.Publisher="admin" //发布者账号名
	}
	//生成CTIID
	CTIPrefix := "1000"
	if params.Type != 0{
		//根据类型生成前缀
		CTIPrefixNum := 1000+params.Type
		CTIPrefix = strconv.Itoa(CTIPrefixNum)
	}
	params.CTIId= CTIPrefix+string((time.Now().Format("060102150405")))
	//生成文件MD5
	Hash := utils.MD5(params.Data)
	if params.DownloadUrl!="" {
		//从文件系统中读取文件并生成文件MD5
		Hash =  utils.MD5(params.DownloadUrl)
	}
	// 创建数据(使用默认信息)
	ctiData := &model.CTIData{
		CTIId:        params.CTIId,
		CTIName:      params.CTIName,
		Tags:         params.Tags,
		Publisher:    params.Publisher,
		OpenSource:   params.OpenSource,
		Type:         params.Type,
		Data:         params.Data,
		DataSize:     params.DataSize,
		CryptoPwd:    params.CryptoPwd,
		DownloadUrl:  params.DownloadUrl,
		Description:  params.Description,
		ThreatLevel:  params.ThreatLevel,
		Confidence:  1,
		Value: 0,
		CompreValue: 0,
		Need: 0,
		Hash: Hash,
		ChainID: "",
	}
	//文件下载地址处理
	if params.DownloadUrl != "" {
		downloadUrl, err := utils.SaveFile(params.DownloadUrl, "cti")
		if err != nil {
			return err
		}
		ctiData.DownloadUrl = downloadUrl
	}

	// 创建记录
	_, err := svc.dao.CreateCTIData(ctx, ctiData)
	if err != nil {
		return err
	}
	//同时对数据进行上链
	
	//上链
	err = svc.CreateCTIOnchain(ctx, &dto.CreateCTIOnchainRequest{
		CTIId:    params.CTIId,
		Publisher: params.Publisher,
		Hash:     Hash,
	})
	if err != nil {
		return err
	}
	
	return nil
}

// DeleteCTIData 删除一条CTI数据记录
func (svc *Service) DeleteCTIData(ctx context.Context, id string) error {
	return svc.dao.DeleteCTIData(ctx, convert.Int(id))
}
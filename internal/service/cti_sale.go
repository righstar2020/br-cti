package service

import (
	"context"
	"errors"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/pkg/convert"
)


// GetCTISale 根据ID获取一条CTI销售记录
func (svc *Service) GetCTISale(ctx context.Context, id int) (*model.CTISale, error) {
	// 查询信息
	ctiSale, err := svc.dao.GetCTISale(ctx, id)
	if err != nil {
		return nil, err
	}
	if ctiSale == nil {
		return nil, errors.New("该记录不存在")
	}

	return ctiSale, nil
}

// GetCTISaleList 获取所有CTI销售记录列表
func (svc *Service) GetCTISaleList(ctx context.Context, params *dto.GetCTISaleListRequest) ([]*model.CTISale, int64, error) {
	list, total, err := svc.dao.GetCTISaleList(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// 数据处理
	var result []*model.CTISale
	for _, v := range list {
		item := &model.CTISale{}
		*item = *v // 深拷贝
		// 加入数组
		result = append(result, item)
	}
	return result, total, nil
}
// GetCTISaleList 根据UserID获取CTI销售记录列表
func (svc *Service) GetCTISaleListByUserId(ctx context.Context, params *dto.GetCTISaleListRequest) ([]*model.CTISale, int64, error) {
	list, total, err := svc.dao.GetCTISaleListByUserID(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// 数据处理
	var result []*model.CTISale
	for _, v := range list {
		item := &model.CTISale{}
		*item = *v // 深拷贝
		// 加入数组
		result = append(result, item)
	}
	return result, total, nil
}


// UpdateCTISale 更新一条CTI销售记录
func (svc *Service) UpdateCTISale(ctx context.Context, params *dto.UpdateCTISaleRequest) error {
	// 查询信息
	ctiSale, err := svc.dao.GetCTISale(ctx, convert.Int(params.ID))
	if err != nil {
		return err
	}
	if ctiSale == nil {
		return errors.New("该记录不存在")
	}

	// 更新数据
	ctiSale.UserID = params.UserID
	ctiSale.CTIIndexID = params.CTIIndexID
	ctiSale.Publisher = params.Publisher
	ctiSale.CompreValue = params.CompreValue
	ctiSale.Hash = params.Hash
	ctiSale.ChainID = params.ChainID

	// 更新记录
	return svc.dao.UpdateCTISale(ctx, ctiSale)
}

// CreateCTISale 创建CTI销售记录(Buy)
func (svc *Service) CreateCTISale(ctx context.Context, params *dto.CreateCTISaleRequest) error {
	
	//查询是否存在该CTI
	CTIData := &model.CTIData{}
	if params.CTIIndexID!=0{
		CTIData,_= svc.GetCTIData(ctx,params.CTIIndexID)
	}
	// 创建数据
	ctiSale := &model.CTISale{
		UserID:       params.UserID,
		CTIIndexID:   params.CTIIndexID,
		Publisher:    params.Publisher,
		CompreValue:  params.CompreValue,
		Hash:         params.Hash,
		ChainID:      params.ChainID,
		CryptoPwd:    CTIData.CryptoPwd,
	}

	// 创建记录
	_, err := svc.dao.CreateCTISale(ctx, ctiSale)
	if err != nil {
		return err
	}

	return nil
}

// DeleteCTISale 删除一条CTI销售记录
func (svc *Service) DeleteCTISale(ctx context.Context, id string) error {
	return svc.dao.DeleteCTISale(ctx, convert.Int(id))
}
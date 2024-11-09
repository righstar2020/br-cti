package service

import (
	"context"
	"errors"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
	"github.com/righstar2020/br-cti/pkg/convert"
)



// GetCTIOnchain 根据ID获取一条CTI上链记录
func (svc *Service) GetCTIOnchain(ctx context.Context, id int) (*model.CTIOnchain, error) {
	// 查询信息
	ctiOnchain, err := svc.dao.GetCTIOnchain(ctx, id)
	if err != nil {
		return nil, err
	}
	if ctiOnchain == nil {
		return nil, errors.New("该记录不存在")
	}

	return ctiOnchain, nil
}

// GetCTIOnchainList 获取所有CTI上链记录列表
func (svc *Service) GetCTIOnchainList(ctx context.Context, params *dto.GetCTIOnchainListRequest) ([]*model.CTIOnchain, int64, error) {
	list, total, err := svc.dao.GetCTIOnchainList(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// 数据处理
	var result []*model.CTIOnchain
	for _, v := range list {
		item := &model.CTIOnchain{}
		*item = *v // 深拷贝
		// 加入数组
		result = append(result, item)
	}
	return result, total, nil
}

// GetCTIOnchainList 根据Publisher获取CTI上链记录列表
func (svc *Service) GetCTIOnchainListByPublisher(ctx context.Context, params *dto.GetCTIOnchainListRequest) ([]*model.CTIOnchain, int64, error) {
	list, total, err := svc.dao.GetCTIOnchainListByPublisher(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	// 数据处理
	var result []*model.CTIOnchain
	for _, v := range list {
		item := &model.CTIOnchain{}
		*item = *v // 深拷贝
		// 加入数组
		result = append(result, item)
	}
	return result, total, nil
}

// UpdateCTIOnchain 更新一条CTI上链记录
func (svc *Service) UpdateCTIOnchain(ctx context.Context, params *dto.UpdateCTIOnchainRequest) error {
	// 查询信息
	ctiOnchain, err := svc.dao.GetCTIOnchain(ctx, convert.Int(params.ID))
	if err != nil {
		return err
	}
	if ctiOnchain == nil {
		return errors.New("该记录不存在")
	}

	// 更新数据
	ctiOnchain.CTIId = params.CTIId
	ctiOnchain.Publisher = params.Publisher
	ctiOnchain.Hash = params.Hash
	ctiOnchain.ChainID = params.ChainID

	// 更新记录
	return svc.dao.UpdateCTIOnchain(ctx, ctiOnchain)
}

// CreateCTIOnchain 创建CTI上链记录
func (svc *Service) CreateCTIOnchain(ctx context.Context, params *dto.CreateCTIOnchainRequest) error {
	// 创建数据
	ctiOnchain := &model.CTIOnchain{
		CTIId:    params.CTIId,
		Publisher: params.Publisher,
		Hash:     params.Hash,
		ChainID:  params.ChainID,
	}

	// 创建记录
	_, err := svc.dao.CreateCTIOnchain(ctx, ctiOnchain)
	if err != nil {
		return err
	}

	return nil
}

// DeleteCTIOnchain 删除一条CTI上链记录
func (svc *Service) DeleteCTIOnchain(ctx context.Context, id string) error {
	return svc.dao.DeleteCTIOnchain(ctx, convert.Int(id))
}
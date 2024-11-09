package dao

import (
	"context"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
)


// CreateCTIOnchain 创建上链记录
func (d *Dao) CreateCTIOnchain(ctx context.Context, onchain *model.CTIOnchain) (*model.CTIOnchain, error) {
	return onchain.Create(ctx, d.engine)
}

// UpdateCTIOnchain 更新上链记录
func (d *Dao) UpdateCTIOnchain(ctx context.Context, onchain *model.CTIOnchain) error {
	return onchain.Update(ctx, d.engine)
}

// DeleteCTIOnchain 删除上链记录
func (d *Dao) DeleteCTIOnchain(ctx context.Context, id int) error {
	onchain := model.CTIOnchain{}
	return onchain.Delete(ctx, d.engine, id)
}

// GetCTIOnchain 获取上链记录
func (d *Dao) GetCTIOnchain(ctx context.Context, id int) (*model.CTIOnchain, error) {
	onchain := &model.CTIOnchain{}
	err := d.engine.WithContext(ctx).Where("id=?", id).First(&onchain).Error
	if err != nil {
		return nil, err
	}
	return onchain, nil
}

// GetCTIOnchainList 获取所有上链记录列表
func (d *Dao) GetCTIOnchainList(ctx context.Context, params *dto.GetCTIOnchainListRequest) ([]*model.CTIOnchain, int64, error) {
	onchain := model.CTIOnchain{}
	return onchain.List(ctx, d.engine, params)
}

// GetCTIOnchainListByPublisher根据Publisher获取上链记录列表
func (d *Dao) GetCTIOnchainListByPublisher(ctx context.Context, params *dto.GetCTIOnchainListRequest) ([]*model.CTIOnchain, int64, error) {
	onchain := model.CTIOnchain{}
	return onchain.ListByPublisher(ctx, d.engine, params)
}
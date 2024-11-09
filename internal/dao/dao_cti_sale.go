package dao

import (
	"context"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
)

// CreateCTISale 创建销售记录
func (d *Dao) CreateCTISale(ctx context.Context, sale *model.CTISale) (*model.CTISale, error) {
	return sale.Create(ctx, d.engine)
}

// UpdateCTISale 更新销售记录
func (d *Dao) UpdateCTISale(ctx context.Context, sale *model.CTISale) error {
	return sale.Update(ctx, d.engine)
}

// DeleteCTISale 删除销售记录
func (d *Dao) DeleteCTISale(ctx context.Context, id int) error {
	sale := model.CTISale{}
	return sale.Delete(ctx, d.engine, id)
}

// GetCTISale 获取销售记录
func (d *Dao) GetCTISale(ctx context.Context, id int) (*model.CTISale, error) {
	sale := &model.CTISale{}
	err := d.engine.WithContext(ctx).Where("id=?", id).First(&sale).Error
	if err != nil {
		return nil, err
	}
	return sale, nil
}
// GetCTISale 获取所有销售记录
func (d *Dao) GetCTISaleList(ctx context.Context, params *dto.GetCTISaleListRequest) ([]*model.CTISale, int64, error) {
	sale := model.CTISale{}
	return sale.List(ctx, d.engine, params)
}

// GetCTISale 获取销售记录By user_id
func (d *Dao) GetCTISaleListByUserID(ctx context.Context, params *dto.GetCTISaleListRequest) ([]*model.CTISale, int64, error) {
	sale := model.CTISale{}
	return sale.ListByUserId(ctx, d.engine, params)
}
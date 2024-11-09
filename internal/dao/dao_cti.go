package dao

import (
	"context"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/internal/model"
)

//CreateCTIData 创建用户
func (d *Dao) CreateCTIData(ctx context.Context, adminUser *model.CTIData) (*model.CTIData, error) {
	return adminUser.Create(ctx, d.engine)
}

// UpdateCTIData 实现UpdateCTIData方法
func (d *Dao) UpdateCTIData(ctx context.Context, ctiData *model.CTIData) error {
	return ctiData.Update(ctx, d.engine)
}

// DeleteCTIData 实现DeleteCTIData方法
func (d *Dao) DeleteCTIData(ctx context.Context, id int) error {
	ctiData := model.CTIData{}
	return ctiData.Delete(ctx, d.engine, id)
}

// GetCTIData 实现GetCTIData方法
func (d *Dao) GetCTIData(ctx context.Context, id int) (*model.CTIData, error) {
	ctiData := &model.CTIData{}
	err := d.engine.WithContext(ctx).Where("id=?", id).First(&ctiData).Error
	if err != nil {
		return nil, err
	}
	return ctiData, nil
}

// GetCTIByCTIId 根据CTI编号获取CTI数据
func (d *Dao) GetCTIByCTIId(ctx context.Context, ctiId int) (*model.CTIData, error) {
	ctiData := &model.CTIData{}
	err := d.engine.WithContext(ctx).Where("cti_id=?", ctiId).First(&ctiData).Error
	if err != nil {
		return nil, err
	}
	return ctiData, nil
}
// GetCTIByPublisher 根据Publisher获取Publisher数据
func (d *Dao) GetCTIByPublisher(ctx context.Context, username string) (*model.CTIData, error) {
	ctiData := &model.CTIData{}
	err := d.engine.WithContext(ctx).Where("publisher=?", username).First(&ctiData).Error
	if err != nil {
		return nil, err
	}
	return ctiData, nil
}


// GetCTIDataList 实现GetCTIDataList方法
func (d *Dao) GetCTIDataList(ctx context.Context, params *dto.GetCTIListRequest) ([]*model.CTIData, int64, error) {
	ctiData := model.CTIData{}
	return ctiData.List(ctx, d.engine, params)
}


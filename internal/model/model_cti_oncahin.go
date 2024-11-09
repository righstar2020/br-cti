package model

import (
	"context"
	"github.com/righstar2020/br-cti/pkg/app"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/global"
	"gorm.io/gorm"
)

type CTIOnchain struct {
	*Model
	CTIId         string       `gorm:"column:cti_id;not null" json:"cti_id"`         // CTI索引ID
	Publisher     string    `gorm:"column:publisher;not null" json:"publisher"`   // 发布者(账号名)
	Hash          string    `gorm:"column:hash;not null" json:"hash"`             // 数据Hash(MD5)
	ChainID       string    `gorm:"column:chain_id;not null" json:"chain_id"`     // 链上ID
}

func (a *CTIOnchain) TableName() string {
	return global.DatabaseSetting.TablePrefix + "onchain"
}

// Get 获取一条记录
func (a *CTIOnchain) Get(ctx context.Context, db *gorm.DB) (*CTIOnchain, error) {
	var ctiOnchain *CTIOnchain
	db = db.WithContext(ctx)
	if a.Model != nil && a.ID != 0 {
		db = db.Where("id = ?", a.ID)
	}
	if a.CTIId != "" {
		db = db.Where("cti_id = ?", a.CTIId)
	}
	if a.Publisher != "" {
		db = db.Where("publisher = ?", a.Publisher)
	}
	if a.Hash != "" {
		db = db.Where("hash = ?", a.Hash)
	}
	err := db.First(&ctiOnchain).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return ctiOnchain, err
	}
	return ctiOnchain, nil
}

// Update 更新
func (a *CTIOnchain) Update(ctx context.Context, db *gorm.DB) error {
	return db.WithContext(ctx).Model(&a).Updates(&a).Error
}

// Create 创建
func (a *CTIOnchain) Create(ctx context.Context, db *gorm.DB) (*CTIOnchain, error) {
	if err := db.WithContext(ctx).Create(&a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

// Delete 删除
func (m *CTIOnchain) Delete(ctx context.Context, db *gorm.DB, id int) error {
	return db.WithContext(ctx).Where("id = ?", id).Delete(&m).Error
}

// List 无条件分页查询CTI Onchain数据列表并返回总数
func (a *CTIOnchain) List(ctx context.Context, db *gorm.DB, params *dto.GetCTIOnchainListRequest) ([]*CTIOnchain, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())

	// 计算偏移量
	offset := (params.Page - 1) * params.PageSize

	// 先查询总记录数
	var total int64
	db.Model(&CTIOnchain{}).Count(&total)

	// 查询数据
	var list []*CTIOnchain
	err := db.Limit(int(params.PageSize)).Offset(int(offset)).Order("id desc").Find(&list).Error
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// 通过Publisher查询数据
func (a *CTIOnchain) ListByPublisher(ctx context.Context, db *gorm.DB, params *dto.GetCTIOnchainListRequest) ([]*CTIOnchain, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())
	db = db.Where("publisher=?", params.Publisher)
	var count int64
	db.Count(&count)
	var list []*CTIOnchain
	if params.Page > 0 && params.PageSize > 0 {
		db = db.Offset(app.GetPageOffset(int(params.Page), int(params.PageSize))).Limit(int(params.PageSize))
	}
	if err := db.Order("id desc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, count, nil
}
package model

import (
	"context"

	"github.com/righstar2020/br-cti/global"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/pkg/app"
	"gorm.io/gorm"
)

type CTISale struct {
	*Model
	UserID      int     `gorm:"column:user_id;not null" json:"user_id"`           // 购买用户ID
	CTIIndexID  int     `gorm:"column:cti_index_id;not null" json:"cti_index_id"` // CTI的索引ID
	Publisher   string  `gorm:"column:publisher;not null" json:"publisher"`       // 发布者(realname)
	CompreValue float64 `gorm:"column:compre_value;not null" json:"compre_value"` // 综合价值
	Hash        string  `gorm:"column:hash;not null" json:"hash"`                 // 数据Hash(MD5) 或链上HASH
	ChainID     string  `gorm:"column:chain_id" json:"chain_id"`                  //链上ID(上链后)与Hash相同
	CryptoPwd   string  `form:"crypto_pwd"  json:"crypto_pwd"`
}

func (a *CTISale) TableName() string {
	return global.DatabaseSetting.TablePrefix + "sale"
}

// Get 获取一条记录
func (a *CTISale) Get(ctx context.Context, db *gorm.DB) (*CTISale, error) {
	var ctisale *CTISale
	db = db.WithContext(ctx)
	if a.ID != 0 {
		db = db.Where("id = ?", a.ID)
	}
	if a.Hash != "" {
		db = db.Where("hash = ?", a.Hash)
	}
	err := db.First(&ctisale).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return ctisale, err
	}
	return ctisale, nil
}

// Update 更新
func (a *CTISale) Update(ctx context.Context, db *gorm.DB) error {
	return db.WithContext(ctx).Model(&a).Updates(&a).Error
}

// Create 创建
func (a *CTISale) Create(ctx context.Context, db *gorm.DB) (*CTISale, error) {
	if err := db.WithContext(ctx).Create(&a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

// Delete 删除
func (m *CTISale) Delete(ctx context.Context, db *gorm.DB, id int) error {
	return db.WithContext(ctx).Where("id = ?", id).Delete(&m).Error
}

// List 无条件分页查询CTI销售数据列表并返回总数
func (a *CTISale) List(ctx context.Context, db *gorm.DB, params *dto.GetCTISaleListRequest) ([]*CTISale, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())

	// 计算偏移量
	offset := (params.Page - 1) * params.PageSize

	// 先查询总记录数
	var total int64
	db.Model(&CTISale{}).Count(&total)

	// 查询数据
	var list []*CTISale
	err := db.Limit(int(params.PageSize)).Offset(int(offset)).Order("id desc").Find(&list).Error
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

//通UserId查询数据
func (a *CTISale) ListByUserId(ctx context.Context, db *gorm.DB, params *dto.GetCTISaleListRequest) ([]*CTISale, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())
	db = db.Where("user_id=?", params.UserId)
	var count int64
	db.Count(&count)
	var list []*CTISale
	if params.Page > 0 && params.PageSize > 0 {
		db = db.Offset(app.GetPageOffset(int(params.Page), int(params.PageSize))).Limit(int(params.PageSize))
	}
	if err := db.Order("id desc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, count, nil
}

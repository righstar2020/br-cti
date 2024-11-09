package model

import (
	"context"
	"fmt"

	"github.com/righstar2020/br-cti/global"
	"github.com/righstar2020/br-cti/internal/dto"
	"github.com/righstar2020/br-cti/pkg/app"
	"gorm.io/gorm"
)

type CTIData struct {
	*Model
	CTIId       string  `gorm:"column:cti_id;NOT NULL" json:"cti_id"`             // CTI的ID
	CTIName     string  `gorm:"column:cti_name;NOT NULL" json:"cti_name"`         // CTI名称
	Tags        string  `gorm:"column:tags;NOT NULL" json:"tags"`                 //标签
	Publisher   string  `gorm:"column:publisher;NOT NULL" json:"publisher"`       //发布者(账号名)
	OpenSource  int     `gorm:"column:open_source;NOT NULL" json:"open_source"`   //开源形式(0:不开源,1:开源,2:部分开源)
	Type        int     `gorm:"column:type;NOT NULL" json:"type"`                 //类型
	Data        string  `gorm:"column:data;NOT NULL" json:"data"`                 //数据
	Hash        string  `gorm:"column:hash;NOT NULL" json:"hash"`                 //数据Hash(或链上ID,MD5)
	DataSize    int     `gorm:"column:data_size;NOT NULL" json:"data_size"`       //数据大小
	CryptoPwd   string  `gorm:"column:crypto_pwd;NOT NULL" json:"crypto_pwd"`     //数据的加密密钥(如果有)
	DownloadUrl string  `gorm:"column:download_url;NOT NULL" json:"download_url"` //数据下载地址
	Description string  `gorm:"column:description;NOT NULL" json:"description"`   //数据描述
	ThreatLevel int     `gorm:"column:threat_level;NOT NULL" json:"threat_level"` //威胁等级
	Confidence  float64 `gorm:"column:confidence;NOT NULL" json:"confidence"`     //可信度分数
	Need        int     `gorm:"column:need;NOT NULL" json:"need"`                 //需求量
	Value       float64 `gorm:"column:value;NOT NULL" json:"value"`               //平台评估的价值
	CompreValue float64 `gorm:"column:compre_value;NOT NULL" json:"compre_value"` //综合价值
	ChainID     string  `gorm:"column:chain_id" json:"chain_id"`                  //链上ID(上链后)与Hash相同
}

func (a *CTIData) TableName() string {
	return global.DatabaseSetting.TablePrefix + "data"
}

// Get 获取一条记录
func (a *CTIData) Get(ctx context.Context, db *gorm.DB) (*CTIData, error) {
	var ctiData *CTIData
	db = db.WithContext(ctx)
	if a.Model != nil && a.ID != 0 {
		db = db.Where("id = ?", a.ID)
	}
	if a.CTIName != "" {
		db = db.Where("cti_name = ?", a.CTIName)
	}
	if a.CTIId != "" {
		db = db.Where("cti_id = ?", a.CTIName)
	}
	err := db.First(&ctiData).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return ctiData, err
	}
	return ctiData, nil
}

// Update 更新
func (a *CTIData) Update(ctx context.Context, db *gorm.DB) error {
	return db.WithContext(ctx).Model(&a).Updates(&a).Error
}

// Create 创建
func (a *CTIData) Create(ctx context.Context, db *gorm.DB) (*CTIData, error) {
	if err := db.WithContext(ctx).Create(&a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

// Delete 删除
func (m *CTIData) Delete(ctx context.Context, db *gorm.DB, id int) error {
	return db.WithContext(ctx).Where("id = ?", id).Delete(&m).Error
}

// List 列表
func (a *CTIData) ListByCtiType(ctx context.Context, db *gorm.DB, params *dto.GetCTIListRequest) ([]*CTIData, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())
	if params.Name != "" {
		db = db.Where("type like ?", fmt.Sprintf("%%%s%%", params.Name))
	}
	var count int64
	db.Count(&count)
	var list []*CTIData
	if params.Page > 0 && params.PageSize > 0 {
		db = db.Offset(app.GetPageOffset(int(params.Page), int(params.PageSize))).Limit(int(params.PageSize))
	}
	if err := db.Order("id asc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, count, nil
}

// List 无条件分页查询CTI数据列表并返回总数
func (a *CTIData) List(ctx context.Context, db *gorm.DB, params *dto.GetCTIListRequest) ([]*CTIData, int64, error) {
	db = db.WithContext(ctx).Table(a.TableName())

	// 计算偏移量
	offset := (params.Page - 1) * params.PageSize

	// 先查询总记录数
	var total int64
	db.Model(&CTIData{}).Count(&total)

	// 查询数据
	var list []*CTIData
	//正序排序
	err := db.Limit(int(params.PageSize)).Offset(int(offset)).Order("id asc").Find(&list).Error
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

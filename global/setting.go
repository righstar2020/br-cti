package global

import (
	"github.com/righstar2020/br-cti/pkg/logger"
	"github.com/righstar2020/br-cti/pkg/setting"
)

var (
	ServerSetting   *setting.ServerSettingS
	AppSetting      *setting.AppSettingS
	EmailSetting    *setting.EmailSettingS
	JWTSetting      *setting.JWTSettingS
	DatabaseSetting *setting.DatabaseSettingS
	Logger          *logger.Logger
	TracerSetting   *setting.TracerSettingS
)

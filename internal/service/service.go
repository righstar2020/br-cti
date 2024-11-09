package service

import (
	"github.com/righstar2020/br-cti/global"
	"github.com/righstar2020/br-cti/internal/dao"
	"golang.org/x/net/context"
)

type Service struct {
	ctx context.Context
	dao *dao.Dao
}

func New(ctx context.Context) Service {
	svc := Service{ctx: ctx}
	svc.dao = dao.New(global.DBEngine.WithContext(ctx), ctx)
	return svc
}

func (svc *Service) GetCtx() context.Context {
	return svc.ctx
}

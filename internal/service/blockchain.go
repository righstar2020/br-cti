package service


//扫描数据库未上链的数据
func (svc *Service) ScanUnchainCTIData() error {
	//异步线程会扫描数据库未上链数据进行自动上链
	return nil
}

//检验数据是否在链上
func (svc *Service) CheckCTIOnchainByHash(hash string) bool {
	return true
}

package service
import(
	"context"
	"github.com/righstar2020/br-cti/internal/dto"
)

func (svc *Service) GetBCSummary(ctx context.Context) (*dto.GetBCSummaryRequest, error) {
	result :=&dto.GetBCSummaryRequest{
		BlockHeight: 320,
		TransactionTotal: 430,
		ChaincodeNum: 3,
		NodeNum: 3,
		CTITotal: 320,
	}
	return result, nil
}
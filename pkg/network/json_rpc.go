package network

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/righstar2020/br-cti/pkg/convert"
)

type RpcRequest struct {
	JsonRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Namespace string    `json:"namespace"`
	Params  []json.RawMessage `json:"params"`
	ID      int         `json:"id"`
}

type RpcResponse struct {
	JsonRPC string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result"`
	Error   json.RawMessage `json:"error"`
	ID      int             `json:"id"`
}
const jsonrpc_url="http://172.22.232.46:43221"

func convertStringToNum(num_str string)(int64,error){
	// 转换为整数
    intValue, err := strconv.ParseInt(num_str, 16, 64)
	if err != nil {
		return 0,err
	}
	return convert.Int64(intValue),nil
}
func getBlockLatest()(int64,error){
	request := RpcRequest{
		JsonRPC: "2.0",
		Method:  "block_latestBlock",
		Namespace: "global",
		Params:  make([]json.RawMessage, 0),
		ID:      1,
	}
	response,err := PostRequest(&request,jsonrpc_url)
	if err != nil {
		fmt.Println("Error:", err)
		return 0,err
	}
	data := make(map[string]interface{})
	if response.Result!=nil{
		json.Unmarshal(response.Result,&data)
	}
	heightStr := convert.String(data["number"])
	heightStr = heightStr[2:]
	// 转换为整数
    intValue, err := strconv.ParseInt(heightStr, 16, 64)
	return intValue,nil
}

func getTransactionsCount()(int64,error){
	request := RpcRequest{
		JsonRPC: "2.0",
		Method:  "tx_getTransactionsCount",
		Namespace: "global",
		Params:  make([]json.RawMessage, 0),
		ID:      1,
	}
	response,err := PostRequest(&request,jsonrpc_url)
	if err != nil {
		fmt.Println("Error:", err)
		return 0,err
	}
	data := make(map[string]interface{})
	if response.Result!=nil{
		json.Unmarshal(response.Result,&data)
	}
	countStr := convert.String(data["count"])
	countStr = countStr[2:]
	// 转换为整数
    intValue, err := strconv.ParseInt(countStr, 16, 64)
	return intValue,nil
}

func PostRequest(req *RpcRequest,url string)(*RpcResponse,error) {
	request := RpcRequest{
		JsonRPC: "2.0",
		Method:  "block_latestBlock",
		Namespace: "global",
		Params:  make([]json.RawMessage, 0),
		ID:      1,
	}

	jsonBytes, _ := json.Marshal(request)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		fmt.Println("Error:", err)
		return nil,err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil,err
	}

	rpcResp :=&RpcResponse{}
	if err := json.Unmarshal(body, &rpcResp); err != nil {
		fmt.Println("Error unmarshalling JSON-RPC response:", err)
		return nil,err
	}

	if rpcResp.Error != nil {
		fmt.Println("JSON-RPC error:", string(rpcResp.Error))
		return nil,fmt.Errorf("%s",rpcResp.Error)
	} else {
		fmt.Println("Result:", string(rpcResp.Result))
		return rpcResp, nil
	}
}
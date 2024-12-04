
/*----------------------------------------1.用户统计数据接口----------------------------------------*/
var clientServerHost = localStorage.getItem("clientServerHost");
var blockchainServerHost = localStorage.getItem("blockchainServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}
if (blockchainServerHost == null) {
	blockchainServerHost = "http://localhost:7777";
}
function getUserCTIStatistics(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            //url: blockchainServerHost + "/user/getUserStatistics",
            url: clientServerHost + "/user/getUserCTIStatistics",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("user statistics data:",response);
                if(response.code == 200){
                    data = JSON.parse(response.data);
                    resolve(data);
                }else{
                    reject("user statistics data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown); 
            }
        })
    })
}
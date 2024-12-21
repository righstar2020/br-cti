var clientServerHost = localStorage.getItem("clientServerHost");
var blockchainServerHost = localStorage.getItem("blockchainServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}
if (blockchainServerHost == null) {
	blockchainServerHost = "http://127.0.0.1:7777";
}
//-----------------------------------------request-----------------------------------------


//常规攻击
//查询IOC地理分布数据
function queryIOCGeoDistribution(){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/kp/queryIOCGeoDistribution",
            success: function(response){
                console.log("IOC地理分布数据:", response);
                if(response.result != null && response.result != undefined){
                    resolve(response.result);
                }else{
                    reject("IOC地理分布数据为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//查询IOC类型分布数据
function queryIOCTypeDistribution(){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/kp/queryIOCTypeDistribution",
            success: function(response){
                console.log("IOC类型分布数据:", response);
                if(response.result != null && response.result != undefined){
                    resolve(response.result);
                }else{
                    reject("IOC类型分布数据为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//查询攻击类型统计数据
function queryAttackTypeStatistics(timeRange){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: blockchainServerHost + "/kp/queryAttackTypeStatistics",
            data: JSON.stringify({
                "time_range": timeRange
            }),
            success: function(response){
                console.log("攻击类型统计数据:", response);
                if(response.result != null && response.result != undefined){
                    resolve(response.result);
                }else{
                    reject("攻击类型统计数据为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//查询攻击IOC信息
function queryAttackIOCInfo(page=1, pageSize=10){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/kp/queryAttackIOCInfo",
            data: JSON.stringify({
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("攻击IOC信息:", response);
                if(response.result != null && response.result != undefined){
                    resolve(response.result);
                }else{
                    reject("攻击IOC信息为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

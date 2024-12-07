
var clientServerHost = localStorage.getItem("clientServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}

function getLocalUserWallet(){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "GET",
            url: clientServerHost + "/user/checkLocalUserWallet",
            dataType: "json",
            success: function(data){
                resolve(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    })
}
//获取本地钱包列表
function getLocalWalletList(){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "GET",
            url: clientServerHost + "/user/getLocalUserAccountMulti", 
            dataType: "json",
            success: function(response){
                if(response != null && response.code == 200){
                    resolve(response.data.wallet_ids);
                }else{
                    reject("获取钱包列表失败:"+response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject("获取钱包列表失败: " + errorThrown);
            }
        });
    })
}

function checkLocalWalletOnchainStatus(wallet_id){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: clientServerHost + "/user/checkLocalWalletOnchainStatus",
            data: JSON.stringify({
                "wallet_id": wallet_id
            }),
            success: function(data){
                
                resolve(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    })
}




function createLocalUserWallet(walletPassword){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/user/createLocalUserWallet",
            data: JSON.stringify({
                "password": walletPassword
            }),
            success: function(data){
                resolve(data);
            },  
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })

}


function registerOnchainAccount(walletId,userName){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/user/registerOnchainUserAccount",
            data: JSON.stringify({
                "wallet_id": walletId,
                "user_name": userName
            }),
            success: function(data){
                resolve(data);
            },  
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}


function getUserStatistics(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/user/getUserStatistics",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(data){
                resolve(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown); 
            }
        })
    })
}



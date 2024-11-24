
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

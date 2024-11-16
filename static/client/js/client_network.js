
var clientServerHost = localStorage.getItem("clientServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}

function getBlockchainNetworkConfig(){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "GET",
            url: clientServerHost + "/blockchain/query-network-info",
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
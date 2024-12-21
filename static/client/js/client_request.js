var clientServerHost = localStorage.getItem("clientServerHost");
var blockchainServerHost = localStorage.getItem("blockchainServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://localhost:5000";
}
if (blockchainServerHost == null) {
	blockchainServerHost = "http://localhost:7777";
}
/*----------------------------------------1.用户统计数据接口----------------------------------------*/

//获取用户CTI统计数据
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
//获取用户信息
function getUserInfo(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: blockchainServerHost + "/user/queryUserDetailInfo", //获取详细信息
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("user info data:", response);
                if(response.result != null && response.result != undefined){
                    data = JSON.parse(response.result);
                    resolve(data);
                }else{
                    console.error(response.error);
                    reject("user info data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//获取用户交易记录
function getUserTransactionRecords(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: blockchainServerHost + "/user/queryPointTransactions",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("user transaction records:", response);
                if(response.result != null && response.result != undefined){
                    data = JSON.parse(response.result);
                    resolve(data);
                }else{
                    reject("user transaction records is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}
//-----------------------------------------CTI数据接口-----------------------------------------
//根据ID查询CTI数据
function queryCTIDataById(ctiId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: blockchainServerHost + "/cti/queryCtiInfo",
            data: JSON.stringify({
                "cti_id": ctiId
            }),
            success: function(response){
                console.log("CTI detail data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse CTI detail data: " + e.message); 
                    }
                }else{
                    reject("CTI detail data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}
//根据用户ID查询CTI数据
function queryCTIDataByUserId(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: blockchainServerHost + "/cti/queryCtiInfoByCreatorUserID",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("User CTI data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse user CTI data: " + e.message);
                    }
                }else{
                    reject("User CTI data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}
//查询用户拥有的CTI数据
function queryUserOwnedCTIData(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: blockchainServerHost + "/user/queryUserOwnCTIInfos",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("User owned CTI data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse user owned CTI data: " + e.message);
                    }
                }else{
                    reject("User owned CTI data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//查询CTI数据
function queryCTIData(type=-1, page=1, pageSize=15, incentive=0){
    if(incentive!=0){
        return queryCTIDataByIncentive(page, pageSize, incentive);
    }
    if(type!=-1){
        return queryCTIDataByType(type, page, pageSize);
    }else{
        return queryCTIDataByAll(page, pageSize);
    }
}

function queryCTIDataByAll(page, pageSize){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/cti/queryAllCtiInfoWithPagination",
            data: JSON.stringify({
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("CTI data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.cti_infos && Array.isArray(data.cti_infos)){
                            resolve({
                                cti_infos: data.cti_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size
                            });
                        } else {
                            reject("Invalid CTI data format");
                        }
                    } catch(e) {
                        reject("Failed to parse CTI data: " + e.message);
                    }
                }else{
                    reject("CTI data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//按激励机制分页查询CTI数据
function queryCTIDataByIncentive(page, pageSize,incentive){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/cti/queryCtiInfoByIncentiveMechanismWithPagination",
            data: JSON.stringify({
                "page": page,
                "page_size": pageSize,
                "incentive_mechanism": incentive
            }),
            success: function(response){
                console.log("CTI data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.cti_infos && Array.isArray(data.cti_infos)){
                            resolve({
                                cti_infos: data.cti_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size,
                                incentive_mechanism: incentive
                            });
                        } else {
                            reject("Invalid CTI data format");
                        }
                    } catch(e) {
                        reject("Failed to parse CTI data: " + e.message);
                    }
                }else{
                    reject("CTI data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//按类型分页查询CTI数据
function queryCTIDataByType(type, page, pageSize){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: blockchainServerHost + "/cti/queryCtiInfoByTypeWithPagination",
            data: JSON.stringify({
                "cti_type": type,
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("CTI data by type:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.cti_infos && Array.isArray(data.cti_infos)){
                            resolve({
                                cti_infos: data.cti_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size
                            });
                        } else {
                            reject("CTI data is not found");
                        }
                    } catch(e) {
                        reject("Failed to parse CTI data: " + e.message);
                    }
                }else{
                    reject("CTI data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}




//购买CTI
function purchaseCTI(walletId,password,ctiId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/user/purchaseCTIFromBlockchain",
            data: JSON.stringify({
                "wallet_id": walletId,
                "password": password,
                "cti_id": ctiId
            }),
            success: function(response){
                console.log("Purchase CTI response:", response);
                if(response.code === 200 && response.data){
                    resolve(response.data);
                }else{
                    reject(response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
//-------------------------------------------模型数据接口-------------------------------------------
//根据ID查询模型数据
function queryModelDataById(modelId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/model/queryModelInfo",
            data: JSON.stringify({
                "model_id": modelId
            }),
            success: function(response){
                console.log("Model detail data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse model detail data: " + e.message);
                    }
                }else{
                    reject("Model detail data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//查询所有模型数据(分页)
function queryModelData(type=-1, page=1, pageSize=15){
    if(type!=-1){
        return queryModelDataByType(type, page, pageSize);
    }else{
        return queryModelDataByAll(page, pageSize);
    }
}

function queryModelDataByAll(page, pageSize){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/model/queryModelInfoWithPagination",
            data: JSON.stringify({
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("Model data:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.model_infos && Array.isArray(data.model_infos)){
                            resolve({
                                model_infos: data.model_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size
                            });
                        } else {
                            reject("Invalid model data format");
                        }
                    } catch(e) {
                        reject("Failed to parse model data: " + e.message);
                    }
                }else{
                    reject("Model data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//按类型分页查询模型数据
function queryModelDataByType(type, page, pageSize){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/model/queryModelsByTypeWithPagination",
            data: JSON.stringify({
                "model_type": type,
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("Model data by type:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.model_infos && Array.isArray(data.model_infos)){
                            resolve({
                                model_infos: data.model_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size
                            });
                        } else {
                            reject("Model data is not found");
                        }
                    } catch(e) {
                        reject("Failed to parse model data: " + e.message);
                    }
                }else{
                    reject("Model data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//根据CTI ID查询相关模型
function queryModelsByRefCTIId(ctiId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/model/queryModelsByRefCTIId",
            data: JSON.stringify({
                "cti_id": ctiId
            }),
            success: function(response){
                console.log("Models by CTI ID:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse models data: " + e.message);
                    }
                }else{
                    reject("Models data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//根据创建者ID查询模型
function queryModelsByCreatorId(userId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/model/queryModelInfoByCreatorUserID",
            data: JSON.stringify({
                "user_id": userId
            }),
            success: function(response){
                console.log("Models by creator:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        resolve(data);
                    } catch(e) {
                        reject("Failed to parse models data: " + e.message);
                    }
                }else{
                    reject("Models data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}

//购买模型
function purchaseModel(walletId,password,modelId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: clientServerHost + "/user/purchaseModelFromBlockchain",
            data: JSON.stringify({
                "wallet_id": walletId,
                "password": password,
                "model_id": modelId
            }),
            success: function(response){
                console.log("Purchase model response:", response);
                if(response.code === 200 && response.data){
                    resolve(response.data);
                }else{
                    reject("Purchase model failed: " + response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
//------------------------------------------IPFS数据接口------------------------------------------

//获取IPFS文件URL
function getIPFSFileUrl(hash) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: blockchainServerHost + "/ipfs/getIPFSFileUrl",
            data: JSON.stringify({
                "hash": hash
            }),
            success: function(response) {
                console.log("获取IPFS文件URL响应:", response);
                if(response.url != null && response.url != undefined) {
                    resolve(response.url);
                } else {
                    reject("获取IPFS文件URL失败: 响应为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                reject(errorThrown); 
            }
        });
    });
}

//------------------------------------------区块数据接口------------------------------------------
//查询区块数据
function queryBlockInfoByHeight(blockHeight){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "GET",
            url: bc_server_host + "/blockchain/queryBlock/" + blockHeight,
            success: function(response){
                if(response.data != null && response.data != undefined){
                    var data = JSON.parse(response.data);
                    resolve(data);
                }else{
                    reject("查询区块数据失败: 响应为空");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}


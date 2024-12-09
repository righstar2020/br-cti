var clientServerHost = localStorage.getItem("clientServerHost");
var blockchainServerHost = localStorage.getItem("blockchainServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://localhost:5000";
}
if (blockchainServerHost == null) {
	blockchainServerHost = "http://localhost:7777";
}

//从IPFS下载数据集文件
function downloadDatasetFromIPFS(dataSourceHash, ipfsHash){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/download_dataset_from_ipfs",
            data: JSON.stringify({
                "data_source_hash": dataSourceHash,
                "ipfs_hash": ipfsHash
            }),
            success: function(response){
                console.log("下载数据集响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("下载数据集失败: " + response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}

//获取下载进度
function getDownloadProgress(dataSourceHash,ipfsHash){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/get_download_progress",
            data: JSON.stringify({
                "data_source_hash": dataSourceHash
            }),
            success: function(response){
                console.log("获取下载进度响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取下载进度失败: " + response.msg);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}

//获取特征字段
function getFeatureField(fileHash){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: clientServerHost + "/ml/get_feature_list",
            data: JSON.stringify({
                "file_hash": fileHash
            }),
            success: function(response){
                console.log("获取特征字段响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取特征字段失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
//查询模型训练记录列表
function getModelRecordListByHash(fileHash){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/get_model_record_list_by_hash", 
            data: JSON.stringify({
                "file_hash": fileHash
            }),
            success: function(response){
                console.log("获取模型记录响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取模型记录失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
//创建模型训练任务
function createModelTrainTask(fileHash,modelTrainConfig){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/create_model_task",
            data: JSON.stringify({
                "file_hash": fileHash,
                "label_column": modelTrainConfig.label_column,
                "cti_id": modelTrainConfig.cti_id==null?null:modelTrainConfig.cti_id
            }),
            success: function(response){
                console.log("创建模型训练任务响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("创建模型训练任务失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
//查询训练进度
function queryTrainProcessProgress(requestId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/get_model_progress",
            data: JSON.stringify({
                "request_id": requestId
            }),
            success: function(response){
                console.log("获取训练进度响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取训练进度失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}

//获取模型训练记录
function getModelTrainRecordByRequestId(requestId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: clientServerHost + "/ml/get_model_record_by_request_id",
            data: JSON.stringify({
                "request_id": requestId
            }),
            success: function(response){
                console.log("获取模型训练结果响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取模型训练结果失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}


//----------------------------------------------模型训练监控--------------------------------------------
//获取训练过程详细信息
function getTrainProcessDetail(requestId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json", 
            url: clientServerHost + "/ml/get_train_progress_detail_by_id",
            data: JSON.stringify({
                "request_id": requestId
            }),
            success: function(response){
                console.log("获取训练详情响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取训练详情失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}

//获取训练过程信息图像
function getTrainProcessImage(requestId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/get_train_process_image",
            data: JSON.stringify({
                "request_id": requestId
            }),
            success: function(response){
                console.log("获取训练过程图像响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取训练过程图像失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}

//获取模型评估结果信息图像
function getModelEvaluateImage(requestId){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/ml/get_model_evaluate_image",
            data: JSON.stringify({
                "request_id": requestId
            }),
            success: function(response){
                console.log("获取模型评估图像响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("获取模型评估图像失败: " + response.error);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}


//----------------------------------------------模型上链----------------------------------------------
//创建模型上链信息文件
function createModelUpchainInfo(fileHash, modelHash, modelInfoConfig){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json", 
            contentType: "application/json",
            url: clientServerHost + "/ml/create_model_upchain_info",
            data: JSON.stringify({
                "file_hash": fileHash,
                "model_hash": modelHash,
                "model_info_config": modelInfoConfig
            }),
            success: function(response){
                console.log("创建模型上链信息响应:", response);
                if(response.code === 200){
                    resolve(response.data);
                }else{
                    reject("创建模型上链信息失败: " + response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    });
}
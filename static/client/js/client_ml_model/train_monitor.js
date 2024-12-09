// 从train_process.js导入modelTrainRequestIdMap
var trainMonitorMap = {};
function initTrainMonitor(fileId){
    trainMonitorMap[fileId] = {};
}

function showTrainMonitor(fileId,show=true){
    let monitorElem = document.getElementById('train-process-monitor-'+fileId);
    if(monitorElem){
        monitorElem.style.display = show ? 'block' : 'none';
    }
}

//-----------------------------------------------分步骤监控-----------------------------------------------
//-----------------------------------------------1.模型头部信息-----------------------------------------------
//显示模型头部信息
function showModelHeaderInfo(processId){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let modelInfoElem = monitorElem.querySelector('.model-info-header');
    if(modelInfoElem){
        modelInfoElem.style.display = 'block';
        updateModelHeaderInfo(processId);
    }
}
//查询模型头部信息
function queryModelHeaderInfo(processId){
    const requestId = modelTrainRequestIdMap[processId];
    if(!requestId) {
        console.error("未找到训练任务ID");
        layer.msg("未找到训练任务ID",{'time':2000}); 
        return;
    }
    getTrainProcessInfo(requestId).then(function(modelInfo){
        return modelInfo;
    }).catch(function(error){
        console.error("获取模型头部信息失败:", error);
        return null;       
    });
}
//更新模型头部信息
function updateModelHeaderInfo(processId,modelHeaderInfo){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let modelInfoElem = monitorElem.querySelector('.model-info-header');
    if(modelInfoElem && modelHeaderInfo){
        modelInfoElem.style.display = 'block';
        // 更新模型ID
        if(!isKeyNull(modelHeaderInfo,"modelId")){
            modelInfoElem.querySelector('.monitor-header-item:nth-child(1) .value').innerText = modelHeaderInfo.modelId;
        }
        // 更新模型类型
        if(!isKeyNull(modelHeaderInfo,"modelType")){
            modelInfoElem.querySelector('.monitor-header-item:nth-child(2) .value').innerText = modelHeaderInfo.modelType;
        }
        // 更新模型状态
        if(!isKeyNull(modelHeaderInfo,"status")){
            modelInfoElem.querySelector('.monitor-header-item:nth-child(3) .value').innerText = modelHeaderInfo.status;
        }
        // 更新创建时间
        if(!isKeyNull(modelHeaderInfo,"createTime")){
            modelInfoElem.querySelector('.monitor-header-item:nth-child(4) .value').innerText = modelHeaderInfo.createTime;
        }
        // 更新训练用时
        if(!isKeyNull(modelHeaderInfo,"trainTime")){
            modelInfoElem.querySelector('.monitor-header-item:nth-child(5)').style.display = 'block';
            modelInfoElem.querySelector('.monitor-header-item:nth-child(5) .value').innerText = modelHeaderInfo.trainTime;
        }
    }
}
//-----------------------------------------------2.模型详细信息-----------------------------------------------
//显示模型详细信息
function showModelDetailsInfo(processId){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let modelDetailsElem = monitorElem.querySelector('.model-details');
    if(modelDetailsElem){
        modelDetailsElem.style.display = 'block';
        updateModelDetailsInfo(processId);
    }
}
//查询并刷新模型详细信息
function queryAndRefreshModelDetailsInfo(processId){
    queryModelDetailsInfo(processId).then(function(modelRecord){
        console.log("获取模型详细信息:", modelRecord);
        if(modelRecord&&!isKeyNull(modelRecord,"model_info")){
            let newModelInfo = modelRecord.model_info;
            //合成一层model_info
            Object.entries(modelRecord).forEach(([key, value]) => {
                if(key != "model_info"){
                    newModelInfo[key] = value;
                }
            });
            updateModelDetailsInfo(processId,newModelInfo);
        }else{
            layer.msg("model_info is null",{'time':2000});
        }
    }).catch(function(error){
        console.error("获取模型详细信息失败:", error);
        layer.msg("获取模型详细信息失败",{'time':2000});
    });
}
//查询模型详细信息 
function queryModelDetailsInfo(processId){
    const requestId = modelTrainRequestIdMap[processId];
    return new Promise(function(resolve, reject){
        if(!requestId) {
            console.error("未找到训练任务ID");
            layer.msg("未找到训练任务ID",{'time':2000}); 
            reject("未找到训练任务ID");
        }
        getModelTrainRecordByRequestId(requestId).then(function(modelInfo){
            resolve(modelInfo);
        }).catch(function(error){
            console.error("获取模型详细信息失败:", error);
            reject(error);
        });
    });
}

//更新模型详细信息
function updateModelDetailsInfo(processId,modelDetailsInfo){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let modelDetailsElem = monitorElem.querySelector('.model-details');
    if(modelDetailsElem && modelDetailsInfo){
        modelDetailsElem.style.display = 'block';
        //模型信息格式化
        if(!isKeyNull(modelDetailsInfo,"model_size")){
            modelDetailsInfo.model_size = formatSize(modelDetailsInfo.model_size);
        }
        if(!isKeyNull(modelDetailsInfo,"training_time")){
            modelDetailsInfo.training_time = modelDetailsInfo.training_time + "s";
        }
        //动态添加模型详细信息
        addModelDetailsInfo(processId,modelDetailsInfo);
    }
}
//动态添加模型详细信息
var modelDetailsInfoNameMap = {
    "model_name": "模型名称",
    "model_algorithm": "模型算法",
    "model_framework": "模型框架", 
    "created_time": "创建时间",
    "training_time": "训练时间",
    "feature_count": "特征数",
    "rows_count": "样本数", 
    "target_column": "标签列",  
    "model_size": "模型大小",
    "train_ratio": "训练集比例",
    "test_ratio": "测试集比例",
    "source_file_hash": "源文件哈希",
    "model_hash": "模型哈希",
    "status": "训练状态",
    "onchain": "上链状态"    
};
function addModelDetailsInfo(processId,modelDetailsInfo){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let modelDetailsElem = monitorElem.querySelector('.model-details-content');
    var oldDetailRowList = modelDetailsElem.querySelectorAll('.detail-row');
    var oldDetailsInfo = {};
    if(modelDetailsElem && modelDetailsInfo){
        //添加旧的信息
        oldDetailRowList.forEach(oldDetailRow => {
            let oldKey = oldDetailRow.querySelector('.label').getAttribute('data-key');
            let oldValue = oldDetailRow.querySelector('.value').getAttribute('data-value');
            //添加旧的没有的信息            
            if(isKeyNull(modelDetailsInfo,oldKey)){
                modelDetailsInfo[oldKey] = oldValue
            }                        
        });
        //清空div
        modelDetailsElem.innerHTML = '';
        //添加所有信息
        console.log(modelDetailsInfo);
        Object.entries(modelDetailsInfoNameMap).forEach(([key, name]) => {
            if(!isKeyNull(modelDetailsInfo,key)){
                let newDetailRow = document.createElement('div');
                newDetailRow.className = 'detail-row';
                newDetailRow.innerHTML = `
                    <span data-key="${key}" class="label">${modelDetailsInfoNameMap[key]}:</span>
                    <span data-value="${modelDetailsInfo[key]}" class="value">${modelDetailsInfo[key]}</span>
                `;
                modelDetailsElem.appendChild(newDetailRow);
            }
        });
    }
}
//-----------------------------------------------3.模型训练结果监控-----------------------------------------------
//显示模型训练结果监控
function showTrainResultMonitor(processId){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let monitorItem = monitorElem.querySelector('.monitor-item.model-training');
    let trainResultElem = monitorItem.querySelector('.model-train-step-chart');
    if(trainResultElem){
        monitorElem.style.display = 'block';
        monitorItem.style.display = 'block';
        trainResultElem.style.display = 'block';
        updateTrainResultMonitor(processId);
    }else{
        console.error("未找到元素:trainResultElem",processId);
    }
}

//更新模型训练结果监控
function updateTrainResultMonitor(processId){
    const requestId = modelTrainRequestIdMap[processId];
    if(!requestId) {
        console.error("未找到训练任务ID");
        layer.msg("未找到训练任务ID",{'time':2000});
        return;
    }
    
    getTrainProcessImage(requestId).then(function(data){
        let monitorElem = document.getElementById('train-process-monitor-' + processId);
        let trainResultElem = monitorElem.querySelector('.model-train-step-chart');
        if(trainResultElem && data && data.image_base64){
            trainResultElem.innerHTML = `
                <img src="data:image/${data.image_type};base64,${data.image_base64}" style="width:100%;">
            `;
        }
    }).catch(function(error){
        console.error("获取训练过程图像失败:", error);
        //间隔轮询
        setTimeout(function(){
            updateTrainResultMonitor(processId);
        },1000);
    });
}

//-----------------------------------------------4.模型评估过程监控-----------------------------------------------
//显示模型评估过程监控
function showEvaluateMonitorStep(processId){
    let monitorElem = document.getElementById('train-process-monitor-' + processId);
    let monitorItem = monitorElem.querySelector('.monitor-item.model-evaluation');
    let evaluateStepElem = monitorItem.querySelector('.model-evaluate-step-chart');
    console.log("evaluateStepElem:",evaluateStepElem);
    console.log("monitorElem:",monitorElem);
    if(evaluateStepElem){
        monitorElem.style.display = 'block';
        monitorItem.style.display = 'block';
        evaluateStepElem.style.display = 'block';
        updateEvaluateMonitorStep(processId);
    }else{
        console.error("未找到元素:evaluateStepElem",processId);
    }
}

//更新模型评估过程监控
function updateEvaluateMonitorStep(processId){
    const requestId = modelTrainRequestIdMap[processId];
    if(!requestId) {
        console.error("未找到训练任务ID");
        layer.msg("未找到训练任务ID",{'time':2000});
        return;
    }
    
    getModelEvaluateImage(requestId).then(function(data){
        let monitorElem = document.getElementById('train-process-monitor-' + processId);
        let evaluateStepElem = monitorElem.querySelector('.model-evaluate-step-chart');
        if(evaluateStepElem && data && data.image_base64){
            evaluateStepElem.innerHTML = `
                <img src="data:image/${data.image_type};base64,${data.image_base64}" style="width:100%;">
            `;
        }
    }).catch(function(error){
        console.error("获取模型评估图像失败:", error);
        //间隔轮询
        setTimeout(function(){
            updateEvaluateMonitorStep(processId);
        },1000);
    });
}
//-----------------------------------------------5.其他工具-----------------------------------------------
function isKeyNull(obj, key) {
    try {
        if (obj === null || obj === undefined) {
            return true;
        }
        return !obj.hasOwnProperty(key) || isNull(obj[key]);
    } catch (error) {
        console.error("检查键值是否为空时发生错误:", error);
        return true;
    }
}

function isNull(obj) {
    try {
        return obj === null || obj === undefined || obj === "";
    } catch (error) {
        console.error("检查对象是否为空时发生错误:", error);
        return true;
    }
}



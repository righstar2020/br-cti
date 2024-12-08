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
function showTrainMonitorStep(processId){
    let trainStepElem = document.querySelector('.monitor-train-step');
    if(trainStepElem){
        trainStepElem.style.display = 'block';
        updateTrainMonitorStep(processId);
    }
}

function updateTrainMonitorStep(processId){
    // 使用modelTrainRequestIdMap获取requestId
    const requestId = modelTrainRequestIdMap[processId];
    if(!requestId) {
        console.error("未找到训练任务ID");
        layer.msg("未找到训练任务ID",{'time':2000});
        return;
    }
    
    getTrainProcessImage(requestId).then(function(imageData){
        let trainStepElem = document.querySelector('.monitor-train-step');
        if(trainStepElem && imageData){
            trainStepElem.innerHTML = `
                <img src="data:image/png;base64,${imageData}" style="width:100%">
            `;
        }
    }).catch(function(error){
        console.error("获取训练过程图像失败:", error);
    });
}

function showEvaluateMonitorStep(processId){
    let evaluateStepElem = document.querySelector('.monitor-evaluate-step');
    if(evaluateStepElem){
        evaluateStepElem.style.display = 'block';
        updateEvaluateMonitorStep(processId);
    }
}

function updateEvaluateMonitorStep(processId){
    // 使用modelTrainRequestIdMap获取requestId
    const requestId = modelTrainRequestIdMap[processId];
    if(!requestId) {
        console.error("未找到训练任务ID");
        layer.msg("未找到训练任务ID",{'time':2000});
        return;
    }
    
    getModelEvaluateImage(requestId).then(function(imageData){
        let evaluateStepElem = document.querySelector('.monitor-evaluate-step');
        if(evaluateStepElem && imageData){
            evaluateStepElem.innerHTML = `
                <img src="data:image/png;base64,${imageData}" style="width:100%">
            `;
        }
    }).catch(function(error){
        console.error("获取模型评估图像失败:", error);
    });
}
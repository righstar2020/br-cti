/*------------------Step 2 模型信息配置------------------------*/
function initStepProcessModelInfo(){
    createModelInfoDataListHtml();
}
function createModelInfoDataListHtml(){
    const modelTrainList = $(`.train-process-data-list-box .train-process-data-item`);
    modelTrainList.each(function(index, item) {
        var processId = $(item).attr('data-process-id');
        var modelHash = modelDetailsInfoMap[processId]?.model_hash || "";
        var sourceFileHash = taskFileHashMap[processId] || "";
        if(!modelHash){
            return;
        }
        if($(item).attr('id') == 'train-process-data-item-template'){
            return;
        }
        var modelInfo = {
            request_id: modelDetailsInfoMap[processId]?.request_id || "",
            model_name: modelDetailsInfoMap[processId]?.model_name || "",
            model_hash: modelHash,
            model_type: modelDetailsInfoMap[processId]?.model_type || "",
            model_framework: modelDetailsInfoMap[processId]?.model_framework || "",
            model_algorithm: modelDetailsInfoMap[processId]?.model_algorithm || "",
            model_size: modelDetailsInfoMap[processId]?.model_size || "",
        }
        createModelInfoDataHtml(processId, sourceFileHash, modelHash, modelInfo);
    });
}


function createModelInfoDataHtml(processId,sourceFileHash,modelHash,modelInfo){
    const modelInfoDataList = $(`.model-info-data-list-box`);
    //克隆模板
    const modelInfoDataItem = document.getElementById("model-info-data-item-template").cloneNode(true);
    //移除模板的display:none样式
    modelInfoDataItem.style.display = 'block';
    //设置process id
    modelInfoDataItem.id = `model-info-data-${processId}`;
    modelInfoDataItem.setAttribute('data-process-id', processId);
    //设置form的process-id
    modelInfoDataItem.querySelector('.model-info-data-config-form').setAttribute('data-process-id', processId);
    //设置所有按钮的process-id
    $(modelInfoDataItem).find('.button').attr('data-process-id', processId);
    //设置文件名
    modelInfoDataItem.querySelector('.upload-data-item-name').innerText = modelInfo.request_id||'';
    //设置hash
    modelInfoDataItem.querySelector('.upload-data-item-hash').innerText = modelInfo.model_hash;
    //设置大小
    modelInfoDataItem.querySelector('.upload-data-item-size').innerText = modelInfo.model_size;
    //添加到目标元素，如果ID已存在则不添加
    if(document.getElementById(`model-info-data-${processId}`)){
        return;
    }
    //设置sourceFileHash
    $(modelInfoDataItem).find(".model-info-data-config-form").attr('data-source-file-hash',sourceFileHash);
    $(modelInfoDataItem).find('.model-info-data-item-start-btn').attr('data-source-file-hash',sourceFileHash);
    //设置model-hash
    $(modelInfoDataItem).find(".model-info-data-config-form").attr('data-model-hash',modelHash);
    $(modelInfoDataItem).find('.model-info-data-item-start-btn').attr('data-model-hash',modelHash);
    //填充表单信息
    const form = $(modelInfoDataItem).find('.model-info-data-config-form');
    form.find('input[name="model_name"]').val(modelInfo.model_name);
    form.find('input[name="model_algorithm"]').val(modelInfo.model_algorithm);
    form.find('textarea[name="description"]').val(`${modelInfo.model_type} ${modelInfo.model_framework} 模型`);
    
    modelInfoDataList.append(modelInfoDataItem);
    //初始化下拉框
    $(`#model-info-data-${processId} .ui.dropdown`).dropdown();
    //初始化标签下拉框
    $(`#model-info-data-${processId} .model-tags`).dropdown();
    //初始化开源设置下拉框
    $(`#model-info-data-${processId} .open-source`).dropdown();
}


//开始处理模型信息
function startModelInfoProcess(button){
    const processId = $(button).attr('data-process-id');
    const sourceFileHash = $(button).attr('data-source-file-hash');
    const modelHash = $(button).attr('data-model-hash');
    if(processId == null){
        return;
    }
    //保存配置并开始处理
    saveModelInfoConfig(processId,sourceFileHash,modelHash);
}

//保存模型信息配置
function saveModelInfoConfig(processId,sourceFileHash,modelHash){
    const form = $(`.model-info-data-config-form[data-process-id="${processId}"]`);
    var modelInfoConfig = {
        "process_id": processId,
        "file_hash": sourceFileHash||taskFileHashMap[processId],
        "model_hash": modelHash||modelDetailsInfoMap[processId].model_hash,
        "model_name": form.find('input[name="model_name"]').val(),
        "description": form.find('textarea[name="description"]').val(),
        "model_tags": form.find('select[name="model-tags"]').val(), // 修复tags获取
        "open_source": form.find('.open-source input[name="open_source"]').val(), // 修复open_source获取
        "value": parseFloat(form.find('input[name="value"]').val()),
        "incentive_mechanism": parseInt(form.find('select[name="incentive_mechanism"]').val()),
        "model_algorithm": form.find('input[name="model_algorithm"]').val() // 添加model_algorithm字段
    };
    console.log("modelInfoConfig:",modelInfoConfig);
    //验证必填项
    if(!modelInfoConfig.model_hash||!modelInfoConfig.file_hash){
        layer.msg('模型信息缺失',{'time':1200});
        console.log(modelInfoConfig);
        return;
    }


    //调用接口保存模型信息
    createModelUpchainInfo(modelInfoConfig.file_hash, modelInfoConfig.model_hash, modelInfoConfig).then(function(data){
        if(data!=null){
            //更新UI状态
            const item = $(`.model-info-data-item[data-process-id="${processId}"]`);
            item.attr('data-finish','true');
            item.find('.model-info-data-item-status').text('已完成');
            item.find('.model-info-data-item-start-btn').text('下一步');
            item.find('.model-info-data-item-start-btn').off('click').on('click',function(){
                nextStep();
            });
            //进度条
            updateModelInfoProgress(processId,100,false);
            //更新任务状态
            updateTaskFinishStepStatus(taskFileHashMap[processId],"2",true);
        }else{
            layer.msg('保存模型信息失败: ' + response.message,{'time':1600});
        }
    }).catch(function(error){
        layer.msg('网络异常: ' + error,{'time':1600});
    });
}

//更新进度条
function updateModelInfoProgress(processId, progress ,fail=false) {
    let progressBar = $(`.model-info-data-item[data-process-id="${processId}"] .model-info-data-item-progress`);
    if (progressBar) {
        //semantic进度组件更新
        progressBar.progress({
            percent: progress
        });
    }
    if(progress == 100&&!fail){
        //设置进度条颜色为定制蓝色
        $(`.model-info-data-item[data-process-id="${processId}"] .model-info-data-item-progress`).addClass('custom-blue');
    }
    if(fail){
        //设置进度条颜色为红色
        $(`.model-info-data-item[data-process-id="${processId}"] .model-info-data-item-progress`).addClass('error');
        //设置进度条百分比为100
        progressBar.progress({
            percent: 100
        });
    }
}

/*------------------Step 2 模型信息配置 end------------------------*/
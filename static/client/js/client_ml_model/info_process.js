/*------------------Step 2 模型信息配置------------------------*/
function initStepProcessModelInfo(){
    updateModelInfoDataListHtml();
}

function updateModelInfoDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const modelInfoDataList = $(`.model-info-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        //如果是未完成的任务(不处理)
        var processId = $(item).attr('data-file-id');
        var taskFileHash = taskFileHashMap[processId];
        // if (taskFileHash == null || taskFileHash == undefined) {
        //     return;
        // }
        // if(taskFinishStepStatusMap[taskFileHash]["1"]==undefined||taskFinishStepStatusMap[taskFileHash]["1"]==false){
        //     return;
        // }
        // //如果是已经存在的任务，则不处理
        // if(modelInfoDataList.find(`[data-process-id="${processId}"]`).length > 0){
        //     return;
        // }
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
        modelInfoDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        modelInfoDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        modelInfoDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`model-info-data-${processId}`)){
            return;
        }
        modelInfoDataList.append(modelInfoDataItem);
        //初始化下拉框
        $(`#model-info-data-${processId} .ui.dropdown`).dropdown();
        //初始化标签下拉框
        $(`#model-info-data-${processId} .model-tags`).dropdown();
        //初始化开源设置下拉框
        $(`#model-info-data-${processId} .open-source`).dropdown();
    });
}


//开始处理模型信息
function startModelInfoProcess(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    //保存配置并开始处理
    saveModelInfoConfig(processId);
}

//保存模型信息配置
function saveModelInfoConfig(processId){
    const form = $(`.model-info-data-config-form[data-process-id="${processId}"]`);
    var modelInfoConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "model_name": form.find('input[name="model_name"]').val(),
        "description": form.find('textarea[name="description"]').val(),
        "tags": form.find('input[name="tags"]').val(),
        "open_source": form.find('input[name="open_source"]').val(),
        "value": form.find('input[name="value"]').val()
    };

    //验证必填项
    if(!modelInfoConfig.model_name){
        layer.msg('请输入模型名称',{'time':1200});
        return;
    }

    //调用接口保存模型信息
    createModelUpchainInfo(modelInfoConfig.file_hash, modelInfoConfig.process_id, modelInfoConfig).then(function(response){
        if(response.code === 200){
            //更新UI状态
            const item = $(`.model-info-data-item[data-process-id="${processId}"]`);
            item.attr('data-finish','true');
            item.find('.model-info-data-item-status').text('已完成');
            item.find('.model-info-data-item-start-btn').text('下一步');
            item.find('.model-info-data-item-start-btn').off('click').on('click',function(){
                nextStep();
            });
            
            //更新任务状态
            updateTaskFinishStepStatus(taskFileHashMap[processId],"2",true);
        }else{
            layer.msg('保存模型信息失败: ' + response.message,{'time':1600});
        }
    }).catch(function(error){
        layer.msg('网络异常: ' + error,{'time':1600});
    });
}
/*------------------Step 2 模型信息配置 end------------------------*/
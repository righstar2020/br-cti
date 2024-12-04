/*------------------Setp 3 CTI数据转换(数据上链)------------------------*/
function initStepUpchainModel(){
    updateModelUpchainDataListHtml();
}
function updateModelUpchainDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const modelUpchainDataList = $(`.model-upchain-data-list-box`); // 修正选择器
    console.log("uploadDataList:",uploadDataList);
    console.log("modelUpchainDataList:",modelUpchainDataList);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        //如果是未完成的任务(不处理)
        var processId = $(item).attr('data-file-id');
        var taskFileHash = taskFileHashMap[processId];
        if (taskFileHash == null || taskFileHash == undefined) {
            return;
        }
        // //模型训练未处理完成
        // if(taskFinishStepStatusMap[taskFileHash]["1"]==undefined||taskFinishStepStatusMap[taskFileHash]["1"]==false){
        //     return;
        // }
        //如果是已经存在的任务，则不处理
        if(modelUpchainDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const modelUpchainDataItem = document.getElementById("model-upchain-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        modelUpchainDataItem.style.display = 'block';
        //设置process id
        modelUpchainDataItem.id = `model-upchain-data-${processId}`;
        modelUpchainDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        modelUpchainDataItem.querySelector('.model-upchain-data-config-form').setAttribute('data-process-id', processId);
        //设置按钮的process-id
        modelUpchainDataItem.querySelector('.model-process-data-item-start-btn').setAttribute('data-process-id', processId);
        //设置获取账户按钮的process-id
        modelUpchainDataItem.querySelector('.get-upchain-account-btn').setAttribute('data-process-id', processId);
        //设置检查密码按钮的process-id
        modelUpchainDataItem.querySelector('.check-upchain-account-password-btn').setAttribute('data-process-id', processId);
        //设置删除按钮的process-id
        modelUpchainDataItem.querySelector('.model-process-data-item-delete-btn').setAttribute('data-process-id', processId);
        //设置文件名
        modelUpchainDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        modelUpchainDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        modelUpchainDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不处理
        if(document.getElementById(`model-upchain-data-${processId}`)){
            return;
        }
        modelUpchainDataList.append(modelUpchainDataItem);
        //初始化下拉框
        $(`#model-upchain-data-${processId} .ui.dropdown`).dropdown();
        //设置模型类型下拉框
        $(`#model-upchain-data-${processId} .ui.dropdown.upchain-type`).dropdown({
            values: [{
                name: '流量模型',
                value: 'traffic_model',
                selected: true
            },{
                name: '应用层模型', 
                value: 'app_model',
                selected: false
            }]
        });

        //绑定form事件
        bindModelUpchainDataFormEvent(processId);
    });
}
//绑定form事件
function bindModelUpchainDataFormEvent(processId){
    const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
    const modelTypeSelect = form.find('.ui.dropdown.upchain-type');
    const upchainAccountInput = form.find('input[name="upchain_account"]');
    const upchainAccountPasswordInput = form.find('input[name="upchain_account_password"]');
    const getUpchainAccountBtn = form.find('.get-upchain-account-btn');
    const checkUpchainAccountPasswordBtn = form.find('.check-upchain-account-password-btn');

    modelTypeSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("modelTypeSelect:",value);
            modelTypeSelect.find('input[name="model_type"]').val(value);
        }
    });

    upchainAccountInput.on('change',function(){
        console.log("upchainAccountInput:",upchainAccountInput.val());
    });

    upchainAccountPasswordInput.on('change',function(){
        console.log("upchainAccountPasswordInput:",upchainAccountPasswordInput.val()); 
    });

    getUpchainAccountBtn.on('click',function(){
        console.log("getUpchainAccountBtn clicked");
    });

    checkUpchainAccountPasswordBtn.on('click',function(){
        console.log("checkUpchainAccountPasswordBtn clicked");
    });
}


function deleteModelUpchainDataItem(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    layer.confirm('确定删除该文件吗？', {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        const item = $(`.model-process-data-item[data-process-id="${processId}"]`);
        item.remove();
        layer.close(index);
    });
}

var modelUpchainingStatusMap = {}; //保存正在处理的任务状态
//开始上链
function startModelUpchain(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(modelUpchainingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(modelUpchainingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始上链
    startModelUpchainWithConfig(processId);
}

//保存配置并开始上链
function startModelUpchainWithConfig(processId){
    const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
    var modelUpchainConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "model_type": form.find('input[name="model_type"]').val(),
        "upchain_account": form.find('input[name="upchain_account"]').val(),
        "upchain_account_password": form.find('input[name="upchain_account_password"]').val()
    };
    //开始上链
    setModelUpchainProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/model/upchain',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(modelUpchainConfig),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                data = response.data;
                const current_step = data.current_step;
                const total_step = data.total_step;
                if(current_step != null && total_step != null){
                    $(`.model-upchain-data-item[data-process-id="${processId}"] .model-upchain-data-item-status`).
                    text(`处理中${current_step}/${total_step}`);
                }
                pollingModelUpchainProgress(processId);
            }else{
                if(response.error){
                    layer.msg(response.error,{'time':1200});
                    //设置失败状态
                    setModelUpchainFailedItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
            //设置失败状态
            setModelUpchainFailedItemUI(processId);
        }
    });
    
}

//100ms轮询
var processPollingIntervalMap = {};
function pollingModelUpchainProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getModelUpchainProgress(processId);
    },100);
}

function getModelUpchainProgress(processId){
    $.ajax({
        url: clientServerHost + '/model/upchain/progress',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"file_hash": taskFileHashMap[processId]}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                if(response.data == null){
                    //设置失败状态
                    setModelUpchainFailedItemUI(processId);
                    return;
                }
                const data = response.data;
                const progress = data.progress;
                const current_step = data.current_step;
                const total_step = data.total_step;
                const progressBar = $(`.model-upchain-data-item[data-process-id="${processId}"] .model-upchain-data-item-progress`);
                if(progressBar&&progress!=null){
                    progressBar.progress({
                        percent: progress
                    });
                }
                if(current_step != null && total_step != null){
                    $(`.model-upchain-data-item[data-process-id="${processId}"] .model-upchain-data-item-status`).
                    text(`处理中${progress}%(${current_step}/${total_step})`);
                }
                //处理完成
                if(progress == 100){
                    $(`.model-upchain-data-item[data-process-id="${processId}"] .model-upchain-data-item-status`).
                    text(`处理完成${progress}%(${current_step}/${total_step})`);
                    //设置完成状态
                    setModelUpchainFinishItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
        }
    });
}

//上链开始设置itemUI
function setModelUpchainStartItemUI(processId){
    const item = $(`.model-upchain-data-item[data-process-id="${processId}"]`);
    //设置开始按钮
    item.find('.model-upchain-data-item-start-btn').text('开始上链');
    item.find('.model-upchain-data-item-start-btn').on('click',function(){
        startModelUpchain(this);
    });
}

//上链处理中设置itemUI
function setModelUpchainProcessingItemUI(processId){
    const item = $(`.model-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    modelUpchainingStatusMap[processId] = 'processing';
    //设置下一步按钮
    item.find('.model-upchain-data-item-start-btn').text('处理中');
    //设置完成状态
    item.attr('data-finish','false');
    //隐藏配置
    item.find('.model-upchain-data-config').hide();
}

//上链处理失败设置itemUI
function setModelUpchainFailedItemUI(processId){
    const item = $(`.model-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    modelUpchainingStatusMap[processId] = 'failed';
    //设置完成状态
    item.attr('data-finish','false');
    //设置失败状态
    item.find('.model-upchain-data-item-start-btn').text('重新处理');
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //显示配置
    item.find('.model-upchain-data-config').show();
    //提示
    layer.msg('处理失败，请重新处理',{'time':1200});
}

//上链处理完成设置itemUI
function setModelUpchainFinishItemUI(processId){
    const item = $(`.model-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    modelUpchainingStatusMap[processId] = 'finish';
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //设置完成状态
    item.attr('data-finish','true');
    //设置下一步按钮
    item.find('.model-upchain-data-item-start-btn').text('下一步');
    item.find('.model-upchain-data-item-start-btn').on('click',function(){
        nextStep();
    });
}
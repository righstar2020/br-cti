/*------------------Setp 3 CTI数据转换(数据上链)------------------------*/
function initStepUpchainModel(){
    createModelUpchainDataListHtml();
}
function createModelUpchainDataListHtml(){
    const modelInfoDataList = $(`.model-info-data-list-box .model-info-data-item`);
    //遍历模型信息列表
    modelInfoDataList.each(function(index, item) {
        const processId = $(item).attr('data-process-id');
        const modelHash = $(item).attr('data-model-hash');
        const sourceFileHash = $(item).attr('data-source-file-hash');
        if($(item).attr('id') == 'model-info-data-item-template'){
            return;
        }
        console.log("createModelUpchainDataListHtml item:",item);
        createModelUpchainDataHtml(item,processId,modelHash,sourceFileHash);
    });
}
function createModelUpchainDataHtml(item,processId,modelHash,sourceFileHash){
    const modelUpchainDataList = $(`.model-upchain-data-list-box`); // 修正选择器
    //克隆模板
    const modelUpchainDataItem = document.getElementById("model-upchain-data-item-template").cloneNode(true);
    //移除模板的display:none样式
    modelUpchainDataItem.style.display = 'block';
    //设置process id
    modelUpchainDataItem.id = `model-upchain-data-${processId}`;
    modelUpchainDataItem.setAttribute('data-process-id', processId);
    //设置model-hash
    modelUpchainDataItem.setAttribute('data-model-hash',modelHash);
    //设置source-file-hash
    modelUpchainDataItem.setAttribute('data-source-file-hash',sourceFileHash);
    //设置form的process-id
    modelUpchainDataItem.querySelector('.model-upchain-data-config-form').setAttribute('data-process-id', processId);
    //设置按钮的process-id
    modelUpchainDataItem.querySelector('.model-process-data-item-start-btn').setAttribute('data-process-id', processId);
    //设置获取账户按钮的process-id
    modelUpchainDataItem.querySelector('.get-upchain-account-btn').setAttribute('data-process-id', processId);
    //设置检查密码按钮的process-id
    modelUpchainDataItem.querySelector('.check-upchain-account-password-btn').setAttribute('data-process-id', processId);
    //设置所有按钮的process-id
    modelUpchainDataItem.querySelectorAll('.button').forEach(function(button){
        button.setAttribute('data-process-id', processId);
    });
    modelUpchainDataItem.querySelectorAll('button').forEach(function(button){
        button.setAttribute('data-process-id', processId);
    });
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
    //model_hash
    
    modelUpchainDataList.append(modelUpchainDataItem);
    //初始化下拉框
    $(`#model-upchain-data-${processId} .ui.dropdown`).dropdown();
    //设置模型类型下拉框
    $(`#model-upchain-data-${processId} .ui.dropdown.upchain-type`).dropdown({
        values: [{
            name: '分类模型',
            value: 1,
            selected: false
        },{
            name: '回归模型',
            value: 2,
            selected: false
        },{
            name: '聚类模型',
            value: 3, 
            selected: false
        },{
            name: 'NLP模型',
            value: 4,
            selected: false
        }]
    });

    //绑定form事件
    bindModelUpchainDataFormEvent(processId);
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



var modelUpchainingStatusMap = {}; //保存正在处理的任务状态
//开始上链
function startModelUpchain(button){
    const processId = $(button).attr('data-process-id');
    const sourceFileHash = $(button).attr('data-source-file-hash');
    const modelHash = $(button).attr('data-model-hash');
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
    startModelUpchainWithConfig(processId,sourceFileHash,modelHash);
}

//保存配置并开始上链
function startModelUpchainWithConfig(processId,source_file_hash=null,model_hash=null){
    const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
    var modelUpchainConfig = {
        "process_id": processId,
        "file_hash": source_file_hash||taskFileHashMap[processId],
        "model_hash": model_hash||modelDetailsInfoMap[processId].model_hash,
        "model_type": form.find('input[name="model_type"]').val(),
        "ipfs_address": form.find('input[name="ipfs_address"]').val(),
        "upchain_account": form.find('input[name="upchain_account"]').val(),
        "upchain_account_password": form.find('input[name="upchain_account_password"]').val()
    };
    //开始上链
    setModelUpchainProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/blockchain/upload_model_to_bc_by_model_hash',
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

//1000ms轮询
var processPollingIntervalMap = {};
function pollingModelUpchainProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getModelUpchainProgress(processId);
    },1000);
}

function getModelUpchainProgress(processId){
    $.ajax({
        url: clientServerHost + '/blockchain/get_model_upchain_progress',
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
//-------------------------------------------------查询函数-------------------------------------------------
//获取IPFS地址
function getIpfsAddress(button){
    var processId = $(button).attr('data-process-id');
    $.ajax({
        type: "POST",
        url: clientServerHost + "/upchain/getIPFSAddress",
        dataType: "json",
        success: function(response){
            console.log(response);
            if(response.code == 200){
                const data = response.data;
                const ipfsAddress = data.ipfs_address;
                const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
                form.find('input[name="ipfs_address"]').val(ipfsAddress);
            }else{
                layer.msg('获取IPFS地址失败',{'time':1200});
            }
        },
        error: function(response){
            console.log(response);
            layer.msg('获取IPFS地址失败',{'time':1200});
        }
    });
}
//获取本地钱包账户
function getUpchainAccount(button){
    var processId = $(button).attr('data-process-id');
    
    const walletId = localStorage.getItem("userWalletId");
    if(walletId){
        const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
        form.find('input[name="upchain_account"]').val(walletId);
    }else{
        layer.msg('未找到钱包账户，请先登录钱包!',{'time':1200});
    }
}
//绑定检查钱包密码事件
function checkUpchainAccountPassword(button){
    var processId = $(button).attr('data-process-id');
    checkWalletPassword(processId);
}
//检查钱包密码
function checkWalletPassword(processId) {
    //检查配置是否输入正确
    const form = $(`.model-upchain-data-config-form[data-process-id="${processId}"]`);
    const upchainAccount = form.find('input[name="upchain_account"]').val();
    const upchainAccountPassword = form.find('input[name="upchain_account_password"]').val();
    if(upchainAccount == null || upchainAccount == '' || upchainAccountPassword == null || upchainAccountPassword == ''){
        layer.msg('账户或钱包密码不能为空',{'time':1200});
        return;
    }
    $.ajax({
        type: "POST",
        url: clientServerHost + "/user/checkWalletPassword", 
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            wallet_id: upchainAccount,
            password: upchainAccountPassword
        }),
        success: function(response) {
            console.log(response);
            if(response.code == 200) {
                const verifyResult = response.data;
                if(verifyResult){
                    layer.msg('钱包密码正确',{'time':1200});
                    return true;
                }else{
                    layer.msg('钱包密码错误',{'time':1200});
                    return false;
                }
            } else {
                layer.msg(response.error, {'time':1200});
                return false;
            }
        },
        error: function(response) {
            console.log(response);
            layer.msg(response.error, {'time':1200});
            return false
        }
    });
}

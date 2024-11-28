/*------------------Setp 4 CTI数据上链------------------------*/
function initStepCtiDataUpchain(){
    updateCtiUpchainDataListHtml();
}
function updateCtiUpchainDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const ctiUpchainDataList = $(`.cti-upchain-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        console.log(item);
        console.log(document.getElementById("cti-upchain-data-item-template"));
        //如果是未完成的任务(不处理)
        var processId = $(item).attr('data-file-id');
        var taskFileHash = taskFileHashMap[processId];
        if (taskFileHash == null || taskFileHash == undefined) {
            return;
        }
        if(taskFinishStepStatusMap[taskFileHash]["0"]==undefined||taskFinishStepStatusMap[taskFileHash]["0"]==false){
            return;
        }
        //如果是已经存在的任务，则不处理
        if(ctiUpchainDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const ctiUpchainDataItem = document.getElementById("cti-upchain-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        ctiUpchainDataItem.style.display = 'block';
        //设置process id
        var processId = $(item).attr('data-file-id');
        ctiUpchainDataItem.id = `cti-upchain-data-${processId}`;
        ctiUpchainDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        ctiUpchainDataItem.querySelector('.cti-upchain-data-config-form').setAttribute('data-process-id', processId);
        //设置所有按钮的process-id
        $(ctiUpchainDataItem).find('.button').attr('data-process-id', processId);
        //设置文件名
        ctiUpchainDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        ctiUpchainDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        ctiUpchainDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`cti-upchain-data-${processId}`)){
            return;
        }
        ctiUpchainDataList.append(ctiUpchainDataItem);
        //初始化下拉框
        $(`#cti-upchain-data-${processId} .ui.dropdown`).dropdown();
        //设置情报类型下拉框
        $(`#cti-upchain-data-${processId} .ui.dropdown.upchain-type`).dropdown({
            values: [{
                name: '恶意流量',
                value: 'malicious_traffic',
                selected: true
            },{
                name: '蜜罐数据',
                value: 'honeypot',
                selected: false
            },
            {
                name: '开源情报',
                value: 'osint',
                selected: false
            }]
        });
        //设置压缩比例下拉框
        $(`#cti-upchain-data-${processId} .ui.dropdown.upchain-compress`).dropdown({
            values: [
                {name: '1条',value: '1',selected: true},
                {name: '100条',value: '100'},
                {name: '500条',value: '500'},
                {name: '1000条',value: '1000'}
            ]
        });
        //绑定form事件
        bindCtiUpchainDataFormEvent(processId);
    });
}
//绑定form事件
function bindCtiUpchainDataFormEvent(processId){
    const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
    const upchainCompressSelect = form.find('.ui.dropdown.upchain-compress');
    upchainCompressSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("upchainCompressSelect:",value);
            upchainCompressSelect.find('input[name="upchain_compress"]').val(value);
        }
    });

    const upchainAccountSelect = form.find('.ui.dropdown.upchain-account');
    upchainAccountSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("upchainAccountSelect:",value);
            upchainAccountSelect.find('input[name="upchain_account"]').val(value);
        }
    });
}
//获取IPFS地址
function getIpfsAddress(button){
    var processId = $(button).attr('data-process-id');
    var file_hash = taskFileHashMap[processId];
    $.ajax({
        type: "POST",
        url: clientServerHost + "/upchain/getIPFSAddress",
        dataType: "json",
        success: function(response){
            console.log(response);
            if(response.code == 200){
                const data = response.data;
                const ipfsAddress = data.ipfs_address;
                const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
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
    var file_hash = taskFileHashMap[processId];
    $.ajax({
        type: "GET", 
        url: clientServerHost + "/user/checkLocalUserWallet",
        dataType: "json",
        success: function(response){
            console.log(response);
            if(response.code == 200){
                console.log(response);
                const data = response.data;
                const upchainAccount = data.wallet_id;
                const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
                form.find('input[name="upchain_account"]').val(upchainAccount);
            }else{
                layer.msg(response.error,{'time':1200}); 
            }
        },
        error: function(response){
            console.log(response);
            layer.msg(response.error,{'time':1200});
        }
    });
}
//绑定检查钱包密码事件
function checkUpchainAccountPassword(button){
    var processId = $(button).attr('data-process-id');
    checkWalletPassword(processId);
}
//检查钱包密码
function checkWalletPassword(processId) {
    //检查配置是否输入正确
    const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
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

function deleteCtiUpchainDataItem(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    layer.confirm('确定删除该文件吗？', {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        const item = $(`.cti-upchain-data-item[data-process-id="${processId}"]`);
        item.remove();
        layer.close(index);
    });
}

var ctiUpchainingStatusMap = {}; //保存正在处理的任务状态
//开始数据格式上链
function startCtiUpchainData(button){
    const processId = $(button).attr('data-process-id');
    const fileHash = taskFileHashMap[processId];
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(ctiUpchainingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(ctiUpchainingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始上链
    startCtiUpchainDataWithConfig(processId);
}

function checkFormInputValid(processId){
    //检查配置是否输入正确
    const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
    const ipfsAddress = form.find('input[name="ipfs_address"]').val();
    const upchainAccount = form.find('input[name="upchain_account"]').val();
    const upchainAccountPassword = form.find('input[name="upchain_account_password"]').val();
    if(ipfsAddress == null || ipfsAddress == '' || upchainAccount == null || upchainAccount == '' || upchainAccountPassword == null || upchainAccountPassword == ''){
        layer.msg('配置输入不能为空',{'time':1200});
        return false;
    }
    return true;
}

//保存配置并开始上链
function startCtiUpchainDataWithConfig(processId){
    if(!checkFormInputValid(processId)){
        return;
    }
    const form = $(`.cti-upchain-data-config-form[data-process-id="${processId}"]`);
    var ctiUpchainDataConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "ipfs_address": form.find('input[name="ipfs_address"]').val(),
        "upchain_account": form.find('input[name="upchain_account"]').val(),
        "upchain_account_password": form.find('input[name="upchain_account_password"]').val()
    };
    console.log(ctiUpchainDataConfig);
    //开始上链
    setCtiUpchainProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/blockchain/upload_cti',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(ctiUpchainDataConfig),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                data = response.data;
                const current_step = data.current_step;
                const total_step = data.total_step;
                if(current_step != null && total_step != null){
                    $(`.cti-upchain-data-item[data-process-id="${processId}"] .cti-upchain-data-item-status`).
                    text(`处理中${current_step}/${total_step}`);
                }
                pollingCtiUpchainProgress(processId);
            }else{
                if(response.error){
                    layer.msg(response.error,{'time':1200});
                    //设置失败状态
                    setCtiUpchainFailedItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
            //设置失败状态
            setCtiUpchainFailedItemUI(processId);
        }
    });
    
}
//100ms轮询
var processPollingIntervalMap = {};
function pollingCtiUpchainProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getCtiUpchainProgress(processId);
    },1000); //查询频率1s
}
function getCtiUpchainProgress(processId){
    $.ajax({
        url: clientServerHost + '/blockchain/get_upload_cti_progress',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"file_hash": taskFileHashMap[processId]}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                if(response.data == null){
                    //设置失败状态
                    setCtiUpchainFailedItemUI(processId);
                    return;
                }
                const data = response.data;
                const progress = data.progress;
                const current_step = data.current_step;
                const total_step = data.total_step;
                const progressBar = $(`.cti-upchain-data-item[data-process-id="${processId}"] .cti-upchain-data-item-progress`);
                if(progressBar&&progress!=null){
                    progressBar.progress({
                        percent: progress
                    });
                }
                if(current_step != null && total_step != null){
                    $(`.cti-upchain-data-item[data-process-id="${processId}"] .cti-upchain-data-item-status`).
                    text(`处理中${progress}%(${current_step}/${total_step})`);
                    var processing_data_num = total_step - current_step;
                    var processed_data_num = current_step;
                    upsertTaskStatusMap(processId,null,processed_data_num,processing_data_num);
                    updateHeaderPanelUI(processId,null,processed_data_num,processing_data_num);
                }
                //处理完成
                if(progress == 100){
                    $(`.cti-upchain-data-item[data-process-id="${processId}"] .cti-upchain-data-item-status`).
                    text(`处理完成${progress}%(${current_step}/${total_step})`);
                    //设置完成状态
                    setCtiUpchainFinishItemUI(processId);
                    //更新任务状态
                    updateTaskFinishStepStatus(taskFileHashMap[processId],"2",true);
                }
            }
        },
        error: function(response){
            console.log(response);
        }
    });
}
//upchain处理开始设置itemUI
function setCtiUpchainStartItemUI(processId){
    const item = $(`.cti-upchain-data-item[data-process-id="${processId}"]`);
    //设置开始按钮
    item.find('.cti-upchain-data-item-start-btn').text('开始上链');
    item.find('.cti-upchain-data-item-start-btn').on('click',function(){
        startCtiUpchainData(this);
    });
}
//upchain处理中设置itemUI
function setCtiUpchainProcessingItemUI(processId){
    const item = $(`.cti-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiUpchainingStatusMap[processId] = 'processing';
    //设置下一步按钮
    item.find('.cti-upchain-data-item-start-btn').text('处理中');
    //设置完成状态
    item.attr('data-finish','false');
    //隐藏配置
    item.find('.cti-upchain-data-config').hide();
}
//upchain处理失败设置itemUI
function setCtiUpchainFailedItemUI(processId){
    const item = $(`.cti-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiUpchainingStatusMap[processId] = 'failed';
    //设置完成状态
    item.attr('data-finish','false');
    //设置失败状态
    item.find('.cti-upchain-data-item-start-btn').text('重新处理');
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //显示配置
    item.find('.cti-upchain-data-config').show();
    //提示
    layer.msg('处理失败，请重新处理',{'time':1200});
}
//upchain处理完成设置itemUI
function setCtiUpchainFinishItemUI(processId){
    const item = $(`.cti-upchain-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiUpchainingStatusMap[processId] = 'finish';
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //设置完成状态
    item.attr('data-finish','true');
    //设置下一步按钮
    item.find('.cti-upchain-data-item-start-btn').text('下一步');
    item.find('.cti-upchain-data-item-start-btn').on('click',function(){
        nextStep();
    });
    //查询本地upchain数据(一次)
    queryLocalUpchainData(taskFileHashMap[processId]);
}
/*------------------Setp 2 upchain数据上链 end------------------------*/
/*------------------Setp 2 CTI数据转换------------------------*/
function initStepProcessCtiData(){
    updateCtiProcessDataListHtml();
}
function updateCtiProcessDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const ctiProcessDataList = $(`.cti-process-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        console.log(item);
        console.log(document.getElementById("cti-process-data-item-template"));
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
        if(ctiProcessDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const ctiProcessDataItem = document.getElementById("cti-process-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        ctiProcessDataItem.style.display = 'block';
        //设置process id
        var processId = $(item).attr('data-file-id');
        ctiProcessDataItem.id = `cti-process-data-${processId}`;
        ctiProcessDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        ctiProcessDataItem.querySelector('.cti-process-data-config-form').setAttribute('data-process-id', processId);
        //设置所有按钮的process-id
        ctiProcessDataItem.querySelectorAll('.cti-process-data-config-form  .button').forEach(function(button){
            button.setAttribute('data-process-id', processId);
        });
        //设置文件名
        ctiProcessDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        ctiProcessDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        ctiProcessDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`cti-process-data-${processId}`)){
            return;
        }
        ctiProcessDataList.append(ctiProcessDataItem);
        //初始化下拉框
        $(`#cti-process-data-${processId} .ui.dropdown`).dropdown();
        //设置情报类型下拉框
        $(`#cti-process-data-${processId} .ui.dropdown.cti-type`).dropdown({
            values: [{
                name: '恶意流量',
                value: 'malicious_traffic',
                selected: true
            },{
                name: '应用层攻击',
                value: 'app_attack',
                selected: false
            },
            {
                name: '开源情报',
                value: 'osint',
                selected: false
            }]
        });
        //设置压缩比例下拉框
        $(`#cti-process-data-${processId} .ui.dropdown.cti-compress`).dropdown({
            values: [
                {name: '100条',value: '100'},
                {name: '500条',value: '500'},
                {name: '1000条',value: '1000',selected: true}
            ]
        });
        //绑定form事件
        bindCtiProcessDataFormEvent(processId);
    });
}
//绑定form事件
function bindCtiProcessDataFormEvent(processId){
    const form = $(`.cti-process-data-config-form[data-process-id="${processId}"]`);
    const ctiTypeSelect = form.find('.ui.dropdown.cti-type');
    const trafficFeatureFieldInput = form.find('input[name="traffic_feature_field"]');
    const ctiLabelSelect = form.find('select[name="cti_label"]');
    const ctiIocsSelect = form.find('select[name="cti_iocs"]');
    const ctiCompressSelect = form.find('.ui.dropdown.cti-compress');
    ctiTypeSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("ctiTypeSelect:",value);
            ctiTypeSelect.find('input[name="cti_type"]').val(value);
        }
    });
    trafficFeatureFieldInput.on('change',function(){
        console.log("trafficFeatureFieldInput:",trafficFeatureFieldInput.val());
    });
    ctiLabelSelect.on('change',function(){
        console.log("ctiLabelSelect:",ctiLabelSelect.val());
    });
    ctiIocsSelect.on('change',function(){
        console.log("ctiIocsSelect:",ctiIocsSelect.val());
    });
    ctiCompressSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("ctiCompressSelect:",value);
            ctiCompressSelect.find('input[name="cti_compress"]').val(value);
        }
    });
}
//更新CTI label列表
function updateCtiLabelList(processId,features_string){
    const form = $(`.cti-process-data-config-form[data-process-id="${processId}"]`);
    const ctiLabelSelect = form.find('select[name="cti_label"]');

    //解析features_string
    const features_list = features_string.split(';');
    //清空原有选项
    ctiLabelSelect.empty();
    features_list.forEach(function(feature){
        if(feature == 'label'){
            //如果有label选项，则设置默认选中
            ctiLabelSelect.append(new Option(feature, feature,false,true));
        }else{
            ctiLabelSelect.append(new Option(feature, feature));
        }
    });
}

function deleteCtiProcessDataItem(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    layer.confirm('确定删除该文件吗？', {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        const item = $(`.cti-process-data-item[data-process-id="${processId}"]`);
        item.remove();
        layer.close(index);
    });
}

var ctiProcessingStatusMap = {}; //保存正在处理的任务状态
//开始数据格式转换
function startCtiProcessData(button){
    const processId = $(button).attr('data-process-id');
    const fileHash = taskFileHashMap[processId];
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(ctiProcessingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(ctiProcessingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始转换
    startCtiProcessDataWithConfig(processId);
}

//保存配置并开始数据格式转换

function startCtiProcessDataWithConfig(processId){
    const form = $(`.cti-process-data-config-form[data-process-id="${processId}"]`);
    var ctiProcessDataConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "cti_type": form.find('input[name="cti_type"]').val(),
        "open_source": form.find('select[name="open_source"]').val(),
        "cti_description": form.find('textarea[name="cti_description"]').val(),
        "default_value": form.find('input[name="default_value"]').val()
    };
    //开始转换
    setCtiProcessProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/data/process_data_to_cti',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(ctiProcessDataConfig),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                data = response.data;
                const current_step = data.current_step;
                const total_step = data.total_step;
                if(current_step != null && total_step != null){
                    $(`.cti-process-data-item[data-process-id="${processId}"] .cti-process-data-item-status`).
                    text(`处理中${current_step}/${total_step}`);
                }
                pollingCtiProcessProgress(processId);
            }else{
                if(response.error){
                    layer.msg(response.error,{'time':1200});
                    //设置失败状态
                    setCtiProcessFailedItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
            //设置失败状态
            setCtiProcessFailedItemUI(processId);
        }
    });
    
}
//100ms轮询
var processPollingIntervalMap = {};
function pollingCtiProcessProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getCtiProcessProgress(processId);
    },1000); //查询频率1s
}
function getCtiProcessProgress(processId){
    $.ajax({
        url: clientServerHost + '/data/get_cti_process_progress',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"file_hash": taskFileHashMap[processId]}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                if(response.data == null){
                    //设置失败状态
                    setCtiProcessFailedItemUI(processId);
                    return;
                }
                const data = response.data;
                const progress = data.progress;
                const current_step = data.current_step;
                const total_step = data.total_step;
                const progressBar = $(`.cti-process-data-item[data-process-id="${processId}"] .cti-process-data-item-progress`);
                if(progressBar&&progress!=null){
                    progressBar.progress({
                        percent: progress
                    });
                }
                if(current_step != null && total_step != null){
                    $(`.cti-process-data-item[data-process-id="${processId}"] .cti-process-data-item-status`).
                    text(`处理中${progress}%(${current_step}/${total_step})`);
                    var processing_data_num = total_step - current_step;
                    var processed_data_num = current_step;
                    upsertTaskStatusMap(processId,null,processed_data_num,processing_data_num);
                    updateHeaderPanelUI(processId,null,processed_data_num,processing_data_num);
                }
                //处理完成
                if(progress == 100){
                    $(`.cti-process-data-item[data-process-id="${processId}"] .cti-process-data-item-status`).
                    text(`处理完成${progress}%(${current_step}/${total_step})`);
                    //设置完成状态
                    setCtiProcessFinishItemUI(processId);
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
//CTI处理开始设置itemUI
function setCtiProcessStartItemUI(processId){
    const item = $(`.cti-process-data-item[data-process-id="${processId}"]`);
    //设置开始按钮
    item.find('.cti-process-data-item-start-btn').text('开始转换');
    item.find('.cti-process-data-item-start-btn').on('click',function(){
        startCtiProcessData(this);
    });
}
//CTI处理中设置itemUI
function setCtiProcessProcessingItemUI(processId){
    const item = $(`.cti-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiProcessingStatusMap[processId] = 'processing';
    //设置下一步按钮
    item.find('.cti-process-data-item-start-btn').text('处理中');
    //设置完成状态
    item.attr('data-finish','false');
    //隐藏配置
    item.find('.cti-process-data-config').hide();
}
//CTI处理失败设置itemUI
function setCtiProcessFailedItemUI(processId){
    const item = $(`.cti-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiProcessingStatusMap[processId] = 'failed';
    //设置完成状态
    item.attr('data-finish','false');
    //设置失败状态
    item.find('.cti-process-data-item-start-btn').text('重新处理');
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //显示配置
    item.find('.cti-process-data-config').show();
    //提示
    layer.msg('处理失败，请重新处理',{'time':1200});
}
//CTI处理完成设置itemUI
function setCtiProcessFinishItemUI(processId){
    const item = $(`.cti-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    ctiProcessingStatusMap[processId] = 'finish';
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //设置完成状态
    item.attr('data-finish','true');
    //设置下一步按钮
    item.find('.cti-process-data-item-start-btn').text('下一步');
    item.find('.cti-process-data-item-start-btn').on('click',function(){
        nextStep();
    });
    //查询本地CTI数据(一次)
    queryLocalCtiData(taskFileHashMap[processId]);
}
/*------------------Setp 2 CTI数据转换 end------------------------*/
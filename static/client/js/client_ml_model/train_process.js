/*------------------Setp 2 MODEL数据转换------------------------*/
function initStepTrainModel(){
    updateTrainProcessDataListHtml();
}
function updateTrainProcessDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const trainProcessDataList = $(`.train-process-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        console.log(item);
        console.log(document.getElementById("train-process-data-item-template"));
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
        if(trainProcessDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const trainProcessDataItem = document.getElementById("train-process-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        trainProcessDataItem.style.display = 'block';
        //设置process id
        var processId = $(item).attr('data-file-id');
        trainProcessDataItem.id = `train-process-data-${processId}`;
        trainProcessDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        trainProcessDataItem.querySelector('.train-process-data-config-form').setAttribute('data-process-id', processId);
        //设置所有按钮的process-id
        trainProcessDataItem.querySelectorAll('.train-process-data-config-form .button').forEach(function(button){
            button.setAttribute('data-process-id', processId);
        });
        trainProcessDataItem.querySelector('.upload-data-item-tools button').setAttribute('data-process-id', processId);
        //设置文件名
        trainProcessDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        trainProcessDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        trainProcessDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`train-process-data-${processId}`)){
            return;
        }
        trainProcessDataList.append(trainProcessDataItem);
        //初始化下拉框
        $(`#train-process-data-${processId} .ui.dropdown`).dropdown();
        //设置情报类型下拉框
        $(`#train-process-data-${processId} .ui.dropdown.model-type`).dropdown({
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
        $(`#train-process-data-${processId} .ui.dropdown.model-compress`).dropdown({
            values: [
                {name: '100条',value: '100'},
                {name: '500条',value: '500'},
                {name: '1000条',value: '1000',selected: true}
            ]
        });
        //绑定form事件
        bindTrainProcessDataFormEvent(processId);
    });
}
//绑定form事件
function bindTrainProcessDataFormEvent(processId){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    const stixTypeSelect = form.find('.ui.dropdown.model-type');
    const trafficFeatureFieldInput = form.find('input[name="traffic_feature_field"]');
    const stixLabelSelect = form.find('select[name="stix_label"]');
    const stixIocsSelect = form.find('select[name="stix_iocs"]');
    const stixCompressSelect = form.find('.ui.dropdown.model-compress');
    stixTypeSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("stixTypeSelect:",value);
            stixTypeSelect.find('input[name="stix_type"]').val(value);
        }
    });
    trafficFeatureFieldInput.on('change',function(){
        console.log("trafficFeatureFieldInput:",trafficFeatureFieldInput.val());
    });
    stixLabelSelect.on('change',function(){
        console.log("stixLabelSelect:",stixLabelSelect.val());
    });
    stixIocsSelect.on('change',function(){
        console.log("stixIocsSelect:",stixIocsSelect.val());
    });
    stixCompressSelect.dropdown({
        onChange: function(value, text, $selectedItem) {
            console.log("stixCompressSelect:",value);
            stixCompressSelect.find('input[name="stix_compress"]').val(value);
        }
    });
}
//更新MODEL label列表
function updateModelLabelList(processId,features_string){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    const stixLabelSelect = form.find('select[name="stix_label"]');

    //解析features_string
    const features_list = features_string.split(';');
    //清空原有选项
    stixLabelSelect.empty();
    features_list.forEach(function(feature){
        if(feature == 'label'){
            //如果有label选项，则设置默认选中
            stixLabelSelect.append(new Option(feature, feature,false,true));
        }else{
            stixLabelSelect.append(new Option(feature, feature));
        }
    });
}
//从服务器获取流量特征字段
function getTrafficFeatureField(button){
    var processId = $(button).attr('data-process-id');
    var file_hash = taskFileHashMap[processId];
    console.log("taskFileHashMap:",taskFileHashMap);
    console.log("processId:",processId);
    console.log("file_hash:",file_hash);
    if (!file_hash) {
        console.error("file_hash 未定义，请检查 taskFileHashMap 是否正确更新");
        return; // 如果 file_hash 未定义，提前返回以避免后续错误
    }
    $.ajax({
        url: clientServerHost + '/data/get_traffic_data_features',
        type: "POST",
        dataType: "json",
        contentType: "application/json",

        data: JSON.stringify({"file_hash": file_hash}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                const data = response.data;
                $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-config-form input[name="traffic_feature_field"]`).val(data);
                //更新MODEL label列表
                updateModelLabelList(processId,data);
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

function deleteTrainProcessDataItem(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    layer.confirm('确定删除该文件吗？', {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
        item.remove();
        layer.close(index);
    });
}

var trainProcessingStatusMap = {}; //保存正在处理的任务状态
//开始数据格式转换
function startTrainProcessData(button){
    const processId = $(button).attr('data-process-id');
    const fileHash = taskFileHashMap[processId];
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(trainProcessingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(trainProcessingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始转换
    startTrainProcessDataWithConfig(processId);
}

//保存配置并开始数据格式转换

function startTrainProcessDataWithConfig(processId){
    const form = $(`.train-process-data-config-form[data-process-id="${processId}"]`);
    var trainProcessDataConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "stix_type": form.find('input[name="stix_type"]').val(),
        "stix_traffic_features": form.find('input[name="traffic_feature_field"]').val(),
        "stix_iocs": form.find('select[name="stix_iocs"]').val(),
        "stix_label": form.find('select[name="stix_label"]').val(),
        "stix_compress": parseInt(form.find('input[name="stix_compress"]').val()),
    };
    //开始转换
    setTrainProcessProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/data/process_data_to_stix',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(trainProcessDataConfig),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                data = response.data;
                const current_step = data.current_step;
                const total_step = data.total_step;
                if(current_step != null && total_step != null){
                    $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`).
                    text(`处理中${current_step}/${total_step}`);
                }
                pollingTrainProcessProgress(processId);
            }else{
                if(response.error){
                    layer.msg(response.error,{'time':1200});
                    //设置失败状态
                    setTrainProcessFailedItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
            //设置失败状态
            setTrainProcessFailedItemUI(processId);
        }
    });
    
}
//100ms轮询
var processPollingIntervalMap = {};
function pollingTrainProcessProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getTrainProcessProgress(processId);
    },1000); //查询频率1s
}
function getTrainProcessProgress(processId){
    $.ajax({
        url: clientServerHost + '/data/get_stix_process_progress',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"file_hash": taskFileHashMap[processId]}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                if(response.data == null){
                    //设置失败状态
                    setTrainProcessFailedItemUI(processId);
                    return;
                }
                const data = response.data;
                const progress = data.progress;
                const current_step = data.current_step;
                const total_step = data.total_step;
                const progressBar = $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-progress`);
                if(progressBar&&progress!=null){
                    progressBar.progress({
                        percent: progress
                    });
                }
                if(current_step != null && total_step != null){
                    $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`).
                    text(`处理中${progress}%(${current_step}/${total_step})`);
                    var processing_data_num = total_step - current_step;
                    var processed_data_num = current_step;
                    upsertTaskStatusMap(processId,null,processed_data_num,processing_data_num);
                    updateHeaderPanelUI(processId,null,processed_data_num,processing_data_num);
                }
                //处理完成
                if(progress == 100){
                    $(`.train-process-data-item[data-process-id="${processId}"] .train-process-data-item-status`).
                    text(`处理完成${progress}%(${current_step}/${total_step})`);
                    //设置完成状态
                    setTrainProcessFinishItemUI(processId);
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
//MODEL处理开始设置itemUI
function setTrainProcessStartItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    //设置开始按钮
    item.find('.train-process-data-item-start-btn').text('开始转换');
    item.find('.train-process-data-item-start-btn').on('click',function(){
        startTrainProcessData(this);
    });
}
//MODEL处理中设置itemUI
function setTrainProcessProcessingItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    trainProcessingStatusMap[processId] = 'processing';
    //设置下一步按钮
    item.find('.train-process-data-item-start-btn').text('处理中');
    //设置完成状态
    item.attr('data-finish','false');
    //隐藏配置
    item.find('.train-process-data-config').hide();
}
//MODEL处理失败设置itemUI
function setTrainProcessFailedItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    trainProcessingStatusMap[processId] = 'failed';
    //设置完成状态
    item.attr('data-finish','false');
    //设置失败状态
    item.find('.train-process-data-item-start-btn').text('重新处理');
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //显示配置
    item.find('.train-process-data-config').show();
    //提示
    layer.msg('处理失败，请重新处理',{'time':1200});
}
//MODEL处理完成设置itemUI
function setTrainProcessFinishItemUI(processId){
    const item = $(`.train-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    trainProcessingStatusMap[processId] = 'finish';
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //设置完成状态
    item.attr('data-finish','true');
    //设置下一步按钮
    item.find('.train-process-data-item-start-btn').text('下一步');
    item.find('.train-process-data-item-start-btn').on('click',function(){
        nextStep();
    });
    //查询本地MODEL数据(一次)
    queryLocalModelData(taskFileHashMap[processId]);
}
/*------------------Setp 2 MODEL数据转换 end------------------------*/
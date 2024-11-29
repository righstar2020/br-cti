/*------------------Setp 2 STIX数据转换------------------------*/
function initStepProcessStixData(){
    updateStixProcessDataListHtml();
}
function updateStixProcessDataListHtml(){
    //从前一step获取数据填充本step的模板
    const uploadDataList = $(`.upload-data-list .upload-data-item`);
    const stixProcessDataList = $(`.stix-process-data-list-box`);
    //遍历上传文件列表
    uploadDataList.each(function(index, item) {
        if($(item).attr('id') == 'upload-file-template'){
            return;
        }
        console.log(item);
        console.log(document.getElementById("stix-process-data-item-template"));
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
        if(stixProcessDataList.find(`[data-process-id="${processId}"]`).length > 0){
            return;
        }
        //克隆模板
        const stixProcessDataItem = document.getElementById("stix-process-data-item-template").cloneNode(true);
        //移除模板的display:none样式
        stixProcessDataItem.style.display = 'block';
        //设置process id
        var processId = $(item).attr('data-file-id');
        stixProcessDataItem.id = `stix-process-data-${processId}`;
        stixProcessDataItem.setAttribute('data-process-id', processId);
        //设置form的process-id
        stixProcessDataItem.querySelector('.stix-process-data-config-form').setAttribute('data-process-id', processId);
        //设置所有按钮的process-id
        $(stixProcessDataItem).find('.button').attr('data-process-id', processId);
        //设置文件名
        stixProcessDataItem.querySelector('.upload-data-item-name').innerText = $(item).find('.upload-data-item-name').text();
        //设置hash
        stixProcessDataItem.querySelector('.upload-data-item-hash').innerText = $(item).find('.upload-data-item-hash').text();
        //设置大小
        stixProcessDataItem.querySelector('.upload-data-item-size').innerText = $(item).find('.upload-data-item-size').text();
        //添加到目标元素，如果ID已存在则不添加
        if(document.getElementById(`stix-process-data-${processId}`)){
            return;
        }
        stixProcessDataList.append(stixProcessDataItem);
        //初始化下拉框
        $(`#stix-process-data-${processId} .ui.dropdown`).dropdown();
        //设置情报类型下拉框
        $(`#stix-process-data-${processId} .ui.dropdown.stix-type`).dropdown({
            values: [{
                name: '恶意流量',
                value: 1,
                selected: true
            },{
                name: '蜜罐情报', 
                value: 2,
                selected: false
            },{
                name: '僵尸网络',
                value: 3,
                selected: false
            },{
                name: '应用层攻击',
                value: 4,
                selected: false
            },{
                name: '开源情报',
                value: 5,
                selected: false
            }]
        });
        //设置压缩比例下拉框
        $(`#stix-process-data-${processId} .ui.dropdown.stix-compress`).dropdown({
            values: [
                {name: '1条',value: '1',selected: true},
                {name: '100条',value: '100'},
                {name: '500条',value: '500'},
                {name: '1000条',value: '1000'}
            ]
        });
        //绑定form事件
        bindStixProcessDataFormEvent(processId);
    });
}
//绑定form事件
function bindStixProcessDataFormEvent(processId){
    const form = $(`.stix-process-data-config-form[data-process-id="${processId}"]`);
    const stixTypeSelect = form.find('.ui.dropdown.stix-type');
    const trafficFeatureFieldInput = form.find('input[name="traffic_feature_field"]');
    const stixLabelSelect = form.find('select[name="stix_label"]');
    const stixIocsSelect = form.find('select[name="stix_iocs"]');
    const stixCompressSelect = form.find('.ui.dropdown.stix-compress');
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
//更新STIX label列表
function updateStixLabelList(processId,features_string){
    const form = $(`.stix-process-data-config-form[data-process-id="${processId}"]`);
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
                $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-config-form input[name="traffic_feature_field"]`).val(data);
                //更新STIX label列表
                updateStixLabelList(processId,data);
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

function deleteStixProcessDataItem(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    layer.confirm('确定删除该文件吗？', {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
        item.remove();
        layer.close(index);
    });
}

var stixProcessingStatusMap = {}; //保存正在处理的任务状态
//开始数据格式转换
function startStixProcessData(button){
    const processId = $(button).attr('data-process-id');
    const fileHash = taskFileHashMap[processId];
    if(processId == null){
        return;
    }
    //如果任务状态为处理中，则不进行处理
    if(stixProcessingStatusMap[processId] == 'processing'){
        return;
    }
    //如果处理完成,则不进行处理
    if(stixProcessingStatusMap[processId] == 'finish'){
        return;
    }
    //保存配置并开始转换
    startStixProcessDataWithConfig(processId);
}

//保存配置并开始数据格式转换

function startStixProcessDataWithConfig(processId){
    const form = $(`.stix-process-data-config-form[data-process-id="${processId}"]`);
    var stixProcessDataConfig = {
        "process_id": processId,
        "file_hash": taskFileHashMap[processId],
        "stix_type": form.find('input[name="stix_type"]').val(),
        "stix_traffic_features": form.find('input[name="traffic_feature_field"]').val(),
        "stix_iocs": form.find('select[name="stix_iocs"]').val(),
        "stix_label": form.find('select[name="stix_label"]').val(),
        "stix_compress": parseInt(form.find('input[name="stix_compress"]').val()),
    };
    //开始转换
    setStixProcessProcessingItemUI(processId);
    $.ajax({
        url: clientServerHost + '/data/process_data_to_stix',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(stixProcessDataConfig),
        success: function(response){
            console.log(response);
            if(response.code == 200){
                data = response.data;
                const current_step = data.current_step;
                const total_step = data.total_step;
                if(current_step != null && total_step != null){
                    $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-item-status`).
                    text(`处理中${current_step}/${total_step}`);
                }
                pollingStixProcessProgress(processId);
            }else{
                if(response.error){
                    layer.msg(response.error,{'time':1200});
                    //设置失败状态
                    setStixProcessFailedItemUI(processId);
                }
            }
        },
        error: function(response){
            console.log(response);
            //设置失败状态
            setStixProcessFailedItemUI(processId);
        }
    });
    
}
//100ms轮询
var processPollingIntervalMap = {};
function pollingStixProcessProgress(processId){
    if(processPollingIntervalMap[processId]){
        clearInterval(processPollingIntervalMap[processId]);
    }
    processPollingIntervalMap[processId] = setInterval(function(){
        getStixProcessProgress(processId);
    },1000); //查询频率1s
}
function getStixProcessProgress(processId){
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
                    setStixProcessFailedItemUI(processId);
                    return;
                }
                const data = response.data;
                const progress = data.progress;
                const current_step = data.current_step;
                const total_step = data.total_step;
                const progressBar = $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-item-progress`);
                if(progressBar&&progress!=null){
                    progressBar.progress({
                        percent: progress
                    });
                }
                if(current_step != null && total_step != null){
                    $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-item-status`).
                    text(`处理中${progress}%(${current_step}/${total_step})`);
                    var processing_data_num = total_step - current_step;
                    var processed_data_num = current_step;
                    upsertTaskStatusMap(processId,null,processed_data_num,processing_data_num);
                    updateHeaderPanelUI(processId,null,processed_data_num,processing_data_num);
                }
                //处理完成
                if(progress == 100){
                    $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-item-status`).
                    text(`处理完成(${current_step}/${total_step})`);
                    //设置完成状态
                    setStixProcessFinishItemUI(processId);
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
//STIX处理开始设置itemUI
function setStixProcessStartItemUI(processId){
    const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
    //设置开始按钮
    item.find('.stix-process-data-item-start-btn').text('开始转换');
    item.find('.stix-process-data-item-start-btn').on('click',function(){
        startStixProcessData(this);
    });
}
//STIX处理中设置itemUI
function setStixProcessProcessingItemUI(processId){
    const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    stixProcessingStatusMap[processId] = 'processing';
    //设置下一步按钮
    item.find('.stix-process-data-item-start-btn').text('处理中');
    //设置完成状态
    item.attr('data-finish','false');
    //隐藏配置
    item.find('.stix-process-data-config').hide();
}
//STIX处理失败设置itemUI
function setStixProcessFailedItemUI(processId){
    const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    stixProcessingStatusMap[processId] = 'failed';
    //设置完成状态
    item.attr('data-finish','false');
    //设置失败状态
    item.find('.stix-process-data-item-start-btn').text('重新处理');
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //显示配置
    item.find('.stix-process-data-config').show();
    //提示
    layer.msg('处理失败，请重新处理',{'time':1200});
}
//STIX处理完成设置itemUI
function setStixProcessFinishItemUI(processId){
    const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
    //设置任务状态
    stixProcessingStatusMap[processId] = 'finish';
    //清除轮询
    clearInterval(processPollingIntervalMap[processId]);
    delete processPollingIntervalMap[processId];
    //设置完成状态
    item.attr('data-finish','true');
    //设置下一步按钮
    item.find('.stix-process-data-item-start-btn').text('下一步');
    item.find('.stix-process-data-item-start-btn').on('click',function(){
        nextStep();
    });
    //查询本地STIX数据(一次)
    queryLocalStixData(taskFileHashMap[processId]);
}
/*------------------Setp 2 STIX数据转换 end------------------------*/
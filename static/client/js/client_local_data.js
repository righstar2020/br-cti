var clientServerHost = localStorage.getItem("clientServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}
/*------------------step步骤函数------------------------*/
var currentStep = 1;
var stepUpdateList=[0,0,0,0]
var processStepTitleList = ["文件上传","重新上传","数据转换","数据上链"];
//上一步
function prevStep(){
    if(currentStep <= 1){
        return;
    }
    currentStep--;
    updateStep(currentStep);

}
//下一步
function nextStep(){
    currentStep++;
    updateStep(currentStep);
}
//更新stepBar
function updateStep(step){
    console.log("step:",step);
     //隐藏所有step
     $(`.client-data-process-step-box`).removeClass('process-step-active');
     $(`.client-data-process-step-box`).hide();
     //显示当前step
     console.log($(`.client-data-process-step-box[data-step="${step}"]`));
     $(`.client-data-process-step-box[data-step="${step}"]`).show();
     $(`.client-data-process-step-box[data-step="${step}"]`).addClass('process-step-active');
     $(`.client-data-process-step-toolbar .client-data-process-step-prev-title`).text(processStepTitleList[step-1]);
     if(step > 1){
        $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).removeClass('bars icon');
        $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).addClass('left arrow icon');
        
    }else{
         $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).removeClass('left arrow icon');
         $(`.client-data-process-step-toolbar .client-data-process-step-prev i`).addClass('bars icon');
    }
    //判断所在步骤并初始化
    if(step == 1){
        
    }else if(step == 2){
        if(stepUpdateList[1] == 0){
            initStepProcessStixData();
            stepUpdateList[1] = 1;
        }
    }


}
/*------------------step步骤函数 end------------------------*/
/*------------------工具函数------------------------*/
//截断文本
function truncateText(text, maxLength,endLength) {
    if (endLength == null) {
        endLength = 6;
    }
    if(text.length <= maxLength){
        return text;
    }
    if(maxLength>(text.length-endLength)){
        maxLength = text.length-endLength;
    }
    return text.length > maxLength ? text.substring(0, maxLength) + '...' + text.substring(text.length - endLength) : text;
}
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/*------------------工具函数 end------------------------*/

/*------------------Setp 1文件上传------------------------*/
function updateProgress(fileId, progress) {
    let progressBar = $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-progress`);
    if (progressBar) {
        //semantic进度组件更新
        progressBar.progress({
            percent: progress
        });
    }
}
function addUploadFileItem(file) {
    // 克隆模板
    const uploadFileItem = document.getElementById("upload-file-template").cloneNode(true);
    // 移除模板的 display: none 样式
    uploadFileItem.style.display = 'block';
    // 设置文件 ID
    var fileId = Date.now(); // 使用时间戳作为文件 ID
    //设置id
    uploadFileItem.id = `upload-file-${fileId}`;
    uploadFileItem.setAttribute('data-file-id', fileId);
    uploadFileItem.querySelector('.upload-data-item-delete-btn').setAttribute('data-file-id', fileId);

    // 修改内容
    uploadFileItem.querySelector('.upload-data-item-name').innerText = file.name;
    uploadFileItem.querySelector('.upload-data-item-hash').innerText = ''; // 初始为空，稍后更新
    uploadFileItem.querySelector('.upload-data-item-size').innerText = formatSize(file.size);

    // 添加到目标元素
    // 使用jquery选择器
    const uploadDataList = $(`.upload-data-list`);
    uploadDataList.append(uploadFileItem);
    //触发步骤数据更新
    stepUpdateList[1] = 0;
    return fileId;
}


var uploadFileIds = [];
var uploadFileHashMap = {};
function deleteUploadFileItem(button) {
    const fileId = $(button).attr('data-file-id');
    //使用jquery选择器
    const item = $(`.upload-data-item[data-file-id="${fileId}"]`);
    if (item) {
        layer.confirm('确定删除该文件吗？', {
            btn: ['确定', '取消'] //按钮
        }, function(index){
            //删除uploadFileIds中的fileId
            uploadFileIds = uploadFileIds.filter(id => id !== fileId);
            //删除uploadFileHashMap中的fileId
            if (uploadFileHashMap[fileId]) {
                delete uploadFileHashMap[fileId];
            }
            //删除div item
            item.remove();
            
            // 重置 input 元素的 value
            document.getElementById('file-upload-input').value = '';
            //触发步骤数据更新
            stepUpdateList[1] = 0;
            // 关闭 layer 对话框
            layer.close(index);
        });
    }
}
/*文件上传-多个文件*/
function uploadFiles(files) {
    
    for (let i = 0; i < files.length; i++) {
        //添加文件上传item
        var  fileId = addUploadFileItem(files[i]);
        uploadFileIds.push(fileId);
        // 上传单个文件
        uploadSingleFile(fileId,files[i]);
    }
    
}

/*文件上传-单个文件*/
function uploadSingleFile(fileId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_id', fileId);

    $.ajax({
        url: clientServerHost + '/data/upload_file',
        type: 'POST',
        data: formData,
        contentType: false, // 不设置内容类型
        processData: false, // 不处理数据
        xhr: function() {
            const xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                //进度条
                xhr.upload.addEventListener('progress', function(event) {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        updateProgress(fileId, percentComplete);
                    }
                });
            }
            return xhr;
        },
        success: function(response) {
            console.log(response);
            if (response.code == 200) {
                const data = response.data;
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text(data.file_hash);
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-size`).text(formatSize(data.file_size));
                uploadFileHashMap[fileId] = data.file_hash;
            } else {
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text('上传失败');
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-size`).text("0 Bytes");
            }
            updateProgress(fileId, 100);
        },
        error: function() {
            $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text('上传失败');
            $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-size`).text("0 Bytes");
            updateProgress(fileId, 100);
        }
    });
}

//文件上传句柄
function handleFiles(files) {
    uploadFiles(files);
}

//绑定文件拖拽事件
bindDragDropEvent();
function bindDragDropEvent(){
   // 拖放事件处理
   const fileDropArea = document.getElementById('file-drop-area');

   ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
       fileDropArea.addEventListener(eventName, preventDefaults, false);
   });

   function preventDefaults(e) {
       e.preventDefault();
       e.stopPropagation();
   }

   fileDropArea.addEventListener('dragenter', highlight, false);
   fileDropArea.addEventListener('dragover', highlight, false);
   fileDropArea.addEventListener('dragleave', unhighlight, false);
   fileDropArea.addEventListener('drop', handleDrop, false);

   function highlight() {
       fileDropArea.classList.add('highlight');
   }

   function unhighlight() {
       fileDropArea.classList.remove('highlight');
   }

   function handleDrop(e) {
       const dt = e.dataTransfer;
       const files = dt.files;
       
       // 过滤文件格式
       const allowedFiles = Array.from(files).filter(file => {
           const ext = file.name.split('.').pop().toLowerCase();
           return ['xlsx', 'csv', 'txt'].includes(ext);
       });
       
       if(allowedFiles.length < files.length) {
           layer.msg('只支持上传xlsx、csv、txt格式的文件',{'time':1200});
       }
       
       if(allowedFiles.length > 0) {
           handleFiles(allowedFiles);
       }
   }

   // 点击事件处理
   fileDropArea.addEventListener('click', () => {
       document.getElementById('file-upload-input').click();
   });

   document.getElementById('file-upload-input').addEventListener('change', (e) => {
       const files = e.target.files;
       handleFiles(files);
   });

}
/*------------------Setp 1文件上传 end------------------------*/



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
        //设置按钮的process-id
        stixProcessDataItem.querySelector('.upload-data-item-tools button').setAttribute('data-process-id', processId);
        //设置获取流量特征字段按钮的process-id
        stixProcessDataItem.querySelector('.get-traffic-feature-field-btn').setAttribute('data-process-id', processId);
        //设置删除按钮的process-id
        stixProcessDataItem.querySelector('.stix-process-data-item-delete-btn').setAttribute('data-process-id', processId);
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
        $(`#stix-process-data-${processId} .ui.dropdown.stix-compress`).dropdown({
            values: [
                {name: '10条',value: '10',selected: true},
                {name: '50条',value: '50'},
                {name: '100条',value: '100'},
                {name: '500条',value: '500'},
                {name: '1000条',value: '1000'}
            ]
        });
    });
}

//从服务器获取流量特征字段
function getTrafficFeatureField(button){
    var processId = $(button).attr('data-process-id');
    var file_hash = uploadFileHashMap[processId];
    console.log("uploadFileHashMap:",uploadFileHashMap);
    console.log("processId:",processId);
    console.log("file_hash:",file_hash);
    if (!file_hash) {
        console.error("file_hash 未定义，请检查 uploadFileHashMap 是否正确更新");
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
    const item = $(`.stix-process-data-item[data-process-id="${processId}"]`);
    item.remove();
}

//开始数据格式转换
function startStixProcessData(button){
    const processId = $(button).attr('data-process-id');
    if(processId == null){
        return;
    }
    //保存配置
    startStixProcessDataWithConfig(button);
}

//保存配置并开始数据格式转换
function startStixProcessDataWithConfig(button){
    const processId = $(button).attr('data-process-id');
    const form = $(`.stix-process-data-config-form[data-process-id="${processId}"]`);
    var stixProcessDataConfig = {
        "process_id": processId,
        "file_hash": uploadFileHashMap[processId],
        "stix_type": form.find('select[name="stix_type"]').val(),
        "stix_traffic_features": form.find('input[name="traffic_feature_field"]').val(),
        "stix_iocs": form.find('select[name="stix_iocs"]').val(),
        "stix_label": form.find('select[name="stix_label"]').val(),
        "stix_compress": form.find('select[name="stix_compress"]').val(),
        "stix_label": form.find('select[name="stix_label"]').val(),
    };
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
                }
            }
        },
        error: function(response){
            console.log(response);
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
    },100);
}
function getStixProcessProgress(processId){
    $.ajax({
        url: clientServerHost + '/data/get_stix_process_progress',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"file_hash": uploadFileHashMap[processId]}),
        success: function(response){
            console.log(response);
            if(response.code == 200){
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
                }
                //处理完成
                if(progress == 100){
                    delete processPollingIntervalMap[processId];
                    clearInterval(processPollingIntervalMap[processId]);
                    $(`.stix-process-data-item[data-process-id="${processId}"] .stix-process-data-item-status`).
                    text(`处理完成${progress}%(${current_step}/${total_step})`);
                }
            }
        },
        error: function(response){
            console.log(response);
        }
    });
}


/*------------------Setp 2 STIX数据转换 end------------------------*/






/*------------------Setp 3 数据上链------------------------*/

/*------------------Setp 3 数据上链 end------------------------*/


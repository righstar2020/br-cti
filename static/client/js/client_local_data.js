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
    //判断中文or英文
    var isChinese = /[\u4e00-\u9fa5]/.test(file.name);
    var file_name = file.name;
    if(file_name.length > 15 && isChinese){
        file_name = truncateText(file.name,15,6);
    }else{
        file_name = truncateText(file.name,23,6);
    }
    uploadFileItem.querySelector('.upload-data-item-name').innerText = file_name;
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
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text(truncateText(data.file_hash,18,6));
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
       handleFiles(files);
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
    copyFileDataListHtml();
}
function copyFileDataListHtml(){
    var fileDataListHtml =  document.getElementsByClassName(`upload-data-list`)[0].cloneNode(true);
    fileDataListHtml.id = 'stix-process-data-list';
    fileDataListHtml.classList.add('stix-process-data-list');
    $(`.client-data-process-step-box[data-step="2"] .stix-process-data-list-box`).html(fileDataListHtml);
}
function convertStixData(){

}




/*------------------Setp 2 STIX数据转换 end------------------------*/






/*------------------Setp 3 数据上链------------------------*/

/*------------------Setp 3 数据上链 end------------------------*/


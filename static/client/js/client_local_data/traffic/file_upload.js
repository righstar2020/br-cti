/*------------------Setp 1文件上传------------------------*/
function updateProgress(fileId, progress ,fail=false) {
    let progressBar = $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-progress`);
    let taskFileHash = taskFileHashMap[fileId];
    if (progressBar) {
        //semantic进度组件更新
        progressBar.progress({
            percent: progress
        });
    }
    if(progress == 100&&!fail){
        //设置进度条颜色为绿色
        $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-progress`).addClass('success');
    }
    if(fail){
        //设置进度条颜色为红色
        $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-progress`).addClass('error');
        //设置进度条百分比为100
        progressBar.progress({
            percent: 100
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
    updateStepStatus(0)
    return fileId;
}
function deleteUploadFileItem(button) {
    const fileId = $(button).attr('data-file-id');
    //使用jquery选择器
    const item = $(`.upload-data-item[data-file-id="${fileId}"]`);
    if (item) {
        layer.confirm('确定删除该文件吗？', {
            btn: ['确定', '取消'] //按钮
        }, function(index){
            //删除taskFileIds中的fileId
            taskFileIds = taskFileIds.filter(id => id !== fileId);
            //删除taskFileHashMap中的fileId
            if (taskFileHashMap[fileId]) {
                delete taskFileHashMap[fileId];
            }
            //删除div item
            item.remove();
            
            // 重置 input 元素的 value
            document.getElementById('file-upload-input').value = '';
            //触发步骤数据更新
            updateStepStatus(1)
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
        taskFileIds.push(fileId);
        // 上传单个文件
        uploadSingleFile(fileId,files[i]);
    }
    
}

/*文件上传-单个文件*/
function uploadSingleFile(fileId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', fileId); //文件ID作为task_id

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
                taskFileHashMap[fileId] = data.file_hash;
                taskRecord = data.task_record;
                //检查是否有任务记录
                if(taskRecord && taskRecord != undefined){
                    //更新历史任务记录状态
                    updateHistoryTaskRecord(taskRecord);
                    //查询本地STIX数据(一次)
                    queryLocalStixData(data.file_hash);
                }
                //更新step
                updateStepStatus(1)
            } else {
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text('上传失败');
                $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-size`).text("0 Bytes");
            }
            updateProgress(fileId, 100);
        },
        error: function() {
            
            $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-hash`).text('上传失败');
            $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-size`).text("0 Bytes");
            updateProgress(fileId, 100,true);
        }
    });
}

/**
 * 更新历史任务记录状态
 * @param {Object} taskRecord - 任务记录对象
 */
function updateHistoryTaskRecord(taskRecord) {
    if (!taskRecord.step_status || taskRecord.step_status.length === 0) {
        return;
    }
    
    // 遍历所有已完成的步骤状态
    taskRecord.step_status.forEach(stepStatus => {
        if (stepStatus.status === "finished") {
            updateTaskFinishStepStatus(taskRecord.source_file_hash, stepStatus.step.toString(), true);
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
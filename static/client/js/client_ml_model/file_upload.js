/*------------------Step 1文件上传------------------------*/
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
        //设置进度条颜色为定制蓝色
        $(`.upload-data-item[data-file-id="${fileId}"] .upload-data-item-progress`).addClass('custom-blue');
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

function addFileUploadItem(file) {
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
    const uploadDataList = $(`.upload-data-list`);
    uploadDataList.append(uploadFileItem);
    //触发步骤数据更新
    stepInitStatusList[1] = 0;
    return fileId;
}

function deleteUploadFileItem (button) {
    const fileId = $(button).attr('data-file-id');
    const item = $(`.upload-data-item[data-file-id="${fileId}"]`);
    if (item) {
        layer.confirm('确定删除该文件吗？', {
            btn: ['确定', '取消'] 
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
            stepInitStatusList[1] = 0;
            // 关闭 layer 对话框
            layer.close(index);
        });
    }
}

function uploadFiles(files) {
    for (let i = 0; i < files.length; i++) {
        //添加文件上传item
        var fileId = addFileUploadItem(files[i]);
        taskFileIds.push(fileId);
        // 上传单个文件
        uploadSingleFile(fileId,files[i]);
    }
}

function uploadSingleFile(fileId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_id', fileId);

    $.ajax({
        url: clientServerHost + '/ml/upload_dataset_file',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        xhr: function() {
            const xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
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
                //更新任务状态
                updateTaskFinishStepStatus(data.file_hash,"0",true);
                //查询本地MODEL数据(一次)
                queryLocalModelData(data.file_hash);
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

function handleFiles(files) {
    uploadFiles(files);
}

//绑定文件拖拽事件
bindDragDropEvent();
function bindDragDropEvent(){
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
/*------------------Step 1文件上传 end------------------------*/
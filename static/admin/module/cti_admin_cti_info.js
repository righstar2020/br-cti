layui.use(['form', 'element', 'admin', 'func','common'], function () {
    var $ = layui.jquery;
    var form = layui.form;
    var element = layui.element;
    var admin = layui.admin;
    var common = layui.common
    /* 选择头像 */
    $('#userInfoHead').click(function () {
        layer.msg("头像裁剪完善中");
        return false;
        // admin.cropImg({
        //     imgSrc: $('#userInfoHead>img').attr('src'),
        //     onCrop: function (res) {
        //         $('#userInfoHead>img').attr('src', res);
        //         parent.layui.jquery('.layui-layout-admin>.layui-header .layui-nav img.layui-nav-img').attr('src', res);
        //     }
        // });
    });

    /* 监听表单提交 */
    form.on('submit(submitCtiEditForm)', function (data) {
        // 在发送数据之前，进行数据格式转换
        data.field.id = parseInt(data.field.id, 10);
        data.field.data_size = parseInt(data.field.data_size, 10);
        data.field.type = parseInt(data.field.type, 10);
        
        data.field.open_source = parseInt(data.field.open_source, 10);
        data.field.threat_level = parseInt(data.field.threat_level, 10);
        data.field.confidence = parseFloat(data.field.confidence);
        data.field.need = parseInt(data.field.need, 10);
        data.field.value = parseFloat(data.field.value);
        data.field.compre_value = parseFloat(data.field.compre_value);

        // // 提交表单
        common.submitForm(data.field, null, function (res, success) {
            console.log("保存成功回调");
        });
        return false;
    });

});

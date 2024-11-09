layui.use(['func','common','form','table'], function () {
    // 声明变量
    var func = layui.func,form = layui.form ,common = layui.common,table = layui.table
        , $ = layui.$,form = layui.form;

    if (A == 'index') {
        //【TABLE列数组】
        var cols = [
            {field: 'id', width: 80, title: 'ID', align: 'center', sort: true, fixed: 'left'},
            {field: 'cti_name', width: 120, title: 'CTI名称', align: 'center'},
            {field: 'tags', width: 120, title: '标签', align: 'center'},
            {field: 'publisher', width: 120, title: '发布者', align: 'center'},
            {field: 'open_source', width: 100, title: '开源形式', align: 'center', templet: function (d) {
                var sourceText = '';
                switch (d.open_source) {
                    case 0:
                        sourceText = '不开源';
                        break;
                    case 1:
                        sourceText = '开源';
                        break;
                    case 2:
                        sourceText = '部分开源';
                        break;
                    default:
                        sourceText = '未知';
                }
                return sourceText;
            }},
            {field: 'type', width: 120, title: '类型', align: 'center',templet: function (d) {
                var sourceText = '';
                var type_labels = ['钓鱼地址','恶意程序','放马地址','恶意邮箱','恶意手机号','僵尸网络','社交账号',' DDoS数据','开源情报']
                var index  = d.type-1;
                sourceText = type_labels[index];
                return sourceText;
            }},
            {field: 'data_size', width: 100, title: '数据大小', align: 'center'},
            {field: 'threat_level', width: 100, title: '威胁等级', align: 'center'},
            {field: 'confidence', width: 120, title: '可信度分数', align: 'center'},
            {field: 'need', width: 100, title: '需求量', align: 'center'},
            {field: 'value', width: 120, title: '评估价值', align: 'center'},
            {field: 'compre_value', width: 120, title: '综合价值', align: 'center'},
            {field: 'hash', width: 180, title: '数据Hash(MD5)', align: 'center'},
            {field: 'chain_id', width: 180, title: '链上ID', align: 'center'},
            {fixed: 'right', width: 150, title: '操作', align: 'left', toolbar: '#toolBar'}
        ];


        //【渲染TABLE】
        func.tableIns(cols, "tableList",function (layEvent, data) {
            
        });

        //【设置弹框】
        func.setWin("CTI");

        //【设置状态】
        func.formSwitch('status', null, function (data, res) {
            console.log("开关回调成功");
        });
        
        //【工具栏定义】
        // var toolBar = `
        //     <a class="layui-btn layui-btn layui-btn-xs btnEdit" lay-event="edit">编辑</a>
        //     <a class="layui-btn layui-btn-danger layui-btn-xs btnDel" lay-event="del">删除</a>
        // `;
        // $('#toolBar').html(toolBar);

    } else {
        // 自定义验证规则
        form.verify({
            integerVerify: function(value, elem) {
                if (!/^-?\d+$/.test(value)) {
                    return 'This field must be an integer';
                }
                // 这里可以进行数据格式转换
                $(elem).val(parseInt(value, 10));
            },
            floatVerify: function(value, elem) {
                if (!/^-?\d+(\.\d+)?$/.test(value)) {
                    return 'This field must be a floating point number';
                }
                // 这里可以进行数据格式转换
                $(elem).val(parseFloat(value));
            }
        });
        form.on('submit(submitCtiAddForm)', function (data) {
            // 在发送数据之前，进行数据格式转换
            data.field.type = parseInt(data.field.type, 10);
            data.field.data_size = parseInt(data.field.data_size, 10);
            data.field.open_source = parseInt(data.field.open_source, 10);
            data.field.threat_level = parseInt(data.field.threat_level, 10);

            // // 提交表单
            common.submitForm(data.field, null, function (res, success) {
                console.log("保存成功回调");
            });
            return false;
        });
    }
});
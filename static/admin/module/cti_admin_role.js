/**
 * 角色管理
 * @author mwq
 * @since 2021/7/26
 */
layui.use(['func', 'admin','form','common',  'zTree'], function () {

    //声明变量
    var func = layui.func,form = layui.form ,common = layui.common
        , admin = layui.admin
        , $ = layui.$;

    if (A == 'index') {
        //【TABLE列数组】
        var cols = [
            {type: 'checkbox', fixed: 'left'}
            , {field: 'id', width: 90, title: 'ID', align: 'center', sort: true, fixed: 'left'}
            , {field: 'name', width: 200, title: '角色名称', align: 'center'}
            , {field: 'status', width: 120, title: '状态', align: 'center', templet: function (d) {
                return  '<input type="checkbox" name="status" value="' + d.id + '" lay-skin="switch" lay-text="正常|禁用" lay-filter="status" '+(d.status==1 ? 'checked' : '')+'>';
            }}
            , {field: 'sort', width: 100, title: '排序', align: 'center'}
            , {field: 'create_time', width: 180, title: '添加时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.create_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {field: 'update_time', width: 180, title: '更新时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.update_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {fixed: 'right', width: 280, title: '功能操作', align: 'center', toolbar: '#toolBar'}
        ];

        //【渲染TABLE】
        func.tableIns(cols, "tableList", function (layEvent, data) {
            if (layEvent === 'permission') {
                admin.open({
                    title: '角色权限分配',
                    btn: ['保存', '取消'],
                    content: '<ul id="roleAuthTree" class="ztree"></ul>',
                    success: function (layero, dIndex) {
                        var loadIndex = layer.load(2);
                        $.get('/role/menu_list/' + data.id, function (res) {
                            layer.close(loadIndex);
                            if (0 === res.code) {
                                $.fn.zTree.init($('#roleAuthTree'), {
                                    check: {enable: true},
                                    data: {simpleData: {enable: true}}
                                }, res.data);
                            } else {
                                layer.msg(res.msg, {icon: 2});
                            }
                        }, 'json');
                        // 超出一定高度滚动
                        $(layero).children('.layui-layer-content').css({'max-height': '300px', 'overflow': 'auto'});
                    },
                    yes: function (dIndex) {
                        var insTree = $.fn.zTree.getZTreeObj('roleAuthTree');
                        var checkedRows = insTree.getCheckedNodes(true);
                        var ids = [];
                        for (var i = 0; i < checkedRows.length; i++) {
                            ids.push(checkedRows[i].id);
                        }
                        func.ajaxPost("/role/menu_list/save", {role_id: data.id, menu_ids: ids.join(',')}, function (res, success) {
                            // 关闭窗体
                            layer.close(dIndex);
                        });
                    }
                });
            }
        });

        //【设置弹框】
        func.setWin("角色", 500, 350);

        //【设置状态】
        func.formSwitch('status', null, function (data, res) {
            console.log("开关回调成功");
        });
    } else {
        form.on('submit(submitForm)', function (data) {

            // 提交表单
            common.submitForm(data.field, null, function (res, success) {
                console.log("保存成功回调");
            });
            return false;
        });
    }
});

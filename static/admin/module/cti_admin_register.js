layui.use(['layer', 'form', 'index'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var form = layui.form;
    var index = layui.index;
    $('.register-wrapper').removeClass('layui-hide');
    form.verify({
        verifyUserName: function(value) {
            if (value.length < 5 || value.length > 30) {
                return '用户名长度必须在5到30个字符之间';
            }
        },
        verifyPwd: function(value) {
            if (value.length < 1 || value.length > 20) {
                return '密码长度必须在1到20个字符之间';
            }
        },
        verifyEmail: function(value) {
            var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!reg.test(value)) {
                return '邮箱格式不正确';
            }
        },
        verifyPassword: function(value, elem) {
            if ($('#password').val() !== value) {
                return '两次输入的密码不一致！';
            }
        },
    })
    // 注册事件
    form.on('submit(registerSubmit)', function (data) {
        // 设置按钮文字“注册中...”及禁止点击状态
        $(data.elem).attr('disabled', true).text('注册中。。。');

        // 网络请求
        var loadIndex = layer.load(2);
        $.ajax({
            type: "POST",
            url: '/register',
            data: JSON.stringify(data.field),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function () {
                // TODO...
            },
            success: function (res) {
                layer.close(loadIndex);
                if (res.code == 0) {
                    // 清除Tab记忆
                    index.clearTabCache();

                    // 设置注册成功状态
                    $(data.elem).attr('disabled', true).text('注册成功');

                    // 提示语
                    layer.msg('注册成功', {
                        icon: 1,
                        time: 1500
                    });

                    // 延迟3秒
                    setTimeout(function () {
                        // 跳转后台首页
                        window.location.href = "/index";
                    }, 2000);

                    return false;
                } else {
                    // 错误信息
                    layer.msg(res.msg, {icon: 2, anim: 6});
                    // 刷新验证码
                    $('img.register-captcha').click(function () {
                        this.src = '/captcha?t=' + (new Date).getTime();
                    }).trigger('click');

                    // 延迟3秒恢复可注册状态
                    setTimeout(function () {
                        // 设置按钮状态为注册”
                        var register_text = $(data.elem).text().replace('中。。。', '');
                        // 设置按钮为可点击状态
                        $(data.elem).text(register_text).removeAttr('disabled');
                    }, 1000);
                }
            },
            error: function () {
                layer.msg("AJAX请求异常");
            }
        });
        return false;
    });

    // 获取图片验证码
    $('img.register-captcha').click(function () {
        var url = "/captcha?t=" + (new Date).getTime();
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                if (res.code == 0) {
                    this.src = res.data;
                    $("#imgcode").attr("src", res.data);
                    $("#idkey").val(res.idkey);
                }
            }
        });
    }).trigger('click');

});
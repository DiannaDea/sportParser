function checkConfirmPassword(newPassword, confirmPassword){
    return newPassword === confirmPassword;
}

function handlePasswordChangeEvents(adminName) {
    $("#btn-change-password").click(function () {
        if(!checkConfirmPassword($("#newPassword").val(), $("#confirmPassword").val())){
            $("#res").html("<p>Пароли не совпадают</p>");
            return;
        }
        $.ajax({
            url: `/admin/${adminName}/changePassword`,
            type: "post",
            dataType: "json",
            data: {
                oldPassword: $("#oldPassword").val(),
                newPassword: $("#newPassword").val()
            },
            statusCode: {
                200: function (data) {
                    $("#res").html("<p>Пароль успешно изменен</p>");
                    setTimeout(() => {
                        window.location.replace(`/admin/${adminName}`);
                    }, 1200);
                },
                401: function () {
                    $("#res").html("<p>Old password isn't valid</p>");
                }
            }
        })
    })
}


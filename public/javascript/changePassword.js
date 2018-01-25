function checkConfirmPassword(newPassword, confirmPassword){
    return newPassword === confirmPassword;
}

function handlePasswordChangeEvents(adminName) {
    $("#btn-change-password").click(function () {
        if(!checkConfirmPassword($("#newPassword").val(), $("#confirmPassword").val())){
            $("#res-danger").css("display", "block");
            $("#res-success").css("display", "none");
            $("#res-danger").text("Пароли не совпадают");
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
                    $("#res-success").css("display", "block");
                    $("#res-danger").css("display", "none");
                    $("#res-success").text("Пароль успешно изменен");
                    setTimeout(function () {
                        window.location.replace(`/admin/${adminName}`);
                    }, 1200)

                },
                401: function () {
                    $("#res-danger").css("display", "block");
                    $("#res-success").css("display", "none");
                    $("#res-danger").text("Неправильный старый пароль");
                }
            }
        })
    })
}


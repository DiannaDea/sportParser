function handleAdminLogin() {
    $("#btn-login").click(function () {
        $.ajax({
            url: `/admin/login`,
            type: "post",
            dataType: "json",
            data: {
                login: $("#login").val(),
                password: $("#password").val()
            },
            statusCode: {
                200: function () {
                    $("#res").html("<p>Вход выполнен</p>");
                    setTimeout(() => {
                        window.location.replace(`/admin/${$("#login").val()}`);
                    }, 0);
                },
                401: function () {
                    $("#res").html("<p>Такого пользователя не существует</p>");
                    $("#login").val("");
                    $("#password").val("");
                }
            }
        })
    });
}

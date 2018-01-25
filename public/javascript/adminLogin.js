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
                    $("#res-success").css("display", "block");
                    $("#res-danger").css("display", "none");
                    setTimeout(() => {
                        window.location.replace(`/admin/${$("#login").val()}`);
                    }, 1000);
                },
                401: function () {
                    $("#res-success").css("display", "none");
                    $("#res-danger").css("display", "block");
                    $("#login").val("");
                    $("#password").val("");
                }
            }
        })
    });
}

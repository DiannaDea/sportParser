function handleParseEvents(adminName) {
    $("#param-parsing").focusout(function(){
        let name = $(this).attr("name");
        if(name === "time"){
            if($(this).val() === "00:00"){
                $("#res").css("display", "block");
                $("#res").empty();
                $("#res").text("Время парсинга не может быть нулевым");

                $("#btn-set-parse").addClass("disabled");
                setTimeout(() => {
                    $("#res").css("display", "none");
                }, 4000);

            }
            else{
                $("#btn-set-parse").removeClass("disabled");
            }
        }
        else {
            if(+$(this).val() < 1 ){
                $("#res").css("display", "block");
                $("#res").empty();
                $("#res").text("Дата парсинга не может быть отрицательной");

                $("#btn-set-parse").addClass("disabled");
                setTimeout(() => {
                    $("#res").css("display", "none");
                }, 4000);

            }
            else{
                $("#btn-set-parse").removeClass("disabled");
            }
        }
    });

    $("#parseBy").change(function () {
        if ($("#parseBy option:selected").val() === "time") {
            $("#param-parsing").attr("type", "time");
            $("#param-parsing").attr("name", "time");
            $("#param-parsing").val("00:00");
        }
        else {
            $("#param-parsing").attr("type", "number");
            $("#param-parsing").attr("name", "day");
            $("#param-parsing").val("1");
        }
    })

    $("#btn-set-parse").click(function () {
        let dataForServer = {};
        if ($("#parseBy option:selected").val() === "time") {
            dataForServer.time = $("input[name=time]").val()
        }
        else {
            dataForServer.day = $("input[name=day]").val()
        }
        if($("#param-parsing").attr("name") === "time" && $("#param-parsing").val() === "00:00" ){
            return;
        }
        else if($("#param-parsing").attr("name") === "day" && +$("#param-parsing").val() < 1 ){
            return;
        }
        else{
            $.ajax({
                url: `/admin/setParse/${adminName}`,
                type: "post",
                dataType: "json",
                data: dataForServer,
                statusCode: {
                    200: function () {
                        $("#res").css("display", "block");
                        $("#res").text("Время парсинга успешно изменено");
                        setTimeout(function () {
                            $("#res").css("display", "none");
                        }, 2000)

                    },
                }
            })
        }
    })

    $("#btn-start-parse").click(function () {
        $.ajax({
            url: `/admin/startParse`,
            type: "post",
            statusCode: {
                200: function () {
                    $("#res").css("display", "block");
                    $("#res").empty();
                    $("#res").text("Парсинг начался");
                    setTimeout(function () {
                        $("#res").css("display", "none");
                    }, 2000)
                },
            }
        })
    })

    $("#btn-stop-parse").click(function () {
        $.ajax({
            url: `/admin/stopParse`,
            type: "post",
            statusCode: {
                200: function () {
                    $("#res").css("display", "block");
                    $("#res").empty();
                    $("#res").text("Парсинг остановлен");
                    setTimeout(function () {
                        $("#res").css("display", "none");
                    }, 2000)
                },
            }
        })
    })

    $("#btn-logout").click(function () {
        $.ajax({
            url: `/admin/logout`,
            type: "post",
            statusCode: {
                200: function () {
                    $("#res").css("display", "block");
                    $("#res").empty();
                    $("#res").text("Вы вышли из аккаунта");
                    setTimeout(function () {
                        window.location.replace(`/admin`);
                    }, 2000)
                },
            }
        })
    })
}
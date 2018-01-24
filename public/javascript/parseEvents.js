function handleParseEvents(adminName) {
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
        $.ajax({
            url: `/admin/setParse/${adminName}`,
            type: "post",
            dataType: "json",
            data: dataForServer,
            statusCode: {
                200: function () {
                    $("#res").html("<p>Время парсинга успешно изменено</p>");
                },
            }
        })
    })

    $("#btn-start-parse").click(function () {
        $.ajax({
            url: `/admin/startParse`,
            type: "post",
            statusCode: {
                200: function () {
                    $("#res").empty();
                    $("#res").html("<p>Парсинг начался</p>");
                },
            }
        })
    })
}
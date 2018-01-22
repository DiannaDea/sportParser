function renderLongNews(news){
    let $container_long_news = $(".container-long-news");
    $container_long_news.empty();
    news.map(item => {
        $container_long_news.append(`
            <div class="news-item shadow-wrap item-long ">
                <div class="container-body">
                    <div class="item-media">
                        <img src="${item.imageSrc}"  alt="${item.title}"/>
                    </div>
                    <div class="item-info">
                        <div class="item-title">
                            <h2>${item.title}</h2>
                        </div>
                        <div class="item-description">
                            <p>${item.description}</p>
                        </div>
                    </div>
                </div>
            </div>`)
    })
}

function renderShortNews(news){
    let $container_short_news = $(".container-short-news");
    $container_short_news.empty();
    $container_short_news.append("<h1>TOP HEADERS</h1>")
    news.map(item => {
        $container_short_news.append(`
                <h3>${item.title}</h3>
            `)
    })
}

function handleDateAndTimeChange(date, time){
    $.ajax({
        url: `${$(".site-title h1").text()}/${date}/${time}`,
        type: "get",
        success: function (data) {
            console.log(data);
            renderLongNews(data.longNews);
            renderShortNews(data.shortNews);
        }
    })
}

function startRenderNews(date, time, datesAndTimes){

    const $date_placeholder = $("#date-placeholder");

    let selectedTimes = datesAndTimes[date];
    console.log(datesAndTimes);

    $("#date").change(function () {
        date = $(this).val();
        selectedTimes = datesAndTimes[date];
        if(selectedTimes === undefined){
            alert("No parsing this date");
        }
        else{
            $('#dates-slider').prop('max', selectedTimes.length);
            handleDateAndTimeChange(date, time);
        }
    })

    $("#dates-slider").change(function () {
        $date_placeholder.empty();
        console.log($(this).val())
        time = selectedTimes[parseInt($(this).val()) - 1];
        $date_placeholder.append(time);
        handleDateAndTimeChange(date, time);
    })
}
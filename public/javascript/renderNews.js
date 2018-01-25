function renderLongNews(news){
    let $container_long_news = $(".container-long-news");
    $container_long_news.empty();
    $container_long_news.prepend(`
        <div class="container-header">
            <h1>TOP NEWS</h1>
        </div>
    `)
    news.map(item => {
        $container_long_news.append(`
            <div class="container-body">
                    <div class="item-media">
                        <img src="${item.imageSrc}"  alt="${item.title}"/>
                    </div>
                    <div class="item-info">
                        <div class="item-title">
                            <a href="${item.link}"><h2>${item.title}</h2></a>
                        </div>
                        <div class="item-description">
                            <p>${item.description}</p>
                        </div>
                    </div>
                </div>
     `)
    })
}

function renderShortNews(news){
    let $container_short_news = $(".container-short-news");
    $container_short_news.empty();
    $container_short_news.append("<h1>TOP HEADERS</h1>")
    news.map(item => {
        $container_short_news.append(`
                <a href="${item.link}"><p>${item.title}</9></a>
            `)
    })
}

function handleDateAndTimeChange(date, time){
    $.ajax({
        url: `${$(".site-title h1").text()}/${date}/${time}`,
        type: "get",
        beforeSend: function () {
            $(".loader").css("display", "inline-block");
        },
        success: function (data) {
            console.log(data);
            $(".loader").css("display", "none");
            renderLongNews(data.longNews);
            renderShortNews(data.shortNews);
        }
    })
}

function changeTimeInPlaceholder(time){
    const $date_placeholder = $("#date-placeholder");
    $date_placeholder.empty();
    $date_placeholder.append(time);
}

function changeSliderVal(value) {
    $("#dates-slider").val(value);
}

function startRenderNews(date, time, datesAndTimes){
    let selectedTimes = datesAndTimes[date];
    $("#date").change(function () {
        date = $(this).val();
        selectedTimes = datesAndTimes[date];
        if(selectedTimes === undefined){
            alert("No parsing this date");
        }
        else{
            $('#dates-slider').prop('max', selectedTimes.length);
            changeSliderVal(selectedTimes.length);
            changeTimeInPlaceholder(selectedTimes[selectedTimes.length-1]);
            //handleDateAndTimeChange(date, time);
        }
    });

    $("#dates-slider").change(function () {
        time = selectedTimes[parseInt($(this).val()) - 1];
        changeTimeInPlaceholder(time);
        handleDateAndTimeChange(date, time);
    });

    $("#dates-slider").on("mousewheel", function (e) {
        e.preventDefault();
        let valSlider = +$(this).val();
        let wheelDelta = e.originalEvent.wheelDelta / 120 ;
        if(valSlider === 1 && wheelDelta === -1){
            alert("Unable to get out of input range");
            return;
        }
        if(valSlider === selectedTimes.length && wheelDelta === 1){
            alert("Unable to get out of input range");
            return;
        }
        wheelDelta > 0 ? valSlider++ : valSlider--;
        $(this).val(valSlider);
        time = selectedTimes[valSlider - 1];
        changeTimeInPlaceholder(time);
        handleDateAndTimeChange(date, time);

    })
}


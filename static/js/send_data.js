let verified = false;

window.verify = () => {
    verified = true;
};

(($) => {
    $(document)
    .on("click", '#sendData', (event) => {
        if (!verified) {
            $(".g-recaptcha > div").css({
                border: "solid 1px red"
            });
            window.setTimeout(() => {
                $(".g-recaptcha > div").css({
                    border: "none"
                });
            }, 2000);
        } else {
            let adTitle = $('#adTitle').val();
            let jobTitle = $('#jobTitle').val();
            let adType = $('#adType').val();
            let payType = $('#payType').val();
            let website = $('#website').val();
            let adPrice = $('#adPrice').val();
            let currency = $('#currency').val();
            let country = $('#country').val();
            let state = $('#state').val();
            let city = $('#city').val();
            let adDetail = $('#adDetail').val();
            $.ajax({
                url: "/ajaxData/",
                data: JSON.stringify({
                    'adTitle' : adTitle, 
                    'jobTitle' : jobTitle, 
                    'adType' : adType, 
                    'payType' : payType, 
                    'website' : website, 
                    'adPrice' : adPrice, 
                    'currency' : currency, 
                    'country' : country, 
                    'state' : state, 
                    'city' : city, 
                    'adDetail' : adDetail
                }),
                contentType: "application/json",
                type: 'POST',
                success: (response) => {
                    if (response.result > 0){
                        alert("Successful, Thank you!");
                        $('#adTitle').val("");
                        $('#jobTitle').val("");
                        $('#adType').val("");
                        $('#payType').val("");
                        $('#website').val("");
                        $('#adPrice').val("");
                        $('#currency').val("");
                        $('#country').val("");
                        $('#adDetail').val("");
                        $('#state').val("");
                        $('#city').val("");
                    }
                },
                error: (error) => {
                    alert("failure");
                    console.log(error);
                }
            });
        }
    })
    .on("click", "div.g-recaptcha", (event) => {
        $(".g-recaptcha > div").css({
            border: "none"
        });
    })
    .on("change", '#country', (event) => {
        let country = $('#country').val();
        $.ajax({
            url: "/getStates/",
            data: JSON.stringify({
                'country' : country
            }),
            contentType: "application/json",
            type: 'POST',
            success: (response) => {
                let $states = $("#state");
                let states = response.states;
                $states.children().remove();
                $states.append(
                    $("<option/>")
                        .text("Select State")
                        .css({display: "none"})
                        .prop({
                            selected: true,
                            disabled: true
                        })
                )
                for(let i = 0; i < states.length; i ++) {
                    $states.append(
                        $("<option/>").val(states[i].id).text(states[i].state_name)
                    )
                }
            },
            error: (error) => {
                console.log(error);
            }
        });
    })
    .on("change", "#state", (event) => {
        let state = event.target.value;
        $.ajax({
            url: "/getCities/",
            data: JSON.stringify({
                'state' : state
            }),
            contentType: "application/json",
            type: 'POST',
            success: (response) => {
                let $cities = $("#city");
                let cities = response.cities;
                $cities.children().remove();

                $cities.append(
                    $("<option/>")
                        .text("Select City")
                        .css({display: "none"})
                        .prop({
                            selected: true,
                            disabled: true
                        })
                )
                for(let i = 0; i < cities.length; i ++) {
                    $cities.append(
                        $("<option/>").val(cities[i].id).text(cities[i].city_name)
                    )
                };
            },
            error: (error) => {
                console.log(error);
            }
        });
    });

    
})(jQuery);


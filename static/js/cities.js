let Cities = (() => {
	let variable = null;

	const init = () => {
		if (document.getElementById("cities-table")) {
			$("table#cities-table")
			.on("click", "button.delete-city", (event) => {
				let cityId = event.target.getAttribute("data-id");
				let $curRecord = $(event.target).parents("tr.city-record");

				if (confirm("Are you sure that you want to delete this city?")) {
					$.ajax({
						url: "/deleteCity/",
						method: "POST",
						contentType: "application/json",
						data: JSON.stringify({
							id: cityId
						}),
						success: (response) => {
							console.log("Hey");
							$curRecord.remove();
						}
					});
				}
			});
		}
	};

	return {
		init: init
	}
})();

(($) => {
	window.Cities = Cities;
	Cities.init();
})(jQuery);
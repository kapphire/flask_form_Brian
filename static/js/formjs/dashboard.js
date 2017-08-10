let Dashboard = (() => {

	const _baseUrl = "/";
	let _selectedListId = null;

	let $_tblLists = $("#tbl-lists tbody");
	let $_tblItems = $("#tbl-items tbody");
	let $_tblModalItems = $("#tbl-modal-items tbody");
	let $_createListModal = $("#create-list-modal");
	let $_changeUserName = $("#changeName")
	let $_tblChangeList = $("#tbl-change-list tbody");

	const sendRequest = (endPoint, params, callback) => {
		$.ajax({
			url: _baseUrl + endPoint,
			data: JSON.stringify(params),
			contentType: "application/json",
			type: 'POST',
			success: (response) => {
				if (!response.status) {
					alert(response.message);
				} else if (typeof callback === "function") {
					callback(response.jsonData);
				}
			},
			error: (error) => {
				alert("failure");
				console.log(error);
			},
			
		});
	}

	const selectList = (listId) => {
		_selectedListId = listId;
		sendRequest("showItm/", {'listId': listId}, (items) => {
			$_tblItems.children().remove();
			$_tblModalItems.children().remove();
			tblItemCounter = 0;
			for (let i = 0; i < (items.jsonData).length; i++){
				if ((items.jsonData)[i].itmState == 'A'){
					++tblItemCounter;
					$_tblItems.append(
        			$(`<tr><td>${tblItemCounter}</td><td><a data-id="${(items.jsonData)[i].id}" class="selectLst">${(items.jsonData)[i].itmName}</a><td>${(items.jsonData)[i].itmCmt}</td><td>${(items.jsonData)[i].itmState}</td><td class="text-center"><a class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"> Edit</span></a></td>`),
					)
				}
        		let $record = $("<tr/>");
        		let $nameAnchor = $("<td/>").attr({"data-id": (items.jsonData)[i].id})
        			.append(
        				$("<input class='form-control'/>")
        					.attr({"type":"text"})
        					.val((items.jsonData)[i].itmName)
        			);
        		let $comment = $("<td/>")
        			.append(
        				$("<input class='form-control'/>")
        					.attr({"type":"text"})
        					.val((items.jsonData)[i].itmCmt)
    				);
        		let $state = $("<select/>");
        		let states = ['A', 'C', 'R'];
        		for (let j = 0; j < states.length; j++){
        			$state.append(
        				$("<option/>").val(states[j]).text(states[j])
        			)
        		}

        		$state.val((items.jsonData)[i].itmState);
        		let $hidden = $("<input/>").attr({"type" : "hidden"});
        		$record.append(
    				$(`<td>${i+1}</td>`),
    				$nameAnchor,
    				$comment,
    				$("<td/>").append($state),
    				$hidden
				)
        		
        		$_tblModalItems.append(
        			$record
				)
        	}
        	listName = items.listName;
			console.log(listName);
        	$("#list-name h2").text(listName);

        	$("#tbl-modal-items tr input").on('input', function(e){
				$(this).parent().parent().find('[type="hidden"]').val("U");
			})

			$("#tbl-modal-items tr select").change(function(e){
				$(this).parent().parent().find('[type="hidden"]').val("U");
			})
		});
	}

	const createList = (name) => {
		sendRequest("createList/", {'lstName' : name}, (list) => {
			let listsCount = $_tblLists.find("tr").length + 1;
			console.log(listsCount);
			let $record = $("<tr/>");
			let $nameAnchor = $("<a/>").addClass("select-list").attr({"data-id": list.id}).text(list.name);
			$nameAnchor.click(listSelectHanlder);

			if (listsCount == 1) {
				$record.addClass("selected");
				$record.append(
					$(`<td>${listsCount}</td>`),
					$("<td/>").append($nameAnchor),
					$(`<td>${list.state}</td>`),
					$(`<td class="text-center"><a class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"> Edit</span></a></td>`)
				)
				$_tblLists.append($record);
				_selectedListId = list.id;
			} else {
				$record.append(
					$(`<td>${listsCount}</td>`),
					$("<td/>").append($nameAnchor),
					$(`<td>${list.state}</td>`),
					$(`<td class="text-center"><a class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"> Edit</span></a></td>`)
				)
				$_tblLists.append($record);
			}

			$_createListModal.modal("hide");
		});
	}

	const createItem = (name, comment) => {
		sendRequest("createItm/", {
			'listId': _selectedListId,
			'name' : name,
            'comment' : comment
		}, (item) => {
			let itemsCount = $_tblItems.find("tr").length + 1;
			$_tblItems.append(
                $(`<tr><td>${itemsCount}</td><td><a data-id="${item.id}" class="selectLst">${item.name}</a><td>${item.comment || ""}</td><td>${item.state}</td><td class="text-center"><a class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"> Edit</span></a></td>`),
            )
            let $record = $("<tr/>");
    		let $nameAnchor = $("<td/>").attr({"data-id": item.id})
        			.append(
        				$("<input class='form-control'/>")
        					.attr({"type":"text"})
        					.val(item.name)
        			);
        	let $comment = $("<td/>")
        			.append(
        				$("<input class='form-control'/>")
        					.attr({"type":"text"})
        					.val(item.comment)
    				);
    		let $state = $("<select/>");
    		let states = ['A', 'C', 'R'];
    		for (let j = 0; j < states.length; j++){
    			$state.append(
    				$("<option/>").val(states[j]).text(states[j])
    			)
    		}

    		$state.val(item.state);

    		$record.append(
				$(`<td>${itemsCount}</td>`),
				$nameAnchor,
				$comment,
				$("<td/>").append($state)
			)
    		
    		$_tblModalItems.append(
    			$record
			)
            
		});
	}

	const changeList = (toUpdateList) => {
		sendRequest("changeList/", {
			'changeLists' : toUpdateList
		}, (lists) => {
			location.reload();
			console.log("success");
		});
	}

	const changeItem = (toUpdateItem) => {
		sendRequest("changeItem/", {
			'changeItems' : toUpdateItem
		}, (items) => {
			$_tblItems.children().remove();
			tblItemCounter = 0;
			for (let i = 0; i < items.length; i++){				
				++tblItemCounter;
				$_tblItems.append(
    			$(`<tr><td>${tblItemCounter}</td><td><a data-id="${items[i].id}" class="selectLst">${items[i].itmName}</a><td>${items[i].itmCmt}</td><td>${items[i].itmState}</td><td class="text-center"><a class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"> Edit</span></a></td>`),
				)				
			}

			console.log("success");
		});
	}

	const listSelectHanlder = (event) => {
		let listId = event.target.getAttribute("data-id");
		let curRecord = $(event.target).parents("tr");
		$("#tbl-lists tr.selected").removeClass("selected");
		curRecord.addClass("selected");
		selectList(listId);
	}

	const changeUsrName = (firstNm, lastNm) => {
		if (confirm("Are you sure that you want to change this name?")){
			sendRequest("changeName/", {
				'firstNm' : firstNm,
				'lastNm' : lastNm
			}, (result) => {
				alert(result.msg)
				firstName = result.firstname;
				lastName = result.lastname;
				name = firstName + ' ' + lastName;
				$(".subHead h1").text(name);
				$_changeUserName.modal("hide");
			});
		}
	}

	const createGroup = (grpName) => {
		sendRequest("createGroup/", {
			'grpName' : grpName
		}, (result) => {
			location.reload();
			console.log("success");
		});
	}

	const selectGroup = (selectGrp) => {
		sendRequest('selectGroup/', {
			'selectGrp' : selectGrp
		}, (result) => {
			console.log('success');
		})
	}


	
	const init = () => {
		// To do
		$(document)
		.on("click", '#create-list-ok', (event) => { 
			let lstName = $('#create-modal-list-name').val();
			if (lstName == ""){
				alert("Please fill the form")
			}
			else{
				createList(lstName);
			}
		})
		.on("click", "#tbl-lists a.select-list", listSelectHanlder)

		.on("click", "#create-item-modal-ok", (event) => {
			let name = $('#create-item-modal-name').val();
	        let comment = $('#create-item-modal-comment').val();
	        if (name == ""){
	        	alert("Please fill the form")
	        }
	        else{
	        	createItem(name, comment);
	    	}
		})

		.on("click", "#change-list", (event) => {
			let toUpdateList = [];
			$_tblChangeList.find('tr').each(function(i){
	    		let $tds = $(this).find('td'),
	    			id = $tds.eq(1).find('a').attr('data-id'),
					lstName = $tds.eq(1).find('input').val(),
					chgLstOpt = $tds.eq(2).find('select').val(),
					state = $(this).find('[type="hidden"]').val();
				toUpdateList.push({"id": id, "lstName": lstName, "chgLstOpt": chgLstOpt, "state" : state});
    		})
    		changeList(toUpdateList)
		})

		.on("click", "#change-item", (event) => {
			let toUpdateItem = [];
			$_tblModalItems.find('tr').each(function(i){
				let $tds = $(this).find('td'),
					id = $tds.eq(1).attr('data-id'),
					itmName = $tds.eq(1).find('input').val(),
					comment = $tds.eq(2).find('input').val(),
					chgItmOpt = $tds.eq(3).find('select').val(),
					state = $(this).find('[type="hidden"]').val();
				toUpdateItem.push({"id" : id, "itmName" : itmName, "comment" : comment, "chgItmOpt" : chgItmOpt, "state" : state})				
			})
			changeItem(toUpdateItem)
		})

		.on("click", "#change-user-name", (event) => {
			let firstNm = $('#change-firstNm').val();
			let lastNm = $('#change-lastNm').val();

			changeUsrName(firstNm, lastNm)
		})

		.on("click", "#create-group-ok", (event) => {
			let grpName = $("#create-modal-group").val();
			if (grpName == ''){
				alert("Please fill in the blanks");
			}
			createGroup(grpName);
		})

		.on("click", "#select-group-ok", (event) => {
			let selectGrp = $("#select-group-modal select").val();
			selectGroup(selectGrp);
		})

		$("#tbl-change-list tr input").on('input', function(e){
			$(this).parent().parent().parent().find('[type="hidden"]').val("U");
		})

		$("#tbl-change-list tr select").change(function(e){
			$(this).parent().parent().find('[type="hidden"]').val("U");
		})
		

		if ($_tblLists.find("tr").length > 0) {
			_selectedListId = $_tblLists.find("tr").eq(0).find("a.select-list").attr("data-id");
		}
	}

	return {
		init: init
	}
})();

((window, $) => {
	Dashboard.init();
})(window, jQuery);
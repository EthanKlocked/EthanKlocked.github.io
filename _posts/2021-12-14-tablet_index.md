---
layout: post
title: "바코드 스캐너 활용"
subtitle: "smart factory"
date: 2021-12-14 13:44:32 -0400
background: '/img/posts/smart-f-02.png'
tags: [javascript, workspace]
---
## 기능설명
* 태블릿용 생산 관리 페이지 구현
* 품목 바코드를 사용하여 생산품목 입고
* 단순 입고 및 출고 / 출하 처리
* 바코드는 시크릿코드, 날짜, 품목코드를 조합하여 생성한다.
* 태블릿 바코드 스캐너를 통한 바코드 인식

<br>

## 목록 화면
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/mobile_index.png" width="35%" height="35%"> 	
<div>* 태블릿 화면 메뉴구성.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/barcode_1.png" width="35%" height="35%"> 	
<div>* 품목 별 바코드 생성하여 개별 인쇄가 가능하다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/barcode_chk.png" width="35%" height="35%"> 	
<div>* 창고 내 바코드 정보를 확인하여 이동가능 재고를 파악한다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/barcode_none.png" width="35%" height="35%"> 	
<div>* 바코드 정보가 일치하지 않거나 재고가 없는 경우 알림 메시지를 띄워준다.</div>
</div>

<br>

#### 생산입고

``` javascript
/*
	##### 수정로그 #####
	2021.10.26 김현중 신규
*/
//*************************************** GLOBAL ******************************************//
//layout
var layout; 

//form
var move_form; 

//grid
var move_grid; 

//data
var now_item;
var barcode_scanning_value = '';
var ware_data; 
var ware_name = new Array;

//*************************************** EXECUTION ******************************************//
$(function(){ 
	//************ init *************//
	// create layout
	layout = create_layout();

	// create grid
//	ware_data = select_common('', [{'table':'stnd_warehouse', 'column':['stwa_uid','stwa_nm'], 'where':{and:[{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);
//	ware_data = ware_data.data[Object.keys(ware_data.data)[0]];
	ware_data = [{'stwa_uid':'1', 'stwa_nm':'2공장'}];
//	console.log(ware_data);
	for(var i=0; i<ware_data.length; i++){
		ware_name.push(ware_data[i].stwa_nm);
	}

	move_grid = create_move_grid();

	// create form
	move_form = create_move_form();

	// combine
	move_form.getItem('grid').attach(move_grid);
	layout.getCell('main').attach(move_form); 

	// barcode 
	barcodeScan();

	//************ control *************//

	// grid event
	move_grid.events.on("cellClick", function(row,column,e){
		if(column.id == 'stwa_uid' || column.id == 'stit_maxqty'){
			move_grid.editCell(row.id, column.id);
		}
	});
	move_grid.events.on("AfterEditEnd", function(value,row,column){
		if(column.id == 'stit_maxqty'){
			if(!Number.isInteger(value) || value === '' || value < 1){
				row.stit_maxqty = row.init_maxqty;
				d_message('양의 정수만 입력 가능합니다.','layout','expire dhx_message--error',2000,'top-left');
			}else if(value > row.stre_nowqty){
				d_message('이동 가능 수량을 초과하였습니다.','layout','expire dhx_message--error',2000,'top-left');
				row.stit_maxqty = row.init_maxqty;
			}
			barcode_scanning_value = '';
		}
	});

	// form event
	move_form.events.on("Click", function(name, events) {
		if(name == 'refresh'){
			d_confirm('품목을 초기화 하시겠습니까?',(ans) => {
				if(ans === true){
					all_refresh();
				}
			});
		}

		if(name == 'out'){
			var save_data = move_grid.data.serialize();
			if(save_data.length < 1){
				d_message('입고 품목이 존재하지 않습니다.','layout','expire dhx_message--error',2000,'top-left');
				return false;
			}
			var final_data = combine_data(save_data);
			if(final_data[0] == 'over'){
				d_alert(`${final_data[1]} 항목의 입고수량이 가능 재고량을 초과하였습니다.` )
				return false;
			}
			d_confirm("해당 품목을 입고하시겠습니까?", function(chk){
				if(chk == true){
					call_ajax('insert_move_item',{'data' : final_data},function(json){
						if(json.result == 'success'){
							//alert text
							var alert_text ='';
							for(var i=0; i < final_data.length; i++){
								alert_text += `<span>${final_data[i].stit_nm} [${final_data[i].stit_maxqty}개 -> ${final_data[i].stwa_nm}]</span><\/br>`;
							}
							alert_text += `</br> <span style = 'color:#0ab169'>최종입고 완료되었습니다.<\/span>`;
							dhx.alert({
								text: alert_text,
								buttonsAlignment: "center",
								buttons : ['확인']
							}).then(function(chk){
								if(chk){
									//refresh
									all_refresh();
								}
							});
						}else{
							d_alert('입고 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
						}
					});
				}
			});
		}
	});
});

//*************************************** CONFIG & LOGIC ******************************************//
//LAYOUT [Main]
function create_layout(){
	var layout = new dhx.Layout("layout", { //LAYOUT
		rows: [
			{
				id: "title",
				html: "<span>생산 입고</span>",
				css: "layout_title",
				height:'7.5%'
			},
			{
				id: "toolbar",
				height: "content"
			},
			{			
				id: "main",
			}
		]
	});
	return layout;
}

// FORM [work_completion_main]
function create_move_form(){
	var moveform_config = { 
		css: "custom_compform",
		rows: [
			{
				name: "serial_code",
				type: "input",
				label: "Serial Code :",
				disabled: true,
				labelPosition: "left",
				labelWidth: 80,
				readOnly: true,
				placeholder: "XXXXX-0000-000-X0",
			},
			{
				name: "stwa_out",
				type: "input",
				label: "불출창고 :",
				disabled: true,
				labelPosition: "left",
				labelWidth: 80,
				readOnly: true,
				value: "1공장",
			},
			{
				type: "container",
				name: "grid",
				height: 390
			},
			{
				align: "evenly",
				cols: [
					{
						name: "refresh",
						type: "button",
						text: "초기화",
						submit:true,
						size: "medium",
						view: "flat",
						color: "success",
					},
					{
						name: "out",
						type: "button",
						text: "입고완료",
						size: "medium",
						view: "flat",
						color: "primary",
					}
				]
			}
		]
	};

	const move_form = new dhx.Form("", moveform_config);
	return move_form;
}

//GRID [prod_plan]
function create_move_grid(){
	var move_grid = new dhx.Grid("", {
		columns: [
			{id: "stit_nm", width:100, sortable: false, header: [{ text: "품목", align:'center'}], align:'center', editable: false},
			{id: "stwa_uid", width:100, sortable: false, header: [{ text: "입고창고", align:'center'}], editorType: "select", options: ware_name, editable: true, footer: [{ text: "Total  :",align:'right'}], align:'center'},
			{id: "stre_nowqty", sortable: false, header: [{ text: "재고", align:'center'}], format: "#,#"},
			{id: "stit_maxqty", sortable: false, header: [{ text: "수량", align:'center'}], format: "#,#", editable: true, footer: [{ content: "sum" }]},
		],
		autoWidth: true,
	});
	return move_grid;
}

//****************************************** FUNCTION *********************************************//
function barcodeScan(){	
	$(window).off('keypress').keypress(function(e){
		if(e.which != '13'){
			barcode_scanning_value += e.key;
		}else{
			if(barcode_scanning_value){
				move_form.setValue({'serial_code': barcode_scanning_value});

				call_ajax('select_move_item',{'data' : {'barcode':barcode_scanning_value, 'stwa_uid':2}},function(json){
					if(json.result == 'success'){
						if(json.data.length > 0){
							now_item = json.data[0];
							now_item.stwa_uid = ware_data[0].stwa_nm;
							now_item.init_maxqty = now_item.stit_maxqty;
							var length_chk = move_grid.data.serialize().length;
							move_grid.data.add(now_item, 0);
							d_message('검색이 완료되었습니다.','layout','expire dhx_message--success',2000,'top-left');
						}else{
							d_message('바코드 정보가 존재하지 않습니다.','layout','expire dhx_message--error',2000,'top-left');
						}

					}else{
						d_alert('바코드 검색 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
					}

				}, true);

				barcode_scanning_value = '';
			}
		}
	});
}

//refresh
function all_refresh(){
	now_item = '';
	barcode_scanning_value = '';
	ware_data =''; 
	ware_name = [];

	//warehouse select_option refresh
	ware_data = select_common('', [{'table':'stnd_warehouse', 'column':['stwa_uid','stwa_nm'], 'where':{and:[{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);
	ware_data = ware_data.data[Object.keys(ware_data.data)[0]];
	for(var i=0; i<ware_data.length; i++){
		ware_name.push(ware_data[i].stwa_nm);
	}
	move_grid.config.columns[1].options = ware_name;

	//grid & barcode refresh
	move_grid.data.parse([]);
	move_form.setValue({'serial_code':''});
}

//combine_data
function combine_data(separated){
	var raw_data = separated;
	var combined_data = [];
	for(var i=0; i < raw_data.length; i++){
		var ware_uid = ware_data.filter(j => j.stwa_nm == raw_data[i].stwa_uid);//add stwa_uid
		raw_data[i].stwa_nm = raw_data[i].stwa_uid;
		raw_data[i].stwa_uid = ware_uid[0].stwa_uid;

		var dup_chk = 0;
		if(combined_data.length > 0){ //combine maxqty
			for(var k=0; k < combined_data.length; k++){
				if(raw_data[i].stit_uid == combined_data[k].stit_uid){
					combined_data[k].stit_maxqty = Number(combined_data[k].stit_maxqty) + Number(raw_data[i].stit_maxqty);
					if(Number(combined_data[k].stit_maxqty) > Number(combined_data[k].stre_nowqty)){
						return ['over',raw_data[i].stit_nm];
					}
					dup_chk = 1;
					break;
				}
			}
		}
		if(dup_chk == 0){
			combined_data.push(raw_data[i])
		}
	}
	return combined_data;
}

```

<br>

#### 입/출고/출하

``` javascript
/*
	##### 수정로그 #####
	2021.11.02 김현중 신규
*/
//*************************************** GLOBAL ******************************************//
//layout
var layout; 

//form
var move_form; 

//grid
var move_grid;

//data
var now_item;
var barcode_scanning_value = '';
var ware_data;
var rack_data;

//*************************************** EXECUTION ******************************************//
$(function(){ 
	//************ init *************//
	// create layout
	layout = create_layout();

	// create grid
	move_grid = create_move_grid();

	// create form
	ware_data = select_common('',[{'table' : 'stnd_warehouse','column' : ['stwa_uid AS value','stwa_nm AS content'],'where' : {and:[{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);
	ware_data = ware_data.data[Object.keys(ware_data.data)[0]];
	rack_data = select_common('',[{'table' : 'stnd_warehouse_rack','column' : ['stwara_uid AS value','stwara_nm AS content'],'where' : {and:[{column : 'stwa_uid', 'type' : '=', 'data' : ware_data[0].value},{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);	
	rack_data = rack_data.data[Object.keys(rack_data.data)[0]];
	rack_data.unshift({'value':'0', 'content':'랙 없음'});
	move_form = create_move_form();

	// combine
	move_form.getItem('grid').attach(move_grid);
	layout.getCell('main').attach(move_form); 

	// barcode 
	barcodeScan();
	//************ control *************//

	// grid event
	move_grid.events.on("cellClick", function(row,column,e){
		if(column.id == 'qty'){
			move_grid.editCell(row.id, column.id);
		}
	});
	move_grid.events.on("AfterEditEnd", function(value,row,column){
		if(column.id == 'qty'){
			if(!Number.isInteger(value) || value === '' || value < 1){
				row.qty = 1;
				d_message('양의 정수만 입력 가능합니다.','layout','expire dhx_message--error',2000,'top-left');
			}
			barcode_scanning_value = '';
		}
	});

	// form event
	move_form.getItem("stwa_uid").events.on("change", function(uid){ // selectBox change 
		select_async('',[{
							'table':'stnd_warehouse_rack',
							'column' : ['stwara_uid AS value','stwara_nm AS content'],
							'where':{and:[{column : 'stwa_uid', 'type' : '=', 'data' : uid},{column : 'use_chk', 'type' : '=', 'data' : 0}]},
						}]
		).then((result_data)=>{
			rack_data = result_data.data[Object.keys(result_data.data)[0]]
			rack_data.unshift({'value':'0', 'content':'랙 없음'});
			move_form.getItem("stwara_uid").setOptions(rack_data);			
		});
	});

	move_form.getItem("stwara_uid").events.on("change", function(uid){ 
	});

	move_form.events.on("Click", function(name, events) { // click
		if(name == 'refresh'){
			d_confirm('품목을 초기화 하시겠습니까?',(ans) => {
				if(ans === true){
					all_refresh();
				}
			});
		}

		if(name == 'in'){
			var save_data = move_grid.data.serialize();
			if(save_data.length < 1){
				d_message('입고 품목이 존재하지 않습니다.','layout','expire dhx_message--error',2000,'top-left');
				return false;
			}
			d_confirm("해당 품목을 입고하시겠습니까?", function(chk){
				if(chk == true){
					var final_data = new Object;
					final_data.stwa_uid = move_form.getItem('stwa_uid').getValue();
					final_data.stwara_uid = move_form.getItem('stwara_uid').getValue();
					final_data.save_data = save_data;
					
					var ware_nm = $(".dhx_select option:selected").eq(0).text();	
					var rack_nm = $(".dhx_select option:selected").eq(1).text();	
					
					call_ajax('insert_in_tablet',{'data' : final_data},function(json){
						if(json.result == 'success'){
							//alert text
							var alert_text ='';
							for(var i=0; i < save_data.length; i++){
								alert_text += `<span>${save_data[i].stit_nm} [${save_data[i].qty}개]</span><\/br>`;
							}
							alert_text += `</br> <span style = 'color:orange'>${ware_nm} \/ ${rack_nm}<\/span>`;
							alert_text += `</br> <span style = 'color:#0ab169'>최종입고 완료되었습니다.<\/span>`;
							dhx.alert({
								text: alert_text,
								buttonsAlignment: "center",
								buttons : ['확인']
							});
							all_refresh();//refresh
						}else{
							d_alert('입고 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
						}
					});
				}
			});
		}
	});
});

//*************************************** CONFIG & LOGIC ******************************************//
//LAYOUT [Main]
function create_layout(){
	var layout = new dhx.Layout("layout", { //LAYOUT
		rows: [
			{
				id: "title",
				html: "<span>입고 등록</span>",
				css: "layout_title",
				height:'7.5%'
			},
			{
				id: "toolbar",
				height: "content"
			},
			{			
				id: "main",
			}
		]
	});
	return layout;
}

// FORM [work_completion_main]
function create_move_form(){
	var moveform_config = { 
		css: "custom_compform",
		rows: [
			{
				name: "serial_code",
				type: "input",
				label: "Serial Code :",
				disabled: true,
				labelPosition: "left",
				labelWidth: 80,
				readOnly: true,
				placeholder: "XXXXX-0000-000-X0",
			},
			{
				name: "stwa_uid",
				type: "select",
				label: "창고 :",
				labelPosition: "left",
				labelWidth: 80,
				options: ware_data
			},
			{
				name: "stwara_uid",
				type: "select",
				label: "랙 :",
				labelPosition: "left",
				labelWidth: 80,
				options: rack_data,
			},
			{
				type: "container",
				name: "grid",
				height: 300,
			},
			{
				align: "evenly",
				cols: [
					{
						name: "refresh",
						type: "button",
						text: "초기화",
						submit:true,
						size: "medium",
						view: "flat",
						color: "success",
					},
					{
						name: "in",
						type: "button",
						text: "입고완료",
						size: "medium",
						view: "flat",
						color: "primary",
					}
				]
			}
		]
	};

	const move_form = new dhx.Form("", moveform_config);
	return move_form;
}

//GRID [prod_plan]
function create_move_grid(){
	var move_grid = new dhx.Grid("", {
		columns: [
			{id: "stit_nm", width:100, sortable: false, header: [{ text: "품목명", align:'center'}], align:'center', editable: false},
			{id: "stit_cd", width:100, sortable: false, header: [{ text: "품목코드", align:'center'}], align:'center', editable: false, footer: [{ text: "Total  :",align:'right'}]},
			{id: "qty", sortable: false, header: [{ text: "수량", align:'center'}], format: "#,#", editable: true, footer: [{ content: "sum",align:'right' }]},
		],
		autoWidth: true,
	});
	return move_grid;
}

//****************************************** FUNCTION *********************************************//
function barcodeScan(){	
	$(window).off('keypress').keypress(function(e){
		if(e.which != '13'){
			barcode_scanning_value += e.key;
		}else{
			if(barcode_scanning_value){
				move_form.setValue({'serial_code': barcode_scanning_value});

				//SELECT & PARSE
				select_async('',[{
									'table':'stnd_item',
									'where':{and:[{column : 'stit_barcode', 'type' : '=', 'data' : barcode_scanning_value},{column : 'use_chk', 'type' : '=', 'data' : 0}]},
								}]
				).then((result_data)=>{
					if(result_data.result == 'success'){
						if(result_data.data[Object.keys(result_data.data)[0]].length > 0){
							now_item = result_data.data[Object.keys(result_data.data)[0]][0];
							now_item.qty = 1;
							move_grid.data.add(now_item, 0);
						}else{
							d_message('바코드 정보가 존재하지 않습니다.','layout','expire dhx_message--error',2000,'top-left');
						}
					}else{
						d_alert('바코드 검색 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
					}
				});
				barcode_scanning_value = '';
			}
		}
	});
}

//refresh
function all_refresh(){
	now_item = '';
	barcode_scanning_value = '';
	ware_data ='';
	rack_data ='';

	//warehouse select_option refresh
	ware_data = select_common('',[{'table' : 'stnd_warehouse','column' : ['stwa_uid AS value','stwa_nm AS content'],'where' : {and:[{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);
	ware_data = ware_data.data[Object.keys(ware_data.data)[0]];
	move_form.getItem("stwa_uid").setOptions(ware_data);			
	rack_data = select_common('',[{'table' : 'stnd_warehouse_rack','column' : ['stwara_uid AS value','stwara_nm AS content'],'where' : {and:[{column : 'stwa_uid', 'type' : '=', 'data' : ware_data[0].value},{column : 'use_chk', 'type' : '=', 'data' : 0}]}}]);	
	rack_data = rack_data.data[Object.keys(rack_data.data)[0]];
	rack_data.unshift({'value':'0', 'content':'랙 없음'});
	move_form.getItem("stwara_uid").setOptions(rack_data);			

	//grid & barcode refresh
	move_grid.data.parse([]);
	move_form.setValue({'serial_code':''});
}

```



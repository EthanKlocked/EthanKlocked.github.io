---
layout: post
title: "작업관리 WEB"
subtitle: "smart factory"
date: 2021-10-25 08:35:32 -0400
background: '/img/posts/factory-2030.jpeg'
tags: [javascript, workspace]
---
## 기능설명
* 공정관리 웹버젼
* 현재 대기수량이 존재하는 공정이 리스트형식으로 출력된다.
* 대기수량이 0이되면 종료된 공정은 리스트에서 사라지며 다음 공정이 존재한다면 다음 공정이 리스트에 추가된다.
* 공정별 불량, 추가불출 등록이 가능하다.

<br>

## 구현 화면

<img src="/img/work/prod_work_li.png" width="100%" height="100%"> 	

<br>

## 코드

``` javascript
/*
    ##### 수정로그 #####
    2021.07.29 김현중 신규
*/
//*************************************** EXECUTION ******************************************//
$(async () => { 
    // default window size , position
    var window_height = $(window).height()-300;
    var window_center = (window.screen.width / 3);

    // create layout & select data & window
    var [layout, work_obj, general_window, warebox, rackbox, badtype_combo] = [create_layout(), select_work(), create_window(), select_warebox(), select_rackbox(), select_bad_type()]; // all init data

    // select initial values
    var init_box = [work_obj, warebox, rackbox, badtype_combo];
    var init_result = select_common('', init_box);

    var work_data = init_result.data[Object.keys(init_result.data)[0]]; //work_data for LIST
    var ware_data = init_result.data[Object.keys(init_result.data)[1]]; //warehouse_data for COMBOBOX
    var rack_data = init_result.data[Object.keys(init_result.data)[2]]; //rack_data for COMBOBOX
    var badtype_data = init_result.data[Object.keys(init_result.data)[3]]; //badtype_data for COMBOBOX

    // create work_grid
    var work_grid = create_work_grid(work_data); // create grid
    var main_page = create_pagination(work_grid, 16); // create pagination

    // parse grid to layout 'work_list'
    layout.getCell('work_list').attach(work_grid); 
    layout.getCell('pagination').attach(main_page);

    // create log grid
    var bad_log_grid = create_badlog_grid(); // create bad log
    var out_log_grid = create_outlog_grid(); // create out log

    //<<<<<<<<<<<< CONTROL READY >>>>>>>>>>>>>>
    var [out_window, out_bom_window, outcome_layout] = [create_window(), create_window('closable_false'), create_outcome_layout()]; // outcome initial
    out_window.header.data._pull.title.value = '추가 불출 수량 등록';
    out_bom_window.header.data._pull.title.value = 'BOM'; 

    var bad_window = create_window(); // bad initial
    bad_window.header.data._pull.title.value = '불량 등록'; 

    //<<<<<<<<<<<< VIEW READY >>>>>>>>>>>>>>
    var view_window = create_window(); // window [view total]
    view_window.header.data._pull.title.value = '작업 상세보기';
    view_window.setSize(600, window_height+120); // view size
    view_window.setPosition(window_center+100); // view position

    var total_tab = create_tab(); // tab * 3 [view total]

    //<<<<<<<<<<<< CONTROL & VIEW CLICK >>>>>>>>>>>>>>
    work_grid.events.on("cellClick", function(row,column,e){ // work_grid [button click event]
        //<<<<<<<<<<<< CONTROL CLICK >>>>>>>>>>>>>>
        // buttons onclick event [status, bad, out, cancel]
        var row_switch = column.id; // button name
        var row_status = row.prwo_status; // button status
        switch(row_switch) {
            case 'prwo_status': // 1. work button

                if(row_status == '공정시작'){ // (1) start -> complete
                    var status_update_box = [];
                    var status_result = update_status(row.prwo_uid, '공정종료', '생산중');
                    status_update_box.push(status_result);
                    if(row.prwo_idx == 0){
                        status_update_box.push(update_plan_start(row.prpl_uid));
                    }
                    var update_output = update_common(status_update_box);

                    if(update_output.result == 'success'){
                        row.prwo_status_text = '생산중';
                        row.prwo_status = '공정종료';
                        row.prwo_starttime = status_result.column.prwo_starttime;
                    }else{
                        d_alert('공정 진행과정에서 문제가 발생하였습니다.');
                    }
                }else if(row_status == '공정종료'){ // (2) complete -> restart
                    ///////////////////// FORM [completion] START ///////////////////////////
                    // work index chk 
                    data_obj = select_indexchk(row.prpl_uid);
                    var index_chk = select_common('', [data_obj]);

                    // make completion form 
                    var compform;
                    if(Number(row.prwo_idx)+1 == Number(index_chk.data.prod_work[0].cnt)){ // case the last idx
                        compform = create_compform(row, ware_data);
                        var ware_combo = compform.getItem("stwa_uid").getWidget(); //get combobox[In-ware]
                        ware_combo.setValue(ware_combo.data.getId(0));
                        //event[change combobox(In-rack) after changing value of combobox(In-ware)]
                        compform.getItem("stwa_uid").events.on("Change", function(value) {//combobox[In-ware] event
                            var rack_combo = compform.getItem("stwara_uid").getWidget(); //get combobox[In-rack]
                            if(value){
                                var rack_box = [];
                                for (const val of rack_data) { // select rack_data
                                    if(Number(value) == Number(val.puid)){
                                        rack_box.push({'id':val.id, 'value':val.value});
                                    }
                                }
                                if(rack_box.length > 0){
                                    rack_combo.data.parse(rack_box); //parse In-rack data
                                }
                            }else{
                                var empty_box = [];
                                rack_combo.data.parse(empty_box); //parse empty data
                            }
                            rack_combo.clear(); //clear showing value[In-rack] everytime event fires
                        });
                        general_window.setSize(600, window_height+150); // over size 
                        general_window.setPosition(window_center+100);
                    }else{
                        compform = create_compform(row);
                        general_window.setSize(600, window_height+50); // general size
                        general_window.setPosition(window_center+100);
                    }
                    
                    // event[change errorMessage before validation]
                    compform.events.on("beforeValidate", function(name, value){ // change messages after validating stre_nowqty form,
                        if(name == 'qty'){
                            switch(true){
                                case (value == ''):
                                    compform.getItem(name).config.errorMessage = '빈값을 입력할 수 없습니다.';
                                    break;
                                case (value <= 0):
                                    compform.getItem(name).config.errorMessage = '생산수량은 0 또는 음수를 입력할 수 없습니다.';
                                    break;
                                case (value > Number(row.prwo_waitqty)):
                                    compform.getItem(name).config.errorMessage = '대기 수량을 초과하여 입력할 수 없습니다.';
                                    break;
                                case (!Number.isInteger(Number(value))):
                                    compform.getItem(name).config.errorMessage = '올바른 형식이 아닙니다.';
                                    break;
                            }
                        }
                    }); 
                    
                    //event[save]
                    compform.events.on("Click", function(name, events) {
                        if(name == 'button' && compform.validate() == true){ //check button name & validation
                            compform.send("./?json=insert_dhtmlx", "POST")
                            .then((output) => {
                                var output = JSON.parse(output);
                                if(output.result == 'success'){
                                    compform.clear();
                                    general_window.hide();
                                    d_alert('작업 결과 처리가 완료 되었습니다.');
                                    var afterwork_obj = select_work(); // refresh work list
                                    var afterwork_box = [afterwork_obj];
                                    var afterwork_data = select_common('', afterwork_box);
                                    work_grid.data.parse(afterwork_data.data[Object.keys(afterwork_data.data)[0]]); 
                                }else{
                                    d_alert('작업 처리 과정에서 문제가 발생하였습니다.');
                                }
                            })
                            .catch((err) => err); // error[etc]
                        }
                    });
                    ///////////////////// FORM [completion] END ///////////////////////////

                    //window 
                    general_window.header.data._pull.title.value = '공정종료';
                    general_window.attach(compform); //parse form to window
                    general_window.show(); //showing window                 
                }/*else{ // (3) restart -> complete ********************* 2021-08-19 수정 //공정재개 파트 삭제 -> 계속 공정 종료상태로 유지********************

                    let status_result = await update_status(row.prwo_uid, '공정종료');
                    let status_box = [status_result];
                    var update_output = update_common(status_box);
                    if(update_output.result == 'success'){
                        row.prwo_status = '공정종료';
                    }else{
                        d_alert('공정 진행과정에서 문제가 발생하였습니다.');
                    }
                }
                */
                break;
            case 'button_bad': // 2. badtype button
                var bad_form = create_bad_form(row, badtype_data); // create contents [form]
                // event[change errorMessage before validation]
                bad_form.events.on("beforeValidate", function(name, value){ // change messages after validating prba_qty form,
                    if(name == 'prba_qty'){
                        switch(true){
                            case (value == ''):
                                bad_form.getItem(name).config.errorMessage = '빈값을 입력할 수 없습니다.';
                                break;
                            case (value <= 0):
                                bad_form.getItem(name).config.errorMessage = '불량수량은 0 또는 음수를 입력할 수 없습니다.';
                                break;
                            case (value > Number(row.prwo_waitqty)):
                                bad_form.getItem(name).config.errorMessage = '대기 수량을 초과하여 입력할 수 없습니다.';
                                break;
                            case (!Number.isInteger(Number(value))):
                                bad_form.getItem(name).config.errorMessage = '올바른 형식이 아닙니다.';
                                break;
                        }
                    }
                }); 

                //event[save]
                bad_form.events.on("Click", function(name, events) {
                    if(name == 'button' && bad_form.validate() == true){ //check button name & validation
                        bad_form.send("./?json=insert_dhtmlx", "POST")
                        .then((output) => {
                            output = JSON.parse(output);
                            if(output.result == 'success'){
                                d_alert('불량 등록이 완료되었습니다.');
                                    bad_form.clear();
                                    bad_window.hide();
                                    var afterbad_obj = select_work(); // refresh work list
                                    var afterbad_box = [afterbad_obj];
                                    var afterbad_data = select_common('', afterbad_box);
                                    work_grid.data.parse(afterbad_data.data[Object.keys(afterbad_data.data)[0]]); 
                            }else{
                                d_alert('불량 등록 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
                            }
                        })
                        .catch((err) => err); // error[etc]
                    }
                });

                bad_window.attach(bad_form); //parse form to window
                bad_window.show(); //showing window     
                break;
            case 'button_out': // 3. outcome button
                var bom_obj = select_bom_sub(row.stbo_uid); // bom_select [join item & stok info]
                var bom_select = select_common('', [bom_obj]);
                var bom_data = bom_select.data[Object.keys(bom_select.data)[0]];
                var [bom_grid, outcome_form, empty_grid, button_form] = [create_bom_grid(bom_data), create_outcome_form(row), create_empty_grid(), create_button_form()]; // create contents [grid (out_window), form(bom_window)]

                //********* bom_grid control *********//                
                    //move item bom_grid -> empty_grid
                bom_grid.events.on("CellDblClick", function(row,column,e){
                    var duplicate_chk = 0;
                    empty_grid.data.find((item) => {
                        if(item.stit_uid == row.stit_uid){ // item duplication chk
                            d_alert('이미 등록된 품목입니다.');
                            duplicate_chk = 1;
                        }
                    });
                    if(duplicate_chk == 0){
                        empty_grid.data.add(row,0);
                        bom_grid.data.remove(row.id);
                        row.qty = 1; // default 1
                        empty_grid.editCell(empty_grid.data.getId(0), empty_grid.config.columns[5].id); // focus on input area to edit

                        empty_grid.events.on("AfterEditEnd", function(value,row,column){ // validation [integer]
                            if(isNaN(value) || value === '' || value <= 0 || value > row.stre_nowqty){
                                row.qty = 1;
                            }
                        });

                        empty_grid.events.on("CellClick", function(row,column,e){ // auto focus on input area
                            empty_grid.editCell(row.id, 'qty');
                        });
                    }
                });

                //********* empty_grid control *******//                
                    //move item empty_grid -> bom_grid
                empty_grid.events.on("CellClick", function(row,column,e){

                    if(column.id === 'option'){
                        var origin_data = bom_grid.data.serialize();
                        origin_data.push(row);
                        bom_grid.data.parse(origin_data);

                        empty_grid.data.remove(row.id);
                    }
                });

                out_window.setSize(700, window_height+140); // main_window (outcome)
                out_window.setPosition(window_center-200);
                outcome_layout.getCell('outcome_form').attach(outcome_form);
                outcome_layout.getCell('outcome_grid').attach(empty_grid);
                outcome_layout.getCell('outcome_button').attach(button_form);

                out_window.attach(outcome_layout); //parse form to window
                out_window.show(); //showing window     

                out_bom_window.setSize(600, window_height-50); // sub_window (outcome)
                out_bom_window.setPosition(window_center+505);
                out_bom_window.attach(bom_grid); //parse form to window
                out_bom_window.show(); //showing window     

                //********* main_window control *********//
                    //event[save]
                button_form.events.on("Click", function(name, events) {
                    if(name == 'button'){ //check button name 
                        var state = empty_grid.data.serialize(); // overstock data [grid]
                        var work_data = outcome_form.getValue();
                        var insert_overstock = insert_work_overstock(state, work_data); // insert overstock

                        //after insert overstock
                        var bom_reobj = select_bom_sub(row.stbo_uid); // bom_select [join item & stok info]
                        var bom_reselect = select_common('', [bom_reobj]);
                        var bom_redata = bom_reselect.data[Object.keys(bom_reselect.data)[0]];

                        if(insert_overstock !== 'fail'){
                            d_alert('재공재고 추가 불출이 완료되었습니다.');
                            bom_grid.data.parse(bom_redata);
                            empty_grid.data.parse([]);
                        }else{
                            d_alert('추가 불출 과정에서 문제가 발생하였습니다. 관리자에게 문의 해 주세요.');
                            bom_grid.data.parse(bom_redata);
                            empty_grid.data.parse([]);
                        }
                    }
                });

                //********* double window control*********//
                out_window.events.on("beforehide", function () { // closable together
                    out_bom_window.hide();
                });
                break;

        //<<<<<<<<<<<< VIEW CLICK >>>>>>>>>>>>>>
            case 'prpl_num': // 4. view link
            // item_tab
                var item_form = create_compform(row,'','view');
                item_form.events.on("Click", function(name, events) {
                    if(name == 'button' && item_form .validate() == true){ //check button name & validation
                        item_form.send("./?json=update_work_etc", "POST")
                        .then((output) => {
                            var output = JSON.parse(output);
                            if(output.result == 'success'){
                                item_form.clear();
                                view_window.hide();
                                d_alert('수정이 완료 되었습니다.');
                                var afterwork_obj = select_work(); // refresh work list
                                var afterwork_box = [afterwork_obj];
                                var afterwork_data = select_common('', afterwork_box);
                                work_grid.data.parse(afterwork_data.data[Object.keys(afterwork_data.data)[0]]); 
                            }else{
                                d_alert('수정 과정에서 문제가 발생하였습니다.');
                            }
                        })
                        .catch((err) => err); // error[etc]
                    }
                });
                total_tab.getCell("item_tab").attach(item_form); // parse

                total_tab.events.on("Change", function(to, from) { //reset selectFilter
                    bad_log_grid.resetFilter();
                    out_log_grid.resetFilter();
                });

            // bad_tab & out_tab
                var bad_detail = select_work_bad_detail(row.prwo_uid);
                var out_detail = select_out_stock(row.prwo_uid);

                select_async('', [bad_detail, out_detail]).then((result_data) => { // select log data
                    var bad_data = result_data.data[Object.keys(result_data.data)[0]];
                    var out_data = result_data.data[Object.keys(result_data.data)[1]];
                    bad_log_grid.data.parse(bad_data);
                    out_log_grid.data.parse(out_data);
                    total_tab.getCell("bad_tab").attach(bad_log_grid); // parse
                    total_tab.getCell("out_tab").attach(out_log_grid); // parse
                });
                /*
                var bad_detail = select_work_bad_detail(row.prwo_uid);
                select_async('', [bad_detail]).then((badlog_data) => { // select bad log data
                    badlog_data = badlog_data.data[Object.keys(badlog_data.data)[0]];

                    var total_bad = 0;
                    for(var i=0; i < badlog_data.length; i++){ // badlog total qty
                        total_bad += Number(badlog_data[i].prbalo_qty);
                    }

                    var simple_view = create_simple_view(['폐기수량', total_bad]); // create view
                    var badlog_grid = create_badlog_grid(badlog_data); // creage grid
                    var view_page = create_pagination(badlog_grid, 16); // create pagination

                    view_layout.getCell('view_simple').attach(simple_view);  
                    view_layout.getCell('view_grid').attach(badlog_grid);  
                    view_layout.getCell('view_pagination').attach(view_page);  
                    
                    total_tab.getCell("bad_tab").attach(view_layout); // parse
                });
                */

                total_tab.setActive("item_tab"); // default tab
                view_window.attach(total_tab);
                view_window.show(); //showing window            
                break;
        }
    });
});

//*************************************** CONFIG & LOGIC ******************************************//

//LAYOUT [Main]
function create_layout(){
    var layout = new dhx.Layout("layout", { //LAYOUT
        cols: [
            {
                type: 'none',
                width: "98.8%",
                header: '작업관리 현황',
                rows: [
                    {
                        id: 'work_list',
                        height:"90%",
                    },
                    {
                        id: 'pagination',
                        height:"10%",
                    },
                ]
            }   
        ]
    });
    return layout;
}

//LAYOUT [outcome]
function create_outcome_layout(){
    var outcome_layout = new dhx.Layout("", { //LAYOUT
        cols: [
            {
                type: "none",
                rows: [
                    {
                        id: "outcome_form",
                    },
                    {
                        id: "outcome_grid",
                    },
                    {
                        id: "outcome_button",
                    },
                ]
            },
        ]
    });
    return outcome_layout;
}

//WINDOW [General for Form]
function create_window(closable_false){
    var window_height = $(window).height() - 300;
    var window_config = {
        left: 800,
        top: 85,
        width: '500',
        height: window_height,
        title: "기본",
        movable: false,
        closable: true,
    };
    if(closable_false){
        window_config.closable = false;
    }
    var general_window = new dhx.Window(window_config);
    return general_window;
}

//PAGINATION [General Page]
function create_pagination(obj, size){
    var pagination = new dhx.Pagination("", {
        css: "dhx_widget--bordered dhx_widget--no-border_top",
        data: obj.data,
        pageSize: size
    });
    return pagination;
}

//TAB BAR [VIEW]
function create_tab(){
    var total_tab = new dhx.Tabbar("", {
        css: "dhx_widget--bordered",
        mode: "top",
        views: [
            { tab: "품목", id: "item_tab" },
            { tab: "불량", id: "bad_tab" },
            { tab: "불출", id: "out_tab" },
        ]
    });
    return total_tab;
}

//GRID [work]
function create_work_grid(loadData){
    var work_grid = new dhx.Grid("", {
        columns: [
            {
                id: "prwo_status_text", 
                header: [{ text: "상태" },{ content: "selectFilter"}],
                htmlEnable: true, 
                align: "center",
                width:100,
                template: function(text){
                    var text_color;
                    if(text === '생산중'){
                        text_color = '#f14668';
                    }else if(text === '대기'){
                        text_color = '#309c6c';
                    }
                    return `<span style='font-weight:bold; color:${text_color}'>${text}</span>`;
                }
            },
            {
                id: "prpl_num", 
                tooltip: false,
                header: [{ text: "생산 계획번호" },{ content: "inputFilter"}],
                htmlEnable: true, 
                align: "center",
                width:100,
                template: (text) => `<a href="#">${text}</a>`
            },
            { id: "stit_nm", header: [{ text: "품목명"}, {content: "inputFilter"}]},
            { id: "stli_nm", header: [{ text: "공정 라인" }, {content: "selectFilter"}]},
            { id: "stli_uid", header: [{ text: "공정 라인 고유번호"}], hidden : true},
            { id: "stpr_nm", header: [{ text: "공정"}, {content: "selectFilter"}]},
            { id: "stpr_uid", header: [{ text: "공정 고유번호"}], hidden : true},
            { id: "stit_uid", header: [{ text: "품목 고유번호"}], hidden : true},
            { id: "prwo_uid", header: [{ text: "공정 고유번호"}], hidden : true},
            { id: "prwo_waitqty", header: [{ text: "잔여 수량"}]},
            { id: "prwo_compqty", header: [{ text: "작업 수량"}]},
            {
                id: "prwo_status", sortable: false, header: [{ text: "공정" }],
                tooltip: false,
                htmlEnable: true, 
                align: "center",
                width:100,
                template: (text) => `<button class="btn save_btn" style="padding: 0px 10px;">${text}</button>`
            },
            {
                id: "button_bad", sortable: false, header: [{ text: "불량" }],
                htmlEnable: true, 
                align: "center",
                width:100,
                template: () => '<button class="btn cls_btn" style="padding: 0px 10px;">등 록</button>'
            },
            {
                id: "button_out", sortable: false, header: [{ text: "불출" }],
                htmlEnable: true, 
                align: "center",
                width:100,
                template: () => '<button class="btn file_btn" style="padding: 0px 10px;">등 록</button>'
            },
        ],
        rowHeight: 30,
        headerRowHeight: 35,
        selection: 'row',
        editable: false,
        autoWidth: true, 
        data: loadData,
    });
    return work_grid;
}

//GRID [BOM]
function create_bom_grid(loadData){
    var bom_grid = new dhx.Grid("", {
        columns: [
            { id: "stit_nm", header: [{ text: "품목명" }, { content: "inputFilter"}]},
            { id: "stit_cd", header: [{ text: "품목코드" }, { content: "inputFilter"}]},
            { id: "stwa_nm", header: [{ text: "창고명" }, { content: "selectFilter"}]},
            { id: "stwara_nm", 
              header: [{ text: "랙명" }],
              template: function (value) {
                    var rackName = value;
                    if(value == null){
                        rackName = '사용안함';
                    }
                    return rackName;
                }
            },
            { id: "stre_nowqty", header: [{ text: "재고량" }],type: "number", format: "#,#"},
        ],
        rowHeight: 24,
        headerRowHeight: 35,
        autoWidth: true, 
        data: loadData,
    });
    return bom_grid;
}

//GRID [BAD LOG]
function create_badlog_grid(loadData){
    var badlog_grid = new dhx.Grid("", {
        columns: [
            { id: "stbaty_nm", header: [{ text: "불량유형" }, {content: "selectFilter"}]},
            { id: "prbalo_type", header: [{ text: "상태" }]},
            { 
                id: "prbalo_regdate", 
                header: [{ text: "등록 일시"}],
                footer: [
                    { text: '<div class="custom_footer">합계</div>', align: 'right' }
                ],
                template: function(text){
                    return `${text.substr(0,4)}-${text.substr(4,2)}-${text.substr(6,2)} ${text.substr(8,2)}:${text.substr(10,2)}:${text.substr(12,2)}`;
                }
            },
            { id: "prbalo_qty", header: [{ text: "수량" }], footer: [{ content: "sum" }], type: "number", format: "#,#"},
        ],
        rowHeight: 25,
        headerRowHeight: 35,
        footerRowHeight: 24,
        autoWidth: true, 
        data: loadData,
    });
    return badlog_grid;
}

//GRID [OUT LOG]
function create_outlog_grid(loadData){
    var outlog_grid = new dhx.Grid("", {
        columns: [
            { id: "stit_nm", header: [{ text: "자재명" }, {content: "selectFilter"}]},
            { 
                id: "prwost_regdate", 
                header: [{ text: "불출 일시"}],
                footer: [
                    { text: '<div class="custom_footer">합계</div>', align: 'right' }
                ],
                template: function(text){
                    return `${text.substr(0,4)}-${text.substr(4,2)}-${text.substr(6,2)} ${text.substr(8,2)}:${text.substr(10,2)}:${text.substr(12,2)}`;
                }
            },
            { id: "prwost_qty", header: [{ text: "수량" }], footer: [{ content: "sum" }], type: "number", format: "#,#"},
        ],
        rowHeight: 25,
        headerRowHeight: 35,
        footerRowHeight: 24,
        autoWidth: true, 
        data: loadData,
    });
    return outlog_grid;
}

//GRID [EMPTY]
function create_empty_grid(){
    var empty_grid_config = {
        columns: [
            { id: "stit_nm", header: [{ text: "품목명" }]},
            { id: "stit_cd", header: [{ text: "품목코드" }]},
            { id: "stwa_nm", header: [{ text: "창고명" }]},
            { id: "stwara_nm", 
              header: [{ text: "랙명" }],
              template: function (value) {
                    var rackName = value;
                    if(value == null){
                        rackName = '사용안함';
                    }
                    return rackName;
                }
            },
            { id: "stre_nowqty", header: [{ text: "재고량" }],type: "number", format: "#,#"},
            { id: "qty", header: [{ text: "수량"}],type: "number", format: "#,#", editable: true},
            {
                id: "option", header: [],
                htmlEnable: true, align: "center",
                width:50,
                template: () => "<div class='action-buttons'><a href='#' class='remove-button-member'><i style='padding:5px' class='dxi dxi-minus'> </i></a></div>"
            },
        ],
        rowHeight: 24,
        headerRowHeight: 35,
        autoWidth: true, 
        data: '',
    };
    var empty_grid = new dhx.Grid("", empty_grid_config);
    return empty_grid;
}

// FORM [work_completion]
function create_compform(row, config, view){
    var comp_form_config = { 
        css: "dhx_widget--bordered",
        padding: 40,
        rows: [
            {
                name: "login_uid",
                type: "input",
                required: true,
                hidden: true,
                value: login_uid,
            },
            {
                name: "func_nm",
                type: "input",
                required: true,
                hidden: true,
                value: "update_work_stock",
            },
            {
                name: "prpl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.prpl_uid,
            },
            {
                name: "prwo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.prwo_uid,
            },
            {
                name: "prwo_idx",
                type: "input",
                required: true,
                hidden: true,
                value: row.prwo_idx,
            },
            {
                name: "stitcl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stitcl_uid,
            },
            {
                name: "stitgr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stitgr_uid,
            },
            {
                name: "stit_lot_chk",
                type: "input",
                hidden: true,
                value: row.stit_lot_chk,
            },
            {
                name: "stit_sn_chk",
                type: "input",
                hidden: true,
                value: row.stit_sn_chk,
            },
            {
                name: "stit_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stit_uid,
            },
            {
                name: "stit_nm",
                type: "input",
                required: true,
                label: "품목",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stit_nm,
            },
            {
                name: "stli_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stli_uid,
            },
            {
                name: "stli_nm",
                type: "input",
                required: true,
                label: "공정라인",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stli_nm,
            },
            {
                name: "stpr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stpr_uid,
            },
            {
                name: "stpr_nm",
                type: "input",
                required: true,
                label: "공정",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stpr_nm
            },
            {
                name: "stbo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stbo_uid
            },
            {
                name: "stbo_nm",
                type: "input",
                required: true,
                label: "BOM",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stbo_nm
            },
            {
                name: "prpl_qty",
                type: "input",
                required: true,
                label: "생산 예정수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prpl_qty
            },
            {
                name: "prwo_waitqty",
                type: "input",
                required: true,
                label: "공정 대기수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prwo_waitqty
            },
            {
                name: "prwo_compqty",
                type: "input",
                required: true,
                label: "공정 완료수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prwo_compqty
            },
            {
                name: "prpl_compqty",
                type: "input",
                required: true,
                label: "생산 완료수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prpl_compqty
            },
            {
                type: "input",
                name: "qty",
                inputType: "number",
                required: true,
                label: "생산 수량",
                labelPosition: "left",
                labelWidth: 100,
                errorMessage: "",
                validation: function(value) {
                    return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(row.prwo_waitqty) && Number(value) > 0;
                },
            },
            {
                align: "end",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "저장",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    if(config){ // case the last idx (add warehouse, rack info)
        var ware_config = {
            name: "stwa_uid",
            type: "combo",
            required: true,
            label: "창고",
            placeholder: "창고를 선택 해 주세요.",
            labelPosition: "left",
            labelWidth: 100,
            data: config,
        };
        var rack_config = {
            name: "stwara_uid",
            type: "combo",
            label: "랙",
            placeholder: "미선택",
            labelPosition: "left",
            labelWidth: 100,
            hidden : true,
            data:''
        };
        comp_form_config.rows.splice(15, 0, ware_config, rack_config);
    }

    if(view){ // case item_view
        comp_form_config.rows[21].type = 'textarea';
        comp_form_config.rows[21].name = 'prwo_etc';
        comp_form_config.rows[21].inputType = '';
        comp_form_config.rows[21].label = '비고';
        comp_form_config.rows[21].value = row.prwo_etc;
        comp_form_config.rows[21].validation = '';
        comp_form_config.rows[22].cols[0].text = '수정';
    }
    const comp_form = new dhx.Form("", comp_form_config);
    return comp_form;
}

// FROM [outcome_main]
function create_outcome_form(row){
    var outcome_form_config = { 
        css: "dhx_widget--bordered",
        padding: 40,
        rows: [
            {
                name: "stit_uid",
                type: "input",
                hidden: true,
                value: row.stit_uid,
            },
            {
                name: "prwo_uid",
                type: "input",
                hidden: true,
                value: row.prwo_uid,
            },
            {
                name: "prpl_uid",
                type: "input",
                hidden: true,
                value: row.prpl_uid,
            },
            {
                label: "품목",
                name: "stit_nm",
                type: "input",
                value: row.stit_nm,
                labelWidth: 70,
                labelPosition: "left",
                disabled: true,
            },
            {
                label: "공정 라인",
                name: "stli_nm",
                type: "input",
                value: row.stli_nm,
                labelWidth: 70,
                labelPosition: "left",
                disabled: true,
            },
            {
                label: "공정",
                name: "stpr_nm",
                type: "input",
                value: row.stpr_nm,
                labelWidth: 70,
                labelPosition: "left",
                disabled: true,
            },
            {
                label: "BOM",
                name: "stbo_nm",
                type: "input",
                value: row.stbo_nm,
                labelWidth: 70,
                labelPosition: "left",
                disabled: true,
            },
        ]
    };
    const outcome_form = new dhx.Form("", outcome_form_config);
    return outcome_form;
}

// FORM [outcome_button]
function create_button_form(){
    var buttonform_config = { 
        css: "dhx_widget--bordered",
        rows: [
            {
                align: "end",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "저장",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    const button_form = new dhx.Form("", buttonform_config);
    return button_form;
}

// FORM [bad_main]
function create_bad_form(row, badtype){
    var bad_form_config = { 
        css: "dhx_widget--bordered",
        padding: 40,
        rows: [
            {
                name: "login_uid",
                type: "input",
                required: true,
                hidden: true,
                value: login_uid,
            },
            {
                name: "func_nm",
                type: "input",
                required: true,
                hidden: true,
                value: "insert_work_bad",
            },
            {
                name: "prwo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.prwo_uid,
            },
            {
                name: "prpl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.prpl_uid,
            },
            {
                name: "stit_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stit_uid,
            },
            {
                label: "품목",
                name: "stit_nm",
                type: "input",
                value: row.stit_nm,
                labelWidth: 100,
                labelPosition: "left",
                disabled: true,
            },
            {
                name: "stli_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stli_uid,
            },
            {
                label: "공정 라인",
                name: "stli_nm",
                type: "input",
                value: row.stli_nm,
                labelWidth: 100,
                labelPosition: "left",
                disabled: true,
            },
            {
                name: "stpr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stpr_uid,
            },
            {
                label: "공정",
                name: "stpr_nm",
                type: "input",
                value: row.stpr_nm,
                labelWidth: 100,
                labelPosition: "left",
                disabled: true,
            },
            {
                name: "stbo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.stbo_uid,
            },
            {
                label: "BOM",
                name: "stbo_nm",
                type: "input",
                value: row.stbo_nm,
                labelWidth: 100,
                labelPosition: "left",
                disabled: true,
            },
            {
                name: "prpl_qty",
                type: "input",
                label: "생산 예정수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prpl_qty
            },
            {
                name: "prpl_compqty",
                type: "input",
                required: true,
                hidden: true,
                value: row.prpl_compqty,
            },
            {
                name: "prwo_waitqty",
                type: "input",
                label: "공정 대기수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prwo_waitqty
            },
            {
                type: "input",
                name: "prba_qty",
                inputType: "number",
                required: true,
                label: "불량 수량",
                labelPosition: "left",
                labelWidth: 100,
                errorMessage: "",
                validation: function(value) {
                    return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(row.prwo_waitqty) && Number(value) > 0;
                },
            },
            {
                name: "stbaty_uid",
                type: "combo",
                required: true,
                label: "불량 유형",
                placeholder: "불량 유형을 선택 해 주세요.",
                labelPosition: "left",
                labelWidth: 100,
                data: badtype,
            },
            {
                align: "end",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "저장",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    const bad_form = new dhx.Form("", bad_form_config);
    return bad_form;
}

//*************************************** FUNCTION [QUERY] ******************************************//

//work [select]
function select_work(){
    var data_info = new Object();
    var table = 'prod_work';
    var join_table = 'prod_plan';
    var join_opt = {[table] :'prpl_uid', [join_table]:'prpl_uid'};

    var join_table1 = 'stnd_item';
    var join_opt1 = {[table]:'stit_uid', [join_table1]:'stit_uid'};

    var join_table2 = 'stnd_line';
    var join_opt2 = {[table]:'stli_uid', [join_table2]:'stli_uid'};

    var join_table3 = 'stnd_process';
    var join_opt3 = {[table]:'stpr_uid', [join_table3]:'stpr_uid'};

    var join_table4 = 'stnd_bom';
    var join_opt4 = {[join_table]:'stbo_uid', [join_table4]:'stbo_uid'};

    var pk = 'stacit_uid';
    data_info.table = [table,join_table,join_table1,join_table2,join_table3,join_table4];
    data_info.join = [join_opt, join_opt1, join_opt2, join_opt3, join_opt4];
    data_info.column = '*';
    data_info.order = {'prwo_uid':'desc'};
    data_info.where = {and:[{column : 'prod_work.prwo_waitqty', 'type' : '>', 'data' : 0}]};
    return data_info;
}

//work status [update]
function update_status(uid, value, value_text){
    var datetime = new Date();
    var updatetime = datetime.yyyymmddhhmmss();
    var data_info = new Object();
    data_info.table = 'prod_work';
    data_info.column = {
        'prwo_status':value,
        'prwo_status_text':value_text,
        'prwo_starttime':updatetime + '00',
    };
    data_info.pk = 'prwo_uid';
    data_info.pk_value = [uid];
    return data_info;
}

//plan status [update]
function update_plan_start(uid){
    var datetime = new Date();
    var updatetime = datetime.yyyymmddhhmmss();
    var data_info = new Object();
    data_info.table = 'prod_plan';
    data_info.column = {
        'prpl_real_start':'진행중',
        'prpl_real_time':updatetime + '00',
    };
    data_info.pk = 'prpl_uid';
    data_info.pk_value = [uid];
    return data_info;
}

//work index chk [select] 
function select_indexchk(uid){
    if(!uid){
        d_alert('해당 작업순서 정보를 불러오지 못했습니다. 관리자에게 문의 해 주세요.');
    }
    var data_info = new Object();
    data_info.table = 'prod_work';
    data_info.column = ['COUNT(prwo_uid) AS cnt'];
    data_info.where = {and:[{column : 'prpl_uid', 'type' : '=', 'data' : uid}]};
    return data_info;
}

//every warehouse for selectbox [select]
function select_warebox(){
    var type = '';
    var data_info = new Object();
    data_info.table = 'stnd_warehouse';
    data_info.column = ['stwa_uid AS id','stwa_nm AS value'];
    data_info.order = {'stwa_uid':'asc'};
    return data_info;
}

//selective In-rack for selectbox [select]
function select_rackbox(){
    var type = '';
    var data_info = new Object();
    data_info.table = 'stnd_warehouse_rack';
    data_info.column = ['stwa_uid AS puid','stwara_uid AS id','stwara_nm AS value'];
    data_info.order = {'stwara_uid':'desc'};
    return data_info;
}

//BOM [select]
function select_bom_sub(uid){
    var type = '';
    var data_info = new Object();
    var table = 'stnd_bom_sub';
    var join_table = 'stnd_item';
    var join_opt = {[table] :'stit_uid', [join_table]:'stit_uid'};

    var join_table1 = 'view_stok_record_rack';
    var join_opt1 = {[table] :'stit_uid', [join_table1]:'stit_uid'};

    var pk = 'stbosu_uid';
    data_info.table = [table,join_table,join_table1];
    data_info.join = [join_opt, join_opt1];
    data_info.column = '*';
    data_info.where = {and:[{column : 'stbo_uid', 'type' : '=', 'data' : uid}, {column : 'stre_nowqty', 'type' : '!=', 'data' : 0}]};
    data_info.order = {'stbosu_uid':'desc'};
    return data_info;
}

//badtype [select]
function select_bad_type(){
    var data_info = new Object();
    data_info.table = 'stnd_bad_type';
    data_info.column = ['stbaty_uid AS id','stbaty_nm AS value'];
    data_info.order = {'stbaty_uid':'desc'};
    return data_info;
}

//overstock [insert]
function insert_work_overstock(state, work_data){
    var overstock_box = [state, work_data];
    var result_chk;
    call_ajax('insert_work_overstock',{'data' : overstock_box},function(json){//현장등록
        result_chk = json.result;
    }, false);
    return result_chk;
}

//bad work & bad log [select]
function select_work_bad_detail(uid){
    var type = '';
    var data_info = new Object();
    var table = 'prod_bad';

    var join_table = 'prod_bad_log';
    var join_opt = {[table] :'prba_uid', [join_table]:'prba_uid'};

    var join_table1 = 'stnd_bad_type';
    var join_opt1 = {[table] :'stbaty_uid', [join_table1]:'stbaty_uid'};

    data_info.table = [table,join_table,join_table1];
    data_info.join = [join_opt, join_opt1];
    data_info.column = '*';
    data_info.where = {and:[{column : 'prwo_uid', 'type' : '=', 'data' : uid}]};
    return data_info;
}

//out-stock log [select]
function select_out_stock(uid){
    var type = '';
    var data_info = new Object();
    var table = 'prod_work_stock';

    var join_table = 'stnd_item';
    var join_opt = {[table] :'stit_uid', [join_table]:'stit_uid'};

    data_info.table = [table,join_table];
    data_info.join = join_opt;
    data_info.column = '*';
    data_info.where = {and:[{column : 'prwo_uid', 'type' : '=', 'data' : uid}]};
    return data_info;
}

//*************************************** FUNCTION [ETC] ******************************************//

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

Date.prototype.hhmmss = function() {
  var hh = this.getHours();
  var mm = this.getMinutes();
  var ss = this.getSeconds();

  return [(hh>9 ? '' : '0') + hh,
          (mm>9 ? '' : '0') + mm,
          (ss>9 ? '' : '0') + ss,
         ].join('');
};

Date.prototype.yyyymmddhhmmss = function() {
  return this.yyyymmdd() + this.hhmmss();
};


```

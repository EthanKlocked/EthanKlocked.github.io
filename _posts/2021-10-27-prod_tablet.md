---
layout: post
title: "태블릿용 작업관리"
subtitle: "smart factory"
date: 2021-10-27 11:44:32 -0400
background: '/img/posts/factory-2030.jpeg'
tags: [javascript, workspace]
---
## 기능설명
* 작업지시상 생산라인 내 공정 개수에 따라 자동으로 탭을 생성한다.    
* 전체 생산계획 생산예정 수량을 공정별로 시작, 완료하여 최종 공정이 완료될 경우 재고가 증가한다.   
* 각 공정단계에서 불량, 불출수량을 추가적으로 등록하는 것이 가능하다.   
* 계획수량이 모두 최종 공정을 통과하게 되면 생산이 종료되고 리스트화면으로 돌아간다.

<br>

## 단계별 화면
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_list.png" width="35%" height="35%"> 	

<div>* list 에서 작업하고 싶은 row를 클릭하여 해당 작업으로 진입한다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_tab.png" width="35%" height="35%">
<div>* 원하는 공정탭을 클릭하여 해당 공정의 대기수량 및 완료수량을 확인할 수 있다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_comp.png" width="35%" height="35%">
<div>* 공정종료 버튼을 클릭할 시 새롭게 뜨는 팝업창에서 완료수량을 입력한다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_bad.png" width="35%" height="35%">
<div>* 불량등록 버튼을 클릭할 시 새롭게 뜨는 팝업창에서 불량유형 및 수량을 등록한다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_out.png" width="35%" height="35%">
<div>* 불출등록 버튼을 클릭할 시 새롭게 뜨는 팝업창에서 불출품목 및 창고를 선택하여 불출하는 것이 가능하다.</div>
</div>
<div style ="border:grey solid 1px; margin:5px; padding:10px;">
<img src="/img/work/prod_t_final.png" width="35%" height="35%">
<div>* 최종단계의 공정에서 총 수량의 품목생산이 완료될 경우 해당 생산이 종료되며 결과가 나타난다.</div>
</div>

<br>

## 코드

``` javascript
/*
    ##### 수정로그 #####
    2021.09.27 김현중 신규
*/
//*************************************** GLOBAL ******************************************//
//layout
var layout; 

//grid
var plan_grid; 

//form
var compform; 
var next_form;
var bad_form;
var out_form;

//tab
var total_tab; 
var active_tab;

//window
var comp_window; 
var bad_window; 
var out_window;

//data
var warehouse_uid = 1;
var warehouse_nm;
var badtype_data;
var bom_data;
var stok_data;
var left_stock;

//*************************************** EXECUTION ******************************************//
$(function(){ 
    //************ init *************//
    // fast click event in mobile
    window.addEventListener('load', function() {
        new FastClick(document.body);
    }, false);

    // create layout
    layout = create_layout();

    // select_data [prod_plan] 
    var plan_data = select_prod_plan();
    plan_data = select_common('',[plan_data]);
    plan_data = plan_data.data[Object.keys(plan_data.data)[0]];
    
    // create grid [prod_plan] 
    plan_grid = create_plan_grid();
    plan_grid.data.parse(plan_data); //parse init data
    layout.getCell('main').attach(plan_grid); 

    plan_grid.events.on("cellClick", function(row,column,e){
        $(".grid_loading").show();
        //change UI
        var raw_t = (row.prpl_real_start == '대기') ? row.prpl_regdate : row.prpl_real_time;
        raw_t = `${raw_t.substr(0,4)}-${raw_t.substr(4,2)}-${raw_t.substr(6,2)} ${raw_t.substr(8,2)}:${raw_t.substr(10,2)}`;

        layout.config.rows[0].html = `<span>작업 내역</span>`; //change title
        $('.layout_title').off('click').on('click', () => list_back()); //event binding 
        layout.config.rows[1].html = `<span>${row.prpl_real_start}<\/span><span>${raw_t}<\/span>`; //change header
        layout.config.rows[1].css = `layout_status`; //change header css

        //select_data [prod_work] + stwa_nm
        var work_data = select_prod_work(row.prpl_uid);
        var warehouse_data = {'table':'stnd_warehouse','column':['stwa_nm'],'where':{and:[{column:'stwa_uid',type:'=','data':warehouse_uid}]}};
        work_data = select_common('',[work_data, warehouse_data]);
        warehouse_nm = work_data.data[Object.keys(work_data.data)[1]][0].stwa_nm;
        work_data = work_data.data[Object.keys(work_data.data)[0]];
    
        //create tab
        total_tab = create_tab(work_data); // tab * 3
        total_tab.events.on("change", function(now,from){
            comp_window.hide();
            bad_window.hide();
            out_window.hide();
            compform.getItem("prwo_waitqty").setValue(work_data[now].prwo_waitqty);

            var button_name = (work_data[now].prwo_status != '공정시작') ? 'comp_end':'comp_start';
            compform.getItem("comp_start").setProperties({'text':work_data[now].prwo_status});
        });

        //create main form -- work idx 0 default
        compform = create_compform(row, work_data[0]);

        compform.events.on("Click", function(name, events) {
            active_tab = Number(total_tab.getActive()); //active idx
            var work_uid = work_data[active_tab].prwo_uid; //prwo_uid
            var button_text = compform.getProperties('comp_start').text;
            if(work_data[active_tab].prwo_waitqty == 0 && name != 'out'){
                general_msg('잔여수량이 없습니다.','dhx_message--error');
                return false;
            }
            if(name == 'comp_start' && button_text == '공정시작'){
                var datetime = new Date();
                var updatetime = datetime.yyyymmddhhmmss();

                var status_update_box = [];
                var status_result = update_status(work_uid, '공정종료', '생산중', updatetime);
                status_update_box.push(status_result);
                if(active_tab == 0){
                    status_update_box.push(update_plan_start(row.prpl_uid, updatetime));
                }
                var update_output = update_common(status_update_box);
                if(update_output.result == 'success'){
                    if(active_tab == 0){
                        raw_t = `${updatetime.substr(0,4)}-${updatetime.substr(4,2)}-${updatetime.substr(6,2)} ${updatetime.substr(8,2)}:${updatetime.substr(10,2)}`;   
                        document.getElementsByClassName('layout_status')[0].childNodes[0].childNodes[0].textContent = '진행중';
                        document.getElementsByClassName('layout_status')[0].childNodes[0].childNodes[1].textContent = raw_t;
                    }
                    compform.getItem("comp_start").setProperties({'text':'공정종료'});
                    work_data[active_tab].prwo_status = '공정종료';
                }
            }else if(name == 'comp_start' && button_text == '공정종료'){ //*** COMPLETION ***//
                //clear
                next_form.clear();

                //set value & prop
                next_form.setValue(row);
                next_form.setValue(work_data[active_tab]);
                next_form.setValue({'login_uid':login_uid,'func_nm':'update_work_stock'});
                next_form.getItem("qty").setProperties({
                    'placeholder':`대기수량: ${work_data[active_tab].prwo_waitqty}`,
                    'validation' : function(value) {
                        return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(work_data[active_tab].prwo_waitqty) && Number(value) > 0;
                    }
                });

                //hide & show
                bad_window.hide();
                out_window.hide();
                comp_window.show();

                //set message box
                next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:black'>위 수량을 등록하시겠습니까?</span>`;
                document.getElementById('text_msg').style.color = 'black'; //message default
                document.getElementById('text_msg').textContent = '위 수량을 등록하시겠습니까?';

            }else if(name == 'bad'){ //*** BAD ***//
                //clear
                bad_form.clear();

                //set value & prop
                bad_form.setValue(row);
                bad_form.setValue(work_data[active_tab]);
                bad_form.setValue({'login_uid':login_uid,'func_nm':'insert_work_bad'});
                bad_form.getItem("prba_qty").setProperties({
                    'placeholder':`대기수량: ${work_data[active_tab].prwo_waitqty}`,
                    'validation': function(value) {
                        return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(work_data[active_tab].prwo_waitqty) && Number(value) > 0;
                    }
                });

                //hide & show
                out_window.hide();
                comp_window.hide();
                bad_window.show();

                //set message box
                bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:black'>위 수량을 불량처리 하시겠습니까?</span>`;
                document.getElementById('bad_msg').style.color = 'black'; //message default
                document.getElementById('bad_msg').textContent = '위 수량을 불량처리 하시겠습니까?';

            }else if(name == 'out'){ //*** OUT ***//
                //clear
                out_form.clear();

                //set value & prop
                out_form.setValue(row);
                out_form.setValue(work_data[active_tab]);
                out_form.setValue({'login_uid':login_uid,'func_nm':'insert_work_out'});
                out_form.getItem("prwost_qty").setProperties({
                    'validation': function(value) {
                        return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(left_stock) && Number(value) > 0;
                    }
                });

                //set select option [init][default index = 0]
                out_form.getItem("stit_cuid").setValue(bom_data[0].value);
                stok_data = select_common('',[select_bom_stok(bom_data[0].value)]);
                stok_data = stok_data.data[Object.keys(stok_data.data)[0]];
                out_form.getItem("stwa_uid").setOptions(stok_data);         
                out_form.getItem("stitcl_cuid").setValue(bom_data[0].stitcl_cuid);
                out_form.getItem("stitgr_cuid").setValue(bom_data[0].stitgr_cuid);                  

                //hide & show
                comp_window.hide();
                bad_window.hide();
                out_window.show();

                //set message box
                out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:black'>위 수량을 추가불출 하시겠습니까?</span>`;
                document.getElementById('out_msg').style.color = 'black'; //message default
                document.getElementById('out_msg').textContent = '위 수량을 추가불출 하시겠습니까?';
            }

            //number pattern
            $('.dhx_input').attr('pattern','\\d*');
        });

        compform.getItem("comp_start").setProperties({'text':work_data[0].prwo_status}); //work_idx 0 default
        //parse form to tab
        for(var i=0; i<work_data.length; i++){
            total_tab.getCell(i).attach(compform); // parse
        }

        //parse tab to layout
        layout.getCell('main').attach(total_tab); 

        //window*3 [comp, bad, out]
        comp_window = create_window();
        bad_window = create_window();
        out_window = create_window();
        out_window.setSize('',330);

        //completion form
        next_form = create_next_form(row, work_data[0]);
        next_form.events.on("Click", function(name, events) { //COMPLETION SAVE
            if(next_form.getItem('qty').getValue() == ''){ //error message case null
                document.getElementById('text_msg').style.color = 'red';
                document.getElementById('text_msg').textContent = '빈 값을 입력할 수 없습니다.';
            }
            if(name == 'button' && next_form.validate() == true){ //check button name & validation

                if(active_tab+1 == work_data.length){ //THE LAST WORK STAGE 
                    next_form.setValue({'stwa_uid':warehouse_uid}); //set warehouse index as 1[default]
                }

                next_form.send("./?json=insert_dhtmlx", "POST")
                .then((output) => {
                    output = JSON.parse(output);
                    if(output.result == 'success'){
                        comp_window.hide();
                        general_msg('작업 결과 처리가 완료 되었습니다.');
                        work_data = select_prod_work(row.prpl_uid);
                        work_data = select_common('',[work_data]);
                        work_data = work_data.data[Object.keys(work_data.data)[0]];
                        compform.setValue(work_data[active_tab]);
                        next_form.setValue(work_data[active_tab]);

                        if(active_tab+1 == work_data.length){ //THE LAST WORK STAGE
                            var alert_text =  `창고 : ${warehouse_nm} </br>
                                               품목 : ${row.stit_nm} <br>
                                               완료수량 : ${next_form.getItem('qty').getValue()}개
                                               </br>
                                               </br>
                                               <span style='font-weight:bold'>작업 품목이 입고처리되었습니다.</span>`;

                            var button_nm;
                            if(output.final_chk == 'perfect'){ //THE LAST WORK STAGE & PLAN OVER
                                button_nm = '홈으로';                              
                                alert_text += `<\/br>
                                               <\/br>
                                               <span style='font-weight:bold'>[ 최 종 ]</span>
                                               <\/br>
                                               <span style='color:#0ab169'>지시수량(${next_form.getItem('prpl_qty').getValue()}개) 생산이 완료되었습니다.</span>`;

                                var bad_cnt = select_common('', [select_bad_cnt(row.prpl_uid)]); //bad qty chk
                                bad_cnt = bad_cnt.data[Object.keys(bad_cnt.data)[0]];
                                if(bad_cnt[0].sum > 0){
                                    alert_text += `<\/br><span style='color:red'>불량처리(${bad_cnt[0].sum}개)</span>`;
                                }
                            }else{
                                button_nm = '확인';
                            }

                            dhx.alert({
                                text: alert_text,
                                buttonsAlignment: "center",
                                buttons: [button_nm],
                            }).then(function(test){
                                if(test && button_nm == '홈으로'){
                                    list_back();
                                }
                            });
                        }
                    }else{
                        general_msg('작업 처리 과정에서 문제가 발생하였습니다.','dhx_message--error');
                    }
                })
                .catch((err) => err); // error[etc]
            }
        });
        comp_window.attach(next_form);

        //select badtype/outbom data
        var bad_out_select = select_common('', [select_bad_type(), select_bom_sub(row.stbo_uid)]);
        badtype_data = bad_out_select.data[Object.keys(bad_out_select.data)[0]];
        bom_data = bad_out_select.data[Object.keys(bad_out_select.data)[1]];

        //bad form
        bad_form = create_bad_form(work_data[0], badtype_data);
        bad_form.events.on("Click", function(name, events) {//BAD SAVE
            if(bad_form.getItem('prba_qty').getValue() == ''){ //error message case null
                document.getElementById('bad_msg').style.color = 'red';
                document.getElementById('bad_msg').textContent = '빈 값을 입력할 수 없습니다.';
            }
            if(name == 'button' && bad_form.validate() == true){ //check button name & validation
                bad_form.send("./?json=insert_dhtmlx", "POST")
                .then((output) => {
                    output = JSON.parse(output);
                    if(output.result == 'success'){
                        bad_window.hide();
                        general_msg('불량처리 등록이 완료 되었습니다.');
                        work_data = select_prod_work(row.prpl_uid);
                        work_data = select_common('',[work_data]);
                        work_data = work_data.data[Object.keys(work_data.data)[0]];
                        compform.setValue(work_data[active_tab]);
                        bad_form.setValue(work_data[active_tab]);
                        next_form.setValue(work_data[active_tab]);

                        if(output.final_chk == 'perfect'){//PLAN OVER
                            var alert_text = `<span style='font-weight:bold'>[ 최 종 ]</span>
                                              <\/br>
                                              <span style='color:#0ab169'>지시수량(${work_data[active_tab].prpl_qty}개) 생산이 완료되었습니다.</span>`;
                            var button_nm = '홈으로';

                            var bad_cnt = select_common('', [select_bad_cnt(row.prpl_uid)]); //bad qty chk
                            bad_cnt = bad_cnt.data[Object.keys(bad_cnt.data)[0]];
                            if(bad_cnt[0].sum > 0){
                                alert_text += `<\/br><span style='color:red'>불량처리(${bad_cnt[0].sum}개)</span>`;
                            }
                            dhx.alert({
                                text: alert_text,
                                buttonsAlignment: "center",
                                buttons: [button_nm],
                            }).then(function(test){
                                list_back();
                            });
                        }
                    }else{
                        general_msg('불량처리 등록 과정에서 문제가 발생하였습니다.','dhx_message--error');
                    }
                });
            }
        });
        bad_window.attach(bad_form);

        //out form
        out_form = create_out_form(work_data[0], bom_data); 
        out_form.getItem("stit_cuid").events.on("change", function(value){ //selectBox change event 1
            bom_data.forEach((etc_chk)=>{ //insert class, group info
                if(etc_chk.value == value){
                    out_form.getItem("stitcl_cuid").setValue(etc_chk.stitcl_cuid);
                    out_form.getItem("stitgr_cuid").setValue(etc_chk.stitgr_cuid);                  
                    return false;
                }
            });

            stok_data = select_common('',[select_bom_stok(value)]);
            stok_data = stok_data.data[Object.keys(stok_data.data)[0]];
            out_form.getItem("stwa_uid").setOptions(stok_data);
        });
        out_form.getItem("stwa_uid").events.on("change", function(chk_value){ //selectBox change event 2
            stok_data.forEach((selected) => {
                if(selected.value == chk_value){
                    left_stock = selected.qty;
                    return false;
                }
            })
            out_form.getItem("prwost_qty").setProperties({ //change placeHolder 
                'placeholder':`재고: ${left_stock}`,
            });
        });
        out_form.events.on("Click", function(name, events) { //OUTCOME SAVE 
            if(out_form.getItem('prwost_qty').getValue() == ''){ //error message case null
                document.getElementById('out_msg').style.color = 'red';
                document.getElementById('out_msg').textContent = '빈 값을 입력할 수 없습니다.';
            }
            if(name == 'button' && out_form.validate() == true){ //check button name & validation
                out_form.send("./?json=insert_dhtmlx", "POST")
                .then((output) => {
                    output = JSON.parse(output);
                    if(output.result == 'success'){
                        general_msg('추가불출 등록이 완료되었습니다.');
                        out_window.hide();
                    }else{
                        general_msg('추가불출 과정에서 문제가 발생하였습니다.','dhx_message--error');
                    }
                });
            }
        });

        out_window.attach(out_form);


        setTimeout(function(){
            $(".grid_loading").hide();
        },200);
    });
});

//*************************************** CONFIG & LOGIC ******************************************//
//LAYOUT [Main]
function create_layout(){
    var layout = new dhx.Layout("layout", { //LAYOUT
        rows: [
            {
                id: "title",
                html: "<span>작업 등록</span>",
                css: "layout_title",
                height:'7.5%'
            },
            {
                id: "header",
                html: "<span>작업지시 리스트</span>",
                css: "layout_header",
                height:'7.5%',
            },
            {           
                id: "main",
                padding:'1%'
            }
        ]
    });
    return layout;
}

//GRID [prod_plan]
function create_plan_grid(){
    var plan_grid = new dhx.Grid("", {
        columns: [
            {width: 45, id: "prpl_real_start", sortable: false, header: [{ text: "상태", align:'center'}],footer: [{}], align:'center'},
            {width: 100, id: "prpl_num", sortable: false, header: [{ text: "생산계획번호", align:'center'}], align:'center'},
            {width: 100, id: "stit_nm", header: [{ text: "품목", align:'center'}], footer: [{ text: "Total  :",align:'right'}], align:'center'},
            {id: "prpl_qty", sortable: false, header: [{ text: "계획수량", align:'center'}], footer: [{ content: "sum", align:'center' }], align:'center', format: "#,#"},
        ],
        autoWidth: true,
    });
    return plan_grid;
}

//TAB BAR [VIEW]
function create_tab(data){
    var total_tab = new dhx.Tabbar("", {
        css: "custom-tab",
        mode: "top",
        tabAlign: 'center',
        tabWidth: 100,
        tabHeight: 50,
        views: data
    });
    return total_tab;
}

// FORM [work_completion_main]
function create_compform(row, work_data){
    var comp_form_config = { 
        css: "custom_compform",
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
                value: "",
            },
            {
                name: "prpl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: row.prpl_uid,
            },
            {
                name: "prpl_compqty",
                type: "input",
                hidden: true,
                value: row.prpl_compqty,
            },
            {
                name: "prwo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prwo_uid,
            },
            {
                name: "prwo_idx",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prwo_idx,
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
                name: "stit_lot_sn_chk",
                type: "input",
                hidden: true,
                value: row.stit_lot_sn_chk,
            },
            {
                name: "stli_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stli_uid,
            },
            {
                name: "stpr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stpr_uid,
            },
            {
                name: "stit_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stit_uid,
            },
            {
                name: "prpl_num",
                type: "input",
                label: "생산계획번호",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prpl_num,
            },
            {
                name: "stit_cd",
                type: "input",
                label: "품목코드",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stit_cd,
            },
            {
                name: "stit_nm",
                type: "input",
                label: "품목",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.stit_nm,
            },
            {
                name: "prpl_qty",
                type: "input",
                label: "지시수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: row.prpl_qty
            },
            {
                name: "prwo_waitqty",
                type: "input",
                label: "잔여수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 100,
                value: work_data.prwo_waitqty
            },
            {
                align: "evenly",
                cols: [
                    {
                        name: "comp_start",
                        type: "button",
                        text: "공정시작",
                        size: "medium",
                        view: "flat",
                        color: "secondary",
                    },
                    {
                        name: "bad",
                        type: "button",
                        text: "불량등록",
                        size: "medium",
                        view: "flat",
                        color: "secondary",
                    },
                    {
                        name: "out",
                        type: "button",
                        text: "불출등록",
                        size: "medium",
                        view: "flat",
                        color: "secondary",
                    }
                ]
            }
        ]
    };

    const comp_form = new dhx.Form("", comp_form_config);
    return comp_form;
}

// FORM [work_completion_next]
function create_next_form(row, work_data){
    var next_form_config = { 
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
                name: "stwa_uid",
                type: "input",
                hidden: true,
                value: "",
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
                value: work_data.prwo_uid,
            },
            {
                name: "prwo_idx",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prwo_idx,
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
                name: "stit_lot_sn_chk",
                type: "input",
                hidden: true,
                value: row.stit_lot_sn_chk,
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
                hidden: true,
                labelPosition: "left",
                labelWidth: 80,
                value: row.stit_nm,
            },
            {
                name: "stli_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stli_uid,
            },
            {
                name: "stpr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stpr_uid,
            },
            {
                name: "prpl_qty",
                type: "input",
                label: "지시수량",
                disabled: true,
                labelPosition: "left",
                labelWidth: 80,
                value: row.prpl_qty
            },
            {
                name: "prwo_waitqty",
                type: "input",
                required: true,
                label: "공정 대기수량",
                hidden: true,
                disabled: true,
                labelPosition: "left",
                labelWidth: 80,
                value: work_data.prwo_waitqty
            },
            {
                name: "prwo_compqty",
                type: "input",
                required: true,
                label: "공정 완료수량",
                hidden: true,
                disabled: true,
                labelPosition: "left",
                labelWidth: 80,
                value: work_data.prwo_compqty
            },
            {
                name: "prpl_compqty",
                type: "input",
                required: true,
                label: "생산 완료수량",
                hidden: true,
                disabled: true,
                labelPosition: "left",
                labelWidth: 80,
                value: row.prpl_compqty
            },
            {
                type: "input",
                inputType: "number",
                name: "qty",
                required: true,
                label: "완료수량",
                placeholder: `대기수량: ${work_data.prwo_waitqty}`,
                labelPosition: "left",
                labelWidth: 80,
                validation: function(value) {
                    return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(work_data.prwo_waitqty) && Number(value) > 0;
                },
            },
            {
                type: "container",
                name: "text_msg",
                html: `<span id = 'text_msg'>위 수량을 등록하시겠습니까?</span>`,
            },
            {
                align: "center",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "생산완료 등록",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    const next_form = new dhx.Form("", next_form_config);
    // event[change errorMessage before validation]
    next_form.events.on("beforeValidate", function(name, value){ // change messages after validating stre_nowqty form,
        if(name == 'qty'){
            switch(true){
                case (value == ''):
                    next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:red'>빈 값을 입력할 수 없습니다.</span>`;
                    break;
                case (value <= 0):
                    next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:red'>'0' 또는 음수를 입력할 수 없습니다.</span>`;
                    break;
                case (value > Number(next_form.getItem("prwo_waitqty").getValue())):
                    next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:red'>대기 수량을 초과하였습니다.</span>`;
                    break;
                case (!Number.isInteger(Number(value))):
                    next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:red'>올바른 형식이 아닙니다.</span>`;
                    break;
                default: 
                    next_form.getItem('text_msg').container.config.rows[0].html = `<span id = 'text_msg' style='color:#0ab169'>위 수량을 등록하시겠습니까?</span>`;
                    break;
            }
        }
    });
    return next_form;
}

// FORM [bad_main]
function create_bad_form(work_data, badtype_data){
    var bad_form_config = { 
        css: 'next_comp',
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
                value: work_data.prwo_uid,
            },
            {
                name: "prpl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prpl_uid,
            },
            {
                name: "stit_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stit_uid,
            },
            {
                name: "stli_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stli_uid,
            },
            {
                name: "stpr_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stpr_uid,
            },
            {
                name: "prpl_qty",
                type: "input",
                hidden: true,
                value: work_data.prpl_qty
            },
            {
                name: "prpl_compqty",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prpl_compqty,
            },
            {
                name: "prwo_waitqty",
                type: "input",
                hidden: true,
                value: work_data.prwo_waitqty
            },
            {
                name: "stbaty_uid",
                type: "select",
                label: "불량 유형",
                placeholder: "불량 유형을 선택 해 주세요.",
                labelPosition: "left",
                labelWidth: 80,
                options: badtype_data,
            },
            {
                type: "input",
                inputType: "number",
                name: "prba_qty",
                required: true,
                label: "불량 수량",
                labelPosition: "left",
                labelWidth: 80,
                errorMessage: "",
                validation: function(value) {
                    return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(work_data.prwo_waitqty) && Number(value) > 0;
                },
            },
            {
                type: "container",
                name: "bad_msg",
                html: `<span id = 'bad_msg'>위 수량을 불량처리 하시겠습니까?</span>`,
            },
            {
                align: "center",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "불량 등록",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    const bad_form = new dhx.Form("", bad_form_config);

    bad_form.events.on("beforeValidate", function(name, value){ // change messages after validating stre_nowqty form,
        if(name == 'prba_qty'){
            switch(true){
                case (value == ''):
                    bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:red'>빈 값을 입력할 수 없습니다.</span>`;
                    break;
                case (value <= 0):
                    bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:red'>'0' 또는 음수를 입력할 수 없습니다.</span>`;
                    break;
                case (value > Number(bad_form.getItem("prwo_waitqty").getValue())):
                    bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:red'>대기 수량을 초과하였습니다.</span>`;
                    break;
                case (!Number.isInteger(Number(value))):
                    bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:red'>올바른 형식이 아닙니다.</span>`;
                    break;
                default: 
                    bad_form.getItem('bad_msg').container.config.rows[0].html = `<span id = 'bad_msg' style='color:#0ab169'>위 수량을 등록하시겠습니까?</span>`;
                    break;
            }
        }
    });

    return bad_form;
}

// FORM [out_main]
function create_out_form(work_data, bom_data){
    var out_form_config = { 
        css: 'next_comp',
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
                value: "insert_work_out",
            },
            {
                name: "prwo_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prwo_uid,
            },
            {
                name: "prpl_uid",
                type: "input",
                required: true,
                hidden: true,
                value: work_data.prpl_uid,
            },
            {
                name: "stitcl_cuid",
                type: "input",
                hidden: true,
                value: '',
            },
            {
                name: "stitgr_cuid",
                type: "input",
                hidden: true,
                value: '',
            },
            {
                name: "stit_uid", //finished item
                type: "input",
                required: true,
                hidden: true,
                value: work_data.stit_uid,
            },
            {
                name: "stit_cuid", //used materials
                type: "select",
                label: "불출 자재",
                labelPosition: "left",
                labelWidth: 80,
                options: bom_data,
            },
            {
                name: "stwa_uid",
                type: "select",
                label: "창고",
                labelPosition: "left",
                labelWidth: 80,
                options: [{value:'', content:''}],
            },
            {
                type: "input",
                inputType: "number",
                name: "prwost_qty",
                required: true,
                label: "수량",
                labelPosition: "left",
                labelWidth: 80,
                errorMessage: "",
                validation: function(value) {
                    return Number.isInteger(Number(value)) && value != '' && Number(value) <= Number(left_stock) && Number(value) > 0;
                },
            },
            {
                type: "container",
                name: "out_msg",
                html: `<span id = 'out_msg'>위 수량을 추가불출 하시겠습니까?</span>`,
            },
            {
                align: "center",
                cols: [
                    {
                        name: "button",
                        type: "button",
                        submit: true,
                        text: "추가불출 등록",
                        size: "medium",
                        view: "flat",
                        color: "primary",
                    }
                ]
            }
        ]
    };
    const out_form = new dhx.Form("", out_form_config);

    out_form.events.on("beforeValidate", function(name, value){ // change messages after validating stre_nowqty form,
        if(name == 'prwost_qty'){
            switch(true){
                case (value == ''):
                    out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:red'>빈 값을 입력할 수 없습니다.</span>`;
                    break;
                case (value <= 0):
                    out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:red'>'0' 또는 음수를 입력할 수 없습니다.</span>`;
                    break;
                case (value > Number(left_stock)):
                    out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:red'>재고 수량을 초과하였습니다.</span>`;
                    break;
                case (!Number.isInteger(Number(value))):
                    out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:red'>올바른 형식이 아닙니다.</span>`;
                    break;
                default: 
                    out_form.getItem('out_msg').container.config.rows[0].html = `<span id = 'out_msg' style='color:#0ab169'>위 수량을 등록하시겠습니까?</span>`;
                    break;
            }
        }
    });

    return out_form;
}

//WINDOW [General for Form]
function create_window(){
    var window_config = {
        movable: false,
        closable: true,
        minWidth: 300,
        minHeight: 300,
        css:'custom_window'
    };
    var general_window = new dhx.Window(window_config);
    return general_window;
}
//MESSAGE [delete]
function general_msg(text, status = 'dhx_message--success'){
    dhx.message({
        text: text, 
        icon:"dxi-clock", 
        css: status,
        node: 'layout',
        position: "top-left",
        expire:3000
    });
}

//*************************************** FUNCTION [QUERY] ******************************************//
//prod_plan [select]
function select_prod_plan(){
    var data_info = new Object();
    var table = 'prod_plan';
    var join_table = 'stnd_item';
    var join_opt = {[table]:'stit_uid', [join_table]:'stit_uid'};
    data_info.table = [table,join_table];
    data_info.join = join_opt;
    data_info.column = '*';
    data_info.where = {and:[{column:'prpl_status',type:'=','data':'작업 진행'}]};
    data_info.order = {'prpl_uid':'desc'};
    return data_info;   
}

//prod_work [select]
function select_prod_work(uid){
    var data_info = new Object();
    var table = 'prod_work';
    var join_table = 'stnd_process';
    var join_table2 = 'prod_plan';
    var join_opt = {[table]:'stpr_uid', [join_table]:'stpr_uid'};
    var join_opt1 = {[table]:'prpl_uid', [join_table2]:'prpl_uid'};
    data_info.table = [table,join_table,join_table2];
    data_info.join = [join_opt, join_opt1];
    data_info.column = ['prod_work.*','stnd_process.stpr_nm AS tab','prod_work.prwo_idx AS id','prod_plan.*'];
    data_info.where = {and:[{column:'prod_work.prpl_uid',type:'=','data':uid}]};
    data_info.order = {'prwo_idx':'asc'};
    return data_info;   
}

//badtype [select]
function select_bad_type(){
    var data_info = new Object();
    data_info.table = 'stnd_bad_type';
    data_info.column = ['stbaty_uid AS value','stbaty_nm AS content'];
    data_info.order = {'stbaty_uid':'desc'};
    return data_info;
}

//bad_cnt [select]
function select_bad_cnt(uid){
    var data_info = new Object();
    data_info.table = 'prod_bad';
    data_info.column = ['SUM(prba_qty) AS sum'];
    data_info.where = {and:[{column:'prpl_uid',type:'=','data':uid}]};
    return data_info;
}

//BOM [select]
function select_bom_sub(uid){
    var data_info = new Object();
    var table = 'stnd_bom_sub';
    var join_table = 'stnd_item';
    var join_opt = {[table]:'stit_uid', [join_table]:'stit_uid'};
    data_info.table = [table,join_table];
    data_info.join = join_opt;
    data_info.column = ['stnd_bom_sub.stit_uid AS value', 'stnd_item.stit_nm AS content', 'stnd_item.stitcl_uid AS stitcl_cuid', 'stnd_item.stitgr_uid AS stitgr_cuid'];
    data_info.where = {and:[{column:'stbo_uid',type:'=','data':uid}]};
    data_info.order = {'stbosu_uid':'desc'};
    return data_info;   
}

//bom_stok [select]
function select_bom_stok(uid){
    var data_info = new Object();
    data_info.table = 'view_stok_record_rack';
    data_info.column = ['stwa_uid AS value','stwa_nm AS content', 'stre_nowqty AS qty'];
    data_info.where = {and:[{column:'stit_uid',type:'=','data':uid}]};
    data_info.order = {'stwa_uid':'asc'};
    return data_info;   
}

//work status [update]
function update_status(uid, value, value_text, updatetime){
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
function update_plan_start(uid, updatetime){
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

//*************************************** FUNCTION [ETC] ******************************************//

//back to plan list
function list_back(){
    comp_window.hide();
    bad_window.hide();
    out_window.hide();
    //change header
    layout.config.rows[0].html = `<span>작업 등록<\/span>`; //title
    layout.config.rows[1].html = `<span>작업지시 리스트<\/span>`; //header
    layout.config.rows[1].css = `layout_header`; //css

    // select_data [prod_plan] 
    var plan_data = select_prod_plan();
    plan_data = select_common('',[plan_data]);
    plan_data = plan_data.data[Object.keys(plan_data.data)[0]];

    // create grid [prod_plan] 
    plan_grid.data.parse(plan_data); //parse init data
    layout.getCell('main').attach(plan_grid); 
}

//millisecond
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

console.log = function() {}; //console rejection

```

---
layout: post
title: "공정별 불량현황"
subtitle: "smart factory"
date: 2021-10-27 11:44:32 -0400
background: '/img/posts/factory-2030.jpeg'
tags: [javascript, workspace]
---
## 기능설명
* 현재 존재하는 공정에 맞춰 동적으로 탭 생성
* 0이상 불량이 존재하는 공정리스트를 출력하며 우측에는 해당 도넛그래프가 나타난다.
* 공정리스트는 트리형식으로 펼쳐서 상세정보를 확인할 수 있다.   
* 상단의 기간, 검색기능을 활용하여 sorting이 가능하다.

<br>

## 구현 화면

<img src="/img/work/prod_bad_img.png" width="100%" height="100%"> 	

<br>

## 코드

``` javascript
/*
    ##### 수정로그 #####
    2021.10.15 김현중 신규
    2021.10.21 pagination 주석처리 [주석 No.1]
*/
//**************************************** GLOBAL ********************************************//
// widget
var layout;

var calendar;
var end_calendar;

var total_tab;

var record_grid;
/* [주석 No.1]
var record_pagination;
*/
var record_donut;

// data
var total_data;
var record_data;
var st_date; //type : String(16)
var end_date; //type : String(16)
var active_tab;

// SELECTOR
var resultFrom = document.getElementById("resultFrom");
var resultTo = document.getElementById("resultTo");

//*************************************** EXECUTION ******************************************//
$(function(){ 
    //<<<<<<<<<<<< INIT DEAFAULT >>>>>>>>>>>>>>
    // default window size , position
    var window_height = $(window).height()-300;
    var window_center = (window.screen.width / 3);

    //<<<<<<<<<<<< CREATE WIDGET >>>>>>>>>>>>>>
    //layout
    layout = create_layout();

    //calendar
    calendar = new dhx.Calendar("calendar1", {dateFormat:"%Y-%m-%d"});
    end_calendar = new dhx.Calendar("calendar2", {dateFormat:"%Y-%m-%d"});
    calendar.link(end_calendar); // link
    cal_default(); //init

    //tab
    var title_data = select_common('',[{'table':'stnd_process','column':['stpr_nm AS tab', 'stpr_uid AS id']}]);
    title_data = title_data.data[Object.keys(title_data.data)[0]];
    title_data.unshift({'tab':'전체','id':'99999'});
    total_tab = create_tab(title_data);
    layout.getCell('tab').attach(total_tab); 

    //grid & pagination
    record_grid = create_record_grid();
/* [주석 No.1]
    record_pagination = create_pagination(record_grid);
*/

    //donut
    record_donut = create_record_donut();

    //<<<<<<<<<<<<< PARSE DATA >>>>>>>>>>>>>>> [DEFAULT : TOTAL] 
    select_work_record(st_date, end_date)
        .then((result)=>{
            total_data = result.data;

            record_grid.data.parse(total_data);
            record_grid.collapseAll();
            layout.getCell('record').attach(record_grid); 

            record_donut.data.parse(result.graph);
            layout.getCell('graph').attach(record_donut); 

            /* [주석 No.1]
            layout.getCell('pagination').attach(record_pagination);
            */      
        });

    //<<<<<<<<<<<< WIDGET CONTROL >>>>>>>>>>>>>
    //tabs
    total_tab.events.on("change", function(now,from){
        active_tab = now;
        select_work_record(st_date, end_date, active_tab)
            .then((result)=>{
                total_data = result.data;
                record_grid.data.parse(total_data);
                record_grid.collapseAll();
                /* [주석 No.1]
                record_pagination.setPage(0);
                */
            });
    });

    //calendars 
    resultFrom.addEventListener("click", function() {   //show & hide
        $('#calendar1').show();
        $('#calendar2').hide();
    }, false);
    resultTo.addEventListener("click", function() {
        $('#calendar2').show();
        $('#calendar1').hide();
    }, false);
    $('.admin_content').click(function(e){
        if($(e.target).parents('#poriod_indexing_box').length < 1){
            $('#calendar1').hide();
            $('#calendar2').hide();
        }
    }); 
    
    calendar.events.on("change", function (date) {  // start change
        document.getElementById('search_text').value = null; 
        document.getElementById('search_id').value = 'all'; 

        resultFrom.value = calendar.getValue();
        st_date = $('#resultFrom').val().replaceAll('-','') + '00000000';

        select_work_record(st_date, end_date, active_tab)
            .then((result)=>{
                total_data = result.data;
                record_grid.data.parse(total_data);
                record_grid.collapseAll();

                record_donut.data.parse(result.graph);
                /* [주석 No.1]
                record_pagination.setPage(0);
                */
            });

        $('#calendar1').hide();
    });

    end_calendar.events.on("change", function (date) { // end change
        document.getElementById('search_text').value = null;
        document.getElementById('search_id').value = 'all';         

        resultTo.value = end_calendar.getValue();
        end_date = $('#resultTo').val().replaceAll('-','') + '99999999';

        select_work_record(st_date, end_date, active_tab)
            .then((result)=>{
                total_data = result.data;
                record_grid.data.parse(total_data);
                record_grid.collapseAll();

                record_donut.data.parse(result.graph);
                /* [주석 No.1]
                record_pagination.setPage(0);
                */
            });

        $('#calendar2').hide();
    });

    //search bar
    $('.xi-search').click(function(){
        search_func(total_data,record_grid);
    });
    $('#search_text').keypress(function(e){
        if(e.which == '13'){
            search_func(total_data,record_grid);
        }
    });
    $('#search_text').on().change(function(){
        if($(this).val() == ''){
            search_func(total_data,record_grid);
        }
    });
    
    //reload
    $('#reload').click(function(){
        cal_default(); //init
    });
    
    //excel download
    $('#excel_download').click(function(){
        record_grid.export.xlsx({
            url: "//export.dhtmlx.com/excel"
        });
    });
});

//*************************************** CONFIG & LOGIC ******************************************//
//LAYOUT [Main]
function create_layout(){
    var layout = new dhx.Layout("layout", { //LAYOUT
        cols: [
            {
                type: 'none',
                width: "100%",
                rows: [
                    {
                        id: 'tab',
                        height:"10%",
                    },
                    {
                        cols: [
                            {
                                id: 'record',
                                width: "60%",
                                height:"80%",
                            },
                            {
                                id: 'graph',
                                width: "40%",
                                height:"60%",
                            },
                        ]

                    },
                    /* [주석 No.1]
                    {
                        id: 'pagination',
                        height:"10%",
                    },
                    */
                ]
            }   
        ]
    });
    return layout;
}

//GRID [work]
function create_record_grid(){
    var record_grid = new dhx.TreeGrid("", {
        columns: [
            { id: "prpl_num", header: [{ text: "생산 계획번호"}]},
            { id: "stit_nm", header: [{ text: "품목명"}]},
            { id: "stpr_nm", header: [{ text: "공정"}], footer: 'total'},
            { id: "stpr_uid", header: [{ text: "공정 고유번호"}], hidden : true},
            { id: "stit_uid", header: [{ text: "품목 고유번호"}], hidden : true},
            { id: "prwo_waitqty", header: [{ text: "잔여 수량"}], footer: [{ content: "sum" }], format: "#,#"},
            { id: "prwo_compqty", header: [{ text: "완료 수량"}], footer: [{ content: "sum" }], format: "#,#"},
            { id: "stbaty_nm", header: [{ text: "불량유형"}], width:100},
            { id: "prba_status", header: [{ text: "처리"}], width:100},
            { id: "prba_regdate", header: [{ text: "처리일시"}], width:150},
            { id: "prba_qty", header: [{ text: "불량수량"}], footer: [{ content: "sum" }], format: "#,#"},
        ],
        rowHeight: 30,
        headerRowHeight: 35,
        editable: false,
        autoWidth: true, 
    });
    return record_grid;
}

//PAGINATION [General Page]
function create_pagination(obj){
    var pagination = new dhx.Pagination("", {
        css: "dhx_widget--bordered dhx_widget--no-border_top",
        data: obj.data,
    });
    return pagination;
}

//TAB BAR [total tab] 
function create_tab(data){
    var total_tab = new dhx.Tabbar("", {
        css: 'custom-tab',
        mode: "top",
        tabAlign: 'left',
        tabHeight: 50,
        views: data
    });
    return total_tab;
}

//donut graph [bad]
function create_record_donut(){
    var record_donut = new dhx.Chart("", 
        {
            type: "donut",
            series: [
                {
                    value: "value",
                    text: "name"
                }
            ],
            legend: {
                values: {
                    id: "value",
                    text: "name",
                },
            }
        }
    );
    return record_donut;
}

//*************************************** FUNCTION [QUERY] ******************************************//
//work [select]
function select_work_record(st, end, where='99999'){
    return new Promise((resolve, reject) =>{
        call_ajax('select_bad_record',{'data' : {'st':st, 'end':end, 'where':where}},function(json){
            if(json.result == 'success'){
                resolve(json);
            }
        }, true);
    });
}

//*************************************** FUNCTION [ETC] ******************************************//
//calendar default set
function cal_default(){
   var date = new Date();
   var start = new Date(Date.parse(date) - 30 * 1000 * 60 * 60 * 24);
   var today = new Date(Date.parse(date) + 0 * 1000 * 60 * 60 * 24);
   var yyyy = start.getFullYear();
   var mm = start.getMonth();
   var dd = start.getDate();
   calendar.setValue(new Date(yyyy, mm, dd));
   mm = mm + 1;
   if(mm<10){
    mm = "0" + mm;
   }if(dd<10){
    dd = "0" + dd;
   }
   var t_yyyy = today.getFullYear();
   var t_mm = today.getMonth()+1;
   var t_dd = today.getDate();
   if(t_mm<10){
    t_mm = "0" + t_mm;
   }if(t_dd<10){
    t_dd = "0" + t_dd;
   }
   resultFrom.value = yyyy + "-" + mm + "-" + dd;
   end_calendar.setValue(new Date());
   resultTo.value = t_yyyy + "-" + t_mm + "-" + t_dd;

   st_date = String(yyyy) + mm + dd + '00000000';
   end_date = String(t_yyyy) + t_mm + t_dd + '99999999';
}

```

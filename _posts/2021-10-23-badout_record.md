---
layout: post
title: "조건부 리스트"
subtitle: "smart factory"
date: 2021-10-25 23:44:32 -0400
background: '/img/posts/factory-2030.jpeg'
tags: [php, workspace]
---
## 기능설명
* request data에 따라 다르게 sql문 생성
  * st,end : 기간조건
  * type : 리스트 종류
  * where : tab정보
* 검색기능 최적화를 위해 쿼리 단에서 형변환을 완료시킨다.

<br>

## 코드

``` php
<?php
/*
##### 업데이트로그 #####
2021.10.27 김현중 신규 (prod_plan out,bad log)
*/
$output['result'] = 'success';

$data = $_POST['data'];
$st = $data['st'];
$end = $data['end'];
$type = $data['type'];
$where = $data['where'];

//<<<<<<<<<< CREATE QUERY <<<<<<<<<<<//
//select
if($type == 'out'){
    $extra_select = "f.prpl_outqty";
    $joinTable = "(SELECT SUM(prwost_qty) AS prpl_outqty, prpl_uid FROM prod_work_stock GROUP BY prpl_uid)";
}else if($type == 'bad'){
    $extra_select = "f.prpl_badqty";
    $joinTable = "(SELECT SUM(prba_qty) AS prpl_badqty, prpl_uid FROM prod_bad GROUP BY prpl_uid)";
}else{
    $output['result'] = 'fail';
    echo json_encode($output);
    return false;
}
$select_sql = "SELECT
                    a.prpl_uid, 
                    a.prpl_qty, 
                    a.prpl_compqty,
                    a.prpl_num,
                    IFNULL(
                        CONCAT(
                            SUBSTRING(a.prpl_real_time,1,4),'-',SUBSTRING(a.prpl_real_time,5,2),'-',SUBSTRING(a.prpl_real_time,7,2),' ',SUBSTRING(a.prpl_real_time,9,2),':',SUBSTRING(a.prpl_real_time,11,2),':',SUBSTRING(a.prpl_real_time,13,2)
                        ),
                        '대기'
                    ) as prpl_real_time,
                    b.stit_uid,
                    b.stit_nm,
                    c.stli_uid,
                    c.stli_nm,
                    IFNULL(
                        CONCAT(
                            SUBSTRING(e.prwo_endtime,1,4),'-',SUBSTRING(e.prwo_endtime,5,2),'-',SUBSTRING(e.prwo_endtime,7,2),' ',SUBSTRING(e.prwo_endtime,9,2),':',SUBSTRING(e.prwo_endtime,11,2),':',SUBSTRING(e.prwo_endtime,13,2)
                        ),
                        '진행'
                    ) as prwo_endtime,
                    {$extra_select}
                FROM
                    prod_plan a 
                JOIN
                    stnd_item b 
                    ON (a.stit_uid = b.stit_uid)
                JOIN
                    stnd_line c 
                    ON (a.stli_uid = c.stli_uid)
                JOIN 
                    (SELECT prpl_uid, MAX(prwo_uid) as prwo_uid FROM prod_work GROUP BY prpl_uid) d
                    ON (a.prpl_uid = d.prpl_uid)
                JOIN 
                    prod_work e
                    ON (e.prwo_uid = d.prwo_uid)
                JOIN 
                    {$joinTable} f
                    ON (a.prpl_uid = f.prpl_uid)
                WHERE
                    a.prpl_status != '취소' ";

//where
$select_sql .= "and 
                    a.prpl_regdate >= {$st}
                and
                    a.prpl_regdate <= {$end} ";

if($where != '99999'){
    $select_sql .= "and 
                        c.stli_uid = {$where} ";
}

//order by
$select_sql .= "ORDER BY
                a.prpl_uid DESC";

//<<<<<<<<<< EXECUTE QUERY <<<<<<<<<<<//
$select_result = query($select_sql);
if($select_result){
    $output['data'] = array();
    while($row = mysqli_fetch_assoc($select_result)){
        array_push($output['data'], $row);
    }
}else{
    $output['result'] = 'fail';
}
echo json_encode($output);
?>



```

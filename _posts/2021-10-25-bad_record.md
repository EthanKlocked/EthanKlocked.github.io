---
layout: post
title: "불량리스트 tree"
subtitle: "smart factory"
date: 2021-10-25 23:44:32 -0400
background: '/img/posts/smart-f-02.png'
tags: [php, workspace]
---
## 기능설명
* tree 구조 리스트를 위한 쿼리
  * graph_sql : 그래프 출력
  * semi_sql : tree 부모
  * select_sql : tree 자식
* 검색기능 최적화를 위해 쿼리 단에서 형변환을 완료시킨다.

<br>

## 코드

``` php
<?php
/*
##### Ʈα #####
2021.10.15  ű (prod_bad select)
*/
$data = $_POST['data'];
$st = $data['st'];
$end = $data['end'];
$where = $data['where'];

$output['result'] = 'success';

//<<<<<<<<<< CREATE QUERY <<<<<<<<<<<//
//select
$graph_sql = "SELECT
                    SUM(b.prba_qty) AS value, 
                    c.stpr_nm AS name
                FROM
                    prod_work a 
                JOIN
                    prod_bad b 
                    ON (a.prwo_uid = b.prwo_uid)
                JOIN
                    stnd_process c 
                    ON (a.stpr_uid = c.stpr_uid)
                WHERE
                    a.prwo_regdate >= {$st} and
                    a.prwo_regdate <= {$end}
                GROUP BY 
                    c.stpr_uid";

$semi_sql = "SELECT 
                a.prwo_uid AS parent, 
                b.prpl_num,
                c.stpr_uid, 
                c.prba_qty, 
                c.prba_status,
                CONCAT(
                 SUBSTRING(c.prba_regdate,1,4),
                 '-',
                 SUBSTRING(c.prba_regdate,5,2),
                 '-',
                 SUBSTRING(c.prba_regdate,7,2),
                 ' ',
                 SUBSTRING(c.prba_regdate,9,2),
                 ':',
                 SUBSTRING(c.prba_regdate,11,2),
                 ':',
                 SUBSTRING(c.prba_regdate,13,2)
                ) AS prba_regdate,
                d.stbaty_nm,
                e.stit_nm
            FROM 
                prod_work a 
            JOIN
                prod_plan b 
                ON(a.prpl_uid = b.prpl_uid)
            LEFT OUTER JOIN
                prod_bad c
                ON(a.prwo_uid = c.prwo_uid)
            JOIN
                stnd_bad_type d
                ON(c.stbaty_uid = d.stbaty_uid)
            JOIN
                stnd_item e 
                ON(a.stit_uid = e.stit_uid)
            WHERE
                b.prpl_status != '' ";


$select_sql = "SELECT
                    a.prwo_uid AS id, 
                    a.prwo_waitqty, 
                    a.prwo_compqty,
                    b.prpl_num,
                    c.stit_uid,
                    c.stit_nm,
                    d.stli_uid,
                    d.stli_nm,
                    e.stpr_uid,
                    e.stpr_nm,
                    IFNULL(f.prba_qty, '0') as prba_qty
                FROM
                    prod_work a 
                JOIN
                    prod_plan b 
                    ON (a.prpl_uid = b.prpl_uid)
                JOIN
                    stnd_item c 
                    ON (a.stit_uid = c.stit_uid)
                JOIN
                    stnd_line d 
                    ON (a.stli_uid = d.stli_uid)
                JOIN
                    stnd_process e 
                    ON (a.stpr_uid = e.stpr_uid)
                JOIN
                    (SELECT prwo_uid, SUM(prba_qty) AS prba_qty FROM prod_bad GROUP BY prwo_uid) AS f
                    ON (a.prwo_uid = f.prwo_uid)
                WHERE
                    b.prpl_status != '' ";
//2021-10-27 JOIN OUTER -> INNER 


//where
$select_sql .= "and 
                    a.prwo_regdate >= {$st}
                and
                    a.prwo_regdate <= {$end} ";

$semi_sql .= "and 
                    a.prwo_regdate >= {$st}
                and
                    a.prwo_regdate <= {$end} ";


if($where != '99999'){
    $select_sql .= "and e.stpr_uid = {$where} ";

    $semi_sql .= "and c.stpr_uid = {$where} ";
}

//order by
$select_sql .= "ORDER BY
                a.prwo_uid DESC,
                a.prwo_idx ASC";

$semi_sql .= "ORDER BY 
                a.prwo_uid ASC";

//<<<<<<<<<< EXECUTE QUERY <<<<<<<<<<<//
$graph_result = query($graph_sql);

if($graph_result){
    $output['graph'] = array();
    while($row = mysqli_fetch_assoc($graph_result)){
        array_push($output['graph'], $row);
    }
}else{
    $output['result'] = 'fail';
}


$select_result = query($select_sql);
$semi_result = query($semi_sql);

if($select_result && $semi_result){
    $output['data'] = array();
    while($row = mysqli_fetch_assoc($select_result)){
        array_push($output['data'], $row);
    }
    while($row = mysqli_fetch_assoc($semi_result)){
        array_push($output['data'], $row);
    }
}else{
    $output['result'] = 'fail';
}
echo json_encode($output);
?>

```

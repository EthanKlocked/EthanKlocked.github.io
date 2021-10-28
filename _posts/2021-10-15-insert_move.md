---
layout: post
title: "창고이동"
subtitle: "smart factory"
date: 2021-10-15 23:44:32 -0400
background: '/img/posts/factory-2030.jpeg'
tags: [php, workspace]
---
## 기능설명
* 재고테이블 내 불출창고,품목아이디를 통해 현 재고량 select
* 현 재고량에 변동량을 반영하여 insert
* 재고테이블 내 입고창고,품목아이디를 통해 현 재고량 select
* 현 재고량에 변동량을 반영하여 insert

<br>

## 코드

``` php
<?php
/*
##### 업데이트로그 #####
2021.10.26 김현중 신규 (생산입고 insert)

*/
$data = $_POST['data'];
$output['result'] = 'success';

for($i=0; $i < count($data); $i++){
    // <<<<<<<<<<<<<<<<<<<<<<<<<< DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>
    $stit_uid = $data[$i]['stit_uid'];
    $stitgr_uid = $data[$i]['stitgr_uid'];
    $stitcl_uid = $data[$i]['stitcl_uid'];
    $move_qty = $data[$i]['stit_maxqty'];
    $stre_memuid = $_SESSION['login_uid'];
    $stre_regdate = millisecond();
    $stwara_uid = 0;

    //IN
    $stwa_uid = $data[$i]['stwa_uid']; 
    $stre_type = '최종입고';
    $stre_nowqty;
    $stre_prevqty;

    //OUT [Default uid = 1 ]
    $out_stwa_uid = 1;
    $out_stre_type = '생산출고';
    $out_stre_nowqty;
    $out_stre_prevqty;

    // <<<<<<<<<<<<<<<<<<<<<<<<<< QUERY >>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //----OUT----//
    //SELECT STOK RECORD
    $out_select_sql = "SELECT stre_nowqty FROM stok_record WHERE stit_uid = {$stit_uid} and stwa_uid = {$out_stwa_uid} and stwara_uid = {$stwara_uid} ORDER BY stre_uid DESC LIMIT 1";

    $out_select_result = query($out_select_sql);    
    if(!$out_select_result){
        $output['result'] = 'fail';
    }else{
        if(mysqli_num_rows($out_select_result) < 1){
            $out_stre_prevqty = 0;
        }else{
            $out_stre_prevqty = mysqli_fetch_array($out_select_result)['stre_nowqty'];
        }
        $out_stre_nowqty = (int)$out_stre_prevqty - (int)$move_qty;

        //INSERT STOK RECORD
        $out_insert_sql = "INSERT INTO stok_record (
                        stit_uid, 
                        stitgr_uid, 
                        stitcl_uid, 
                        stwa_uid, 
                        stwara_uid, 
                        stre_inqty, 
                        stre_outqty, 
                        stre_prevqty, 
                        stre_nowqty, 
                        stre_type, 
                        stre_memuid, 
                        stre_regdate
                    ) 
                    VALUES(
                        {$stit_uid},
                        {$stitgr_uid},
                        {$stitcl_uid},
                        {$out_stwa_uid},
                        {$stwara_uid},
                        0,
                        {$move_qty},
                        {$out_stre_prevqty},
                        {$out_stre_nowqty},
                        '{$out_stre_type}',
                        {$stre_memuid},
                        {$stre_regdate}
                    )";
        $out_insert_result = query($out_insert_sql);
        if(!$out_insert_result){
            $output['result'] = 'fail';
        }else{
        //----IN----//
            //SELECT STOK RECORD
            $select_sql = "SELECT stre_nowqty FROM stok_record WHERE stit_uid = {$stit_uid} and stwa_uid = {$stwa_uid} and stwara_uid = {$stwara_uid} ORDER BY stre_uid DESC LIMIT 1";

            $select_result = query($select_sql);    
            if(!$select_result){
                $output['result'] = 'fail';
            }else{
                if(mysqli_num_rows($select_result) < 1){
                    $stre_prevqty = 0;
                }else{
                    $stre_prevqty = mysqli_fetch_array($select_result)['stre_nowqty'];
                }
                $stre_nowqty = (int)$stre_prevqty + (int)$move_qty;

                //INSERT STOK RECORD
                $insert_sql = "INSERT INTO stok_record (
                                stit_uid, 
                                stitgr_uid, 
                                stitcl_uid, 
                                stwa_uid, 
                                stwara_uid, 
                                stre_inqty, 
                                stre_outqty, 
                                stre_prevqty, 
                                stre_nowqty, 
                                stre_type, 
                                stre_memuid, 
                                stre_regdate
                            ) 
                            VALUES(
                                {$stit_uid},
                                {$stitgr_uid},
                                {$stitcl_uid},
                                {$stwa_uid},
                                {$stwara_uid},
                                {$move_qty},
                                0,
                                {$stre_prevqty},
                                {$stre_nowqty},
                                '{$stre_type}',
                                {$stre_memuid},
                                {$stre_regdate}
                            )";
                $insert_result = query($insert_sql);
                if(!$insert_result){
                    $output['result'] = 'fail';
                }
            }
        }
    }
}
echo json_encode($output);
?>

```

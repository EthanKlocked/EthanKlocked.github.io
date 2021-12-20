---
layout: post
title: "JS 날짜 포맷, 평일일수"
subtitle: "only 28+ 일수 체크"
date: 2021-12-19 13:30:43 -0400
background: '/img/posts/javascript-yel.jpeg
tags: [javascript]
---

## 설명
javascript 기본 날짜형식 (Date)을 입력받아    
날짜형식에 맞게 yyyy-mm-dd 변환   
해당 날짜가 포함된 월의 평일 수를 계산    
배열형식으로 데이터 반환   

* ex) new Date(2021, 3, 5) => return [2021-04-05, 23]    

<br>

## 코드

``` javascript
function form_weekdays(date = new Date()){
  var yyyy = date.getFullYear();
  var raw_mm = date.getMonth() + 1;
  var raw_dd = date.getDate();  
  var mm = raw_mm > 9 ? raw_mm : '0'+ raw_mm;
  var dd = raw_dd > 9 ? raw_dd : '0'+ raw_dd;
  var format = `${yyyy}-${mm}-${dd}`;

  var end_real = new Date(yyyy, mm, 0);
  var real_enddate = end_real.getDate();
  var real_endday = end_real.getDay();
  var raw_cnt = 8;  
  for (var i=0; i < real_enddate-28; i++){
    var nowday = Number(real_endday - i);
    raw_cnt = (nowday == 6 || nowday == 7 || nowday == 0 || nowday == -1) ? raw_cnt+1 : raw_cnt;
  }
  var weekdays = real_enddate - raw_cnt;

  return [format, weekdays]; //yyyy-mm-dd foramt & weekdays
}
```

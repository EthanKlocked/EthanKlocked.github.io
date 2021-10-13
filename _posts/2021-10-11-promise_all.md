---
layout: post
title: "반복문 Promise 처리"
subtitle: "비동기 / 애니메이션"
date: 2021-10-11 18:43:10 -0400
background: '/img/posts/javascript-yel.jpeg'
tags: [javascript]
---
# 실행함수

순차적으로 리스트 row에 한줄씩 jquery animate효과를 주기 위해 'setTimeout' 사용


``` javascript
//async default time
var time_s = 300;

//slide animation
function time_ani(index, node){ 
	return new Promise((resolve) => {
		setTimeout(() => {
			node.animate({left: '200%'}, 1000, 'swing'); //1초동안 오른쪽으로 200%만큼 움직임
			resolve('success');
		},time_s*index/2); //(0.3/2^index) 초 간격으로 실행
	})
}
```


# Promise.all
해당 배열을 map을 통해 순차적으로 promise함수로 던져준다. 해당 배열의 모든 promise 객체가 'fullfilled'상태가 되면 then을 통해 실행


``` javascript
var result_ani = Promise.all($('.list_css').eq(0).children().map((index, node) => time_ani(index, node)))
  .then(() => {
    alert('체크리스트 작업완료.');
    /*
      추가작업
    */
  }); 
```

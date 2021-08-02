---
layout: post
title: "JavaScript Promise"
subtitle: "Promise / async / await"
date: 2021-07-26 19:45:13 -0400
background: '/img/posts/05.jpg'
tags: [javascript]
---
# Callback 함수란?

JavaScript 엔진은 기본적으로 싱글스레드 기반이며 WebAPI를 통한 비동기 처리 기능을 지원한다.   

비동기로 실행되는 함수로는 AJAX 통신 setTimeout() 등이 대표적이다. 비동기 함수는 코드상으로 보이는 다음 명령과 
순서적인 관계가 없기 때문에 동기적 실행을 통해서는 결과값을 가져올 수 없다. 이러한 비동기 결과처리를 위해 
비동기로 실행되는 함수의 변수로 함수 이름을 지정한 후 함수 내부 마지막 부분에서 같은이름의 함수를 실행시키면 모든 명령이 끝난 뒤,
callback함수가 실행되면서 비동기 함수의 결과값을 받아 처리할 수 있다.   

<br>

``` javascript
let callback_test(value, callback) => { 
  var a = value;
  bar b = a+1;
  callback(b); // 파라미터에 있는 변수명 뒤에 ()가 붙게 될 경우 함수로 인식
}

callback_test(1, (val) => {
  console.log(val); // 정의되어 있는 callback의 파라미터 값을 받아 콜백함수 실행
}); 

```
<br>

이런 식으로 callback함수를 사용하면 함수가 끝나는 시점에 callback함수가 호출되면서 값을 받는 것이 가능하다.
비동기의 사후처리 작업을 위해 callback함수가 유용하게 사용되지만 callback 구조를 남발할 경우 이른바 '콜백지옥'이 나타난다.

<br>

``` javascript
let callback_test(value, callback) => { 
  var a = value;
  bar b = a+1;
  callback(b); // 파라미터에 있는 변수명 뒤에 ()가 붙게 될 경우 함수로 인식
}
let callback_test2(value, callback) => { 
  var a = value;
  bar b = a+2;
  callback(b);
}
let callback_test3(value, callback) => { 
  var a = value;
  bar b = a+3;
  callback(b);
}

callback_test(1, (val) => {
  callback_test2(val (val2) => {
    callback_test3(val2, (val3) =>{
      console.log(val3);
    })
  })
}); 

```

<br>

이렇게 콜백 내부에서 다시 콜백함수를 호출하는 경우가 계속 될 경우, 코드의 가독성이 떨어지고 직관적이지 못한 문제가 발생한다.
이러한 문제를 해결하기 위해 등장한 것이 Promise 객체를 활용한 방법이다.

<br>

# Promise 객체를 통한 비동기 컨트롤

Promise 객체는 파라미터로 resolve(), reject()의 콜백함수를 가지고 있다가
내부의 then, catch메소드를 통해 각각의 파라미터값을 받아 다음 명령을 수행한다.

``` javascript
function p_test(n) {
  return new Promise((resolve, reject) => {
    $.ajax('/ajax/function1.php', function(response){
      if(response.result == 'success'){
        resolve(response);      
      }else{
        reject('error');            
      }
    });
  });
}
p_test()
.then((val) => {
  console.log(val); //response값 출력 (ajax 성공시에만 실행)
  let next = response + '성공';
  return next;
})
.then((val2) => {
  console.log(val2); //`${response}성공` 출력 (ajax 성공시에만 실행)
})
.catch((err) =>
  console.error(err); //'error' 출력 (ajax 실패시에만 실행) 
);

```

<br>


Promise 함수는 new생성자로 생성과 함께 선언 될 경우 즉시 실행되어 버리기 때문에 일반적으로 함수의 return값으로 넣어놓고
호출함수를 불러와 사용한다.   
return된 Promise생성자는 .then으로 자기 자신을 호출하기 때문에 내부의 첫번째 인자로 resolve콜백함수를 실행시킬 수 있다.
then메소드는 Promise 객체 자신을 계속해서 호출하는 것이 가능하기 때문에 return값을 넘겨가며 계속해서 콜백함수를 연결실행하는 것이 가능하다.   

Promise자체의 reject뿐만아니라 then으로 연결되는 로직 내부에서 에러가 발생하면 그 즉시 제어권을 catch함수로 넘겨주어 예외처리가 가능하게 한다.

<br>

# async / await 
비동기 콜백에서 문제였던 가독성을 해결하고 좀 더 직관적인 표현을 가능하게 한 Promise 함수의 사용법을 살펴 보았다.
그러나 Promise 실행 이후 내부에서 다시 Promise를 정의 및 실행을 하는 경우가 생기는데, 이 경우 콜백지옥과 크게 다르지 않은 난해함을 느낄 수 있다.
 
 ``` javascript
 function test_pro = {
   return new Promise((resolve, reject) => {
     resolve(1);
   });
 }
 function test_pro2 = {
   return new Promise((resolve, reject) => {
     resolve(2);
   });
 }
 function test_pro3 = {
   return new Promise((resolve, reject) => {
     resolve(3);
   });
 }
 test_pro()
 .then((data) => {
   test_pro2()
   .then((data2) => {
     test_pro3()
     .then((data3) => {
       console.log(data3);
     })
   })
 })

 ```

<br>
 이러한 Promise 중첩을 벗어날 수 있게 해주는 함수가 바로 async로 함수를 정의사고 와 await를 통한 동기화 이다.
 
 ```javascript 
 async function test(){
   return 'ok';
 }

 async function test2(){
   return 'not ok';
 }

 test()
 .then((data) => {console.log(data)}); // ok

 async function test2(){
    let abc = await test();
    let def = await test2();   
    console.log(abc); // ok
    console.log(abc);  //not ok
 }

async function test3(){
  let all_test = await Promise.all([test(), test2()]);
  console.log(all_test[0]); // ok
  console.log(all_test[1]);  // not ok
}
 ```

함수 앞에 async를 정의하게 되면 그 함수의 return 값은 Promise 객체로 변환되어 return된다.
따라서, then()함수로 받아서 사용이 가능하며 동기화 하여 값을 변수에 담는 경우에는 await을 실행 구문 앞에 붙여준다.   
await을 실행하게 되면 해당 함수가 실행 완료되기 전까지 다음 명령이 실행 되지 않기 때문에 동기와 다르지 않다.   
이럴 경우에는 병렬 처리하고 싶은 async 함수들을 Promise.all([])의 배열 안에 나열하여 병렬로 실행 할 수 있다.

* tip : await 구문을 한줄한줄 처리할 경우 동기방식이지만 각각의 async 함수를 변수에 담아 실행시킨 뒤 해당 변수를 await을 통해 받는 방식을 통해 비동기 처리를 직관적인 코드로 나타낼 수 있다.

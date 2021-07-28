---
layout: post
title: "JavaScript ES6 문법정리"
subtitle: "ECMAScript6"
date: 2021-07-26 17:45:13 -0400
background: '/img/posts/05.jpg'
tags: [javascript]
---
# 자바스크립트 ES6(ECMAScript 6)

ECMAScript란 JavaScript 언어와 문법을 정의하는 국제 표준의 이름이다.   
현재 ES12가 최신버전이며 계속해서 버전업이 이루어지고 있다.
그 중에서도 6번째 업데이트였던 ES6 통해 JavaScript에 제기되었던   
많은 문제들이 수정되고 혁신적인 기능들이 추가되었다.

<br>

## 구조 분해(Destructuring) 할당

객체나 배열 내 요소를 대응되는 객체 및 배열의 변수로 분해하여 할당한다.

``` javascript

//배열
const num_cnt = [1,2,3,4,5];
let [one, two, ...etc] = num_cnt; // ...으로 나머지 받기
console.log(one, two, etc); // 1 2 [3,4,5]

let [first, '', third] = num_cnt; // 두번째요소 빼고 받기
console.log(first, third); // 1 3


//객체
const slime = {
  name : 'popo';
  color : 'blue';
}
const {name, color} = slime; //키값과 같은 변수명을 찾아 값을 자동으로 할당
console.log(name, color); // popo blue
/*
const {name:n, color:c} = slime; //다른 키값으로 값 저장도 가능
console.log(n, c); // popo blue
*/
```
<br>

## 화살표 함수

'function' 키워드가 아닌 '=>' 화살표를 사용한 함수표기 법   

#### 1.간결한 함수표현이 가능하다
``` javascript
// 매개변수
    (x, y) => { ... } // 파라미터 x,y
    () => { ... } // 파라미터 없음
     x => { ... } // 파라미터가 한개일경우 소골호 생략

// 표현식 
x => x * x        // 단순한 리턴일 경우 화살표 뒤에 바로 적어주면 된다. 
() => ({ a: 1 })  // 객체 반환시 소괄호를 사용한다.

() => {           // {}는 여러줄 작성에 사용되며 반드시 return을 명시해 주어야 return 된다.
  const x = 10;
  return x * x;
};
```
#### 2.일반함수와의 차이점
* 일반함수의 'this'는 동적으로 바인딩된다. 화살표함수의 'this'는 바로 상위스코프의 'this'와 같다.   
* 화살표함수는 prototype프로퍼티를 가지고 있지 않다. 즉, 생성자로 사용할 수 없다.   
* arguments 변수를 사용할 수 없다.   
 <br>
 
 ## 템플릿 문자열(literal)
 
 변수와 연산을 문자열과 함께 쓸 수 있다.
 ```javascript
 let word = '123';
 console.log(`결과값은 ${word}입니다.`); // 결과값은 123입니다.
 ```
 
 이처럼 백틱(`)으로 감싼 문자열 사이에 ${}를 사용하여 작성한다.
 
 <br>
 
 ## 기타
 
 그 외 '...변수명' 배열을 사용한 전개연산자,펼침연산자와 
 for of 대신 쓸수 있는 for in(상위값 제외 배열 출력) 문법 등이 새로 도입

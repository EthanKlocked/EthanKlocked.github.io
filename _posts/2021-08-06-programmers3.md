---
layout: post
title: "프로그래머스 소수 만들기"
subtitle: "3중 순회 / 소수 판별"
date: 2021-08-06 19:45:13 -0400
background: '/img/posts/cube.jpeg'
tags: [code, javascript]
---
## 문제
주어진 숫자 중 3개의 수를 더했을 때 소수가 되는 경우의 개수를 구하려고 합니다. 숫자들이 들어있는 배열 nums가 매개변수로 주어질 때, nums에 있는 숫자들 중 서로 다른 3개를 골라 더했을 때 소수가 되는 경우의 개수를 return 하도록 solution 함수를 완성해주세요.

## 제한사항
* nums에 들어있는 숫자의 개수는 3개 이상 50개 이하입니다.
* nums의 각 원소는 1 이상 1,000 이하의 자연수이며, 중복된 숫자가 들어있지 않습니다.

<br>

## 풀이

``` javascript
function solution(nums) {
  let val1, val2, val3, last_val, chk;
  let cnt = 0;
  let arr = nums.slice(); // 배열 복사
  for(let i=0; i < arr.length; i++){ // 첫번째 순회 
    val1 = arr[i];
    for(let i2=i+1; i2 < arr.length; i2++){ // +1 인덱스부터 두번째 순회 
      val2 = arr[i2];  
      for(let i3 = i2+1; i3 < arr.length; i3++){ // +2 인덱스부터 세번째 순회 
        val3 = arr[i3];
        last_val = val1 + val2 + val3; // 값 더하기
        chk = 0;
        for(let i4 = 2; i4 <= Math.sqrt(last_val); i4++){ // 소수 체크 (제곱근 순회)
          if(last_val%i4 === 0){
            chk = 1;
          }
        }
        if(chk === 0){
          cnt++;
        }
      }          
    }
  }
  return cnt;
} 
```

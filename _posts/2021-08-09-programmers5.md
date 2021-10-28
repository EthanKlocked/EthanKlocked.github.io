---
layout: post
title: "프로그래머스 모의고사"
subtitle: "완전탐색 / 구현"
date: 2021-08-09 13:32:15 -0400
background: '/img/posts/cube.jpeg'
tags: [code, javascript]
---
## 문제
수포자는 수학을 포기한 사람의 준말입니다. 수포자 삼인방은 모의고사에 수학 문제를 전부 찍으려 합니다. 수포자는 1번 문제부터 마지막 문제까지 다음과 같이 찍습니다.

1번 수포자가 찍는 방식: 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, ...
2번 수포자가 찍는 방식: 2, 1, 2, 3, 2, 4, 2, 5, 2, 1, 2, 3, 2, 4, 2, 5, ...
3번 수포자가 찍는 방식: 3, 3, 1, 1, 2, 2, 4, 4, 5, 5, 3, 3, 1, 1, 2, 2, 4, 4, 5, 5, ...

1번 문제부터 마지막 문제까지의 정답이 순서대로 들은 배열 answers가 주어졌을 때, 가장 많은 문제를 맞힌 사람이 누구인지 배열에 담아 return 하도록 solution 함수를 작성해주세요.

## 제한사항
* 시험은 최대 10,000 문제로 구성되어있습니다.
* 문제의 정답은 1, 2, 3, 4, 5중 하나입니다.
* 가장 높은 점수를 받은 사람이 여럿일 경우, return하는 값을 오름차순 정렬해주세요.

<br>

## 풀이

``` javascript
function solution(answers) {
    let n1 = 0;
    let n1_a = 1;
    
    let n2 = 0;
    let n2_a_even = 2;
    let n2_a_odd = 5;
    let n2_a;
    n2_a = n2_a_even;
    
    let n3 = 0;
    let n3_a = 3;
    
    for(let i=0; i < answers.length; i++){
        if(n1_a === answers[i]){
            n1++;
        }
        if(n2_a === answers[i]){
            n2++;
        }
        if(n3_a === answers[i]){
            n3++;
        }

        //1번 수포자 패턴
        if(n1_a === 5){
            n1_a = 1;
        }else{
            n1_a++;          
        }
        
        
        //2번 수포자 패턴
        if(i%2 === 0){
            if(n2_a_odd === 1){
                n2_a_odd = 3;
            }else if(n2_a_odd > 1 && n2_a_odd < 5){
                n2_a_odd++;
            }else{
                n2_a_odd = 1;
            }
            n2_a = n2_a_odd;
        }else{
            n2_a = n2_a_even;            
            
            //3번 수포자 패턴            
            if(n3_a === 3 || n3_a === 5){
                n3_a -= 2;
            }else if(n3_a === 4){
                n3_a++;
            }else{
                n3_a *= 2;
            }            
        }
    }
    let answer = [];
    let answer_arr = [n1, n2, n3];
    let max = Math.max(...answer_arr);
    for(let k = 0; k < answer_arr.length; k++){
        if(answer_arr[k] === max){
            answer.push(k+1);
        }
    }           
    return answer;
}
```

---
layout: post
title: "프로그래머스 상호평가"
subtitle: "O(n^2)"
date: 2021-08-11 21:13:44 -0400
background: '/img/posts/cube.jpeg'
tags: [code, javascript]
---
## 문제
대학 교수인 당신은, 상호평가를 통하여 학생들이 제출한 과제물에 학점을 부여하려고 합니다. 아래는 0번부터 4번까지 번호가 매겨진 5명의 학생들이 자신과 다른 학생의 과제를 평가한 점수표입니다.

No.	0	1	2	3	4
0	100	90	98	88	65
1	50	45	99	85	77
2	47	88	95	80	67
3	61	57	100	80	65
4	24	90	94	75	65
평균	45.5	81.25	97.2	81.6	67.8
학점	F	B	A	B	D
위의 점수표에서, i행 j열의 값은 i번 학생이 평가한 j번 학생의 과제 점수입니다.

0번 학생이 평가한 점수는 0번 행에담긴 [100, 90, 98, 88, 65]입니다.
0번 학생은 자기 자신에게 100점, 1번 학생에게 90점, 2번 학생에게 98점, 3번 학생에게 88점, 4번 학생에게 65점을 부여했습니다.
2번 학생이 평가한 점수는 2번 행에담긴 [47, 88, 95, 80, 67]입니다.
2번 학생은 0번 학생에게 47점, 1번 학생에게 88점, 자기 자신에게 95점, 3번 학생에게 80점, 4번 학생에게 67점을 부여했습니다.
당신은 각 학생들이 받은 점수의 평균을 구하여, 기준에 따라 학점을 부여하려고 합니다.
만약, 학생들이 자기 자신을 평가한 점수가 유일한 최고점 또는 유일한 최저점이라면 그 점수는 제외하고 평균을 구합니다.

0번 학생이 받은 점수는 0번 열에 담긴 [100, 50, 47, 61, 24]입니다. 자기 자신을 평가한 100점은 자신이 받은 점수 중에서 유일한 최고점이므로, 평균을 구할 때 제외합니다.
0번 학생의 평균 점수는 (50+47+61+24) / 4 = 45.5입니다.
4번 학생이 받은 점수는 4번 열에 담긴 [65, 77, 67, 65, 65]입니다. 자기 자신을 평가한 65점은 자신이 받은 점수 중에서 최저점이지만 같은 점수가 2개 더 있으므로, 유일한 최저점이 아닙니다. 따라서, 평균을 구할 때 제외하지 않습니다.
4번 학생의 평균 점수는 (65+77+67+65+65) / 5 = 67.8입니다.
제외할 점수는 제외하고 평균을 구한 후, 아래 기준에 따라 학점을 부여합니다.

평균	학점
90점 이상	A
80점 이상 90점 미만	B
70점 이상 80점 미만	C
50점 이상 70점 미만	D
50점 미만	F
학생들의 점수가 담긴 정수형 2차원 배열 scores가 매개변수로 주어집니다. 이때, 학생들의 학점을 구하여 하나의 문자열로 만들어서 return 하도록 solution 함수를 완성해주세요.

## 제한사항
* 2 ≤ scores의 행의 길이(학생 수) ≤ 10
* scores의 열의 길이 = scores의 행의 길이
    * 즉, scores는 행과 열의 길이가 같은 2차원 배열입니다.
* 0 ≤ scores의 원소 ≤ 100
* return 값 형식
    * 0번 학생의 학점부터 차례대로 이어 붙인 하나의 문자열을 return 합니다.

<br>

## 풀이

``` javascript
function solution(scores) {
    var answer = '';
    
    let total = []; // 재배치용 배열
    for(let k=0; k < scores.length; k++){ // 2차배열 구조 생성
        let sub_arr = [];
        total.push(sub_arr);
    }
    for(let i=0; i < scores.length; i++){ // 2차배열 생성
        for(let i2=0; i2 < scores[i].length; i2++){
            total[i2].push(scores[i][i2]);
        }
    }
    for(let f=0; f<total.length; f++){ // 탐색용 2차배열  2중 순회
        let max_val = Math.max.apply(null, total[f]);
        let min_val = Math.min.apply(null, total[f]);
        let chk_cnt = 0;
        let sum_val = 0;
        for(let f2=0; f2<total[f].length; f2++){
            sum_val += total[f][f2];
            if(total[f][f] === max_val || total[f][f] === min_val){    
                if(total[f][f] === total[f][f2]){
                    chk_cnt++;
                }
            }            
        }
        let score;
        if(chk_cnt === 1){
            score = (sum_val-total[f][f])/(total.length-1);
        }else{
            score = sum_val/total.length;    
        }
        if(score < 50){
            score = 'F';
        }else if(score < 70){
            score = 'D';
        }else if(score < 80){
            score = 'C';
        }else if(score < 90){
            score = 'B';
        }else{
            score = 'A';
        }
        answer += score;
    }
    return answer;
}
```

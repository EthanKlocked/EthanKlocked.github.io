---
layout: post
title: "프로그래머스 시소짝꿍"
subtitle: "메모이제이션"
date: 2023-04-04 15:13:44 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

어느 공원 놀이터에는 시소가 하나 설치되어 있습니다. 이 시소는 중심으로부터 2(m), 3(m), 4(m) 거리의 지점에 좌석이 하나씩 있습니다.
이 시소를 두 명이 마주 보고 탄다고 할 때, 시소가 평형인 상태에서 각각에 의해 시소에 걸리는 토크의 크기가 서로 상쇄되어 완전한 균형을 이룰 수 있다면 그 두 사람을 시소 짝꿍이라고 합니다. 즉, 탑승한 사람의 무게와 시소 축과 좌석 간의 거리의 곱이 양쪽 다 같다면 시소 짝꿍이라고 할 수 있습니다.
사람들의 몸무게 목록 weights이 주어질 때, 시소 짝꿍이 몇 쌍 존재하는지 구하여 return 하도록 solution 함수를 완성해주세요.

<br>

## 제한사항
* 2 ≤ weights의 길이 ≤ 100,000
* 100 ≤ weights[i] ≤ 1,000
  * 몸무게 단위는 N(뉴턴)으로 주어집니다.
  * 몸무게는 모두 정수입니다.

<br>

## 풀이

``` python
def solution(weights):
    answer = 0
    memo = {}
    keyCnt = {}
    li = [[i, 2*i, 3*i, 4*i] for i in weights]
    for i in li:
        if i[0] in keyCnt : keyCnt[i[0]] += 1
        else: keyCnt[i[0]] = 0
        for j in i[1:]:
            if j in memo: 
                answer += memo[j]
                memo[j] += 1
            else: memo[j] = 1
    for i in keyCnt.values(): 
        if i > 0 : answer -= (i+1)*i
    return answer
```

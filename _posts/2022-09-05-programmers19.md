---
layout: post
title: "프로그래머스 야근 지수"
subtitle: "자료구조 / Max Heap"
date: 2022-09-05 11:31:11 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
회사원 Demi는 가끔은 야근을 하는데요, 야근을 하면 야근 피로도가 쌓입니다.    
야근 피로도는 야근을 시작한 시점에서 남은 일의 작업량을 제곱하여 더한 값입니다.    
Demi는 N시간 동안 야근 피로도를 최소화하도록 일할 겁니다.   
Demi가 1시간 동안 작업량 1만큼을 처리할 수 있다고 할 때,   
퇴근까지 남은 N 시간과 각 일에 대한 작업량 works에 대해 야근 피로도를 최소화한 값을 리턴하는 함수 solution을 완성해주세요.    

<br>

## 제한사항
* works는 길이 1 이상, 20,000 이하인 배열입니다.
* works의 원소는 50000 이하인 자연수입니다.
* n은 1,000,000 이하인 자연수입니다.

<br>

## 풀이

``` python
from heapq import heapify, heappush, heappop

def solution(n, works):
    heap = [-a for a in works]
    heapify(heap)
    for i in range(n):    
        num = heappop(heap) + 1
        if(num > 0): return 0
        heappush(heap, num)
    answer = 0
    for i2 in heap: answer += i2 ** 2
    return answer
```

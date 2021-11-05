---
layout: post
title: "프로그래머스 더 맵게"
subtitle: "Heap 자료구조"
date: 2021-11-04 08:31:44 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
매운 것을 좋아하는 Leo는 모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다. 모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 Leo는 스코빌 지수가 가장 낮은 두 개의 음식을 아래와 같이 특별한 방법으로 섞어 새로운 음식을 만듭니다.

``` python
섞은 음식의 스코빌 지수 = 가장 맵지 않은 음식의 스코빌 지수 + (두 번째로 맵지 않은 음식의 스코빌 지수 * 2)
```

Leo는 모든 음식의 스코빌 지수가 K 이상이 될 때까지 반복하여 섞습니다.   
Leo가 가진 음식의 스코빌 지수를 담은 배열 scoville과 원하는 스코빌 지수 K가 주어질 때, 모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 섞어야 하는 최소 횟수를 return 하도록 solution 함수를 작성해주세요.

<br>

## 제한사항
* scoville의 길이는 2 이상 1,000,000 이하입니다.
* K는 0 이상 1,000,000,000 이하입니다.
* scoville의 원소는 각각 0 이상 1,000,000 이하입니다.
* 모든 음식의 스코빌 지수를 K 이상으로 만들 수 없는 경우에는 -1을 return 합니다.

<br>

## 풀이

반복문 풀이

``` python
import heapq

def solution(scoville, K): # execute func
    heapq.heapify(scoville)
    cnt = 0
    for i in range(len(scoville)):
        i = 0        
        if scoville[i] >= K :
            break
        elif len(scoville) == 1:
            cnt = -1
        else:
            heapq.heappush(scoville, (heapq.heappop(scoville) + heapq.heappop(scoville) * 2))
            cnt += 1
    return cnt
```

<br>

재귀함수 풀이

``` python
import heapq
def mix(h_s, target, cnt, np): # mix func
    now_min = heapq.heappushpop(h_s, np)
    if now_min >= target : # is target
        return cnt
    elif len(h_s) < 1 : #  target
        return -1
    next_push = now_min + heapq.heappop(h_s) * 2 # mix
    cnt += 1
    return mix(h_s, target, cnt, next_push)

def solution(scoville, K): # execute func
    heapq.heapify(scoville)
    if scoville[0] < K : 
        now_push = heapq.heappop(scoville) + heapq.heappop(scoville) * 2    
        answer = mix(scoville, K, 1, now_push) # recursively mix from idx 0
    else:
        answer = 0
    return answer
```

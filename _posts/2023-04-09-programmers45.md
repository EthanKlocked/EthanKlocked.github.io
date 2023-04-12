---
layout: post
title: "프로그래머스 숫자 변환하기"
subtitle: "다이나믹프로그래밍 / 바텀업"
date: 2023-04-09 23:15:13 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

자연수 x를 y로 변환하려고 합니다. 사용할 수 있는 연산은 다음과 같습니다.

* x에 n을 더합니다
* x에 2를 곱합니다.
* x에 3을 곱합니다.

자연수 x, y, n이 매개변수로 주어질 때, x를 y로 변환하기 위해 필요한 최소 연산 횟수를 return하도록 solution 함수를 완성해주세요. 이때 x를 y로 만들 수 없다면 -1을 return 해주세요.

<br>

## 제한사항
* 1 ≤ x ≤ y ≤ 1,000,000
* 1 ≤ n < y

<br>

## 풀이

``` python
def solution(x, y, n):
    li = [1000001]*(y+1)
    li[x] = 0
    for i in range(1, y+1):
        if i-n > 0 : li[i] = min(li[i], li[i-n]+1)
        if i%2 == 0 : li[i] = min(li[i], li[int(i/2)]+1)
        if i%3 == 0 : li[i] = min(li[i], li[int(i/3)]+1)
    return li[y] if li[y] < 1000001 else -1
```

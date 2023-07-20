---
layout: post
title: "프로그래머스 두 원 사이의 정수 쌍"
subtitle: "완전탐색 / 구현"
date: 2023-07-19 14:20:42 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

x축과 y축으로 이루어진 2차원 직교 좌표계에 중심이 원점인 서로 다른 크기의 원이 두 개 주어집니다.   
반지름을 나타내는 두 정수 r1, r2가 매개변수로 주어질 때, 두 원 사이의 공간에 x좌표와 y좌표가 모두 정수인 점의 개수를 return하도록 solution 함수를 완성해주세요.
* 각 원 위의 점도 포함하여 셉니다.

<br>

## 제한사항
* 1 ≤ r1 < r2 ≤ 1,000,000

<br>

## 풀이

``` pythonimport math
def solution(r1, r2):
    cnt = 0
    for i in range(1, r2):
        top = math.ceil(math.sqrt(r2**2 - i**2))
        if math.sqrt(r2**2 - i**2).is_integer() : top += 1
        bottom = 0
        if i < r1 : bottom = math.ceil(math.sqrt(r1**2 - i**2))
        cnt += top - bottom
    return 4*(cnt+1)
```

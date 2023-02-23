---
layout: post
title: "프로그래머스 카드뭉치"
subtitle: "배열"
date: 2023-02-20 05:15:11 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
가로 길이가 Wcm, 세로 길이가 Hcm인 직사각형 종이가 있습니다. 종이에는 가로, 세로 방향과 평행하게 격자 형태로 선이 그어져 있으며, 모든 격자칸은 1cm x 1cm 크기입니다. 이 종이를 격자 선을 따라 1cm × 1cm의 정사각형으로 잘라 사용할 예정이었는데, 누군가가 이 종이를 대각선 꼭지점 2개를 잇는 방향으로 잘라 놓았습니다. 그러므로 현재 직사각형 종이는 크기가 같은 직각삼각형 2개로 나누어진 상태입니다. 새로운 종이를 구할 수 없는 상태이기 때문에, 이 종이에서 원래 종이의 가로, 세로 방향과 평행하게 1cm × 1cm로 잘라 사용할 수 있는 만큼만 사용하기로 하였습니다.
가로의 길이 W와 세로의 길이 H가 주어질 때, 사용할 수 있는 정사각형의 개수를 구하는 solution 함수를 완성해 주세요.
<br>

## 제한사항
* 1 ≤ cards1의 길이, cards2의 길이 ≤ 10
* 1 ≤ cards1[i]의 길이, cards2[i]의 길이 ≤ 10
* cards1과 cards2에는 서로 다른 단어만 존재합니다.
* 2 ≤ goal의 길이 ≤ cards1의 길이 + cards2의 길이
* 1 ≤ goal[i]의 길이 ≤ 10
* goal의 원소는 cards1과 cards2의 원소들로만 이루어져 있습니다.
* cards1, cards2, goal의 문자열들은 모두 알파벳 소문자로만 이루어져 있습니다.
<br>

## 풀이

``` python
def solution(cards1, cards2, goal):
    for c in goal:
        if cards1 and c == cards1[0]: cards1 = cards1[1:]
        elif cards2 and c == cards2[0]: cards2 = cards2[1:]
        else: return "No"
    return "Yes"
```

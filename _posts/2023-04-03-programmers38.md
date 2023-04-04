---
layout: post
title: "프로그래머스 과제진행하기"
subtitle: "스택 자료구조"
date: 2023-04-03 09:15:33 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

* 과제를 받은 루는 다음과 같은 순서대로 과제를 하려고 계획을 세웠습니다.
  * 과제는 시작하기로 한 시각이 되면 시작합니다.
  * 새로운 과제를 시작할 시각이 되었을 때, 기존에 진행 중이던 과제가 있다면 진행 중이던 과제를 멈추고 새로운 과제를 시작합니다.
  * 진행중이던 과제를 끝냈을 때, 잠시 멈춘 과제가 있다면, 멈춰둔 과제를 이어서 진행합니다.
    * 만약, 과제를 끝낸 시각에 새로 시작해야 되는 과제와 잠시 멈춰둔 과제가 모두 있다면, 새로 시작해야 하는 과제부터 진행합니다.
  * 멈춰둔 과제가 여러 개일 경우, 가장 최근에 멈춘 과제부터 시작합니다.
* 과제 계획을 담은 이차원 문자열 배열 plans가 매개변수로 주어질 때, 과제를 끝낸 순서대로 이름을 배열에 담아 return 하는 solution 함수를 완성해주세요.

<br>

## 제한사항
* 3 ≤ plans의 길이 ≤ 1,000
  * plans의 원소는 [name, start, playtime]의 구조로 이루어져 있습니다.
    * name : 과제의 이름을 의미합니다.
      * 2 ≤ name의 길이 ≤ 10
      * name은 알파벳 소문자로만 이루어져 있습니다.
      * name이 중복되는 원소는 없습니다.
    * start : 과제의 시작 시각을 나타냅니다.
      * "hh:mm"의 형태로 "00:00" ~ "23:59" 사이의 시간값만 들어가 있습니다.
      * 모든 과제의 시작 시각은 달라서 겹칠 일이 없습니다.
      * 과제는 "00:00" ... "23:59" 순으로 시작하면 됩니다. 즉, 시와 분의 값이 작을수록 더 빨리 시작한 과제입니다.
    * playtime : 과제를 마치는데 걸리는 시간을 의미하며, 단위는 분입니다.
      * 1 ≤ playtime ≤ 100
      * playtime은 0으로 시작하지 않습니다.
    * 배열은 시간순으로 정렬되어 있지 않을 수 있습니다.
* 진행중이던 과제가 끝나는 시각과 새로운 과제를 시작해야하는 시각이 같은 경우 진행중이던 과제는 끝난 것으로 판단합니다.

<br>

## 풀이

``` python
def solution(plans):
    answer = []
    stack = []
    plans.sort(key=lambda x:x[1])
    for i in range(len(plans)):
        if i == len(plans)-1:
            answer.append(plans[i][0])
            finalStack = [j[0] for j in stack]
            finalStack.reverse()
            if stack : answer += finalStack
            return answer
        n1 = 60*int(plans[i][1][0:2]) + int(plans[i][1][3:])
        n2 = 60*int(plans[i+1][1][0:2]) + int(plans[i+1][1][3:])
        gap = n2 - (n1 + int(plans[i][2]))
        if gap < 0 : stack.append((plans[i][0], gap))
        else:
            answer.append(plans[i][0])
            if gap > 0 : 
                while stack:
                    item = stack.pop()
                    offset = item[1] + gap
                    if offset > 0:
                        answer.append(item[0])        
                        gap = offset
                    else :                    
                        if offset < 0 : stack.append((item[0], offset))
                        if offset == 0 : answer.append(item[0])        
                        break
```

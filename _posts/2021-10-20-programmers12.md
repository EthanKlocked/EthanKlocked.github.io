---
layout: post
title: "프로그래머스 타겟넘버"
subtitle: "DFS, 깊이우선탐색"
date: 2021-10-20 11:09:31 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
n개의 음이 아닌 정수가 있습니다. 이 수를 적절히 더하거나 빼서 타겟 넘버를 만들려고 합니다. 예를 들어 [1, 1, 1, 1, 1]로 숫자 3을 만들려면 다음 다섯 방법을 쓸 수 있습니다.

-1+1+1+1+1 = 3   
+1-1+1+1+1 = 3   
+1+1-1+1+1 = 3   
+1+1+1-1+1 = 3   
+1+1+1+1-1 = 3   

사용할 수 있는 숫자가 담긴 배열 numbers, 타겟 넘버 target이 매개변수로 주어질 때 숫자를 적절히 더하고 빼서 타겟 넘버를 만드는 방법의 수를 return 하도록 solution 함수를 작성해주세요.



## 제한사항
* 주어지는 숫자의 개수는 2개 이상 20개 이하입니다.
* 각 숫자는 1 이상 50 이하인 자연수입니다.
* 타겟 넘버는 1 이상 1000 이하인 자연수입니다.

<br>

## 풀이

``` python
global cnt #global count
cnt = 0

def solution(numbers, target):
    graph = list([int(n), -int(n)] for n in numbers)
    search(0, graph, 0, target)
    answer = cnt
    return answer

def search(idx, gr, sum_chk, tar):
    if idx != len(gr)-1: # case : not the last
        for i in gr[idx]:
            new_sum = sum_chk
            new_sum += i
            search(idx+1, gr, new_sum, tar)
    else: # case : the last
        for i in gr[idx]:
            new_sum = sum_chk            
            new_sum += i
            if new_sum == tar:
                global cnt 
                cnt += 1
```
<br>

## 정석 풀이
``` python
answer = 0
def DFS(idx, numbers, target, value):
    global answer
    N = len(numbers)
    if(idx== N and target == value):
        answer += 1
        return
    if(idx == N):
        return

    DFS(idx+1,numbers,target,value+numbers[idx])
    DFS(idx+1,numbers,target,value-numbers[idx])
def solution(numbers, target):
    global answer
    DFS(0,numbers,target,0)
    return answer
```

---
layout: post
title: "프로그래머스 표현 가능한 이진트리"
subtitle: "다이나믹프로그래밍/탑다운/1의 보수"
date: 2023-02-24 09:12:05 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
당신은 이진트리를 수로 표현하는 것을 좋아합니다.

이진트리를 수로 표현하는 방법은 다음과 같습니다.

이진수를 저장할 빈 문자열을 생성합니다.
주어진 이진트리에 더미 노드를 추가하여 포화 이진트리로 만듭니다. 루트 노드는 그대로 유지합니다.
만들어진 포화 이진트리의 노드들을 가장 왼쪽 노드부터 가장 오른쪽 노드까지, 왼쪽에 있는 순서대로 살펴봅니다. 노드의 높이는 살펴보는 순서에 영향을 끼치지 않습니다.
살펴본 노드가 더미 노드라면, 문자열 뒤에 0을 추가합니다. 살펴본 노드가 더미 노드가 아니라면, 문자열 뒤에 1을 추가합니다.
문자열에 저장된 이진수를 십진수로 변환합니다.
이진트리에서 리프 노드가 아닌 노드는 자신의 왼쪽 자식이 루트인 서브트리의 노드들보다 오른쪽에 있으며, 자신의 오른쪽 자식이 루트인 서브트리의 노드들보다 왼쪽에 있다고 가정합니다.
<br>

## 제한사항

* 1 ≤ numbers의 길이 ≤ 10,000
* 1 ≤ numbers의 원소 ≤ 10^15
<br>

## 풀이

``` python
memo = {}

def binaryCheck(target):
    if len(target) == 1: return True
    #memo check
    if target in memo: return memo[target]
    #divide
    mid = len(target)//2
    front = target[:mid]
    rear = target[mid+1:]    
    #end check
    if target[mid] == "0" and (front[len(front)//2] == "1" or rear[len(rear)//2] == "1"): return False
    if len(target) == 3: return True
    #return: recursive
    frontChk = binaryCheck(front) 
    rearChk = binaryCheck(rear)
    if not front in memo: memo[front] = frontChk
    if not rear in memo: memo[rear] = rearChk
    return frontChk and rearChk;

def solution(numbers):
    answer = []
    for i in numbers:
        num = bin(i)[2:]
        zeroSupply = ~len(num) & ((1 << len(bin(len(num))[2:])) - 1)
        target = "0"*zeroSupply+num
        answer.append(1 if binaryCheck(target) else 0)   
    return answer
```

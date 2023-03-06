---
layout: post
title: "프로그래머스 표현 가능한 이진트리"
subtitle: "다이나믹프로그래밍/탑다운/1의 보수"
date: 2023-03-03 18:35:01 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

트리의 모든 간선은 부모 노드가 자식 노드를 가리키는 단방향 간선입니다.
모든 부모 노드는 자식 노드와 연결된 간선 중 하나를 길로 설정합니다.
실선 화살표는 길인 간선입니다.
점선 화살표는 길이 아닌 간선입니다.
모든 부모 노드는 자신의 자식 노드 중 가장 번호가 작은 노드를 가리키는 간선을 초기 길로 설정합니다.
[게임의 규칙]은 아래와 같습니다.

1번 노드(루트 노드)에 숫자 1, 2, 3 중 하나를 떨어트립니다.
숫자는 길인 간선을 따라 리프 노드까지 떨어집니다.
숫자가 리프 노드에 도착하면, 숫자가 지나간 각 노드는 현재 길로 연결된 자식 노드 다음으로 번호가 큰 자식 노드를 가리키는 간선을 새로운 길로 설정하고 기존의 길은 끊습니다.
만약 현재 길로 연결된 노드의 번호가 가장 크면, 번호가 가장 작은 노드를 가리키는 간선을 길로 설정합니다.
노드의 간선이 하나라면 계속 하나의 간선을 길로 설정합니다.
원하는 만큼 계속해서 루트 노드에 숫자를 떨어트릴 수 있습니다.
단, 앞서 떨어트린 숫자가 리프 노드까지 떨어진 후에 새로운 숫자를 떨어트려야 합니다.
[게임의 목표]는 각각의 리프 노드에 쌓인 숫자의 합을 target에서 가리키는 값과 같게 만드는 것입니다.

트리의 각 노드들의 연결 관계를 담은 2차원 정수 배열 edges, 각 노드별로 만들어야 하는 숫자의 합을 담은 1차원 정수 배열 target이 매개변수로 주어집니다. 
이때, target 대로 리프 노드에 쌓인 숫자의 합을 맞추기 위해 숫자를 떨어트리는 모든 경우 중 가장 적은 숫자를 사용하며 그중 사전 순으로 가장 빠른 경우를 1차원 정수 배열에 담아 return 하도록 solution 함수를 완성해주세요. 
만약, target대로 숫자의 합을 만들 수 없는 경우 [-1]을 return 해주세요.
<br>

## 제한사항

1. 1 ≤ edges의 길이 ≤ 100
  * edges[i]는 [부모 노드 번호, 자식 노드 번호] 형태로, 단방향으로 연결된 두 노드를 나타냅니다.
  * 1 ≤ 노드 번호 ≤ edges의 길이 + 1
  * 동일한 간선에 대한 정보가 중복해서 주어지지 않습니다.
  * 항상 하나의 트리 형태로 입력이 주어지며, 잘못된 데이터가 주어지는 경우는 없습니다.
  * 1번 노드는 항상 루트 노드입니다.
2. target의 길이 = edges의 길이 + 1
  * target[i]는 i + 1번 노드에 쌓인 숫자의 합으로 만들어야 하는 수를 나타냅니다.
  * 0 ≤ 리프 노드의 target값 ≤ 100
  * 리프 노드를 제외한 노드의 target값 = 0
  * target의 원소의 합은 1 이상입니다.
<br>

## 풀이

``` python
from collections import deque

level = {}
visitChk = {}
number = [3,2,1]

def nodeSrch(l): 
    if not l in level: return l
    next = level[l].popleft()
    level[l].append(next)
    return nodeSrch(next)

def divideChk(arr):
    chkOrder = [2,3]
    for c in chkOrder:
        if c in arr: 
            arr[arr.index(c)] = 1
            return c-1
    return False        
    
def solution(edges, target): 
    answer = []
    edges.sort()
    for i in edges :
        if not i[0] in level : level[i[0]] = deque([])
        level[i[0]].append(i[1])
    while any(target) : 
        endPoint = nodeSrch(1)-1
        maxPoint = 0
        answer.append(endPoint)
        for j in number:
            if target[endPoint] >= j: 
                maxPoint = j    
                break
        target[endPoint] = target[endPoint] - maxPoint
        if not endPoint in visitChk:
            if maxPoint == 0 : return [-1]
            visitChk[endPoint] = [maxPoint]
        else:
            if maxPoint == 0:
                maxPoint = divideChk(visitChk[endPoint])
                if not maxPoint : return [-1]
            visitChk[endPoint].append(maxPoint)
    for l in range(len(answer)):
        minValue = min(visitChk[answer[l]])
        visitChk[answer[l]].remove(minValue)
        answer[l] = minValue
    return answer
```

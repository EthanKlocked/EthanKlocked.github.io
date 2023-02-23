---
layout: post
title: "프로그래머스 미로탈출"
subtitle: "bfs / 넓이우선탐색"
date: 2023-02-21 15:12:05 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
1 x 1 크기의 칸들로 이루어진 직사각형 격자 형태의 미로에서 탈출하려고 합니다. 각 칸은 통로 또는 벽으로 구성되어 있으며, 벽으로 된 칸은 지나갈 수 없고 통로로 된 칸으로만 이동할 수 있습니다. 통로들 중 한 칸에는 미로를 빠져나가는 문이 있는데, 이 문은 레버를 당겨서만 열 수 있습니다. 레버 또한 통로들 중 한 칸에 있습니다. 따라서, 출발 지점에서 먼저 레버가 있는 칸으로 이동하여 레버를 당긴 후 미로를 빠져나가는 문이 있는 칸으로 이동하면 됩니다. 이때 아직 레버를 당기지 않았더라도 출구가 있는 칸을 지나갈 수 있습니다. 미로에서 한 칸을 이동하는데 1초가 걸린다고 할 때, 최대한 빠르게 미로를 빠져나가는데 걸리는 시간을 구하려 합니다.

미로를 나타낸 문자열 배열 maps가 매개변수로 주어질 때, 미로를 탈출하는데 필요한 최소 시간을 return 하는 solution 함수를 완성해주세요. 만약, 탈출할 수 없다면 -1을 return 해주세요.
<br>

## 제한사항
* 5 ≤ maps의 길이 ≤ 100
* 5 ≤ maps[i]의 길이 ≤ 100
* maps[i]는 다음 5개의 문자들로만 이루어져 있습니다.
    S : 시작 지점
    E : 출구
    L : 레버
    O : 통로
    X : 벽
* 시작 지점과 출구, 레버는 항상 다른 곳에 존재하며 한 개씩만 존재합니다.
* 출구는 레버가 당겨지지 않아도 지나갈 수 있으며, 모든 통로, 출구, 레버, 시작점은 여러 번 지나갈 수 있습니다.
<br>

## 풀이

``` python
from collections import deque 

def bfs(start, target, md):
    moveset = [(0,1),(1,0),(0,-1),(-1,0)]
    mc = {(i,j):-1 for i in range(len(md)) for j in range(len(md[0]))}
    mc[start] = 0
    dq = deque([start])
    while dq:
        p = dq.popleft()
        if p == target: return mc[p]
        for m in moveset:
            y, x = p[0]+m[0], p[1]+m[1]
            if not (0 <= y < len(md) and 0 <= x < len(md[0]) and md[y][x] != "X" and mc[y,x] == -1): continue
            mc[y,x] = mc[p]+1
            dq.append((y,x))
    return -1

def solution(maps):
    s, l, e = None, None, None
    for i, row in enumerate(maps):
        if "S" in row: s = (i, row.index("S"))
        if "L" in row: l = (i, row.index("L"))
        if "E" in row: e = (i, row.index("E"))
    sl = bfs(s, l, maps)
    le = bfs(l, e, maps)
    return sl+le if sl != -1 and le != -1 else -1
```

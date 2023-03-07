---
layout: post
title: "프로그래머스 혼자서 하는 틱택토"
subtitle: "set/집합/완전탐색"
date: 2023-03-06 11:13:30 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

틱택토는 두 사람이 하는 게임으로 처음에 3x3의 빈칸으로 이루어진 게임판에 선공이 "O", 후공이 "X"를 번갈아가면서 빈칸에 표시하는 게임입니다. 가로, 세로, 대각선으로 3개가 같은 표시가 만들어지면 같은 표시를 만든 사람이 승리하고 게임이 종료되며 9칸이 모두 차서 더 이상 표시를 할 수 없는 경우에는 무승부로 게임이 종료됩니다.

할 일이 없어 한가한 머쓱이는 두 사람이 하는 게임인 틱택토를 다음과 같이 혼자서 하려고 합니다.

* 혼자서 선공과 후공을 둘 다 맡는다.
* 틱택토 게임을 시작한 후 "O"와 "X"를 혼자서 번갈아 가면서 표시를 하면서 진행한다.

틱택토는 단순한 규칙으로 게임이 금방 끝나기에 머쓱이는 한 게임이 종료되면 다시 3x3 빈칸을 그린 뒤 다시 게임을 반복했습니다. 그렇게 틱택토 수 십 판을 했더니 머쓱이는 게임 도중에 다음과 같이 규칙을 어기는 실수를 했을 수도 있습니다.

* "O"를 표시할 차례인데 "X"를 표시하거나 반대로 "X"를 표시할 차례인데 "O"를 표시한다.
* 선공이나 후공이 승리해서 게임이 종료되었음에도 그 게임을 진행한다.

게임 도중 게임판을 본 어느 순간 머쓱이는 본인이 실수를 했는지 의문이 생겼습니다. 혼자서 틱택토를 했기에 게임하는 과정을 지켜본 사람이 없어 이를 알 수는 없습니다. 그러나 게임판만 봤을 때 실제로 틱택토 규칙을 지켜서 진행했을 때 나올 수 있는 상황인지는 판단할 수 있을 것 같고 문제가 없다면 게임을 이어서 하려고 합니다.

머쓱이가 혼자서 게임을 진행하다 의문이 생긴 틱택토 게임판의 정보를 담고 있는 문자열 배열 board가 매개변수로 주어질 때, 이 게임판이 규칙을 지켜서 틱택토를 진행했을 때 나올 수 있는 게임 상황이면 1을 아니라면 0을 return 하는 solution 함수를 작성해 주세요.


<br>

## 제한사항
1. board의 길이 = board[i]의 길이 = 3
   * board의 원소는 모두 "O", "X", "."으로만 이루어져 있습니다.
2. board[i][j]는 i + 1행 j + 1열에 해당하는 칸의 상태를 나타냅니다.
   * "."은 빈칸을, "O"와 "X"는 해당 문자로 칸이 표시되어 있다는 의미입니다.

<br>

## 풀이

``` python
def solution(board):    
    oSet = set([(i, j) for i, row in enumerate(board) for j, char in enumerate(row) if char == "O"])
    xSet = set([(i, j) for i, row in enumerate(board) for j, char in enumerate(row) if char == "X"])
    winList = [set([(0, 0),(1, 1),(2, 2)]), set([(0, 2),(1, 1),(2, 0)])]
    for i in range(3):
        winList.append(set([(i, j) for j in range(3)]))
        winList.append(set([(j, i) for j in range(3)]))
    def check(o, x):
        ol = len(o)
        xl = len(x)
        if ol < xl : return 0
        if ol - xl > 1: return 0
        for i in winList:
            if (o and i-o == set()) and ol == xl: return 0
            if (x and i-x == set()) and ol > xl: return 0            
        return 1
    return check(oSet, xSet)
```

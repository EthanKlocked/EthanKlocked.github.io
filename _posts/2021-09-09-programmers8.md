---
layout: post
title: "프로그래머스 복서정렬"
subtitle: "퀵정렬 "
date: 2021-09-09 16:24:11 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
복서 선수들의 몸무게 weights와, 복서 선수들의 전적을 나타내는 head2head가 매개변수로 주어집니다. 복서 선수들의 번호를 다음과 같은 순서로 정렬한 후 return 하도록 solution 함수를 완성해주세요.

전체 승률이 높은 복서의 번호가 앞쪽으로 갑니다. 아직 다른 복서랑 붙어본 적이 없는 복서의 승률은 0%로 취급합니다.
승률이 동일한 복서의 번호들 중에서는 자신보다 몸무게가 무거운 복서를 이긴 횟수가 많은 복서의 번호가 앞쪽으로 갑니다.
자신보다 무거운 복서를 이긴 횟수까지 동일한 복서의 번호들 중에서는 자기 몸무게가 무거운 복서의 번호가 앞쪽으로 갑니다.
자기 몸무게까지 동일한 복서의 번호들 중에서는 작은 번호가 앞쪽으로 갑니다.

## 제한사항
* weights의 길이는 2 이상 1,000 이하입니다.
  * weights의 모든 값은 45 이상 150 이하의 정수입니다.
  * weights[i] 는 i+1번 복서의 몸무게(kg)를 의미합니다.
* head2head의 길이는 weights의 길이와 같습니다.
  * head2head의 모든 문자열은 길이가 weights의 길이와 동일하며, 'N', 'W', 'L'로 이루어진 문자열입니다.
  * head2head[i] 는 i+1번 복서의 전적을 의미하며, head2head[i][j]는 i+1번 복서와 j+1번 복서의 매치 결과를 의미합니다.
    * 'N' (None)은 두 복서가 아직 붙어본 적이 없음을 의미합니다.
    * 'W' (Win)는 i+1번 복서가 j+1번 복서를 이겼음을 의미합니다.
    * 'L' (Lose)는 i+1번 복사가 j+1번 복서에게 졌음을 의미합니다.
  * 임의의 i에 대해서 head2head[i][i] 는 항상 'N'입니다. 자기 자신과 싸울 수는 없기 때문입니다.
  * 임의의 i, j에 대해서 head2head[i][j] = 'W' 이면, head2head[j][i] = 'L'입니다.
  * 임의의 i, j에 대해서 head2head[i][j] = 'L' 이면, head2head[j][i] = 'W'입니다.
  * 임의의 i, j에 대해서 head2head[i][j] = 'N' 이면, head2head[j][i] = 'N'입니다.

<br>

## 풀이

``` python
def solution(weights, head2head):
    num = list(range(1,len(head2head)+1)) #1234
    answer = quick_sort(num, weights, head2head)
    return answer

def quick_sort(n,w,h):
    if len(n) <= 1:
        return n
    piv = n[len(n) // 2]-1
    pre_arr, mid_arr, aft_arr = [],[],[]
    piv_win = h[piv].count('W')
    piv_battle = len(h[piv])-h[piv].count('N')
    if piv_battle == 0:
        piv_per = 0
    else:
        piv_per = piv_win / piv_battle
    pivBig_cnt = 0
    for l in range(len(h[piv])):
        if h[piv][l] == 'W':
            if w[piv] < w[l]:
                pivBig_cnt += 1
    for no in n:
        win = h[no-1].count('W')        
        battle = len(h[no-1])-h[no-1].count('N')        
        if battle == 0:
            per = 0
        else:
            per = win/battle
        if piv_per > per:
            aft_arr.append(no)
        elif piv_per < per:
            pre_arr.append(no)
        elif piv_per == per:
            nowBig_cnt = 0
            for l in range(len(h[no-1])):
                if h[no-1][l] == 'W':
                    if w[no-1] < w[l]:
                        nowBig_cnt += 1            
            if nowBig_cnt > pivBig_cnt:
                pre_arr.append(no)
            elif nowBig_cnt < pivBig_cnt:
                aft_arr.append(no)
            elif nowBig_cnt == pivBig_cnt:
                if w[piv] > w[no-1]:
                    aft_arr.append(no)
                elif w[piv] < w[no-1]:
                    pre_arr.append(no)
                elif w[piv] == w[no-1]:
                    if piv > no-1:
                        pre_arr.append(no)
                    elif piv < no-1:
                        aft_arr.append(no)
                    elif piv == no-1:
                        mid_arr.append(no)
    return quick_sort(pre_arr,w,h) + mid_arr + quick_sort(aft_arr,w,h)
```

---
layout: post
title: "프로그래머스 호텔 대실"
subtitle: "구현 / 완전탐색"
date: 2023-03-07 21:15:30 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

호텔을 운영 중인 코니는 최소한의 객실만을 사용하여 예약 손님들을 받으려고 합니다. 한 번 사용한 객실은 퇴실 시간을 기준으로 10분간 청소를 하고 다음 손님들이 사용할 수 있습니다.
예약 시각이 문자열 형태로 담긴 2차원 배열 book_time이 매개변수로 주어질 때, 코니에게 필요한 최소 객실의 수를 return 하는 solution 함수를 완성해주세요.

<br>

## 제한사항
* 1 ≤ book_time의 길이 ≤ 1,000
  * book_time[i]는 ["HH:MM", "HH:MM"]의 형태로 이루어진 배열입니다
    * [대실 시작 시각, 대실 종료 시각] 형태입니다.
* 시각은 HH:MM 형태로 24시간 표기법을 따르며, "00:00" 부터 "23:59" 까지로 주어집니다.
  * 예약 시각이 자정을 넘어가는 경우는 없습니다.
  * 시작 시각은 항상 종료 시각보다 빠릅니다.

<br>

## 풀이

``` python
def solution(book_time):
    rooms = []
    book_time.sort()
    for i in book_time:
        f = 60*int(i[0][0:2]) + int(i[0][3:5])
        b = 60*int(i[1][0:2]) + int(i[1][3:5])
        if not rooms : rooms.append([(f, b)])
        else :
            for idx, r in enumerate(rooms):
                c = True
                for t in r :
                    if not(t[1] + 10 <= f): 
                        c = False
                        break
                if c : 
                    r.append((f, b))
                    break
                elif idx == len(rooms)-1: 
                    rooms.append([(f, b)])
                    break
    return len(rooms)
```

## 참고 (다른 풀이)
* 00:00~23:59분을 분단위로 나눈 길이의 0 초기화 배열을 만듦
* 스케줄 테이블을 순회하며 각 스케줄을 분단위로 나누어 [0,0,0...] 테이블에 카운트 업
* 카운트 업된 테이블 내 최대값이 겹치는 횟수이므로 필요한 최소 방의 개수

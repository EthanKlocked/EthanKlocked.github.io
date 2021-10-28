---
layout: post
title: "프로그래머스 추석트래픽 KAKAO"
subtitle: "탐욕법, Greedy"
date: 2021-10-13 10:28:13 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제
이번 추석에도 시스템 장애가 없는 명절을 보내고 싶은 어피치는 서버를 증설해야 할지 고민이다. 장애 대비용 서버 증설 여부를 결정하기 위해 작년 추석 기간인 9월 15일 로그 데이터를 분석한 후 초당 최대 처리량을 계산해보기로 했다. 초당 최대 처리량은 요청의 응답 완료 여부에 관계없이 임의 시간부터 1초(=1,000밀리초)간 처리하는 요청의 최대 개수를 의미한다.

## 제한사항
* solution 함수에 전달되는 lines 배열은 N(1 ≦ N ≦ 2,000)개의 로그 문자열로 되어 있으며, 각 로그 문자열마다 요청에 대한 응답완료시간 S와 처리시간 T가 공백으로 구분되어 있다.
* 응답완료시간 S는 작년 추석인 2016년 9월 15일만 포함하여 고정 길이 2016-09-15 hh:mm:ss.sss 형식으로 되어 있다.
* 처리시간 T는 0.1s, 0.312s, 2s 와 같이 최대 소수점 셋째 자리까지 기록하며 뒤에는 초 단위를 의미하는 s로 끝난다.
* 예를 들어, 로그 문자열 2016-09-15 03:10:33.020 0.011s은 "2016년 9월 15일 오전 3시 10분 33.010초"부터 "2016년 9월 15일 오전 3시 10분 33.020초"까지 "0.011초" 동안 처리된 요청을 의미한다. (처리시간은 시작시간과 끝시간을 포함)
* 서버에는 타임아웃이 3초로 적용되어 있기 때문에 처리시간은 0.001 ≦ T ≦ 3.000이다.
* lines 배열은 응답완료시간 S를 기준으로 오름차순 정렬되어 있다. 


## 풀이

``` python
def solution(lines):
    # 1. Only one data
    if len(lines) == 1:
        return 1

    # 2. more than one
    ## (1) raw data -> milli data
    milli_box = []
    for i in lines:
        hours = int(i[11:13])
        mins = int(i[14:16])
        secs = int(i[17:19])
        millisecs = int(i[20:23])

        end_point = ((hours*60*60) + (mins*60) + (secs)) * 1000 + millisecs

        delay = int(i[24:25])*1000
        if i[25:26] != 's':
            delay += int(i[26:27])*100
            if i[27:28] != 's':
                delay += int(i[27:28])*10
                if i[28:29] != 's':
                    delay += int(i[28:29])

        start_point = end_point - delay + 1

        milli_box.append((start_point, end_point))

    ## (2) SEARCH & CNT : ONLY (start_point[SEARCH]) is equal to end_point of the data
    total_cnt = 1

    for k in range(len(milli_box)-1):
        front_sec = milli_box[k][1] #start point [SEARCH]
        end_sec = front_sec+999 #end point [SEARCH]
        now_cnt = 1
        for k2 in range(k+1, len(milli_box)):
            now_front = milli_box[k2][0] #start point [data] 
            if (now_front <= end_sec):
                now_cnt += 1
        if now_cnt > total_cnt:
            total_cnt = now_cnt

    return total_cnt
```

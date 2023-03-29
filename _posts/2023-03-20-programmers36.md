---
layout: post
title: "프로그래머스 뒤에 있는 큰 수 찾기"
subtitle: "stack / 트리구조"
date: 2023-03-20 21:15:34 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
## 문제

정수로 이루어진 배열 numbers가 있습니다. 배열 의 각 원소들에 대해 자신보다 뒤에 있는 숫자 중에서 자신보다 크면서 가장 가까이 있는 수를 뒷 큰수라고 합니다.
정수 배열 numbers가 매개변수로 주어질 때, 모든 원소에 대한 뒷 큰수들을 차례로 담은 배열을 return 하도록 solution 함수를 완성해주세요. 단, 뒷 큰수가 존재하지 않는 원소는 -1을 담습니다.

<br>

## 제한사항
* 4 ≤ numbers의 길이 ≤ 1,000,000
* 1 ≤ numbers[i] ≤ 1,000,000

<br>

## 풀이

``` python
def solution(numbers):
    answer = []
    numbers.reverse()
    for i in range(len(numbers)):
        if i == 0 : addNum = (-1, 0)
        elif numbers[i] < numbers[i-1] : addNum = (numbers[i-1], i-1)
        elif numbers[i] > numbers[i-1] : 
            chkIndex = i-1
            while True:
                chkValue = answer[chkIndex][0]
                if chkValue == -1:
                    addNum = (-1, 0)
                    break
                elif numbers[i] < chkValue :
                    addNum = (chkValue, answer[chkIndex][1])
                    break
                else: chkIndex = answer[chkIndex][1]
        answer.append(addNum)
    answer.reverse()
    return [x[0] for x in answer]
```

## 프로세스 설명
* 반복문 중첩하여 두번 돌릴 경우 O(N^2) 실패
* numbers 리스트를 역으로 순회
* 현재 index의 숫자가 바로 전 index숫자보다 큰 경우 전 index부터 연결되는 tree(튜플 두번째 숫자가 부모 index)를 따라서 탐색
* 정답 리스트의 튜플 해제

<br>

## 정석풀이

``` python
def solution(numbers):
    stack = []
    result = [-1] * len(numbers)
    for i in range(len(numbers)):
        while stack and numbers[stack[-1]] < numbers[i]:
            result[stack.pop()] = numbers[i]

        stack.append(i)

    return result
```

<br>

## 프로세스 설명
* stack 방식으로 후입 선출 프로세스 진행
* numbers 리스트를 0부터 순회하며 각 index를 stack에 입력
* 매 index 탐색 시 해당 index의 값이 stack 마지막 값보다 큰 경우 차례대로 stack에서 꺼내 해당 index값을 해당 값으로 치환
* O(2N)으로 해결 가능

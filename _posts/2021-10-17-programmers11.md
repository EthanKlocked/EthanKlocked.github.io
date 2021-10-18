---
layout: post
title: "프로그래머스 KAKAO ID추천"
subtitle: "정규식"
date: 2021-10-17 13:14:10 -0400
background: '/img/posts/cube.jpeg'
tags: [code, python]
---
# 문제
카카오에 입사한 신입 개발자 네오는 "카카오계정개발팀"에 배치되어, 카카오 서비스에 가입하는 유저들의 아이디를 생성하는 업무를 담당하게 되었습니다. "네오"에게 주어진 첫 업무는 새로 가입하는 유저들이 카카오 아이디 규칙에 맞지 않는 아이디를 입력했을 때, 입력된 아이디와 유사하면서 규칙에 맞는 아이디를 추천해주는 프로그램을 개발하는 것입니다.
다음은 카카오 아이디의 규칙입니다.



# 제한사항
* 1단계 new_id의 모든 대문자를 대응되는 소문자로 치환합니다.
* 2단계 new_id에서 알파벳 소문자, 숫자, 빼기(-), 밑줄(_), 마침표(.)를 제외한 모든 문자를 제거합니다.
* 3단계 new_id에서 마침표(.)가 2번 이상 연속된 부분을 하나의 마침표(.)로 치환합니다.
* 4단계 new_id에서 마침표(.)가 처음이나 끝에 위치한다면 제거합니다.
* 5단계 new_id가 빈 문자열이라면, new_id에 "a"를 대입합니다.
* 6단계 new_id의 길이가 16자 이상이면, new_id의 첫 15개의 문자를 제외한 나머지 문자들을 모두 제거합니다.
     만약 제거 후 마침표(.)가 new_id의 끝에 위치한다면 끝에 위치한 마침표(.) 문자를 제거합니다.
* 7단계 new_id의 길이가 2자 이하라면, new_id의 마지막 문자를 new_id의 길이가 3이 될 때까지 반복해서 끝에 붙입니다.


# 풀이

``` python
def solution(new_id):
    # 1단계
    filtered_id = new_id.lower()
    
    # 2단계    
    special_char = '~!@#$%^&*()=+[{]}:?,<>/'
    filtered_id = ''.join(c for c in filtered_id if c not in special_char)
    if len(filtered_id) == 0: 
        return 'aaa'
    
    # 3단계
    filtered_id = list(filtered_id)
    for l in range(len(filtered_id)):        
        if (l == len(filtered_id)-1):
            break
        if(filtered_id[l] == '.' and filtered_id[l+1] == '.'):
            filtered_id[l] = ''
    filtered_id = ''.join(filtered_id)
    
    # 4단계
    if filtered_id[0] == '.':
        if len(filtered_id) == 1:
            return 'aaa'
        filtered_id = filtered_id[1:]    
    if filtered_id[-1] == '.':
        filtered_id = filtered_id[:-1]
        
    # 6단계
    if len(filtered_id) >= 16:
        filtered_id = filtered_id[:15]
        if filtered_id[-1] == '.':
            filtered_id = filtered_id[:14]
            
    #7단계
    if len(filtered_id) == 1:    
        filtered_id = filtered_id + filtered_id[0] + filtered_id[0]
    if len(filtered_id) == 2:    
        filtered_id = filtered_id + filtered_id[1]
        
    return filtered_id
```

# 정규식 참고
``` python
import re

def solution(new_id):
    st = new_id
    st = st.lower()
    st = re.sub('[^a-z0-9\-_.]', '', st)
    st = re.sub('\.+', '.', st)
    st = re.sub('^[.]|[.]$', '', st)
    st = 'a' if len(st) == 0 else st[:15]
    st = re.sub('^[.]|[.]$', '', st)
    st = st if len(st) > 2 else st + "".join([st[-1] for i in range(3-len(st))])
    return st
```

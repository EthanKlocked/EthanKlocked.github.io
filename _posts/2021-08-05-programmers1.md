---
layout: post
title: "프로그래머스 체육복"
subtitle: "탐욕법(Greedy)"
date: 2021-08-05 19:45:13 -0400
background: '/img/posts/cube.jpeg'
tags: [code, javascript]
---
# 문제
점심시간에 도둑이 들어, 일부 학생이 체육복을 도난당했습니다. 다행히 여벌 체육복이 있는 학생이 이들에게 체육복을 빌려주려 합니다. 학생들의 번호는 체격 순으로 매겨져 있어, 바로 앞번호의 학생이나 바로 뒷번호의 학생에게만 체육복을 빌려줄 수 있습니다. 예를 들어, 4번 학생은 3번 학생이나 5번 학생에게만 체육복을 빌려줄 수 있습니다. 체육복이 없으면 수업을 들을 수 없기 때문에 체육복을 적절히 빌려 최대한 많은 학생이 체육수업을 들어야 합니다.

전체 학생의 수 n, 체육복을 도난당한 학생들의 번호가 담긴 배열 lost, 여벌의 체육복을 가져온 학생들의 번호가 담긴 배열 reserve가 매개변수로 주어질 때, 체육수업을 들을 수 있는 학생의 최댓값을 return 하도록 solution 함수를 작성해주세요.

# 제한사항
* 전체 학생의 수는 2명 이상 30명 이하입니다.
* 체육복을 도난당한 학생의 수는 1명 이상 n명 이하이고 중복되는 번호는 없습니다.
* 여벌의 체육복을 가져온 학생의 수는 1명 이상 n명 이하이고 중복되는 번호는 없습니다.
* 여벌 체육복이 있는 학생만 다른 학생에게 체육복을 빌려줄 수 있습니다.
* 여벌 체육복을 가져온 학생이 체육복을 도난당했을 수 있습니다. 이때 이 학생은 체육복을 하나만 도난당했다고 가정하며, 남은 체육복이 하나이기에 다른 학생에게는 체육복을 빌려줄 수 없습니다.

<br>

# 풀이

``` javascript
function solution(n, lost, reserve) {
	// 차집합을 통한 중복 제거
    let re_lost = lost.filter(x => !reserve.includes(x)).sort(); 
    let re_reserve = reserve.filter(x => !lost.includes(x)).sort();

	// 체육수업 참가 가능자 최소값
    let normal = n - re_lost.length;

	// + 탐색
    re_lost.forEach((n, i) =>{ // 분실자 명단 순회
        let chk = 0;                    
        re_reserve.forEach((n2,i2) => { // 여벌 보유자 명단 순회
            if(chk == 0){
                let chk_num = Math.floor((n+n2)/2); // 인접 번호 체크
                if(chk_num === n || chk_num === n2){
                    chk = 1;                                    
                    normal += 1; // 참가 가능자 +1
                    re_reserve.splice(i2,1); // 여벌 보유자 제외
                }            
            }
        });
    });
    return normal;
}  
```

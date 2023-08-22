---
layout: post
title: "useQuery 정리"
subtitle: "useQuery / hook"
date: 2023-08-05 13:55:23 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 유용성
* 서버데이터의 전역관리 및 캐시데이터를 사용한 렌더링/request 최소화

<br>

### basic 사용법
1. 최상위 queryClinet 작성 (staletime, cachetime default 조정 가능)
2. useQuery -> 비동기 프로세스를 통한 key에 data 할당
3. queryClient.invalidateQueries(key) -> key의 data상태를 stale 하도록 변경
4. useMutation -> 데이터 변경을 위한 Promise 호출 후 결과에 따라 원하는 key에 invalidateQuery 진행

<br>

### hook을 통해 코드 전역적으로 사용 테스트 (data에 따라 hook분리)

##### get Data
``` javascript
//------------------------------ MODULE --------------------------------
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib';

//----------------------------- FUNCTION -------------------------------
export default function useUser(errorCallback = () => {}){
    //init
    const queryClient = useQueryClient();
    const queryKey = 'user';
    const queryUrl = '/user/me';
    const headers = {"Authorization" : "access"};

    //query
    const userData = useQuery(
        [queryKey], 
        () => apiCall.get(queryUrl, {headers}).then(( res ) => {
            if(res.data.result == "000") return res.data.data;
            else {
                errorCallback();
                console.log(`-------${queryKey}--------`);
                console.log(res.data.result);
                return null;
            }
        }),
    );

    //function
    const update = () => queryClient.invalidateQueries([queryKey]);

    //return
    return [userData.data, update];
}
```

##### UPDATE POST DELETE DATA

``` javascript
//------------------------------ MODULE --------------------------------
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiCall } from '@/lib';

//----------------------------- FUNCTION -------------------------------
export default function useUserMutate(){
    //init
    const queryClient = useQueryClient();
    const queryKey = 'user';
    const queryUrl = '/user';
    const headers = {"Authorization" : "access"};

    //query
    const mutation = useMutation({
        mutationFn : ({ type=null, params={} }) => {
            if(type == "add") return apiCall.put(queryUrl, {...params});
            if(type == "modify") return apiCall.post(`${queryUrl}/me`, {...params}, {headers});
            if(type == "remove") return apiCall.delete(`${queryUrl}/me`, {headers});
        },
        onSuccess: (res) => {
            if(res.data.result == "000"){
                queryClient.invalidateQueries({ queryKey: [queryKey] }); // Invalidate and refetch
            }else{
                console.log(`-------${queryKey}--------`);
                console.log(res.data.result);
            }
        }
    })

    //return
    return mutation;
}
```
<br>

### 구동특징 (테스트 진행 결과)
1. key데이터의 staleTime
      1) 초과한 경우 컴포넌트 함수 재실행에 의한 useQuery 실행 시 내부 쿼리함수 실행
      2) 초과하지 않은 경우 내부 쿼리함수 실행 없이 cache데이터 사용
2. key데이터의 cacheTime
      1) 초과한 경우에도 데이터 구독중인 컴포넌트 내에서는 여전히 cache 사용 가능
3. key데이터 invalidateQuery (stale화) 진행직후 1회 구독 중인 컴포넌트 함수 재실행 발생
4. 쿼리 재실행 로직이 진행되더라도 key에 할당된 데이터(including obj, arr)에 변경점이 없다면 data변경 없음으로 판단(로컬로 진행하였기 때문에 추후 서버데이터 변경에 따른 추가 테스트 필요)


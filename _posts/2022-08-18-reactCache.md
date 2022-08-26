---
layout: post
title: "React Page Cache"
subtitle: "react-router-dom cache"
date: 2022-08-18 15:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 기본 프로세스 
* 상품 정보 출력
1. 카테고리 진입 시 상품정보 출력
2. 스크롤 최하단 진입 시 상품 추가 출력
3. 상품 영역 클릭시 상품 상세보기 이동

<br>

### 개선방안
* 기존방식 
    1. 카테고리 변경 시 무조건 초기상태로 리로드
    2. 상품 상세보기 후 뒤로가기로 돌아온 경우도 초기화

<br>

* 문제점
    1. 한번 진입했던 카테고리 페이지 유지 불가
    2. 페이지 진입 시 불필요한 로딩
    3. 상품 상세보기 후 돌아올 경우 상품리스트 및 스크롤 유지 불가

<br>

* 프로세스 수정
    1. 페이지 캐시정보를 저장할 context 생성
    2. 상품 출력 리스트가 추가될 경우 캐시 저장
    3. 개별상품 클릭 시 상품 태그 ID를 저장 (뒤로가기 시 스크롤 타겟)

<br>

### 구현 결과
<img src="/img/work/avatar2.gif" width="30%" height="30%"> 	

<br>

#### ./src/context/CacheContext.js
* 페이지 캐시 전용 context 생성
* 최상단 router를 provider영역으로 지정

``` jsx
//------------------------------ MODULE -------------------------------------
import { createContext, useState } from 'react';

//------------------------------ COMPONENT ----------------------------------

const CacheContext = createContext({
    cache: new Object(),
    setCacheHandler: () => {},
});

const CacheContextProvider = ({ children }) => {
    //state
    const [cache, setCache] = useState(new Object());    

    //func
    const setCacheHandler = (c) => setCache(c);

    //render
    return (
        <CacheContext.Provider value = {{ cache, setCacheHandler }}>
            { children }
        </CacheContext.Provider>
    );
}

export { CacheContext, CacheContextProvider };
```

<br>

#### ./src/component/ItemList.js
* 진입 시 state 초기화(추가 출력 페이지 => 1, 마지막 상품 여부 => false 등)
* 카테고리 및 router 변경 시 effect 내 iniData에서 캐시 여부 체크
* 해당 라우터 명이 page key의 value라면 해당 캐시저장 데이터 사용
* 캐시 scrollIndex 값으로 타겟팅하여 스크롤바 이동
* updateCache 함수를 사용하여 필요 타이밍 캐시 초기화

``` jsx
//------------------------------ MODULE -------------------------------------
import styled from "styled-components";
import { apiCall, priceForm } from "lib";
import React, { useState, useRef, useCallback, useEffect, useContext, useMemo } from 'react';
import { CustomLoading } from "component";
import { useNavigate, useLocation } from "react-router-dom";
import { CacheContext } from "context";
import { elementScrollIntoView } from 'seamless-scroll-polyfill';
import { onErrorImg } from "lib";

//------------------------------ CSS ----------------------------------------
...
//------------------------------ COMPONENT ----------------------------------
const ItemList = React.memo(({ category, search, rows=8 }) => {
    //init
    const observer = useRef();
    const navigate = useNavigate();    
    const { pathname }  = useLocation();
    const lastChk = useRef(false);
    const pageLoading = useRef(false);
    const cacheLoading = useRef(false);

    //context
    const { cache, setCacheHandler } = useContext(CacheContext);

    //state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [goods, setGoods] = useState(null);

    //function
    const lastItemElementRef = (node) => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => { 
            //----INTERSECT THE LAST ITEM IN A PAGE----//
            if (entries[0].isIntersecting && !pageLoading.current) {
                pageLoading.current = true;
                setPage((page) => page+1);
            }
        });
        if (node) observer.current.observe(node);
    }

    const initGoods = async() => {
        //----CASE CACHE CHECKED----//
        if(cache.hasOwnProperty(pathname)){
            console.log('check');
            console.log(cache[pathname]);
            cacheLoading.current = true;
            console.log('cache');
            setPage(cache[pathname].page);
            setGoods(cache[pathname].goods);
            lastChk.current = cache[pathname].last;
            //setLoading(false);
            return;
        } 
        
        //----CASE CACHE NOT CHECKED----//
        try {
            setError(null);
            if(pathname != '/Home/Main') setLoading(true);
            setGoods([]);
            const params = {
                page : 1,
                rpp : rows                
            }
            if(category) params.ctg = category; //----IS CATEGORY PAGE----//
            if(search){ //----IS SEARCH PAGE----//
                params.srch = search.srch;
                params.kwd = search.kwd;
            }
            const result = await apiCall.get("/goods", {params});
            setGoods(result.data);
        }catch(e){
            setError(e);
        }
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }
    const addGoods = async() => {
        try {
            const params = {
                page : page,
                rpp : rows                
            }
            if(category) params.ctg = category; //----IS CATEGORY PAGE----//
            if(search){ //----IS SEARCH PAGE----//
                params.srch = search.srch;
                params.kwd = search.kwd;
            }
            const result = await apiCall.get("/goods", {params});
            if(!result.data.length){ //----IS THE LAST INDEX IN ITEM DATAS----//
                lastChk.current = true;
            } 
            setGoods([...goods, ...result.data]);
        }catch(e){
            setError(e);
        }
        pageLoading.current = false;
    }

    const moveDesc = useCallback((index, id) => {
        if(pathname != '/Home/Main'){ //----SAVE SCROLL CACHE----//
            const cacheData = cache;
            cacheData[pathname].scrollIndex = index;
            setCacheHandler(cacheData);
            console.log(`set scroll ${cache[pathname].scrollIndex} to ${pathname}`);
        }
        setTimeout(() => {
            navigate('/Description', { state: { id: id } });
        }, 100);
        
    }, [pathname]);

    const updateCache = useCallback(() => {
        if(pathname != '/Home/Main'){
            const cacheData = cache;
            if(!cacheData.hasOwnProperty(pathname)) cacheData[pathname] = new Object;
            cacheData[pathname] = {goods : goods, page: page, last:lastChk.current, scrollIndex:0};
            setCacheHandler(cacheData);
            console.log('save :');
            console.log(cacheData);
        }
    }, [goods, page, pathname]);

    //effect
    useEffect(() => {
        setPage(1);
        lastChk.current = false;
        pageLoading.current = false;
        console.log(page);
        console.log(lastChk);
        initGoods();   
    }, [category, search]);

    useEffect(() => {
        if(lastChk.current || page==1 || !pageLoading.current || cacheLoading.current) return;
        addGoods();
        console.log('goodsAdd');
    }, [page]);    

    useEffect(() => {
        if(!goods || !goods.length) return;
        if(cacheLoading.current){
            console.log('SCHECK');
            console.log(cache[pathname].scrollIndex);
            //----MOVE TO SCROLL TARGET----//
            if(pathname != '/Home/Main') elementScrollIntoView(document.getElementById(`target${cache[pathname].scrollIndex}`),{behavior: "smooth", block: "center", inline: "center"});
            console.log(`scroll TO target${cache[pathname].scrollIndex}`);
            const cacheData = cache;
            cacheData[pathname].scrollIndex = 0;
            setCacheHandler(cacheData);
            cacheLoading.current = false;            
            console.log(`set scroll ${cache[pathname].scrollIndex}`);
            return; 
        }
        updateCache();
        console.log('goodsChange');
    }, [goods]);        

    //memo
    const goodsGear = useMemo(() => {
        if(!goods) return;
        return(
        <StyledList>      
            {goods.map((item, index)=>(                
                <StyledContent 
                    id={`target${index}`} 
                    key={index} onClick = {() => moveDesc(index, item.goodsId)} 
                    block={index%2 == 0 && index == goods.length-1 ? true : false} 
                >
                    <StyledImg src ={`http://fairdeal.co.kr/${item.simg1}`} onError={onErrorImg}/>                            
                    <StyledName>{item.goodsName}</StyledName>
                    <StyledTag>
                        <StyledPercent>{Math.round(100-item.goodsPrice/item.consumerPrice*100)}%</StyledPercent>
                        <StyledTagPrice>{priceForm(item.consumerPrice)}</StyledTagPrice>
                    </StyledTag>
                    <StyledPrice ref={index==goods.length-1 ? lastItemElementRef : null}>{priceForm(item.goodsPrice)}</StyledPrice>                        
                </StyledContent> 
            ))}      
        </StyledList>
        )
    }, [goods]);

    const nthGear = useMemo(() => {
        return (
            <StyledResult>
            <StyledIsNot>해당 검색 결과가 없습니다.</StyledIsNot>
            <StyledSuggest>
                <StyledSuggestTitle>찾으시는 상품이 없으신가요?</StyledSuggestTitle>
                <StyledSuggestMsg>상품 제안을 통해 원하는 상품을 직접 올웨이즈에 <br />입점시켜 보세요!</StyledSuggestMsg>
                <StyledSuggestBtn>상품 제안하기</StyledSuggestBtn>
            </StyledSuggest>
            </StyledResult>
        )
    }, [])

    const lastGear = useMemo(() => {
        return (
            (lastChk.current) ? 
            <div style={{'fontSize':'0.7em', 'color':'#bbb', 'marginTop':'30px'}}>마지막 상품입니다.</div> : 
            null
        )
    }, [lastChk.current])    
    
    return (
        <>
            {loading ? <CustomLoading /> : null}
            {goods && goods.length > 0 ? goodsGear : null} 
            {goods && goods.length < 1 && !cache.hasOwnProperty(pathname) ? nthGear : null} 
            {lastGear}
        </>
    )

});

export default ItemList;


```

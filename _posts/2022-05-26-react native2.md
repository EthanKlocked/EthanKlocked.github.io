---
layout: post
title: "React Native Test2"
subtitle: "Navigator 페이지 이동"
date: 2022-05-26 15:11:03 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 주요 개념 
* 최상위 App.js 앱 내 페이지 이동 정의
* NavitaionCongainer / stack 형식 테스트
* page가 될 컴포넌트는 screens 폴더에 분리

<br>

### 실습 환경
* nodejs react native 패키지
* android studio 가상 디바이스 사용

<br>

### 구현 결과
<img src="/img/work/rn_page_test.gif" width="50%" height="50%"> 	

<br>

### ./App.js

``` jsx
import { NavigationContainer, StackActions } from "@react-navigation/native"; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Home from './screens/Home';
import Detail from './screens/Detail';
import Login from './screens/Login';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName = "Home">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </NavigationContainer>    
  )
}

export default App;

```

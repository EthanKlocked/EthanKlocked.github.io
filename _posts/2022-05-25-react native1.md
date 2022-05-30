---
layout: post
title: "React Native Test1"
subtitle: "모바일 UI 디자인 테스트"
date: 2022-05-25 19:15:03 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 주요 개념 
* react native 개발환경 구축
* StyleSheet 사용 CSS 구현 
* flex를 사용하여 UI 배치

<br>

### 실습 환경
* nodejs react native 패키지
* android studio 가상 디바이스 사용

<br>

### NPM 개발환경 세팅화면
<img src="/img/work/rn_execute1.png" width="100%" height="100%"> 	
<img src="/img/work/rn_execute2.png" width="100%" height="100%"> 	

<br>
### 구현 결과
<img src="/img/work/rn_login.png" width="100%" height="100%"> 	

<br>

### ./screens/Login.js
* 앱 로그인화면 구현
* StyleSheet객체를 사용하여 같은 페이지 코드 하단 CSS 구성
* 컴포넌트, event 전달 등 react와 동일
* 함수형 / JSX문법

``` jsx
import React, {Component} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import CustomButton from '../components/CustomButton';

const Login = () => {
  return (    
    <View style={styles.container}>
      <View style={styles.header}><Text></Text></View>
      <View style={styles.title}>
        <Image style={styles.logo} source={require('../imgs/jjacksparrowLogo.png')}/>
      </View>
      <View style={styles.subTitle}>
        <Text style={{fontSize:12, fontWeight:'bold', color:'#666'}}>지금 JJACK SPARROW에 가입하면</Text>        
        <Text style={{fontSize:12, fontWeight:'bold', color:'#666'}}>20% 할인 이벤트 쿠폰을 드려요!</Text>        
      </View>
      
      <View style={styles.content}>
        <Text style={{fontWeight:'bold', fontSize:14, color:'#444', margin:17}}>회원가입/로그인</Text>        
        <CustomButton buttonColor={'white'} border={'#aaa'} icon='google' title={'Google 계정으로 계속하기'} test_e={()=>alert('GOOGLE')}/>
        <CustomButton buttonColor={'white'} border={'#aaa'} icon='mobile' title={'휴대폰 번호로 계속하기'} test_e={()=>alert('MOBILE')}/>
        <CustomButton buttonColor={'white'} border={'#aaa'} icon='apple' title={'아이클라우드 계정으로 계속하기'} test_e={()=>alert('IPHONE')}/>
        <View style={styles.extra}>
        <Text style={{fontSize:11, color:'#444'}}>* 휴대폰 번호가 변경되셨나요?</Text>        
        <Text style={{fontSize:11, color:'#444', backgroundColor:'black', color:'white', padding:3, borderRadius:2}}>이메일로 계정찾기</Text>                
        </View>              
      </View>
      <View style={styles.footer}>
        <Text style={{fontSize:14, color:'333', margin:10}}>고객 센터 (문의하기)</Text>        
        <Text style={{fontSize:14, color:'333', margin:10}}>사업자 정보 보기</Text>                
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  header: {
    flex: 0.2,
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    flex: 1.1,
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',    
  },
  logo:{
    width:'80%',
    height:'80%',
  },  
  subTitle: {
    flex: 0.2,
    width:'100%',
    alignItems: 'center',
    backgroundColor:'white',
    padding:'10%',
  },
  content: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  extra:{
    flexDirection:'row',
    width:'80%',
    justifyContent: 'space-between',
  },    
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
    height:'20%',
    backgroundColor: 'white',
  },
});

export default Login;

```

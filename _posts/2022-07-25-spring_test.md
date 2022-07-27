---
layout: post
title: "Spring Boot API 서버 테스트"
subtitle: "개발환경 세팅"
date: 2022-07-25 17:13:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## 1. STS 설치
URL : https://spring.io/tools   
OS환경에 맞춰 다운로드   
작업 폴더에서 실행 시 압축이 풀리고 실행파일(SpringToolSuite4.exe) 사용 가능   

<img style="border: solid grey 2px;" src="/img/posts/springTool.png" width="50%" height="50%"> 	
<br>

## 2. postman 설치
URL : https://www.postman.com/downloads   
다운로드 후 설치

<img style="border: solid grey 2px;" src="/img/posts/postman.png" width="50%" height="50%"> 	
<br>

## 3. SpringBoot 프로젝트 생성
URL : https://start.spring.io       
Project : MavenProject    
Language: Java     
Java 버전 선택     
dependencies: Spring Web
etc...Default 선택           
generate    

<img style="border: solid grey 2px;" src="/img/posts/springboot.png" width="50%" height="50%"> 	
<br>
  
## 4. 프로젝트 시작/세팅
STS exe파일 실행  
generate한 project import(Maven/Existing Maven Projects 선택) 
/pom.xml 선택 후 생성    
빌드 버전 에러 발생 시 해당 JRE 설치 후 프로젝트 build path에 라이브러리를 추가해 주어야 한다.   

<br>

local 서버의 demo 프로젝트 실행   
<img style="border: solid grey 2px;" src="/img/posts/spring_server_play.png" width="50%" height="50%"> 	 

<br>

내용없음 화면이 뜨면 성공   
<img style="border: solid grey 2px;" src="/img/posts/spring_index_test.png" width="50%" height="50%"> 	



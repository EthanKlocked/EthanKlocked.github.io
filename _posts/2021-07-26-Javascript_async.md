---
layout: post
title: "Javascript 비동기"
subtitle: "동기와 비동기 / 블로킹과 논블로킹"
date: 2021-07-26 18:45:13 -0400
background: '/img/posts/05.jpg'
tags: [javascript]
---
동기와 비동기, 그리고 블로킹의 개념은 싱글스레드를 사용하는 자바스크립트 언어에서 병렬 프로그래밍을 익히기 위한 중요한 개념이다.

실제 코드를 작성하고 여러번 디버깅을 하면서 체감되는 부분이 많기 때문에 자바스크립트에 익숙하지 않은 상태에서 익히기에는 다소 난해한 개념이다.     
사실 동기/비동기와 블로킹/논블로킹은 서로 개별적인 개념이기 때문에 두 개념의 연관성을 이해하려고 할수록 오히려 정리가 복잡해 진다.   

동기/비동기는 JavaScript 구동원리에서 싱글스레드 작업인가, 멀티스레드를 사용한 웹API공간 작업인가를 살펴보면 명확히 구분할 수 있다. 
그러나 블로킹/논블로킹의 개념은 어떤 작업을 수행함에 있어 발생하는 Delay개념이기 때문에 조금 더 추상적이고   
코드를 짜는 방식에 따라 블로킹이 발생하기도 제거되기도 한다.

<br>

# 동기 / 비동기

동기와 비동기 개념은 서로 연관된(논리적으로 최소한의) 작업을 수행하는 주체가 두개 이상일 때 드러난다.   

<br>

동기의 경우, 각 주체간 작업의 시작 또는 끝이 다른 한 작업의 시작 또는 끝과 타이밍을 맞추고 있는 경우이다.    
(블럭맞추기그림)   
이러한 경우 각각의 작업은 동시에 혹은 순번에 따라 순차적으로 발생한다.   

<br>

비동기란, 동기와 반대로 주체간 작업이 서로 연관성을 가지고 있지만   
작업별로 시작 또는 끝의 타이밍이 맞닿아 있지 않고 각각 별도의 시작과    
종료타이밍을 가지고 있는 경우이다.
(블럭 겹치기 그림)   
이 경우에는 각각의 작업은 연관되어 있으나 독립적으로 움직이며 서로의    
시작, 종료의 영향을 받지 않는다.

<br>

# 블로킹 / 논블로킹

동기와 비동기의 개념과는 다르게, 블로킹의 여부는 하나의 주체가 수행하는 작업   
내부에서의 상태 개념이다.

블로킹은 한 주체의 작업이 수행되는 도중에 작업에 필요한 다른 주체의 작업결과를 기다리면서 Delay가 발생하는 경우이다.  

(블로킹 그림)

<br>

반면, 논블로킹은 다른 필요한 작업을 요청하면 그 즉시 바로 결과값을 받아 작업을 수행하는 경우이다.

(블로킹 그림)

비동기 논블로킹방식은 주체 각각의 작업이 서로의 작업 순서에 영향이 없으며   
(필요한 순서는 동기화 필요)   
한 작업의 진행 도중 지연(블로킹)이 발생하지 않는다는 점에서 자원이 허락하는 한 가장 효율적인 처리방법이다.

<br>

# 결론
솔직히 JavaScript 내 개념이라기 보다는 프로그래밍언어 내 함수의 특성, 처리방식에 대한 개념이기 때문에   
조금 더 공부하면서 재정립이 필요하다.    
현재로써는 비동기 함수를 적시에 활용해 가며 함수 내부에서 다른 함수를 사용할 시    
최대한 기다림이 없는 방식으로 코드를 짜는 방향으로 연습할 예정이다.
---
layout: post
title: "Spring Boot API 서버 테스트 2"
subtitle: "Controller/Service 구성"
date: 2022-07-26 11:05:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## 1. DTO 영역 생성
데이터 전달환경 및 패키지 구성 테스트     
project src/main/java 디렉토리에 dto 패키지 생성
하위에 Member 클래스 생성   

##### Member.java
``` java
package com.example.demo.dto;

public class Member {
	private Integer id;
	private String name;
	private Integer age;
	private String desc;
	
	public Member() {
		super();
	}
	
	public Integer getId() {
		return id;
	}
	
	public void setId(Integer id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Integer getAge() {
		return age;
	}

	public void setAge(Integer age) {
		this.age = age;
	}
	
	public String getDesc() {
		return desc;
	}
	
	public void setDesc(String desc) {
		this.desc = desc;
	}
	
	@Override
	public String toString() {
		return "Member [id=" + id + ", name=" + name + ", age=" + age + ", desc=" + desc + "]";
	}

}

```

<br>

## 2. Controller 영역 생성
데이터 전달환경 및 패키지 구성 테스트     
project src/main/java 디렉토리에 controller 패키지 생성
하위에 MembersController 클래스 생성   

##### MembersController.java
``` java
package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@RestController //JSON 형식 활성화
public class MembersController {
	
	@Autowired //의존성 주입 (인터페이스)
	private MembersService service;
	
	@GetMapping(path="/test") //라우팅 맵핑
	public Member memberTest() {
		return service.testMember();
	}
}
```

<br>

## 3. Service 영역 생성
데이터를 사용한 로직 수행 영역
interface / implement 영역으로 구성     

### 1) Interface 영역 생성
service(interface 영역) 패키지 생성    
MembersService 인터페이스 생성   

##### MembersService.java
``` java
package com.example.demo.service;

import com.example.demo.dto.Member;

public interface MembersService {
	Member testMember();
}
```

<br>

### 2) Implement 영역 생성
implement 패키지 생성   
MembersServiceImpl 클래스 생성
상기 Interface를 상속받아 Override   

##### MembersServiceImpl.java
``` java
package com.example.demo.service.impl;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@Service
public class MembersServiceImpl implements MembersService{

	@Override
	public Member testMember() {
		Member testMember = new Member();
		testMember.setId(1);
		testMember.setName("Name");
		testMember.setAge(25);
		testMember.setDesc("Service Chk!");
		
		return testMember;
	}
}

```

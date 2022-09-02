---
layout: post
title: "Spring Boot API 서버 테스트 4"
subtitle: "postman / API Parameter"
date: 2022-08-25 11:05:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## 1. 기존 API 테스트
get url 변경 : test -> members   
method 명 변경 : testMembers -> getMembers      
postman 사용    
New http Request 생성     
API 출력결과 확인    

##### url : GET/ http://localhost:8080/members

<img style="border: solid grey 5px;" src="/img/posts/postmanGet.png" width="80%" height="80%"> 	  

<br>

## 2. 파라미터 사용 메소드 추가
id 파라미터를 통해 단일 멤버 호출 API 작성   

##### MemberController.java
``` java
	@Autowired
	private MembersService service;
	
	@GetMapping(path="/members")
	public List<Member> getAllMembers() {
		return service.getAllMembers();
	}
	
	@GetMapping(path="/members/{id}")
	public Member getMember(@PathVariable Integer id) {
		return service.getMember(id);
	}
```

<br>

##### MemberService.java
``` java
package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Member;

public interface MembersService {
	List<Member> getAllMembers();
	Member getMember(Integer id);
}
```

<br>

##### MemberServiceImpl.java
``` java
package com.example.demo.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dao.MembersDAO;
import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@Service
public class MembersServiceImpl implements MembersService{
	@Autowired
	private MembersDAO dao;
	
	@Override
	public List<Member> getAllMembers(){
		return dao.getAllMembers();
	}
	
	@Override
	public Member getMember(Integer id) {
		return dao.getMember(id);
	}
}
```

<br>

##### MembersDAO.java
``` java
package com.example.demo.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.dto.Member;

@Repository
public interface MembersDAO {
	List<Member> getAllMembers();
	Member getMember(Integer id);
}
```

<br>

##### mapper.xml
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.dao.MembersDAO">
	<select id="getAllMembers" resultType="com.example.demo.dto.Member">
		SELECT * FROM members
	</select>
	<select id="getMember" parameterType="int" resultType="com.example.demo.dto.Member">
		SELECT * FROM members WHERE id= #{id}
	</select>
</mapper>
```

<br>

## 3. 추가 메소드 출력 확인

##### url : GET/ http://localhost:8080/members/1

<img style="border: solid grey 2px;" src="/img/posts/postmanGetList.png" width="80%" height="80%"> 	



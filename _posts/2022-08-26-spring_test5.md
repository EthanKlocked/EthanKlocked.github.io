---
layout: post
title: "Spring Boot API 서버 테스트 5"
subtitle: "POST / @RequestBody"
date: 2022-08-26 15:01:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## POST API 코드 추가
컨트롤러 insert메소드 추가 
dto member 객체를 insert      
@RequestBody 어노테이션을 통해 파라미터 체크    
서비스, dao 인터페이스에 메소드 등록    
mapper.xml 쿼리문 등록           


##### MembersController.java
``` java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@RestController
public class MembersController {
	
	@Autowired
	private MembersService service;
	
  ...
	
	@PostMapping(path="/members")
	public Member insertMember(@RequestBody Member member) {
		service.insertMember(member);
		return member;
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
	void insertMember(Member member);
}

```

<br>

##### MembersDto/Member.java
``` java
package com.example.demo.dto;

public class Member {
	private Integer id;
	private String name;
	private Integer age;
	private String dept;
	
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
	
	public String getDept() {
		return dept;
	}
	
	public void setDept(String dept) {
		this.dept = dept;
	}
	
	@Override
	public String toString() {
		return "Member [id=" + id + ", name=" + name + ", age=" + age + ", dept=" + dept + "]";
	}

}

```

<br>

##### MembersService.java
``` java
package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Member;

public interface MembersService {
	List<Member> getAllMembers();
	Member getMember(Integer id);
	void insertMember(Member member);
}

```

<br>

##### MembersServiceImpl.java
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
	
	@Override
	public void insertMember(Member member) {
		dao.insertMember(member);
	}
}

```

<br>

##### mapper.xml
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.dao.MembersDAO">
	...
	<insert id="insertMember" parameterType="com.example.demo.dto.Member" useGeneratedKeys="true" keyProperty="id">
		INSERT INTO members (name, age, dept) VALUES (#{name}, #{age}, #{dept})
	</insert>
</mapper>
```

<br>

## API 테스트
##### url : GET/ http://localhost:8080/members
##### parameters : { "name": "Irene", "age": 29, "dept": "Designer" }
##### type : JSON
##### return : 추가된 member 객체

<img style="border:solid grey 2px" src="/img/posts/postmanPost.png" width="100%" height="100%"> 	  

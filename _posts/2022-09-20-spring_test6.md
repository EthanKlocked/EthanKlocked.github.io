---
layout: post
title: "Spring Boot API 서버 테스트 6"
subtitle: "PUT / @Path, @RequestBody"
date: 2022-09-20 13:05:22 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## PUT API 코드 추가
컨트롤러 update메소드 추가 
update 대상 id = > @Path
update data = > @RequestBody (JSON)
@Path, @RequestBody 어노테이션을 통해 파라미터 체크    
서비스, dao 인터페이스에 메소드 등록    
mapper.xml update 쿼리 등록           


##### MembersController.java
``` java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@RestController
public class MembersController {
	
	@Autowired
	private MembersService service;
	
  ...
	
	@PutMapping(path="/members/{id}")
	public Member updateMember(@PathVariable Integer id, @RequestBody Member member) {
		return service.updateMember(id, member);
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
  Integer updateMember(@Param("id") Integer id, @Param("member") Member member);
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
  Member updateMember(Integer id, Member member);
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
	
  ...
  
  @Override
	public Member updateMember(Integer id, Member member) {
		
		Member updateMember = new Member();
		
		if(dao.updateMember(id, member) == 1) { //update 반환값은 update 성공 row 수
			updateMember.setId(id);
			updateMember.setName(member.getName());
			updateMember.setAge(member.getAge());
			updateMember.setDept(member.getDept());
		}
		
		return updateMember;
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
	<!--  update 성공 시 성공한 레코드 수를 반환 -->
	<update id="updateMember">
		UPDATE members SET name = #{member.name}, age = #{member.age}, dept = #{member.dept} WHERE id = #{id}
	</update>
</mapper>
```

<br>

## API 테스트
##### url : GET/ http://localhost:8080/members/1
##### parameters : { "name": "Irene", "age": 29, "dept": "Designer" }
##### type : JSON
##### return : 쿼리 반환 카운트 1 일 경우(성공) update된 member 객체

<img style="border:solid grey 2px" src="/img/posts/postmanPost.png" width="100%" height="100%"> 	  

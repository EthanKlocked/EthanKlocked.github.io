---
layout: post
title: "Spring Boot API 서버 테스트 7"
subtitle: "DELETE / CRUD 완성"
date: 2022-09-21 15:13:22 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## PUT API 코드 추가
컨트롤러 delete 메소드 추가 
delete 대상 id = > @Path
@Path 어노테이션을 통해 파라미터 체크    
서비스, dao 인터페이스에 메소드 등록    
mapper.xml delete 쿼리 등록           


##### MembersController.java
``` java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
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
	
	@DeleteMapping(path="/members/{id}")
	public Integer deleteMember(@PathVariable Integer id) {
		return service.deleteMember(id);
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
  Integer deleteMember(Integer id);
}

```

<br>

##### MembersDTO/Member.java
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
  Integer deleteMember(Integer id);
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
	public Integer deleteMember(Integer id) {
		return dao.deleteMember(id);
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
  
	<!--  삭제한 행의 수를 반환 -->
	<delete id="deleteMember" parameterType="int">
		DELETE FROM members WHERE id = #{id}
	</delete>
</mapper>
```

<br>

## API 테스트
##### url : DELETE/ http://localhost:8080/members/5
##### parameters : 5 (URL Params)
##### type : INT
##### return : 쿼리 반환 카운트 1 일 경우 성공 / 0일 경우 실패

<br>

##### 삭제 전 데이터
<img style="border:solid grey 2px" src="/img/posts/postmanDelete1.png" width="50%" height="50%"> 	  

<br>

##### 삭제 시 화면
<img style="border:solid grey 2px" src="/img/posts/postmanDelete2.png" width="100%" height="100%"> 	  

<br>

##### 성공 후 다시 조회
<img style="border:solid grey 2px" src="/img/posts/postmanDelete3.png" width="50%" height="50%"> 	  

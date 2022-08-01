---
layout: post
title: "Spring Boot API 서버 테스트 3"
subtitle: "DB 연결 / DAO 맵핑"
date: 2022-07-28 11:05:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## 1. 사전준비
mariadb 설치   
db생성 및 user 권한 설정 세팅   
테스트용 테이블 , 데이터 세팅

##### Member.java
``` bash
MariaDB [mysql]> select user from user;
+-------------+
| User        |
+-------------+
| root        |
| root        |
| root        |
| mariadb.sys |
| root        |
| testUser    |
+-------------+
6 rows in set (0.001 sec)

MariaDB [mysql]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| testdb             |
+--------------------+
5 rows in set (0.001 sec)
```

<br>

## 2. pom.xml dependency 세팅
데이터 전달환경 및 패키지 구성 테스트         
https://mvnrepository.com/ 해당 URL을 통하여 dependancy 코드 추가   

##### pom.xml
``` xml
		<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-jdbc -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-jdbc</artifactId>
		</dependency>
		<!-- https://mvnrepository.com/artifact/org.mariadb.jdbc/mariadb-java-client -->
		<dependency>
			<groupId>org.mariadb.jdbc</groupId>
			<artifactId>mariadb-java-client</artifactId>
		</dependency>
		<!-- https://mvnrepository.com/artifact/org.mybatis/mybatis -->
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis</artifactId>
			<version>3.5.5</version>
		</dependency>
		<!-- https://mvnrepository.com/artifact/org.mybatis/mybatis-spring -->
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis-spring</artifactId>
			<version>2.0.5</version>
		</dependency>	
```

<br>

## 3. DB세팅 및 MyBatis config 매핑

### 1) DB INFO 참조 파일
pom.xml을 통해 세팅된 driver를 사용하여 db정보 세팅 파일 생성      

##### application.properties
``` java
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.url=jdbc:mariadb://127.0.0.1:3306/testdb
spring.datasource.username=testUser
spring.datasource.password=sherlocked
```

<br>

### 2) MyBatis map 생성
application.properties에 작성된 DB 정보를 사용하여 DB 연결객체를 생성한다.

##### MyBatisConfig.java
``` java
package com.example.demo;
import javax.sql.DataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import
org.springframework.core.io.support.PathMatchingResourcePatternResolver;

@Configuration
@MapperScan(basePackages = "com.example.demo.dao")
public class MyBatisConfig {
	@Bean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		
		sessionFactory.setDataSource(dataSource);
		sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml"));
		
		return sessionFactory.getObject();
	}
}
```

<br>

## 4. dao 영역 생성

### 1) dao interface 생성 
return List 컬렉션으로 프로퍼티 세팅

##### MembersDAO.java
``` java
package com.example.demo.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.dto.Member;

@Repository
public interface MembersDAO {
	List<Member> testMember();
}
```

<br>

### 2) mapper.xml 생성
MembersDAO interface 맵핑작업   
dto bean 객체 return 세팅   

##### src/main/resources/mapper/mapper.xml
``` java
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.dao.MembersDAO">
	<select id="testMember" resultType="com.example.demo.dto.Member">
		SELECT * FROM members
	</select>
</mapper>
```

<br>

## 5. controller, service영역 return 값 수정


### 1) controller 수정

##### MembersController.java
  
``` java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Member;
import com.example.demo.service.MembersService;

@RestController
public class MembersController {
	
	@Autowired
	private MembersService service;
	
	@GetMapping(path="/test")
	public List<Member> memberTest() { // <-- return List<Members>
		return service.testMember();
	}
}

```

<br>

### 2) service 수정

##### MembersService.java
  
``` java
package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Member;

public interface MembersService {
	List<Member> testMember(); // <-- return List<Member> 
}

```

##### MembersServiceImpl.java
dao 객체를 return하도록 수정   
List 자료형 내 Member bean이 담겨 return   
  
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
	public List<Member> testMember(){
		return dao.testMember();
	}
}
```

<br>

##### web client result page

<img style="border: solid grey 2px;" src="/img/posts/spring_db_result.png" width="100%" height="100%"> 	

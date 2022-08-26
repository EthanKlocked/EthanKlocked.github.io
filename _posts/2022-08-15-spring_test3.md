---
layout: post
title: "Spring Boot API DB연동 에러"
subtitle: "mariadb jdbc/ port 중복"
date: 2022-08-15 08:13:11 -0400
background: '/img/posts/java.jpeg'
tags: [java, server]
---
## 1. 테스트 서버 PC 재부팅 후 에러 발생

<br>

##### 에러코드

``` bash
Caused by: java.sql.SQLInvalidAuthorizationSpecException: (conn=...) Access denied for user 'test'@'test' (using password: YES)
```

<br>

##### Check Point 1

###### pom.xml
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.7.2</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>demo</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>18</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
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
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>

```

* 해당 부분 mariadb-java-client 버전 문제인 경우일 가능성
* 전에 같은 버전으로 잘 동작하였으므로 PASS

<br>

##### Check Point 2

###### application.properties
``` java
  spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
  spring.datasource.url=jdbc:mariadb://127.0.0.1:3306/test
  spring.datasource.username=test
  spring.datasource.password=****
```

* 오타 체크
* 아이디, 비밀번호 맞는지 체크

<br>

##### Check Point 3

###### db 접근권한 및 포트 체크

* 해당 ID (현재 local에서 테스트)에 localhost host 설정 체크
* test 데이터베이스 접근권한 체크
* 3306 포트 체크

##### 해결
* 3306 포트에 mysql이 실행되고 있어 문제 발생, 해당 프로세스 종류 후 재접속

---
layout: post
title: "Python 엑셀병합 프로그램 4"
subtitle: "exe 컴파일 및 동작테스트"
date: 2022-12-18 08:11:05 -0400
background: '/img/posts/python_bg.png'
tags: [python]
---

### 환경구성
* anaconda(Python 3.9), Spyder 에디터 사용
* pandas 사용 (엔진 : xlswriter)
* anaconda designer프로그램 사용 UI 사전작성

<br>

### 가이드파일 작성 및 컴파일
1. 빌드옵션 (onefile, hidden import,  등)을 포함한 가이드파일(.spec) 작성
2. pyinstaller 가이드파일.spec

<br>

#### spec 파일 작성

##### ./excelMerge.spec

``` python
# -*- mode: python ; coding: utf-8 -*-


block_cipher = None


a = Analysis(
    ['excelMerge.py'],
    pathex=[],
    binaries=[],
    datas=[('./myWindow.ui','./')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='excelMerge',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='C:\\Users\\user\\spyderZero\\272697_excel_icon.ico'
)
```
#### exe 컴파일 및 최종 테스트

##### 아나콘다 prompt창 내 pyinstaller excelMerge.spec 명령 실행

<img src="/img/posts/excelMergeTest.gif" width="90%" height="90%"> 	

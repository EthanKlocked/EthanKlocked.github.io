---
layout: post
title: "Python 엑셀병합 프로그램 3"
subtitle: "GUI생성 / PyQt5"
date: 2022-12-16 11:11:05 -0400
background: '/img/posts/python_bg.png'
tags: [python]
---

### 환경구성
* anaconda(Python 3.9), Spyder 에디터 사용
* pandas 사용 (엔진 : xlswriter)
* anaconda designer프로그램 사용 UI 사전작성

<br>

### UI 작성
1. input 디렉토리 및 ouput 디렉토리 동적으로 지정
2. 프로그램 GUI화를 통해 마우스 클릭으로 엑셀 병합 작업 진행

<br>

#### 사전 UI 파일 작성

<img src="/img/posts/anaconda_designer_ui1.png" width="90%" height="90%"> 	

<br>

#### window객체 생성 및 UI 메소드 로직

``` python
###################################### UI ####################################
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

formSrc = resource_path("./myWindow.ui")
form_class = uic.loadUiType(formSrc)[0]

# function
def controllBox():
    app = QApplication(sys.argv)
    window = MyWindow()
    window.show()
    app.exec_()

#################################### class ####################################
class MyWindow(QMainWindow, form_class):
    def __init__(self):
        super().__init__()
        self.setupUi(self)
        print(self)
        self.init_UI()

    def init_UI(self):
        self.center()
        self.setWindowIcon(QIcon(r"C:\Users\user\spyderZero\fixIcon.png"))
        self.findButton.clicked.connect(lambda: self.srchButton_clicked(self.srcText))
        self.setButton.clicked.connect(lambda: self.srchButton_clicked(self.resultText))
        self.execButton.clicked.connect(self.exec)
        self.cancelButton.clicked.connect(lambda: self.close())

    def srchButton_clicked(self, obj) :
    	folder = QFileDialog.getExistingDirectory(self, "Select Directory")
    	if(folder != ''): obj.setText(os.path.normpath(folder))
    	else: QMessageBox.about(self, "Error", "Not selected!")

    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())
        
    def exec(self):
        self.execButton.setDisabled(True)
        try:
            self.progressBar.setValue(0)
            srcDir = self.srcText.toPlainText()
            resultDir = self.resultText.toPlainText()
            if(not srcDir or not resultDir): return QMessageBox.about(self, "Error", "Not selected!")
            changeResult = excelMerge(srcDir, resultDir, self.progressBar, self.checkBox.isChecked())
            if(changeResult == 'success'): QMessageBox.about(self, "Success", "Merge complete")
            else: 
                QMessageBox.about(self, "Error", "Merge failed!")
                self.progressBar.setValue(0)
        except:
            self.progressBar.setValue(0)
            QMessageBox.about(self, "Error", "Merge failed!")
        self.execButton.setEnabled(True)
        
###################################### exec ####################################
controllBox()
```

const {XlsxFile} = require('../index');
const {dateFormat} = require('./util');
const path = require('path');

const params = function() {
    return {     
    DOC_TYPE:{
        value: this.$FILE_FILENAME,// 变量赋值会触发 observers
        observers: function(){
            this.isRunObservers = false; // 关闭下一次监听
            this.value = this.value.split('_')[0];
        }
    },
    FILENAME:{
        value: this.$FILE_FILENAME,// 变量赋值会触发 observers
        only: true,// 只触发一次
        observers: function(){
            this.value = path.basename(this.value,'.png');
            this.value = path.basename(this.value,'.jpg');
        }
    },
    DOCNO:{
        value: this.$xlsx.TSK_NO
    },
    ADDWHO:{
        value:this.$xlsx.DRIVER_ID
    },
    ADDTIME:{
        type:'date',
        value:this.$xlsx.DELIVERY_TIME
    },
    EDITWHO:{
        value: this.$xlsx.DRIVER_ID
    },
    EDITTIME:{
        type: {name:'date',format:'yyyy/MM/dd hh:mm:ss'},
        value: this.$xlsx.DELIVERY_TIME
    },
    UPLOAD_FLAG:"Y",
    UPLOAD_METHOD:"AWS S3",
    UPLOAD_PATH:{
        value:`tc-tms/tms-wechat/${this.$FILE_FILEPATH}`,
        only: true,// 只触发一次
        observers: function(){
            this.value = path.join(this.value);
            if(path.sep === '\\'){
                this.value = this.value.replace(/\\/g,'/');
            }
            this.value = this.value.replace('D:/Myself_test/sql-generate/wechatFile/',"");
        }
    },
    SEQ:"1"
};};
const sqlBuild = new XlsxFile({
    rootPath:"./testImage/2020/09",
    xlsxPath:"./test.xlsx",
    sqlPath:"./sql_2020_09.sql",
    sql:function(){
        return {
            table:'IMA_IMAGE_FILE',
            type: this.__INSERT__,
            database: this.__ORACLE__,
        };
    },
    params,
    pathRules:function(){
        const dir = this.$dir;// 遍历目录时的文件对象 
        const allpath = dir.root+dir.path;
        const {DELIVERY_TIME} = this.$xlsx;// 遍历时 xlsx 的单行信息
        const date = path.join(dateFormat(new Date(DELIVERY_TIME),'yyyy/MM/dd'));
        if(allpath.indexOf(date) != -1){
            return true;
        }
        return false;
    },
    fileRules:function(){
        const {DEST_CUSTOMERNO,DELIVERY_TIME} = this.$xlsx;// 遍历时 xlsx 的单行信息
        const date = path.join(dateFormat(new Date(DELIVERY_TIME),'yyyy/MM/dd'));
        const fileNames = this.$FILE_FILENAME.split('_');
        const filePath = this.$FILE_FILEPATH;
        if(DEST_CUSTOMERNO == fileNames[2] && filePath.indexOf(date) != -1){
            return true;
        }
        return false;
    }
});
sqlBuild.build();



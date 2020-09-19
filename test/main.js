const {XlsxFile} = require('../index');
const {dateFormat} = require('./util');
const path = require('path');

const params = function() {
    return {     
    DOC_TYPE:{
        value: this.$FILE_FILENAME,
        observers: function(){
            this.isRunObservers = false;// 修改自身值不触发监听
            this.value = this.value.split('_')[0];
        }
    },
    FILENAME:{
        value: this.$FILE_FILENAME,
        observers: function(){
            this.isRunObservers = false;// 修改自身值不触发监听
            this.value = path.basename(this.value,'.png');
            this.isRunObservers = false;// 修改自身值不触发监听
            this.value = path.basename(this.value,'.jpg');
        }
    },
    DOCNO:{
        value: this.$xlsx['TSK_NO']
    },
    ADDWHO:{
        value:this.$xlsx['DRIVER_ID']
    },
    ADDTIME:{
        type:'date',
        value:this.$xlsx['DELIVERY_TIME']
    },
    EDITWHO:{
        value: this.$xlsx['DRIVER_ID']
    },
    EDITTIME:{
        type: {name:'date',format:'yyyy/MM/dd hh:mm:ss'},
        value: this.$xlsx['DELIVERY_TIME']
    },
    UPLOAD_FLAG:"Y",
    UPLOAD_METHOD:"AWS S3",
    UPLOAD_PATH:{
        value:`tc-tms/tms-wechat/${this.$FILE_FILEPATH}`,
        observers: function(){
            this.value = path.join(this.value);
            if(path.sep === '\\'){
                this.isRunObservers = false;// 修改自身值不触发监听
                this.value = this.value.replace(/\\/g,'/');
            }
            this.isRunObservers = false;    // 修改自身值不触发监听
            this.value = this.value.replace('D:/Myself_test/sql-generate/wechatFile/',"");
        }
    },
    SEQ:"1"
}};
const sqlBuild = new XlsxFile({
    rootPath:"D:/Myself_test/sql-generate/wechatFile/2020/09",
    xlsxPath:"D:/Myself_test/sql-generate/缺图片路径的数据.xlsx",
    sqlPath:"D:/Myself_test/sql-generate/sql_2020_09.sql",
    sql:function(){
        return {
            table:'IMA_IMAGE_FILE',
            type: this.__INSERT__,
            database: this.__ORACLE__,
        }
    },
    params,
    fileRules:function(){
        const {DEST_CUSTOMERNO,DELIVERY_TIME} = this.$xlsx;
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



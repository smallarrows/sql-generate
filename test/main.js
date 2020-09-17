const {XlsxFile} = require('../index');
const {dateFormat} = require('./util');

const params = ()=> {return {     
    DOC_TYPE:{
        value: this.$FILE_FILENAME,
        observers: function(){
            this.value = this.value.split('_')[0];
        }
    },
    FILENAME:{
        value:this.$FILE_FILENAME,
        observers: function(){
            this.value = this.value.split('_')[0];
        }
    },
    DOCNO:{
        value: this.$xlsx['TSK_NO']
    },
    ADDWHO:{
        value:this.$xlsx['DRIVER_ID']
    },
    ADDTIME:{
        value:this.$xlsx['DELIVERY_TIME']
    },
    EDITWHO:{
        value: this.$xlsx['DRIVER_ID']
    },
    EDITTIME:{
        value: this.$xlsx['DELIVERY_TIME']
    },
    UPLOAD_FLAG:"Y",
    UPLOAD_METHOD:"AWS S3",
    UPLOAD_PATH:{
        value:`tc-tms/tms-wechat/${this.$FILE_FILEPATH}`,
        observers: function(){
            this.value = this.value.replace(path.sep,"/");
        }
    },
}};
const sqlBuild = new XlsxFile({
    rootPath:"D:/迅雷下载/test",
    xlsxPath:"D:/迅雷下载/缺图片路径的数据.xlsx",
    sqlPath:"D:/迅雷下载",
    tableName:'IMA_IMAGE_FILE',
    sqlType:XlsxFile.INSERT,
    params,
    rules:function(){
        const {DEST_CUSTOMERNO,DELIVERY_TIME} = this.$xlsx;
        const date = dateFormat(new Date(DELIVERY_TIME),'MM/dd');
        const fileNames = this.$FILE_FILENAME.split('_');
        const filePath = this.$FILE_FILEPATH;
        if(DEST_CUSTOMERNO == fileNames[2] && filePath.indexOf(date) != -1){
            return true;
        }
        return false;
    }
});
sqlBuild.build();
console.log(XlsxFile.INSERT)



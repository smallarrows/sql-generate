const fs = require('fs')
const path = require('path')
const {XlsxFile} = require('./index')
// let a = 'tc-tms/tms-wechat/$PATH'
// let b = '\\2020\\09\\01\\photo\\photo_1_1125C_372b24b1.jpg'
// a = a.replace("$PATH",b)
// console.log(path.join(a,''))
// console.log(path.sep)


const params = {      
    DOC_TYPE:{
        value:XlsxFile.$FILE_FILENAME,
        key:'0',
        split:'_'
    },
    FILENAME:{
        value:XlsxFile.$FILE_FILENAME,
        key:'2',
    },
    DOCNO:{
        key: XlsxFile.$XLSX['TSK_NO']
    },
    ADDWHO:{
        from:'xlsx',
        key:XlsxFile.$XLSX['DRIVER_ID']
    },
    ADDTIME:{
        from:'xlsx',
        key:XlsxFile.$XLSX['DELIVERY_TIME']
    },
    EDITWHO:{
        from:'xlsx',
        key: XlsxFile.$XLSX['DRIVER_ID']
    },
    EDITTIME:{
        from:'xlsx',
        key: XlsxFile.$XLSX['DELIVERY_TIME']
    },
    UPLOAD_FLAG:"Y",
    UPLOAD_METHOD:"AWS S3",
    UPLOAD_PATH:{
        from:'file',
        key: '',
        value:`tc-tms/tms-wechat/${XlsxFile.$FILE_FILEPATH}`,
        format: function(){
            this.value = this.value.replace(path.sep,"/");
        }
    },
};

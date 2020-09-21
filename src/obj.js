const FileObj = function (options) {
    const obj = {
        name: "",   // 目录或文件名称
        sub: [],    // 子目录或文件
        root: "",   // 根路径
        path: "",   // 文件路径，结合根路径为全路径
        isDir: false,
        match: false,
        last:{}     // 前一个目录
    };
    return Object.preventExtensions(obj);
};
const SqlObj = function(sqlOptions,paramOptions){
    const sql = sqlOptions;
    const param = paramOptions;
    if(typeof sql !== 'object'){
        throw TypeError(`sqlOptions type isn't object`);
    }
    if(typeof param !== 'object'){
        throw TypeError(`paramOptions type isn't object`);
    }
    this.sql = sql;
    this.param = param;
    this.type = sql.type.toUpperCase();
    switch(this.type){
        case 'SELECT':// @feature 暂未实现
            selectMethod(this);
            break;
        case 'INSERT':
            insertMethod(this);
            break;
        case 'UPDATE':// @feature 暂未实现
            updateMethod(this);
            break;
        case 'DELETE':// @feature 暂未实现
            deleteMethod(this);
            break;
        default:
            throw new TypeError(`sqlOptions type isn't String`);
    }
};
function selectMethod(instance){
    instance.select = instance.sql.select;    // []|{}
    instance.from = instance.sql.from;        // []
    instance.where = instance.sql.where;      // []|{}
    instance.groupBy = instance.sql.groupBy;  // []
    instance.orderBy = instance.sql.orderBy;  // []
    instance.toSqlString = function(){
        
    };
}
function insertMethod(instance){
    instance.fields = instance.sql.fields||[];    // []
    instance.table = instance.sql.table||"";      // ""
    // sql条件和values互斥
    if(instance.sql.sql){
        instance.sql = instance.sql.sql;      // SqlObj @feature 暂未实现
    }else{
        instance.values = instance.sql.values||[];// []
    }
    instance.toSqlString = function(){
        if(!Array.isArray(instance.fields)){
            throw TypeError(`fields type is error!`);
        }
        if(!(typeof instance.table === "string" && instance.table)){
            throw TypeError(`table type is error!`);
        }
        if(!Array.isArray(instance.values)){
            throw TypeError(`values type is error!`);
        }
        let s = "INSERT INTO ";
        s += instance.table + " (" + instance.fields.join(',') + ") VALUES (";
        if(instance.values){
            for (let i = 0; i < instance.values.length; i++) {
                const value = instance.values[i];
                if(typeof value === 'object'){
                    if(value.addApostrophe === false){
                        s += value.value;
                    }else{
                        s += "'" + value.value + "'";
                    }
                }else{
                    s += "'" + value + "'";
                }
                if(i !== (instance.values.length-1)){
                    s+=",";
                }
            }
        }
        s += ")";
        return s;
    };
    instance.setFields = function(param){
        Object.keys(param).forEach(key=>{
            instance.fields.push(key);
        });
    };
    instance.setValues = function(param){
        Object.keys(param).forEach(key=>{
            const p = param[key];
            instance.values.push(p);
        });
    };
    const init = function(){
        instance.setFields(instance.param);
        instance.setValues(instance.param);
    };
    init();
}
function updateMethod(){
    instance.fields = instance.sql.fields;    // []
    instance.values = instance.sql.values;    // []
    instance.toSqlString = function(){

    };
}
function deleteMethod(){
    instance.table = instance.sql.table;      // ""
    instance.fields = instance.sql.fields;    // []
    instance.where = instance.sql.where;      // []
    instance.toSqlString = function(){

    };
}
module.exports = {
    FileObj,
    SqlObj
};
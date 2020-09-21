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
const SqlObj = function(sqlOptions){
    const obj = {};
    const sql = sqlOptions;
    let {type} = sql;
    if(typeof type !== 'string'){
        throw new TypeError(`sql type isn't String`);
    }
    type = type.toUpperCase();
    obj.type = type;
    switch(type){
        case 'SELECT':// @feature 暂未实现
            obj.select = sql.select;    // ""|[]|{}
            obj.from = sql.from;        // ""|[]
            obj.where = sql.where;      // ""|[]|{}
            obj.groupBy = sql.groupBy;  // ""|[]
            obj.orderBy = sql.orderBy;  // ""|[]
            obj.toSqlString = function(){
        
            };
            break;
        case 'INSERT':
            obj.fields = sql.fields||[];    // []
            obj.table = sql.table||"";      // ""
            // sql条件和values互斥
            if(sql.sql){
                obj.sql = sql.sql;      // SqlObj @feature 暂未实现
            }else{
                obj.values = sql.values||[];// []
            }
            obj.toSqlString = function(){
                if(!Array.isArray(obj.fields)){
                    throw TypeError(`fields type is error!`);
                }
                if(!(typeof obj.table === "string" && obj.table)){
                    throw TypeError(`table type is error!`);
                }
                if(!Array.isArray(obj.values)){
                    throw TypeError(`values type is error!`);
                }
                let s = "INSERT INTO ";
                s += obj.table + " (" + obj.fields.join(',') + ") VALUES (";
                if(obj.values){
                    for (let i = 0; i < obj.values.length; i++) {
                        const value = obj.values[i];
                        if(typeof value === 'object'){
                            if(value.addApostrophe === false){
                                s += value.value;
                            }else{
                                s += "'" + value.value + "'";
                            }
                        }else{
                            s += "'" + value + "'";
                        }
                        if(i !== (obj.values.length-1)){
                            s+=",";
                        }
                    }
                }
                s += ")";
                return s;
            };
            obj.setFields = function(param){
                Object.keys(param).forEach(key=>{
                    obj.fields.push(key);
                });
            };
            obj.setValues = function(param){
                Object.keys(param).forEach(key=>{
                    const p = param[key];
                    obj.values.push(p);
                });
            };
            break;
        case 'UPDATE':// @feature 暂未实现
            obj.fields = sql.fields;    // []
            obj.values = sql.values;    // []
            obj.toSqlString = function(){
        
            };
            break;
        case 'DELETE':// @feature 暂未实现
            obj.table = sql.table;        // ""
            obj.fields = sql.fields;    // []
            obj.where = sql.where;      // []
            obj.toSqlString = function(){
        
            };
            break;
    }
    return Object.preventExtensions(obj);
};
module.exports = {
    FileObj,
    SqlObj
};
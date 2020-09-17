const fs = require('fs');
const path = require('path');
const {Base} = require('./base');
const {initParams} = require('./util');

/**
 * 根据文件生成SQL
 * @param {
    *  rootPath:String, // 文件根目录
    *  sqlPath:String,  // 生成的脚本路径
    *  xlsxPath:String, // 需要补充的单号数据
    *  tableName:String,// 插入语句的表名
    *  params:{
    *      from:String, // filename|xlsx|path
    *      key:String,
    *      value:String,
    *      pathSep:'string', // 在from为path生效，路径使用该符号分割
    * 
    *  },       // 参数
    * autoReadDirs:boolean
    * } options 
    */
function File(options){
    //1. 处理路径
    const {rootPath,sqlPath} = options;
    options.rootPath = path.join(rootPath,"");
    options.sqlPath = path.join(sqlPath,"");

    //2. 继承基类
    Base.call(this,options);

    //3. 设置校验类型
    this.paramsType = {
        rootPath:'string',
        sqlPath:'string',
        tableName:'string',
        params:'function',
        autoReadDirs:'boolean'
    }
    this.checkOptions();

    //4. 初始化实例参数
    this.params = {
        file:['$FILE_FILENAME','$FILE_FILEPATH'],
    }
    initParams(this,this.params)

    //5. 获取目录和文件
    const autoReadDirs = options.autoReadDirs == null?true:options.autoReadDirs;
    if(autoReadDirs){
        this.getDirs(options.rootPath);
    }
}
File.prototype = Base.prototype;

/**
 * 覆写设置参数方法
 * @param {*} options 
 */
File.prototype.setOptions = function(options={}){
    const _options = this.options;
    if(this.checkOptions(options)){
        this.options = options;
        if(_options.rootPath !== options.rootPath && options.autoReadDirs){
            this.getDirs(options.rootPath);
        }
    }
}
/**
 * 获取目录和文件数据
 * @dirs 
 * [{
 *      name，
 *      sub:[{name,sub:[]},{name}]
 *  },...]
 * @files [{name,path}]
 */
File.prototype.getDirs = function(root) {
    let dirs = [];
    let files = [];
    function collectDir(dirPath,dirsBuf,filesBuf) {
        try {
            const dirs = fs.readdirSync(dirPath);
            dirs.forEach((dir,index)=>{
                const subPath = path.join(dirPath,dir);
                const obj = {
                    name:dir,
                    sub:[],
                    root:root,
                    path:subPath.replace(root,""),
                    isDir:true
                }
                if(fs.statSync(subPath).isDirectory()){
                    dirsBuf[index] = obj;
                    collectDir(subPath,dirsBuf[index]['sub'],filesBuf);
                }else{
                    obj.isDir = false;
                    delete obj.sub;
                    dirsBuf[index] = obj;
                    filesBuf.push(obj);
                }
            })
        } catch (error) {
            return;
        }
    }
    collectDir(root,dirs,files);
    this.dirs = dirs;
    this.files = files;
    return {dirs,files}
}

File.prototype.build = function (){ // 暂时作为预留
    console.warn('Not yet implemented');
}

module.exports = {
    File
}
const a = {value:1,observers:function(){
    this.value = this.value + 1;
}};
const p = new Proxy(a,{
    set: function (target, propKey, value, receiver) {
        console.log(target);
        target.observers.call(p);
        return Reflect.set(target, propKey, value, receiver);
    }
});

p.value = 1;
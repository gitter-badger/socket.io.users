String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.replaceAll = function (replaceThis, withThis) {
    var re = new RegExp(replaceThis,"g"); 
    return this.replace(re, withThis);
};
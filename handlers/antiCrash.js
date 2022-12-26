module.exports = (client) => {
    process.on('unhandledRejection', err => {
        return console.log(err);
    
        // if(config.setting.devMode){
        //   return console.log(err);
        // }else{
        //   return
        // }
    });
    process.on('warning', (warning) => {
        return console.log(warning.stack);
    
        // if(config.setting.devMode){
        //   return console.log(warning.stack);
        // }else{
        //   return
        // }
    });
}
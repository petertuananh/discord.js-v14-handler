const fs = require('fs');
const ascii = require('ascii-table');
let table = new ascii("Commands");
table.setHeading('Name', ' Status');
module.exports = (yourauth) => {
    fs.readdirSync('./commands/prefix').forEach(dir => {
        const commands = fs.readdirSync(`./commands/prefix/${dir}/`).filter(file => file.endsWith('.js'));
        for(let file of commands){
            let pull = require(`../commands/prefix/${dir}/${file}`);
            if(pull.name){
                yourauth.commands.set(pull.name, pull);
                table.addRow(file,'✔️  > Loaded')
            } else {
                table.addRow(file, '❌  > Error')
                continue;
            }if(pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => yourauth.aliases.set(alias, pull.name))
        }
    });
    
    if (yourauth.config.setting.devMode) {
        console.log(table.toString());
    } else {

    }
}